const $ = s => document.querySelector(s), esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const tab = n => { $('#p1').hidden = n !== 1; $('#p2').hidden = n !== 2; $('#t1').classList.toggle('on', n === 1); $('#t2').classList.toggle('on', n === 2); };
$('#t1').onclick = () => tab(1); $('#t2').onclick = () => tab(2);
const regd = h => { const p = h.replace(/^www\./, '').split('.'); return p.length <= 2 ? p.join('.') : (p[p.length - 1].length === 2 && ['co', 'com', 'org', 'net', 'gov', 'ac'].includes(p[p.length - 2]) ? p.slice(-3) : p.slice(-2)).join('.'); };
const lev = (a, b) => { const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]); for (let j = 1; j <= b.length; j++) d[0][j] = j; for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length]; };
const BRANDS = 'google paypal amazon microsoft apple facebook instagram netflix whatsapp binance coinbase metamask paytm phonepe flipkart sbi hdfcbank icicibank axisbank gmail outlook linkedin twitter telegram dropbox adobe steam discord youtube walmart ebay'.split(' ');
const BADTLD = /\.(zip|mov|top|xyz|click|country|gq|tk|ml|cf|ga|work|support|loan|rest|icu|cyou|monster|sbs|cfd)$/;
function verdict(F, good, title) {
  const s = F.reduce((a, f) => a + f.sev, 0), v = s >= 6 ? ['Likely dangerous', 'var(--bad)', '🚨'] : s >= 3 ? ['Be careful', 'var(--warn)', '⚠️'] : ['No major warning signs', 'var(--ok)', '✅'];
  return `<div class="card verdict" style="border-color:${v[1]}"><div class="big">${v[2]}</div><div><h2 style="color:${v[1]}">${v[0]}</h2><div class="mu">${esc(title)} · ${F.length} warning${F.length === 1 ? '' : 's'}</div></div></div>` +
    (F.length ? `<div class="card"><h3>Warning signs</h3>${F.sort((a, b) => b.sev - a.sev).map(f => `<div class="f"><b class="${f.sev > 2 ? 'bad' : 'warn'}">${f.sev > 2 ? '●' : '○'} ${esc(f.msg)}</b><span>${esc(f.why)}</span></div>`).join('')}</div>` : '') +
    (good.length ? `<div class="card"><h3>Good signs</h3>${good.map(g => `<div class="f"><b class="ok">✔ ${esc(g)}</b></div>`).join('')}</div>` : '');
}
async function site() {
  const raw = $('#url').value.trim(); if (!raw) return; let u;
  try { u = new URL(/^[a-z]+:\/\//i.test(raw) ? raw : 'https://' + raw); if (!/^https?:$/.test(u.protocol)) throw 0; } catch { return ($('#o1').innerHTML = '<p class="bad">Enter a full web address, like example.com.</p>'); }
  $('#o1').innerHTML = '<p class="mu">Checking…</p>'; const F = [], G = [], add = (sev, msg, why) => F.push({ sev, msg, why });
  const h = u.hostname, rd = regd(h), label = rd.split('.')[0], toks = label.split('-');
  if (u.protocol === 'http:') add(2, 'Connection isn’t encrypted', 'Anything you type can be read by others on the network.'); else G.push('Uses an encrypted connection (HTTPS)');
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(h)) add(3, 'Address is a raw IP number', 'Real companies use names. Scam pages often hide behind bare IPs.');
  if (h.includes('xn--')) add(3, 'Look-alike (punycode) characters in the name', 'Letters from other alphabets can imitate famous sites.');
  if (u.username) add(3, 'Address contains a user@ trick', 'Everything before @ is ignored and used to disguise the real site.');
  if (BADTLD.test(h)) add(2, 'Domain extension is common in scams', 'Cheap extensions like .top and .xyz are used heavily by throwaway sites.');
  if (h.split('.').length - rd.split('.').length >= 3) add(2, 'Unusually many subdomains', 'Long prefixes are used to push the real domain out of sight.');
  if ((label.match(/-/g) || []).length >= 3) add(1, 'Lots of hyphens in the name', 'Phishing names often stack words like secure-login-update.');
  for (const b of BRANDS) {
    if (label === b) { G.push(`Domain is ${rd}, matching the brand name`); break; }
    if (toks.length > 1 && toks.includes(b)) { add(3, `Uses “${b}” in the name but isn’t ${b}`, 'Look-alike names such as paypal-secure-login.com are a classic phishing pattern.'); break; }
    if (label.length >= 5 && lev(label, b) <= 1) { add(3, `Name is one letter away from “${b}”`, 'This is typosquatting: a misspelling of a well-known brand.'); break; }
  }
  try { const r = await fetch('https://rdap.org/domain/' + rd), j = await r.json(), ev = (j.events || []).find(e => e.eventAction === 'registration');
    if (ev) { const d = (Date.now() - new Date(ev.eventDate)) / 864e5; if (d < 30) add(3, `Domain registered only ${Math.floor(d)} days ago`, 'Most scam sites are brand new.'); else if (d < 180) add(2, 'Domain is under 6 months old', 'New sites haven’t built a track record yet.'); else if (d < 365) add(1, 'Domain is under a year old', 'Not alarming alone, but worth noting.'); else G.push(`Domain has existed for ${(d / 365).toFixed(1)} years`); } } catch { }
  try {
    const r = await fetch(u.href, { credentials: 'omit' }), t = (await r.text()).slice(0, 600000), doc = new DOMParser().parseFromString(t, 'text/html'), body = doc.body?.textContent || '';
    const pw = doc.querySelectorAll('input[type=password]').length;
    if (pw && u.protocol === 'http:') add(3, 'Asks for a password over an unencrypted connection', 'Your password would travel in the clear.');
    doc.querySelectorAll('form[action]').forEach(f => { try { const a = new URL(f.getAttribute('action'), u); if (regd(a.hostname) !== rd && f.querySelector('input[type=password],input[autocomplete*=cc]')) add(3, `Login or card form sends data to ${a.hostname}`, 'The form submits to a different site than the one you are on.'); } catch { } });
    if ([...doc.querySelectorAll('iframe')].some(f => /display:\s*none/.test(f.getAttribute('style') || '') || +f.getAttribute('width') <= 1 || +f.getAttribute('height') <= 1)) add(2, 'Hidden frames on the page', 'Invisible frames can load tracking or malicious content.');
    const inl = [...doc.scripts].filter(s => !s.src).map(s => s.textContent).join('\n'), ob = (inl.match(/eval\(|atob\(|unescape\(|fromCharCode|document\.write\(/g) || []).length;
    if (ob >= 6) add(2, 'Heavily obfuscated scripts', 'Legitimate sites rarely scramble their own code this much.');
    const mr = doc.querySelector('meta[http-equiv="refresh" i]'); if (mr) { const m = /url=(\S+)/i.exec(mr.content); try { if (m && regd(new URL(m[1], u).hostname) !== rd) add(2, 'Page auto-redirects to another site', 'Redirect chains hide where you end up.'); } catch { } }
    if (/seed phrase|recovery phrase|private key|connect (your )?wallet/i.test(body)) add(2, 'Asks about crypto seed phrases or wallets', 'Real services never ask for a seed phrase.');
    if (/(account|card|profile) (has been|is|was) (suspended|locked|limited|blocked)|verify your (identity|account) (now|immediately)|urgent action required|claim your (prize|reward)|you have won/i.test(body)) add(2, 'Uses urgency or prize language', 'Pressure to act fast is the core of phishing.');
    const tt = (doc.title || '').toLowerCase(), bn = BRANDS.find(b => tt.includes(b)); if (bn && label !== bn && !label.includes(bn)) add(3, `Page title says “${bn}” but the site isn’t ${bn}`, 'The page is dressed up as a brand it doesn’t belong to.');
    if (/oncontextmenu\s*=\s*["']?return false/i.test(t)) add(1, 'Right-click is disabled', 'Often used to hinder inspection.');
    if (!F.some(f => f.sev > 2) && !doc.querySelectorAll('script[src*="googletagmanager"]').length && t.length > 2000) G.push('Page loaded normally with no hidden forms or hidden frames');
  } catch { add(1, 'Couldn’t load the page to inspect it', 'It may block automated visits or be offline. URL checks above still apply.'); }
  const e = encodeURIComponent;
  $('#o1').innerHTML = verdict(F, G, u.hostname) + `<div class="card"><h3>Second opinions</h3><div class="lk"><a class="btn" target="_blank" href="https://www.virustotal.com/gui/domain/${rd}">VirusTotal</a><a class="btn" target="_blank" href="https://transparencyreport.google.com/safe-browsing/search?url=${e(u.hostname)}">Google Safe Browsing</a><a class="btn" target="_blank" href="https://urlscan.io/search/#${e('domain:' + h)}">urlscan.io</a><a class="btn" target="_blank" href="https://www.scamadviser.com/check-website/${h}">ScamAdviser</a></div></div>`;
}
$('#go').onclick = site; $('#url').onkeydown = e => e.key === 'Enter' && site();

/* ---------- file checker ---------- */
const MAGIC = [['PE', [0x4d, 0x5a], 'a Windows program'], ['ELF', [0x7f, 0x45, 0x4c, 0x46], 'a Linux program'], ['MACHO', [0xcf, 0xfa, 0xed, 0xfe], 'a Mac program'], ['PDF', [0x25, 0x50, 0x44, 0x46], 'a PDF'], ['ZIP', [0x50, 0x4b, 3, 4], 'a ZIP-based file (zip, Office, APK, JAR)'], ['RAR', [0x52, 0x61, 0x72, 0x21], 'a RAR archive'], ['7Z', [0x37, 0x7a, 0xbc, 0xaf], 'a 7-Zip archive'], ['PNG', [0x89, 0x50, 0x4e, 0x47], 'a PNG image'], ['JPG', [0xff, 0xd8, 0xff], 'a JPEG image'], ['GIF', [0x47, 0x49, 0x46, 0x38], 'a GIF image'], ['GZ', [0x1f, 0x8b], 'a GZIP archive'], ['OLE', [0xd0, 0xcf, 0x11, 0xe0], 'an old-style Office file'], ['SHEBANG', [0x23, 0x21], 'a script']];
const EXPECT = { pdf: ['PDF'], png: ['PNG'], jpg: ['JPG'], jpeg: ['JPG'], gif: ['GIF'], zip: ['ZIP'], docx: ['ZIP'], xlsx: ['ZIP'], pptx: ['ZIP'], apk: ['ZIP'], jar: ['ZIP'], rar: ['RAR'], '7z': ['7Z'], gz: ['GZ'], doc: ['OLE'], xls: ['OLE'], ppt: ['OLE'], exe: ['PE'], dll: ['PE'], scr: ['PE'], msi: ['OLE'] };
const EXEC = /^(exe|msi|scr|bat|cmd|com|pif|vbs|vbe|jse?|wsf|wsh|ps1|jar|apk|dmg|pkg|lnk|hta|cpl|reg|dll|sh|app)$/, MACRO = /^(docm|xlsm|pptm|xlam|dotm)$/, ARCH = /^(zip|rar|7z|gz|tar|iso|img)$/;
$('#drop').onclick = () => $('#fi').click(); $('#drop').onkeydown = e => e.key === 'Enter' && $('#fi').click();
['dragover', 'dragenter'].forEach(ev => $('#drop').addEventListener(ev, e => { e.preventDefault(); $('#drop').classList.add('over'); }));
['dragleave', 'drop'].forEach(ev => $('#drop').addEventListener(ev, e => { e.preventDefault(); $('#drop').classList.remove('over'); }));
$('#drop').addEventListener('drop', e => e.dataTransfer.files[0] && file(e.dataTransfer.files[0])); $('#fi').onchange = e => e.target.files[0] && file(e.target.files[0]);
chrome.storage.local.get('vtKey').then(r => ($('#vk').value = r.vtKey || '')); $('#sk').onclick = () => chrome.storage.local.set({ vtKey: $('#vk').value.trim() }).then(() => ($('#sk').textContent = 'Saved ✔'));
async function file(f) {
  $('#o2').innerHTML = '<p class="mu">Analyzing…</p>'; const F = [], G = [], add = (sev, msg, why) => F.push({ sev, msg, why });
  const head = new Uint8Array(await f.slice(0, 16).arrayBuffer()), ext = (f.name.split('.').pop() || '').toLowerCase();
  const det = MAGIC.find(m => m[1].every((b, i) => head[i] === b)), kind = det ? det[0] : null, prog = ['PE', 'ELF', 'MACHO'].includes(kind);
  if (/\u202e/.test(f.name)) add(3, 'Name contains a hidden right-to-left character', 'It makes “exe” look like a harmless extension.');
  if (/\.(pdf|docx?|xlsx?|pptx?|jpe?g|png|gif|txt|mp4|mp3|zip)\.(exe|scr|bat|cmd|js|vbs|lnk|com|msi)$/i.test(f.name)) add(3, 'Fake double extension', 'The real type is the last one. This is a classic malware trick.');
  if (EXEC.test(ext)) add(ext === 'dll' || ext === 'jar' ? 2 : 3, `“.${ext}” files can run code on your computer`, 'Only run it if you got it from the official source and trust it.');
  if (MACRO.test(ext)) add(2, 'Office file with macros enabled', 'Macros are a leading way malware spreads. Don’t click “Enable content” unless you’re sure.');
  if (ARCH.test(ext)) add(1, 'Archive files can hide programs inside', 'Scan what’s inside after extracting, and be wary of password-protected archives.');
  if (prog && !EXEC.test(ext)) add(3, `Disguised as “.${ext || 'no extension'}” but is ${det[2]}`, 'The contents don’t match the name. That is how malware gets opened by mistake.');
  else if (det && EXPECT[ext] && !EXPECT[ext].includes(kind)) add(2, `Named “.${ext}” but contents look like ${det[2]}`, 'A mismatch between name and contents is suspicious.');
  else if (!det && EXPECT[ext]) add(1, `Doesn’t start like a real “.${ext}” file`, 'It may be damaged or something else under a false name.');
  if (prog) { const s = new Uint8Array(await f.slice(0, 1 << 20).arrayBuffer()), c = new Array(256).fill(0); s.forEach(b => c[b]++); const en = -c.reduce((a, n) => n ? a + (n / s.length) * Math.log2(n / s.length) : a, 0); if (en > 7.4) add(2, 'Program looks packed or encrypted', 'Malware often scrambles itself to dodge scanners. Some legit installers do too.'); if (f.size < 20000) add(1, 'Very small program', 'Tiny executables are often downloaders for something bigger.'); }
  let sha = ''; if (f.size < 4e8) sha = [...new Uint8Array(await crypto.subtle.digest('SHA-256', await f.arrayBuffer()))].map(b => b.toString(16).padStart(2, '0')).join('');
  let vt = '';
  const { vtKey } = await chrome.storage.local.get('vtKey');
  if (sha && vtKey) try { const r = await fetch('https://www.virustotal.com/api/v3/files/' + sha, { headers: { 'x-apikey': vtKey } });
    if (r.status === 404) vt = '<p class="mu">VirusTotal has never seen this exact file. That isn’t proof it’s safe, especially for rare or new files.</p>';
    else if (r.ok) { const s = (await r.json()).data.attributes.last_analysis_stats; vt = `<p class="${s.malicious ? 'bad' : s.suspicious ? 'warn' : 'ok'}"><b>VirusTotal: ${s.malicious} engines say malicious, ${s.suspicious} suspicious, ${s.harmless} harmless, ${s.undetected} found nothing.</b></p>`; if (s.malicious >= 3) add(3, `${s.malicious} antivirus engines flag this file`, 'Delete it and don’t run it.'); else if (s.malicious) add(2, `${s.malicious} antivirus engine${s.malicious > 1 ? 's' : ''} flag this file`, 'A single detection is often a false alarm, but be careful.'); }
    else vt = `<p class="warn">VirusTotal lookup failed (${r.status}). Check your API key.</p>`; } catch { vt = '<p class="warn">Couldn’t reach VirusTotal.</p>'; }
  if (det && !F.length) G.push(`Contents match its name (${det[2]})`);
  const sz = f.size > 1e6 ? (f.size / 1e6).toFixed(1) + ' MB' : Math.ceil(f.size / 1e3) + ' KB';
  $('#o2').innerHTML = verdict(F, G, f.name) + `<div class="card"><h3>Details</h3><div class="f"><b>Size</b><span>${sz}</span></div><div class="f"><b>Detected type</b><span>${det ? esc(det[2]) : 'Unrecognized or plain text'}</span></div><div class="f"><b>SHA-256</b>${sha ? `<code>${sha}</code>` : '<span>File too large to hash here.</span>'}</div>${vt}${sha ? `<div class="lk"><a class="btn" target="_blank" href="https://www.virustotal.com/gui/file/${sha}">Look up on VirusTotal</a></div>` : ''}</div>`;
}
