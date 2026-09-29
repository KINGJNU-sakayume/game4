// 탱고 레테 — 바깥에서 그린 그림 넣기 (ChatGPT 같은 이미지 생성기로 만든 그림)
// 그림 파일 하나를 게임 규격으로 잘라(비율이 다르면 가운데 기준으로 채워 자르기) 줄이고 WebP로 assets/ 에 저장한다.
// 게임은 assets/art.json 의 광원 위치(lights)에 깜빡이는 빛(네온·등대·불꽃)을 얹는다. 생성기는 구도 기준 그림을 줘도
// 광원을 몇 %씩 옮겨 그리므로, 넣은 뒤 snap 으로 광원을 새 그림의 실제 불빛에 맞추고 preview 로 확인한다.
//
// 사용법:
//   node tools/art/import.mjs scene quay_n ~/Downloads/quay_night.png [--x 0.5] [--y 0.5] [--zoom 1]
//   node tools/art/import.mjs portrait yun ~/Downloads/yun.png [--y 0.45]
//   node tools/art/import.mjs snap quay_n [그림 파일] [--write]
//     → 광원마다 예전 자리 둘레에서 같은 색의 가장 밝은 불빛을 찾아 새 자리를 알려 준다. --write 면 art.json 에 적는다.
//       (그림 파일을 주면 그 파일을 자른 결과에서, 없으면 지금 assets/ 의 그림에서 찾는다)
//   node tools/art/import.mjs preview quay_n [그림 파일]
//     → tools/art/out/preview_quay_n.png : 깜빡이는 광원 자리, 넓은 화면에서 글 칸(타이틀은 제목·메뉴)이 덮는 곳, 휴대폰에서 보이는 범위를 그림 위에 표시
//       (그림 파일을 주면 그 파일을 자른 결과 위에 그리고 파일 이름을 붙인다: title + ~/Downloads/A1.png → preview_title_A1.png,
//        이름이 열쇠로 시작하면 그대로: title_A1.png → preview_title_A1.png. 파일이 없으면 지금 assets/ 의 그림 위에)
//   node tools/art/import.mjs guide quay_n|scenes|portraits|all [--dir tools/art/out/guides]
//     → 지금 그림을 생성기의 크기(장면 3:2 1536×1024, 초상 2:3 1024×1536)로 늘린 구도 기준 그림(JPEG).
//       가운데는 지금 그림 그대로, 위아래 띠만 이어 칠한다. 생성 결과를 게임 규격으로 자르면 구도가 제자리에 온다.
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

// 값을 받는 선택지(--x 0.5)와 켜고 끄는 선택지(--write)
const VALUE_OPTS = ['x', 'y', 'zoom', 'dir'];
const opts = {}, pos = [];
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (!a.startsWith('--')) { pos.push(a); continue; }
  const name = a.slice(2);
  opts[name] = VALUE_OPTS.includes(name) ? process.argv[++i] : true;
}
const num = (name, def) => (opts[name] === undefined ? def : +opts[name]);
const [mode, key, file] = pos;
const META = path.join(ROOT, 'assets/art.json');
const meta = JSON.parse(fs.readFileSync(META, 'utf8'));
const SIZE = { scene: [1920, 1080], portrait: [512, 640] };
/* 게임이 깜빡이게 하는 광원 종류 (src/js/art.js 의 AMP) */
const ANIMATED = ['neon', 'blink', 'beacon', 'beacon3', 'fire', 'ember', 'candle', 'lamp', 'chandelier', 'bulb', 'door', 'water', 'eyes'];
const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };

