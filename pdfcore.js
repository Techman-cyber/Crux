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
  return { parseRanges, pageCount, merge, extract, rotateDelete, imagesToPdf, stamp, info };
}
G.makePdf = make; if (typeof module !== 'undefined') module.exports = make;
})(typeof window !== 'undefined' ? window : globalThis);
