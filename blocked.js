const site = new URLSearchParams(location.search).get('site') || 'This site'; document.getElementById('s').textContent = site;
document.getElementById('b').onclick = () => (history.length > 1 ? history.back() : window.close());
document.getElementById('o').onclick = async () => { const { crux } = await chrome.storage.local.get('crux'); crux.enabled.focus = false; await chrome.storage.local.set({ crux }); setTimeout(() => (location.href = 'https://' + site), 400); };
