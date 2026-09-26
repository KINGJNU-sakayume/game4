/* 탱고 레테 — 무대
 * 장면 그림을 두 겹으로 교차 페이드하고, 그림 위에 살아 있는 빛(깜박이는 네온, 등대, 불꽃),
 * 떠도는 먼지, 비, 필름 그레인을 얹는다. 그림과 광원 위치는 tools/art 에서 만든다(TL.data.artMeta).
 */
(function (TL) {
  'use strict';
  const META = TL.data.artMeta || { base: 'assets/', scenes: {}, portraits: {} };
  const $ = (s) => document.querySelector(s);

  function phaseOf(hour) {
    if (hour >= 5 && hour < 7) return 'dawn';
    if (hour >= 7 && hour < 17) return 'day';
    if (hour >= 17 && hour < 20) return 'dusk';
    return 'night';
  }
  TL.phaseOf = phaseOf;
  const url = (src) => (/^(data:|blob:|https?:|\/)/.test(src) ? src : (META.base || 'assets/') + src);

  const Art = TL.art = {
    meta: META,
    sceneUrl(key) { const s = META.scenes[key]; return s ? url(s.src) : null; },
    portraitUrl(id) { const p = META.portraits[id]; return p ? url(p.src) : null; },
    hasPortrait(id) { return !!META.portraits[id]; },
    /* 장면 열쇠: art 이름 + 낮/밤 + 썰물(l) + 시신(b). 없는 변형은 가까운 것으로 */
    alias: { dream: 'void', dawn: 'breakwater' },
    sceneKey(art, st) {
      const S = META.scenes, dn = st.night ? 'n' : 'd';
      if (Art.alias[art]) { art = Art.alias[art]; if (art === 'breakwater') st = { night: false }; }
      const c = [art + '_' + dn + (st.low ? 'l' : '') + (st.body ? 'b' : ''), art + '_' + dn + (st.body ? 'b' : ''),
        art + '_' + dn + (st.low ? 'l' : ''), art + '_' + dn, art, art + '_d', art + '_n'];
      for (const k of c) if (S[k]) return k;
      return S.void ? 'void' : null;
    },
  };

  /* 값 노이즈 한 줄 (깜박임용) */
  function n1(x) {
    const i = Math.floor(x), f = x - i;
    const h = (k) => { const s = Math.sin(k * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
    const u = f * f * (3 - 2 * f);
    return h(i) * (1 - u) + h(i + 1) * u;
  }
  /* 광원 종류별 밝기 (0~1) */
  function level(kind, t, ph) {
    switch (kind) {
      case 'neon': { const g = n1(t * 3.1 + ph); return g > 0.93 ? 0.08 : (n1(t * 11 + ph) > 0.97 ? 0.3 : 0.75 + 0.2 * Math.sin(t * 2 + ph)); }
      case 'blink': return ((t + ph) % 2.2) < 0.28 ? 1 : 0;
      case 'beacon': return 0.35 + 0.65 * Math.pow(0.5 + 0.5 * Math.sin(t * 1.1 + ph), 3);
      case 'beacon3': { const x = (t + ph) % 3; return x < 0.4 ? 1 - x / 0.4 : 0; }
      case 'fire': case 'ember': return 0.45 + 0.55 * n1(t * 7 + ph);
      case 'candle': return 0.55 + 0.45 * n1(t * 4 + ph);
      case 'lamp': case 'chandelier': return n1(t * 0.7 + ph) > 0.96 ? 0.2 : 0.7 + 0.25 * n1(t * 2 + ph);
      case 'bulb': return n1(t * 1.3 + ph) > 0.94 ? 0.1 : 0.65 + 0.3 * n1(t * 3 + ph);
      case 'door': return 0.6 + 0.3 * n1(t * 1.4 + ph);
      case 'water': return 0.35 + 0.65 * n1(t * 1.6 + ph);
      case 'eyes': return ((t + ph) % 5) < 0.18 ? 0 : 1;
      default: return 0;
    }
  }
  const AMP = { neon: 0.42, blink: 0.9, beacon: 0.5, beacon3: 0.9, fire: 0.45, ember: 0.5, candle: 0.35, lamp: 0.3, chandelier: 0.25, bulb: 0.4, door: 0.3, water: 0.25, eyes: 0.8 };

  class Stage {
    constructor() {
      this.imgs = [$('#stage-a'), $('#stage-b')];
      this.front = 0;
      this.cur = null;
      this.pan = $('#stage-pan');
      this.tint = $('#stage-tint');
      this.fx = $('#stage-fx');
      this.ctx = this.fx.getContext('2d');
      this.lights = [];
      this.motes = [];
      this.drops = [];
      this.rain = false;
      this.focus = 0.4;
      this.effects = true;
      this.last = 0;
      this.makeGrain();
      this.resize();
      window.addEventListener('resize', () => this.resize());
      document.addEventListener('mousemove', (e) => this.parallax(e));
      document.addEventListener('visibilitychange', () => { if (!document.hidden) this.kick(); });
      this.kick();
    }
    makeGrain() {
      try {
        const c = document.createElement('canvas'); c.width = c.height = 256;
        const x = c.getContext('2d'), img = x.createImageData(256, 256);
        for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
        x.putImageData(img, 0, 0);
        $('#grain').style.backgroundImage = 'url(' + c.toDataURL() + ')';
      } catch (e) { /* 그레인 없이 */ }
    }
    resize() {
      const r = this.pan.getBoundingClientRect();
      const k = Math.min(1.5, window.devicePixelRatio || 1) * 0.75;
      this.W = Math.max(1, Math.round(r.width * k));
      this.H = Math.max(1, Math.round(r.height * k));
      this.fx.width = this.W; this.fx.height = this.H;
      this.k = k;
    }
    parallax(e) {
      if (!this.effects || window.innerWidth < 860) return;
      const px = (e.clientX / window.innerWidth - 0.5) * -14, py = (e.clientY / window.innerHeight - 0.5) * -8;
      this.pan.style.translate = px.toFixed(1) + 'px ' + py.toFixed(1) + 'px';
    }
    /* 그림 바꾸기 (교차 페이드) */
    show(key, o = {}) {
      if (!key) return;
      if (key === this.cur) { this.setWeather(o); return; }
      const m = META.scenes[key];
      if (!m) return;
      this.cur = key;
      const next = 1 - this.front, img = this.imgs[next], prev = this.imgs[this.front];
      const done = () => {
        img.onload = null;
        if (this.cur !== key) return;
        img.classList.add('on'); prev.classList.remove('on');
        this.front = next;
        this.setLights(m);
      };
      this.focus = m.focus === undefined ? 0.4 : m.focus;
      img.style.setProperty('--focus', Math.round(this.focus * 100) + '%');
      img.onload = done;
      img.src = url(m.src);
      if (img.complete && img.naturalWidth) done();
      this.setWeather(o);
    }
    setWeather(o) {
      this.rain = !!o.rain;
      if (this.rain && !this.drops.length) for (let i = 0; i < 220; i++) this.drops.push(this.newDrop(true));
      if (!this.rain) this.drops = [];
      const n = o.motes === false ? 0 : (o.motes || 26);
      this.motes = [];
      for (let i = 0; i < n; i++) this.motes.push({ x: Math.random(), y: Math.random(), vx: (Math.random() - 0.5) * 0.004, vy: -0.002 - Math.random() * 0.004, s: 0.6 + Math.random() * 1.6, a: 0.12 + Math.random() * 0.3, ph: Math.random() * 10 });
      this.moteColor = o.moteColor || '255,230,190';
    }
    setTint(phase) {
      this.tint.className = 'stage-tint' + (phase === 'dusk' ? ' dusk' : phase === 'dawn' ? ' dawn' : '');
    }
    setLights(m) {
      this.lights = (m.lights || []).filter(l => AMP[l.kind]).map((l, i) => Object.assign({ ph: (i * 7.31) % 11, rgb: String(l.color).replace(/rgba?\((\d+),\s*(\d+),\s*(\d+).*$/, '$1,$2,$3') }, l));
      if (this.lights.length > 90) this.lights = this.lights.filter((l, i) => l.kind !== 'bulb' || i % 2 === 0);
    }
    newDrop(any) {
      return { x: Math.random() * 1.2 - 0.1, y: any ? Math.random() : -0.05 - Math.random() * 0.2, v: 0.9 + Math.random() * 0.8, l: 0.02 + Math.random() * 0.03, a: 0.12 + Math.random() * 0.22 };
    }
    kick() {
      if (this.running) return;
      this.running = true;
      const loop = (now) => {
        if (document.hidden) { this.running = false; return; }
        requestAnimationFrame(loop);
        if (now - this.last < 33) return;
        const dt = Math.min(0.1, (now - this.last) / 1000);
        this.last = now;
        this.draw(now / 1000, dt);
      };
      requestAnimationFrame(loop);
    }
    /* 그림 좌표(0~1)를 캔버스 좌표로 (object-fit: cover, object-position: focus 50%) */
    map() {
      const W = this.W, H = this.H, sc = Math.max(W / 1920, H / 1080), dw = 1920 * sc, dh = 1080 * sc;
      return { ox: (W - dw) * this.focus, oy: (H - dh) * 0.5, dw, dh };
    }
    draw(t, dt) {
      const c = this.ctx, W = this.W, H = this.H;
      c.clearRect(0, 0, W, H);
      if (!this.effects) return;
      const m = this.map();
      c.globalCompositeOperation = 'lighter';
      for (const l of this.lights) {
        const v = level(l.kind, t, l.ph) * AMP[l.kind];
        if (v < 0.02) continue;
        const x = m.ox + l.x * m.dw, y = m.oy + l.y * m.dh, r = Math.max(6, l.r * m.dw * 1.6);
        if (x < -r || y < -r || x > W + r || y > H + r) continue;
        const g = c.createRadialGradient(x, y, 0, x, y, r);
        const col = l.rgb;
        g.addColorStop(0, 'rgba(' + col + ',' + v.toFixed(3) + ')');
        g.addColorStop(0.35, 'rgba(' + col + ',' + (v * 0.35).toFixed(3) + ')');
        g.addColorStop(1, 'rgba(' + col + ',0)');
        c.fillStyle = g;
        c.fillRect(x - r, y - r, r * 2, r * 2);
      }
      // 먼지
      for (const p of this.motes) {
        p.x += p.vx * dt * 6 + Math.sin(t * 0.3 + p.ph) * 0.0003; p.y += p.vy * dt * 6;
        if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
        if (p.x < -0.02) p.x = 1.02; else if (p.x > 1.02) p.x = -0.02;
        const a = p.a * (0.6 + 0.4 * Math.sin(t * 1.3 + p.ph));
        c.fillStyle = 'rgba(' + this.moteColor + ',' + a.toFixed(3) + ')';
        c.fillRect(p.x * W, p.y * H, p.s * this.k * 1.4, p.s * this.k * 1.4);
      }
      // 비
      if (this.rain) {
        c.globalCompositeOperation = 'source-over';
        c.strokeStyle = 'rgba(190,210,225,0.25)';
        c.lineWidth = Math.max(1, this.k);
        c.beginPath();
        for (const d of this.drops) {
          d.y += d.v * dt; d.x += d.v * dt * 0.18;
          if (d.y > 1.05) Object.assign(d, this.newDrop(false));
          const x = d.x * W, y = d.y * H;
          c.moveTo(x, y); c.lineTo(x - d.l * H * 0.18, y - d.l * H);
        }
        c.stroke();
      }
    }
  }
  Art.Stage = Stage;
})(window.TL);
