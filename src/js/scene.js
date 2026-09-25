/* 탱고 레테 — 절차적 장면 화가
 * 장소마다 캔버스에 유화풍 장면을 그린다. 시간대(새벽/낮/황혼/밤)와 일부 플래그에 반응한다.
 * 붓질 효과: 기본 형태를 그린 뒤, 캔버스 색을 표본 추출해 짧은 붓자국을 수천 개 덧칠한다.
 */
(function (TL) {
  'use strict';

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function seedOf(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h;
  }
  function hex(c) {
    const n = parseInt(c.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function mix(a, b, t) {
    const A = typeof a === 'string' ? hex(a) : a, B = typeof b === 'string' ? hex(b) : b;
    return [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t];
  }
  function rgba(c, a) {
    const C = typeof c === 'string' ? hex(c) : c;
    return 'rgba(' + (C[0] | 0) + ',' + (C[1] | 0) + ',' + (C[2] | 0) + ',' + (a == null ? 1 : a) + ')';
  }

  const PAL = {
    dawn: { top: '#27324a', bot: '#d7a07f', haze: '#e2b597', sea: '#40505e', land: '#1b2027', dark: '#12161b', light: '#ffd3a8', wall: '#4b4348', lamp: false, stars: false },
    day: { top: '#76899a', bot: '#c9cdc6', haze: '#d7d8cf', sea: '#57686f', land: '#2d3438', dark: '#1d2225', light: '#efe8d4', wall: '#6b6660', lamp: false, stars: false },
    dusk: { top: '#1c2140', bot: '#d66d45', haze: '#e08a5c', sea: '#2c2f40', land: '#15161f', dark: '#0e0f15', light: '#ffae62', wall: '#3d3036', lamp: true, stars: false },
    night: { top: '#04070d', bot: '#15243a', haze: '#233449', sea: '#08101a', land: '#05080c', dark: '#030507', light: '#f2a541', wall: '#1a1b22', lamp: true, stars: true },
  };
  function phaseOf(hour) {
    if (hour >= 5 && hour < 7) return 'dawn';
    if (hour >= 7 && hour < 17) return 'day';
    if (hour >= 17 && hour < 20) return 'dusk';
    return 'night';
  }

  class Painter {
    constructor(canvas) {
      this.cv = canvas;
      this.ctx = canvas.getContext('2d');
      this.key = null;
    }

    size() {
      const r = this.cv.getBoundingClientRect();
      const cw = Math.max(1, Math.round(r.width)), ch = Math.max(1, Math.round(r.height));
      const k = Math.min(1, 820 / Math.max(cw, ch));
      const w = Math.max(64, Math.round(cw * k)), h = Math.max(64, Math.round(ch * k));
      if (this.cv.width !== w || this.cv.height !== h) { this.cv.width = w; this.cv.height = h; }
      this.w = w; this.h = h;
    }

    paint(art, env, force) {
      this.size();
      const phase = env.phase || phaseOf(env.hour);
      const recipe = RECIPES[art] || RECIPES.quay;
      const flagKey = recipe.flags ? recipe.flags.map(f => (env.v(f) ? 1 : 0)).join('') : '';
      const key = art + '|' + phase + '|' + flagKey + '|' + this.w + 'x' + this.h;
      if (!force && key === this.key) return;
      this.key = key;
      const R = mulberry32(seedOf(art + (env.seedExtra || '')));
      this.R = R;
      this.pal = PAL[phase];
      this.phase = phase;
      this.env = env;
      const c = this.ctx;
      c.save();
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.globalAlpha = 1;
      c.globalCompositeOperation = 'source-over';
      c.clearRect(0, 0, this.w, this.h);
      recipe.draw(this, this.pal, env, R);
      c.restore();
      this.brush(recipe.brush == null ? 1 : recipe.brush);
      this.grain();
      this.vignette(recipe.vignette == null ? .62 : recipe.vignette);
    }

    /* ---------- 좌표 도우미 ---------- */
    X(f) { return f * this.w; }
    Y(f) { return f * this.h; }

    /* ---------- 기본 요소 ---------- */
    sky(top, bot, horizon) {
      const c = this.ctx, p = this.pal;
      const g = c.createLinearGradient(0, 0, 0, this.Y(horizon == null ? .62 : horizon));
      g.addColorStop(0, top || p.top);
      g.addColorStop(1, bot || p.bot);
      c.fillStyle = g;
      c.fillRect(0, 0, this.w, this.h);
      if (p.stars) {
        for (let i = 0; i < 90; i++) {
          c.fillStyle = rgba('#dfe8ff', .2 + this.R() * .5);
          c.fillRect(this.R() * this.w, this.R() * this.Y(.45), 1, 1);
        }
      }
      // 구름 덩어리
      for (let i = 0; i < 7; i++) {
        const x = this.R() * this.w, y = this.R() * this.Y(.4), r = this.X(.12 + this.R() * .25);
        const cg = c.createRadialGradient(x, y, 0, x, y, r);
        const col = this.phase === 'night' ? '#1c2a3a' : this.phase === 'dusk' ? '#8a5a60' : this.phase === 'dawn' ? '#c9a2a0' : '#dcdcd6';
        cg.addColorStop(0, rgba(col, this.phase === 'night' ? .35 : .45));
        cg.addColorStop(1, rgba(col, 0));
        c.fillStyle = cg;
        c.beginPath(); c.ellipse(x, y, r * 1.8, r * .55, 0, 0, Math.PI * 2); c.fill();
      }
    }
    glow(x, y, r, col, a) {
      const c = this.ctx;
      const g = c.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, rgba(col, a == null ? .7 : a));
      g.addColorStop(1, rgba(col, 0));
      c.fillStyle = g;
      c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    }
    sea(y0, col) {
      const c = this.ctx, p = this.pal, y = this.Y(y0);
      const g = c.createLinearGradient(0, y, 0, this.h);
      g.addColorStop(0, rgba(mix(col || p.sea, p.bot, .35)));
      g.addColorStop(1, rgba(mix(col || p.sea, '#000000', .45)));
      c.fillStyle = g;
      c.fillRect(0, y, this.w, this.h - y);
      // 반사광 줄무늬
      for (let i = 0; i < 70; i++) {
        const yy = y + Math.pow(this.R(), 1.6) * (this.h - y);
        const ww = this.X(.02 + this.R() * .12);
        c.fillStyle = rgba(p.lamp ? p.light : p.bot, .05 + this.R() * .12);
        c.fillRect(this.R() * this.w, yy, ww, 1 + this.R() * 2);
      }
    }
    skyline(y0, col, density, lit) {
      const c = this.ctx, y = this.Y(y0);
      let x = -10;
      c.fillStyle = col;
      while (x < this.w + 10) {
        const bw = this.X(.03 + this.R() * .07) * (density || 1);
        const bh = this.Y(.03 + this.R() * .12);
        c.fillRect(x, y - bh, bw, bh + 2);
        if (this.R() < .25) c.fillRect(x + bw * .3, y - bh - this.Y(.03), bw * .15, this.Y(.03));
        if (lit && this.pal.lamp) {
          for (let k = 0; k < 6; k++) {
            if (this.R() < .45) {
              c.fillStyle = rgba(this.pal.light, .45 + this.R() * .4);
              c.fillRect(x + this.R() * (bw - 3), y - this.R() * bh, 2, 2);
              c.fillStyle = col;
            }
          }
        }
        x += bw + this.X(.004);
      }
      c.fillRect(0, y, this.w, 3);
    }
    crane(x0, base0, s, col, opts) {
      opts = opts || {};
      const c = this.ctx;
      const x = this.X(x0), base = this.Y(base0), S = this.h * s;
      c.save();
      c.strokeStyle = col; c.fillStyle = col; c.lineCap = 'square';
      c.lineWidth = Math.max(2, S * .012);
      // 다리 (A자 틀)
      const legW = S * .18, legH = S * .52;
      c.beginPath();
      c.moveTo(x - legW, base); c.lineTo(x - legW * .25, base - legH);
      c.moveTo(x + legW, base); c.lineTo(x + legW * .25, base - legH);
      c.moveTo(x - legW * .6, base - legH * .45); c.lineTo(x + legW * .6, base - legH * .45);
      c.moveTo(x - legW * .85, base - legH * .15); c.lineTo(x + legW * .85, base - legH * .15);
      c.stroke();
      // 격자 보강
      c.lineWidth = Math.max(1, S * .005);
      c.beginPath();
      c.moveTo(x - legW, base); c.lineTo(x + legW * .6, base - legH * .45);
      c.moveTo(x + legW, base); c.lineTo(x - legW * .6, base - legH * .45);
      c.stroke();
      // 운전실
      const cabY = base - legH;
      c.fillRect(x - S * .07, cabY - S * .11, S * .14, S * .11);
      if (this.pal.lamp) { c.fillStyle = rgba(this.pal.light, .8); c.fillRect(x - S * .05, cabY - S * .09, S * .035, S * .03); c.fillStyle = col; }
      // 지브
      const ang = opts.angle == null ? -0.16 : opts.angle;
      const dir = opts.dir || 1;
      const jl = S * (opts.jib || 1.05);
      const jx = x + Math.cos(ang) * jl * dir, jy = cabY - S * .08 + Math.sin(ang) * jl;
      c.lineWidth = Math.max(2, S * .016);
      c.beginPath(); c.moveTo(x - S * .12 * dir, cabY - S * .06); c.lineTo(jx, jy); c.stroke();
      c.lineWidth = Math.max(1, S * .006);
      c.beginPath();
      for (let i = 0; i < 9; i++) {
        const t0 = i / 9, t1 = (i + 1) / 9;
        const ax = x + (jx - x) * t0, ay = cabY - S * .08 + (jy - cabY + S * .08) * t0;
        const bx = x + (jx - x) * t1, by = cabY - S * .08 + (jy - cabY + S * .08) * t1;
        c.moveTo(ax, ay); c.lineTo(bx, by - S * .035);
      }
      c.stroke();
      // 균형추 쪽 팔
      c.lineWidth = Math.max(2, S * .014);
      c.beginPath(); c.moveTo(x, cabY - S * .08); c.lineTo(x - S * .32 * dir, cabY - S * .02); c.stroke();
      c.fillRect(x - S * .36 * dir - (dir < 0 ? 0 : S * .0), cabY - S * .03, S * .08 * dir, S * .07);
      // 케이블과 갈고리
      const hookY = jy + S * (opts.drop || .42);
      c.lineWidth = Math.max(1, S * .004);
      c.beginPath(); c.moveTo(jx - S * .01 * dir, jy); c.lineTo(jx - S * .01 * dir, hookY); c.stroke();
      c.beginPath(); c.arc(jx - S * .01 * dir, hookY + S * .012, S * .012, 0, Math.PI); c.stroke();
      if (opts.body) {
        const bx = jx - S * .01 * dir, by = hookY + S * .03;
        c.lineWidth = Math.max(1, S * .008);
        c.beginPath(); c.moveTo(bx, hookY + S * .012); c.lineTo(bx, by); c.stroke();
        c.beginPath(); c.arc(bx, by + S * .013, S * .013, 0, Math.PI * 2); c.fill();
        c.beginPath();
        c.moveTo(bx - S * .014, by + S * .03); c.lineTo(bx + S * .014, by + S * .03);
        c.lineTo(bx + S * .01, by + S * .085); c.lineTo(bx - S * .01, by + S * .085); c.closePath(); c.fill();
        c.lineWidth = Math.max(1, S * .007);
        c.beginPath();
        c.moveTo(bx - S * .005, by + S * .085); c.lineTo(bx - S * .006, by + S * .13);
        c.moveTo(bx + S * .005, by + S * .085); c.lineTo(bx + S * .008, by + S * .128);
        c.stroke();
      }
      c.restore();
      return { jx, jy, hookY };
    }
    lamp(x0, y0, s) {
      const c = this.ctx, x = this.X(x0), y = this.Y(y0), S = this.h * s;
      c.save();
      c.strokeStyle = this.pal.dark; c.lineWidth = Math.max(1.5, S * .02);
      c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - S); c.lineTo(x + S * .18, y - S * 1.02); c.stroke();
      if (this.pal.lamp) {
        this.glow(x + S * .18, y - S * .98, S * .9, this.pal.light, .35);
        this.glow(x + S * .18, y - S * .98, S * .12, '#fff2cf', .9);
        const g = c.createLinearGradient(0, y - S, 0, y + S * .3);
        g.addColorStop(0, rgba(this.pal.light, .18)); g.addColorStop(1, rgba(this.pal.light, 0));
        c.fillStyle = g;
        c.beginPath(); c.moveTo(x + S * .12, y - S * .95); c.lineTo(x - S * .5, y + S * .3); c.lineTo(x + S * .8, y + S * .3); c.closePath(); c.fill();
      }
      c.restore();
    }
    neon(text, x0, y0, size, col, rot) {
      const c = this.ctx;
      c.save();
      c.translate(this.X(x0), this.Y(y0));
      if (rot) c.rotate(rot);
      c.font = '700 ' + Math.round(this.h * size) + 'px "Poiret One", "Song Myung", serif';
      c.textAlign = 'center'; c.textBaseline = 'middle';
      const lit = this.phase !== 'day';
      if (lit) {
        c.shadowColor = col; c.shadowBlur = this.h * size * .9;
        c.fillStyle = rgba(col, .9); c.fillText(text, 0, 0);
        c.shadowBlur = this.h * size * .3;
        c.fillStyle = '#fff1ee'; c.fillText(text, 0, 0);
      } else {
        c.fillStyle = rgba(mix(col, '#555555', .5), .75); c.fillText(text, 0, 0);
      }
      c.restore();
    }
    building(x0, y0, w0, h0, col, winCol, rows, cols) {
      const c = this.ctx, x = this.X(x0), y = this.Y(y0), w = this.X(w0), h = this.Y(h0);
      c.fillStyle = col; c.fillRect(x, y - h, w, h);
      if (rows) {
        const cw = w / (cols * 2 + 1), rh = h / (rows * 2 + 1);
        for (let r = 0; r < rows; r++) {
          for (let k = 0; k < cols; k++) {
            const on = this.pal.lamp ? this.R() < .45 : this.R() < .1;
            c.fillStyle = on ? rgba(winCol || this.pal.light, .55 + this.R() * .35) : rgba(mix(col, '#000000', .35));
            c.fillRect(x + cw * (k * 2 + 1), y - h + rh * (r * 2 + 1), cw, rh * 1.1);
          }
        }
      }
    }
    fog(y0, h0, col, a) {
      const c = this.ctx, y = this.Y(y0), hh = this.Y(h0);
      const g = c.createLinearGradient(0, y - hh, 0, y + hh);
      g.addColorStop(0, rgba(col, 0)); g.addColorStop(.5, rgba(col, a)); g.addColorStop(1, rgba(col, 0));
      c.fillStyle = g; c.fillRect(0, y - hh, this.w, hh * 2);
    }
    pilings(y0, n, col, s) {
      const c = this.ctx;
      for (let i = 0; i < n; i++) {
        const x = this.X(.05 + i / n * .95 + (this.R() - .5) * .03);
        const hh = this.h * s * (.6 + this.R() * .5);
        c.fillStyle = col;
        c.fillRect(x, this.Y(y0) - hh, Math.max(2, this.w * .008), hh);
        c.fillStyle = rgba(col, .35);
        c.fillRect(x, this.Y(y0), Math.max(2, this.w * .008), hh * .5);
      }
    }
    heron(x0, y0, s, col, a) {
      const c = this.ctx, x = this.X(x0), y = this.Y(y0), S = this.h * s;
      c.save();
      c.globalAlpha = a == null ? 1 : a;
      c.fillStyle = col; c.strokeStyle = col;
      c.lineWidth = Math.max(1.5, S * .02);
      c.beginPath(); c.moveTo(x - S * .03, y); c.lineTo(x - S * .02, y - S * .42); c.moveTo(x + S * .03, y); c.lineTo(x + S * .02, y - S * .42); c.stroke();
      c.beginPath(); c.ellipse(x, y - S * .55, S * .13, S * .2, -.35, 0, Math.PI * 2); c.fill();
      c.lineWidth = Math.max(1.5, S * .035);
      c.beginPath(); c.moveTo(x + S * .06, y - S * .68); c.quadraticCurveTo(x + S * .02, y - S * .86, x + S * .08, y - S * .98); c.stroke();
      c.beginPath(); c.ellipse(x + S * .09, y - S * 1.0, S * .04, S * .03, 0, 0, Math.PI * 2); c.fill();
      c.lineWidth = Math.max(1, S * .014);
      c.beginPath(); c.moveTo(x + S * .12, y - S * 1.0); c.lineTo(x + S * .27, y - S * .98); c.stroke();
      c.restore();
    }
    rain(a) {
      const c = this.ctx;
      c.save();
      c.strokeStyle = rgba('#cfd8df', a || .12);
      c.lineWidth = 1;
      c.beginPath();
      for (let i = 0; i < 260; i++) {
        const x = this.R() * this.w, y = this.R() * this.h, l = 8 + this.R() * 16;
        c.moveTo(x, y); c.lineTo(x - l * .25, y + l);
      }
      c.stroke();
      c.restore();
    }
    floor(y0, col1, col2, tiles) {
      const c = this.ctx, y = this.Y(y0), n = tiles || 10;
      c.save();
      const vx = this.w / 2, vy = y - this.Y(.35);
      c.fillStyle = col1; c.fillRect(0, y, this.w, this.h - y);
      c.strokeStyle = col2; c.lineWidth = 1;
      c.beginPath();
      for (let i = -n; i <= n * 2; i++) {
        const bx = this.w * i / n;
        c.moveTo(vx + (bx - vx) * .25, y); c.lineTo(bx + (bx - vx) * 1.2, this.h);
      }
      for (let k = 0; k < 9; k++) {
        const t = Math.pow(k / 8, 1.8);
        const yy = y + (this.h - y) * t;
        c.moveTo(0, yy); c.lineTo(this.w, yy);
      }
      c.stroke();
      c.restore();
    }
    chandelier(x0, y0, s, lit) {
      const c = this.ctx, x = this.X(x0), y = this.Y(y0), S = this.h * s;
      c.save();
      c.strokeStyle = '#1a1512'; c.lineWidth = Math.max(1, S * .02);
      c.beginPath(); c.moveTo(x, 0); c.lineTo(x, y); c.stroke();
      c.beginPath(); c.ellipse(x, y + S * .1, S * .5, S * .12, 0, 0, Math.PI); c.stroke();
      for (let i = 0; i < 7; i++) {
        const px = x - S * .45 + i * S * .15;
        if (lit) this.glow(px, y + S * .12, S * .25, '#ffd9a0', .5);
        c.fillStyle = lit ? '#fff0cc' : '#6d6252';
        c.fillRect(px - 1, y + S * .02, 3, S * .09);
      }
      c.restore();
    }
    person(x0, y0, s, col, pose) {
      const c = this.ctx, x = this.X(x0), y = this.Y(y0), S = this.h * s;
      c.save();
      c.fillStyle = col;
      c.beginPath(); c.arc(x, y - S * .92, S * .07, 0, Math.PI * 2); c.fill();
      c.beginPath();
      c.moveTo(x - S * .12, y - S * .8); c.lineTo(x + S * .12, y - S * .8);
      c.lineTo(x + S * .1, y - S * .38); c.lineTo(x - S * .1, y - S * .38); c.closePath(); c.fill();
      c.fillRect(x - S * .09, y - S * .4, S * .07, S * .4);
      c.fillRect(x + S * .02, y - S * .4, S * .07, S * .4);
      if (pose === 'sit') { c.fillRect(x - S * .2, y - S * .45, S * .4, S * .06); }
      c.restore();
    }
    shade(col, a) { this.ctx.fillStyle = rgba(col, a); this.ctx.fillRect(0, 0, this.w, this.h); }

    /* ---------- 마무리 ---------- */
    brush(strength) {
      if (!strength) return;
      const c = this.ctx, w = this.w, h = this.h, R = this.R;
      let img;
      try { img = c.getImageData(0, 0, w, h).data; } catch (e) { return; }
      const n = Math.floor(w * h / 70 * strength);
      c.save();
      c.lineCap = 'round';
      for (let i = 0; i < n; i++) {
        const x = R() * w, y = R() * h;
        const idx = ((y | 0) * w + (x | 0)) * 4;
        const j = 10;
        const r = img[idx] + (R() * j * 2 - j), g = img[idx + 1] + (R() * j * 2 - j), b = img[idx + 2] + (R() * j * 2 - j);
        const len = 3 + R() * 13;
        const ang = (R() < .18 ? Math.PI / 2 : 0) + (R() - .5) * .8;
        c.strokeStyle = 'rgba(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) + ',' + (.35 + R() * .35) + ')';
        c.lineWidth = 1.2 + R() * 3.2;
        const dx = Math.cos(ang) * len / 2, dy = Math.sin(ang) * len / 2;
        c.beginPath(); c.moveTo(x - dx, y - dy); c.lineTo(x + dx, y + dy); c.stroke();
      }
      c.restore();
    }
    grain() {
      const c = this.ctx;
      if (!Painter.noise) {
        const n = document.createElement('canvas');
        n.width = n.height = 128;
        const nc = n.getContext('2d');
        const id = nc.createImageData(128, 128);
        for (let i = 0; i < id.data.length; i += 4) {
          const v = Math.random() * 255;
          id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255;
        }
        nc.putImageData(id, 0, 0);
        Painter.noise = n;
      }
      c.save();
      c.globalAlpha = .07;
      c.globalCompositeOperation = 'overlay';
      c.fillStyle = c.createPattern(Painter.noise, 'repeat');
      c.fillRect(0, 0, this.w, this.h);
      c.restore();
    }
    vignette(a) {
      const c = this.ctx;
      const g = c.createRadialGradient(this.w / 2, this.h * .45, Math.min(this.w, this.h) * .25, this.w / 2, this.h * .5, Math.max(this.w, this.h) * .78);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(0,0,0,' + a + ')');
      c.fillStyle = g;
      c.fillRect(0, 0, this.w, this.h);
    }
  }

  /* ───────────── 장면 레시피 ───────────── */
  const RECIPES = {};

  RECIPES.void = {
    brush: .5, vignette: .9,
    draw(P) {
      const c = P.ctx;
      const g = c.createLinearGradient(0, 0, 0, P.h);
      g.addColorStop(0, '#020304'); g.addColorStop(.6, '#06090c'); g.addColorStop(1, '#0b1418');
      c.fillStyle = g; c.fillRect(0, 0, P.w, P.h);
      for (let i = 0; i < 40; i++) {
        const y = P.Y(.35 + P.R() * .65);
        c.strokeStyle = rgba('#3b5a66', .05 + P.R() * .12);
        c.lineWidth = 1 + P.R() * 2;
        c.beginPath();
        c.ellipse(P.w / 2 + (P.R() - .5) * P.w * .3, y, P.X(.1 + P.R() * .5), P.Y(.005 + P.R() * .02), 0, 0, Math.PI * 2);
        c.stroke();
      }
      P.glow(P.w / 2, P.Y(.18), P.X(.4), '#2a3d45', .25);
    },
  };

  RECIPES.room = {
    flags: ['has.shoe_right', 'has.shoes_pair'],
    draw(P, p, env) {
      const c = P.ctx;
      // 벽지
      const wall = mix(p.wall, '#5a3b34', .45);
      c.fillStyle = rgba(wall); c.fillRect(0, 0, P.w, P.h);
      for (let i = 0; i < 22; i++) {
        c.fillStyle = rgba(mix(wall, '#000000', .18), .7);
        c.fillRect(P.X(i / 22), 0, P.X(.012), P.Y(.72));
      }
      // 창문
      const wx = P.X(.52), wy = P.Y(.12), ww = P.X(.36), wh = P.Y(.42);
      c.save();
      c.beginPath(); c.rect(wx, wy, ww, wh); c.clip();
      const g = c.createLinearGradient(0, wy, 0, wy + wh);
      g.addColorStop(0, p.top); g.addColorStop(1, p.bot);
      c.fillStyle = g; c.fillRect(wx, wy, ww, wh);
      c.fillStyle = rgba(p.sea); c.fillRect(wx, wy + wh * .72, ww, wh * .3);
      P.skyline(.12 + .42 * .72, rgba(p.land), .5, true);
      const bodyOn = !env.v('body_down');
      P.crane(.66, .12 + .42 * .74, .3, rgba(mix(p.land, '#000000', .2)), { body: bodyOn, jib: .9, drop: .3 });
      c.restore();
      c.strokeStyle = '#1c1210'; c.lineWidth = P.X(.012);
      c.strokeRect(wx, wy, ww, wh);
      c.beginPath(); c.moveTo(wx + ww / 2, wy); c.lineTo(wx + ww / 2, wy + wh); c.moveTo(wx, wy + wh / 2); c.lineTo(wx + ww, wy + wh / 2); c.stroke();
      // 커튼
      c.fillStyle = rgba('#5d1f22', .9);
      c.fillRect(wx - P.X(.06), wy - P.Y(.03), P.X(.07), wh + P.Y(.1));
      c.fillRect(wx + ww - P.X(.01), wy - P.Y(.03), P.X(.07), wh + P.Y(.1));
      // 거울 (금 간)
      const mx = P.X(.08), my = P.Y(.18), mw = P.X(.22), mh = P.Y(.3);
      c.fillStyle = rgba(mix(p.bot, '#8a9399', .5), .55); c.fillRect(mx, my, mw, mh);
      c.strokeStyle = '#2a1d17'; c.lineWidth = P.X(.01); c.strokeRect(mx, my, mw, mh);
      c.strokeStyle = rgba('#e8e8e8', .5); c.lineWidth = 1;
      c.beginPath();
      const cx = mx + mw * .55, cy = my + mh * .4;
      for (let i = 0; i < 9; i++) { const a = P.R() * Math.PI * 2; c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * mw * .6, cy + Math.sin(a) * mh * .6); }
      c.stroke();
      // 바닥
      P.floor(.72, rgba('#2b1c16'), rgba('#1b100c', .8), 8);
      // 샹들리에와 구두
      P.chandelier(.34, .1, .16, p.phase !== 'day' && false);
      if (!env.v('has.shoe_right') && !env.v('has.shoes_pair')) {
        c.fillStyle = '#efe6d6';
        c.beginPath(); c.ellipse(P.X(.3), P.Y(.19), P.X(.035), P.Y(.012), -.4, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#5a3a24';
        c.beginPath(); c.ellipse(P.X(.275), P.Y(.2), P.X(.014), P.Y(.009), -.4, 0, Math.PI * 2); c.fill();
      }
      // 욕조 가장자리와 축음기
      c.fillStyle = '#d8d2c4'; c.beginPath(); c.ellipse(P.X(.18), P.Y(.9), P.X(.2), P.Y(.06), 0, Math.PI, 0); c.fill();
      c.fillStyle = rgba('#3e5a60', .8); c.beginPath(); c.ellipse(P.X(.18), P.Y(.9), P.X(.17), P.Y(.04), 0, Math.PI, 0); c.fill();
      c.fillStyle = '#20150f'; c.fillRect(P.X(.72), P.Y(.66), P.X(.18), P.Y(.12));
      c.fillStyle = '#b8903e';
      c.beginPath(); c.moveTo(P.X(.8), P.Y(.66)); c.lineTo(P.X(.74), P.Y(.5)); c.lineTo(P.X(.9), P.Y(.46)); c.closePath(); c.fill();
      // 창문 빛
      P.glow(wx + ww / 2, wy + wh / 2, P.X(.6), p.bot, .18);
      // 벽의 립스틱 글씨
      c.save(); c.translate(P.X(.1), P.Y(.62)); c.rotate(-.06);
      c.font = Math.round(P.h * .028) + 'px "Song Myung", serif'; c.fillStyle = rgba('#b0283a', .8);
      c.fillText('아침을 폐지한다', 0, 0); c.restore();
    },
  };

  RECIPES.hall = {
    draw(P, p) {
      const c = P.ctx;
      const lit = true;
      c.fillStyle = '#1d0f10'; c.fillRect(0, 0, P.w, P.h);
      const g = c.createLinearGradient(0, 0, 0, P.Y(.6));
      g.addColorStop(0, '#2a1416'); g.addColorStop(1, '#4a2521');
      c.fillStyle = g; c.fillRect(0, 0, P.w, P.Y(.6));
      // 기둥
      for (let i = 0; i < 6; i++) {
        const x = P.X(.04 + i * .19);
        c.fillStyle = rgba('#140a0a', .8); c.fillRect(x, P.Y(.08), P.X(.04), P.Y(.56));
        c.fillStyle = rgba('#8a5a3a', .25); c.fillRect(x + P.X(.005), P.Y(.08), P.X(.008), P.Y(.56));
      }
      // 무대
      c.fillStyle = '#2b1210'; c.fillRect(P.X(.55), P.Y(.36), P.X(.45), P.Y(.2));
      c.fillStyle = rgba('#7a1f24', .9); c.fillRect(P.X(.55), P.Y(.08), P.X(.06), P.Y(.3)); c.fillRect(P.X(.94), P.Y(.08), P.X(.06), P.Y(.3));
      P.neon('TANGO', .78, .2, .07, '#ff5a6e');
      if (P.phase === 'night' || P.phase === 'dusk') P.person(.8, .5, .16, '#0b0607', 'sit');
      // 바닥
      P.floor(.6, rgba('#3a2217'), rgba('#1c0f0a', .7), 12);
      // 분수
      const fx = P.X(.38), fy = P.Y(.78);
      c.fillStyle = '#8c8272'; c.beginPath(); c.ellipse(fx, fy, P.X(.2), P.Y(.05), 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = rgba('#34545c', .95); c.beginPath(); c.ellipse(fx, fy - P.Y(.006), P.X(.17), P.Y(.038), 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#a39a88'; c.fillRect(fx - P.X(.015), fy - P.Y(.2), P.X(.03), P.Y(.2));
      c.beginPath(); c.ellipse(fx, fy - P.Y(.2), P.X(.07), P.Y(.018), 0, 0, Math.PI * 2); c.fill();
      c.strokeStyle = rgba('#cfe8ec', .5); c.lineWidth = 1.2;
      c.beginPath();
      for (let i = 0; i < 6; i++) { c.moveTo(fx, fy - P.Y(.21)); c.quadraticCurveTo(fx + (i - 2.5) * P.X(.03), fy - P.Y(.27), fx + (i - 2.5) * P.X(.05), fy - P.Y(.03)); }
      c.stroke();
      P.chandelier(.28, .06, .13, lit);
      P.chandelier(.62, .04, .1, lit);
      P.glow(P.X(.3), P.Y(.12), P.X(.35), '#ffcf8a', .12);
      // 의자 뒤집힌 테이블 (낮)
      if (P.phase === 'day' || P.phase === 'dawn') {
        for (let i = 0; i < 4; i++) {
          const x = P.X(.06 + i * .12), y = P.Y(.7 + (i % 2) * .08);
          c.fillStyle = '#1a0d0a'; c.fillRect(x, y - P.Y(.05), P.X(.08), P.Y(.012));
          c.fillRect(x + P.X(.01), y - P.Y(.09), P.X(.006), P.Y(.04)); c.fillRect(x + P.X(.06), y - P.Y(.09), P.X(.006), P.Y(.04));
        }
      }
    },
  };

  RECIPES.backyard = {
    draw(P, p) {
      P.sky(null, null, .5);
      const c = P.ctx;
      P.building(0, 1, .42, .95, rgba(mix(p.wall, '#000000', .3)), null, 6, 3);
      P.building(.62, 1, .4, .9, rgba(mix(p.wall, '#000000', .45)), null, 5, 3);
      c.fillStyle = rgba(mix(p.land, '#302a26', .5)); c.fillRect(0, P.Y(.8), P.w, P.Y(.2));
      // 비상계단
      c.strokeStyle = '#0e0c0b'; c.lineWidth = 2;
      for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(P.X(.62), P.Y(.2 + i * .13)); c.lineTo(P.X(.5), P.Y(.26 + i * .13)); c.stroke(); c.strokeRect(P.X(.5), P.Y(.26 + i * .13), P.X(.12), P.Y(.01)); }
      // 쓰레기통과 병
      c.fillStyle = '#1d2a22'; c.fillRect(P.X(.2), P.Y(.72), P.X(.14), P.Y(.12));
      for (let i = 0; i < 9; i++) { c.fillStyle = rgba('#3d6a4a', .8); c.fillRect(P.X(.1 + P.R() * .5), P.Y(.84 + P.R() * .08), P.X(.01), P.Y(.035)); }
      P.lamp(.46, .82, .28);
      if (P.phase === 'night') P.rain(.08);
    },
  };

  RECIPES.quay = {
    flags: ['body_down'],
    draw(P, p, env) {
      P.sky(null, null, .56);
      P.skyline(.56, rgba(mix(p.land, p.bot, .35)), .9, true);
      P.sea(.56);
      const col = rgba(mix(p.land, '#000000', .1));
      P.crane(.62, .62, .5, col, { body: !env.v('body_down'), jib: 1.0, drop: .38 });
      P.crane(.9, .6, .38, rgba(mix(p.land, p.bot, .2)), { jib: .8, angle: -.3 });
      P.crane(.15, .6, .33, rgba(mix(p.land, p.bot, .3)), { jib: .7, dir: -1, angle: -.1 });
      const c = P.ctx;
      // 부두 바닥
      c.fillStyle = rgba(mix(p.land, '#3a3530', .4)); c.fillRect(0, P.Y(.78), P.w, P.Y(.22));
      c.fillStyle = rgba('#000000', .25); for (let i = 0; i < 8; i++) c.fillRect(0, P.Y(.8 + i * .025), P.w, 1);
      // 무도장 간판
      P.building(-.02, .82, .3, .5, rgba(mix(p.wall, '#000000', .25)), null, 3, 2);
      P.neon('LETHE', .13, .4, .05, '#ff4f68', -.03);
      // 생선 노점과 가로등
      c.fillStyle = rgba('#3b2a22'); c.fillRect(P.X(.36), P.Y(.72), P.X(.14), P.Y(.08));
      c.fillStyle = rgba('#9a3a2a'); c.beginPath(); c.moveTo(P.X(.34), P.Y(.72)); c.lineTo(P.X(.52), P.Y(.72)); c.lineTo(P.X(.5), P.Y(.67)); c.lineTo(P.X(.36), P.Y(.67)); c.closePath(); c.fill();
      P.lamp(.56, .86, .32);
      P.lamp(.94, .86, .3);
      P.fog(.6, .06, p.haze, P.phase === 'day' ? .25 : .18);
    },
  };

  RECIPES.crane = {
    flags: ['body_down', 'standoff_done'],
    draw(P, p, env) {
      P.sky(null, null, .7);
      P.sea(.7);
      const c = P.ctx;
      const col = rgba(mix(p.land, '#000000', .15));
      P.crane(.42, .86, .92, col, { body: !env.v('body_down'), jib: .95, drop: .22, angle: -.2 });
      c.fillStyle = rgba(mix(p.land, '#3a3530', .35)); c.fillRect(0, P.Y(.86), P.w, P.Y(.14));
      // 바리케이드와 드럼통 불
      for (let i = 0; i < 5; i++) {
        const x = P.X(.58 + i * .08);
        c.fillStyle = '#2b1a14'; c.fillRect(x, P.Y(.8), P.X(.05), P.Y(.07));
        c.fillStyle = rgba('#6d2a1c', .8); c.fillRect(x, P.Y(.81), P.X(.05), P.Y(.008));
      }
      P.glow(P.X(.7), P.Y(.78), P.X(.12), '#ff8a3a', P.phase === 'day' ? .35 : .7);
      P.glow(P.X(.7), P.Y(.79), P.X(.03), '#ffe0a0', .9);
      for (let i = 0; i < 4; i++) P.person(.62 + i * .07 + (P.R() - .5) * .02, .87, .13 + P.R() * .02, '#0a0a0b');
      // 초소
      c.fillStyle = '#1f2426'; c.fillRect(P.X(.04), P.Y(.72), P.X(.14), P.Y(.15));
      c.fillStyle = rgba(p.lamp ? p.light : '#9aa2a0', .6); c.fillRect(P.X(.07), P.Y(.75), P.X(.05), P.Y(.04));
      // 추모비 촛불
      for (let i = 0; i < 6; i++) P.glow(P.X(.24 + i * .02), P.Y(.85), P.X(.015), '#ffcf7a', .8);
      P.fog(.72, .05, p.haze, .2);
    },
  };

  RECIPES.cannery = {
    draw(P, p) {
      const c = P.ctx;
      c.fillStyle = '#15191a'; c.fillRect(0, 0, P.w, P.h);
      // 높은 창
      for (let i = 0; i < 5; i++) {
        const x = P.X(.05 + i * .19);
        const g = c.createLinearGradient(0, P.Y(.05), 0, P.Y(.35));
        g.addColorStop(0, p.top); g.addColorStop(1, p.bot);
        c.fillStyle = g; c.fillRect(x, P.Y(.05), P.X(.12), P.Y(.3));
        c.strokeStyle = '#0b0d0e'; c.lineWidth = 2;
        for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(x, P.Y(.05 + k * .075)); c.lineTo(x + P.X(.12), P.Y(.05 + k * .075)); c.stroke(); }
        const lg = c.createLinearGradient(x, P.Y(.35), x + P.X(.2), P.h);
        lg.addColorStop(0, rgba(p.bot, .12)); lg.addColorStop(1, rgba(p.bot, 0));
        c.fillStyle = lg; c.beginPath(); c.moveTo(x, P.Y(.35)); c.lineTo(x + P.X(.12), P.Y(.35)); c.lineTo(x + P.X(.32), P.h); c.lineTo(x + P.X(.12), P.h); c.closePath(); c.fill();
      }
      // 컨베이어
      c.fillStyle = '#23292b'; c.fillRect(0, P.Y(.62), P.w, P.Y(.05));
      for (let i = 0; i < 12; i++) { c.fillStyle = '#0e1112'; c.fillRect(P.X(i / 12), P.Y(.67), P.X(.01), P.Y(.15)); }
      for (let i = 0; i < 14; i++) { c.fillStyle = rgba('#8a9aa0', .7); c.beginPath(); c.ellipse(P.X(.05 + i * .065), P.Y(.61), P.X(.015), P.Y(.01), 0, 0, Math.PI * 2); c.fill(); }
      c.fillStyle = '#101314'; c.fillRect(0, P.Y(.82), P.w, P.Y(.18));
      // 유리 사무실과 전등
      c.fillStyle = rgba('#2a2418', .9); c.fillRect(P.X(.58), P.Y(.38), P.X(.34), P.Y(.2));
      c.fillStyle = rgba('#ffcc77', .25); c.fillRect(P.X(.6), P.Y(.4), P.X(.3), P.Y(.15));
      P.glow(P.X(.75), P.Y(.44), P.X(.2), '#ffc56a', .35);
      P.person(.75, .56, .12, '#0b0908', 'sit');
      c.strokeStyle = '#8f1f1f'; c.lineWidth = P.X(.006);
      c.beginPath(); c.moveTo(P.X(.1), P.Y(.5)); c.lineTo(P.X(.1), P.Y(.44)); c.moveTo(P.X(.08), P.Y(.46)); c.lineTo(P.X(.12), P.Y(.46)); c.stroke();
      P.neon('붉은 닻', .2, .49, .03, '#d9463c');
    },
  };

  RECIPES.hotel = {
    draw(P, p) {
      const c = P.ctx;
      const g = c.createLinearGradient(0, 0, 0, P.h);
      g.addColorStop(0, '#2c2a22'); g.addColorStop(1, '#141310');
      c.fillStyle = g; c.fillRect(0, 0, P.w, P.h);
      for (let i = 0; i < 5; i++) {
        const x = P.X(.06 + i * .22);
        c.fillStyle = '#d9cfb8'; c.fillRect(x, P.Y(.1), P.X(.05), P.Y(.58));
        c.fillStyle = rgba('#000000', .25); c.fillRect(x + P.X(.035), P.Y(.1), P.X(.015), P.Y(.58));
        c.fillStyle = '#b8ab8e'; c.fillRect(x - P.X(.01), P.Y(.08), P.X(.07), P.Y(.03)); c.fillRect(x - P.X(.01), P.Y(.66), P.X(.07), P.Y(.03));
      }
      P.floor(.68, rgba('#3b352b'), rgba('#221f19', .6), 14);
      P.chandelier(.5, .05, .2, true);
      P.glow(P.X(.5), P.Y(.12), P.X(.4), '#ffe3a6', .18);
      // 야자수 화분
      for (const x of [.14, .86]) {
        c.fillStyle = '#3c2a1e'; c.fillRect(P.X(x - .03), P.Y(.7), P.X(.06), P.Y(.08));
        c.strokeStyle = '#1d3322'; c.lineWidth = P.X(.01);
        for (let k = 0; k < 7; k++) { c.beginPath(); c.moveTo(P.X(x), P.Y(.7)); c.quadraticCurveTo(P.X(x + (k - 3) * .03), P.Y(.5), P.X(x + (k - 3) * .06), P.Y(.58 + P.R() * .05)); c.stroke(); }
      }
      // 프런트 데스크
      c.fillStyle = '#2a1d14'; c.fillRect(P.X(.3), P.Y(.62), P.X(.4), P.Y(.1));
      c.fillStyle = '#b89a5a'; c.fillRect(P.X(.3), P.Y(.62), P.X(.4), P.Y(.008));
      P.person(.5, .62, .14, '#15110d');
    },
  };

  RECIPES.room305 = {
    draw(P, p) {
      const c = P.ctx;
      c.fillStyle = '#3a3a33'; c.fillRect(0, 0, P.w, P.h);
      for (let i = 0; i < 30; i++) { c.fillStyle = rgba('#2e2f29', .6); c.fillRect(P.X(i / 30), 0, P.X(.004), P.Y(.7)); }
      const wx = P.X(.58), wy = P.Y(.1), ww = P.X(.3), wh = P.Y(.38);
      const g = c.createLinearGradient(0, wy, 0, wy + wh);
      g.addColorStop(0, p.top); g.addColorStop(1, p.bot);
      c.fillStyle = g; c.fillRect(wx, wy, ww, wh);
      c.strokeStyle = '#e6e0d0'; c.lineWidth = P.X(.01); c.strokeRect(wx, wy, ww, wh);
      P.floor(.7, rgba('#4a3f33'), rgba('#2e261e', .6), 8);
      // 침대와 책상
      c.fillStyle = '#d7d1c3'; c.fillRect(P.X(.05), P.Y(.62), P.X(.4), P.Y(.12));
      c.fillStyle = '#6b5f4d'; c.fillRect(P.X(.05), P.Y(.56), P.X(.06), P.Y(.18));
      c.fillStyle = '#2a2018'; c.fillRect(P.X(.55), P.Y(.58), P.X(.3), P.Y(.04)); c.fillRect(P.X(.57), P.Y(.62), P.X(.02), P.Y(.12)); c.fillRect(P.X(.81), P.Y(.62), P.X(.02), P.Y(.12));
      c.fillStyle = '#efe9da'; c.fillRect(P.X(.62), P.Y(.565), P.X(.07), P.Y(.015));
      P.glow(P.X(.78), P.Y(.5), P.X(.12), '#ffd28a', .35);
      c.fillStyle = '#3d4a44'; c.fillRect(P.X(.2), P.Y(.3), P.X(.14), P.Y(.18));
      c.strokeStyle = '#1b1d1a'; c.lineWidth = 2; c.strokeRect(P.X(.2), P.Y(.3), P.X(.14), P.Y(.18));
    },
  };

  RECIPES.pawn = {
    draw(P, p) {
      const c = P.ctx;
      c.fillStyle = '#17130f'; c.fillRect(0, 0, P.w, P.h);
      for (let r = 0; r < 5; r++) {
        const y = P.Y(.14 + r * .14);
        c.fillStyle = '#2d2117'; c.fillRect(0, y, P.w, P.Y(.012));
        let x = P.X(.02);
        while (x < P.w) {
          const w = P.X(.02 + P.R() * .06), h = P.Y(.03 + P.R() * .08);
          c.fillStyle = rgba(mix('#6a5a44', ['#8a3a2a', '#3a5a6a', '#b8a060', '#4a6a3a'][(P.R() * 4) | 0], .5), .9);
          if (P.R() < .3) { c.beginPath(); c.ellipse(x + w / 2, y - h / 2, w / 2, h / 2, 0, 0, Math.PI * 2); c.fill(); }
          else c.fillRect(x, y - h, w, h);
          x += w + P.X(.01);
        }
      }
      c.fillStyle = '#241a12'; c.fillRect(0, P.Y(.78), P.w, P.Y(.22));
      c.fillStyle = rgba('#9fb5b0', .25); c.fillRect(P.X(.15), P.Y(.72), P.X(.5), P.Y(.06));
      P.glow(P.X(.55), P.Y(.3), P.X(.35), '#ffcb73', .3);
      P.person(.72, .8, .2, '#0d0a08');
    },
  };

  RECIPES.church = {
    draw(P, p) {
      P.sky(null, null, .7);
      const c = P.ctx;
      const stone = rgba(mix(p.land, '#6a6258', .35));
      c.fillStyle = stone;
      // 부서진 신랑(身廊) 벽
      c.beginPath(); c.moveTo(0, P.h); c.lineTo(0, P.Y(.25)); c.lineTo(P.X(.08), P.Y(.2)); c.lineTo(P.X(.14), P.Y(.3)); c.lineTo(P.X(.2), P.Y(.35)); c.lineTo(P.X(.2), P.h); c.fill();
      c.beginPath(); c.moveTo(P.w, P.h); c.lineTo(P.w, P.Y(.3)); c.lineTo(P.X(.9), P.Y(.26)); c.lineTo(P.X(.84), P.Y(.4)); c.lineTo(P.X(.8), P.h); c.fill();
      // 종탑
      c.fillRect(P.X(.44), P.Y(.12), P.X(.16), P.Y(.88));
      c.beginPath(); c.moveTo(P.X(.42), P.Y(.12)); c.lineTo(P.X(.52), P.Y(.02)); c.lineTo(P.X(.62), P.Y(.12)); c.fill();
      c.fillStyle = rgba(p.top); c.beginPath(); c.arc(P.X(.52), P.Y(.2), P.X(.04), Math.PI, 0); c.fillRect(P.X(.48), P.Y(.2), P.X(.08), P.Y(.08)); c.fill();
      // 안테나
      c.strokeStyle = '#111'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(P.X(.52), P.Y(.02)); c.lineTo(P.X(.52), P.Y(-.05)); c.moveTo(P.X(.52), P.Y(.0)); c.lineTo(P.X(.7), P.Y(.3)); c.moveTo(P.X(.52), P.Y(.0)); c.lineTo(P.X(.34), P.Y(.3)); c.stroke();
      P.glow(P.X(.52), P.Y(.24), P.X(.06), '#ff5040', .6);
      // 아치 창
      c.fillStyle = rgba(p.bot, .5);
      for (let i = 0; i < 2; i++) { c.beginPath(); c.arc(P.X(.07 + i * .82), P.Y(.5), P.X(.03), Math.PI, 0); c.fillRect(P.X(.04 + i * .82), P.Y(.5), P.X(.06), P.Y(.15)); c.fill(); }
      c.fillStyle = rgba(mix(p.land, '#000000', .3)); c.fillRect(0, P.Y(.88), P.w, P.Y(.12));
      for (let i = 0; i < 12; i++) { c.fillStyle = rgba('#3a3530', .9); c.fillRect(P.X(P.R()), P.Y(.86 + P.R() * .06), P.X(.02 + P.R() * .04), P.Y(.02)); }
      c.fillStyle = rgba('#1e3a44', .8); c.fillRect(P.X(.2), P.Y(.9), P.X(.6), P.Y(.1));
    },
  };

  RECIPES.honeycomb = {
    draw(P, p) {
      P.sky(null, null, .3);
      const c = P.ctx;
      const wall = rgba(mix(p.wall, '#7a6048', .3));
      c.fillStyle = wall; c.fillRect(0, P.Y(.08), P.X(.3), P.Y(.92)); c.fillRect(P.X(.7), P.Y(.05), P.X(.3), P.Y(.95));
      c.fillStyle = rgba(mix(p.wall, '#000000', .2)); c.fillRect(P.X(.3), P.Y(.12), P.X(.4), P.Y(.88));
      for (let r = 0; r < 6; r++) {
        for (let k = 0; k < 3; k++) {
          const lit = p.lamp ? P.R() < .5 : P.R() < .1;
          c.fillStyle = lit ? rgba(p.light, .7) : rgba('#141212', .9);
          c.fillRect(P.X(.34 + k * .12), P.Y(.18 + r * .13), P.X(.06), P.Y(.07));
          c.fillStyle = '#1b1614'; c.fillRect(P.X(.32 + k * .12), P.Y(.26 + r * .13), P.X(.1), P.Y(.008));
        }
      }
      // 빨랫줄
      for (let i = 0; i < 4; i++) {
        const y = P.Y(.2 + i * .15);
        c.strokeStyle = '#0d0b0a'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(P.X(.3), y); c.quadraticCurveTo(P.X(.5), y + P.Y(.04), P.X(.7), y); c.stroke();
        for (let k = 0; k < 6; k++) {
          const x = P.X(.33 + k * .06);
          c.fillStyle = rgba(['#b8a38a', '#7a2f2a', '#3f5a6f', '#d8d0bf', '#5f7a4a'][(P.R() * 5) | 0], .9);
          c.fillRect(x, y + P.Y(.015) + Math.sin(k) * P.Y(.01), P.X(.035), P.Y(.05 + P.R() * .03));
        }
      }
      c.fillStyle = rgba(mix(p.land, '#2a2520', .4)); c.fillRect(0, P.Y(.9), P.w, P.Y(.1));
      P.lamp(.5, .92, .22);
    },
  };

  RECIPES.roof = {
    flags: ['body_down'],
    draw(P, p, env) {
      P.sky(null, null, .6);
      P.skyline(.6, rgba(mix(p.land, p.bot, .3)), .8, true);
      P.sea(.6);
      P.crane(.72, .64, .42, rgba(mix(p.land, '#000000', .1)), { body: !env.v('body_down'), jib: .9, drop: .3 });
      const c = P.ctx;
      c.fillStyle = rgba('#141312'); c.fillRect(0, P.Y(.72), P.w, P.Y(.28));
      c.fillStyle = rgba('#000000', .3); for (let i = 0; i < 6; i++) c.fillRect(0, P.Y(.74 + i * .04), P.w, 1);
      // 물탱크
      c.fillStyle = '#2a211a'; c.fillRect(P.X(.06), P.Y(.38), P.X(.18), P.Y(.2));
      c.beginPath(); c.moveTo(P.X(.05), P.Y(.38)); c.lineTo(P.X(.15), P.Y(.31)); c.lineTo(P.X(.25), P.Y(.38)); c.fill();
      c.strokeStyle = '#1a1410'; c.lineWidth = 3;
      c.beginPath(); c.moveTo(P.X(.08), P.Y(.58)); c.lineTo(P.X(.07), P.Y(.73)); c.moveTo(P.X(.22), P.Y(.58)); c.lineTo(P.X(.23), P.Y(.73)); c.stroke();
      // 비둘기장
      c.fillStyle = '#3a2c20'; c.fillRect(P.X(.3), P.Y(.56), P.X(.2), P.Y(.16));
      c.fillStyle = '#1b140e';
      for (let i = 0; i < 4; i++) c.fillRect(P.X(.32 + i * .045), P.Y(.6), P.X(.025), P.Y(.03));
      c.beginPath(); c.moveTo(P.X(.29), P.Y(.56)); c.lineTo(P.X(.4), P.Y(.5)); c.lineTo(P.X(.51), P.Y(.56)); c.fill();
      for (let i = 0; i < 7; i++) { c.fillStyle = rgba('#8a8f94', .9); c.beginPath(); c.ellipse(P.X(.3 + P.R() * .25), P.Y(.49 + P.R() * .05), P.X(.008), P.Y(.006), 0, 0, Math.PI * 2); c.fill(); }
      // 화분과 난간
      c.fillStyle = '#4a2f22'; c.fillRect(P.X(.6), P.Y(.7), P.X(.08), P.Y(.05));
      c.strokeStyle = '#0d0c0b'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(0, P.Y(.7)); c.lineTo(P.w, P.Y(.7)); c.stroke();
      for (let i = 0; i < 20; i++) { c.beginPath(); c.moveTo(P.X(i / 20), P.Y(.7)); c.lineTo(P.X(i / 20), P.Y(.74)); c.stroke(); }
      if (p.lamp) { P.glow(P.X(.9), P.Y(.3), P.X(.25), '#ff5068', .12); }
    },
  };

  RECIPES.breakwater = {
    draw(P, p) {
      P.sky(null, null, .6);
      P.sea(.6);
      const c = P.ctx;
      // 방파제
      c.fillStyle = rgba(mix(p.land, '#5a5550', .3));
      c.beginPath(); c.moveTo(0, P.Y(.86)); c.lineTo(P.X(.7), P.Y(.66)); c.lineTo(P.X(.74), P.Y(.67)); c.lineTo(P.X(.1), P.h); c.lineTo(0, P.h); c.fill();
      // 등대
      const lx = P.X(.72), ly = P.Y(.66);
      c.fillStyle = '#d8d2c6';
      c.beginPath(); c.moveTo(lx - P.X(.035), ly); c.lineTo(lx - P.X(.022), ly - P.Y(.4)); c.lineTo(lx + P.X(.022), ly - P.Y(.4)); c.lineTo(lx + P.X(.035), ly); c.fill();
      c.fillStyle = '#8a2a24';
      for (let i = 0; i < 3; i++) c.fillRect(lx - P.X(.034 - i * .004), ly - P.Y(.1 + i * .12), P.X(.068 - i * .008), P.Y(.04));
      c.fillStyle = '#222'; c.fillRect(lx - P.X(.03), ly - P.Y(.45), P.X(.06), P.Y(.05));
      c.beginPath(); c.moveTo(lx - P.X(.035), ly - P.Y(.45)); c.lineTo(lx, ly - P.Y(.49)); c.lineTo(lx + P.X(.035), ly - P.Y(.45)); c.fill();
      c.fillStyle = rgba('#e8e2cf', .4); c.fillRect(lx - P.X(.02), ly - P.Y(.44), P.X(.04), P.Y(.03));
      // 먼 요새
      c.fillStyle = rgba(mix(p.land, p.bot, .45));
      c.fillRect(P.X(.22), P.Y(.56), P.X(.16), P.Y(.04));
      c.fillRect(P.X(.25), P.Y(.53), P.X(.04), P.Y(.03)); c.fillRect(P.X(.32), P.Y(.54), P.X(.03), P.Y(.02));
      // 순찰정
      c.fillStyle = rgba('#2a3134');
      c.beginPath(); c.moveTo(P.X(.82), P.Y(.72)); c.lineTo(P.X(.98), P.Y(.72)); c.lineTo(P.X(.95), P.Y(.75)); c.lineTo(P.X(.84), P.Y(.75)); c.fill();
      c.fillRect(P.X(.87), P.Y(.69), P.X(.05), P.Y(.03));
      P.pilings(.64, 9, rgba(mix(p.land, '#000000', .2)), .03);
      P.fog(.6, .05, p.haze, .25);
    },
  };

  RECIPES.flats = {
    flags: ['heron_seen'],
    draw(P, p, env) {
      P.sky(null, null, .5);
      const c = P.ctx;
      const mud = mix(p.land, '#6a5f55', .35);
      const g = c.createLinearGradient(0, P.Y(.5), 0, P.h);
      g.addColorStop(0, rgba(mix(mud, p.bot, .4))); g.addColorStop(1, rgba(mix(mud, '#000000', .3)));
      c.fillStyle = g; c.fillRect(0, P.Y(.5), P.w, P.Y(.5));
      for (let i = 0; i < 26; i++) {
        const x = P.R() * P.w, y = P.Y(.52 + Math.pow(P.R(), 1.5) * .45), rw = P.X(.03 + P.R() * .16);
        c.fillStyle = rgba(mix(p.bot, p.top, .3), .55);
        c.beginPath(); c.ellipse(x, y, rw, rw * .12, 0, 0, Math.PI * 2); c.fill();
      }
      // 요새
      c.fillStyle = rgba(mix(p.land, p.bot, .25));
      c.fillRect(P.X(.55), P.Y(.44), P.X(.3), P.Y(.07));
      c.fillRect(P.X(.6), P.Y(.4), P.X(.06), P.Y(.05)); c.fillRect(P.X(.74), P.Y(.41), P.X(.05), P.Y(.04));
      P.pilings(.62, 12, rgba(mix(p.land, '#000000', .3)), .06);
      // 난파선
      c.fillStyle = rgba('#241c16');
      c.beginPath(); c.moveTo(P.X(.08), P.Y(.72)); c.quadraticCurveTo(P.X(.2), P.Y(.8), P.X(.34), P.Y(.7)); c.lineTo(P.X(.3), P.Y(.66)); c.lineTo(P.X(.1), P.Y(.68)); c.fill();
      c.strokeStyle = '#241c16'; c.lineWidth = 3;
      for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(P.X(.12 + i * .035), P.Y(.7)); c.lineTo(P.X(.1 + i * .035), P.Y(.6)); c.stroke(); }
      P.fog(.52, .05, p.haze, .35);
      if (env.v('heron_seen')) P.heron(.46, .66, .2, rgba('#9aa4a6'), .85);
    },
  };

  RECIPES.fort = {
    draw(P, p) {
      P.sky(null, null, .4);
      const c = P.ctx;
      const stone = mix(p.land, '#7a7266', .4);
      c.fillStyle = rgba(stone); c.fillRect(0, P.Y(.2), P.w, P.Y(.8));
      for (let r = 0; r < 18; r++) {
        for (let k = 0; k < 10; k++) {
          c.fillStyle = rgba(mix(stone, '#000000', .1 + P.R() * .2), .9);
          c.fillRect(P.X(k / 10 + (r % 2) * .05), P.Y(.2 + r * .04), P.X(.095), P.Y(.036));
        }
      }
      // 총알 자국
      for (let i = 0; i < 60; i++) { c.fillStyle = rgba('#1a1612', .8); c.beginPath(); c.arc(P.X(.2 + P.R() * .6), P.Y(.35 + P.R() * .25), P.X(.004 + P.R() * .004), 0, Math.PI * 2); c.fill(); }
      // 아치
      c.fillStyle = '#0c0b0a';
      c.beginPath(); c.arc(P.X(.8), P.Y(.62), P.X(.1), Math.PI, 0); c.fillRect(P.X(.7), P.Y(.62), P.X(.2), P.Y(.2)); c.fill();
      P.glow(P.X(.8), P.Y(.72), P.X(.08), '#ffbf6a', .45);
      c.fillStyle = rgba(mix(p.land, '#000000', .3)); c.fillRect(0, P.Y(.82), P.w, P.Y(.18));
      c.fillStyle = rgba('#b8b0a0', .6);
      c.font = Math.round(P.h * .022) + 'px "Song Myung", serif';
      c.fillText('우리는 잊지 않는다', P.X(.26), P.Y(.3));
    },
  };

  RECIPES.dream = {
    brush: 1.4, vignette: .85,
    draw(P) {
      const c = P.ctx;
      const g = c.createLinearGradient(0, 0, 0, P.h);
      g.addColorStop(0, '#1a0e2a'); g.addColorStop(.5, '#3a1f3f'); g.addColorStop(1, '#0a2a33');
      c.fillStyle = g; c.fillRect(0, 0, P.w, P.h);
      for (let i = 0; i < 18; i++) P.glow(P.R() * P.w, P.R() * P.h, P.X(.1 + P.R() * .3), ['#ff6a8a', '#6ad0ff', '#ffd06a'][(P.R() * 3) | 0], .12);
      P.sea(.7, '#1a3a4a');
      P.crane(.5, .7, .6, rgba('#05060a'), { body: true, jib: 1, drop: .4 });
    },
  };

  RECIPES.dawn = {
    brush: 1.1,
    draw(P) {
      P.phase = 'dawn'; P.pal = PAL.dawn;
      P.sky(PAL.dawn.top, PAL.dawn.bot, .55);
      P.glow(P.X(.7), P.Y(.55), P.X(.4), '#ffd6a0', .5);
      const c = P.ctx;
      const g = c.createLinearGradient(0, P.Y(.55), 0, P.h);
      g.addColorStop(0, '#b89a8a'); g.addColorStop(1, '#3a3632');
      c.fillStyle = g; c.fillRect(0, P.Y(.55), P.w, P.Y(.45));
      for (let i = 0; i < 20; i++) { c.fillStyle = rgba('#f0cdb0', .35); c.beginPath(); c.ellipse(P.R() * P.w, P.Y(.58 + P.R() * .4), P.X(.05 + P.R() * .15), P.Y(.006), 0, 0, Math.PI * 2); c.fill(); }
      P.pilings(.66, 8, rgba('#2a2420'), .06);
      P.heron(.42, .78, .42, rgba('#6a7072'));
      P.fog(.56, .06, '#e8c8b0', .35);
    },
  };

  RECIPES.title = {
    brush: 1,
    draw(P, p) {
      P.phase = 'night'; P.pal = PAL.night;
      P.sky(PAL.night.top, PAL.night.bot, .6);
      P.skyline(.6, rgba('#070b10'), 1, true);
      P.sea(.6, '#07101a');
      P.crane(.7, .66, .62, rgba('#030507'), { body: true, jib: 1, drop: .42 });
      P.crane(.95, .63, .4, rgba('#0a1016'), { jib: .8, angle: -.3 });
      P.crane(.28, .63, .36, rgba('#0b1117'), { jib: .7, dir: -1 });
      const c = P.ctx;
      c.fillStyle = '#05080b'; c.fillRect(0, P.Y(.8), P.w, P.Y(.2));
      P.lamp(.52, .86, .3);
      P.lamp(.86, .86, .28);
      P.glow(P.X(.1), P.Y(.5), P.X(.3), '#ff4058', .12);
      P.fog(.62, .07, '#23384a', .3);
      P.rain(.07);
    },
  };

  TL.Painter = Painter;
  TL.sceneRecipes = RECIPES;
  TL.phaseOf = phaseOf;
})(typeof window !== 'undefined' ? window.TL : globalThis.TL);
