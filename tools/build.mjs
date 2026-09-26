// 탱고 레테 — 빌드
//  1) content/*.tl → src/js/content.bundle.js
//  2) assets/art.json → src/js/art.meta.js (장면 그림·초상 목록과 광원 위치)
//  3) dist/site/        : 웹 배포본 (index.html + assets/) — GitHub Pages
//  4) dist/tango-lethe.html : 그림까지 모두 인라인한 단일 HTML (파일 하나로 실행)
//  5) dist/artifact.html    : 문서 골격 없는 조각 (assets/ 를 상대 경로로 참조)
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, ENGINE_FILES, UI_FILES, CONTENT_BUNDLE, ART_META, contentFiles, read } from './lib.mjs';

function buildBundle() {
  const files = contentFiles();
  let out = '/* 자동 생성 파일 — content/*.tl 에서 tools/build.mjs 가 만들었다. 직접 고치지 말 것. */\n';
  out += '(function (TL) {\n  \'use strict\';\n  TL.contentErrors = TL.contentErrors || [];\n';
  out += '  function load(file, src) { try { TL.script(src, file); } catch (e) { TL.contentErrors.push(e.message); } }\n';
  let chars = 0;
  for (const f of files) {
    const src = read(f);
    chars += src.length;
    out += '  load(' + JSON.stringify(path.basename(f)) + ', ' + JSON.stringify(src) + ');\n';
  }
  out += '})(window.TL);\n';
  fs.writeFileSync(path.join(ROOT, CONTENT_BUNDLE), out);
  return { files: files.length, chars };
}

/* 그림 목록 (inline: 그림 파일을 data URI 로 넣는다) */
function artMeta(inline) {
  const file = path.join(ROOT, 'assets/art.json');
  const meta = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : { scenes: {}, portraits: {} };
  const out = { base: 'assets/', scenes: {}, portraits: {} };
  let bytes = 0;
  for (const group of ['scenes', 'portraits']) {
    for (const [k, v] of Object.entries(meta[group] || {})) {
      const e = Object.assign({}, v);
      const abs = path.join(ROOT, 'assets', v.src);
      if (!fs.existsSync(abs)) continue;
      if (inline) {
        const buf = fs.readFileSync(abs);
        bytes += buf.length;
        e.src = 'data:image/webp;base64,' + buf.toString('base64');
      }
      out[group][k] = e;
    }
  }
  return { js: '/* 자동 생성 파일 — assets/art.json 에서 tools/build.mjs 가 만들었다. */\n(function (TL) { TL.data.artMeta = ' + JSON.stringify(out) + '; })(window.TL);\n', bytes, count: Object.keys(out.scenes).length + Object.keys(out.portraits).length };
}

function inlineScripts(files, override = {}) {
  return files.map(f => {
    const code = (override[f] !== undefined ? override[f] : read(f)).replace(/<\/script/gi, '<\\/script');
    return '<script>\n/* ' + f + ' */\n' + code + '\n</script>';
  }).join('\n');
}

function between(src, a, b) {
  const i = src.indexOf(a), j = src.indexOf(b);
  if (i < 0 || j < 0) throw new Error('빌드 표식을 찾을 수 없음: ' + a);
  return src.slice(i + a.length, j);
}

function copyDir(from, to, filter) {
  fs.mkdirSync(to, { recursive: true });
  for (const f of fs.readdirSync(from)) {
    const a = path.join(from, f), b = path.join(to, f);
    if (fs.statSync(a).isDirectory()) copyDir(a, b, filter);
    else if (!filter || filter(f)) fs.copyFileSync(a, b);
  }
}

function buildDist() {
  const index = read('index.html');
  const css = read('src/css/style.css');
  const head = between(index, '<!-- BUILD:HEAD -->', '<!-- /BUILD:HEAD -->').trim();
  const body = between(index, '<!-- BUILD:BODY -->', '<!-- /BUILD:BODY -->').trim();
  const title = (index.match(/<title>([^<]*)<\/title>/) || [0, '탱고 레테'])[1];
  const desc = (index.match(/<meta name="description" content="([^"]*)">/) || [0, ''])[1];
  // 웹 배포(GitHub Pages)용 메타 태그와 파비콘 — 아티팩트 조각에는 넣지 않는다
  const meta = between(index, '<!-- BUILD:META -->', '<!-- /BUILD:META -->').trim();
  const files = ENGINE_FILES.concat([CONTENT_BUNDLE], UI_FILES);

  const linked = artMeta(false);
  fs.writeFileSync(path.join(ROOT, ART_META), linked.js);
  const inlined = artMeta(true);

  const full = (scripts) => [
    '<!doctype html>',
    '<html lang="ko">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
    '<title>' + title + '</title>',
    '<meta name="description" content="' + desc + '">',
    meta,
    head,
    '<style>\n' + css + '\n</style>',
    '</head>',
    '<body>',
    body,
    scripts,
    '</body>',
    '</html>',
    '',
  ].join('\n');

  // 웹 배포본: 그림은 assets/ 파일로
  const site = path.join(ROOT, 'dist/site');
  fs.rmSync(site, { recursive: true, force: true });
  fs.mkdirSync(site, { recursive: true });
  const siteHtml = full(inlineScripts(files));
  fs.writeFileSync(path.join(site, 'index.html'), siteHtml);
  copyDir(path.join(ROOT, 'assets'), path.join(site, 'assets'), f => f.endsWith('.webp'));

  // 단일 파일: 그림까지 인라인
  const single = full(inlineScripts(files, { [ART_META]: inlined.js }));
  fs.writeFileSync(path.join(ROOT, 'dist/tango-lethe.html'), single);

  // 아티팩트 조각
  const fragment = [
    '<title>' + title + '</title>',
    head,
    '<style>\n' + css + '\n</style>',
    body,
    inlineScripts(files),
    '',
  ].join('\n');
  fs.writeFileSync(path.join(ROOT, 'dist/artifact.html'), fragment);
  return { site: Buffer.byteLength(siteHtml), single: Buffer.byteLength(single), art: inlined.count, artBytes: inlined.bytes };
}

const b = buildBundle();
const d = buildDist();
console.log(`콘텐츠 파일 ${b.files}개, ${b.chars.toLocaleString()}자 → ${CONTENT_BUNDLE}`);
console.log(`그림 ${d.art}장 (${(d.artBytes / 1024 / 1024).toFixed(2)} MB) → ${ART_META}`);
console.log(`dist/site/index.html (${(d.site / 1024).toFixed(0)} KB) + dist/site/assets/`);
console.log(`dist/tango-lethe.html (${(d.single / 1024 / 1024).toFixed(2)} MB, 그림 포함 단일 파일), dist/artifact.html 생성`);
