'use strict';
// =====================================================================
//  BRUTAL AGES
//  Hostitel (nebo hra proti PC) simuluje celou hru, host posílá
//  soupeři snapshoty přes WebRTC (PeerJS), soupeř posílá jen příkazy.
// =====================================================================

// ---------- Konstanty světa ----------
const W = 1300, H = 600, GY = 505, HUD = 112;   // GY = úroveň země (pod ní je hlína se zakopanými kostmi)
const BX = [62, W - 62];          // středy základen
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
      { n: 'Kamenomet',  c: 100, d: 10, r: 330, cd: 1.1,  p: 'stone' },
      { n: 'Prakostroj', c: 200, d: 7,  r: 350, cd: 0.55, p: 'stone' },
      { n: 'Úlomet',     c: 500, d: 28, r: 340, cd: 1.5,  p: 'egg', sp: 30 }],
    sp: { n: 'Meteority', d: 50, count: 16, p: 'meteor' } },
  { name: 'Středověk', xp: 14000, baseHp: 1100,
    units: [
      { n: 'Šermíř',      c: 50,  hp: 110, d: 35, r: 18,  s: 42, cd: 1.0, t: 1.5 },
      { n: 'Lukostřelec', c: 95,  hp: 85,  d: 16, r: 170, s: 42, cd: 1.1, t: 1.8, p: 'arrow' },
      { n: 'Rytíř',       c: 320, hp: 420, d: 60, r: 24,  s: 48, cd: 1.2, t: 4.0 }],
    turrets: [
      { n: 'Katapult',     c: 650,  d: 30, r: 360, cd: 1.6, p: 'rock', sp: 30 },
      { n: 'Ohnivé šípy',  c: 550,  d: 18, r: 380, cd: 0.7, p: 'fire' },
      { n: 'Kotel oleje',  c: 1000, d: 55, r: 220, cd: 1.8, p: 'oil', sp: 45 }],
    sp: { n: 'Déšť šípů', d: 85, count: 18, p: 'arrow' } },
  { name: 'Renesance', xp: 45000, baseHp: 2000,
    units: [
      { n: 'Duelant',  c: 180,  hp: 230, d: 70,  r: 20,  s: 44, cd: 0.9, t: 2.0 },
      { n: 'Mušketýr', c: 400,  hp: 170, d: 40,  r: 190, s: 42, cd: 1.3, t: 2.5, p: 'bullet' },
      { n: 'Kanonýr',  c: 1300, hp: 620, d: 120, r: 150, s: 30, cd: 2.2, t: 5.0, p: 'shell', sp: 15 }],
    turrets: [
      { n: 'Dělo',          c: 1500, d: 60, r: 400, cd: 1.6, p: 'shell' },
      { n: 'Dvojdělo',      c: 2200, d: 50, r: 400, cd: 0.9, p: 'shell' },
      { n: 'Výbušné dělo',  c: 6000, d: 120, r: 420, cd: 2.0, p: 'shell', sp: 40 }],
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
const SPEC_AB = { charge: 'Nájezd – první úder je trojnásobný', fast: 'Velmi rychlý', berserk: 'Čím méně zdraví, tím silněji útočí',
  sniper: 'Obrovský dosah', tank: 'Velmi odolný', dodge: 'Uhne 40 % zásahů', bomb: 'Výbušné střely', healer: 'Léčí spojence kolem sebe',
  thief: 'Zásahy kradou zlato', drum: 'Spojenci kolem útočí o 40 % silněji', flame: 'Plamen zasáhne víc nepřátel naráz',
  boom: 'Při smrti vybuchne', leech: 'Zásahy ho léčí' };
const SPEC_IC = { charge: '🐎', fast: '💨', berserk: '😡', sniper: '🎯', tank: '🛡️', dodge: '🥷', bomb: '💣', healer: '✚', thief: '💰', drum: '🥁', flame: '🔥', boom: '💥', leech: '🩸' };
const SPECS = AGES.map((A, a) => {
  const [m, r, h] = A.units, b = { c: Math.round(h.c * 0.75), hp: Math.round(h.hp * 0.75), d: Math.round(m.d * 1.8), r: 22, s: 46, cd: 1.0, t: Math.max(2.5, h.t * 0.8) };
  const mk = (n, ab, o = {}) => ({ ...b, n, ab, ...o });
  const snip = p => ({ r: Math.round(r.r * 1.6), d: Math.round(r.d * 2.6), cd: 1.6, hp: Math.round(b.hp * 0.55), p });
  return [
    [mk('Mamutí lovec', 'charge', { s: 54 }), mk('Vlčí běžec', 'fast', { s: 82, hp: Math.round(b.hp * 0.95) }), mk('Zuřivec', 'berserk'), mk('Orlí střelec', 'sniper', { ...snip('arrow'), d: Math.round(r.d * 1.7) })],
    [mk('Templář', 'tank', { hp: Math.round(b.hp * 1.8), d: Math.round(b.d * 0.75), s: 38 }), mk('Berserkr', 'berserk'), mk('Ninja', 'dodge', { s: 70, hp: Math.round(b.hp * 0.7) }), mk('Chánova garda', 'charge', { s: 70 })],
    [mk('Granátník', 'bomb', { r: 170, p: 'shell', sp: 40, d: Math.round(r.d * 1.75), cd: 1.8, hp: Math.round(b.hp * 0.7) }), mk('Kněz', 'healer', { d: Math.round(b.d * 0.5), hp: Math.round(b.hp * 1.3) }), mk('Pirát s papouškem', 'thief', { d: Math.round(b.d * 1.2), hp: Math.round(b.hp * 1.15) }), mk('Mehter bubeník', 'drum', { d: Math.round(b.d * 0.6), c: Math.round(b.c * 0.6), hp: Math.round(b.hp * 1.4) })],
    [mk('Plamenometčík', 'flame', { r: 70, sw: 45, d: Math.round(b.d * 0.7) }), mk('Ženista', 'healer', { d: Math.round(b.d * 0.5), hp: Math.round(b.hp * 1.3) }), mk('Sabotér', 'boom', { s: 56 }), mk('Odstřelovač', 'sniper', snip('bullet'))],
    [mk('Štítový dron', 'tank', { hp: Math.round(b.hp * 1.8), d: Math.round(b.d * 0.75), s: 38 }), mk('Parazit', 'leech', { hp: Math.round(b.hp * 1.2), d: Math.round(b.d * 1.6) }), mk('Samodestrukční droid', 'boom', { s: 64, hp: Math.round(b.hp * 1.1) }), mk('Medik', 'healer', { d: Math.round(b.d * 0.5), hp: Math.round(b.hp * 1.5) })],
  ][a];
});
const uDef = (a, ty, f) => ty === 6 ? SPECS[a][f | 0] : ty === 5 ? BOSSES[a] : ty === 3 ? SUPER : ty === 4 ? HEROES[a] : AGES[a].units[ty];
const uDefU = u => uDef(u.a, u.ty, u.f);
const unitW = ty => ty === 5 ? 96 : ty === 2 ? 64 : ty === 3 ? 34 : ty === 4 ? 32 : ty === 6 ? 30 : 26;
const unitY = u => u.ty === 5 ? BOSSES[u.a].y : u.ty >= 2 ? 34 : 28;          // kam míří střely
const atkMul = s => 1 + UPS[0].k * S.pl[s].up[0];
const rnd = (a, b) => a + Math.random() * (b - a);

// =====================================================================
//  SIMULACE (běží jen u hostitele / v sólo hře)
// =====================================================================
let S = null;

// obtížnost počítače: rychlost rozhodování, bonus zlata/XP za zabití, zpoždění evoluce, „chytrost“
const DIFF = [
  { n: 'Lehká',    think: [1.4, 2.0],   gm: 0.75, xm: 0.8, evo: 25, smart: 0,   spMin: 6, gold: START_GOLD },
  { n: 'Normální', think: [0.7, 1.1],   gm: 1.0,  xm: 1.0, evo: 6,  smart: 0.3, spMin: 4, gold: START_GOLD },
  { n: 'Těžká',    think: [0.45, 0.7],  gm: 1.35, xm: 1.25, evo: 0, smart: 0.7, spMin: 3, gold: 250 },
  { n: 'Nemožná',  think: [0.3, 0.45],  gm: 1.8,  xm: 1.6, evo: 0,  smart: 1,   spMin: 2, gold: 450 },
  { n: 'Šílená',   think: [0.2, 0.3],   gm: 2.4,  xm: 2.0, evo: 0,  smart: 1,   spMin: 1, gold: 800 },   // odemkne se po dohrání kampaně
];

function newPlayer() {
  return { gold: START_GOLD, xp: 0, age: 0, hp: AGES[0].baseHp, mhp: AGES[0].baseHp,
    slots: 1, tur: [], q: [], qt: 0, spcd: 0,
    gm: 1, xm: 1, kills: 0, spk: 0, spBest: 0, supers: 0, built: 0, up: [0, 0, 0], hcd: 0, acd: 0, ord: 0, emb: 0,
    af: [0, 0, 0, 0, 0], pref: [0, 0, 0, 0, 0], bm: 1, pick: 0 };
}
function newState() { return { pl: [newPlayer(), newPlayer()], units: [], proj: [], nid: 1, over: -1, ev: [], time: 0, mods: null, chal: null, camp: null, daily: 0, speed: 1, events: false, evT: 75, dark: 0, chest: null }; }

// --- události v bitvě (jen pro hostitele / hru proti počítači) ---
const EVENTS = { wave: '', storm: 'Písečná bouře – střelci nedostřelí daleko!', trex: '🦖 T-REX SE VRÁTIL!', quake: 'Zemětřesení!', chest: 'Truhla se zlatem!', merc: 'Žoldáci se přidali k slabším!', eclipse: 'Zatmění slunce', meteors: 'Déšť meteoritů!' };
// „palba z nebe“ podle doby – zasáhne obě strany (nezaměňovat se speciálem počítače)
const SKYFIRE = ['Déšť meteoritů – zasáhne obě strany!', 'Zbloudilé šípy – zasáhnou obě strany!', 'Zbloudilá dělostřelba – zasáhne obě strany!',
  'Zbloudilý nálet – zasáhne obě strany!', 'Porucha orbitálního laseru – zasáhne obě strany!'];
function battleEvent() {
  const k = Math.random() < 0.07 ? 'trex' : ['quake', 'chest', 'merc', 'eclipse', 'meteors'][(Math.random() * 5) | 0];
  if (k === 'trex') { const dir = Math.random() < 0.5 ? 1 : -1; S.trex = { x: dir > 0 ? -140 : W + 140, dir, hit: [] }; S.ev.push([W / 2, 200, 'roar']); }
  const ea = Math.max(S.pl[0].age, S.pl[1].age);
  S.ev.push([W / 2, 200, 'evt', k, ea]);
  if (k === 'quake') for (const u of S.units) hurt(u, u.mx * 0.15, -1);
  else if (k === 'chest') S.chest = { x: rnd(480, 820), g: Math.round(AGE_GOLD[Math.max(S.pl[0].age, S.pl[1].age)] * 1.5) };
  else if (k === 'merc') {
    const n0 = S.units.filter(u => u.side === 0).length, n1 = S.units.filter(u => u.side === 1).length, s = n0 <= n1 ? 0 : 1, p = S.pl[s];
    for (let i = 0; i < 3; i++) p.q.push({ a: p.age, ty: i === 2 ? 0 : 1 });
  } else if (k === 'eclipse') S.dark = 20;
  else {
    const sp = AGES[ea].sp, beam = sp.p === 'beam';
    for (let i = 0; i < 12; i++)
      S.proj.push({ id: S.nid++, fall: 1, x: rnd(220, 1080), y: -40 - Math.random() * (beam ? 900 : 600), vx: beam ? 0 : rnd(-60, 60), vy: beam ? 1400 : 480,
        d: sp.d * 0.8, side: -1, p: sp.p, sp: 40 });
  }
}

function applyCmd(s, c) {
  if (!S || S.over >= 0 || !c) return;
  const p = S.pl[s], M = S.mods || {};
  switch (c.a) {
    case 'buy': {
      if (c.ty === 3 && p.age < 4) return;
      if (s === 0 && M.only != null && c.ty !== M.only) return;
      if (![0, 1, 2, 3, 6].includes(c.ty)) return;
      const f = (p.af && p.af[p.age]) | 0, d = uDef(p.age, c.ty, f), k = d && unitCost(p, c.ty);
      if (!d || p.gold < k || p.q.length >= 5) return;
      p.gold -= k; p.q.push({ a: p.age, ty: c.ty, f }); break;
    }
    case 'turret': {
      const d = AGES[p.age].turrets[c.i];
      if (s === 0 && M.noTower) return;
      if (!d || p.tur.length >= p.slots || p.gold < turCost(p, d)) return;
      p.gold -= turCost(p, d); p.tur.push({ a: p.age, i: c.i, cd: 0 }); p.built++; break;
    }
    case 'slot': {
      if (p.slots >= 4) return;
      const k = SLOT_COST[p.slots - 1];
      if (p.gold < k) return;
      p.gold -= k; p.slots++; break;
    }
    case 'sell': {
      const t = p.tur.pop();
      if (t) p.gold += Math.floor(AGES[t.a].turrets[t.i].c / 2);
      break;
    }
    case 'special': {
      if (p.spcd > 0) return;
      p.spcd = SP_CD * (facOf(s).spcd || 1); p.spk = 0; special(s); S.ev.push([W / 2, 200, 'sp', s]); break;
    }
    case 'rage': {
      if (!S.rage || p.rgcd > 0 || S.units.some(u => u.side === s && u.rage)) return;
      const dir = s ? -1 : 1, u = S.units.filter(u => u.side === s && u.ty <= 2 && !u.dead).sort((a, b) => (b.x - a.x) * dir)[0];
      if (!u) return;
      u.rage = 1; u.mx = Math.round(u.mx * 1.25); u.hp = Math.round(u.hp * 1.25);
      S.ev.push([u.x, GY - 50, 'rage', s]); break;
    }
    case 'fac': { if (p.pick > 0) { setAgeFac(p, c.i); p.pick = 0; } break; }
    case 'ord': { const o = c.o | 0; if (o >= 0 && o < 3) p.ord = o; break; }
    case 'up': {
      const k = c.k | 0;
      if (!UPS[k] || p.up[k] >= upMax(p) || p.gold < upCost(p, k)) return;
      p.gold -= upCost(p, k); p.up[k]++;
      if (k === 2) { const add = AGES[p.age].baseHp * UPS[2].k; p.mhp += add; p.hp += add; }
      S.ev.push([BX[s], GY - 120, 'up']); break;
    }
    case 'hero': {
      const h = S.units.find(u => u.side === s && u.ty === 4);
      if (h) {                                            // ničivý úder kolem hrdiny
        if (p.acd > 0) return;
        p.acd = HERO_ACD;
        const dir = s ? -1 : 1, x = h.x + dir * 45;
        dmgSrc = 'h'; splash(x, 90, uDef(h.a, 4).d * 2.5 * atkMul(s) * GB(p).heroD, s);
        h.at = 1; S.ev.push([x, GY - 20, 'slam', s]); break;
      }
      const d = HEROES[p.age];
      if (p.hcd > 0 || p.gold < d.c || !spawnFree(s, 4)) return;
      p.gold -= d.c; spawn(s, { a: p.age, ty: 4 }); p.acd = 3; break;
    }
    case 'evolve': {
      if (M.noEvo || p.age >= 4 || p.xp < AGES[p.age].xp) return;
      p.age++;
      const nm = AGES[p.age].baseHp * (1 + UPS[2].k * p.up[2]);
      p.hp += nm - p.mhp; p.mhp = nm; p.bm = 1;
      setAgeFac(p, p.pref[p.age]); p.pick = FAC_PICK;     // nový věk = nový výběr národa
      S.ev.push([BX[s], GY - 90, 'evo']); break;
    }
  }
}

function special(s) {
  const sp = AGES[S.pl[s].age].sp, dir = s ? -1 : 1, beam = sp.p === 'beam';
  for (let i = 0; i < sp.count; i++) {
    const x = rnd(200, 1100);
    S.proj.push({ id: S.nid++, fall: 1, x: beam ? x : x - dir * 80, y: -30 - Math.random() * (beam ? 900 : 650),
      vx: beam ? 0 : dir * 80, vy: beam ? 1400 : 520, d: sp.d, side: s, p: sp.p, sp: 40 });
  }
}

function spawnFree(s, ty) {
  const w = unitW(ty);
  return !S.units.some(u => u.side === s && Math.abs(u.x - SPAWN[s]) < (u.w + w) / 2 + 2);
}
function spawn(s, q) {
  const d = uDef(q.a, q.ty, q.f), g = GB(S.pl[s]);
  const F = facOf(s), hp = Math.round(d.hp * (1 + UPS[1].k * S.pl[s].up[1]) * (F.hp || 1) * (q.ty === 2 ? F.heavy || 1 : 1) * (q.ty === 4 ? g.heroHp * ((g.gear && g.gear[q.a][0]) || 1) : g.hp));
  S.units.push({ id: S.nid++, side: s, a: q.a, ty: q.ty, f: q.f | 0, x: SPAWN[s], hp, mx: hp,
    w: unitW(q.ty), st: 0, at: 0, cd: 0.3 });
  if (S.st) { S.st.made[s]++; if (q.ty === 6) S.st.spec[s]++; }
  if (q.ty === 3) S.pl[s].supers++;
  // pokřik národa (hráč ho slyší jen občas, hrdina a supervoják vždy)
  const p = S.pl[s]; S.ev.push([SPAWN[s], GY - 40, 'cry', s, q.a * 4 + ((p.af && p.af[q.a]) | 0), q.ty]);
}

let dmgSrc = 'u';                                  // odkud škoda je (u jednotky, t věže, s speciál, h hrdina) – pro statistiky
function hurt(t, dmg, by, fromSpecial) {
  if (t.dead) return;
  if (t.ty === 6 && uDefU(t).ab === 'dodge' && Math.random() < 0.4) return;   // ninja uhne
  if (S.st && by >= 0) S.st.dmg[by][fromSpecial ? 's' : dmgSrc] += Math.min(dmg, Math.max(0, t.hp));
  t.hp -= dmg;
  if (t.hp <= 0) {
    t.dead = 1;
    const d = uDefU(t), p = S.pl[by], g = p && GB(p);
    if (t.ty === 6 && d.ab === 'boom') { const src = dmgSrc; dmgSrc = 'u'; splash(t.x, 80, d.d * 4, t.side); dmgSrc = src; S.ev.push([t.x, GY - 20, 'boom']); }
    if (p) {
      const loot = g.loot && (t.ty === 2 || t.ty === 5) ? 2 : 1, gg = Math.round(d.c * KILL_GOLD * p.gm * (facOf(by).gold || 1) * g.gold * loot);
      p.gold += gg; if (S.st) S.st.gold[by] += gg;
      p.xp += Math.round(d.c * KILL_XP * p.xm * g.xp);
      p.kills++;
      if (fromSpecial) { p.spk++; p.spBest = Math.max(p.spBest, p.spk); }
    }
    if (t.ty === 4) S.pl[t.side].hcd = HERO_CD;
    if (t.rage) S.pl[t.side].rgcd = RAGE_CD;
    S.ev.push([t.x, GY - 22, 'die', t.side, t.a, t.ty]);
  }
}
function hitBase(s, dmg, by) {
  const p = S.pl[s];
  if (S.over >= 0 || (S.surv && s === 1)) return;          // v přežití je nepřátelská základna nezničitelná
  p.hp -= dmg;
  S.pl[by].xp += Math.round(dmg * 0.5);
  if (S.st) S.st.dmg[by].b += dmg;
  if (GB(p).bastion && !p.bastUsed && p.hp > 0 && p.hp < p.mhp * 0.2) { p.bastUsed = 1; p.hp = p.mhp * 0.5; S.ev.push([BX[s], GY - 90, 'bast', s]); }
  if (p.hp <= 0) { p.hp = 0; S.over = by; S.ev.push([BX[s], GY - 80, 'boom']); }
}
function splash(x, r, d, side, fromSpecial) {
  for (const u of S.units) if (u.side !== side && !u.dead && Math.abs(u.x - x) <= r + u.w / 2) hurt(u, d, side, fromSpecial);
}
function slotPos(s, k) { return { x: BX[s] + (s ? -1 : 1) * 70, y: GY - 172 + k * 36 }; }

function attack(u, d0, tgt, dir) {
  const F = facOf(u.side), WP = u.ty === 1 && F.g && WEAP[F.g], pp = (WP && WP.proj) || d0.p, P = S.pl[u.side], g = GB(P);
  let k = (u.ty === 4 ? g.heroD * ((g.gear && g.gear[u.a][1]) || 1) : g.dmg) * (P.cryT > 0 ? 1.3 : 1);
  if (u.ty === 6) {                                    // schopnosti speciálních jednotek
    if (d0.ab === 'charge' && !u.hit) k *= 3;
    if (d0.ab === 'berserk') k *= 2 - u.hp / u.mx;
  }
  if (S.units.some(a => a.side === u.side && a !== u && a.ty === 6 && !a.dead && Math.abs(a.x - u.x) < 160 && uDefU(a).ab === 'drum')) k *= 1.4;
  u.hit = 1;
  const d = { ...d0, d: d0.d * atkMul(u.side) * ((d0.p ? F.ranged : F.melee) || 1) * (u.rage ? 1.3 : 1) * k };
  dmgSrc = u.ty === 4 ? 'h' : 'u';
  if (d.p) {
    const y0 = GY - (u.ty === 5 ? d.y : u.ty === 2 ? 50 : u.ty === 3 ? 62 : 38), x0 = u.x + dir * (u.w / 2 + 4);
    const base = tgt === 'base';
    S.proj.push({ id: S.nid++, x: x0, y: y0, tid: base ? -1 : tgt.id,
      tx: base ? BF[1 - u.side] - dir * 15 : tgt.x, ty: base ? GY - 60 : GY - 22,
      d: d.d, side: u.side, p: pp, sp: d.sp || 0, v: SPD[pp], src: u.ty === 4 ? 'h' : 'u' });
    if (pp !== 'stone' && pp !== 'arrow' && pp !== 'axe') S.ev.push([x0 + dir * 6, y0, 'muz']);
  } else if (tgt === 'base') {
    hitBase(1 - u.side, d.d, u.side); S.ev.push([BF[1 - u.side], GY - 30, 'hit']);
  } else if (d.sw) {                                     // boss: plošný úder (dupnutí, plamen)
    splash(tgt.x, d.sw, d.d, u.side); S.ev.push([tgt.x, GY - 20, 'slam', u.side]);
  } else {
    const hp0 = tgt.hp;
    hurt(tgt, d.d, u.side); S.ev.push([tgt.x - dir * 6, GY - 26, u.rage ? 'rhit' : 'hit']);
    if (u.ty === 6) {
      const done = Math.max(0, hp0 - Math.max(0, tgt.hp));
      if (d0.ab === 'leech') u.hp = Math.min(u.mx, u.hp + done);
      if (d0.ab === 'thief') { const g2 = Math.round(done * 0.35); P.gold += g2; if (S.st) S.st.gold[u.side] += g2; }
    }
  }
}

// vlastnosti bojiště – platí pro obě strany
const FIELD_FX = { swamp: { spd: 0.85, n: 'Bažina: všichni jsou o 15 % pomalejší' }, forest: { rng: 0.85, n: 'Les: střelci mají o 15 % menší dosah' },
  winter: { spd: 0.92, n: 'Sníh: všichni jsou o 8 % pomalejší' }, desert: { storm: 1, n: 'Poušť: písečné bouře občas zkrátí dosah střelců' },
  volcano: { lava: 1, n: 'Sopka: ze země občas vytryskne láva' }, meadow: { n: 'Louka: žádná omezení' } };
const fieldSpd = u => (FIELD_FX[S.field] || {}).spd || 1;
const fieldRng = () => ((FIELD_FX[S.field] || {}).rng || 1) * (S.storm > 0 ? 0.7 : 1);
function fieldTick(dt) {
  const F = FIELD_FX[S.field] || {};
  if (S.storm > 0) S.storm -= dt;
  if (F.storm && (S.stormT = (S.stormT ?? rnd(50, 80)) - dt) <= 0) { S.stormT = rnd(70, 110); S.storm = 12; S.ev.push([W / 2, 200, 'evt', 'storm']); }
  if (F.lava && (S.lavaT = (S.lavaT ?? rnd(30, 50)) - dt) <= 0) {
    S.lavaT = rnd(35, 60);
    const x = rnd(300, W - 300), a = Math.max(S.pl[0].age, S.pl[1].age);
    dmgSrc = 'u'; for (const u of S.units) if (!u.dead && Math.abs(u.x - x) < 55) hurt(u, AGES[a].sp.d * 0.8, -1);
    S.ev.push([x, GY - 6, 'lava']);
  }
}
function step(dt) {
  S.time += dt;
  if (S.over < 0) fieldTick(dt);
  if (S.surv && S.over < 0) survTick(dt);
  if (S.events && S.over < 0) {
    S.evT -= dt;
    if (S.evT <= 0) { S.evT = rnd(70, 120); battleEvent(); }
    if (S.dark > 0) S.dark = Math.max(0, S.dark - dt);
    if (S.trex) {                                      // rozdupe každého, koho potká – obě strany
      const R = S.trex; R.x += R.dir * 250 * dt;
      for (const u of S.units) if (!u.dead && !R.hit.includes(u.id) && Math.abs(u.x - R.x) < 45) { R.hit.push(u.id); hurt(u, u.mx * 2, -1); S.ev.push([u.x, GY - 30, 'hit']); }
      if (R.x < -200 || R.x > W + 200) S.trex = null;
    }
    if (S.chest) {                                     // truhlu sebere první jednotka, která k ní dojde
      const u = S.units.find(u => Math.abs(u.x - S.chest.x) < 16);
      if (u) { S.pl[u.side].gold += S.chest.g; S.ev.push([S.chest.x, GY - 30, 'chest', u.side, S.chest.g]); S.chest = null; }
    }
  }
  // fronty výroby + cooldown speciálu
  for (let s = 0; s < 2; s++) {
    const p = S.pl[s];
    if (p.spcd > 0) p.spcd = Math.max(0, p.spcd - dt);
    if (p.hcd > 0) p.hcd = Math.max(0, p.hcd - dt);
    if (p.pick > 0) p.pick = Math.max(0, p.pick - dt / (S.speed || 1));   // reálné sekundy i při 2×
    if (p.rgcd > 0) p.rgcd = Math.max(0, p.rgcd - dt);
    if (p.acd > 0) p.acd = Math.max(0, p.acd - dt);
    if (GB(p).cry) {                                  // generálův pokřik: každých 45 s armáda útočí o 30 % silněji
      p.cryC = (p.cryC ?? 30) - dt; if (p.cryT > 0) p.cryT -= dt;
      if (p.cryC <= 0) { p.cryC = 45; p.cryT = 8; S.ev.push([BX[s], GY - 120, 'gcry', s]); }
    }
    if (p.q.length) {
      const q = p.q[0], d = uDef(q.a, q.ty, q.f), bt = d.t * (facOf(s).build || 1) * GB(p).build;
      p.qt += dt;
      if (p.qt >= bt) {
        p.qt = bt;
        if (spawnFree(s, q.ty)) { spawn(s, q); p.q.shift(); p.qt = 0; }
      }
    }
  }

  // léčitelé: každou sekundu doplní zdraví spojencům kolem sebe
  for (const u of S.units) if (u.ty === 6 && !u.dead && (u.ht = (u.ht || 0) - dt) <= 0) {
    const d = uDefU(u);
    if (d.ab !== 'healer') { u.ht = 1e9; continue; }
    u.ht = 1;
    for (const a of S.units) if (a.side === u.side && !a.dead && a.hp < a.mx && Math.abs(a.x - u.x) < 140) a.hp = Math.min(a.mx, a.hp + a.mx * 0.03 + d.d * 0.15);
  }
  // statistiky bitvy: každých 5 s velikost armády, zlato a zabití
  if (S.st && (S.st.acc = (S.st.acc || 0) + dt) >= 5) {
    S.st.acc = 0; S.st.t.push(Math.round(S.time));
    for (let s = 0; s < 2; s++) {
      S.st.army[s].push(S.units.reduce((n, u) => n + (u.side === s ? uDefU(u).c : 0), 0));
      S.st.kills[s].push(S.pl[s].kills);
    }
  }
  const byId = new Map(S.units.map(u => [u.id, u]));
  const side = [[], []];
  for (const u of S.units) side[u.side].push(u);
  side[0].sort((a, b) => b.x - a.x);   // nejpřednější první
  side[1].sort((a, b) => a.x - b.x);

  // jednotky
  for (let s = 0; s < 2; s++) {
    const dir = s ? -1 : 1, F = side[s], E = side[1 - s];
    let fe = E.find(e => !e.dead);
    for (let i = 0; i < F.length; i++) {
      const u = F[i];
      if (u.dead) continue;
      if (fe && fe.dead) fe = E.find(e => !e.dead);
      const d = uDefU(u);
      u.at = Math.max(0, u.at - dt * 3);
      u.cd = Math.max(0, u.cd - dt);
      const de = fe ? (fe.x - u.x) * dir - (u.w + fe.w) / 2 : 1e9;
      const db = (BF[1 - s] - u.x) * dir - u.w / 2;
      let tgt = null;
      const rr = d.r * (d.p ? fieldRng() : 1);
      if (fe && de <= rr) tgt = fe;
      else if (db <= rr && db <= de) tgt = 'base';
      // při ústupu se armáda seřadí do řady u základny (přední jednotka nejdál)
      const ord = S.pl[s].ord || 0, slot = RALLY + (F.length - 1 - i) * Math.min(26, 220 / F.length);
      const back = (u.x - (BX[s] + dir * slot)) * dir;
      u.back = 0;
      if (ord === 2 && back > 1) {                     // ústup ke shromaždišti u vlastní základny
        u.x -= Math.min(d.s * (facOf(s).spd || 1) * 1.25 * dt, back) * dir; u.st = 0; u.back = 1;
      } else if (tgt) {
        u.st = 2;
        if (u.cd <= 0) { u.cd = d.cd * (u.rage ? 0.8 : 1); u.at = 1; attack(u, d, tgt, dir); }
      } else {
        let mv = d.s * (facOf(s).spd || 1) * (u.rage ? 1.2 : 1) * fieldSpd(u) * dt;
        if (ord === 2) mv = 0;
        if (ord === 1) mv = Math.min(mv, (BX[s] + dir * HOLD - u.x) * dir);   // drž linii u věží
        for (let j = i - 1; j >= 0; j--) if (!F[j].dead) {
          mv = Math.min(mv, (F[j].x - u.x) * dir - (F[j].w + u.w) / 2 - 4); break;
        }
        mv = Math.min(mv, de - 1, db);
        if (mv > 0.05) { u.x += mv * dir; u.st = 0; } else u.st = 1;
      }
    }
  }

  // věže
  for (let s = 0; s < 2; s++) {
    const p = S.pl[s], fe = side[1 - s].find(e => !e.dead);
    p.tur.forEach((t, k) => {
      const d = AGES[t.a].turrets[t.i];
      t.cd = Math.max(0, t.cd - dt);
      if (fe && t.cd <= 0 && Math.abs(fe.x - BX[s]) <= d.r) {
        t.cd = d.cd;
        const o = slotPos(s, k);
        S.proj.push({ id: S.nid++, x: o.x, y: o.y, tid: fe.id, tx: fe.x, ty: GY - 22,
          d: d.d * atkMul(s), side: s, p: d.p, sp: d.sp || 0, v: SPD[d.p], src: 't' });
        S.ev.push([o.x + (s ? -12 : 12), o.y, 'muz']);
      }
    });
  }

  // projektily
  for (const pr of S.proj) {
    if (pr.fall) {
      pr.x += pr.vx * dt; pr.y += pr.vy * dt; pr.dx = pr.vx; pr.dy = pr.vy;
      if (pr.y >= GY - 4) {
        pr.dead = 1; splash(pr.x, pr.sp, pr.d, pr.side, true);
        S.ev.push([pr.x, GY - 6, pr.p === 'beam' ? 'zap' : pr.p === 'arrow' ? 'hit' : 'boom']);
      }
      continue;
    }
    dmgSrc = pr.src || 'u';
    if (pr.tid >= 0) {
      const t = byId.get(pr.tid);
      if (t && !t.dead) { pr.tx = t.x; pr.ty = GY - unitY(t); } else pr.lost = 1;
    }
    const dx = pr.tx - pr.x, dy = pr.ty - pr.y, L = Math.hypot(dx, dy), st = pr.v * dt;
    pr.dx = dx; pr.dy = dy;
    if (L > st) { pr.x += dx / L * st; pr.y += dy / L * st; continue; }
    pr.dead = 1;
    if (pr.sp) {
      splash(pr.tx, pr.sp, pr.d, pr.side);
      if (pr.tid === -1) hitBase(1 - pr.side, pr.d, pr.side);
      S.ev.push([pr.tx, pr.ty, 'boom']);
    } else {
      if (pr.tid === -1) hitBase(1 - pr.side, pr.d, pr.side);
      else if (!pr.lost) hurt(byId.get(pr.tid), pr.d, pr.side);
      if (!pr.lost || pr.tid === -1) S.ev.push([pr.tx, pr.ty, 'hit']);
    }
  }

  S.units = S.units.filter(u => !u.dead);
  S.proj = S.proj.filter(p => !p.dead);

  // podmínky výzev: přežít daný čas / vyhrát do časového limitu
  const M = S.mods;
  if (M && S.over < 0) {
    if (M.survive && S.time >= M.survive) S.over = 0;
    else if (M.limit && S.time >= M.limit) S.over = 1;
    // boss na konci věku: přijde po čase nebo když nepřátelská základna slábne
    const e = S.pl[1];
    if (M.boss != null && !S.boss && (S.time >= (M.survive ? M.survive * 0.45 : 240) || e.hp < e.mhp * 0.6)) {
      S.boss = 1; spawn(1, { a: M.boss, ty: 5 });
      S.ev.push([W / 2, 200, 'evt', 'boss', M.boss]); S.ev.push([W / 2, 200, 'roar']);
    }
  }
}

// ---------- AI soupeř ----------
let aiT = 0, aiWant = null, aiEvoT = 0, aiBroke = 0;
const AI_INCOME = [2, 6, 25, 90, 300];        // zlato/s pro počítač podle věku (× bonus obtížnosti)
function ai(dt) {
  if (S.surv) return;                                  // přežití: nepřátele posílají vlny, počítač nestaví
  const D = DIFF[S.diff || 0];
  aiT -= dt;
  const p = S.pl[1], A = AGES[p.age];
  // počítač má zlato jinak jen ze zabíjení – když prohrává, nesmí zůstat bez peněz a bez armády
  p.gold += AI_INCOME[p.age] * D.gm * dt;
  const cheap = A.units[0].c;
  aiBroke = p.gold < cheap && !p.q.length && !S.units.some(u => u.side === 1) ? aiBroke + dt : 0;
  if (aiBroke >= 3) { p.gold = Math.max(p.gold, cheap * 2); aiBroke = 0; }
  if (p.age < 4 && p.xp >= A.xp && !(S.mods && S.mods.noEvo)) aiEvoT += dt; else aiEvoT = 0;
  if (aiT > 0 || S.over >= 0) return;
  aiT = rnd(D.think[0], D.think[1]);
  if (p.age < 4 && p.xp >= A.xp && aiEvoT >= D.evo) return applyCmd(1, { a: 'evolve' });
  const foes = S.units.filter(u => u.side === 0);
  const threats = foes.filter(u => u.x > W * 0.45).length;
  if (p.spcd <= 0 && threats >= D.spMin) return applyCmd(1, { a: 'special' });
  if (D.smart > 0) {
    const mine = S.units.filter(u => u.side === 1).length, near = foes.filter(u => u.x > W * 0.55).length;
    const o = mine < foes.length * 0.6 && foes.length >= 3 ? (near > mine + 2 ? 2 : 1) : 0;
    if (o !== p.ord && Math.random() < D.smart) return applyCmd(1, { a: 'ord', o });
  }
  // hrdina: vyvolat, když je zlato navíc, a udeřit, když je kolem víc nepřátel
  const hero = S.units.find(u => u.side === 1 && u.ty === 4);
  if (hero && p.acd <= 0 && foes.filter(u => Math.abs(u.x - hero.x) < 130).length >= 3) return applyCmd(1, { a: 'hero' });
  if (!hero && S.time > AI_HERO_T[S.diff || 0] && p.hcd <= 0 && p.gold >= HEROES[p.age].c * (1.6 - D.smart * 0.4) && Math.random() < 0.3) return applyCmd(1, { a: 'hero' });
  // vylepšení nejslabší oblasti, když má přebytek
  const uk = p.up.indexOf(Math.min(...p.up));
  if (p.up[uk] < upMax(p) && p.gold >= upCost(p, uk) * 2.5 && Math.random() < 0.15 + D.smart * 0.15) return applyCmd(1, { a: 'up', k: uk });
  // chytřejší AI: při ohrožení základny okamžitě brání nejlevnější jednotkou, na těžké reaguje na tanky soupeře
  if (Math.random() < D.smart) {
    const near = foes.filter(u => u.x > W * 0.7).length;
    if (near && p.q.length === 0 && p.gold >= A.units[0].c) return applyCmd(1, { a: 'buy', ty: Math.random() < 0.5 ? 0 : 1 });
    const heavyFoe = foes.some(u => u.ty >= 2);
    if (heavyFoe && p.gold >= A.units[2].c && p.q.length < 3) return applyCmd(1, { a: 'buy', ty: 2 });
  }
  if (p.tur.length < p.slots) {
    for (let i = 2; i >= 0; i--)
      if (p.gold >= A.turrets[i].c * (1.6 - D.smart * 0.4) && Math.random() < 0.25 + D.smart * 0.2) return applyCmd(1, { a: 'turret', i });
  } else if (p.tur.length && p.tur[p.tur.length - 1].a < p.age && p.gold > A.turrets[0].c * 3) {
    return applyCmd(1, { a: 'sell' });
  }
  if (p.slots < 4 && p.gold > SLOT_COST[p.slots - 1] * 2.5 && Math.random() < 0.2) return applyCmd(1, { a: 'slot' });
  if (p.q.length < 3) {
    if (aiWant === null) {
      const r = Math.random();
      aiWant = p.age === 4 && r < 0.03 ? 3 : r < 0.08 ? 6 : r < 0.5 ? 0 : r < 0.82 ? 1 : 2;
    }
    if (aiWant === 3 && p.age < 4) aiWant = 0;
    if (p.gold >= unitCost(p, aiWant)) { applyCmd(1, { a: 'buy', ty: aiWant }); aiWant = null; }
    else if (Math.random() < 0.15) aiWant = null;
  }
}

// ---------- Snapshoty ----------
function snap(ev) {
  return {
    P: S.pl.map(p => [Math.floor(p.gold), Math.floor(p.xp), p.age, Math.ceil(p.hp), p.mhp, p.slots,
      p.tur.map(t => t.a * 3 + t.i), p.q.map(q => q.a * 8 + q.ty),
      p.q.length ? Math.round(p.qt / (uDef(p.q[0].a, p.q[0].ty, p.q[0].f).t * (facOf(S.pl.indexOf(p)).build || 1) * GB(p).build) * 100) / 100 : 0, Math.ceil(p.spcd),
      p.kills, p.spBest, p.supers, p.built, p.up, Math.ceil(p.hcd), Math.ceil(p.acd), p.ord, p.af, p.emb, Math.ceil(p.pick), Math.ceil(p.rgcd || 0), p.cryT > 0 ? 1 : 0]),
    Tm: Math.floor(S.time), D: S.diff, X: S.chal, K: S.camp, Dy: S.daily, Dk: Math.ceil(S.dark), Ch: S.chest ? Math.round(S.chest.x) : 0, Tx: S.trex ? [Math.round(S.trex.x), S.trex.dir] : 0, Rg: S.rage ? 1 : 0, Sp: S.speed, Wt: netWait ? 1 : 0, Sm: S.storm > 0 ? 1 : 0, Sv: S.surv ? [S.surv.wave, Math.ceil(S.surv.t)] : 0,
    U: S.units.map(u => [u.id, u.side, u.a, u.ty, Math.round(u.x * 10) / 10, Math.ceil(u.hp), u.mx, u.st,
      Math.round(u.at * 100) / 100, u.back ? 1 : 0, u.rage ? 1 : 0]),
    R: S.proj.map(p => [p.id, Math.round(p.x), Math.round(p.y), p.p, Math.round(p.dx || 0), Math.round(p.dy || 0)]),
    E: ev, O: S.over,
  };
}
function decode(sn) {
  return {
    pl: sn.P.map(a => ({ gold: a[0], xp: a[1], age: a[2], hp: a[3], mhp: a[4], slots: a[5],
      tur: a[6].map(v => ({ a: (v / 3) | 0, i: v % 3 })), q: a[7].map(v => ({ a: v >> 3, ty: v & 7 })),
      qf: a[8], spcd: a[9], kills: a[10] || 0, spBest: a[11] || 0, supers: a[12] || 0, built: a[13] || 0, up: a[14] || [0, 0, 0], hcd: a[15] || 0, acd: a[16] || 0, ord: a[17] || 0, af: Array.isArray(a[18]) ? a[18] : [0, 0, 0, 0, 0], emb: a[19] || 0, pick: a[20] || 0, rgcd: a[21] || 0, cry: a[22] || 0 })),
    time: sn.Tm || 0, diff: sn.D, chal: sn.X, camp: sn.K, daily: sn.Dy, dark: sn.Dk || 0, chest: sn.Ch || 0, trex: sn.Tx || 0, rage: !!sn.Rg, speed: sn.Sp || 1, wait: !!sn.Wt, storm: !!sn.Sm, surv: sn.Sv ? sn.Sv[0] : 0, survT: sn.Sv ? sn.Sv[1] : 0,
    units: sn.U.map(a => ({ id: a[0], side: a[1], a: a[2], ty: a[3], x: a[4], hp: a[5], mx: a[6], st: a[7], at: a[8], back: a[9], rg: a[10] })),
    proj: sn.R.map(a => ({ id: a[0], x: a[1], y: a[2], p: a[3], dx: a[4], dy: a[5] })),
    over: sn.O,
  };
}
