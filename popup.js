import { MODS, CATS } from './catalog.js';
const $ = s => document.querySelector(s);
const MODE = /hub\.html/.test(location.pathname) ? 'full' : /side\.html/.test(location.pathname) ? 'side' : 'popup', BIG = MODE !== 'popup';
let cfg, tab, host = '', cat = -1, ALL = MODS, byId = {};
const save = () => chrome.storage.local.set({ crux: cfg });
const STAY = ['tabsaver', 'dark', 'mutetab', 'quickclean', 'cleaner', 'shot', 'fullshot', 'copylink', 'comfort', 'autoscroll', 'readlater', 'print'];
const pins = () => cfg.prefs.pins || [], sw = () => MODS.filter(m => !m.nosw);
const okTab = t => t && !/^(chrome-extension|devtools|about):/.test(t.url || '');
async function getTarget() {
  if (MODE !== 'full') { const [a] = await chrome.tabs.query({ active: true, currentWindow: true }); if (okTab(a)) return a; }
  const all = await chrome.tabs.query({ currentWindow: true }), p = +new URLSearchParams(location.search).get('tab');
  const best = all.filter(okTab).sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0))[0];
  if (best) return best; if (p) try { return await chrome.tabs.get(p); } catch {} return all[0];
}
async function refresh() {
  tab = await getTarget(); try { host = new URL(tab.url).hostname; } catch { host = ''; }
  const web = /^https?:/.test(tab?.url || '');
  $('#host').textContent = web ? host : 'Open a website to scan it'; $('#scan').disabled = !web; $('#pause').hidden = !web;
  $('#pause').textContent = cfg.paused.includes(host) ? 'Resume here' : 'Pause here';
  try { const n = await chrome.action.getBadgeText({ tabId: tab.id }); $('#stat').textContent = n ? `${n} ads and trackers blocked here` : 'Nothing blocked on this page yet'; } catch {}
}
async function init() {
  try { const tb = await (await fetch('tb.json')).json(); ALL = [...MODS, ...tb.map(([id, icon, name, tag, c]) => ({ id: 'tb:' + id, tool: id, cat: CATS.indexOf(c), icon, name, tag, run: 'Open', nosw: 1 }))]; } catch {}
  ALL.forEach(m => (byId[m.id] = m));
  cfg = (await chrome.storage.local.get('crux')).crux || {};
  cfg.enabled ||= {}; cfg.paused ||= []; cfg.prefs ||= {}; if (cfg.bar === undefined) cfg.bar = true;
  MODS.forEach(m => { if (!(m.id in cfg.enabled)) cfg.enabled[m.id] = !!m.on; });
  $('#q').placeholder = BIG ? `Search ${ALL.length} tools   ( press / )` : `Search ${ALL.length} tools`;
  await refresh(); paint();
  if (BIG) { chrome.tabs.onActivated.addListener(refresh); chrome.tabs.onUpdated.addListener((id, c) => c.status === 'complete' && refresh()); addEventListener('keydown', e => { if (e.key === '/' && document.activeElement !== $('#q')) { e.preventDefault(); $('#q').focus(); } }); }
}
const tile = m => { const p = pins().includes(m.id); return `<div class="t ${cfg.enabled[m.id] ? 'on' : ''}"><div class="h"><span class="i">${m.icon}</span><span style="flex:1"></span><button class="pin ${p ? 'on' : ''}" data-pin="${m.id}" title="${p ? 'Unpin' : 'Pin to top'}" aria-label="${p ? 'Unpin' : 'Pin'} ${m.name}">${p ? '★' : '☆'}</button>${m.nosw ? '' : `<label class="sw"><input type="checkbox" data-id="${m.id}" ${cfg.enabled[m.id] ? 'checked' : ''} aria-label="${m.name}"><i></i></label>`}</div><b>${m.name}</b><small>${m.tag}</small>${m.run ? `<button data-run="${m.id}">${m.run}</button>` : ''}</div>`; };
const sec = (t, ms) => ms.length ? `<h3 class="sec">${t}</h3>` + ms.map(tile).join('') : '';
function paint() {
  const q = $('#q').value.toLowerCase(), on = sw().filter(m => cfg.enabled[m.id]).length, P = pins();
  const hit = m => (m.name + ' ' + m.tag).toLowerCase().includes(q), inCat = m => cat === -1 || (cat === -2 ? P.includes(m.id) : m.cat === cat);
  $('#sub').textContent = `${ALL.length} tools · ${on} of ${sw().length} switches on`; $('#pwr').classList.toggle('on', on === sw().length);
  const cnt = i => ALL.filter(m => (i === -1 ? 1 : i === -2 ? P.includes(m.id) : m.cat === i)).length, names = [[-1, 'All'], [-2, '★ Pinned'], ...CATS.map((c, i) => [i, c])];
  $('#pills').innerHTML = names.map(([i, c]) => `<button data-c="${i}" class="${i === cat ? 'on' : ''}">${c}</button>`).join('');
  if ($('#cats')) $('#cats').innerHTML = names.map(([i, c]) => `<button data-c="${i}" class="${i === cat ? 'on' : ''}">${c}<small>${cnt(i)}</small></button>`).join('');
  const list = ALL.filter(m => hit(m) && inCat(m)), rec = (cfg.prefs.recent || []).map(id => byId[id]).filter(Boolean).slice(0, 6);
  $('#grid').innerHTML = BIG && cat === -1 && !q ? sec('★ Pinned', P.map(id => byId[id]).filter(Boolean)) + sec('Recently used', rec) + CATS.map((c, i) => sec(c, ALL.filter(m => m.cat === i))).join('') : list.map(tile).join('') || `<p class="mu" style="grid-column:1/-1">${cat === -2 ? 'Nothing pinned yet. Tap ☆ on any tool to keep it here.' : 'No tool matches that.'}</p>`;
  $('#bar').checked = cfg.bar !== false;
}
document.addEventListener('change', e => { const id = e.target.dataset.id; if (id) { cfg.enabled[id] = e.target.checked; save(); paint(); } });
document.addEventListener('click', async e => {
  const b = e.target.closest('button'); if (!b) return; const d = b.dataset;
  if (d.c != null && d.c !== '') { cat = +d.c; paint(); return; }
  if (d.pin) { const P = pins(); cfg.prefs.pins = P.includes(d.pin) ? P.filter(x => x !== d.pin) : [d.pin, ...P]; save(); paint(); return; }
  if (!d.run) return; const m = byId[d.run];
  cfg.prefs.recent = [m.id, ...(cfg.prefs.recent || []).filter(x => x !== m.id)].slice(0, 12); save();
  if (m.id === 'copylink') { const u = new URL(tab.url); ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid', 'igshid'].forEach(k => u.searchParams.delete(k)); await navigator.clipboard.writeText(`[${tab.title}](${u.href})`); b.textContent = 'Markdown link copied ✔'; return; }
  const r = await chrome.runtime.sendMessage({ type: 'run', mod: m.tool ? 'toolbox' : m.id, tool: m.tool, tabId: tab?.id });
  if (r && r.ok === false) { b.textContent = 'Not on this page'; return; }
  if (BIG || STAY.includes(m.id)) b.textContent = 'Done ✔'; else window.close();
});
$('#scan').onclick = async () => { await chrome.runtime.sendMessage({ type: 'run', mod: 'track', tabId: tab.id }); if (!BIG) window.close(); };
$('#pwr').onclick = () => { const all = sw().every(m => cfg.enabled[m.id]); sw().forEach(m => (cfg.enabled[m.id] = !all)); save(); paint(); };
$('#pause').onclick = () => { cfg.paused = cfg.paused.includes(host) ? cfg.paused.filter(h => h !== host) : [...cfg.paused, host]; save(); refresh(); };
$('#bar').onchange = e => { cfg.bar = e.target.checked; save(); };
$('#q').oninput = paint;
if ($('#full')) $('#full').onclick = () => { chrome.tabs.create({ url: chrome.runtime.getURL('hub.html') + '?tab=' + tab.id }); window.close(); };
if ($('#side')) $('#side').onclick = async () => { try { await chrome.sidePanel.open({ windowId: tab.windowId }); window.close(); } catch { $('#side').title = 'Side panel isn’t supported in this browser'; $('#side').textContent = '✕'; } };
init();
