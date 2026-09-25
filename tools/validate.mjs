// 탱고 레테 — 콘텐츠 검증기
// 모든 .tl 파일을 파싱하고, 이동 대상/화자/기술/아이템/사고/과제/조건식/효과를 검사한다.
// 사용법: node tools/validate.mjs [--strict] [--vars]
import { loadEngine, contentFiles, read } from './lib.mjs';

const strict = process.argv.includes('--strict');
const showVars = process.argv.includes('--vars');
const { TL, errors: parseErrors } = loadEngine();
const C = TL.content, D = TL.data;
const errors = [...parseErrors];
const warnings = [];

const nodes = C.nodes;
const isLoc = id => nodes[id] && nodes[id].attrs.location;
const SPECIAL_VALUES = new Set(['money', 'day', 'hour', 'min', 'time', 'clock', 'abstime', 'health', 'morale', 'healthMax', 'moraleMax', 'level', 'xp', 'points', 'first', 'lowtide', 'night', 'loc', 'archetype', 'signature']);
const PREFIX = {
  visits: 'node', seen: 'node', event: 'node',
  has: 'item', wear: 'item', count: 'item',
  thought: 'thought', known: 'thought', researching: 'thought',
  task: 'task', done: 'task', active: 'task',
  skill: 'skill', attr: 'attr',
  check: 'check', failed: 'check', tried: 'check', used: 'any',
};

// 명시적 판정 ID 수집
const checkIds = new Set();
for (const bid in C.blocks) {
  for (const st of C.blocks[bid].stmts) {
    if (st.t === 'choices') for (const ch of st.items) if (ch.check) checkIds.add(ch.check.id);
  }
}

const varsRead = new Map();   // name -> first location
const varsSet = new Map();

function where(blockId, st) {
  const b = C.blocks[blockId];
  const n = b && nodes[b.node];
  return (n ? n.file : '?') + ':' + (st && st.line ? st.line : n ? n.line : '?') + ' [' + (b ? b.node : blockId) + ']';
}

function checkRef(kind, id, loc) {
  const ok = {
    node: () => !!nodes[id],
    item: () => !!D.items[id],
    thought: () => !!D.thoughts[id],
    task: () => !!D.tasks[id],
    skill: () => !!D.skills[id],
    attr: () => !!D.attrs[id],
    check: () => checkIds.has(id),
    any: () => true,
  }[kind];
  if (!ok()) errors.push(`${loc}: 알 수 없는 ${kind} 참조 «${id}»`);
}

function checkExpr(src, loc) {
  if (src == null) return;
  try {
    TL.expr.compile(src);
    for (const t of TL.expr.identifiers(src)) {
      if (t.fn) continue;
      const id = t.id;
      const dot = id.indexOf('.');
      if (dot > 0) {
        const pre = id.slice(0, dot), rest = id.slice(dot + 1);
        if (!PREFIX[pre]) { errors.push(`${loc}: 알 수 없는 접두사 «${pre}» in «${src}»`); continue; }
        checkRef(PREFIX[pre], rest, loc);
      } else if (SPECIAL_VALUES.has(id) || D.skills[id]) {
        // ok
      } else if (!varsRead.has(id)) varsRead.set(id, loc);
    }
  } catch (e) {
    errors.push(`${loc}: ${e.message}`);
  }
}

function checkText(text, loc) {
  const re = /\{\{(.+?)\}\}/g;
  let m;
  while ((m = re.exec(text))) checkExpr(m[1], loc);
  if (/[{}]/.test(text.replace(re, ''))) warnings.push(`${loc}: 텍스트에 짝 없는 중괄호 «${text.slice(0, 40)}»`);
}

function checkFx(fx, loc) {
  for (const f of fx) {
    switch (f.op) {
      case 'set': varsSet.set(f.name, loc); if (f.expr !== 'true') checkExpr(f.expr, loc); break;
      case 'unset': varsSet.set(f.name, loc); break;
      case 'assign': varsSet.set(f.name, loc); checkExpr(f.expr, loc); if (f.name === 'money') errors.push(`${loc}: money는 변수가 아니다 — "money += 식" 또는 "money -5"를 써라`); break;
      case 'moneyx': checkExpr(f.expr, loc); break;
      case 'item': case 'equip': case 'unequip': checkRef('item', f.id, loc); break;
      case 'thought': checkRef('thought', f.id, loc); break;
      case 'task': checkRef('task', f.id, loc); break;
      case 'buff': checkRef('skill', f.skill, loc); break;
      case 'ending': if (!D.endings[f.id]) errors.push(`${loc}: 알 수 없는 결말 «${f.id}»`); break;
      case 'loc': if (!isLoc(f.id)) errors.push(`${loc}: loc 대상이 장소가 아님 «${f.id}»`); break;
      case 'art': if (!TL_RECIPES.has(f.id)) warnings.push(`${loc}: 알 수 없는 장면 «${f.id}»`); break;
      case 'notify': case 'ambient': checkText(f.text, loc); break;
    }
  }
}

