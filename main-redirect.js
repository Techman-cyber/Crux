// Runs in the page's own JS world to stop automatic redirects, tab-unders and popups.
(() => {
if (window.top !== window) return;
let on = false, allow = null;
const send = (kind, url) => document.dispatchEvent(new CustomEvent('crux:blocked', { detail: JSON.stringify({ kind, url: String(url || '') }) }));
const active = () => navigator.userActivation && navigator.userActivation.isActive;
document.addEventListener('crux:cfg', e => { try { on = !!JSON.parse(e.detail).redirect; } catch {} });
document.addEventListener('crux:allow', e => { try { const d = JSON.parse(e.detail); allow = d.url; if (d.kind === 'popup') origOpen.call(window, d.url); else location.href = d.url; } catch {} });
const origOpen = window.open;
window.open = function (u, ...r) { if (on && !active() && String(u) !== allow) { send('popup', u); return null; } return origOpen.call(this, u, ...r); };
const origClick = HTMLAnchorElement.prototype.click;
HTMLAnchorElement.prototype.click = function () { if (on && !active() && !this.isConnected && /^https?:/.test(this.href) && new URL(this.href).host !== location.host) { send('popup', this.href); return; } return origClick.call(this); };
const same = h => h.split('.').slice(-2).join('.') === location.hostname.split('.').slice(-2).join('.');
if (window.navigation) navigation.addEventListener('navigate', e => {
  if (!on || e.userInitiated || !e.cancelable || e.hashChange || e.downloadRequest || ['traverse', 'reload'].includes(e.navigationType) || active()) return;
  let d; try { d = new URL(e.destination.url); } catch { return; }
  if (!/^https?:$/.test(d.protocol) || same(d.hostname) || d.href === allow) return;
  e.preventDefault(); send('redirect', d.href);
});
// meta-refresh redirects: checked a couple of times, no heavy page-wide observer
const metaCheck = () => { if (!on) return; document.querySelectorAll('meta[http-equiv="refresh" i]').forEach(m => {
  const u = (m.content.match(/url=['"]?([^'"]+)/i) || [])[1]; if (!u) return;
  try { const d = new URL(u, location.href); if (!same(d.hostname)) { m.remove(); send('redirect', d.href); } } catch {} }); };
document.addEventListener('DOMContentLoaded', metaCheck); setTimeout(metaCheck, 1200);
document.dispatchEvent(new CustomEvent('crux:hello'));
})();
