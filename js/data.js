'use strict';
// =====================================================================
//  BRUTAL AGES
//  Hostitel (nebo hra proti PC) simuluje celou hru, host posílá
//  soupeři snapshoty přes WebRTC (PeerJS), soupeř posílá jen příkazy.
// =====================================================================

// ---------- Konstanty světa ----------
const W = 1300, H = 600, GY = 505, HUD = 112;   // GY = úroveň země (pod ní je hlína se zakopanými kostmi)
const BX = [62, W - 62];          // středy základen
let EXW = 0;                      // o kolik bojiště pokračuje do bočních pruhů širokých displejů (kvůli celým základnám), nastavuje render()
const BF = [120, W - 120];        // přední hrana základen
const SPAWN = [110, W - 110];
const DT = 1 / 30;
const SNAP_HZ = 15;
const SLOT_COST = [1000, 3000, 7500];
const START_GOLD = 175;
const KILL_GOLD = 1.3, KILL_XP = 4;
const SP_CD = 50;
const PREFIX = 'aowmp-kamosi-';

const SPD = { stone: 450, rock: 420, egg: 420, arrow: 650, fire: 600, oil: 400, bullet: 1300,
  shell: 800, rocket: 700, laser: 1600, ion: 900, axe: 480, plasma: 750, rlaser: 1600 };

