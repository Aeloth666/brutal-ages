// =====================================================================
//  NASTAVENÍ (uložené v telefonu)
// =====================================================================
const SET = { music: true, sfx: true, vib: true, brutal: false, weather: 'off', diff: 1, name: '', col: 0 };
try { Object.assign(SET, JSON.parse(localStorage.getItem('aow-set') || '{}')); } catch (e) {}
function saveSet() { try { localStorage.setItem('aow-set', JSON.stringify(SET)); } catch (e) {} applyVolumes(); refreshMenu(); }
const load = (k, d) => { try { return Object.assign(d, JSON.parse(localStorage.getItem(k) || '{}')); } catch (e) { return d; } };
const store = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

// vibrace: v aplikaci nativní Haptics (krátké = ostré ťuknutí), v prohlížeči webové API
function vib(p) {
  if (!SET.vib || !p) return;
  const Hp = window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.Haptics;
  if (Hp) {
    let t = 0;
    (Array.isArray(p) ? p : [p]).forEach((ms, i) => {
      if (i % 2 === 0 && ms > 0) setTimeout(() => {
        try { ms <= 60 ? Hp.impact({ style: ms <= 30 ? 'LIGHT' : ms <= 45 ? 'MEDIUM' : 'HEAVY' }) : Hp.vibrate({ duration: ms }); } catch (e) {}
      }, t);
      t += ms;
    });
    return;
  }
  if (navigator.vibrate) try { navigator.vibrate(p); } catch (e) {}
}

// =====================================================================
//  BARVY ARMÁDY + VÝZVY (každá splněná výzva odemkne jednu barvu)
// =====================================================================
const COLS = [
  { n: 'Modrá',     c: ['#3b82f6', '#1e40af', '#93c5fd'] },
  { n: 'Červená',   c: ['#ef4444', '#991b1b', '#fca5a5'] },
  { n: 'Zelená',    c: ['#22c55e', '#166534', '#86efac'] },
  { n: 'Oranžová',  c: ['#f97316', '#9a3412', '#fdba74'] },
  { n: 'Fialová',   c: ['#a855f7', '#6b21a8', '#d8b4fe'] },
  { n: 'Tyrkysová', c: ['#14b8a6', '#115e59', '#5eead4'] },
  { n: 'Růžová',    c: ['#ec4899', '#9d174d', '#f9a8d4'] },
  { n: 'Zlatá',     c: ['#eab308', '#854d0e', '#fde047'] },
  { n: 'Bílá',      c: ['#e2e8f0', '#64748b', '#ffffff'] },
  { n: 'Černá',     c: ['#334155', '#0f172a', '#94a3b8'] },
];
const CHAL = [
  { n: 'Bez hradeb',     d: 'Normální soupeř, ale nesmíš stavět věže.',                     diff: 1, mods: { noTower: 1 }, col: 2 },
  { n: 'Chudák',         d: 'Začínáš bez zlata a za zabití dostáváš o 30 % méně.',          diff: 1, mods: { gold: 0, gm: 0.7 }, col: 3 },
  { n: 'David a Goliáš', d: 'Soupeř začíná ve středověku s dvojnásobnou základnou.',        diff: 1, mods: { eAge: 1, eHp: 2 }, col: 4 },
  { n: 'Jen střelci',    d: 'Těžký soupeř. Smíš vyrábět jen střelce (2. jednotku).',         diff: 2, mods: { only: 1 }, col: 5 },
  { n: 'Věčný pravěk',   d: 'Nikdo nemůže evolvovat. Těžký soupeř.',                        diff: 2, mods: { noEvo: 1 }, col: 6 },
  { n: 'Bleskovka',      d: 'Poraž těžkého soupeře do 10 minut.',                           diff: 2, mods: { limit: 600 }, col: 7 },
  { n: 'Přežij',         d: 'Vydrž 10 minut proti obtížnosti Nemožná.',                     diff: 3, mods: { survive: 600 }, col: 8 },
  { n: 'Nesmrtelný',     d: 'Poraž obtížnost Nemožná bez jediné věže.',                     diff: 3, mods: { noTower: 1 }, col: 9 },
];
const CHS = load('aow-ch', {});
const colUnlocked = i => i < 2 || CHAL.some((ch, k) => ch.col === i && CHS[k]);

