(() => {
if (window.__cruxTrack) { window.__cruxTrack.toggle(); return; }

/* ---------- helpers & patterns ---------- */
const SLD = new Set(['co','com','org','net','gov','ac','edu','nic','res','or','ne','go']);
const regDomain = h => { const p = h.split('.'); if (p.length <= 2) return h; const t = p[p.length-1], s = p[p.length-2]; return t.length === 2 && SLD.has(s) ? p.slice(-3).join('.') : p.slice(-2).join('.'); };
const host = location.hostname, domain = regDomain(host);
const EM = /[a-z0-9._%+-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}/gi;
const PH = /\+\d{1,3}[\s.-]?\(?\d{1,5}\)?(?:[\s.-]?\d{2,5}){2,4}/g;
const LEG = /[A-Z][\w&.,' -]{2,60}\s(?:Pvt\.? Ltd\.?|Private Limited|Limited|Ltd\.?|LLC|LLP|Inc\.?|Corp(?:oration)?\.?|GmbH)/g;
const GST = /\b\d{2}[A-Z]{5}\d{4}[A-Z]\dZ[A-Z\d]\b/g, CIN = /\b[LU]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}\b/g;
const CRED = /(?:designed|developed|built|made|created|crafted|powered|maintained|hosted)(?:\s+and\s+\w+)?\s+by\s+[^\n|•·©]{2,60}/gi;
const SOC = [['X / Twitter','(?:twitter|x)\\.com/'],['Facebook','facebook\\.com/'],['Instagram','instagram\\.com/'],['LinkedIn','linkedin\\.com/'],['YouTube','youtube\\.com/(?:c/|channel/|user/|@)'],['GitHub','github\\.com/[^/]+'],['TikTok','tiktok\\.com/@'],['Telegram','t\\.me/'],['WhatsApp','wa\\.me/'],['Discord','discord\\.(?:gg|com/invite)'],['Pinterest','pinterest\\.com/'],['Medium','medium\\.com/'],['Reddit','reddit\\.com/(?:r|user)/'],['Threads','threads\\.net/@']].map(([n,p]) => [n, new RegExp('//(?:[\\w-]+\\.)?' + p)]);
const TR = /google-analytics|googletagmanager|doubleclick|googlesyndication|facebook\.net|hotjar|clarity\.ms|segment\.|mixpanel|amplitude|criteo|taboola|outbrain|adnxs|scorecardresearch|quantserve|tiktok|bing\.com\/bat|hubspot|fullstory|mouseflow|sentry|newrelic|nr-data|optimizely|appsflyer|clevertap|moengage|webengage/i;
const TECH = [
['WordPress','CMS / platform',/wp-content|wp-includes/],['Shopify','CMS / platform',/cdn\.shopify\.com|shopify\.theme/],['Wix','CMS / platform',/wixstatic\.com/],['Squarespace','CMS / platform',/squarespace/],['Webflow','CMS / platform',/webflow\.(?:com|io)|data-wf-page/],['Drupal','CMS / platform',/drupal\.settings|sites\/default\/files/],['Joomla','CMS / platform',/\/media\/jui\/|joomla!/],['Magento','CMS / platform',/magento_|mage\/cookies/],['WooCommerce','CMS / platform',/woocommerce/],['Ghost','CMS / platform',/content="ghost/],
['Next.js','Framework',/__next|_next\/static/],['Nuxt','Framework',/__nuxt|_nuxt\//],['React','Framework',/data-reactroot|react-dom|__reactcontainer|react\.production/],['Vue','Framework',/data-v-[0-9a-f]{6}|vue(?:\.runtime|\.global)|__vue/],['Angular','Framework',/ng-version|ng-app|angular(?:\.min)?\.js/],['Svelte','Framework',/svelte-[a-z0-9]{4,}|__svelte/],['Gatsby','Framework',/___gatsby/],['Astro','Framework',/astro-island/],['jQuery','Libraries',/jquery[.-]?\d*(?:\.min)?\.js/],['Bootstrap','Libraries',/bootstrap(?:\.min)?\.(?:css|js)/],['Tailwind CSS','Libraries',/tailwindcss|\b(?:sm|md|lg):(?:flex|grid|px-\d)/],['Font Awesome','Libraries',/font-?awesome|fa-solid/],['Google Fonts','Libraries',/fonts\.googleapis\.com/],
['Cloudflare','Server / CDN',/cf-ray|server: cloudflare/],['Vercel','Server / CDN',/x-vercel-id|server: vercel/],['Netlify','Server / CDN',/x-nf-request-id|x-nl-request-id|server: netlify/],['CloudFront','Server / CDN',/x-amz-cf-id|cloudfront\.net/],['Akamai','Server / CDN',/akamai/],['Fastly','Server / CDN',/x-served-by|fastly/],['nginx','Server / CDN',/server: nginx/],['Apache','Server / CDN',/server: apache/],['LiteSpeed','Server / CDN',/server: litespeed/],['PHP','Server / CDN',/x-powered-by: php/],['ASP.NET','Server / CDN',/__viewstate|x-aspnet-version|x-powered-by: asp\.net/],['Express','Server / CDN',/x-powered-by: express/],['Django','Server / CDN',/csrfmiddlewaretoken/],['Ruby on Rails','Server / CDN',/csrf-param|rails-ujs/],
['Google Analytics','Analytics',/google-analytics\.com|gtag\/js/],['Google Tag Manager','Analytics',/googletagmanager\.com\/gtm/],['Meta Pixel','Analytics',/connect\.facebook\.net|fbq\(/],['Hotjar','Analytics',/hotjar\.com/],['Microsoft Clarity','Analytics',/clarity\.ms/],['Segment','Analytics',/cdn\.segment\.com/],['Mixpanel','Analytics',/mixpanel/],['Sentry','Analytics',/sentry\.io|sentry-cdn/],
['Stripe','Payments & support',/js\.stripe\.com/],['Razorpay','Payments & support',/checkout\.razorpay\.com/],['PayPal','Payments & support',/paypal\.com\/sdk/],['reCAPTCHA','Payments & support',/recaptcha/],['Intercom','Payments & support',/intercom\.io|widget\.intercom/],['Zendesk','Payments & support',/zdassets\.com|zendesk/],['HubSpot','Payments & support',/hs-scripts\.com|hubspot/]];
const MXV = [[/google|googlemail/,'Google Workspace'],[/outlook|microsoft/,'Microsoft 365'],[/zoho/,'Zoho Mail'],[/proton/,'Proton Mail'],[/mimecast/,'Mimecast'],[/secureserver/,'GoDaddy Mail'],[/yandex/,'Yandex'],[/pphosted/,'Proofpoint'],[/mailgun/,'Mailgun'],[/sendgrid/,'SendGrid'],[/amazonses/,'Amazon SES'],[/mailchimp|mandrill/,'Mailchimp'],[/zendesk/,'Zendesk']];
const TXV = [[/google-site-verification/,'Google Search Console'],[/^ms=/i,'Microsoft 365'],[/facebook-domain-verification/,'Meta (Facebook) domain'],[/apple-domain-verification/,'Apple'],[/atlassian-domain/,'Atlassian'],[/docusign/,'DocuSign'],[/stripe-verification/,'Stripe'],[/zoho-verification/,'Zoho'],[/hubspot/,'HubSpot'],[/miro-verification/,'Miro'],[/notion-domain/,'Notion'],[/adobe-idp/,'Adobe'],[/cisco-ci-domain/,'Cisco']];
const SECH = ['strict-transport-security','content-security-policy','x-frame-options','x-content-type-options','referrer-policy','permissions-policy','cross-origin-opener-policy'];

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const row = (k, v) => !v ? '' : `<div class="r"><span>${k}</span><b>${v}</b></div>`;
const cl = (a, f) => a && a.length ? `<div class="chips">${a.map(f || (x => `<i>${esc(x)}</i>`)).join('')}</div>` : '';
const lk = (t, h) => `<a href="${esc(h)}" target="_blank" rel="noopener noreferrer">${esc(t)}</a>`;
const dash = '<em class="mu">not found</em>';
const redacted = v => /redact|privacy|withheld|not disclosed|data protected|proxy/i.test(v || '');
const fmt = d => new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
const age = d => { const days = Math.floor((Date.now() - new Date(d)) / 864e5), y = Math.floor(days / 365.25), m = Math.floor((days - y * 365.25) / 30.44); return y ? `${y}y ${m}m` : m ? `${m}m ${Math.floor(days % 30.44)}d` : `${days}d`; };

/* ---------- state ---------- */
const D = { rdap: null, dns: null, net: null, wb: null, crt: null, hdr: {}, emails: new Set(), phones: new Set(), addrs: new Set(), social: {}, orgs: [], credits: new Set(), legal: new Set(), ids: new Set(), pages: {}, txt: {}, tech: [], third: [], out: [], meta: {}, counts: {}, copy: '', ck: 0, ls: 0 };
const S = { rdap: 0, dns: 0, net: 0, wb: 0, crt: 0, local: 0 }; // 0 loading, 1 ok, 2 failed

/* ---------- scanning ---------- */
function ld(o) {
  if (Array.isArray(o)) return o.forEach(ld);
  if (!o || typeof o !== 'object') return;
  if (o['@graph']) ld(o['@graph']);
  const t = [].concat(o['@type'] || []).join(' ');
  if (/Organization|Corporation|LocalBusiness|Store|Person|NGO|Educational|Hospital|Restaurant/.test(t)) {
    const a = o.address, adr = a && (typeof a === 'string' ? a : [a.streetAddress, a.addressLocality, a.addressRegion, a.postalCode, a.addressCountry?.name || a.addressCountry].filter(Boolean).join(', '));
    if (adr) D.addrs.add(adr);
    if (o.telephone) D.phones.add(String(o.telephone));
    if (o.email) D.emails.add(String(o.email).replace('mailto:', '').toLowerCase());
    [].concat(o.contactPoint || []).forEach(c => { c.telephone && D.phones.add(String(c.telephone)); c.email && D.emails.add(String(c.email).toLowerCase()); });
    [].concat(o.sameAs || []).forEach(u => SOC.forEach(([n, re]) => { if (re.test(u)) D.social[n] = D.social[n] || u; }));
    D.orgs.push({ name: o.legalName || o.name, founders: [].concat(o.founder || o.founders || []).map(x => x.name || x).filter(x => typeof x === 'string') });
  }
}
function harvest(doc) {
  doc.querySelectorAll('a[href^="mailto:"]').forEach(a => { const m = a.getAttribute('href').slice(7).split('?')[0].trim(); if (m) D.emails.add(m.toLowerCase()); });
  doc.querySelectorAll('a[href^="tel:"]').forEach(a => { try { D.phones.add(decodeURIComponent(a.getAttribute('href').slice(4)).trim()); } catch {} });
  doc.querySelectorAll('a[href]').forEach(a => { const h = a.getAttribute('href') || ''; if (/share|intent|sharer|dialog|login/i.test(h)) return; SOC.forEach(([n, re]) => { if (re.test(h)) D.social[n] = D.social[n] || h; }); });
  doc.querySelectorAll('script[type="application/ld+json"]').forEach(s => { try { ld(JSON.parse(s.textContent)); } catch {} });
  if (!doc.body) return;
  const c = doc.body.cloneNode(true);
  c.querySelectorAll('script,style,noscript,svg').forEach(n => n.remove());
  const t = c.textContent.replace(/\s+/g, ' ');
  (t.match(EM) || []).forEach(m => { if (!/\.(png|jpe?g|gif|webp|svg|css|js)$/i.test(m) && !/sentry|example\.com|wixpress|your@/i.test(m)) D.emails.add(m.toLowerCase()); });
  (t.match(PH) || []).forEach(p => D.phones.add(p.trim()));
  (t.match(LEG) || []).forEach(l => { const n = l.replace(/^(?:©|Copyright|Copyrights?|Welcome to|Owned by|Operated by|\d{4}|[-–,.\s])+/i, '').split(/\s+/).slice(-5).join(' ').trim(); if (n.length > 4 && n.length < 70) D.legal.add(n); });
  (t.match(GST) || []).forEach(i => D.ids.add('GSTIN ' + i));
  (t.match(CIN) || []).forEach(i => D.ids.add('CIN ' + i));
}
const mt = n => document.querySelector(`meta[name="${n}" i],meta[property="${n}" i]`)?.content?.trim();
function scanLocal() {
  const m = D.meta;
  m.title = document.title; m.desc = mt('description') || mt('og:description'); m.site = mt('og:site_name'); m.lang = document.documentElement.lang;
  m.canon = document.querySelector('link[rel="canonical"]')?.href; m.gen = mt('generator'); m.author = mt('author') || mt('article:author'); m.pub = mt('publisher');
  m.fav = (document.querySelector('link[rel~="icon"]') || {}).href;
  harvest(document);
  const f = document.querySelector('footer') || document.body, ft = (f.innerText || '').slice(-2500);
  for (const x of ft.matchAll(CRED)) D.credits.add(x[0].replace(/\s+/g, ' ').trim().slice(0, 90));
  const c = ft.match(/©\s*(?:\d{4}(?:\s*[-–]\s*\d{4})?)?\s*([^\n|•·]{2,70})/);
  if (c) D.copy = c[1].replace(/all rights reserved.*/i, '').trim();
  f.querySelectorAll('a[href]').forEach(a => { if (/design|develop|built by|made by|powered by|agency|crafted/i.test(a.textContent + a.title) && a.hostname && a.hostname !== host) D.credits.add(a.textContent.trim().slice(0, 40) + ' → ' + a.hostname); });
  const hs = new Map(); performance.getEntriesByType('resource').forEach(r => { try { const u = new URL(r.name); if (u.hostname !== host && !u.hostname.endsWith('.' + domain)) hs.set(u.hostname, (hs.get(u.hostname) || 0) + 1); } catch {} });
  D.third = [...hs].sort((a, b) => b[1] - a[1]).map(([h, n]) => ({ h, n, tr: TR.test(h) }));
  const ob = new Map(); let int = 0;
  document.querySelectorAll('a[href]').forEach(a => { if (a.hostname === host) int++; else if (a.hostname && /^https?:/.test(a.protocol)) ob.set(a.hostname, (ob.get(a.hostname) || 0) + 1); });
  D.out = [...ob].sort((a, b) => b[1] - a[1]).slice(0, 14).map(x => x[0]);
  D.counts = { links: document.querySelectorAll('a[href]').length, int, ext: [...ob.values()].reduce((a, b) => a + b, 0), img: document.images.length, scripts: document.scripts.length, forms: document.forms.length, iframes: document.querySelectorAll('iframe').length };
  D.ck = document.cookie.split(';').filter(x => x.trim()).length; try { D.ls = localStorage.length; } catch {}
  S.local = 1;
}
async function get(path, ms = 7000) {
  const c = new AbortController(), t = setTimeout(() => c.abort(), ms);
  try { const r = await fetch(path, { signal: c.signal, credentials: 'omit' }); if (!r.ok) return null; return { text: (await r.text()).slice(0, 300000), ct: r.headers.get('content-type') || '', h: Object.fromEntries(r.headers) }; }
  catch { return null; } finally { clearTimeout(t); }
}
const isTxt = r => r && (r.ct.includes('text/plain') || !/^\s*</.test(r.text));
function detect() {
  const hs = Object.entries(D.hdr).map(([k, v]) => k + ': ' + v).join('\n');
  const hay = (document.documentElement.outerHTML.slice(0, 250000) + '\n' + hs + '\n' + performance.getEntriesByType('resource').map(r => r.name).join(' ')).toLowerCase();
  const gen = (D.meta.gen || '').trim();
  D.tech = TECH.filter(([, , re]) => re.test(hay)).map(([name, cat]) => ({ name, cat }));
  if (gen && !D.tech.some(t => gen.toLowerCase().includes(t.name.toLowerCase()))) D.tech.unshift({ name: gen, cat: 'CMS / platform' });
}
function score() {
  let s = 50; const h = D.hdr;
  s += location.protocol === 'https:' ? 10 : -15;
  if (h['strict-transport-security']) s += 5; if (h['content-security-policy']) s += 5;
  const born = D.rdap?.events?.registration || D.wb?.first;
  if (born) { const y = (Date.now() - new Date(born)) / 31557600000; s += y > 10 ? 18 : y > 5 ? 12 : y > 2 ? 7 : y < .25 ? -25 : 0; }
  if (D.emails.size || D.phones.size) s += 5; if (D.orgs.length || D.legal.size) s += 5; if (D.pages['/privacy-policy']) s += 3;
  const tr = D.third.filter(x => x.tr).length; s += tr > 8 ? -10 : tr > 4 ? -4 : 0;
  return Math.max(3, Math.min(99, s));
}

/* ---------- UI ---------- */
const CSS = `
:host{all:initial}*{box-sizing:border-box;margin:0}
.ov{--pk:#ff2e88;--cy:#29f0ff;--yl:#ffe14d;--mu:#a493cc;position:fixed;inset:0;z-index:2147483647;overflow:auto;color:#f4ecff;font:13px/1.5 ui-monospace,"SF Mono",Menlo,Consolas,monospace;background-color:#14082b;
background-image:radial-gradient(circle at 85% -10%,#4b1d8f66,transparent 50%),radial-gradient(circle at -10% 110%,#ff2e8830,transparent 45%),linear-gradient(#ffffff09 1px,transparent 1px),linear-gradient(90deg,#ffffff09 1px,transparent 1px);background-size:auto,auto,32px 32px,32px 32px;animation:open .55s steps(7)}

@keyframes open{from{clip-path:inset(50% 0 50% 0)}to{clip-path:inset(0)}}
header{display:flex;gap:30px;align-items:center;padding:30px 36px 8px;flex-wrap:wrap}
.radar{flex:none;width:118px;height:118px;border-radius:50%;border:2px solid var(--cy);background:repeating-radial-gradient(#0000 0 13px,#29f0ff40 14px 15px),conic-gradient(from 0deg,#29f0ffd0,#0000 32%);animation:sp 2.2s linear infinite}
.done .radar{animation-duration:14s;filter:saturate(.4)}
@keyframes sp{to{transform:rotate(360deg)}}
.hd{flex:1;min-width:260px}
.hd small{color:var(--cy);font-size:12px}
h1{position:relative;font:900 clamp(34px,7vw,92px)/.95 "Arial Black",Impact,system-ui,sans-serif;letter-spacing:-.035em;color:#fff;word-break:break-all;margin:6px 0 10px}
h1::before,h1::after{content:attr(data-t);position:absolute;inset:0;overflow:hidden}
h1::before{color:var(--pk);left:3px;animation:g1 3.2s infinite steps(1)}h1::after{color:var(--cy);left:-3px;animation:g2 3.2s infinite steps(1)}
@keyframes g1{0%,91%,100%{clip-path:inset(0 0 100% 0)}92%{clip-path:inset(12% 0 58% 0)}96%{clip-path:inset(62% 0 14% 0)}}
@keyframes g2{0%,89%,100%{clip-path:inset(100% 0 0 0)}90%{clip-path:inset(42% 0 28% 0)}95%{clip-path:inset(4% 0 82% 0)}}
.sub{color:#e6dcff}
.stamp{display:inline-block;margin-top:12px;border:3px solid var(--pk);color:var(--pk);padding:2px 12px;font:900 18px "Arial Black",Impact,sans-serif;letter-spacing:.08em;transform:rotate(-4deg)}
.meter{--p:50;flex:none;width:122px;height:122px;border-radius:50%;background:conic-gradient(var(--yl) calc(var(--p)*1%),#ffffff1a 0);display:grid;place-items:center}
.meter div{width:96px;height:96px;border-radius:50%;background:#14082b;display:grid;place-items:center;text-align:center;font:900 32px/1 "Arial Black",Impact,sans-serif;color:var(--yl)}
.meter small{display:block;font:11px ui-monospace,monospace;color:var(--mu);margin-top:2px}
.btns{display:flex;flex-direction:column;gap:8px}
button{font:inherit;background:none;color:var(--yl);border:2px solid var(--yl);padding:5px 14px;cursor:pointer}
button:hover,button:focus-visible{background:var(--yl);color:#14082b;outline:none}
.log{padding:4px 36px 14px;color:var(--cy);min-height:26px}
.log span{display:inline-block;overflow:hidden;white-space:nowrap;vertical-align:bottom;max-width:100%;animation:ty .5s steps(24)}
.log::after{content:"▌";animation:bl 1s steps(1) infinite}
@keyframes ty{from{clip-path:inset(0 100% 0 0)}}@keyframes bl{50%{opacity:0}}
.grid{columns:360px 3;column-gap:24px;padding:8px 36px 70px}
.card{--c:var(--pk);break-inside:avoid;margin-bottom:24px;background:#1f0f3d;border:2px solid var(--c);box-shadow:7px 7px 0 var(--c);animation:pop .35s both;animation-delay:calc(var(--i)*70ms)}
.card:nth-child(3n+2){--c:var(--cy)}.card:nth-child(3n){--c:var(--yl)}
@keyframes pop{from{transform:translate(-16px,12px) rotate(-2deg);opacity:0}}
.card h2{display:flex;justify-content:space-between;align-items:center;font:900 15px "Arial Black",Impact,sans-serif;background:var(--c);color:#14082b;padding:5px 12px}
.dot{width:10px;height:10px;background:#14082b;border-radius:50%}.busy .dot{animation:bl .6s steps(1) infinite}
.bd{padding:12px 14px;overflow-wrap:anywhere}
.r{display:grid;grid-template-columns:96px 1fr;gap:8px;padding:3px 0;border-bottom:1px dashed #ffffff1f}.r:last-child{border:0}
.r span{color:var(--mu)}.r b{font-weight:500}
.chips{display:flex;flex-wrap:wrap;gap:5px}.chips i{font-style:normal;border:1px solid var(--c);padding:0 7px}.chips i.hot{background:var(--pk);border-color:var(--pk);color:#14082b}
.chips i.ok{border-color:#4dff9f;color:#4dff9f}.chips i.no{border-color:var(--pk);color:var(--pk)}
.note{color:var(--mu);margin:4px 0 8px}.mu{color:var(--mu)}
a{color:var(--cy)}pre{white-space:pre-wrap;background:#0d0520;padding:8px;max-height:150px;overflow:auto;margin:4px 0}
.g{margin:8px 0 3px;color:var(--c)}
.ld{height:44px;background:#ffffff1c;animation:bl 1s steps(2) infinite}
@media (prefers-reduced-motion:reduce){*,.ov{animation:none!important}}
@media (max-width:640px){header,.grid,.log{padding-left:16px;padding-right:16px}.btns{flex-direction:row}}`;

const P = [['target','Target','🎯'],['owner','Owner and identity','🕵️'],['reg','Registration and age','📜'],['contact','Contact details','📡'],['dev','Developers and credits','🧑‍💻'],['tech','Tech stack','🧬'],['net','Server and network','🛰️'],['sec','Security','🛡️'],['third','Trackers and third parties','👁️'],['subs','Subdomains','🕸️'],['files','Site files and links','🗂️']];
const ent = r => (D.rdap?.entities || []).filter(e => e.roles.includes(r));
const R = {
  target() { const m = D.meta, c = D.counts;
    return (m.fav ? `<img src="${esc(m.fav)}" width="28" height="28" alt="" style="float:right;margin-left:8px">` : '') + row('Title', esc(m.title)) + row('About', esc(m.desc)) + row('Site name', esc(m.site)) + row('Address', esc(location.href.slice(0, 140))) + row('Language', esc(m.lang)) + row('Canonical', m.canon && lk(m.canon, m.canon)) + row('Last modified', esc(document.lastModified)) + row('Page has', `${c.links} links (${c.ext} external), ${c.img} images, ${c.scripts} scripts, ${c.forms} forms, ${c.iframes} iframes`); },
  owner() { let h = ''; const rg = ent('registrant')[0];
    if (S.rdap === 0) h += '<div class="ld"></div>';
    else if (rg && (rg.name || rg.org || rg.email)) { h += row('Registrant', [rg.name, rg.org].filter(Boolean).map(esc).join(' · ')) + row('Reg. email', esc(rg.email)) + row('Reg. address', esc(rg.addr)); if ([rg.name, rg.org, rg.email].some(redacted)) h += '<p class="note">The registrant is hidden by WHOIS privacy, which is the norm now. The site’s own claims are below.</p>'; }
    else h += '<p class="note">The registry doesn’t publish the registrant, so these clues come from the site itself.</p>';
    const claim = [...D.orgs.map(o => o.name).filter(Boolean), ...(D.copy ? ['© ' + D.copy] : []), ...[...D.legal].slice(0, 5)];
    const fo = D.orgs.flatMap(o => o.founders);
    return h + row('Site claims', cl([...new Set(claim)].slice(0, 8))) + row('Founders', cl([...new Set(fo)])) + row('Company IDs', cl([...D.ids])) + row('Hosted by', D.net && esc(D.net.org || D.net.isp)); },
  reg() { if (S.rdap === 0 && S.wb === 0) return null; const r = D.rdap, ev = r?.events || {}; let h = '';
    if (r) { const x = ev.expiration; h += row('Registered', ev.registration && `${fmt(ev.registration)} <em class="mu">(${age(ev.registration)} old)</em>`) + row('Updated', ev['last changed'] && fmt(ev['last changed'])) + row('Expires', x && `${fmt(x)} <em class="mu">(${Math.round((new Date(x) - Date.now()) / 864e5)} days left)</em>`) + row('Registrar', ent('registrar').map(e => esc(e.name || e.org)).filter(Boolean)[0]) + row('Status', cl(r.status)) + row('Nameservers', cl(r.ns)); }
    else if (S.rdap === 2) h += '<p class="note">No public registry record was reachable for this domain’s extension.</p>';
    if (D.wb) h += row('Seen online', `${fmt(D.wb.first)} <em class="mu">(first web archive snapshot)</em>`);
    if (D.crt?.first) h += row('First cert', fmt(D.crt.first));
    return h + row('Look up', `${lk('who.is', 'https://who.is/whois/' + domain)} · ${lk('ICANN', 'https://lookup.icann.org/en/lookup?name=' + domain)}`); },
  contact() { const e = [...D.emails], rg = (D.rdap?.entities || []).filter(x => x.email && !redacted(x.email)).map(x => x.email.toLowerCase());
    const all = [...new Set([...e, ...rg])].slice(0, 14), ph = [...D.phones].slice(0, 8), ad = [...D.addrs].slice(0, 4);
    const sec = (D.txt.sec || '').match(/^Contact:\s*(.+)$/gim) || [];
    return row('Emails', cl(all, x => `<i>${lk(x, 'mailto:' + x)}</i>`)) + row('Phones', cl(ph, x => `<i>${lk(x, 'tel:' + x.replace(/[^\d+]/g, ''))}</i>`)) + row('Addresses', ad.map(esc).join('<br>')) + row('Social', cl(Object.entries(D.social), ([n, u]) => `<i>${lk(n, u.startsWith('http') ? u : 'https:' + u)}</i>`)) + row('Security', sec.map(s => esc(s.replace(/^Contact:\s*/i, ''))).join('<br>')) + row('Pages', cl(['/contact', '/contact-us', '/about', '/about-us'].filter(p => D.pages[p]), p => `<i>${lk(p, location.origin + p)}</i>`)) || '<p class="note">No public contact details found on this page, /contact or /about.</p>'; },
  dev() { const m = D.meta, hm = D.txt.humans;
    const gh = D.social.GitHub; const h = row('Credits', cl([...D.credits])) + row('Author tag', esc(m.author)) + row('Built with', esc(m.gen)) + row('Publisher', esc(m.pub)) + row('GitHub', gh && lk(gh, gh)) + row('CMS / framework', cl(D.tech.filter(t => /CMS|Framework/.test(t.cat)).map(t => t.name))) + (hm ? `<div class="g">humans.txt</div><pre>${esc(hm.slice(0, 900))}</pre>` : '');
    return h || '<p class="note">This site doesn’t credit its developers. For agency work, check the footer, the page source (Ctrl+U) and the GitHub links.</p>'; },
  tech() { if (!D.tech.length) return ''; const g = {}; D.tech.forEach(t => (g[t.cat] = g[t.cat] || []).push(t.name)); return Object.entries(g).map(([k, v]) => `<div class="g">${k}</div>${cl(v)}`).join(''); },
  net() { if (S.net === 0 && S.dns === 0) return null; const n = D.net, d = D.dns; let h = '';
    if (n) h += row('IP', esc(n.ip)) + row('Location', `${esc(n.flag || '')} ${esc([n.city, n.region, n.country].filter(Boolean).join(', '))}`) + row('Network', esc(n.org || n.isp) + (n.asn ? ` <em class="mu">AS${n.asn}</em>` : '')) + row('Time zone', esc(n.tz));
    if (d) { const mx = d.MX.map(x => x.split(' ').pop().toLowerCase()), vend = new Set();
      MXV.forEach(([re, v]) => { if (mx.some(x => re.test(x)) || d.TXT.some(t => /v=spf1/.test(t) && re.test(t))) vend.add(v); });
      const tx = new Set(); d.TXT.forEach(t => TXV.forEach(([re, v]) => re.test(t) && tx.add(v)));
      h += row('Alias (CNAME)', cl(d.CNAME)) + row('IPv6', cl(d.AAAA.slice(0, 2))) + row('Mail servers', cl(mx.slice(0, 5))) + row('Email via', cl([...vend])) + row('Uses services', cl([...tx])) + row('Nameservers', cl(d.NS.map(x => x.toLowerCase()))); }
    const hd = Object.entries(D.hdr).filter(([k]) => /^(server|x-powered-by|via|x-generator|x-cache|cf-ray|x-served-by)$/.test(k)).map(([k, v]) => `${esc(k)}: ${esc(String(v).slice(0, 80))}`).join('<br>');
    return h + row('Headers', hd) || '<p class="note">Network lookups failed.</p>'; },
  sec() { const h = D.hdr; let s = row('HTTPS', `<i class="chips"><i class="${location.protocol === 'https:' ? 'ok' : 'no'}">${location.protocol === 'https:' ? 'yes' : 'no'}</i></i>`);
    s += `<div class="chips" style="margin:6px 0">${SECH.map(k => `<i class="${h[k] ? 'ok' : 'no'}">${h[k] ? '✔' : '✘'} ${k}</i>`).join('')}</div>`;
    if (S.crt === 1) s += row('Cert issuers', cl(D.crt.issuers)) + row('Certificates', `${D.crt.count}${D.crt.count >= 4000 ? '+' : ''} logged`);
    if (D.dns) s += row('CAA', cl(D.dns.CAA)); return s + row('security.txt', D.txt.sec ? 'published' : dash); },
  third() { const tr = D.third.filter(x => x.tr), ot = D.third.filter(x => !x.tr);
    return row('Trackers', cl(tr.map(x => x.h), x => `<i class="hot">${esc(x)}</i>`) || dash) + row('Other hosts', cl(ot.slice(0, 18).map(x => x.h))) + row('Cookies', `${D.ck} readable by scripts`) + row('Local storage', `${D.ls} keys`); },
  subs() { if (S.crt === 0) return null; if (S.crt === 2) return '<p class="note">The certificate log (crt.sh) didn’t answer. It is slow at times; scan again later.</p>';
    const n = D.crt.names.filter(x => x !== domain && !x.includes('@')); return row('Found', `${n.length} from certificate logs`) + cl(n.slice(0, 70)); },
  files() { const rb = D.txt.robots || '', sm = [...rb.matchAll(/^sitemap:\s*(\S+)/gim)].map(x => x[1]);
    return row('robots.txt', D.txt.robots ? `${(rb.match(/^disallow:/gim) || []).length} blocked paths` : dash) + row('Sitemaps', sm.slice(0, 4).map(u => lk(u, u)).join('<br>')) + row('Legal pages', cl(['/privacy-policy', '/terms'].filter(p => D.pages[p]), p => `<i>${lk(p, location.origin + p)}</i>`)) + row('Links out to', cl(D.out)); }
};

const root = document.createElement('div'); root.id = 'crux-track-root';
const sh = root.attachShadow({ mode: 'open' });
sh.innerHTML = `<style>${CSS}</style><div class="ov"><header><div class="radar"></div><div class="hd"><small id="tg">CRUX Track: target locked, digging…</small><h1 data-t="${esc(host)}">${esc(host)}</h1><div class="sub" id="sub"></div><div class="stamp" id="st">Case file open</div></div><div class="meter" id="mt"><div><span id="sc">--</span><small>trust</small></div></div><div class="btns"><button id="cp">Copy JSON</button><button id="cx">Close (Esc)</button></div></header><div class="log" id="log"></div><main class="grid">${P.map(([id, t, ic], i) => `<section class="card busy" id="c-${id}" style="--i:${i}"><h2><span>${ic} ${t}</span><span class="dot"></span></h2><div class="bd"><div class="ld"></div></div></section>`).join('')}</main></div>`;
document.documentElement.appendChild(root);
const prevOv = document.documentElement.style.overflow; document.documentElement.style.overflow = 'hidden';
const $ = id => sh.getElementById(id);
const log = m => { $('log').innerHTML = `<span>${esc(m)}</span>`; };
const toggle = () => { const on = root.style.display === 'none'; root.style.display = on ? '' : 'none'; document.documentElement.style.overflow = on ? 'hidden' : prevOv; };
window.__cruxTrack = { toggle };
window.addEventListener('keydown', e => { if (e.key === 'Escape' && root.style.display !== 'none') { e.stopPropagation(); toggle(); } }, true);
$('cx').onclick = toggle;
$('cp').onclick = async () => {
  const o = { site: location.href, domain, registry: D.rdap, dns: D.dns, network: D.net, firstArchived: D.wb, certs: D.crt, headers: D.hdr, emails: [...D.emails], phones: [...D.phones], addresses: [...D.addrs], social: D.social, organizations: D.orgs, legalEntities: [...D.legal], companyIds: [...D.ids], credits: [...D.credits], copyright: D.copy, tech: D.tech, thirdParties: D.third, meta: D.meta, humansTxt: D.txt.humans || null };
  const t = JSON.stringify(o, null, 2);
  try { await navigator.clipboard.writeText(t); } catch { const a = document.createElement('textarea'); a.value = t; sh.appendChild(a); a.select(); document.execCommand('copy'); a.remove(); }
  $('cp').textContent = 'Copied ✔'; setTimeout(() => ($('cp').textContent = 'Copy JSON'), 1800);
};

function renderNow() {
  for (const [id] of P) {
    let h; try { h = R[id](); } catch (e) { h = `<p class="note">Couldn’t render this panel: ${esc(e.message)}</p>`; }
    if (h == null) continue;
    const c = $('c-' + id); c.querySelector('.bd').innerHTML = h || '<p class="note">Nothing found.</p>'; c.classList.remove('busy');
  }
  const s = score(); $('mt').style.setProperty('--p', s); $('sc').textContent = s;
  const born = D.rdap?.events?.registration || D.wb?.first;
  const reg = ent('registrar')[0];
  $('sub').textContent = [D.net && `${D.net.flag || ''} ${[D.net.city, D.net.country].filter(Boolean).join(', ')}`, D.net && (D.net.org || D.net.isp), reg && 'registrar: ' + (reg.name || reg.org)].filter(Boolean).join('  ·  ');
  if (born) $('st').textContent = `${age(born)} old · since ${new Date(born).getFullYear()}`;
}

let rq = 0; const render = () => { if (!rq) rq = setTimeout(() => { rq = 0; renderNow(); }, 140); };
/* ---------- run ---------- */
let pending = 0;
const done = () => { if (--pending <= 0) { render(); sh.querySelector('.ov').classList.add('done'); $('tg').textContent = 'Scan complete'; log('Done. Trust score is a rough heuristic, not a verdict.'); } };
const api = (job, key) => { pending++; chrome.runtime.sendMessage({ type: 'api', job, host, domain }, r => { void chrome.runtime.lastError; if (r?.ok) { D[key] = r.data; S[job === 'rdap' ? 'rdap' : job] = 1; } else S[job] = 2; render(); done(); }); };
const msgs = ['Reading the page…', 'Pulling registry records…', 'Interrogating DNS…', 'Checking the web archive…', 'Sniffing headers and tech…', 'Crawling contact and legal pages…'];
msgs.forEach((m, i) => setTimeout(() => S.local && pending > 0 && log(m), 700 * i));

scanLocal(); log(msgs[0]); render();
pending++; // guard until local tasks finish
api('rdap', 'rdap'); api('dns', 'dns'); api('net', 'net'); api('wb', 'wb'); api('crt', 'crt');
(async () => {
  const home = await get(location.href); if (home) { D.hdr = home.h; }
  detect(); render();
  const txt = { humans: '/humans.txt', sec: '/.well-known/security.txt', robots: '/robots.txt' };
  await Promise.all(Object.entries(txt).map(async ([k, p]) => { let r = await get(p); if (!isTxt(r) && k === 'sec') r = await get('/security.txt'); if (isTxt(r)) D.txt[k] = r.text; }));
  await Promise.all(['/contact', '/contact-us', '/about', '/about-us', '/privacy-policy', '/terms'].map(async p => { const r = await get(p); if (r && r.ct.includes('html')) { D.pages[p] = true; harvest(new DOMParser().parseFromString(r.text, 'text/html')); } }));
})().finally(() => done());
})();
