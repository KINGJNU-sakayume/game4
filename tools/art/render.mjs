// 탱고 레테 — 아트 렌더러 (헤드리스 Chromium)
// 사용법:
//   node tools/art/render.mjs scene quay --variant '{"night":true}' [--raw] [--out file.webp] [--w 1920 --h 1080]
//   node tools/art/render.mjs portrait yun
//   node tools/art/render.mjs all [--only quay]     # tools/art/manifest.json 에 적힌 모든 그림 → assets/
// playwright 가 필요하다. 결과물(assets/)은 저장소에 커밋되므로 게임 빌드에는 필요 없다.
// 글꼴: ART_FONTS 환경 변수에 @fontsource 패키지들이 있는 폴더를 주면 간판 글자에 쓴다 (없으면 시스템 글꼴).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : def; };
const flag = name => args.includes('--' + name);

const LIBS = ['tools/art/lib.js', 'tools/art/scenes.js', 'tools/art/scenes2.js', 'tools/art/scenes3.js', 'tools/art/portraits.js', 'tools/art/icons.js']
  .filter(f => fs.existsSync(path.join(ROOT, f)))
  .concat((process.env.ART_EXTRA || '').split(',').filter(Boolean));
const FONTS = [
  ['Limelight', 'limelight', 'limelight-latin-400-normal.woff2'],
  ['Black Han Sans', 'black-han-sans', null],
  ['Bodoni Moda', 'bodoni-moda', 'bodoni-moda-latin-700-normal.woff2'],
  ['Poiret One', 'poiret-one', 'poiret-one-latin-400-normal.woff2'],
  ['Song Myung', 'song-myung', null],
];
const META = path.join(ROOT, 'assets/art.json');

async function loadFonts(page) {
  const dir = process.env.ART_FONTS;
  if (!dir) return;
  for (const [family, pkg, file] of FONTS) {
    const fdir = path.join(dir, pkg, 'files');
    if (!fs.existsSync(fdir)) continue;
    const files = file ? [file] : fs.readdirSync(fdir).filter(f => f.endsWith('-400-normal.woff2'));
    for (const f of files) {
      const p = path.join(fdir, f);
      if (!fs.existsSync(p)) continue;
      const b64 = fs.readFileSync(p).toString('base64');
      await page.evaluate(async ([family, b64]) => {
        const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
        const ff = new FontFace(family, bin.buffer);
        await ff.load(); document.fonts.add(ff);
      }, [family, b64]);
    }
  }
}

async function main() {
  const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => fs.existsSync(p));
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  const page = await browser.newPage();
  page.on('pageerror', e => console.error('pageerror:', e.message));
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.error('console:', m.text()); });
  await page.setContent('<!doctype html><html><body></body></html>');
  for (const f of LIBS) await page.addScriptTag({ content: fs.readFileSync(path.resolve(ROOT, f), 'utf8') });
  await loadFonts(page);

  const jobs = [];
  if (args[0] === 'all' || args[0] === 'list') {
    const man = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/art/manifest.json'), 'utf8'));
    const only = opt('only', null);
    for (const j of man.jobs) if (!only || j.out.includes(only)) jobs.push(Object.assign({ q: man.q || 0.82 }, man.defaults && man.defaults[j.kind], j));
    if (args[0] === 'list') { for (const j of jobs) console.log(j.kind, j.id, j.out); await browser.close(); return; }
  } else {
    const kind = args[0], id = args[1];
    jobs.push({
      kind, id,
      variant: JSON.parse(opt('variant', '{}')),
      w: +opt('w', kind === 'portrait' ? 512 : kind === 'icon' ? 256 : 1920),
      h: +opt('h', kind === 'portrait' ? 640 : kind === 'icon' ? 256 : 1080),
      raw: flag('raw'),
      out: opt('out', path.join('tools/art/out', kind + '_' + id + (flag('raw') ? '_raw' : '') + '.png')),
      q: +opt('q', 0.82),
    });
  }
  const meta = fs.existsSync(META) ? JSON.parse(fs.readFileSync(META, 'utf8')) : { scenes: {}, portraits: {} };
  for (const j of jobs) {
    const t0 = Date.now();
    const fmt = j.out.endsWith('.webp') ? 'image/webp' : j.out.endsWith('.jpg') ? 'image/jpeg' : 'image/png';
    const res = await page.evaluate(async (j) => {
      const A = window.ART;
      let c, info = {};
      if (j.kind === 'scene') {
        const fn = A.scenes[j.id];
        if (!fn) throw new Error('장면 없음: ' + j.id);
        const o = Object.assign({ seed: 7 }, fn.paint || {}, j.paint || {}, { raw: j.raw });
        c = A.render((ctx, W, H, r) => fn(ctx, W, H, r, j.variant || {}), j.w, j.h, o);
        info = { lights: c.lights, focus: fn.focus === undefined ? 0.4 : fn.focus };
      } else if (j.kind === 'portrait') {
        const fn = A.portraits[j.id];
        if (!fn) throw new Error('초상 없음: ' + j.id);
        c = fn(j.w, j.h, j.variant || {});
      } else if (j.kind === 'icon') {
        const fn = A.icons[j.id];
        if (!fn) throw new Error('아이콘 없음: ' + j.id);
        c = fn(j.w, j.h, j.variant || {});
      }
      return { data: c.toDataURL(j.fmt, j.q), info };
    }, Object.assign({}, j, { fmt }));
    const buf = Buffer.from(res.data.split(',')[1], 'base64');
    const outPath = path.join(ROOT, j.out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, buf);
    if (j.key && j.kind === 'scene') meta.scenes[j.key] = Object.assign({ src: j.out.replace(/^assets\//, '') }, res.info);
    if (j.key && j.kind === 'portrait') meta.portraits[j.key] = { src: j.out.replace(/^assets\//, '') };
    console.log(`${j.kind} ${j.id} → ${j.out} (${(buf.length / 1024).toFixed(0)} KB, ${((Date.now() - t0) / 1000).toFixed(1)}s)`);
  }
  if (args[0] === 'all') {
    fs.mkdirSync(path.dirname(META), { recursive: true });
    fs.writeFileSync(META, JSON.stringify(meta, null, 1) + '\n');
  }
  await browser.close();
}
main().catch(e => { console.error(e); process.exit(1); });
