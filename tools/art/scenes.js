/* 탱고 레테 — 장면
 * 각 함수는 (ctx, W, H, r, v) 를 받는다. W×H 는 언제나 1920×1080 (렌더러가 배율을 맞춘다).
 * v: { night: bool } — 낮/밤 변형. 대화창이 오른쪽 35%를 덮으므로 초점은 왼쪽 60%에 둔다.
 */
(function (G) {
  'use strict';
  const A = G.ART;
  const S = A.scenes = {};

  /* ───────── 공용 부품 ───────── */

  /* 젖은 돌바닥: 원근으로 커지는 돌 줄 */
  A.cobbles = function (ctx, x0, x1, y0, y1, r, o = {}) {
    A.vgrad(ctx, x0, y0, x1 - x0, y1, [[0, o.far || '#1a1f24'], [1, o.near || '#08090b']]);
    let y = y0;
    while (y < y1) {
      const t = (y - y0) / (y1 - y0);
      const h = 3 + t * t * 34 + t * 6;
      const w = h * (o.aspect || 1.9);
      let x = x0 - r() * w;
      while (x < x1) {
        const ww = w * (0.75 + r() * 0.5);
        const k = 0.75 + r() * 0.5;
        const base = A.mix(o.far || '#1a1f24', o.near || '#08090b', t);
        ctx.fillStyle = A.rgba(A.shade(base, k * (o.stone || 1.25)));
        const gx = Math.max(0.6, h * 0.1), gy = Math.max(0.5, h * 0.12);
        const rx = x + gx, ry = y + gy, rw = ww - gx * 2, rh = h - gy * 2;
        if (rw > 0 && rh > 0) {
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(rx, ry, rw, rh, Math.min(rh, rw) * 0.35); else ctx.rect(rx, ry, rw, rh);
          ctx.fill();
          if (o.sheen) { ctx.fillStyle = A.rgba(o.sheen, (o.sheenA || 0.12) * (0.3 + r() * 0.7) * (1 - t * 0.5)); ctx.fillRect(rx + rw * 0.15, ry, rw * 0.7, Math.max(0.6, rh * 0.18)); }
        }
        x += ww;
      }
      y += h;
    }
  };

  /* 먼 해안선 (언덕 실루엣 + 드문 불빛) */
  A.shore = function (ctx, W, yBase, amp, color, r, o = {}) {
    const n = A.noise(o.seed || 21);
    const hy = x => yBase - amp * n.fbm(x / (o.scale || 260), 0.5, 4) - (o.lift || 0);
    const pts = [[0, yBase + 40]];
    for (let x = 0; x <= W; x += 12) pts.push([x, hy(x)]);
    pts.push([W, yBase + 40]);
    A.poly(ctx, pts, color);
    if (o.lights) {
      for (let i = 0; i < o.lights; i++) {
        const x = r() * W, yy = A.lerp(hy(x), yBase, 0.2 + r() * 0.75);
        const c = r() < 0.8 ? (o.lc || '#ffb766') : '#cfe0ff';
        ctx.fillStyle = A.rgba(c, 0.9); ctx.fillRect(x, yy, 2, 2);
        if (r() < 0.3) A.glow(ctx, x, yy, 10, c, 0.4);
      }
    }
  };

  /* 등대 */
  A.lighthouse = function (ctx, x, yb, h, color, lit, lc = '#fff1c4') {
    A.poly(ctx, [[x - h * 0.09, yb], [x + h * 0.09, yb], [x + h * 0.06, yb - h * 0.85], [x - h * 0.06, yb - h * 0.85]], color);
    A.rect(ctx, x - h * 0.08, yb - h * 0.87, h * 0.16, h * 0.03, color);
    A.rect(ctx, x - h * 0.05, yb - h * 0.98, h * 0.1, h * 0.11, lit ? lc : color);
    A.poly(ctx, [[x - h * 0.07, yb - h * 0.98], [x, yb - h * 1.08], [x + h * 0.07, yb - h * 0.98]], color);
    if (lit) {
      A.light(ctx, x, yb - h * 0.93, { r: h * 0.5, color: lc, kind: 'beacon' });
      A.cone(ctx, x, yb - h * 0.93, Math.PI + 0.06, 0.05, h * 9, lc, 0.1);
    }
  };

  /* 끈에 매단 전구 줄 */
  A.bulbs = function (ctx, x0, y0, x1, y1, sag, n, r, o = {}) {
    A.wire(ctx, x0, y0, x1, y1, sag, o.wire || '#07090b', 1.4);
    for (let i = 1; i < n; i++) {
      const t = i / n;
      const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * ((x0 + x1) / 2) + t * t * x1;
      const yq = (y0 + y1) / 2 + sag * 2;
      const y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * yq + t * t * y1;
      const on = o.on !== false && r() > (o.broken || 0.12);
      ctx.fillStyle = A.rgba(on ? '#fff0c8' : (o.off || '#1b1c1e'));
      ctx.beginPath(); ctx.arc(x, y + 5, 3.2, 0, Math.PI * 2); ctx.fill();
      if (on) { A.glow(ctx, x, y + 5, 26, o.color || '#ffbe6a', 0.55); if (r() < 0.4) A.mark(x, y + 5, 14, o.color || '#ffbe6a', 'bulb'); }
    }
  };

  /* 드럼통 모닥불 */
  A.barrelFire = function (ctx, x, yb, s, r, o = {}) {
    const c = o.color || '#0b0c0e';
    A.poly(ctx, [[x - 22 * s, yb], [x + 22 * s, yb], [x + 24 * s, yb - 58 * s], [x - 24 * s, yb - 58 * s]], c);
    for (const k of [0.3, 0.7]) A.rect(ctx, x - 24 * s, yb - 58 * s * k, 48 * s, 2.5 * s, A.shade(c, 1.8));
    A.rect(ctx, x - 24 * s, yb - 60 * s, 48 * s, 4 * s, '#ff8e3c', 0.9);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 9; i++) {
      const fx = x + (r() - 0.5) * 30 * s, fh = (24 + r() * 40) * s, fw = (6 + r() * 8) * s;
      ctx.fillStyle = A.lineGrad(ctx, 0, yb - 60 * s - fh, 0, yb - 58 * s, [[0, '#ffdb7a', 0], [0.5, '#ffa040', 0.55], [1, '#ff6a20', 0.9]]);
      ctx.beginPath(); ctx.moveTo(fx - fw, yb - 58 * s); ctx.quadraticCurveTo(fx - fw * 0.3, yb - 58 * s - fh * 0.5, fx + (r() - 0.5) * 8 * s, yb - 58 * s - fh); ctx.quadraticCurveTo(fx + fw * 0.4, yb - 58 * s - fh * 0.5, fx + fw, yb - 58 * s); ctx.fill();
    }
    ctx.restore();
    A.light(ctx, x, yb - 72 * s, { r: 120 * s, color: '#ff8a3a', kind: 'fire', core: 6 * s });
    A.pool(ctx, x, yb + 2, 190 * s, 42 * s, '#ff7a2a', 0.45);
    if (o.smoke !== false) A.smoke(ctx, x, yb - 90 * s, s, r, o.smokeC || '#5a5550', o.smokeA || 0.12);
  };
  /* 연기 기둥 */
  A.smoke = function (ctx, x, y, s, r, color, a) {
    for (let i = 0; i < 16; i++) {
      const t = i / 16;
      const px = x + Math.sin(t * 5 + r()) * 18 * s + t * 60 * s, py = y - t * 260 * s;
      ctx.fillStyle = A.radGrad(ctx, px, py, 0, (18 + t * 50) * s, [[0, color, a * (1 - t)], [1, color, 0]]);
      ctx.beginPath(); ctx.arc(px, py, (18 + t * 50) * s, 0, Math.PI * 2); ctx.fill();
    }
  };
  /* 계류 기둥 */
  A.bollard = function (ctx, x, yb, s, c, top) {
    A.poly(ctx, [[x - 13 * s, yb], [x + 13 * s, yb], [x + 10 * s, yb - 26 * s], [x - 10 * s, yb - 26 * s]], c);
    ctx.fillStyle = A.rgba(c); ctx.beginPath(); ctx.ellipse(x, yb - 27 * s, 17 * s, 6 * s, 0, 0, Math.PI * 2); ctx.fill();
    if (top) { ctx.fillStyle = A.rgba(top, 0.5); ctx.beginPath(); ctx.ellipse(x, yb - 29 * s, 14 * s, 3 * s, 0, Math.PI, 0); ctx.fill(); }
  };
  /* 갈매기 */
  A.gull = function (ctx, x, y, s, c) {
    ctx.strokeStyle = A.rgba(c); ctx.lineWidth = 2 * s; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - 14 * s, y - 2 * s); ctx.quadraticCurveTo(x - 6 * s, y - 8 * s, x, y); ctx.quadraticCurveTo(x + 6 * s, y - 8 * s, x + 14 * s, y - 3 * s); ctx.stroke();
  };
  /* 줄무늬 차양 노점 */
  A.stall = function (ctx, x, yb, w, r, o) {
    const h = o.h || 170;
    A.rect(ctx, x + 6, yb - h, 5, h, o.frame); A.rect(ctx, x + w - 11, yb - h, 5, h, o.frame);
    const aw = w + 40, ax = x - 20, ay = yb - h - 10, stripes = 9;
    for (let i = 0; i < stripes; i++) {
      const sx = ax + aw * i / stripes, sw = aw / stripes;
      A.poly(ctx, [[sx + 8, ay], [sx + sw + 8, ay], [sx + sw, ay + 46], [sx, ay + 46]], i % 2 ? o.s1 : o.s2);
      ctx.fillStyle = A.rgba(i % 2 ? o.s1 : o.s2);
      ctx.beginPath(); ctx.arc(sx + sw / 2, ay + 46, sw / 2, 0, Math.PI); ctx.fill();
    }
    A.rect(ctx, ax + 8, ay - 5, aw, 6, A.shade(o.s1, 0.6));
  };
  function persp(u, k) { return u / (u + (1 - u) * k); }

  /* ───────── 솔레아 부두 거리 ───────── */
  S.quay = function (ctx, W, H, r, v) {
    const N = !!v.night;
    const HZ = 520, EDGE = 702;
    const C = N ? {
      sky: [[0, '#04080e'], [0.5, '#0b1a26'], [0.82, '#1f2c35'], [1, '#3d3530']],
      fog: '#26323b', shore: '#101920', jetty: '#070b0f', crane: '#090d12',
      water: [[0, '#1b272e'], [1, '#05090d']], bldg: '#0f1318', bldg2: '#141a20', bldgDark: '#090c10',
      street: ['#1b2127', '#07090b'], fig: '#050608', edge: '#2a2e30', lamp: '#ffb45a', neon: '#ff2f6a',
    } : {
      sky: [[0, '#7f8d91'], [0.55, '#a9b1ac'], [1, '#d6d0bf']],
      fog: '#c0c1b6', shore: '#7d8784', jetty: '#4b4d4b', crane: '#6d2f22',
      water: [[0, '#9aa39c'], [1, '#3f4d4f']], bldg: '#6e4a3a', bldg2: '#83705c', bldgDark: '#4a3a33',
      street: ['#7a776e', '#2e2f33'], fig: '#1a1b20', edge: '#9a968a', lamp: '#ffe2b0', neon: '#7c4b58',
    };
    // 하늘
    A.vgrad(ctx, 0, 0, W, HZ + 2, C.sky);
    if (N) {
      A.stars(ctx, W, 300, 140, r);
      A.clouds(ctx, W, H, { y0: 120, y1: 470, color: '#3c2f2c', a: 0.55, scale: 220, stretch: 4, seed: 4 });
      A.clouds(ctx, W, H, { y0: 20, y1: 260, color: '#16222c', a: 0.6, scale: 180, stretch: 5, seed: 9 });
      A.band(ctx, W, HZ - 30, 110, '#6b4a34', 0.35);
    } else {
      A.clouds(ctx, W, H, { y0: 0, y1: 420, color: '#eeeae0', a: 0.55, scale: 260, stretch: 4, seed: 4 });
      A.clouds(ctx, W, H, { y0: 60, y1: 380, color: '#6f7a7d', a: 0.35, scale: 200, stretch: 5, seed: 8 });
      for (const [gx, gy, gs] of [[520, 210, 1], [610, 250, 0.7], [1240, 170, 0.8]]) A.gull(ctx, gx, gy, gs, '#3a3f42');
    }
    // 먼 해안과 등대
    A.shore(ctx, W, HZ, 34, A.atm(C.shore, C.fog, 0.35), r, { lights: N ? 70 : 0, seed: 12, scale: 300 });
    A.lighthouse(ctx, 1840, HZ - 8, 70, A.atm(C.shore, C.fog, 0.2), N);
    // 물
    A.vgrad(ctx, 0, HZ, W, EDGE, C.water);
    A.reflect(ctx, W, H, HZ, { strength: N ? 0.4 : 0.35, depth: EDGE - HZ, ripple: 1.4, seed: 5 });
    // 먼 부두(방파제 위의 크레인 줄)
    const JET = HZ + 34;
    A.rect(ctx, 820, JET - 6, W - 820, 9, A.atm(C.jetty, C.fog, 0.25));
    const cranes = [[905, 0.44, -0.62, -1], [1090, 0.5, -1.05, 1], [1300, 0.56, -0.4, 1], [1520, 0.52, -0.95, -1], [1745, 0.6, -0.5, 1]];
    cranes.forEach(([cx, s, jib, dir], i) => {
      const col = A.atm(C.crane, C.fog, 0.28 - s * 0.2);
      const res = A.crane(ctx, cx, JET - 3, s, { color: col, jib, dir, cab: N && i === 2 ? '#ffcf7a' : null });
      if (N) { const t = res.tip; A.glow(ctx, t[0], t[1], 16, '#ff3030', 0.8); A.mark(t[0], t[1], 10, '#ff3030', 'blink'); }
    });
    A.reflect(ctx, W, H, JET + 3, { strength: N ? 0.35 : 0.3, depth: EDGE - JET, ripple: 1.8, seed: 6, squash: 1 });
    A.ripples(ctx, W, HZ + 4, EDGE, r, N ? '#51606a' : '#d9ddd4', N ? 0.35 : 0.4, 220);
    if (N) {
      A.streaks(ctx, 1300 + 18, JET + 6, 120, 10, '#ffcf7a', 0.6, r);
      A.streaks(ctx, 1840, HZ + 4, 160, 12, '#fff1c4', 0.35, r);
    }

    // 정박한 어선
    const hull = [[560, 640], [980, 640], [955, 690], [600, 690], [548, 652]];
    A.poly(ctx, hull, N ? '#0a1014' : '#27404a');
    A.rect(ctx, 552, 636, 430, 8, N ? '#1b2227' : '#d9d2c2');
    A.rect(ctx, 600, 668, 350, 6, N ? '#15090a' : '#7a2b24');
    A.poly(ctx, [[700, 636], [700, 580], [820, 580], [836, 600], [836, 636]], N ? '#0d1317' : '#d8d3c6');
    A.rect(ctx, 712, 592, 24, 20, N ? '#ffcd82' : '#3b4b52');
    A.rect(ctx, 748, 592, 24, 20, N ? '#0a0e11' : '#3b4b52');
    A.rect(ctx, 632, 440, 5, 200, N ? '#0b1014' : '#3c3a36');
    A.line(ctx, 634, 444, 560, 638, N ? '#0b1014' : '#3c3a36', 1.3);
    A.line(ctx, 634, 444, 900, 636, N ? '#0b1014' : '#3c3a36', 1.3);
    A.line(ctx, 634, 520, 700, 520, N ? '#0b1014' : '#3c3a36', 3);
    if (N) { A.light(ctx, 724, 602, { r: 40, color: '#ffc27a', kind: 'window', core: false }); A.streaks(ctx, 724, 692, 60, 10, '#ffc27a', 0.5, r); }
    // 부두 턱
    A.rect(ctx, 0, EDGE - 2, W, 18, C.edge);
    A.rect(ctx, 0, EDGE - 2, W, 2, N ? '#565552' : '#c9c4b5');
    for (let x = 30; x < W; x += 92 + r() * 30) A.rect(ctx, x, EDGE, 2, 16, A.shade(C.edge, 0.6));
    // 거리 바닥
    A.cobbles(ctx, 0, W, EDGE + 16, H, r, { far: C.street[0], near: C.street[1], sheen: N ? '#5b6670' : '#c7c6bd', sheenA: N ? 0.1 : 0.16 });
    if (!N) A.vgrad(ctx, 0, EDGE + 16, W, H, [[0, '#b9bab2', 0.25], [1, '#b9bab2', 0]]);
    // 계류 기둥과 밧줄
    for (const [bx, bs] of [[520, 1], [1010, 1], [1560, 1.05]]) A.bollard(ctx, bx, EDGE + 22, bs, N ? '#07090b' : '#26272a', N ? '#46494b' : '#bdb8ab');
    A.wire(ctx, 520, EDGE - 2, 566, 650, 8, N ? '#1a1612' : '#6d5a45', 3);
    A.wire(ctx, 1010, EDGE - 2, 952, 660, 10, N ? '#1a1612' : '#6d5a45', 3);

    // 왼쪽 거리의 건물들 (소실점으로 모이는 벽면)
    const VP = [1010, HZ];
    const topNear = -140, botNear = 1080;
    const along = (x, y0) => y0 + (VP[1] - y0) * (x / VP[0]);
    const farBlocks = [[330, 470, 0.5, C.bldg2], [470, 600, 0.62, C.bldgDark], [600, 690, 0.4, C.bldg2]];
    for (const [x0, x1, hk, col] of farBlocks) {
      const yb0 = along(x0, botNear), yb1 = along(x1, botNear);
      const yt0 = A.lerp(yb0, along(x0, topNear), hk), yt1 = A.lerp(yb1, along(x1, topNear), hk);
      const c = A.atm(col, C.fog, 0.1 + x0 / 3000);
      A.poly(ctx, [[x0, yt0], [x1, yt1], [x1, yb1], [x0, yb0]], c);
      A.poly(ctx, [[x0, yt0 - 8], [x1, yt1 - 6], [x1, yt1], [x0, yt0]], A.shade(c, 0.8));
      const cols = Math.round((x1 - x0) / 34);
      for (let i = 0; i < cols; i++) {
        const ua = (i + 0.25) / cols, ub = (i + 0.75) / cols;
        const xa = A.lerp(x0, x1, ua), xb = A.lerp(x0, x1, ub);
        for (let j = 0; j < 4; j++) {
          const v0 = 0.12 + j * 0.2, v1 = v0 + 0.1;
          const y00 = A.lerp(A.lerp(yt0, yb0, v0), A.lerp(yt1, yb1, v0), ua), y01 = A.lerp(A.lerp(yt0, yb0, v1), A.lerp(yt1, yb1, v1), ua);
          const y10 = A.lerp(A.lerp(yt0, yb0, v0), A.lerp(yt1, yb1, v0), ub), y11 = A.lerp(A.lerp(yt0, yb0, v1), A.lerp(yt1, yb1, v1), ub);
          const on = N && r() < 0.35;
          const wc = on ? A.mix('#f0a85a', '#ffe0a8', r() * 0.5) : (N ? '#07090c' : '#3d4448');
          A.poly(ctx, [[xa, y00], [xb, y10], [xb, y11], [xa, y01]], wc);
        }
      }
    }
    // 레테 무도장 (가까운 벽면)
    const L0 = 0, L1 = 330;
    const lt0 = topNear, lt1 = along(L1, topNear), lb0 = botNear, lb1 = along(L1, botNear);
    const wy = (u, vv) => A.lerp(A.lerp(lt0, lb0, vv), A.lerp(lt1, lb1, vv), u);
    const wx = u => A.lerp(L0, L1, u);
    A.poly(ctx, [[L0, lt0], [L1, lt1], [L1, lb1], [L0, lb0]], C.bldg);
    for (let k = 0.1; k < 1; k += 0.18) A.poly(ctx, [[L0, wy(0, k)], [L1, wy(1, k)], [L1, wy(1, k) + 5], [L0, wy(0, k) + 7]], A.shade(C.bldg, 0.72));
    const colsU = [0.02, 0.3, 0.52, 0.7, 0.84, 0.95];
    for (let i = 0; i < colsU.length - 1; i++) {
      const ua = persp(colsU[i] + 0.08, 1), ub = persp(colsU[i + 1] - 0.07, 1), um = (ua + ub) / 2;
      for (const [v0, v1] of [[0.15, 0.25], [0.35, 0.45], [0.55, 0.63]]) {
        const on = N && r() < 0.45;
        const wc = on ? A.mix('#ff9a6a', '#ffd1a0', r() * 0.6) : (N ? '#08090c' : '#2f3538');
        A.poly(ctx, [[wx(ua), wy(ua, v0)], [wx(ub), wy(ub, v0)], [wx(ub), wy(ub, v1)], [wx(ua), wy(ua, v1)]], wc);
        if (on) {
          // 커튼 한쪽과 창살
          A.poly(ctx, [[wx(ua), wy(ua, v0)], [wx(A.lerp(ua, ub, 0.3)), wy(A.lerp(ua, ub, 0.3), v0)], [wx(A.lerp(ua, ub, 0.18)), wy(A.lerp(ua, ub, 0.18), v1)], [wx(ua), wy(ua, v1)]], '#5a1a22');
          A.glow(ctx, wx(um), (wy(um, v0) + wy(um, v1)) / 2, 50, '#ff9a6a', 0.22);
        }
        A.poly(ctx, [[wx(um) - 1.5, wy(um, v0)], [wx(um) + 1.5, wy(um, v0)], [wx(um) + 1.5, wy(um, v1)], [wx(um) - 1.5, wy(um, v1)]], A.shade(C.bldg, 0.5));
        const vm = (v0 + v1) / 2;
        A.poly(ctx, [[wx(ua), wy(ua, vm) - 1.5], [wx(ub), wy(ub, vm) - 1.5], [wx(ub), wy(ub, vm) + 1.5], [wx(ua), wy(ua, vm) + 1.5]], A.shade(C.bldg, 0.5));
        A.poly(ctx, [[wx(ua) - 4, wy(ua, v1)], [wx(ub) + 3, wy(ub, v1)], [wx(ub) + 3, wy(ub, v1) + 6], [wx(ua) - 4, wy(ua, v1) + 8]], A.shade(C.bldg, 0.6));
      }
    }
    // 입구: 열린 문에서 새는 빛
    const da = 0.46, db = 0.62, dv0 = 0.76, dv1 = 0.975;
    A.poly(ctx, [[wx(da), wy(da, dv0)], [wx(db), wy(db, dv0)], [wx(db), wy(db, dv1)], [wx(da), wy(da, dv1)]], N ? '#ffb46e' : '#2a1d18');
    if (N) {
      A.shaft(ctx, [[wx(da), wy(da, dv1)], [wx(db), wy(db, dv1)], [wx(db) + 260, wy(db, dv1) + 40], [wx(da) + 120, wy(da, dv1) + 90]], '#ffb46e', 0.35, 0, wx(da), 0, wx(da) + 260, 0);
      A.light(ctx, (wx(da) + wx(db)) / 2, wy(0.54, 0.85), { r: 90, color: '#ffa860', kind: 'door', core: false });
    }
    A.poly(ctx, [[wx(da) - 20, wy(da, dv0) - 14], [wx(db) + 16, wy(db, dv0) - 12], [wx(db) + 40, wy(db, dv0) + 18], [wx(da) + 10, wy(da, dv0) + 22]], N ? '#2a0d14' : '#6d1f2a');
    // 네온 간판 (세로 칼날 간판)
    const sx = 262, sy0 = 250, sy1 = 640;
    A.line(ctx, 200, 300, sx, 300, N ? '#0b0d10' : '#2b2d30', 5);
    A.line(ctx, 200, 590, sx, 590, N ? '#0b0d10' : '#2b2d30', 5);
    A.rect(ctx, sx - 4, sy0, 74, sy1 - sy0, N ? '#12060b' : '#3a2b2f');
    A.rect(ctx, sx - 4, sy0, 74, 4, N ? '#301019' : '#5a4a4e');
    const letters = 'LETHE';
    for (let i = 0; i < letters.length; i++) {
      const ly = sy0 + 42 + i * ((sy1 - sy0 - 60) / (letters.length - 1)) - 6;
      if (N) A.text(ctx, letters[i], sx + 33, ly, { size: 60, neon: i === 3 ? '#ff5a86' : C.neon });
      else A.text(ctx, letters[i], sx + 33, ly, { size: 60, color: '#a7858e', a: 0.9 });
    }
    if (N) {
      A.glow(ctx, sx + 33, (sy0 + sy1) / 2, 260, C.neon, 0.22);
      A.mark(sx + 33, 440, 120, C.neon, 'neon');
      A.pool(ctx, 330, 910, 260, 60, C.neon, 0.22);
      A.streaks(ctx, sx + 33, 905, 170, 34, C.neon, 0.3, r);
    }

    // 전구 줄
    A.bulbs(ctx, 330, 205, 1920, 120, 95, 36, r, { on: N });

    // 가로등
    A.lamp(ctx, 598, 880, 330, r, { on: N, arm: 34, light: C.lamp, wet: 160, poolR: 150, color: N ? '#07090b' : '#26272b' });
    A.lamp(ctx, 1440, 905, 360, r, { on: N, arm: -34, light: C.lamp, wet: 150, poolR: 160, color: N ? '#07090b' : '#26272b' });

    // 생선튀김 노점 (차양 → 뒤의 여자 → 카운터)
    A.stall(ctx, 760, 902, 230, r, { h: 236, frame: N ? '#0a0b0c' : '#2a2724', s1: N ? '#6a1a17' : '#b43a2c', s2: N ? '#8f7e66' : '#ebe0c8' });
    A.figure(ctx, 890, 904, { h: 162, color: C.fig, hat: 'bun', build: 'woman', body: 'skirt', rim: N ? '#ffb676' : null, rimDir: -1 });
    A.rect(ctx, 760, 820, 230, 82, N ? '#1d0f0c' : '#5e3a2a');
    A.rect(ctx, 754, 816, 242, 8, N ? '#3b2016' : '#7c5238');
    A.text(ctx, '튀김', 875, 860, { size: 26, color: N ? '#ffcf9a' : '#f4e7ce', a: 0.85, font: '"Black Han Sans", sans-serif' });
    A.line(ctx, 820, 712, 820, 732, '#111', 1.5);
    if (N) {
      A.light(ctx, 820, 736, { r: 60, color: '#ffc27a', kind: 'bulb' });
      A.pool(ctx, 875, 910, 200, 40, '#ffb466', 0.35);
      A.streaks(ctx, 875, 912, 120, 26, '#ffb466', 0.35, r);
    } else { ctx.fillStyle = A.rgba('#f4efe0'); ctx.beginPath(); ctx.arc(820, 738, 5, 0, Math.PI * 2); ctx.fill(); }
    A.smoke(ctx, 850, 780, 0.7, r, N ? '#6a5a4a' : '#eeeae2', N ? 0.08 : 0.2);
    // 꼬마 (보보)
    A.figure(ctx, 700, 915, { h: 108, color: C.fig, hat: 'cap', rim: N ? '#ffb676' : null, rimDir: 1, face: -1 });

    // 모닥불과 피켓 든 하역부들
    A.barrelFire(ctx, 1165, 942, 1, r, { smokeC: N ? '#4a403a' : '#9c9892', smokeA: N ? 0.1 : 0.14 });
    A.figure(ctx, 1080, 950, { h: 215, color: C.fig, hat: 'cap', pose: 'pockets', rim: '#ff9a4a', rimDir: 1, coat: true });
    A.figure(ctx, 1238, 948, { h: 225, color: C.fig, hat: 'fedora', pose: 'smoke', rim: '#ff9a4a', rimDir: -1, coat: true, flip: true });
    A.figure(ctx, 1292, 956, { h: 205, color: C.fig, hat: 'beret', rim: '#ff9a4a', rimDir: -1 });
    A.rect(ctx, 1352, 760, 6, 200, N ? '#0b0a09' : '#4d3e30');
    A.poly(ctx, [[1300, 700], [1418, 692], [1422, 780], [1304, 788]], N ? '#3d3228' : '#e3d9c1');
    A.text(ctx, '파업 중', 1361, 740, { size: 30, color: N ? '#ff8c5a' : '#a3281f', a: N ? 0.55 : 0.95, font: '"Black Han Sans", sans-serif' });

    // 벤치의 노인 (그레고르): 등받이 → 좌석 → 사람 → 다리
    const bc = N ? '#0d0b09' : '#4c3a2a', by = 1030;
    A.rect(ctx, 392, by - 150, 206, 12, bc); A.rect(ctx, 392, by - 124, 206, 10, bc);
    A.rect(ctx, 400, by - 150, 8, 104, bc); A.rect(ctx, 582, by - 150, 8, 104, bc);
    A.rect(ctx, 386, by - 50, 218, 12, A.shade(bc, 1.3));
    A.figure(ctx, 470, by, { h: 205, color: C.fig, hat: 'fedora', pose: 'sit', body: 'coat', build: 'old', rim: N ? '#ff6a8f' : null, rimDir: -1, rimA: 0.7 });
    A.rect(ctx, 396, by - 40, 8, 40, bc); A.rect(ctx, 588, by - 40, 8, 40, bc);
    A.band(ctx, W, EDGE - 10, 90, C.fog, N ? 0.22 : 0.3);
  };
  S.quay.focus = 0.35;
})(window);
