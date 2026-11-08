// Vault prompts: fill a saved login, make a strong password on sign-up, save a login after you submit.
(() => {
const X = window.__crux; if (!X) return;
const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; };
const setv = (el, v) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); };
const rnd = n => { const a = new Uint32Array(1), l = Math.floor(4294967296 / n) * n; let x; do { crypto.getRandomValues(a); x = a[0]; } while (x >= l); return x % n; };
const gen = (len = 20) => { const S = ['abcdefghijkmnopqrstuvwxyz', 'ABCDEFGHJKLMNPQRSTUVWXYZ', '23456789', '!@#$%^&*-_=+?'], o = S.map(s => s[rnd(s.length)]), p = S.join(''); while (o.length < len) o.push(p[rnd(p.length)]); for (let i = o.length - 1; i > 0; i--) { const j = rnd(i + 1); [o[i], o[j]] = [o[j], o[i]]; } return o.join(''); };
const pws = () => [...document.querySelectorAll('input[type=password]')].filter(vis);
function userField(pw) { const all = [...document.querySelectorAll('input')].filter(vis), i = all.indexOf(pw); for (let j = i - 1; j >= 0; j--) if (['text', 'email', 'tel', ''].includes(all[j].type)) return all[j]; return null; }
const signup = () => { const p = pws(); return p.length && (p.some(i => /new-password/.test(i.autocomplete)) || p.length >= 2 || /sign.?up|register|create.?account|join|get.?started/i.test(location.pathname + ' ' + document.title)); };
async function fill(id) { const p = pws()[0], c = await X.api('vault.get', { id }); if (!p || !c) return X.toast('Couldn’t fill that one. Unlock the vault and try again.'); const u = userField(p); if (u) setv(u, c.user); setv(p, c.pass); }
async function offerSave() {
  const pd = await X.api('vault.pending'); if (!pd) return;
  X.ask({ id: 'vault:save:' + Date.now(), tool: 'vault', icon: '💾', title: 'Save this login?', pri: 1, text: `Save ${pd.user || 'this password'} for ${location.hostname} to your encrypted vault?`,
    actions: [['Save to vault', async () => { const r = await X.api('vault.save'); r === 'saved' ? X.toast('Saved to your vault.') : X.api('open', { page: 'vault.html' }).then(() => X.toast('Unlock your vault, then submit the login again to save it.')); }], ['Not now', () => {}, false]] });
}
function remember(pw) { if (!pw || !pw.value) return; const u = userField(pw); X.api('vault.pend', { user: u ? u.value : '', pass: pw.value }); setTimeout(offerSave, 1800); }
if (window.top === window) {
  addEventListener('submit', e => { const pw = e.target.querySelector && e.target.querySelector('input[type=password]'); remember(pw); }, true);
  addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.type === 'password') remember(e.target); }, true);
  addEventListener('click', e => { const b = e.target.closest && e.target.closest('button,input[type=submit]'); if (b && !b.form) { const pw = pws()[0]; if (pw && pw.value && /log.?in|sign.?(in|up)|submit|continue|register|create/i.test(b.textContent + b.value)) remember(pw); } }, true);
}
X.add('vault', { prompts: async () => {
  const out = [], pd = await X.api('vault.pending'), s = await X.api('vault.state');
  if (pd) { out.push({ id: 'vault:save:0', icon: '💾', title: 'Save this login?', pri: 1, text: `Save ${pd.user || 'this password'} for ${location.hostname} to your encrypted vault?`, actions: [['Save to vault', async () => { const r = await X.api('vault.save'); r === 'saved' ? X.toast('Saved to your vault.') : X.api('open', { page: 'vault.html' }); }]] }); }
  if (!pws().length) return out;
  if (signup()) out.push({ id: 'vault:gen', icon: '🔑', title: 'Make a strong password?', pri: 2, text: 'This looks like a sign-up. CRUX can create a unique 20-character password, fill it in, and offer to save it.', actions: [['Make and fill', () => { const p = gen(20); pws().forEach(i => setv(i, p)); X.toast('Strong password filled. I’ll offer to save it when you submit.'); }]] });
  else if (s && s.exists && !s.unlocked) out.push({ id: 'vault:unlock', icon: '🗝️', title: 'Vault is locked', pri: 2, text: 'Unlock your vault to sign in with a saved password.', actions: [['Unlock vault', () => X.api('open', { page: 'vault.html' })]] });
  else if (s && s.unlocked) { const m = await X.api('vault.match'); if (m && m.length) out.push({ id: 'vault:fill', icon: '🗝️', title: 'Saved login found', pri: 2, text: `Sign in to ${location.hostname} with ${m[0].user || m[0].title}?`, actions: m.slice(0, 3).map((e, i) => [m.length > 1 ? e.user || e.title : 'Fill login', () => fill(e.id), i === 0]) }); else out.push({ id: 'vault:none', icon: '🗝️', title: 'No saved login here', pri: 6, text: 'Nothing saved for this site yet. Sign in and CRUX will offer to save it.', actions: [['OK', () => {}]] }); }
  else if (!s || !s.exists) out.push({ id: 'vault:create', icon: '🗝️', title: 'Keep passwords in CRUX?', pri: 5, text: 'Create an encrypted vault so CRUX can make, fill and remember passwords for you.', actions: [['Create vault', () => X.api('open', { page: 'vault.html' })]] });
  return out;
} });
})();
