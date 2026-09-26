// 탱고 레테 — Node 도구 공용 로더
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** 브라우저와 Node 양쪽에서 쓰는 엔진/데이터 파일 (로드 순서 중요) */
export const ENGINE_FILES = [
  'src/js/core.js',
  'src/js/parser.js',
  'src/js/data/skills.js',
  'src/js/data/speakers.js',
  'src/js/data/items.js',
  'src/js/data/thoughts.js',
  'src/js/data/tasks.js',
  'src/js/data/casefile.js',
  'src/js/data/endings.js',
  'src/js/engine.js',
];
/** 브라우저 전용 파일 */
export const UI_FILES = [
  'src/js/art.meta.js',
  'src/js/art.js',
  'src/js/audio.js',
  'src/js/ui.js',
  'src/js/main.js',
];
export const ART_META = 'src/js/art.meta.js';
export const CONTENT_BUNDLE = 'src/js/content.bundle.js';

export function contentFiles() {
  const dir = path.join(ROOT, 'content');
  return fs.readdirSync(dir).filter(f => f.endsWith('.tl')).sort().map(f => path.join('content', f));
}

export function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

/**
 * 엔진과 데이터를 격리된 VM 컨텍스트에 불러온다.
 * @param {{content?: boolean}} opts
 */
export function loadEngine(opts = {}) {
  const ctx = { console, Math, Date, JSON };
  ctx.window = ctx;
  vm.createContext(ctx);
  for (const f of ENGINE_FILES) {
    vm.runInContext(read(f), ctx, { filename: f });
  }
  const errors = [];
  if (opts.content !== false) {
    for (const f of contentFiles()) {
      try {
        ctx.TL.script(read(f), path.basename(f));
      } catch (e) {
        errors.push(e.message);
      }
    }
  }
  return { TL: ctx.TL, errors, ctx };
}
