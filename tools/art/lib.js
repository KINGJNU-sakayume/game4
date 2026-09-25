/* 탱고 레테 — 아트 파이프라인: 공용 그리기 도구
 * 헤드리스 Chromium에서 실행된다 (tools/art/render.mjs). 게임 코드에는 포함되지 않는다.
 *
 * 양식: 평면 색면 + 대기 원근 + 무대 조명.
 *  - 멀수록 안개색에 가까워지는 실루엣 층
 *  - 가산 합성으로 겹치는 빛번짐, 빛기둥, 바닥의 빛웅덩이
 *  - 젖은 바닥과 물에 비치는 세로 반사
 *  - 마무리로 블룸, 미세한 디더, 비네트 (그레인은 게임에서 실시간으로 얹는다)
 * 모든 장면은 1920×1080 좌표로 그린다.
 */
(function (G) {
  'use strict';
  const A = G.ART = {};

  /* ───────── 기본 ───────── */
  A.rng = function (seed) {
    let s = (seed >>> 0) || 1;
    const f = function () {
      s |= 0; s = (s + 0x6D2B79F5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    f.range = (a, b) => a + (b - a) * f();
    f.int = (a, b) => Math.floor(a + (b - a + 1) * f());
    f.pick = (arr) => arr[Math.floor(f() * arr.length)];
    f.chance = (p) => f() < p;
    return f;
  };
  A.canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  A.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  A.lerp = (a, b, t) => a + (b - a) * t;
  A.smoothstep = (a, b, x) => { const t = A.clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

  /* 값 노이즈 */
  A.noise = function (seed) {
    const r = A.rng(seed);
    const P = new Uint8Array(512), V = new Float32Array(256);
    for (let i = 0; i < 256; i++) { P[i] = i; V[i] = r(); }
    for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = P[i]; P[i] = P[j]; P[j] = t; }
    for (let i = 0; i < 256; i++) P[i + 256] = P[i];
    const sm = t => t * t * (3 - 2 * t);
    const n = (x, y) => {
      const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
      const a = V[P[(xi & 255) + P[yi & 255]]], b = V[P[((xi + 1) & 255) + P[yi & 255]]];
      const c = V[P[(xi & 255) + P[(yi + 1) & 255]]], d = V[P[((xi + 1) & 255) + P[(yi + 1) & 255]]];
      const u = sm(xf), v = sm(yf);
      return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
    };
    n.fbm = (x, y, oct = 4) => { let s = 0, amp = 0.5, f = 1, tot = 0; for (let i = 0; i < oct; i++) { s += amp * n(x * f, y * f); tot += amp; amp *= 0.5; f *= 2; } return s / tot; };
    return n;
  };

  /* ───────── 색 ───────── */
  A.hex = function (h) {
    if (Array.isArray(h)) return h;
    h = h.replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  };
  A.rgba = (c, a = 1) => { const x = A.hex(c); return 'rgba(' + Math.round(x[0]) + ',' + Math.round(x[1]) + ',' + Math.round(x[2]) + ',' + a + ')'; };
  A.mix = (a, b, t) => { const x = A.hex(a), y = A.hex(b); return [A.lerp(x[0], y[0], t), A.lerp(x[1], y[1], t), A.lerp(x[2], y[2], t)]; };
  A.shade = (c, k) => { const x = A.hex(c); return [A.clamp(x[0] * k, 0, 255), A.clamp(x[1] * k, 0, 255), A.clamp(x[2] * k, 0, 255)]; };
  /* 대기 원근: d=0 가까움, d=1 안개에 묻힘 */
  A.atm = (c, fog, d) => A.mix(c, fog, A.clamp(d, 0, 1));

  /* ───────── 빛 기록 (게임에서 깜박임·번짐 애니메이션에 쓴다) ───────── */
  A.lights = [];
  A.mark = (x, y, r, color, kind = 'steady') => { A.lights.push({ x, y, r, color: A.rgba(color, 1), kind }); };

  /* ───────── 도형 ───────── */
  A.poly = function (ctx, pts, fill) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    if (fill) { ctx.fillStyle = typeof fill === 'string' && fill[0] !== '#' ? fill : A.rgba(fill); ctx.fill(); }
  };
  /* 점들을 지나는 매끄러운 닫힌 곡선 */
  A.smooth = function (ctx, pts, fill, closed = true) {
    const n = pts.length;
    ctx.beginPath();
    if (closed) {
      const m0 = [(pts[n - 1][0] + pts[0][0]) / 2, (pts[n - 1][1] + pts[0][1]) / 2];
      ctx.moveTo(m0[0], m0[1]);
      for (let i = 0; i < n; i++) {
        const p = pts[i], q = pts[(i + 1) % n];
        ctx.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2);
      }
      ctx.closePath();
    } else {
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < n - 1; i++) ctx.quadraticCurveTo(pts[i][0], pts[i][1], (pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2);
      ctx.lineTo(pts[n - 1][0], pts[n - 1][1]);
    }
    if (fill) { ctx.fillStyle = A.rgba(fill); ctx.fill(); }
  };
  A.rect = (ctx, x, y, w, h, fill, a = 1) => { ctx.fillStyle = A.rgba(fill, a); ctx.fillRect(x, y, w, h); };
  A.line = function (ctx, x0, y0, x1, y1, color, w = 1, a = 1) {
    ctx.strokeStyle = A.rgba(color, a); ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  };
  A.lineGrad = function (ctx, x0, y0, x1, y1, stops) {
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    for (const [t, c, a] of stops) g.addColorStop(t, A.rgba(c, a === undefined ? 1 : a));
    return g;
  };
  A.radGrad = function (ctx, x, y, r0, r1, stops) {
    const g = ctx.createRadialGradient(x, y, r0, x, y, r1);
    for (const [t, c, a] of stops) g.addColorStop(t, A.rgba(c, a === undefined ? 1 : a));
    return g;
  };
  /* 세로 그라디언트로 사각형 채우기. stops: [[t, color, a?], ...] */
  A.vgrad = function (ctx, x, y0, w, y1, stops) {
    ctx.fillStyle = A.lineGrad(ctx, 0, y0, 0, y1, stops);
    ctx.fillRect(x, y0, w, y1 - y0);
  };
  /* 모양 함수를 빛 쪽으로 조금 밀어 밝은 색으로 먼저 칠하고 제자리에 어둡게 칠한다 → 가장자리 빛 */
  A.rimmed = function (ctx, shape, dark, rim, dx, dy, rimA = 1) {
    ctx.save();
    ctx.translate(dx, dy);
    shape(); ctx.fillStyle = A.rgba(rim, rimA); ctx.fill();
    ctx.restore();
    shape(); ctx.fillStyle = A.rgba(dark); ctx.fill();
  };

  /* ───────── 빛 ───────── */
  A.glow = function (ctx, x, y, r, color, a = 1, mode = 'lighter') {
    ctx.save();
    ctx.globalCompositeOperation = mode;
    ctx.fillStyle = A.radGrad(ctx, x, y, 0, r, [[0, color, a], [0.18, color, a * 0.5], [0.5, color, a * 0.14], [1, color, 0]]);
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.restore();
  };
  /* 광원: 작은 흰 심지 + 색 번짐, 게임용 표시 */
  A.light = function (ctx, x, y, o = {}) {
    const r = o.r || 60, c = o.color || '#ffc877', a = o.a === undefined ? 1 : o.a;
    A.glow(ctx, x, y, r * 3.2, c, 0.22 * a);
    A.glow(ctx, x, y, r, c, 0.75 * a);
    if (o.core !== false) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = A.radGrad(ctx, x, y, 0, (o.core || r * 0.12), [[0, '#fffaf0', a], [1, c, 0]]);
      ctx.beginPath(); ctx.arc(x, y, o.core || r * 0.12, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    if (o.kind !== null) A.mark(x, y, r, c, o.kind || 'steady');
  };
  /* 빛기둥 */
  A.cone = function (ctx, x, y, ang, spread, len, color, a = 0.3) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(x, y, 0, x, y, len);
    g.addColorStop(0, A.rgba(color, a)); g.addColorStop(0.5, A.rgba(color, a * 0.35)); g.addColorStop(1, A.rgba(color, 0));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(ang - spread) * len, y + Math.sin(ang - spread) * len);
    ctx.lineTo(x + Math.cos(ang + spread) * len, y + Math.sin(ang + spread) * len);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  };
  /* 사다리꼴 빛 (창문에서 바닥으로 떨어지는 빛 등) */
  A.shaft = function (ctx, pts, color, a0, a1, x0, y0, x1, y1) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = A.lineGrad(ctx, x0, y0, x1, y1, [[0, color, a0], [1, color, a1]]);
    A.poly(ctx, pts);
    ctx.fill();
    ctx.restore();
  };
  /* 바닥의 빛웅덩이 */
  A.pool = function (ctx, x, y, rx, ry, color, a = 0.5) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(x, y); ctx.scale(1, ry / rx);
    ctx.fillStyle = A.radGrad(ctx, 0, 0, 0, rx, [[0, color, a], [0.4, color, a * 0.45], [1, color, 0]]);
    ctx.beginPath(); ctx.arc(0, 0, rx, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  };
  /* 젖은 바닥/물 위의 세로 반사: 끊긴 가로줄들의 기둥 */
  A.streaks = function (ctx, x, y0, len, w, color, a, r, o = {}) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const step = o.step || 5;
    for (let y = 0; y < len; y += step * (0.6 + r() * 0.8)) {
      const t = y / len;
      const ww = w * (1 - t * 0.5) * (0.4 + r() * 0.9);
      const aa = a * Math.pow(1 - t, 1.4) * (0.4 + r() * 0.6);
      ctx.fillStyle = A.rgba(color, aa);
      ctx.fillRect(x - ww / 2 + (r() - 0.5) * w * 0.25, y0 + y, ww, Math.max(1, step * 0.45));
    }
    ctx.restore();
  };
  /* 수평 안개 띠 */
  A.band = function (ctx, W, y, h, color, a) {
    ctx.fillStyle = A.lineGrad(ctx, 0, y - h / 2, 0, y + h / 2, [[0, color, 0], [0.5, color, a], [1, color, 0]]);
    ctx.fillRect(0, y - h / 2, W, h);
  };
  /* 노이즈 구름/안개 (얼룩) */
  A.clouds = function (ctx, W, H, o) {
    const n = A.noise(o.seed || 7), sc = o.scale || 300;
    const k = 4, c = A.canvas(Math.ceil(W / k), Math.ceil(H / k)), x = c.getContext('2d');
    const img = x.createImageData(c.width, c.height);
    const col = A.hex(o.color || '#ffffff');
    const y0 = o.y0 || 0, y1 = o.y1 || H, sx = o.stretch || 3;
    for (let j = 0; j < c.height; j++) {
      const py = j * k;
      const band = py < y0 || py > y1 ? 0 : Math.pow(Math.sin(Math.PI * (py - y0) / (y1 - y0)), o.soft || 0.8);
      for (let i = 0; i < c.width; i++) {
        let v = n.fbm(i * k / (sc * sx), py / sc, 5);
        v = A.clamp((v - (o.cut || 0.48)) * (o.gain || 2.6), 0, 1) * band;
        const q = (j * c.width + i) * 4;
        img.data[q] = col[0]; img.data[q + 1] = col[1]; img.data[q + 2] = col[2]; img.data[q + 3] = v * 255 * (o.a || 0.5);
      }
    }
    x.putImageData(img, 0, 0);
    ctx.save();
    if (o.mode) ctx.globalCompositeOperation = o.mode;
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(c, 0, 0, W, H);
    ctx.restore();
  };
  A.stars = function (ctx, W, yMax, n, r, color = '#dfe8f0') {
    for (let i = 0; i < n; i++) {
      const x = r() * W, y = Math.pow(r(), 1.6) * yMax, s = r() < 0.08 ? 1.6 : 0.8 + r() * 0.5;
      ctx.fillStyle = A.rgba(color, 0.25 + r() * 0.6 * (1 - y / yMax));
      ctx.fillRect(x, y, s, s);
    }
  };
  A.moon = function (ctx, x, y, R, color = '#e8eef0', halo = '#9fb7c8', phase = 0) {
    A.glow(ctx, x, y, R * 9, halo, 0.16);
    A.glow(ctx, x, y, R * 3, halo, 0.22);
    ctx.fillStyle = A.rgba(color);
    ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.clip();
    const mn = A.noise(Math.round(R * 7));
    for (let i = 0; i < 26; i++) { const a = i * 2.4, d = R * (0.15 + (i % 7) / 9), cr = R * (0.08 + mn(i, 1) * 0.16); ctx.fillStyle = A.rgba(A.shade(color, 0.84), 0.22 + mn(i, 2) * 0.2); ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, cr, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = A.radGrad(ctx, x + R * 0.35, y + R * 0.2, R * 0.2, R * 1.2, [[0, '#000000', 0], [1, '#000000', 0.25]]); ctx.fillRect(x - R, y - R, R * 2, R * 2);
    ctx.restore();
    if (phase) {
      ctx.fillStyle = A.rgba(phase);
      ctx.beginPath(); ctx.arc(x + R * 0.45, y - R * 0.1, R * 0.95, 0, Math.PI * 2); ctx.fill();
    }
  };
  /* 늘어진 전선 */
  A.wire = function (ctx, x0, y0, x1, y1, sag, color, w = 1.2, a = 1) {
    ctx.strokeStyle = A.rgba(color, a); ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + sag * 2, x1, y1);
    ctx.stroke();
  };
  /* 창문 격자 */
  A.windows = function (ctx, x, y, w, h, cols, rows, r, o = {}) {
    const cw = w / cols, rh = h / rows, fw = o.fw === undefined ? 0.56 : o.fw, fh = o.fh === undefined ? 0.58 : o.fh;
    const lit = o.lit || '#f3b25e', off = o.off || '#10151a', p = o.p === undefined ? 0.35 : o.p;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const wx = x + i * cw + cw * (1 - fw) / 2, wy = y + j * rh + rh * (1 - fh) / 2, ww = cw * fw, wh = rh * fh;
      const on = r() < p;
      if (on) {
        const c = A.mix(lit, o.lit2 || '#ffe6b0', r() * 0.5);
        ctx.fillStyle = A.lineGrad(ctx, 0, wy, 0, wy + wh, [[0, c, 1], [1, A.shade(c, 0.72), 1]]);
        ctx.fillRect(wx, wy, ww, wh);
        if (o.blinds && r() < 0.5) for (let b = 1; b < 5; b++) A.rect(ctx, wx, wy + wh * b / 5, ww, Math.max(1, wh * 0.06), A.shade(c, 0.5), 0.7);
        if (o.glow) A.glow(ctx, wx + ww / 2, wy + wh / 2, Math.max(ww, wh) * 1.6, c, o.glow);
        if (o.mark) A.mark(wx + ww / 2, wy + wh / 2, Math.max(ww, wh), c, 'window');
      } else {
        A.rect(ctx, wx, wy, ww, wh, off, o.offA === undefined ? 1 : o.offA);
      }
    }
  };
  /* 물: 위쪽 그림을 뒤집어 흔들리게 비춘다 */
  A.reflect = function (ctx, W, H, yWater, o = {}) {
    const src = A.canvas(W, H); src.getContext('2d').drawImage(ctx.canvas, 0, 0);
    const r = A.rng(o.seed || 3), strength = o.strength === undefined ? 0.5 : o.strength, ripple = o.ripple === undefined ? 1 : o.ripple;
    ctx.save();
    ctx.beginPath(); ctx.rect(0, yWater, W, H - yWater); ctx.clip();
    if (o.blur) ctx.filter = 'blur(' + o.blur + 'px)';
    const h = Math.min(H - yWater, o.depth || H);
    for (let y = 0; y < h; y += 2) {
      const sy = yWater - (y * (o.squash || 1)) - 2;
      if (sy < 0) break;
      const dx = (Math.sin(y * 0.21 + r() * 1.2) * 3 + (r() - 0.5) * 4) * ripple * (0.5 + y / h * 2.5);
      ctx.globalAlpha = strength * Math.pow(1 - y / h, o.fade || 1.2);
      ctx.drawImage(src, 0, sy, W, 2, dx, yWater + y, W, 2);
    }
    ctx.restore();
    ctx.globalAlpha = 1; ctx.filter = 'none';
  };
  /* 물결 가는 선 */
  A.ripples = function (ctx, W, y0, y1, r, color, a, n = 160) {
    ctx.save();
    for (let i = 0; i < n; i++) {
      const t = Math.pow(r(), 1.6);
      const y = y0 + t * (y1 - y0);
      const len = 20 + t * 180 * r(), x = r() * W;
      ctx.strokeStyle = A.rgba(color, a * (0.3 + t * 0.7));
      ctx.lineWidth = 0.8 + t * 1.6;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len, y + (r() - 0.5) * 1.5); ctx.stroke();
    }
    ctx.restore();
  };
  /* 글자 (간판, 네온) */
  A.text = function (ctx, str, x, y, o = {}) {
    ctx.save();
    ctx.font = (o.weight || '400') + ' ' + (o.size || 40) + 'px ' + (o.font || '"Limelight", "Liberation Serif", serif');
    ctx.textAlign = o.align || 'center';
    ctx.textBaseline = 'middle';
    if (o.spacing) ctx.letterSpacing = o.spacing + 'px';
    if (o.neon) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.shadowColor = A.rgba(o.neon, 0.9);
      for (const [b, a] of [[40, 0.5], [16, 0.7], [5, 0.9]]) {
        ctx.shadowBlur = b; ctx.fillStyle = A.rgba(o.neon, a); ctx.fillText(str, x, y);
      }
      ctx.shadowBlur = 0;
      ctx.fillStyle = A.rgba(A.mix(o.neon, '#ffffff', 0.6));
      ctx.fillText(str, x, y);
    } else {
      ctx.fillStyle = A.rgba(o.color || '#ddd', o.a === undefined ? 1 : o.a);
      ctx.fillText(str, x, y);
    }
    ctx.restore();
  };

  /* ───────── 사람 실루엣 ─────────
   * 키 100 단위 좌표로 설계한 정면 실루엣. 팔과 몸 사이의 빈틈이 형태를 읽히게 한다.
   * o: { h, color, rim, rimDir(-1|1), rimA, flip,
   *      hat: 'fedora'|'cap'|'beret'|'bun'|'hair'|'long'|'crown'|'bowler'|'scarf'|null,
   *      pose: 'stand'|'pockets'|'smoke'|'hips'|'crossed'|'sit'|'hang'|'walk'|'reach',
   *      body: 'coat'|'jacket'|'dress'|'skirt', build: 'slim'|'wide'|'child'|'woman'|'old',
   *      prop: 'umbrella'|'cane'|'case'|'sign'|'bottle' }
   */
  /* 부드러운 닫힌 경로. 점의 세 번째 값이 1이면 모서리를 날카롭게 둔다 */
  A.spath = function (path, pts, k = 1, dx = 0, dy = 0) {
    const P = pts.map(p => [p[0] * k + dx, p[1] * k + dy, p[2]]);
    const n = P.length;
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const st = P.findIndex(p => p[2]);
    if (st < 0) {
      const s0 = mid(P[n - 1], P[0]);
      path.moveTo(s0[0], s0[1]);
      for (let i = 0; i < n; i++) { const p = P[i], m = mid(p, P[(i + 1) % n]); path.quadraticCurveTo(p[0], p[1], m[0], m[1]); }
    } else {
      path.moveTo(P[st][0], P[st][1]);
      for (let j = 1; j <= n; j++) {
        const i = (st + j) % n, p = P[i];
        if (p[2]) path.lineTo(p[0], p[1]);
        else { const m = mid(p, P[(i + 1) % n]); path.quadraticCurveTo(p[0], p[1], m[0], m[1]); }
      }
    }
    path.closePath();
  };
  const mir = pts => pts.map(p => [-p[0], p[1], p[2]]).reverse();

  A.figurePath = function (o = {}) {
    const parts = [];
    const np = () => { const q = new Path2D(); parts.push(q); return q; };
    const pose = o.pose || 'stand', body = o.body || 'jacket', build = o.build || '';
    const sw = build === 'wide' ? 1.2 : build === 'slim' ? 0.9 : build === 'woman' ? 0.86 : build === 'child' ? 0.9 : 1;
    const sit = pose === 'sit', drop = sit ? 21 : 0;               // 앉으면 윗몸이 내려온다
    const headK = build === 'child' ? 1.32 : 1;
    const X = (p, k = sw) => [p[0] * k, p[1] + drop, p[2]];
    const add = (pts, k) => A.spath(np(), pts.map(p => X(p, k)));
    const addRaw = (pts, k = 1) => A.spath(np(), pts.map(p => [p[0] * k, p[1], p[2]]));
    // 머리
    const hy = -93.2 + drop + (build === 'child' ? 1.5 : 0), hrx = 5 * headK, hry = 6.4 * headK;
    const tilt = pose === 'hang' ? 0.5 : 0;
    np().ellipse(tilt * 2, hy, hrx, hry, tilt, 0, Math.PI * 2);
    // 목
    add([[-2.3, -88.5, 1], [2.3, -88.5, 1], [2.9, -82.5, 1], [-2.9, -82.5, 1]], 1);
    // 몸통
    let hemY = body === 'coat' ? -28 : body === 'dress' ? -17 : body === 'skirt' ? -22 : -45;
    if (sit && (body === 'coat' || body === 'dress' || body === 'skirt')) hemY = -44;
    const waist = build === 'woman' ? 8.2 : build === 'wide' ? 11 : 9.8;
    const hemX = body === 'dress' ? 15 : body === 'skirt' ? 13 : body === 'coat' ? 12.8 : 10.8;
    const R = [[2.9, -85], [8, -83.4], [11.6, -81.6], [13.1, -78.2], [12.4, -72], [11.1, -64], [waist, -56.5], [waist + 0.8, -50],
      [hemX - 0.6, (hemY - 50) / 2 + -50 + 4], [hemX, hemY, 1]];
    add(R.concat(mir(R)), sw);
    // 다리
    const legTop = sit ? -26 : -47;
    if (body === 'dress' || body === 'skirt') {
      if (!sit) { add([[1.2, hemY + 1], [4.6, hemY + 1], [4.3, -4], [5.4, -0.2, 1], [1.7, 0, 1], [1.6, -4]]); add(mir([[1.2, hemY + 1], [4.6, hemY + 1], [4.3, -4], [5.4, -0.2, 1], [1.7, 0, 1], [1.6, -4]])); }
      else { addRaw([[-12, -29], [12, -29], [13, -21], [-13, -21]]); addRaw([[2, -22], [6, -22], [5.6, -3], [6.8, -0.2, 1], [2.4, 0, 1], [2.4, -3]]); addRaw(mir([[2, -22], [6, -22], [5.6, -3], [6.8, -0.2, 1], [2.4, 0, 1], [2.4, -3]])); }
    } else if (sit) {
      addRaw([[-12, -31], [12, -31], [13, -21], [-13, -21]], sw);
      const Lg = [[3.2, -23], [9.8, -23], [9.2, -4], [11.2, -2.4], [11.2, 0, 1], [4.2, 0, 1], [4, -4]];
      addRaw(Lg); addRaw(mir(Lg));
    } else if (pose === 'hang') {
      const Lg = [[0.4, -47], [8.6, -47], [7.4, -24], [5.6, -8], [5, 0.5], [3.6, 3.5, 1], [2.6, 0], [2.4, -8], [1.4, -24]];
      add(Lg, 1); add(mir(Lg), 1);
    } else if (pose === 'walk') {
      add([[0.4, -47], [9.4, -47], [10.4, -36], [12.8, -22], [15.2, -3.4], [17.4, -1.8], [17.6, 0, 1], [11.2, 0, 1], [10.6, -3], [8.2, -20], [3, -36]], 1);
      add(mir([[0.4, -47], [9.4, -47], [8.4, -36], [6.4, -22], [5.8, -6], [5.2, -3.4], [3.4, -1.2, 1], [3.6, 1.2, 1], [1.2, -3], [0.8, -20], [0.8, -36]]), 1);
    } else {
      const Lg = [[0.6, -47], [9.6, -47], [9.2, -36], [8.2, -24], [7.2, -10], [6.9, -3.4], [9.2, -2.2], [9.4, 0, 1], [3.3, 0, 1], [3.5, -3.4], [3.3, -10], [2.9, -24], [1.8, -36]];
      add(Lg, build === 'wide' ? 1.1 : 1); add(mir(Lg), build === 'wide' ? 1.1 : 1);
    }
    // 팔
    const armDown = [[11.2, -80.5], [13.6, -77.6], [14.4, -70], [14.7, -62], [14.5, -54], [13.9, -48.6], [13.6, -45.4], [12.4, -44.2], [11.6, -46.4], [11.8, -52], [11.5, -60], [10.7, -68], [10.4, -75]];
    const armPocket = [[11.2, -80.5], [13.6, -77.6], [15, -70], [15.8, -62], [14.2, -55.4], [10.8, -51.4], [9.8, -54.4], [12.2, -60.4], [11.4, -68], [10.4, -75]];
    const armHip = [[11.2, -80.5], [13.8, -77.6], [16.6, -70], [19, -62.4], [17.4, -58.6], [11.6, -54.4], [10.6, -56.6], [15.2, -62.4], [12, -70], [10.4, -75]];
    const armSmoke = [[11.2, -80.5], [13.6, -77.6], [15.2, -70], [16, -63.6], [14.6, -60.6], [11.8, -66], [9.4, -78], [8.8, -86.6], [7, -87.4], [6.8, -85], [8.4, -76], [10.8, -66.4], [11, -70], [10.4, -75]];
    const armReach = [[11.2, -80.5], [13.6, -78.6], [20, -76], [28, -74.6], [30, -73.6], [29.6, -71.6], [27.6, -71.4], [19.6, -71.4], [13.4, -71.6], [10.4, -75]];
    const armCross = [[11.2, -80.5], [13.6, -77.6], [14.6, -70], [14.8, -64], [12, -60.6], [-8, -61.2], [-9, -64.6], [8, -66], [11, -70], [10.4, -75]];
    const armHang = [[11, -80.5], [13, -77.6], [13.6, -70], [13.4, -60], [13, -50], [12.6, -45], [11.6, -44.4], [11.2, -47], [11.2, -60], [10.6, -70], [10.4, -75]];
    let aR = armDown, aL = armDown;
    if (pose === 'pockets') { aR = armPocket; aL = armPocket; }
    else if (pose === 'hips') { aR = armHip; aL = armHip; }
    else if (pose === 'smoke') { aR = armSmoke; aL = armPocket; }
    else if (pose === 'reach') { aR = armReach; }
    else if (pose === 'crossed') { aR = armCross; aL = armCross; }
    else if (pose === 'hang') { aR = armHang; aL = armHang; }
    else if (sit) { aR = [[11.2, -80.5], [13.6, -77.6], [14.6, -70], [14.8, -62], [14.2, -55], [11.4, -51], [9.2, -50.6], [9.6, -53.4], [11.6, -56], [11.4, -64], [10.6, -70], [10.4, -75]]; aL = aR; }
    add(aR, sw); add(mir(aL), sw);
    // 모자·머리칼
    const hat = o.hat, H = (pts) => A.spath(np(), pts.map(p => [p[0] * headK, (p[1] + 93.2) * headK - 93.2 + drop + (build === 'child' ? 1.5 : 0), p[2]]));
    if (hat === 'fedora') {
      H([[-10.4, -96.6], [-6.4, -97.8], [6.4, -97.8], [10.6, -96.8], [9.8, -95.6], [0, -96.3], [-9.6, -95.6]]);
      H([[-5.6, -97, 1], [-5.4, -102], [-3.2, -104.6], [0, -103.2], [3.2, -104.6], [5.4, -102], [5.6, -97, 1]]);
    } else if (hat === 'bowler') {
      H([[-8, -96.8], [8, -96.8], [7.4, -95.8], [-7.4, -95.8]]);
      H([[-5.4, -96.6, 1], [-5.2, -101], [0, -104.4], [5.2, -101], [5.4, -96.6, 1]]);
    } else if (hat === 'cap') {
      H([[-5.4, -95.4], [-5.4, -99], [-1, -100.8], [4.4, -100], [6.2, -97.8], [9.4, -96.6, 1], [5.6, -95.8]]);
    } else if (hat === 'beret') {
      H([[-5.6, -97], [-6, -99.2], [-1, -101.2], [5.4, -100.6], [7.6, -98.6], [5.2, -97.2]]);
    } else if (hat === 'bun') {
      H([[-5.2, -95], [-5, -99.4], [0, -100.2], [5, -99.4], [5.2, -95]]);
      H([[-1.8, -99.6], [-2.6, -102.4], [0, -104], [2.6, -102.4], [1.8, -99.6]]);
    } else if (hat === 'hair') {
      H([[-5.6, -94], [-5.4, -99.6], [0, -100.4], [5.4, -99.6], [5.8, -94], [6.4, -88.6], [5.2, -86.6], [3.8, -89], [-3.8, -89], [-5.2, -86.6], [-6.4, -88.6]]);
    } else if (hat === 'long') {
      H([[-5.6, -94], [-5.4, -99.8], [0, -100.8], [5.4, -99.8], [5.8, -94], [6.4, -87], [7.8, -81], [8.4, -77.6, 1], [5.8, -80], [4.6, -84], [3.4, -88.4], [-3.4, -88.4], [-4.6, -84], [-5.8, -80], [-8.4, -77.6, 1], [-7.8, -81], [-6.4, -87]]);
    } else if (hat === 'crown') {
      H([[-5, -97.6, 1], [-5.4, -103.4, 1], [-2.6, -100.4, 1], [0, -104.6, 1], [2.6, -100.4, 1], [5.4, -103.4, 1], [5, -97.6, 1]]);
    } else if (hat === 'scarf') {
      H([[-5.8, -93], [-5.6, -99.4], [0, -101], [5.6, -99.4], [5.8, -93], [6.6, -86], [4.4, -87.6], [-4.4, -87.6], [-6.6, -86]]);
    }
    // 소품
    const p = o.prop;
    if (p === 'umbrella') {
      A.spath(np(), [[-4, -104 + drop], [-24, -99 + drop], [-30, -94 + drop, 1], [-24, -95.4 + drop], [-17, -94.6 + drop], [-10, -95.4 + drop], [-3, -94.6 + drop], [4, -95.4 + drop], [11, -94.6 + drop], [18, -95.4 + drop], [22, -94 + drop, 1], [18, -99 + drop], [2, -104 + drop]]);
      A.spath(np(), [[-1.6, -104 + drop, 1], [-0.6, -104 + drop, 1], [-0.6, -60 + drop, 1], [-1.6, -60 + drop, 1]]);
    } else if (p === 'cane') {
      A.spath(np(), [[15.2, -46, 1], [16.2, -46, 1], [17.4, 0, 1], [16.4, 0, 1]]);
      A.spath(np(), [[12.6, -47.4], [16.8, -48.4], [16.6, -45.6], [13, -45.4]]);
    } else if (p === 'case') {
      A.spath(np(), [[9.6, -44, 1], [20.4, -44, 1], [20.4, -30, 1], [9.6, -30, 1]]);
    } else if (p === 'sign') {
      A.spath(np(), [[16, -44, 1], [17.2, -44, 1], [17.2, -112, 1], [16, -112, 1]]);
      A.spath(np(), [[5, -112, 1], [30, -112, 1], [30, -96, 1], [5, -96, 1]]);
    } else if (p === 'bottle') {
      A.spath(np(), [[12.4, -46], [14.4, -46], [14.8, -38], [14, -34], [12.8, -34], [12, -38]]);
    }
    return parts;
  };

  A.figure = function (ctx, x, yb, o = {}) {
    const h = o.h || 160, k = h / 100, dark = o.color || '#0c0f13';
    const parts = A.figurePath(o);
    ctx.save();
    ctx.translate(x, yb);
    if (o.lean) ctx.rotate(o.lean);
    ctx.scale(o.flip ? -k : k, k);
    if (o.rim) {
      const dx = (o.rimDir || 1) * (o.flip ? -1 : 1) * Math.max(1.3, h * 0.011) / k, dy = -Math.max(0.5, h * 0.004) / k;
      ctx.save(); ctx.translate(dx, dy); ctx.fillStyle = A.rgba(o.rim, o.rimA || 0.9); for (const q of parts) ctx.fill(q); ctx.restore();
    }
    ctx.fillStyle = A.rgba(dark); for (const q of parts) ctx.fill(q);
    ctx.restore();
    if (o.pose === 'smoke' && o.ember !== false) {
      const ex = x + 7.6 * k * (o.flip ? -1 : 1), ey = yb + (-87.8 + (o.pose === 'sit' ? 21 : 0)) * k;
      A.glow(ctx, ex, ey, 9 * k, '#ff7a3a', 0.9);
      A.mark(ex, ey, 6 * k, '#ff7a3a', 'ember');
    }
  };

  /* ───────── 건물 ─────────
   * 정면 + 옆면(빛 반대쪽) + 지붕 장식 + 창문. o.light: 빛이 오는 방향(-1 왼쪽, 1 오른쪽)
   */
  A.building = function (ctx, x, yb, w, h, r, o = {}) {
    const face = o.face || '#1a2128', side = o.side || A.shade(face, 0.7), sw = o.sideW === undefined ? w * 0.18 : o.sideW;
    const L = o.light || -1;
    const top = yb - h;
    // 옆면 (빛 반대쪽)
    if (sw > 0) {
      if (L < 0) A.poly(ctx, [[x + w, top], [x + w + sw, top + sw * 0.25], [x + w + sw, yb], [x + w, yb]], side);
      else A.poly(ctx, [[x, top], [x - sw, top + sw * 0.25], [x - sw, yb], [x, yb]], side);
    }
    A.rect(ctx, x, top, w, h, face);
    // 지붕
    const roof = o.roof || 'flat', rc = o.roofC || A.shade(face, 0.85);
    if (roof === 'gable') A.poly(ctx, [[x - 4, top], [x + w / 2, top - w * 0.32], [x + w + 4, top]], rc);
    else if (roof === 'mansard') A.poly(ctx, [[x - 3, top], [x + w * 0.1, top - h * 0.1], [x + w * 0.9, top - h * 0.1], [x + w + 3, top]], rc);
    else if (roof === 'saw') { const n = Math.max(2, Math.round(w / 60)), s = w / n; for (let i = 0; i < n; i++) A.poly(ctx, [[x + i * s, top], [x + i * s, top - s * 0.45], [x + (i + 1) * s, top]], rc); }
    else if (roof === 'dome') { ctx.fillStyle = A.rgba(rc); ctx.beginPath(); ctx.ellipse(x + w / 2, top, w * 0.32, w * 0.3, 0, Math.PI, 0); ctx.fill(); A.rect(ctx, x + w / 2 - 2, top - w * 0.3 - 16, 4, 16, rc); }
    else { A.rect(ctx, x - 3, top - 5, w + 6, 6, rc); }
    // 옥상 물탱크·굴뚝·안테나
    if (o.tank) { const tx = x + w * (o.tank === true ? 0.7 : o.tank); A.rect(ctx, tx - 18, top - 58, 36, 38, rc); A.poly(ctx, [[tx - 21, top - 58], [tx, top - 76], [tx + 21, top - 58]], rc); for (const lx of [-14, 12]) A.rect(ctx, tx + lx, top - 20, 3, 20, rc); }
    if (o.chimney) for (let i = 0; i < o.chimney; i++) { const cx = x + w * (0.15 + r() * 0.7); A.rect(ctx, cx, top - 16 - r() * 22, 10 + r() * 8, 40, rc); }
    if (o.antenna) { const ax = x + w * 0.3; A.line(ctx, ax, top, ax, top - 70, rc, 2); A.line(ctx, ax - 18, top - 50, ax + 18, top - 50, rc, 2); A.line(ctx, ax - 12, top - 62, ax + 12, top - 62, rc, 2); }
    // 윗가장자리의 하늘빛
    if (o.edge) A.rect(ctx, x, top, w, 1.5, o.edge, o.edgeA || 0.5);
    // 창문
    if (o.win) {
      const wn = o.win;
      A.windows(ctx, x + w * 0.08, top + h * (wn.top || 0.08), w * 0.84, h * (wn.h || 0.78), wn.cols || Math.max(1, Math.round(w / 34)), wn.rows || Math.max(1, Math.round(h / 44)), r, wn);
    }
  };

  /* ───────── 부두 크레인 (문형 지브 크레인) ─────────
   * x: 문형 다리 가운데, yb: 레일 높이, s: 크기 배율, o: { color, jib(각도), dir(1 오른쪽), cab(창 불빛색), hang(매달린 몸) }
   */
  A.crane = function (ctx, x, yb, s, o = {}) {
    const c = A.rgba(o.color || '#0d1116'), dir = o.dir || 1;
    ctx.save();
    ctx.translate(x, yb); ctx.scale(s, s);
    ctx.fillStyle = c; ctx.strokeStyle = c;
    const lw = (w) => { ctx.lineWidth = w; };
    // 문형 다리: 두 A자 기둥
    const legH = 170, legW = 120;
    for (const side of [-1, 1]) {
      A.poly(ctx, [[side * legW / 2 - 7, 0], [side * legW / 2 + 7, 0], [side * 18 + 5, -legH], [side * 18 - 5, -legH]], null); ctx.fill();
      A.rect(ctx, side * legW / 2 - 12, -8, 24, 8, o.color || '#0d1116');
    }
    lw(4); ctx.beginPath(); ctx.moveTo(-legW / 2 + 12, -60); ctx.lineTo(legW / 2 - 12, -60); ctx.stroke();
    lw(2.5); ctx.beginPath(); ctx.moveTo(-legW / 2 + 8, -8); ctx.lineTo(20, -legH + 10); ctx.moveTo(legW / 2 - 8, -8); ctx.lineTo(-20, -legH + 10); ctx.stroke();
    // 선회대와 기둥
    A.rect(ctx, -30, -legH - 10, 60, 12, o.color || '#0d1116');
    A.poly(ctx, [[-16, -legH - 10], [16, -legH - 10], [11, -legH - 120], [-11, -legH - 120]]); ctx.fill();
    // 기계실(캡)
    const cabY = -legH - 150;
    A.poly(ctx, [[-44 * dir, cabY + 30], [40 * dir, cabY + 30], [40 * dir, cabY - 12], [-30 * dir, cabY - 12], [-44 * dir, cabY + 2]]); ctx.fill();
    if (o.cab) {
      const wx = dir > 0 ? 18 : -34;
      A.rect(ctx, wx, cabY - 4, 16, 14, o.cab);
      A.glow(ctx, wx + 8, cabY + 3, 40, o.cab, 0.5);
      A.mark((x + (wx + 8) * s), yb + (cabY + 3) * s, 30 * s, o.cab, 'window');
    }
    // 평형추
    A.rect(ctx, -dir * 60 - (dir > 0 ? 26 : 0), cabY + 4, 26, 30, o.color || '#0d1116');
    // A자 탑
    lw(4); ctx.beginPath(); ctx.moveTo(-18, cabY - 12); ctx.lineTo(0, cabY - 70); ctx.lineTo(18, cabY - 12); ctx.stroke();
    // 지브 (격자)
    const ang = o.jib === undefined ? -0.22 : o.jib, len = o.len || 330;
    const bx = 30 * dir, by = cabY + 10;
    const ex = bx + Math.cos(ang) * len * dir, ey = by + Math.sin(ang) * len;
    const nx = -Math.sin(ang) * 9, ny = Math.cos(ang) * 9;
    lw(3.2); ctx.beginPath(); ctx.moveTo(bx - nx, by - ny); ctx.lineTo(ex - nx * 0.4, ey - ny * 0.4); ctx.moveTo(bx + nx, by + ny); ctx.lineTo(ex + nx * 0.4, ey + ny * 0.4); ctx.stroke();
    lw(1.4); ctx.beginPath();
    const seg = 16;
    for (let i = 0; i < seg; i++) {
      const t0 = i / seg, t1 = (i + 1) / seg, k0 = 1 - t0 * 0.6, k1 = 1 - t1 * 0.6;
      const x0 = A.lerp(bx, ex, t0), y0 = A.lerp(by, ey, t0), x1 = A.lerp(bx, ex, t1), y1 = A.lerp(by, ey, t1);
      ctx.moveTo(x0 - nx * k0, y0 - ny * k0); ctx.lineTo(x1 + nx * k1, y1 + ny * k1);
      ctx.moveTo(x1 - nx * k1, y1 - ny * k1); ctx.lineTo(x1 + nx * k1, y1 + ny * k1);
    }
    ctx.stroke();
    // 지브 끝의 도르래 머리
    A.poly(ctx, [[ex - 8, ey - 6], [ex + 8 * dir, ey - 10], [ex + 12 * dir, ey + 6], [ex - 4, ey + 10]]); ctx.fill();
    // 당김줄 (A자 탑 → 지브)
    lw(1.6); ctx.beginPath(); ctx.moveTo(0, cabY - 70); ctx.lineTo(A.lerp(bx, ex, 0.62), A.lerp(by, ey, 0.62)); ctx.moveTo(0, cabY - 70); ctx.lineTo(-dir * 50, cabY + 4); ctx.stroke();
    // 매단 줄
    const hookY = o.cable || 160;
    lw(1.3); ctx.beginPath(); ctx.moveTo(ex + 6 * dir, ey + 6); ctx.lineTo(ex + 6 * dir, ey + hookY); ctx.stroke();
    if (o.hang) {
      ctx.restore();
      const hx = x + (ex + 6 * dir) * s, hy = yb + (ey + hookY) * s;
      const fh = 150 * s * 0.52;
      A.figure(ctx, hx, hy + 4 * s + fh * 0.86, { h: fh, pose: 'hang', color: o.hangColor || o.color || '#0d1116', rim: o.hangRim, rimDir: -dir, lean: 0.03 });
      return { tip: [x + ex * s, yb + ey * s], hook: [hx, hy] };
    }
    A.poly(ctx, [[ex + 6 * dir - 6, ey + hookY], [ex + 6 * dir + 6, ey + hookY], [ex + 6 * dir + 3, ey + hookY + 12], [ex + 6 * dir - 3, ey + hookY + 12]]); ctx.fill();
    ctx.restore();
    return { tip: [x + ex * s, yb + ey * s] };
  };

  /* 가로등: 기둥 + 등 + 빛웅덩이 + 젖은 바닥 반사 */
  A.lamp = function (ctx, x, yb, h, r, o = {}) {
    const c = o.color || '#12161b', lc = o.light || '#ffc070';
    A.rect(ctx, x - 3, yb - h, 6, h, c);
    A.rect(ctx, x - 7, yb - 14, 14, 14, c);
    const arm = o.arm || 0;
    let lx = x, ly = yb - h;
    if (arm) { A.line(ctx, x, yb - h + 6, x + arm, yb - h + 2, c, 4); lx = x + arm; ly = yb - h + 8; }
    A.poly(ctx, [[lx - 13, ly - 4], [lx + 13, ly - 4], [lx + 8, ly + 10], [lx - 8, ly + 10]], c);
    if (o.on !== false) {
      A.light(ctx, lx, ly + 10, { r: o.r || 70, color: lc, kind: o.kind || 'lamp' });
      if (o.cone !== false) A.cone(ctx, lx, ly + 8, Math.PI / 2, 0.42, (yb - ly) * 1.05, lc, o.coneA || 0.12);
      if (o.pool !== false) A.pool(ctx, lx, yb + 4, o.poolR || 120, (o.poolR || 120) * 0.22, lc, o.poolA || 0.35);
      if (o.wet) A.streaks(ctx, lx, yb + 6, o.wet, 16, lc, 0.45, r);
    }
  };

  /* ───────── 마무리 ───────── */
  A.bloom = function (ctx, W, H, a = 0.35, blur = 22, contrast = 3) {
    const c = A.canvas(W, H), x = c.getContext('2d');
    x.filter = 'brightness(0.55) contrast(' + contrast + ') blur(' + blur + 'px)';
    x.drawImage(ctx.canvas, 0, 0);
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = a; ctx.drawImage(c, 0, 0); ctx.restore();
  };
  A.vignette = function (ctx, W, H, a = 0.5, cx = 0.5, cy = 0.5) {
    const g = ctx.createRadialGradient(W * cx, H * cy, Math.min(W, H) * 0.3, W * cx, H * cy, Math.max(W, H) * 0.78);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,' + a + ')');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  };
  /* 얼룩진 종이결 (평면이 너무 매끈하지 않게) */
  A.mottle = function (ctx, W, H, a = 0.08, seed = 5, scale = 240) {
    A.clouds(ctx, W, H, { color: '#000000', a, scale, stretch: 1.4, cut: 0.35, gain: 1.6, seed, mode: 'source-over', soft: 0.01 });
  };
  /* 미세 디더: 그라디언트 띠 방지 */
  A.dither = function (ctx, W, H, amt = 3, seed = 11) {
    const img = ctx.getImageData(0, 0, W, H), d = img.data, r = A.rng(seed);
    for (let i = 0; i < d.length; i += 4) {
      const v = (r() - 0.5) * amt * 2;
      d[i] += v; d[i + 1] += v; d[i + 2] += v;
    }
    ctx.putImageData(img, 0, 0);
  };

  /* 장면 그리기 → 마무리 */
  A.render = function (drawFn, W, H, o = {}) {
    const c = A.canvas(W, H);
    const ctx = c.getContext('2d', { willReadFrequently: true });
    A.lights = [];
    ctx.save();
    ctx.scale(W / 1920, H / 1080);
    drawFn(ctx, 1920, 1080, A.rng(o.seed || 1));
    ctx.restore();
    if (!o.raw) {
      if (o.bloom !== 0) A.bloom(ctx, W, H, o.bloom || 0.3);
      if (o.mottle !== 0) A.mottle(ctx, W, H, o.mottle || 0.07, (o.seed || 1) + 3);
      if (o.vignette !== 0) A.vignette(ctx, W, H, o.vignette || 0.45, o.vx || 0.5, o.vy || 0.5);
      A.dither(ctx, W, H, 2.5, (o.seed || 1) + 7);
    }
    const k = W / 1920;
    c.lights = A.lights.map(l => ({ x: +(l.x / 1920).toFixed(4), y: +(l.y / 1080).toFixed(4), r: +(l.r / 1920).toFixed(4), color: l.color, kind: l.kind }));
    void k;
    return c;
  };
})(window);
