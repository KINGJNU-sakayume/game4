// 탱고 레테 — 빌드
//  1) content/*.tl → src/js/content.bundle.js
//  2) dist/tango-lethe.html  : 모든 것을 인라인한 단일 HTML (파일 하나로 실행)
//  3) dist/artifact.html     : 같은 내용, 문서 골격(doctype/html/head/body) 없는 버전
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, ENGINE_FILES, UI_FILES, CONTENT_BUNDLE, contentFiles, read } from './lib.mjs';

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

function inlineScripts(files) {
  return files.map(f => {
    const code = read(f).replace(/<\/script/gi, '<\\/script');
    return '<script>\n/* ' + f + ' */\n' + code + '\n</script>';
  }).join('\n');
}

function between(src, a, b) {
  const i = src.indexOf(a), j = src.indexOf(b);
  if (i < 0 || j < 0) throw new Error('빌드 표식을 찾을 수 없음: ' + a);
  return src.slice(i + a.length, j);
}

function buildDist() {
  const index = read('index.html');
  const css = read('src/css/style.css');
  const scripts = inlineScripts(ENGINE_FILES.concat([CONTENT_BUNDLE], UI_FILES));
  const head = between(index, '<!-- BUILD:HEAD -->', '<!-- /BUILD:HEAD -->').trim();
  const body = between(index, '<!-- BUILD:BODY -->', '<!-- /BUILD:BODY -->').trim();
  const title = (index.match(/<title>([^<]*)<\/title>/) || [0, '탱고 레테'])[1];
  const desc = (index.match(/<meta name="description" content="([^"]*)">/) || [0, ''])[1];

  const full = [
    '<!doctype html>',
    '<html lang="ko">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
    '<title>' + title + '</title>',
    '<meta name="description" content="' + desc + '">',
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
  fs.mkdirSync(path.join(ROOT, 'dist'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'dist/tango-lethe.html'), full);

  const fragment = [
    '<title>' + title + '</title>',
    head,
    '<style>\n' + css + '\n</style>',
    body,
    scripts,
    '',
  ].join('\n');
  fs.writeFileSync(path.join(ROOT, 'dist/artifact.html'), fragment);
  return { size: Buffer.byteLength(full) };
}

const b = buildBundle();
const d = buildDist();
console.log(`콘텐츠 파일 ${b.files}개, ${b.chars.toLocaleString()}자 → ${CONTENT_BUNDLE}`);
console.log(`dist/tango-lethe.html (${(d.size / 1024).toFixed(0)} KB), dist/artifact.html 생성`);
