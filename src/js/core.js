/* 탱고 레테 — 코어: 네임스페이스, 유틸리티, 표현식 컴파일러 */
(function (root) {
  'use strict';
  const TL = root.TL = root.TL || {};
  TL.VERSION = '1.0.0';
  TL.SAVE_VERSION = 1;
  TL.content = TL.content || { nodes: Object.create(null), blocks: Object.create(null), files: [] };
  TL.data = TL.data || {};

  /* ---------------- 유틸리티 ---------------- */
  const U = TL.util = {};
  U.hash = function (str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h.toString(36);
  };
  U.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  U.fmtMoney = function (cents) {
    const neg = cents < 0;
    const c = Math.abs(Math.round(cents));
    return (neg ? '−' : '') + Math.floor(c / 100) + '.' + String(c % 100).padStart(2, '0');
  };
  U.fmtClock = function (min) {
    const m = ((Math.floor(min) % 1440) + 1440) % 1440;
    return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
  };
  U.escapeHtml = function (s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  };
  /** 간단한 마크업: **굵게**, *기울임* */
  U.markup = function (s) {
    return U.escapeHtml(s)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>');
  };
  U.plain = function (s) {
    return String(s).replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1');
  };
  U.random = Math.random;
  U.roll = () => 1 + Math.floor(U.random() * 6);

  /* ---------------- 표현식 컴파일러 ----------------
   * 조건과 보간에 쓰는 작은 언어.
   *   식별자      → $.v("이름")  (변수, 특수 값, 기술 레벨)
   *   식별자(…)   → $.fn("이름")(…)
   *   18:30       → 1110 (자정부터의 분)
   *   and/or/not  → && || !
   */
  const TOKEN = /\s*(?:(\d{1,2}:\d{2})(?!\d)|(\d+(?:\.\d+)?)|("(?:[^"\\]|\\.)*")|([A-Za-z_][A-Za-z0-9_.]*)|(&&|\|\||==|!=|>=|<=|[-+*\/%<>!(),?:]))/y;
  const WORD_OPS = { and: '&&', or: '||', not: '!' };
  const LITERALS = { true: 'true', false: 'false', null: 'null' };
  const FUNCS = ['pass', 'chance', 'min', 'max', 'abs'];

  function tokenize(src) {
    const out = [];
    const s = src.trim();
    let pos = 0;
    while (pos < s.length) {
      TOKEN.lastIndex = pos;
      const m = TOKEN.exec(s);
      if (!m) throw new Error('표현식을 해석할 수 없음: «' + src + '» (위치 ' + pos + ')');
      pos = TOKEN.lastIndex;
      if (m[1] !== undefined) {
        const [h, mm] = m[1].split(':').map(Number);
        out.push({ k: 'num', v: String(h * 60 + mm) });
      } else if (m[2] !== undefined) out.push({ k: 'num', v: m[2] });
      else if (m[3] !== undefined) out.push({ k: 'str', v: m[3] });
      else if (m[4] !== undefined) out.push({ k: 'id', v: m[4] });
      else if (m[5] !== undefined) out.push({ k: 'op', v: m[5] });
      // 뒤따르는 공백만 남은 경우
      if (/^\s*$/.test(s.slice(pos))) break;
    }
    return out;
  }

  const cache = new Map();
  function compile(src) {
    let fn = cache.get(src);
    if (fn) return fn;
    const toks = tokenize(src);
    const parts = [];
    for (let i = 0; i < toks.length; i++) {
      const t = toks[i];
      if (t.k === 'id') {
        const next = toks[i + 1];
        if (WORD_OPS[t.v]) parts.push(WORD_OPS[t.v]);
        else if (LITERALS[t.v]) parts.push(LITERALS[t.v]);
        else if (next && next.k === 'op' && next.v === '(') {
          if (FUNCS.indexOf(t.v) < 0) throw new Error('알 수 없는 함수: ' + t.v + ' in «' + src + '»');
          parts.push('$.fn(' + JSON.stringify(t.v) + ')');
        } else parts.push('$.v(' + JSON.stringify(t.v) + ')');
      } else parts.push(t.v);
    }
    const code = '"use strict"; return (' + parts.join(' ') + ');';
    try {
      fn = new Function('$', code);
    } catch (e) {
      throw new Error('표현식 문법 오류: «' + src + '» — ' + e.message);
    }
    cache.set(src, fn);
    return fn;
  }
  /** 표현식에 쓰인 식별자 목록 (검증용) */
  function identifiers(src) {
    const toks = tokenize(src);
    const ids = [];
    for (let i = 0; i < toks.length; i++) {
      const t = toks[i];
      if (t.k !== 'id' || WORD_OPS[t.v] || LITERALS[t.v]) continue;
      const next = toks[i + 1];
      if (next && next.k === 'op' && next.v === '(') ids.push({ fn: t.v });
      else ids.push({ id: t.v });
    }
    return ids;
  }
  TL.expr = { compile, tokenize, identifiers, FUNCS };

  /* ---------------- 효과(~) 파서 ----------------
   * 세미콜론으로 구분. 따옴표 안의 세미콜론은 무시.
   */
  function splitEffects(s) {
    const out = [];
    let cur = '', q = false;
    for (const ch of s) {
      if (ch === '"') q = !q;
      if (ch === ';' && !q) { if (cur.trim()) out.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    if (cur.trim()) out.push(cur.trim());
    return out;
  }
  const NUM = '([+-]?\\d+(?:\\.\\d+)?)';
  const FX_RULES = [
    [/^set\s+([A-Za-z_]\w*)\s*$/, m => ({ op: 'set', name: m[1], expr: 'true' })],
    [/^set\s+([A-Za-z_]\w*)\s*=\s*(.+)$/, m => ({ op: 'set', name: m[1], expr: m[2] })],
    [/^unset\s+([A-Za-z_]\w*)$/, m => ({ op: 'unset', name: m[1] })],
    [new RegExp('^money\\s+' + NUM + '$'), m => ({ op: 'money', n: Math.round(parseFloat(m[1]) * 100) })],
    [/^money\s*(\+=|-=)\s*(.+)$/, m => ({ op: 'moneyx', mode: m[1], expr: m[2] })],
    [new RegExp('^health\\s+' + NUM + '(\\s+soft)?$'), m => ({ op: 'health', n: parseInt(m[1], 10), soft: !!m[2] })],
    [new RegExp('^morale\\s+' + NUM + '(\\s+soft)?$'), m => ({ op: 'morale', n: parseInt(m[1], 10), soft: !!m[2] })],
    [new RegExp('^xp\\s+' + NUM + '$'), m => ({ op: 'xp', n: parseInt(m[1], 10) })],
    [new RegExp('^time\\s+' + NUM + '$'), m => ({ op: 'time', n: parseInt(m[1], 10) })],
    [/^item\s+(add|remove|give|take|takeall)\s+([A-Za-z0-9_]+)$/, m => ({ op: 'item', mode: m[1], id: m[2] })],
    [/^(equip|unequip)\s+([A-Za-z0-9_]+)$/, m => ({ op: m[1], id: m[2] })],
    [/^thought\s+([A-Za-z0-9_]+)$/, m => ({ op: 'thought', id: m[1] })],
    [/^task\s+(add|done|fail)\s+([A-Za-z0-9_]+)$/, m => ({ op: 'task', mode: m[1], id: m[2] })],
    [/^buff\s+([A-Z_]+)\s+([+-]\d+)\s+(\d+)$/, m => ({ op: 'buff', skill: m[1], d: parseInt(m[2], 10), min: parseInt(m[3], 10) })],
    [/^notify\s+"(.*)"$/, m => ({ op: 'notify', text: m[1] })],
    [/^ending\s+([A-Za-z0-9_]+)$/, m => ({ op: 'ending', id: m[1] })],
    [/^sleep(?:\s+(\d{1,2}):(\d{2}))?$/, m => ({ op: 'sleep', wake: m[1] ? (+m[1] * 60 + +m[2]) : 480 })],
    [/^heal$/, () => ({ op: 'heal' })],
    [/^waittide$/, () => ({ op: 'waittide' })],
    [/^wait\s+(\d{1,2}):(\d{2})$/, m => ({ op: 'wait', at: +m[1] * 60 + +m[2] })],
    [/^loc\s+([A-Za-z0-9_]+)$/, m => ({ op: 'loc', id: m[1] })],
    [/^art\s+([A-Za-z0-9_]+)$/, m => ({ op: 'art', id: m[1] })],
    [/^ambient\s+"(.*)"$/, m => ({ op: 'ambient', text: m[1] })],
    [/^([A-Za-z_]\w*)\s*(\+=|-=|=)\s*(.+)$/, m => ({ op: 'assign', name: m[1], mode: m[2], expr: m[3] })],
  ];
  function parseEffects(src) {
    return splitEffects(src).map(part => {
      for (const [re, make] of FX_RULES) {
        const m = re.exec(part);
        if (m) return make(m);
      }
      throw new Error('알 수 없는 효과: «' + part + '»');
    });
  }
  TL.fx = { parse: parseEffects };
})(typeof window !== 'undefined' ? window : globalThis);
