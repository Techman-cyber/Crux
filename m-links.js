// Link checker: broken links (via background fetch) + suspicious-link heuristics.
(() => {
const X = window.__crux; if (!X) return;
const SHORT = /^(bit\.ly|tinyurl\.com|t\.co|goo\.gl|ow\.ly|is\.gd|buff\.ly|rebrand\.ly|cutt\.ly|shorturl\.at|rb\.gy|tiny\.cc|t\.ly)$/;
const BADTLD = /\.(zip|mov|top|xyz|click|country|gq|tk|ml|cf|ga|work|support|loan|rest|icu|cyou|monster|sbs|cfd)$/;
const regd = h => { const p = h.replace(/^www\./, '').split('.'); return p.length <= 2 ? p.join('.') : (p[p.length - 1].length === 2 && ['co', 'com', 'org', 'net', 'gov', 'ac'].includes(p[p.length - 2]) ? p.slice(-3) : p.slice(-2)).join('.'); };
function susp(a) {
  const r = []; let u; try { u = new URL(a.href); } catch { return r; }
  const h = u.hostname, tx = (a.textContent || '').trim();
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(h)) r.push('Raw IP address instead of a name');
  if (h.includes('xn--')) r.push('Look-alike (punycode) domain');
  if (u.username) r.push('Contains user@ trick that hides the real site');
  if (SHORT.test(h)) r.push('URL shortener hides the destination');
  if (BADTLD.test(h)) r.push('Domain extension often used for scams');
  if (h.split('.').length > 4) r.push('Unusually many subdomains');
  if (/^(?:https?:\/\/)?[\w-]+(?:\.[\w-]+)*\.[a-z]{2,}(?:\/\S*)?$/i.test(tx) && regd(tx.replace(/^https?:\/\//i, '').split('/')[0]) !== regd(h)) r.push(`Text shows ${tx.slice(0, 40)} but goes to ${h}`);
  if (u.protocol === 'http:') r.push('Not encrypted (http)');
  if (/(login|signin|verify|secure|account|update|wallet|password)/i.test(h) && regd(h) !== regd(location.hostname)) r.push('Login-style address on a different site');
  if (/[\u202e\u200b]/.test(a.href)) r.push('Hidden characters in the address');
  return r;
}
let panel = null;
const CSS = `aside{position:fixed;top:0;right:0;width:min(440px,100vw);height:100vh;background:#0b0618f5;color:#efe3ff;border-left:1px solid #8b3dff;box-shadow:-10px 0 40px #8b3dff44;display:flex;flex-direction:column;animation:s .3s ease-out}@keyframes s{from{transform:translateX(100%)}}
header{display:flex;gap:8px;align-items:center;padding:12px 14px;border-bottom:1px solid #8b3dff55}header b{font-size:15px}#sum{flex:1;color:#a493cc;font-size:12px}
button{background:#8b3dff22;border:1px solid #8b3dff;border-radius:8px;padding:3px 10px}button:hover,button.on{background:#8b3dff;color:#fff}nav{display:flex;gap:6px;padding:8px 14px;flex-wrap:wrap}
#l{overflow:auto;flex:1;padding:0 8px 20px}.r{padding:8px 8px;border-bottom:1px dashed #ffffff22;cursor:pointer;overflow-wrap:anywhere}.r:hover{background:#8b3dff22}
.p{display:inline-block;border-radius:6px;padding:0 7px;margin-right:6px;font-size:11px;font-weight:700;color:#0b0618}.ok{background:#4dff9f}.bad{background:#ff3d6e}.sus{background:#ffb020}.rd{background:#29f0ff}.na{background:#a493cc}.w{color:#ffb020;font-size:12px;display:block}.u{color:#a493cc;font-size:12px}`;
async function run() {
  if (panel) { panel.cleanup(); return; }
  const seen = new Map();
  document.querySelectorAll('a[href]').forEach(a => { if (!/^https?:/.test(a.href)) return; const k = a.href.split('#')[0]; seen.has(k) ? seen.get(k).push(a) : seen.set(k, [a]); });
  const items = [...seen].slice(0, 300).map(([u, as]) => ({ u, as, why: susp(as[0]), r: null }));
  const ui = X.ui(CSS, '<aside><header><b>Link check</b><span id="sum"></span><button id="cp">Copy</button><button id="x">✕</button></header><nav id="f"></nav><div id="l"></div></aside>');
  const $ = s => ui.root.querySelector(s); let flt = 'problems', done = 0;
  const cls = i => !i.r ? 'na' : i.r.s === 0 || i.r.s === 404 || i.r.s === 410 || i.r.s >= 500 ? 'bad' : [401, 403, 429, 999].includes(i.r.s) ? 'na' : i.r.f ? 'rd' : 'ok';
  const lab = i => !i.r ? '…' : i.r.s === 0 ? i.r.e : [401, 403, 429, 999].includes(i.r.s) ? 'blocked ' + i.r.s : i.r.f && cls(i) === 'rd' ? 'redirects' : i.r.s;
  const bad = i => cls(i) === 'bad', pass = { all: () => 1, problems: i => bad(i) || i.why.length, broken: bad, suspicious: i => i.why.length, redirects: i => i.r && i.r.f };
  const paint = () => {
    const nb = items.filter(bad).length, ns = items.filter(i => i.why.length).length;
    $('#sum').textContent = `${done}/${items.length} checked · ${nb} broken · ${ns} suspicious`;
    $('#f').innerHTML = Object.keys(pass).map(k => `<button data-k="${k}" class="${k === flt ? 'on' : ''}">${k}</button>`).join('');
    const rows = items.map((i, n) => [i, n]).filter(([i]) => pass[flt](i));
    $('#l').innerHTML = rows.map(([i, n]) => `<div class="r" data-n="${n}"><span class="p ${bad(i) ? 'bad' : cls(i)}">${X.esc(lab(i))}</span>${i.why.length ? '<span class="p sus">suspicious</span>' : ''}<span class="u">${X.esc(i.u.slice(0, 110))}</span>${i.why.map(w => `<span class="w">⚠ ${X.esc(w)}</span>`).join('')}${i.r && i.r.f ? `<span class="u">→ ${X.esc(i.r.f.slice(0, 100))}</span>` : ''}</div>`).join('') || '<p style="padding:16px;color:#a493cc">Nothing here. Try another filter.</p>';
  };
  ui.root.addEventListener('click', e => {
    const b = e.target.closest('button'), r = e.target.closest('.r');
    if (b && b.dataset.k) { flt = b.dataset.k; paint(); }
    else if (r) { const a = items[r.dataset.n].as[0]; a.scrollIntoView({ block: 'center', behavior: 'smooth' }); a.style.setProperty('outline', '3px solid #8b3dff', 'important'); setTimeout(() => a.style.removeProperty('outline'), 2500); }
  });
  const cleanup = () => { items.forEach(i => i.as.forEach(a => a.style.removeProperty('outline'))); ui.remove(); panel = null; };
  panel = { cleanup }; $('#x').onclick = cleanup;
  $('#cp').onclick = () => navigator.clipboard.writeText(items.filter(i => bad(i) || i.why.length).map(i => `${lab(i)}\t${i.u}\t${i.why.join('; ')}`).join('\n')).then(() => { $('#cp').textContent = 'Copied'; });
  paint();
  const urls = items.map(i => i.u);
  for (let k = 0; k < urls.length && panel; k += 50) {
    const res = await X.api('linkcheck', { urls: urls.slice(k, k + 50) }) || [];
    res.forEach((r, j) => { const i = items[k + j]; if (i && r) { i.r = r; done++; if (bad(i)) i.as.forEach(a => a.style.setProperty('outline', '2px solid #ff3d6e', 'important')); else if (i.why.length) i.as.forEach(a => a.style.setProperty('outline', '2px solid #ffb020', 'important')); } });
    if (panel) paint();
  }
  if (panel) items.forEach(i => { if (!i.r) done++; });
}
X.add('linkcheck', { run, prompts: () => { const as = [...document.querySelectorAll('a[href]')].filter(a => /^https?:/.test(a.href)).slice(0, 400), bad = as.filter(a => susp(a).length).length;
  if (bad) return [{ id: 'linkcheck', icon: '🔗', title: 'Link checker', tone: 'warn', pri: 2, text: `${bad} suspicious link${bad > 1 ? 's' : ''} on this page (shorteners, look-alikes, hidden redirects). Review them?`, actions: [['Review links', run]] }];
  return as.length >= 40 ? [{ id: 'linkcheck', icon: '🔗', title: 'Link checker', pri: 8, text: `Check all ${as.length} links on this page for broken ones?`, actions: [['Check links', run]] }] : []; } });
})();
