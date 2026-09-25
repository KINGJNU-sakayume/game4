/* 탱고 레테 — 인물 초상 (카메오 실루엣)
 * 붓질로 그린 배경 위에 또렷한 옆얼굴 실루엣. 얼굴 앞선에만 가는 림 라이트가 걸린다.
 * 인물은 머리 모양·모자·소품·배경색으로 구별한다. 좌표는 480×600 기준, 얼굴은 오른쪽을 본다.
 */
(function (G) {
  'use strict';
  const A = G.ART;
  const P = A.portraits = {};

  /* Catmull-Rom 스플라인으로 점들을 매끄럽게 잇는다 */
  A.spline = function (ctx, pts, closed = false, move = true) {
    const n = pts.length;
    const get = i => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
    if (move) ctx.moveTo(pts[0][0], pts[0][1]);
    const end = closed ? n : n - 1;
    for (let i = 0; i < end; i++) {
      const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
      ctx.bezierCurveTo(
        p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6,
        p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6,
        p2[0], p2[1]);
    }
  };

  /* 옆얼굴의 윤곽점 (머리 높이 2 단위, 눈높이 y=0, 오른쪽이 얼굴)
   * f: nose(크기), noseTip(-1 들창 ~ +1 매부리), chin, lips, forehead(기울기), jaw, neck, age, throat(목젖)
   */
  A.profilePoints = function (f = {}) {
    const nose = f.nose === undefined ? 1 : f.nose, tip = f.noseTip || 0;
    const chin = f.chin === undefined ? 1 : f.chin, lips = f.lips === undefined ? 1 : f.lips;
    const fh = f.forehead === undefined ? 1 : f.forehead, jaw = f.jaw === undefined ? 1 : f.jaw;
    const neck = f.neck === undefined ? 1 : f.neck, age = f.age || 0;
    const front = [
      [0.40, -0.86],                     // 앞머리 윗부분
      [0.52 + 0.03 * fh, -0.58],         // 이마
      [0.58 + 0.02 * fh, -0.30],
      [0.62, -0.12],                     // 눈썹뼈
      [0.575, 0.00],                     // 콧대 뿌리
      [0.62 + 0.05 * nose + 0.03 * tip, 0.14 + 0.02 * tip],   // 콧등
      [0.70 + 0.10 * nose, 0.30 + 0.02 * nose - 0.03 * tip],   // 코끝
      [0.67 + 0.06 * nose, 0.37],        // 코끝 아래
      [0.60, 0.41],                      // 인중 시작
      [0.605 + 0.02 * lips, 0.47],       // 윗입술
      [0.62 + 0.03 * lips, 0.505],
      [0.585, 0.545],                    // 입꼬리
      [0.61 + 0.025 * lips, 0.585],      // 아랫입술
      [0.575, 0.645],                    // 턱 오목
      [0.585 + 0.05 * chin, 0.74 + 0.02 * age],   // 턱 끝
      [0.54 + 0.03 * chin, 0.84 + 0.04 * age],
      [0.40, 0.90 + 0.05 * age],         // 턱 아래
    ];
    const under = [
      [0.22 * jaw, 0.93 + 0.08 * age],   // 턱선에서 목으로
      [0.24 + (f.throat ? 0.05 : 0), 1.10],    // 목젖
      [0.30 * neck, 1.30],
      [0.40 * neck, 1.52],               // 목 앞 아래
    ];
    const back = [
      [-0.56 * neck, 1.52],              // 목 뒤 아래
      [-0.52 * neck, 1.18],
      [-0.56, 0.84],                     // 목덜미
      [-0.78, 0.46],
      [-0.90, 0.00],                     // 뒤통수
      [-0.84, -0.46],
      [-0.58, -0.86],
      [-0.12, -1.04],                    // 정수리
      [0.20, -1.00],
    ];
    return { front, under, back, all: front.concat(under, back) };
  };

  /* 실루엣 머리 경로 */
  A.profileHead = function (ctx, cx, cy, s, f) {
    const p = A.profilePoints(f).all.map(([x, y]) => [cx + x * s, cy + y * s]);
    ctx.beginPath();
    A.spline(ctx, p, true);
    ctx.closePath();
  };
  A.profileFront = function (ctx, cx, cy, s, f) {
    const p = A.profilePoints(f).front.map(([x, y]) => [cx + x * s, cy + y * s]);
    ctx.beginPath();
    A.spline(ctx, p, false);
  };

  /* 배경만 붓질로 그린 캔버스 */
  A.paintedBack = function (W, H, draw, o = {}) {
    const ref = A.canvas(W, H);
    const ctx = ref.getContext('2d', { willReadFrequently: true });
    draw(ctx, W, H, A.rng(o.seed || 3));
    return A.painterly(ref, Object.assign({ radii: [22, 11, 6, 3], threshold: 12, under: 18, jitter: 0.08, curve: 0.25, angle: -1.2 }, o));
  };

  /* 카메오 초상
   * c: { bg(ctx,w,h,r), face, head: {x,y,s}, skin, rim, rimA, coat(fn), hair(fn), hatBack(fn), hat(fn), props(fn), front(fn), flip }
   */
  A.cameo = function (W, H, c) {
    const k = W / 480;
    const back = A.paintedBack(W, H, (ctx, w, h, r) => { ctx.save(); ctx.scale(k, k); c.bg(ctx, 480, 600, r); ctx.restore(); }, c.paint || {});
    const out = A.canvas(W, H);
    const ctx = out.getContext('2d');
    ctx.drawImage(back, 0, 0);
    const r = A.rng(c.seed || 17);
    ctx.save();
    ctx.scale(k, k);
    if (c.flip) { ctx.translate(480, 0); ctx.scale(-1, 1); }
    const hx = c.head ? c.head.x : 250, hy = c.head ? c.head.y : 250, hs = c.head ? c.head.s : 118;
    const dark = c.skin || '#141519';
    const rim = c.rim || '#ffd2a0';
    const fill = (fn) => {
      ctx.save();
      fn();
      ctx.restore();
    };
    // 뒤쪽 모자 챙, 뒷머리
    if (c.hatBack) fill(() => c.hatBack(ctx, hx, hy, hs, r, dark, rim));
    if (c.hairBack) fill(() => c.hairBack(ctx, hx, hy, hs, r, dark, rim));
    // 몸 (옷)
    if (c.coat) fill(() => c.coat(ctx, hx, hy, hs, r, dark, rim));
    // 머리
    ctx.fillStyle = A.rgba(dark);
    A.profileHead(ctx, hx, hy, hs, c.face || {});
    ctx.fill();
    // 얼굴 앞선 림 라이트 (머리 안쪽으로)
    ctx.save();
    A.profileHead(ctx, hx, hy, hs, c.face || {});
    ctx.clip();
    ctx.lineCap = 'round';
    ctx.filter = 'blur(' + (5 * k) + 'px)';
    ctx.strokeStyle = A.rgba(rim, (c.rimA || 0.8) * 0.6);
    ctx.lineWidth = 16;
    ctx.save(); ctx.translate(7, 0); A.profileFront(ctx, hx, hy, hs, c.face || {}); ctx.stroke(); ctx.restore();
    ctx.filter = 'blur(' + (1.1 * k) + 'px)';
    ctx.strokeStyle = A.rgba(A.mix(rim, '#ffffff', 0.4), c.rimA || 0.8);
    ctx.lineWidth = 3.2;
    ctx.save(); ctx.translate(1.6, 0); A.profileFront(ctx, hx, hy, hs, c.face || {}); ctx.stroke(); ctx.restore();
    ctx.filter = 'none';
    ctx.restore();
    // 머리카락, 모자, 소품
    if (c.hair) fill(() => c.hair(ctx, hx, hy, hs, r, dark, rim));
    if (c.hat) fill(() => c.hat(ctx, hx, hy, hs, r, dark, rim));
    if (c.props) fill(() => c.props(ctx, hx, hy, hs, r, dark, rim));
    ctx.restore();
    if (c.front) { ctx.save(); ctx.scale(k, k); c.front(ctx, 480, 600, r); ctx.restore(); }
    return A.finish(out, { texture: 0.22, vignette: c.vignette === undefined ? 0.45 : c.vignette, seed: c.seed || 5 });
  };

  /* 림이 걸리는 덩어리 (머리카락·모자·옷) — path는 경로만 만든다 */
  A.lit = function (ctx, path, dark, rim, a = 0.55, dx = 6, dy = -3, blur = 4) {
    ctx.fillStyle = A.rgba(dark);
    path(); ctx.fill();
    ctx.save();
    path(); ctx.clip();
    ctx.filter = 'blur(' + blur + 'px)';
    ctx.strokeStyle = A.rgba(rim, a);
    ctx.lineWidth = 10;
    ctx.translate(dx, dy);
    path(); ctx.stroke();
    ctx.restore();
  };

  /* 머리카락 결: 앞쪽에서 뒤로 흐르는 몇 가닥의 가는 곡선 */
  A.strands = function (ctx, r, rim, pts, n, spread, a = 0.16) {
    ctx.save();
    ctx.strokeStyle = A.rgba(rim, a);
    ctx.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const o = (r() - 0.5) * spread * 2;
      ctx.lineWidth = 0.8 + r() * 1.2;
      ctx.beginPath();
      A.spline(ctx, pts.map(([x, y], j) => [x + o * (0.3 + j * 0.4), y + o * 0.5]), false);
      ctx.stroke();
    }
    ctx.restore();
  };

  /* 기본 어깨 (코트) — 앞쪽 어깨선에만 빛 */
  A.shoulders = function (ctx, hx, hy, s, dark, rim, o = {}) {
    const sw = o.width || 1;
    const path = () => {
      ctx.beginPath();
      ctx.moveTo(-30, 640);
      A.spline(ctx, [
        [-30, 640], [hx - 2.05 * s * sw, hy + 2.35 * s], [hx - 1.55 * s * sw, hy + 1.72 * s],
        [hx - 0.62 * s, hy + 1.28 * s], [hx - 0.1 * s, hy + 1.36 * s], [hx + 0.42 * s, hy + 1.38 * s],
        [hx + 1.25 * s * sw, hy + 1.6 * s], [hx + 1.95 * s * sw, hy + 2.1 * s], [520, 640],
      ], false, false);
      ctx.lineTo(520, 640);
      ctx.closePath();
    };
    A.lit(ctx, path, o.color || dark, rim, o.a || 0.35, 5, -6, 6);
    if (o.lapel) {
      ctx.fillStyle = A.rgba(o.lapel);
      A.poly(ctx, [[hx - 0.1 * s, hy + 1.55 * s], [hx + 0.42 * s, hy + 1.58 * s], [hx + 0.62 * s, hy + 2.3 * s], [hx + 0.18 * s, hy + 2.1 * s]], A.rgba(o.lapel));
    }
    if (o.shirt) {
      ctx.fillStyle = A.rgba(o.shirt);
      A.poly(ctx, [[hx + 0.02 * s, hy + 1.52 * s], [hx + 0.32 * s, hy + 1.56 * s], [hx + 0.3 * s, hy + 1.9 * s], [hx + 0.1 * s, hy + 1.8 * s]], A.rgba(o.shirt));
    }
  };

  /* 배경 도우미 */
  const B = A.portraitBack = {
    wash(ctx, w, h, top, bot, glow) {
      ctx.fillStyle = A.lineGrad(ctx, 0, 0, 0, h, [[0, top], [1, bot]]);
      ctx.fillRect(0, 0, w, h);
      if (glow) A.glow(ctx, glow[0], glow[1], glow[2], glow[3], glow[4] === undefined ? 0.6 : glow[4]);
    },
    bokeh(ctx, r, n, colors, x0 = 0, x1 = 480, y0 = 0, y1 = 600, rad = [10, 36], a = 0.5) {
      for (let i = 0; i < n; i++) A.glow(ctx, x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), rad[0] + r() * (rad[1] - rad[0]), r.pick(colors), a * (0.4 + r() * 0.6));
    },
  };

  /* ───────── 인물들 ───────── */

  /* 윤 세하 — 턱선 단발, 귀 뒤의 몽당연필, 가죽 재킷 깃. 청록 신호등 빛. */
  P.yun = function (W, H) {
    return A.cameo(W, H, {
      seed: 21,
      bg(ctx, w, h, r) {
        B.wash(ctx, w, h, '#2d5d63', '#0b1719', [370, 190, 250, '#7fe0e0', 0.35]);
        B.bokeh(ctx, r, 10, ['#6fd6d6', '#f0c27a'], 300, 480, 60, 360, [8, 30], 0.35);
      },
      rim: '#bff4f0', skin: '#121417',
      face: { nose: 0.45, noseTip: -0.2, chin: 0.7, lips: 0.9, forehead: 1, jaw: 0.9, neck: 0.85 },
      coat(ctx, hx, hy, s, r, dark, rim) {
        A.shoulders(ctx, hx, hy, s, '#17110e', rim, { a: 0.35, lapel: '#241a15', shirt: '#2a2f33', width: 0.95 });
      },
      hair(ctx, hx, hy, s, r, dark, rim) {
        const path = () => {
          ctx.beginPath();
          A.spline(ctx, [
            [hx + 0.36 * s, hy - 0.80 * s], [hx + 0.12 * s, hy - 1.08 * s], [hx - 0.40 * s, hy - 1.06 * s],
            [hx - 0.86 * s, hy - 0.66 * s], [hx - 0.98 * s, hy + 0.05 * s], [hx - 0.86 * s, hy + 0.62 * s],
            [hx - 0.62 * s, hy + 0.80 * s], [hx - 0.30 * s, hy + 0.70 * s], [hx - 0.34 * s, hy + 0.20 * s],
            [hx - 0.20 * s, hy - 0.30 * s], [hx + 0.10 * s, hy - 0.52 * s], [hx + 0.44 * s, hy - 0.58 * s],
          ], true);
          ctx.closePath();
        };
        A.lit(ctx, path, '#0c0d10', rim, 0.5, 5, -4, 4);
        A.strands(ctx, r, rim, [[hx + 0.3 * s, hy - 0.9 * s], [hx - 0.35 * s, hy - 0.7 * s], [hx - 0.62 * s, hy + 0.7 * s]], 9, 0.1 * s);
      },
      props(ctx, hx, hy, s) {
        // 귀 뒤에 꽂은 몽당연필
        ctx.save(); ctx.translate(hx - 0.18 * s, hy - 0.26 * s); ctx.rotate(-1.05);
        ctx.fillStyle = '#b8872f'; ctx.fillRect(-0.035 * s, -0.24 * s, 0.07 * s, 0.4 * s);
        ctx.fillStyle = '#e0c49a'; A.poly(ctx, [[-0.035 * s, 0.16 * s], [0.035 * s, 0.16 * s], [0, 0.25 * s]], '#e0c49a');
        ctx.restore();
      },
    });
  };
})(window);
