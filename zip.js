// Minimal ZIP writer (stored, no compression) + ICO builder. No dependencies.
(function (G) {
const T = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc = u => { let c = ~0; for (let i = 0; i < u.length; i++) c = T[(c ^ u[i]) & 255] ^ (c >>> 8); return ~c >>> 0; };
const u16 = n => [n & 255, (n >> 8) & 255], u32 = n => [n & 255, (n >> 8) & 255, (n >> 16) & 255, (n >>> 24) & 255];
function cat(parts) { let n = 0; parts.forEach(p => (n += p.length)); const o = new Uint8Array(n); let k = 0; parts.forEach(p => { o.set(p, k); k += p.length; }); return o; }
function zip(files) { // files: [{name, data: Uint8Array}]
  const enc = new TextEncoder(), parts = [], cd = []; let off = 0;
  for (const f of files) { const nm = enc.encode(f.name), c = crc(f.data), sz = f.data.length;
    const lh = new Uint8Array([0x50, 0x4b, 3, 4, 20, 0, 0, 8, 0, 0, 0, 0, 0x21, 0, ...u32(c), ...u32(sz), ...u32(sz), ...u16(nm.length), 0, 0]);
    cd.push(new Uint8Array([0x50, 0x4b, 1, 2, 20, 0, 20, 0, 0, 8, 0, 0, 0, 0, 0x21, 0, ...u32(c), ...u32(sz), ...u32(sz), ...u16(nm.length), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ...u32(off)]), nm);
    parts.push(lh, nm, f.data); off += lh.length + nm.length + sz; }
  const cdb = cat(cd); return cat([...parts, cdb, new Uint8Array([0x50, 0x4b, 5, 6, 0, 0, 0, 0, ...u16(files.length), ...u16(files.length), ...u32(cdb.length), ...u32(off), 0, 0])]);
}
function ico(pngs) { // [{size, bytes}] PNG-in-ICO
  const n = pngs.length, hd = new Uint8Array(6 + 16 * n), dv = new DataView(hd.buffer); dv.setUint16(2, 1, true); dv.setUint16(4, n, true); let off = hd.length;
  pngs.forEach((p, i) => { const b = 6 + i * 16; hd[b] = p.size >= 256 ? 0 : p.size; hd[b + 1] = hd[b]; dv.setUint16(b + 4, 1, true); dv.setUint16(b + 6, 32, true); dv.setUint32(b + 8, p.bytes.length, true); dv.setUint32(b + 12, off, true); off += p.bytes.length; });
  return cat([hd, ...pngs.map(p => p.bytes)]);
}
G.Zip = { zip, ico, cat }; if (typeof module !== 'undefined') module.exports = G.Zip;
})(typeof window !== 'undefined' ? window : globalThis);
