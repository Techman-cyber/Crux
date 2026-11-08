// More page tools: unlock, show-password, autoplay blocker, PiP, volume, zapper, selection bar, comfort, scroll, autoscroll, forms, temp mail, translate, YouTube focus.
(() => {
const X = window.__crux; if (!X) return; const host = location.hostname, top = window.top === window;
const sty = (id, css) => { let s = document.getElementById(id); if (!css) { s && s.remove(); return; } if (!s) { s = document.createElement('style'); s.id = id; (document.head || document.documentElement).appendChild(s); } s.textContent = css; };
const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
const bigVid = () => [...document.querySelectorAll('video')].filter(v => v.getBoundingClientRect().width > 300).sort((a, b) => b.clientWidth - a.clientWidth)[0];
const setv = (el, v) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); };

/* copy unlocker */
const UEV = ['contextmenu', 'selectstart', 'dragstart', 'copy'], ustop = e => e.stopImmediatePropagation(); let ul = false;
const unlock = () => { if (ul) return; ul = true; UEV.forEach(v => addEventListener(v, ustop, true)); sty('crux-ul', '*,*::before,*::after{-webkit-user-select:text!important;user-select:text!important}'); };
X.add('unlock', { run() { unlock(); X.toast('Copy and right-click unlocked on this page.'); }, auto(on) { if (!on && ul) { ul = false; UEV.forEach(v => removeEventListener(v, ustop, true)); sty('crux-ul', ''); } },
  prompts: () => { const b = document.body; const blocked = b && (getComputedStyle(b).userSelect === 'none' || document.oncontextmenu || b.oncontextmenu || document.onselectstart || b.oncopy); return blocked ? [{ id: 'unlock', icon: '🔓', title: 'Copy unlocker', pri: 6, text: 'This page blocks copying or right-click. Unlock them?', actions: [['Unlock', unlock]] }] : []; } });

/* show password on hover */
const sp = e => { const i = e.target; if (i && i.matches && i.matches('input[type=password]')) { i.dataset.cps = '1'; i.type = 'text'; } }, hp = e => { const i = e.target; if (i && i.dataset && i.dataset.cps) { i.type = 'password'; delete i.dataset.cps; } };
X.add('showpw', { auto(on) { removeEventListener('mouseover', sp, true); removeEventListener('mouseout', hp, true); if (on) { addEventListener('mouseover', sp, true); addEventListener('mouseout', hp, true); } } });

/* autoplay blocker */
const ap = e => { const v = e.target; if (v.tagName !== 'VIDEO' || v.dataset.cpa || (navigator.userActivation && navigator.userActivation.hasBeenActive)) return; v.dataset.cpa = '1'; v.pause(); X.ask({ id: 'autoplay:' + Date.now(), tool: 'autoplay', icon: '⏸️', title: 'Autoplay blocked', text: 'A video tried to start playing by itself, so I paused it.', ttl: 8000, actions: [['Play it', () => v.play()], ['OK', () => {}, false]] }); };
X.add('autoplay', { auto(on) { removeEventListener('play', ap, true); if (on) addEventListener('play', ap, true); } });

/* picture-in-picture (Alt+P) */
async function pip() { const v = bigVid(); if (!v) return X.toast('No video found on this page.'); try { document.pictureInPictureElement ? await document.exitPictureInPicture() : await v.requestPictureInPicture(); } catch { X.toast('Press Alt+P while the video is on screen.'); } }
const pk = e => { if (e.altKey && e.key.toLowerCase() === 'p' && !e.ctrlKey && !e.metaKey) pip(); };
X.add('pip', { run: pip, auto(on) { removeEventListener('keydown', pk, true); if (on) addEventListener('keydown', pk, true); }, prompts: () => bigVid() ? [{ id: 'pip', icon: '🪟', title: 'Picture-in-picture', pri: 7, text: 'Keep this video floating on top while you do other things?', actions: [['Pop out video', pip]] }] : [] });

