// =====================================================================
//  ZVUK – vše syntetizované přes Web Audio (žádné cizí nahrávky)
// =====================================================================
const AU = { ctx: null };
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

function audioInit() {
  if (AU.ctx) { if (AU.ctx.state === 'suspended') AU.ctx.resume(); return; }
  const C = window.AudioContext || window.webkitAudioContext;
  if (!C) return;
  const a = AU.ctx = new C();
  const comp = a.createDynamicsCompressor();
  comp.threshold.value = -16; comp.ratio.value = 4; comp.connect(a.destination);
  AU.master = a.createGain(); AU.master.gain.value = 0.9; AU.master.connect(comp);
  AU.mus = a.createGain(); AU.mus.connect(AU.master);
  AU.sfx = a.createGain(); AU.sfx.connect(AU.master);
  const nb = a.createBuffer(1, a.sampleRate, a.sampleRate), d = nb.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  AU.noise = nb;
  // jednoduchý dozvuk
  const len = a.sampleRate * 2, ir = a.createBuffer(2, len, a.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const b = ir.getChannelData(ch); for (let i = 0; i < len; i++) b[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
  AU.rev = a.createConvolver(); AU.rev.buffer = ir;
  const rg = a.createGain(); rg.gain.value = 0.22; AU.rev.connect(rg); rg.connect(AU.master);
  // šum deště – běží pořád, hlasitost řídí počasí
  const rs = a.createBufferSource(), rf = a.createBiquadFilter();
  rs.buffer = nb; rs.loop = true; rf.type = 'bandpass'; rf.frequency.value = 1600; rf.Q.value = 0.5;
  AU.rain = a.createGain(); AU.rain.gain.value = 0;
  rs.connect(rf); rf.connect(AU.rain); AU.rain.connect(AU.sfx); rs.start();
  applyVolumes();
  MUS.next = a.currentTime + 0.1;
  setInterval(musicTick, 25);
}
function applyVolumes() {
  if (!AU.ctx) return;
  const t = AU.ctx.currentTime;
  AU.mus.gain.setTargetAtTime(SET.music ? 0.42 : 0, t, 0.1);
  AU.sfx.gain.setTargetAtTime(SET.sfx ? 0.7 : 0, t, 0.05);
}
addEventListener('pointerdown', audioInit, true);
document.addEventListener('visibilitychange', () => {
  if (!AU.ctx) return;
  if (document.hidden) AU.ctx.suspend(); else AU.ctx.resume();
});

function osc(dest, t, f, dur, type, vol, o = {}) {
  const a = AU.ctx, os = a.createOscillator(), g = a.createGain();
  os.type = type; os.frequency.setValueAtTime(f, t);
  if (o.f2) os.frequency.exponentialRampToValueAtTime(o.f2, t + dur);
  if (o.det) os.detune.value = o.det;
  if (o.vib) { const l = a.createOscillator(), lg2 = a.createGain(); l.frequency.value = 5.5; lg2.gain.value = f * 0.012; l.connect(lg2); lg2.connect(os.frequency); l.start(t); l.stop(t + dur + 0.1); }
  const at = o.a || 0.005;
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + at);
  if (o.sus) g.gain.setValueAtTime(vol, t + Math.max(at, dur - (o.rel || 0.1)));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let node = os;
  if (o.lp) { const fl = a.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.setValueAtTime(o.lp, t); if (o.lp2) fl.frequency.exponentialRampToValueAtTime(o.lp2, t + dur); fl.Q.value = o.q || 1; os.connect(fl); node = fl; }
  node.connect(g); g.connect(dest);
  if (o.rev) g.connect(AU.rev);
  os.start(t); os.stop(t + dur + 0.05);
}
function noise(dest, t, dur, vol, type, f, o = {}) {
  const a = AU.ctx, s = a.createBufferSource(), fl = a.createBiquadFilter(), g = a.createGain();
  s.buffer = AU.noise; fl.type = type; fl.frequency.setValueAtTime(f, t);
  if (o.f2) fl.frequency.exponentialRampToValueAtTime(o.f2, t + dur);
  fl.Q.value = o.q || 0.8;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(fl); fl.connect(g); g.connect(dest);
  if (o.rev) g.connect(AU.rev);
  s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
}

// ---------- zvukové efekty ----------
const sfxLast = {};
let sfxWin = [];
function sfx(k, x) {
  if (!AU.ctx || AU.ctx.state !== 'running' || !SET.sfx) return;
  const a = AU.ctx, t = a.currentTime;
  const gap = { hit: 0.05, muz: 0.06, die: 0.07, boom: 0.08 }[k] || 0.02;
  if (sfxLast[k] && t - sfxLast[k] < gap) return;
  sfxWin = sfxWin.filter(s => t - s < 0.12);
  if (sfxWin.length >= 8 && k !== 'ach' && k !== 'win' && k !== 'lose') return;   // max 8 zvuků za 120 ms
  sfxWin.push(t);
  sfxLast[k] = t;
  let dest = AU.sfx;
  if (x !== undefined && a.createStereoPanner) {
    const p = a.createStereoPanner(); p.pan.value = Math.max(-0.8, Math.min(0.8, (MX(x) / W * 2 - 1) * 0.7)); p.connect(AU.sfx); dest = p;
  }
  switch (k) {
    case 'hit': noise(dest, t, 0.09, 0.35, 'lowpass', 1400); osc(dest, t, 160, 0.08, 'sine', 0.3, { f2: 60 }); break;
    case 'muz': noise(dest, t, 0.12, 0.4, 'highpass', 900, { f2: 3000 }); osc(dest, t, 300, 0.07, 'square', 0.08, { f2: 80 }); break;
    case 'boom': noise(dest, t, 0.7, 0.8, 'lowpass', 900, { f2: 80, rev: 1 }); osc(dest, t, 90, 0.5, 'sine', 0.6, { f2: 28 }); break;
    case 'slam': noise(dest, t, 0.5, 0.9, 'lowpass', 700, { f2: 60, rev: 1 }); osc(dest, t, 70, 0.4, 'sine', 0.7, { f2: 30 }); break;
    case 'up': [660, 880, 1320].forEach((f, i) => osc(dest, t + i * 0.07, f, 0.12, 'triangle', 0.12)); break;
    case 'evt': [523, 659, 784].forEach((f, i) => osc(dest, t + i * 0.1, f, 0.18, 'square', 0.08, { lp: 2400 })); break;
    case 'thunder': noise(dest, t, 0.18, 0.5, 'highpass', 1800); noise(dest, t + 0.08, 2.6, 0.95, 'lowpass', 420, { f2: 50, rev: 1 }); break;
    case 'zap': osc(dest, t, 1400, 0.3, 'sawtooth', 0.15, { f2: 180, lp: 3000 }); noise(dest, t, 0.25, 0.2, 'bandpass', 2500); break;
    case 'die': osc(dest, t, 220, 0.18, 'triangle', 0.12, { f2: 90 }); break;
    case 'rage': noise(dest, t, 0.9, 0.7, 'lowpass', 500, { f2: 140, rev: 1 }); osc(dest, t, 140, 0.8, 'sawtooth', 0.22, { f2: 70, lp: 800 }); break;
    case 'rhit': noise(dest, t, 0.12, 0.45, 'lowpass', 900); osc(dest, t, 120, 0.12, 'sine', 0.35, { f2: 50 }); break;
    case 'cluck': osc(dest, t, 900, 0.06, 'square', 0.07, { f2: 1300, lp: 3000 }); osc(dest, t + 0.09, 1150, 0.09, 'square', 0.07, { f2: 650, lp: 3000 }); break;
    case 'roar': noise(dest, t, 1.6, 0.9, 'lowpass', 600, { f2: 120, rev: 1 }); osc(dest, t, 110, 1.4, 'sawtooth', 0.25, { f2: 55, lp: 700 }); osc(dest, t + 0.05, 165, 1.2, 'sawtooth', 0.15, { f2: 70, lp: 900 }); break;
    case 'buy': osc(dest, t, 880, 0.06, 'square', 0.08, { lp: 2500 }); osc(dest, t + 0.04, 1320, 0.06, 'square', 0.06, { lp: 2500 }); break;
    case 'sp': noise(dest, t, 1.2, 0.35, 'bandpass', 300, { f2: 2500, q: 3, rev: 1 }); osc(dest, t, 110, 1.0, 'sawtooth', 0.12, { f2: 55, lp: 600 }); break;
    case 'evo': [0, 4, 7, 12].forEach((n, i) => osc(dest, t + i * 0.11, mtof(72 + n), 0.5, 'triangle', 0.22, { rev: 1 }));
      [0, 4, 7].forEach(n => osc(dest, t + 0.44, mtof(60 + n), 1.2, 'sawtooth', 0.07, { lp: 1800, a: 0.05, sus: 1, rev: 1 })); break;
    case 'ach': osc(dest, t, 1318, 0.5, 'sine', 0.25, { rev: 1 }); osc(dest, t + 0.12, 1760, 0.7, 'sine', 0.25, { rev: 1 }); osc(dest, t + 0.24, 2637, 0.6, 'sine', 0.1, { rev: 1 }); break;
    case 'win': [0, 4, 7, 12, 7, 12].forEach((n, i) => osc(dest, t + i * 0.14, mtof(67 + n), i === 5 ? 1.2 : 0.3, 'square', 0.12, { lp: 2400, rev: 1, sus: 1 })); break;
    case 'lose': [7, 3, 0, -5].forEach((n, i) => osc(dest, t + i * 0.25, mtof(60 + n), i === 3 ? 1.4 : 0.35, 'sawtooth', 0.1, { lp: 1200, rev: 1, sus: 1 })); break;
    case 'click': osc(dest, t, 660, 0.05, 'triangle', 0.15); break;
  }
}

// ---------- hudba (procedurální, mění se podle věku) ----------
const MUS = { step: 0, next: 0, mode: 'menu', age: 0 };
const CH = { Am: [45, 0], F: [41, 1], C: [48, 1], G: [43, 1], E: [40, 1], Dm: [38, 0] };
const PROG = {
  battle: ['Am', 'F', 'C', 'G', 'Am', 'F', 'G', 'E', 'Dm', 'Am', 'F', 'E', 'Am', 'F', 'G', 'Am'],
  menu: ['Am', 'Dm', 'F', 'E', 'Am', 'F', 'Dm', 'E'],
};
const MEL = [
  [0, -1, 1, -1, 2, -1, 1, 0, -1, -1, 2, -1, 3, -1, 2, -1],
  [3, -1, 2, 1, -1, 1, 2, -1, 4, -1, 3, -1, 2, -1, -1, -1],
  [2, 2, -1, 3, -1, 2, 1, -1, 0, -1, 1, 2, -1, -1, 1, -1],
  [4, -1, -1, 3, 2, -1, 3, -1, 2, -1, 1, -1, 0, -1, -1, -1],
];
const BASSP = [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0];
const AGE_BPM = [100, 108, 116, 126, 134];

function chordNotes(name) { const [r, minor] = CH[name]; return [r, r + (minor ? 3 : 4), r + 7]; }

function musicTick() {
  const a = AU.ctx;
  if (!a || a.state !== 'running') return;
  if (MUS.next < a.currentTime - 0.2) MUS.next = a.currentTime + 0.05;
  while (MUS.next < a.currentTime + 0.15) {
    const bpm = MUS.mode === 'menu' ? 84 : AGE_BPM[MUS.age];
    const spb = 60 / bpm / 4;
    if (SET.music) playStep(MUS.step, MUS.next, spb);
    MUS.next += spb; MUS.step++;
  }
}

// bicí a nástroje typické pro každou dobu (jen v bitvě)
function drums(m, t, s, age, r, spb) {
  const kick = (v = 0.5, f = 110) => osc(m, t, f, 0.25, 'sine', v, { f2: 38 });
  const snare = (v = 0.18) => { noise(m, t, 0.12, v, 'highpass', 1800); osc(m, t, 190, 0.08, 'triangle', v * 0.6, { f2: 120 }); };
  const hat = (v = 0.06) => noise(m, t, 0.04, v, 'highpass', 7000);
  const tom = (f, v = 0.4) => osc(m, t, f, 0.3, 'sine', v, { f2: f * 0.55 });
  switch (age) {
    case 0:                                          // kmenové bubny
      if (s % 4 === 0) tom(95, 0.45); if (s === 6 || s === 10 || s === 14) tom(150, 0.3); if (s === 15) tom(200, 0.22);
      break;
    case 1:                                          // středověk: bordun dud a vojenský buben
      if (s === 0) { osc(m, t, mtof(r + 12), spb * 16, 'sawtooth', 0.03, { lp: 900, sus: 1, a: 0.2, rel: 0.3 }); osc(m, t, mtof(r + 19), spb * 16, 'sawtooth', 0.02, { lp: 900, sus: 1, a: 0.2, rel: 0.3 }); }
      if (s % 8 === 0) kick(0.35, 90); if (s === 4 || s === 12) snare(0.14); if (s === 13 || s === 14 || s === 15) snare(0.07);
      break;
    case 2:                                          // renesance: tympány a cembalo
      if (s === 0 || s === 8) osc(m, t, mtof(r - 12), 0.6, 'sine', 0.45, { f2: mtof(r - 13) }); if (s === 7) osc(m, t, mtof(r - 5), 0.3, 'sine', 0.25);
      if (s % 2 === 0) osc(m, t, mtof(r + 24 + [0, 7, 12, 7][(s / 2) % 4]), 0.15, 'square', 0.025, { lp: 3000 });
      break;
    case 3:                                          // válka: pochodový buben a kopák
      if (s % 8 === 0) kick(0.5); if (s % 4 === 2) snare(0.16); if (s % 2 === 1) snare(0.05); if (s === 14 || s === 15) snare(0.12);
      break;
    case 4:                                          // budoucnost: elektronický beat a syntezátorové arpeggio
      if (s % 4 === 0) kick(0.6, 150); if (s % 4 === 2) hat(0.08); if (s === 4 || s === 12) { noise(m, t, 0.15, 0.2, 'bandpass', 1200, { q: 2 }); }
      osc(m, t, mtof(r + 24 + [0, 3, 7, 12, 7, 3, 0, -5][s % 8]), spb * 0.9, 'sawtooth', 0.03, { lp: 2600, lp2: 800 });
      break;
  }
}

function playStep(step, t, spb) {
  const m = AU.mus, menu = MUS.mode === 'menu', age = MUS.age;
  const prog = PROG[menu ? 'menu' : 'battle'];
  const bar = Math.floor(step / 16) % prog.length, s = step % 16;
  const ch = prog[bar], [r] = CH[ch], tones = chordNotes(ch);
  if (!menu) drums(m, t, s, age, r, spb);
  const mel = [tones[0] + 24, tones[1] + 24, tones[2] + 24, tones[0] + 36, tones[1] + 36];
  // pad
  if (s === 0) {
    for (const n of tones) {
      osc(m, t, mtof(n + 12), spb * 16, 'sawtooth', menu ? 0.045 : 0.035, { a: 0.25, sus: 1, rel: 0.4, lp: menu ? 700 : 1000, det: -8, rev: 1 });
      osc(m, t, mtof(n + 12), spb * 16, 'sawtooth', menu ? 0.045 : 0.035, { a: 0.25, sus: 1, rel: 0.4, lp: menu ? 700 : 1000, det: 8 });
    }
  }
  // basa
  if (menu ? s % 8 === 0 : BASSP[s]) {
    const n = r + (s === 14 && !menu ? 12 : 0);
    osc(m, t, mtof(n), spb * (menu ? 7 : 2.2), age === 3 ? 'square' : 'triangle', menu ? 0.2 : 0.26, { lp: age === 3 ? 500 : 900, sus: 1 });
  }
  // melodie (každá 2. čtveřice taktů hraje)
  const pat = MEL[(bar + (menu ? 1 : 0)) % MEL.length];
  const playMel = menu ? (bar % 2 === 0 ? s % 2 === 0 : false) : (Math.floor(bar / 4) % 2 === 1 || bar % 4 === 3);
  if (playMel && pat[s] >= 0) {
    const f = mtof(mel[pat[s]]), d = spb * (menu ? 3 : 1.8);
    switch (menu ? 0 : age) {
      case 0: osc(m, t, f, d * 1.4, 'sine', 0.13, { vib: 1, a: 0.03, rev: 1 }); osc(m, t, f * 2, d, 'sine', 0.03); break;
      case 1: osc(m, t, f, d * 1.3, 'triangle', 0.16, { a: 0.02, rev: 1 }); osc(m, t, f / 2, d, 'square', 0.03, { lp: 1200 }); break;
      case 2: osc(m, t, f, d, 'sawtooth', 0.09, { lp: 4000, lp2: 600, rev: 1 }); break;
      case 3: osc(m, t, f, d, 'square', 0.07, { lp: 2200, rev: 1 }); osc(m, t, f * 1.5, d, 'square', 0.025, { lp: 1800 }); break;
      case 4: osc(m, t, f, d, 'sawtooth', 0.08, { lp: 3000, q: 4, rev: 1, det: 6 }); osc(m, t, f, d, 'sawtooth', 0.06, { lp: 3000, det: -6 }); break;
    }
  }
  // arpeggio v budoucnosti a renesanci
  if (!menu && (age === 4 || age === 2) && s % 2 === 1) {
    const n = mel[(s >> 1) % 4];
    osc(m, t, mtof(n + (age === 4 ? 12 : 0)), spb * 0.9, age === 4 ? 'square' : 'triangle', 0.035, { lp: 2500 });
  }
  // bicí
  if (menu) {
    if (s === 0 || s === 10) drum('tom', t, 0.18);
    return;
  }
  if (s === 0 || s === 8 || (s === 10 && bar % 2)) drum('kick', t, 0.5);
  if (s === 4 || s === 12) drum(age === 0 ? 'tom' : 'snare', t, 0.32);
  if (age >= 1 && s % 2 === 0) drum('hat', t, s % 4 === 2 ? 0.09 : 0.05);
  if (age === 0 && (s === 6 || s === 14)) drum('tom2', t, 0.2);
  if (bar % 4 === 3 && s >= 12) drum('tom', t, 0.22);
}
function drum(k, t, v) {
  const m = AU.mus;
  switch (k) {
    case 'kick': osc(m, t, 120, 0.3, 'sine', v, { f2: 40 }); break;
    case 'snare': noise(m, t, 0.18, v, 'bandpass', 1800, { q: 0.7, rev: 1 }); osc(m, t, 220, 0.1, 'triangle', v * 0.4, { f2: 150 }); break;
    case 'hat': noise(m, t, 0.05, v, 'highpass', 7000); break;
    case 'tom': osc(m, t, 150, 0.35, 'sine', v, { f2: 70, rev: 1 }); noise(m, t, 0.06, v * 0.4, 'lowpass', 800); break;
    case 'tom2': osc(m, t, 210, 0.25, 'sine', v, { f2: 110 }); break;
  }
}

// =====================================================================
//  POKŘIKY NÁRODŮ – syntetický „hlas“ (pila přes formanty samohlásek), rohy, pípání…
// =====================================================================
const VOW = { a: [800, 1250], e: [480, 1850], i: [300, 2250], o: [520, 880], u: [330, 780], r: [600, 1300] };
function voice(dest, t, f0, f1, dur, v, vol, o = {}) {
  const a = AU.ctx, os = a.createOscillator(), g = a.createGain();
  os.type = 'sawtooth'; os.frequency.setValueAtTime(f0, t); os.frequency.linearRampToValueAtTime(f1, t + dur);
  if (o.det) os.detune.value = o.det;
  if (o.vib) { const l = a.createOscillator(), lg2 = a.createGain(); l.frequency.value = o.vib; lg2.gain.value = f0 * (o.vd || 0.04); l.connect(lg2); lg2.connect(os.frequency); l.start(t); l.stop(t + dur + 0.1); }
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.03);
  g.gain.setValueAtTime(vol, t + dur * 0.65); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  if (o.trem) { const l = a.createOscillator(), lg2 = a.createGain(); l.frequency.value = o.trem; lg2.gain.value = vol * 0.8; l.connect(lg2); lg2.connect(g.gain); l.start(t); l.stop(t + dur + 0.1); }
  const [F1, F2] = VOW[v] || VOW.a;
  for (const [F, q, gv] of [[F1, 5, 1], [F2, 7, 0.55], [2700, 5, 0.18]]) {
    const bp = a.createBiquadFilter(), bg = a.createGain(); bp.type = 'bandpass'; bp.frequency.value = F; bp.Q.value = q; bg.gain.value = gv * 3.2;
    os.connect(bp); bp.connect(bg); bg.connect(g);
  }
  g.connect(dest); if (o.rev !== false) g.connect(AU.rev);
  os.start(t); os.stop(t + dur + 0.05);
}
// skupina hlasů (sbor) – slabiky: [samohláska, délka, výška začátek ×, výška konec ×, souhláska]
function shout(dest, t, base, syl, n = 3, vol = 0.09) {
  for (let k = 0; k < n; k++) {
    let tt = t + k * 0.025 + Math.random() * 0.02;
    const b = base * (1 + (k - 1) * 0.06 + Math.random() * 0.03);
    for (const [v, d, p0, p1, cons] of syl) {
      if (cons === 's' || cons === 'z') noise(dest, tt, 0.07, vol * 1.2, 'highpass', 3800);
      else if (cons === 'k' || cons === 't' || cons === 'b' || cons === 'g') noise(dest, tt, 0.03, vol * 1.6, 'bandpass', cons === 'b' ? 400 : 1800, { q: 1 });
      voice(dest, tt + (cons ? 0.03 : 0), b * p0, b * p1, d, v, vol);
      tt += d + (cons ? 0.03 : 0);
    }
  }
}
function horn(dest, t, f, dur, vol = 0.12, type = 'sawtooth', lp = 900) {
  osc(dest, t, f * 0.94, dur, type, vol, { f2: f, lp, a: 0.12, sus: 1, rel: 0.3, rev: 1 });
  osc(dest, t, f * 1.5 * 0.94, dur, type, vol * 0.35, { f2: f * 1.5, lp, a: 0.15, sus: 1, rel: 0.3, rev: 1 });
}
// index národa = věk × 4 + volba; pořadí odpovídá AGEFAC
const CRIES = [
  // doba kamenná: lovci mamutů, vlk, medvěd, orel
  (d, t) => shout(d, t, 150, [['u', 0.16, 1, 1.1, 'g'], ['a', 0.24, 1.15, 0.95], ['u', 0.14, 1, 1.1, 'g'], ['a', 0.26, 1.2, 0.9]]),
  (d, t) => { for (let k = 0; k < 2; k++) osc(d, t + k * 0.08, 420 + k * 40, 1.3, 'sine', 0.13, { f2: 760 + k * 50, vib: 1, a: 0.25, sus: 1, rel: 0.4, rev: 1 }); osc(d, t + 0.9, 760, 0.6, 'sine', 0.1, { f2: 480, rev: 1 }); },
  (d, t) => { noise(d, t, 0.9, 0.5, 'lowpass', 420, { f2: 160, rev: 1 }); osc(d, t, 95, 0.85, 'sawtooth', 0.2, { f2: 70, lp: 500 }); voice(d, t, 120, 85, 0.8, 'o', 0.08, { trem: 22 }); },
  (d, t) => { osc(d, t, 2300, 0.5, 'sawtooth', 0.07, { f2: 1500, lp: 4000, rev: 1 }); osc(d, t + 0.05, 2600, 0.45, 'sine', 0.08, { f2: 1700, vib: 1, rev: 1 }); },
  // středověk: rytíři „Za krále!“, vikingové (roh + Hú!), samurajové „Banzai!“, mongolové (ululace)
  (d, t) => { shout(d, t, 170, [['a', 0.14, 1, 1.05, 'z'], ['a', 0.16, 1.1, 1.15, 'k'], ['e', 0.3, 1.25, 1.0]]); noise(d, t + 0.6, 0.12, 0.25, 'highpass', 4000); osc(d, t + 0.6, 2400, 0.25, 'triangle', 0.05, { f2: 2200 }); },
  (d, t) => { horn(d, t, 98, 0.9, 0.11); shout(d, t + 0.75, 125, [['u', 0.35, 1, 1.3, 'g']], 4, 0.1); },
  (d, t) => shout(d, t, 175, [['a', 0.16, 1, 1.05, 'b'], ['a', 0.16, 1.08, 1.12, 'z'], ['i', 0.48, 1.3, 1.1]], 3, 0.09),
  (d, t) => { for (let k = 0; k < 2; k++) { let tt = t + k * 0.04; const b = 330 + k * 25; for (let i = 0; i < 7; i++) { voice(d, tt, b * (i % 2 ? 1.25 : 1), b * (i % 2 ? 1.2 : 1.05), 0.08, i % 2 ? 'u' : 'i', 0.07); tt += 0.075; } } },
  // renesance: mušketýři (buben + Hurá), konkvistadoři „Santiago!“, piráti „Arrr!“, janičáři (zurna + buben)
  (d, t) => { for (let i = 0; i < 6; i++) noise(d, t + i * 0.06, 0.07, 0.3, 'bandpass', 1800, { q: 0.7 }); shout(d, t + 0.4, 165, [['u', 0.12, 1, 1.05, 'k'], ['a', 0.36, 1.2, 1.05]]); },
  (d, t) => shout(d, t, 165, [['a', 0.13, 1, 1.05, 's'], ['i', 0.12, 1.1, 1.1], ['a', 0.14, 1.15, 1.2, 'g'], ['o', 0.34, 1.25, 1.0]]),
  (d, t) => { shout(d, t, 105, [['a', 0.22, 1, 1.05], ['r', 0.5, 1.05, 0.85]], 3, 0.1); voice(d, t + 0.2, 110, 90, 0.5, 'r', 0.07, { trem: 28 }); },
  (d, t) => { [0, 2, 3, 5, 3].forEach((n, i) => osc(d, t + i * 0.13, mtof(74 + n), 0.15, 'square', 0.06, { lp: 2600, vib: 1 })); noise(d, t, 0.2, 0.45, 'lowpass', 160, { f2: 60 }); noise(d, t + 0.39, 0.2, 0.45, 'lowpass', 160, { f2: 60 }); },
  // světové války: pěchota „Hurá!“ + píšťalka, tankisté (motor), partyzáni (ptačí signál), výsadkáři „Geronimo!“
  (d, t) => { osc(d, t, 2900, 0.35, 'sine', 0.08, { vib: 1 }); shout(d, t + 0.35, 160, [['u', 0.12, 1, 1.05, 'k'], ['a', 0.45, 1.2, 1.05]], 4, 0.09); },
  (d, t) => { osc(d, t, 45, 1.0, 'sawtooth', 0.22, { f2: 95, lp: 380, a: 0.1 }); noise(d, t, 1.0, 0.25, 'lowpass', 300, { f2: 600 }); osc(d, t + 0.2, 900, 0.1, 'square', 0.04, { lp: 2000 }); },
  (d, t) => { for (let i = 0; i < 3; i++) osc(d, t + i * 0.18, 1900, 0.12, 'sine', 0.09, { f2: i === 2 ? 2600 : 1500 }); },
  (d, t) => shout(d, t, 170, [['e', 0.14, 1, 1.05, 'g'], ['o', 0.12, 1.08, 1.1], ['i', 0.12, 1.12, 1.15], ['o', 0.38, 1.25, 0.95]], 3, 0.09),
  // budoucnost: kyborgové (robotický hlas), mimozemšťané (vlnění), roboti (pípání), mariňáci „Hoo-rah!“ + vysílačka
  (d, t) => { const a = AU.ctx; for (const [v, dd, cons] of [['a', 0.14], ['a', 0.14, 't'], ['a', 0.22, 'k']]) { if (cons) noise(d, t, 0.03, 0.15, 'bandpass', 2000); voice(d, t + 0.02, 110, 110, dd, v, 0.11, { trem: 60, rev: false }); t += dd + 0.04; } },
  (d, t) => { const a = AU.ctx; for (let k = 0; k < 2; k++) osc(d, t + k * 0.1, 320 + k * 180, 0.9, 'sine', 0.1, { f2: 900 - k * 200, vib: 1, rev: 1 }); osc(d, t, 1600, 0.7, 'triangle', 0.04, { f2: 400, rev: 1 }); },
  (d, t) => { for (let i = 0; i < 5; i++) osc(d, t + i * 0.08, [1200, 1800, 900, 2400, 1500][i], 0.06, 'square', 0.05, { lp: 4000 }); },
  (d, t) => { noise(d, t, 0.15, 0.2, 'bandpass', 2200, { q: 2 }); shout(d, t + 0.12, 140, [['u', 0.2, 1, 1.05, 'g'], ['a', 0.38, 1.2, 1.0, 'r']], 4, 0.09); noise(d, t + 0.75, 0.1, 0.2, 'bandpass', 2200, { q: 2 }); },
];
const cryLast = [0, 0];
function cry(fi, x, side, force) {
  if (!AU.ctx || AU.ctx.state !== 'running' || !SET.sfx || !CRIES[fi]) return;
  const a = AU.ctx, t = a.currentTime;
  if (!force && t - cryLast[side] < 3.5) return;
  cryLast[side] = t;
  let dest = AU.sfx;
  if (x !== undefined && a.createStereoPanner) { const p = a.createStereoPanner(); p.pan.value = Math.max(-0.8, Math.min(0.8, (MX(x) / W * 2 - 1) * 0.7)); p.connect(AU.sfx); dest = p; }
  const g = a.createGain(); g.gain.value = side === mySide ? 1 : 0.7; g.connect(dest);
  CRIES[fi](g, t + 0.02);
}