// k: 0 = pěchota, 1 = střelec, 2 = těžká jednotka
const AGES = [
  { name: 'Doba kamenná', xp: 4000, baseHp: 500,
    units: [
      { n: 'Jeskyňák',   c: 15,  hp: 55,  d: 16, r: 18,  s: 42, cd: 1.0, t: 1.0 },
      { n: 'Prakovník',  c: 30,  hp: 42,  d: 9,  r: 140, s: 42, cd: 1.1, t: 1.3, p: 'stone' },
      { n: 'Mamutí jezdec', c: 70,  hp: 200, d: 40, r: 24,  s: 36, cd: 1.3, t: 3.0 }],
    turrets: [
      { n: 'Kamenomet',  c: 100, d: 10, r: 330, cd: 1.1,  p: 'stone', arc: 1 },
      { n: 'Prakostroj', c: 200, d: 6,  r: 350, cd: 0.6,  p: 'stone' },
      { n: 'Úlomet',     c: 500, d: 28, r: 340, cd: 1.5,  p: 'egg', sp: 30, arc: 1 }],
    sp: { n: 'Meteority', d: 50, count: 16, p: 'meteor' } },
  { name: 'Středověk', xp: 14000, baseHp: 1100,
    units: [
      { n: 'Šermíř',      c: 50,  hp: 110, d: 35, r: 18,  s: 42, cd: 1.0, t: 1.5 },
      { n: 'Lukostřelec', c: 95,  hp: 85,  d: 16, r: 170, s: 42, cd: 1.1, t: 1.8, p: 'arrow' },
      { n: 'Rytíř',       c: 320, hp: 420, d: 60, r: 24,  s: 48, cd: 1.2, t: 4.0 }],
    turrets: [
      { n: 'Katapult',     c: 650,  d: 30, r: 360, cd: 1.6, p: 'rock', sp: 30, arc: 1 },
      { n: 'Ohnivé šípy',  c: 550,  d: 18, r: 380, cd: 0.7, p: 'fire' },
      { n: 'Kotel oleje',  c: 1000, d: 55, r: 220, cd: 1.8, p: 'oil', sp: 45, arc: 1 }],
    sp: { n: 'Déšť šípů', d: 85, count: 18, p: 'arrow' } },
  { name: 'Renesance', xp: 45000, baseHp: 2000,
    units: [
      { n: 'Duelant',  c: 180,  hp: 230, d: 70,  r: 20,  s: 44, cd: 0.9, t: 2.0 },
      { n: 'Mušketýr', c: 400,  hp: 170, d: 40,  r: 190, s: 42, cd: 1.3, t: 2.5, p: 'bullet' },
      { n: 'Kanonýr',  c: 1300, hp: 620, d: 120, r: 150, s: 30, cd: 2.2, t: 5.0, p: 'shell', sp: 15 }],
    turrets: [
      { n: 'Dělo',          c: 1500, d: 60, r: 400, cd: 1.6, p: 'shell' },
      { n: 'Dvojdělo',      c: 2200, d: 50, r: 400, cd: 0.9, p: 'shell' },
      { n: 'Výbušné dělo',  c: 6000, d: 120, r: 420, cd: 2.0, p: 'shell', sp: 40, arc: 1 }],
    sp: { n: 'Dělostřelba', d: 160, count: 16, p: 'shell' } },
  { name: 'Moderní doba', xp: 200000, baseHp: 3200,
    units: [
      { n: 'Pěšák',      c: 1500, hp: 520,  d: 110, r: 20,  s: 46, cd: 0.9,  t: 2.5 },
      { n: 'Kulometčík', c: 2400, hp: 310,  d: 30,  r: 200, s: 42, cd: 0.42, t: 3.0, p: 'bullet' },
      { n: 'Tank',       c: 9000, hp: 1450, d: 250, r: 150, s: 32, cd: 2.0,  t: 6.0, p: 'shell', sp: 15 }],
    turrets: [
      { n: 'Kulomet',      c: 9000,  d: 25,  r: 430, cd: 0.25, p: 'bullet' },
      { n: 'Raketomet',    c: 11500, d: 140, r: 450, cd: 1.8,  p: 'rocket', sp: 35 },
      { n: 'Protitankové', c: 14000, d: 220, r: 450, cd: 2.2,  p: 'shell' }],
    sp: { n: 'Nálet', d: 350, count: 16, p: 'bomb' } },
  { name: 'Budoucnost', xp: Infinity, baseHp: 4700,
    units: [
      { n: 'Boží čepel',    c: 5000,  hp: 950,  d: 230, r: 20,  s: 48, cd: 0.8, t: 3.0 },
      { n: 'Blaster',       c: 7000,  hp: 560,  d: 90,  r: 220, s: 44, cd: 0.7, t: 3.5, p: 'laser' },
      { n: 'Válečný stroj', c: 26000, hp: 2700, d: 500, r: 150, s: 32, cd: 1.6, t: 7.0, p: 'ion', sp: 15 }],
    turrets: [
      { n: 'Laser',         c: 24000,  d: 90,  r: 480, cd: 0.5, p: 'laser' },
      { n: 'Iontové dělo',  c: 40000,  d: 260, r: 480, cd: 1.6, p: 'ion', sp: 35 },
      { n: 'Plazmakanón',   c: 100000, d: 500, r: 500, cd: 1.8, p: 'ion', sp: 50 }],
    sp: { n: 'Orbitální laser', d: 700, count: 16, p: 'beam' } },
];
const SUPER = { n: 'Supervoják', c: 220000, hp: 7000, d: 500, r: 170, s: 40, cd: 0.3, t: 10, p: 'laser' };

