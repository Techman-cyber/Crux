const $ = s => document.querySelector(s); let rec, chunks = [], streams = [], acc = 0, since = 0, timer;
const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const el = () => (acc + (since ? Date.now() - since : 0)) / 1000;
$('#go').onclick = async () => {
  $('#er').textContent = '';
  try {
    const [w, bps] = $('#q').value.split(',').map(Number);
    const disp = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: +$('#fps').value, width: { ideal: w } }, audio: $('#sys').checked });
    streams = [disp]; let audio = disp.getAudioTracks();
    if ($('#mic').checked) {
      const mic = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }); streams.push(mic);
      if (audio.length) { const ctx = new AudioContext(), dest = ctx.createMediaStreamDestination(); [audio[0], mic.getAudioTracks()[0]].forEach(t => ctx.createMediaStreamSource(new MediaStream([t])).connect(dest)); audio = dest.stream.getAudioTracks(); } else audio = mic.getAudioTracks();
    }
    const stream = new MediaStream([...disp.getVideoTracks(), ...audio]);
    const mime = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'].find(m => MediaRecorder.isTypeSupported(m));
    $('#setup').hidden = true; $('#live').hidden = false; $('#cd').hidden = false;
    for (let n = 3; n > 0; n--) { $('#cd').textContent = n; await new Promise(r => setTimeout(r, 900)); }
    $('#cd').hidden = true;
    chunks = []; acc = 0; rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: bps });
    rec.ondataavailable = e => e.data.size && chunks.push(e.data); rec.onstop = finish;
    disp.getVideoTracks()[0].onended = () => rec.state !== 'inactive' && rec.stop();
    rec.start(1000); since = Date.now(); $('#live').classList.add('rec'); timer = setInterval(() => ($('#tm').textContent = fmt(el())), 250);
  } catch (e) { $('#setup').hidden = false; $('#live').hidden = true; $('#er').textContent = e.name === 'NotAllowedError' ? 'Permission was cancelled. Press the button and pick something to record.' : 'Couldn’t start: ' + e.message; }
};
$('#pa').onclick = () => { if (rec.state === 'recording') { rec.pause(); acc += Date.now() - since; since = 0; $('#pa').textContent = 'Resume'; } else { rec.resume(); since = Date.now(); $('#pa').textContent = 'Pause'; } };
$('#st').onclick = () => rec && rec.state !== 'inactive' && rec.stop();
function finish() {
  clearInterval(timer); streams.forEach(s => s.getTracks().forEach(t => t.stop()));
  const url = URL.createObjectURL(new Blob(chunks, { type: 'video/webm' }));
  $('#live').hidden = true; $('#done').hidden = false; $('#pv').src = url; $('#dl').href = url; $('#dl').download = `crux-recording-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.webm`;
}
$('#again').onclick = () => { $('#done').hidden = true; $('#setup').hidden = false; $('#live').classList.remove('rec'); $('#pa').textContent = 'Pause'; $('#tm').textContent = '00:00'; };
