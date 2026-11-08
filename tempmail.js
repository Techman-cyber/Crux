const $ = s => document.querySelector(s), A = 'https://api.mail.tm', esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let acct, tok;
const call = async (p, o = {}) => { const r = await fetch(A + p, { ...o, headers: { 'Content-Type': 'application/json', ...(tok ? { Authorization: 'Bearer ' + tok } : {}), ...(o.headers || {}) } }); if (!r.ok) throw new Error(r.status); return r.json(); };
const rnd = n => [...crypto.getRandomValues(new Uint8Array(n))].map(b => 'abcdefghijkmnpqrstuvwxyz23456789'[b % 32]).join('');
async function make() {
  $('#addr').textContent = 'Creating…'; $('#in').innerHTML = '<p class="mu">Waiting for mail… checking every 10 seconds.</p>'; $('#rd').hidden = true;
  try { const d = (await call('/domains'))['hydra:member'][0].domain, address = `${rnd(10)}@${d}`, password = rnd(16); await call('/accounts', { method: 'POST', body: JSON.stringify({ address, password }) }); tok = (await call('/token', { method: 'POST', body: JSON.stringify({ address, password }) })).token; acct = { address, password }; await chrome.storage.local.set({ tmail: acct }); show(); poll(); }
  catch { $('#addr').textContent = 'Couldn’t reach the mail service. Check your connection and try again.'; }
}
async function restore() { const { tmail } = await chrome.storage.local.get('tmail'); if (!tmail) return make(); try { tok = (await call('/token', { method: 'POST', body: JSON.stringify(tmail) })).token; acct = tmail; show(); poll(); } catch { make(); } }
const show = () => ($('#addr').textContent = acct.address);
async function poll() { try { const l = (await call('/messages'))['hydra:member']; $('#st').textContent = 'Updated ' + new Date().toLocaleTimeString(); if (l.length) $('#in').innerHTML = l.map(m => `<div class="m" data-id="${m.id}"><b>${esc(m.subject || '(no subject)')}</b><span class="mu">${esc(m.from.address)} · ${new Date(m.createdAt).toLocaleString()}</span></div>`).join(''); } catch { } }
$('#in').onclick = async e => { const m = e.target.closest('.m'); if (!m) return; const j = await call('/messages/' + m.dataset.id); $('#rd').hidden = false; $('#sj').textContent = j.subject; $('#fr').textContent = 'From ' + j.from.address; $('#bd').textContent = j.text || (j.html || []).join('').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '); };
$('#cp').onclick = () => navigator.clipboard.writeText(acct.address).then(() => ($('#cp').textContent = 'Copied ✔'));
$('#nw').onclick = make; setInterval(poll, 10000); restore();
