import { derive, encrypt, decrypt, exportKey, importKey, b64, ub64 } from './vcrypto.js';
import { gen, entropy, label, pwned } from './pw.js';
const $ = s => document.querySelector(s), ITER = 600000, L = chrome.storage.local;
let key, items = [], meta, q = '', cur = null;
const err = m => ($('#err').textContent = m), esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ping = () => chrome.runtime.sendMessage({ type: 'vault.touch' });
const persist = async () => { await L.set({ vault: await encrypt(key, items, meta) }); ping(); };
const session = async () => { await chrome.storage.session.set({ vk: await exportKey(key) }); ping(); };
async function boot() {
  const { vault } = await L.get('vault'), { vk } = await chrome.storage.session.get('vk');
  if (vault && vk) try { key = await importKey(vk); items = await decrypt(key, vault); meta = { v: 1, iter: vault.iter, salt: vault.salt }; return show(); } catch { await chrome.storage.session.remove('vk'); }
  $('#app').hidden = true; $('#lock').hidden = false; $('#create').hidden = !!vault; $('#unlock').hidden = !vault; ($(vault ? '#pu' : '#p1')).focus();
}
$('#mk').onclick = async () => {
  const p = $('#p1').value; if (p.length < 10) return err('Use at least 10 characters. A phrase of four or more random words works well.'); if (p !== $('#p2').value) return err('The two passwords don’t match.');
  const salt = crypto.getRandomValues(new Uint8Array(16)); meta = { v: 1, iter: ITER, salt: b64(salt) }; key = await derive(p, salt, ITER); items = []; await persist(); await session(); show();
};
$('#un').onclick = async () => {
  const { vault } = await L.get('vault');
  try { const k = await derive($('#pu').value, ub64(vault.salt), vault.iter); items = await decrypt(k, vault); key = k; meta = { v: 1, iter: vault.iter, salt: vault.salt }; await session(); show(); } catch { err('Wrong master password.'); }
};
$('#pu').onkeydown = e => e.key === 'Enter' && $('#un').click(); $('#p2').onkeydown = e => e.key === 'Enter' && $('#mk').click();
function show() { $('#lock').hidden = true; $('#app').hidden = false; render(); }
const host = u => { try { return new URL(u.includes('://') ? u : 'https://' + u).hostname.replace(/^www\./, ''); } catch { return u; } };
function render() {
  const dup = {}; items.forEach(i => i.pass && (dup[i.pass] = (dup[i.pass] || 0) + 1));
  const weak = items.filter(i => entropy(i.pass) < 50).length, reused = items.filter(i => dup[i.pass] > 1).length;
  $('#aud').textContent = items.length ? `${items.length} logins · ${weak} weak · ${reused} reused` : '';
  const f = items.filter(i => (i.title + i.url + i.user).toLowerCase().includes(q.toLowerCase())).sort((a, b) => a.title.localeCompare(b.title));
  $('#list').innerHTML = f.map(i => `<div class="it"><div class="ic">${esc((i.title || '?')[0].toUpperCase())}</div><div><b>${esc(i.title)}${entropy(i.pass) < 50 ? '<span class="fl warn">weak</span>' : ''}${dup[i.pass] > 1 ? '<span class="fl bad">reused</span>' : ''}</b><small>${esc(i.user)} · ${esc(host(i.url || ''))}</small></div><div class="acts"><button data-a="cu" data-id="${i.id}">Copy user</button><button data-a="cp" data-id="${i.id}">Copy password</button>${i.url ? `<button data-a="op" data-id="${i.id}">Open</button>` : ''}<button data-a="ed" data-id="${i.id}">Edit</button></div></div>`).join('') || `<div class="empty">${items.length ? 'Nothing matches that search.' : 'No logins yet. Add your first one with “New login”.'}</div>`;
}
$('#q').oninput = e => { q = e.target.value; render(); };
async function copy(t, btn) { await navigator.clipboard.writeText(t); const o = btn.textContent; btn.textContent = 'Copied ✔'; setTimeout(() => (btn.textContent = o), 1400); setTimeout(() => navigator.clipboard.writeText(' ').catch(() => {}), 20000); }
$('#list').onclick = e => {
  const b = e.target.closest('button'); if (!b) return; const i = items.find(x => x.id === b.dataset.id); if (!i) return;
  ({ cu: () => copy(i.user, b), cp: () => copy(i.pass, b), op: () => window.open(i.url.includes('://') ? i.url : 'https://' + i.url), ed: () => edit(i) })[b.dataset.a]();
};
const meter = (v, bar, lab) => { const e = entropy(v), [t, c] = label(e); $(bar).style.width = Math.min(100, e) + '%'; $(bar).style.background = c; $(lab).textContent = v ? `${t} · about ${e} bits` : ''; };
function edit(i) {
  cur = i || { id: crypto.randomUUID(), title: '', url: '', user: '', pass: '', notes: '' };
  $('#et').textContent = i ? 'Edit login' : 'New login';
  [['t', 'title'], ['u', 'url'], ['us', 'user'], ['pw', 'pass'], ['n', 'notes']].forEach(([k, f]) => ($('#' + k).value = cur[f] || '')); $('#pw').type = 'password'; $('#sh').textContent = 'Show'; $('#bm').textContent = ''; $('#del').hidden = !i; meter(cur.pass, '#sb2', '#sl'); $('#ed').showModal();
}
$('#add').onclick = () => edit(null); $('#cx').onclick = () => $('#ed').close();
$('#pw').oninput = () => meter($('#pw').value, '#sb2', '#sl');
$('#sh').onclick = () => { const h = $('#pw').type === 'password'; $('#pw').type = h ? 'text' : 'password'; $('#sh').textContent = h ? 'Hide' : 'Show'; };
$('#gn').onclick = () => { $('#pw').value = gen({ len: 20 }); $('#pw').type = 'text'; $('#sh').textContent = 'Hide'; meter($('#pw').value, '#sb2', '#sl'); };
$('#br').onclick = async () => { const p = $('#pw').value; if (!p) return; $('#bm').textContent = 'Checking…'; try { const n = await pwned(p); $('#bm').innerHTML = n ? `<span class="bad">Found in ${n.toLocaleString()} known data leaks. Change it.</span>` : '<span class="ok">Not found in known leaks.</span>'; } catch { $('#bm').textContent = 'Couldn’t reach the breach service. Check your connection.'; } };
$('#sv').onclick = async () => {
  if (!$('#t').value.trim() && !$('#u').value.trim()) return $('#t').focus();
  Object.assign(cur, { title: $('#t').value.trim() || host($('#u').value), url: $('#u').value.trim(), user: $('#us').value, pass: $('#pw').value, notes: $('#n').value });
  if (!items.includes(cur)) items.push(cur); await persist(); $('#ed').close(); render();
};
$('#del').onclick = async () => { if (!confirm('Delete this login?')) return; items = items.filter(x => x !== cur); await persist(); $('#ed').close(); render(); };
const go = () => ($('#go').value = gen({ len: +$('#gl2').value, lower: $('#g1').checked, upper: $('#g2').checked, num: $('#g3').checked, sym: $('#g4').checked })) && meter($('#go').value, '#gb2', '#gl');
$('#gb').onclick = () => { go(); $('#gd').showModal(); }; ['#gl2', '#g1', '#g2', '#g3', '#g4'].forEach(s => ($(s).oninput = () => { $('#glv').textContent = $('#gl2').value; go(); })); $('#gr').onclick = go;
$('#gc').onclick = () => copy($('#go').value, $('#gc')); $('#gx').onclick = () => $('#gd').close();
$('#lk').onclick = async () => { await chrome.storage.session.remove('vk'); key = null; items = []; boot(); };
$('#sb').onclick = async () => { $('#lm').value = (await L.get('crux')).crux?.lockMin || 10; $('#sm').textContent = ''; $('#sd').showModal(); };
$('#sx').onclick = async () => { const { crux } = await L.get('crux'); crux.lockMin = Math.max(1, +$('#lm').value || 10); await L.set({ crux }); $('#sd').close(); };
$('#cm').onclick = async () => {
  const p = prompt('New master password (10+ characters):'); if (!p) return; if (p.length < 10) return ($('#sm').textContent = 'Too short.');
  if (prompt('Type it again to confirm:') !== p) return ($('#sm').textContent = 'They didn’t match.');
  const salt = crypto.getRandomValues(new Uint8Array(16)); meta = { v: 1, iter: ITER, salt: b64(salt) }; key = await derive(p, salt, ITER); await persist(); await session(); $('#sm').textContent = 'Master password changed.';
};
$('#ex').onclick = async () => { const { vault } = await L.get('vault'), a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(vault)], { type: 'application/json' })); a.download = `crux-vault-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click(); };
$('#im').onclick = () => $('#fi').click();
function csv(t) { const rows = []; let r = [], f = '', qt = false; for (let i = 0; i < t.length; i++) { const c = t[i]; if (qt) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else qt = false; } else f += c; } else if (c === '"') qt = true; else if (c === ',') { r.push(f); f = ''; } else if (c === '\n' || c === '\r') { if (c === '\r' && t[i + 1] === '\n') i++; r.push(f); rows.push(r); r = []; f = ''; } else f += c; } if (f || r.length) { r.push(f); rows.push(r); } return rows.filter(x => x.some(Boolean)); }
$('#fi').onchange = async e => {
  const file = e.target.files[0]; if (!file) return; const t = await file.text(); let add = [];
  try {
    if (file.name.endsWith('.json')) { const b = JSON.parse(t), p = prompt('Master password of that backup:'); add = await decrypt(await derive(p, ub64(b.salt), b.iter), b); }
    else { const [h, ...rs] = csv(t), ix = n => h.findIndex(x => n.test(x.trim())); const [a, b, c, d, n] = [ix(/^(name|title)$/i), ix(/^(url|login_uri|website)$/i), ix(/^(username|login_username|email)$/i), ix(/^(password|login_password)$/i), ix(/^(note|notes)$/i)]; add = rs.map(r => ({ id: crypto.randomUUID(), title: r[a] || host(r[b] || ''), url: r[b] || '', user: r[c] || '', pass: r[d] || '', notes: r[n] || '' })); }
    const have = new Set(items.map(i => i.id)); const fresh = add.filter(i => !have.has(i.id)); items.push(...fresh); await persist(); render(); $('#sm').textContent = `Imported ${fresh.length} logins.`;
  } catch { $('#sm').textContent = 'That file couldn’t be read, or the password was wrong.'; }
  e.target.value = '';
};
$('#wp').onclick = async () => { if (prompt('This permanently erases every saved login. Type ERASE to confirm.') !== 'ERASE') return; await L.remove('vault'); await chrome.storage.session.remove('vk'); $('#sd').close(); boot(); };
boot();
