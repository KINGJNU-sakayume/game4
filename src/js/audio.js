/* 탱고 레테 — 소리
 * 모든 소리는 WebAudio로 합성한다(파일 없음). 브라우저 정책 때문에 첫 입력(아무 키나 누르세요) 뒤에 켜진다.
 *  - 배경음: 장소마다 파도·바람·비·웅성거림·실내 공기 같은 소리 층
 *  - 음악: 타이틀과 무도장 밤의 드문드문한 오르골 선율 (A 단조 5음 음계, 긴 잔향)
 *  - 효과음: 버튼, 주사위, 성공/실패, 레벨 업, 물건, 사고
 */
(function (TL) {
  'use strict';
  const AC = window.AudioContext || window.webkitAudioContext;

  /* 장소별 소리 층 */
  const BEDS = {
    harbor: { sea: 0.5, wind: 0.18, gulls: true, horn: true },
    harbor_n: { sea: 0.45, wind: 0.22, horn: true, murmur: 0.05 },
    street: { sea: 0.28, wind: 0.14, murmur: 0.12, gulls: true },
    street_n: { sea: 0.22, wind: 0.16, murmur: 0.1, music: 0.35 },
    alley: { wind: 0.22, drip: true, murmur: 0.04 },
    hall: { room: 0.25, water: 0.18 },
    hall_n: { room: 0.2, murmur: 0.32, music: 0.9, water: 0.1 },
    room: { room: 0.3, tick: true },
    room_n: { room: 0.25, tick: true, music: 0.4 },
    lobby: { room: 0.25, tick: true, murmur: 0.08 },
    factory: { room: 0.35, murmur: 0.3, drip: true },
    church: { wind: 0.4, drip: true },
    church_n: { wind: 0.35, radio: true },
    shop: { room: 0.3, tick: true },
    yard: { wind: 0.2, murmur: 0.2 },
    yard_n: { wind: 0.2, murmur: 0.08 },
    roof: { wind: 0.45, sea: 0.2, gulls: true },
    roof_n: { wind: 0.4, sea: 0.18, music: 0.3 },
    coast: { sea: 0.6, wind: 0.4, gulls: true },
    coast_n: { sea: 0.55, wind: 0.42 },
    flats: { wind: 0.5, sea: 0.12, crabs: true, gulls: true },
    fort: { wind: 0.55, sea: 0.3, gulls: true },
    void: { deep: 0.6, bubbles: true },
    title: { sea: 0.35, wind: 0.2, rain: 0.35, horn: true, music: 1 },
    silent: {},
  };
  const ART_BED = {
    quay: 'street', crane: 'harbor', backyard: 'alley', hall: 'hall', room: 'room', room305: 'room', hotel: 'lobby',
    cannery: 'factory', pawn: 'shop', church: 'church', honeycomb: 'yard', roof: 'roof', breakwater: 'coast',
    flats: 'flats', fort: 'fort', void: 'void', title: 'title',
  };

  const A = TL.audio = {
    ctx: null, ok: false,
    vol: { master: 0.7, music: 0.6, amb: 0.7, sfx: 0.75 },
    want: null,
    layers: {},
    init(vol) { Object.assign(this.vol, vol || {}); },
    /* 첫 사용자 입력에서 호출 */
    unlock() {
      if (!AC) return;
      try {
        if (!this.ctx) this.build();
        if (this.ctx.state === 'suspended') this.ctx.resume();
        this.ok = true;
        if (this.want) { const w = this.want; this.want = null; this.bed(w); }
      } catch (e) { this.ok = false; }
    },
    build() {
      const c = this.ctx = new AC();
      this.master = c.createGain(); this.master.connect(c.destination);
      this.bus = {};
      for (const k of ['music', 'amb', 'sfx']) { this.bus[k] = c.createGain(); this.bus[k].connect(this.master); }
      this.verb = c.createConvolver(); this.verb.buffer = this.impulse(3.2, 2.4);
      this.verbOut = c.createGain(); this.verbOut.gain.value = 0.55;
      this.verb.connect(this.verbOut); this.verbOut.connect(this.bus.music);
      this.noise = this.noiseBuf(4);
      this.applyVol();
    },
    applyVol() {
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      this.master.gain.setTargetAtTime(this.vol.master * 0.9, t, 0.05);
      this.bus.music.gain.setTargetAtTime(this.vol.music * 0.5, t, 0.05);
      this.bus.amb.gain.setTargetAtTime(this.vol.amb * 0.55, t, 0.05);
      this.bus.sfx.gain.setTargetAtTime(this.vol.sfx * 0.6, t, 0.05);
    },
    setVol(k, v) { this.vol[k] = v; this.applyVol(); },
    impulse(sec, decay) {
      const c = this.ctx, n = Math.floor(c.sampleRate * sec), b = c.createBuffer(2, n, c.sampleRate);
      for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay); }
      return b;
    },
    noiseBuf(sec) {
      const c = this.ctx, n = Math.floor(c.sampleRate * sec), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0; // 분홍 잡음에 가깝게
      for (let i = 0; i < n; i++) { const w = Math.random() * 2 - 1; b0 = 0.997 * b0 + w * 0.029; b1 = 0.985 * b1 + w * 0.032; b2 = 0.95 * b2 + w * 0.048; d[i] = (b0 + b1 + b2 + w * 0.02) * 1.6; }
      return b;
    },
    src(loop = true) { const s = this.ctx.createBufferSource(); s.buffer = this.noise; s.loop = loop; s.loopStart = Math.random(); return s; },

    /* ───────── 배경음 ───────── */
    scene(art, night) {
      const base = ART_BED[art] || 'room';
      const key = BEDS[base + (night ? '_n' : '')] ? base + (night ? '_n' : '') : base;
      this.bed(key);
    },
    bed(key) {
      if (!this.ok) { this.want = key; return; }
      if (this.bedKey === key) return;
      this.bedKey = key;
      const spec = BEDS[key] || {};
      const t = this.ctx.currentTime;
      // 이전 층을 서서히 끈다
      for (const k in this.layers) { const L = this.layers[k]; L.g.gain.setTargetAtTime(0, t, 0.9); setTimeout(() => L.stop(), 5000); }
      this.layers = {};
      clearInterval(this.evT); clearTimeout(this.musT);
      if (spec.sea) this.layers.sea = this.sea(spec.sea);
      if (spec.wind) this.layers.wind = this.wind(spec.wind);
      if (spec.rain) this.layers.rain = this.rainL(spec.rain);
      if (spec.room) this.layers.room = this.roomTone(spec.room);
      if (spec.murmur) this.layers.murmur = this.murmur(spec.murmur);
      if (spec.water) this.layers.water = this.trickle(spec.water);
      if (spec.deep) this.layers.deep = this.deep(spec.deep);
      this.music = spec.music || 0;
      if (this.music) this.melody();
      const ev = [];
      if (spec.gulls) ev.push(['gull', 0.25]);
      if (spec.horn) ev.push(['horn', 0.06]);
      if (spec.drip) ev.push(['drip', 0.5]);
      if (spec.tick) ev.push(['tick', 1]);
      if (spec.crabs) ev.push(['crabs', 0.4]);
      if (spec.bubbles) ev.push(['bubble', 0.5]);
      if (spec.radio) ev.push(['radio', 0.12]);
      if (ev.length) this.evT = setInterval(() => { for (const [name, p] of ev) if (Math.random() < p) this.ev(name); }, 1000);
    },
    layer(nodes, g, vol) {
      const t = this.ctx.currentTime;
      g.gain.value = 0; g.gain.setTargetAtTime(vol, t, 1.2);
      g.connect(this.bus.amb);
      return { g, stop: () => { for (const n of nodes) { try { n.stop(); } catch (e) { /* 이미 멈춤 */ } } try { g.disconnect(); } catch (e) { /* 무시 */ } } };
    },
    sea(v) {
      const c = this.ctx, s = this.src(), f = c.createBiquadFilter(), g = c.createGain(), am = c.createGain(), lfo = c.createOscillator(), lg = c.createGain();
      f.type = 'lowpass'; f.frequency.value = 520; f.Q.value = 0.3;
      lfo.frequency.value = 0.11; lg.gain.value = 0.45; am.gain.value = 0.6;
      lfo.connect(lg); lg.connect(am.gain);
      s.connect(f); f.connect(am); am.connect(g);
      s.start(); lfo.start();
      return this.layer([s, lfo], g, v);
    },
    wind(v) {
      const c = this.ctx, s = this.src(), f = c.createBiquadFilter(), g = c.createGain(), lfo = c.createOscillator(), lg = c.createGain();
      f.type = 'bandpass'; f.frequency.value = 700; f.Q.value = 0.9;
      lfo.frequency.value = 0.07; lg.gain.value = 380; lfo.connect(lg); lg.connect(f.frequency);
      s.connect(f); f.connect(g); s.start(); lfo.start();
      return this.layer([s, lfo], g, v * 0.8);
    },
    rainL(v) {
      const c = this.ctx, s = this.src(), f = c.createBiquadFilter(), f2 = c.createBiquadFilter(), g = c.createGain();
      f.type = 'highpass'; f.frequency.value = 1200; f2.type = 'lowpass'; f2.frequency.value = 7000;
      s.connect(f); f.connect(f2); f2.connect(g); s.start();
      return this.layer([s], g, v * 0.5);
    },
    roomTone(v) {
      const c = this.ctx, s = this.src(), f = c.createBiquadFilter(), g = c.createGain(), o = c.createOscillator(), og = c.createGain();
      f.type = 'lowpass'; f.frequency.value = 240; o.type = 'sine'; o.frequency.value = 58; og.gain.value = 0.05;
      s.connect(f); f.connect(g); o.connect(og); og.connect(g); s.start(); o.start();
      return this.layer([s, o], g, v * 0.7);
    },
    murmur(v) {
      const c = this.ctx, s = this.src(), f = c.createBiquadFilter(), g = c.createGain(), am = c.createGain(), lfo = c.createOscillator(), lg = c.createGain();
      f.type = 'bandpass'; f.frequency.value = 420; f.Q.value = 1.6;
      lfo.type = 'triangle'; lfo.frequency.value = 2.3; lg.gain.value = 0.35; am.gain.value = 0.65; lfo.connect(lg); lg.connect(am.gain);
      s.connect(f); f.connect(am); am.connect(g); s.start(); lfo.start();
      return this.layer([s, lfo], g, v);
    },
    trickle(v) {
      const c = this.ctx, s = this.src(), f = c.createBiquadFilter(), g = c.createGain(), am = c.createGain(), lfo = c.createOscillator(), lg = c.createGain();
      f.type = 'bandpass'; f.frequency.value = 2400; f.Q.value = 2;
      lfo.frequency.value = 9; lg.gain.value = 0.5; am.gain.value = 0.5; lfo.connect(lg); lg.connect(am.gain);
      s.connect(f); f.connect(am); am.connect(g); s.start(); lfo.start();
      return this.layer([s, lfo], g, v * 0.6);
    },
    deep(v) {
      const c = this.ctx, g = c.createGain(), nodes = [];
      for (const [fr, a] of [[49, 0.5], [73.4, 0.25], [98, 0.12]]) { const o = c.createOscillator(), og = c.createGain(); o.frequency.value = fr; og.gain.value = a; o.connect(og); og.connect(g); o.start(); nodes.push(o); }
      const s = this.src(), f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 180; s.connect(f); f.connect(g); s.start(); nodes.push(s);
      return this.layer(nodes, g, v * 0.5);
    },
    /* 가끔 들리는 소리 */
    ev(name) {
      const c = this.ctx, t = c.currentTime, out = this.bus.amb;
      const env = (g, a, d, peak) => { g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); };
      if (name === 'gull') {
        const n = 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < n; i++) {
          const o = c.createOscillator(), g = c.createGain(), t0 = t + i * 0.28;
          o.type = 'sawtooth'; const f0 = 1500 + Math.random() * 500;
          o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(f0 * 0.62, t0 + 0.22);
          const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1700; bp.Q.value = 3;
          g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(0.03, t0 + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.25);
          o.connect(bp); bp.connect(g); g.connect(out); o.start(t0); o.stop(t0 + 0.3);
        }
      } else if (name === 'horn') {
        const g = c.createGain(), f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 300;
        for (const fr of [73, 73.8, 110]) { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = fr; o.connect(f); o.start(t); o.stop(t + 4.2); }
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.05, t + 0.6); g.gain.setValueAtTime(0.05, t + 2.8); g.gain.linearRampToValueAtTime(0, t + 4);
        f.connect(g); g.connect(out); g.connect(this.verb);
      } else if (name === 'drip' || name === 'bubble' || name === 'tick' || name === 'crabs') {
        const reps = name === 'crabs' ? 3 + Math.floor(Math.random() * 5) : 1;
        for (let i = 0; i < reps; i++) {
          const o = c.createOscillator(), g = c.createGain(), t0 = t + (name === 'tick' ? 0 : Math.random() * 0.9) + i * 0.05;
          const fr = name === 'tick' ? 2200 : name === 'crabs' ? 3000 + Math.random() * 1500 : name === 'bubble' ? 300 + Math.random() * 400 : 900 + Math.random() * 700;
          o.type = name === 'bubble' ? 'sine' : 'triangle';
          o.frequency.setValueAtTime(fr, t0); if (name !== 'tick') o.frequency.exponentialRampToValueAtTime(fr * (name === 'bubble' ? 2.2 : 1.6), t0 + 0.06);
          const pk = name === 'tick' ? 0.02 : name === 'crabs' ? 0.012 : 0.035;
          g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(pk, t0 + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t0 + (name === 'tick' ? 0.03 : 0.09));
          o.connect(g); g.connect(out); if (name === 'drip') g.connect(this.verb); o.start(t0); o.stop(t0 + 0.12);
        }
      } else if (name === 'radio') {
        const s = this.src(false), f = c.createBiquadFilter(), g = c.createGain();
        f.type = 'bandpass'; f.frequency.value = 2600; f.Q.value = 0.8; s.connect(f); f.connect(g); g.connect(out);
        env(g, 0.02, 0.6 + Math.random(), 0.08); s.start(t); s.stop(t + 2);
      }
    },
    /* 오르골 선율: A 단조 5음 음계에서 드문드문 */
    melody() {
      const step = () => {
        if (!this.music || !this.ok) return;
        const c = this.ctx, t = c.currentTime + 0.05;
        const scale = [57, 60, 62, 64, 67, 69, 72, 74, 76];
        const n = 1 + Math.floor(Math.random() * 3);
        let base = scale[Math.floor(Math.random() * 5) + 2];
        for (let i = 0; i < n; i++) {
          const idx = Math.max(0, Math.min(scale.length - 1, scale.indexOf(base) + Math.floor(Math.random() * 3) - 1));
          base = scale[idx];
          this.pluck(base, t + i * (0.42 + Math.random() * 0.2), 0.05 * this.music * (0.6 + Math.random() * 0.4));
        }
        if (Math.random() < 0.3) this.pluck(45, t, 0.05 * this.music, 4);
        this.musT = setTimeout(step, 2400 + Math.random() * 3200);
      };
      clearTimeout(this.musT);
      this.musT = setTimeout(step, 1200);
    },
    pluck(midi, t, vol, dur = 2.6) {
      const c = this.ctx, fr = 440 * Math.pow(2, (midi - 69) / 12), g = c.createGain();
      for (const [mul, a, type] of [[1, 1, 'sine'], [2, 0.22, 'sine'], [3, 0.08, 'triangle']]) {
        const o = c.createOscillator(), og = c.createGain(); o.type = type; o.frequency.value = fr * mul; og.gain.value = a;
        o.connect(og); og.connect(g); o.start(t); o.stop(t + dur + 0.1);
      }
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      g.connect(this.bus.music); g.connect(this.verb);
    },

    /* ───────── 효과음 ───────── */
    play(name) {
      if (!this.ok || !this.ctx) return;
      const c = this.ctx, t = c.currentTime, out = this.bus.sfx;
      const tone = (fr, t0, dur, vol, type = 'sine', to) => {
        const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(fr, t0);
        if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + dur);
        g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        o.connect(g); g.connect(out); o.start(t0); o.stop(t0 + dur + 0.05);
        return g;
      };
      const burst = (t0, dur, freq, q, vol) => {
        const s = this.src(false), f = c.createBiquadFilter(), g = c.createGain();
        f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
        g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        s.connect(f); f.connect(g); g.connect(out); s.start(t0, Math.random() * 2); s.stop(t0 + dur + 0.02);
      };
      switch (name) {
        case 'hover': tone(2400, t, 0.03, 0.025, 'triangle'); break;
        case 'click': burst(t, 0.05, 1400, 2, 0.25); tone(140, t, 0.08, 0.08); break;
        case 'choose': burst(t, 0.06, 900, 1.5, 0.22); tone(220, t, 0.12, 0.06, 'triangle'); break;
        case 'open': burst(t, 0.16, 2400, 0.7, 0.12); tone(420, t, 0.18, 0.03, 'sine', 620); break;
        case 'close': burst(t, 0.12, 1800, 0.7, 0.1); tone(560, t, 0.14, 0.03, 'sine', 360); break;
        case 'page': burst(t, 0.22, 3200, 0.5, 0.1); break;
        case 'dice':
          for (let i = 0; i < 7; i++) { const t0 = t + i * 0.07 + Math.random() * 0.04; burst(t0, 0.03, 2000 + Math.random() * 1800, 4, 0.28); }
          burst(t + 0.62, 0.04, 1500, 3, 0.35); burst(t + 0.7, 0.04, 1300, 3, 0.3);
          break;
        case 'ok': tone(659.3, t, 0.5, 0.08); tone(987.8, t + 0.12, 0.8, 0.07); tone(1318.5, t + 0.24, 1.0, 0.04); break;
        case 'fail': tone(220, t, 0.7, 0.09, 'triangle', 196); tone(233, t, 0.7, 0.05, 'triangle', 207); break;
        case 'crit': tone(523.3, t, 0.6, 0.07); tone(659.3, t + 0.1, 0.6, 0.07); tone(784, t + 0.2, 0.9, 0.07); tone(1046.5, t + 0.3, 1.2, 0.06); break;
        case 'level': [440, 523.3, 659.3, 880, 1046.5].forEach((f, i) => tone(f, t + i * 0.09, 0.9, 0.06)); break;
        case 'item': tone(1320, t, 0.12, 0.05, 'triangle', 1980); tone(1980, t + 0.07, 0.2, 0.035, 'triangle'); break;
        case 'task': tone(587.3, t, 0.4, 0.06); tone(880, t + 0.14, 0.6, 0.05); break;
        case 'thought': [392, 493.9, 587.3, 740].forEach((f, i) => tone(f, t + i * 0.06, 1.6, 0.03)); break;
        case 'hurt': tone(90, t, 0.4, 0.2, 'sine', 50); burst(t, 0.2, 400, 0.6, 0.3); break;
        case 'heal': tone(523.3, t, 0.5, 0.04); tone(784, t + 0.1, 0.6, 0.035); break;
        case 'money': tone(1760, t, 0.08, 0.04, 'square'); tone(2637, t + 0.06, 0.18, 0.03, 'square'); break;
        case 'travel': burst(t, 0.9, 500, 0.4, 0.08); break;
        case 'start': tone(110, t, 2.2, 0.1, 'sine', 55); burst(t, 1.4, 300, 0.4, 0.15); break;
        default: break;
      }
    },
  };
})(window.TL);