// =====================================================================
//  STATISTIKY
// =====================================================================
const ST = load('aow-stats', { solo: [[0, 0], [0, 0], [0, 0], [0, 0]], vs: {}, kills: 0, games: 0, best: 0 });
while (ST.solo.length < 5) ST.solo.push([0, 0]);                          // přibyla obtížnost Šílená
function record(won, V) {
  const me = V.pl[mySide];
  ST.games++; ST.kills += me.kills;
  if (role === 'solo' || coop) {
    if (V.daily) dailyResult(won, V);
    else if (V.camp != null) curDef != null ? defResult(won) : campResult(won, V);
    else if (coop) ST.coop = (ST.coop || 0) + (won ? 1 : 0);
    else if (V.chal == null) {
      ST.solo[V.diff || 0][won ? 0 : 1]++;
      if (won && (!ST.best || V.time < ST.best)) ST.best = V.time;
    } else if (won && !CHS[V.chal]) {
      CHS[V.chal] = Date.now(); store('aow-ch', CHS);
      const col = COLS[CHAL[V.chal].col];
      toasts.push({ a: { n: 'Nová barva: ' + col.n }, h: 'VÝZVA SPLNĚNA', l: 4 });
    }
  } else if (TEAM) ST.team = (ST.team || 0) + (won ? 1 : 0);
  else {
    const n = OPP.n || 'Kámoš', r = ST.vs[n] || (ST.vs[n] = [0, 0]);
    r[won ? 0 : 1]++;
    partyMatch(won); partySend();
  }
  store('aow-stats', ST);
  profGain(won, V);
  genRecord(won, V);
}

// =====================================================================
//  RYCHLÉ ZPRÁVY (online)
// =====================================================================
const CHATS = ['GG 👍', '😂😂😂', 'To bolelo!', 'Ještě uvidíš!', 'Pomoc! 😱', 'Hezký tah 👏'];
let chatOpen = false, chatBtns = [], bubbles = [], chatLast = 0;
function showChat(side, i, who = 'me') {
  if (!CHATS[i]) return;
  bubbles = bubbles.filter(b => b.who !== who);
  bubbles.push({ side, i, who, l: 3.5 });
  sfx('click');
}
function sayChat(i) {
  const now = performance.now();
  if (now - chatLast < 1200) return;
  chatLast = now; chatOpen = false;
  send(role === 'host' ? { t: 'chat', i, side: mySide, who: 0 } : { t: 'chat', i }); showChat(mySide, i);
}
function drawChat(dt) {
  for (const b of bubbles) {
    b.l -= dt;
    const t = CHATS[b.i], a = Math.min(1, b.l * 3, (3.5 - b.l) * 6);
    c.font = '800 20px system-ui';
    const w = c.measureText(t).width + 28, bx = MX(BX[b.side]), x = Math.max(12, Math.min(W - w - 12, bx - w / 2 + (bx < W / 2 ? 70 : -70))), y = HUD + 54 + bubbles.filter(o => o.side === b.side).indexOf(b) * 50;
    c.globalAlpha = Math.max(0, a);
    rr(x, y, w, 42, 14); c.fillStyle = b.side === mySide ? '#eff6ff' : '#fff1f2'; c.fill();
    c.strokeStyle = teamCol(b.side)[1]; c.lineWidth = 3; c.stroke();
    const tx = Math.max(x + 16, Math.min(x + w - 16, bx));
    poly([tx - 9, y + 41, tx + 9, y + 41, tx, y + 56]); c.fill();
    c.fillStyle = '#0f172a'; c.textAlign = 'center'; c.fillText(t, x + w / 2, y + 29);
    c.globalAlpha = 1;
  }
  bubbles = bubbles.filter(b => b.l > 0);
  chatBtns = [];
  if (!chatOpen) return;
  const x0 = W - 474, y0 = HUD + 8;
  rr(x0 - 10, y0 - 8, 470, 186, 14); c.fillStyle = 'rgba(15,21,34,.95)'; c.fill(); c.strokeStyle = '#e5c04a'; c.lineWidth = 2; c.stroke();
  CHATS.forEach((t, i) => {
    const b = { x: x0 + (i % 3) * 152, y: y0 + ((i / 3) | 0) * 60, w: 144, h: 50, i };
    chatBtns.push(b);
    rr(b.x, b.y, b.w, b.h, 10); c.fillStyle = '#334155'; c.fill();
    c.fillStyle = '#fff'; c.font = '800 17px system-ui'; c.textAlign = 'center'; c.fillText(t, b.x + b.w / 2, b.y + 32, b.w - 8);
  });
  const em = BRUT() ? [...EMOTES, '🖕'] : EMOTES;
  em.forEach((e, i) => {
    const b = { x: x0 + i * (452 / em.length), y: y0 + 124, w: 452 / em.length - 6, h: 46, e: i };
    chatBtns.push(b);
    rr(b.x, b.y, b.w, b.h, 10); c.fillStyle = '#1e293b'; c.fill();
    c.font = '28px system-ui'; c.textAlign = 'center'; c.fillText(e, b.x + b.w / 2, b.y + 34);
  });
}

