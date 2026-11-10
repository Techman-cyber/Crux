// PDF operations on top of pdf-lib. make(PDFLib) so it can run in a page or in Node tests.
(function (G) {
function make(L) {
  const { PDFDocument, degrees, rgb, StandardFonts } = L, load = b => PDFDocument.load(b, { ignoreEncryption: false });
  const parseRanges = (s, n) => { const out = []; for (const part of s.split(',')) { const p = part.trim(); if (!p) continue; const m = /^(\d*)\s*-\s*(\d*)$/.exec(p); if (m) { const a = m[1] ? +m[1] : 1, b = m[2] ? +m[2] : n; for (let i = a; i <= b; i++) if (i >= 1 && i <= n) out.push(i - 1); } else if (/^\d+$/.test(p) && +p >= 1 && +p <= n) out.push(+p - 1); } return out; };
  const pageCount = async b => (await load(b)).getPageCount();
  async function merge(bufs) { const out = await PDFDocument.create(); for (const b of bufs) { const d = await load(b); (await out.copyPages(d, d.getPageIndices())).forEach(p => out.addPage(p)); } return out.save(); }
  async function extract(buf, idx) { const d = await load(buf), out = await PDFDocument.create(); (await out.copyPages(d, idx)).forEach(p => out.addPage(p)); return out.save(); }
  async function rotateDelete(buf, { del = [], rot = [], deg = 0 }) { const d = await load(buf); rot.forEach(i => { const p = d.getPage(i); p.setRotation(degrees((p.getRotation().angle + deg + 360) % 360)); }); [...new Set(del)].sort((a, b) => b - a).forEach(i => d.removePage(i)); return d.save(); }
  async function imagesToPdf(items, { size = 'fit', margin = 0 } = {}) { const out = await PDFDocument.create(), S = { a4: [595.28, 841.89], letter: [612, 792] };
    for (const it of items) { const img = it.type === 'image/png' ? await out.embedPng(it.bytes) : await out.embedJpg(it.bytes); let w = img.width, h = img.height;
      if (size === 'fit') { out.addPage([w + margin * 2, h + margin * 2]).drawImage(img, { x: margin, y: margin, width: w, height: h }); } else { const [pw, ph] = S[size], pg = out.addPage([pw, ph]), k = Math.min((pw - margin * 2) / w, (ph - margin * 2) / h); w *= k; h *= k; pg.drawImage(img, { x: (pw - w) / 2, y: (ph - h) / 2, width: w, height: h }); } }
    return out.save(); }
  async function stamp(buf, { numbers = false, text = '', opacity = .25, fmt = 'Page {n} of {t}', strip = false }) {
    const d = await load(buf), f = await d.embedFont(StandardFonts.Helvetica), pages = d.getPages();
    pages.forEach((p, i) => { const { width: w, height: h } = p.getSize();
      if (numbers) { const t = fmt.replace('{n}', i + 1).replace('{t}', pages.length); p.drawText(t, { x: (w - f.widthOfTextAtSize(t, 10)) / 2, y: 20, size: 10, font: f, color: rgb(.3, .3, .3) }); }
      if (text) { const fs = Math.min(w, h) / 9, tw = f.widthOfTextAtSize(text, fs), th = Math.PI / 4; p.drawText(text, { x: w / 2 - (tw / 2 * Math.cos(th) - fs / 3 * Math.sin(th)), y: h / 2 - (tw / 2 * Math.sin(th) + fs / 3 * Math.cos(th)), size: fs, font: f, color: rgb(.5, .5, .5), opacity, rotate: degrees(45) }); } });
    if (strip) { d.setTitle(''); d.setAuthor(''); d.setSubject(''); d.setKeywords([]); d.setProducer(''); d.setCreator(''); }
    return d.save(); }
  async function info(buf) { const d = await load(buf); return { pages: d.getPageCount(), title: d.getTitle() || '', author: d.getAuthor() || '', producer: d.getProducer() || '', creator: d.getCreator() || '' }; }
  const clean = s => String(s ?? '').replace(/₹/g, 'Rs.');
  const wrapText = (font, size, text, maxW) => { const out = []; for (const para of clean(text).split('\n')) { let l = ''; for (const w of para.split(/\s+/)) { const n = l ? l + ' ' + w : w; if (font.widthOfTextAtSize(n, size) > maxW && l) { out.push(l); l = w; } else l = n; } out.push(l); } return out; };
  const money = (c, n) => `${c} ${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  async function invoice(o) {
    const d = await PDFDocument.create(), F = await d.embedFont(StandardFonts.Helvetica), B = await d.embedFont(StandardFonts.HelveticaBold), W = 595.28, H = 841.89, m = 48, ink = rgb(.1, .1, .15), acc = rgb(.42, .18, .82), grey = rgb(.4, .4, .45);
    let p = d.addPage([W, H]), y = H - 56; const T = (t, x, yy, s = 10, f = F, c = ink) => p.drawText(clean(t), { x, y: yy, size: s, font: f, color: c }), R = (t, xr, yy, s = 10, f = F, c = ink) => T(t, xr - f.widthOfTextAtSize(clean(t), s), yy, s, f, c);
    T('INVOICE', m, y, 28, B, acc); R(`No. ${o.number || '1'}`, W - m, y + 4, 13, B); y -= 18; R(`Date: ${o.date || ''}`, W - m, y, 10, F, grey); if (o.due) { y -= 13; R(`Due: ${o.due}`, W - m, y, 10, F, grey); }
    y -= 34; const yb = y; T('FROM', m, y, 8.5, B, acc); T('BILL TO', W / 2, y, 8.5, B, acc); y -= 14; let ya = y; wrapText(F, 10, o.from || '', 230).forEach(l => { T(l, m, ya); ya -= 13; }); let yc = y; wrapText(F, 10, o.to || '', 230).forEach(l => { T(l, W / 2, yc); yc -= 13; }); y = Math.min(ya, yc) - 22;
    const head = () => { p.drawRectangle({ x: m, y: y - 6, width: W - 2 * m, height: 22, color: rgb(.95, .93, .99) }); T('Description', m + 8, y, 9, B); R('Qty', 380, y, 9, B); R('Price', 460, y, 9, B); R('Amount', W - m - 8, y, 9, B); y -= 26; }; head();
    let sub = 0; for (const it of o.items) { const q = +it.qty || 0, pr = +it.price || 0, amt = q * pr, ls = wrapText(F, 10, it.desc || '', 270); if (y - ls.length * 13 < 140) { p = d.addPage([W, H]); y = H - 60; head(); } sub += amt; ls.forEach((l, i) => T(l, m + 8, y - i * 13)); R(String(q), 380, y); R(money('', pr).trim(), 460, y); R(money('', amt).trim(), W - m - 8, y); y -= Math.max(1, ls.length) * 13 + 7; p.drawLine({ start: { x: m, y: y + 9 }, end: { x: W - m, y: y + 9 }, thickness: .4, color: rgb(.85, .85, .9) }); }
    if (y < 150) { p = d.addPage([W, H]); y = H - 60; } const tax = sub * (+o.tax || 0) / 100, cur = o.currency || ''; y -= 8; const row = (l, v, bold) => { R(l, 440, y, bold ? 12 : 10, bold ? B : F); R(money(cur, v), W - m - 8, y, bold ? 12 : 10, bold ? B : F); y -= bold ? 22 : 16; }; row('Subtotal', sub); if (+o.tax) row(`Tax (${o.tax}%)`, tax); p.drawLine({ start: { x: 330, y: y + 10 }, end: { x: W - m, y: y + 10 }, thickness: 1, color: acc }); y -= 6; row('TOTAL', sub + tax, true);
    if (o.notes) { y -= 14; T('NOTES', m, y, 8.5, B, acc); y -= 14; wrapText(F, 9.5, o.notes, W - 2 * m).forEach(l => { if (y < 60) { p = d.addPage([W, H]); y = H - 60; } T(l, m, y, 9.5, F, grey); y -= 12.5; }); }
    d.setTitle(`Invoice ${o.number || ''}`); d.setProducer('CRUX'); return d.save(); }
  async function resume(o) {
    const d = await PDFDocument.create(), F = await d.embedFont(StandardFonts.Helvetica), B = await d.embedFont(StandardFonts.HelveticaBold), W = 595.28, H = 841.89, m = 50, w = W - 2 * m, ink = rgb(.1, .1, .12), acc = rgb(.2, .2, .45);
    let p = d.addPage([W, H]), y = H - 58; const T = (t, x, yy, s = 10, f = F, c = ink) => p.drawText(clean(t), { x, y: yy, size: s, font: f, color: c }), room = n => { if (y - n < 50) { p = d.addPage([W, H]); y = H - 55; } };
    T(o.name || 'Your Name', m, y, 24, B); y -= 20; if (o.title) { T(o.title, m, y, 12.5, F, acc); y -= 16; } if (o.contact) { wrapText(F, 9.5, o.contact, w).forEach(l => { T(l, m, y, 9.5, F, rgb(.35, .35, .4)); y -= 13; }); } y -= 8;
    const sec = (head, text, bullets = true) => { if (!String(text || '').trim()) return; room(50); T(head.toUpperCase(), m, y, 10.5, B, acc); y -= 5; p.drawLine({ start: { x: m, y }, end: { x: W - m, y }, thickness: .8, color: acc }); y -= 15;
      for (const raw of clean(text).split('\n')) { const l = raw.trim(); if (!l) { y -= 5; continue; } if (/^[-•*]\s+/.test(l)) { const ls = wrapText(F, 10, l.replace(/^[-•*]\s+/, ''), w - 16); room(ls.length * 13); T('•', m + 3, y); ls.forEach((x, i) => { T(x, m + 14, y); y -= 13; }); } else { const ls = wrapText(raw.startsWith(' ') ? F : B, 10.5, l, w); room(ls.length * 14); ls.forEach(x => { T(x, m, y, 10.5, B); y -= 14; }); } } y -= 8; };
    sec('Summary', o.summary); sec('Experience', o.experience); sec('Education', o.education); sec('Skills', o.skills); sec('Projects and other', o.other); d.setTitle(`${o.name || 'Resume'}`); d.setProducer('CRUX'); return d.save(); }
  return { parseRanges, pageCount, merge, extract, rotateDelete, imagesToPdf, stamp, info, invoice, resume };
}
G.makePdf = make; if (typeof module !== 'undefined') module.exports = make;
})(typeof window !== 'undefined' ? window : globalThis);
