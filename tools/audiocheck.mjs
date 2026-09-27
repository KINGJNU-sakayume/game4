// 탱고 레테 — 소리 검사 (헤드리스 Chromium에서 오프라인 렌더)
// src/js/audio.js 를 OfflineAudioContext 로 렌더해 소리가 깨질 만한 것을 잰다.
//  - 장소 배경음 24가지, 장면 전환, 효과음 19가지, 최대 음량에서 효과음을 한꺼번에 몰아친 경우
//  - 피크와 클리핑(0dBFS 이상), 40Hz 아래 초저역 비율, 직류, 잡음 버퍼의 반복 이음매(끝→처음 한 칸의 도약이
//    평소 한 칸 변화의 몇 배인지), K-가중 음량(LUFS, 게이트 없음)과 최대 순간 음량(400ms), 렌더 속도(실시간의 몇 배)
// 타이머(setInterval)는 오디오 시계에 맞춘 가짜로 바꾸고, 렌더를 50ms마다 멈춰 그 사이의 타이머를 부른다.
// 사용법: node tools/audiocheck.mjs [이름 앞부분...]      예) node tools/audiocheck.mjs bed:title sfx:
// playwright 가 필요하다(npm run art 와 같다). 기준을 넘는 항목이 있으면 종료 코드 1.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const SRC = fs.readFileSync(path.join(ROOT, 'src/js/audio.js'), 'utf8');
const only = process.argv.slice(2);
/* 기준: 넘으면 실패 */
const LIMIT = { peak: 0.98, sub40: 12, dc: 0.002, seam: 3 };

const DEF = { master: 0.7, music: 0.6, amb: 0.7, sfx: 0.75 };   // 게임의 기본 설정
const MAX = { master: 1, music: 1, amb: 1, sfx: 1 };
const BEDS = ['title', 'harbor', 'harbor_n', 'street', 'street_n', 'alley', 'hall', 'hall_n', 'room', 'room_n', 'lobby', 'factory',
  'church', 'church_n', 'shop', 'yard', 'yard_n', 'roof', 'roof_n', 'coast', 'coast_n', 'flats', 'fort', 'void'];
const SFX = ['hover', 'click', 'choose', 'open', 'close', 'page', 'dice', 'ok', 'fail', 'crit', 'level', 'item', 'task', 'thought', 'hurt', 'heal', 'money', 'travel', 'start'];
const NOTES = ['ok', 'item', 'task', 'level', 'money', 'thought'];
const SCEN = [
  ...BEDS.map(b => ({ name: 'bed:' + b, bed: b, dur: 20, skip: 5, vol: DEF })),
  ...['title', 'harbor', 'coast', 'void'].map(b => ({ name: 'max:' + b, bed: b, dur: 14, skip: 5, vol: MAX })),
  { name: 'switch', bed: 'title', dur: 18, skip: 1, vol: DEF, acts: [[4, 'bed', 'room'], [8, 'bed', 'harbor'], [8.5, 'bed', 'hall_n'], [12, 'bed', 'void'], [12.2, 'bed', 'coast']] },
  { name: 'stress:max', bed: 'coast', dur: 12, skip: 1, vol: MAX, acts: [
    [2, 'play', 'dice'], ...['crit', 'level', 'item', 'task', 'money', 'thought', 'heal'].map(n => [2.7, 'play', n]),
    [4, 'play', 'hurt'], [4, 'play', 'hurt'], [4, 'play', 'fail'], [4.05, 'play', 'choose'], [4.1, 'play', 'click'],
    [6, 'play', 'start'], [6, 'play', 'travel'], [6.2, 'play', 'page'], [6.2, 'play', 'open'],
    ...Array.from({ length: 20 }, (_, i) => [7 + i * 0.03, 'play', 'hover']),
    ...[9, 9.02, 9.04].flatMap(t => NOTES.map(n => [t, 'play', n])),
  ] },
  ...SFX.map(n => ({ name: 'sfx:' + n, bed: 'silent', dur: 3.2, skip: 0, vol: DEF, acts: [[0.2, 'play', n]], sfx: true })),
].filter(s => !only.length || only.some(o => s.name.startsWith(o)));

