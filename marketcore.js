// Market analysis engine: indicators, levels, scorecard, risk sizing and backtests. Educational only.
(function (G) {
const sum = a => a.reduce((s, x) => s + x, 0), mean = a => sum(a) / a.length;
const sma = (a, n) => { const o = Array(a.length).fill(null); let s = 0; for (let i = 0; i < a.length; i++) { s += a[i]; if (i >= n) s -= a[i - n]; if (i >= n - 1) o[i] = s / n; } return o; };
const ema = (a, span) => { const k = 2 / (span + 1), o = []; a.forEach((x, i) => o.push(i ? k * x + (1 - k) * o[i - 1] : x)); return o; };
function rsi(c, n = 14) { const k = 1 / n, o = Array(c.length).fill(null); let up = 0, dn = 0; for (let i = 1; i < c.length; i++) { const d = c[i] - c[i - 1], g = d > 0 ? d : 0, l = d < 0 ? -d : 0; if (i === 1) { up = g; dn = l; } else { up = k * g + (1 - k) * up; dn = k * l + (1 - k) * dn; } if (i >= n) o[i] = up + dn === 0 ? 50 : 100 * up / (up + dn); } return o; }
function macd(c, f = 12, s = 26, g = 9) { const ef = ema(c, f), es = ema(c, s), line = ef.map((x, i) => x - es[i]), sig = ema(line, g); return { line, sig, hist: line.map((x, i) => x - sig[i]) }; }
function bollinger(c, n = 20, m = 2) { const mid = sma(c, n); const up = [], lo = []; for (let i = 0; i < c.length; i++) { if (mid[i] == null) { up.push(null); lo.push(null); continue; } const w = c.slice(i - n + 1, i + 1), sd = Math.sqrt(mean(w.map(x => (x - mid[i]) ** 2))); up.push(mid[i] + m * sd); lo.push(mid[i] - m * sd); } return { mid, up, lo }; }
function atr(h, l, c, n = 14) { const tr = c.map((_, i) => i ? Math.max(h[i] - l[i], Math.abs(h[i] - c[i - 1]), Math.abs(l[i] - c[i - 1])) : h[i] - l[i]), o = Array(c.length).fill(null); if (c.length < n) return o; o[n - 1] = mean(tr.slice(0, n)); for (let i = n; i < c.length; i++) o[i] = (o[i - 1] * (n - 1) + tr[i]) / n; return o; }
const last = a => { for (let i = a.length - 1; i >= 0; i--) if (a[i] != null) return a[i]; return null; };
function levels(h, l, c, look = 160, w = 5) { // swing highs/lows clustered into support/resistance
  const n = c.length, s = Math.max(w, n - look), pts = []; for (let i = s; i < n - w; i++) { const hh = Math.max(...h.slice(i - w, i + w + 1)), ll = Math.min(...l.slice(i - w, i + w + 1)); if (h[i] === hh) pts.push(h[i]); if (l[i] === ll) pts.push(l[i]); }
  pts.sort((a, b) => a - b); const cl = []; for (const p of pts) { const t = cl[cl.length - 1]; if (t && Math.abs(p - t.v) / t.v < .015) { t.v = (t.v * t.n + p) / (t.n + 1); t.n++; } else cl.push({ v: p, n: 1 }); }
  const px = c[n - 1], sup = cl.filter(x => x.v < px * .995).sort((a, b) => b.v - a.v), res = cl.filter(x => x.v > px * 1.005).sort((a, b) => a.v - b.v);
  return { all: cl, support: sup.slice(0, 3), resistance: res.slice(0, 3) };
}
const pct = (a, b) => (a / b - 1) * 100;
function stats(c) {
  const n = c.length, ret = k => (n > k ? pct(c[n - 1], c[n - 1 - k]) : null), lr = c.slice(1).map((x, i) => Math.log(x / c[i])), sd = Math.sqrt(mean(lr.map(x => (x - mean(lr)) ** 2)));
  let peak = c[0], mdd = 0; c.forEach(x => { peak = Math.max(peak, x); mdd = Math.min(mdd, x / peak - 1); }); const w = c.slice(-252), hi = Math.max(...w), lo = Math.min(...w);
  return { ret1m: ret(21), ret3m: ret(63), ret6m: ret(126), ret1y: ret(252), vol: sd * Math.sqrt(252) * 100, maxDD: mdd * 100, curDD: (c[n - 1] / Math.max(...c) - 1) * 100, hi52: hi, lo52: lo, pos52: hi === lo ? .5 : (c[n - 1] - lo) / (hi - lo) };
}
function analyze(d) {
  const c = d.map(x => x.c), h = d.map(x => x.h ?? x.c), l = d.map(x => x.l ?? x.c), n = c.length; if (n < 60) return { error: 'Need at least 60 days of prices for a useful read.' };
  const s20 = sma(c, 20), s50 = sma(c, 50), s200 = sma(c, 200), R = rsi(c), M = macd(c), B = bollinger(c), A = atr(h, l, c), St = stats(c), Lv = levels(h, l, c), px = c[n - 1];
  const S = [], add = (name, v, w, why) => S.push({ name, v, w, why }); const a20 = last(s20), a50 = last(s50), a200 = last(s200), r = last(R), mh = M.hist[n - 1], bb = B.up[n - 1] != null ? (px - B.lo[n - 1]) / (B.up[n - 1] - B.lo[n - 1]) : null, atrv = last(A);
  if (a200) add('Price vs 200-day average', px > a200 ? 1 : -1, 2, px > a200 ? `Price is ${pct(px, a200).toFixed(1)}% above its long-term average, the usual sign of an uptrend.` : `Price is ${Math.abs(pct(px, a200)).toFixed(1)}% below its long-term average, the usual sign of a downtrend.`);
  if (a50 && a200) add('50-day vs 200-day average', a50 > a200 ? 1 : -1, 1.5, a50 > a200 ? 'Medium-term average is above the long-term one ("golden cross" zone).' : 'Medium-term average is below the long-term one ("death cross" zone).');
  if (a50) add('Price vs 50-day average', px > a50 ? 1 : -1, 1, px > a50 ? 'Trading above its medium-term average.' : 'Trading below its medium-term average.');
  if (a20) add('Price vs 20-day average', px > a20 ? 1 : -1, 1, px > a20 ? 'Short-term momentum is up.' : 'Short-term momentum is down.');
  add('MACD', M.line[n - 1] > M.sig[n - 1] ? 1 : -1, 1, M.line[n - 1] > M.sig[n - 1] ? `MACD is above its signal line${mh > M.hist[n - 2] ? ' and strengthening' : ' but fading'}.` : `MACD is below its signal line${mh < M.hist[n - 2] ? ' and weakening' : ' but improving'}.`);
  if (r != null) add('RSI (14)', r > 55 ? 1 : r < 45 ? -1 : 0, 1, `RSI is ${r.toFixed(0)}. ${r > 70 ? 'That is "overbought": strong, but stretched, so pullbacks are common.' : r < 30 ? 'That is "oversold": weak, but stretched, so bounces are common.' : r > 55 ? 'Momentum is positive.' : r < 45 ? 'Momentum is negative.' : 'Momentum is neutral.'}`);
  if (St.ret3m != null) add('3-month momentum', St.ret3m > 0 ? 1 : -1, 1, `Price is ${St.ret3m >= 0 ? 'up' : 'down'} ${Math.abs(St.ret3m).toFixed(1)}% over about 3 months.`);
  add('Position in 52-week range', St.pos52 > .7 ? 1 : St.pos52 < .3 ? -1 : 0, .5, `Sitting at ${(St.pos52 * 100).toFixed(0)}% of its 52-week range (0% = yearly low, 100% = yearly high).`);
  const tot = sum(S.map(x => x.w)), score = Math.round(sum(S.map(x => x.v * x.w)) / tot * 100), dir = Math.sign(score), agree = dir ? S.filter(x => x.v === dir).length / S.length : S.filter(x => x.v === 0).length / S.length;
  const label = score >= 60 ? 'Strong bullish lean' : score >= 25 ? 'Mild bullish lean' : score > -25 ? 'Mixed or sideways' : score > -60 ? 'Mild bearish lean' : 'Strong bearish lean';
  const warn = []; if (r > 70) warn.push('RSI is above 70 (overbought). Chasing here carries more risk of a pullback.'); if (r < 30) warn.push('RSI is below 30 (oversold). Falling knives can keep falling, so bounces are never certain.'); if (bb > 1) warn.push('Price is above its upper Bollinger band, a stretched move.'); if (bb != null && bb < 0) warn.push('Price is below its lower Bollinger band, a stretched move down.'); if (St.vol > 45) warn.push(`Volatility is high (${St.vol.toFixed(0)}% a year). Expect big swings, so keep position sizes smaller.`); if (St.curDD < -25) warn.push(`Price is ${Math.abs(St.curDD).toFixed(0)}% below its all-time high in this data. Recoveries can take years, or never happen.`);
  return { px, n, s20: a20, s50: a50, s200: a200, rsi: r, macdHist: mh, bbPct: bb, atr: atrv, atrPct: atrv ? atrv / px * 100 : null, stats: St, levels: Lv, signals: S, score, label, agree, warn, series: { c, s50, s200, up: B.up, lo: B.lo } };
}
function positionSize({ capital, riskPct, entry, stop, target }) {
  const risk = capital * riskPct / 100, per = Math.abs(entry - stop); if (!per || !isFinite(per)) return null; const sh = Math.floor(risk / per), val = sh * entry;
  return { shares: sh, value: val, pctCapital: val / capital * 100, maxLoss: sh * per, rr: target != null ? Math.abs(target - entry) / per : null, reward: target != null ? sh * Math.abs(target - entry) : null, needWin: target != null ? per / (per + Math.abs(target - entry)) * 100 : null };
}
// ---- backtests: signal at close t is acted on at the close of t+1 (one-day lag, costs per switch) ----
function backtest(c, sig, cost = .1, from = 0, hold = false) {
  const n = c.length, pos = Array(n).fill(0); for (let t = from + 1; t < n; t++) pos[t] = hold ? 1 : (t >= 2 ? sig[t - 2] || 0 : 0);
  const eq = [100], trades = []; let cur = null;
  for (let t = from + 1; t < n; t++) { const r = c[t] / c[t - 1] - 1, prev = eq[eq.length - 1]; let e = prev * (1 + (pos[t] ? r : 0)); if (!hold && pos[t] !== pos[t - 1]) { e *= 1 - cost / 100; if (pos[t]) cur = { base: prev }; else if (cur) { trades.push(e / cur.base - 1); cur = null; } } eq.push(e); }
  if (cur) trades.push(eq[eq.length - 1] / cur.base - 1);
  let peak = 100, mdd = 0; eq.forEach(x => { peak = Math.max(peak, x); mdd = Math.min(mdd, x / peak - 1); }); const days = n - 1 - from, yrs = days / 252, tot = eq[eq.length - 1] / 100 - 1;
  return { eq, total: tot * 100, cagr: yrs > 0 ? ((1 + tot) ** (1 / yrs) - 1) * 100 : 0, maxDD: mdd * 100, trades: trades.length, win: trades.length ? trades.filter(x => x > 0).length / trades.length * 100 : null, inMarket: hold ? 100 : pos.slice(from + 1).filter(Boolean).length / Math.max(1, days) * 100 };
}
function strategies(c) {
  const s50 = sma(c, 50), s200 = sma(c, 200), R = rsi(c), M = macd(c), n = c.length, ones = Array(n).fill(1);
  let on = 0; const rs = R.map(x => { if (x == null) return 0; if (x < 30) on = 1; else if (x > 55) on = 0; return on; });
  return { 'Buy and hold': ones, 'Golden cross (50 over 200-day)': s200.map((x, i) => (x != null && s50[i] > x ? 1 : 0)), 'Above 200-day average': s200.map((x, i) => (x != null && c[i] > x ? 1 : 0)), 'MACD crossover': M.line.map((x, i) => (i > 33 && x > M.sig[i] ? 1 : 0)), 'RSI dip buying (buy under 30, sell over 55)': rs };
}
function runBacktests(c, cost) { const S = strategies(c), o = {}, from = c.length >= 300 ? 200 : 50; for (const k in S) o[k] = backtest(c, S[k], cost, from, k === 'Buy and hold'); o.__from = from; return o; }
function parseCSV(t) {
  const rows = t.trim().split(/\r?\n/).map(l => l.split(/[,\t;]/).map(x => x.trim().replace(/^"|"$/g, ''))); if (rows.length < 3) return [];
  const hd = rows[0].map(x => x.toLowerCase()), ix = re => hd.findIndex(h => re.test(h)), id = ix(/date|time/), ic = ix(/^close|adj/), io = ix(/open/), ih = ix(/high/), il = ix(/low/), iv = ix(/vol/), num = x => parseFloat(String(x).replace(/,/g, '')), out = [];
  const hasHead = hd.some(h => /[a-z]/.test(h)); for (const r of hasHead ? rows.slice(1) : rows) { const c = num(r[hasHead ? (ic >= 0 ? ic : 1) : 1]); if (!isFinite(c)) continue; out.push({ t: r[hasHead ? (id >= 0 ? id : 0) : 0], o: io >= 0 ? num(r[io]) : c, h: ih >= 0 ? num(r[ih]) : c, l: il >= 0 ? num(r[il]) : c, c, v: iv >= 0 ? num(r[iv]) : 0 }); }
  const ts = out.map(r => Date.parse(r.t)); if (ts.every(x => !isNaN(x))) out.sort((x, y) => Date.parse(x.t) - Date.parse(y.t)); else if (out.length > 1 && String(out[0].t) > String(out[out.length - 1].t)) out.reverse(); return out;
}
G.Market = { sma, ema, rsi, macd, bollinger, atr, levels, stats, analyze, positionSize, backtest, strategies, runBacktests, parseCSV }; if (typeof module !== 'undefined') module.exports = G.Market;
})(typeof window !== 'undefined' ? window : globalThis);
