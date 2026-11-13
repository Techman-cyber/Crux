import { MODS } from './catalog.js';
import { jobs } from './trackapi.js';
import { decrypt, encrypt, importKey, b64 } from './vcrypto.js';

const CS = ['core.js', 'm-cosmetic.js', 'm-ambient.js', 'm-access.js', 'm-links.js', 'm-vaultfill.js', 'm-extras.js', 'm-more.js', 'm-pro.js'];
const RULESETS = { adblock: 'ads', trackers: 'trackers', cleanurls: 'clean', https: 'https' };
const DEF = () => ({ enabled: Object.fromEntries(MODS.map(m => [m.id, !!m.on])), bar: true, paused: [], barOff: [], focus: [], tabMin: 20, lockMin: 10, prefs: {} });
async function cfg() { const { crux } = await chrome.storage.local.get('crux'); const d = DEF(); return { ...d, ...crux, enabled: { ...d.enabled, ...(crux?.enabled || {}) } }; }

/* ---------- blocking rules ---------- */
async function syncRules() {
  const c = await cfg(), en = [], dis = [];
  for (const [m, r] of Object.entries(RULESETS)) (c.enabled[m] ? en : dis).push(r);
  await chrome.declarativeNetRequest.updateEnabledRulesets({ enableRulesetIds: en, disableRulesetIds: dis });
  const rules = []; let id = 1;
  c.paused.forEach(h => rules.push({ id: id++, priority: 100, action: { type: 'allowAllRequests' }, condition: { requestDomains: [h], resourceTypes: ['main_frame', 'sub_frame'] } }));
  if (c.enabled.focus) c.focus.forEach(h => rules.push({ id: id++, priority: 50, action: { type: 'redirect', redirect: { extensionPath: '/blocked.html?site=' + encodeURIComponent(h) } }, condition: { requestDomains: [h], resourceTypes: ['main_frame'] } }));
  const old = (await chrome.declarativeNetRequest.getDynamicRules()).map(r => r.id);
  await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: old, addRules: rules });
  chrome.alarms.create('tabsaver', { periodInMinutes: 1 });
  c.enabled.wellbeing ? chrome.alarms.create('wellbeing', { periodInMinutes: 20 }) : chrome.alarms.clear('wellbeing');
}
function menus() {
  chrome.contextMenus.removeAll(() => { const m = (id, title, contexts) => chrome.contextMenus.create({ id, title, contexts });
    m('img-bg', 'Remove background (CRUX)', ['image']); m('img-edit', 'Edit image in CRUX Image Studio', ['image']); m('img-lens', 'Search this image with Google Lens', ['image']); m('img-tineye', 'Search this image on TinEye', ['image']);
    m('link-check', 'Check this link with CRUX', ['link']); m('link-qr', 'Make a QR code for this link', ['link']); m('page-track', 'Scan this site with Track', ['page']); m('page-later', 'Save page to CRUX reading list', ['page']); });
}
chrome.contextMenus.onClicked.addListener((i, t) => {
  const e = encodeURIComponent, ext = f => chrome.tabs.create({ url: chrome.runtime.getURL(f) });
  ({ 'img-bg': () => ext('imgstudio.html?tool=bg&src=' + e(i.srcUrl)), 'img-edit': () => ext('imgstudio.html?tool=resize&src=' + e(i.srcUrl)), 'img-lens': () => chrome.tabs.create({ url: 'https://lens.google.com/uploadbyurl?url=' + e(i.srcUrl) }), 'img-tineye': () => chrome.tabs.create({ url: 'https://tineye.com/search?url=' + e(i.srcUrl) }),
    'link-check': () => ext('check.html?url=' + e(i.linkUrl)), 'link-qr': () => ext('tools.html?tool=qr&text=' + e(i.linkUrl)), 'page-track': () => t && RUN.track(t), 'page-later': () => t && RUN.readlater(t) })[i.menuItemId]?.();
});
chrome.runtime.onInstalled.addListener(async () => {
  menus();
  const { crux } = await chrome.storage.local.get('crux');
  if (!crux) await chrome.storage.local.set({ crux: DEF() });
  chrome.declarativeNetRequest.setExtensionActionOptions({ displayActionCountAsBadgeText: true });
  syncRules();
});
chrome.runtime.onStartup.addListener(() => { chrome.declarativeNetRequest.setExtensionActionOptions({ displayActionCountAsBadgeText: true }); syncRules(); });
chrome.storage.onChanged.addListener((ch, area) => { if (area === 'local' && ch.crux) syncRules(); });

