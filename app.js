let ctx, analyser;
let bassEQ, midEQ, trebleEQ, boost, limiter;
let is3D = false;

async function start() {
  ctx = new AudioContext();

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  let source = ctx.createMediaStreamSource(stream);

  // 🎧 3D System
  const splitter = ctx.createChannelSplitter(2);
  const merger = ctx.createChannelMerger(2);

  const delayL = ctx.createDelay();
  const delayR = ctx.createDelay();

  delayL.delayTime.value = 0.015;
  delayR.delayTime.value = 0.025;

  const gainL = ctx.createGain();
  const gainR = ctx.createGain();

  gainL.gain.value = 1.2;
  gainR.gain.value = 1.2;

  source.connect(splitter);
  splitter.connect(delayL, 0);
  splitter.connect(delayR, 1);

  delayL.connect(gainL);
  delayR.connect(gainR);

  gainL.connect(merger, 0, 0);
  gainR.connect(merger, 0, 1);

  // 🎚️ EQ
  bassEQ = ctx.createBiquadFilter();
  bassEQ.type = "lowshelf";
  bassEQ.frequency.value = 90;

  midEQ = ctx.createBiquadFilter();
  midEQ.type = "peaking";
  midEQ.frequency.value = 900;

  trebleEQ = ctx.createBiquadFilter();
  trebleEQ.type = "highshelf";
  trebleEQ.frequency.value = 6000;

  // 💣 Boost
  boost = ctx.createBiquadFilter();
  boost.type = "lowshelf";
  boost.frequency.value = 70;

  // ⚠️ Limiter
  limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -8;
  limiter.ratio.value = 15;

  analyser = ctx.createAnalyser();
  analyser.fftSize = 256;

  merger
    .connect(bassEQ)
    .connect(midEQ)
    .connect(trebleEQ)
    .connect(boost)
    .connect(limiter)
    .connect(analyser)
    .connect(ctx.destination);

  draw();
}

// 🎛️ Preset
function presetEDM() {
  bassEQ.gain.value = 6;
  midEQ.gain.value = -2;
  trebleEQ.gain.value = 5;
  boost.gain.value = 10;
}

function presetBass() {
  bassEQ.gain.value = 8;
  midEQ.gain.value = -4;
  trebleEQ.gain.value = 3;
  boost.gain.value = 15;
}

// 🎧 Toggle 3D (เปิด/ปิด effect)
function toggle3D() {
  is3D = !is3D;
  alert("3D Mode: " + (is3D ? "ON" : "OFF"));
}

// 📊 Spectrum
function draw() {
  requestAnimationFrame(draw);

  const canvas = document.getElementById("visualizer");
  const ctx2 = canvas.getContext("2d");

  const data = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(data);

  ctx2.fillStyle = "#000";
  ctx2.fillRect(0, 0, canvas.width, canvas.height);

  let barWidth = canvas.width / data.length;

  for (let i = 0; i < data.length; i++) {
    let h = data[i];
    ctx2.fillStyle = "#00ffc3";
    ctx2.shadowBlur = 15;
    ctx2.fillRect(i * barWidth, canvas.height - h, barWidth, h);
    const subBass = ctx.createOscillator();
const subGain = ctx.createGain();

subBass.type = "sine";
subBass.frequency.value = 50; // sub bass

subGain.gain.value = 0.3;

subBass.connect(subGain).connect(bassEQ);
subBass.start();
    
  }
}
