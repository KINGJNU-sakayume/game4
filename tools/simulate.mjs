// 탱고 레테 — 무작위 플레이 시뮬레이터
// 수많은 무작위 플레이를 돌려 예외, 막다른 길, 무한 루프를 찾고 노드 도달률을 잰다.
// 사용법: node tools/simulate.mjs [판수=200] [판당 최대 선택=2500] [--seed=N] [--verbose]
import { loadEngine } from './lib.mjs';

const args = process.argv.slice(2);
const runs = parseInt(args.find(a => /^\d+$/.test(a)) || '200', 10);
const maxSteps = parseInt(args.filter(a => /^\d+$/.test(a))[1] || '2500', 10);
const seedArg = args.find(a => a.startsWith('--seed='));
const verbose = args.includes('--verbose');
let seed = seedArg ? parseInt(seedArg.slice(7), 10) : 12345;

function rng() {
  seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

const { TL, errors } = loadEngine();
if (errors.length) { console.log('파싱 오류:\n' + errors.join('\n')); process.exit(1); }
TL.util.random = rng;
const C = TL.content;
const allNodes = Object.keys(C.nodes);
const visitedAll = new Set();
const endings = {};
const problems = [];
let totalChoices = 0;
const maxDay = { v: 0 };

const archetypes = TL.data.archetypes;
for (let r = 0; r < runs; r++) {
  const arch = archetypes[r % archetypes.length];
  const g = new TL.Game();
  const sigs = Object.keys(TL.data.skills);
  const sig = r % 3 === 0 ? sigs[Math.floor(rng() * sigs.length)] : arch.signature;
  let step = 0;
  const trail = [];
  try {
    g.newGame({ attrs: arch.attrs, signature: sig, archetype: arch.id, items: ['shoe_left'], equip: ['shoe_left'], money: 0, startMin: 9 * 60 + 40, start: 'intro' });
    while (step < maxSteps) {
      const p = g.prompt;
      if (!p) { problems.push(`#${r}: 프롬프트 없음 (노드 ${g.curNodeId()})`); break; }
      if (p.type === 'ending') { endings[p.id] = (endings[p.id] || 0) + 1; break; }
      if (p.type === 'continue') { g.cont(); step++; continue; }
      const enabled = p.items.map((it, i) => [it, i]).filter(([it]) => !it.disabled);
      if (!enabled.length) { problems.push(`#${r}: 고를 수 있는 선택지가 없음 (노드 ${g.curNodeId()})`); break; }
      // 가끔 기술을 배우고 사고를 내면화한다
      if (g.s.points > 0 && rng() < .5) {
        const sk = sigs[Math.floor(rng() * sigs.length)];
        if (g.canLearn(sk)) g.learn(sk);
      }
      for (const id in g.s.thoughts) if (g.s.thoughts[id].st === 'known' && rng() < .3) g.research(id);
      if (rng() < .03) {
        const uses = g.s.items.filter(id => TL.data.items[id].use);
        if (uses.length) g.useItem(uses[Math.floor(rng() * uses.length)]);
        if (g.halted || !g.prompt || g.prompt.type !== 'choices') continue;
      }
      if (rng() < .01) {
        const data = g.serialize();
        const g2 = new TL.Game();
        g2.load(data);
      }
      const cur = g.prompt.items.map((it, i) => [it, i]).filter(([it]) => !it.disabled);
      // 출구보다 대화를 선호하되, 가끔은 떠난다
      const talk = cur.filter(([it]) => !it.exit);
      const pool = talk.length && rng() < .8 ? talk : cur;
      const [it, idx] = pool[Math.floor(rng() * pool.length)];
      trail.push((C.blocks[g.cur.b] ? C.blocks[g.cur.b].node : '?') + ' → ' + it.text.slice(0, 24));
      if (trail.length > 12) trail.shift();
      g.choose(idx);
      totalChoices++;
      step++;
    }
  } catch (e) {
    problems.push(`#${r} (${arch.id}) 예외: ${e.message}\n    마지막 선택: ${trail.slice(-5).join(' | ')}`);
  }
  if (g.s) {
    for (const id in g.s.visits) visitedAll.add(id);
    maxDay.v = Math.max(maxDay.v, g.s.day);
  }
  if (verbose) console.log(`#${r} ${arch.id} 단계 ${step} 일차 ${g.s && g.s.day} 장소 ${g.s && g.s.loc} ${g.prompt && g.prompt.type}`);
}

const unvisited = allNodes.filter(id => !visitedAll.has(id));
console.log(`${runs}판, 선택 ${totalChoices.toLocaleString()}회, 최대 ${maxDay.v}일차`);
console.log(`노드 도달률 ${visitedAll.size}/${allNodes.length} (${(visitedAll.size / allNodes.length * 100).toFixed(1)}%)`);
console.log('결말:', JSON.stringify(endings));
if (verbose || unvisited.length < 80) console.log('한 번도 도달하지 못한 노드:', unvisited.join(', '));
if (problems.length) {
  const uniq = [...new Set(problems)];
  console.log(`\n문제 ${uniq.length}개:`);
  for (const p of uniq.slice(0, 40)) console.log('  ✗ ' + p);
  process.exit(1);
}
console.log('시뮬레이션 통과.');
