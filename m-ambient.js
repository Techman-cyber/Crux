// Ambient glow: dims the page and lights it with the colors of the video.
(() => {
const X = window.__crux; if (!X) return;
let st = null, auto = false;
const vid = () => { const vs = [...document.querySelectorAll('video')].filter(v => v.getBoundingClientRect().width > 300); return vs.find(v => !v.paused) || vs[0]; };
function start() {
  if (st) return;
  const u = X.ui('.d{position:fixed;inset:0;background:rgba(5,2,12,.84)}canvas{position:fixed;filter:blur(34px) saturate(1.7);opacity:.95;will-change:transform}', '<div class="d"></div><canvas width="32" height="18"></canvas>', 2147483000);
  u.host.style.cssText += 'inset:0;pointer-events:none;';
  const cv = u.root.querySelector('canvas'), cx = cv.getContext('2d');
  let raf, last = 0;
  const tick = t => {
    raf = requestAnimationFrame(tick); if (t - last < 110 || document.hidden) return; last = t;
    const v = vid(); if (!v) { u.host.style.visibility = 'hidden'; return; } u.host.style.visibility = '';
    const r = v.getBoundingClientRect(), p = .22;
    u.host.style.clipPath = `polygon(evenodd,0 0,100% 0,100% 100%,0 100%,0 0,${r.left}px ${r.top}px,${r.left}px ${r.bottom}px,${r.right}px ${r.bottom}px,${r.right}px ${r.top}px,${r.left}px ${r.top}px)`;
    Object.assign(cv.style, { left: r.left - r.width * p + 'px', top: r.top - r.height * p + 'px', width: r.width * (1 + 2 * p) + 'px', height: r.height * (1 + 2 * p) + 'px' });
    try { cx.drawImage(v, 0, 0, 32, 18); } catch {}
  };
  raf = requestAnimationFrame(tick);
  st = { stop() { cancelAnimationFrame(raf); u.remove(); st = null; } };
}
const stop = () => st && st.stop();
X.add('ambient', {
  auto(on) { clearInterval(window.__cruxAmb); if (!on) { auto && stop(); return; } window.__cruxAmb = setInterval(() => { const w = location.pathname === '/watch' && /youtube\.com$/.test(location.hostname); if (w && !st && vid()) { start(); auto = true; } else if (!w && auto && st) { stop(); auto = false; } }, 1500); },
  run() { st ? stop() : vid() ? start() : X.toast('No video found on this page yet. Press play, then try again.'); },
  prompts: () => vid() && !st ? [{ id: 'ambient', icon: '🌈', title: 'Ambient glow', pri: 5, text: 'Light up the room around this video, like a cinema?', actions: [['Turn on glow', start]] }] : []
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && st && !auto) stop(); });
})();