/* ---------- running tools on a tab ---------- */
async function inject(id) {
  const [{ result }] = await chrome.scripting.executeScript({ target: { tabId: id }, func: () => !!window.__crux });
  if (!result) await chrome.scripting.executeScript({ target: { tabId: id }, files: CS });
}
async function call(t, mod) { await inject(t.id); await chrome.scripting.executeScript({ target: { tabId: t.id }, func: m => window.__crux.run(m), args: [mod] }); }
const page = f => chrome.tabs.create({ url: chrome.runtime.getURL(f) });
async function discardIdle(min) {
  const now = Date.now();
  for (const t of await chrome.tabs.query({ active: false, pinned: false, audible: false, discarded: false }))
    if (/^https?:/.test(t.url || '') && now - (t.lastAccessed || now) > min * 60000) try { await chrome.tabs.discard(t.id); } catch {}
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
const cap = async t => { if (!t.active) { await chrome.tabs.update(t.id, { active: true }); await sleep(550); } return chrome.tabs.captureVisibleTab(t.windowId, { format: 'png' }); };
async function fullshot(t) {
  const ex = (func, args = []) => chrome.scripting.executeScript({ target: { tabId: t.id }, func, args }).then(r => r[0].result);
  const d = await ex(() => ({ h: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight), vh: innerHeight, w: innerWidth, dpr: devicePixelRatio, y: scrollY }));
  const steps = Math.min(Math.ceil(d.h / d.vh), Math.floor(16000 / (d.vh * d.dpr)), 30), shots = [];
  for (let i = 0; i < steps; i++) {
    const y = Math.min(i * d.vh, d.h - d.vh);
    await ex(y => scrollTo({ top: y, behavior: 'instant' }), [y]); await sleep(i ? 600 : 350);
    shots.push({ y, url: await cap(t) });
    if (i === 0) await ex(() => { window.__cruxFx = []; document.querySelectorAll('body *').forEach(e => { const p = getComputedStyle(e).position; if (p === 'fixed' || p === 'sticky') { window.__cruxFx.push([e, e.style.visibility]); e.style.visibility = 'hidden'; } }); });
  }
  await ex(y => { (window.__cruxFx || []).forEach(([e, v]) => (e.style.visibility = v)); scrollTo({ top: y, behavior: 'instant' }); }, [d.y]);
  const H = Math.round(Math.min(d.h, steps * d.vh) * d.dpr), cv = new OffscreenCanvas(Math.round(d.w * d.dpr), H), cx = cv.getContext('2d');
  for (const s of shots) { const bm = await createImageBitmap(await (await fetch(s.url)).blob()); cx.drawImage(bm, 0, Math.round(s.y * d.dpr)); bm.close(); }
  const blob = await cv.convertToBlob({ type: 'image/jpeg', quality: 0.9 });
  await chrome.downloads.download({ url: 'data:image/jpeg;base64,' + b64(await blob.arrayBuffer()), filename: `CRUX/fullpage-${Date.now()}.jpg` });
}
const RUN = {
  market: () => page('market.html'),
  marketshot: async t => { try { await chrome.storage.session.set({ mshot: await cap(t) }); } catch { } await page('market.html?tool=shot'); },
  shotedit: async t => { const u = await cap(t); await chrome.storage.session.set({ shot: u }); await page('imgstudio.html?tool=annotate&from=shot'); },
  fullshot, images: t => call(t, 'images'), notes: t => call(t, 'notes'), speed: t => call(t, 'speed'),
  cleaner: async t => { await chrome.browsingData.remove({ origins: [new URL(t.url).origin] }, { cookies: true, localStorage: true, indexedDB: true, cacheStorage: true, serviceWorkers: true, cache: true }); chrome.tabs.reload(t.id); },
  wayback: t => chrome.tabs.create({ url: 'https://web.archive.org/web/*/' + t.url }),
  laterlist: () => page('later.html'),
  readlater: async t => { const { later = [] } = await chrome.storage.local.get('later'); if (!later.some(x => x.url === t.url)) later.unshift({ title: t.title || t.url, url: t.url, t: Date.now() }); await chrome.storage.local.set({ later }); chrome.action.setBadgeBackgroundColor({ color: '#8b3dff' }); chrome.action.setBadgeText({ tabId: t.id, text: '✓' }); setTimeout(() => chrome.action.setBadgeText({ tabId: t.id, text: '' }), 1600); },
  tabs: () => page('tabs.html'), tempmail: () => page('tempmail.html'), forms: () => page('profile.html'),
  toolbox: (t, m) => chrome.tabs.create({ url: chrome.runtime.getURL('tools.html') + '?tool=' + encodeURIComponent(m?.tool || 'json') + '&text=' + encodeURIComponent(t?.url || '') }),
  quickclean: () => chrome.browsingData.remove({ since: Date.now() - 3600000 }, { cookies: true, cache: true, history: true, downloads: true, formData: true }),
  mutetab: t => chrome.tabs.update(t.id, { muted: !t.mutedInfo?.muted }),
  translate: t => chrome.tabs.create({ url: 'https://translate.google.com/translate?sl=auto&tl=' + chrome.i18n.getUILanguage().split('-')[0] + '&u=' + encodeURIComponent(t.url) }),
  track: async t => { await chrome.scripting.executeScript({ target: { tabId: t.id }, files: ['track.js'] }); },
  linkcheck: t => call(t, 'linkcheck'), access: t => call(t, 'access'), ambient: t => call(t, 'ambient'), dark: t => call(t, 'dark'),
  safecheck: t => chrome.tabs.create({ url: chrome.runtime.getURL('check.html') + '?url=' + encodeURIComponent(t.url || '') }),
  vault: () => page('vault.html'), focus: () => page('focus.html'),
  recorder: () => chrome.windows.create({ url: 'recorder.html', type: 'popup', width: 540, height: 660 }),
  picker: () => chrome.windows.create({ url: 'picker.html', type: 'popup', width: 400, height: 360 }),
  shot: async t => { const u = await cap(t); await chrome.downloads.download({ url: u, filename: `CRUX/screenshot-${Date.now()}.png` }); },
  tabsaver: () => discardIdle(0.5)
};
for (const id of ['volume', 'zap', 'comfort', 'autoscroll', 'pip', 'unlock', 'selection', 'inspect', 'fontinfo', 'ruler', 'print']) RUN[id] = t => call(t, id);
chrome.commands.onCommand.addListener(async cmd => {
  if (cmd === 'open-hub') { const [t] = await chrome.tabs.query({ active: true, currentWindow: true }); return chrome.tabs.create({ url: chrome.runtime.getURL('hub.html') + (t ? '?tab=' + t.id : '') }); } if (cmd === 'run-track') { const [t] = await chrome.tabs.query({ active: true, currentWindow: true }); if (t) RUN.track(t); } });

