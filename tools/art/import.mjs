// 탱고 레테 — 바깥에서 그린 그림 넣기 (ChatGPT 같은 이미지 생성기로 만든 그림)
// 그림 파일 하나를 게임 규격으로 잘라(비율이 다르면 가운데 기준으로 채워 자르기) 줄이고 WebP로 assets/ 에 저장한다.
// assets/art.json 의 광원 위치(lights)와 초점(focus)은 그대로 둔다 — 구도가 예전 그림과 같으면
// 게임이 얹는 깜빡이는 빛(네온·등대·불꽃)이 새 그림의 광원 위에 그대로 얹힌다. preview 로 확인할 수 있다.
//
// 사용법:
//   node tools/art/import.mjs scene quay_n ~/Downloads/quay_night.png [--x 0.5] [--y 0.5] [--zoom 1]
//   node tools/art/import.mjs portrait yun ~/Downloads/yun.png [--y 0.45]
//   node tools/art/import.mjs preview quay_n [그림 파일]
//     → tools/art/out/preview_quay_n.png : 깜빡이는 광원 자리, 넓은 화면에서 글 칸이 덮는 곳, 휴대폰에서 보이는 범위를 그림 위에 표시
//       (그림 파일을 주면 그 파일을 자른 결과 위에, 없으면 지금 assets/ 의 그림 위에)
// --x --y: 자를 때 남길 가운데(0~1, 기본 0.5). --zoom: 1보다 크면 더 확대해서 자른다.
// 장면은 1920×1080, 초상은 512×640. 넣은 뒤 npm run build.
// 주의: npm run art 는 모든 그림을 tools/art 의 코드로 다시 그려 덮어쓴다. 바깥 그림을 넣은 뒤에는 쓰지 말 것(--only 로 필요한 것만).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf('--' + name); return i >= 0 ? +args[i + 1] : def; };
const pos = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));
const [mode, key, file] = pos;
const META = path.join(ROOT, 'assets/art.json');
const meta = JSON.parse(fs.readFileSync(META, 'utf8'));
const SIZE = { scene: [1920, 1080], portrait: [512, 640] };
/* 게임이 깜빡이게 하는 광원 종류 (src/js/art.js 의 AMP) */
const ANIMATED = ['neon', 'blink', 'beacon', 'beacon3', 'fire', 'ember', 'candle', 'lamp', 'chandelier', 'bulb', 'door', 'water', 'eyes'];

function usage(msg) {
  if (msg) console.error(msg);
  console.error('사용법: node tools/art/import.mjs scene|portrait <열쇠> <그림 파일> [--x 0.5 --y 0.5 --zoom 1]\n       node tools/art/import.mjs preview <장면 열쇠> [그림 파일]');
  console.error('장면 열쇠: ' + Object.keys(meta.scenes).join(' '));
  console.error('초상 열쇠: ' + Object.keys(meta.portraits).join(' '));
  process.exit(1);
}
if (!['scene', 'portrait', 'preview'].includes(mode) || !key) usage();
const kind = mode === 'portrait' ? 'portrait' : 'scene';
const entry = (kind === 'scene' ? meta.scenes : meta.portraits)[key];
if (!entry) usage('모르는 ' + (kind === 'scene' ? '장면' : '초상') + ' 열쇠: ' + key);
if (mode !== 'preview' && !file) usage('그림 파일을 주세요.');
const srcFile = file ? path.resolve(file) : path.join(ROOT, 'assets', entry.src);
if (!fs.existsSync(srcFile)) usage('파일이 없습니다: ' + srcFile);
const mime = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' }[path.extname(srcFile).toLowerCase()];
if (!mime) usage('PNG, JPEG, WebP 파일만 읽을 수 있습니다.');

const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => fs.existsSync(p));
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const page = await browser.newPage();
await page.setContent('<!doctype html><html><body></body></html>');

const [W, H] = SIZE[kind];
const dataUrl = 'data:' + mime + ';base64,' + fs.readFileSync(srcFile).toString('base64');
// 1) 잘라서 줄이기 (object-fit: cover 와 같은 방식, 가운데는 --x --y, --zoom 만큼 더 확대)
const res = await page.evaluate(async ([src, W, H, cx, cy, zoom]) => {
  const img = new Image(); img.src = src; await img.decode();
  const iw = img.naturalWidth, ih = img.naturalHeight;
  const s = Math.max(W / iw, H / ih) * zoom, sw = W / s, sh = H / s;
  const sx = Math.min(iw - sw, Math.max(0, cx * iw - sw / 2)), sy = Math.min(ih - sh, Math.max(0, cy * ih - sh / 2));
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d'); x.imageSmoothingQuality = 'high';
  x.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
  return { webp: c.toDataURL('image/webp', 0.82), png: c.toDataURL('image/png'), iw, ih, crop: [Math.round(sx), Math.round(sy), Math.round(sw), Math.round(sh)] };
}, [dataUrl, W, H, opt('x', 0.5), opt('y', 0.5), Math.max(1, opt('zoom', 1))]);

