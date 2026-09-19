import test from 'node:test';
import assert from 'node:assert/strict';
import {HISTORIC_PLAYERS} from '../web/src/data/players.js';
import {SPECIAL_ABILITIES,abilityRate} from '../web/src/data/special-abilities.js';
import {cardModel} from '../web/src/game/player-system.js';

test('special ability catalog contains exactly 40 unique types',()=>{
  assert.equal(SPECIAL_ABILITIES.length,40);
  assert.equal(new Set(SPECIAL_ABILITIES.map(x=>x.id)).size,40);
  for(const a of SPECIAL_ABILITIES) assert.ok(a.baseRate>0 && a.baseRate<1);
});

test('every current player has achievement-backed ability assignments',()=>{
  for(const p of HISTORIC_PLAYERS){
    assert.ok(p.achievements?.length);
    assert.ok(p.abilities?.length);
    const c=cardModel(p);
    assert.equal(c.rank,p.rank);
    assert.ok(c.abilities.length>0);
    assert.ok(c.abilities.every(a=>a.ratePercent>=1 && a.ratePercent<=95));
  }
});

test('legendary abilities remain rarer than ordinary abilities',()=>{
  const ordinary=abilityRate('power_hitter');
  const legendary=abilityRate('legend_power');
  assert.ok(legendary<ordinary);
});