/* ---------- link checker ---------- */
async function chk(u) {
  const t0 = Date.now();
  const go = async method => { const c = new AbortController(), t = setTimeout(() => c.abort(), 9000); try { return await fetch(u, { method, redirect: 'follow', credentials: 'omit', cache: 'no-store', signal: c.signal }); } finally { clearTimeout(t); } };
  try {
    let r = await go('HEAD');
    if (r.status >= 400) r = await go('GET');
    return { u, s: r.status, f: r.redirected ? r.url : null, ms: Date.now() - t0 };
  } catch (e) { return { u, s: 0, e: e.name === 'AbortError' ? 'timeout' : 'unreachable' }; }
}
async function pool(list, n, fn) { const out = []; let i = 0; await Promise.all(Array.from({ length: n }, async () => { while (i < list.length) { const k = i++; out[k] = await fn(list[k]); } })); return out; }

/* ---------- vault (key lives only in session memory) ---------- */
const hostOf = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } };
const hostMatch = (entryUrl, h) => { const e = hostOf(entryUrl.includes('://') ? entryUrl : 'https://' + entryUrl); return !!e && (h === e || h.endsWith('.' + e) || e.endsWith('.' + h)); };
async function entries() {
  const { vault } = await chrome.storage.local.get('vault'), { vk } = await chrome.storage.session.get('vk');
  if (!vault || !vk) return null;
  try { return await decrypt(await importKey(vk), vault); } catch { return null; }
}
const touchLock = async () => { const c = await cfg(); chrome.alarms.create('vlock', { delayInMinutes: Math.max(1, c.lockMin) }); };

