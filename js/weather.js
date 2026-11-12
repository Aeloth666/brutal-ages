// =====================================================================
//  POČASÍ – podle skutečného počasí v místě hráče (jen vzhled)
// =====================================================================
// druhy: clear, cloudy, rain, storm, snow, fog; k tomu noc a síla větru
const WX_KINDS = { clear: 'Jasno', cloudy: 'Zataženo', rain: 'Déšť', storm: 'Bouřka', snow: 'Sníh', fog: 'Mlha' };
let WX = { kind: 'clear', night: false, wind: 0, amt: 0.7 };
let wxReal = load('aow-wx', { at: 0 });           // poslední zjištěné skutečné počasí
let wxMsg = '';

// kódy WMO z Open-Meteo → náš druh počasí a síla srážek
function wmo(code) {
  if (code >= 95) return ['storm', 1];
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return ['snow', code === 75 || code === 86 ? 1 : 0.6];
  if (code >= 80) return ['rain', code === 82 ? 1 : 0.7];
  if (code >= 61) return ['rain', code === 65 || code === 67 ? 1 : 0.65];
  if (code >= 51) return ['rain', 0.35];
  if (code === 45 || code === 48) return ['fog', 0.8];
  if (code === 3) return ['cloudy', 1];
  if (code === 2) return ['cloudy', 0.5];
  return ['clear', 0];
}

function wxApply() {
  const m = SET.weather || 'off';
  if (m === 'off') wxForce('off');
  else if (m === 'real') { if (wxReal.kind) wxSet({ kind: wxReal.kind, night: wxReal.night, wind: wxReal.wind, amt: wxReal.amt }); }
  else wxForce(m);
}
// pevně dané počasí (ruční volba nebo mise kampaně)
function wxForce(m) {
  wxSet(m === 'off' ? { kind: 'clear', night: false, wind: 0, amt: 0 }
    : m === 'night' ? { kind: 'clear', night: true, wind: 5, amt: 0 }
    : { kind: m, night: false, wind: m === 'storm' ? 45 : 12, amt: m === 'cloudy' ? 1 : 0.8 });
}
function wxSet(w) {
  WX = w;
  if (AU.rain) AU.rain.gain.setTargetAtTime(WX.kind === 'rain' ? 0.12 * WX.amt : WX.kind === 'storm' ? 0.2 : 0, AU.ctx.currentTime, 0.5);
}

