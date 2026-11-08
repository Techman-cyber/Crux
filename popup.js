import { MODS, CATS } from './catalog.js';
const $ = s => document.querySelector(s);
let cfg, tab, host = '', cat = -1, ALL = MODS;
const save = () => chrome.storage.local.set({ crux: cfg });
const STAY = ['tabsaver', 'dark', 'mutetab', 'quickclean', 'cleaner', 'shot', 'fullshot', 'copylink', 'comfort', 'autoscroll'];
async function init() {
  [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  try { host = new URL(tab.url).hostname; } catch {}
  try { const tb = await (await fetch('tb.json')).json(); ALL = [...MODS, ...tb.map(([id, icon, name, tag, c]) => ({ id: 'tb:' + id, tool: id, cat: CATS.indexOf(c), icon, name, tag, run: 'Open', nosw: 1 }))]; } catch {}
  cfg = (await chrome.storage.local.get('crux')).crux || {};
  cfg.enabled ||= {}; cfg.paused ||= []; cfg.prefs ||= {}; if (cfg.bar === undefined) cfg.bar = true;
  MODS.forEach(m => { if (!(m.id in cfg.enabled)) cfg.enabled[m.id] = !!m.on; });
  const web = /^https?:/.test(tab?.url || '');
  $('#host').textContent = web ? host : 'Open a website to scan it'; $('#scan').disabled = !web; $('#pause').hidden = !web;
  paint(); stat();
}
async function stat() { try { const n = await chrome.action.getBadgeText({ tabId: tab.id }); $('#stat').textContent = n ? `${n} ads and trackers blocked here` : 'Nothing blocked on this page yet'; } catch {} }
const sw = () => MODS.filter(m => !m.nosw);
function paint() {
  const q = $('#q').value.toLowerCase(), on = sw().filter(m => cfg.enabled[m.id]).length;
  $('#sub').textContent = `${ALL.length} tools · ${on} of ${sw().length} switches on`;
  $('#pwr').classList.toggle('on', on === sw().length);
  $('#pills').innerHTML = ['All', ...CATS].map((c, i) => `<button data-c="${i - 1}" class="${i - 1 === cat ? 'on' : ''}">${c}</button>`).join('');
  $('#grid').innerHTML = ALL.filter(m => (cat < 0 || m.cat === cat) && (m.name + ' ' + m.tag).toLowerCase().includes(q)).map(m => `<div class="t ${cfg.enabled[m.id] ? 'on' : ''}"><div class="h"><span class="i">${m.icon}</span>${m.nosw ? '' : `<label class="sw"><input type="checkbox" data-id="${m.id}" ${cfg.enabled[m.id] ? 'checked' : ''} aria-label="${m.name}"><i></i></label>`}</div><b>${m.name}</b><small>${m.tag}</small>${m.run ? `<button data-run="${m.id}">${m.run}</button>` : ''}</div>`).join('') || '<p class="mu" style="grid-column:1/-1">No tool matches that.</p>';
  $('#bar').checked = cfg.bar !== false; $('#pause').textContent = cfg.paused.includes(host) ? 'Resume here' : 'Pause here';
}
document.addEventListener('change', e => { const id = e.target.dataset.id; if (id) { cfg.enabled[id] = e.target.checked; save(); paint(); } });
document.addEventListener('click', async e => {
  const d = e.target.dataset;
  if (d.c != null && d.c !== '') { cat = +d.c; paint(); return; }
  if (!d.run) return; const m = ALL.find(x => x.id === d.run);
  if (m.id === 'copylink') { const u = new URL(tab.url); ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid', 'igshid'].forEach(k => u.searchParams.delete(k)); await navigator.clipboard.writeText(`[${tab.title}](${u.href})`); e.target.textContent = 'Markdown link copied ✔'; return; }
  const r = await chrome.runtime.sendMessage({ type: 'run', mod: m.tool ? 'toolbox' : m.id, tool: m.tool, tabId: tab?.id });
  if (r && r.ok === false) { e.target.textContent = 'Not on this page'; return; }
  STAY.includes(m.id) ? (e.target.textContent = 'Done ✔') : window.close();
});
$('#scan').onclick = async () => { await chrome.runtime.sendMessage({ type: 'run', mod: 'track', tabId: tab.id }); window.close(); };
$('#pwr').onclick = () => { const all = sw().every(m => cfg.enabled[m.id]); sw().forEach(m => (cfg.enabled[m.id] = !all)); save(); paint(); };
$('#pause').onclick = () => { cfg.paused = cfg.paused.includes(host) ? cfg.paused.filter(h => h !== host) : [...cfg.paused, host]; save(); paint(); };
$('#bar').onchange = e => { cfg.bar = e.target.checked; save(); };
$('#q').oninput = paint;
init();