if (mode !== 'preview') {
  const out = path.join(ROOT, 'assets', entry.src);
  const buf = Buffer.from(res.webp.split(',')[1], 'base64');
  fs.writeFileSync(out, buf);
  console.log(`${path.basename(srcFile)} (${res.iw}×${res.ih}) → 자른 영역 ${res.crop.join(',')} → ${path.relative(ROOT, out)} (${W}×${H}, ${(buf.length / 1024).toFixed(0)} KB)`);
  if (kind === 'scene') console.log(`광원 ${(entry.lights || []).filter(l => ANIMATED.includes(l.kind)).length}개와 초점 ${entry.focus} 는 그대로. 확인: node tools/art/import.mjs preview ${key}`);
  console.log('게임에 반영: npm run build');
} else {
  // 2) 미리보기: 광원 자리, 넓은 화면의 글 칸, 휴대폰 화면 범위
  const png = await page.evaluate(async ([src, e, key, ANIMATED]) => {
    const img = new Image(); img.src = src; await img.decode();
    const W = 1600, H = 900, c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d');
    x.drawImage(img, 0, 0, W, H);
    // 넓은 화면(1600px): 오른쪽 36%는 글 칸이 덮는다
    const col = W * 0.36;
    x.fillStyle = 'rgba(0,0,0,0.55)'; x.fillRect(W - col, 0, col, H);
    x.fillStyle = '#fff'; x.font = 'bold 22px sans-serif'; x.fillText('넓은 화면: 글 칸', W - col + 20, 40);
    // 휴대폰(390×844): 장면은 화면 위 42%, 가로로 초점 둘레만 보인다. 타이틀은 화면 전체(더 좁은 세로 띠)
    const band = (vw, vh, color, label) => {
      const sw = vh * 16 / 9, off = (sw - vw) * (e.focus === undefined ? 0.4 : e.focus);
      const a = off / sw, b = (off + vw) / sw;
      x.strokeStyle = color; x.lineWidth = 4; x.setLineDash([14, 8]); x.strokeRect(a * W, 3, (b - a) * W, H - 6); x.setLineDash([]);
      x.fillStyle = color; x.fillText(label, a * W + 10, 34);
    };
    if (key === 'title') band(390, 844, '#7fe0ff', '휴대폰 타이틀 화면'); else band(390, 354, '#7fe0ff', '휴대폰 화면');
    // 게임이 깜빡이게 하는 광원: 이 원 안에 새 그림의 광원(네온·등·불·등대…)이 있어야 한다
    const labeled = [];
    for (const l of e.lights || []) {
      if (!ANIMATED.includes(l.kind)) continue;
      const px = l.x * W, py = l.y * H, r = Math.max(6, l.r * W * 1.6);
      x.strokeStyle = '#ffe14a'; x.lineWidth = 2; x.beginPath(); x.arc(px, py, r, 0, Math.PI * 2); x.stroke();
      x.fillStyle = '#ffe14a'; x.beginPath(); x.arc(px, py, 3, 0, Math.PI * 2); x.fill();
      // 같은 종류가 모여 있으면 이름은 한 번만
      if (labeled.some(q => q.kind === l.kind && Math.hypot(q.x - px, q.y - py) < 90)) continue;
      labeled.push({ kind: l.kind, x: px, y: py });
      x.font = '14px sans-serif'; x.fillText(l.kind, px + r + 3, py + 4);
    }
    return c.toDataURL('image/png');
  }, [file ? res.png : dataUrl, entry, key, ANIMATED]);
  const out = path.join(ROOT, 'tools/art/out', 'preview_' + key + '.png');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, Buffer.from(png.split(',')[1], 'base64'));
  console.log('미리보기 → ' + path.relative(ROOT, out) + '  (노란 원: 게임이 빛을 얹는 자리, 어두운 오른쪽: 글 칸, 파란 점선: 휴대폰에서 보이는 범위)');
}
await browser.close();
