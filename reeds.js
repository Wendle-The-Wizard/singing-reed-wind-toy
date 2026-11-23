// Wendle's reeds: step 1, just a row of reeds swaying gently.
const canvas = document.getElementById('scene');
const ctx = canvas.getContext('2d');
let w = 0, h = 0, dpr = 1;

// each reed gets its own height, lean phase and speed so they don't move in lockstep
const reeds = [];
const COUNT = 14;
for (let i = 0; i < COUNT; i++) {
  reeds.push({
    height: 0.45 + Math.random() * 0.3,
    phase: Math.random() * Math.PI * 2,
    speed: 0.6 + Math.random() * 0.5,
    thick: 5 + Math.random() * 4
  });
}

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

function drawReed(r, x, baseY, t) {
  const len = r.height * h * 0.8;
  const sway = Math.sin(t * r.speed + r.phase) * 0.12 * len; // tip offset in px
  const tipX = x + sway;
  const tipY = baseY - len;
  ctx.strokeStyle = '#7fae7a';
  ctx.lineCap = 'round';
  ctx.lineWidth = r.thick;
  ctx.beginPath();
  ctx.moveTo(x, baseY);
  ctx.quadraticCurveTo(x + sway * 0.1, baseY - len * 0.55, tipX, tipY);
  ctx.stroke();
  // a little brown seed head on top
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
  const t = ms / 1000;
  ctx.clearRect(0, 0, w, h);
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#223a4f');
  g.addColorStop(1, '#3b5a52');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const baseY = h * 0.92;
  for (let i = 0; i < COUNT; i++) {
    const x = w * (i + 0.5) / COUNT;
    drawReed(reeds[i], x, baseY, t);
  }
  // ground strip
  ctx.fillStyle = '#2a3b2f';
  ctx.fillRect(0, baseY, w, h - baseY);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
