const $ = s => document.querySelector(s), esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let tabs = [], me;
const host = u => { try { return new URL(u).hostname; } catch { return u || ''; } };
async function load() { me = (await chrome.tabs.getCurrent())?.id; tabs = (await chrome.tabs.query({})).filter(t => t.id !== me); draw(); stash(); }
function draw() {
  const f = $('#q').value.toLowerCase(), seen = new Map(); tabs.forEach(t => seen.set(t.url, (seen.get(t.url) || 0) + 1));
  $('#ct').textContent = `${tabs.length} tabs open`;
  const wins = [...new Set(tabs.map(t => t.windowId))];
  $('#list').innerHTML = wins.map((w, i) => `<h3 style="margin-top:${i ? 14 : 0}px">Window ${i + 1}</h3>` + tabs.filter(t => t.windowId === w && ((t.title || '') + (t.url || '')).toLowerCase().includes(f)).map(t => `<div class="t ${t.active ? 'act' : ''}"><img src="${esc(t.favIconUrl || 'icon16.png')}" alt=""><div><b>${esc(t.title)}</b><small>${esc(host(t.url))}</small> ${seen.get(t.url) > 1 ? '<span class="fl">duplicate</span>' : ''}${t.audible ? '<span class="fl"> 🔊</span>' : ''}${t.discarded ? '<span class="fl"> 💤</span>' : ''}</div><div><button data-go="${t.id}" data-w="${t.windowId}">Go</button> <button data-x="${t.id}">Close</button></div></div>`).join('')).join('') || '<p class="mu">No tabs.</p>';
}
async function stash() { const { stash: s = [] } = await chrome.storage.local.get('stash'); $('#stash').innerHTML = s.length ? s.map((x, i) => `<div class="st"><div><b>${esc(x.name)}</b><br><small class="mu">${x.tabs.length} tabs</small></div><div><button data-r="${i}">Restore</button> <button data-d="${i}" class="dng">Delete</button></div></div>`).join('') : '<p class="mu">Nothing stashed. “Stash this window” saves its tabs and closes them, so you can come back later.</p>'; }
document.addEventListener('click', async e => {
  const d = e.target.dataset; if (!Object.keys(d).length) return;
  if (d.go) { await chrome.tabs.update(+d.go, { active: true }); await chrome.windows.update(+d.w, { focused: true }); }
  else if (d.x) { await chrome.tabs.remove(+d.x); await load(); }
  else if (d.r != null || d.d != null) { const { stash: s = [] } = await chrome.storage.local.get('stash'), i = +(d.r ?? d.d); if (d.r != null) s[i].tabs.forEach(t => chrome.tabs.create({ url: t.url, active: false })); else s.splice(i, 1); await chrome.storage.local.set({ stash: s }); stash(); }
});
$('#q').oninput = draw;
$('#dd').onclick = async () => { const seen = new Set(), dup = []; tabs.forEach(t => { if (t.url && !t.pinned && seen.has(t.url)) dup.push(t.id); seen.add(t.url); }); if (dup.length) await chrome.tabs.remove(dup); await load(); $('#dd').textContent = `Closed ${dup.length}`; };
$('#mu').onclick = async () => { const [a] = await chrome.tabs.query({ active: true, lastFocusedWindow: true }); for (const t of tabs) if (t.audible) await chrome.tabs.update(t.id, { muted: true }); $('#mu').textContent = 'Muted ✔'; };
$('#sw').onclick = async () => { const w = (await chrome.windows.getCurrent()).id, ts = tabs.filter(t => t.windowId === w && /^https?:/.test(t.url || '') && !t.pinned); if (!ts.length) return; const { stash: s = [] } = await chrome.storage.local.get('stash'); s.unshift({ name: new Date().toLocaleString(), tabs: ts.map(t => ({ title: t.title, url: t.url })) }); await chrome.storage.local.set({ stash: s }); await chrome.tabs.remove(ts.map(t => t.id)); await load(); };
chrome.tabs.onUpdated.addListener((id, ch) => (ch.title || ch.url || ch.audible) && load()); chrome.tabs.onRemoved.addListener(load);
load();
