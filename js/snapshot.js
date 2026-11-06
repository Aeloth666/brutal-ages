// =====================================================================
//  SNAPSHOTY – stav hry pro síť, záznam a vykreslení
// =====================================================================
// ---------- Snapshoty ----------
function snap(ev) {
  return {
    P: S.pl.map(p => [Math.floor(p.gold), Math.floor(p.xp), p.age, Math.ceil(p.hp), p.mhp, p.slots,
      p.tur.map(t => t.a * 3 + t.i), p.q.map(q => q.a * 8 + q.ty),
      p.q.length ? Math.round(p.qt / (uDef(p.q[0].a, p.q[0].ty, p.q[0].f).t * (facOf(S.pl.indexOf(p)).build || 1) * GB(p).build) * 100) / 100 : 0, Math.ceil(p.spcd),
      p.kills, p.spBest, p.supers, p.built, p.up, Math.ceil(p.hcd), Math.ceil(p.acd), p.ord, p.af, p.emb, Math.ceil(p.pick), Math.ceil(p.rgcd || 0), p.cryT > 0 ? 1 : 0, p.w ? p.w.map(v => Math.floor(v)) : 0, p.afm || 0, p.ab ? [...p.ab.map(v => Math.ceil(v)), ...p.abc.map(v => Math.ceil(v)), Math.ceil(p.abl || 0)] : 0]),
    Tm: Math.floor(S.time), D: S.diff, X: S.chal, K: S.camp, Dy: S.daily, Dk: Math.ceil(S.dark), Ch: S.chest ? Math.round(S.chest.x) : 0, Tx: S.trex ? [Math.round(S.trex.x), S.trex.dir] : 0, Rg: S.rage ? 1 : 0, Sp: S.speed, Wt: netWait ? 1 : 0, Sm: S.storm > 0 ? 1 : 0, Sv: S.surv ? [S.surv.wave, Math.ceil(S.surv.t), S.surv.pick ? [...S.surv.pick, Math.ceil(S.surv.pt)] : 0, S.surv.got] : 0,
    U: S.units.map(u => [u.id, u.side, u.a, u.ty, Math.round(u.x * 10) / 10, Math.ceil(u.hp), u.mx, u.st,
      Math.round(u.at * 100) / 100, u.back ? 1 : 0, u.rage ? 1 : 0, u.m | 0]),
    R: S.proj.map(p => [p.id, Math.round(p.x), Math.round(p.y - (p.h || 0)), p.p, Math.round(p.dx || 0), Math.round(p.dy || 0)]),
    E: ev, O: S.over,
  };
}
function decode(sn) {
  return {
    // v týmu vidí každý své zlato a svůj národ (a[23] peněženky, a[24] národy hráčů týmu)
    pl: sn.P.map((a, i) => ({ gold: i === mySide && a[23] ? a[23][MYMEM] ?? a[0] : a[0], xp: a[1], age: a[2], hp: a[3], mhp: a[4], slots: a[5],
      tur: a[6].map(v => ({ a: (v / 3) | 0, i: v % 3 })), q: a[7].map(v => ({ a: v >> 3, ty: v & 7 })),
      qf: a[8], spcd: a[9], kills: a[10] || 0, spBest: a[11] || 0, supers: a[12] || 0, built: a[13] || 0, up: a[14] || [0, 0, 0], hcd: a[15] || 0, acd: a[16] || 0, ord: a[17] || 0, af: i === mySide && a[24] ? a[24][MYMEM] || a[18] : Array.isArray(a[18]) ? a[18] : [0, 0, 0, 0, 0], emb: a[19] || 0, pick: a[20] || 0, rgcd: a[21] || 0, cry: a[22] || 0, afm: a[24] || null, w: a[23] || null, ab: a[25] ? a[25].slice(0, 4) : [0, 0, 0, 0], abc: a[25] ? a[25].slice(4, 8) : [0, 0, 0, 0], abl: a[25] ? a[25][8] || 0 : 0 })),
    time: sn.Tm || 0, diff: sn.D, chal: sn.X, camp: sn.K, daily: sn.Dy, dark: sn.Dk || 0, chest: sn.Ch || 0, trex: sn.Tx || 0, rage: !!sn.Rg, speed: sn.Sp || 1, wait: !!sn.Wt, storm: !!sn.Sm, surv: sn.Sv ? sn.Sv[0] : 0, survT: sn.Sv ? sn.Sv[1] : 0, survPick: sn.Sv && sn.Sv[2] ? sn.Sv[2] : null, survGot: sn.Sv ? sn.Sv[3] || [] : [],
    units: sn.U.map(a => ({ id: a[0], side: a[1], a: a[2], ty: a[3], x: a[4], hp: a[5], mx: a[6], st: a[7], at: a[8], back: a[9], rg: a[10], m: a[11] | 0 })),
    proj: sn.R.map(a => ({ id: a[0], x: a[1], y: a[2], p: a[3], dx: a[4], dy: a[5] })),
    over: sn.O,
  };
}