// =====================================================================
//  ČEKÁNÍ NA SOUPEŘE (výpadek spojení)
// =====================================================================
let waitBtn = null;
function drawWait() {
  waitBtn = null;
  if (!netWait || !V || V.over >= 0) return;
  const left = Math.max(0, WAIT_MAX - Math.floor((performance.now() - waitSince) / 1000));
  c.fillStyle = 'rgba(8,10,16,.6)'; c.fillRect(0, HUD, W, H - HUD);
  const w = 520, h = 190, x = W / 2 - w / 2, y = 200;
  rr(x, y, w, h, 18); c.fillStyle = '#151c2b'; c.fill(); c.strokeStyle = '#e5c04a'; c.lineWidth = 2; c.stroke();
  const away = oppAway ? 'Soupeř odešel z aplikace' : role === 'guest' ? 'Spojení s hostitelem vypadlo' : 'Spojení se soupeřem vypadlo';
  c.textAlign = 'center'; c.fillStyle = '#fde68a'; c.font = '900 24px system-ui'; c.fillText(away, W / 2, y + 46);
  c.fillStyle = '#cbd5e1'; c.font = '600 16px system-ui';
  c.fillText(`Hra je pozastavená, čekám na návrat… ${left} s`, W / 2, y + 78);
  const sp = ['◐', '◓', '◑', '◒'][((T * 4) | 0) % 4];
  c.font = '700 20px system-ui'; c.fillText(sp, W / 2, y + 108);
  const b = waitBtn = { x: W / 2 - 90, y: y + 124, w: 180, h: 46 };
  rr(b.x, b.y, b.w, b.h, 10); c.fillStyle = '#b91c1c'; c.fill();
  c.fillStyle = '#fff'; c.font = '800 18px system-ui'; c.fillText('Ukončit hru', W / 2, b.y + 30);
}

// vibrace při zásahu vlastní základny (sčítá škodu, ať telefon nebzučí neustále)
let baseHp = null, baseDmg = 0, baseVibT = 0;
function baseVib(V, dt) {
  const p = V.pl[mySide];
  if (baseHp != null && p.hp < baseHp) baseDmg += baseHp - p.hp;
  baseHp = p.hp; baseVibT -= dt;
  if (baseDmg > p.mhp * 0.01 && baseVibT <= 0) { vib(Math.min(120, 25 + (baseDmg / p.mhp) * 800)); baseDmg = 0; baseVibT = 0.6; }
}
