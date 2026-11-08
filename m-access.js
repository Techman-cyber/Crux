// Reading and accessibility toolkit: quick toggles, reader view, read aloud.
(() => {
const X = window.__crux; if (!X) return;
const sty = (id, css) => { let s = document.getElementById(id); if (!css) { s && s.remove(); return; } if (!s) { s = document.createElement('style'); s.id = id; (document.head || document.documentElement).appendChild(s); } s.textContent = css; };
const CUR = `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><path d="M4 2l28 14-12 4 8 14-6 3-8-14-8 8z" fill="#fff" stroke="#000" stroke-width="2.5"/></svg>')}") 4 2,auto`;
const FX = {
  dys: '*{font-family:Verdana,Tahoma,"Trebuchet MS",sans-serif!important;letter-spacing:.06em!important;word-spacing:.14em!important;line-height:1.75!important}',
  links: 'a{text-decoration:underline!important;outline:2px solid #ffe14d!important;background:#ffe14d33!important}',
  anim: '*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}',
  cursor: `*{cursor:${CUR}!important}`
};
let ruler = null;
function apply(p = {}) {
  let css = ['dys', 'links', 'anim', 'cursor'].filter(k => p[k]).map(k => FX[k]).join('');
  const f = [p.contrast && 'contrast(1.45)', p.gray && 'grayscale(1)'].filter(Boolean).join(' ');
  if (f) css += `html{filter:${f}!important}`; if (p.zoom && p.zoom !== 1) css += `body{zoom:${p.zoom}}`;
  sty('crux-a11y', css);
  if (p.ruler && !ruler) {
    const u = X.ui('.m{position:fixed;inset:0;--y:50vh;background:linear-gradient(#000b 0,#000b calc(var(--y) - 34px),#0000 calc(var(--y) - 34px),#0000 calc(var(--y) + 34px),#000b calc(var(--y) + 34px));pointer-events:none}', '<div class="m"></div>', 2147483000);
    u.host.style.cssText += 'inset:0;pointer-events:none;'; const m = u.root.querySelector('.m');
    const mv = e => m.style.setProperty('--y', e.clientY + 'px'); addEventListener('mousemove', mv, true); ruler = { remove() { removeEventListener('mousemove', mv, true); u.remove(); ruler = null; } };
  } else if (!p.ruler && ruler) ruler.remove();
}
const P = () => ({ ...(X.pref('access') || {}) });
const setP = (k, v) => { const p = P(); p[k] = v; X.setPref('access', p); apply(p); return p; };

/* ----- reader ----- */
const OK = new Set(['P', 'H1', 'H2', 'H3', 'H4', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'PRE', 'CODE', 'EM', 'STRONG', 'B', 'I', 'A', 'IMG', 'FIGURE', 'FIGCAPTION', 'BR', 'TABLE', 'THEAD', 'TBODY', 'TR', 'TD', 'TH']);
const DROP = 'script,style,nav,aside,footer,form,iframe,noscript,button,svg,header,[class*=advert],[class*=share],[class*=comment],[id*=comment],[class*=related],[aria-hidden=true]';
function clean(n, out) {
  for (const c of n.childNodes) {
    if (c.nodeType === 3) { out.appendChild(document.createTextNode(c.textContent)); continue; }
    if (c.nodeType !== 1 || c.matches(DROP)) continue;
    if (OK.has(c.tagName)) {
      const e = document.createElement(c.tagName.toLowerCase());
      if (c.tagName === 'A' && /^https?:/.test(c.href)) { e.href = c.href; e.target = '_blank'; e.rel = 'noopener'; }
      if (c.tagName === 'IMG') { const s = c.currentSrc || c.src; if (!/^https?:/.test(s)) continue; e.src = s; e.alt = c.alt || ''; }
      clean(c, e); out.appendChild(e);
    } else clean(c, out);
  }
}
function mainNode() {
  const c = document.querySelector('article') || document.querySelector('main,[role=main],.entry-content,.article-body,.post-content') || document.body;
  const ps = c.querySelectorAll('p'); if (ps.length < 5) return null;
  let n = 0; for (let i = 0; i < Math.min(ps.length, 40); i++) n += ps[i].textContent.length;
  return n > 600 ? c : null;
}
const bionic = root => {
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), ns = []; while (w.nextNode()) ns.push(w.currentNode);
  ns.forEach(t => { if (t.parentElement.closest('pre,code')) return; const f = document.createDocumentFragment(); t.textContent.split(/(\s+)/).forEach(s => { if (s.length > 1 && /\S/.test(s)) { const b = document.createElement('b'), k = Math.ceil(s.length / 2); b.textContent = s.slice(0, k); f.append(b, s.slice(k)); } else f.append(s); }); t.replaceWith(f); });
};
const speak = (parts, rate, mark) => { speechSynthesis.cancel(); parts.forEach((t, i) => { const u = new SpeechSynthesisUtterance(t); u.rate = rate; u.onstart = () => mark && mark(i); speechSynthesis.speak(u); }); };
let reader = null;
function openReader() {
  if (reader) { reader.close(); return; }
  const src = mainNode(); if (!src) return X.toast('This page doesn’t look like an article, so reader view has nothing to show.');
  const holder = document.createElement('div'); clean(src, holder);
  const title = (document.querySelector('h1') || {}).textContent || document.title;
  const words = holder.textContent.split(/\s+/).length;
  const S = { font: 'serif', size: 20, w: 700, theme: 'dark', bionic: 0, rate: 1, ...(X.pref('reader') || {}) };
  const css = `.o{position:fixed;inset:0;overflow:auto;background:var(--bg);color:var(--fg);transition:background .2s}
.o[data-t=dark]{--bg:#0b0618;--fg:#e9defa;--ac:#b57cff}.o[data-t=light]{--bg:#fbfaff;--fg:#1c1530;--ac:#6a2fd0}.o[data-t=sepia]{--bg:#f3e9d2;--fg:#3b2f1e;--ac:#9a5b13}
.bar{position:sticky;top:0;display:flex;gap:10px;flex-wrap:wrap;align-items:center;padding:8px 16px;background:var(--bg);border-bottom:1px solid #8b3dff55;z-index:2}
button,select{background:none;border:1px solid var(--ac);color:var(--fg);border-radius:8px;padding:3px 10px;font-size:13px}button:hover,button.on{background:var(--ac);color:var(--bg)}input[type=range]{accent-color:var(--ac);width:90px}
article{margin:36px auto 90px;padding:0 20px;font-size:var(--s);line-height:1.75}article h1{font-size:1.9em;line-height:1.2;margin-bottom:.3em}.meta{opacity:.65;margin-bottom:1.6em;font-size:.8em}
article p,article ul,article ol,article blockquote,article pre,article figure{margin:0 0 1.1em}article img{max-width:100%;height:auto}article a{color:var(--ac)}article blockquote{border-left:3px solid var(--ac);padding-left:14px;opacity:.9}article pre{overflow:auto;background:#8b3dff18;padding:10px}article b{font-weight:800}
.hl{background:#8b3dff33;box-shadow:-8px 0 0 #8b3dff33,8px 0 0 #8b3dff33}.fam-serif{font-family:Georgia,"Times New Roman",serif}.fam-sans{font-family:system-ui,sans-serif}.fam-mono{font-family:ui-monospace,Menlo,Consolas,monospace}.fam-dys{font-family:Verdana,Tahoma,sans-serif;letter-spacing:.06em;word-spacing:.14em;line-height:2}`;
  const u = X.ui(css, `<div class="o"><div class="bar"><b>Reader</b><span class="mu" id="rt"></span><select id="f"><option value="serif">Serif</option><option value="sans">Sans</option><option value="mono">Mono</option><option value="dys">Dyslexia-friendly</option></select>Size <input id="s" type="range" min="15" max="34"> Width <input id="w" type="range" min="480" max="1000" step="20"><select id="t"><option value="dark">Dark</option><option value="light">Light</option><option value="sepia">Sepia</option></select><button id="b">Bold start</button><button id="l">▶ Listen</button><select id="r"><option value="0.8">0.8x</option><option value="1">1x</option><option value="1.25">1.25x</option><option value="1.5">1.5x</option><option value="2">2x</option></select><button id="x" style="margin-left:auto">Close (Esc)</button></div><article></article></div>`, 2147483300);
  u.host.style.cssText += 'inset:0;'; const $ = s => u.root.querySelector(s), art = $('article'), o = $('.o');
  const paint = () => {
    art.innerHTML = ''; const h = document.createElement('h1'); h.textContent = title; const m = document.createElement('div'); m.className = 'meta'; m.textContent = `${location.hostname} · ${Math.max(1, Math.round(words / 225))} min read`; art.append(h, m);
    const c = holder.cloneNode(true); if (S.bionic) bionic(c); art.append(...c.childNodes);
    art.className = 'fam-' + S.font; o.dataset.t = S.theme; o.style.setProperty('--s', S.size + 'px'); art.style.maxWidth = S.w + 'px';
    $('#b').classList.toggle('on', !!S.bionic); $('#f').value = S.font; $('#s').value = S.size; $('#w').value = S.w; $('#t').value = S.theme; $('#r').value = S.rate; $('#rt').textContent = '';
  };
  const save = () => X.setPref('reader', S); paint();
  $('#f').onchange = e => { S.font = e.target.value; paint(); save(); }; $('#s').oninput = e => { S.size = +e.target.value; paint(); }; $('#s').onchange = save;
  $('#w').oninput = e => { S.w = +e.target.value; paint(); }; $('#w').onchange = save; $('#t').onchange = e => { S.theme = e.target.value; paint(); save(); };
  $('#b').onclick = () => { S.bionic = S.bionic ? 0 : 1; paint(); save(); }; $('#r').onchange = e => { S.rate = +e.target.value; save(); };
  let talking = false;
  $('#l').onclick = () => {
    if (talking) { speechSynthesis.cancel(); talking = false; $('#l').textContent = '▶ Listen'; return; }
    const ps = [...art.querySelectorAll('p,li,h2,h3,blockquote')]; talking = true; $('#l').textContent = '■ Stop';
    speak(ps.map(p => p.textContent), S.rate, i => { art.querySelectorAll('.hl').forEach(e => e.classList.remove('hl')); ps[i].classList.add('hl'); ps[i].scrollIntoView({ block: 'center', behavior: 'smooth' }); });
  };
  const close = () => { speechSynthesis.cancel(); removeEventListener('keydown', esc, true); document.documentElement.style.overflow = prev; u.remove(); reader = null; };
  const esc = e => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
  const prev = document.documentElement.style.overflow; document.documentElement.style.overflow = 'hidden';
  addEventListener('keydown', esc, true); $('#x').onclick = close; reader = { close };
}

/* ----- quick panel ----- */
let panel = null;
function openPanel() {
  if (panel) { panel.remove(); panel = null; return; }
  const T = [['dys', 'Dyslexia-friendly text'], ['contrast', 'High contrast'], ['gray', 'Grayscale (less distraction)'], ['links', 'Highlight links'], ['anim', 'Stop animations'], ['ruler', 'Reading ruler'], ['cursor', 'Big cursor']];
  const css = `aside{position:fixed;right:16px;top:70px;width:290px;background:#0b0618f5;color:#efe3ff;border:1px solid #8b3dff;border-radius:16px;box-shadow:0 0 30px #8b3dff55;padding:12px 14px;animation:s .25s}@keyframes s{from{transform:translateY(-12px);opacity:0}}
h3{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-size:15px}label{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px dashed #ffffff22;cursor:pointer}input{accent-color:#8b3dff;width:18px;height:18px}
button{background:#8b3dff22;border:1px solid #8b3dff;border-radius:8px;padding:5px 10px;margin:8px 6px 0 0}button:hover{background:#8b3dff;color:#fff}.z{display:flex;align-items:center;gap:6px;margin-top:6px}`;
  const p = P(), u = X.ui(css, `<aside><h3>Reading and access <button id="x" style="margin:0">✕</button></h3>${T.map(([k, n]) => `<label>${n}<input type="checkbox" data-k="${k}" ${p[k] ? 'checked' : ''}></label>`).join('')}<div class="z">Text size <button data-z="-.1" style="margin:0">A−</button><button data-z=".1" style="margin:0">A+</button><button data-z="0" style="margin:0">Reset</button></div><button id="rv">Reader view</button><button id="rd">Read aloud</button></aside>`);
  panel = u; const r = u.root;
  r.addEventListener('change', e => { const k = e.target.dataset.k; if (k) setP(k, e.target.checked); });
  r.addEventListener('click', e => { const z = e.target.dataset.z; if (z != null) { const q = P(); setP('zoom', z === '0' ? 1 : Math.min(2, Math.max(.7, +((q.zoom || 1) + +z).toFixed(2)))); } });
  r.querySelector('#x').onclick = () => { u.remove(); panel = null; };
  r.querySelector('#rv').onclick = () => { u.remove(); panel = null; openReader(); };
  r.querySelector('#rd').onclick = () => { const s = String(getSelection()).trim() || (mainNode() || {}).innerText || ''; if (!s) return X.toast('Select some text or open an article first.'); speak(s.split(/\n+/).filter(Boolean).slice(0, 400), 1); };
}
X.add('access', { auto(on) { apply(on ? P() : {}); }, run: openPanel, prompts: () => { const n = mainNode(); if (!n) return []; const w = Math.round(n.textContent.length / 5.6), mins = Math.max(1, Math.round(w / 225)); return mins < 2 ? [] : [{ id: 'access', icon: '📖', title: 'Reading tools', pri: 6, text: `This looks like an article (${mins} min read). Open a clean reader view?`, actions: [['Reader view', openReader], ['Reading tools', openPanel, false]] }]; } });
})();