function usage(msg) {
  if (msg) console.error(msg);
  console.error('사용법: node tools/art/import.mjs scene|portrait <열쇠> <그림 파일> [--x 0.5 --y 0.5 --zoom 1]\n' +
    '       node tools/art/import.mjs snap <장면 열쇠> [그림 파일] [--write]\n' +
    '       node tools/art/import.mjs preview <장면 열쇠> [그림 파일]\n' +
    '       node tools/art/import.mjs guide <열쇠>|scenes|portraits|all [--dir 폴더]');
  console.error('장면 열쇠: ' + Object.keys(meta.scenes).join(' '));
  console.error('초상 열쇠: ' + Object.keys(meta.portraits).join(' '));
  process.exit(1);
}
function readImage(p) {
  if (!fs.existsSync(p)) usage('파일이 없습니다: ' + p);
  const mime = MIME[path.extname(p).toLowerCase()];
  if (!mime) usage('PNG, JPEG, WebP 파일만 읽을 수 있습니다: ' + p);
  return 'data:' + mime + ';base64,' + fs.readFileSync(p).toString('base64');
}
if (!['scene', 'portrait', 'preview', 'snap', 'guide'].includes(mode) || !key) usage();

const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => fs.existsSync(p));
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const page = await browser.newPage();
await page.setContent('<!doctype html><html><body></body></html>');

if (mode === 'guide') await guide();
else await single();
await browser.close();

/* ───────── 구도 기준 그림: 지금 그림 → 생성기 크기 ───────── */
async function guide() {
  const jobs = [];
  const wantScenes = key === 'scenes' || key === 'all', wantPortraits = key === 'portraits' || key === 'all';
  if (wantScenes || wantPortraits) {
    if (wantScenes) for (const k of Object.keys(meta.scenes)) jobs.push(['scene', k]);
    if (wantPortraits) for (const k of Object.keys(meta.portraits)) jobs.push(['portrait', k]);
  } else if (meta.scenes[key]) jobs.push(['scene', key]);
  else if (meta.portraits[key]) jobs.push(['portrait', key]);
  else usage('모르는 열쇠: ' + key);
  const dir = path.resolve(ROOT, opts.dir || 'tools/art/out/guides');
  fs.mkdirSync(dir, { recursive: true });
  let total = 0;
  for (const [kind, k] of jobs) {
    const e = (kind === 'scene' ? meta.scenes : meta.portraits)[k];
    const jpg = await page.evaluate(async ([src, kind]) => {
      const img = new Image(); img.src = src; await img.decode();
      const W = kind === 'scene' ? 1536 : 1024, H = kind === 'scene' ? 1024 : 1536;
      const ih = Math.round(W * img.naturalHeight / img.naturalWidth), top = Math.round((H - ih) / 2);
      const c = document.createElement('canvas'); c.width = W; c.height = H;
      const x = c.getContext('2d', { willReadFrequently: true }); x.imageSmoothingQuality = 'high';
      x.drawImage(img, 0, top, W, ih);
      // 가장자리 몇 줄의 중앙값(별 같은 점은 빠진다)을 가로로 흐려 띠 전체에 늘린다
      const band = (y0, rows, fromY, toY, fade) => {
        const d = x.getImageData(0, y0, W, rows).data, row = new Float32Array(W * 3), sm = new Float32Array(W * 3), R = 10;
        for (let i = 0; i < W; i++) for (let ch = 0; ch < 3; ch++) {
          const v = []; for (let r = 0; r < rows; r++) v.push(d[(r * W + i) * 4 + ch]);
          v.sort((a, b) => a - b); row[i * 3 + ch] = v[rows >> 1];
        }
        for (let i = 0; i < W; i++) for (let ch = 0; ch < 3; ch++) {
          let s = 0, n = 0; for (let k = -R; k <= R; k++) { const j = i + k; if (j >= 0 && j < W) { s += row[j * 3 + ch]; n++; } }
          sm[i * 3 + ch] = s / n;
        }
        const o = x.createImageData(W, toY - fromY);
        for (let y = 0; y < toY - fromY; y++) {
          const t = fade(y / (toY - fromY));
          for (let i = 0; i < W; i++) { for (let ch = 0; ch < 3; ch++) o.data[(y * W + i) * 4 + ch] = sm[i * 3 + ch] * t; o.data[(y * W + i) * 4 + 3] = 255; }
        }
        x.putImageData(o, 0, fromY);
      };
      band(top, 14, 0, top, (u) => 0.85 + 0.15 * u);
      band(top + ih - 14, 14, top + ih, H, (u) => 1 - 0.2 * u);
      return c.toDataURL('image/jpeg', 0.88);
    }, [readImage(path.join(ROOT, 'assets', e.src)), kind]);
    const buf = Buffer.from(jpg.split(',')[1], 'base64');
    const out = path.join(dir, k + '.jpg');
    fs.writeFileSync(out, buf);
    total += buf.length;
    if (jobs.length === 1) console.log(`구도 기준 → ${path.relative(ROOT, out)} (${kind === 'scene' ? '3:2 1536×1024' : '2:3 1024×1536'}, ${(buf.length / 1024).toFixed(0)} KB)`);
  }
  if (jobs.length > 1) console.log(`구도 기준 ${jobs.length}장 → ${path.relative(ROOT, dir)}/ (${(total / 1024 / 1024).toFixed(1)} MB)`);
}

