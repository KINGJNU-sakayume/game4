/* 탱고 레테 — 부팅 */
(function (TL) {
  'use strict';
  function boot(data) {
    if (TL.contentErrors && TL.contentErrors.length) {
      console.error('콘텐츠 오류:\n' + TL.contentErrors.join('\n'));
    }
    const ui = new TL.UI();
    TL.ui = ui;
    try {
      ui.init(data || {});
    } catch (e) {
      console.error(e);
      const pre = document.createElement('pre');
      pre.className = 'fatal';
      pre.textContent = '게임을 시작할 수 없습니다.\n' + (e && e.message ? e.message : String(e));
      document.body.appendChild(pre);
    }
  }
  const hot = window.claude && window.claude.hot;
  const start = (d) => {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => boot(d));
    else boot(d);
  };
  if (hot && typeof hot.ready === 'function') hot.ready(start);
  else start((hot && hot.data) || {});
})(window.TL);
