/* 탱고 레테 — 소리
 * 모든 소리는 WebAudio로 합성한다(파일 없음). 브라우저 정책 때문에 첫 입력(아무 키나 누르세요) 뒤에 켜진다.
 *  - 배경음: 장소마다 파도·바람·비·웅성거림·실내 공기 같은 소리 층
 *  - 음악: 타이틀과 무도장 밤의 드문드문한 오르골 선율 (A 단조 5음 음계, 긴 잔향)
 *  - 효과음: 버튼, 주사위, 성공/실패, 레벨 업, 물건, 사고
 *
 * 소리가 깨지지 않게
 *  - 잡음 버퍼: 분홍 잡음을 두 바퀴 걸러 끝이 처음과 매끄럽게 이어지게 한다(반복 이음매에서 '툭' 하지 않는다).
 *    직류와 40Hz 아래 초저역은 버퍼에서부터 빼고, 층마다 다른 지점에서 재생해 같은 잡음이 겹쳐 커지지 않게 한다.
 *  - 마스터: 음량 → 초저역 차단(35Hz) → 리미터. 들리지 않는 저역이 작은 스피커를 떨게 해 찢어지는 소리를 내거나,
 *    소리가 겹쳐 0dBFS를 넘는 일이 없다.
 *  - 예약: 효과음은 오디오 시계로 조금 앞서 넣어 시작 엔벌로프가 잘리지 않게 하고, 배경의 가끔 나는 소리와 선율은
 *    오디오 시계 기준 예약기(pump)가 넣는다. 타이머가 늦거나 탭이 숨었다 돌아와도 몰려 나오지 않는다.
 *  - 같은 효과음이 너무 촘촘하면 건너뛰고, 여러 효과음이 한꺼번에 나면 조금씩 줄인다.
 *  - 소리 문맥은 여유 있는 버퍼(latencyHint 'playback')로 만들어 느린 기기에서 끊기지 않게 한다.
 *    느린 기기의 오디오 스레드를 아끼려고, 파도·바람·웅성거림의 흔들림은 저주파 발진기 대신 예약기가 k-rate 값을
 *    천천히 옮기고(마구 흔들리는 목표값), 잔향은 모노 임펄스에 짧은 지연을 더해 좌우로 벌린다.
 * tools/audiocheck.mjs 가 모든 배경음과 효과음을 오프라인으로 렌더해 이것들을 검사한다.
 */
