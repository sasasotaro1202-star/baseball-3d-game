import test from 'node:test';
import assert from 'node:assert/strict';
import {cardModel,aiProfile,modelConfig,trainPlayer,developmentFor} from '../web/src/game/player-system.js';

const player={id:1,name:'Test Player',pos:'OF',power:80,contact:75,field:70,speed:65,arm:60};
test('player pipeline derives card/model/AI from one data source',()=>{
  const save={currency:1000,progress:{}};
  const c=cardModel(player,{level:1,stats:{}});
  assert.equal(c.name,'Test Player'); assert.ok(c.overall>0);
  const m=modelConfig(player,{}); assert.ok(m.uniform>0);
  const ai=aiProfile(player,{}); assert.ok(ai.contactFocus>.45);
});
test('training changes the same player stats used by card and AI',()=>{
  const save={currency:1000,progress:{}};
  const r=trainPlayer(save,player,'contact');
  assert.equal(r.error,undefined);
  assert.equal(r.state.currency,900);
  assert.equal(developmentFor(r.state,1).stats.contact,1);
  assert.ok(cardModel(player,developmentFor(r.state,1)).stats.contact>75);
});