// hrdina (ty 4): jeden na bojišti, odvozený od těžké jednotky věku; tlačítkem pak spouští ničivý úder
const HERO_N = ['Náčelník', 'Král', 'Generál', 'Plukovník', 'Kyborg'];
// hrdina podle věku: [zdraví ×, útok ×, cena ×] vůči těžké jednotce (vyladěno simulací proti smíšené armádě za stejné zlato)
const HERO_M = [[2.2, 1.1, 4], [2.2, 1.1, 2.5], [3.8, 1.6, 2.5], [2.6, 1.25, 2.5], [2.6, 1.25, 2.5]];
const HEROES = AGES.map((A, a) => { const h = A.units[2], [hm, dm, cm] = HERO_M[a]; return { n: HERO_N[a], c: Math.round(h.c * cm), hp: Math.round(h.hp * hm), d: Math.round(h.d * dm), r: 30, s: 40, cd: 1.0, t: 0 }; });
const AI_HERO_T = [Infinity, 150, 100, 70, 45];          // s: od kdy smí počítač vyvolat hrdinu (podle obtížnosti)
const HERO_CD = 60, HERO_ACD = 20;
// národy: v každém věku 4 na výběr – bonus, názvy jednotek, hrdina a doplněk k přilbě (g)
// bonusy: hp, melee, ranged, spd, build (čas výroby), base (hradby), tur (cena věží), gold (zlato za zabití),
//         heavy (zdraví těžkých jednotek), cheap (cena jednotek), spcd (dobití speciálu)
const AGEFAC = [
  [ { n: 'Lovci mamutů', ic: '🦣', d: 'Vyvážený kmen, o 10 % víc zlata za zabití.', gold: 1.1, u: ['Jeskyňák', 'Prakovník', 'Mamutí jezdec'], hero: 'Náčelník' },
    { n: 'Kmen Vlka', ic: '🐺', d: 'Jednotky jsou o 20 % rychlejší.', spd: 1.2, u: ['Vlčí lovec', 'Vrhač kamenů', 'Vlčí jezdec'], hero: 'Vlčí vůdce', g: 'wolf' },
    { n: 'Kmen Medvěda', ic: '🐻', d: 'Jednotky mají o 15 % víc zdraví.', hp: 1.15, u: ['Medvědí bojovník', 'Prakovník', 'Medvědí jezdec'], hero: 'Medvědí náčelník', g: 'bear' },
    { n: 'Kmen Orla', ic: '🦅', d: 'Střelci útočí o 25 % silněji.', ranged: 1.25, u: ['Lovec', 'Orlí oko', 'Pratuří jezdec'], hero: 'Šaman', g: 'eagle' } ],
  [ { n: 'Rytíři', ic: '🛡️', d: 'Hradby o 25 % silnější, věže o 20 % levnější.', base: 1.25, tur: 0.8, u: ['Šermíř', 'Lukostřelec', 'Rytíř'], hero: 'Král' },
    { n: 'Vikingové', ic: '🪓', d: 'Jednotky mají o 20 % víc zdraví.', hp: 1.2, u: ['Berserkr', 'Vrhač seker', 'Jarlův jezdec'], hero: 'Jarl', g: 'viking' },
    { n: 'Samurajové', ic: '🗡️', d: 'Útok zblízka +25 % a o 10 % rychlejší výroba.', melee: 1.25, build: 0.9, u: ['Samuraj', 'Lučištník', 'Jízdní samuraj'], hero: 'Šógun', g: 'samurai' },
    { n: 'Mongolové', ic: '🏹', d: 'O 20 % rychlejší, střelci +15 % útok.', spd: 1.2, ranged: 1.15, u: ['Válečník', 'Jízdní lučištník', 'Těžký jezdec'], hero: 'Chán', g: 'mongol' } ],
  [ { n: 'Mušketýři', ic: '🎩', d: 'Střelci útočí o 20 % silněji.', ranged: 1.2, u: ['Duelant', 'Mušketýr', 'Kanonýr'], hero: 'Generál' },
    { n: 'Konkvistadoři', ic: '⚔️', d: 'Zdraví +15 % a útok zblízka +15 %.', hp: 1.15, melee: 1.15, u: ['Rodelero', 'Arkebuzír', 'Dělostřelec'], hero: 'Konkvistador', g: 'conq' },
    { n: 'Piráti', ic: '🏴‍☠️', d: 'O 25 % víc zlata za zabití a o 10 % rychlejší.', gold: 1.25, spd: 1.1, u: ['Korzár', 'Pirát s muškou', 'Lodní dělo'], hero: 'Kapitán', g: 'pirate' },
    { n: 'Janičáři', ic: '🌙', d: 'Hradby o 20 % silnější, věže o 20 % levnější.', base: 1.2, tur: 0.8, u: ['Janičář', 'Střelec', 'Bombardér'], hero: 'Paša', g: 'janissary' } ],
  [ { n: 'Pěchota', ic: '🪖', d: 'Hradby +15 % a zdraví jednotek +10 %.', base: 1.15, hp: 1.1, u: ['Pěšák', 'Kulometčík', 'Tank'], hero: 'Plukovník' },
    { n: 'Obrněná divize', ic: '🛡', d: 'Těžké jednotky mají o 35 % víc zdraví.', heavy: 1.35, u: ['Granátník', 'Kulometčík', 'Těžký tank'], hero: 'Tankové eso', g: 'tank' },
    { n: 'Partyzáni', ic: '🌲', d: 'O 20 % rychlejší a jednotky o 10 % levnější.', spd: 1.2, cheap: 0.9, u: ['Partyzán', 'Odstřelovač', 'Obrněný vůz'], hero: 'Velitel odboje', g: 'partisan' },
    { n: 'Výsadkáři', ic: '🪂', d: 'Speciál se dobíjí o 30 % rychleji, útok zblízka +10 %.', spcd: 0.7, melee: 1.1, u: ['Výsadkář', 'Kulometčík', 'Tank'], hero: 'Major', g: 'para' } ],
  [ { n: 'Kyborgové', ic: '🤖', d: 'Jednotky mají o 20 % víc zdraví.', hp: 1.2, u: ['Boží čepel', 'Blaster', 'Válečný stroj'], hero: 'Kyborg' },
    { n: 'Mimozemšťané', ic: '👽', d: 'Střelci útočí o 25 % silněji.', ranged: 1.25, u: ['Xeno bojovník', 'Plazmový střelec', 'Tripod'], hero: 'Vládce úlu', g: 'alien' },
    { n: 'Roboti', ic: '🦾', d: 'Výroba je o 25 % rychlejší.', build: 0.75, u: ['Droid', 'Laserový droid', 'Bojový mech'], hero: 'Omega', g: 'robot' },
    { n: 'Vesmírní mariňáci', ic: '🚀', d: 'Útok zblízka +25 % a hradby +20 %.', melee: 1.25, base: 1.2, u: ['Mariňák', 'Pulzní puška', 'Útočný mech'], hero: 'Komandér', g: 'marine' } ],
];
const FAC_PICK = 12;                          // s na výběr národu po startu a po evoluci
const facAt = (p, a) => AGEFAC[a][(p.af && p.af[a]) || 0] || AGEFAC[a][0];
const facOf = s => facAt(S.pl[s], S.pl[s].age);
const GB = p => p.gb || GB0;                     // bonusy generála (strom dovedností, území, výbava) – jen hráč proti počítači
const GB0 = { hp: 1, dmg: 1, cost: 1, build: 1, base: 1, tur: 1, gold: 1, xp: 1, sgold: 1, heroHp: 1, heroD: 1 };
const turCost = (p, d) => Math.round(d.c * (facAt(p, p.age).tur || 1) * GB(p).tur);
const unitCost = (p, ty) => Math.round((ty <= 2 ? AGES[p.age].units[ty].c * (facAt(p, p.age).cheap || 1)
  : ty === 6 ? SPECS[p.age][(p.af && p.af[p.age]) | 0].c * (facAt(p, p.age).cheap || 1) : uDef(p.age, ty).c) * (ty === 4 ? 1 : GB(p).cost));