/* ---------- message router ---------- */
const H = {
  api: m => jobs[m.job](m),
  run: async (m, s) => { const t = m.tabId ? await chrome.tabs.get(m.tabId) : s.tab; if (!RUN[m.mod]) throw new Error('unknown tool'); await RUN[m.mod](t, m); },
  linkcheck: m => pool(m.urls.slice(0, 60), 8, chk),
  'vault.state': async () => { const { vault } = await chrome.storage.local.get('vault'), { vk } = await chrome.storage.session.get('vk'); return { exists: !!vault, unlocked: !!vk }; },
  'vault.touch': () => touchLock(),
  'vault.pend': async (m, s) => { const h = hostOf(s.tab?.url || ''); if (!h) return; const { pend = {} } = await chrome.storage.session.get('pend'); pend[h] = { user: m.user || '', pass: m.pass, t: Date.now() }; await chrome.storage.session.set({ pend }); },
  'vault.pending': async (m, s) => { const h = hostOf(s.tab?.url || ''), { pend = {} } = await chrome.storage.session.get('pend'), p = pend[h]; if (!p || Date.now() - p.t > 180000) return null; return { user: p.user }; },
  'vault.save': async (m, s) => {
    const h = hostOf(s.tab?.url || ''), { pend = {} } = await chrome.storage.session.get('pend'), p = pend[h], { vault } = await chrome.storage.local.get('vault'), { vk } = await chrome.storage.session.get('vk');
    if (!p) return 'none'; if (!vault || !vk) return 'locked';
    const key = await importKey(vk), items = await decrypt(key, vault), ex = items.find(i => i.url && hostMatch(i.url, h) && i.user === p.user);
    if (ex) ex.pass = p.pass; else items.push({ id: crypto.randomUUID(), title: h, url: 'https://' + h, user: p.user, pass: p.pass, notes: '' });
    await chrome.storage.local.set({ vault: await encrypt(key, items, { v: 1, iter: vault.iter, salt: vault.salt }) }); delete pend[h]; await chrome.storage.session.set({ pend }); touchLock(); return 'saved';
  },
  define: async m => { try { const r = await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(m.word)), j = await r.json(), x = j[0].meanings[0]; return `${j[0].word} (${x.partOfSpeech}): ${x.definitions[0].definition}`; } catch { return null; } },
  'vault.lock': () => chrome.storage.session.remove('vk'),
  'vault.match': async (m, s) => { const list = await entries(), h = hostOf(s.tab?.url || ''); return list && h ? list.filter(e => e.url && hostMatch(e.url, h)).map(e => ({ id: e.id, title: e.title, user: e.user })) : []; },
  'vault.get': async (m, s) => { const list = await entries(), h = hostOf(s.tab?.url || ''), e = list?.find(x => x.id === m.id); if (!e || !hostMatch(e.url, h)) throw new Error('no match'); touchLock(); return { user: e.user, pass: e.pass }; },
  dl: m => Promise.all(m.urls.slice(0, 100).map((u, i) => chrome.downloads.download({ url: u, filename: `CRUX/images/${Date.now()}-${i}-` + (decodeURIComponent(u.split('?')[0].split('/').pop() || 'image').replace(/[^\w.-]/g, '_').slice(-60) || 'image') + (/\.(jpe?g|png|gif|webp|avif|svg)$/i.test(u.split('?')[0]) ? '' : '.jpg'), conflictAction: 'uniquify' }).catch(() => 0))),
  pomo: async m => {
    const p = (await chrome.storage.local.get('pomo')).pomo || {};
    if (m.act === 'state') return p;
    await chrome.alarms.clear('pomo'); const c = await cfg();
    if (m.act === 'start') { const end = Date.now() + m.work * 60000; await chrome.storage.local.set({ pomo: { phase: 'work', end, work: m.work, brk: m.brk } }); chrome.alarms.create('pomo', { when: end }); c.enabled.focus = true; }
    else { await chrome.storage.local.remove('pomo'); c.enabled.focus = false; }
    await chrome.storage.local.set({ crux: c });
  },
  open: m => page(m.page)
};
chrome.runtime.onMessage.addListener((m, s, send) => {
  if (s.id !== chrome.runtime.id || !H[m?.type]) return;
  Promise.resolve(H[m.type](m, s)).then(d => send({ ok: true, data: d }), e => send({ ok: false, error: String(e) }));
  return true;
});
chrome.alarms.onAlarm.addListener(async a => {
  if (a.name === 'vlock') chrome.storage.session.remove('vk');
  if (a.name === 'wellbeing') {
    const c = await cfg(); if (!c.enabled.wellbeing) return; const { wb = 0 } = await chrome.storage.session.get('wb'), n = wb + 1; await chrome.storage.session.set({ wb: n });
    const msg = n % 3 === 0 ? ['Drink some water', 'It’s been an hour. A glass of water now keeps headaches away.'] : n % 2 === 0 ? ['Posture check', 'Shoulders down, back straight, feet flat. Stretch your neck for a few seconds.'] : ['20-20-20 eye break', 'Look at something 20 feet (6 m) away for 20 seconds.'];
    chrome.notifications.create({ type: 'basic', iconUrl: 'icon128.png', title: msg[0], message: msg[1] });
  }
  if (a.name === 'pomo') {
    const p = (await chrome.storage.local.get('pomo')).pomo, c = await cfg(); if (!p) return;
    if (p.phase === 'work') { const end = Date.now() + p.brk * 60000; await chrome.storage.local.set({ pomo: { ...p, phase: 'break', end } }); chrome.alarms.create('pomo', { when: end }); c.enabled.focus = false; await chrome.storage.local.set({ crux: c }); chrome.notifications.create({ type: 'basic', iconUrl: 'icon128.png', title: 'Focus session done', message: `Nice work. Take a ${p.brk} minute break. Distracting sites are open again.` }); }
    else { await chrome.storage.local.remove('pomo'); chrome.notifications.create({ type: 'basic', iconUrl: 'icon128.png', title: 'Break over', message: 'Ready for another focus session? Open CRUX → Focus.' }); }
  }
  if (a.name === 'tabsaver') { const c = await cfg(); if (c.enabled.tabsaver) discardIdle(c.tabMin); }
});