/* volume booster */
let actx; const gains = new WeakMap();
function boost(g) { actx ||= new AudioContext(); document.querySelectorAll('video,audio').forEach(m => { let n = gains.get(m); if (!n) { try { const s = actx.createMediaElementSource(m); n = actx.createGain(); s.connect(n); n.connect(actx.destination); gains.set(m, n); } catch { return; } } n.gain.value = g; }); actx.resume(); }
let vp = null;
X.add('volume', { run() { if (vp) { vp.remove(); vp = null; return; } if (!document.querySelector('video,audio')) return X.toast('No video or audio on this page.');
  vp = X.ui('.b{position:fixed;right:16px;bottom:16px;background:#0b0618f5;color:#efe3ff;border:1px solid #8b3dff;border-radius:14px;padding:10px 14px;width:260px}input{width:100%;accent-color:#8b3dff}.r{display:flex;justify-content:space-between;margin-bottom:4px}button{background:none;border:0;color:#a493cc}', '<div class="b"><div class="r"><b>Volume boost <span id="v">100%</span></b><button id="x">✕</button></div><input id="s" type="range" min="0" max="500" value="100"><small style="color:#a493cc">Above 100% can distort. Silent video? That site blocks boosting.</small></div>');
  const r = vp.root; r.querySelector('#s').oninput = e => { r.querySelector('#v').textContent = e.target.value + '%'; boost(e.target.value / 100); }; r.querySelector('#x').onclick = () => { vp.remove(); vp = null; }; } });

