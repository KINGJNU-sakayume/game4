/* 탱고 레테 — 바깥 장면과 표제 그림 */
(function (G) {
  'use strict';
  const A = G.ART;
  const S = A.scenes;

  /* 빨래 한 장 (셔츠/속치마/기저귀/수건) */
  A.laundry = function (ctx, x, y, s, kind, color, r) {
    ctx.fillStyle = A.rgba(color);
    ctx.save(); ctx.translate(x, y); ctx.rotate((r() - 0.5) * 0.12);
    if (kind === 0) { // 셔츠
      A.spath(ctx, [[-14, 0, 1], [14, 0, 1], [26, 10], [22, 18], [16, 14], [16, 44, 1], [-16, 44, 1], [-16, 14], [-22, 18], [-26, 10]], s); ctx.fill();
    } else if (kind === 1) { // 속치마
      A.spath(ctx, [[-12, 0, 1], [12, 0, 1], [20, 46], [14, 50], [4, 47], [-6, 51], [-20, 46]], s); ctx.fill();
    } else if (kind === 2) { // 기저귀·수건
      ctx.fillRect(-12 * s, 0, 24 * s, 26 * s);
    } else { // 바지
      A.spath(ctx, [[-12, 0, 1], [12, 0, 1], [13, 50, 1], [4, 50, 1], [0, 16], [-4, 50, 1], [-13, 50, 1]], s); ctx.fill();
    }
    ctx.restore();
    A.rect(ctx, x - 12 * s, y - 3, 3, 6, '#2a2a2a'); A.rect(ctx, x + 9 * s, y - 3, 3, 6, '#2a2a2a');
  };
  /* 빨랫줄: 두 점 사이 늘어진 줄에 빨래를 건다 */
  A.clothesline = function (ctx, x0, y0, x1, y1, sag, s, r, colors, o = {}) {
    A.wire(ctx, x0, y0, x1, y1, sag, o.wire || '#1a1a1a', Math.max(1, s));
    const n = Math.max(2, Math.floor(Math.abs(x1 - x0) / (60 * s)));
    for (let i = 0; i < n; i++) {
      if (r() < (o.gap || 0.3)) continue;
      const t = (i + 0.5) / n;
      const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * ((x0 + x1) / 2) + t * t * x1;
      const y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * ((y0 + y1) / 2 + sag * 2) + t * t * y1;
      A.laundry(ctx, x, y, s, r.int(0, 3), r.pick(colors), r);
    }
  };
  /* 비상계단 (벽면을 따라 지그재그) */
  A.fireEscape = function (ctx, pts, c, w = 3) {
    ctx.strokeStyle = A.rgba(c); ctx.lineWidth = w;
    for (let i = 0; i < pts.length - 1; i++) {
      const [a, b] = [pts[i], pts[i + 1]];
      // 층계참
      A.rect(ctx, a[0] - 60, a[1], 120, w * 2, c);
      ctx.beginPath(); ctx.moveTo(a[0] - 60, a[1] - 34); ctx.lineTo(a[0] + 60, a[1] - 34); ctx.stroke();
      for (let k = -60; k <= 60; k += 12) { ctx.beginPath(); ctx.moveTo(a[0] + k, a[1]); ctx.lineTo(a[0] + k, a[1] - 34); ctx.stroke(); }
      // 계단
      ctx.beginPath(); ctx.moveTo(a[0] + (i % 2 ? -50 : 50), a[1]); ctx.lineTo(b[0] + (i % 2 ? 50 : -50), b[1]); ctx.stroke();
      const n = 10;
      for (let k = 0; k <= n; k++) { const t = k / n; const x = A.lerp(a[0] + (i % 2 ? -50 : 50), b[0] + (i % 2 ? 50 : -50), t), y = A.lerp(a[1], b[1], t); ctx.beginPath(); ctx.moveTo(x - 8, y); ctx.lineTo(x + 8, y); ctx.stroke(); }
    }
    const last = pts[pts.length - 1];
    A.rect(ctx, last[0] - 60, last[1], 120, w * 2, c);
  };
  /* 쓰레기통 */
  A.bin = function (ctx, x, yb, s, c, lid) {
    A.poly(ctx, [[x - 30 * s, yb], [x + 30 * s, yb], [x + 34 * s, yb - 80 * s], [x - 34 * s, yb - 80 * s]], c);
    for (const k of [0.3, 0.65]) A.rect(ctx, x - 33 * s, yb - 80 * s * k, 66 * s, 3 * s, A.shade(c, 0.7));
    ctx.fillStyle = A.rgba(lid || A.shade(c, 1.2)); ctx.beginPath(); ctx.ellipse(x, yb - 82 * s, 38 * s, 8 * s, 0, 0, Math.PI * 2); ctx.fill();
  };
  /* 고양이 (앉은 옆모습) */
  A.cat = function (ctx, x, yb, s, c) {
    ctx.fillStyle = A.rgba(c);
    ctx.beginPath(); ctx.ellipse(x, yb - 16 * s, 16 * s, 17 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 8 * s, yb - 38 * s, 10 * s, 0, Math.PI * 2); ctx.fill();
    A.poly(ctx, [[x + 1 * s, yb - 44 * s], [x + 3 * s, yb - 56 * s], [x + 8 * s, yb - 46 * s]], c);
    A.poly(ctx, [[x + 10 * s, yb - 46 * s], [x + 15 * s, yb - 56 * s], [x + 17 * s, yb - 42 * s]], c);
    ctx.strokeStyle = A.rgba(c); ctx.lineWidth = 4 * s; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - 14 * s, yb - 4 * s); ctx.quadraticCurveTo(x - 34 * s, yb - 2 * s, x - 30 * s, yb - 26 * s); ctx.stroke();
  };
  /* 비둘기 */
  A.pigeon = function (ctx, x, y, s, c) {
    ctx.fillStyle = A.rgba(c);
    ctx.beginPath(); ctx.ellipse(x, y, 11 * s, 7 * s, -0.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 9 * s, y - 7 * s, 4.5 * s, 0, Math.PI * 2); ctx.fill();
    A.poly(ctx, [[x - 9 * s, y], [x - 20 * s, y + 3 * s], [x - 8 * s, y + 5 * s]], c);
  };

  /* 은빛 물골: 구불구불한 부드러운 선 (멀수록 가늘고 좁다) */
  A.channel = function (ctx, x0, y0, len, r, o = {}) {
    const pts = [[x0, y0]];
    let x = x0, y = y0, dx = (o.drift || 0);
    for (let k = 1; k < (o.n || 10); k++) { const t = k / (o.n || 10); dx += (r() - 0.5) * 50 * (0.3 + t); x += dx * 0.4 + (r() - 0.5) * 30 * (0.3 + t * 2); y += (len / (o.n || 10)) * (0.4 + t * 1.2); pts.push([x, y]); }
    for (let pass = 0; pass < 2; pass++) {
      ctx.strokeStyle = A.rgba(pass ? (o.color || '#eef2f2') : (o.dark || '#000000'), pass ? (o.a || 0.6) : 0.15);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (let i = 1; i < pts.length; i++) {
        const t = i / pts.length;
        ctx.lineWidth = (o.w || 5) * (0.25 + t * t * 1.6) + (pass ? 0 : 2);
        const p0 = pts[i - 1], p1 = pts[i], m0 = i > 1 ? [(pts[i - 2][0] + p0[0]) / 2, (pts[i - 2][1] + p0[1]) / 2] : p0, m1 = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
        ctx.beginPath(); ctx.moveTo(m0[0], m0[1]); ctx.quadraticCurveTo(p0[0], p0[1], m1[0], m1[1]); ctx.stroke();
      }
    }
  };

  /* ───────── 레테 뒷마당 ─────────
   * 무도장 뒷벽과 공동주택 옆벽 사이의 좁은 틈. 하늘은 긴 띠, 빨랫줄 수십 가닥, 쓰레기통 셋, 병 상자,
   * 지그재그 비상계단(맨 아래 사다리는 걷어 올려져 있다), 쓰레기통 위의 고양이.
   */
  S.backyard = function (ctx, W, H, r, v) {
    const N = !!v.night;
    const P = A.space([860, 640], [720, 260, 1000, 700]);
    const C = N ? { sky: [[0, '#0a1420'], [1, '#1c2632']], wallL: '#1c1a1e', wallR: '#161c22', ground: ['#10141a', '#050608'], lamp: '#ffc070', dark: '#060708' }
      : { sky: [[0, '#a8b4b8'], [1, '#d8d6cc']], wallL: '#7a5a48', wallR: '#8a8474', ground: ['#5a5a58', '#2a2a2c'], lamp: '#ffe0a0', dark: '#2a2624' };
    // 하늘 띠
    A.vgrad(ctx, 0, 0, W, 700, C.sky);
    if (N) A.stars(ctx, W, 400, 40, r);
    // 골목 끝: 부두와 크레인
    const ex0 = P.at(0, 0), ex1 = P.at(1, 1);
    A.vgrad(ctx, ex0[0], ex1[1] - 110, ex1[0] - ex0[0], ex1[1], N ? [[0, '#1a2a34'], [1, '#0a141a']] : [[0, '#b8c0bc'], [1, '#8a9a98']]);
    A.craneRow(ctx, ex0[0] - 20, ex1[0] + 20, ex1[1] - 100, 0.3, N ? '#070a0e' : '#7a4a3a', r, { n: 2 });
    A.rect(ctx, ex0[0], ex1[1] - 30, ex1[0] - ex0[0], 30, N ? '#0a0c0e' : '#5a5a56');
    if (N) A.light(ctx, (ex0[0] + ex1[0]) / 2, ex1[1] - 60, { r: 60, color: '#ffc070', kind: 'lamp' });
    // 벽들
    const far = 6;
    A.poly(ctx, [[0, -200], P.at(0, -1), P.at(0, 1), [0, H]], C.wallL);
    A.poly(ctx, [[W, -200], P.at(1, -1), P.at(1, 1), [W, H]], C.wallR);
    // 벽 음영
    ctx.fillStyle = A.lineGrad(ctx, 0, 0, 720, 0, [[0, '#000000', 0.45], [1, '#000000', 0.05]]); A.poly(ctx, [[0, -200], P.at(0, -1), P.at(0, 1), [0, H]]); ctx.fill();
    ctx.fillStyle = A.lineGrad(ctx, W, 0, 1000, 0, [[0, '#000000', 0.5], [1, '#000000', 0.1]]); A.poly(ctx, [[W, -200], P.at(1, -1), P.at(1, 1), [W, H]]); ctx.fill();
    // 벽돌 줄 (왼쪽 벽)
    for (let vv = -0.9; vv < 1; vv += 0.05) A.wallRect(ctx, P, 'L', 1, far, vv, vv + 0.006, A.shade(C.wallL, 0.7));
    // 창문들 (오른쪽 벽: 공동주택)
    const ss = A.depths(1.05, far, 7);
    for (let i = 0; i < 7; i++) for (const vv of [-0.8, -0.45, -0.1, 0.25]) {
      const on = N && r() < 0.4;
      A.wallRect(ctx, P, 'R', ss[i] * 1.04, ss[i + 1] * 0.96, vv, vv + 0.2, on ? A.mix('#ffb060', '#ffe0a0', r()) : (N ? '#07090c' : '#3a3e40'));
      A.wallRect(ctx, P, 'R', ss[i] * 1.02, ss[i + 1] * 0.98, vv + 0.2, vv + 0.225, A.shade(C.wallR, 0.6));
    }
    // 바닥
    ctx.fillStyle = A.lineGrad(ctx, 0, 700, 0, H, [[0, C.ground[0]], [1, C.ground[1]]]);
    A.poly(ctx, [[0, H], [W, H], P.at(1, 1), P.at(0, 1)]); ctx.fill();
    A.floorGrid(ctx, P, 0, 1, 1, far, 6, 22, (c, q, i, j) => { if ((i * 7 + j * 3) % 5 === 0) A.poly(c, q, A.shade(C.ground[0], 1.06)); });
    // 웅덩이
    for (const [u, sv, rw] of [[0.4, 3, 170], [0.7, 1.8, 90]]) { const p = P.at(u, 1, sv); ctx.fillStyle = A.rgba(N ? '#1a2a38' : '#9aa6a8', 0.6); ctx.beginPath(); ctx.ellipse(p[0], p[1], rw, rw * 0.12, 0, 0, Math.PI * 2); ctx.fill(); }
    // 무도장 뒷문과 등
    const d0 = P.at(0, 0.45, 2.2), d1 = P.at(0, 1, 2.9);
    A.poly(ctx, [P.at(0, 0.45, 2.2), P.at(0, 0.45, 2.9), P.at(0, 1, 2.9), P.at(0, 1, 2.2)], N ? '#2a1a14' : '#3a2a20');
    const lampP = P.at(0, 0.3, 2.55);
    A.rect(ctx, lampP[0] - 4, lampP[1] - 6, 30, 6, C.dark);
    if (N) { A.light(ctx, lampP[0] + 26, lampP[1] + 6, { r: 90, color: C.lamp, kind: 'lamp' }); A.cone(ctx, lampP[0] + 26, lampP[1] + 6, 1.35, 0.6, 700, C.lamp, 0.1); A.pool(ctx, d1[0] + 160, d1[1] + 10, 300, 50, C.lamp, 0.3); }
    void d0;
    // 비상계단 (왼쪽 벽): 층계참 상자 + 난간 + 사선 계단, 맨 아래 사다리는 걷어 올려져 있다
    const FE = N ? '#040405' : '#24160f';
    const lv = [-1.3, -0.85, -0.4, 0.05, 0.5];
    for (let k = 0; k < lv.length; k++) {
      const v0 = lv[k], s0 = 1.55, s1 = 2.35;
      A.box3(ctx, P, 0, 0.16, v0, v0 + 0.02, s0, s1, { front: FE, top: FE, bottom: FE, side: FE });
      const rail = (u, vv, sv) => P.at(u, vv, sv);
      const ra = rail(0.16, v0 - 0.12, s0), rb = rail(0.16, v0 - 0.12, s1);
      A.line(ctx, ra[0], ra[1], rb[0], rb[1], FE, 3);
      for (const sv of A.depths(s0, s1, 8)) { const p0 = rail(0.16, v0, sv), p1 = rail(0.16, v0 - 0.12, sv); A.line(ctx, p0[0], p0[1], p1[0], p1[1], FE, 2); }
      if (k < lv.length - 1) {
        const up = k % 2 === 0;
        const a0 = rail(0.08, lv[k + 1] + 0.02, up ? s0 : s1), a1 = rail(0.08, v0, up ? s1 * 0.97 : s0 * 1.03);
        A.line(ctx, a0[0], a0[1], a1[0], a1[1], FE, 5);
        const b0 = rail(0.08, lv[k + 1] - 0.1, up ? s0 : s1), b1 = rail(0.08, v0 - 0.12, up ? s1 * 0.97 : s0 * 1.03);
        A.line(ctx, b0[0], b0[1], b1[0], b1[1], FE, 2.5);
        for (let t = 0.08; t < 1; t += 0.08) { const x = A.lerp(a0[0], a1[0], t), y = A.lerp(a0[1], a1[1], t); A.line(ctx, x - 10, y, x + 10, y, FE, 2); }
      }
    }
    // 걷어 올린 사다리 (맨 아래 층계참에 매달림)
    const la = P.at(0.12, 0.52, 2.05), lb2 = P.at(0.12, 0.74, 2.05), lc2 = P.at(0.12, 0.52, 2.25), ld2 = P.at(0.12, 0.74, 2.25);
    A.line(ctx, la[0], la[1], lb2[0], lb2[1], FE, 4); A.line(ctx, lc2[0], lc2[1], ld2[0], ld2[1], FE, 4);
    for (let t = 0.1; t < 1; t += 0.14) A.line(ctx, A.lerp(la[0], lb2[0], t), A.lerp(la[1], lb2[1], t), A.lerp(lc2[0], ld2[0], t), A.lerp(lc2[1], ld2[1], t), FE, 3);
    // 빨랫줄: 깊이 s 에서 양쪽 벽을 잇는다 (화면 y 를 직접 고른다)
    const cols = N ? ['#3a4450', '#2e3844', '#4a4a56', '#343c44'] : ['#f0ece2', '#e8d8c8', '#c8d8e0', '#e0c0b0', '#f4f0e8', '#a8b8c0'];
    const lines = [[1.25, 470, 1.3], [1.45, 390, 1.35], [1.7, 300, 1.8], [2.0, 200, 1.9], [2.5, 110, 2.6], [1.15, 540, 1.1], [3.2, 40, 3.4], [1.35, 330, 1.2]];
    for (const [sa, y, sb] of lines) {
      const xa = P.at(0, 0.5, sa)[0], xb = P.at(1, 0.5, sb)[0];
      const k = Math.sqrt((sa + sb) / 2);
      A.clothesline(ctx, xa, y, xb, y + (sb - sa) * 40, 10 + 14 * k, 0.9 * k, r, cols, { wire: N ? '#0a0a0c' : '#2a2a2a', gap: 0.2 });
    }
    // 쓰레기통 셋과 고양이, 병 상자
    const bc = N ? '#1a1e22' : '#5a6660';
    for (const [u, sv] of [[0.78, 1.5], [0.9, 1.65], [0.72, 1.9]]) { const p = P.at(u, 1, sv); A.bin(ctx, p[0], p[1], sv * 0.8, bc); }
    const cp = P.at(0.9, 1, 1.65); A.cat(ctx, cp[0], cp[1] - 80 * 1.65 * 0.8 - 8, 1.6, N ? '#050505' : '#1a1614');
    if (N) { A.glow(ctx, cp[0] + 12, cp[1] - 170, 8, '#d0ff80', 0.8); A.mark(cp[0] + 12, cp[1] - 170, 6, '#d0ff80', 'eyes'); }
    for (const [u, sv] of [[0.24, 1.6], [0.3, 1.75]]) { A.box3(ctx, P, u - 0.08, u + 0.08, 0.86, 1, sv, sv * 1.08, { front: N ? '#2a2016' : '#8a6a44', top: N ? '#1a120c' : '#5a4430', side: N ? '#1e160e' : '#6a5034' }); const p = P.at(u, 0.86, sv); for (let k = 0; k < 5; k++) A.rect(ctx, p[0] - 40 + k * 18, p[1] - 30, 8, 30, N ? '#1a3024' : '#3a6a4a'); }
    A.vgrad(ctx, 0, 0, W, 260, [[0, '#000000', N ? 0.3 : 0.1], [1, '#000000', 0]]);
    A.vgrad(ctx, 0, 880, W, H, [[0, '#000000', 0], [1, '#000000', 0.45]]);
  };
  S.backyard.focus = 0.4;

  /* ───────── 7번 크레인 아래 ─────────
   * 교회만 한 철골 탑이 올려다보인다. 지브가 바다 쪽(왼쪽 위)으로 뻗고, 그 끝의 케이블에 남자가 매달려 있다(v.body).
   * 드럼통 모닥불가의 하역부들, 양철 초소, 4번 크레인 추모비, 버려진 운반대.
   */
  S.crane = function (ctx, W, H, r, v) {
    const N = !!v.night;
    const HZ = 640;
    const C = N ? { sky: [[0, '#03070c'], [0.6, '#0e1c28'], [1, '#2a2a2c']], sea: [[0, '#16222a'], [1, '#05090c']], crane: '#0a0c0f', rust: '#1a0e0a', ground: ['#1a1c1e', '#060708'], fig: '#050607', fog: '#2a3440' }
      : { sky: [[0, '#8e9aa0'], [0.6, '#c2c4bc'], [1, '#dcd6c6']], sea: [[0, '#8a9894'], [1, '#4a5a5a']], crane: '#7a3222', rust: '#5a2418', ground: ['#8a8680', '#4a4a4a'], fig: '#1a1b1e', fog: '#c4c4ba' };
    A.vgrad(ctx, 0, 0, W, HZ, C.sky);
    if (N) { A.stars(ctx, W, 360, 120, r); A.moon(ctx, 420, 180, 38, '#e8eef0', '#8fb0c8'); A.clouds(ctx, W, H, { y0: 120, y1: 560, color: '#1a2630', a: 0.6, scale: 200, stretch: 4, seed: 3 }); }
    else { A.clouds(ctx, W, H, { y0: 0, y1: 520, color: '#f2efe6', a: 0.6, scale: 240, stretch: 4, seed: 4 }); A.clouds(ctx, W, H, { y0: 60, y1: 480, color: '#76828a', a: 0.3, scale: 180, stretch: 5, seed: 7 }); for (const [x, y, s] of [[300, 250, 1], [360, 280, 0.7], [980, 150, 0.8]]) A.gull(ctx, x, y, s, '#3a3e42'); }
    A.shore(ctx, W, HZ, 26, A.atm(N ? '#0e161c' : '#7a8482', C.fog, 0.3), r, { lights: N ? 50 : 0, seed: 17 });
    A.vgrad(ctx, 0, HZ, W, 760, C.sea);
    A.reflect(ctx, W, H, HZ, { strength: 0.35, depth: 120, ripple: 1.5 });
    A.ripples(ctx, W, HZ + 4, 760, r, N ? '#51606a' : '#e0e4dc', 0.35, 120);
    // 부두 콘크리트
    A.rect(ctx, 0, 752, W, 14, N ? '#2a2c2e' : '#a8a498');
    A.vgrad(ctx, 0, 766, W, H, [[0, C.ground[0]], [1, C.ground[1]]]);
    for (let i = 0; i < 16; i++) { const y = 766 + Math.pow(i / 16, 1.6) * 320; A.rect(ctx, 0, y, W, 1.5, A.shade(C.ground[0], 0.8), 0.6); }
    // 레일
    for (const y of [890, 1010]) { A.rect(ctx, 0, y, W, 6, N ? '#3a3c3e' : '#6a625a'); A.rect(ctx, 0, y + 6, W, 3, '#000000', 0.3); }
    // 크레인 (크게)
    const cx = 1240, cy = 1000, s = 2.35;
    const res = A.crane(ctx, cx, cy, s, { color: C.crane, jib: -0.2, dir: -1, len: 360, cable: v.body ? 120 : 200, cab: N ? '#ffd08a' : null, hang: !!v.body, hangRim: N ? '#8fb0c8' : null, hangColor: N ? '#050607' : '#1c1d20' });
    // 녹 얼룩과 번호
    ctx.save(); ctx.globalAlpha = N ? 0.3 : 0.6;
    for (let i = 0; i < 70; i++) { const y = cy - r() * 380 * s, x = cx + (r() - 0.5) * 120 * s * (1 - (cy - y) / (420 * s)); ctx.fillStyle = A.rgba(C.rust); ctx.fillRect(x, y, 3 + r() * 8, 2 + r() * 5); }
    ctx.restore();
    A.text(ctx, '7', cx - 2, cy - 330 * s, { size: 64, color: N ? '#3a3a3a' : '#e8e0d0', a: 0.85, font: '"Black Han Sans", "Liberation Sans", sans-serif' });
    if (N) { A.glow(ctx, res.tip[0], res.tip[1], 16, '#ff3030', 0.8); A.mark(res.tip[0], res.tip[1], 10, '#ff3030', 'blink'); }
    if (v.body && res.hook) { A.mark(res.hook[0], res.hook[1] + 60, 50, N ? '#8fb0c8' : '#ffffff', 'body'); }
    // 양철 초소 (오른쪽)
    A.box3(ctx, A.space([900, 560], [0, 0, 1, 1]), 0, 0, 0, 0, 1, 1, { front: null });
    A.rect(ctx, 1560, 780, 200, 220, N ? '#1a1e20' : '#8a9088');
    for (let x = 1566; x < 1760; x += 14) A.rect(ctx, x, 780, 4, 220, N ? '#141618' : '#6a706a');
    A.poly(ctx, [[1540, 790], [1780, 770], [1780, 756], [1540, 776]], N ? '#101214' : '#5a605a');
    A.rect(ctx, 1600, 830, 80, 60, N ? '#ffc070' : '#3a4448');
    if (N) { A.light(ctx, 1640, 860, { r: 70, color: '#ffc070', kind: 'window', core: false }); A.figure(ctx, 1640, 960, { h: 150, color: '#1a1008', hat: 'cap' }); }
    // 4번 크레인 추모비
    A.rect(ctx, 250, 930, 90, 120, N ? '#2a2826' : '#8a8478'); A.rect(ctx, 240, 922, 110, 12, N ? '#3a3834' : '#a09a8c');
    for (let i = 0; i < 5; i++) { const x = 250 + i * 22; A.rect(ctx, x, 1040, 5, 14, '#e8e0c8'); A.glow(ctx, x + 2, 1036, 20, '#ffb060', N ? 0.7 : 0.35); A.mark(x + 2, 1036, 8, '#ffb060', 'candle'); }
    for (let i = 0; i < 6; i++) { ctx.fillStyle = A.rgba(r.pick(['#c03040', '#e8d0a0', '#f0f0e8'])); ctx.beginPath(); ctx.arc(236 + r() * 120, 1050 + r() * 10, 6, 0, Math.PI * 2); ctx.fill(); }
    // 운반대
    for (let i = 0; i < 3; i++) A.rect(ctx, 1840 - i * 8, 1000 - i * 26, 200, 20, N ? '#2a2016' : '#8a6a44');
    // 모닥불과 하역부들
    A.barrelFire(ctx, 640, 1010, 1.25, r, { smokeC: N ? '#4a403a' : '#a09a92' });
    A.figure(ctx, 540, 1030, { h: 250, color: C.fig, hat: 'cap', pose: 'pockets', rim: '#ff9a4a', rimDir: 1, coat: true, body: 'coat' });
    A.figure(ctx, 740, 1024, { h: 270, color: C.fig, hat: 'beret', pose: 'crossed', rim: '#ff9a4a', rimDir: -1, build: 'wide' });
    A.figure(ctx, 800, 1050, { h: 230, color: C.fig, pose: 'smoke', hat: 'cap', rim: '#ff9a4a', rimDir: -1, flip: true });
    // 돌 던지는 꼬마 (시신이 있을 때)
    if (v.body) A.figure(ctx, 420, 1000, { h: 130, color: C.fig, build: 'child', hat: 'cap', pose: 'reach' });
    A.band(ctx, W, 740, 80, C.fog, N ? 0.2 : 0.3);
    A.vgrad(ctx, 0, 960, W, H, [[0, '#000000', 0], [1, '#000000', 0.35]]);
  };
  S.crane.focus = 0.3;

  /* ───────── 익사한 종의 교회 ─────────
   * 지붕 절반이 없는 신랑. 부서진 신도석과 잡초, 빗물 웅덩이, 녹아 붙은 촛불의 제단,
   * 지붕 틈으로 보이는 종탑(안테나와 깜빡이는 붉은 등, "라디오 레테 — 97.3" 천).
   */
  S.church = function (ctx, W, H, r, v) {
    const N = !!v.night;
    const P = A.space([900, 560], [640, 280, 1160, 720]);
    const C = N ? { sky: [[0, '#04070e'], [1, '#18223a']], stone: '#2a2a30', stone2: '#1e1e24', floor: '#1a1a1e', pew: '#1a120c', weed: '#0e1a10', candle: '#ffc070' }
      : { sky: [[0, '#9aa8b0'], [1, '#dcdad0']], stone: '#b8b0a0', stone2: '#9a9284', floor: '#8a8478', pew: '#5a3e28', weed: '#4a6a3a', candle: '#ffd890' };
    // 하늘 (지붕이 없는 부분)
    A.vgrad(ctx, 0, 0, W, 700, C.sky);
    if (N) { A.stars(ctx, W, 500, 160, r); A.moon(ctx, 1500, 120, 30, '#e8eef0', '#8fb0c8'); }
    else A.clouds(ctx, W, H, { y0: 0, y1: 400, color: '#f4f2ea', a: 0.6, scale: 220, stretch: 3, seed: 21 });
    // 종탑 (지붕 틈 너머, 오른쪽 위)
    const tx = 1380;
    A.rect(ctx, tx - 70, 60, 140, 700, N ? '#14161c' : '#8a8274');
    A.poly(ctx, [[tx - 80, 60], [tx, -60], [tx + 80, 60]], N ? '#101218' : '#6a6458');
    A.rect(ctx, tx - 40, 110, 80, 110, N ? '#05060a' : '#3a3a3a');
    ctx.strokeStyle = A.rgba(N ? '#2a2c34' : '#2a2a2a'); ctx.lineWidth = 1.5;
    for (let i = 0; i < 16; i++) { ctx.beginPath(); ctx.moveTo(tx - 40 + r() * 80, 110 + r() * 110); ctx.lineTo(tx - 40 + r() * 80, 110 + r() * 110); ctx.stroke(); }
    A.line(ctx, tx, -60, tx, -160, N ? '#2a2c34' : '#2a2a2a', 3); A.line(ctx, tx - 40, -120, tx + 40, -120, N ? '#2a2c34' : '#2a2a2a', 2);
    A.line(ctx, tx + 20, 60, tx + 120, -40, N ? '#2a2c34' : '#2a2a2a', 2); A.line(ctx, tx + 90, -20, tx + 150, -20, N ? '#2a2c34' : '#2a2a2a', 2);
    A.light(ctx, tx + 120, -40, { r: 30, color: '#ff3030', kind: 'blink' });
    A.light(ctx, tx, 30, { r: 26, color: '#ff3030', kind: 'blink' });
    // 걸린 천
    ctx.save(); ctx.translate(tx, 240); ctx.rotate(0.02);
    A.poly(ctx, [[-60, 0], [60, 0], [56, 90], [30, 84], [0, 92], [-30, 86], [-58, 92]], N ? '#8a8478' : '#ece6d6');
    ctx.fillStyle = A.rgba('#9a1a1a'); ctx.font = '700 22px "Black Han Sans", sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('라디오 레테', 0, 34); ctx.font = '700 26px "Liberation Sans", sans-serif'; ctx.fillText('97.3', 0, 68);
    ctx.restore();
    if (N) { A.glow(ctx, tx, 165, 90, '#ffcf8a', 0.3); A.mark(tx, 165, 40, '#ffcf8a', 'window'); }
    // 신랑의 벽 (양옆)과 남은 지붕
    const wallC = C.stone;
    A.poly(ctx, [[0, H], [0, 220], P.at(0, 0.35), P.at(0, 1)], A.shade(wallC, 0.75));
    A.poly(ctx, [[W, H], [W, 380], P.at(1, 0.4), P.at(1, 1)], A.shade(wallC, 0.62));
    A.rect(ctx, P.at(0, 0.3)[0], P.at(0, 0.3)[1], P.at(1, 1)[0] - P.at(0, 0.3)[0], P.at(0, 1)[1] - P.at(0, 0.3)[1], C.stone2);
    // 제단 뒤 둥근 창 (깨진 장미창): 납선과 꽃잎 모양 칸, 몇 칸은 유리가 빠져 하늘이 보인다
    const rc = P.at(0.5, 0.52), RR = 108;
    ctx.fillStyle = A.rgba(N ? '#0a0e1a' : '#dfe4e2'); ctx.beginPath(); ctx.arc(rc[0], rc[1], RR, 0, Math.PI * 2); ctx.fill();
    const glass = N ? ['#2e1a22', '#1a2236', '#3a3020', '#1a2c24'] : ['#7a4a44', '#4a5a74', '#9a8458', '#4a6a5a'];
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * Math.PI * 2;
      if (r() < 0.25) continue;
      ctx.fillStyle = A.rgba(glass[i % 4], N ? 0.7 : 0.72);
      ctx.beginPath(); ctx.moveTo(rc[0] + Math.cos(a) * RR * 0.34, rc[1] + Math.sin(a) * RR * 0.34);
      ctx.arc(rc[0], rc[1], RR * 0.94, a + 0.04, a + Math.PI / 6 - 0.04); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = A.rgba(glass[2], 0.85); ctx.beginPath(); ctx.arc(rc[0], rc[1], RR * 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = A.rgba(C.stone2); ctx.lineWidth = 5;
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(rc[0] + Math.cos(a) * RR * 0.3, rc[1] + Math.sin(a) * RR * 0.3); ctx.lineTo(rc[0] + Math.cos(a) * RR, rc[1] + Math.sin(a) * RR); ctx.stroke(); }
    for (let i = 0; i < 12; i++) { const a = (i + 0.5) / 12 * Math.PI * 2; ctx.beginPath(); ctx.arc(rc[0] + Math.cos(a) * RR * 0.72, rc[1] + Math.sin(a) * RR * 0.72, RR * 0.13, 0, Math.PI * 2); ctx.stroke(); }
    ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(rc[0], rc[1], RR * 0.3, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(rc[0], rc[1], RR + 4, 0, Math.PI * 2); ctx.stroke();
    // 옆벽의 높은 창과 기둥
    for (const sv of A.depths(1.1, 3.2, 4)) {
      const a = P.at(0, 0.42, sv), b = P.at(0, 0.75, sv * 1.1);
      A.poly(ctx, [[a[0], a[1]], [b[0], a[1] + (b[0] - a[0]) * 0.1], [b[0], b[1]], [a[0], b[1]]], N ? '#0a0e18' : '#c8d0d0');
      const c1 = P.at(1, 0.4, sv), c2 = P.at(1, 1, sv);
      A.rect(ctx, c1[0] - 14 * sv, c1[1], 28 * sv, c2[1] - c1[1], A.shade(wallC, 0.5));
    }
    // 남은 지붕 서까래 (오른쪽)
    ctx.strokeStyle = A.rgba(N ? '#0a0806' : '#3a2a1e');
    for (let i = 0; i < 7; i++) { ctx.lineWidth = 10 - i; const x0 = W - i * 90, y0 = 380 - i * 30; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 - 380, y0 - 260 + i * 14); ctx.stroke(); }
    A.line(ctx, W, 380, 1060, 230, N ? '#0a0806' : '#3a2a1e', 14);
    // 바닥 (대리석 + 웅덩이)
    ctx.fillStyle = A.lineGrad(ctx, 0, 720, 0, H, [[0, C.floor], [1, A.shade(C.floor, 0.5)]]);
    A.poly(ctx, [[0, H], [W, H], P.at(1, 1), P.at(0, 1)]); ctx.fill();
    A.floorGrid(ctx, P, -0.5, 1.5, 1, 4, 10, 12, (c, q, i, j) => { if ((i + j) % 2) A.poly(c, q, A.shade(C.floor, 0.9)); });
    for (const [u, sv, rw] of [[0.3, 1.6, 180], [0.62, 2.4, 260], [0.2, 3.2, 200]]) {
      const p = P.at(u, 1, sv);
      ctx.save(); ctx.beginPath(); ctx.ellipse(p[0], p[1], rw, rw * 0.13, 0, 0, Math.PI * 2); ctx.clip();
      A.vgrad(ctx, p[0] - rw, p[1] - rw * 0.13, rw * 2, p[1] + rw * 0.13, N ? [[0, '#18223a'], [1, '#04070e']] : [[0, '#dcdad0'], [1, '#9aa8b0']]);
      if (N) A.stars(ctx, W, H, 30, r);
      ctx.restore();
    }
    // 제단과 촛불
    A.box3(ctx, P, 0.34, 0.66, 0.78, 1, 1.02, 1.12, { front: A.shade(wallC, 0.8), top: A.shade(wallC, 1.1), side: A.shade(wallC, 0.6) });
    for (let i = 0; i < 26; i++) {
      const p = P.at(0.36 + r() * 0.28, 0.78, 1.04 + r() * 0.07), h = 8 + r() * 26;
      A.rect(ctx, p[0] - 3, p[1] - h, 6, h, '#efe6cc');
      A.glow(ctx, p[0], p[1] - h - 4, 22, C.candle, N ? 0.7 : 0.3);
      if (r() < 0.3) A.mark(p[0], p[1] - h - 4, 10, C.candle, 'candle');
    }
    if (N) A.pool(ctx, 900, 740, 300, 60, C.candle, 0.3);
    // 커다란 책 (제단 위)
    const bk = P.at(0.5, 0.78, 1.08);
    A.poly(ctx, [[bk[0] - 50, bk[1] - 6], [bk[0], bk[1] - 16], [bk[0] + 50, bk[1] - 6], [bk[0], bk[1] + 2]], '#efe6cc');
    // 부서진 신도석 (등받이 + 좌석)
    for (const sv of A.depths(1.25, 3.4, 8)) for (const [u0, u1] of [[0.0, 0.4], [0.6, 1.0]]) {
      if (r() < 0.22) continue;
      const cut = r() < 0.3 ? 0.1 + r() * 0.12 : 0;
      const a0 = u0 + (u0 < 0.5 ? cut : 0), a1 = u1 - (u0 < 0.5 ? 0 : cut);
      A.box3(ctx, P, a0, a1, 0.955, 0.965, sv * 0.985, sv * 1.012, { front: A.shade(C.pew, 0.8), top: A.shade(C.pew, 1.35), side: A.shade(C.pew, 0.6) });
      A.box3(ctx, P, a0, a1, 0.905, 0.965, sv * 1.012, sv * 1.02, { front: C.pew, top: A.shade(C.pew, 1.3), side: A.shade(C.pew, 0.65) });
      for (const u of [a0 + 0.01, a1 - 0.02]) A.box3(ctx, P, u, u + 0.012, 0.9, 1, sv * 0.99, sv * 1.02, { front: A.shade(C.pew, 0.7), top: A.shade(C.pew, 1.2), side: A.shade(C.pew, 0.5) });
    }
    // 잡초
    for (let i = 0; i < 160; i++) {
      const sv = 1.2 + r() * 2.6, p = P.at(r() * 1.6 - 0.3, 1, sv);
      const h = (6 + r() * 16) * sv; ctx.strokeStyle = A.rgba(C.weed); ctx.lineWidth = 1.5 * sv * 0.6;
      ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.quadraticCurveTo(p[0] + (r() - 0.5) * 10, p[1] - h * 0.6, p[0] + (r() - 0.5) * 16, p[1] - h); ctx.stroke();
    }
    // 무너진 돌 더미
    for (let i = 0; i < 14; i++) { const p = P.at(0.9 + r() * 0.5, 1, 1.4 + r() * 0.6); A.poly(ctx, [[p[0], p[1]], [p[0] + 40, p[1] - 10], [p[0] + 60, p[1] + 4], [p[0] + 20, p[1] + 14]], A.shade(wallC, 0.5 + r() * 0.3)); }
    A.vgrad(ctx, 0, 900, W, H, [[0, '#000000', 0], [1, '#000000', 0.4]]);
  };
  S.church.focus = 0.45;

  /* ───────── 벌집 공동주택 안뜰 ─────────
   * 네모나게 둘러싼 5층 건물, 벌집 칸 같은 발코니, 발코니 사이의 빨랫줄, 가운데 녹슨 수동 펌프,
   * 뛰어노는 아이들, 문간의 할머니들. 밤: 창마다 불빛, 어둠 속에서 유령처럼 흔들리는 빨래.
   */
  S.honeycomb = function (ctx, W, H, r, v) {
    const N = !!v.night;
    const P = A.space([880, 620], [420, 100, 1340, 760]);
    const C = N ? { sky: [[0, '#070c16'], [1, '#18222e']], wall: '#1e2228', side: '#15181c', bal: '#0a0b0d', ground: ['#14161a', '#060708'], win: '#ffb868', off: '#08090b', fig: '#050607' }
      : { sky: [[0, '#a8b6c0'], [1, '#dcdcd0']], wall: '#c8a07a', side: '#a8805e', bal: '#4a3a2e', ground: ['#8a8070', '#4a4640'], win: '#ffcc80', off: '#3a3430', fig: '#1c1a18' };
    A.vgrad(ctx, 0, 0, W, 200, C.sky);
    if (N) A.stars(ctx, W, 120, 40, r);
    // 벽 세 면
    A.poly(ctx, [[0, -300], P.at(0, -0.6), P.at(0, 1), [0, H]], C.side);
    A.poly(ctx, [[W, -300], P.at(1, -0.6), P.at(1, 1), [W, H]], A.shade(C.side, 0.9));
    const b0 = P.at(0, 0.02), b1 = P.at(1, 1);
    A.rect(ctx, b0[0], b0[1], b1[0] - b0[0], b1[1] - b0[1], C.wall);
    ctx.fillStyle = A.lineGrad(ctx, 0, 0, 420, 0, [[0, '#000000', 0.45], [1, '#000000', 0.1]]); A.poly(ctx, [[0, -300], P.at(0, -0.6), P.at(0, 1), [0, H]]); ctx.fill();
    ctx.fillStyle = A.lineGrad(ctx, W, 0, 1340, 0, [[0, '#000000', 0.5], [1, '#000000', 0.12]]); A.poly(ctx, [[W, -300], P.at(1, -0.6), P.at(1, 1), [W, H]]); ctx.fill();
    // 뒷벽: 층마다 발코니와 문/창
    const floors = 5, bays = 7;
    for (let f = 0; f < floors; f++) {
      const v0 = 0.05 + f * 0.18, v1 = v0 + 0.13;
      for (let b = 0; b < bays; b++) {
        const u0 = 0.04 + b / bays, u1 = u0 + 0.08;
        const on = N ? r() < 0.45 : false;
        A.wallRect(ctx, P, 'B', u0, u1, v0, v1, on ? A.mix(C.win, '#ffe6b0', r() * 0.6) : C.off);
        if (on) A.glow(ctx, P.at((u0 + u1) / 2, (v0 + v1) / 2)[0], P.at(0, (v0 + v1) / 2)[1], 50, C.win, 0.3);
        if (!N && r() < 0.5) A.wallRect(ctx, P, 'B', u0, (u0 + u1) / 2, v0, v1, r.pick(['#6a3a2a', '#3a5a4a', '#8a6a3a']));
        if (f < floors - 1) {
          A.wallRect(ctx, P, 'B', u0 - 0.01, u1 + 0.01, v1 + 0.005, v1 + 0.02, C.bal);
          for (let k = 0; k <= 6; k++) A.wallRect(ctx, P, 'B', u0 - 0.01 + k * 0.0167, u0 - 0.007 + k * 0.0167, v1 - 0.04, v1 + 0.005, C.bal);
          A.wallRect(ctx, P, 'B', u0 - 0.01, u1 + 0.01, v1 - 0.045, v1 - 0.04, C.bal);
        }
        if (r() < 0.3) { const p = P.at(u1 - 0.015, v1 - 0.04); A.rect(ctx, p[0], p[1] - 16, 14, 16, N ? '#0a100a' : '#6a3a24'); ctx.fillStyle = A.rgba(N ? '#0a1a0c' : '#4a7a3a'); ctx.beginPath(); ctx.arc(p[0] + 7, p[1] - 22, 12, 0, Math.PI * 2); ctx.fill(); }
      }
    }
    // 옆벽의 창 줄
    for (const side of ['L', 'R']) {
      const ss = A.depths(1.05, 4.5, 5);
      for (let i = 0; i < 5; i++) for (let f = -3; f < 5; f++) {
        const vv = 0.05 + f * 0.18, on = N && r() < 0.4;
        A.wallRect(ctx, P, side, ss[i] * 1.05, ss[i + 1] * 0.95, vv, vv + 0.12, on ? A.mix(C.win, '#ffe6b0', r() * 0.6) : A.shade(C.off, 0.9));
      }
    }
    // 바닥
    ctx.fillStyle = A.lineGrad(ctx, 0, 760, 0, H, [[0, C.ground[0]], [1, C.ground[1]]]);
    A.poly(ctx, [[0, H], [W, H], P.at(1, 1), P.at(0, 1)]); ctx.fill();
    A.floorGrid(ctx, P, 0, 1, 1, 3.5, 10, 10, (c, q, i, j) => { if ((i + j) % 2) A.poly(c, q, A.shade(C.ground[0], 0.9)); });
    // 빨랫줄 (발코니 사이, 안뜰을 가로질러)
    const cols = N ? ['#3a4250', '#2c3440', '#4a4c58', '#5a5e6a'] : ['#f4f0e6', '#e6d0c0', '#c0d4dc', '#e8c8a8', '#fcfaf4', '#b0c8b8', '#d8a0a0'];
    for (let i = 0; i < 12; i++) {
      const vv = -0.5 + i * 0.1 + r() * 0.05, sa = 1.2 + r() * 2, sb = 1.2 + r() * 2;
      const a = P.at(0, vv, sa), b = P.at(1, vv + (r() - 0.5) * 0.1, sb);
      A.clothesline(ctx, a[0], a[1], b[0], b[1], 20 + r() * 20, 1.6 / Math.sqrt((sa + sb) / 2), r, cols, { wire: N ? '#0a0a0c' : '#3a3a3a', gap: 0.35 });
    }
    for (let i = 0; i < 6; i++) { const a = P.at(0.05 + r() * 0.9, 0.18 + i * 0.12), b = P.at(0.05 + r() * 0.9, 0.18 + i * 0.12); A.clothesline(ctx, Math.min(a[0], b[0]), a[1] + 10, Math.max(a[0], b[0]) + 80, a[1] + 14, 8, 0.8, r, cols, { wire: N ? '#0a0a0c' : '#3a3a3a', gap: 0.2 }); }
    if (N) A.clouds(ctx, W, H, { y0: 0, y1: 700, color: '#8a9ab0', a: 0.08, scale: 120, stretch: 2, seed: 61 });
    // 펌프
    const pp = P.at(0.5, 1, 1.9);
    A.rect(ctx, pp[0] - 16, pp[1] - 150, 32, 150, N ? '#0e1210' : '#4a5a4a');
    A.rect(ctx, pp[0] - 26, pp[1] - 158, 52, 14, N ? '#0e1210' : '#3a4a3a');
    A.line(ctx, pp[0] + 10, pp[1] - 150, pp[0] + 90, pp[1] - 190, N ? '#0e1210' : '#3a4a3a', 8);
    A.poly(ctx, [[pp[0] - 16, pp[1] - 110], [pp[0] - 60, pp[1] - 100], [pp[0] - 60, pp[1] - 90], [pp[0] - 16, pp[1] - 94]], N ? '#0e1210' : '#3a4a3a');
    ctx.fillStyle = A.rgba(N ? '#1a2a38' : '#8a9aa0', 0.7); ctx.beginPath(); ctx.ellipse(pp[0] - 60, pp[1] + 6, 90, 14, 0, 0, Math.PI * 2); ctx.fill();
    A.rect(ctx, pp[0] - 74, pp[1] - 30, 30, 30, N ? '#1a1a1a' : '#6a6a6a');
    // 아이들과 할머니들 (낮)
    if (!N) {
      for (const [u, sv, pose] of [[0.3, 2.2, 'reach'], [0.64, 2.4, 'walk'], [0.42, 2.8, 'stand'], [0.72, 1.7, 'reach']]) { const p = P.at(u, 1, sv); A.figure(ctx, p[0], p[1], { h: 70 * sv, color: C.fig, build: 'child', pose, hat: r() < 0.5 ? 'cap' : null, flip: r() < 0.5 }); }
      for (const [u, sv] of [[0.1, 1.3], [0.9, 1.2], [0.2, 2.9]]) { const p = P.at(u, 1, sv); A.figure(ctx, p[0], p[1], { h: 110 * sv, color: C.fig, pose: 'sit', body: 'skirt', build: 'woman', hat: 'scarf' }); A.rect(ctx, p[0] - 16 * sv, p[1] - 30 * sv, 32 * sv, 6 * sv, '#3a2a1a'); }
    } else {
      const d = P.at(0.36, 1, 1.02); A.light(ctx, d[0], d[1] - 90, { r: 60, color: '#ffc070', kind: 'lamp' });
    }
    A.vgrad(ctx, 0, 0, W, 240, [[0, '#000000', N ? 0.3 : 0.12], [1, '#000000', 0]]);
    A.vgrad(ctx, 0, 900, W, H, [[0, '#000000', 0], [1, '#000000', 0.4]]);
  };
  S.honeycomb.focus = 0.45;

  /* ───────── 레테 무도장 옥상 ─────────
   * 검은 타르 지붕, 네 다리의 나무 물탱크, 받침대 위 비둘기장, 난간 두른 테라스(화분, 부서진 등나무 의자),
   * 거꾸로 선 네온사인 뒷면의 철골, 난간 너머 부두와 크레인. 밤: 네온의 붉은빛이 타르를 물들인다.
   */
  S.roof = function (ctx, W, H, r, v) {
    const N = !!v.night;
    const HZ = 560;
    const C = N ? { sky: [[0, '#04080e'], [0.7, '#162230'], [1, '#3a2a30']], sea: [[0, '#16222a'], [1, '#070b0e']], tar: ['#141214', '#050405'], wood: '#1e1610', dark: '#060607', crane: '#07090c', fog: '#26303a', neon: '#ff2f5a' }
      : { sky: [[0, '#8fa0a8'], [0.7, '#c4c8c0'], [1, '#e0dac8']], sea: [[0, '#9aa6a2'], [1, '#6a7a7a']], tar: ['#3a3634', '#1a1818'], wood: '#7a5a3a', dark: '#2a2622', crane: '#7a3424', fog: '#c8c8be', neon: '#7c4b58' };
    A.vgrad(ctx, 0, 0, W, HZ, C.sky);
    if (N) { A.stars(ctx, W, 360, 160, r); A.clouds(ctx, W, H, { y0: 100, y1: 520, color: '#2a2030', a: 0.5, scale: 220, stretch: 4, seed: 8 }); }
    else { A.clouds(ctx, W, H, { y0: 0, y1: 460, color: '#f4f0e6', a: 0.55, scale: 240, stretch: 4, seed: 6 }); for (const [x, y, s] of [[700, 200, 1], [760, 230, 0.8], [1500, 160, 0.9]]) A.gull(ctx, x, y, s, '#3a3e42'); }
    A.shore(ctx, W, HZ, 30, A.atm(N ? '#0e161c' : '#7a8482', C.fog, 0.3), r, { lights: N ? 60 : 0, seed: 23 });
    A.lighthouse(ctx, 260, HZ - 6, 60, A.atm(N ? '#0e161c' : '#7a8482', C.fog, 0.2), N);
    A.vgrad(ctx, 0, HZ, W, 760, C.sea);
    A.reflect(ctx, W, H, HZ, { strength: 0.35, depth: 200, ripple: 1.3 });
    // 부두와 크레인들 (아래로 내려다봄)
    A.rect(ctx, 0, 700, W, 60, N ? '#0e1012' : '#8a8680');
    const cr = [[520, 0.5, -0.5, 1], [760, 0.55, -0.9, -1], [1020, 0.6, -0.4, 1], [1640, 1.05, -0.3, -1]];
    for (const [x, s, jib, dir] of cr) { const res = A.crane(ctx, x, 712, s, { color: A.atm(C.crane, C.fog, 0.25 - s * 0.15), jib, dir, cable: 100 }); if (N) { A.glow(ctx, res.tip[0], res.tip[1], 14, '#ff3030', 0.8); A.mark(res.tip[0], res.tip[1], 8, '#ff3030', 'blink'); } }
    A.text(ctx, '7', 1638, 712 - 330 * 1.05, { size: 34, color: N ? '#2a2a2a' : '#e8e0d0', a: 0.8, font: '"Black Han Sans", sans-serif' });
    A.band(ctx, W, 700, 80, C.fog, N ? 0.25 : 0.3);
    // 테라스 난간 (가로)
    A.rect(ctx, 0, 752, W, 10, C.dark);
    for (let x = 10; x < W; x += 34) A.rect(ctx, x, 752, 5, 96, C.dark);
    A.rect(ctx, 0, 842, W, 8, C.dark);
    // 타르 지붕
    A.vgrad(ctx, 0, 850, W, H, [[0, C.tar[0]], [1, C.tar[1]]]);
    for (let i = 0; i < 40; i++) { const x = r() * W, y = 870 + r() * 200, rw = 20 + r() * 60; ctx.fillStyle = A.rgba(N ? '#2a2026' : '#5a5250', 0.5); ctx.beginPath(); ctx.ellipse(x, y, rw, rw * 0.18, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = A.rgba('#ffffff', 0.06); ctx.beginPath(); ctx.ellipse(x - rw * 0.2, y - rw * 0.05, rw * 0.4, rw * 0.05, 0, 0, Math.PI * 2); ctx.fill(); }
    // 네온사인 뒷면 (거꾸로 선 글자 철골)
    const nx = 620, ny = 300, lw = 118;
    const letters = 'EHTEL';
    for (let i = 0; i < 5; i++) {
      const x = nx + i * lw;
      ctx.strokeStyle = A.rgba(N ? '#0a0507' : '#3a3634'); ctx.lineWidth = 5;
      ctx.strokeRect(x, ny, lw - 16, 170);
      ctx.beginPath(); ctx.moveTo(x, ny); ctx.lineTo(x + lw - 16, ny + 170); ctx.moveTo(x + lw - 16, ny); ctx.lineTo(x, ny + 170); ctx.stroke();
      ctx.save(); ctx.translate(x + (lw - 16) / 2, ny + 85); ctx.scale(-1, 1);
      if (N) { A.text(ctx, letters[4 - i], 0, 0, { size: 150, neon: C.neon, font: '"Limelight", "Liberation Serif", serif' }); }
      else A.text(ctx, letters[4 - i], 0, 0, { size: 150, color: '#8a6a70', a: 0.9, font: '"Limelight", "Liberation Serif", serif' });
      ctx.restore();
    }
    for (const x of [nx + 40, nx + 300, nx + 540]) { A.line(ctx, x, ny + 170, x - 30, 850, C.dark, 7); A.line(ctx, x, ny + 170, x + 40, 850, C.dark, 5); }
    A.rect(ctx, nx - 10, ny + 170, lw * 5, 10, C.dark);
    if (N) { A.glow(ctx, nx + lw * 2.5, ny + 85, 520, C.neon, 0.22); A.mark(nx + lw * 2.5, ny + 85, 300, C.neon, 'neon'); A.pool(ctx, nx + lw * 2.5, 960, 700, 110, C.neon, 0.3); }
    // 물탱크 (왼쪽)
    const tx = 250;
    for (const dx of [-80, -30, 30, 80]) A.rect(ctx, tx + dx - 5, 700, 10, 240, C.dark);
    A.line(ctx, tx - 80, 820, tx + 80, 760, C.dark, 4); A.line(ctx, tx - 80, 760, tx + 80, 820, C.dark, 4);
    A.rect(ctx, tx - 110, 470, 220, 240, C.wood);
    for (let k = 0; k < 11; k++) A.rect(ctx, tx - 110 + k * 20, 470, 3, 240, A.shade(C.wood, 0.7));
    for (const y of [500, 600, 690]) A.rect(ctx, tx - 114, y, 228, 7, C.dark);
    A.poly(ctx, [[tx - 124, 474], [tx, 400], [tx + 124, 474]], A.shade(C.wood, 0.8));
    // 비둘기장 (받침대 위)
    const lx = 470;
    for (const dx of [-60, 60]) A.rect(ctx, lx + dx - 5, 760, 10, 170, C.dark);
    A.rect(ctx, lx - 90, 630, 180, 140, N ? '#2a2018' : '#b09070');
    A.poly(ctx, [[lx - 104, 634], [lx, 570], [lx + 104, 634]], N ? '#1a120c' : '#6a4a34');
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { ctx.fillStyle = A.rgba('#050505'); ctx.beginPath(); ctx.arc(lx - 50 + i * 50, 670 + j * 50, 14, 0, Math.PI * 2); ctx.fill(); }
    A.text(ctx, '해적만!', lx, 755, { size: 20, color: N ? '#8a3a3a' : '#a02a1a', a: 0.9, font: '"Black Han Sans", sans-serif' });
    if (!N) for (const [x, y] of [[lx - 70, 628], [lx + 20, 626], [lx + 60, 628], [560, 842], [600, 846]]) A.pigeon(ctx, x, y, 1.3, '#5a5e66');
    // 부서진 등나무 의자와 화분 (오른쪽 테라스)
    ctx.strokeStyle = A.rgba(N ? '#2a2016' : '#a88a5a'); ctx.lineWidth = 5;
    ctx.beginPath(); ctx.ellipse(1260, 900, 80, 30, 0, Math.PI, 0); ctx.stroke(); ctx.beginPath(); ctx.moveTo(1180, 900); ctx.quadraticCurveTo(1170, 780, 1260, 760); ctx.quadraticCurveTo(1350, 780, 1330, 900); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(1200, 910); ctx.lineTo(1190, 980); ctx.moveTo(1320, 910); ctx.lineTo(1300, 960); ctx.stroke();
    for (const [x, s] of [[1060, 1], [1110, 0.8], [1420, 1.2]]) { A.poly(ctx, [[x - 26 * s, 900], [x + 26 * s, 900], [x + 18 * s, 950], [x - 18 * s, 950]], N ? '#2a140c' : '#9a4a2a'); for (let k = 0; k < 6; k++) A.line(ctx, x, 900, x + (r() - 0.5) * 60 * s, 900 - (20 + r() * 50) * s, N ? '#0a1a0c' : '#4a6a2a', 3); }
    A.vgrad(ctx, 0, 940, W, H, [[0, '#000000', 0], [1, '#000000', 0.45]]);
  };
  S.roof.focus = 0.4;

  /* ───────── 방파제와 등대 ─────────
   * 바다로 곧게 뻗은 화강암 방파제(끝이 안개 속), 분홍과 회색으로 바랜 줄무늬 등대와 굴뚝 연기,
   * 안쪽에 묶인 회색 순찰정 PB-7과 협약 깃발, 만 한가운데 검은 별 모양의 조수 요새.
   * v.low: 썰물 — 요새까지 개펄과 은빛 물골이 드러난다.
   */
  S.breakwater = function (ctx, W, H, r, v) {
    const N = !!v.night, LOW = !!v.low;
    const HZ = 520;
    const C = N ? { sky: [[0, '#03070c'], [1, '#1a2430']], sea: [[0, '#16222a'], [1, '#05090c']], stone: '#1a1c1e', stone2: '#0e1012', fort: '#07090b', fog: '#26303a', mud: ['#1a1c1c', '#0a0b0c'] }
      : { sky: [[0, '#9aa6aa'], [1, '#dedad0']], sea: [[0, '#a4ada6'], [1, '#5a6a6a']], stone: '#8a8680', stone2: '#6a6660', fort: '#2a2c30', fog: '#d0d0c6', mud: ['#9a8e7a', '#5a5040'] };
    A.vgrad(ctx, 0, 0, W, HZ, C.sky);
    if (N) { A.stars(ctx, W, 360, 150, r); A.moon(ctx, 1520, 160, 26, '#e8eef0', '#8fb0c8'); }
    else A.clouds(ctx, W, H, { y0: 0, y1: 440, color: '#f4f2ea', a: 0.6, scale: 260, stretch: 4, seed: 12 });
    A.shore(ctx, W, HZ, 22, A.atm(N ? '#0e161c' : '#8a9290', C.fog, 0.45), r, { lights: N ? 30 : 0, seed: 31 });
    // 바다 또는 개펄
    if (LOW) {
      A.vgrad(ctx, 0, HZ, W, H, [[0, C.mud[0]], [1, C.mud[1]]]);
      ctx.save(); ctx.globalAlpha = 0.5; A.reflect(ctx, W, H, HZ, { strength: 0.4, depth: 300, ripple: 0.4 }); ctx.restore();
      for (let i = 0; i < 7; i++) A.channel(ctx, 250 + i * 110 + r() * 60, HZ + 6, H - HZ, r, { color: N ? '#9fb4c4' : '#eef2f2', a: 0.55, w: 5, drift: i < 3 ? -20 : 20 });
    } else {
      A.vgrad(ctx, 0, HZ, W, H, C.sea);
      A.reflect(ctx, W, H, HZ, { strength: 0.4, depth: 300, ripple: 1.4 });
      A.ripples(ctx, W, HZ + 4, H, r, N ? '#51606a' : '#e4e8e0', 0.4, 300);
    }
    // 조수 요새 (왼쪽 만 한가운데)
    const fx = 470, fy = HZ + 14;
    A.poly(ctx, [[fx - 170, fy], [fx - 140, fy - 30], [fx - 90, fy - 34], [fx - 70, fy - 56], [fx + 60, fy - 56], [fx + 90, fy - 30], [fx + 150, fy - 30], [fx + 180, fy]], C.fort);
    A.rect(ctx, fx - 20, fy - 120, 40, 70, C.fort); A.poly(ctx, [[fx - 20, fy - 120], [fx - 6, fy - 132], [fx + 12, fy - 118], [fx + 20, fy - 120]], C.fort);
    A.light(ctx, fx, fy - 126, { r: 22, color: N ? '#ffffff' : '#fff6d8', kind: 'beacon3', a: N ? 1 : 0.6 });
    if (!LOW) A.streaks(ctx, fx, fy + 2, 80, 10, '#ffffff', N ? 0.4 : 0.2, r);
    // 방파제: 아래 가운데에서 오른쪽 위 안개 속으로
    const bw = (t) => { const x = A.lerp(900, 1500, t), y = A.lerp(H + 40, HZ + 6, Math.pow(t, 0.55)), w = A.lerp(520, 18, Math.pow(t, 0.5)); return [x, y, w]; };
    ctx.beginPath();
    for (let i = 0; i <= 40; i++) { const [x, y, w] = bw(i / 40); if (!i) ctx.moveTo(x - w / 2, y); else ctx.lineTo(x - w / 2, y); }
    for (let i = 40; i >= 0; i--) { const [x, y, w] = bw(i / 40); ctx.lineTo(x + w / 2, y); }
    ctx.fillStyle = A.rgba(C.stone); ctx.fill();
    // 돌덩이 이음매와 옆면
    for (let i = 0; i < 40; i++) { const t = i / 40, [x, y, w] = bw(t), [, y2] = bw(t + 1 / 40); A.poly(ctx, [[x - w / 2, y], [x - w / 2 - w * 0.06, y + (y - y2) * 0.2 + w * 0.1], [x + w / 2 + w * 0.06, y + w * 0.1], [x + w / 2, y]], i % 2 ? C.stone2 : A.shade(C.stone2, 0.85)); A.rect(ctx, x - w / 2, y, w, 1.2, A.shade(C.stone, 1.25), 0.5); for (let k = 0; k < 3; k++) A.rect(ctx, x - w / 2 + w * (0.2 + k * 0.3), y - (y - y2), 1.2, y - y2, A.shade(C.stone, 0.7), 0.6); }
    // 이끼와 따개비
    for (let i = 0; i < 200; i++) { const t = r() * 0.8, [x, y, w] = bw(t); ctx.fillStyle = A.rgba(r() < 0.6 ? (N ? '#101a10' : '#4a6a3a') : (N ? '#2a2a2a' : '#d8d4c8'), 0.6); ctx.fillRect(x + (r() < 0.5 ? -1 : 1) * w * (0.45 + r() * 0.08), y + r() * w * 0.08, 2 + r() * 4, 2 + r() * 3); }
    // 등대 (방파제 끝, 안개 속)
    const lhx = 1480, lhy = HZ + 8;
    const stripeA = N ? '#3a2a2e' : '#d8a8a8', stripeB = N ? '#2a2c30' : '#a8a8a4';
    for (let k = 0; k < 6; k++) { const y0 = lhy - k * 34, y1 = y0 - 34, w0 = 30 - k * 2.4, w1 = 30 - (k + 1) * 2.4; A.poly(ctx, [[lhx - w0, y0], [lhx + w0, y0], [lhx + w1, y1], [lhx - w1, y1]], k % 2 ? stripeA : stripeB); }
    A.rect(ctx, lhx - 22, lhy - 224, 44, 22, N ? '#101214' : '#3a3a3a'); A.rect(ctx, lhx - 26, lhy - 204, 52, 6, N ? '#101214' : '#3a3a3a');
    A.poly(ctx, [[lhx - 24, lhy - 224], [lhx, lhy - 248], [lhx + 24, lhy - 224]], N ? '#101214' : '#3a3a3a');
    A.rect(ctx, lhx + 30, lhy - 50, 90, 50, N ? '#16181a' : '#c8c0b0'); A.poly(ctx, [[lhx + 26, lhy - 50], [lhx + 75, lhy - 80], [lhx + 124, lhy - 50]], N ? '#0e1012' : '#7a4a3a');
    A.rect(ctx, lhx + 96, lhy - 96, 12, 30, N ? '#0e1012' : '#6a5a4a');
    A.smoke(ctx, lhx + 102, lhy - 100, 0.7, r, N ? '#4a5058' : '#e8e6de', 0.25);
    A.rect(ctx, lhx + 50, lhy - 36, 16, 14, N ? '#ffd080' : '#3a4448');
    if (N) A.light(ctx, lhx + 58, lhy - 30, { r: 40, color: '#ffd080', kind: 'window', core: false });
    // 순찰정 PB-7 (방파제 안쪽, 가운데)
    const px = 760, py = 800;
    A.poly(ctx, [[px - 230, py - 60], [px + 200, py - 60], [px + 250, py - 90], [px + 230, py - 30], [px + 170, py], [px - 210, py]], N ? '#1e2226' : '#8a9094');
    A.rect(ctx, px - 210, py - 20, 380, 8, N ? '#101214' : '#5a6064');
    A.poly(ctx, [[px - 120, py - 60], [px - 120, py - 120], [px + 20, py - 120], [px + 50, py - 80], [px + 50, py - 60]], N ? '#262a2e' : '#a8aeb0');
    for (let i = 0; i < 4; i++) A.rect(ctx, px - 104 + i * 36, py - 108, 22, 18, N ? (i === 1 ? '#ffd080' : '#0a0c0e') : '#3a4448');
    A.line(ctx, px - 60, py - 120, px - 60, py - 230, N ? '#101214' : '#3a3e42', 4);
    A.text(ctx, 'PB-7', px + 150, py - 44, { size: 26, color: N ? '#9aa0a4' : '#f4f4f0', a: 0.9, font: '"Liberation Sans", sans-serif', weight: '700' });
    // 협약 깃발 (고물): 푸른 바탕, 원을 이룬 다섯 별
    A.line(ctx, px - 220, py - 60, px - 220, py - 160, N ? '#101214' : '#3a3e42', 3);
    const fgx = px - 218, fgy = py - 160;
    ctx.fillStyle = A.rgba(N ? '#1a2a4a' : '#2a4a8a'); ctx.beginPath(); ctx.moveTo(fgx, fgy); ctx.quadraticCurveTo(fgx + 40, fgy + 10, fgx + 70, fgy + 8); ctx.lineTo(fgx + 66, fgy + 54); ctx.quadraticCurveTo(fgx + 36, fgy + 58, fgx, fgy + 46); ctx.closePath(); ctx.fill();
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * Math.PI * 2 / 5; ctx.fillStyle = A.rgba('#e8d890'); ctx.beginPath(); ctx.arc(fgx + 34 + Math.cos(a) * 12, fgy + 28 + Math.sin(a) * 12, 3, 0, Math.PI * 2); ctx.fill(); }
    if (N) { A.light(ctx, px - 60, py - 230, { r: 18, color: '#ff3030', kind: 'blink' }); A.streaks(ctx, px - 82, py + 4, 120, 10, '#ffd080', 0.4, r); }
    if (!LOW) A.reflect(ctx, W, H, py, { strength: 0.25, depth: 120, ripple: 1.2 });
    else { ctx.fillStyle = A.rgba(N ? '#0a0c0e' : '#5a5040', 0.5); ctx.beginPath(); ctx.ellipse(px, py + 6, 260, 16, 0, 0, Math.PI * 2); ctx.fill(); }
    // 말뚝들
    for (let i = 0; i < 9; i++) { const t = 0.2 + i * 0.07, [x, y, w] = bw(t); A.rect(ctx, x - w / 2 - 30 - i * 3, y - 40 * (1 - t), 8 * (1 - t) + 2, 60 * (1 - t) + 6, N ? '#0a0806' : '#3a2a1e'); }
    // 안개
    A.clouds(ctx, W, H, { y0: HZ - 120, y1: HZ + 120, color: C.fog, a: N ? 0.35 : 0.7, scale: 200, stretch: 5, seed: 41 });
    A.band(ctx, W, HZ + 10, 120, C.fog, N ? 0.3 : 0.5);
    A.vgrad(ctx, 0, 940, W, H, [[0, '#000000', 0], [1, '#000000', 0.35]]);
  };
  S.breakwater.focus = 0.4;

  /* ───────── 레테 개펄 ─────────
   * 하늘을 비추는 젖은 회갈색 평원, 은빛 물골, 비스듬히 박힌 포함 '메모리아'(부러진 굴뚝, 녹아내린 대포), 먼 요새.
   */
  S.flats = function (ctx, W, H, r, v) {
    const N = !!v.night;
    const HZ = 480;
    const C = N ? { sky: [[0, '#03070c'], [0.7, '#141e2a'], [1, '#2a3038']], mud: '#12141a', rust: '#1a0e0a', fort: '#05070a', fog: '#2a3440' }
      : { sky: [[0, '#98a4ac'], [0.7, '#cfd0c8'], [1, '#e6e0d0']], mud: '#8a7c68', rust: '#6a3222', fort: '#3a3c40', fog: '#d8d6cc' };
    A.vgrad(ctx, 0, 0, W, HZ, C.sky);
    if (N) { A.stars(ctx, W, 360, 200, r); A.moon(ctx, 620, 150, 34, '#eef2f4', '#8fb0c8'); }
    else A.clouds(ctx, W, H, { y0: 0, y1: 440, color: '#fbfaf4', a: 0.65, scale: 260, stretch: 4, seed: 51 });
    // 먼 요새
    const fx = 1180, fy = HZ + 4;
    A.poly(ctx, [[fx - 120, fy], [fx - 100, fy - 22], [fx - 60, fy - 26], [fx - 50, fy - 40], [fx + 40, fy - 40], [fx + 60, fy - 22], [fx + 110, fy - 22], [fx + 130, fy]], A.atm(C.fort, C.fog, 0.3));
    A.rect(ctx, fx - 14, fy - 90, 28, 56, A.atm(C.fort, C.fog, 0.3));
    A.light(ctx, fx, fy - 94, { r: 14, color: '#ffffff', kind: 'beacon3', a: N ? 1 : 0.5 });
    // 개펄: 하늘을 비추는 거울
    A.vgrad(ctx, 0, HZ, W, H, [[0, A.mix(C.mud, C.sky[C.sky.length - 1][1], 0.3)], [1, A.shade(C.mud, 0.6)]]);
    ctx.save(); A.reflect(ctx, W, H, HZ, { strength: 0.65, depth: 600, ripple: 0.25, fade: 0.8 }); ctx.restore();
    // 진흙 얼룩 (반사를 가리는 마른 부분)
    const n = A.noise(71);
    const img = ctx.getImageData(0, HZ, W, H - HZ);
    for (let y = 0; y < H - HZ; y += 1) {
      const t = y / (H - HZ);
      for (let x = 0; x < W; x += 1) {
        const val = n.fbm(x / (180 + 400 * t), (y / (30 + 120 * t)), 4);
        if (val > 0.52) { const i = (y * W + x) * 4, k = A.clamp((val - 0.52) * 6, 0, 1) * 0.75; const m = A.hex(C.mud); img.data[i] = A.lerp(img.data[i], m[0] * (0.9 + t * 0.2), k); img.data[i + 1] = A.lerp(img.data[i + 1], m[1] * (0.9 + t * 0.2), k); img.data[i + 2] = A.lerp(img.data[i + 2], m[2] * (0.9 + t * 0.2), k); }
      }
    }
    ctx.putImageData(img, 0, HZ);
    // 은빛 물골
    for (let i = 0; i < 6; i++) A.channel(ctx, 700 + i * 150 + (r() - 0.5) * 80, HZ + 8, H - HZ, r, { color: N ? '#a8c0d0' : '#f4f6f4', a: 0.6, w: 7, drift: (i - 2.5) * 12 });
    // 포함 메모리아 (비스듬히 박힘)
    ctx.save(); ctx.translate(560, 700); ctx.rotate(-0.12);
    A.poly(ctx, [[-340, 0], [300, -20], [380, -80], [360, 30], [300, 60], [-300, 70]], C.rust);
    A.rect(ctx, -300, -2, 600, 10, A.shade(C.rust, 1.4));
    A.poly(ctx, [[-120, -20], [-120, -110], [60, -110], [90, -60], [90, -20]], A.shade(C.rust, 0.9));
    for (let i = 0; i < 4; i++) A.rect(ctx, -100 + i * 40, -96, 22, 18, '#0a0808');
    A.poly(ctx, [[-40, -110], [-20, -110], [-10, -190], [10, -200], [-2, -180], [-10, -110]], A.shade(C.rust, 0.8));
    A.poly(ctx, [[140, -30], [260, -60], [270, -48], [150, -18]], A.shade(C.rust, 0.7));
    ctx.fillStyle = A.rgba(A.shade(C.rust, 0.7)); ctx.beginPath(); ctx.ellipse(160, -28, 30, 22, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = A.rgba(N ? '#6a6a6a' : '#e8e4d8', 0.85); ctx.font = '700 30px "Liberation Serif", serif'; ctx.fillText('…MEMORIA', 170, 36);
    for (let i = 0; i < 40; i++) { ctx.fillStyle = A.rgba(N ? '#2a1a14' : '#9a5a34', 0.6); ctx.fillRect(-300 + r() * 600, -10 + r() * 70, 4 + r() * 10, 3 + r() * 6); }
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.35; ctx.translate(0, 2 * 760); ctx.scale(1, -1); ctx.translate(560, 700); ctx.rotate(-0.12); A.poly(ctx, [[-340, 0], [300, -20], [380, -80], [360, 30], [300, 60], [-300, 70]], C.rust); ctx.restore();
    // 재빛 왜가리 (멀리, 물골 가)
    const hx = 1500, hy = 640;
    ctx.fillStyle = A.rgba(N ? '#8a9aa4' : '#6a7074');
    ctx.beginPath(); ctx.ellipse(hx, hy - 50, 16, 26, 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(hx + 6, hy - 70); ctx.quadraticCurveTo(hx + 24, hy - 100, hx + 10, hy - 116); ctx.stroke();
    A.poly(ctx, [[hx + 10, hy - 120], [hx + 44, hy - 114], [hx + 10, hy - 112]], N ? '#8a9aa4' : '#6a7074');
    A.line(ctx, hx - 4, hy - 26, hx - 6, hy, N ? '#8a9aa4' : '#6a7074', 2.4); A.line(ctx, hx + 4, hy - 26, hx + 6, hy, N ? '#8a9aa4' : '#6a7074', 2.4);
    ctx.save(); ctx.globalAlpha = 0.3; ctx.translate(0, 2 * hy); ctx.scale(1, -1); ctx.fillStyle = A.rgba(N ? '#8a9aa4' : '#6a7074'); ctx.beginPath(); ctx.ellipse(hx, hy - 50, 16, 26, 0.4, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    // 말뚝과 게 구멍
    for (let i = 0; i < 12; i++) { const x = 100 + i * 150 + r() * 40, y = 600 + i * 30 * r(); A.rect(ctx, x, y - 30, 6, 34, N ? '#0a0a0a' : '#3a2a1e'); }
    for (let i = 0; i < 400; i++) { const t = r(), y = HZ + 40 + t * t * (H - HZ - 40); ctx.fillStyle = A.rgba('#000000', 0.35); ctx.beginPath(); ctx.ellipse(r() * W, y, 1 + t * 3, 0.5 + t * 1.2, 0, 0, Math.PI * 2); ctx.fill(); }
    A.band(ctx, W, HZ + 6, 90, C.fog, N ? 0.3 : 0.55);
    A.vgrad(ctx, 0, 960, W, H, [[0, '#000000', 0], [1, '#000000', 0.3]]);
  };
  S.flats.focus = 0.35;

  /* ───────── 조수 요새 ─────────
   * 검은 현무암 성벽의 안뜰. 무릎까지 자란 잡초, 성벽 위 갈매기 떼, 가슴 높이 총알 자국 띠의 벽(왼쪽),
   * 성벽에 반쯤 묻힌 둥근 지붕의 화약고(오른쪽), 3초마다 깜빡이는 등표 탑.
   */
  S.fort = function (ctx, W, H, r, v) {
    const N = !!v.night;
    const P = A.space([940, 600], [520, 340, 1340, 720]);
    const C = N ? { sky: [[0, '#03060c'], [1, '#16202c']], wall: '#121418', wall2: '#0c0e10', ground: ['#10140e', '#050605'], weed: '#0a1208', beacon: '#ffffff', gull: '#8a9098' }
      : { sky: [[0, '#8e9aa2'], [1, '#d6d2c4']], wall: '#3a3a3e', wall2: '#2c2c30', ground: ['#5a5a44', '#2e2e22'], weed: '#5a6a34', beacon: '#fff6d8', gull: '#f0f0ea' };
    A.vgrad(ctx, 0, 0, W, 720, C.sky);
    if (N) A.stars(ctx, W, 400, 160, r);
    else A.clouds(ctx, W, H, { y0: 0, y1: 420, color: '#f6f4ec', a: 0.6, scale: 240, stretch: 4, seed: 61 });
    // 등표 탑 (뒤)
    const tx = 1060;
    A.rect(ctx, tx - 60, 110, 120, 300, C.wall2);
    for (let k = 0; k < 6; k++) A.rect(ctx, tx - 66 + k * 24, 96, 14, 18, C.wall2);
    A.rect(ctx, tx - 14, 40, 28, 58, N ? '#1a1c20' : '#4a4a4e');
    A.light(ctx, tx, 60, { r: 60, color: C.beacon, kind: 'beacon3', a: N ? 1 : 0.5 });
    if (N) { A.cone(ctx, tx, 60, Math.PI * 0.95, 0.07, 1200, '#ffffff', 0.12); A.cone(ctx, tx, 60, 0.1, 0.07, 1200, '#ffffff', 0.06); }
    // 뒷벽 (성벽) + 총안
    A.rect(ctx, 0, 330, W, 400, C.wall);
    for (let x = 0; x < W; x += 70) A.rect(ctx, x, 300, 40, 34, C.wall);
    for (let y = 340; y < 720; y += 36) for (let x = (y / 36) % 2 ? 0 : 40; x < W; x += 80) A.rect(ctx, x, y, 78, 34, A.shade(C.wall, 0.9 + ((x * 7 + y) % 5) * 0.04));
    // 갈매기 (성벽 위)
    for (let i = 0; i < 26; i++) { const x = r() * W, y = 300 - r() * 6; A.pigeon(ctx, x, y, 1.1, C.gull); }
    for (let i = 0; i < 7; i++) A.gull(ctx, 200 + r() * 1500, 80 + r() * 160, 0.8 + r() * 0.6, N ? '#8a9098' : '#3a3e42');
    // 왼쪽 벽: 총알 자국 띠
    A.poly(ctx, [[0, 180], [520, 330], [520, 720], [0, H]], A.shade(C.wall, 0.8));
    for (let y = 200; y < 1000; y += 38) { ctx.fillStyle = A.rgba(A.shade(C.wall, 0.6)); ctx.fillRect(0, y + (y / 1000) * 150 * 0.5, 520, 2); }
    for (let i = 0; i < 150; i++) {
      const u = r(), x = u * 520, yMid = A.lerp(700, 560, u), y = yMid + (r() - 0.5) * A.lerp(70, 40, u);
      ctx.fillStyle = A.rgba('#000000', 0.65); ctx.beginPath(); ctx.ellipse(x, y, A.lerp(5.5, 2.6, u), A.lerp(5.5, 2.6, u) * 1.1, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = A.rgba('#ffffff', N ? 0.05 : 0.12); ctx.beginPath(); ctx.arc(x + 2, y + 2, A.lerp(4, 2, u), 0, Math.PI * 2); ctx.fill();
    }
    // 화약고 (오른쪽, 둥근 지붕)
    const mx = 1450, my = 760;
    A.rect(ctx, mx - 220, my - 260, 440, 260, A.shade(C.wall, 1.1));
    ctx.fillStyle = A.rgba(A.shade(C.wall, 1.2)); ctx.beginPath(); ctx.ellipse(mx, my - 260, 230, 150, 0, Math.PI, 0); ctx.fill();
    for (let k = 0; k < 6; k++) { ctx.strokeStyle = A.rgba(A.shade(C.wall, 0.8)); ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(mx, my - 260, 230 - k * 36, 150 - k * 24, 0, Math.PI, 0); ctx.stroke(); }
    A.rect(ctx, mx - 70, my - 200, 140, 200, N ? '#1a120a' : '#4a3020');
    ctx.fillStyle = A.rgba(A.shade(C.wall, 1.2)); ctx.beginPath(); ctx.arc(mx, my - 200, 70, Math.PI, 0); ctx.fill();
    ctx.fillStyle = A.rgba(N ? '#1a120a' : '#4a3020'); ctx.beginPath(); ctx.arc(mx, my - 200, 62, Math.PI, 0); ctx.fill();
    for (let k = 0; k < 5; k++) A.rect(ctx, mx - 62 + k * 30, my - 250, 3, 250, N ? '#0a0604' : '#2a1a10');
    for (const y of [my - 160, my - 60]) A.rect(ctx, mx - 62, y, 124, 8, N ? '#2a2a2a' : '#1a1a1a');
    if (N) { A.rect(ctx, mx - 2, my - 250, 4, 250, '#ffc060'); A.glow(ctx, mx, my - 120, 120, '#ffc060', 0.4); A.mark(mx, my - 120, 60, '#ffc060', 'door'); }
    // 청동판과 붉은 X (오른쪽 벽의 아치 위) — 작은 판
    A.rect(ctx, mx - 60, my - 330, 120, 40, N ? '#3a3020' : '#8a6a3a');
    A.line(ctx, mx - 50, my - 325, mx + 50, my - 295, '#b01a1a', 5); A.line(ctx, mx + 50, my - 325, mx - 50, my - 295, '#b01a1a', 5);
    // 안뜰 바닥과 잡초
    A.vgrad(ctx, 0, 720, W, H, [[0, C.ground[0]], [1, C.ground[1]]]);
    for (let i = 0; i < 900; i++) {
      const t = Math.pow(r(), 0.8), y = 720 + t * 380, x = r() * W, h = (10 + r() * 30) * (0.4 + t * 1.6);
      ctx.strokeStyle = A.rgba(A.shade(C.weed, 0.7 + r() * 0.6)); ctx.lineWidth = 1 + t * 2;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + (r() - 0.5) * 12, y - h * 0.6, x + (r() - 0.5) * 20, y - h); ctx.stroke();
    }
    // 부서진 문장 조각과 녹슨 대포
    ctx.fillStyle = A.rgba(N ? '#0a0a0c' : '#2a2a2c'); ctx.beginPath(); ctx.ellipse(760, 930, 130, 26, 0, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.translate(700, 880); ctx.rotate(-0.15); A.rect(ctx, 0, 0, 230, 40, N ? '#1a1210' : '#5a3a2a'); ctx.fillStyle = A.rgba(N ? '#1a1210' : '#5a3a2a'); ctx.beginPath(); ctx.arc(0, 20, 26, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    A.vgrad(ctx, 0, 940, W, H, [[0, '#000000', 0], [1, '#000000', 0.4]]);
  };
  S.fort.focus = 0.4;

  /* ───────── 표제 그림 ─────────
   * 비 오는 밤. 오른쪽에 달을 등진 7번 크레인과 매달린 남자, 부두의 불빛, 젖은 바닥에 서 있는 한 사람.
   * 왼쪽 40%는 표제와 메뉴를 위해 어둡게 비워 둔다.
   */
  S.title = function (ctx, W, H, r) {
    const HZ = 640;
    A.vgrad(ctx, 0, 0, W, HZ, [[0, '#02050a'], [0.55, '#0b1622'], [1, '#26262c']]);
    A.stars(ctx, W, 300, 80, r);
    A.moon(ctx, 1330, 300, 104, '#dfe8ec', '#7f9fb8');
    A.clouds(ctx, W, H, { y0: 150, y1: 560, color: '#101a24', a: 0.75, scale: 220, stretch: 4, seed: 91 });
    A.clouds(ctx, W, H, { y0: 380, y1: 640, color: '#3a2a2c', a: 0.4, scale: 200, stretch: 5, seed: 92 });
    A.shore(ctx, W, HZ, 30, '#0a1016', r, { lights: 80, seed: 93 });
    A.vgrad(ctx, 0, HZ, W, 800, [[0, '#141c22'], [1, '#04070a']]);
    A.reflect(ctx, W, H, HZ, { strength: 0.45, depth: 160, ripple: 1.6 });
    A.ripples(ctx, W, HZ + 4, 800, r, '#5a6a74', 0.35, 160);
    // 크레인과 매달린 남자 (달 앞)
    const res = A.crane(ctx, 1560, 790, 1.55, { color: '#030507', jib: -0.28, dir: -1, len: 360, cable: 90, hang: true, hangRim: '#9fb8c8', hangColor: '#020304' });
    A.glow(ctx, res.tip[0], res.tip[1], 18, '#ff3030', 0.9); A.mark(res.tip[0], res.tip[1], 10, '#ff3030', 'blink');
    A.crane(ctx, 1860, 700, 0.8, { color: '#05080b', jib: -0.8, dir: 1 });
    A.crane(ctx, 1000, 690, 0.55, { color: '#070a0e', jib: -0.5, dir: 1 });
    // 부두
    A.rect(ctx, 0, 790, W, 12, '#1a1e22');
    A.cobbles(ctx, 0, W, 802, H, r, { far: '#141a20', near: '#040506', sheen: '#5a6a78', sheenA: 0.12 });
    // 가로등과 젖은 반사
    A.lamp(ctx, 1110, 1030, 300, r, { arm: 38, light: '#ffb45a', wet: 60, poolR: 200, color: '#0a0c0f' });
    // 서 있는 사람 (당신)
    A.figure(ctx, 1240, 1010, { h: 260, color: '#020304', hat: null, body: 'coat', pose: 'pockets', rim: '#ffb45a', rimDir: -1 });
    // 왼쪽 네온 빛 (화면 밖)
    A.glow(ctx, -60, 520, 700, '#ff2f5a', 0.2);
    A.pool(ctx, 200, 900, 500, 90, '#ff2f5a', 0.18);
    A.streaks(ctx, 120, 820, 240, 60, '#ff2f5a', 0.25, r);
    A.mark(20, 500, 300, '#ff2f5a', 'neon');
    // 왼쪽 어둠 (표제 자리)
    ctx.fillStyle = A.lineGrad(ctx, 0, 0, 1000, 0, [[0, '#000000', 0.72], [0.6, '#000000', 0.35], [1, '#000000', 0]]);
    ctx.fillRect(0, 0, 1000, H);
    A.band(ctx, W, 780, 120, '#3a4450', 0.3);
  };
  S.title.focus = 0.7;
})(window);
