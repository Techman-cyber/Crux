const F = [['first', 'First name'], ['last', 'Last name'], ['email', 'Email'], ['phone', 'Phone'], ['address', 'Street address'], ['city', 'City'], ['state', 'State or region'], ['zip', 'PIN or ZIP code'], ['country', 'Country'], ['company', 'Company']];
const $ = s => document.querySelector(s);
$('#g').innerHTML = F.map(([k, l]) => `<div><label for="${k}">${l}</label><input id="${k}"></div>`).join('');
chrome.storage.local.get('profile').then(r => F.forEach(([k]) => ($('#' + k).value = (r.profile || {})[k] || '')));
$('#sv').onclick = async () => { const p = {}; F.forEach(([k]) => (p[k] = $('#' + k).value.trim())); await chrome.storage.local.set({ profile: p }); $('#m').textContent = 'Saved ✔'; };