/* element zapper */
const ZK = 'zap:' + host; let zapOn = false;
const zsel = el => { if (el.id && document.querySelectorAll('#' + CSS.escape(el.id)).length === 1) return '#' + CSS.escape(el.id); const p = []; while (el && el.nodeType === 1 && p.length < 5 && el !== document.body) { let s = el.tagName.toLowerCase(); const c = [...el.classList].filter(x => /^[\w-]{2,30}$/.test(x)).slice(0, 2); if (c.length) s += '.' + c.join('.'); else if (el.parentElement) s += `:nth-of-type(${[...el.parentElement.children].filter(x => x.tagName === el.tagName).indexOf(el) + 1})`; p.unshift(s); el = el.parentElement; } return p.join(' > '); };
async function zapApply() { const l = (await chrome.storage.local.get(ZK))[ZK] || []; sty('crux-zap', l.length ? l.map(s => s + '{display:none!important}').join('\n') : ''); return l; }
function zapStart() {
  if (zapOn) return; zapOn = true; const box = X.ui('.b{position:fixed;pointer-events:none;border:2px solid #ff2e88;background:#ff2e8830;border-radius:3px;transition:all .06s}.t{position:fixed;top:12px;left:50%;transform:translateX(-50%);background:#0b0618;color:#fff;border:1px solid #8b3dff;border-radius:12px;padding:6px 14px;font-weight:600}', '<div class="b" style="display:none"></div><div class="t">Click an element to remove it · Esc to finish</div>', 2147483645), b = box.root.querySelector('.b'); let cur;
  const mv = e => { const t = document.elementFromPoint(e.clientX, e.clientY); if (!t || t === box.host || t === document.body || t === document.documentElement) return; cur = t; const r = t.getBoundingClientRect(); Object.assign(b.style, { display: '', left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' }); };
  const ck = async e => { if (!cur) return; e.preventDefault(); e.stopImmediatePropagation(); const s = zsel(cur), l = await zapApply(); l.push(s); await chrome.storage.local.set({ [ZK]: l }); zapApply(); b.style.display = 'none'; cur = null; };
  const end = e => { if (e && e.key !== 'Escape') return; removeEventListener('mousemove', mv, true); removeEventListener('click', ck, true); removeEventListener('keydown', end, true); box.remove(); zapOn = false; };
  addEventListener('mousemove', mv, true); addEventListener('click', ck, true); addEventListener('keydown', end, true);
}
X.add('zap', { auto(on) { on ? zapApply() : sty('crux-zap', ''); }, run: zapStart });

/* selection bar */
let sb = null;
const hideSb = () => { sb && sb.remove(); sb = null; };
function selBar() {
  const s = getSelection(), t = String(s).trim(); if (!t || t.length > 300 || !s.rangeCount) return hideSb(); const r = s.getRangeAt(0).getBoundingClientRect(); if (!r.width) return hideSb(); hideSb();
  sb = X.ui('.b{position:fixed;display:flex;gap:2px;background:#0b0618;border:1px solid #8b3dff;border-radius:10px;padding:3px;box-shadow:0 6px 24px #000a}button{background:none;border:0;color:#efe3ff;padding:4px 9px;border-radius:7px}button:hover{background:#8b3dff}.d{position:fixed;width:300px;background:#0b0618;color:#efe3ff;border:1px solid #8b3dff;border-radius:12px;padding:10px 12px}', `<div class="b" style="left:${Math.max(6, r.left)}px;top:${Math.max(6, r.top - 44)}px"><button data-a="c">Copy</button><button data-a="s">Search</button><button data-a="d">Define</button><button data-a="t">Translate</button><button data-a="l">Listen</button></div>`, 2147483630);
  sb.root.addEventListener('mousedown', e => e.preventDefault()); sb.root.addEventListener('click', async e => { const a = e.target.dataset.a; if (!a) return;
    if (a === 'c') { navigator.clipboard.writeText(t); hideSb(); } else if (a === 's') open('https://www.google.com/search?q=' + encodeURIComponent(t)); else if (a === 't') open('https://translate.google.com/?sl=auto&op=translate&text=' + encodeURIComponent(t)); else if (a === 'l') speechSynthesis.speak(new SpeechSynthesisUtterance(t));
    else { const d = await X.api('define', { word: t.split(/\s+/)[0] }); const box = document.createElement('div'); box.className = 'd'; box.style.cssText = `left:${Math.max(6, r.left)}px;top:${r.bottom + 8}px`; box.textContent = d || `No definition found for “${t.split(/\s+/)[0]}”.`; sb.root.appendChild(box); } }); }
const sm = e => { if (e.target.closest && e.target.closest('crux-ui')) return; setTimeout(selBar, 10); };
X.add('selection', { auto(on) { removeEventListener('mouseup', sm, true); removeEventListener('scroll', hideSb, true); if (on && top) { addEventListener('mouseup', sm, true); addEventListener('scroll', hideSb, true); } else hideSb(); } });

/* screen comfort */
let cf = null;
function comfortApply(w, d) { if (!w && !d) { cf && cf.remove(); cf = null; return; } if (!cf) { cf = X.ui('.o{position:fixed;inset:0;pointer-events:none}', '<div class="o"></div>', 2147483000); cf.host.style.cssText += 'inset:0;pointer-events:none;'; } cf.root.querySelector('.o').style.cssText = `background:rgba(255,${Math.round(150 - w * 60)},30,${w * .6});mix-blend-mode:multiply;box-shadow:inset 0 0 0 100vmax rgba(0,0,0,${d * .6})`; }
let cp = null;
X.add('comfort', { auto(on) { const c = X.pref('comfort') || {}; on ? comfortApply(c.w || 0, c.d || 0) : comfortApply(0, 0); },
  run() { if (cp) { cp.remove(); cp = null; return; } const c = X.pref('comfort') || { w: 0, d: 0 };
    cp = X.ui('.b{position:fixed;right:16px;bottom:16px;background:#0b0618f5;color:#efe3ff;border:1px solid #8b3dff;border-radius:14px;padding:10px 14px;width:260px}input{width:100%;accent-color:#8b3dff}label{display:block;margin-top:6px}button{background:none;border:0;color:#a493cc;float:right}', `<div class="b"><b>Screen comfort</b><button id="x">✕</button><label>Warmth (blue-light filter)<input id="w" type="range" min="0" max="100" value="${c.w * 100}"></label><label>Dimming<input id="d" type="range" min="0" max="100" value="${c.d * 100}"></label></div>`);
    const r = cp.root, ch = () => { const v = { w: r.querySelector('#w').value / 100, d: r.querySelector('#d').value / 100 }; comfortApply(v.w, v.d); X.update(k => { k.enabled.comfort = true; k.prefs.comfort = v; }); }; r.querySelector('#w').oninput = r.querySelector('#d').oninput = ch; r.querySelector('#x').onclick = () => { cp.remove(); cp = null; }; },
  prompts: () => { const h = new Date().getHours(), c = X.pref('comfort'); return (h >= 21 || h < 5) && !(c && (c.w || c.d)) ? [{ id: 'comfort', icon: '🌅', title: 'Screen comfort', pri: 8, text: 'It’s late. Turn on a warm, dimmer screen filter to ease your eyes?', actions: [['Turn on', () => { comfortApply(.4, .1); X.update(k => { k.prefs.comfort = { w: .4, d: .1 }; }); }]] }] : []; } });

/* scroll progress + back to top */
let sc = null;
X.add('scrollbar', { auto(on) { sc && sc.remove(); sc = null; if (!on || !top) return; X.ready(() => { sc = X.ui('.p{position:fixed;top:0;left:0;height:3px;width:0;background:linear-gradient(90deg,#8b3dff,#c9a6ff);box-shadow:0 0 8px #8b3dff}.t{position:fixed;right:18px;bottom:18px;width:42px;height:42px;border-radius:50%;border:1px solid #8b3dff;background:#0b0618e8;color:#fff;font-size:18px;display:none;cursor:pointer}', '<div class="p"></div><button class="t" aria-label="Back to top">↑</button>', 2147483000); const p = sc.root.querySelector('.p'), t = sc.root.querySelector('.t'); let q = 0;
    const up = () => { q = 0; const h = document.documentElement.scrollHeight - innerHeight; p.style.width = (h > 0 ? scrollY / h * 100 : 0) + '%'; t.style.display = scrollY > innerHeight * 1.5 ? 'block' : 'none'; }; addEventListener('scroll', () => { if (!q) q = requestAnimationFrame(up); }, { passive: true }); t.onclick = () => scrollTo({ top: 0, behavior: 'smooth' }); up(); }); } });

/* auto-scroll */
let as = null;
X.add('autoscroll', { run() { if (as) { as.stop(); return; } let sp = 1, raf, acc = 0; const u = X.ui('.b{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);background:#0b0618f5;color:#efe3ff;border:1px solid #8b3dff;border-radius:14px;padding:6px 10px;display:flex;gap:8px;align-items:center}button{background:#8b3dff22;border:1px solid #8b3dff;border-radius:8px;padding:2px 10px;color:#fff;cursor:pointer}', '<div class="b"><button id="m">−</button><b id="s">1x</b><button id="p">+</button><button id="x">Stop</button></div>');
  const tick = () => { acc += sp * .6; const n = Math.floor(acc); if (n) { scrollBy(0, n); acc -= n; } raf = requestAnimationFrame(tick); }; raf = requestAnimationFrame(tick);
  const r = u.root, lab = () => (r.querySelector('#s').textContent = sp + 'x'); r.querySelector('#m').onclick = () => { sp = Math.max(1, sp - 1); lab(); }; r.querySelector('#p').onclick = () => { sp = Math.min(15, sp + 1); lab(); };
  as = { stop() { cancelAnimationFrame(raf); u.remove(); as = null; } }; r.querySelector('#x').onclick = as.stop; } });

/* form filler + temp mail */
const MAP = [['email', /e-?mail/], ['phone', /phone|mobile|tel\b/], ['first', /first.?name|fname|given/], ['last', /last.?name|lname|surname|family/], ['name', /^name$|full.?name|your.?name/], ['address', /address|street/], ['city', /city|town/], ['state', /state|province|region/], ['zip', /zip|postal|pin.?code/], ['country', /country/], ['company', /company|organi[sz]ation/]];
const ACMAP = { email: 'email', tel: 'phone', 'given-name': 'first', 'family-name': 'last', name: 'name', 'street-address': 'address', 'address-line1': 'address', 'address-level2': 'city', 'address-level1': 'state', 'postal-code': 'zip', 'country-name': 'country', organization: 'company' };
const fields = () => [...document.querySelectorAll('input:not([type=hidden]):not([type=password]):not([type=checkbox]):not([type=radio]):not([type=submit]),textarea')].filter(vis).map(i => { const lab = (i.labels && i.labels[0] ? i.labels[0].textContent : '') + ' ' + (i.name || '') + ' ' + (i.id || '') + ' ' + (i.placeholder || '') + ' ' + (i.getAttribute('aria-label') || ''); const k = ACMAP[(i.autocomplete || '').split(' ').pop()] || (i.type === 'email' ? 'email' : i.type === 'tel' ? 'phone' : (MAP.find(([, re]) => re.test(lab.toLowerCase())) || [])[0]); return k ? [i, k] : null; }).filter(Boolean);
async function formFill() { const p = (await chrome.storage.local.get('profile')).profile || {}; if (!p.email && !p.first) return X.api('open', { page: 'profile.html' }); let n = 0; fields().forEach(([i, k]) => { const v = k === 'name' ? p.name || [p.first, p.last].filter(Boolean).join(' ') : p[k]; if (v && !i.value) { setv(i, v); n++; } }); X.toast(n ? `Filled ${n} fields.` : 'Nothing to fill on this page.'); }
X.add('forms', { run: () => X.api('open', { page: 'profile.html' }), prompts: async () => { const f = fields(); if (f.length < 2) return []; const p = (await chrome.storage.local.get('profile')).profile; return [{ id: 'forms', icon: '✍️', title: 'Form filler', pri: 6, text: p && (p.email || p.first) ? 'Fill your saved name, email and address on this form?' : 'Save your details once and CRUX can fill forms like this for you.', actions: [[p && (p.email || p.first) ? 'Fill form' : 'Set up details', formFill], ['Edit details', () => X.api('open', { page: 'profile.html' }), false]] }]; } });
X.add('tempmail', { run: () => X.api('open', { page: 'tempmail.html' }), prompts: async () => {
  const em = [...document.querySelectorAll('input[type=email],input[name*=mail i],input[id*=mail i]')].filter(vis)[0]; const pw = [...document.querySelectorAll('input[type=password]')].filter(vis);
  if (!em || !(pw.length >= 2 || pw.some(i => /new-password/.test(i.autocomplete)) || /sign.?up|register|join|create/i.test(location.pathname))) return [];
  const tm = (await chrome.storage.local.get('tmail')).tmail;
  return [{ id: 'tempmail', icon: '📧', title: 'Temp email', pri: 3, text: 'Signing up? Use a throwaway email to keep spam out of your real inbox.', actions: tm ? [[`Fill ${tm.address}`, () => setv(em, tm.address)], ['Open inbox', () => X.api('open', { page: 'tempmail.html' }), false]] : [['Get temp email', () => X.api('open', { page: 'tempmail.html' })]] }]; } });

/* translate */
X.add('translate', { run: () => X.api('run', { mod: 'translate' }), prompts: () => { const pl = (document.documentElement.lang || '').toLowerCase().split('-')[0], ul = navigator.language.toLowerCase().split('-')[0]; if (!pl || pl.length !== 2 || pl === ul) return []; let nm = pl; try { nm = new Intl.DisplayNames([ul], { type: 'language' }).of(pl); } catch {} return [{ id: 'translate', icon: '🈯', title: 'Translate', pri: 3, text: `This page is in ${nm}. Translate it to your language?`, actions: [['Translate page', () => X.api('run', { mod: 'translate' })]] }]; } });

/* YouTube focus */
X.add('ytclean', { auto(on) { sty('crux-ytc', on && /(^|\.)youtube\.com$/.test(host) ? 'ytd-rich-shelf-renderer[is-shorts],ytd-reel-shelf-renderer,ytd-guide-entry-renderer:has(a[title="Shorts"]),ytd-mini-guide-entry-renderer:has(a[title="Shorts"]),ytd-watch-flexy #comments,ytd-watch-flexy #related,ytd-merch-shelf-renderer,.ytp-endscreen-content,.ytp-ce-element{display:none!important}' : ''); } });
})();