function wxFetch(force) {
  if (SET.weather !== 'real') return;
  if (!force && Date.now() - wxReal.at < 15 * 60e3) { wxApply(); return; }
  if (!navigator.geolocation) { wxMsg = 'Telefon nepodporuje zjištění polohy.'; refreshWx(); return; }
  wxMsg = 'Zjišťuji polohu…'; refreshWx();
  navigator.geolocation.getCurrentPosition(async pos => {
    // poloha se zaokrouhlí (~1 km) a jde jen na open-meteo.com
    const la = pos.coords.latitude.toFixed(2), lo = pos.coords.longitude.toFixed(2);
    wxMsg = 'Stahuji počasí…'; refreshWx();
    try {
      const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${la}&longitude=${lo}&current=weather_code,is_day,wind_speed_10m,temperature_2m`);
      const j = (await r.json()).current;
      const [kind, amt] = wmo(j.weather_code);
      wxReal = { at: Date.now(), kind, amt, night: !j.is_day, wind: j.wind_speed_10m, temp: Math.round(j.temperature_2m) };
      store('aow-wx', wxReal);
      wxMsg = '';
    } catch (e) { wxMsg = 'Počasí se nepodařilo stáhnout (chybí internet?).'; }
    wxApply(); refreshWx();
  }, err => {
    wxMsg = err.code === 1 ? 'Přístup k poloze je zakázaný – povol ho v nastavení telefonu.' : 'Polohu se nepodařilo zjistit.';
    refreshWx();
  }, { enableHighAccuracy: false, timeout: 15000, maximumAge: 30 * 60e3 });
}
setInterval(() => wxFetch(false), 5 * 60e3);

// --- vykreslení ---
const RAIN = Array.from({ length: 260 }, () => ({ x: Math.random() * (W + 300) - 150, y: Math.random() * H, v: rnd(0.8, 1.2) }));
const SNOW = Array.from({ length: 170 }, () => ({ x: Math.random() * W, y: Math.random() * H, r: rnd(1.2, 3.2), p: Math.random() * 6 }));
const STARS = Array.from({ length: 70 }, () => ({ x: Math.random() * W, y: Math.random() * 300, r: rnd(0.6, 1.6), p: Math.random() * 6 }));
let flash = 0, boltT = 4, bolt = null;

// za jednotkami: zabarvení oblohy, mraky, hvězdy, sníh na zemi
function wxBack(dt) {
  const k = WX.kind;
  if (WX.night) {
    c.fillStyle = 'rgba(8,14,42,.58)'; c.fillRect(-EXW, -EXT, W + 2 * EXW, H + EXT + EXB);
    if (k === 'clear') {
      for (const s of STARS) { c.globalAlpha = 0.5 + Math.sin(T * 2 + s.p) * 0.35; c.fillStyle = '#fff'; circ(s.x, s.y, s.r); }
      c.globalAlpha = 1;
      c.fillStyle = 'rgba(255,250,220,.18)'; circ(980, 200, 46);
      c.fillStyle = '#f5f1dc'; circ(980, 200, 26); c.fillStyle = 'rgba(8,14,42,.35)'; circ(990, 194, 22);
    }
  }
  if (k === 'fog') {
    // mlha schová hory i slunce, dál od bojiště hustší
    const g = c.createLinearGradient(0, 0, 0, GY);
    g.addColorStop(0, `rgba(205,212,222,${0.55 * WX.amt})`); g.addColorStop(0.75, `rgba(215,221,230,${0.75 * WX.amt})`); g.addColorStop(1, `rgba(215,221,230,${0.35 * WX.amt})`);
    c.fillStyle = g; c.fillRect(-EXW, -EXT, W + 2 * EXW, GY + 10 + EXT);
  }
  const dark = k === 'storm' ? 0.5 : k === 'rain' ? 0.36 : k === 'cloudy' ? 0.24 * WX.amt : k === 'snow' ? 0.18 : 0;
  if (dark) {
    c.fillStyle = `rgba(52,62,78,${dark})`; c.fillRect(-EXW, -EXT, W + 2 * EXW, H + EXT + EXB);
    // nízká oblačnost
    c.fillStyle = k === 'snow' ? 'rgba(210,218,230,.55)' : `rgba(${k === 'storm' ? '58,64,78' : '110,118,132'},.75)`;
    for (let i = 0; i < 9; i++) {
      const x = ((i * 170 + T * (6 + WX.wind * 0.6)) % (W + 300)) - 150;
      ell(x, 70 + (i % 3) * 22, 120, 34); ell(x + 70, 92 + (i % 2) * 16, 90, 26);
    }
  }
  if (k === 'snow') {
    // zimní krajina: zasněžené kopce a tráva
    const g = c.createLinearGradient(0, 260, 0, GY);
    g.addColorStop(0, 'rgba(236,242,250,.15)'); g.addColorStop(0.45, 'rgba(240,245,252,.55)'); g.addColorStop(1, 'rgba(245,248,255,.7)');
    c.fillStyle = g; c.fillRect(0, 260, W, GY - 260);
    c.fillStyle = 'rgba(245,248,255,.85)';
    c.beginPath(); c.moveTo(0, GY + 6);
    for (let x = 0; x <= W; x += 16) c.lineTo(x, GY - 3 + Math.sin(x * 0.05) * 2.5);
    c.lineTo(W, GY + 6); c.fill();
  }
}

// před jednotkami: srážky, mlha, blesky
function wxFront(dt) {
  const k = WX.kind, slant = Math.min(0.7, WX.wind / 55) * (mirror ? -1 : 1);
  if (k === 'rain' || k === 'storm') {
    const n = Math.round(RAIN.length * (k === 'storm' ? 1 : 0.35 + WX.amt * 0.6) * [0.4, 0.7, 1, 1][GFXL]), sp = 900;
    c.strokeStyle = 'rgba(190,210,235,.55)'; c.lineWidth = 1.4; c.beginPath();
    for (let i = 0; i < n; i++) {
      const d = RAIN[i];
      d.y += sp * d.v * dt; d.x += sp * d.v * slant * dt;
      if (d.y > GY + 4) {
        if (Math.random() < 0.3) fx.push({ x: MX(d.x), y: GY, vx: rnd(-30, 30), vy: rnd(-70, -30), l: 0.2, ml: 0.2, col: 'rgba(200,220,240,.8)', r: 1, g: 500 });
        d.y = -rnd(0, 60); d.x = Math.random() * (W + 300) - 150;
      }
      c.moveTo(d.x, d.y); c.lineTo(d.x - slant * 14, d.y - 14);
    }
    c.stroke();
  }
  if (k === 'snow') {
    const n = Math.round(SNOW.length * (0.4 + WX.amt * 0.6) * [0.4, 0.7, 1, 1][GFXL]);
    c.fillStyle = 'rgba(255,255,255,.9)';
    for (let i = 0; i < n; i++) {
      const s = SNOW[i];
      s.y += (30 + s.r * 14) * dt; s.x += (Math.sin(T * 1.3 + s.p) * 18 + slant * 60) * dt;
      if (s.y > GY + 6) { s.y = -5; s.x = Math.random() * W; }
      if (s.x < -5) s.x += W + 10; else if (s.x > W + 5) s.x -= W + 10;
      circ(s.x, s.y, s.r);
    }
  }
  if (k === 'fog') {
    // přízemní opar přes bojiště, pomalu se vlní
    for (let i = 0; i < 2; i++) {
      const y = GY - 110 + i * 60 + Math.sin(T * 0.4 + i) * 10, h = 120;
      const g = c.createLinearGradient(0, y - h, 0, y + h);
      g.addColorStop(0, 'rgba(222,228,234,0)'); g.addColorStop(0.5, `rgba(222,228,234,${0.28 * WX.amt})`); g.addColorStop(1, 'rgba(222,228,234,0)');
      c.fillStyle = g; c.fillRect(0, y - h, W, h * 2);
    }
  }
  if (k === 'storm') {
    boltT -= dt;
    if (boltT <= 0) {
      boltT = rnd(4, 11); flash = 1;
      const pts = []; let x = rnd(150, W - 150), y = 0;
      while (y < GY - 40) { pts.push(x, y); x += rnd(-40, 40); y += rnd(30, 70); }
      bolt = pts; sfx('thunder');
      if (SET.vib) vib([0, 120, 60, 60]);
    }
    if (flash > 0) {
      c.fillStyle = `rgba(235,240,255,${flash * 0.45})`; c.fillRect(-EXW, -EXT, W + 2 * EXW, H + EXT + EXB);
      if (bolt && flash > 0.5) {
        c.strokeStyle = '#fff'; c.lineWidth = 3; c.shadowColor = '#bcd4ff'; c.shadowBlur = 18;
        c.beginPath(); c.moveTo(bolt[0], bolt[1]); for (let i = 2; i < bolt.length; i += 2) c.lineTo(bolt[i], bolt[i + 1]); c.stroke();
        c.shadowBlur = 0;
      }
      flash -= dt * 2.5;
    }
  }
}

// --- menu ---
function refreshWx() {
  const el = document.getElementById('wxOpts');
  if (!el) return;
  const m = SET.weather || 'off';
  document.querySelectorAll('#wxOpts button').forEach(b => b.classList.toggle('on', b.dataset.w === m));
  document.querySelectorAll('#fieldOpts button').forEach(b => b.classList.toggle('on', b.dataset.f === (SET.field || 'meadow')));
  $('bWx').textContent = '🌦 Počasí: ' + (m === 'off' ? 'VYP' : m === 'real' ? 'REÁLNÉ' : m === 'night' ? 'Noc' : WX_KINDS[m]);
  let s = '';
  if (m === 'real') {
    if (wxMsg) s = wxMsg;
    else if (wxReal.kind) s = `U tebe teď: <b>${WX_KINDS[wxReal.kind]}${wxReal.night ? ', noc' : ''}, ${wxReal.temp} °C</b>, vítr ${Math.round(wxReal.wind)} km/h`;
  }
  $('wxNow').innerHTML = s;
}
document.querySelectorAll('#wxOpts button').forEach(b => b.onclick = () => {
  SET.weather = b.dataset.w; saveSet(); sfx('click');
  wxApply(); refreshWx(); wxFetch(true);
});
$('bWx').onclick = () => { refreshWx(); openPanel('wxPanel'); };
document.querySelectorAll('#fieldOpts button').forEach(b => b.onclick = () => {
  SET.field = b.dataset.f; saveSet(); sfx('click'); setField(pickField()); refreshWx();
});
wxApply(); refreshWx(); wxFetch(false);