/* 페이지 안에서 도는 부분: 시나리오 하나를 렌더하고 잰다 */
async function run([SRC, sc]) {
  const SR = 48000;
  // 가짜 타이머: 렌더가 멈출 때마다 오디오 시계까지 밀린 타이머를 부른다
  const vt = { now: 0, id: 1, q: new Map() };
  window.setInterval = (fn, ms) => { const id = vt.id++; vt.q.set(id, { at: vt.now + ms, fn, iv: ms }); return id; };
  window.setTimeout = (fn, ms) => { const id = vt.id++; vt.q.set(id, { at: vt.now + (ms || 0), fn, iv: 0 }); return id; };
  window.clearInterval = window.clearTimeout = (id) => vt.q.delete(id);
  const runTo = (tms) => {
    for (;;) {
      let best = null, bid = 0;
      for (const [id, j] of vt.q) if (j.at <= tms && (!best || j.at < best.at)) { best = j; bid = id; }
      if (!best) break;
      vt.now = best.at;
      if (best.iv) best.at += best.iv; else vt.q.delete(bid);
      best.fn();
    }
    vt.now = tms;
  };
  let ctx = null;
  window.AudioContext = function () {
    ctx = new OfflineAudioContext(2, Math.round(SR * sc.dur), SR);
    ctx.resumeRender = ctx.resume.bind(ctx);
    ctx.resume = () => Promise.resolve();
    return ctx;
  };
  window.TL = {};
  (0, eval)(SRC);
  const A = window.TL.audio;
  A.init(sc.vol);
  A.unlock();
  A.bed(sc.bed);
  // 잡음 버퍼의 반복 이음매: 끝→처음 도약 / 평소 한 칸 변화(실효값)
  let seam = 0;
  if (A.noise) {
    const d = A.noise.getChannelData(0), n = d.length;
    let s = 0; for (let i = 1; i < n; i++) s += (d[i] - d[i - 1]) ** 2;
    seam = Math.abs(d[0] - d[n - 1]) / Math.sqrt(s / (n - 1));
  }
  const acts = (sc.acts || []).slice().sort((a, b) => a[0] - b[0]);
  for (let k = 1; k * 0.05 < sc.dur - 0.01; k++) {
    const t = +(k * 0.05).toFixed(3);
    ctx.suspend(t).then(() => {
      runTo(t * 1000);
      while (acts.length && acts[0][0] <= t + 1e-6) { const [, what, arg] = acts.shift(); if (what === 'play') A.play(arg); else A.bed(arg); }
      ctx.resumeRender();
    });
  }
  const t0 = performance.now();
  const buf = await ctx.startRendering();
  const ms = performance.now() - t0;
  const L = buf.getChannelData(0), R = buf.getChannelData(1), n = L.length, s0 = Math.floor(sc.skip * SR);
  let peak = 0, clip = 0, dc = 0;
  for (let i = 0; i < n; i++) { const a = Math.max(Math.abs(L[i]), Math.abs(R[i])); if (a > peak) peak = a; if (a >= 1) clip++; }
  for (let i = s0; i < n; i++) dc += (L[i] + R[i]) / 2;
  dc /= n - s0;
  // K-가중(ITU-R BS.1770, 48kHz 계수)
  const kw = (x) => {
    const y = new Float64Array(x.length);
    const f = [[[1.53512485958697, -2.69169618940638, 1.19839281085285], [-1.69065929318241, 0.73248077421585]], [[1, -2, 1], [-1.99004745483398, 0.99007225036621]]];
    let src = x;
    for (const [b, a] of f) {
      let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
      for (let i = 0; i < src.length; i++) { const v = b[0] * src[i] + b[1] * x1 + b[2] * x2 - a[0] * y1 - a[1] * y2; x2 = x1; x1 = src[i]; y2 = y1; y1 = v; y[i] = v; }
      src = y.slice();
    }
    return src;
  };
  const kL = kw(L), kR = kw(R);
  let e = 0; for (let i = s0; i < n; i++) e += kL[i] * kL[i] + kR[i] * kR[i];
  const lufs = -0.691 + 10 * Math.log10(e / (n - s0) + 1e-20);
  const W = Math.floor(0.4 * SR);
  let mmax = -200;
  for (let s = s0; s + W <= n; s += Math.floor(0.1 * SR)) { let q = 0; for (let i = s; i < s + W; i++) q += kL[i] * kL[i] + kR[i] * kR[i]; mmax = Math.max(mmax, -0.691 + 10 * Math.log10(q / W + 1e-20)); }
  // 40Hz 아래 초저역이 전체 에너지에서 차지하는 비율 (웰치 스펙트럼)
  const N = 16384, P = new Float64Array(N / 2), re = new Float64Array(N), im = new Float64Array(N);
  const fft = () => {
    for (let i = 1, j = 0; i < N; i++) { let bit = N >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; } }
    for (let len = 2; len <= N; len <<= 1) {
      const ang = -2 * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang);
      for (let i = 0; i < N; i += len) {
        let cr = 1, ci = 0;
        for (let j = 0; j < len / 2; j++) {
          const a = i + j, b = a + len / 2, vr = re[b] * cr - im[b] * ci, vi = re[b] * ci + im[b] * cr;
          re[b] = re[a] - vr; im[b] = im[a] - vi; re[a] += vr; im[a] += vi;
          const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
        }
      }
    }
  };
  for (let s = s0; s + N <= n; s += N / 2) {
    for (let i = 0; i < N; i++) { re[i] = (L[s + i] + R[s + i]) / 2 * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / (N - 1))); im[i] = 0; }
    fft();
    for (let k = 0; k < N / 2; k++) P[k] += re[k] * re[k] + im[k] * im[k];
  }
  let tot = 0, sub = 0;
  for (let k = 1; k < N / 2; k++) { tot += P[k]; if (k * SR / N < 40) sub += P[k]; }
  return { peak, clip, sub40: tot ? 100 * sub / tot : 0, dc, lufs, mmax, seam, speed: sc.dur * 1000 / ms };
}