// 장면 레시피 목록 (scene.js는 DOM 없이 실행 불가 → 정규식으로 추출)
const TL_RECIPES = new Set();
{
  const src = read('src/js/scene.js');
  const re = /RECIPES\.([A-Za-z0-9_]+)\s*=/g;
  let m;
  while ((m = re.exec(src))) TL_RECIPES.add(m[1]);
}

function checkTarget(t, loc) {
  if (t === 'END' || t === 'HUB') return;
  if (!nodes[t]) errors.push(`${loc}: 없는 노드로 이동 «${t}»`);
}

const reach = new Set();
const edges = new Map();
function addEdge(from, to) {
  if (!to || to === 'END' || to === 'HUB') return;
  if (!edges.has(from)) edges.set(from, new Set());
  edges.get(from).add(to);
}

let lineCount = 0, charCount = 0, choiceCount = 0, checkCount = 0, passiveCount = 0;
for (const bid in C.blocks) {
  const b = C.blocks[bid];
  for (const st of b.stmts) {
    const loc = where(bid, st);
    if (st.cond) checkExpr(st.cond, loc);
    switch (st.t) {
      case 'line': {
        lineCount++;
        charCount += st.text.length;
        if (st.who) {
          if (!D.skills[st.who] && !D.speakers[st.who]) errors.push(`${loc}: 알 수 없는 화자 «${st.who}»`);
          if (st.diff && !D.skills[st.who]) errors.push(`${loc}: 패시브 판정은 기술 화자만 가능 «${st.who}»`);
          if (st.diff) passiveCount++;
        }
        checkText(st.text, loc);
        if (!st.text.trim()) warnings.push(`${loc}: 빈 대사`);
        break;
      }
      case 'fx': checkFx(st.fx, loc); break;
      case 'divert': checkTarget(st.target, loc); addEdge(b.node, st.target); break;
      case 'tunnel': checkTarget(st.target, loc); addEdge(b.node, st.target); break;
      case 'goto':
        if (!isLoc(st.target)) errors.push(`${loc}: => 대상이 장소가 아님 «${st.target}»`);
        addEdge(b.node, st.target);
        break;
      case 'choices':
        for (const ch of st.items) {
          choiceCount++;
          const cl = where(bid, ch);
          charCount += ch.text.length;
          if (!ch.text) errors.push(`${cl}: 빈 선택지`);
          if (ch.cond) checkExpr(ch.cond, cl);
          checkText(ch.text, cl);
          if (ch.check) {
            checkCount++;
            checkRef('skill', ch.check.skill, cl);
            for (const m of ch.check.mods) checkExpr(m.cond, cl);
            if (!ch.okBlock && !ch.okTarget && !ch.target) warnings.push(`${cl}: 판정 성공 시 갈 곳이 없음 (선택지 묶음으로 돌아감)`);
          }
          if (ch.gate) checkRef('skill', ch.gate.skill, cl);
          for (const t of [ch.target, ch.okTarget, ch.failTarget]) if (t) { checkTarget(t, cl); addEdge(b.node, t); }
          if (ch.goto) {
            if (!isLoc(ch.goto)) errors.push(`${cl}: => 대상이 장소가 아님 «${ch.goto}»`);
            addEdge(b.node, ch.goto);
          }
        }
        break;
    }
  }
}

// 장소 노드 검사
for (const id in nodes) {
  const n = nodes[id];
  if (n.attrs.location) {
    if (n.hubIndex < 0) { errors.push(`${n.file}:${n.line}: 장소 «${id}»에 선택지가 없음`); continue; }
    const grp = C.blocks[n.block].stmts[n.hubIndex];
    const safe = grp.items.some(ch => ch.sticky && !ch.cond && !ch.check && ch.goto);
    if (!safe) warnings.push(`${n.file}:${n.line}: 장소 «${id}»에 조건 없는 반복 출구(+ ... => 장소)가 없음`);
    if (!n.attrs.name) warnings.push(`${n.file}:${n.line}: 장소 «${id}»에 name 속성이 없음`);
    if (n.attrs.art && !TL_RECIPES.has(n.attrs.art)) warnings.push(`${n.file}:${n.line}: 장소 «${id}»의 장면 «${n.attrs.art}»이 없음`);
    if (!n.attrs.art && !TL_RECIPES.has(id)) warnings.push(`${n.file}:${n.line}: 장소 «${id}»의 기본 장면이 없음`);
  }
  if (n.attrs.event) {
    if (n.attrs.when) checkExpr(n.attrs.when, `${n.file}:${n.line} [${id} when]`);
    if (n.attrs.at) for (const l of n.attrs.at.split(',')) if (!isLoc(l)) errors.push(`${n.file}:${n.line}: 이벤트 at 대상이 장소가 아님 «${l}»`);
  }
  if (n.attrs.art && !TL_RECIPES.has(n.attrs.art)) warnings.push(`${n.file}:${n.line}: 노드 «${id}»의 장면 «${n.attrs.art}»이 없음`);
}

