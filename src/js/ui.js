/* 탱고 레테 — 사용자 인터페이스 */
(function (TL) {
  'use strict';
  const U = TL.util;
  const D = TL.data;

  const $ = (s, r) => (r || document).querySelector(s);
  function h(tag, attrs) {
    const e = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        const v = attrs[k];
        if (v == null || v === false) continue;
        if (k === 'class') e.className = v;
        else if (k === 'html') e.innerHTML = v;
        else if (k === 'text') e.textContent = v;
        else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v);
        else e.setAttribute(k, v === true ? '' : v);
      }
    }
    for (let i = 2; i < arguments.length; i++) {
      const kid = arguments[i];
      const list = Array.isArray(kid) ? kid : [kid];
      for (const x of list) {
        if (x == null || x === false) continue;
        e.appendChild(typeof x === 'string' ? document.createTextNode(x) : x);
      }
    }
    return e;
  }
  function safeJSON(s) { try { return s ? JSON.parse(s) : null; } catch (e) { return null; } }

  const Store = {
    key: k => 'tangolethe.v1.' + k,
    get(k) { try { return localStorage.getItem(this.key(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(this.key(k), v); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem(this.key(k)); } catch (e) { /* 무시 */ } },
  };

  const DICE = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
  const NOTE_ICON = {
    xp: '✦', levelup: '✦', level: '▲', item: '◆', itemloss: '◇', task: '▣', taskdone: '▣', taskfail: '▣',
    thought: '◎', hurt: '✚', heal: '✚', hurtm: '◈', healm: '◈', money: '¤', moneyloss: '¤', buff: '↑', info: '·', use: '◆',
  };
  const ALIGN = [
    ['al_communard', '코뮌주의'], ['al_ultralib', '초자유주의'], ['al_moralist', '협약주의'], ['al_crown', '왕당·국수주의'],
  ];
  const COPS = [
    ['cop_sorry', '사과하는 형사'], ['cop_star', '스타 형사'], ['cop_apoc', '종말론 형사'],
    ['cop_boring', '모범 형사'], ['cop_hobo', '부랑 형사'], ['cop_tango', '탱고 형사'],
  ];
  const PHASE_KO = { dawn: '새벽', day: '낮', dusk: '황혼', night: '밤' };
  const SLOT_NAMES = {};
  for (const [k, v] of D.slots) SLOT_NAMES[k] = v;

  function attrColor(attr) { return D.attrs[attr] ? D.attrs[attr].color : '#ccc'; }
  function modText(mods) {
    const parts = [];
    for (const k in mods || {}) {
      const sk = D.skills[k];
      parts.push((sk ? sk.name : k) + ' ' + (mods[k] > 0 ? '+' : '−') + Math.abs(mods[k]));
    }
    return parts.join(', ');
  }
  function josaIga(word) {
    const c = word.charCodeAt(word.length - 1);
    if (c < 0xac00 || c > 0xd7a3) return '이(가)';
    return (c - 0xac00) % 28 ? '이' : '가';
  }
  function fmtDuration(min) {
    min = Math.max(0, Math.round(min));
    const hh = Math.floor(min / 60), mm = min % 60;
    if (!hh) return mm + '분';
    return hh + '시간' + (mm ? ' ' + mm + '분' : '');
  }

  class UI {
    constructor() {
      this.game = new TL.Game();
      this.settings = Object.assign({ fs: 'normal', anim: true }, safeJSON(Store.get('settings')) || {});
      this.pending = [];
      this.panelKind = null;
      this.panelTab = null;
      this.sel = {};
      this.screen = 'title';
      this.sceneDirty = true;
      this.game.on((type, data) => {
        if (type === 'entry') this.pending.push(data);
        else if (type === 'scene') this.sceneDirty = true;
        else if (type === 'arrive') this.wantAutosave = true;
      });
    }

    /* ─────────── 부팅 ─────────── */
    init(hotData) {
      this.el = {
        title: $('#screen-title'), create: $('#screen-create'), gameScr: $('#screen-game'),
        log: $('#log'), choices: $('#choices'),
        placeName: $('#place-name'), placeSub: $('#place-sub'),
        hp: $('#hp-pips'), mp: $('#mp-pips'), money: $('#money'), lvl: $('#lvl'), tide: $('#tide-chip'),
        panel: $('#panel'), panelTabs: $('#panel-tabs'), panelBody: $('#panel-body'),
        ending: $('#ending'), toast: $('#toast'),
      };
      this.applySettings();
      this.painter = new TL.Painter($('#scene-canvas'));
      this.titlePainter = new TL.Painter($('#title-canvas'));

      $('#btn-new').addEventListener('click', () => this.showCreate());
      $('#btn-continue').addEventListener('click', () => this.loadSlot('auto'));
      $('#btn-load').addEventListener('click', () => this.openPanel('load'));
      $('#btn-about').addEventListener('click', () => this.openPanel('about'));
      $('#panel-close').addEventListener('click', () => this.closePanel());
      this.el.panel.addEventListener('click', (e) => { if (e.target === this.el.panel) this.closePanel(); });
      for (const b of document.querySelectorAll('.toolbar [data-panel]')) {
        b.addEventListener('click', () => this.openPanel(b.getAttribute('data-panel')));
      }
      document.addEventListener('keydown', (e) => this.onKey(e));
      let rt = null;
      window.addEventListener('resize', () => {
        clearTimeout(rt);
        rt = setTimeout(() => {
          if (this.screen === 'game') this.paintScene(true);
          if (this.screen === 'title') this.paintTitle();
        }, 180);
      });
      document.addEventListener('visibilitychange', () => { if (document.hidden) this.autosave(); });
      window.addEventListener('pagehide', () => this.autosave());

      if (window.claude && window.claude.hot && window.claude.hot.snapshot) {
        try {
          window.claude.hot.snapshot(() => ({ save: this.game.s && this.screen === 'game' ? this.game.serialize() : null }));
        } catch (e) { /* 무시 */ }
      }

      if (hotData && hotData.save) {
        try { this.game.load(hotData.save); this.enterGame(); return; } catch (e) { /* 타이틀로 */ }
      }
      this.showTitle();
    }

    applySettings() {
      document.body.classList.toggle('no-anim', !this.settings.anim);
      document.body.classList.remove('fs-small', 'fs-large', 'fs-xlarge');
      if (this.settings.fs !== 'normal') document.body.classList.add('fs-' + this.settings.fs);
      Store.set('settings', JSON.stringify(this.settings));
    }

    showScreen(name) {
      this.screen = name;
      this.el.title.hidden = name !== 'title';
      this.el.create.hidden = name !== 'create';
      this.el.gameScr.hidden = name !== 'game';
      this.el.ending.hidden = true;
    }

    showTitle() {
      this.showScreen('title');
      $('#btn-continue').hidden = !Store.get('auto');
      requestAnimationFrame(() => this.paintTitle());
    }
    paintTitle() {
      try { this.titlePainter.paint('title', { hour: 23, v: () => 0 }, true); } catch (e) { /* 캔버스 실패는 무시 */ }
    }

    toast(msg) {
      const t = this.el.toast;
      t.textContent = msg;
      t.hidden = false;
      clearTimeout(this.toastT);
      this.toastT = setTimeout(() => { t.hidden = true; }, 2600);
    }

    fatal(err) {
      console.error(err);
      this.el.log.appendChild(h('div', { class: 'fatal', text: '스크립트 오류가 발생했습니다.\n' + (err && err.message ? err.message : String(err)) + '\n\n메뉴에서 저장을 불러오거나 타이틀로 돌아가세요.' }));
      this.el.log.scrollTop = this.el.log.scrollHeight;
    }

    /* ─────────── 캐릭터 생성 ─────────── */
    showCreate() {
      this.showScreen('create');
      this.cr = { arch: D.archetypes[0].id, attrs: Object.assign({}, D.archetypes[0].attrs), sig: D.archetypes[0].signature, custom: { INT: 3, PSY: 3, FYS: 3, MOT: 3 } };
      this.renderCreate();
    }
    renderCreate() {
      const cr = this.cr;
      const root = this.el.create;
      root.innerHTML = '';
      const inner = h('div', { class: 'create-inner' });
      inner.appendChild(h('div', { class: 'create-head' },
        h('h2', { text: '당신은 어떤 형사였는가' }),
        h('p', { text: '기억은 없다. 하지만 몸과 머리는 무언가를 기억한다. 네 가지 속성이 당신의 기술들을 떠받친다. 원형을 고르거나 직접 배분하고, 가장 자신 있는 기술 하나를 대표 기술로 정하라.' })));

      const grid = h('div', { class: 'arch-grid', role: 'radiogroup', 'aria-label': '원형' });
      const archs = D.archetypes.concat([{ id: 'custom', name: '직접 만들기', en: 'CUSTOM', desc: '12점을 네 속성에 직접 나눈다. 각 속성은 1에서 6까지. 약점이 없는 형사는 없다. 약점을 고르는 것이 곧 성격을 고르는 것이다.', attrs: cr.custom }]);
      for (const a of archs) {
        const sel = cr.arch === a.id;
        const card = h('button', { class: 'arch' + (sel ? ' sel' : ''), type: 'button', role: 'radio', 'aria-checked': sel ? 'true' : 'false' },
          h('span', { class: 'arch-en', text: a.en }),
          h('span', { class: 'arch-name', text: a.name }),
          h('span', { class: 'arch-desc', text: a.desc }),
          this.attrBars(a.id === 'custom' ? cr.custom : a.attrs));
        card.addEventListener('click', () => {
          cr.arch = a.id;
          if (a.id === 'custom') cr.attrs = cr.custom;
          else { cr.attrs = Object.assign({}, a.attrs); cr.sig = a.signature; }
          this.renderCreate();
        });
        grid.appendChild(card);
      }
      inner.appendChild(grid);

      if (cr.arch === 'custom') {
        const sec = h('div', { class: 'create-section' }, h('h3', { text: '속성 배분' }));
        const used = D.attrOrder.reduce((s, k) => s + cr.custom[k], 0);
        const left = D.customPoints - used;
        sec.appendChild(h('div', { class: 'points-left', text: '남은 점수: ' + left }));
        const box = h('div', { class: 'custom-box' });
        for (const k of D.attrOrder) {
          const at = D.attrs[k];
          const minus = h('button', { type: 'button', 'aria-label': at.name + ' 내리기', text: '−' });
          const plus = h('button', { type: 'button', 'aria-label': at.name + ' 올리기', text: '+' });
          minus.disabled = cr.custom[k] <= D.attrMin;
          plus.disabled = cr.custom[k] >= D.attrMax || left <= 0;
          minus.addEventListener('click', () => { cr.custom[k]--; cr.attrs = cr.custom; this.renderCreate(); });
          plus.addEventListener('click', () => { cr.custom[k]++; cr.attrs = cr.custom; this.renderCreate(); });
          const card = h('div', { class: 'custom-attr' },
            h('div', { class: 'top' },
              h('div', null, h('div', { class: 'nm', text: at.name, style: 'color:' + at.color }), h('div', { class: 'en', text: at.en })),
              h('div', { class: 'stepper' }, minus, h('span', { class: 'val', text: String(cr.custom[k]) }), plus)),
            h('p', { text: at.desc }));
          box.appendChild(card);
        }
        sec.appendChild(box);
        inner.appendChild(sec);
      }

      const sigSec = h('div', { class: 'create-section' }, h('h3', { text: '대표 기술 — 레벨 +1, 배움 한도 +1' }));
      const sg = h('div', { class: 'sig-grid' });
      for (const k of D.attrOrder) {
        const col = h('div', { class: 'sig-col' }, h('h4', { text: D.attrs[k].name + ' · ' + D.attrs[k].en, style: 'color:' + D.attrs[k].color }));
        const list = h('div', { class: 'sig-list' });
        for (const sk of D.skillOrder[k]) {
          const s = D.skills[sk];
          const lv = (cr.attrs[k] || 0) + (cr.sig === sk ? 1 : 0);
          const b = h('button', { class: 'sig' + (cr.sig === sk ? ' sel' : ''), type: 'button', title: s.tag },
            h('span', { text: s.name }), h('span', { class: 'lv', text: String(lv) }));
          b.addEventListener('click', () => { cr.sig = sk; this.renderCreate(); });
          list.appendChild(b);
        }
        col.appendChild(list);
        sg.appendChild(col);
      }
      sigSec.appendChild(sg);
      if (cr.sig) {
        const s = D.skills[cr.sig];
        sigSec.appendChild(h('div', { class: 'sig-detail' }, h('strong', { text: s.name + ' — ' + s.tag }), '\n' + s.desc));
      }
      inner.appendChild(sigSec);

      const used = D.attrOrder.reduce((s, k) => s + (cr.attrs[k] || 0), 0);
      const valid = cr.sig && (cr.arch !== 'custom' || used === D.customPoints);
      const hp = (cr.attrs.FYS || 0) + (cr.sig === 'ENDURANCE' ? 1 : 0) + 1;
      const mp = (cr.attrs.PSY || 0) + (cr.sig === 'VOLITION' ? 1 : 0) + 1;
      const startBtn = h('button', { class: 'btn primary', type: 'button', text: '깨어난다' });
      startBtn.disabled = !valid;
      startBtn.addEventListener('click', () => this.startNew());
      inner.appendChild(h('div', { class: 'create-foot' },
        h('div', { class: 'create-summary', text: '체력 ' + hp + ' · 사기 ' + mp + (cr.arch === 'custom' && used !== D.customPoints ? ' · 점수를 모두 배분하세요 (' + used + '/' + D.customPoints + ')' : '') }),
        h('div', { style: 'display:flex;gap:8px;flex-wrap:wrap' },
          h('button', { class: 'btn', type: 'button', text: '돌아가기', onclick: () => this.showTitle() }),
          startBtn)));
      root.appendChild(inner);
    }
    attrBars(attrs) {
      const box = h('div', { class: 'attr-bars' });
      for (const k of D.attrOrder) {
        const pips = h('span', { class: 'pips' });
        for (let i = 1; i <= 6; i++) pips.appendChild(h('i', { class: 'pip' + (i <= attrs[k] ? ' on' : '') }));
        box.appendChild(h('div', { class: 'attr-bar', style: 'color:' + D.attrs[k].color },
          h('span', { text: D.attrs[k].name }), pips, h('span', { class: 'num', text: String(attrs[k]) })));
      }
      return box;
    }

    startNew() {
      const cr = this.cr;
      this.pending = [];
      this.showScreen('game');
      this.el.log.innerHTML = '';
      this.el.choices.innerHTML = '';
      try {
        this.game.newGame({
          attrs: Object.assign({}, cr.attrs), signature: cr.sig, archetype: cr.arch,
          items: ['shoe_left'], equip: ['shoe_left'], money: 0, startMin: 9 * 60 + 40, start: 'intro',
        });
      } catch (e) { this.fatal(e); return; }
      this.sceneDirty = true;
      this.after();
    }

    /* ─────────── 게임 화면 ─────────── */
    enterGame() {
      this.showScreen('game');
      this.pending = [];
      this.rebuildLog();
      this.sceneDirty = true;
      requestAnimationFrame(() => {
        this.paintScene(true);
        this.updateHud();
        this.renderPrompt();
        if (this.game.prompt && this.game.prompt.type === 'ending') this.showEnding(this.game.prompt.id);
      });
    }

    rebuildLog() {
      const log = this.el.log;
      log.innerHTML = '';
      const frag = document.createDocumentFragment();
      for (const e of this.game.log) {
        const node = this.renderEntry(e);
        if (node) frag.appendChild(node);
      }
      log.appendChild(frag);
      log.scrollTop = log.scrollHeight;
    }

    act(fn) {
      if (this.busy) return;
      try { fn(); } catch (e) { this.fatal(e); this.pending = []; return; }
      this.after();
    }

    after() {
      const entries = this.pending;
      this.pending = [];
      const log = this.el.log;
      this.el.choices.innerHTML = '';
      const anim = this.settings.anim && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const step = anim ? Math.max(18, Math.min(80, 1400 / Math.max(1, entries.length))) : 0;
      let first = null, i = 0, gotDay = false;
      const frag = document.createDocumentFragment();
      for (const e of entries) {
        if (e.k === 'day') gotDay = true;
        const node = this.renderEntry(e);
        if (!node) continue;
        if (anim) { node.classList.add('fresh'); node.style.animationDelay = (i * step) + 'ms'; }
        if (!first) first = node;
        frag.appendChild(node);
        i++;
      }
      const prevHeight = log.scrollHeight;
      log.appendChild(frag);
      while (log.childElementCount > 520) log.removeChild(log.firstElementChild);
      this.scrollLog(first, prevHeight);
      this.updateHud();
      if (this.sceneDirty) this.paintScene();
      const total = anim ? i * step + 120 : 0;
      this.busy = total > 0;
      clearTimeout(this.promptT);
      this.promptT = setTimeout(() => {
        this.busy = false;
        this.renderPrompt();
        const p = this.game.prompt;
        if (p && p.type === 'ending') this.showEnding(p.id);
      }, total);
      if (this.wantAutosave || gotDay) { this.wantAutosave = false; this.autosave(); }
      if (this.panelKind) this.renderPanel();
    }

    scrollLog(first, prevHeight) {
      const log = this.el.log;
      if (!first) return;
      const added = log.scrollHeight - (prevHeight || 0);
      let top;
      if (added > log.clientHeight * .85) top = first.offsetTop - 18;
      else top = log.scrollHeight;
      log.scrollTo({ top, behavior: this.settings.anim ? 'smooth' : 'auto' });
    }

    renderEntry(e) {
      switch (e.k) {
        case 'line': {
          const cls = ['e', 'line'];
          if (!e.who) cls.push('nar');
          else if (e.sk === 'skill') cls.push('skill', e.attr);
          else if (e.sk === 'voice') cls.push('voice');
          else if (e.sk === 'object') cls.push('object');
          else cls.push('npc');
          const p = h('p', { class: cls.join(' ') });
          if (e.who) {
            const who = h('span', { class: 'who', text: e.name });
            if (e.color) who.style.color = e.color;
            if (e.sk === 'skill' && D.skills[e.who]) who.title = D.skills[e.who].tag;
            p.appendChild(who);
            if (e.tag) p.appendChild(h('span', { class: 'tag', text: e.tag }));
            p.appendChild(h('span', { class: 'dash', text: '—' }));
          }
          p.appendChild(h('span', { class: 'txt', html: U.markup(e.text) }));
          return p;
        }
        case 'you': {
          const p = h('p', { class: 'e you' });
          p.appendChild(h('span', { class: 'who', text: '당신' }));
          p.appendChild(h('span', { class: 'dash', text: '—' }));
          if (e.gate) p.appendChild(h('span', { class: 'ck', style: 'color:' + attrColor(e.gate.attr), text: '[' + e.gate.name + ']' }));
          if (e.check) {
            const sk = D.skills[e.check.skill];
            p.appendChild(h('span', { class: 'ck ' + (e.check.red ? 'red' : 'white'), text: '[' + sk.name + ' · ' + e.check.dname + ' ' + e.check.diff + ']' }));
          }
          p.appendChild(h('span', { html: U.markup(e.text) }));
          return p;
        }
        case 'check': {
          const box = h('div', { class: 'e check ' + (e.ok ? 'ok' : 'no') + (e.red ? ' red' : ''), role: 'note' });
          box.appendChild(h('span', { class: 'dice', 'aria-label': '주사위 ' + e.d1 + ', ' + e.d2, text: DICE[e.d1] + DICE[e.d2] }));
          box.appendChild(h('span', { class: 'sk', style: 'color:' + attrColor(e.attr), text: e.name }));
          let math = e.d1 + ' + ' + e.d2 + ' + 기술 ' + e.lvl;
          if (e.mod) math += ' ' + (e.mod > 0 ? '+' : '−') + ' 보정 ' + Math.abs(e.mod);
          math += ' = ' + e.total + ' / ' + e.dname + ' ' + e.diff;
          box.appendChild(h('span', { class: 'math', text: math }));
          let res = e.ok ? '성공' : '실패';
          if (e.d1 === 6 && e.d2 === 6) res = '결정적 성공';
          if (e.d1 === 1 && e.d2 === 1) res = '결정적 실패';
          box.appendChild(h('span', { class: 'res', text: res }));
          if (e.mods && e.mods.length) box.title = e.mods.map(m => (m.v > 0 ? '+' : '−') + Math.abs(m.v) + ' ' + m.label).join('\n');
          return box;
        }
        case 'note':
          return h('div', { class: 'e note ' + e.kind }, h('span', { class: 'ic', 'aria-hidden': 'true', text: NOTE_ICON[e.kind] || '·' }), h('span', { text: e.text }));
        case 'loc':
          return h('div', { class: 'e loc' }, h('span', null, e.name, h('span', { class: 't', text: e.day + '일차 ' + e.clock })));
        case 'day':
          return h('div', { class: 'e day' }, e.day + '일차', h('small', { text: '솔레아 · ' + e.clock }));
        case 'sep':
          return h('div', { class: 'e sep', 'aria-hidden': 'true' });
        case 'ambient':
          return h('p', { class: 'e ambient', html: U.markup(e.text) });
        case 'thought': {
          const box = h('div', { class: 'e thought' });
          box.appendChild(h('span', { class: 'th-k', text: '사고 완성' }));
          box.appendChild(h('span', { class: 'th-n', text: e.name }));
          box.appendChild(h('span', { text: e.text }));
          const def = D.thoughts[e.id];
          const eff = def ? modText(def.bonus) : '';
          const extra = def && def.extra ? Object.keys(def.extra).map(k => (k === 'health' ? '체력 최대치 ' : '사기 최대치 ') + '+' + def.extra[k]).join(', ') : '';
          if (eff || extra) box.appendChild(h('span', { class: 'th-b', text: '효과: ' + [eff, extra].filter(Boolean).join(', ') }));
          return box;
        }
        default:
          return null;
      }
    }

    renderPrompt() {
      const box = this.el.choices;
      box.innerHTML = '';
      const p = this.game.prompt;
      if (!p) return;
      const anim = this.settings.anim;
      if (p.type === 'continue') {
        const b = h('button', { class: 'continue' + (anim ? ' fresh' : ''), type: 'button', text: '계속  ▸' });
        b.addEventListener('click', () => this.act(() => this.game.cont()));
        box.appendChild(b);
        if (!this.panelKind) b.focus({ preventScroll: true });
        return;
      }
      if (p.type !== 'choices') return;
      p.items.forEach((it, i) => {
        const cls = ['choice'];
        if (anim) cls.push('fresh');
        if (it.disabled) cls.push('locked');
        if (it.exit) cls.push('exit');
        if (it.info) cls.push(it.info.red ? 'red' : 'white');
        const b = h('button', { class: cls.join(' '), type: 'button', 'aria-disabled': it.disabled ? 'true' : null });
        if (anim) b.style.animationDelay = (i * 35) + 'ms';
        b.appendChild(h('span', { class: 'n', text: (i + 1) + '.' }));
        const t = h('span', { class: 'txt' });
        if (it.gate) {
          const sk = D.skills[it.gate.skill];
          t.appendChild(h('span', { class: 'gate', style: 'color:' + attrColor(sk.attr), text: '[' + sk.name + ']' }));
        }
        if (it.info) {
          const sk = D.skills[it.info.skill];
          t.appendChild(h('span', { class: 'ck', text: '[' + sk.name + ' · ' + it.info.dname + ' ' + it.info.diff + ']' }));
        }
        t.appendChild(h('span', { html: U.markup(it.text) }));
        if (it.info && !it.disabled) t.appendChild(h('span', { class: 'pct', text: Math.round(it.info.chance * 100) + '%' }));
        if (it.disabled && it.info) {
          const sk = D.skills[it.info.skill];
          t.appendChild(h('span', { class: 'lockmsg', text: '잠김 — ' + sk.name + josaIga(sk.name) + ' ' + (it.info.locked + 1) + ' 이상이 되면 다시 시도할 수 있다.' }));
        }
        b.appendChild(t);
        if (it.info) {
          const parts = ['기술 ' + it.info.lvl];
          for (const m of it.info.mods) parts.push((m.v > 0 ? '+' : '−') + Math.abs(m.v) + ' ' + m.label);
          b.title = (it.info.red ? '빨간색 판정: 단 한 번의 기회.' : '흰색 판정: 실패하면 기술을 올린 뒤 다시 시도할 수 있다.') + '\n' + parts.join('\n');
        }
        b.addEventListener('click', () => { if (!it.disabled) this.act(() => this.game.choose(i)); });
        box.appendChild(b);
      });
    }

    updateHud() {
      const g = this.game, s = g.s;
      if (!s) return;
      const pips = (el, cur, max) => {
        const prev = +el.getAttribute('data-cur');
        el.innerHTML = '';
        for (let i = 0; i < max; i++) el.appendChild(h('i', { class: 'pip' + (i < cur ? ' on' : '') + (!isNaN(prev) && prev !== cur && i < Math.max(cur, prev) && i >= Math.min(cur, prev) ? ' flash' : '') }));
        el.setAttribute('data-cur', cur);
        el.parentElement.setAttribute('aria-label', cur + ' / ' + max);
      };
      pips(this.el.hp, Math.max(0, g.health()), g.healthMax());
      pips(this.el.mp, Math.max(0, g.morale()), g.moraleMax());
      this.el.money.textContent = '¤ ' + U.fmtMoney(s.money) + ' 솔도';
      this.el.lvl.innerHTML = '';
      this.el.lvl.appendChild(document.createTextNode('레벨 ' + s.level));
      if (s.points > 0) this.el.lvl.appendChild(h('span', { class: 'pts', text: ' · 기술 포인트 ' + s.points }));
      const loc = TL.content.nodes[s.loc];
      this.el.placeName.textContent = loc ? (loc.attrs.name || loc.id) : '어둠';
      const phase = TL.phaseOf(g.hour());
      this.el.placeSub.textContent = s.day + '일차 · ' + U.fmtClock(s.min) + ' · ' + PHASE_KO[phase];
      const low = g.isLowTide();
      this.el.tide.textContent = low ? '썰물 — 개펄이 드러남' : '밀물';
      this.el.tide.classList.toggle('low', low);
      this.el.tide.hidden = !s.loc;
      const cb = $('#tb-char');
      cb.classList.toggle('has-points', s.points > 0);
      if (phase !== this.lastPhase) { this.lastPhase = phase; this.sceneDirty = true; }
      if (this.sceneDirty) this.paintScene();
    }

    paintScene(force) {
      const g = this.game;
      if (!g.s || this.screen !== 'game') return;
      this.sceneDirty = false;
      try {
        this.painter.paint(g.s.art || 'void', { hour: g.hour(), v: (n) => { try { return g.value(n); } catch (e) { return 0; } } }, force);
      } catch (e) { console.warn(e); }
    }

    /* ─────────── 결말 ─────────── */
    showEnding(id) {
      const g = this.game, s = g.s;
      const def = (D.endings && D.endings[id]) || { title: '끝', sub: '' };
      const box = this.el.ending;
      box.innerHTML = '';
      const isDeath = id === 'death';
      const inner = h('div', { class: 'ending-box' });
      inner.appendChild(h('div', { class: 'ending-k', text: isDeath ? '게임 오버' : '탱고 레테 · 끝' }));
      inner.appendChild(h('div', { class: 'ending-t', text: def.title }));
      if (def.sub) inner.appendChild(h('div', { class: 'ending-s', text: def.sub }));
      const done = Object.keys(s.thoughts).filter(k => s.thoughts[k].st === 'done').length;
      const tasks = Object.keys(s.tasks).filter(k => s.tasks[k].st === 'done').length;
      const stats = h('div', { class: 'ending-stats' });
      const stat = (v, l) => stats.appendChild(h('div', null, h('b', { text: String(v) }), h('span', { text: l })));
      stat(s.day + '일', '솔레아에서 보낸 날');
      stat(s.level, '레벨');
      stat(s.stats.checksOk + ' / ' + s.stats.checks, '성공한 판정');
      stat(done, '내면화한 사고');
      stat(tasks, '완료한 과제');
      stat(U.fmtMoney(s.money), '남은 솔도');
      inner.appendChild(stats);
      const acts = h('div', { class: 'ending-acts' });
      if (isDeath) acts.appendChild(h('button', { class: 'btn primary', type: 'button', text: '마지막 자동 저장 불러오기', onclick: () => this.loadSlot('auto') }));
      acts.appendChild(h('button', { class: 'btn', type: 'button', text: '기록 다시 읽기', onclick: () => { box.hidden = true; } }));
      acts.appendChild(h('button', { class: 'btn', type: 'button', text: '타이틀로', onclick: () => { box.hidden = true; this.showTitle(); } }));
      inner.appendChild(acts);
      box.appendChild(inner);
      box.hidden = false;
      if (!isDeath) Store.del('auto');
    }

    /* ─────────── 저장 ─────────── */
    slotMeta(key) { return safeJSON(Store.get(key + '.meta')); }
    saveSlot(key) {
      const g = this.game;
      if (!g.s || g.halted) return false;
      const data = g.serialize();
      const loc = TL.content.nodes[g.s.loc];
      const meta = { when: Date.now(), day: g.s.day, clock: U.fmtClock(g.s.min), place: loc ? loc.attrs.name : '', level: g.s.level };
      const ok = Store.set(key, data) && Store.set(key + '.meta', JSON.stringify(meta));
      return ok;
    }
    autosave() {
      if (this.screen !== 'game' || !this.game.s || this.game.halted) return;
      this.saveSlot('auto');
    }
    loadSlot(key) {
      const data = Store.get(key);
      if (!data) { this.toast('저장된 기록이 없습니다.'); return; }
      this.loadData(data);
    }
    loadData(data) {
      try {
        this.game.load(data);
      } catch (e) {
        this.toast('불러오기 실패: ' + e.message);
        return;
      }
      this.closePanel();
      this.el.ending.hidden = true;
      this.enterGame();
      this.toast('기록을 불러왔습니다.');
    }

    /* ─────────── 키보드 ─────────── */
    onKey(e) {
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (this.panelKind) {
        if (e.key === 'Escape') { e.preventDefault(); this.closePanel(); }
        return;
      }
      if (this.screen !== 'game' || !this.el.ending.hidden) return;
      const code = e.code || '';
      const p = this.game.prompt;
      if (/^(Digit|Numpad)[0-9]$/.test(code)) {
        let n = parseInt(code.slice(-1), 10);
        if (n === 0) n = 10;
        if (p && p.type === 'choices' && !this.busy && p.items[n - 1] && !p.items[n - 1].disabled) {
          e.preventDefault();
          this.act(() => this.game.choose(n - 1));
        }
        return;
      }
      if ((code === 'Space' || code === 'Enter') && p && p.type === 'continue' && !this.busy) {
        e.preventDefault();
        this.act(() => this.game.cont());
        return;
      }
      const map = { KeyC: 'char', KeyT: 'thought', KeyI: 'inv', KeyJ: 'journal', Escape: 'menu' };
      if (map[code]) { e.preventDefault(); this.openPanel(map[code]); }
    }

    /* ─────────── 패널 ─────────── */
    openPanel(kind, tab) {
      if (['char', 'thought', 'inv', 'journal', 'menu'].indexOf(kind) >= 0 && !this.game.s) return;
      this.panelKind = kind;
      this.panelTab = tab || null;
      this.el.panel.hidden = false;
      this.renderPanel();
      const first = this.el.panel.querySelector('.tab.on') || $('#panel-close');
      if (first) first.focus({ preventScroll: true });
    }
    closePanel() {
      this.panelKind = null;
      this.el.panel.hidden = true;
      this.sel = {};
      if (this.screen === 'game') {
        const b = this.el.choices.querySelector('button');
        if (b) b.focus({ preventScroll: true });
      }
    }
    renderPanel() {
      const kind = this.panelKind;
      if (!kind) return;
      const inGame = !!this.game.s && this.screen === 'game';
      const tabs = inGame
        ? [['char', '인물'], ['thought', '사고 캐비닛'], ['inv', '소지품'], ['journal', '일지'], ['menu', '메뉴']]
        : kind === 'about' ? [['about', '이 게임에 대하여']] : [['load', '불러오기']];
      const tabBox = this.el.panelTabs;
      tabBox.innerHTML = '';
      for (const [k, label] of tabs) {
        const b = h('button', { class: 'tab' + (k === kind ? ' on' : ''), type: 'button', text: label });
        b.addEventListener('click', () => { this.panelKind = k; this.renderPanel(); });
        tabBox.appendChild(b);
      }
      const body = this.el.panelBody;
      const scroll = body.scrollTop;
      body.innerHTML = '';
      const fn = {
        char: () => this.panelChar(body), thought: () => this.panelThought(body), inv: () => this.panelInv(body),
        journal: () => this.panelJournal(body), menu: () => this.panelMenu(body), load: () => this.panelLoad(body),
        about: () => this.panelAbout(body),
      }[kind];
      if (fn) fn();
      body.scrollTop = scroll;
    }

    /* 인물 */
    panelChar(body) {
      const g = this.game, s = g.s;
      const name = s.vars.name_known ? '라자로 몬테로' : '이름 모름';
      const arch = D.archetypes.find(a => a.id === s.archetype);
      const top = h('div', { class: 'char-top' },
        h('div', null, h('h3', { text: name }), h('div', { class: 'sub', text: (arch ? arch.name : '직접 만든 형사') + ' · 사르가 시민 경비대' + (s.vars.name_known ? ' 9분서' : '') })),
        h('div', { class: 'sub' }, '레벨 ' + s.level + ' · 경험치 ' + s.xp,
          h('div', { class: 'xpbar', title: '다음 레벨까지 ' + (100 - s.xp % 100) }, h('i', { style: 'width:' + (s.xp % 100) + '%' }))),
        h('div', { class: 'sub', html: '기술 포인트 <b style="color:var(--sodium-2)">' + s.points + '</b> · 체력 ' + Math.max(0, g.health()) + '/' + g.healthMax() + ' · 사기 ' + Math.max(0, g.morale()) + '/' + g.moraleMax() }));
      body.appendChild(top);
      const split = h('div', { class: 'split' });
      const grid = h('div', { class: 'attrs4' });
      if (!this.sel.skill) this.sel.skill = s.signature || 'LOGIC';
      for (const a of D.attrOrder) {
        const at = D.attrs[a];
        const col = h('div', { class: 'attrcol' });
        col.appendChild(h('div', { class: 'attrcol-h', style: 'color:' + at.color }, h('span', { class: 'an', text: at.name }), h('span', { class: 'av', text: String(s.attrs[a]) })));
        for (const sk of D.skillOrder[a]) {
          const def = D.skills[sk];
          const lv = g.level(sk), base = g.baseLevel(sk);
          const learned = s.learned[sk] || 0, cap = g.cap(sk);
          const pips = h('span', { class: 'learned', title: '배운 점수 ' + learned + ' / 한도 ' + cap, style: 'color:' + at.color });
          for (let i = 0; i < cap; i++) pips.appendChild(h('i', { class: i < learned ? 'on' : '' }));
          const plus = h('button', { class: 'plus', type: 'button', 'aria-label': def.name + ' 배우기', text: '+' });
          plus.disabled = !g.canLearn(sk);
          plus.addEventListener('click', (ev) => { ev.stopPropagation(); g.learn(sk); this.sel.skill = sk; this.flushQuiet(); });
          const row = h('div', { class: 'skillrow' + (this.sel.skill === sk ? ' on' : ''), role: 'button', tabindex: '0' },
            h('span', { class: 'sn' }, h('span', { text: def.name }), s.signature === sk ? h('span', { class: 'sig', text: '대표' }) : null),
            h('span', { style: 'display:flex;gap:8px;align-items:center' }, pips, h('span', { class: 'lv' + (lv > base ? ' up' : lv < base ? ' down' : ''), text: String(lv) })),
            plus);
          row.addEventListener('click', () => { this.sel.skill = sk; this.renderPanel(); });
          row.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); this.sel.skill = sk; this.renderPanel(); } });
          col.appendChild(row);
        }
        grid.appendChild(col);
      }
      split.appendChild(grid);
      const sk = this.sel.skill, def = D.skills[sk];
      const det = h('div', { class: 'detail' });
      det.appendChild(h('div', { class: 'd-k', text: D.attrs[def.attr].name + ' · ' + def.en, style: 'color:' + attrColor(def.attr) }));
      det.appendChild(h('div', { class: 'd-t', text: def.name }));
      det.appendChild(h('div', { class: 'd-q', text: def.tag }));
      det.appendChild(document.createTextNode('\n' + def.desc));
      const parts = [D.attrs[def.attr].name + ' ' + s.attrs[def.attr]];
      if (s.learned[sk]) parts.push('배움 +' + s.learned[sk]);
      if (s.signature === sk) parts.push('대표 기술 +1');
      for (const m of g.modSources(sk)) parts.push(m.label + ' ' + (m.v > 0 ? '+' : '−') + Math.abs(m.v));
      det.appendChild(h('div', { class: 'd-m', text: '레벨 ' + g.level(sk) + ' = ' + parts.join(' · ') + '\n패시브 판정 한계: 난이도 ' + (g.level(sk) + 6) + '까지' }));
      split.appendChild(det);
      body.appendChild(split);
      const al = h('div', { class: 'align-list' });
      for (const [k, label] of ALIGN.concat(COPS)) {
        const v = s.vars[k] || 0;
        if (v > 0) al.appendChild(h('span', null, label + ' ', h('b', { text: String(v) })));
      }
      if (al.childElementCount) { body.appendChild(h('div', { class: 'cat-h', text: '당신이 드러낸 성향' })); body.appendChild(al); }
    }

    flushQuiet() {
      // 패널 조작으로 생긴 로그 항목을 반영
      this.after();
    }

    /* 사고 캐비닛 */
    panelThought(body) {
      const g = this.game, s = g.s;
      body.appendChild(h('h3', { text: '사고 캐비닛' }));
      body.appendChild(h('div', { class: 'sub', text: '생각을 내면화하면 시간이 지나며 완성된다. 연구 중에는 대가가 따르고, 완성되면 영구적인 효과를 얻는다. 칸 ' + g.slotsUsed() + ' / ' + s.slots }));
      const slots = h('div', { class: 'slots' });
      const ids = Object.keys(s.thoughts);
      const occupied = ids.filter(id => s.thoughts[id].st !== 'known');
      for (let i = 0; i < s.slots; i++) {
        const id = occupied[i];
        if (!id) { slots.appendChild(h('div', { class: 'slot' }, h('span', { text: '빈 칸' }), h('span', { text: '아래 목록에서 생각을 골라 내면화하라.' }))); continue; }
        const t = s.thoughts[id], def = D.thoughts[id];
        const b = h('button', { class: 'slot filled' + (t.st === 'done' ? ' done' : ''), type: 'button' },
          h('span', { class: 'sn2', text: def.name }),
          t.st === 'done' ? h('span', { text: '완성' }) : h('span', null, h('span', { text: '남은 시간 ' + fmtDuration(def.time - t.t) }), h('div', { class: 'prog' }, h('i', { style: 'width:' + Math.min(100, t.t / def.time * 100) + '%' }))));
        b.addEventListener('click', () => { this.sel.thought = id; this.renderPanel(); });
        slots.appendChild(b);
      }
      if (s.points > 0 && s.slots < 10) {
        const b = h('button', { class: 'slot buy', type: 'button', text: '칸 늘리기 — 기술 포인트 1' });
        b.addEventListener('click', () => { g.buySlot(); this.flushQuiet(); });
        slots.appendChild(b);
      }
      body.appendChild(slots);
      const split = h('div', { class: 'split' });
      const list = h('div', { class: 'tlist' });
      if (!ids.length) list.appendChild(h('p', { class: 'empty-note', text: '아직 떠오른 생각이 없다. 사람들과 이야기하고, 세상을 들여다보라.' }));
      const order = { research: 0, known: 1, done: 2 };
      ids.sort((a, b) => order[s.thoughts[a].st] - order[s.thoughts[b].st]);
      if (!this.sel.thought || !s.thoughts[this.sel.thought]) this.sel.thought = ids[0];
      for (const id of ids) {
        const t = s.thoughts[id], def = D.thoughts[id];
        const st = t.st === 'done' ? ['완성', 'd'] : t.st === 'research' ? ['내면화 중', 'r'] : ['떠오른 생각', ''];
        const b = h('button', { class: 'titem' + (this.sel.thought === id ? ' on' : ''), type: 'button' }, h('span', { text: def.name }), h('span', { class: 'st ' + st[1], text: st[0] }));
        b.addEventListener('click', () => { this.sel.thought = id; this.renderPanel(); });
        list.appendChild(b);
      }
      split.appendChild(list);
      const det = h('div', { class: 'detail' });
      const id = this.sel.thought;
      if (id) {
        const t = s.thoughts[id], def = D.thoughts[id];
        det.appendChild(h('div', { class: 'd-k', text: t.st === 'done' ? '완성된 사고' : t.st === 'research' ? '내면화 중' : '떠오른 생각' }));
        det.appendChild(h('div', { class: 'd-t', text: def.name }));
        det.appendChild(document.createTextNode(t.st === 'done' ? def.solution : def.problem));
        const lines = [];
        lines.push('내면화에 걸리는 시간: ' + fmtDuration(def.time));
        if (def.research) lines.push('연구 중: ' + modText(def.research));
        let fin = modText(def.bonus);
        if (def.extra) fin = [fin].concat(Object.keys(def.extra).map(k => (k === 'health' ? '체력 최대치' : '사기 최대치') + ' +' + def.extra[k])).filter(Boolean).join(', ');
        lines.push('완성 후: ' + (fin || '특별한 효과 없음'));
        det.appendChild(h('div', { class: 'd-m', text: lines.join('\n') }));
        const acts = h('div', { class: 'd-a' });
        if (t.st === 'known') {
          const b = h('button', { class: 'btn small primary', type: 'button', text: '내면화한다' });
          b.disabled = g.slotsUsed() >= s.slots;
          b.addEventListener('click', () => { g.research(id); this.flushQuiet(); });
          acts.appendChild(b);
          if (b.disabled) acts.appendChild(h('span', { class: 'sub', text: '빈 칸이 없다.' }));
        } else if (t.st === 'research') {
          acts.appendChild(h('button', { class: 'btn small', type: 'button', text: '내면화를 멈춘다', onclick: () => { g.cancelResearch(id); this.flushQuiet(); } }));
        } else {
          const b = h('button', { class: 'btn small danger', type: 'button', text: '잊는다 — 기술 포인트 1' });
          b.disabled = s.points <= 0;
          b.addEventListener('click', () => { g.forgetThought(id); this.flushQuiet(); });
          acts.appendChild(b);
        }
        det.appendChild(acts);
      } else det.appendChild(h('p', { class: 'empty-note', text: '생각을 고르면 여기에 내용이 나타난다.' }));
      split.appendChild(det);
      body.appendChild(split);
    }

    /* 소지품 */
    panelInv(body) {
      const g = this.game, s = g.s;
      body.appendChild(h('h3', { text: '소지품' }));
      body.appendChild(h('div', { class: 'sub', text: '소지금 ' + U.fmtMoney(s.money) + ' 솔도 · 옷은 기술에 영향을 준다.' }));
      const split = h('div', { class: 'split' });
      const left = h('div');
      const sg = h('div', { class: 'slotgrid' });
      for (const [slot, label] of D.slots) {
        const id = s.equip[slot];
        const it = id ? D.items[id] : null;
        const b = h('button', { class: 'eqslot' + (it ? '' : ' empty') + (this.sel.item === id && id ? ' on' : ''), type: 'button' },
          h('span', { class: 'k', text: label }), h('span', { text: it ? it.name : '없음' }));
        if (it) b.addEventListener('click', () => { this.sel.item = id; this.renderPanel(); });
        sg.appendChild(b);
      }
      left.appendChild(sg);
      const counts = {};
      for (const id of s.items) counts[id] = (counts[id] || 0) + 1;
      const worn = new Set(Object.values(s.equip));
      for (const [cat, label] of D.itemCats) {
        const ids = Object.keys(counts).filter(id => D.items[id] && D.items[id].cat === cat);
        if (!ids.length) continue;
        left.appendChild(h('div', { class: 'cat-h', text: label }));
        const grid = h('div', { class: 'itemgrid' });
        for (const id of ids) {
          const it = D.items[id];
          const b = h('button', { class: 'it' + (worn.has(id) ? ' worn' : '') + (cat === 'evidence' ? ' ev' : '') + (this.sel.item === id ? ' on' : ''), type: 'button' },
            h('span', { text: it.name }), counts[id] > 1 ? h('span', { class: 'q', text: '×' + counts[id] }) : (worn.has(id) ? h('span', { class: 'q', text: '착용' }) : null));
          b.addEventListener('click', () => { this.sel.item = id; this.renderPanel(); });
          grid.appendChild(b);
        }
        left.appendChild(grid);
      }
      if (!s.items.length) left.appendChild(h('p', { class: 'empty-note', text: '가진 것이 없다. 속옷과 구두 한 짝 말고는.' }));
      split.appendChild(left);
      const det = h('div', { class: 'detail' });
      const id = this.sel.item && s.items.indexOf(this.sel.item) >= 0 ? this.sel.item : null;
      if (id) {
        const it = D.items[id];
        const catName = (D.itemCats.find(c => c[0] === it.cat) || [0, ''])[1];
        det.appendChild(h('div', { class: 'd-k', text: catName + (it.slot ? ' · ' + SLOT_NAMES[it.slot] : '') }));
        det.appendChild(h('div', { class: 'd-t', text: it.name }));
        det.appendChild(document.createTextNode(it.desc));
        if (it.mods) det.appendChild(h('div', { class: 'd-m', text: '착용 효과: ' + modText(it.mods) }));
        const acts = h('div', { class: 'd-a' });
        if (it.slot) {
          if (worn.has(id)) acts.appendChild(h('button', { class: 'btn small', type: 'button', text: '벗는다', onclick: () => { g.unequip(id); this.flushQuiet(); } }));
          else acts.appendChild(h('button', { class: 'btn small primary', type: 'button', text: '착용한다', onclick: () => { g.equip(id); this.flushQuiet(); } }));
        }
        if (it.use) {
          const b = h('button', { class: 'btn small primary', type: 'button', text: '사용한다' });
          b.disabled = g.halted;
          b.addEventListener('click', () => { g.useItem(id); this.after(); });
          acts.appendChild(b);
        }
        det.appendChild(acts);
      } else det.appendChild(h('p', { class: 'empty-note', text: '물건을 고르면 자세히 볼 수 있다.' }));
      split.appendChild(det);
      body.appendChild(split);
    }

    /* 일지 */
    panelJournal(body) {
      const g = this.game, s = g.s;
      const tab = this.panelTab === 'case' ? 'case' : 'tasks';
      const sw = h('div', { style: 'display:flex;gap:6px;margin-bottom:14px' },
        h('button', { class: 'btn small' + (tab === 'tasks' ? ' primary' : ''), type: 'button', text: '과제', onclick: () => { this.panelTab = 'tasks'; this.renderPanel(); } }),
        h('button', { class: 'btn small' + (tab === 'case' ? ' primary' : ''), type: 'button', text: '사건 기록', onclick: () => { this.panelTab = 'case'; this.renderPanel(); } }));
      body.appendChild(sw);
      if (tab === 'tasks') {
        const box = h('div', { class: 'tasks' });
        const ids = Object.keys(s.tasks);
        const rank = (id) => {
          const t = s.tasks[id], def = D.tasks[id];
          return (t.st === 'active' ? 0 : t.st === 'done' ? 2 : 3) - (def && def.main && t.st === 'active' ? 1 : 0);
        };
        ids.sort((a, b) => rank(a) - rank(b));
        if (!ids.length) box.appendChild(h('p', { class: 'empty-note', text: '아직 기록된 과제가 없다.' }));
        for (const id of ids) {
          const t = s.tasks[id], def = D.tasks[id];
          if (!def) continue;
          const st = t.st === 'active' ? '진행 중' : t.st === 'done' ? '완료' : '실패';
          box.appendChild(h('div', { class: 'task' + (def.main ? ' main' : '') + (t.st === 'done' ? ' done' : '') + (t.st === 'failed' ? ' failed' : '') },
            h('span', { class: 'tn', text: def.name }), h('span', { class: 'ts', text: st + ' · ' + t.day + '일차' }),
            h('p', { text: def.desc })));
        }
        body.appendChild(box);
      } else {
        const box = h('div', { class: 'case' });
        const groups = [];
        const byGroup = {};
        for (const c of D.casefile) {
          let ok = false;
          try { ok = g.test(c.cond); } catch (e) { ok = false; }
          if (!ok) continue;
          if (!byGroup[c.group]) groups.push(c.group);
          byGroup[c.group] = c;
        }
        if (!groups.length) box.appendChild(h('p', { class: 'empty-note', text: '사건에 대해 아는 것이 아직 없다. 당신은 사건이 있다는 것조차 모른다.' }));
        for (const gk of groups) {
          const c = byGroup[gk];
          box.appendChild(h('div', { class: 'case-item' }, h('div', { class: 'ct', text: c.title }), h('p', { text: c.text })));
        }
        body.appendChild(box);
      }
    }

    /* 메뉴 */
    panelMenu(body) {
      const grid = h('div', { class: 'menu-grid' });
      const saves = h('div');
      saves.appendChild(h('h3', { text: '저장과 불러오기' }));
      saves.appendChild(h('div', { class: 'sub', text: '기록은 이 브라우저에만 저장된다. 다른 기기로 옮기려면 내보내기를 쓰라.' }));
      const list = h('div', { class: 'saves', style: 'margin-top:12px' });
      const row = (key, label, canSave) => {
        const meta = this.slotMeta(key);
        const info = meta ? meta.day + '일차 ' + meta.clock + ' · ' + (meta.place || '') + ' · 레벨 ' + meta.level + ' · ' + new Date(meta.when).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '비어 있음';
        const acts = h('div', { class: 'acts' });
        if (canSave) acts.appendChild(h('button', { class: 'btn small', type: 'button', text: '저장', onclick: () => { if (this.saveSlot(key)) { this.toast(label + '에 저장했습니다.'); this.renderPanel(); } else this.toast('저장할 수 없습니다. 브라우저 저장소가 막혀 있을 수 있습니다.'); } }));
        const lb = h('button', { class: 'btn small', type: 'button', text: '불러오기', onclick: () => this.loadSlot(key) });
        lb.disabled = !meta;
        acts.appendChild(lb);
        list.appendChild(h('div', { class: 'saverow' }, h('div', null, h('div', { text: label }), h('div', { class: 'meta', text: info })), acts));
      };
      const canSave = !!this.game.s && !this.game.halted;
      row('auto', '자동 저장', false);
      for (let i = 1; i <= 5; i++) row('slot' + i, '슬롯 ' + i, canSave);
      saves.appendChild(list);
      grid.appendChild(saves);

      const ex = h('div');
      ex.appendChild(h('h3', { text: '내보내기 · 가져오기' }));
      const ta = h('textarea', { id: 'io-text', 'aria-label': '저장 데이터', placeholder: '여기에 저장 데이터를 붙여 넣고 가져오기를 누르세요.' });
      const msg = h('div', { class: 'msg' });
      const exBtn = h('button', { class: 'btn small', type: 'button', text: '현재 진행 내보내기' });
      exBtn.disabled = !canSave;
      exBtn.addEventListener('click', () => {
        const data = this.game.serialize();
        ta.value = data;
        const done = () => { msg.textContent = '클립보드에 복사했습니다. 안전한 곳에 붙여 넣어 보관하세요.'; };
        const fallback = () => { ta.focus(); ta.select(); msg.textContent = '텍스트를 선택했습니다. 복사해서 보관하세요.'; };
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(data).then(done, fallback);
          else fallback();
        } catch (e) { fallback(); }
      });
      const imBtn = h('button', { class: 'btn small', type: 'button', text: '가져오기', onclick: () => { if (ta.value.trim()) this.loadData(ta.value.trim()); else msg.textContent = '먼저 저장 데이터를 붙여 넣으세요.'; } });
      ex.appendChild(h('div', { class: 'sub', style: 'margin:.3em 0 .8em', text: '진행 상황을 텍스트로 옮긴다.' }));
      ex.appendChild(ta);
      ex.appendChild(h('div', { style: 'display:flex;gap:6px;margin-top:8px;flex-wrap:wrap' }, exBtn, imBtn));
      ex.appendChild(msg);

      ex.appendChild(h('h3', { text: '설정', style: 'margin-top:1.4em' }));
      const fs = h('select', { id: 'set-fs', 'aria-label': '글자 크기' });
      for (const [v, l] of [['small', '작게'], ['normal', '보통'], ['large', '크게'], ['xlarge', '아주 크게']]) {
        const o = h('option', { value: v, text: l });
        if (this.settings.fs === v) o.selected = true;
        fs.appendChild(o);
      }
      fs.addEventListener('change', () => { this.settings.fs = fs.value; this.applySettings(); });
      const an = h('select', { id: 'set-anim', 'aria-label': '글 나타나기 효과' });
      for (const [v, l] of [['1', '켜기'], ['0', '끄기 (즉시 표시)']]) {
        const o = h('option', { value: v, text: l });
        if ((this.settings.anim ? '1' : '0') === v) o.selected = true;
        an.appendChild(o);
      }
      an.addEventListener('change', () => { this.settings.anim = an.value === '1'; this.applySettings(); });
      ex.appendChild(h('div', { class: 'setting' }, h('label', { for: 'set-fs', text: '글자 크기' }), fs));
      ex.appendChild(h('div', { class: 'setting' }, h('label', { for: 'set-anim', text: '글 나타나기 효과' }), an));
      const quitBox = h('div', { class: 'confirm-row' });
      const quit = h('button', { class: 'btn small danger', type: 'button', text: '타이틀로 돌아가기' });
      quit.addEventListener('click', () => {
        quitBox.innerHTML = '';
        quitBox.appendChild(h('span', { text: '자동 저장한 뒤 타이틀로 돌아갑니다.' }));
        quitBox.appendChild(h('button', { class: 'btn small danger', type: 'button', text: '확인', onclick: () => { this.autosave(); this.closePanel(); this.showTitle(); } }));
        quitBox.appendChild(h('button', { class: 'btn small', type: 'button', text: '취소', onclick: () => this.renderPanel() }));
      });
      if (this.game.s) { ex.appendChild(h('div', { style: 'margin-top:1.2em' }, quit)); ex.appendChild(quitBox); }
      grid.appendChild(ex);
      body.appendChild(grid);
    }

    panelLoad(body) {
      const wasGame = this.game.s;
      this.panelMenu(body);
      if (!wasGame) body.querySelectorAll('.setting').forEach(e => e.remove());
    }

    panelAbout(body) {
      const txt = [
        ['탱고 레테', '레테 강 하구의 항구 지구 솔레아를 무대로 한 텍스트 수사 롤플레잉 게임이다. 당신은 모든 기억을 잃은 채 무도장 2층에서 깨어난 형사다. 크레인에 매달린 남자의 죽음을 조사하면서, 당신은 도시와 사람들과 당신 자신을 다시 알게 된다.'],
        ['24개의 목소리', '당신의 기술들은 머릿속에서 말을 한다. 논리는 모순을 짚고, 내해는 사물과 대화하고, 전기화학은 술을 권하고, 소름은 도시의 속삭임을 전한다. 기술이 충분히 높으면 대화 중에 저절로 끼어든다(패시브 판정).'],
        ['판정', '주사위 두 개(2d6)에 기술 레벨과 보정을 더해 난이도 이상이면 성공한다. 1·1은 무조건 실패, 6·6은 무조건 성공. 흰색 판정은 실패해도 기술을 올리면 다시 시도할 수 있다. 빨간색 판정은 단 한 번뿐이다.'],
        ['체력과 사기', '체력은 인내에, 사기는 의지에 따라 정해진다. 둘 중 하나라도 0이 되면 끝이다. 진통제, 담배, 음식, 술로 회복할 수 있다. 잠을 자면 조금 회복된다.'],
        ['사고 캐비닛', '대화 중에 떠오른 생각을 내면화할 수 있다. 시간이 지나면 완성되어 영구적인 효과를 준다. 연구 중에는 대가가 따른다.'],
        ['시간', '대화 선택지 하나에 2분, 장소 이동에 몇 분이 흐른다. 사람들은 시간에 따라 다른 곳에 있다. 개펄은 썰물 때만 걸어서 건널 수 있다. 밤이 깊으면 잠을 자야 한다. 사건에는 기한이 있다.'],
        ['조작', '숫자 키 1–9: 선택지 고르기 · 스페이스/엔터: 계속 · C 인물 · T 사고 · I 소지품 · J 일지 · Esc 메뉴'],
        ['이 게임에 대하여', '「디스코 엘리시움」의 구조에 대한 오마주로 만든 오리지널 작품이다. 세계, 인물, 사건, 문장은 모두 이 게임을 위해 새로 쓰였다.'],
      ];
      for (const [t, p] of txt) {
        body.appendChild(h('h3', { text: t, style: 'margin-top:.8em' }));
        body.appendChild(h('p', { text: p, style: 'max-width:44em;color:var(--paper-2)' }));
      }
    }
  }

  TL.UI = UI;
  TL.Store = Store;
})(typeof window !== 'undefined' ? window.TL : globalThis.TL);