const heroName = p => facAt(p, p.age).hero || HEROES[p.age].n;
const cleanAf = a => Array.from({ length: 5 }, (_, i) => Math.min(3, Math.max(0, (Array.isArray(a) ? a[i] : 0) | 0)));
// zvolí národ pro aktuální věk; bonus k hradbám se přepočítá
function setAgeFac(p, i) {
  i = Math.min(3, Math.max(0, i | 0));
  p.af = p.af || [0, 0, 0, 0, 0]; p.af[p.age] = i;
  const nb = AGEFAC[p.age][i].base || 1, ob = p.bm || 1;
  p.mhp = Math.round(p.mhp / ob * nb); p.hp = Math.min(p.mhp, Math.round(p.hp / ob * nb)); p.bm = nb;
}
const HOLD = 300, RALLY = 130;
// tajný EXTREME BRUTAL (7× klepnout na zlaté vejce v profilu): víc krve + vztek v kampani
const EXTREME = () => !!(SET.extreme && SET.egg && SET.brutal);
const BRUT = () => !!SET.brutal;
const RAGE_CD = 30;                          // s – dobití vzteku po smrti rozzuřeného vojáka               // linie pro „drž pozici“ a shromaždiště při ústupu (od středu základny)
const ORDERS = [{ n: 'Útok', ic: '⚔️' }, { n: 'Drž', ic: '🛡️' }, { n: 'Ústup', ic: '↩️' }];          // s: návrat po smrti, dobití úderu
// vylepšení: útok jednotek i věží, zdraví jednotek, hradby základny (max 5 úrovní)
const UPS = [{ n: 'Útok', ic: '⚔️', k: 0.12 }, { n: 'Zdraví', ic: '❤️', k: 0.15 }, { n: 'Hradby', ic: '🏰', k: 0.2 }];
const UP_COST = [100, 400, 1500, 5000, 16000], UP_MAX = 5;
const upCost = (p, k) => UP_COST[p.age] * (p.up[k] + 1);
const upMax = p => Math.min(UP_MAX, p.age + 1);        // strop úrovně roste s věkem (jinak by šlo levně vymaxovat v pravěku)
// bossové kampaně (konec každého věku): sw = plošný úder zblízka, y = výška těla nad zemí (letci)
const BOSSES = [
  { n: 'Šavlozubý tygr', c: 400, hp: 2600, d: 75, r: 30, s: 30, cd: 1.4, t: 0, sw: 60, y: 50 },
  { n: 'Drak', c: 1600, hp: 5200, d: 110, r: 95, s: 24, cd: 1.5, t: 0, sw: 85, y: 110 },
  { n: 'Leonardův obrněný vůz', c: 4500, hp: 5000, d: 150, r: 210, s: 16, cd: 2.6, t: 0, p: 'shell', sp: 40, y: 18 },
  { n: 'Obří tank', c: 20000, hp: 10000, d: 330, r: 190, s: 15, cd: 2.4, t: 0, p: 'shell', sp: 45, y: 50 },
  { n: 'Titán', c: 55000, hp: 20000, d: 520, r: 210, s: 15, cd: 2.0, t: 0, p: 'ion', sp: 50, y: 110 },
];
// speciální jednotka národa (ty 6): v každém věku jedna za každý národ (pořadí jako AGEFAC), ab = schopnost
const SPEC_AB = { charge: 'Nájezd – první úder je násobně silnější', fast: 'Velmi rychlý', berserk: 'Čím méně zdraví, tím silněji útočí',
  sniper: 'Obrovský dosah', tank: 'Velmi odolný', dodge: 'Uhne 40 % zásahů', bomb: 'Výbušné střely', healer: 'Léčí spojence kolem sebe',
  thief: 'Zásahy kradou zlato', drum: 'Spojenci kolem útočí o 40 % silněji', flame: 'Plamen zasáhne víc nepřátel naráz',
  boom: 'Při smrti vybuchne', leech: 'Zásahy ho léčí' };