// 도달 가능성
const roots = ['intro', 'death_health', 'death_morale'].filter(id => nodes[id]);
for (const id in nodes) if (nodes[id].attrs.event) roots.push(id);
const stack = [...roots];
while (stack.length) {
  const id = stack.pop();
  if (reach.has(id)) continue;
  reach.add(id);
  for (const t of edges.get(id) || []) stack.push(t);
}
for (const id in nodes) if (!reach.has(id)) warnings.push(`${nodes[id].file}:${nodes[id].line}: 도달할 수 없는 노드 «${id}»`);
if (!nodes.intro) errors.push('시작 노드 «intro»가 없음');

// 변수 교차 검사
for (const [name, loc] of varsRead) {
  if (!varsSet.has(name) && !/^(yun_named|name_known)$/.test(name)) warnings.push(`${loc}: 읽기만 하고 설정하지 않는 변수 «${name}» (오타?)`);
}
// 화자 이름 함수가 참조하는 플래그도 '읽기'로 친다
const speakerFlags = new Set();
for (const k in D.speakers) {
  const n = D.speakers[k].name;
  if (typeof n === 'function') {
    const m = String(n).match(/'([a-z_]+)'/g) || [];
    for (const x of m) speakerFlags.add(x.replace(/'/g, ''));
  }
}
for (const f of speakerFlags) if (!varsSet.has(f)) warnings.push(`speakers.js: 화자 이름 플래그 «${f}»를 설정하는 곳이 없음`);
if (showVars) {
  const unused = [...varsSet.keys()].filter(n => !varsRead.has(n) && !speakerFlags.has(n));
  console.log('설정만 하고 읽지 않는 변수:', unused.sort().join(', '));
}

// 캐스파일, 아이템, 과제 참조 검사
for (const c of D.casefile) checkExpr(c.cond, 'casefile.js [' + c.group + ']');
for (const id in D.items) {
  const it = D.items[id];
  if (it.use) { try { const fx = TL.fx.parse(it.use); checkFx(fx, 'items.js [' + id + ']'); } catch (e) { errors.push('items.js [' + id + ']: ' + e.message); } }
  for (const k in it.mods || {}) if (!D.skills[k]) errors.push('items.js [' + id + ']: 알 수 없는 기술 ' + k);
}
for (const id in D.thoughts) {
  const t = D.thoughts[id];
  for (const k of ['research', 'bonus']) for (const s in t[k] || {}) if (!D.skills[s]) errors.push('thoughts.js [' + id + ']: 알 수 없는 기술 ' + s);
}

// 사용되지 않은 데이터
const allSrc = contentFiles().map(read).join('\n');
for (const id in D.thoughts) if (!allSrc.includes('thought ' + id)) warnings.push(`thoughts.js: 스크립트에서 얻을 수 없는 사고 «${id}»`);
for (const id in D.tasks) if (!allSrc.includes('task add ' + id)) warnings.push(`tasks.js: 스크립트에서 추가되지 않는 과제 «${id}»`);
for (const id in D.items) if (!allSrc.includes(id)) warnings.push(`items.js: 스크립트에서 쓰이지 않는 아이템 «${id}»`);
for (const id in D.endings) if (id !== 'death' && !allSrc.includes('ending ' + id)) warnings.push(`endings.js: 스크립트에서 쓰이지 않는 결말 «${id}»`);

// 출력
const nodeCount = Object.keys(nodes).length;
const locCount = Object.values(nodes).filter(n => n.attrs.location).length;
const totalChars = allSrc.length;
console.log(`노드 ${nodeCount}개 (장소 ${locCount}), 대사/서술 ${lineCount}줄, 선택지 ${choiceCount}개 (판정 ${checkCount}, 패시브 ${passiveCount})`);
console.log(`스크립트 총 ${totalChars.toLocaleString()}자, 대사·선택지 본문 ${charCount.toLocaleString()}자`);
if (warnings.length) {
  console.log(`\n경고 ${warnings.length}개:`);
  for (const w of warnings.slice(0, strict ? 1000 : 60)) console.log('  ! ' + w);
  if (!strict && warnings.length > 60) console.log(`  … 그 외 ${warnings.length - 60}개 (--strict 로 모두 보기)`);
}
if (errors.length) {
  console.log(`\n오류 ${errors.length}개:`);
  for (const e of errors) console.log('  ✗ ' + e);
  process.exit(1);
}
console.log('\n검증 통과.');
if (strict && warnings.length) process.exit(2);
