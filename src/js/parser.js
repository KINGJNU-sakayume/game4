/* 탱고 레테 — 스크립트(.tl) 파서
 *
 * 문법 요약 (자세한 설명은 docs/SCRIPTING.md)
 *   === node_id @location name="이름" art=quay     노드 시작
 *   // 주석
 *   서술 문장                                      내레이션
 *   YUN: 대사                                      화자 대사 (화자 ID는 대문자)
 *   LOGIC[10]: 대사                                 패시브 판정 (기술+6 ≥ 10일 때만 표시)
 *   {조건} 아무 줄                                   조건부
 *   ~ 효과; 효과                                    효과
 *   -> node / -> END                                이동 / 대화 종료
 *   => location                                     장소 이동
 *   ->> node / <<-                                  터널 호출 / 복귀
 *   ---                                             "계속" 대기
 *   * 선택지 -> 대상                                 1회용 선택지
 *   + 선택지                                         반복 선택지
 *   * {조건} [LOGIC 10] 선택지 -> 성공 | 실패          흰색 판정
 *   * [!LOGIC 10 #id +1 flag "이유"] 선택지           빨간색 판정 + 보정
 *   * <ENCYCLOPEDIA 10> 선택지                        패시브로 열리는 선택지
 *     들여쓴 줄들                                    선택지 본문
 *     ?+ / ?-                                        판정 선택지의 성공/실패 본문
 *   -                                               선택지 묶음 뒤의 합류점(gather)
 */
