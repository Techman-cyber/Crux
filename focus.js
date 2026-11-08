const $ = s => document.querySelector(s); let cfg;
const norm = t => [...new Set(t.split(/[\n,\s]+/).map(x => x.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]).filter(x => /^[a-z0-9.-]+\.[a-z]{2,}$/.test(x)))];
(async () => {
  cfg = (await chrome.storage.local.get('crux')).crux; $('#l').value = (cfg.focus || []).join('\n'); $('#on').checked = !!cfg.enabled.focus;
  $('#ch').innerHTML = ['youtube.com', 'instagram.com', 'facebook.com', 'x.com', 'twitter.com', 'reddit.com', 'tiktok.com', 'netflix.com', 'twitch.tv', 'snapchat.com'].map(d => `<button data-d="${d}">+ ${d}</button>`).join('');
})();
document.addEventListener('click', e => { if (e.target.dataset.d) $('#l').value = norm($('#l').value + '\n' + e.target.dataset.d).join('\n'); });
$('#s').onclick = async () => { cfg.focus = norm($('#l').value); cfg.enabled.focus = $('#on').checked; await chrome.storage.local.set({ crux: cfg }); $('#l').value = cfg.focus.join('\n'); $('#m').textContent = cfg.enabled.focus ? `Blocking ${cfg.focus.length} sites.` : 'Saved. Focus guard is off.'; };
const send = o => chrome.runtime.sendMessage({ type: 'pomo', ...o });
$('#ps').onclick = async () => { if (!cfg.focus?.length) return ($('#pl').textContent = 'Add and save at least one site below first.'); const [w, b] = $('#pd').value.split(',').map(Number); await send({ act: 'start', work: w, brk: b }); tick(); };
$('#px').onclick = async () => { await send({ act: 'stop' }); tick(); };
async function tick() { const r = await send({ act: 'state' }), p = r && r.data; if (!p || !p.phase) { $('#pt').textContent = ''; $('#pl').textContent = ''; return; } const s = Math.max(0, Math.round((p.end - Date.now()) / 1000)); $('#pt').textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; $('#pl').textContent = p.phase === 'work' ? 'Focus time. Distractions are blocked.' : 'Break time. Stretch, drink some water.'; }
setInterval(tick, 1000); tick();
