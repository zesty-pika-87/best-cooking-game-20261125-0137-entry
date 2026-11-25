// Suara tersintesis WebAudio — tanpa file audio sama sekali. Semua bunyi
// dibuat dari osilator dan noise saat dimainkan; sebelum ada gestur pemain,
// audio tetap diam (dan di mode screenshot tidak pernah dibuat).
export function createAudio() {
  let ctx = null;
  let master = null;
  let sizzleNodes = null;

  function ensure() {
    if (ctx) return true;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.16;
      master.connect(ctx.destination);
      return true;
    } catch {
      return false;
    }
  }

  function tone(freq, dur, type, vol, when, slideTo) {
    if (!ctx) return;
    const t0 = ctx.currentTime + (when || 0);
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol || 0.5, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g);
    g.connect(master);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  }

  function noiseBurst(dur, vol, freq) {
    if (!ctx) return;
    const t0 = ctx.currentTime;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = freq || 1800;
    const g = ctx.createGain();
    g.gain.value = vol || 0.4;
    src.connect(f);
    f.connect(g);
    g.connect(master);
    src.start(t0);
  }

  return {
    unlock() {
      if (ensure() && ctx.state === 'suspended') ctx.resume().catch(() => {});
    },
    chop() {
      if (!ensure()) return;
      noiseBurst(0.07, 0.7, 900);
      tone(180, 0.08, 'square', 0.25);
    },
    take() {
      if (!ensure()) return;
      tone(520, 0.09, 'sine', 0.4, 0, 760);
    },
    sizzleStart() {
      if (!ensure() || sizzleNodes) return;
      const len = ctx.sampleRate;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i += 1) data[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const f = ctx.createBiquadFilter();
      f.type = 'highpass';
      f.frequency.value = 3200;
      const g = ctx.createGain();
      g.gain.value = 0.05;
      src.connect(f);
      f.connect(g);
      g.connect(master);
      src.start();
      sizzleNodes = { src, g };
      setTimeout(() => this.sizzleStop(), 3600);
    },
    sizzleStop() {
      if (!sizzleNodes || !ctx) return;
      try {
        sizzleNodes.g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
        sizzleNodes.src.stop(ctx.currentTime + 0.3);
      } catch { /* sudah berhenti */ }
      sizzleNodes = null;
    },
    serve() {
      if (!ensure()) return;
      tone(660, 0.12, 'sine', 0.5);
      tone(880, 0.18, 'sine', 0.5, 0.1);
      tone(1320, 0.22, 'sine', 0.35, 0.2);
    },
    wrong() {
      if (!ensure()) return;
      tone(220, 0.22, 'sawtooth', 0.3, 0, 140);
    },
    win() {
      if (!ensure()) return;
      [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.28, 'sine', 0.5, i * 0.14));
    },
    lose() {
      if (!ensure()) return;
      [392, 330, 262].forEach((f, i) => tone(f, 0.3, 'triangle', 0.45, i * 0.18));
    },
  };
}