(function (TL) {
  'use strict';
  const C = TL.content;
  const U = TL.util;

  const HEADER = /^===\s*([A-Za-z0-9_]+)\s*(.*)$/;
  const SPEAKER = /^([A-Z][A-Z0-9_]*)(?:\[(\d+)\])?\s*:\s?(.*)$/;
  const CHECK = /^\[(!?)([A-Z][A-Z0-9_]*)\s+(\d+)((?:\s+[^\]]*)?)\]\s*/;
  const GATE = /^<([A-Z][A-Z0-9_]*)\s+(\d+)>\s*/;

  function measureIndent(raw) {
    let n = 0;
    for (const ch of raw) {
      if (ch === ' ') n += 1;
      else if (ch === '\t') n += 2;
      else break;
    }
    return n;
  }

  function parseAttrs(s) {
    const attrs = {};
    const re = /@([A-Za-z_]\w*)|([A-Za-z_]\w*)=("([^"]*)"|\S+)/g;
    let m;
    while ((m = re.exec(s))) {
      if (m[1]) attrs[m[1]] = true;
      else attrs[m[2]] = m[4] !== undefined ? m[4] : m[3];
    }
    return attrs;
  }

  function takeCond(s) {
    if (s[0] === '{' && s[1] !== '{') {
      const end = s.indexOf('}');
      if (end < 0) throw new Error('닫히지 않은 조건 괄호');
      return [s.slice(1, end).trim(), s.slice(end + 1).trim()];
    }
    return [null, s];
  }
  function andCond(a, b) {
    if (!a) return b;
    if (!b) return a;
    return '(' + a + ') && (' + b + ')';
  }

  function parseMods(s) {
    const res = { id: null, mods: [], perDay: false };
    if (!s) return res;
    if (/%day\b/.test(s)) { res.perDay = true; s = s.replace(/%day\b/, ''); }
    const re = /#([A-Za-z0-9_]+)|([+-]\d+)\s+(\([^)]*\)|[A-Za-z_][A-Za-z0-9_.]*)(?:\s+"([^"]*)")?/g;
    let m;
    while ((m = re.exec(s))) {
      if (m[1]) res.id = m[1];
      else res.mods.push({ v: parseInt(m[2], 10), cond: m[3].replace(/^\(|\)$/g, ''), label: m[4] || '' });
    }
    return res;
  }

  function parseChoice(text) {
    const ch = { t: 'choice', sticky: text[0] === '+', text: '' };
    let s = text.slice(1).trim();
    let cond;
    [cond, s] = takeCond(s);
    if (cond) ch.cond = cond;
    let m = CHECK.exec(s);
    if (m) {
      const mm = parseMods(m[4]);
      ch.check = { red: m[1] === '!', skill: m[2], diff: +m[3], mods: mm.mods, id: mm.id, perDay: mm.perDay };
      s = s.slice(m[0].length);
    }
    m = GATE.exec(s);
    if (m) {
      ch.gate = { skill: m[1], diff: +m[2] };
      s = s.slice(m[0].length);
    }
    [cond, s] = takeCond(s);
    if (cond) ch.cond = andCond(ch.cond, cond);
    const arrow = s.lastIndexOf('->');
    const fat = s.lastIndexOf('=>');
    if (fat >= 0 && fat > arrow) {
      const parts = s.slice(fat + 2).trim().split(/\s+/);
      ch.goto = parts[0];
      if (parts[1]) ch.cost = parseInt(parts[1], 10);
      s = s.slice(0, fat).trim();
    } else if (arrow >= 0) {
      const tgt = s.slice(arrow + 2).trim();
      s = s.slice(0, arrow).trim();
      if (tgt.indexOf('|') >= 0) {
        const [a, b] = tgt.split('|').map(x => x.trim());
        if (a) ch.okTarget = a;
        if (b) ch.failTarget = b;
      } else ch.target = tgt;
    }
    ch.text = s.trim();
    return ch;
  }

  function parseStmt(text) {
    let cond = null, c2;
    for (;;) {
      [c2, text] = takeCond(text);
      if (!c2) break;
      cond = andCond(cond, c2);
    }
    let st;
    if (text === '---') st = { t: 'pause' };
    else if (text === '-' || text.startsWith('- ')) st = { t: 'gather', rest: text.slice(1).trim() };
    else if (text.startsWith('->>')) st = { t: 'tunnel', target: text.slice(3).trim() };
    else if (text === '<<-') st = { t: 'return' };
    else if (text.startsWith('->')) st = { t: 'divert', target: text.slice(2).trim() };
    else if (text.startsWith('=>')) {
      const parts = text.slice(2).trim().split(/\s+/);
      st = { t: 'goto', target: parts[0] };
      if (parts[1]) st.cost = parseInt(parts[1], 10);
    }
    else if (text.startsWith('~')) st = { t: 'fx', src: text.slice(1).trim(), fx: TL.fx.parse(text.slice(1)) };
    else if (/^[*+]\s/.test(text)) st = parseChoice(text);
    else if (text === '?+' || text === '?-') st = { t: 'branch', ok: text === '?+' };
    else {
      const m = SPEAKER.exec(text);
      if (m) st = { t: 'line', who: m[1], diff: m[2] ? +m[2] : 0, text: m[3] };
      else st = { t: 'line', who: null, text };
    }
    if (cond) st.cond = andCond(st.cond, cond);
    return st;
  }

  function lastStmt(block) {
    return block.stmts.length ? block.stmts[block.stmts.length - 1] : null;
  }

  /**
   * 스크립트를 파싱해 TL.content에 노드와 블록을 등록한다.
   * @param {string} src
   * @param {string} file
   */
  TL.script = function (src, file) {
    file = file || '(inline)';
    C.files.push(file);
    const lines = src.split(/\r?\n/);
    let node = null, stack = null, lineNo = 0;
    const where = () => file + ':' + lineNo;
    const fail = (msg) => { throw new Error(where() + ' — ' + msg); };

    function newBlock(id, owner) {
      if (C.blocks[id]) fail('중복 블록 ID ' + id);
      const b = { id, node: owner, stmts: [] };
      C.blocks[id] = b;
      return b;
    }

    function finishNode() {
      // 비어 있는 선택지 본문 정리, 판정 선택지 검사
      const visit = (block) => {
        for (const st of block.stmts) {
          if (st.t !== 'choices') continue;
          for (const ch of st.items) {
            const body = C.blocks[ch.body];
            if (ch.check) {
              if (body && body.stmts.length) {
                lineNo = ch.line;
                fail('판정 선택지의 본문은 ?+ / ?- 로 나누어야 한다');
              }
              if (body) { delete C.blocks[ch.body]; ch.body = null; }
              if (ch.okBlock) visit(C.blocks[ch.okBlock]);
              if (ch.failBlock) visit(C.blocks[ch.failBlock]);
            } else if (body && !body.stmts.length) {
              delete C.blocks[ch.body];
              ch.body = null;
            } else if (body) visit(body);
          }
        }
      };
      visit(C.blocks[node.block]);
      // 장소 노드의 허브 인덱스
      const blk = C.blocks[node.block];
      node.hubIndex = -1;
      for (let i = 0; i < blk.stmts.length; i++) {
        if (blk.stmts[i].t === 'choices') { node.hubIndex = i; break; }
      }
    }

    for (const raw of lines) {
      lineNo++;
      const text = raw.trim();
      if (!text || text.startsWith('//')) continue;
      const indent = measureIndent(raw);
      const h = HEADER.exec(text);
      if (h) {
        if (node) finishNode();
        const id = h[1];
        if (C.nodes[id]) fail('중복 노드 ID ' + id + ' (먼저 정의: ' + C.nodes[id].file + ')');
        const attrs = parseAttrs(h[2]);
        const block = newBlock(id, id);
        node = { id, attrs, block: id, file, line: lineNo };
        C.nodes[id] = node;
        stack = [{ block, owner: -1, choice: null, kind: 'node' }];
        continue;
      }
      if (!node) fail('노드(===) 밖에 내용이 있음: ' + text.slice(0, 30));
      while (stack.length > 1 && indent <= stack[stack.length - 1].owner) stack.pop();
      const top = stack[stack.length - 1];
      let st;
      try { st = parseStmt(text); } catch (e) { fail(e.message); }
      st.line = lineNo;

      if (st.t === 'branch') {
        const ch = top.choice;
        if (!ch || !ch.check || top.kind !== 'body') fail('?+ / ?- 는 판정 선택지 본문 안에서만 쓸 수 있다');
        const bid = ch.body + (st.ok ? '+' : '-');
        if (C.blocks[bid]) fail('같은 판정에 ' + (st.ok ? '?+' : '?-') + ' 가 두 번 있음');
        const b = newBlock(bid, node.id);
        if (st.ok) ch.okBlock = bid; else ch.failBlock = bid;
        stack.push({ block: b, owner: indent, choice: null, kind: 'branch' });
        continue;
      }
      if (st.t === 'choice') {
        let grp = lastStmt(top.block);
        if (!grp || grp.t !== 'choices' || grp.closed) {
          grp = { t: 'choices', items: [], gather: false, line: lineNo };
          top.block.stmts.push(grp);
        }
        const gi = top.block.stmts.length - 1;
        const idx = grp.items.length;
        const key = st.text + '|' + (st.target || st.goto || st.okTarget || '') + '|' + (st.check ? st.check.skill + st.check.diff : '');
        let id = top.block.id + '#' + U.hash(key);
        while (grp.items.some(o => o.id === id)) id += '_';
        st.id = id;
        if (st.check && !st.check.id) st.check.id = id;
        st.body = top.block.id + '/' + gi + '.' + idx;
        grp.items.push(st);
        const body = newBlock(st.body, node.id);
        stack.push({ block: body, owner: indent, choice: st, kind: 'body' });
        continue;
      }
      if (st.t === 'gather') {
        const grp = lastStmt(top.block);
        if (!grp || grp.t !== 'choices') fail('합류점(-) 앞에 선택지 묶음이 없음');
        if (grp.gather) fail('합류점(-)이 두 번 연속됨');
        grp.gather = true;
        grp.closed = true;
        if (st.rest) {
          let s2;
          try { s2 = parseStmt(st.rest); } catch (e) { fail(e.message); }
          s2.line = lineNo;
          if (s2.t === 'choice' || s2.t === 'gather' || s2.t === 'branch') fail('합류점 뒤에는 일반 문장만 올 수 있다');
          top.block.stmts.push(s2);
        }
        continue;
      }
      const last = lastStmt(top.block);
      if (last && last.t === 'choices') last.closed = true;
      top.block.stmts.push(st);
    }
    if (node) finishNode();
  };

  /** 전체 콘텐츠 초기화 (테스트용) */
  TL.resetContent = function () {
    C.nodes = Object.create(null);
    C.blocks = Object.create(null);
    C.files = [];
  };
})(typeof window !== 'undefined' ? window.TL : globalThis.TL);