(function (TL) {
  'use strict';
  const AC = window.AudioContext || window.webkitAudioContext;
  const LEAD = 0.03;  // 효과음을 오디오 시계로 얼마나 앞서 넣나(초)
  const AHEAD = 0.5;  // 배경 사건과 선율을 얼마나 앞까지 미리 넣나(초)

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
  /* 층 이름 → 만드는 함수, 가끔 나는 소리 → 1초마다 날 확률.
   * 층 함수가 끝에서 곱하는 배수(v * 1.75 따위)는 위 BEDS 값이 예전과 같은 음량 균형(K-가중 음량)으로 들리게 맞춘 보정값 */
  const LAYERS = [['sea', 'sea'], ['wind', 'wind'], ['rain', 'rainL'], ['room', 'roomTone'], ['murmur', 'murmur'], ['water', 'trickle'], ['deep', 'deep']];
  const EVENTS = [['gulls', 'gull', 0.25], ['horn', 'horn', 0.06], ['drip', 'drip', 0.5], ['tick', 'tick', 1], ['crabs', 'crabs', 0.4], ['bubbles', 'bubble', 0.5], ['radio', 'radio', 0.12]];
  /* 설정 음량 1일 때의 버스 음량. 효과음은 배경음에 묻히지 않게 예전보다 6dB 크게 */
  const LEVEL = { master: 0.9, music: 0.5, amb: 0.55, sfx: 1.2 };
  /* 같은 효과음을 다시 내기까지의 최소 간격(초) */
  const GAP = { hover: 0.06 };

  const A = TL.audio = {
    ctx: null, ok: false,
    vol: { master: 0.7, music: 0.6, amb: 0.7, sfx: 0.75 },
    want: null,
    layers: {},
    evList: [], evNext: 0, music: 0, musNext: 0,
    last: {}, recent: [],
    init(vol) { Object.assign(this.vol, vol || {}); },
    /* 사용자 입력마다 불러도 된다: 처음이면 소리를 만들고, 멈춰 있으면(모바일의 탭 전환·전화 뒤) 다시 깨운다 */
    unlock() {
      if (!AC || this.dead) return;
      if (!this.ctx) {
        try { this.build(this.create()); } catch (e) {
          // 이 브라우저에서는 소리를 만들 수 없다: 소리 없이 계속한다
          this.dead = true; this.ok = false;
          try { if (this.ctx && this.ctx.close) this.ctx.close(); } catch (e2) { /* 무시 */ }
          this.ctx = null;
          return;
        }
      }
      const c = this.ctx;
      if (c.state !== 'running' && c.state !== 'closed' && c.resume) {
        try { const p = c.resume(); if (p && p.catch) p.catch(() => { /* 입력 밖에서는 거절될 수 있다 */ }); } catch (e) { /* 다음 입력에서 다시 */ }
      }
      this.ok = true;
      if (this.want) { const w = this.want; this.want = null; this.bed(w); }
    },
    create() {
      try { return new AC({ latencyHint: 'playback' }); } catch (e) { return new AC(); }
    },
    build(c) {
      this.ctx = c;
      // 옛 iOS: 입력 처리 안에서 무음을 한 번 재생해야 소리가 풀린다
      const s = c.createBufferSource(); s.buffer = c.createBuffer(1, 1, c.sampleRate); s.connect(c.destination); s.start(0);
      this.master = c.createGain();
      const hp = this.filt('highpass', 35, 0.7), lim = c.createDynamicsCompressor();
      lim.threshold.value = -8; lim.knee.value = 4; lim.ratio.value = 16; lim.attack.value = 0.002; lim.release.value = 0.2;
      this.master.connect(hp); hp.connect(lim); lim.connect(c.destination);
      // 잔향: 모노 임펄스, 오른쪽만 17ms 늦춰 좌우로 벌린다. 버스마다 보내기를 따로 두어 음량 설정이 잔향에도 걸린다
      this.verb = c.createConvolver(); this.verb.buffer = this.impulse(2.4);
      const vin = this.filt('highpass', 180, 0.7), vm = c.createChannelMerger(2), vd = c.createDelay(0.05), vout = c.createGain();
      vd.delayTime.value = 0.017; vout.gain.value = 0.5;
      vin.connect(this.verb); this.verb.connect(vm, 0, 0); this.verb.connect(vd); vd.connect(vm, 0, 1); vm.connect(vout); vout.connect(this.master);
      this.bus = {}; this.send = {};
      for (const k of ['music', 'amb', 'sfx']) {
        this.bus[k] = c.createGain(); this.bus[k].connect(this.master);
        this.send[k] = c.createGain(); this.send[k].connect(vin);
      }
      // 가끔 나는 소리를 놓을 자리: 왼쪽부터 오른쪽까지 다섯 곳 (소리마다 새 패너를 만들지 않는다)
      this.spots = [-0.6, -0.3, 0, 0.3, 0.6].map(x => { const p = this.pan(x); p.connect(this.bus.amb); return p; });
      this.noise = this.pinkBuf(8);
      // 여러 사인을 한 발진기로: 오르골(1·2·3배음), 실내 험(58·116Hz), 물속 저음(27.5Hz의 2·3·4·6배음 = 55·82·110·165Hz)
      this.waves = { box: this.wave([0, 1, 0.22, 0.08]), hum: this.wave([0, 1, 0.4]), deep: this.wave([0, 0, 1, 0.5, 0.31, 0, 0.12]) };
      this.applyVol();
      this.pumpT = setInterval(() => this.pump(), 120);
    },
    wave(amps) {
      const real = new Float32Array(amps.length), imag = new Float32Array(amps);
      try { return this.ctx.createPeriodicWave(real, imag, { disableNormalization: true }); } catch (e) { return this.ctx.createPeriodicWave(real, imag); }
    },
    applyVol() {
      if (!this.ctx) return;
      const t = this.ctx.currentTime, v = this.vol;
      this.master.gain.setTargetAtTime(v.master * LEVEL.master, t, 0.05);
      for (const k of ['music', 'amb', 'sfx']) {
        this.bus[k].gain.setTargetAtTime(v[k] * LEVEL[k], t, 0.05);
        this.send[k].gain.setTargetAtTime(v[k] * LEVEL[k], t, 0.05);
      }
    },
    setVol(k, v) { this.vol[k] = v; this.applyVol(); },
    /* 잔향 임펄스: 잡음이 지수로 사그라들고, 높은 소리가 먼저 죽는다 */
    impulse(sec) {
      const c = this.ctx, sr = c.sampleRate, n = Math.floor(sr * sec), b = c.createBuffer(1, n, sr), d = b.getChannelData(0);
      let lp = 0;
      for (let i = 0; i < n; i++) {
        const t = i / sr;
        lp += (0.1 + 0.88 * Math.exp(-t * 2.5)) * (Math.random() * 2 - 1 - lp);
        d[i] = lp * Math.exp(-6.9 * t / sec) * Math.min(1, i / (sr * 0.004));
      }
      return b;
    },
    /* 이음매 없이 반복되는 분홍 잡음(폴 켈렛 필터). 같은 백색 잡음을 두 바퀴 걸러, 둘째 바퀴의 처음이 첫 바퀴의 끝에서
     * 이어지게 한다(버퍼를 반복해도 필터 상태가 끊기지 않는다). 직류 차단(약 40Hz 아래를 누른다)도 같이 두 바퀴.
     * 끝으로 평균을 빼고 실효값을 0.25로 맞춘다. */
    pinkBuf(sec) {
      const c = this.ctx, n = Math.floor(c.sampleRate * sec), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
      const w = new Float32Array(n);
      for (let i = 0; i < n; i++) w[i] = Math.random() * 2 - 1;
      const R = 1 - 250 / c.sampleRate;
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, x1 = 0, y1 = 0;
      for (let pass = 0; pass < 2; pass++) {
        for (let i = 0; i < n; i++) {
          const x = w[i];
          b0 = 0.99886 * b0 + x * 0.0555179; b1 = 0.99332 * b1 + x * 0.0750759; b2 = 0.969 * b2 + x * 0.153852;
          b3 = 0.8665 * b3 + x * 0.3104856; b4 = 0.55 * b4 + x * 0.5329522; b5 = -0.7616 * b5 - x * 0.016898;
          const p = b0 + b1 + b2 + b3 + b4 + b5 + b6 + x * 0.5362;
          b6 = x * 0.115926;
          y1 = p - x1 + R * y1; x1 = p;
          if (pass) d[i] = y1;
        }
      }
      let m = 0, e = 0;
      for (let i = 0; i < n; i++) m += d[i];
      m /= n;
      for (let i = 0; i < n; i++) { d[i] -= m; e += d[i] * d[i]; }
      const k = 0.25 / Math.sqrt(e / n);
      for (let i = 0; i < n; i++) d[i] *= k;
      return b;
    },
    /* 반복 잡음: 층마다 버퍼의 다른 지점에서 시작한다 */
    loop() {
      const s = this.ctx.createBufferSource(); s.buffer = this.noise; s.loop = true;
      s.start(this.ctx.currentTime, Math.random() * this.noise.duration);
      return s;
    },
    filt(type, f, q) { const b = this.ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; if (q !== undefined) b.Q.value = q; return b; },
    /* 천천히 제멋대로 흔들리는 값: 예약기가 tmin~tmax초마다 lo~hi 사이의 새 목표를 정하고 부드럽게 따라가게 한다.
     * alt면 높은 목표와 낮은 목표를 번갈아(파도처럼 부풀었다 가라앉게). 값은 렌더 묶음마다 한 번만 계산(k-rate) */
    mod(p, lo, hi, tmin, tmax, alt) {
      try { p.automationRate = 'k-rate'; } catch (e) { /* 지원하지 않으면 그대로 */ }
      p.value = (lo + hi) / 2;
      return { p, lo, hi, tmin, tmax, alt, up: false, next: this.ctx.currentTime };
    },
    pan(x) {
      const c = this.ctx;
      if (!c.createStereoPanner) return c.createGain();
      const p = c.createStereoPanner(); p.pan.value = x; return p;
    },
    env(p, t0, a, d, peak) { p.setValueAtTime(0, t0); p.linearRampToValueAtTime(peak, t0 + a); p.exponentialRampToValueAtTime(0.0001, t0 + a + d); },

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
      try { this.lay(BEDS[key] || {}); } catch (e) { /* 소리 때문에 게임이 멈추지 않게 */ }
    },
    lay(spec) {
      const t = this.ctx.currentTime;
      // 이전 층은 서서히 끄고, 다 꺼진 뒤 오디오 시계로 멈춘다
      for (const k in this.layers) {
        const L = this.layers[k];
        L.g.gain.setTargetAtTime(0, t, 0.9);
        for (const n of L.nodes) { try { n.stop(t + 6); } catch (e) { /* 이미 멈춤 */ } }
        L.nodes[0].onended = () => { try { L.g.disconnect(); } catch (e) { /* 무시 */ } };
      }
      this.layers = {};
      for (const [k, fn] of LAYERS) if (spec[k]) this.layers[k] = this[fn](spec[k]);
      this.evList = EVENTS.filter(([k]) => spec[k]).map(([, name, p]) => [name, p]);
      this.evNext = t + 0.5;
      this.music = spec.music || 0;
      this.musNext = t + 1.2;
      this.pump();
    },
    layer(nodes, g, vol, mods) {
      g.gain.value = 0; g.gain.setTargetAtTime(vol, this.ctx.currentTime, 1.2);
      g.connect(this.bus.amb);
      return { g, nodes, mods: mods || [] };
    },
    /* 오디오 시계로 앞으로 얼마간(AHEAD초, 타이머가 늦게 불리면 그 간격만큼 더) 날 배경 사건과 선율, 흔들림을 넣는다.
     * 늦어서 이미 지난 칸은 건너뛴다 */
    pump() {
      if (!this.ctx) return;
      const now = this.ctx.currentTime, gap = now - (this.pumped === undefined ? now : this.pumped);
      this.pumped = now;
      try { this.schedule(now, now + Math.min(3, Math.max(AHEAD, gap * 1.5))); } catch (e) { /* 다음 차례에 다시 */ }
    },
    schedule(now, end) {
      if (this.evNext < now - 1) this.evNext = now;
      while (this.evList.length && this.evNext < end) {
        const t = this.evNext; this.evNext += 1;
        if (t < now) continue;
        for (const [name, p] of this.evList) if (Math.random() < p) this.ev(name, t);
      }
      if (this.musNext < now - 1) this.musNext = now + 0.3;
      while (this.music && this.musNext < end) {
        const t = this.musNext; this.musNext += 2.4 + Math.random() * 3.2;
        if (t >= now) this.phrase(t);
      }
      for (const k in this.layers) {
        for (const m of this.layers[k].mods) {
          if (m.next < now - 1) m.next = now;
          while (m.next < end) {
            const dt = m.tmin + Math.random() * (m.tmax - m.tmin);
            let x = Math.random();
            if (m.alt) { m.up = !m.up; x = m.up ? 0.7 + 0.3 * x : 0.3 * x; }
            m.p.setTargetAtTime(m.lo + x * (m.hi - m.lo), Math.max(m.next, now), dt * 0.4);
            m.next += dt;
          }
        }
      }
    },
    /* 파도: 좌우에 따로 부풀었다 가라앉는 두 물결. 낮은 쏴아 소리와 부서지는 거품 소리가 함께 부푼다 */
    sea(v) {
      const c = this.ctx, g = c.createGain(), nodes = [], mods = [];
      for (const p of [-0.6, 0.6]) {
        const s = this.loop(), lp = this.filt('lowpass', 650, 0.5), bp = this.filt('bandpass', 1500, 0.7), foam = c.createGain(), swell = c.createGain(), pn = this.pan(p);
        foam.gain.value = 0.3;
        s.connect(lp); lp.connect(swell); s.connect(bp); bp.connect(foam); foam.connect(swell); swell.connect(pn); pn.connect(g);
        nodes.push(s); mods.push(this.mod(swell.gain, 0.2, 1, 3, 6, true));
      }
      return this.layer(nodes, g, v * 1.75, mods);
    },
    /* 바람: 가운데 높이가 천천히 떠도는 띠 잡음 둘, 제멋대로 돌풍처럼 부푼다 */
    wind(v) {
      const c = this.ctx, g = c.createGain(), nodes = [], mods = [];
      for (const p of [-0.6, 0.6]) {
        const s = this.loop(), bp = this.filt('bandpass', 700, 1.2), gust = c.createGain(), pn = this.pan(p);
        s.connect(bp); bp.connect(gust); gust.connect(pn); pn.connect(g);
        nodes.push(s); mods.push(this.mod(bp.frequency, 380, 1050, 2, 5), this.mod(gust.gain, 0.3, 1, 1.5, 4));
      }
      return this.layer(nodes, g, v * 1.55, mods);
    },
    rainL(v) {
      const c = this.ctx, g = c.createGain(), nodes = [];
      for (const p of [-0.6, 0.6]) {
        const s = this.loop(), hp = this.filt('highpass', 1600, 0.6), lp = this.filt('lowpass', 8000, 0.5), pn = this.pan(p);
        s.connect(hp); hp.connect(lp); lp.connect(pn); pn.connect(g);
        nodes.push(s);
      }
      return this.layer(nodes, g, v * 0.34);
    },
    /* 실내 공기: 낮게 웅웅거리는 잡음과 전기 험 */
    roomTone(v) {
      const c = this.ctx, g = c.createGain(), s = this.loop(), lp = this.filt('lowpass', 320, 0.6), o = c.createOscillator(), og = c.createGain();
      o.setPeriodicWave(this.waves.hum); o.frequency.value = 58; og.gain.value = 0.05;
      s.connect(lp); lp.connect(g); o.connect(og); og.connect(g); o.start();
      return this.layer([s, o], g, v * 1.08);
    },
    /* 웅성거림: 높이가 다른 두 목소리 띠가 제각기 불규칙하게 오르내린다 */
    murmur(v) {
      const c = this.ctx, g = c.createGain(), nodes = [], mods = [];
      for (const [f, q, lo, hi] of [[380, 1.3, 300, 470], [820, 1.6, 680, 980]]) {
        const s = this.loop(), bp = this.filt('bandpass', f, q), am = c.createGain();
        s.connect(bp); bp.connect(am); am.connect(g);
        nodes.push(s); mods.push(this.mod(am.gain, 0.35, 0.85, 0.3, 1.1), this.mod(bp.frequency, lo, hi, 0.8, 2));
      }
      return this.layer(nodes, g, v, mods);
    },
    /* 분수: 물이 수반에 떨어지며 졸졸거리는 소리. 띠 잡음 둘의 높이가 짧게 불규칙하게 흔들린다 */
    trickle(v) {
      const c = this.ctx, g = c.createGain(), nodes = [], mods = [];
      for (const [f, q, lo, hi, tmin, tmax] of [[1700, 1.2, 1350, 2150, 0.12, 0.45], [3100, 2.2, 2500, 3900, 0.08, 0.3]]) {
        const s = this.loop(), bp = this.filt('bandpass', f, q);
        s.connect(bp); bp.connect(g);
        nodes.push(s); mods.push(this.mod(bp.frequency, lo, hi, tmin, tmax));
      }
      return this.layer(nodes, g, v * 0.35, mods);
    },
    /* 물속 같은 저음: 작은 스피커에서도 들리도록 배음을 두고, 110Hz 근처의 한 음이 느리게 맥놀이한다 */
    deep(v) {
      const c = this.ctx, g = c.createGain(), o = c.createOscillator(), og = c.createGain(), b = c.createOscillator(), bg = c.createGain();
      o.setPeriodicWave(this.waves.deep); o.frequency.value = 27.47; og.gain.value = 0.32;
      b.frequency.value = 110.35; bg.gain.value = 0.08;
      o.connect(og); og.connect(g); b.connect(bg); bg.connect(g); o.start(); b.start();
      const s = this.loop(), lp = this.filt('lowpass', 220, 0.6), ng = c.createGain();
      s.connect(lp); lp.connect(ng); ng.connect(g);
      return this.layer([o, b, s], g, v * 0.56, [this.mod(ng.gain, 0.5, 1.1, 4, 8)]);
    },
    /* 가끔 들리는 소리. t: 1초 칸의 시작(오디오 시계). 똑딱 소리 말고는 칸 안 아무 때나, 다섯 자리 중 아무 데서나 */
    ev(name, t) {
      const c = this.ctx;
      if (t === undefined) t = c.currentTime + LEAD;
      if (name !== 'tick') t += Math.random() * 0.9;
      const out = this.spots[name === 'tick' ? 3 : name === 'horn' ? 2 : Math.floor(Math.random() * 5)];
      if (name === 'gull') {
        const n = 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < n; i++) {
          const o = c.createOscillator(), bp = this.filt('bandpass', 1700, 3), g = c.createGain(), t0 = t + i * 0.28, f0 = 1500 + Math.random() * 500;
          o.type = 'sawtooth'; o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(f0 * 0.62, t0 + 0.22);
          this.env(g.gain, t0, 0.03, 0.22, 0.03);
          o.connect(bp); bp.connect(g); g.connect(out); o.start(t0); o.stop(t0 + 0.3);
        }
      } else if (name === 'horn') {
        const g = c.createGain(), f = this.filt('lowpass', 300);
        for (const fr of [73, 73.8, 110]) { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = fr; o.connect(f); o.start(t); o.stop(t + 4.2); }
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.032, t + 0.6); g.gain.setValueAtTime(0.032, t + 2.8); g.gain.linearRampToValueAtTime(0, t + 4);
        f.connect(g); g.connect(out); g.connect(this.send.amb);
      } else if (name === 'drip' || name === 'bubble' || name === 'tick' || name === 'crabs') {
        const reps = name === 'crabs' ? 3 + Math.floor(Math.random() * 5) : 1;
        for (let i = 0; i < reps; i++) {
          const o = c.createOscillator(), g = c.createGain(), t0 = t + i * 0.05;
          const fr = name === 'tick' ? 2200 : name === 'crabs' ? 3000 + Math.random() * 1500 : name === 'bubble' ? 300 + Math.random() * 400 : 900 + Math.random() * 700;
          o.type = name === 'bubble' ? 'sine' : 'triangle';
          o.frequency.setValueAtTime(fr, t0); if (name !== 'tick') o.frequency.exponentialRampToValueAtTime(fr * (name === 'bubble' ? 2.2 : 1.6), t0 + 0.06);
          const pk = name === 'tick' ? 0.02 : name === 'crabs' ? 0.012 : 0.035;
          this.env(g.gain, t0, 0.004, name === 'tick' ? 0.026 : 0.086, pk);
          o.connect(g); g.connect(out); if (name === 'drip') g.connect(this.send.amb); o.start(t0); o.stop(t0 + 0.12);
        }
      } else if (name === 'radio') {
        const s = c.createBufferSource(), f = this.filt('bandpass', 2600, 0.8), g = c.createGain();
        s.buffer = this.noise; s.connect(f); f.connect(g); g.connect(out);
        this.env(g.gain, t, 0.02, 0.6 + Math.random(), 0.08);
        s.start(t, Math.random() * 6); s.stop(t + 2);
      }
    },
    /* 오르골 선율: A 단조 5음 음계에서 드문드문 */
    phrase(t) {
      const scale = [57, 60, 62, 64, 67, 69, 72, 74, 76];
      const n = 1 + Math.floor(Math.random() * 3);
      let idx = Math.floor(Math.random() * 5) + 2;
      for (let i = 0; i < n; i++) {
        idx = Math.max(0, Math.min(scale.length - 1, idx + Math.floor(Math.random() * 3) - 1));
        this.pluck(scale[idx], t + i * (0.42 + Math.random() * 0.2), 0.05 * this.music * (0.6 + Math.random() * 0.4));
      }
      if (Math.random() < 0.3) this.pluck(45, t, 0.05 * this.music, 4);
    },
    pluck(midi, t, vol, dur = 2.6) {
      const c = this.ctx, o = c.createOscillator(), g = c.createGain();
      o.setPeriodicWave(this.waves.box); o.frequency.value = 440 * Math.pow(2, (midi - 69) / 12);
      this.env(g.gain, t, 0.01, dur - 0.01, vol);
      o.connect(g); g.connect(this.bus.music); g.connect(this.send.music); o.start(t); o.stop(t + dur + 0.1);
    },

    /* ───────── 효과음 ───────── */
    play(name) {
      if (!this.ok || !this.ctx) return;
      try { this.sfx(name); } catch (e) { /* 소리 때문에 게임이 멈추지 않게 */ }
    },
    sfx(name) {
      const c = this.ctx, now = c.currentTime;
      if (now - (this.last[name] === undefined ? -9 : this.last[name]) < (GAP[name] || 0.035)) return;
      this.last[name] = now;
      this.recent = this.recent.filter(x => now - x < 0.09);
      this.recent.push(now);
      const out = c.createGain();
      out.gain.value = 1 / Math.sqrt(this.recent.length);
      out.connect(this.bus.sfx);
      const t = now + LEAD;
      const tone = (fr, t0, dur, vol, type = 'sine', to) => {
        const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(fr, t0);
        if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + dur);
        this.env(g.gain, t0, 0.006, dur - 0.006, vol);
        o.connect(g); g.connect(out); o.start(t0); o.stop(t0 + dur + 0.05);
      };
      const burst = (t0, dur, freq, q, vol) => {
        const s = c.createBufferSource(), f = this.filt('bandpass', freq, q), g = c.createGain();
        s.buffer = this.noise;
        this.env(g.gain, t0, 0.0015, dur - 0.0015, vol);
        s.connect(f); f.connect(g); g.connect(out); s.start(t0, Math.random() * 6); s.stop(t0 + dur + 0.02);
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
        case 'hurt': tone(90, t, 0.4, 0.13, 'sine', 50); tone(180, t, 0.3, 0.05, 'sine', 100); burst(t, 0.2, 400, 0.6, 0.3); break;
        case 'heal': tone(523.3, t, 0.5, 0.04); tone(784, t + 0.1, 0.6, 0.035); break;
        case 'money': tone(1760, t, 0.08, 0.04, 'square'); tone(2637, t + 0.06, 0.18, 0.03, 'square'); break;
        case 'travel': burst(t, 0.9, 500, 0.4, 0.08); break;
        case 'start': tone(110, t, 2.2, 0.1, 'sine', 55); burst(t, 1.4, 300, 0.4, 0.15); break;
        default: break;
      }
    },
  };
})(window.TL);
