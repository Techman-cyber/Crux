const $ = s => document.querySelector(s); let hist = []; try { hist = JSON.parse(localStorage.getItem('h') || '[]'); } catch {}
const hsl = h => { let [r, g, b] = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255); const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; let H = 0, S = 0, L = (mx + mn) / 2; if (d) { S = d / (1 - Math.abs(2 * L - 1)); H = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; H = Math.round((H * 60 + 360) % 360); } return `hsl(${H}, ${Math.round(S * 100)}%, ${Math.round(L * 100)}%)`; };
function show(h) {
  $('#sw').style.background = h; const rgb = `rgb(${[1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).join(', ')})`;
  $('#vals').innerHTML = [h.toUpperCase(), rgb, hsl(h)].map(v => `<div class="v"><code>${v}</code><button data-c="${v}">Copy</button></div>`).join('');
  $('#h').innerHTML = hist.map(c => `<i style="background:${c}" data-h="${c}" title="${c}"></i>`).join('');
}
document.addEventListener('click', async e => { if (e.target.dataset.c) { await navigator.clipboard.writeText(e.target.dataset.c); e.target.textContent = 'Copied ✔'; } if (e.target.dataset.h) show(e.target.dataset.h); });
$('#p').onclick = async () => {
  if (!window.EyeDropper) return ($('#m').textContent = 'This browser doesn’t support the eyedropper. Update Chrome.');
  try { const { sRGBHex } = await new EyeDropper().open(); hist = [sRGBHex, ...hist.filter(c => c !== sRGBHex)].slice(0, 14); localStorage.setItem('h', JSON.stringify(hist)); show(sRGBHex); await navigator.clipboard.writeText(sRGBHex.toUpperCase()); $('#m').textContent = 'HEX copied.'; } catch {}
};
show(hist[0] || '#8b3dff');
