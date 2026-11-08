// Video speed hotkeys, page notes, image grabber.
(() => {
const X = window.__crux; if (!X) return;
/* ----- video speed ----- */
const vids = () => [...document.querySelectorAll('video')], cur = () => vids().find(v => !v.paused) || vids()[0];
let tip = null, tipT = 0;
function flash(v, txt) {
  if (!tip) { tip = X.ui('.p{position:fixed;background:#000c;color:#fff;border:1px solid #8b3dff;border-radius:10px;padding:4px 12px;font:700 15px system-ui}', '<div class="p"></div>'); }
  const r = v.getBoundingClientRect(), p = tip.root.querySelector('.p'); p.textContent = txt; p.style.left = Math.max(8, r.left + 12) + 'px'; p.style.top = Math.max(8, r.top + 12) + 'px'; p.style.display = '';
  clearTimeout(tipT); tipT = setTimeout(() => (p.style.display = 'none'), 1100);
}
const setRate = (v, r) => { v.playbackRate = r; flash(v, r + 'x'); };
function key(e) {
  if (e.ctrlKey || e.metaKey || e.altKey || e.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
  const v = cur(); if (!v) return; const k = e.key.toLowerCase();
  if (k === 's') setRate(v, Math.max(.1, +(v.playbackRate - .25).toFixed(2))); else if (k === 'd') setRate(v, Math.min(16, +(v.playbackRate + .25).toFixed(2)));
  else if (k === 'r') setRate(v, 1); else if (k === 'z') { v.currentTime -= 10; flash(v, '−10s'); } else if (k === 'x') { v.currentTime += 10; flash(v, '+10s'); }
}
X.add('speed', { auto(on) { removeEventListener('keydown', key, true); if (on) addEventListener('keydown', key, true); }, run() { const v = cur(); v ? setRate(v, 1) : X.toast('No video found on this page.'); } });

/* ----- page notes ----- */
const nk = () => 'note:' + location.origin + location.pathname;
let np = null, pill = null;
async function noteOpen() {
  if (np) { np.remove(); np = null; return; } pill && pill.remove(); pill = null;
  const k = nk(), cur = (await chrome.storage.local.get(k))[k] || '';
  np = X.ui('.n{position:fixed;right:16px;bottom:16px;width:290px;background:#fff3a8;color:#2b2200;border-radius:12px;box-shadow:0 10px 40px #0008;padding:8px;display:flex;flex-direction:column;gap:6px}textarea{height:170px;border:0;background:none;resize:vertical;color:#2b2200;font:14px/1.4 system-ui;outline:0}.r{display:flex;justify-content:space-between;font-size:12px}button{border:0;background:#0002;border-radius:8px;padding:3px 9px}', '<div class="n"><textarea placeholder="Your note for this page…"></textarea><div class="r"><span id="s">Saved on this device</span><span><button id="d">Delete</button> <button id="x">Close</button></span></div></div>');
  const ta = np.root.querySelector('textarea'); ta.value = cur; ta.focus(); let t = 0;
  ta.oninput = () => { clearTimeout(t); t = setTimeout(() => chrome.storage.local.set({ [k]: ta.value }), 350); };
  np.root.querySelector('#d').onclick = () => { chrome.storage.local.remove(k); ta.value = ''; };
  np.root.querySelector('#x').onclick = () => { np.remove(); np = null; badge(); };
}
async function badge() {
  const k = nk(); if (np || pill || !(await chrome.storage.local.get(k))[k]) return;
  pill = X.ui('button{position:fixed;left:14px;bottom:14px;background:#fff3a8;color:#2b2200;border:0;border-radius:20px;padding:6px 12px;box-shadow:0 4px 18px #0006;cursor:pointer;font:600 13px system-ui}', '<button>📝 Note on this page</button>');
  pill.root.querySelector('button').onclick = noteOpen;
}
X.add('notes', { auto(on) { if (on && window.top === window) X.ready(() => setTimeout(badge, 900)); else { pill && pill.remove(); pill = null; } }, run: noteOpen });

/* ----- image grabber ----- */
let gp = null;
function grab() {
  if (gp) { gp.remove(); gp = null; return; }
  const m = new Map(); document.querySelectorAll('img').forEach(i => { const s = i.currentSrc || i.src; if (/^https?:/.test(s) && i.naturalWidth >= 120 && i.naturalHeight >= 120 && !m.has(s)) m.set(s, i); });
  const list = [...m.entries()]; if (!list.length) return X.toast('No sizeable images found on this page.');
  gp = X.ui(`aside{position:fixed;top:0;right:0;width:min(460px,100vw);height:100vh;background:#0b0618f5;color:#efe3ff;border-left:1px solid #8b3dff;display:flex;flex-direction:column}header{display:flex;gap:8px;align-items:center;padding:12px 14px;border-bottom:1px solid #8b3dff55}header b{flex:1}button{background:#8b3dff22;border:1px solid #8b3dff;border-radius:8px;padding:4px 10px}button:hover{background:#8b3dff;color:#fff}
.g{overflow:auto;flex:1;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:10px}.c{position:relative;border:2px solid transparent;border-radius:10px;overflow:hidden;cursor:pointer;background:#000}.c.on{border-color:#8b3dff}.c img{width:100%;height:110px;object-fit:cover;display:block}.c span{position:absolute;left:4px;bottom:4px;background:#000b;font-size:11px;padding:0 5px;border-radius:5px}`,
    `<aside><header><b>${list.length} images</b><button id="a">All</button><button id="n">None</button><button id="d" style="background:#8b3dff">Download</button><button id="x">✕</button></header><div class="g">${list.map(([s, i], n) => `<div class="c on" data-n="${n}"><img src="${X.esc(s)}" loading="lazy"><span>${i.naturalWidth}×${i.naturalHeight}</span></div>`).join('')}</div></aside>`);
  const r = gp.root, cs = () => [...r.querySelectorAll('.c')], upd = () => (r.querySelector('#d').textContent = `Download ${cs().filter(c => c.classList.contains('on')).length}`); upd();
  r.addEventListener('click', e => { const c = e.target.closest('.c'); if (c) { c.classList.toggle('on'); upd(); } });
  r.querySelector('#a').onclick = () => { cs().forEach(c => c.classList.add('on')); upd(); }; r.querySelector('#n').onclick = () => { cs().forEach(c => c.classList.remove('on')); upd(); };
  r.querySelector('#d').onclick = async () => { const urls = cs().filter(c => c.classList.contains('on')).map(c => list[c.dataset.n][0]); await X.api('dl', { urls }); X.toast(`Saving ${urls.length} images to Downloads/CRUX/images`); };
  r.querySelector('#x').onclick = () => { gp.remove(); gp = null; };
}
X.add('images', { run: grab, prompts: () => [...document.images].filter(i => i.naturalWidth >= 200).length >= 8 ? [{ id: 'images', icon: '🖼️', title: 'Image grabber', pri: 9, text: 'This page has lots of images. List them and download the ones you want?', actions: [['Grab images', grab]] }] : [] });
})();
