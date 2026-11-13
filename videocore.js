// Frame painters for generated videos (pure canvas code, testable).
(function (G) {
const dim = i => [i.width || i.videoWidth, i.height || i.videoHeight];
function cover(x, img, dx, dy, dw, dh, zoom = 1, px = .5, py = .5) { const [iw, ih] = dim(img), k = Math.max(dw / iw, dh / ih) * zoom, w = iw * k, h = ih * k; x.save(); x.beginPath(); x.rect(dx, dy, dw, dh); x.clip(); x.drawImage(img, dx + (dw - w) * px, dy + (dh - h) * py, w, h); x.restore(); }
function wrap(x, t, maxW) { const o = []; for (const para of String(t).split('\n')) { let l = ''; for (const a of para.split(' ')) { const n = l ? l + ' ' + a : a; if (x.measureText(n).width > maxW && l) { o.push(l); l = a; } else l = n; } o.push(l); } return o; }
const ease = p => 1 - (1 - Math.min(1, Math.max(0, p))) ** 3;
function caption(x, W, H, text, size, color) { if (!text) return; const fs = Math.round(H * size / 100); x.font = `700 ${fs}px system-ui,"Segoe UI",sans-serif`; x.textAlign = 'center'; x.textBaseline = 'bottom'; const ls = wrap(x, text, W * .86); x.fillStyle = 'rgba(0,0,0,.45)'; const bh = ls.length * fs * 1.25 + fs * .6; x.fillRect(0, H - bh - fs * .5, W, bh + fs * .5); x.fillStyle = color || '#fff'; ls.forEach((l, i) => x.fillText(l, W / 2, H - fs * .5 - (ls.length - 1 - i) * fs * 1.25)); }
// o: {dur, fade, effect: none|zoomin|zoomout|panleft|panright, caption, capSize, capColor}
function slideFrame(x, W, H, imgs, t, o) {
  const n = imgs.length, total = n * o.dur; t = Math.min(t, total - 1e-3); const i = Math.floor(t / o.dur), l = t - i * o.dur;
  x.fillStyle = '#000'; x.fillRect(0, 0, W, H);
  const draw = (idx, lt, a) => { const p = lt / o.dur; let z = 1, px = .5; if (o.effect === 'zoomin') z = 1 + .15 * p; else if (o.effect === 'zoomout') z = 1.15 - .15 * p; else if (o.effect === 'panleft') { z = 1.15; px = 1 - p; } else if (o.effect === 'panright') { z = 1.15; px = p; } x.globalAlpha = a; cover(x, imgs[idx], 0, 0, W, H, z, px, .5); x.globalAlpha = 1; };
  draw(i, l, 1); if (o.fade > 0 && l > o.dur - o.fade && i < n - 1) draw(i + 1, 0, (l - (o.dur - o.fade)) / o.fade);
  caption(x, W, H, o.caption, o.capSize || 4.5, o.capColor);
}
// o: {dur, anim: fade|slide|type|zoom, font, color, c1, c2, angle, size(%)}
function textFrame(x, W, H, slides, t, o) {
  const n = slides.length; t = Math.min(t, n * o.dur - 1e-3); const i = Math.floor(t / o.dur), l = t - i * o.dur, a0 = (o.angle || 135) * Math.PI / 180, r = Math.hypot(W, H) / 2, gx = Math.cos(a0) * r, gy = Math.sin(a0) * r, g = x.createLinearGradient(W / 2 - gx, H / 2 - gy, W / 2 + gx, H / 2 + gy); g.addColorStop(0, o.c1); g.addColorStop(1, o.c2); x.fillStyle = g; x.fillRect(0, 0, W, H);
  const fs = Math.min(W, H) * o.size / 100; x.font = `700 ${fs}px ${o.font}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = o.color;
  let text = slides[i], alpha = Math.min(1, l / .5, (o.dur - l) / .4 + .0001), dy = 0, sc = 1;
  if (o.anim === 'type') { text = text.slice(0, Math.ceil(text.length * Math.min(1, l / (o.dur * .6)))); alpha = Math.min(1, (o.dur - l) / .4 + .0001); } else if (o.anim === 'slide') dy = (1 - ease(l / .6)) * fs; else if (o.anim === 'zoom') sc = .88 + .12 * ease(l / .6);
  const full = slides[i], lines = (x.save(), wrap(x, full, W * .84)), ls = o.anim === 'type' ? wrap(x, text, W * .84) : lines, lh = fs * 1.3, y0 = H / 2 - (lines.length - 1) * lh / 2 + dy;
  x.globalAlpha = Math.max(0, alpha); x.translate(W / 2, H / 2); x.scale(sc, sc); x.translate(-W / 2, -H / 2); ls.forEach((ln, k) => x.fillText(ln, W / 2, y0 + k * lh)); x.restore(); x.globalAlpha = 1;
}
G.VideoCore = { cover, wrap, slideFrame, textFrame, caption }; if (typeof module !== 'undefined') module.exports = G.VideoCore;
})(typeof window !== 'undefined' ? window : globalThis);