/* ───────── 그림 한 장: 넣기 · 광원 맞추기 · 미리보기 ───────── */
async function single() {
  const kind = mode === 'portrait' ? 'portrait' : 'scene';
  let entry = (kind === 'scene' ? meta.scenes : meta.portraits)[key], created = false;
  // 새 변형(quay_db, roof_nb 처럼 l=썰물, b=시신): 같은 장소·같은 때의 기본 그림에서 광원과 초점을 물려받아 만든다
  const vm = !entry && mode === 'scene' && key.match(/^([a-z0-9]+)_([dn])l?b?$/);
  if (vm && meta.scenes[vm[1] + '_' + vm[2]]) {
    const base = meta.scenes[vm[1] + '_' + vm[2]];
    entry = meta.scenes[key] = { src: 'scenes/' + key + '.webp', lights: JSON.parse(JSON.stringify(base.lights || [])), focus: base.focus };
    created = true;
  }
  if (!entry) usage('모르는 ' + (kind === 'scene' ? '장면' : '초상') + ' 열쇠: ' + key);
  if ((mode === 'scene' || mode === 'portrait') && !file) usage('그림 파일을 주세요.');
  const srcFile = file ? path.resolve(file) : path.join(ROOT, 'assets', entry.src);
  const dataUrl = readImage(srcFile);
  const [W, H] = SIZE[kind];
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
  }, [dataUrl, W, H, num('x', 0.5), num('y', 0.5), Math.max(1, num('zoom', 1))]);
  const cropped = file ? res.png : dataUrl;

  if (mode === 'scene' || mode === 'portrait') {
    const out = path.join(ROOT, 'assets', entry.src);
    const buf = Buffer.from(res.webp.split(',')[1], 'base64');
    fs.writeFileSync(out, buf);
    console.log(`${path.basename(srcFile)} (${res.iw}×${res.ih}) → 자른 영역 ${res.crop.join(',')} → ${path.relative(ROOT, out)} (${W}×${H}, ${(buf.length / 1024).toFixed(0)} KB)`);
    if (created) {
      fs.writeFileSync(META, JSON.stringify(meta, null, 1) + '\n');
      console.log(`새 장면 열쇠 «${key}»를 art.json 에 더했다 (광원·초점은 ${vm[1]}_${vm[2]} 에서).`);
    }
    if (kind === 'scene' && (entry.lights || []).some(l => ANIMATED.includes(l.kind))) console.log(`광원 맞추기: node tools/art/import.mjs snap ${key} --write  → 확인: node tools/art/import.mjs preview ${key}`);
    console.log('게임에 반영: npm run build');
  } else if (mode === 'snap') await snap(entry, cropped);
  else await preview(entry, cropped);
}