/* ---------- risky download guard ---------- */
const RISKY = /\.(exe|msi|scr|bat|cmd|com|pif|vbs|vbe|jse?|wsf|wsh|ps1|jar|apk|dmg|pkg|lnk|hta|cpl|reg|dll|docm|xlsm|pptm)$/i;
const DOUBLE = /\.(pdf|docx?|xlsx?|pptx?|jpe?g|png|gif|txt|mp4|mp3|zip)\.(exe|scr|bat|cmd|js|vbs|lnk|com|msi)$/i;
chrome.downloads.onCreated.addListener(async d => {
  const c = await cfg(); if (!c.enabled.safecheck) return;
  const name = decodeURIComponent((d.filename || d.finalUrl || d.url || '').split(/[\\/]/).pop().split('?')[0]);
  const bad = DOUBLE.test(name) ? 'It has a fake double extension, a classic malware trick.' : /\u202e/.test(name) ? 'Its name hides the real file type.' : RISKY.test(name) ? 'This type of file can run code on your computer.' : '';
  if (!bad) return;
  chrome.notifications.create({ type: 'basic', iconUrl: 'icon128.png', title: 'CRUX: risky download', message: `${name}\n${bad} Keep it only if you trust ${hostOf(d.finalUrl || d.url)}. Open CRUX → Site and file checker to scan it.`, priority: 2 });
});
