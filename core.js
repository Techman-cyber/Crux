// CRUX content core: settings, module registry, UI helpers, and the popup prompt system.
(() => {
if (window.__crux) return;
const isTop = window.top === window, host = location.hostname;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const hostOf = u => { try { return new URL(u).hostname; } catch { return ''; } };
const C = { cfg: { enabled: {}, paused: [], barOff: [], muted: {}, prefs: {}, bar: true }, loaded: false };
const reg = {};
const api = (type, o = {}) => new Promise(r => { try { chrome.runtime.sendMessage({ type, ...o }, x => { void chrome.runtime.lastError; r(x && x.ok ? x.data : null); }); } catch { r(null); } });
const ready = f => document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', f, { once: true }) : f();
const on = id => !!C.cfg.enabled[id] && !C.cfg.paused.includes(host);
const BASE = ':host{all:initial}*{box-sizing:border-box;margin:0;font:13px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif}button{cursor:pointer;color:inherit}';
function ui(css, html, z = 2147483600) {
  const h = document.createElement('crux-ui'); h.style.cssText = `all:initial;position:fixed;z-index:${z};`;
  const root = h.attachShadow({ mode: 'closed' }); root.innerHTML = `<style>${BASE}${css}</style>${html}`;
  (document.body || document.documentElement).appendChild(h);
  return { host: h, root, remove: () => h.remove() };
}

/* ---------- popup prompts ---------- */
const PCSS = `.s{position:fixed;top:14px;right:14px;width:344px;max-width:calc(100vw - 28px);display:flex;flex-direction:column;gap:10px}
.c{background:rgba(11,6,24,.97);color:#efe3ff;border:1px solid #8b3dff99;border-radius:16px;padding:12px 14px;box-shadow:0 10px 36px #000a,0 0 22px #8b3dff44;animation:in .35s cubic-bezier(.2,1.2,.4,1)}
.c.warn{border-color:#ffb020;box-shadow:0 10px 36px #000a,0 0 22px #ffb02055}@keyframes in{from{transform:translateX(120%);opacity:0}}
.h{display:flex;align-items:center;gap:8px;margin-bottom:4px}.i{font-size:19px}.h b{flex:1;font-size:14px}.x{background:none;border:0;color:#a493cc;font-size:15px;padding:0 4px}.x:hover{color:#fff}
p{color:#d9cdf2;margin-bottom:10px}.a{display:flex;gap:8px;flex-wrap:wrap}
.a button{background:#8b3dff22;border:1px solid #8b3dff;border-radius:10px;padding:5px 12px;font-weight:600}.a button.p{background:#8b3dff;color:#fff}.a button:hover{background:#a064ff;color:#fff}
.f{display:flex;gap:14px;margin-top:9px;padding-top:7px;border-top:1px solid #8b3dff33}.l{background:none;border:0;color:#a493cc;font-size:11.5px;padding:0}.l:hover{color:#fff;text-decoration:underline}
@media (prefers-reduced-motion:reduce){.c{animation:none}}`;
const Q = { host: null, box: null, wait: [], shown: 0 };
function stack() { if (Q.host && Q.host.isConnected) return; const u = ui(PCSS, '<div class="s"></div>', 2147483640); Q.host = u.host; Q.box = u.root.querySelector('.s'); Q.shown = 0; }
function pop(p) {
  stack(); Q.shown++;
  const el = document.createElement('div'); el.className = 'c ' + (p.tone || '');
  el.innerHTML = `<div class="h"><span class="i">${esc(p.icon || '✦')}</span><b>${esc(p.title)}</b><button class="x" aria-label="Close">✕</button></div><p>${esc(p.text)}</p><div class="a"></div><div class="f"><button class="l n">Not now</button><button class="l v">Don’t ask on this site</button></div>`;
  const a = el.querySelector('.a'); let t;
  const close = () => { clearTimeout(t); el.remove(); Q.shown--; const n = Q.wait.shift(); if (n) pop(n); else if (!Q.shown) { Q.host.remove(); Q.host = null; } };
  (p.actions || []).forEach(([label, fn, primary], i) => { const b = document.createElement('button'); b.textContent = label; if (primary ?? i === 0) b.className = 'p'; b.onclick = () => { close(); try { fn(); } catch {} }; a.appendChild(b); });
  el.querySelector('.x').onclick = el.querySelector('.n').onclick = close;
  el.querySelector('.v').onclick = () => { close(); update(c => { c.muted ||= {}; (c.muted[host] ||= []).includes(p.tool) || c.muted[host].push(p.tool); }); };
  const arm = () => { clearTimeout(t); t = setTimeout(close, p.ttl || 26000); }; el.onmouseenter = () => clearTimeout(t); el.onmouseleave = arm; arm();
  Q.box.appendChild(el);
}
// p: {id, tool, icon, title, text, tone, actions:[[label, fn, primary?]], ttl}
function ask(p) {
  if (!isTop || C.cfg.bar === false || C.cfg.paused.includes(host) || C.cfg.barOff.includes(host)) return;
  const tool = p.tool || p.id.split(':')[0]; p.tool = tool;
  if ((C.cfg.muted?.[host] || []).includes(tool)) return;
  try { const k = 'crux-p:' + p.id; if (sessionStorage.getItem(k)) return; sessionStorage.setItem(k, '1'); } catch {}
  Q.shown >= 3 ? Q.wait.push(p) : pop(p);
}
function toast(msg, acts = []) { if (!isTop) return; stack(); const t = { id: 'toast:' + Math.random(), tool: 'toast', icon: '✦', title: 'CRUX', text: msg, ttl: 7000, actions: acts.map(([l, f]) => [l, f]) }; if (!acts.length) t.actions = [['OK', () => {}]]; pop(t); }

function add(id, m) { reg[id] = m; if (C.loaded) try { m.auto?.(on(id)); } catch {} }
async function update(fn) { try { const { crux } = await chrome.storage.local.get('crux'); crux.prefs ||= {}; fn(crux); await chrome.storage.local.set({ crux }); } catch {} }
const setPref = (k, v) => update(c => { c.prefs[k] = v; });
const relay = () => document.dispatchEvent(new CustomEvent('crux:cfg', { detail: JSON.stringify({ redirect: on('redirect') }) }));
async function load() {
  try { const { crux } = await chrome.storage.local.get('crux'); if (crux) C.cfg = { ...C.cfg, ...crux, enabled: crux.enabled || {} }; } catch { return; }
  C.loaded = true; relay();
  for (const [id, m] of Object.entries(reg)) try { m.auto?.(on(id)); } catch {}
}
window.__crux = { reg, add, api, ui, ask, toast, esc, hostOf, ready, on, setPref, update, pref: k => C.cfg.prefs?.[k], run: id => reg[id]?.run?.(), get cfg() { return C.cfg; } };
document.addEventListener('crux:hello', relay);
document.addEventListener('crux:blocked', e => {
  let d; try { d = JSON.parse(e.detail); } catch { return; }
  ask({ id: 'redirect:' + Date.now(), tool: 'redirect', icon: '↩️', title: 'Redirect blocker', text: `Blocked ${d.kind === 'popup' ? 'a popup' : 'an automatic redirect'} to ${hostOf(d.url) || 'another site'}.`, actions: [['Allow once', () => document.dispatchEvent(new CustomEvent('crux:allow', { detail: JSON.stringify(d) })), false], ['Keep blocking', () => {}, true]] });
});
try { chrome.storage.onChanged.addListener((c, a) => { if (a === 'local' && c.crux) load(); }); } catch {}
setTimeout(load, 0);

/* ---------- built-in prompts (Track, safety, recorder) ---------- */
const BR = 'google paypal amazon microsoft apple facebook instagram netflix whatsapp binance coinbase paytm phonepe flipkart sbi hdfcbank icicibank gmail outlook linkedin twitter telegram dropbox adobe steam discord'.split(' ');
function risky() {
  const h = host.replace(/^www\./, ''), p = h.split('.'), lab = (p.length > 2 && p[p.length - 1].length === 2 ? p[p.length - 3] : p[p.length - 2]) || h, pw = !!document.querySelector('input[type=password]');
  if (pw && location.protocol === 'http:') return 'This page asks for a password over an unencrypted connection.';
  if (h.includes('xn--')) return 'The address uses look-alike characters, a common phishing trick.';
  const b = BR.find(x => lab !== x && lab.split('-').includes(x)); if (b && lab.includes('-')) return `The address imitates ${b}, but it isn’t ${b}.`;
  const t = (document.title || '').toLowerCase(), tb = BR.find(x => t.includes(x)); if (pw && tb && lab !== tb && !h.includes(tb)) return `The page says “${tb}” but you’re on ${h}.`;
  return '';
}
add('track', { prompts: () => [{ id: 'track', icon: '🛰️', title: 'Track', pri: 4, text: `Scan ${host}? See who owns it, how old it is, contacts, developers and server.`, actions: [['Scan this site', () => api('run', { mod: 'track' })]] }] });
add('safecheck', { prompts: () => { const r = risky(); return r ? [{ id: 'safecheck:risk', icon: '⚠️', title: 'This site looks risky', tone: 'warn', pri: 1, text: r + ' Don’t enter passwords or card details until you’ve checked it.', actions: [['Check this site', () => api('run', { mod: 'safecheck' })], ['Leave', () => { history.length > 1 ? history.back() : (location.href = 'about:blank'); }, false]] }] : []; } });
add('recorder', { prompts: () => [...document.querySelectorAll('video')].some(v => v.getBoundingClientRect().width > 300) ? [{ id: 'recorder', icon: '🎥', title: 'Screen recorder', pri: 7, text: 'Want to record this video or your screen?', actions: [['Open recorder', () => api('run', { mod: 'recorder' })]] }] : [] });

async function scan() {
  if (!isTop || !/^https?:$/.test(location.protocol)) return; if (!C.loaded) await load();
  const list = [];
  for (const [id, m] of Object.entries(reg)) if (on(id) && m.prompts) try { list.push(...(await m.prompts()).filter(Boolean).map(p => ({ tool: id, ...p }))); } catch {}
  list.sort((a, b) => (a.pri || 5) - (b.pri || 5)).slice(0, 7).forEach(ask);
}
window.__crux.scan = scan;
if (isTop) ready(() => setTimeout(scan, 1500));
})();
