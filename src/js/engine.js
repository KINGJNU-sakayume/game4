/* 탱고 레테 — 실행 엔진 (DOM 독립)
 * 게임 상태, 스크립트 실행, 선택지, 판정, 시간, 아이템, 사고, 과제, 저장/불러오기.
 */
(function (TL) {
  'use strict';
  const C = TL.content;
  const U = TL.util;

  const DIFFS = [[6, '사소함'], [8, '쉬움'], [10, '보통'], [12, '도전적'], [13, '어려움'], [14, '전설적'], [15, '영웅적'], [16, '신적'], [18, '불가능']];
  function diffName(d) {
    let n = DIFFS[0][1];
    for (const [v, nm] of DIFFS) if (d >= v) n = nm;
    return n;
  }
  function chanceOf(bonus, diff) {
    let ok = 0;
    for (let a = 1; a <= 6; a++) {
      for (let b = 1; b <= 6; b++) {
        if (a === 1 && b === 1) continue;
        if ((a === 6 && b === 6) || a + b + bonus >= diff) ok++;
      }
    }
    return ok / 36;
  }
  TL.diffName = diffName;
  TL.chanceOf = chanceOf;

  const MAX_STEPS = 20000;

  function newState(opts) {
    return {
      v: TL.SAVE_VERSION,
      archetype: opts.archetype || 'custom',
      attrs: Object.assign({ INT: 3, PSY: 3, FYS: 3, MOT: 3 }, opts.attrs || {}),
      learned: {},
      signature: opts.signature || null,
      xp: 0, level: 1, points: 0,
      hLoss: 0, mLoss: 0,
      money: 0,
      day: 1, min: 0,
      loc: null, art: 'void',
      vars: {},
      items: [], equip: {},
      thoughts: {}, slots: 3,
      tasks: {},
      checks: {},
      used: {},
      visits: {},
      events: {},
      buffs: [],
      stats: { checks: 0, checksOk: 0, deaths: 0, started: Date.now() },
    };
  }

  class Game {
    constructor() {
      this.s = null;
      this.log = [];
      this.seq = 0;
      this.prompt = null;
      this.cur = null;
      this.frames = [];
      this.halted = false;
      this.lastCheck = null;
      this.listeners = [];
      const g = this;
      this.fns = {
        pass: (lvl, diff) => lvl + 6 >= diff,
        chance: (p) => U.random() * 100 < p,
        min: Math.min, max: Math.max, abs: Math.abs,
      };
      this.api = {
        v: (name) => g.value(name),
        fn: (name) => g.fns[name],
      };
    }

    /* ---------- 이벤트 ---------- */
    on(fn) { this.listeners.push(fn); return () => { this.listeners = this.listeners.filter(f => f !== fn); }; }
    notify(type, data) { for (const f of this.listeners) f(type, data); }

    emit(e) {
      e.n = ++this.seq;
      this.log.push(e);
      if (this.log.length > 800) this.log.splice(0, this.log.length - 600);
      this.notify('entry', e);
    }
    note(kind, text) { this.emit({ k: 'note', kind, text }); }

    /* ---------- 새 게임 / 저장 ---------- */
    newGame(opts) {
      opts = opts || {};
      this.s = newState(opts);
      this.s.money = opts.money != null ? opts.money : 0;
      this.s.min = opts.startMin != null ? opts.startMin : 9 * 60 + 40;
      this.log = [];
      this.seq = 0;
      this.frames = [];
      this.halted = false;
      this.prompt = null;
      this.lastCheck = null;
      for (const id of (opts.items || [])) if (!this.s.items.includes(id)) this.s.items.push(id);
      for (const id of (opts.equip || [])) this.equip(id, true);
      if (opts.vars) Object.assign(this.s.vars, opts.vars);
      this.jumpNode(opts.start || 'intro');
      this.run();
      this.notify('update');
    }

    serialize() {
      return JSON.stringify({
        v: TL.SAVE_VERSION,
        game: 'tango-lethe',
        s: this.s,
        cur: this.cur,
        frames: this.frames,
        waiting: this.prompt ? this.prompt.type : null,
        ending: this.prompt && this.prompt.type === 'ending' ? this.prompt.id : null,
        log: this.log.slice(-160),
        seq: this.seq,
        when: Date.now(),
      });
    }

    load(data) {
      const d = typeof data === 'string' ? JSON.parse(data) : data;
      if (!d || d.game !== 'tango-lethe' || !d.s) throw new Error('탱고 레테 저장 파일이 아닙니다.');
      this.s = d.s;
      // 이전 버전 저장 호환
      const base = newState({});
      for (const k in base) if (this.s[k] === undefined) this.s[k] = base[k];
      this.cur = d.cur;
      this.frames = d.frames || [];
      this.log = d.log || [];
      this.seq = d.seq || this.log.length;
      this.halted = false;
      this.prompt = null;
      this.lastCheck = null;
      if (!this.cur || !C.blocks[this.cur.b]) {
        // 콘텐츠가 바뀌어 커서를 잃었다면 현재 장소로 복귀
        this.frames = [];
        const loc = C.nodes[this.s.loc];
        if (!loc) throw new Error('저장된 위치를 찾을 수 없습니다.');
        this.cur = { b: loc.block, i: loc.hubIndex };
      }
      if (d.waiting === 'continue') this.prompt = { type: 'continue' };
      else if (d.waiting === 'ending') { this.halted = true; this.prompt = { type: 'ending', id: d.ending }; }
      else this.run();
      this.notify('scene');
      this.notify('update');
    }

    /* ---------- 값 조회 ---------- */
    absTime() { return (this.s.day - 1) * 1440 + this.s.min; }
    clockMin() { return ((this.s.min % 1440) + 1440) % 1440; }
    hour() { return Math.floor(this.clockMin() / 60); }
    curNodeId() { const b = this.cur && C.blocks[this.cur.b]; return b ? b.node : null; }

    isLowTide(min) {
      if (min === undefined) min = this.s.min;
      const h = (((min % 1440) + 1440) % 1440) / 60;
      const shift = Math.max(0, this.s.day - 1);
      return (h >= 5 + shift && h < 10 + shift) || (h >= 17 + shift && h < 21 + shift);
    }
    /** 지금 썰물이 끝날 때까지 남은 분 (썰물이 아니면 0) */
    minutesLeftLowTide() {
      let n = 0;
      while (this.isLowTide(this.s.min + n) && n < 1440) n += 5;
      return n;
    }
    /** 다음 썰물이 시작될 때까지 남은 분 (지금이 썰물이면 0) */
    minutesToLowTide() {
      let n = 0;
      while (!this.isLowTide(this.s.min + n) && n < 1440) n += 5;
      return n;
    }

    value(name) {
      const s = this.s;
      switch (name) {
        case 'money': return s.money / 100;
        case 'day': return s.day;
        case 'hour': return this.hour();
        case 'min': case 'time': return this.clockMin();
        case 'clock': return s.min;
        case 'abstime': return this.absTime();
        case 'health': return this.health();
        case 'morale': return this.morale();
        case 'healthMax': return this.healthMax();
        case 'moraleMax': return this.moraleMax();
        case 'level': return s.level;
        case 'xp': return s.xp;
        case 'points': return s.points;
        case 'first': return (s.visits[this.curNodeId()] || 0) <= 1;
        case 'lowtide': return this.isLowTide();
        case 'tideleft': return this.minutesLeftLowTide();
        case 'tidewait': return this.minutesToLowTide();
        case 'night': { const h = this.hour(); return h >= 20 || h < 6; }
        case 'loc': return s.loc;
        case 'archetype': return s.archetype;
        case 'signature': return s.signature;
      }
      const dot = name.indexOf('.');
      if (dot > 0) {
        const pre = name.slice(0, dot), rest = name.slice(dot + 1);
        switch (pre) {
          case 'visits': return s.visits[rest] || 0;
          case 'seen': return (s.visits[rest] || 0) > 0;
          case 'has': return s.items.indexOf(rest) >= 0;
          case 'count': return s.items.filter(x => x === rest).length;
          case 'wear': return Object.values(s.equip).indexOf(rest) >= 0;
          case 'thought': return !!(s.thoughts[rest] && s.thoughts[rest].st === 'done');
          case 'known': return !!s.thoughts[rest];
          case 'researching': return !!(s.thoughts[rest] && s.thoughts[rest].st === 'research');
          case 'task': return s.tasks[rest] ? s.tasks[rest].st : '';
          case 'done': return !!(s.tasks[rest] && s.tasks[rest].st === 'done');
          case 'active': return !!(s.tasks[rest] && s.tasks[rest].st === 'active');
          case 'skill': return this.level(rest);
          case 'attr': return s.attrs[rest] || 0;
          case 'check': return !!(s.checks[rest] && s.checks[rest].ok);
          case 'failed': return !!(s.checks[rest] && !s.checks[rest].ok);
          case 'tried': return !!s.checks[rest];
          case 'event': return !!s.events[rest];
          case 'used': return !!s.used[rest];
        }
        throw new Error('알 수 없는 접두사: ' + name);
      }
      if (TL.data.skills && TL.data.skills[name]) return this.level(name);
      const v = s.vars[name];
      return v === undefined ? 0 : v;
    }

    test(cond) {
      if (!cond) return true;
      return !!TL.expr.compile(cond)(this.api);
    }
    eval(expr) { return TL.expr.compile(expr)(this.api); }

    interp(text) {
      if (text.indexOf('{{') < 0) return text;
      return text.replace(/\{\{(.+?)\}\}/g, (_, e) => {
        const expr = e.trim();
        const v = this.eval(expr);
        if (expr === 'money') return U.fmtMoney(Math.round(v * 100));
        if (typeof v === 'number') return String(Math.round(v * 100) / 100);
        return String(v);
      });
    }

    /* ---------- 기술 ---------- */
    skillDef(sk) { return TL.data.skills[sk]; }
    baseLevel(sk) {
      const def = this.skillDef(sk);
      if (!def) return 0;
      const s = this.s;
      return (s.attrs[def.attr] || 0) + (s.learned[sk] || 0) + (s.signature === sk ? 1 : 0);
    }
    cap(sk) {
      const def = this.skillDef(sk);
      return (this.s.attrs[def.attr] || 0) + (this.s.signature === sk ? 1 : 0);
    }
    modSources(sk) {
      const s = this.s, out = [];
      for (const slot in s.equip) {
        const it = TL.data.items[s.equip[slot]];
        if (it && it.mods && it.mods[sk]) out.push({ v: it.mods[sk], label: it.name });
      }
      for (const id in s.thoughts) {
        const t = s.thoughts[id], def = TL.data.thoughts[id];
        if (!def) continue;
        if (t.st === 'research' && def.research && def.research[sk]) out.push({ v: def.research[sk], label: def.name + ' (연구 중)' });
        if (t.st === 'done' && def.bonus && def.bonus[sk]) out.push({ v: def.bonus[sk], label: def.name });
      }
      const now = this.absTime();
      for (const b of s.buffs) if (b.skill === sk && b.until > now) out.push({ v: b.d, label: b.label || '일시 효과' });
      return out;
    }
    level(sk) {
      if (!this.skillDef(sk)) return 0;
      let v = this.baseLevel(sk);
      for (const m of this.modSources(sk)) v += m.v;
      return Math.max(1, v);
    }
    canLearn(sk) {
      return this.s.points > 0 && (this.s.learned[sk] || 0) < this.cap(sk);
    }
    learn(sk) {
      if (!this.canLearn(sk)) return false;
      this.s.learned[sk] = (this.s.learned[sk] || 0) + 1;
      this.s.points -= 1;
      this.note('level', this.skillDef(sk).name + ' 레벨이 ' + this.level(sk) + '(으)로 올랐다.');
      this.keepAlive();
      this.refreshPrompt();
      return true;
    }
    buySlot() {
      if (this.s.points <= 0 || this.s.slots >= 10) return false;
      this.s.points -= 1;
      this.s.slots += 1;
      this.note('thought', '사고 캐비닛에 새 칸이 열렸다. (' + this.s.slots + '칸)');
      this.notify('update');
      return true;
    }

    /* ---------- 체력 / 사기 ---------- */
    extraMax(key) {
      let v = 0;
      for (const id in this.s.thoughts) {
        const t = this.s.thoughts[id], def = TL.data.thoughts[id];
        if (def && t.st === 'done' && def.extra && def.extra[key]) v += def.extra[key];
      }
      return v;
    }
    healthMax() { return Math.max(1, this.level('ENDURANCE') + 2 + this.extraMax('health')); }
    moraleMax() { return Math.max(1, this.level('VOLITION') + 2 + this.extraMax('morale')); }
    health() { return this.healthMax() - this.s.hLoss; }
    morale() { return this.moraleMax() - this.s.mLoss; }
    keepAlive() {
      // 장비/기술 변경만으로 죽지 않게 한다
      if (this.health() < 1) this.s.hLoss = this.healthMax() - 1;
      if (this.morale() < 1) this.s.mLoss = this.moraleMax() - 1;
    }
    damage(kind, n, soft) {
      const s = this.s;
      // soft: 이야기의 감정적 타격 — 죽음에 이르지는 않는다 (1에서 버틴다)
      if (soft && n < 0) {
        const cur = kind === 'h' ? this.health() : this.morale();
        n = Math.max(n, 1 - cur);
        if (n >= 0) {
          this.note(kind === 'h' ? 'hurt' : 'hurtm', (kind === 'h' ? '체력' : '사기') + '이 바닥에서 버틴다 (1/' + (kind === 'h' ? this.healthMax() : this.moraleMax()) + ')');
          return;
        }
      }
      if (kind === 'h') {
        const before = this.health();
        s.hLoss = U.clamp(s.hLoss - n, 0, 99);
        const after = this.health();
        if (after !== before) this.note(n < 0 ? 'hurt' : 'heal', '체력 ' + (after > before ? '+' : '−') + Math.abs(after - before) + ' (' + Math.max(0, after) + '/' + this.healthMax() + ')');
        if (after <= 0) this.die('health');
      } else {
        const before = this.morale();
        s.mLoss = U.clamp(s.mLoss - n, 0, 99);
        const after = this.morale();
        if (after !== before) this.note(n < 0 ? 'hurtm' : 'healm', '사기 ' + (after > before ? '+' : '−') + Math.abs(after - before) + ' (' + Math.max(0, after) + '/' + this.moraleMax() + ')');
        if (after <= 0) this.die('morale');
      }
      this.notify('update');
    }
    die(kind) {
      if (this.dying) return;
      this.dying = true;
      this.s.stats.deaths++;
      this.frames = [];
      const node = C.nodes['death_' + kind];
      if (node) this.jumpNode(node.id);
      else this.finish('death');
    }

    /* ---------- 경험치 ---------- */
    gainXp(n) {
      const s = this.s;
      s.xp += n;
      this.note('xp', '경험치 +' + n);
      const lvl = Math.floor(s.xp / 100) + 1;
      if (lvl > s.level) {
        const gained = lvl - s.level;
        s.level = lvl;
        s.points += gained;
        this.note('levelup', '레벨 업! 레벨 ' + lvl + ' — 기술 포인트 +' + gained);
      }
    }

    /* ---------- 시간 ---------- */
    advance(n) {
      if (!n || n <= 0) return;
      this.s.min += n;
      this.progressThoughts(n);
      const now = this.absTime();
      this.s.buffs = this.s.buffs.filter(b => b.until > now);
      this.notify('time');
    }
    sleep(wake) {
      const s = this.s;
      let delta = (1440 + wake) - s.min;
      if (delta < 60) delta = 60;
      s.day += 1;
      s.min = wake;
      this.progressThoughts(delta);
      s.buffs = [];
      s.hLoss = Math.max(0, s.hLoss - 2);
      s.mLoss = Math.max(0, s.mLoss - 2);
      this.emit({ k: 'day', day: s.day, clock: U.fmtClock(s.min) });
      this.notify('time');
      this.notify('update');
    }

    /* ---------- 아이템 ---------- */
    itemDef(id) {
      const it = TL.data.items[id];
      if (!it) throw new Error('없는 아이템: ' + id);
      return it;
    }
    addItem(id, quiet) {
      const it = this.itemDef(id);
      if (this.s.items.indexOf(id) >= 0 && !it.stack) return;
      this.s.items.push(id);
      if (!quiet) this.note('item', '획득: ' + it.name);
      this.notify('update');
    }
    removeItem(id, quiet) {
      const i = this.s.items.indexOf(id);
      if (i < 0) return;
      this.s.items.splice(i, 1);
      if (this.s.items.indexOf(id) < 0) {
        for (const slot in this.s.equip) if (this.s.equip[slot] === id) delete this.s.equip[slot];
      }
      this.keepAlive();
      if (!quiet) this.note('itemloss', '잃음: ' + this.itemDef(id).name);
      this.notify('update');
    }
    countItem(id) { return this.s.items.filter(x => x === id).length; }
    equip(id, quiet) {
      const it = this.itemDef(id);
      if (!it.slot) return false;
      if (this.s.items.indexOf(id) < 0) this.s.items.push(id);
      this.s.equip[it.slot] = id;
      if (!quiet) this.note('item', '착용: ' + it.name);
      this.keepAlive();
      this.refreshPrompt();
      return true;
    }
    unequip(id) {
      for (const slot in this.s.equip) if (this.s.equip[slot] === id) delete this.s.equip[slot];
      this.keepAlive();
      this.refreshPrompt();
    }
    useItem(id) {
      const it = this.itemDef(id);
      if (!it.use || this.halted || this.s.items.indexOf(id) < 0) return false;
      if (!it._fx) it._fx = TL.fx.parse(it.use);
      this.emit({ k: 'note', kind: 'use', text: it.name + ' — 사용' });
      if (it.useLine) this.emit(this.lineEntry(it.useLine[0], it.useLine[1], null));
      if (it.consumable !== false) {
        const i = this.s.items.indexOf(id);
        this.s.items.splice(i, 1);
      }
      this.applyFx(it._fx);
      if (this.dying && !this.halted) { this.prompt = null; this.run(); }
      else if (!this.halted) this.refreshPrompt();
      this.notify('update');
      return true;
    }

    /* ---------- 사고 캐비닛 ---------- */
    thoughtDef(id) {
      const t = TL.data.thoughts[id];
      if (!t) throw new Error('없는 사고: ' + id);
      return t;
    }
    discoverThought(id) {
      const def = this.thoughtDef(id);
      if (this.s.thoughts[id]) return;
      this.s.thoughts[id] = { st: 'known', t: 0 };
      this.note('thought', '새로운 사고: 「' + def.name + '」 — 사고 캐비닛에서 내면화할 수 있다.');
    }
    slotsUsed() {
      let n = 0;
      for (const id in this.s.thoughts) if (this.s.thoughts[id].st !== 'known') n++;
      return n;
    }
    research(id) {
      const t = this.s.thoughts[id];
      if (!t || t.st !== 'known' || this.slotsUsed() >= this.s.slots) return false;
      t.st = 'research';
      t.t = 0;
      this.note('thought', '「' + this.thoughtDef(id).name + '」 내면화를 시작했다.');
      this.keepAlive();
      this.refreshPrompt();
      return true;
    }
    cancelResearch(id) {
      const t = this.s.thoughts[id];
      if (!t || t.st !== 'research') return false;
      t.st = 'known';
      t.t = 0;
      this.keepAlive();
      this.refreshPrompt();
      return true;
    }
    forgetThought(id) {
      const t = this.s.thoughts[id];
      if (!t || t.st !== 'done' || this.s.points <= 0) return false;
      this.s.points -= 1;
      t.st = 'known';
      t.t = 0;
      this.note('thought', '「' + this.thoughtDef(id).name + '」을(를) 잊었다.');
      this.keepAlive();
      this.refreshPrompt();
      return true;
    }
    progressThoughts(n) {
      for (const id in this.s.thoughts) {
        const t = this.s.thoughts[id];
        if (t.st !== 'research') continue;
        t.t += n;
        const def = this.thoughtDef(id);
        if (t.t >= def.time) {
          t.st = 'done';
          this.emit({ k: 'thought', id, name: def.name, text: def.solution, bonus: def.bonusText || '' });
          this.keepAlive();
        }
      }
    }

    /* ---------- 과제 ---------- */
    taskDef(id) {
      const t = TL.data.tasks[id];
      if (!t) throw new Error('없는 과제: ' + id);
      return t;
    }
    task(mode, id) {
      const def = this.taskDef(id);
      const cur = this.s.tasks[id];
      if (mode === 'add') {
        if (cur) return;
        this.s.tasks[id] = { st: 'active', day: this.s.day };
        this.note('task', '새 과제: ' + def.name);
      } else if (mode === 'done') {
        if (cur && cur.st === 'done') return;
        this.s.tasks[id] = { st: 'done', day: this.s.day };
        this.note('taskdone', '과제 완료: ' + def.name);
        if (def.xp) this.gainXp(def.xp);
      } else if (mode === 'fail') {
        if (cur && cur.st !== 'active') return;
        this.s.tasks[id] = { st: 'failed', day: this.s.day };
        this.note('taskfail', '과제 실패: ' + def.name);
      }
      this.notify('update');
    }

    /* ---------- 효과 ---------- */
    applyFx(list) {
      const s = this.s;
      for (const f of list) {
        switch (f.op) {
          case 'set': s.vars[f.name] = this.eval(f.expr); break;
          case 'unset': delete s.vars[f.name]; break;
          case 'assign': {
            const val = this.eval(f.expr);
            const cur = s.vars[f.name] || 0;
            s.vars[f.name] = f.mode === '+=' ? cur + val : f.mode === '-=' ? cur - val : val;
            break;
          }
          case 'money': {
            const before = s.money;
            s.money = Math.max(0, s.money + f.n);
            const d = s.money - before;
            if (d) this.note(d > 0 ? 'money' : 'moneyloss', (d > 0 ? '+' : '−') + U.fmtMoney(Math.abs(d)) + ' 솔도 (소지금 ' + U.fmtMoney(s.money) + ')');
            break;
          }
          case 'moneyx': {
            const val = Math.round(this.eval(f.expr) * 100);
            this.applyFx([{ op: 'money', n: f.mode === '+=' ? val : -val }]);
            break;
          }
          case 'health': this.damage('h', f.n, f.soft); break;
          case 'morale': this.damage('m', f.n, f.soft); break;
          case 'xp': this.gainXp(f.n); break;
          case 'time': this.advance(f.n); break;
          case 'item':
            if (f.mode === 'add') this.addItem(f.id);
            else if (f.mode === 'give') this.addItem(f.id, true);
            else if (f.mode === 'take') this.removeItem(f.id, true);
            else if (f.mode === 'takeall') { while (this.s.items.indexOf(f.id) >= 0) this.removeItem(f.id, true); }
            else this.removeItem(f.id);
            break;
          case 'equip': this.equip(f.id); break;
          case 'unequip': this.unequip(f.id); break;
          case 'thought': this.discoverThought(f.id); break;
          case 'task': this.task(f.mode, f.id); break;
          case 'buff': {
            const sk = this.skillDef(f.skill);
            if (!sk) throw new Error('없는 기술: ' + f.skill);
            s.buffs.push({ skill: f.skill, d: f.d, until: this.absTime() + f.min, label: '일시 효과' });
            this.note('buff', sk.name + ' ' + (f.d > 0 ? '+' : '') + f.d + ' (' + f.min + '분)');
            break;
          }
          case 'notify': this.note('info', this.interp(f.text)); break;
          case 'ending': this.finish(f.id); return;
          case 'sleep': this.sleep(f.wake); break;
          case 'heal': s.hLoss = 0; s.mLoss = 0; this.notify('update'); break;
          case 'waittide': this.advance(this.minutesToLowTide()); break;
          case 'wait': {
            const cur = this.clockMin();
            if (f.at > cur) this.advance(f.at - cur);
            break;
          }
          case 'loc': s.loc = f.id; this.notify('scene'); break;
          case 'art': s.art = f.id; this.notify('scene'); break;
          case 'ambient': this.emit({ k: 'ambient', text: this.interp(f.text) }); break;
          default: throw new Error('처리할 수 없는 효과: ' + f.op);
        }
        if (this.halted || this.dying) return;
      }
    }

    finish(id) {
      this.halted = true;
      this.prompt = { type: 'ending', id };
      this.notify('ending', id);
      this.notify('update');
    }

    /* ---------- 화자 ---------- */
    speaker(who) {
      if (!who) return null;
      const sk = TL.data.skills[who];
      if (sk) return { name: sk.name, attr: sk.attr, kind: 'skill' };
      const sp = TL.data.speakers[who];
      if (!sp) return { name: who, kind: 'npc' };
      const name = typeof sp.name === 'function' ? sp.name(this.api) : sp.name;
      return { name, kind: sp.kind || 'npc', color: sp.color || null };
    }
    lineEntry(who, text, tag) {
      const sp = this.speaker(who);
      return { k: 'line', who, name: sp ? sp.name : null, attr: sp ? sp.attr : null, sk: sp ? sp.kind : null, color: sp ? sp.color : null, text: this.interp(text), tag };
    }
    say(st) {
      const lc = this.lastCheck;
      this.lastCheck = null;
      if (st.who && st.diff) {
        if (this.level(st.who) + 6 < st.diff) return;
        this.emit(this.lineEntry(st.who, st.text, '[' + diffName(st.diff) + ': 성공]'));
        return;
      }
      let tag = null;
      if (st.who && lc && lc.skill === st.who) tag = '[' + lc.dname + ': ' + (lc.ok ? '성공' : '실패') + ']';
      this.emit(this.lineEntry(st.who, st.text, tag));
    }

    /* ---------- 흐름 제어 ---------- */
    jumpNode(id) {
      const n = C.nodes[id];
      if (!n) throw new Error('없는 노드로 이동: ' + id);
      this.s.visits[id] = (this.s.visits[id] || 0) + 1;
      if (n.attrs.art && !n.attrs.location) { this.s.art = n.attrs.art; this.notify('scene'); }
      this.cur = { b: n.block, i: 0 };
    }
    divert(target) {
      if (target === 'END' || target === 'HUB') { this.endDialogue(); return; }
      while (this.frames.length && this.frames[this.frames.length - 1].k !== 'u') this.frames.pop();
      this.jumpNode(target);
    }
    isHubPos(pos) {
      const blk = C.blocks[pos.b];
      if (!blk) return false;
      const n = C.nodes[blk.node];
      return !!(n && (n.attrs.location || n.attrs.noecho) && n.block === pos.b);
    }
    endDialogue() {
      this.frames = [];
      this.dying = false;
      if (this.checkEvents('end')) return;
      const loc = C.nodes[this.s.loc];
      if (!loc) throw new Error('대화가 끝났지만 돌아갈 장소가 없다 (현재 노드: ' + this.curNodeId() + ')');
      if (loc.hubIndex < 0) throw new Error('장소 노드에 선택지가 없음: ' + loc.id);
      const art = loc.attrs.art || loc.id;
      if (this.s.art !== art) { this.s.art = art; this.notify('scene'); }
      this.emit({ k: 'sep' });
      this.cur = { b: loc.block, i: loc.hubIndex };
    }
    travel(id, cost) {
      const n = C.nodes[id];
      if (!n || !n.attrs.location) throw new Error('장소가 아닌 곳으로 이동: ' + id);
      this.frames = [];
      this.advance(cost != null ? cost : (n.attrs.travel ? parseInt(n.attrs.travel, 10) : 4));
      this.s.loc = id;
      this.s.art = n.attrs.art || id;
      this.emit({ k: 'loc', id, name: n.attrs.name || id, day: this.s.day, clock: U.fmtClock(this.s.min) });
      this.notify('scene');
      this.notify('arrive', id);
      if (this.checkEvents('arrive')) return;
      this.jumpNode(id);
    }
    eventNodes() {
      if (!this._events || this._eventsCount !== Object.keys(C.nodes).length) {
        this._events = Object.values(C.nodes).filter(n => n.attrs.event)
          .sort((a, b) => (parseInt(b.attrs.priority || 0, 10)) - (parseInt(a.attrs.priority || 0, 10)));
        this._eventsCount = Object.keys(C.nodes).length;
      }
      return this._events;
    }
    checkEvents(trigger) {
      for (const n of this.eventNodes()) {
        if (!n.attrs.repeat && this.s.events[n.id]) continue;
        if (n.attrs.on && n.attrs.on !== trigger) continue;
        if (n.attrs.at && n.attrs.at.split(',').indexOf(this.s.loc) < 0) continue;
        if (n.attrs.notat && n.attrs.notat.split(',').indexOf(this.s.loc) >= 0) continue;
        if (n.attrs.when && !this.test(n.attrs.when)) continue;
        this.s.events[n.id] = (this.s.events[n.id] || 0) + 1;
        this.frames = [];
        this.jumpNode(n.id);
        return true;
      }
      return false;
    }
    blockEnd() {
      const f = this.frames.pop();
      if (!f) { this.endDialogue(); return; }
      if (f.k === 'c') this.cur = { b: f.b, i: f.g ? f.i + 1 : f.i };
      else if (f.k === 'u') this.cur = { b: f.b, i: f.i };
      else if (f.k === 't') this.divert(f.target);
    }

    checkKey(check) { return check.perDay ? check.id + '@' + this.s.day : check.id; }
    listChoices(grp) {
      const items = [];
      for (const ch of grp.items) {
        if (ch.cond && !this.test(ch.cond)) continue;
        if (ch.gate && this.level(ch.gate.skill) + 6 < ch.gate.diff) continue;
        if (!ch.sticky && !ch.check && this.s.used[ch.id]) continue;
        let disabled = false, info = null;
        if (ch.check) {
          const rec = this.s.checks[this.checkKey(ch.check)];
          if (rec && (rec.ok || ch.check.red)) continue;
          info = this.checkInfo(ch.check);
          if (rec && this.level(ch.check.skill) <= rec.lvl) { disabled = true; info.locked = rec.lvl; }
        }
        items.push({ ch, text: this.interp(ch.text), disabled, info, gate: ch.gate || null, exit: !!ch.goto });
      }
      return items;
    }
    checkInfo(check) {
      const lvl = this.level(check.skill);
      let mod = 0;
      const mods = [];
      for (const m of check.mods) {
        if (this.test(m.cond)) { mod += m.v; mods.push({ v: m.v, label: m.label || m.cond }); }
      }
      return {
        skill: check.skill, red: check.red, diff: check.diff, dname: diffName(check.diff),
        lvl, mod, mods, chance: chanceOf(lvl + mod, check.diff),
      };
    }
    roll(check) {
      const info = this.checkInfo(check);
      const d1 = U.roll(), d2 = U.roll();
      let ok;
      if (d1 === 1 && d2 === 1) ok = false;
      else if (d1 === 6 && d2 === 6) ok = true;
      else ok = d1 + d2 + info.lvl + info.mod >= check.diff;
      this.s.checks[this.checkKey(check)] = { ok, lvl: info.lvl };
      this.s.stats.checks++;
      if (ok) this.s.stats.checksOk++;
      this.emit({
        k: 'check', skill: check.skill, name: this.skillDef(check.skill).name, attr: this.skillDef(check.skill).attr,
        diff: check.diff, dname: info.dname, red: check.red, d1, d2, lvl: info.lvl, mod: info.mod, mods: info.mods, ok,
        total: d1 + d2 + info.lvl + info.mod,
      });
      this.lastCheck = { skill: check.skill, ok, dname: info.dname };
      if (ok) this.gainXp(check.red ? 10 : 5);
      return ok;
    }

    run() {
      let steps = 0;
      this.dying = this.dying && !this.halted ? this.dying : false;
      while (!this.halted) {
        if (++steps > MAX_STEPS) throw new Error('무한 루프 의심 — 블록 ' + (this.cur && this.cur.b));
        const blk = C.blocks[this.cur.b];
        if (!blk) throw new Error('없는 블록: ' + this.cur.b);
        if (this.cur.i >= blk.stmts.length) { this.blockEnd(); continue; }
        const st = blk.stmts[this.cur.i];
        if (st.cond && !this.test(st.cond)) { this.cur.i++; continue; }
        switch (st.t) {
          case 'line':
            this.say(st);
            this.cur.i++;
            break;
          case 'fx': {
            const before = this.cur;
            this.applyFx(st.fx);
            if (this.halted) return;
            if (this.cur === before) this.cur.i++;
            break;
          }
          case 'pause':
            this.cur.i++;
            this.prompt = { type: 'continue' };
            this.notify('prompt', this.prompt);
            return;
          case 'divert':
            this.divert(st.target);
            break;
          case 'goto':
            this.travel(st.target, st.cost);
            break;
          case 'tunnel':
            this.frames.push({ k: 'u', b: this.cur.b, i: this.cur.i + 1 });
            this.jumpNode(st.target);
            break;
          case 'return': {
            while (this.frames.length && this.frames[this.frames.length - 1].k !== 'u') this.frames.pop();
            const f = this.frames.pop();
            if (!f) this.endDialogue();
            else this.cur = { b: f.b, i: f.i };
            break;
          }
          case 'choices': {
            const items = this.listChoices(st);
            const enabled = items.filter(x => !x.disabled).length;
            if (enabled === 0) {
              if (this.isHubPos(this.cur)) throw new Error('장소에 고를 수 있는 선택지가 없음: ' + this.cur.b);
              this.cur.i++;
              break;
            }
            this.prompt = { type: 'choices', items };
            this.notify('prompt', this.prompt);
            return;
          }
          default:
            throw new Error('알 수 없는 문장 종류: ' + st.t);
        }
      }
    }

    refreshPrompt() {
      if (this.prompt && this.prompt.type === 'choices' && !this.halted) {
        this.prompt = null;
        this.run();
      }
      this.notify('update');
    }

    choose(index) {
      if (!this.prompt || this.prompt.type !== 'choices') return false;
      const item = this.prompt.items[index];
      if (!item || item.disabled) return false;
      const ch = item.ch;
      const pos = { b: this.cur.b, i: this.cur.i };
      const grp = C.blocks[pos.b].stmts[pos.i];
      this.prompt = null;
      const hub = this.isHubPos(pos);
      if (!ch.sticky && !ch.check) this.s.used[ch.id] = 1;
      if (!hub && !ch.goto) {
        this.emit({ k: 'you', text: item.text, check: ch.check ? item.info : null, gate: ch.gate ? { skill: ch.gate.skill, name: this.skillDef(ch.gate.skill).name, attr: this.skillDef(ch.gate.skill).attr } : null });
        this.advance(2);
      }
      const back = { k: 'c', b: pos.b, i: pos.i, g: grp.gather };
      if (ch.check) {
        const ok = this.roll(ch.check);
        const blk = ok ? ch.okBlock : ch.failBlock;
        const tgt = ok ? ch.okTarget : ch.failTarget;
        if (blk) {
          this.frames.push(tgt ? { k: 't', target: tgt } : back);
          this.cur = { b: blk, i: 0 };
        } else if (tgt) this.divert(tgt);
        else if (ch.target) this.divert(ch.target);
        else this.cur = { b: pos.b, i: grp.gather ? pos.i + 1 : pos.i };
      } else if (ch.goto) {
        this.travel(ch.goto, ch.cost);
      } else if (ch.body) {
        this.frames.push(ch.target ? { k: 't', target: ch.target } : back);
        this.cur = { b: ch.body, i: 0 };
      } else if (ch.target) {
        this.divert(ch.target);
      } else {
        this.cur = { b: pos.b, i: grp.gather ? pos.i + 1 : pos.i };
      }
      if (!this.halted) this.run();
      this.notify('update');
      return true;
    }

    cont() {
      if (!this.prompt || this.prompt.type !== 'continue') return false;
      this.prompt = null;
      this.run();
      this.notify('update');
      return true;
    }
  }

  TL.Game = Game;
  TL.newState = newState;
})(typeof window !== 'undefined' ? window.TL : globalThis.TL);