/* 광원 맞추기: 광원마다 예전 자리 둘레에서 그 광원 색의 가장 밝은 덩어리를 찾는다.
 * 1) 둘레에 다른 광원이 없는 작은 광원(기준점)으로 그림 전체가 밀린 정도를 어림하고
 * 2) 모든 광원을 그만큼 옮긴 자리에서, 이웃 광원과 헷갈리지 않을 만큼만 좁게 다시 찾는다.
 * 틀 밖·가장자리에서 번져 들어오는 빛과 확신이 없는 광원은 찾지 않고, 기준점이 둘 이상 맞으면 전체 밀림만큼 옮긴다. */
async function snap(entry, src) {
  const lights = entry.lights || [];
  const result = await page.evaluate(async ([src, lights, ANIMATED]) => {
    const img = new Image(); img.src = src; await img.decode();
    const W = 960, H = 540, c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d', { willReadFrequently: true }); x.imageSmoothingQuality = 'high';
    x.drawImage(img, 0, 0, W, H);
    const d = x.getImageData(0, 0, W, H).data;
    const rgbOf = (s) => (String(s).match(/\d+(\.\d+)?/g) || [255, 255, 255]).slice(0, 3).map(Number);
    const maps = new Map();
    // 점수: 밝기 × 색이 닮은 정도(밝기를 뺀 색도의 거리로 잰다: 붉은 등과 호박색 창을 가른다), 광원 크기에 맞춰 흐린다
    function scoreMap(rgb, blur) {
      const id = rgb.join(',') + '/' + blur;
      if (maps.has(id)) return maps.get(id);
      const [cr, cg, cb] = rgb, cs = cr + cg + cb || 1, s = new Float32Array(W * H);
      for (let i = 0; i < W * H; i++) {
        const R = d[i * 4], G = d[i * 4 + 1], B = d[i * 4 + 2], t = R + G + B || 1;
        const dc = Math.hypot(R / t - cr / cs, G / t - cg / cs, B / t - cb / cs);
        s[i] = Math.max(R, G, B) * Math.exp(-((dc / 0.15) ** 2));
      }
      const t = new Float32Array(W * H);
      for (let pass = 0; pass < 2; pass++) { // 가로, 세로 상자 흐림
        const a = pass ? t : s, b = pass ? s : t, len = pass ? H : W, lines = pass ? W : H;
        for (let l = 0; l < lines; l++) {
          let acc = 0, cnt = 0;
          const at = (k) => (pass ? k * W + l : l * W + k);
          for (let k = 0; k < Math.min(blur, len); k++) { acc += a[at(k)]; cnt++; }
          for (let k = 0; k < len; k++) {
            if (k + blur < len) { acc += a[at(k + blur)]; cnt++; }
            if (k - blur - 1 >= 0) { acc -= a[at(k - blur - 1)]; cnt--; }
            b[at(k)] = acc / cnt;
          }
        }
      }
      maps.set(id, s);
      return s;
    }
    function find(s, cx, cy, rad, rr) {
      let best = -1, bx = Math.round(cx), by = Math.round(cy), sum = 0, n = 0;
      for (let y = Math.max(0, Math.floor(cy - rad)); y <= Math.min(H - 1, Math.ceil(cy + rad)); y++)
        for (let xx = Math.max(0, Math.floor(cx - rad)); xx <= Math.min(W - 1, Math.ceil(cx + rad)); xx++) {
          if ((xx - cx) ** 2 + (y - cy) ** 2 > rad * rad) continue;
          const v = s[y * W + xx]; sum += v; n++;
          if (v > best) { best = v; bx = xx; by = y; }
        }
      // 가장 밝은 점 둘레에서 최댓값의 85% 이상인 곳의 무게 중심
      let wx = 0, wy = 0, ws = 0;
      for (let y = Math.max(0, by - rr); y <= Math.min(H - 1, by + rr); y++)
        for (let xx = Math.max(0, bx - rr); xx <= Math.min(W - 1, bx + rr); xx++) {
          const v = s[y * W + xx]; if (v < best * 0.85) continue;
          wx += xx * v; wy += y * v; ws += v;
        }
      return { x: ws ? wx / ws : bx, y: ws ? wy / ws : by, v: best, mean: n ? sum / n : 0 };
    }
    // 물빛(water)은 그림에 뚜렷한 불빛이 없어 찾지 않는다. 기준점은 또렷한 점 광원만
    const inner = (l) => ANIMATED.includes(l.kind) && l.kind !== 'water' && l.x >= 0.02 && l.x <= 0.98 && l.y >= 0.02 && l.y <= 0.98;
    const AREA = ['door', 'neon', 'chandelier']; // 점이 아니라 면으로 빛나는 것
    const POINT = ['blink', 'beacon', 'beacon3', 'lamp', 'fire', 'ember', 'candle', 'bulb', 'eyes'];
    const dist = (a, b) => Math.hypot(a.x - b.x, (a.y - b.y) * H / W);
    const cand = lights.map((l, i) => ({ i, l })).filter(o => inner(o.l));
    for (const o of cand) o.nn = Math.min(1, ...cand.filter(p => p !== o).map(p => dist(o.l, p.l)));
    const look = (l, cx, cy, radW) => {
      const blur = Math.max(1, Math.min(12, Math.round(l.r * W * 0.3)));
      const f = find(scoreMap(rgbOf(l.color), blur), cx * W, cy * H, radW * W, Math.max(3, Math.round(l.r * W)));
      return { x: f.x / W, y: f.y / H, ok: f.v >= 60 && f.v >= f.mean * 2.2 };
    };
    // 1) 기준점으로 전체 밀림 어림
    const anchors = [];
    for (const o of cand) if (POINT.includes(o.l.kind) && o.nn > 0.12 && o.l.r <= 0.05) { const f = look(o.l, o.l.x, o.l.y, 0.08); if (f.ok) anchors.push([f.x - o.l.x, f.y - o.l.y]); }
    const med = (a) => { const s = a.slice().sort((p, q) => p - q); return s.length ? (s.length % 2 ? s[s.length >> 1] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : 0; };
    // 기준점이 셋 이상이면 가운데값, 둘이면 서로 1.5% 안에서 맞을 때만 믿는다
    const agree = anchors.length >= 3 || (anchors.length === 2 && Math.hypot(anchors[0][0] - anchors[1][0], (anchors[0][1] - anchors[1][1]) * H / W) < 0.015);
    const shift = agree ? { dx: med(anchors.map(a => a[0])), dy: med(anchors.map(a => a[1])), n: anchors.length } : { dx: 0, dy: 0, n: anchors.length, off: anchors.length >= 2 };
    const trust = agree;
    // 2) 모든 광원
    return {
      shift,
      rows: lights.map((l, i) => {
        const o = cand.find(p => p.i === i);
        const moved = (nx, ny, note) => ({ kind: l.kind, from: [l.x, l.y], to: [nx, ny], note });
        if (!o) return trust ? moved(l.x + shift.dx, l.y + shift.dy, '밖·가장자리: 전체 밀림만큼') : moved(l.x, l.y, '밖·가장자리: 그대로');
        const rad = o.nn > 0.12 ? 0.06 : Math.max(0.004, Math.min(0.06, o.nn * 0.45));
        const ex = l.x + (trust ? shift.dx : 0), ey = l.y + (trust ? shift.dy : 0);
        const f = look(l, l.x + shift.dx, l.y + shift.dy, rad);
        // 넓은 광원(문간, 창, 네온)은 찾은 자리가 제 반경 안이면 옮기지 않는다: 게임이 얹는 빛이 이미 덮는다
        if (f.ok && AREA.includes(l.kind) && dist(f, { x: ex, y: ey }) < l.r * 0.5) return moved(ex, ey, '찾음(제자리)');
        if (f.ok) return moved(f.x, f.y, '찾음');
        return trust ? moved(l.x + shift.dx, l.y + shift.dy, '못 찾음: 전체 밀림만큼') : moved(l.x, l.y, '못 찾음: 그대로');
      }),
    };
  }, [src, lights, ANIMATED]);

  const f4 = (v) => +v.toFixed(4), pct = (v) => (v * 100).toFixed(1);
  const why = result.shift.off ? ' — 기준점끼리 어긋나 전체 밀림은 쓰지 않음' : result.shift.n >= 2 ? '' : ' — 둘 미만이라 전체 밀림은 쓰지 않음';
  console.log(`전체 밀림: 가로 ${pct(result.shift.dx)}% 세로 ${pct(result.shift.dy)}% (기준점 ${result.shift.n}개${why})`);
  const next = lights.map((l, i) => Object.assign({}, l, { x: f4(result.rows[i].to[0]), y: f4(result.rows[i].to[1]) }));
  for (const [i, r] of result.rows.entries()) {
    const d = Math.hypot(next[i].x - r.from[0], (next[i].y - r.from[1]) * 9 / 16);
    console.log(`  ${r.kind.padEnd(10)} (${pct(r.from[0])}, ${pct(r.from[1])}) → (${pct(next[i].x)}, ${pct(next[i].y)})  ${d < 0.0005 ? '      ' : pct(d).padStart(4) + '% '} ${r.note}`);
  }
  if (opts.write) {
    entry.lights = next;
    fs.writeFileSync(META, JSON.stringify(meta, null, 1) + '\n');
    console.log(`art.json 의 «${key}» 광원을 고쳤다. 확인: node tools/art/import.mjs preview ${key}`);
  } else console.log(`art.json 에 적으려면 --write 를 붙인다. 확인: node tools/art/import.mjs preview ${key}${file ? ' ' + file : ''}`);
}

/* 미리보기: 광원 자리, 넓은 화면의 글 칸, 휴대폰 화면 범위 */
async function preview(entry, src) {
  const png = await page.evaluate(async ([src, e, key, ANIMATED]) => {
    const img = new Image(); img.src = src; await img.decode();
    const W = 1600, H = 900, c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d');
    x.drawImage(img, 0, 0, W, H);
    x.font = 'bold 22px sans-serif';
    if (key === 'title') {
      // 타이틀에는 글 칸이 없다. 왼쪽에 제목과 메뉴가 놓이고, 게임이 왼쪽을 어둡게 덮는다 (style.css 의 .app.in-title .stage-shade)
      const g = x.createLinearGradient(0, 0, W, 0);
      g.addColorStop(0, 'rgba(0,0,0,0.78)'); g.addColorStop(0.38, 'rgba(0,0,0,0.45)'); g.addColorStop(0.62, 'rgba(0,0,0,0)');
      x.fillStyle = g; x.fillRect(0, 0, W, H);
      x.fillStyle = '#fff'; x.fillText('넓은 화면: 제목·메뉴', 20, 40);
    } else {
      // 넓은 화면(1600px): 오른쪽 36%는 글 칸이 덮는다
      const col = W * 0.36;
      x.fillStyle = 'rgba(0,0,0,0.55)'; x.fillRect(W - col, 0, col, H);
      x.fillStyle = '#fff'; x.fillText('넓은 화면: 글 칸', W - col + 20, 40);
    }
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
  }, [src, entry, key, ANIMATED]);
  // 후보 그림 여러 장을 차례로 미리 볼 수 있게, 그림 파일을 주면 그 이름을 붙인다 (title + title_A1.png → preview_title_A1.png)
  const base = file ? path.basename(file).replace(/\.[^.]+$/, '') : key;
  const out = path.join(ROOT, 'tools/art/out', 'preview_' + (base === key || base.startsWith(key + '_') ? base : key + '_' + base) + '.png');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, Buffer.from(png.split(',')[1], 'base64'));
  console.log('미리보기 → ' + path.relative(ROOT, out) + '  (노란 원: 게임이 빛을 얹는 자리, ' + (key === 'title' ? '어두운 왼쪽: 제목·메뉴' : '어두운 오른쪽: 글 칸') + ', 파란 점선: 휴대폰에서 보이는 범위)');
}
