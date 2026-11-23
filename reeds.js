// Wendle's reeds: step 3, every reed gets its own soft hum.
const canvas = document.getElementById('scene');
const ctx = canvas.getContext('2d');
const slider = document.getElementById('wind');
const readout = document.getElementById('windval');
const soundBtn = document.getElementById('sound');
let w = 0, h = 0, dpr = 1;

let wind = slider.value / 100;
let shownWind = wind;
slider.addEventListener('input', () => {
  wind = slider.value / 100;
  readout.textContent = slider.value;
});

// each reed gets its own height, phase, speed and note
const reeds = [];
const COUNT = 14;
// a pentatonic scale so the hums never clash (semitone steps)
const SCALE = [0, 3, 5, 7, 10];
for (let i = 0; i < COUNT; i++) {
  const steps = SCALE[i % 5] + 12 * Math.floor(i / 5);
  reeds.push({
    height: 0.45 + Math.random() * 0.3,
    phase: Math.random() * Math.PI * 2,
    speed: 0.6 + Math.random() * 0.5,
    thick: 5 + Math.random() * 4,
    freq: 130.81 * Math.pow(2, steps / 12)
  });
}

// ---- sound ----
// Audio can only start after a tap, so it is built when the button is pressed.
let audio = null;
function buildAudio() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  const ac = new AC();
  const master = ac.createGain();
  master.gain.value = 0.6;
  master.connect(ac.destination);
  reeds.forEach((r) => {
    const osc = ac.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = r.freq;
    osc.detune.value = (Math.random() - 0.5) * 8; // tiny wobble in tuning
    const g = ac.createGain();
    g.gain.value = 0.03;
    // a very slow LFO makes each hum swell and fade by itself
    const lfo = ac.createOscillator();
    lfo.frequency.value = 0.08 + Math.random() * 0.2;
    const depth = ac.createGain();
    depth.gain.value = 0.02;
    lfo.connect(depth);
    depth.connect(g.gain);
    osc.connect(g);
    g.connect(master);
    osc.start();
    lfo.start();
  });
  return { ac, master };
}

soundBtn.addEventListener('click', () => {
  if (!audio) audio = buildAudio();
  if (!audio) { soundBtn.textContent = 'No sound here'; return; }
  if (audio.ac.state === 'running') {
    audio.ac.suspend();
    soundBtn.textContent = 'Tap to hear the hum';
    soundBtn.classList.remove('on');
  } else {
    audio.ac.resume();
    soundBtn.textContent = 'Humming (tap to hush)';
    soundBtn.classList.add('on');
  }
});

function resize() {
  dpr = window.devicePixelRatio || 1;
  w = window.innerWidth;
  h = window.innerHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resize);
resize();

let clock = 0, last = 0;

function drawReed(r, x, baseY, t) {
  // reeds fit between the title and the ground, above the controls
  const len = r.height * (baseY - 50);
  const amp = 0.04 + shownWind * 0.22;
  const sway = (Math.sin(t * r.speed + r.phase) * amp + shownWind * 0.08) * len;
  const tipX = x + sway;
  const tipY = baseY - len;
  ctx.strokeStyle = '#7fae7a';
  ctx.lineCap = 'round';
  ctx.lineWidth = r.thick;
  ctx.beginPath();
  ctx.moveTo(x, baseY);
  ctx.quadraticCurveTo(x + sway * 0.1, baseY - len * 0.55, tipX, tipY);
  ctx.stroke();
  ctx.save();
  ctx.translate(tipX, tipY);
  ctx.rotate(Math.atan2(sway, len) * 1.2);
  ctx.fillStyle = '#8a5a3c';
  ctx.beginPath();
  ctx.ellipse(0, -r.thick * 1.5, r.thick * 0.8, r.thick * 2.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function frame(ms) {
  const dt = Math.min(0.05, (ms - last) / 1000 || 0);
  last = ms;
  shownWind += (wind - shownWind) * Math.min(1, dt * 4);
  clock += dt * (1 + shownWind * 2.5);
  ctx.clearRect(0, 0, w, h);
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#223a4f');
  g.addColorStop(1, '#3b5a52');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  // ground sits high enough that the controls rest on it, not on the reeds
  const baseY = h - 150;
  for (let i = 0; i < COUNT; i++) {
    const x = w * (i + 0.5) / COUNT;
    drawReed(reeds[i], x, baseY, clock);
  }
  ctx.fillStyle = '#2a3b2f';
  ctx.fillRect(0, baseY, w, h - baseY);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