const browser = await chromium.launch(fs.existsSync('/opt/pw-browsers/chromium-1194/chrome-linux/chrome') ? { executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' } : {});
const page = await browser.newPage();
const pageErrors = [];
page.on('pageerror', e => pageErrors.push(e.message));
await page.setContent('<!doctype html><html><body></body></html>');

const fails = [];
const pad = (v, w) => String(v).padStart(w);
console.log('이름'.padEnd(15) + pad('피크', 6) + pad('클립', 5) + pad('초저역%', 8) + pad('직류', 9) + pad('LUFS', 7) + pad('순간최대', 8) + pad('이음매', 7) + pad('배속', 6));
for (const sc of SCEN) {
  await page.setContent('<!doctype html><html><body></body></html>');
  const r = await page.evaluate(run, [SRC, sc]);
  const bad = [];
  if (r.clip) bad.push('클리핑 ' + r.clip + '샘플');
  if (r.peak > LIMIT.peak) bad.push('피크 ' + r.peak.toFixed(3));
  if (!sc.sfx && r.sub40 > LIMIT.sub40) bad.push('초저역 ' + r.sub40.toFixed(1) + '%');
  if (Math.abs(r.dc) > LIMIT.dc) bad.push('직류 ' + r.dc.toFixed(4));
  if (r.seam > LIMIT.seam) bad.push('이음매 ' + r.seam.toFixed(1) + '배');
  if (bad.length) fails.push(sc.name + ': ' + bad.join(', '));
  console.log(sc.name.padEnd(15) + pad(r.peak.toFixed(3), 6) + pad(r.clip, 5) + pad(r.sub40.toFixed(1), 8) + pad(r.dc.toFixed(5), 9) +
    pad(r.lufs.toFixed(1), 7) + pad(r.mmax.toFixed(1), 8) + pad(r.seam.toFixed(2), 7) + pad(Math.round(r.speed) + 'x', 6) + (bad.length ? '  ✗ ' + bad.join(', ') : ''));
}
await browser.close();
if (pageErrors.length) { console.error('\n페이지 오류:\n' + pageErrors.join('\n')); process.exit(1); }
if (fails.length) { console.error('\n기준을 넘은 항목 ' + fails.length + '개:\n' + fails.join('\n')); process.exit(1); }
console.log('\n모두 통과: 클리핑 없음, 피크 < ' + LIMIT.peak + ', 초저역 < ' + LIMIT.sub40 + '%, 직류 < ' + LIMIT.dc + ', 이음매 < ' + LIMIT.seam + '배');
