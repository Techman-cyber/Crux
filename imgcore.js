// Pure image algorithms (no DOM) so they can be tested. Works on RGBA Uint8ClampedArray.
(function (G) {
const cl = (v, a, b) => v < a ? a : v > b ? b : v;
function blurPlane(a, W, H, r, stride = 1, off = 0) {
  const t = new Float32Array(W * H), o = new Float32Array(W * H), n = 2 * r + 1;
  for (let y = 0; y < H; y++) { const row = y * W; let s = 0; for (let x = -r; x <= r; x++) s += a[(row + cl(x, 0, W - 1)) * stride + off]; for (let x = 0; x < W; x++) { t[row + x] = s / n; s += a[(row + cl(x + r + 1, 0, W - 1)) * stride + off] - a[(row + cl(x - r, 0, W - 1)) * stride + off]; } }
  for (let x = 0; x < W; x++) { let s = 0; for (let y = -r; y <= r; y++) s += t[cl(y, 0, H - 1) * W + x]; for (let y = 0; y < H; y++) { o[y * W + x] = s / n; s += t[cl(y + r + 1, 0, H - 1) * W + x] - t[cl(y - r, 0, H - 1) * W + x]; } }
  return o;
}
function blurRGBA(d, W, H, r, passes = 2) { const o = new Uint8ClampedArray(d.length); for (let c = 0; c < 4; c++) { let p = blurPlane(d, W, H, r, 4, c); for (let k = 1; k < passes; k++) p = blurPlane(p, W, H, r); for (let i = 0; i < W * H; i++) o[i * 4 + c] = p[i]; } return o; }
function refColors(d, W, H) {
  const m = new Map(), add = (x, y) => { const i = (y * W + x) * 4; if (d[i + 3] < 10) return; const k = ((d[i] >> 4) << 8) | ((d[i + 1] >> 4) << 4) | (d[i + 2] >> 4), e = m.get(k) || [0, 0, 0, 0]; e[0]++; e[1] += d[i]; e[2] += d[i + 1]; e[3] += d[i + 2]; m.set(k, e); };
  for (let x = 0; x < W; x++) { add(x, 0); add(x, H - 1); } for (let y = 0; y < H; y++) { add(0, y); add(W - 1, y); }
  const tot = [...m.values()].reduce((a, e) => a + e[0], 0);
  return [...m.values()].filter(e => e[0] >= tot * .08).sort((a, b) => b[0] - a[0]).slice(0, 3).map(e => [e[1] / e[0], e[2] / e[0], e[3] / e[0]]);
}
// returns Uint8Array: 1 = keep, 0 = remove
function bgMask(d, W, H, { refs, tol = 30, seeds, contig = true }) {
  const t2 = (tol * 2.2) ** 2, keep = new Uint8Array(W * H).fill(1);
  const near = i => { const p = i * 4; if (d[p + 3] < 8) return true; for (const r of refs) { const a = d[p] - r[0], b = d[p + 1] - r[1], c = d[p + 2] - r[2]; if (a * a + b * b + c * c <= t2) return true; } return false; };
  if (!contig) { for (let i = 0; i < W * H; i++) if (near(i)) keep[i] = 0; return keep; }
  const q = new Int32Array(W * H); let h = 0, t = 0;
  if (!seeds) { seeds = []; for (let x = 0; x < W; x++) seeds.push(x, (H - 1) * W + x); for (let y = 0; y < H; y++) seeds.push(y * W, y * W + W - 1); }
  for (const s of seeds) if (keep[s] && near(s)) { keep[s] = 0; q[t++] = s; }
  while (h < t) { const i = q[h++], x = i % W, y = (i / W) | 0; if (x > 0 && keep[i - 1] && near(i - 1)) { keep[i - 1] = 0; q[t++] = i - 1; } if (x < W - 1 && keep[i + 1] && near(i + 1)) { keep[i + 1] = 0; q[t++] = i + 1; } if (y > 0 && keep[i - W] && near(i - W)) { keep[i - W] = 0; q[t++] = i - W; } if (y < H - 1 && keep[i + W] && near(i + W)) { keep[i + W] = 0; q[t++] = i + W; } }
  return keep;
}
function erode(keep, W, H, n) { for (let k = 0; k < n; k++) { const c = keep.slice(); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x; if (keep[i] && ((x > 0 && !keep[i - 1]) || (x < W - 1 && !keep[i + 1]) || (y > 0 && !keep[i - W]) || (y < H - 1 && !keep[i + W]))) c[i] = 0; } keep.set(c); } }
function applyKeep(d, keep, W, H, feather) { const a = new Float32Array(W * H); for (let i = 0; i < a.length; i++) a[i] = keep[i] * 255; const s = feather > 0 ? blurPlane(a, W, H, feather) : a; for (let i = 0; i < a.length; i++) d[i * 4 + 3] = Math.min(d[i * 4 + 3], Math.round(s[i])); }
// mask: 1 = hole to fill. method: 'smooth' | 'texture'
async function inpaint(d, W, H, mask, opt = {}) {
  const N = W * H, hole = Uint8Array.from(mask), known = new Uint8Array(N); let holes = 0;
  for (let i = 0; i < N; i++) { known[i] = hole[i] ? 0 : 1; holes += hole[i]; } if (!holes || holes === N) return;
  const lvl = new Int32Array(N).fill(-1); let cur = [];
  const nb = i => { const x = i % W, r = []; if (x > 0) r.push(i - 1); if (x < W - 1) r.push(i + 1); if (i >= W) r.push(i - W); if (i < N - W) r.push(i + W); return r; };
  for (let i = 0; i < N; i++) if (hole[i] && nb(i).some(n => known[n])) { lvl[i] = 0; cur.push(i); }
  const layers = []; while (cur.length) { layers.push(cur); const nx = []; for (const i of cur) for (const n of nb(i)) if (hole[n] && lvl[n] < 0) { lvl[n] = layers.length; nx.push(n); } cur = nx; }
  const tick = async (n, tot) => { if (n % 3000 === 0) { opt.onProgress && opt.onProgress(n / tot); await new Promise(r => setTimeout(r, 0)); } };
  let done = 0;
  if (opt.method !== 'texture') {
    for (const L of layers) { const out = []; for (const i of L) { const x = i % W, y = (i / W) | 0; let r = 0, g = 0, b = 0, w = 0; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue; const j = yy * W + xx; if (!known[j]) continue; const wt = 1 / (1 + dx * dx + dy * dy); r += d[j * 4] * wt; g += d[j * 4 + 1] * wt; b += d[j * 4 + 2] * wt; w += wt; } out.push(w ? [r / w, g / w, b / w] : [128, 128, 128]); } L.forEach((i, k) => { d[i * 4] = out[k][0]; d[i * 4 + 1] = out[k][1]; d[i * 4 + 2] = out[k][2]; d[i * 4 + 3] = 255; known[i] = 1; }); await tick(done += L.length, holes); }
    const idx = []; for (let i = 0; i < N; i++) if (hole[i]) idx.push(i);
    for (let it = 0; it < 14; it++) for (const i of idx) { const x = i % W, y = (i / W) | 0; let r = 0, g = 0, b = 0, c = 0; for (const j of [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, y > 0 ? i - W : -1, y < H - 1 ? i + W : -1]) if (j >= 0) { r += d[j * 4]; g += d[j * 4 + 1]; b += d[j * 4 + 2]; c++; } d[i * 4] = r / c; d[i * 4 + 1] = g / c; d[i * 4 + 2] = b / c; }
    return;
  }
  // texture: exemplar-based, layer by layer, with propagation of neighbouring matches
  let xs0 = W, xs1 = 0, ys0 = H, ys1 = 0; for (let i = 0; i < N; i++) if (hole[i]) { const x = i % W, y = (i / W) | 0; xs0 = Math.min(xs0, x); xs1 = Math.max(xs1, x); ys0 = Math.min(ys0, y); ys1 = Math.max(ys1, y); }
  const S = Math.max(40, Math.round(Math.max(xs1 - xs0, ys1 - ys0) * 1.2)), R = 2, src = new Int32Array(N).fill(-1); let seed = 12345; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const score = (px, py, sx, sy, best) => { let s = 0, c = 0; for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) { const tx = px + dx, ty = py + dy, ux = sx + dx, uy = sy + dy; if (tx < 0 || ty < 0 || tx >= W || ty >= H || ux < 0 || uy < 0 || ux >= W || uy >= H) continue; const t = ty * W + tx, u = uy * W + ux; if (!known[t] || hole[u]) continue; const a = d[t * 4] - d[u * 4], b = d[t * 4 + 1] - d[u * 4 + 1], e = d[t * 4 + 2] - d[u * 4 + 2]; s += a * a + b * b + e * e; c++; } return c < 3 ? Infinity : s / c; };
  for (const L of layers) {
    const pick = [];
    for (const i of L) {
      const px = i % W, py = (i / W) | 0, cand = [];
      for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { const nx = px + ox, ny = py + oy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const s = src[ny * W + nx]; if (s >= 0) cand.push([(s % W) - ox, ((s / W) | 0) - oy]); }
      for (let k = 0; k < 44; k++) cand.push([cl(Math.round(px + (rnd() * 2 - 1) * S), 0, W - 1), cl(Math.round(py + (rnd() * 2 - 1) * S), 0, H - 1)]);
      let best = Infinity, bs = -1; for (const [sx, sy] of cand) { if (sx < 0 || sy < 0 || sx >= W || sy >= H || hole[sy * W + sx]) continue; const sc = score(px, py, sx, sy); if (sc < best) { best = sc; bs = sy * W + sx; } }
      pick.push(bs);
    }
    L.forEach((i, k) => { const s = pick[k]; if (s >= 0) { d[i * 4] = d[s * 4]; d[i * 4 + 1] = d[s * 4 + 1]; d[i * 4 + 2] = d[s * 4 + 2]; src[i] = s; } d[i * 4 + 3] = 255; known[i] = 1; });
    await tick(done += L.length, holes);
  }
}
function pixelate(d, W, H, mask, bs) { for (let by = 0; by < H; by += bs) for (let bx = 0; bx < W; bx += bs) { let any = false, r = 0, g = 0, b = 0, c = 0; const ye = Math.min(H, by + bs), xe = Math.min(W, bx + bs); for (let y = by; y < ye; y++) for (let x = bx; x < xe; x++) { const i = y * W + x; if (mask[i]) any = true; r += d[i * 4]; g += d[i * 4 + 1]; b += d[i * 4 + 2]; c++; } if (!any) continue; for (let y = by; y < ye; y++) for (let x = bx; x < xe; x++) { const i = y * W + x; if (mask[i]) { d[i * 4] = r / c; d[i * 4 + 1] = g / c; d[i * 4 + 2] = b / c; } } } }
function blurMasked(d, W, H, mask, r) { const b = blurRGBA(d, W, H, r, 3); for (let i = 0; i < W * H; i++) if (mask[i]) { d[i * 4] = b[i * 4]; d[i * 4 + 1] = b[i * 4 + 1]; d[i * 4 + 2] = b[i * 4 + 2]; } }
function exifParse(buf) {
  try {
    const v = new DataView(buf); if (v.getUint16(0) !== 0xFFD8) return null; let o = 2;
    while (o < v.byteLength - 4) { const m = v.getUint16(o); if (m === 0xFFE1 && v.getUint32(o + 4) === 0x45786966) { return tiff(v, o + 10); } if ((m & 0xFF00) !== 0xFF00) break; o += 2 + v.getUint16(o + 2); }
  } catch { } return null;
  function tiff(v, b) {
    const le = v.getUint16(b) === 0x4949, u16 = o => v.getUint16(b + o, le), u32 = o => v.getUint32(b + o, le), SZ = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1 };
    const str = (o, n) => { let s = ''; for (let i = 0; i < n; i++) { const c = v.getUint8(b + o + i); if (!c) break; s += String.fromCharCode(c); } return s.trim(); };
    const ifd = off => { const n = u16(off), e = {}; for (let i = 0; i < n; i++) { const p = off + 2 + i * 12, tag = u16(p), type = u16(p + 2), cnt = u32(p + 4), size = (SZ[type] || 1) * cnt, vo = size > 4 ? u32(p + 8) : p + 8; e[tag] = { type, cnt, vo }; } return e; };
    const rat = (vo, n) => Array.from({ length: n }, (_, i) => u32(vo + i * 8) / (u32(vo + i * 8 + 4) || 1));
    const I0 = ifd(u32(4)), out = {}; const s = (e, t) => e[t] ? str(e[t].vo, e[t].cnt) : '';
    out.make = s(I0, 0x010F); out.model = s(I0, 0x0110); out.software = s(I0, 0x0131); out.date = s(I0, 0x0132);
    if (I0[0x8769]) { const E = ifd(u32(I0[0x8769].vo)); out.date = s(E, 0x9003) || out.date; }
    if (I0[0x8825]) { const Gp = ifd(u32(I0[0x8825].vo)); if (Gp[2] && Gp[4]) { const la = rat(Gp[2].vo, 3), lo = rat(Gp[4].vo, 3); let lat = la[0] + la[1] / 60 + la[2] / 3600, lon = lo[0] + lo[1] / 60 + lo[2] / 3600; if (s(Gp, 1) === 'S') lat = -lat; if (s(Gp, 3) === 'W') lon = -lon; out.gps = { lat, lon }; } }
    return out;
  }
}
function dominant(d, W, H, n = 8) {
  const m = new Map(), st = Math.max(1, Math.floor(Math.sqrt(W * H / 40000)));
  for (let y = 0; y < H; y += st) for (let x = 0; x < W; x += st) { const i = (y * W + x) * 4; if (d[i + 3] < 128) continue; const k = ((d[i] >> 4) << 8) | ((d[i + 1] >> 4) << 4) | (d[i + 2] >> 4), e = m.get(k) || [0, 0, 0, 0]; e[0]++; e[1] += d[i]; e[2] += d[i + 1]; e[3] += d[i + 2]; m.set(k, e); }
  const all = [...m.values()].sort((a, b) => b[0] - a[0]).map(e => [e[1] / e[0], e[2] / e[0], e[3] / e[0], e[0]]), out = [];
  for (const c of all) { if (out.every(o => (o[0] - c[0]) ** 2 + (o[1] - c[1]) ** 2 + (o[2] - c[2]) ** 2 > 40 * 40)) out.push(c); if (out.length >= n) break; }
  const tot = all.reduce((a, c) => a + c[3], 0) || 1; return out.map(c => ({ hex: '#' + c.slice(0, 3).map(v => Math.round(v).toString(16).padStart(2, '0')).join(''), pct: Math.round(c[3] / tot * 100) }));
}
G.ImgCore = { blurPlane, blurRGBA, refColors, bgMask, erode, applyKeep, inpaint, pixelate, blurMasked, exifParse, dominant };
if (typeof module !== 'undefined') module.exports = G.ImgCore;
})(typeof window !== 'undefined' ? window : globalThis);
