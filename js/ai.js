// =====================================================================
//  POČÍTAČ – soupeř a spoluhráč
// =====================================================================
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
  // schopnosti armády: když se bojuje (nebo hoří u základny), použije tu, která se hodí
  if (p.abc && Math.random() < 0.15 + D.smart * 0.5) {
    const mine = S.units.filter(u => u.side === 1 && !u.dead), front = mine.length ? Math.min(...mine.map(u => u.x)) : W;
    const engaged = foes.filter(u => u.x > front - 260).length;
    if (mine.length >= 3 && engaged >= 3) {
      const hurtA = mine.reduce((a, u) => a + u.hp / u.mx, 0) / mine.length < 0.55;
      const want = [hurtA ? 3 : -1, threats >= 4 ? 1 : -1, 0, 2, 1].filter(k => k >= 0 && p.abc[k] <= 0 && !p.ab.some(v => v > 0));
      if (want.length) return applyCmd(1, { a: 'abil', k: want[0] });
    }
  }
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

// ---------- počítač jako spoluhráč (hra ve 3) ----------
// hraje za hráče m své strany: kupuje jednotky a hrdinu ze své peněženky, společné věci (věže, evoluce, speciál) nechává lidem
function aiBot(dt) {
  const B = S.bot; if (!B || S.over >= 0) return;
  const p = S.pl[B.s], W = p.w; if (!W) return;
  W[B.m] += AI_INCOME[p.age] * 0.5 * dt; p.gold = W[0] + W[1];   // malý příjem, ať nikdy nezůstane bez peněz
  B.t = (B.t ?? 1) - dt; if (B.t > 0) return; B.t = rnd(1.2, 2.4);
  const g = W[B.m], hero = S.units.some(u => u.side === B.s && u.ty === 4);
  if (!hero && p.hcd <= 0 && g >= HEROES[p.age].c * 1.5 && Math.random() < 0.3) return applyCmd(B.s, { a: 'hero' }, B.m);
  if (p.q.length >= qMax(p) - 3) return;                      // nechá ve frontě místo i lidem
  if (B.want == null) { const r = Math.random(); B.want = p.age === 4 && r < 0.03 ? 3 : r < 0.08 ? 6 : r < 0.5 ? 0 : r < 0.82 ? 1 : 2; }
  if (B.want === 3 && p.age < 4) B.want = 0;
  if (g >= unitCost(p, B.want)) { applyCmd(B.s, { a: 'buy', ty: B.want }, B.m); B.want = null; }
  else if (Math.random() < 0.15) B.want = null;
}
