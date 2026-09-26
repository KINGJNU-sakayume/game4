/* 탱고 레테 — 인물 초상 (옆얼굴 실루엣 카드)
 * 장면 그림과 같은 양식: 거의 검은 실루엣 + 두 방향의 가장자리 빛(앞쪽 따뜻한 빛, 뒤쪽 찬 빛)
 * + 인물마다 한두 군데의 색(셔츠 깃, 귀걸이, 헤드폰, 종이 왕관...).
 * 좌표: 머리 단위(눈높이 y=0, 정수리 약 -1.05, 턱 약 0.9). 얼굴은 오른쪽을 본다.
 * 캔버스는 512×640, 머리 한 단위 = s px.
 */
(function (G) {
  'use strict';
  const A = G.ART;
  const P = A.portraits = {};

  /* Catmull-Rom 스플라인 */
  A.spline = function (ctx, pts, closed = false, move = true) {
    const n = pts.length;
    const get = i => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
    if (move) ctx.moveTo(pts[0][0], pts[0][1]);
    const end = closed ? n : n - 1;
    for (let i = 0; i < end; i++) {
      const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
      ctx.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
    }
  };
  const path2 = (pts, closed = true) => { const p = new Path2D(); A.spline(p, pts, closed); if (closed) p.closePath(); return p; };

  /* 옆얼굴 윤곽 (앞선: 이마→턱 끝)
   * f: nose(크기) noseTip(-1 들창 ~ +1 매부리) chin lips forehead brow age
   */
  A.faceFront = function (f = {}) {
    const nose = f.nose === undefined ? 1 : f.nose, tip = f.noseTip || 0;
    const chin = f.chin === undefined ? 1 : f.chin, lips = f.lips === undefined ? 1 : f.lips;
    const fh = f.forehead === undefined ? 1 : f.forehead, brow = f.brow === undefined ? 1 : f.brow, age = f.age || 0;
    return [
      [0.38, -0.88], [0.52 + 0.03 * fh, -0.6], [0.58 + 0.02 * fh, -0.32], [0.6 + 0.03 * brow, -0.13],
      [0.565, 0.0], [0.6 + 0.05 * nose + 0.04 * tip, 0.13 + 0.02 * tip], [0.68 + 0.1 * nose + (nose > 1.6 ? 0.08 * (nose - 1.6) : 0), 0.29 + 0.03 * nose - 0.04 * tip],
      [0.66 + 0.06 * nose, 0.365 + (nose > 1.6 ? 0.04 * (nose - 1.6) : 0)], [0.595, 0.41], [0.6 + 0.02 * lips, 0.47], [0.615 + 0.03 * lips, 0.505],
      [0.58, 0.545], [0.605 + 0.025 * lips, 0.585], [0.57, 0.645 + 0.01 * age], [0.58 + 0.05 * chin, 0.74 + 0.03 * age],
      [0.53 + 0.03 * chin, 0.845 + 0.04 * age], [0.38, 0.905 + 0.05 * age],
    ];
  };
  A.headOutline = function (f = {}) {
    const age = f.age || 0, back = f.skull === undefined ? 1 : f.skull;
    return A.faceFront(f).concat([
      [0.2, 0.94 + 0.06 * age], [-0.1, 0.95], [-0.5, 0.82],
      [-0.78 * back, 0.46], [-0.9 * back, 0.0], [-0.85 * back, -0.46], [-0.6 * back, -0.86], [-0.14, -1.04], [0.2, -1.0],
    ]);
  };
  /* 목과 가슴 (옆모습 흉상). b: { bulk, chest, lean, woman } */
  A.bustOutline = function (b = {}) {
    const k = b.bulk || 1, ch = b.chest === undefined ? 1 : b.chest, le = b.lean || 0, wm = b.woman ? 0.85 : 1;
    return [
      [0.26, 0.9], [0.24 + le * 0.1, 1.12], [0.16 + le * 0.2, 1.46], [0.34 * ch + le * 0.25, 1.74], [0.6 * ch * wm + le * 0.3, 2.1],
      [0.8 * ch * wm + le * 0.3, 2.7], [0.84 * ch + le * 0.3, 4.0], [-1.62 * k, 4.0], [-1.4 * k, 2.7], [-1.18 * k, 2.02],
      [-0.86 * k, 1.62 - (k - 1) * 0.25], [-0.62, 1.28], [-0.54, 0.9],
    ];
  };

  /* 머리 모양: 두개골 바깥으로 나오는 윤곽을 포함한 덩어리 */
  const HAIR = {
    short: [[0.44, -0.8], [0.3, -1.06], [-0.12, -1.13], [-0.64, -0.95], [-0.94, -0.48], [-0.98, 0.02], [-0.86, 0.42], [-0.6, 0.64], [-0.48, 0.3], [-0.22, 0.06], [0.0, 0.08], [0.08, -0.4], [0.3, -0.66]],
    crop: [[0.42, -0.86], [0.2, -1.07], [-0.2, -1.09], [-0.66, -0.9], [-0.93, -0.45], [-0.95, 0.02], [-0.84, 0.4], [-0.6, 0.6], [-0.5, 0.3], [-0.2, 0.0], [0.05, -0.3], [0.3, -0.72]],
    slick: [[0.46, -0.78], [0.38, -1.02], [0.1, -1.14], [-0.4, -1.1], [-0.86, -0.78], [-0.99, -0.2], [-0.92, 0.34], [-0.64, 0.64], [-0.5, 0.32], [-0.2, 0.0], [0.02, -0.42], [0.3, -0.7]],
    bob: [[0.44, -0.8], [0.34, -1.08], [-0.1, -1.18], [-0.68, -1.0], [-1.0, -0.44], [-1.04, 0.3], [-0.86, 0.82], [-0.56, 0.96], [-0.36, 0.84], [-0.3, 0.36], [-0.12, -0.14], [0.2, -0.46], [0.52, -0.56]],
    long: [[0.44, -0.8], [0.32, -1.08], [-0.14, -1.16], [-0.7, -0.98], [-1.02, -0.4], [-1.06, 0.4], [-1.02, 1.2], [-0.96, 1.9], [-0.7, 2.3], [-0.42, 2.0], [-0.36, 1.2], [-0.3, 0.4], [-0.12, -0.14], [0.2, -0.5], [0.5, -0.6]],
    bun: [[0.44, -0.82], [0.28, -1.06], [-0.2, -1.1], [-0.66, -0.94], [-0.93, -0.46], [-0.95, 0.06], [-0.84, 0.44], [-0.6, 0.6], [-0.46, 0.26], [-0.18, 0.0], [0.08, -0.38], [0.32, -0.68]],
    updo: [[0.46, -0.76], [0.56, -1.02], [0.4, -1.3], [0.0, -1.42], [-0.5, -1.36], [-0.9, -1.06], [-1.02, -0.5], [-0.98, 0.1], [-0.8, 0.5], [-0.56, 0.64], [-0.44, 0.3], [-0.16, -0.02], [0.1, -0.42], [0.34, -0.66]],
    wild: null, curly: null, bald: [[-0.5, 0.36], [-0.82, 0.36], [-0.93, 0.0], [-0.88, -0.3], [-0.8, -0.1], [-0.64, 0.14]],
    receding: [[0.1, -1.02], [-0.3, -1.1], [-0.72, -0.9], [-0.96, -0.44], [-0.98, 0.04], [-0.86, 0.42], [-0.6, 0.64], [-0.48, 0.3], [-0.22, 0.04], [-0.2, -0.5], [-0.1, -0.85]],
  };
  /* 모자 */
  const HAT = {
    fedora: [
      [[-1.18, -0.74], [-0.4, -0.86], [0.5, -0.86], [1.12, -0.84], [1.08, -0.76], [0.4, -0.74], [-0.5, -0.66], [-1.12, -0.66]],
      [[-0.74, -0.8], [-0.74, -1.18], [-0.52, -1.4], [-0.1, -1.46], [0.12, -1.36], [0.4, -1.42], [0.6, -1.24], [0.62, -0.8]],
    ],
    cap: [[[-0.92, -0.62], [-0.98, -0.94], [-0.66, -1.18], [-0.1, -1.24], [0.38, -1.12], [0.66, -0.9], [1.02, -0.82], [1.04, -0.74], [0.6, -0.72], [0.1, -0.74], [-0.5, -0.66]]],
    kepi: [
      [[-0.84, -0.66], [-0.9, -1.2], [-0.8, -1.3], [0.52, -1.3], [0.6, -1.2], [0.58, -0.78], [0.3, -0.7], [-0.4, -0.64]],
      [[0.3, -0.8], [0.62, -0.84], [1.0, -0.72], [0.98, -0.64], [0.6, -0.68], [0.3, -0.7]],
    ],
    captain: [
      [[-0.84, -0.7], [-1.02, -1.14], [-0.8, -1.34], [0.4, -1.4], [0.78, -1.26], [0.62, -0.84], [0.2, -0.72], [-0.4, -0.66]],
      [[0.3, -0.8], [0.66, -0.86], [1.04, -0.74], [1.0, -0.66], [0.6, -0.7], [0.3, -0.72]],
    ],
    beanie: [[[-0.96, -0.42], [-0.96, -0.9], [-0.66, -1.24], [-0.1, -1.36], [0.36, -1.2], [0.58, -0.92], [0.6, -0.62], [0.2, -0.66], [-0.4, -0.56]]],
    beret: [[[-0.8, -0.8], [-0.96, -1.02], [-0.6, -1.26], [0.1, -1.34], [0.7, -1.22], [0.9, -1.04], [0.6, -0.9], [0.0, -0.86], [-0.5, -0.8]]],
    scarf: [[[-1.02, 0.5], [-1.08, 0.0], [-1.0, -0.66], [-0.6, -1.14], [0.0, -1.22], [0.44, -1.02], [0.6, -0.74], [0.5, -0.66], [0.2, -0.86], [-0.2, -0.7], [-0.36, -0.2], [-0.36, 0.3], [-0.2, 0.8], [-0.1, 1.02], [-0.5, 0.92]]],
    crown: [[[-0.74, -0.76], [-0.8, -1.46], [-0.52, -1.14], [-0.3, -1.56], [-0.08, -1.16], [0.14, -1.58], [0.3, -1.16], [0.5, -1.44], [0.56, -0.8]]],
  };

  /* 옷깃·옷 (실루엣 윤곽을 바꾸는 덩어리) */
  const COLLAR = {
    coat: [[-0.8, 0.84], [-0.56, 0.78], [-0.4, 1.2], [0.0, 1.46], [0.36, 1.58], [0.58, 1.9], [0.7, 2.3], [0.2, 2.4], [-0.3, 1.9], [-1.0, 1.56], [-0.96, 1.2]],
    leather: [[-0.74, 1.02], [-0.5, 1.0], [-0.3, 1.34], [0.1, 1.56], [0.46, 1.66], [0.66, 2.0], [0.7, 2.4], [0.1, 2.3], [-0.4, 1.86], [-1.0, 1.6], [-0.94, 1.3]],
    turtle: [[-0.56, 0.84], [-0.52, 1.3], [0.2, 1.4], [0.3, 1.02], [0.14, 0.98], [-0.1, 1.0]],
    shawl: [[-1.36, 1.7], [-0.9, 1.26], [-0.52, 1.1], [0.0, 1.3], [0.42, 1.5], [0.76, 1.9], [0.94, 2.5], [0.3, 2.6], [-1.2, 2.6]],
    uniform: [[-0.62, 0.9], [-0.56, 1.3], [0.28, 1.34], [0.3, 1.0], [0.1, 0.96]],
  };

  /* ───────── 카드 렌더러 ─────────
   * c: { seed, bg:{top,bot,motif,accent,glow}, rim, rim2, dark, face, hair, hairC, hat, hatC, collar, bust, props, tilt, s, hx, hy }
   */
  A.card = function (W, H, c) {
    const k = W / 512;
    const out = A.canvas(W, H), ctx = out.getContext('2d');
    const r = A.rng(c.seed || 7);
    ctx.save(); ctx.scale(k, k);
    backdrop(ctx, 512, 640, r, c.bg || {});
    const s = c.s || 108, hx = c.hx || 240, hy = c.hy || 270, tilt = c.tilt || 0;
    const dark = c.dark || '#0c0d10';
    const toPx = pts => pts.map(([x, y]) => [x, y]);
    // 실루엣 조각들 (머리 단위 경로)
    const parts = [];
    const bustP = path2(toPx(A.bustOutline(c.bust || {})));
    parts.push({ p: bustP, body: true });
    if (c.collar && COLLAR[c.collar]) parts.push({ p: path2(COLLAR[c.collar]), body: true });
    if (c.hairBack) parts.push({ p: path2(c.hairBack), head: true });
    parts.push({ p: path2(A.headOutline(c.face || {})), head: true });
    const hair = c.hairPts || (c.hair && HAIR[c.hair]) || (c.hair === 'wild' ? wildHair(r) : c.hair === 'curly' ? curlyHair() : null);
    if (hair) parts.push({ p: path2(hair), head: true, hair: true });
    if (c.beard) parts.push({ p: path2(BEARD[c.beard]), head: true, hair: true });
    if (c.hat && HAT[c.hat]) for (const h of HAT[c.hat]) parts.push({ p: path2(h), head: true, hat: true });
    const place = (x, part) => {
      x.translate(hx, hy); x.scale(s, s);
      if (part.head && tilt) { x.translate(-0.1, 0.9); x.rotate(tilt); x.translate(0.1, -0.9); }
    };
    const fillAll = (x, color, dx, dy, filter) => {
      for (const part of parts) {
        x.save(); x.translate(dx, dy); place(x, part);
        x.fillStyle = typeof color === 'function' ? color(part) : color;
        x.fill(part.p);
        x.restore();
      }
      void filter;
    };
    // 뒤쪽 찬 빛, 앞쪽 따뜻한 빛, 그 위에 실루엣
    const rim = c.rim || '#ffc890', rim2 = c.rim2 || '#6fa8c0';
    fillAll(ctx, A.rgba(rim2, c.rim2A || 0.42), -2.4, -0.8);
    fillAll(ctx, A.rgba(rim, c.rimA || 0.95), 4.2, -2.2);
    fillAll(ctx, part => A.rgba(part.hair ? (c.hairC || dark) : part.hat ? (c.hatC || dark) : dark), 0, 0);
    // 빛 번짐 (앞쪽 테두리만 떼어 흐리게 더한다)
    const g = A.canvas(512, 640), gx = g.getContext('2d');
    fillAll(gx, A.rgba(rim, 1), 5, -3);
    gx.globalCompositeOperation = 'destination-out';
    fillAll(gx, '#000', 0, 0);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.filter = 'blur(7px)'; ctx.globalAlpha = c.bloom === undefined ? 0.55 : c.bloom; ctx.drawImage(g, 0, 0); ctx.restore();
    // 소품과 색 포인트 (머리 기울기 반영)
    const at = (x, y, headPart = true) => {
      let px = x, py = y;
      if (headPart && tilt) { const cx = -0.1, cy = 0.9, dx = px - cx, dy = py - cy; px = cx + dx * Math.cos(tilt) - dy * Math.sin(tilt); py = cy + dx * Math.sin(tilt) + dy * Math.cos(tilt); }
      return [hx + px * s, hy + py * s];
    };
    for (const pr of c.props || []) prop(ctx, pr, at, s, r, c);
    ctx.restore();
    // 마무리: 얼룩, 비네트
    const o2 = A.canvas(W, H), x2 = o2.getContext('2d');
    x2.drawImage(out, 0, 0);
    A.mottle(x2, W, H, 0.06, (c.seed || 7) + 1, 160 * k);
    A.vignette(x2, W, H, c.vignette === undefined ? 0.5 : c.vignette, 0.55, 0.42);
    return o2;
  };

  const BEARD = {
    mustache: [[0.6, 0.4], [0.7, 0.43], [0.72, 0.5], [0.64, 0.52], [0.58, 0.5]],
    walrus: [[0.58, 0.38], [0.72, 0.42], [0.76, 0.56], [0.66, 0.6], [0.58, 0.54]],
    beard: [[0.6, 0.42], [0.7, 0.46], [0.68, 0.64], [0.66, 0.86], [0.52, 1.04], [0.26, 1.08], [0.0, 0.96], [-0.2, 0.7], [-0.1, 0.4], [0.3, 0.5]],
    goatee: [[0.56, 0.62], [0.64, 0.7], [0.62, 0.9], [0.5, 0.98], [0.42, 0.84]],
  };
  function wildHair(r) {
    const pts = [];
    for (let i = 0; i <= 14; i++) {
      const a = -Math.PI * 0.42 - i / 14 * Math.PI * 1.1, rad = (i % 2 ? 1.1 : 1.22 + r() * 0.14) + r() * 0.05;
      pts.push([Math.cos(a) * rad * 0.9 - 0.1, Math.sin(a) * rad * 0.95 - 0.1]);
    }
    pts.push([-0.5, 0.3], [-0.2, 0.0], [0.1, -0.4]);
    return pts;
  }
  function curlyHair() {
    const pts = [];
    for (let i = 0; i <= 16; i++) {
      const a = -Math.PI * 0.36 - i / 16 * Math.PI * 1.02, rad = i % 2 ? 1.08 : 1.2;
      pts.push([Math.cos(a) * rad * 0.92 - 0.08, Math.sin(a) * rad - 0.06]);
    }
    pts.push([-0.5, 0.32], [-0.2, 0.02], [0.12, -0.44]);
    return pts;
  }

  /* 배경: 단색 그라디언트 + 은은한 무늬 */
  function backdrop(ctx, W, H, r, b) {
    ctx.fillStyle = A.lineGrad(ctx, 0, 0, 0, H, [[0, b.top || '#2a3a44'], [1, b.bot || '#0a0e12']]);
    ctx.fillRect(0, 0, W, H);
    const ac = b.accent || '#ffffff', aa = b.accentA === undefined ? 0.1 : b.accentA;
    const m = b.motif;
    if (m === 'bokeh') { for (let i = 0; i < (b.n || 14); i++) { const x = 250 + r() * 270, y = 40 + r() * 420, rad = 14 + r() * 40; A.glow(ctx, x, y, rad * 1.6, r.pick(b.colors || [ac]), 0.2 + r() * 0.25); ctx.fillStyle = A.rgba(r.pick(b.colors || [ac]), 0.08 + r() * 0.1); ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill(); } }
    else if (m === 'blinds') { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(W, 0); ctx.rotate(0.28); for (let i = 0; i < 14; i++) { ctx.fillStyle = A.rgba(ac, aa * (1 - i / 16)); ctx.fillRect(-620, 20 + i * 44, 520, 22); } ctx.restore(); }
    else if (m === 'cranes') { for (let i = 0; i < 3; i++) A.crane(ctx, 300 + i * 120, 520 + i * 10, 0.5 - i * 0.08, { color: A.mix(b.bot || '#0a0e12', b.top || '#2a3a44', 0.35 + i * 0.15), jib: -0.4 - i * 0.2, dir: i % 2 ? -1 : 1 }); }
    else if (m === 'deco') { ctx.save(); ctx.translate(W * 0.62, H * 0.9); for (let i = 0; i < 24; i++) { const a = -Math.PI + i / 24 * Math.PI; ctx.fillStyle = A.rgba(ac, i % 2 ? aa : aa * 0.4); ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 900, a, a + Math.PI / 24); ctx.fill(); } ctx.restore(); }
    else if (m === 'waves') { for (let i = 0; i < 18; i++) { ctx.strokeStyle = A.rgba(ac, aa * (0.4 + r() * 0.6)); ctx.lineWidth = 2; ctx.beginPath(); const y = 300 + i * 20; for (let x = 0; x <= W; x += 16) ctx.lineTo(x, y + Math.sin(x * 0.03 + i) * 4); ctx.stroke(); } }
    else if (m === 'shelves') { for (let y = 60; y < H; y += 120) { ctx.fillStyle = A.rgba(ac, aa * 1.4); ctx.fillRect(0, y, W, 6); for (let x = 10; x < W; x += 14 + r() * 18) ctx.fillStyle = A.rgba(ac, aa * (0.3 + r() * 0.6)), ctx.fillRect(x, y - 30 - r() * 60, 8 + r() * 10, 90); } }
    else if (m === 'radio') { for (let i = 1; i < 12; i++) { ctx.strokeStyle = A.rgba(ac, aa * (1.2 - i / 12)); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(W * 0.86, H * 0.2, i * 46, Math.PI * 0.4, Math.PI * 1.2); ctx.stroke(); } }
    else if (m === 'scales') { for (let y = 0; y < H + 40; y += 30) for (let x = (y / 30) % 2 ? 0 : 22; x < W + 40; x += 44) { ctx.strokeStyle = A.rgba(ac, aa); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 22, 0, Math.PI); ctx.stroke(); } }
    else if (m === 'stars') { A.stars(ctx, W, H * 0.8, 90, r); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * Math.PI * 2 / 5; ctx.fillStyle = A.rgba(ac, aa * 2); ctx.beginPath(); ctx.arc(W * 0.8 + Math.cos(a) * 60, H * 0.22 + Math.sin(a) * 60, 7, 0, Math.PI * 2); ctx.fill(); } }
    else if (m === 'window') { ctx.fillStyle = A.rgba(ac, aa * 3); ctx.fillRect(W * 0.56, H * 0.12, W * 0.34, H * 0.42); ctx.fillStyle = A.rgba(b.bot || '#000', 0.9); ctx.fillRect(W * 0.72, H * 0.12, 8, H * 0.42); ctx.fillRect(W * 0.56, H * 0.32, W * 0.34, 8); A.glow(ctx, W * 0.73, H * 0.33, 260, ac, aa * 2); }
    else if (m === 'fire') { A.glow(ctx, W * 0.85, H * 0.95, 520, ac, 0.5); for (let i = 0; i < 30; i++) { ctx.fillStyle = A.rgba('#ffd08a', r() * 0.6); ctx.fillRect(W * 0.55 + r() * W * 0.45, H * 0.3 + r() * H * 0.6, 2, 2); } }
    else if (m === 'leaves') { for (let i = 0; i < 16; i++) { ctx.save(); ctx.translate(260 + r() * 260, r() * 600); ctx.rotate(r() * 6); ctx.fillStyle = A.rgba(ac, aa * (0.6 + r())); ctx.beginPath(); ctx.ellipse(0, 0, 70, 18, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); } }
    else if (m === 'balls') { for (const [x, y] of [[400, 90], [460, 90], [430, 140]]) { ctx.fillStyle = A.rgba(ac, aa * 3); ctx.beginPath(); ctx.arc(x, y, 26, 0, Math.PI * 2); ctx.fill(); } }
    else if (m === 'beam') { A.cone(ctx, W * 0.9, H * 0.25, Math.PI * 0.94, 0.08, 800, ac, aa * 2); A.glow(ctx, W * 0.9, H * 0.25, 60, ac, 0.8); }
    else if (m === 'door') { ctx.fillStyle = A.rgba(ac, aa * 4); ctx.fillRect(W * 0.8, 0, 10, H); A.glow(ctx, W * 0.8, H * 0.45, 200, ac, aa * 2); }
    else if (m === 'neon') { A.glow(ctx, W * 0.95, H * 0.3, 420, ac, 0.5); for (let i = 0; i < 5; i++) A.text(ctx, 'LETHE'[i], W * 0.92, 80 + i * 110, { size: 90, neon: ac, font: '"Limelight", serif' }); }
    if (b.glow) A.glow(ctx, b.glow[0], b.glow[1], b.glow[2], b.glow[3], b.glow[4] === undefined ? 0.5 : b.glow[4]);
  }

  /* 소품과 색 포인트 */
  function prop(ctx, pr, at, s, r, c) {
    const name = typeof pr === 'string' ? pr : pr.t;
    const o = typeof pr === 'string' ? {} : pr;
    ctx.save();
    if (name === 'cigarette') {
      const [x0, y0] = at(0.6, 0.53), [x1, y1] = at(0.98, 0.6);
      ctx.strokeStyle = A.rgba('#e8e2d4'); ctx.lineWidth = 0.055 * s; ctx.lineCap = 'butt';
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      A.glow(ctx, x1, y1, 0.22 * s, '#ff6a2a', 0.9); ctx.fillStyle = '#ffb070'; ctx.beginPath(); ctx.arc(x1, y1, 0.03 * s, 0, Math.PI * 2); ctx.fill();
      smoke(ctx, x1, y1, s, r);
    } else if (name === 'pipe') {
      const [x0, y0] = at(0.6, 0.54), [x1, y1] = at(0.92, 0.66);
      ctx.strokeStyle = A.rgba('#2a1a10'); ctx.lineWidth = 0.05 * s; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(x1 - 10, y1 + 10, x1, y1); ctx.stroke();
      A.rect(ctx, x1 - 0.06 * s, y1 - 0.16 * s, 0.14 * s, 0.2 * s, '#3a2214');
      A.glow(ctx, x1 + 0.01 * s, y1 - 0.16 * s, 0.14 * s, '#ff7a3a', 0.7); smoke(ctx, x1, y1 - 0.18 * s, s, r);
    } else if (name === 'glasses') {
      const [x, y] = at(0.42, -0.02), [bx, by] = at(-0.18, 0.02);
      ctx.strokeStyle = A.rgba(o.color || '#c8b070', 0.9); ctx.lineWidth = 0.028 * s;
      ctx.beginPath(); ctx.moveTo(x - 0.06 * s, y); ctx.lineTo(bx, by); ctx.stroke();
      ctx.fillStyle = A.rgba(o.lens || '#9fc8d8', 0.35); ctx.beginPath(); ctx.ellipse(x + 0.08 * s, y, 0.14 * s, 0.12 * s, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = A.rgba('#ffffff', 0.9); ctx.beginPath(); ctx.ellipse(x + 0.13 * s, y - 0.05 * s, 0.035 * s, 0.018 * s, -0.5, 0, Math.PI * 2); ctx.fill();
    } else if (name === 'earring') {
      const [x, y] = at(-0.16, 0.44);
      ctx.fillStyle = A.rgba(o.color || '#e8c060'); ctx.beginPath(); ctx.arc(x, y + 0.08 * s, 0.05 * s, 0, Math.PI * 2); ctx.fill();
      if (o.drop) { ctx.beginPath(); ctx.ellipse(x, y + 0.24 * s, 0.045 * s, 0.09 * s, 0, 0, Math.PI * 2); ctx.fill(); }
      A.glow(ctx, x, y + 0.1 * s, 0.14 * s, o.color || '#e8c060', 0.6);
    } else if (name === 'flower') {
      const [x, y] = at(-0.62, -0.8);
      for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; ctx.fillStyle = A.rgba(i % 2 ? '#c01830' : '#e02a44'); ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * 0.08 * s, y + Math.sin(a) * 0.08 * s, 0.1 * s, 0.07 * s, a, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = '#6a0a14'; ctx.beginPath(); ctx.arc(x, y, 0.05 * s, 0, Math.PI * 2); ctx.fill();
    } else if (name === 'pearls') {
      for (let i = 0; i < 11; i++) { const t = i / 10; const [x, y] = at(A.lerp(-0.52, 0.22, t), 1.28 + Math.sin(t * Math.PI) * 0.16, false); ctx.fillStyle = A.rgba('#f4f0e6'); ctx.beginPath(); ctx.arc(x, y, 0.045 * s, 0, Math.PI * 2); ctx.fill(); }
    } else if (name === 'shirt') { // 셔츠 깃과 넥타이 (색 포인트)
      const P1 = [[0.1, 1.24], [0.34, 1.36], [0.46, 1.62], [0.3, 1.66], [0.18, 1.46]].map(p => at(p[0], p[1], false));
      A.poly(ctx, P1, A.rgba(o.color || '#d8d2c2'));
      if (o.tie) { A.poly(ctx, [[0.3, 1.5], [0.42, 1.52], [0.5, 1.9], [0.42, 2.3], [0.34, 1.92]].map(p => at(p[0], p[1], false)), A.rgba(o.tie)); }
      if (o.bow) { A.poly(ctx, [[0.3, 1.46], [0.48, 1.38], [0.5, 1.58], [0.3, 1.5], [0.16, 1.6], [0.14, 1.4]].map(p => at(p[0], p[1], false)), A.rgba(o.bow)); }
    } else if (name === 'wing') { // 연미복의 높은 흰 깃
      A.poly(ctx, [[-0.3, 1.04], [0.24, 1.0], [0.34, 1.3], [0.42, 1.44], [0.26, 1.46], [0.1, 1.3], [-0.34, 1.3]].map(p => at(p[0], p[1], false)), A.rgba('#e8e4da'));
      A.poly(ctx, [[0.28, 1.38], [0.46, 1.3], [0.48, 1.5], [0.28, 1.44], [0.12, 1.52], [0.1, 1.34]].map(p => at(p[0], p[1], false)), A.rgba('#0a0a0c'));
    } else if (name === 'scarf') {
      const col = o.color || '#8a2a2a';
      A.poly(ctx, [[-0.6, 0.98], [0.3, 1.1], [0.36, 1.44], [-0.62, 1.42]].map(p => at(p[0], p[1], false)), A.rgba(col));
      A.poly(ctx, [[0.14, 1.36], [0.42, 1.4], [0.56, 2.1], [0.3, 2.14]].map(p => at(p[0], p[1], false)), A.rgba(A.shade(col, 0.8)));
    } else if (name === 'kerchief') {
      A.poly(ctx, [[-0.56, 1.02], [0.28, 1.08], [0.36, 1.3], [0.1, 1.6], [-0.6, 1.3]].map(p => at(p[0], p[1], false)), A.rgba(o.color || '#c83a2a'));
    } else if (name === 'headphones') {
      const [x, y] = at(-0.22, 0.02), [tx, ty] = at(-0.2, -1.12);
      ctx.strokeStyle = A.rgba(o.band || '#2a2a2e'); ctx.lineWidth = 0.08 * s; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(tx - 0.3 * s, ty, tx + 0.1 * s, ty + 0.06 * s); ctx.stroke();
      ctx.fillStyle = A.rgba(o.color || '#c83a3a'); ctx.beginPath(); ctx.ellipse(x, y, 0.2 * s, 0.26 * s, 0.1, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = A.rgba('#ffffff', 0.25); ctx.beginPath(); ctx.ellipse(x + 0.05 * s, y - 0.08 * s, 0.06 * s, 0.1 * s, 0.1, 0, Math.PI * 2); ctx.fill();
      A.line(ctx, x, y + 0.26 * s, x - 0.1 * s, y + 1.2 * s, '#1a1a1a', 0.03 * s);
    } else if (name === 'crown') {
      ctx.save(); ctx.globalAlpha = 0.95;
      const pts = HAT.crown[0].map(p => at(p[0], p[1]));
      A.poly(ctx, pts, A.rgba(o.color || '#d8b84a'));
      for (let i = 0; i < 4; i++) { const [x, y] = at(-0.6 + i * 0.36, -1.0); ctx.fillStyle = A.rgba(['#c02a2a', '#2a6ac0', '#2a9a4a', '#c02a2a'][i]); ctx.beginPath(); ctx.arc(x, y, 0.045 * s, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    } else if (name === 'badge') {
      const [x, y] = at(o.x || 0.1, o.y || 2.2, false);
      A.poly(ctx, [[x, y - 0.12 * s], [x + 0.1 * s, y - 0.06 * s], [x + 0.08 * s, y + 0.08 * s], [x, y + 0.14 * s], [x - 0.08 * s, y + 0.08 * s], [x - 0.1 * s, y - 0.06 * s]], A.rgba(o.color || '#d8b050'));
    } else if (name === 'epaulette') {
      const [x, y] = at(-0.8, 1.56, false);
      ctx.save(); ctx.translate(x, y); ctx.rotate(0.35); A.rect(ctx, -0.3 * s, -0.05 * s, 0.6 * s, 0.1 * s, o.color || '#c8a850'); for (let i = 0; i < 6; i++) A.rect(ctx, -0.3 * s + i * 0.1 * s, 0.05 * s, 0.03 * s, 0.1 * s, o.color || '#c8a850'); ctx.restore();
      for (let i = 0; i < 3; i++) { const [bx, by] = at(0.5, 1.9 + i * 0.3, false); ctx.fillStyle = A.rgba(o.color || '#c8a850'); ctx.beginPath(); ctx.arc(bx, by, 0.04 * s, 0, Math.PI * 2); ctx.fill(); }
    } else if (name === 'capbadge') {
      const [x, y] = at(o.x || 0.3, o.y || -1.04);
      ctx.fillStyle = A.rgba(o.color || '#d8b050'); ctx.beginPath(); ctx.arc(x, y, 0.07 * s, 0, Math.PI * 2); ctx.fill();
      if (o.band) { const p = [[-0.86, -0.8], [0.6, -0.84], [0.6, -0.72], [-0.84, -0.68]].map(q => at(q[0], q[1])); A.poly(ctx, p, A.rgba(o.band)); }
    } else if (name === 'pencil') {
      const [x, y] = at(-0.08, -0.28);
      ctx.save(); ctx.translate(x, y); ctx.rotate(-1.15);
      A.rect(ctx, -0.028 * s, -0.3 * s, 0.056 * s, 0.34 * s, '#c89434');
      A.poly(ctx, [[-0.028 * s, 0.04 * s], [0.028 * s, 0.04 * s], [0, 0.11 * s]], '#e8d0a8');
      A.rect(ctx, -0.028 * s, -0.34 * s, 0.056 * s, 0.05 * s, '#c86a6a');
      ctx.restore();
    } else if (name === 'binoculars') {
      const [x, y] = at(0.3, 2.1, false);
      A.rect(ctx, x - 0.3 * s, y - 0.2 * s, 0.26 * s, 0.4 * s, '#1a1c1e'); A.rect(ctx, x + 0.04 * s, y - 0.2 * s, 0.26 * s, 0.4 * s, '#1a1c1e');
      for (const dx of [-0.17, 0.17]) { ctx.strokeStyle = A.rgba('#8a9aa4'); ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(x + dx * s, y - 0.2 * s, 0.1 * s, 0.035 * s, 0, 0, Math.PI * 2); ctx.stroke(); }
      A.line(ctx, x - 0.3 * s, y - 0.1 * s, x - 0.6 * s, y - 0.9 * s, '#2a1a10', 0.03 * s);
    } else if (name === 'knitting') {
      const [x, y] = at(0.5, 2.6, false);
      ctx.fillStyle = A.rgba(o.color || '#b83a3a'); ctx.beginPath(); ctx.ellipse(x, y, 0.4 * s, 0.22 * s, -0.2, 0, Math.PI * 2); ctx.fill();
      A.line(ctx, x - 0.4 * s, y + 0.1 * s, x + 0.5 * s, y - 0.6 * s, '#d8d0b8', 0.025 * s); A.line(ctx, x - 0.2 * s, y + 0.2 * s, x + 0.6 * s, y - 0.4 * s, '#d8d0b8', 0.025 * s);
      ctx.strokeStyle = A.rgba(o.color || '#b83a3a'); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 0.3 * s, y); ctx.quadraticCurveTo(x + 0.8 * s, y + 0.4 * s, x + 1.2 * s, y + 0.3 * s); ctx.stroke();
    } else if (name === 'scaleflakes') {
      for (let i = 0; i < 14; i++) { const [x, y] = at(0.6 + r() * 0.9, 1.4 + r() * 1.3, false); const cc = r.pick(['#9fe0d0', '#c0d8f0', '#f0e0a0', '#e0a0c0']); ctx.fillStyle = A.rgba(cc, 0.9); ctx.beginPath(); ctx.ellipse(x, y, 0.05 * s, 0.035 * s, r() * 3, 0, Math.PI * 2); ctx.fill(); A.glow(ctx, x, y, 0.12 * s, cc, 0.4); }
    } else if (name === 'bandoneon') {
      const [x, y] = at(0.55, 2.55, false);
      ctx.save(); ctx.translate(x, y); ctx.rotate(-0.1);
      A.rect(ctx, -0.5 * s, -0.3 * s, 0.16 * s, 0.6 * s, '#141416'); A.rect(ctx, 0.34 * s, -0.3 * s, 0.16 * s, 0.6 * s, '#141416');
      for (let i = 0; i < 7; i++) A.rect(ctx, -0.34 * s + i * 0.1 * s, -0.27 * s, 0.07 * s, 0.54 * s, i % 2 ? '#3a0e14' : '#5a1a22');
      for (let i = 0; i < 6; i++) { ctx.fillStyle = '#e8e2d4'; ctx.beginPath(); ctx.arc(-0.44 * s + (i % 2) * 0.06 * s, -0.2 * s + Math.floor(i / 2) * 0.16 * s, 0.022 * s, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    } else if (name === 'wheel') {
      const [x, y] = at(-0.9, 3.0, false);
      ctx.strokeStyle = A.rgba('#3a3c40'); ctx.lineWidth = 0.08 * s; ctx.beginPath(); ctx.arc(x, y, 1.0 * s, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
      ctx.lineWidth = 0.025 * s; for (let i = 0; i < 6; i++) { const a = Math.PI * (1.05 + i * 0.16); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * s, y + Math.sin(a) * s); ctx.stroke(); }
      A.line(ctx, x - 0.9 * s, y - 0.2 * s, x - 1.2 * s, y - 1.1 * s, '#3a3c40', 0.07 * s);
    } else if (name === 'goldtooth') {
      const [x, y] = at(0.6, 0.52);
      ctx.fillStyle = '#ffd060'; ctx.fillRect(x - 0.01 * s, y - 0.02 * s, 0.03 * s, 0.03 * s); A.glow(ctx, x, y, 0.1 * s, '#ffd060', 0.7);
    } else if (name === 'sweat') {
      for (const [dx, dy] of [[0.5, -0.5], [0.44, -0.62], [0.54, -0.34]]) { const [x, y] = at(dx, dy); ctx.fillStyle = A.rgba('#e8f0f4', 0.8); ctx.beginPath(); ctx.ellipse(x, y, 0.02 * s, 0.035 * s, 0, 0, Math.PI * 2); ctx.fill(); }
    } else if (name === 'tear') {
      const [x, y] = at(0.46, 0.2); ctx.fillStyle = A.rgba('#e8f0f4', 0.85); ctx.beginPath(); ctx.ellipse(x, y, 0.025 * s, 0.045 * s, 0, 0, Math.PI * 2); ctx.fill();
    } else if (name === 'eye') {
      const [x, y] = at(0.47, -0.03); ctx.fillStyle = A.rgba(o.color || '#e8f4f4', o.a || 0.9); ctx.beginPath(); ctx.ellipse(x, y, 0.035 * s, 0.018 * s, 0, 0, Math.PI * 2); ctx.fill(); A.glow(ctx, x, y, 0.08 * s, o.color || '#e8f4f4', 0.5);
    } else if (name === 'lipstick') {
      const pts = [[0.6, 0.47], [0.64, 0.5], [0.6, 0.55], [0.63, 0.585], [0.58, 0.6], [0.57, 0.45]].map(p => at(p[0], p[1]));
      A.poly(ctx, pts, A.rgba(o.color || '#b01a2a'));
    } else if (name === 'parrot') { // 앵무새 셔츠 깃
      const P1 = [[0.06, 1.22], [0.36, 1.34], [0.56, 1.7], [0.7, 2.2], [0.4, 2.4], [0.1, 1.8], [-0.2, 1.5], [-0.6, 1.3]].map(p => at(p[0], p[1], false));
      A.poly(ctx, P1, A.rgba('#1e7a5a'));
      ctx.save(); A.poly(ctx, P1); ctx.clip();
      for (let i = 0; i < 16; i++) { const [x, y] = at(-0.5 + r() * 1.2, 1.25 + r() * 1.1, false); ctx.fillStyle = A.rgba(r.pick(['#f0c030', '#e84a2a', '#3ab0e0', '#f4f0e0'])); ctx.beginPath(); ctx.ellipse(x, y, 0.07 * s, 0.035 * s, r() * 3, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    } else if (name === 'stubble') {
      for (let i = 0; i < 60; i++) { const [x, y] = at(0.2 + r() * 0.4, 0.6 + r() * 0.3); ctx.fillStyle = A.rgba('#000000', 0.5); ctx.fillRect(x, y, 1.5, 1.5); }
    } else if (name === 'bruise') {
      const [x, y] = at(0.46, -0.3); A.glow(ctx, x, y, 0.2 * s, '#8a3a6a', 0.35);
    } else if (name === 'smokeOnly') {
      const [x, y] = at(0.8, 0.4); smoke(ctx, x, y, s, r);
    }
    ctx.restore();
  }
  function smoke(ctx, x, y, s, r) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = A.rgba('#c8c8c8', 0.18); ctx.lineCap = 'round';
    for (let k = 0; k < 3; k++) {
      ctx.lineWidth = (0.05 + k * 0.03) * s;
      ctx.beginPath(); ctx.moveTo(x, y);
      let px = x, py = y;
      for (let i = 0; i < 6; i++) { const nx = px + (Math.sin(i * 1.3 + k) * 0.18 + 0.05) * s, ny = py - 0.22 * s; ctx.quadraticCurveTo(px + (r() - 0.5) * 0.3 * s, (py + ny) / 2, nx, ny); px = nx; py = ny; }
      ctx.stroke();
    }
    ctx.restore();
  }

  /* ───────── 인물들 ───────── */
  const D = (spec) => (W, H) => A.card(W, H, spec);
  const C = A.portraitSpecs = {
    you: { seed: 1, bg: { top: '#5a1426', bot: '#0e0508', motif: 'neon', accent: '#ff2f5a' }, rim: '#ff7a9a', rim2: '#5ab0c8', face: { nose: 1.05, chin: 1.05, lips: 1, brow: 1.1 }, hair: 'wild', hairC: '#111014', props: ['parrot', 'stubble', 'bruise'] },
    yun: { seed: 2, bg: { top: '#1f4a50', bot: '#081416', motif: 'blinds', accent: '#8fe8e0', accentA: 0.12 }, rim: '#bff4f0', rim2: '#f0c27a', face: { nose: 0.5, noseTip: -0.2, chin: 0.72, lips: 0.9 }, hair: 'bob', bust: { woman: true }, collar: 'leather', props: ['pencil'] },
    orla: { seed: 3, bg: { top: '#5a1030', bot: '#12040a', motif: 'bokeh', colors: ['#ff6a8a', '#ffb060', '#ff3060'] }, rim: '#ffb0c0', rim2: '#c060a0', face: { nose: 0.7, chin: 0.9, lips: 1.3, age: 0.2 }, hair: 'updo', bust: { woman: true }, props: ['flower', { t: 'earring', drop: true }, 'pearls', 'lipstick', 'cigarette'] },
    emile: { seed: 4, bg: { top: '#4a3014', bot: '#0e0904', motif: 'bokeh', colors: ['#ffb060', '#ffd08a'] }, rim: '#ffd090', rim2: '#6a8ab0', face: { nose: 0.9, chin: 1.1 }, hair: 'slick', beard: 'mustache', props: [{ t: 'shirt', color: '#e8e2d2', bow: '#1a1a1c' }] },
    paco: { seed: 5, bg: { top: '#4a1418', bot: '#0c0406', glow: [420, 120, 380, '#ffc070', 0.35] }, rim: '#ffc890', rim2: '#8a6ac0', face: { nose: 1.3, noseTip: 0.6, chin: 0.9, age: 0.6 }, hair: 'receding', hairC: '#3a3a40', beard: 'walrus', hat: 'fedora', tilt: 0.12, props: ['bandoneon'] },
    bobo: { seed: 6, s: 112, hy: 300, bg: { top: '#3a5064', bot: '#0c1218', motif: 'cranes' }, rim: '#ffd8a0', rim2: '#8ab8d8', face: { nose: 0.4, noseTip: -0.6, chin: 0.6, lips: 1 }, hair: 'curly', hat: 'cap', bust: { bulk: 0.66, chest: 0.62 } },
    marga: { seed: 7, bg: { top: '#7a3a14', bot: '#140804', motif: 'fire', accent: '#ffa040' }, rim: '#ffc080', rim2: '#6a9ac0', face: { nose: 0.9, chin: 1.1, lips: 1.1, age: 0.3 }, hair: 'bun', bust: { woman: true, chest: 1.1 }, props: [{ t: 'kerchief', color: '#c8302a' }, { t: 'earring' }] },
    ignacio: { seed: 8, bg: { top: '#3a3a1e', bot: '#0c0c06', motif: 'shelves', accent: '#e8d8a0', accentA: 0.08 }, rim: '#f0e0b0', rim2: '#7a9ab0', face: { nose: 1.1, noseTip: 0.3, chin: 0.8, age: 0.4 }, hair: 'short', hairC: '#262628', beard: 'goatee', props: ['glasses', { t: 'scarf', color: '#5a6a3a' }] },
    aurelio: { seed: 9, bg: { top: '#6a5a1e', bot: '#140f04', motif: 'deco', accent: '#ffe08a', accentA: 0.14 }, rim: '#ffe6a0', rim2: '#a06ac0', face: { nose: 1.2, noseTip: 0.4, chin: 1.2, age: 0.4 }, hair: 'wild', hairC: '#2a2622', beard: 'beard', props: ['crown'] },
    gregor: { seed: 10, bg: { top: '#3a4a58', bot: '#0a1016', motif: 'waves', accent: '#c8d8e0', accentA: 0.12 }, rim: '#e0e8f0', rim2: '#c89a6a', face: { nose: 1.1, chin: 1.0, age: 0.8 }, hair: 'bald', hairC: '#3c3c42', hat: 'fedora', tilt: 0.06, props: [{ t: 'shirt', color: '#b8b2a4', tie: '#3a2a2a' }] },
    rosa: { seed: 11, bg: { top: '#6a1414', bot: '#140404', glow: [440, 160, 320, '#ff8a6a', 0.3] }, rim: '#ffc0a0', rim2: '#8ab0c8', face: { nose: 1.0, noseTip: 0.4, chin: 1.0, lips: 0.8, age: 0.9 }, hair: 'bun', hairC: '#46464c', bust: { woman: true }, collar: 'shawl', props: ['glasses', 'wheel'] },
    mateo: { seed: 12, s: 100, bg: { top: '#5a2a10', bot: '#100604', motif: 'fire', accent: '#ff8a3a' }, rim: '#ffb070', rim2: '#6a90b0', face: { nose: 1.2, noseTip: -0.2, chin: 1.4, lips: 1.1, brow: 1.4 }, hair: 'crop', bust: { bulk: 1.35, chest: 1.3 }, props: [{ t: 'kerchief', color: '#a02020' }] },
    alonso: { seed: 13, bg: { top: '#4a2a1a', bot: '#0e0604', motif: 'fire', accent: '#ff9a4a' }, rim: '#ffc080', rim2: '#6a90b0', face: { nose: 1.0, chin: 0.9, lips: 1 }, hair: 'short', beard: 'walrus', hat: 'beret', props: ['cigarette'] },
    pepe: { seed: 14, bg: { top: '#4a2412', bot: '#0e0604', motif: 'fire', accent: '#ff8a3a' }, rim: '#ffb070', rim2: '#6a90b0', face: { nose: 0.8, noseTip: -0.4, chin: 1.2, lips: 0.9 }, hair: 'crop', hat: 'beanie', hatC: '#141210', props: ['cigarette'] },
    lauro: { seed: 15, bg: { top: '#3a2a1a', bot: '#0c0604', motif: 'fire', accent: '#ff9a4a' }, rim: '#ffc080', rim2: '#6a90b0', face: { nose: 0.9, chin: 0.8, lips: 1 }, hair: 'short', hat: 'cap', tilt: 0.22 },
    simon: { seed: 16, bg: { top: '#2a3a4a', bot: '#080c10', motif: 'window', accent: '#ffc070', accentA: 0.12 }, rim: '#ffd090', rim2: '#7aa0c0', face: { nose: 1.4, noseTip: 0.8, chin: 0.8, age: 0.7 }, hair: 'short', hairC: '#3a3a40', hat: 'beanie', hatC: '#1a2030', beard: 'beard', props: ['pipe'] },
    kruyf: { seed: 17, bg: { top: '#bcd0c0', bot: '#3a4a40', motif: 'leaves', accent: '#1a3a24', accentA: 0.2 }, rim: '#ffffff', rim2: '#6a9a7a', dark: '#141a18', face: { nose: 0.8, noseTip: -0.1, chin: 0.7, lips: 0.8, forehead: 1.4 }, hair: 'slick', hairC: '#2a2a22', bust: { chest: 0.85 }, props: [{ t: 'shirt', color: '#f4f2ea', tie: '#3a5a8a' }, 'glasses'] },
    pilon: { seed: 18, bg: { top: '#8a7040', bot: '#1a1408', motif: 'deco', accent: '#fff0c0', accentA: 0.12 }, rim: '#ffe8b0', rim2: '#8a6ac0', face: { nose: 1.0, noseTip: 0.2, chin: 1.2, lips: 0.8, skull: 1.05 }, beard: 'mustache', tilt: -0.08, props: ['wing'] },
    rasmus: { seed: 19, bg: { top: '#3a4248', bot: '#0a0c0e', motif: 'blinds', accent: '#d8e4ec', accentA: 0.1 }, rim: '#e0ecf4', rim2: '#c89a5a', face: { nose: 1.1, noseTip: 0.3, chin: 1.3, brow: 1.3 }, hair: 'crop', hairC: '#2e2e34', hat: 'captain', hatC: '#2a2e32', collar: 'coat', props: [{ t: 'capbadge', color: '#c8b070' }, 'cigarette'] },
    cesar: { seed: 20, bg: { top: '#4a3014', bot: '#0e0804', motif: 'balls', accent: '#e8b040', accentA: 0.14 }, rim: '#ffd080', rim2: '#7a9ab0', face: { nose: 3.2, noseTip: 0.7, chin: 1.2, lips: 1.3, age: 0.4 }, hair: 'receding', bust: { bulk: 1.3, chest: 1.35 }, props: ['goldtooth', 'sweat', { t: 'shirt', color: '#d8ceb4' }] },
    lina: { seed: 21, bg: { top: '#3a1a5a', bot: '#0a0414', motif: 'radio', accent: '#d8a0ff', accentA: 0.18 }, rim: '#e8c0ff', rim2: '#60d0c0', face: { nose: 0.45, noseTip: -0.5, chin: 0.65, lips: 1 }, hair: 'bob', bust: { woman: true, chest: 0.85 }, collar: 'turtle', props: [{ t: 'headphones', color: '#e04040' }] },
    perpetua: { seed: 22, bg: { top: '#1e4a44', bot: '#04100e', motif: 'scales', accent: '#9fe0d0', accentA: 0.12 }, rim: '#c0f0e0', rim2: '#d0a060', face: { nose: 1.3, noseTip: 0.9, chin: 1.3, lips: 0.6, age: 1 }, hat: 'scarf', hatC: '#1a1414', bust: { woman: true }, collar: 'shawl', tilt: 0.1, props: ['scaleflakes', { t: 'eye', color: '#c0f0e0' }] },
    lorenzo: { seed: 23, bg: { top: '#4a4a6a', bot: '#0e0c16', motif: 'beam', accent: '#fff0c0', accentA: 0.12 }, rim: '#ffe8c0', rim2: '#7a8ac0', face: { nose: 1.1, chin: 1.0, age: 0.8 }, hair: 'receding', hairC: '#4a4a50', beard: 'beard', props: ['binoculars'] },
    maria: { seed: 24, bg: { top: '#5a4a24', bot: '#100c04', motif: 'window', accent: '#ffc860', accentA: 0.14 }, rim: '#ffd890', rim2: '#7a9ac0', face: { nose: 0.9, chin: 0.9, lips: 0.8, age: 0.9 }, hair: 'bun', hairC: '#4c4c52', bust: { woman: true }, collar: 'shawl', props: ['glasses', { t: 'knitting', color: '#c03a3a' }] },
    volk: { seed: 25, bg: { top: '#1a2a4a', bot: '#04080e', motif: 'stars', accent: '#e8d890', accentA: 0.12 }, rim: '#d0e0ff', rim2: '#ffb060', face: { nose: 0.9, chin: 1.3, lips: 0.8, brow: 1.2 }, hair: 'crop', hat: 'kepi', hatC: '#1a2436', collar: 'uniform', props: [{ t: 'capbadge', color: '#e8d890' }, { t: 'badge', color: '#e8d890', x: 0.4, y: 2.0 }] },
    ines: { seed: 26, bg: { top: '#141418', bot: '#020203', motif: 'door', accent: '#ffc070', accentA: 0.2, glow: [470, 300, 260, '#ffb060', 0.35] }, rim: '#ffc890', rim2: '#5a7a9a', rimA: 0.9, face: { nose: 0.6, noseTip: -0.1, chin: 0.8, lips: 1.1 }, hair: 'long', bust: { woman: true }, collar: 'coat', props: [{ t: 'eye', color: '#ffe0b0', a: 0.8 }] },
    valdes: { seed: 27, bg: { top: '#2a3a34', bot: '#060a08', motif: 'blinds', accent: '#d8f0e0', accentA: 0.1 }, rim: '#e0f0e4', rim2: '#c08a5a', face: { nose: 1.2, noseTip: 0.5, chin: 1.1, age: 0.5 }, hair: 'receding', hairC: '#2a2a2e', beard: 'mustache', collar: 'coat', props: [{ t: 'shirt', color: '#d8d8cc', tie: '#2a3a2a' }, 'cigarette'] },
    pilar: { seed: 28, bg: { top: '#2a3444', bot: '#06080c', motif: 'blinds', accent: '#d8e4f0', accentA: 0.1 }, rim: '#e0ecf8', rim2: '#d09a6a', face: { nose: 0.8, chin: 1.0, lips: 1 }, hair: 'bun', bust: { woman: true }, hat: 'kepi', hatC: '#1a2230', collar: 'uniform', props: [{ t: 'capbadge', color: '#c8c8d0' }, { t: 'badge', color: '#c8c8d0', x: 0.35, y: 2.05 }] },
    oriol: { seed: 29, s: 104, bg: { top: '#2a3444', bot: '#06080c', motif: 'blinds', accent: '#d8e4f0', accentA: 0.1 }, rim: '#e0ecf8', rim2: '#d09a6a', face: { nose: 0.6, noseTip: -0.3, chin: 0.7, lips: 1 }, hair: 'short', hat: 'kepi', hatC: '#1a2230', collar: 'uniform', props: [{ t: 'capbadge', color: '#c8c8d0' }] },
    crow: { seed: 30, bg: { top: '#34383c', bot: '#08090a', motif: 'blinds', accent: '#c8d0d8', accentA: 0.08 }, rim: '#d8e0e8', rim2: '#a06040', face: { nose: 1.0, chin: 1.3, brow: 1.3 }, hair: 'crop', hat: 'beret', hatC: '#2a2e30', collar: 'coat' },
    worker: { seed: 31, bg: { top: '#4a3a2a', bot: '#0e0a06', motif: 'fire', accent: '#ffa050' }, rim: '#ffc890', rim2: '#6a9ac0', face: { nose: 0.7, chin: 0.9, lips: 1.1 }, hat: 'scarf', hatC: '#3a1e1a', bust: { woman: true }, props: [{ t: 'kerchief', color: '#3a6a8a' }] },
    fisher: { seed: 32, bg: { top: '#34485a', bot: '#080e14', motif: 'waves', accent: '#c8d8e0', accentA: 0.12 }, rim: '#e0e8f0', rim2: '#c89a6a', face: { nose: 1.2, noseTip: 0.4, age: 0.8 }, hair: 'short', hairC: '#3a3a40', hat: 'beanie', beard: 'beard', props: ['pipe'] },
  };
  for (const id in C) P[id] = D(C[id]);
})(window);
