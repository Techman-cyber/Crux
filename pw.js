const SETS = { lower: 'abcdefghijkmnopqrstuvwxyz', upper: 'ABCDEFGHJKLMNPQRSTUVWXYZ', num: '23456789', sym: '!@#$%^&*()-_=+[]{};:,.?' };
export function rnd(n) { const a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; let x; do { crypto.getRandomValues(a); x = a[0]; } while (x >= lim); return x % n; }
export function gen({ len = 20, lower = 1, upper = 1, num = 1, sym = 1 } = {}) {
  const sel = Object.entries({ lower, upper, num, sym }).filter(([, v]) => v).map(([k]) => SETS[k]);
  if (!sel.length) sel.push(SETS.lower);
  const pool = sel.join(''); const out = sel.map(s => s[rnd(s.length)]);
  while (out.length < len) out.push(pool[rnd(pool.length)]);
  for (let i = out.length - 1; i > 0; i--) { const j = rnd(i + 1); [out[i], out[j]] = [out[j], out[i]]; }
  return out.slice(0, Math.max(len, sel.length)).join('');
}
export function entropy(p) {
  if (!p) return 0; let pool = 0;
  if (/[a-z]/.test(p)) pool += 26; if (/[A-Z]/.test(p)) pool += 26; if (/\d/.test(p)) pool += 10; if (/[^a-zA-Z0-9]/.test(p)) pool += 30;
  let e = p.length * Math.log2(pool || 1);
  if (/(.)\1{2,}|0123|1234|abcd|qwert|password|letmein/i.test(p)) e *= .6;
  return Math.round(e);
}
export const label = e => e < 40 ? ['Weak', '#ff3d6e'] : e < 60 ? ['Fair', '#ffb020'] : e < 80 ? ['Good', '#9be15d'] : ['Strong', '#4dff9f'];
// Have I Been Pwned range API: only the first 5 chars of the SHA-1 leave your device.
export async function pwned(pw) {
  const h = [...new Uint8Array(await crypto.subtle.digest('SHA-1', new TextEncoder().encode(pw)))].map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  const r = await fetch('https://api.pwnedpasswords.com/range/' + h.slice(0, 5), { headers: { 'Add-Padding': 'true' } });
  const t = await r.text(); const m = t.split('\n').find(l => l.startsWith(h.slice(5)));
  return m ? parseInt(m.split(':')[1]) : 0;
}
