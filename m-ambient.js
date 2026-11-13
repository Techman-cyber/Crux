// Ambient glow with full controls: blur, light, color richness, glow size, dimming, smoothness, refresh rate, color mode.
(() => {
const X = window.__crux; if (!X) return;
const DEF = { blur: 34, light: 100, sat: 170, spread: 22, dim: 84, smooth: 35, fps: 10, mode: 'video', color: '#8b3dff', tint: 60 };
const PRESETS = { Cinema: {}, Subtle: { blur: 60, light: 70, sat: 130, spread: 14, dim: 55, smooth: 55 }, Party: { blur: 20, light: 150, sat: 260, spread: 38, dim: 92, smooth: 15, fps: 16 }, 'Warm night': { mode: 'warm', tint: 70, light: 85, blur: 50, dim: 80, sat: 140 }, 'Dark room': { dim: 97, light: 120, blur: 40, spread: 26 } };
let S = { ...DEF, ...(X.pref('ambient') || {}) }, st = null, auto = false, cp = null, saveT = 0;
const vid = () => { const vs = [...document.querySelectorAll('video')].filter(v => v.getBoundingClientRect().width > 300); return vs.find(v => !v.paused) || vs[0]; };
const save = () => { clearTimeout(saveT); saveT = setTimeout(() => X.setPref('ambient', S), 400); };
const TINT = { warm: '#ff9a3c', cool: '#4aa8ff' };
function start() {
  if (st) return;
  const u = X.ui('.d{position:fixed;inset:0}canvas{position:fixed;will-change:transform}', '<div class="d"></div><canvas width="32" height="18"></canvas>', 2147483000);
  u.host.style.cssText += 'inset:0;pointer-events:none;';
  const cv = u.root.querySelector('canvas'), dm = u.root.querySelector('.d'), cx = cv.getContext('2d'); let raf, last = 0;
  const apply = () => { dm.style.background = `rgba(5,2,12,${S.dim / 100})`; cv.style.filter = `blur(${S.blur}px) saturate(${S.sat}%) brightness(${S.light}%)`; cv.style.opacity = Math.min(1, .35 + S.light / 160); };
  const tick = t => {
    raf = requestAnimationFrame(tick); if (t - last < 1000 / S.fps || document.hidden) return; last = t;
    const v = vid(); if (!v) { u.host.style.visibility = 'hidden'; return; } u.host.style.visibility = '';
    const r = v.getBoundingClientRect(), p = S.spread / 100;
    u.host.style.clipPath = `polygon(evenodd,0 0,100% 0,100% 100%,0 100%,0 0,${r.left}px ${r.top}px,${r.left}px ${r.bottom}px,${r.right}px ${r.bottom}px,${r.right}px ${r.top}px,${r.left}px ${r.top}px)`;
    Object.assign(cv.style, { left: r.left - r.width * p + 'px', top: r.top - r.height * p + 'px', width: r.width * (1 + 2 * p) + 'px', height: r.height * (1 + 2 * p) + 'px' });
    try { cx.globalAlpha = 1 - S.smooth / 100; cx.globalCompositeOperation = 'source-over'; cx.drawImage(v, 0, 0, 32, 18); if (S.mode !== 'video') { cx.globalAlpha = S.tint / 100; cx.globalCompositeOperation = 'color'; cx.fillStyle = S.mode === 'custom' ? S.color : TINT[S.mode]; cx.fillRect(0, 0, 32, 18); } cx.globalAlpha = 1; cx.globalCompositeOperation = 'source-over'; } catch { }
  };
  apply(); raf = requestAnimationFrame(tick);
  st = { apply, stop() { cancelAnimationFrame(raf); u.remove(); st = null; } };
}
const stop = () => { st && st.stop(); };
const setS = (k, v) => { S[k] = v; st && st.apply(); save(); };
function panel() {
  if (cp) { cp.remove(); cp = null; return; } if (!st && vid()) start();
  const css = `.b{position:fixed;right:16px;bottom:16px;width:310px;max-height:86vh;overflow:auto;background:#0b0618f7;color:#efe3ff;border:1px solid #8b3dff;border-radius:16px;box-shadow:0 10px 40px #000a;padding:12px 14px}.h{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}.h b{font-size:15px}button{background:#8b3dff22;border:1px solid #8b3dff;border-radius:8px;padding:3px 10px;color:#fff;cursor:pointer}button:hover{background:#8b3dff}label{display:flex;justify-content:space-between;margin-top:8px;color:#bfb0e0;font-size:12.5px}input[type=range]{width:100%;accent-color:#8b3dff}select,input[type=color]{width:100%;background:#0b0618;color:#fff;border:1px solid #3a1f6e;border-radius:8px;padding:5px}.p{display:flex;gap:5px;flex-wrap:wrap;margin:6px 0}.p button{padding:2px 9px;font-size:12px}`;
  const SL = [['blur', 'Glow blur', 0, 120, 'px'], ['light', 'Light amount', 20, 220, '%'], ['sat', 'Color richness', 0, 300, '%'], ['spread', 'Glow size', 5, 60, '%'], ['dim', 'Page dimming', 0, 97, '%'], ['smooth', 'Smoothness', 0, 90, '%'], ['fps', 'Refresh rate', 5, 30, ' fps']];
  cp = X.ui(css, `<div class="b"><div class="h"><b>Ambient glow</b><span><button id="off">${st ? 'Turn off' : 'Turn on'}</button> <button id="x">✕</button></span></div><div class="p">${Object.keys(PRESETS).map(k => `<button data-p="${k}">${k}</button>`).join('')}<button id="rs">Reset</button></div>${SL.map(([k, n, a, b, u]) => `<label>${n}<span id="v-${k}">${S[k]}${u}</span></label><input type="range" id="s-${k}" min="${a}" max="${b}" value="${S[k]}">`).join('')}<label>Color mode</label><select id="md"><option value="video">Match the video</option><option value="warm">Warm tint</option><option value="cool">Cool tint</option><option value="custom">Custom color</option></select><div id="cc"><label>Tint strength<span id="v-tint">${S.tint}%</span></label><input type="range" id="s-tint" min="0" max="100" value="${S.tint}"><input type="color" id="co" value="${S.color}" style="height:34px;margin-top:6px"></div></div>`, 2147483200);
  const r = cp.root, g = id => r.querySelector('#' + id), sync = () => { SL.forEach(([k, , , , u]) => { g('s-' + k).value = S[k]; g('v-' + k).textContent = S[k] + u; }); g('md').value = S.mode; g('cc').style.display = S.mode === 'video' ? 'none' : ''; g('s-tint').value = S.tint; g('v-tint').textContent = S.tint + '%'; g('co').value = S.color; g('co').style.display = S.mode === 'custom' ? '' : 'none'; };
  SL.forEach(([k, , , , u]) => (g('s-' + k).oninput = e => { setS(k, +e.target.value); g('v-' + k).textContent = S[k] + u; })); g('s-tint').oninput = e => { setS('tint', +e.target.value); g('v-tint').textContent = S.tint + '%'; }; g('co').oninput = e => setS('color', e.target.value); g('md').onchange = e => { setS('mode', e.target.value); sync(); };
  r.addEventListener('click', e => { const p = e.target.dataset.p; if (p) { S = { ...DEF, ...PRESETS[p] }; st && st.apply(); save(); sync(); } });
  g('rs').onclick = () => { S = { ...DEF }; st && st.apply(); save(); sync(); }; g('x').onclick = () => { cp.remove(); cp = null; };
  g('off').onclick = () => { if (st) { stop(); g('off').textContent = 'Turn on'; auto = false; } else if (vid()) { start(); g('off').textContent = 'Turn off'; } else X.toast('No video found yet. Press play first.'); }; sync();
}
X.add('ambient', {
  auto(on) { clearInterval(window.__cruxAmb); if (!on) { auto && stop(); return; } S = { ...DEF, ...(X.pref('ambient') || {}) }; st && st.apply(); window.__cruxAmb = setInterval(() => { const w = location.pathname === '/watch' && /youtube\.com$/.test(location.hostname); if (w && !st && vid()) { start(); auto = true; } else if (!w && auto && st) { stop(); auto = false; } }, 1500); },
  run: panel,
  prompts: () => vid() && !st ? [{ id: 'ambient', icon: '🌈', title: 'Ambient glow', pri: 5, text: 'Light up the room around this video like a cinema? You can fine-tune blur, light and dimming.', actions: [['Turn on glow', start], ['Open controls', panel, false]] }] : []
});
addEventListener('keydown', e => { if (e.altKey && e.key.toLowerCase() === 'g' && X.on('ambient') && vid()) { st ? stop() : start(); } if (e.key === 'Escape' && st && !auto && !cp) stop(); }, true);
})();
