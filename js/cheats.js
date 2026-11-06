// =====================================================================
//  CHEATY PRO TESTOVÁNÍ – tajné menu: Nastavení → Co je nového → 10× klepnout na nadpis
//  Platí jen ve hře proti počítači (nikdy online). Se zapnutými cheaty se neukládají
//  rekordy do online žebříčků ani body klanové války.
// =====================================================================
const CHEATS = [
  { k: 'gold', ic: '💰', n: 'Neomezené zlato' },
  { k: 'xp', ic: '⭐', n: 'Neomezené zkušenosti (evoluce hned)' },
  { k: 'god', ic: '🛡️', n: 'Nesmrtelná základna' },
  { k: 'cd', ic: '⚡', n: 'Bez nabíjení (speciál, hrdina, schopnosti)' },
  { k: 'open', ic: '🔓', n: 'Odemknout všechny mise a obtížnosti' },
];
// CHEAT() a cheatOn() jsou v data.js (volají je i soubory načtené dřív)
// každý snímek ve hře proti počítači
function applyCheats() {
  if (role !== 'solo' || !S || S.over >= 0 || !cheatOn()) return;
  const c0 = CHEAT(), p = S.pl[0];
  if (c0.gold) p.gold = Math.max(p.gold, 9999999);
  if (c0.xp && p.age < 4) p.xp = Math.max(p.xp, AGES[p.age].xp);
  if (c0.god) p.hp = p.mhp;
  if (c0.cd) { p.spcd = 0; p.hcd = 0; p.acd = 0; if (p.abc) { p.abc.fill(0); p.abl = 0; } }
}
function renderCheats() {
  const b = $('cheatBody'), c0 = CHEAT(), inGame = role === 'solo' && S && S.over < 0;
  b.innerHTML = `<p class="muted">Jen pro testování. Platí ve hře proti počítači (online nikdy) a se zapnutým cheatem se nic neukládá do online žebříčků.</p>
    <div class="cheat-list">${CHEATS.map(x => `<button data-k="${x.k}" class="${c0[x.k] ? 'on' : ''}">${x.ic} ${x.n}<small>${c0[x.k] ? 'ZAPNUTO' : 'vypnuto'}</small></button>`).join('')}</div>
    <h3>Rychlé akce ve hře</h3>
    <div class="cb-btns"><button id="chWin" ${inGame && !S.surv ? '' : 'disabled'}>💥 Zničit nepřátelskou základnu</button><button id="chWave" ${inGame && S.surv ? '' : 'disabled'}>♾ +10 vln (přežití)</button></div>
    <div class="cb-btns"><button id="chOff" class="ghost">Vypnout všechny cheaty</button></div>`;
  b.querySelectorAll('.cheat-list button').forEach(x => x.onclick = () => {
    SET.cheat = { ...CHEAT(), [x.dataset.k]: !CHEAT()[x.dataset.k] }; saveSet(); sfx('click');
    if (x.dataset.k === 'open') { try { refreshMenu(); } catch (e) {} }
    renderCheats();
  });
  $('chOff').onclick = () => { SET.cheat = {}; saveSet(); sfx('click'); try { refreshMenu(); } catch (e) {} renderCheats(); };
  if (inGame) {
    $('chWin').onclick = () => { hitBase(1, S.pl[1].hp + 1, 0); sfx('click'); $('cheatPanel').classList.add('hidden'); };
    if (S.surv) $('chWave').onclick = () => { S.surv.wave += 10; S.surv.t = 0.1; sfx('click'); $('cheatPanel').classList.add('hidden'); };
  }
}
// tajný vstup: 10 klepnutí na nadpis „Co je nového“ do 4 s
let cheatTaps = [];
document.querySelector('#clPanel h2').addEventListener('click', () => {
  const now = Date.now(); cheatTaps = cheatTaps.filter(t => now - t < 4000); cheatTaps.push(now);
  if (cheatTaps.length >= 10) { cheatTaps = []; if (!SET.cheatSeen) { SET.cheatSeen = 1; saveSet(); } sfx('ach'); vib(80); renderCheats(); openPanel('cheatPanel'); }
});
