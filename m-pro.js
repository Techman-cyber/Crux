// Page inspector (SEO + accessibility), style inspector, pixel ruler, print.
(() => {
const X = window.__crux; if (!X) return;
const q = s => [...document.querySelectorAll(s)];
const meta = n => (document.querySelector(`meta[name="${n}" i],meta[property="${n}" i]`) || {}).content || '';
const hexOf = c => { const m = c.match(/[\d.]+/g); return !m || (m[3] !== undefined && +m[3] === 0) ? 'transparent' : '#' + m.slice(0, 3).map(x => (+x).toString(16).padStart(2, '0')).join(''); };
function seo() {
  const t = document.title, d = meta('description'), h1 = q('h1'), im = q('img'), na = im.filter(i => !i.hasAttribute('alt')).length, ln = q('a[href]'), ex = ln.filter(a => a.hostname && a.hostname !== location.hostname).length, w = ((document.body.innerText || document.body.textContent || '').match(/\S+/g) || []).length, can = document.querySelector('link[rel=canonical]');
  return [[t ? (t.length >= 30 && t.length <= 60 ? 'ok' : 'warn') : 'bad', 'Title', `${t || 'missing'} (${t.length} chars, aim for 30 to 60)`], [d ? (d.length >= 70 && d.length <= 160 ? 'ok' : 'warn') : 'bad', 'Meta description', d ? `${d.length} chars (aim for 70 to 160)` : 'missing'], [h1.length === 1 ? 'ok' : 'warn', 'H1 headings', `${h1.length}${h1[0] ? ': ' + h1[0].textContent.trim().slice(0, 70) : ''}`], [can ? 'ok' : 'warn', 'Canonical link', can ? can.href : 'missing'], [meta('viewport') ? 'ok' : 'bad', 'Mobile viewport', meta('viewport') || 'missing'], [document.documentElement.lang ? 'ok' : 'warn', 'Language', document.documentElement.lang || 'missing'], [meta('og:title') && meta('og:image') ? 'ok' : 'warn', 'Social preview', meta('og:title') ? (meta('og:image') ? 'Open Graph title and image set' : 'no og:image') : 'no Open Graph tags'], [na ? 'warn' : 'ok', 'Images', `${im.length} total, ${na} without alt text`], [w >= 300 ? 'ok' : 'warn', 'Content', `${w} words`], [/noindex/i.test(meta('robots')) ? 'bad' : 'ok', 'Search engines', meta('robots') || 'indexable'], ['ok', 'Links', `${ln.length} total, ${ex} external`]];
}
function a11y() {
  const nn = q('button,a[href]').filter(e => !(e.textContent.trim() || e.getAttribute('aria-label') || e.title || e.querySelector('img[alt]:not([alt=""])'))).length, ul = q('input:not([type=hidden]):not([type=submit]):not([type=button]),select,textarea').filter(i => !((i.labels && i.labels.length) || i.getAttribute('aria-label') || i.getAttribute('aria-labelledby') || i.title)).length, na = q('img:not([alt])').length, hs = q('h1,h2,h3,h4,h5,h6').map(h => +h.tagName[1]); let sk = 0; hs.forEach((l, i) => { if (i && l - hs[i - 1] > 1) sk++; });
  const vp = meta('viewport'), zoom = /user-scalable\s*=\s*(no|0)|maximum-scale\s*=\s*1(\.0)?(\D|$)/i.test(vp), fr = q('iframe:not([title])').length, ti = q('[tabindex]').filter(e => +e.getAttribute('tabindex') > 0).length;
  return [[na ? 'bad' : 'ok', 'Images without alt text', na], [nn ? 'bad' : 'ok', 'Buttons or links with no name', nn], [ul ? 'warn' : 'ok', 'Form fields without a label', ul], [sk ? 'warn' : 'ok', 'Skipped heading levels', sk], [document.documentElement.lang ? 'ok' : 'bad', 'Page language', document.documentElement.lang || 'missing'], [zoom ? 'bad' : 'ok', 'Pinch zoom', zoom ? 'blocked by the page' : 'allowed'], [fr ? 'warn' : 'ok', 'Frames without a title', fr], [ti ? 'warn' : 'ok', 'Positive tabindex (breaks tab order)', ti]];
}
let ip = null;
function inspect() {
  if (ip) { ip.remove(); ip = null; return; }
  const css = 'aside{position:fixed;top:0;right:0;width:min(450px,100vw);height:100vh;background:#0b0618f7;color:#efe3ff;border-left:1px solid #8b3dff;display:flex;flex-direction:column}header{display:flex;gap:8px;align-items:center;padding:12px 14px;border-bottom:1px solid #8b3dff55}header b{flex:1}button{background:#8b3dff22;border:1px solid #8b3dff;border-radius:8px;padding:4px 12px;color:#fff;cursor:pointer}button.on,button:hover{background:#8b3dff}#l{overflow:auto;padding:6px 14px 30px}.r{display:grid;grid-template-columns:22px 150px 1fr;gap:8px;padding:8px 0;border-bottom:1px dashed #ffffff22}.ok{color:#4dff9f}.warn{color:#ffb020}.bad{color:#ff3d6e}.v{color:#cdbfe8;overflow-wrap:anywhere}';
  ip = X.ui(css, '<aside><header><b>Page inspector</b><button id="a" class="on">SEO</button><button id="b">Accessibility</button><button id="x">✕</button></header><div id="l"></div></aside>');
  const r = ip.root, show = rows => { r.querySelector('#l').innerHTML = `<p style="margin:10px 0;color:#a493cc">${rows.filter(x => x[0] !== 'ok').length} thing${rows.filter(x => x[0] !== 'ok').length === 1 ? '' : 's'} to look at</p>` + rows.map(([s, k, v]) => `<div class="r"><b class="${s}">${s === 'ok' ? '✔' : s === 'warn' ? '!' : '✘'}</b><b>${X.esc(k)}</b><span class="v">${X.esc(v)}</span></div>`).join(''); };
  const tab = (t) => { r.querySelector('#a').classList.toggle('on', t === 'a'); r.querySelector('#b').classList.toggle('on', t === 'b'); show(t === 'a' ? seo() : a11y()); };
  r.querySelector('#a').onclick = () => tab('a'); r.querySelector('#b').onclick = () => tab('b'); r.querySelector('#x').onclick = () => { ip.remove(); ip = null; }; tab('a');
}
X.add('inspect', { run: inspect });

let sp = false;
function pickStyle() {
  if (sp) return; sp = true;
  const u = X.ui('.h{position:fixed;pointer-events:none;outline:2px solid #29f0ff;background:#29f0ff22}.t{position:fixed;background:#0b0618;color:#efe3ff;border:1px solid #8b3dff;border-radius:10px;padding:8px 10px;font:12px/1.6 ui-monospace,Menlo,monospace;pointer-events:none;max-width:360px;display:none;white-space:pre-wrap}.b{position:fixed;top:12px;left:50%;transform:translateX(-50%);background:#0b0618;color:#fff;border:1px solid #8b3dff;border-radius:12px;padding:6px 14px;font:600 13px system-ui}', '<div class="h" style="display:none"></div><div class="t"></div><div class="b">Hover to inspect · click to copy CSS · Esc to finish</div>', 2147483645), h = u.root.querySelector('.h'), t = u.root.querySelector('.t'); let cur;
  const info = e => { const c = getComputedStyle(e); return { css: `font-family: ${c.fontFamily};\nfont-size: ${c.fontSize};\nfont-weight: ${c.fontWeight};\nline-height: ${c.lineHeight};\ncolor: ${hexOf(c.color)};\nbackground: ${hexOf(c.backgroundColor)};`, c }; };
  const mv = e => { const el = document.elementFromPoint(e.clientX, e.clientY); if (!el || el === u.host) return; cur = el; const r = el.getBoundingClientRect(), { c } = info(el); Object.assign(h.style, { display: '', left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' }); t.style.display = 'block'; t.style.left = Math.min(innerWidth - 380, e.clientX + 14) + 'px'; t.style.top = Math.min(innerHeight - 140, e.clientY + 14) + 'px'; t.textContent = `<${el.tagName.toLowerCase()}> ${r.width | 0}×${r.height | 0}\n${c.fontFamily.split(',')[0]} · ${c.fontSize} · ${c.fontWeight}\ncolor ${hexOf(c.color)}  bg ${hexOf(c.backgroundColor)}`; };
  const ck = e => { if (!cur) return; e.preventDefault(); e.stopImmediatePropagation(); navigator.clipboard.writeText(info(cur).css).then(() => X.toast('CSS copied to your clipboard.')); };
  const end = e => { if (e && e.key !== 'Escape') return; removeEventListener('mousemove', mv, true); removeEventListener('click', ck, true); removeEventListener('keydown', end, true); u.remove(); sp = false; };
  addEventListener('mousemove', mv, true); addEventListener('click', ck, true); addEventListener('keydown', end, true);
}
X.add('fontinfo', { run: pickStyle });

let rl = false;
function ruler() {
  if (rl) return; rl = true;
  const u = X.ui('.o{position:fixed;inset:0;cursor:crosshair;background:#0000}.b{position:fixed;border:1px solid #ff2e88;background:#ff2e8826;display:none}.l{position:fixed;background:#0b0618;color:#fff;border:1px solid #ff2e88;border-radius:8px;padding:2px 8px;font:700 12px ui-monospace,monospace;display:none}.h{position:fixed;top:12px;left:50%;transform:translateX(-50%);background:#0b0618;color:#fff;border:1px solid #8b3dff;border-radius:12px;padding:6px 14px;font:600 13px system-ui}', '<div class="o"></div><div class="b"></div><div class="l"></div><div class="h">Drag to measure · Esc to finish</div>', 2147483645);
  const o = u.root.querySelector('.o'), b = u.root.querySelector('.b'), l = u.root.querySelector('.l'); let s = null;
  o.onmousedown = e => { s = [e.clientX, e.clientY]; b.style.display = l.style.display = 'block'; }; o.onmousemove = e => { if (!s) return; const x = Math.min(s[0], e.clientX), y = Math.min(s[1], e.clientY), w = Math.abs(e.clientX - s[0]), hh = Math.abs(e.clientY - s[1]); Object.assign(b.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: hh + 'px' }); Object.assign(l.style, { left: x + w + 6 + 'px', top: y + hh + 6 + 'px' }); l.textContent = `${w} × ${hh} px`; }; o.onmouseup = () => { s = null; };
  const end = e => { if (e.key !== 'Escape') return; removeEventListener('keydown', end, true); u.remove(); rl = false; }; addEventListener('keydown', end, true);
}
X.add('ruler', { run: ruler });
X.add('print', { run: () => setTimeout(() => print(), 100) });
})();
