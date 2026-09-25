/* 탱고 레테 — 실내 장면
 * 1점 투시 "상자 무대": 뒷벽 사각형과 소실점을 정하면, (u, v, s) 좌표로 방 안 어디든 찍을 수 있다.
 *   u: 뒷벽 가로 0~1 (밖으로 넘어가도 된다), v: 뒷벽 세로 0(천장)~1(바닥), s: 1=뒷벽 면, 클수록 관객 쪽.
 */
(function (G) {
  'use strict';
  const A = G.ART;
  const S = A.scenes;

  A.space = function (vp, back) {
    const [vx, vy] = vp, [bx0, by0, bx1, by1] = back;
    const P = {
      vp, back,
      at(u, v, s = 1) { const x = bx0 + (bx1 - bx0) * u, y = by0 + (by1 - by0) * v; return [vx + (x - vx) * s, vy + (y - vy) * s]; },
      /* 바닥(v=1)에서 화면 y 가 되는 s */
      sAtY(y, v = 1) { const yy = by0 + (by1 - by0) * v; return (y - vy) / (yy - vy); },
      quad(ctx, a, b, c, d, fill) { A.poly(ctx, [a, b, c, d], fill); },
    };
    return P;
  };
  /* 방: 천장·바닥·양 벽·뒷벽. c: { ceil, floor, left, right, wall } (값은 색 또는 [가까운색, 먼색]) */
  A.roomBox = function (ctx, P, W, H, c) {
    const [x0, y0, x1, y1] = P.back, [vx, vy] = P.vp;
    const g = (col, ax, ay, bx, by) => Array.isArray(col) ? A.lineGrad(ctx, ax, ay, bx, by, [[0, col[0]], [1, col[1]]]) : A.rgba(col);
    const big = 4;
    const far = (x, y) => [vx + (x - vx) * big, vy + (y - vy) * big];
    ctx.fillStyle = g(c.ceil, 0, 0, 0, y0); A.poly(ctx, [far(x0, y0), far(x1, y0), [x1, y0], [x0, y0]]); ctx.fill();
    ctx.fillStyle = g(c.floor, 0, H, 0, y1); A.poly(ctx, [far(x0, y1), far(x1, y1), [x1, y1], [x0, y1]]); ctx.fill();
    ctx.fillStyle = g(c.left, 0, 0, x0, 0); A.poly(ctx, [far(x0, y0), [x0, y0], [x0, y1], far(x0, y1)]); ctx.fill();
    ctx.fillStyle = g(c.right, W, 0, x1, 0); A.poly(ctx, [far(x1, y0), [x1, y0], [x1, y1], far(x1, y1)]); ctx.fill();
    ctx.fillStyle = g(c.wall, 0, y0, 0, y1); ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
  };
  /* 깊이 방향으로 고르게(세계 기준) 나뉜 s 값들 */
  A.depths = function (s0, s1, n) {
    const z0 = 1 / s0, z1 = 1 / s1, out = [];
    for (let i = 0; i <= n; i++) out.push(1 / A.lerp(z0, z1, i / n));
    return out;
  };
  /* 바닥 격자: 칸마다 fn(ctx, [4점], i, j) */
  A.floorGrid = function (ctx, P, u0, u1, s0, s1, cols, rows, fn, v = 1) {
    const ss = A.depths(s0, s1, rows);
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const ua = A.lerp(u0, u1, i / cols), ub = A.lerp(u0, u1, (i + 1) / cols);
      fn(ctx, [P.at(ua, v, ss[j]), P.at(ub, v, ss[j]), P.at(ub, v, ss[j + 1]), P.at(ua, v, ss[j + 1])], i, j);
    }
  };
  /* 3차원 상자 (u0~u1, v0(위)~v1(아래), s0(먼)~s1(가까운)) */
  A.box3 = function (ctx, P, u0, u1, v0, v1, s0, s1, c) {
    const [vx, vy] = P.vp;
    const f = (u, v) => P.at(u, v, s1), b = (u, v) => P.at(u, v, s0);
    const top = f(u0, v0)[1], bot = f(u0, v1)[1];
    if (top > vy) A.poly(ctx, [f(u0, v0), f(u1, v0), b(u1, v0), b(u0, v0)], c.top || c.side);
    else if (bot < vy) A.poly(ctx, [f(u0, v1), f(u1, v1), b(u1, v1), b(u0, v1)], c.bottom || c.side);
    if (f(u0, v0)[0] > vx) A.poly(ctx, [f(u0, v0), b(u0, v0), b(u0, v1), f(u0, v1)], c.side);
    if (f(u1, v0)[0] < vx) A.poly(ctx, [f(u1, v0), b(u1, v0), b(u1, v1), f(u1, v1)], c.side2 || c.side);
    if (c.front !== null) A.poly(ctx, [f(u0, v0), f(u1, v0), f(u1, v1), f(u0, v1)], c.front);
  };
  /* 벽에 붙은 사각형(u0~u1, v0~v1) — 뒷벽이면 s=1, 옆벽이면 wall: 'L'|'R' 와 s 범위 */
  A.wallRect = function (ctx, P, wall, a0, a1, v0, v1, fill) {
    if (wall === 'B') { const p = P.at(a0, v0), q = P.at(a1, v1); A.poly(ctx, [p, [q[0], p[1]], q, [p[0], q[1]]], fill); return; }
    const u = wall === 'L' ? 0 : 1;
    A.poly(ctx, [P.at(u, v0, a0), P.at(u, v0, a1), P.at(u, v1, a1), P.at(u, v1, a0)], fill);
  };
  /* 샹들리에 */
  A.chandelier = function (ctx, x, y, s, r, o = {}) {
    const c = o.color || '#1a1510', lit = o.lit !== false, lc = o.light || '#ffd9a0';
    A.line(ctx, x, y - 400 * s, x, y - 40 * s, c, 3 * s);
    for (const [ry, rw, n] of [[0, 150, 9], [46, 100, 7], [-40, 70, 5]]) {
      ctx.strokeStyle = A.rgba(c); ctx.lineWidth = 5 * s;
      ctx.beginPath(); ctx.ellipse(x, y + ry * s, rw * s, rw * 0.22 * s, 0, 0, Math.PI); ctx.stroke();
      for (let i = 0; i < n; i++) {
        const a = Math.PI * (i + 0.5) / n, bx = x + Math.cos(a) * rw * s, by = y + ry * s + Math.sin(a) * rw * 0.22 * s;
        A.rect(ctx, bx - 3 * s, by - 16 * s, 6 * s, 16 * s, lit ? '#f5e9d0' : c);
        if (lit) { A.glow(ctx, bx, by - 20 * s, 40 * s, lc, 0.6); if (r() < 0.5) A.mark(bx, by - 20 * s, 20 * s, lc, 'candle'); }
        // 수정 방울
        for (let k = 1; k <= 3; k++) { ctx.fillStyle = A.rgba(lit ? '#fff5e0' : '#8a8a8a', 0.8); ctx.beginPath(); ctx.arc(bx, by + k * 9 * s, 2.2 * s, 0, Math.PI * 2); ctx.fill(); }
      }
      for (let i = 0; i <= 6; i++) A.line(ctx, x, y - 40 * s, x + (i - 3) * rw * s / 3, y + ry * s, c, 1.4 * s, 0.8);
    }
    A.poly(ctx, [[x - 18 * s, y - 50 * s], [x + 18 * s, y - 50 * s], [x + 8 * s, y + 90 * s], [x - 8 * s, y + 90 * s]], c);
    if (lit) A.light(ctx, x, y + 10 * s, { r: 260 * s, color: lc, kind: 'chandelier', core: false });
  };
  /* 창문: 바깥 풍경을 그리는 view(ctx) 를 창 안쪽에 오려 그리고 창살을 얹는다 */
  A.window = function (ctx, x, y, w, h, view, o = {}) {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); view(ctx, x, y, w, h); ctx.restore();
    const fc = o.frame || '#1a1612', t = o.t || 10;
    A.rect(ctx, x - t, y - t, w + t * 2, t, fc); A.rect(ctx, x - t, y + h, w + t * 2, t * 1.6, fc);
    A.rect(ctx, x - t, y, t, h, fc); A.rect(ctx, x + w, y, t, h, fc);
    const cols = o.cols || 2, rows = o.rows || 3;
    for (let i = 1; i < cols; i++) A.rect(ctx, x + w * i / cols - t * 0.3, y, t * 0.6, h, fc);
    for (let j = 1; j < rows; j++) A.rect(ctx, x, y + h * j / rows - t * 0.3, w, t * 0.6, fc);
  };
  /* 먼 크레인들 (창밖 풍경용) */
  A.craneRow = function (ctx, x0, x1, yb, s, color, r, o = {}) {
    const n = o.n || 4;
    for (let i = 0; i < n; i++) {
      const x = A.lerp(x0, x1, (i + 0.5) / n) + (r() - 0.5) * 30;
      A.crane(ctx, x, yb, s * (0.85 + r() * 0.3), { color, jib: -0.3 - r() * 0.7, dir: r() < 0.5 ? -1 : 1 });
    }
  };
  /* 널빤지 바닥 */
  A.planks = function (ctx, P, u0, u1, s0, s1, n, c, r, o = {}) {
    for (let i = 0; i < n; i++) {
      const ua = A.lerp(u0, u1, i / n), ub = A.lerp(u0, u1, (i + 1) / n);
      const k = 0.88 + r() * 0.24;
      A.poly(ctx, [P.at(ua, 1, s0), P.at(ub, 1, s0), P.at(ub, 1, s1), P.at(ua, 1, s1)], A.shade(c, k));
      A.poly(ctx, [P.at(ua, 1, s0), P.at(ua + (ub - ua) * 0.04, 1, s0), P.at(ua + (ub - ua) * 0.04, 1, s1), P.at(ua, 1, s1)], A.shade(c, 0.55));
      // 이음매
      const ss = A.depths(s0, s1, 7);
      for (let j = 1; j < 7; j++) if (r() < 0.22) { const s = ss[j] * (0.97 + r() * 0.06); A.poly(ctx, [P.at(ua, 1, s), P.at(ub, 1, s), P.at(ub, 1, s * 1.004), P.at(ua, 1, s * 1.004)], A.shade(c, 0.5)); }
    }
    if (o.sheen) A.pool(ctx, o.sheen[0], o.sheen[1], o.sheen[2], o.sheen[2] * 0.2, o.sheenC || '#ffffff', o.sheenA || 0.12);
  };
  /* 흩날리는 먼지 알갱이 (빛기둥 안) */
  A.motes = function (ctx, pts, n, r, color, a = 0.5) {
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const minx = Math.min(...xs), maxx = Math.max(...xs), miny = Math.min(...ys), maxy = Math.max(...ys);
    ctx.save(); A.poly(ctx, pts); ctx.clip();
    for (let i = 0; i < n; i++) { ctx.fillStyle = A.rgba(color, a * r()); const s = 0.8 + r() * 1.8; ctx.fillRect(A.lerp(minx, maxx, r()), A.lerp(miny, maxy, r()), s, s); }
    ctx.restore();
  };
  /* 벽의 세로 줄무늬 벽지 */
  A.stripesBack = function (ctx, P, n, c1, c2, v0 = 0, v1 = 1) {
    for (let i = 0; i < n; i++) A.wallRect(ctx, P, 'B', i / n, (i + 0.5) / n, v0, v1, i % 2 ? c1 : c2);
  };
  A.stripesSide = function (ctx, P, wall, s0, s1, n, c, v0 = 0, v1 = 1) {
    const ss = A.depths(s0, s1, n * 2);
    for (let i = 0; i < n * 2; i += 2) A.wallRect(ctx, P, wall, ss[i], ss[i + 1], v0, v1, c);
  };

  /* ───────── 레테 무도장 · 7호실 ─────────
   * 금 간 거울, 발 달린 욕조, 립스틱 글씨, 축음기, 흐트러진 침대, 창밖의 크레인(낮) / 붉은 네온(밤),
   * 샹들리에에 걸린 구두 한 짝.
   */
  S.room = function (ctx, W, H, r, v) {
    const N = !!v.night;
    const P = A.space([820, 560], [470, 250, 1250, 760]);
    const C = N ? { wall: '#1a1a2a', wall2: '#221d2e', floor: '#140f12', ceil: '#0c0b12', wood: '#2a1a14', dark: '#07070b', line: '#0e0c14' }
      : { wall: '#7f8b7c', wall2: '#8f9a88', floor: '#5a3f2e', ceil: '#9aa092', wood: '#6a4630', dark: '#2b2622', line: '#6a7465' };
    A.roomBox(ctx, P, W, H, {
      ceil: [A.shade(C.ceil, 0.7), C.ceil], floor: [A.shade(C.floor, 0.6), C.floor],
      left: [A.shade(C.wall, 0.62), A.shade(C.wall, 0.9)], right: [A.shade(C.wall, 0.55), A.shade(C.wall, 0.85)], wall: [C.wall, A.shade(C.wall, 0.9)],
    });
    // 벽지 줄무늬 + 걸레받이 + 몰딩
    A.stripesBack(ctx, P, 26, C.wall, C.wall2, 0.02, 0.92);
    A.stripesSide(ctx, P, 'L', 1, 3.2, 9, A.shade(C.wall2, 0.72), 0.02, 0.92);
    A.stripesSide(ctx, P, 'R', 1, 3.2, 9, A.shade(C.wall2, 0.66), 0.02, 0.92);
    A.wallRect(ctx, P, 'B', 0, 1, 0.92, 1, A.shade(C.wood, 0.8));
    A.wallRect(ctx, P, 'L', 1, 4, 0.92, 1, A.shade(C.wood, 0.6));
    A.wallRect(ctx, P, 'R', 1, 4, 0.92, 1, A.shade(C.wood, 0.55));
    A.wallRect(ctx, P, 'B', 0, 1, 0, 0.025, A.shade(C.ceil, 0.8));
    // 바닥 널빤지
    A.planks(ctx, P, -0.9, 1.9, 1, 2.4, 44, C.wood, r);
    // 얼룩 (물 자국)
    ctx.save(); ctx.globalAlpha = 0.25; A.clouds(ctx, W, H, { y0: 260, y1: 560, color: N ? '#000000' : '#4f5a4c', a: 0.5, scale: 90, stretch: 1, seed: 31 }); ctx.restore();

    // 창문 (뒷벽 왼쪽)
    const wp = P.at(0.14, 0.18), wq = P.at(0.44, 0.7);
    const view = (c, x, y, w, h) => {
      if (N) {
        A.vgrad(c, x, y, w, h + y, [[0, '#070a14'], [1, '#1c1420']]);
        A.shore(c, W, y + h * 0.75, 20, '#0b0e14', r, { lights: 30 });
        A.craneRow(c, x - 40, x + w + 40, y + h * 0.9, 0.42, '#06070a', r, { n: 3 });
        // 네온 빛이 창을 가득 붉게
        c.save(); c.globalCompositeOperation = 'lighter';
        c.fillStyle = A.lineGrad(c, x, 0, x + w, 0, [[0, '#ff2f5a', 0.35], [1, '#ff2f5a', 0.1]]); c.fillRect(x, y, w, h);
        c.restore();
      } else {
        A.vgrad(c, x, y, w, y + h, [[0, '#c9ccc4'], [1, '#e8e2d0']]);
        A.shore(c, W, y + h * 0.78, 18, '#a7aca4', r, {});
        A.vgrad(c, x, y + h * 0.78, w, y + h, [[0, '#a9b1ab'], [1, '#8e9893']]);
        A.craneRow(c, x - 40, x + w + 60, y + h * 0.88, 0.45, '#7a4032', r, { n: 3 });
      }
    };
    A.window(ctx, wp[0], wp[1], wq[0] - wp[0], wq[1] - wp[1], view, { frame: N ? '#0d0a0e' : '#e3ddcf', t: 12, cols: 2, rows: 3 });
    // 커튼
    for (const [x, dir] of [[wp[0] - 44, 1], [wq[0] + 8, -1]]) {
      const pts = [[x, wp[1] - 30], [x + 44, wp[1] - 30]];
      for (let y = wp[1] - 30; y <= wq[1] + 60; y += 30) pts.push([x + 40 + Math.sin(y * 0.05) * 5, y]);
      pts.push([x + 4, wq[1] + 60]);
      for (let y = wq[1] + 60; y >= wp[1] - 30; y -= 30) pts.push([x + Math.sin(y * 0.05 + 1) * 4, y]);
      A.poly(ctx, pts, N ? '#3a0e18' : '#8a3a3a');
      for (let k = 1; k < 4; k++) A.rect(ctx, x + k * 11, wp[1] - 30, 2, wq[1] - wp[1] + 90, N ? '#24070e' : '#6a2828', 0.7);
      void dir;
    }
    A.rect(ctx, wp[0] - 60, wp[1] - 38, wq[0] - wp[0] + 120, 8, N ? '#140e0c' : '#5c4636');
    // 창에서 들어오는 빛: 바닥의 창살 그림자
    const lc = N ? '#ff2f5a' : '#fff6e0';
    const fl = (u, s) => P.at(u, 1, s);
    A.shaft(ctx, [wp, [wq[0], wp[1]], fl(0.7, 1.9), fl(0.2, 1.9)], lc, N ? 0.16 : 0.12, 0.02, 0, wp[1], 0, H);
    for (let k = 0; k < 2; k++) for (let j = 0; j < 3; j++) {
      const a = fl(0.22 + k * 0.24, 1.35 + j * 0.2), b = fl(0.43 + k * 0.24, 1.35 + j * 0.2), c = fl(0.43 + k * 0.24, 1.53 + j * 0.2), d = fl(0.22 + k * 0.24, 1.53 + j * 0.2);
      A.shaft(ctx, [a, b, c, d], lc, N ? 0.2 : 0.16, N ? 0.2 : 0.16, 0, 0, 0, H);
    }
    if (!N) A.motes(ctx, [wp, [wq[0], wp[1]], fl(0.7, 1.9), fl(0.2, 1.9)], 260, r, '#fff7e8', 0.6);
    if (N) { A.glow(ctx, (wp[0] + wq[0]) / 2, (wp[1] + wq[1]) / 2, 360, '#ff2f5a', 0.22); A.mark((wp[0] + wq[0]) / 2, (wp[1] + wq[1]) / 2, 200, '#ff2f5a', 'neon'); }
    // 천장의 붉은 번짐 (밤)
    if (N) A.pool(ctx, 820, 150, 520, 120, '#ff2f5a', 0.18);

    // 립스틱 글씨 (뒷벽 오른쪽)
    ctx.save();
    ctx.strokeStyle = A.rgba(N ? '#c0304a' : '#b3243a', 0.85); ctx.lineWidth = 5; ctx.lineCap = 'round';
    const lx = P.at(0.66, 0.2)[0], ly = P.at(0.66, 0.2)[1];
    ctx.font = '700 54px "Song Myung", "Nanum Myeongjo", serif';
    ctx.fillStyle = A.rgba(N ? '#c0304a' : '#b3243a', 0.85);
    ctx.save(); ctx.translate(lx, ly); ctx.rotate(-0.06); ctx.fillText('잊지 마', 0, 0); ctx.restore();
    ctx.beginPath(); ctx.moveTo(lx - 10, ly + 30); ctx.bezierCurveTo(lx + 60, ly + 60, lx + 140, ly + 18, lx + 210, ly + 40); ctx.stroke();
    ctx.restore();

    // 금 간 거울 (왼쪽 벽)
    const m0 = P.at(0, 0.2, 1.35), m1 = P.at(0, 0.2, 1.75), m2 = P.at(0, 0.72, 1.75), m3 = P.at(0, 0.72, 1.35);
    A.poly(ctx, [m0, m1, m2, m3], N ? '#2a2020' : '#6a5a40');
    const inset = (p, q, t) => [A.lerp(p[0], q[0], t), A.lerp(p[1], q[1], t)];
    const g0 = inset(m0, m2, 0.08), g2 = inset(m2, m0, 0.08), g1 = inset(m1, m3, 0.08), g3 = inset(m3, m1, 0.08);
    A.poly(ctx, [g0, g1, g2, g3], N ? '#2b2a3c' : '#b7c1bd');
    ctx.save(); A.poly(ctx, [g0, g1, g2, g3]); ctx.clip();
    ctx.fillStyle = A.lineGrad(ctx, g0[0], g0[1], g2[0], g2[1], [[0, '#ffffff', N ? 0.05 : 0.35], [0.5, '#ffffff', 0], [1, '#ffffff', N ? 0.08 : 0.2]]); ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = A.rgba(N ? '#8a8aa0' : '#f4f6f4', 0.8); ctx.lineWidth = 1.5;
    const cx = A.lerp(g0[0], g2[0], 0.45), cy = A.lerp(g0[1], g2[1], 0.4);
    for (let i = 0; i < 9; i++) { const a = r() * Math.PI * 2, l = 40 + r() * 140; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * l * 0.5 + (r() - 0.5) * 20, cy + Math.sin(a) * l * 0.5); ctx.lineTo(cx + Math.cos(a) * l, cy + Math.sin(a) * l); ctx.stroke(); }
    ctx.restore();

    // 발 달린 욕조 (왼쪽 앞)
    const tb = (u, v, s) => P.at(u, v, s);
    const t0 = tb(-0.28, 0.66, 2.05), t1 = tb(0.1, 0.66, 2.05);
    ctx.fillStyle = A.rgba(N ? '#1a1c26' : '#e7e2d6');
    ctx.beginPath(); ctx.moveTo(t0[0] - 20, t0[1]); ctx.lineTo(t1[0] + 20, t1[1]);
    ctx.quadraticCurveTo(t1[0] + 10, t1[1] + 170, t1[0] - 60, t1[1] + 180); ctx.lineTo(t0[0] + 40, t0[1] + 180); ctx.quadraticCurveTo(t0[0] - 20, t0[1] + 160, t0[0] - 20, t0[1]); ctx.fill();
    ctx.fillStyle = A.rgba(N ? '#0c0d14' : '#9a9588'); ctx.beginPath(); ctx.ellipse((t0[0] + t1[0]) / 2, t0[1] + 4, (t1[0] - t0[0]) / 2 + 12, 22, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = A.rgba(N ? '#2a2c3a' : '#f7f4ec'); ctx.beginPath(); ctx.ellipse((t0[0] + t1[0]) / 2, t0[1] - 2, (t1[0] - t0[0]) / 2 + 22, 16, 0, Math.PI, 0); ctx.fill();
    for (const fx of [t0[0] + 30, t1[0] - 70]) { A.poly(ctx, [[fx, t1[1] + 176], [fx + 26, t1[1] + 176], [fx + 34, t1[1] + 214], [fx - 6, t1[1] + 214]], N ? '#0a0a0e' : '#6a5a3a'); }
    // 수도꼭지
    A.rect(ctx, t0[0] - 6, t0[1] - 50, 8, 50, N ? '#3a3a40' : '#b39a5a'); A.rect(ctx, t0[0] - 6, t0[1] - 52, 34, 8, N ? '#3a3a40' : '#b39a5a');

    // 축음기 (창 오른쪽 작은 탁자)
    A.box3(ctx, P, 0.5, 0.64, 0.66, 1, 1.02, 1.18, { front: A.shade(C.wood, 0.8), top: A.shade(C.wood, 1.2), side: A.shade(C.wood, 0.55) });
    A.box3(ctx, P, 0.52, 0.62, 0.6, 0.66, 1.06, 1.15, { front: A.shade(C.wood, 0.5), top: A.shade(C.wood, 0.9), side: A.shade(C.wood, 0.4) });
    const hb = P.at(0.58, 0.6, 1.1);
    const brass = N ? '#5a4020' : '#c99a45', brassD = N ? '#2a1a0a' : '#7a5a25';
    ctx.strokeStyle = A.rgba(brass); ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(hb[0], hb[1]); ctx.quadraticCurveTo(hb[0] - 6, hb[1] - 50, hb[0] + 26, hb[1] - 84); ctx.stroke();
    ctx.fillStyle = A.rgba(brass);
    ctx.beginPath(); ctx.moveTo(hb[0] + 22, hb[1] - 80); ctx.quadraticCurveTo(hb[0] + 50, hb[1] - 104, hb[0] + 64, hb[1] - 168);
    ctx.lineTo(hb[0] + 128, hb[1] - 110); ctx.quadraticCurveTo(hb[0] + 70, hb[1] - 102, hb[0] + 30, hb[1] - 74); ctx.closePath(); ctx.fill();
    ctx.fillStyle = A.rgba(brassD); ctx.beginPath(); ctx.ellipse(hb[0] + 96, hb[1] - 139, 42, 17, -0.72, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = A.rgba(A.shade(brassD, 0.5)); ctx.beginPath(); ctx.ellipse(hb[0] + 94, hb[1] - 137, 26, 9, -0.72, 0, Math.PI * 2); ctx.fill();
    // 레코드판
    const rp = P.at(0.57, 0.6, 1.12);
    ctx.fillStyle = A.rgba('#0a0a0a'); ctx.beginPath(); ctx.ellipse(rp[0] - 16, rp[1] - 2, 30, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = A.rgba(N ? '#6a2030' : '#c43a3a'); ctx.beginPath(); ctx.ellipse(rp[0] - 16, rp[1] - 2, 8, 2, 0, 0, Math.PI * 2); ctx.fill();

    // 침대 (오른쪽): 머리판 → 틀 → 매트리스 → 베개 → 이불
    A.box3(ctx, P, 0.66, 1.04, 0.46, 0.8, 1.06, 1.1, { front: A.shade(C.wood, 0.55), top: A.shade(C.wood, 0.9), side: A.shade(C.wood, 0.4) });
    for (let i = 1; i < 6; i++) A.wallRect(ctx, P, 'B', 0.66 + i * 0.063, 0.672 + i * 0.063, 0.5, 0.78, A.shade(C.wood, 0.4));
    A.box3(ctx, P, 0.68, 1.02, 0.84, 1, 1.1, 1.85, { front: A.shade(C.wood, 0.6), top: A.shade(C.wood, 0.8), side: A.shade(C.wood, 0.45) });
    A.box3(ctx, P, 0.69, 1.01, 0.76, 0.84, 1.1, 1.83, { front: N ? '#2e2a3c' : '#d9d2c4', top: N ? '#3e3a52' : '#f1ece2', side: N ? '#26223a' : '#c9c1b2' });
    const pl = P.at(0.73, 0.76, 1.16), pr = P.at(0.98, 0.76, 1.16);
    ctx.fillStyle = A.rgba(N ? '#4a4660' : '#faf6ee'); ctx.beginPath(); ctx.ellipse((pl[0] + pr[0]) / 2, pl[1] - 6, (pr[0] - pl[0]) / 2, 22, 0.02, 0, Math.PI * 2); ctx.fill();
    const q0 = P.at(0.66, 0.76, 1.35), q1 = P.at(1.05, 0.76, 1.84);
    ctx.fillStyle = A.rgba(N ? '#4a1e2c' : '#9a4a42');
    ctx.beginPath(); ctx.moveTo(q0[0] - 10, q0[1]); ctx.bezierCurveTo(q0[0] + 120, q0[1] - 30, q1[0] - 160, q1[1] - 50, q1[0] + 10, q1[1] - 6);
    ctx.lineTo(q1[0] + 30, q1[1] + 150); ctx.bezierCurveTo(q1[0] - 90, q1[1] + 110, q0[0] + 20, q0[1] + 120, q0[0] - 40, q0[1] + 150); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = A.rgba(N ? '#2a0e18' : '#7a3a34'); ctx.lineWidth = 3;
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(q0[0] + 40 + i * 70, q0[1] + 30 + i * 20); ctx.quadraticCurveTo(q0[0] + 90 + i * 70, q0[1] + 70 + i * 26, q0[0] + 60 + i * 76, q0[1] + 130 + i * 20); ctx.stroke(); }

    // 바닥의 빈 병과 셔츠
    const bt = P.at(0.36, 1, 1.75);
    A.poly(ctx, [[bt[0], bt[1]], [bt[0] + 70, bt[1] - 12], [bt[0] + 74, bt[1] - 2], [bt[0] + 4, bt[1] + 10]], N ? '#1c3a2a' : '#3f6a4a');
    A.poly(ctx, [[bt[0] + 70, bt[1] - 10], [bt[0] + 96, bt[1] - 14], [bt[0] + 97, bt[1] - 8], [bt[0] + 72, bt[1] - 3]], N ? '#1c3a2a' : '#3f6a4a');
    const sh = P.at(0.52, 1, 2.05);
    ctx.fillStyle = A.rgba(N ? '#26344a' : '#4f8a8a');
    ctx.beginPath(); ctx.moveTo(sh[0] - 80, sh[1]); ctx.bezierCurveTo(sh[0] - 30, sh[1] - 40, sh[0] + 60, sh[1] - 30, sh[0] + 120, sh[1] - 8); ctx.bezierCurveTo(sh[0] + 90, sh[1] + 30, sh[0] - 40, sh[1] + 40, sh[0] - 80, sh[1]); ctx.fill();
    for (let i = 0; i < 12; i++) { ctx.fillStyle = A.rgba(N ? '#8a5a3a' : '#e8b44a', 0.8); ctx.beginPath(); ctx.arc(sh[0] - 50 + r() * 150, sh[1] - 20 + r() * 40, 5, 0, Math.PI * 2); ctx.fill(); }

    // 샹들리에와 걸린 구두
    const cp = P.at(0.52, 0.03, 1.55);
    A.chandelier(ctx, cp[0], cp[1] + 150, 0.72, r, { lit: false, color: N ? '#0a080c' : '#3a3024' });
    const shoeX = cp[0] + 70, shoeY = cp[1] + 200;
    A.line(ctx, cp[0] + 64, cp[1] + 158, shoeX, shoeY, N ? '#0a080c' : '#3a3024', 1.5);
    ctx.save(); ctx.translate(shoeX, shoeY); ctx.rotate(0.35);
    ctx.fillStyle = A.rgba(N ? '#c8c0c8' : '#f3eee4'); ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(10, 0); ctx.lineTo(12, 40); ctx.quadraticCurveTo(40, 44, 44, 58); ctx.lineTo(-10, 60); ctx.closePath(); ctx.fill();
    ctx.fillStyle = A.rgba(N ? '#3a1a1a' : '#6a3a22'); ctx.beginPath(); ctx.moveTo(20, 44); ctx.quadraticCurveTo(40, 44, 44, 58); ctx.lineTo(18, 60); ctx.closePath(); ctx.fill();
    A.rect(ctx, -10, 56, 54, 6, '#1a1210');
    ctx.restore();

    // 앞쪽 어둠 (가장자리)
    A.vgrad(ctx, 0, 820, W, H, [[0, '#000000', 0], [1, '#000000', 0.45]]);
    if (!N) { A.glow(ctx, 520, 460, 600, '#fff4dc', 0.08, 'screen'); }
  };
  S.room.focus = 0.35;

  /* 춤추는 한 쌍 (탱고 포옹) */
  A.couple = function (ctx, x, yb, h, o = {}) {
    const c = o.color || '#08070a';
    ctx.save();
    ctx.translate(x, yb);
    const k = h / 100;
    const man = A.figurePath({ pose: 'reach', hat: o.manHat || null, body: 'jacket' });
    const wom = A.figurePath({ pose: 'reach', hat: o.womHat || 'bun', body: 'dress', build: 'woman' });
    const draw = (parts, dx, flip, sc, rot, rim) => {
      ctx.save(); ctx.translate(dx * k, 0); ctx.rotate(rot || 0); ctx.scale((flip ? -1 : 1) * k * sc, k * sc);
      if (rim) { ctx.save(); ctx.translate(flip ? -1.4 : 1.4, -0.4); ctx.fillStyle = A.rgba(rim, 0.85); for (const q of parts) ctx.fill(q); ctx.restore(); }
      ctx.fillStyle = A.rgba(c); for (const q of parts) ctx.fill(q);
      ctx.restore();
    };
    draw(man, -7, false, 1, -0.05, o.rim);
    draw(wom, 7, true, 0.93, 0.08, o.rim);
    // 들어 올린 다리 (간초)
    if (o.leg) {
      ctx.save(); ctx.translate(12 * k, -30 * k); ctx.rotate(-1.1);
      ctx.fillStyle = A.rgba(c); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(3.6 * k, 0); ctx.lineTo(3 * k, 30 * k); ctx.lineTo(4.4 * k, 33 * k); ctx.lineTo(0.8 * k, 33 * k); ctx.lineTo(0.6 * k, 30 * k); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  };
  /* 동그란 탁자와 의자 (의자를 뒤집어 올려놓을 수 있다) */
  A.cafeTable = function (ctx, x, yb, s, c, up) {
    A.rect(ctx, x - 3 * s, yb - 70 * s, 6 * s, 70 * s, c);
    ctx.fillStyle = A.rgba(c); ctx.beginPath(); ctx.ellipse(x, yb - 2 * s, 22 * s, 5 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x, yb - 72 * s, 44 * s, 10 * s, 0, 0, Math.PI * 2); ctx.fill();
    const chair = (cx, cy, flip) => {
      ctx.save(); ctx.translate(cx, cy); if (flip) ctx.scale(1, -1);
      ctx.strokeStyle = A.rgba(c); ctx.lineWidth = 3.2 * s; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-16 * s, 0); ctx.lineTo(-14 * s, -44 * s); ctx.moveTo(16 * s, 0); ctx.lineTo(14 * s, -44 * s);
      ctx.moveTo(-18 * s, -44 * s); ctx.lineTo(18 * s, -44 * s);
      ctx.moveTo(-14 * s, -44 * s); ctx.lineTo(-13 * s, -88 * s); ctx.moveTo(14 * s, -44 * s); ctx.lineTo(13 * s, -88 * s);
      ctx.moveTo(-13 * s, -88 * s); ctx.quadraticCurveTo(0, -96 * s, 13 * s, -88 * s);
      ctx.moveTo(-13 * s, -70 * s); ctx.lineTo(13 * s, -70 * s);
      ctx.stroke(); ctx.restore();
    };
    if (up) { chair(x - 20 * s, yb - 76 * s - 44 * s, true); chair(x + 22 * s, yb - 76 * s - 44 * s, true); }
    else { chair(x - 50 * s, yb, false); chair(x + 52 * s, yb, false); }
  };

  /* ───────── 레테 무도장 ─────────
   * 체크무늬 대리석 바닥, 가운데 분수, 무대와 붉은 막, 반도네온 노인, 왼쪽 벽의 바, 오른쪽 높은 창, 샹들리에.
   * 낮: 뒤집힌 의자와 먼지 빛기둥. 밤: 연기, 춤추는 사람들.
   */
  S.hall = function (ctx, W, H, r, v) {
    const N = !!v.night;
    const P = A.space([780, 470], [330, 150, 1230, 640]);
    const C = N ? { wall: '#2a1418', wall2: '#321a1e', trim: '#6a4a24', floorA: '#1a1416', floorB: '#3a3034', ceil: '#140a0c', dark: '#07050a', gold: '#d9a44a', fig: '#060507' }
      : { wall: '#8a5a4a', wall2: '#946252', trim: '#b08a4a', floorA: '#3e3430', floorB: '#a89e8c', ceil: '#6a4a3e', dark: '#2a1e1a', gold: '#d6b06a', fig: '#1c1614' };
    A.roomBox(ctx, P, W, H, {
      ceil: [A.shade(C.ceil, 0.6), C.ceil], floor: C.floorA,
      left: [A.shade(C.wall, 0.55), A.shade(C.wall, 0.85)], right: [A.shade(C.wall, 0.6), A.shade(C.wall, 0.9)], wall: [C.wall, A.shade(C.wall, 0.8)],
    });
    // 벽 장식: 벽기둥과 금색 몰딩
    for (const u of [0.02, 0.98]) A.wallRect(ctx, P, 'B', u - 0.02, u + 0.02, 0, 1, A.shade(C.wall, 0.75));
    A.wallRect(ctx, P, 'B', 0, 1, 0.06, 0.075, C.trim);
    A.stripesSide(ctx, P, 'L', 1, 3.4, 6, A.shade(C.wall2, 0.7), 0.08, 1);
    A.stripesSide(ctx, P, 'R', 1, 3.4, 6, A.shade(C.wall2, 0.75), 0.08, 1);
    const ss = A.depths(1, 3.4, 6);
    for (const sv of ss) { A.wallRect(ctx, P, 'L', sv, sv * 1.02, 0.02, 1, A.shade(C.trim, 0.6)); A.wallRect(ctx, P, 'R', sv, sv * 1.02, 0.02, 1, A.shade(C.trim, 0.6)); }
    // 오른쪽 높은 아치 창
    const winS = [[1.12, 1.38], [1.62, 2.0], [2.35, 2.95]];
    for (const [s0, s1] of winS) {
      A.wallRect(ctx, P, 'R', s0, s1, 0.08, 0.5, N ? '#0a0c16' : '#e9e2cc');
      A.wallRect(ctx, P, 'R', (s0 + s1) / 2, (s0 + s1) / 2 * 1.01, 0.08, 0.5, A.shade(C.trim, 0.5));
      A.wallRect(ctx, P, 'R', s0, s1, 0.28, 0.29, A.shade(C.trim, 0.5));
      if (!N) {
        const a = P.at(1, 0.08, s0), b = P.at(1, 0.08, s1), c = P.at(1, 0.5, s1), d = P.at(1, 0.5, s0);
        const fa = P.at(0.2, 1, s0 * 1.25), fb = P.at(0.2, 1, s1 * 1.35);
        A.shaft(ctx, [a, b, c, fb, fa, d], '#fff1d0', 0.2, 0.03, a[0], 0, fa[0], 0);
        A.motes(ctx, [a, b, fb, fa], 140, r, '#fff6e0', 0.7);
      }
    }
    // 무대: 붉은 막
    const st0 = P.at(0.2, 0.04), st1 = P.at(0.8, 0.86);
    A.rect(ctx, st0[0], st0[1], st1[0] - st0[0], st1[1] - st0[1], N ? '#5a0e16' : '#7a2226');
    for (let i = 0; i < 18; i++) {
      const x = A.lerp(st0[0], st1[0], i / 18);
      ctx.fillStyle = A.lineGrad(ctx, x, 0, x + (st1[0] - st0[0]) / 18, 0, [[0, '#000000', 0.35], [0.5, '#ffffff', N ? 0.06 : 0.1], [1, '#000000', 0.35]]);
      ctx.fillRect(x, st0[1], (st1[0] - st0[0]) / 18, st1[1] - st0[1]);
    }
    // 막 걷어 묶은 부분
    for (const side of [0, 1]) {
      const x = side ? st1[0] : st0[0], dir = side ? -1 : 1;
      A.poly(ctx, [[x, st0[1]], [x + dir * 110, st0[1]], [x + dir * 30, st1[1] - 180], [x + dir * 50, st1[1]], [x, st1[1]]], N ? '#3a070d' : '#5a141a');
    }
    A.rect(ctx, st0[0] - 20, st0[1] - 10, st1[0] - st0[0] + 40, 34, C.trim);
    for (let i = 0; i < 12; i++) { ctx.fillStyle = A.rgba(A.shade(C.trim, 0.7)); ctx.beginPath(); ctx.arc(A.lerp(st0[0], st1[0], (i + 0.5) / 12), st0[1] + 24, 16, 0, Math.PI); ctx.fill(); }
    // 무대 바닥
    A.box3(ctx, P, 0.16, 0.84, 0.86, 1, 1, 1.14, { front: A.shade(C.trim, 0.45), top: N ? '#3a2418' : '#6a4a2e', side: A.shade(C.trim, 0.35) });
    // 반도네온 노인 (밤에는 연주, 낮에는 빈 의자와 악기)
    const pk = P.at(0.36, 0.86, 1.07);
    if (N) {
      A.figure(ctx, pk[0], pk[1] + 4, { h: 150, pose: 'sit', color: C.fig, hat: 'fedora', rim: '#ffb05a', rimDir: 1 });
      A.rect(ctx, pk[0] - 30, pk[1] - 70, 60, 22, '#1a1210'); for (let i = 0; i < 6; i++) A.rect(ctx, pk[0] - 26 + i * 10, pk[1] - 68, 4, 18, '#3a2a20');
      A.cone(ctx, pk[0], st0[1] - 60, Math.PI / 2, 0.18, 520, '#ffd08a', 0.22);
      A.pool(ctx, pk[0], pk[1] + 6, 120, 20, '#ffd08a', 0.4);
    } else {
      A.cafeTable(ctx, pk[0] - 90, pk[1] + 4, 0.6, C.dark, false);
      A.rect(ctx, pk[0] - 20, pk[1] - 50, 40, 26, '#2a1a14');
    }
    // 바닥: 체크무늬 대리석
    A.floorGrid(ctx, P, -1.5, 2.5, 1.14, 4.2, 24, 16, (c, q, i, j) => {
      const light = (i + j) % 2 === 0;
      A.poly(c, q, light ? C.floorB : C.floorA);
    });
    A.box3(ctx, P, 0.16, 0.84, 0.86, 1, 1, 1.14, { front: A.shade(C.trim, 0.45), top: null, side: A.shade(C.trim, 0.35) });
    // 바닥 반사 광택
    ctx.save(); ctx.globalCompositeOperation = N ? 'lighter' : 'source-over';
    A.pool(ctx, 760, 820, 700, 170, N ? '#ffb46a' : '#ffffff', N ? 0.16 : 0.1);
    ctx.restore();

    // 왼쪽 벽: 바
    const barFront = [P.at(0.02, 0.8, 1.2), P.at(0.02, 0.8, 2.6), P.at(0.02, 1, 2.6), P.at(0.02, 1, 1.2)];
    // 선반과 병
    A.wallRect(ctx, P, 'L', 1.15, 2.7, 0.3, 0.72, N ? '#1a0d08' : '#3a2418');
    for (const vv of [0.42, 0.56, 0.7]) {
      A.wallRect(ctx, P, 'L', 1.15, 2.7, vv, vv + 0.012, C.trim);
      const bs = A.depths(1.2, 2.6, 14);
      for (let i = 0; i < 14; i++) {
        const b0 = P.at(0, vv, bs[i]), b1 = P.at(0, vv, bs[i] * 1.012);
        const bw = Math.max(3, (b1[0] - b0[0]) * 0.8), bh = (bs[i] * 40) * (0.7 + r() * 0.5);
        const col = r.pick(['#3a6a3a', '#8a4a1a', '#d8c08a', '#5a1a2a', '#2a4a6a']);
        A.rect(ctx, b0[0], b0[1] - bh, bw, bh, N ? A.mix(col, '#000000', 0.2) : col);
        if (N && r() < 0.3) A.glow(ctx, b0[0] + bw / 2, b0[1] - bh / 2, 16, '#ffc07a', 0.35);
      }
    }
    if (N) A.glow(ctx, P.at(0, 0.5, 1.8)[0], P.at(0, 0.5, 1.8)[1], 260, '#ffb06a', 0.22);
    // 바텐더
    const em = P.at(0.12, 1, 1.55);
    A.figure(ctx, em[0], em[1] - 40, { h: 250, color: C.fig, pose: 'crossed', rim: N ? '#ffb06a' : null, rimDir: -1 });
    // 카운터
    A.poly(ctx, [P.at(0.02, 0.8, 1.2), P.at(0.24, 0.8, 1.2), P.at(0.24, 0.8, 2.7), P.at(0.02, 0.8, 2.7)], N ? '#3a2014' : '#6a3a24');
    A.poly(ctx, [P.at(0.24, 0.8, 1.2), P.at(0.24, 0.8, 2.7), P.at(0.24, 1, 2.7), P.at(0.24, 1, 1.2)], N ? '#1e0e08' : '#4a2616');
    A.poly(ctx, [P.at(0.24, 0.8, 1.2), P.at(0.24, 0.8, 2.7), P.at(0.24, 0.84, 2.7), P.at(0.24, 0.84, 1.2)], C.trim);
    void barFront;
    // 전화 부스 (뒷벽 왼쪽 모서리)
    A.box3(ctx, P, 0.03, 0.14, 0.42, 1, 1.02, 1.16, { front: N ? '#2a1a10' : '#5a3a22', top: N ? '#3a2616' : '#7a5232', side: N ? '#1a0e08' : '#3a2616' });
    const pb = P.at(0.05, 0.5, 1.16), pb2 = P.at(0.12, 0.72, 1.16);
    A.rect(ctx, pb[0], pb[1], pb2[0] - pb[0], pb2[1] - pb[1], N ? '#ffcf8a' : '#a6b3a8');
    if (N) A.glow(ctx, (pb[0] + pb2[0]) / 2, (pb[1] + pb2[1]) / 2, 80, '#ffcf8a', 0.4);
    A.text(ctx, 'TELÉFONO', (pb[0] + pb2[0]) / 2, pb[1] - 16, { size: 13, color: C.gold, font: '"Poiret One", sans-serif', spacing: 1 });

    // 분수
    const fc = P.at(0.5, 1, 1.9);
    const fr = 250;
    ctx.fillStyle = A.rgba(N ? '#2a2226' : '#bdb3a2'); ctx.beginPath(); ctx.ellipse(fc[0], fc[1] - 30, fr, fr * 0.2, 0, 0, Math.PI * 2); ctx.fill();
    A.rect(ctx, fc[0] - fr, fc[1] - 30, fr * 2, 50, N ? '#1c1618' : '#9a907f');
    ctx.fillStyle = A.rgba(N ? '#1c1618' : '#9a907f'); ctx.beginPath(); ctx.ellipse(fc[0], fc[1] + 20, fr, fr * 0.2, 0, 0, Math.PI); ctx.fill();
    ctx.fillStyle = A.rgba(N ? '#162028' : '#6a8a8a'); ctx.beginPath(); ctx.ellipse(fc[0], fc[1] - 30, fr - 18, fr * 0.2 - 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = A.rgba('#ffffff', N ? 0.1 : 0.25); ctx.beginPath(); ctx.ellipse(fc[0] - 40, fc[1] - 34, fr * 0.6, fr * 0.06, 0, 0, Math.PI * 2); ctx.fill();
    // 가운데 기둥과 여신상 (물 항아리를 기울인 여인)
    A.rect(ctx, fc[0] - 22, fc[1] - 160, 44, 130, N ? '#241c20' : '#c2b8a6');
    ctx.fillStyle = A.rgba(N ? '#241c20' : '#c2b8a6'); ctx.beginPath(); ctx.ellipse(fc[0], fc[1] - 160, 70, 14, 0, 0, Math.PI * 2); ctx.fill();
    A.figure(ctx, fc[0], fc[1] - 164, { h: 200, color: N ? '#2e2428' : '#d6ccba', body: 'dress', build: 'woman', hat: 'long', pose: 'reach', rim: N ? '#ffb06a' : null, rimDir: 1 });
    // 물줄기
    ctx.strokeStyle = A.rgba(N ? '#a0c0d0' : '#e8f4f4', 0.6); ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(fc[0] + 58, fc[1] - 312); ctx.quadraticCurveTo(fc[0] + 110, fc[1] - 280, fc[0] + 120, fc[1] - 40); ctx.stroke();
    for (let i = 0; i < 20; i++) { ctx.fillStyle = A.rgba('#e8f4f4', 0.5); ctx.fillRect(fc[0] + 100 + r() * 40, fc[1] - 60 + r() * 30, 2, 2); }
    A.mark(fc[0] + 120, fc[1] - 45, 30, '#e8f4f4', 'water');

    // 탁자들 (오른쪽)
    const tabs = [[0.82, 1.5], [1.08, 1.7], [0.9, 2.3], [1.3, 2.1], [1.2, 2.9]];
    for (const [u, sv] of tabs) { const p = P.at(u, 1, sv); A.cafeTable(ctx, p[0], p[1], sv * 0.55, N ? '#0e0a0a' : '#3a2a22', !N); if (N) { A.glow(ctx, p[0], p[1] - 80 * sv * 0.55, 30 * sv, '#ffc27a', 0.5); A.rect(ctx, p[0] - 3, p[1] - 86 * sv * 0.55, 6, 12 * sv * 0.4, '#fff0c8'); } }
    // 춤추는 사람들 (밤)
    if (N) {
      A.couple(ctx, fc[0] - 330, fc[1] + 150, 300, { rim: '#ff9a5a', leg: true, manHat: 'fedora' });
      A.couple(ctx, fc[0] + 320, fc[1] + 60, 250, { rim: '#ff6a7a', womHat: 'long' });
      A.couple(ctx, fc[0] - 120, fc[1] - 70, 190, { rim: '#ffb05a' });
      A.couple(ctx, fc[0] + 170, fc[1] - 80, 180, { rim: '#ffb05a', leg: true });
      A.figure(ctx, 190, 1010, { h: 380, color: '#050406', hat: 'fedora', pose: 'smoke', body: 'coat', rim: '#ff8a5a', rimDir: 1 });
    }
    // 샹들리에
    const ch1 = P.at(0.5, 0, 1.5), ch2 = P.at(0.5, 0, 2.8);
    A.chandelier(ctx, ch2[0], ch2[1] + 190, 1.25, r, { lit: N, color: C.dark });
    A.chandelier(ctx, ch1[0], ch1[1] + 150, 0.85, r, { lit: N, color: C.dark });
    // 연기 (밤)
    if (N) {
      A.clouds(ctx, W, H, { y0: 100, y1: 560, color: '#c08a6a', a: 0.22, scale: 160, stretch: 3, seed: 12 });
      A.band(ctx, W, 380, 300, '#ff8a6a', 0.08);
    }
    A.vgrad(ctx, 0, 900, W, H, [[0, '#000000', 0], [1, '#000000', 0.4]]);
  };
  S.hall.focus = 0.4;

  /* ───────── 통조림 공장 · 붉은 닻 본부 ─────────
   * 높은 천장의 철골 트러스, 천창, 멈춘 컨베이어 세 줄과 빈 깡통, 뜨개질하는 여공들, 수프 솥,
   * 붉은 깃발과 목탄 초상, 칠판, 벽 중간 높이의 유리 사무실(스탠드 불빛).
   */
  S.cannery = function (ctx, W, H, r, v) {
    const P = A.space([900, 560], [520, 240, 1300, 700]);
    const C = { wall: '#4a4a44', brick: '#5a3a2e', floor: '#2a2926', ceil: '#1e2022', steel: '#16181a', belt: '#2a2a28', can: '#b8b2a4', fig: '#0d0d0f', warm: '#ffc27a' };
    A.roomBox(ctx, P, W, H, {
      ceil: [A.shade(C.ceil, 0.6), C.ceil], floor: [A.shade(C.floor, 0.55), C.floor],
      left: [A.shade(C.brick, 0.6), A.shade(C.brick, 0.9)], right: [A.shade(C.brick, 0.55), A.shade(C.brick, 0.85)], wall: [C.wall, A.shade(C.wall, 0.8)],
    });
    // 벽돌 줄눈
    for (let vv = 0.05; vv < 1; vv += 0.035) { A.wallRect(ctx, P, 'L', 1, 4, vv, vv + 0.004, A.shade(C.brick, 0.6)); A.wallRect(ctx, P, 'R', 1, 4, vv, vv + 0.004, A.shade(C.brick, 0.6)); }
    // 뒷벽의 큰 창 (공장 격자창)
    const bw0 = P.at(0.1, 0.12), bw1 = P.at(0.9, 0.55);
    A.window(ctx, bw0[0], bw0[1], bw1[0] - bw0[0], bw1[1] - bw0[1], (c, x, y, w, h) => {
      A.vgrad(c, x, y, w, y + h, [[0, '#9aa6a8'], [1, '#c9c4b2']]);
      A.craneRow(c, x, x + w, y + h * 0.98, 0.4, '#6a6e6a', r, { n: 4 });
    }, { frame: '#1a1c1e', t: 6, cols: 10, rows: 4 });
    for (let i = 0; i < 7; i++) { const a = P.at(0.1 + r() * 0.8, 0.12 + r() * 0.43); A.rect(ctx, a[0], a[1], 60, 40, '#6a6e66', 0.8); }
    // 천창에서 내려오는 빛
    const sk = [0.25, 0.55, 0.85];
    for (const u of sk) {
      const a = P.at(u - 0.08, 0, 1.4), b = P.at(u + 0.08, 0, 1.4), c = P.at(u + 0.2, 1, 1.9), d = P.at(u - 0.04, 1, 1.9);
      A.shaft(ctx, [a, b, c, d], '#e8ecdf', 0.14, 0.02, 0, a[1], 0, c[1]);
      A.motes(ctx, [a, b, c, d], 90, r, '#ffffff', 0.5);
    }
    // 철골 트러스 (천장)
    ctx.strokeStyle = A.rgba(C.steel); ctx.lineCap = 'square';
    for (const sv of A.depths(1, 3.5, 5)) {
      const a = P.at(-0.5, 0.02, sv), b = P.at(1.5, 0.02, sv), m = P.at(0.5, -0.12, sv);
      ctx.lineWidth = 6 * sv * 0.7; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      ctx.lineWidth = 3 * sv * 0.7;
      for (let i = 0; i <= 8; i++) { const x = A.lerp(a[0], b[0], i / 8), y = A.lerp(a[1], b[1], i / 8); const tx = A.lerp(a[0], b[0], (i + 0.5) / 8); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(tx, Math.min(y, m[1]) - 30 * sv * 0.4); ctx.stroke(); }
    }
    // 매달린 전등들
    for (const [u, sv] of [[0.3, 1.3], [0.7, 1.3], [0.3, 2.1], [0.7, 2.1]]) {
      const p = P.at(u, 0.3, sv); A.line(ctx, p[0], 0, p[0], p[1], C.steel, 2);
      A.poly(ctx, [[p[0] - 30 * sv * 0.5, p[1] + 16], [p[0] + 30 * sv * 0.5, p[1] + 16], [p[0] + 8, p[1]], [p[0] - 8, p[1]]], '#2a3a34');
      A.light(ctx, p[0], p[1] + 18, { r: 70 * sv * 0.5, color: C.warm, kind: 'lamp' });
      A.cone(ctx, p[0], p[1] + 16, Math.PI / 2, 0.5, 300 * sv * 0.6, C.warm, 0.08);
    }
    // 유리 사무실 (오른쪽 벽 중간 높이)
    const g = (vv, sv) => P.at(1, vv, sv);
    A.poly(ctx, [g(0.18, 1.25), g(0.18, 1.9), g(0.52, 1.9), g(0.52, 1.25)], '#1a1a18');
    A.poly(ctx, [P.at(0.82, 0.52, 1.25), P.at(1, 0.52, 1.25), P.at(1, 0.52, 1.9), P.at(0.82, 0.52, 1.9)], '#222220');
    const gf = [P.at(0.82, 0.18, 1.9), P.at(1, 0.18, 1.9), P.at(1, 0.52, 1.9), P.at(0.82, 0.52, 1.9)];
    A.poly(ctx, gf, '#e9c07a');
    A.poly(ctx, [P.at(0.82, 0.18, 1.25), P.at(0.82, 0.18, 1.9), P.at(0.82, 0.52, 1.9), P.at(0.82, 0.52, 1.25)], '#d9a860');
    for (let i = 1; i < 4; i++) { const a = P.at(0.82 + 0.18 * i / 4, 0.18, 1.9), b = P.at(0.82 + 0.18 * i / 4, 0.52, 1.9); A.line(ctx, a[0], a[1], b[0], b[1], '#2a2420', 3); }
    const ro = P.at(0.93, 0.4, 1.7);
    A.figure(ctx, ro[0], ro[1] + 90, { h: 120, pose: 'sit', color: '#1a1410', hat: 'bun', build: 'woman', body: 'skirt' });
    A.light(ctx, ro[0] - 40, ro[1] - 10, { r: 110, color: '#ffcf8a', kind: 'lamp' });
    // 철계단
    ctx.strokeStyle = A.rgba(C.steel); ctx.lineWidth = 5;
    const s0 = P.at(0.82, 0.52, 1.9), s1 = P.at(0.62, 1, 2.6);
    ctx.beginPath(); ctx.moveTo(s0[0], s0[1]); ctx.lineTo(s1[0], s1[1]); ctx.moveTo(s0[0], s0[1] - 40); ctx.lineTo(s1[0], s1[1] - 50); ctx.stroke();
    for (let i = 0; i <= 12; i++) { const t = i / 12; A.line(ctx, A.lerp(s0[0], s1[0], t), A.lerp(s0[1], s1[1], t), A.lerp(s0[0], s1[0], t) + 40, A.lerp(s0[1], s1[1], t), C.steel, 3); }
    // 붉은 깃발과 초상 (왼쪽 벽)
    const fl = [P.at(0, 0.14, 1.2), P.at(0, 0.14, 1.75), P.at(0, 0.62, 1.75), P.at(0, 0.62, 1.2)];
    A.poly(ctx, fl, '#9a1a1a');
    const an = P.at(0, 0.36, 1.46);
    ctx.save(); ctx.translate(an[0], an[1]); ctx.scale(0.7, 1); ctx.strokeStyle = A.rgba('#1a0808'); ctx.lineWidth = 12; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, -80); ctx.lineTo(0, 70); ctx.moveTo(-45, -45); ctx.lineTo(45, -45); ctx.moveTo(-70, 30); ctx.quadraticCurveTo(0, 110, 70, 30); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -96, 16, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    const pt = [P.at(0, 0.18, 2.0), P.at(0, 0.18, 2.35), P.at(0, 0.5, 2.35), P.at(0, 0.5, 2.0)];
    A.poly(ctx, pt, '#d8d0bc');
    const pc = P.at(0, 0.3, 2.17);
    A.figure(ctx, pc[0], pc[1] + 140, { h: 200, color: '#3a3430', hat: 'cap' });
    A.poly(ctx, [pt[3], pt[2], P.at(0, 0.52, 2.35), P.at(0, 0.52, 2.0)], '#1a1814');
    // 칠판
    A.box3(ctx, P, 0.02, 0.3, 0.5, 0.78, 1.0, 1.03, { front: '#1f2a24', side: '#141c18', top: '#3a2a1a' });
    for (let i = 0; i < 6; i++) { const a = P.at(0.05, 0.54 + i * 0.035, 1.03); ctx.fillStyle = A.rgba('#e8e8dc', 0.5); ctx.fillRect(a[0], a[1], 60 + r() * 120, 3); }
    // 컨베이어 벨트 세 줄
    for (const [u0, u1] of [[0.2, 0.32], [0.44, 0.56], [0.68, 0.8]]) {
      A.box3(ctx, P, u0, u1, 0.8, 0.86, 1, 3.4, { front: '#1a1a18', top: C.belt, side: '#121210' });
      for (const sv of A.depths(1.05, 3.3, 7)) { const a = P.at(u0 + 0.01, 1, sv), b = P.at(u0 + 0.01, 0.86, sv); A.line(ctx, a[0], a[1], b[0], b[1], C.steel, 3 * sv * 0.6); const c2 = P.at(u1 - 0.01, 1, sv), d2 = P.at(u1 - 0.01, 0.86, sv); A.line(ctx, c2[0], c2[1], d2[0], d2[1], C.steel, 3 * sv * 0.6); }
      // 깡통 행렬
      for (const sv of A.depths(1.02, 3.3, 34)) {
        for (let k = 0; k < 3; k++) {
          const p = P.at(A.lerp(u0, u1, (k + 0.5) / 3), 0.8, sv), cw = 7 * sv, ch = 10 * sv;
          A.rect(ctx, p[0] - cw / 2, p[1] - ch, cw, ch, A.shade(C.can, 0.8 + (k % 2) * 0.2));
          A.rect(ctx, p[0] - cw / 2, p[1] - ch, cw, ch * 0.18, '#e8e4da');
        }
      }
    }
    // 수프 솥과 줄
    const pot = P.at(-0.35, 1, 2.1);
    A.barrelFire(ctx, pot[0], pot[1], 1.4, r, { smoke: false });
    ctx.fillStyle = A.rgba('#1a1a1a'); ctx.beginPath(); ctx.ellipse(pot[0], pot[1] - 110, 90, 22, 0, 0, Math.PI * 2); ctx.fill();
    A.rect(ctx, pot[0] - 90, pot[1] - 110, 180, 70, '#222');
    A.smoke(ctx, pot[0], pot[1] - 140, 1.2, r, '#d8d0c0', 0.12);
    const q = [[-0.1, 2.3, 'hair'], [0.02, 2.5, 'cap'], [0.12, 2.7, 'scarf'], [0.2, 2.85, 'fedora']];
    for (const [u, sv, hat] of q) { const p = P.at(u, 1, sv); A.figure(ctx, p[0], p[1], { h: 95 * sv, color: C.fig, hat, pose: 'pockets', body: hat === 'scarf' ? 'skirt' : 'jacket', build: hat === 'scarf' || hat === 'hair' ? 'woman' : '', rim: '#ff9a4a', rimDir: -1 }); }
    // 뜨개질하는 여공들 (벤치에 앉아)
    for (const [u, sv, hat] of [[0.36, 1.5, 'scarf'], [0.62, 1.7, 'bun'], [0.9, 1.35, 'hair'], [0.66, 1.25, 'scarf']]) {
      const p = P.at(u, 1, sv);
      A.figure(ctx, p[0], p[1], { h: 88 * sv, color: C.fig, hat, pose: 'sit', body: 'skirt', build: 'woman' });
    }
    A.box3(ctx, P, 0.3, 0.44, 0.93, 0.95, 1.48, 1.56, { front: '#2a1e14', top: '#4a3a24', side: '#1e140c' });
    // 아이 하나
    const kid = P.at(0.52, 1, 2.2); A.figure(ctx, kid[0], kid[1], { h: 150, color: C.fig, build: 'child', hat: 'cap' });
    A.vgrad(ctx, 0, 880, W, H, [[0, '#000000', 0], [1, '#000000', 0.45]]);
    A.band(ctx, W, 520, 400, '#9a9a8a', 0.08);
  };
  S.cannery.focus = 0.4;

  /* ───────── 그랜드 메리디안 호텔 로비 ─────────
   * 거울 같은 대리석 바닥, 기둥과 야자수 화분, 거대한 샹들리에, 프런트와 필롱, 회전문, 큰 계단.
   */
  S.hotel = function (ctx, W, H, r, v) {
    const N = !!v.night;
    const P = A.space([860, 500], [440, 170, 1280, 660]);
    const C = { wall: '#e8dcc0', wall2: '#d8c8a4', marble: '#efe6d4', marble2: '#c9b89a', gold: '#c9a054', dark: '#2a2016', green: '#2f4a32', fig: '#141210' };
    A.roomBox(ctx, P, W, H, {
      ceil: [A.shade(C.wall2, 0.6), A.shade(C.wall2, 0.8)], floor: C.marble,
      left: [A.shade(C.wall, 0.7), A.shade(C.wall, 0.92)], right: [A.shade(C.wall, 0.66), A.shade(C.wall, 0.9)], wall: [C.wall, A.shade(C.wall, 0.88)],
    });
    // 천장 격자
    A.floorGrid(ctx, P, -0.5, 1.5, 1, 3.2, 8, 6, (c, q, i, j) => { A.poly(c, q, (i + j) % 2 ? A.shade(C.wall2, 0.72) : A.shade(C.wall2, 0.78)); }, 0);
    // 뒷벽: 큰 계단과 아치 창
    const aw0 = P.at(0.3, 0.05), aw1 = P.at(0.7, 0.5);
    A.window(ctx, aw0[0], aw0[1], aw1[0] - aw0[0], aw1[1] - aw0[1], (c, x, y, w, h) => {
      if (N) { A.vgrad(c, x, y, w, y + h, [[0, '#0a1020'], [1, '#243040']]); A.stars(c, W, y + h, 60, r); for (let i = 0; i < 40; i++) { c.fillStyle = A.rgba('#ffc87a', 0.8); c.fillRect(x + r() * w, y + h * 0.7 + r() * h * 0.3, 2, 2); } }
      else { A.vgrad(c, x, y, w, y + h, [[0, '#b8c8d0'], [1, '#e8e4d8']]); A.shore(c, W, y + h * 0.85, 30, '#9aa6a4', r, {}); }
    }, { frame: C.gold, t: 8, cols: 4, rows: 3 });
    ctx.fillStyle = A.rgba(C.wall); ctx.beginPath(); ctx.moveTo(aw0[0] - 10, aw0[1] - 10); ctx.lineTo(aw1[0] + 10, aw0[1] - 10); ctx.lineTo(aw1[0] + 10, aw0[1] + 60); ctx.quadraticCurveTo((aw0[0] + aw1[0]) / 2, aw0[1] - 60, aw0[0] - 10, aw0[1] + 60); ctx.closePath(); ctx.fill();
    // 계단 (뒷벽 앞, 가운데)
    for (let i = 0; i < 12; i++) {
      const v0 = 0.55 + i * 0.0375, s0 = 1 + i * 0.012;
      A.box3(ctx, P, 0.28 - i * 0.012, 0.72 + i * 0.012, v0, v0 + 0.0375, s0, s0 + 0.012, { front: i % 2 ? '#8a1a22' : '#7a161e', top: '#e6dcc8', side: '#5a1016' });
    }
    // 난간
    for (const u of [0.26, 0.74]) { const a = P.at(u, 0.52, 1), b = P.at(u + (u < 0.5 ? -0.14 : 0.14), 0.95, 1.14); A.line(ctx, a[0], a[1], b[0], b[1], C.gold, 6); A.rect(ctx, b[0] - 8, b[1], 16, 60, C.gold); }
    // 바닥: 대리석 체크 + 반사
    A.floorGrid(ctx, P, -1.5, 2.5, 1.14, 4.4, 16, 12, (c, q, i, j) => { A.poly(c, q, (i + j) % 2 ? C.marble : C.marble2); });
    ctx.save(); ctx.globalAlpha = 0.25; ctx.translate(0, 2 * P.at(0, 1, 1.14)[1]); ctx.scale(1, -1);
    A.chandelier(ctx, 860, 250 + 60, 1.5, A.rng(3), { lit: true, color: C.dark });
    ctx.restore();
    // 기둥들
    for (const [u, sv] of [[-0.05, 1.3], [1.05, 1.3], [-0.05, 2.1], [1.05, 2.1], [-0.05, 3.4], [1.05, 3.4]]) {
      const top = P.at(u, 0, sv), bot = P.at(u, 1, sv), w = 46 * sv;
      A.rect(ctx, top[0] - w / 2, top[1], w, bot[1] - top[1], '#f2eadc');
      ctx.fillStyle = A.lineGrad(ctx, top[0] - w / 2, 0, top[0] + w / 2, 0, [[0, '#000000', 0.25], [0.35, '#ffffff', 0.25], [1, '#000000', 0.35]]); ctx.fillRect(top[0] - w / 2, top[1], w, bot[1] - top[1]);
      A.rect(ctx, top[0] - w * 0.65, top[1] + 20 * sv, w * 1.3, 18 * sv, C.gold);
      A.rect(ctx, bot[0] - w * 0.7, bot[1] - 30 * sv, w * 1.4, 30 * sv, C.gold);
    }
    // 야자수 화분
    for (const [u, sv] of [[0.08, 1.7], [0.95, 1.7], [0.14, 2.8]]) {
      const b = P.at(u, 1, sv), k = sv * 0.6;
      A.poly(ctx, [[b[0] - 40 * k, b[1] - 80 * k], [b[0] + 40 * k, b[1] - 80 * k], [b[0] + 30 * k, b[1]], [b[0] - 30 * k, b[1]]], '#6a3a24');
      for (let i = 0; i < 9; i++) {
        const a = -Math.PI / 2 + (i - 4) * 0.35, L = (160 + r() * 80) * k;
        ctx.strokeStyle = A.rgba(C.green); ctx.lineWidth = 6 * k; ctx.beginPath(); ctx.moveTo(b[0], b[1] - 80 * k);
        const ex = b[0] + Math.cos(a) * L, ey = b[1] - 80 * k + Math.sin(a) * L * 0.9 + 60 * k;
        ctx.quadraticCurveTo(b[0] + Math.cos(a) * L * 0.5, b[1] - 80 * k + Math.sin(a) * L, ex, ey); ctx.stroke();
        for (let t = 0.3; t < 1; t += 0.1) { const px = A.lerp(b[0], ex, t), py = A.lerp(b[1] - 80 * k + Math.sin(a) * L * 0.5, ey, t); A.line(ctx, px, py, px + Math.cos(a + 1.2) * 30 * k, py + 26 * k, C.green, 3 * k); A.line(ctx, px, py, px + Math.cos(a - 1.2) * 30 * k, py + 26 * k, C.green, 3 * k); }
      }
    }
    // 프런트 데스크 (오른쪽)
    A.box3(ctx, P, 0.72, 1.06, 0.78, 1, 1.35, 1.75, { front: '#4a2a18', top: '#2a1a10', side: '#3a2014' });
    A.box3(ctx, P, 0.72, 1.06, 0.76, 0.78, 1.33, 1.77, { front: C.gold, top: '#e8c47a', side: C.gold });
    const pl = P.at(0.9, 0.78, 1.5);
    A.figure(ctx, pl[0], pl[1] + 150, { h: 230, color: C.fig, pose: 'stand', body: 'jacket', build: 'slim' });
    A.rect(ctx, pl[0] - 50, pl[1] - 10, 100, 12, C.gold);
    A.light(ctx, pl[0] + 70, pl[1] - 40, { r: 40, color: '#ffe0a0', kind: 'lamp' });
    A.rect(ctx, pl[0] + 64, pl[1] - 30, 12, 40, C.gold);
    // 회전문 (왼쪽 벽)
    const rd = [P.at(0, 0.45, 1.5), P.at(0, 0.45, 2.1), P.at(0, 1, 2.1), P.at(0, 1, 1.5)];
    A.poly(ctx, rd, N ? '#1a2030' : '#c8d4d8');
    A.poly(ctx, [P.at(0, 0.4, 1.45), P.at(0, 0.4, 2.15), P.at(0, 0.46, 2.15), P.at(0, 0.46, 1.45)], C.gold);
    for (const sv of [1.6, 1.8, 2.0]) { const a = P.at(0, 0.46, sv), b = P.at(0, 1, sv); A.line(ctx, a[0], a[1], b[0], b[1], C.gold, 5); }
    // 소파의 노부인과 손님들
    A.box3(ctx, P, 0.12, 0.3, 0.9, 1, 1.9, 2.1, { front: '#6a1e24', top: '#8a2a30', side: '#4a1418' });
    const lady = P.at(0.2, 1, 2.0); A.figure(ctx, lady[0], lady[1], { h: 190, pose: 'sit', color: '#1a1614', hat: 'bun', body: 'dress', build: 'woman' });
    const bell = P.at(0.52, 1, 2.6); A.figure(ctx, bell[0], bell[1], { h: 330, color: '#3a1a14', hat: 'cap', body: 'jacket', prop: 'case' });
    // 샹들리에
    A.chandelier(ctx, 860, 300, 1.5, r, { lit: true, color: C.dark, light: '#ffe6b0' });
    A.glow(ctx, 860, 400, 700, '#ffe2a8', 0.05);
    A.vgrad(ctx, 0, 0, W, H, [[0, '#2a2016', 0.18], [1, '#000000', 0.35]]);
  };
  S.hotel.focus = 0.45;
  S.hotel.paint = { bloom: 0.12 };

  /* ───────── 그랜드 메리디안 305호 ─────────
   * 지나치게 정돈된 방. 창가 책상의 타자기와 연필 세 자루, 익사한 왕의 초상, 카펫을 걷은 참나무 바닥 위의 분필 발자국.
   */
  S.room305 = function (ctx, W, H, r, v) {
    const N = !!v.night;
    const P = A.space([900, 470], [500, 210, 1300, 690]);
    const C = N ? { wall: '#2a3040', wall2: '#303848', wood: '#3a2a20', ceil: '#1a1e28', trim: '#5a4a34', chalkW: '#e8ecf0', chalkY: '#e8d070', lamp: '#ffd08a' }
      : { wall: '#c8bfa6', wall2: '#bfb59a', wood: '#8a6444', ceil: '#d8d0bc', trim: '#8a7454', chalkW: '#f8f8f4', chalkY: '#f0d860', lamp: '#ffe8b0' };
    A.roomBox(ctx, P, W, H, {
      ceil: [A.shade(C.ceil, 0.7), C.ceil], floor: C.wood,
      left: [A.shade(C.wall, 0.65), A.shade(C.wall, 0.9)], right: [A.shade(C.wall, 0.6), A.shade(C.wall, 0.88)], wall: [C.wall, A.shade(C.wall, 0.9)],
    });
    A.stripesBack(ctx, P, 30, C.wall, C.wall2, 0.03, 0.9);
    A.wallRect(ctx, P, 'B', 0, 1, 0.9, 1, A.shade(C.trim, 0.8));
    A.wallRect(ctx, P, 'L', 1, 4, 0.9, 1, A.shade(C.trim, 0.6));
    A.wallRect(ctx, P, 'R', 1, 4, 0.9, 1, A.shade(C.trim, 0.55));
    A.planks(ctx, P, -1, 2, 1, 2.6, 46, C.wood, r);
    // 창 (뒷벽 오른쪽): 바다
    const w0 = P.at(0.58, 0.14), w1 = P.at(0.92, 0.66);
    A.window(ctx, w0[0], w0[1], w1[0] - w0[0], w1[1] - w0[1], (c, x, y, w, h) => {
      if (N) { A.vgrad(c, x, y, w, y + h, [[0, '#060a14'], [0.6, '#10202c'], [1, '#081018']]); A.moon(c, x + w * 0.7, y + h * 0.25, 18, '#e8eef0', '#9fb7c8'); A.shore(c, W, y + h * 0.62, 12, '#060a10', r, { lights: 20 }); A.ripples(c, W, y + h * 0.62, y + h, r, '#9fb7c8', 0.3, 60); }
      else { A.vgrad(c, x, y, w, y + h, [[0, '#b0c4cc'], [0.6, '#dfe2da'], [1, '#8fa4a4']]); A.shore(c, W, y + h * 0.62, 12, '#9aa8a8', r, {}); A.ripples(c, W, y + h * 0.62, y + h, r, '#ffffff', 0.4, 60); }
    }, { frame: N ? '#141820' : '#f0ebe0', t: 10, cols: 2, rows: 2 });
    const lc = N ? '#8fb0d8' : '#fff4dc';
    A.shaft(ctx, [w0, [w1[0], w0[1]], P.at(0.4, 1, 2.2), P.at(0.0, 1, 2.2)], lc, N ? 0.1 : 0.14, 0.02, 0, w0[1], 0, H);
    // 익사한 왕의 초상 (뒷벽 왼쪽)
    const f0 = P.at(0.08, 0.16), f1 = P.at(0.34, 0.58);
    A.rect(ctx, f0[0] - 16, f0[1] - 16, f1[0] - f0[0] + 32, f1[1] - f0[1] + 32, '#b08a3a');
    A.rect(ctx, f0[0] - 6, f0[1] - 6, f1[0] - f0[0] + 12, f1[1] - f0[1] + 12, '#6a4a1a');
    A.vgrad(ctx, f0[0], f0[1], f1[0] - f0[0], f1[1], [[0, '#2a3a44'], [1, '#12202a']]);
    const kx = (f0[0] + f1[0]) / 2, ky = f1[1];
    ctx.save(); ctx.beginPath(); ctx.rect(f0[0], f0[1], f1[0] - f0[0], f1[1] - f0[1]); ctx.clip();
    A.figure(ctx, kx, ky + 150, { h: 330, color: '#0c1418', hat: 'crown', body: 'coat', rim: '#8fb8c8', rimDir: -1 });
    ctx.fillStyle = A.rgba('#d8b04a'); ctx.beginPath(); ctx.arc(kx, ky - 60, 6, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 6; i++) { ctx.fillStyle = A.rgba('#8fc0d0', 0.35); ctx.beginPath(); ctx.arc(kx - 60 + r() * 120, f0[1] + r() * (f1[1] - f0[1]), 3 + r() * 5, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    // 책상과 타자기 (창 아래)
    A.box3(ctx, P, 0.56, 0.94, 0.72, 0.76, 1.02, 1.3, { front: '#4a2e1c', top: '#6a4430', side: '#3a2214' });
    for (const u of [0.58, 0.92]) A.box3(ctx, P, u - 0.01, u + 0.01, 0.76, 1, 1.26, 1.29, { front: '#3a2214', top: '#3a2214', side: '#2a180e' });
    A.box3(ctx, P, 0.66, 0.8, 0.66, 0.72, 1.08, 1.2, { front: '#1a1a1c', top: '#2a2a2e', side: '#101012' });
    const tp = P.at(0.73, 0.66, 1.12);
    A.rect(ctx, tp[0] - 34, tp[1] - 34, 68, 36, '#f4f0e6');
    for (let i = 0; i < 3; i++) { const p = P.at(0.84 + i * 0.02, 0.72, 1.24); A.line(ctx, p[0], p[1], p[0] + 4, p[1] - 30, '#e8b020', 4); }
    // 스탠드 (밤)
    const sl = P.at(0.6, 0.72, 1.12);
    A.rect(ctx, sl[0] - 2, sl[1] - 60, 4, 60, '#2a2420');
    A.poly(ctx, [[sl[0] - 26, sl[1] - 56], [sl[0] + 26, sl[1] - 56], [sl[0] + 14, sl[1] - 84], [sl[0] - 14, sl[1] - 84]], N ? '#e8c07a' : '#3a5a3a');
    if (N) { A.light(ctx, sl[0], sl[1] - 50, { r: 120, color: C.lamp, kind: 'lamp' }); A.pool(ctx, sl[0] + 40, sl[1] + 4, 160, 30, C.lamp, 0.3); }
    // 침대 (왼쪽, 모서리 접힌)
    A.box3(ctx, P, -0.3, 0.2, 0.5, 0.82, 1.35, 1.4, { front: '#4a2e1c', top: '#6a4430', side: '#3a2214' });
    A.box3(ctx, P, -0.3, 0.2, 0.76, 0.9, 1.4, 2.0, { front: N ? '#c8ccd8' : '#f4f2ec', top: N ? '#d8dce8' : '#fbfaf6', side: N ? '#aab0c0' : '#dedad0' });
    A.box3(ctx, P, -0.3, 0.2, 0.9, 1, 1.42, 2.0, { front: '#3a2214', top: '#3a2214', side: '#2a180e' });
    // 분필 발자국 (오초와 히로)
    const foot = (u, sv, ang, left, n) => {
      const p = P.at(u, 1, sv), k = (sv - 0.6) * 0.9;
      ctx.save(); ctx.translate(p[0], p[1]); ctx.scale(1, 0.34); ctx.rotate(ang);
      ctx.strokeStyle = A.rgba(left ? C.chalkY : C.chalkW, 0.9); ctx.lineWidth = 3.2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.ellipse(0, 0, 11 * k, 26 * k, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0, 30 * k, 8 * k, 11 * k, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
      ctx.save(); ctx.fillStyle = A.rgba(left ? C.chalkY : C.chalkW, 0.95); ctx.font = '600 ' + Math.round(13 * k) + 'px "Liberation Sans", sans-serif'; ctx.fillText(String(n), p[0] + 18 * k, p[1] - 4 * k); ctx.restore();
    };
    const path = [];
    for (let i = 0; i < 18; i++) { const t = i / 18 * Math.PI * 2; path.push([0.5 + Math.cos(t) * 0.28 + (i % 2 ? 0.05 : -0.05), 1.55 + Math.sin(t) * 0.35, t + (i % 2 ? 0.4 : -0.4), i % 2 === 1, i + 1]); }
    for (const [u, sv, a, left, n] of path) foot(u, sv, a, left, n);
    // 원과 X 표시
    ctx.save(); ctx.strokeStyle = A.rgba(C.chalkW, 0.7); ctx.lineWidth = 3;
    const cc = P.at(0.5, 1, 1.55); ctx.beginPath(); ctx.ellipse(cc[0], cc[1], 70, 18, 0, 0, Math.PI * 2); ctx.stroke();
    const xx = P.at(0.26, 1, 1.9); ctx.beginPath(); ctx.moveTo(xx[0] - 26, xx[1] - 8); ctx.lineTo(xx[0] + 26, xx[1] + 8); ctx.moveTo(xx[0] + 26, xx[1] - 8); ctx.lineTo(xx[0] - 26, xx[1] + 8); ctx.stroke();
    ctx.restore();
    // 가방 (침대 발치)
    A.box3(ctx, P, 0.22, 0.4, 0.84, 1, 1.95, 2.08, { front: '#5a3a22', top: '#6a4a2e', side: '#3a2414' });
    A.rect(ctx, P.at(0.29, 0.84, 2.08)[0], P.at(0.29, 0.84, 2.08)[1] - 14, 40, 14, '#2a1a10');
    A.vgrad(ctx, 0, 900, W, H, [[0, '#000000', 0], [1, '#000000', 0.4]]);
  };
  S.room305.focus = 0.45;

  /* ───────── 코스타 전당포 ─────────
   * 천장까지 닿는 선반: 아코디언, 괘종시계, 웨딩드레스, 목발, 망원경, 박제 갈매기, 은수저, 반지.
   * 가장 안쪽에 쇠창살 카운터와 체사르.
   */
  S.pawn = function (ctx, W, H, r, v) {
    const P = A.space([940, 520], [620, 250, 1260, 720]);
    const C = { wall: '#3a2e22', shelf: '#2a1c12', floor: '#2a221c', ceil: '#1a140e', warm: '#ffc070', brass: '#c09040', fig: '#0e0a08' };
    A.roomBox(ctx, P, W, H, {
      ceil: [A.shade(C.ceil, 0.5), C.ceil], floor: [A.shade(C.floor, 0.5), C.floor],
      left: [A.shade(C.wall, 0.5), A.shade(C.wall, 0.85)], right: [A.shade(C.wall, 0.45), A.shade(C.wall, 0.8)], wall: [C.wall, A.shade(C.wall, 0.8)],
    });
    A.planks(ctx, P, -1, 2, 1, 2.6, 30, C.floor, r);
    // 선반 (양 벽): 칸마다 잡동사니 실루엣
    const junkColors = ['#6a5a40', '#8a6a3a', '#5a4a3a', '#a08a60', '#7a3a2a', '#4a5a5a', '#c0b090', '#8a8a80'];
    for (const side of ['L', 'R']) {
      const u = side === 'L' ? 0 : 1;
      const ss = A.depths(1.05, 3.2, 8);
      for (let vv = 0.08; vv < 0.95; vv += 0.14) {
        A.wallRect(ctx, P, side, 1.05, 3.2, vv, vv + 0.012, C.shelf);
        for (let i = 0; i < 8; i++) {
          if (r() < 0.2) continue;
          const a = P.at(u, vv, ss[i]), b = P.at(u, vv, ss[i + 1]);
          const w = Math.abs(b[0] - a[0]) * 0.8, h = (ss[i] * 60) * (0.4 + r() * 0.6), x = Math.min(a[0], b[0]) + Math.abs(b[0] - a[0]) * 0.1;
          const kind = r.int(0, 4), col = r.pick(junkColors);
          if (kind === 0) A.rect(ctx, x, a[1] - h, w, h, col);
          else if (kind === 1) { ctx.fillStyle = A.rgba(col); ctx.beginPath(); ctx.ellipse(x + w / 2, a[1] - h / 2, w / 2, h / 2, 0, 0, Math.PI * 2); ctx.fill(); }
          else if (kind === 2) A.poly(ctx, [[x, a[1]], [x + w, a[1]], [x + w * 0.6, a[1] - h], [x + w * 0.4, a[1] - h]], col);
          else if (kind === 3) { A.rect(ctx, x + w * 0.4, a[1] - h, w * 0.2, h, col); ctx.fillStyle = A.rgba(col); ctx.beginPath(); ctx.arc(x + w / 2, a[1] - h, w * 0.3, 0, Math.PI * 2); ctx.fill(); }
          else { for (let k = 0; k < 4; k++) A.rect(ctx, x + k * w / 4, a[1] - h * (0.6 + r() * 0.4), w / 5, h, A.shade(col, 0.8 + r() * 0.4)); }
        }
      }
    }
    // 괘종시계 (왼쪽 앞)
    const gc = P.at(0.02, 1, 1.4);
    A.rect(ctx, gc[0], gc[1] - 420, 90, 420, '#3a2010'); A.rect(ctx, gc[0] + 10, gc[1] - 400, 70, 70, '#e8dcc0');
    ctx.strokeStyle = A.rgba('#1a1008'); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(gc[0] + 45, gc[1] - 365); ctx.lineTo(gc[0] + 45, gc[1] - 390); ctx.moveTo(gc[0] + 45, gc[1] - 365); ctx.lineTo(gc[0] + 62, gc[1] - 358); ctx.stroke();
    A.rect(ctx, gc[0] + 20, gc[1] - 300, 50, 200, '#1a0e06'); ctx.fillStyle = A.rgba(C.brass); ctx.beginPath(); ctx.arc(gc[0] + 45, gc[1] - 140, 16, 0, Math.PI * 2); ctx.fill();
    // 웨딩드레스 (마네킹, 오른쪽)
    const wd = P.at(0.92, 1, 1.5);
    A.figure(ctx, wd[0], wd[1], { h: 300, color: '#e8e2d4', body: 'dress', build: 'woman', hat: null });
    ctx.fillStyle = A.rgba(C.wall); ctx.beginPath(); ctx.ellipse(wd[0], wd[1] - 280, 16, 20, 0, 0, Math.PI * 2); ctx.fill();
    A.rect(ctx, wd[0] - 2, wd[1] - 300, 4, 30, '#2a1a10');
    // 매달린 물건들: 아코디언, 목발, 새장
    for (const [x, len, kind] of [[760, 180, 'acc'], [900, 120, 'cage'], [1080, 200, 'crutch'], [1180, 150, 'acc']]) {
      A.line(ctx, x, 0, x, len, '#1a120a', 2);
      if (kind === 'acc') { A.rect(ctx, x - 30, len, 60, 50, '#7a1a1a'); for (let i = 0; i < 6; i++) A.rect(ctx, x - 30 + i * 11, len, 4, 50, '#2a0a0a'); A.rect(ctx, x - 34, len, 8, 50, '#1a1a1a'); A.rect(ctx, x + 26, len, 8, 50, '#1a1a1a'); }
      else if (kind === 'cage') { ctx.strokeStyle = A.rgba(C.brass); ctx.lineWidth = 2; for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.moveTo(x - 30 + i * 10, len + 70); ctx.quadraticCurveTo(x - 30 + i * 10, len, x, len); ctx.stroke(); } A.rect(ctx, x - 34, len + 70, 68, 6, C.brass); }
      else { A.line(ctx, x - 10, len, x - 16, len + 200, '#5a4028', 5); A.line(ctx, x + 10, len, x + 16, len + 200, '#5a4028', 5); A.line(ctx, x - 14, len + 10, x + 14, len + 10, '#3a2818', 8); }
    }
    // 박제된 갈매기 (카운터 위)
    const gl = P.at(0.2, 0.62, 1.1);
    ctx.fillStyle = A.rgba('#e0dcd0'); ctx.beginPath(); ctx.ellipse(gl[0], gl[1] - 30, 34, 18, -0.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(gl[0] + 28, gl[1] - 52, 12, 0, Math.PI * 2); ctx.fill();
    A.poly(ctx, [[gl[0] + 38, gl[1] - 54], [gl[0] + 58, gl[1] - 50], [gl[0] + 38, gl[1] - 48]], '#e0a030');
    A.poly(ctx, [[gl[0] - 30, gl[1] - 36], [gl[0] - 70, gl[1] - 26], [gl[0] - 24, gl[1] - 22]], '#8a8a88');
    ctx.fillStyle = A.rgba('#101010'); ctx.beginPath(); ctx.arc(gl[0] + 31, gl[1] - 55, 2.6, 0, Math.PI * 2); ctx.fill();
    A.rect(ctx, gl[0] - 20, gl[1] - 12, 50, 12, '#3a2414');
    // 안쪽: 쇠창살 카운터와 체사르
    A.box3(ctx, P, 0.1, 0.9, 0.62, 1, 1.0, 1.12, { front: '#3a2414', top: '#5a3a22', side: '#2a180c' });
    const ce = P.at(0.55, 0.62, 1.04);
    A.light(ctx, ce[0] - 20, ce[1] - 220, { r: 150, color: C.warm, kind: 'lamp' });
    A.line(ctx, ce[0] - 20, 0, ce[0] - 20, ce[1] - 236, '#1a1008', 2);
    A.poly(ctx, [[ce[0] - 70, ce[1] - 222], [ce[0] + 30, ce[1] - 222], [ce[0] + 6, ce[1] - 250], [ce[0] - 46, ce[1] - 250]], '#2a4a2a');
    A.figure(ctx, ce[0], ce[1] + 160, { h: 300, color: C.fig, build: 'wide', pose: 'hips', rim: C.warm, rimDir: -1 });
    const g0 = P.at(0.1, 0.1, 1.12), g1 = P.at(0.9, 0.62, 1.12);
    for (let x = g0[0]; x <= g1[0]; x += 22) A.rect(ctx, x, g0[1], 4, g1[1] - g0[1], '#2a2420');
    A.rect(ctx, g0[0], g0[1], g1[0] - g0[0], 8, '#2a2420'); A.rect(ctx, g0[0], g1[1] - 60, g1[0] - g0[0], 6, '#2a2420');
    A.rect(ctx, ce[0] - 70, g1[1] - 56, 140, 56, C.wall);
    // 금색 공 세 개 (출입문 위 간판, 역광)
    for (const [dx, dy] of [[-30, 0], [30, 0], [0, 44]]) { ctx.fillStyle = A.rgba(C.brass); ctx.beginPath(); ctx.arc(300 + dx, 180 + dy, 26, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = A.rgba('#ffe8a0', 0.6); ctx.beginPath(); ctx.arc(292 + dx, 172 + dy, 8, 0, Math.PI * 2); ctx.fill(); }
    A.line(ctx, 300, 60, 300, 150, '#1a1008', 3); A.line(ctx, 270, 150, 330, 150, '#1a1008', 4);
    // 먼지와 가장자리 어둠
    A.clouds(ctx, W, H, { y0: 100, y1: 700, color: '#c09060', a: 0.1, scale: 150, stretch: 2, seed: 44 });
    A.vignette(ctx, W, H, 0.4);
  };
  S.pawn.focus = 0.5;

  /* ───────── 꿈: 강바닥 ─────────
   * 검은 물 밑. 위에서 내려오는 빛줄기, 떠다니는 것들(구두, 반지, 이름표), 기포.
   */
  S.void = function (ctx, W, H, r, v) {
    A.vgrad(ctx, 0, 0, W, H, [[0, '#0e2630'], [0.4, '#081820'], [1, '#02060a']]);
    // 수면의 빛 무늬
    A.clouds(ctx, W, H, { y0: 0, y1: 200, color: '#6ab0b8', a: 0.35, scale: 60, stretch: 2.5, seed: 5, mode: 'lighter' });
    for (let i = 0; i < 7; i++) {
      const x = 300 + i * 220 + r() * 80;
      A.shaft(ctx, [[x - 30, 0], [x + 50, 0], [x + 160 + r() * 80, H], [x + 40, H]], '#8ad0d8', 0.12, 0, 0, 0, 0, H);
    }
    // 떠다니는 것들
    const drift = [[420, 420, 'shoe'], [760, 300, 'ring'], [980, 560, 'key'], [620, 700, 'tag'], [1200, 380, 'shoe2'], [300, 640, 'bottle']];
    for (const [x, y, k] of drift) {
      ctx.save(); ctx.translate(x, y); ctx.rotate((r() - 0.5) * 1.4);
      const c = '#0a141a';
      if (k === 'shoe' || k === 'shoe2') { ctx.fillStyle = A.rgba(k === 'shoe' ? '#c8c0b8' : c); ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(10, -6); ctx.quadraticCurveTo(44, -8, 50, 12); ctx.lineTo(-40, 14); ctx.closePath(); ctx.fill(); A.rect(ctx, -44, 10, 30, 10, '#1a1210'); }
      else if (k === 'ring') { ctx.strokeStyle = A.rgba('#d8b050'); ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(0, 0, 16, 10, 0.3, 0, Math.PI * 2); ctx.stroke(); A.glow(ctx, 0, 0, 40, '#ffd070', 0.5); }
      else if (k === 'key') { ctx.strokeStyle = A.rgba('#6a7a70'); ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.moveTo(12, 0); ctx.lineTo(60, 0); ctx.moveTo(50, 0); ctx.lineTo(50, 12); ctx.stroke(); }
      else if (k === 'tag') { A.rect(ctx, -30, -16, 60, 32, '#d8d0b8'); A.line(ctx, -20, -4, 20, -4, '#5a5040', 2); A.line(ctx, -20, 6, 10, 6, '#5a5040', 2); }
      else { A.rect(ctx, -10, -40, 20, 70, '#1a3a2a'); A.rect(ctx, -5, -58, 10, 20, '#1a3a2a'); }
      ctx.restore();
    }
    // 가라앉는 사람 (당신)
    A.figure(ctx, 760, 1000, { h: 360, color: '#03080b', pose: 'hang', lean: 0.3, rim: '#6ab0b8', rimDir: -1, rimA: 0.6 });
    // 기포
    for (let i = 0; i < 90; i++) { const x = r() * W * 0.8, y = r() * H, s = 1 + r() * 7; ctx.strokeStyle = A.rgba('#a8e0e8', 0.25 + r() * 0.35); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.stroke(); }
    A.mark(760, 120, 300, '#8ad0d8', 'water');
    // 바닥의 모래와 종
    A.vgrad(ctx, 0, 940, W, H, [[0, '#02060a', 0], [1, '#000000', 0.8]]);
    ctx.fillStyle = A.rgba('#050c10'); ctx.beginPath(); ctx.moveTo(1180, 1080); ctx.quadraticCurveTo(1180, 860, 1320, 850); ctx.quadraticCurveTo(1460, 860, 1460, 1080); ctx.fill();
  };
  S.void.focus = 0.4;
})(window);
