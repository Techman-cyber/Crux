// Ad hiding + YouTube ad skipping, cookie banner killer, night mode.
(() => {
const X = window.__crux; if (!X) return;
const sty = (id, css) => { let s = document.getElementById(id); if (!css) { s && s.remove(); return; } if (!s) { s = document.createElement('style'); s.id = id; (document.head || document.documentElement).appendChild(s); } s.textContent = css; };
const AD = 'ins.adsbygoogle,.adsbygoogle,[id^="google_ads_"],[id^="div-gpt-ad"],[id*="gpt-ad-"],iframe[src*="doubleclick.net"],iframe[src*="googlesyndication"],[data-ad-slot],[data-google-query-id],.ad-slot,.ad-unit,.ad-banner,.banner-ad,.advertisement,.sponsored-ad,#ad-banner,.taboola,[id^="taboola-"],.trc_rbox_container,.OUTBRAIN,.ob-widget,ytd-ad-slot-renderer,ytd-in-feed-ad-layout-renderer,ytd-banner-promo-renderer,ytd-statement-banner-renderer,#player-ads,#masthead-ad,.ytp-ad-overlay-container,.ytp-ad-image-overlay,ytd-display-ad-renderer,ytd-promoted-sparkles-web-renderer,ytd-promoted-video-renderer{display:none!important}';
const yt = { t: 0, start() {
  if (this.t) return;
  this.t = setInterval(() => {
    const p = document.querySelector('#movie_player'); if (!p) return;
    const v = p.querySelector('video');
    document.querySelector('.ytp-ad-skip-button,.ytp-ad-skip-button-modern,.ytp-skip-ad-button,.ytp-ad-skip-button-container button')?.click();
    if (p.classList.contains('ad-showing') && v) {
      if (!v.dataset.cm) v.dataset.cm = v.muted ? '1' : '0';
      v.muted = true; v.playbackRate = 16; if (isFinite(v.duration) && v.duration > 0) v.currentTime = Math.max(0, v.duration - 0.1);
    } else if (v && v.dataset.cm) { v.muted = v.dataset.cm === '1'; v.playbackRate = 1; delete v.dataset.cm; }
  }, 700);
}, stop() { clearInterval(this.t); this.t = 0; } };
X.add('adblock', { auto(on) { sty('crux-ads', on ? AD : ''); on && /(^|\.)youtube\.com$/.test(location.hostname) ? yt.start() : yt.stop(); } });

const CK = '#onetrust-consent-sdk,#onetrust-banner-sdk,#CybotCookiebotDialog,#cookiebanner,#cookie-banner,#cookie-notice,#cookie-law-info-bar,#gdpr-cookie-notice,.cc-window,.cc-banner,.cookie-banner,.cookie-notice,.cookie-consent,.cookie-popup,.cmp-container,#truste-consent-track,div[id^="sp_message_container"],.fc-consent-root,#didomi-host,.qc-cmp2-container,[aria-label*="cookie" i][role="dialog"],[id*="cookie" i][class*="banner" i],[class*="cookie" i][class*="modal" i]';
const REJ = /^\s*(reject|decline|deny|refuse|disagree|necessary only|only necessary|essential only|only essential|use necessary|continue without|no,? thanks|manage later)/i;
let ck = 0;
X.add('cookies', { auto(on) {
  clearInterval(ck); sty('crux-ck', '');
  if (!on) return;
  sty('crux-ck', CK + '{display:none!important}');
  let n = 0;
  ck = setInterval(() => {
    if (++n > 9) return clearInterval(ck);
    document.querySelectorAll(CK).forEach(c => { if (c.dataset.cruxDone) return; const b = [...c.querySelectorAll('button,a[role=button],[role=button]')].find(x => REJ.test(x.textContent || '')); if (b) { b.click(); c.dataset.cruxDone = 1; } });
    if (document.querySelector(CK)) sty('crux-ck', CK + '{display:none!important}html,body{overflow:auto!important;position:static!important}');
  }, 1000);
} });

const DARK = 'html{filter:invert(1) hue-rotate(180deg)!important;background:#fff!important}img,video,picture,canvas,iframe,svg image,[style*="background-image"]{filter:invert(1) hue-rotate(180deg)!important}';
const DH = () => X.pref('darkHosts') || [];
X.add('dark', {
  auto(on) { sty('crux-dark', on && DH().includes(location.hostname) ? DARK : ''); },
  prompts() {
    if (!matchMedia('(prefers-color-scheme: dark)').matches || DH().includes(location.hostname)) return [];
    const bg = c => { const m = c.match(/[\d.]+/g); return m && (m.length < 4 || +m[3] > .5) ? (+m[0] * .299 + +m[1] * .587 + +m[2] * .114) / 255 : null; };
    const l = bg(getComputedStyle(document.body).backgroundColor) ?? bg(getComputedStyle(document.documentElement).backgroundColor) ?? 1;
    return l > .85 ? [{ id: 'dark', icon: '🌙', title: 'Night mode', pri: 8, text: 'Your device is in dark mode but this page is bright. Use night mode here?', actions: [['Yes, remember', () => window.__crux.run('dark')]] }] : [];
  },
  run() { const h = location.hostname, was = DH().includes(h); sty('crux-dark', was ? '' : DARK); X.update(c => { c.enabled.dark = true; const l = (c.prefs.darkHosts || []).filter(x => x !== h); c.prefs.darkHosts = was ? l : [...l, h]; }); }
});
})();