const SPEC_IC = { charge: '🐎', fast: '💨', berserk: '😡', sniper: '🎯', tank: '🛡️', dodge: '🥷', bomb: '💣', healer: '✚', thief: '💰', drum: '🥁', flame: '🔥', boom: '💥', leech: '🩸' };
const SPECS = AGES.map((A, a) => {
  const [m, r, h] = A.units, b = { c: Math.round(h.c * 0.75), hp: Math.round(h.hp * 0.75), d: Math.round(m.d * 1.8), r: 22, s: 46, cd: 1.0, t: Math.max(2.5, h.t * 0.8) };
  const mk = (n, ab, o = {}) => ({ ...b, n, ab, ...o });
  const snip = p => ({ r: Math.round(r.r * 1.6), d: Math.round(r.d * 2.6), cd: 1.6, hp: Math.round(b.hp * 0.55), p });
  return [
    [mk('Mamutí lovec', 'charge', { s: 50, c: 60, hp: Math.round(b.hp * 0.93), chg: 2, t: 3 }), mk('Vlčí běžec', 'fast', { s: 82, hp: Math.round(b.hp * 0.95) }), mk('Zuřivec', 'berserk'), mk('Orlí střelec', 'sniper', { ...snip('arrow'), d: Math.round(r.d * 1.7) })],
    [mk('Templář', 'tank', { hp: Math.round(b.hp * 1.8), d: Math.round(b.d * 0.75), s: 38 }), mk('Berserkr', 'berserk'), mk('Ninja', 'dodge', { s: 70, hp: Math.round(b.hp * 0.7) }), mk('Chánova garda', 'charge', { s: 70 })],
    [mk('Granátník', 'bomb', { r: 170, p: 'shell', sp: 40, d: Math.round(r.d * 1.75), cd: 1.8, hp: Math.round(b.hp * 0.7) }), mk('Kněz', 'healer', { d: Math.round(b.d * 0.5), hp: Math.round(b.hp * 1.3) }), mk('Pirát s papouškem', 'thief', { d: Math.round(b.d * 1.2), hp: Math.round(b.hp * 1.15) }), mk('Mehter bubeník', 'drum', { d: Math.round(b.d * 0.6), c: Math.round(b.c * 0.6), hp: Math.round(b.hp * 1.4) })],
    [mk('Plamenometčík', 'flame', { r: 70, sw: 45, d: Math.round(b.d * 0.7) }), mk('Ženista', 'healer', { d: Math.round(b.d * 0.5), hp: Math.round(b.hp * 1.3) }), mk('Sabotér', 'boom', { s: 56 }), mk('Odstřelovač', 'sniper', snip('bullet'))],
    [mk('Štítový dron', 'tank', { hp: Math.round(b.hp * 1.8), d: Math.round(b.d * 0.75), s: 38 }), mk('Parazit', 'leech', { hp: Math.round(b.hp * 1.2), d: Math.round(b.d * 1.6) }), mk('Samodestrukční droid', 'boom', { s: 64, hp: Math.round(b.hp * 1.1) }), mk('Medik', 'healer', { d: Math.round(b.d * 0.5), hp: Math.round(b.hp * 1.5) })],
  ][a];
});
const uDef = (a, ty, f) => ty === 6 ? SPECS[a][f | 0] : ty === 5 ? BOSSES[a] : ty === 3 ? SUPER : ty === 4 ? HEROES[a] : AGES[a].units[ty];
const uDefU = u => uDef(u.a, u.ty, u.f);
// šířka jednotky v boji (rozestupy, dosah); jízdní zvířata podle velikosti – mamut je mnohem delší než vlk
// fronta stavby: v týmu (dva hráči na jedné straně) je delší
const qMax = p => p && p.w ? 9 : 5;
const unitW = (ty, s, a, m) => ty === 2 && a <= 1 && s != null ? mountW(s, a, m) : ty === 5 ? 96 : ty === 2 ? 64 : ty === 3 ? 34 : ty === 4 ? 32 : ty === 6 ? 30 : 26;
const mountMod = (s, m) => { const p = S.pl[s]; return (MOUNT[mountKind({ af: p.afm ? p.afm[m | 0] : p.af })] || {}).mod || null; };
const mountW = (s, a, m) => { const p = S.pl[s]; return (MOUNT[a === 1 ? 'horse' : mountKind({ af: p.afm ? p.afm[m | 0] : p.af })] || {}).gw || 64; };
const unitY = u => u.ty === 5 ? BOSSES[u.a].y : u.ty >= 2 ? 34 : 28;          // kam míří střely
const atkMul = s => 1 + UPS[0].k * S.pl[s].up[0];
const rnd = (a, b) => a + Math.random() * (b - a);

// cheaty pro testování (menu v cheats.js): zapnuté přepínače v SET.cheat
const CHEAT = () => (typeof SET !== 'undefined' && SET.cheat) || {};
const cheatOn = () => Object.values(CHEAT()).some(Boolean);
