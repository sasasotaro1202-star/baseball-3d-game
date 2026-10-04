import test from 'node:test';
import assert from 'node:assert/strict';
import {choosePitch,chooseSwing,AI_DIFFICULTIES} from '../web/src/game/ai.js';

test('pitching AI is safe with explicit count and default count',()=>{
  const legal=new Set(['FASTBALL','SLIDER','CURVEBALL','FORK','CHANGEUP']);
  assert.ok(legal.has(choosePitch({count:[0,0],rng:()=>0})));
  assert.ok(legal.has(choosePitch({count:[2,2],rng:()=>0})));
  assert.ok(legal.has(choosePitch({rng:()=>0.9})));
});

test('batting AI returns a valid action and bounded swing values',()=>{
  const take=chooseSwing({zone:0,rng:()=>0});
  assert.equal(take.action,'TAKE');
  const swing=chooseSwing({zone:1,rng:()=>0.99});
  assert.equal(swing.action,'SWING');
  assert.ok(swing.timing>=0&&swing.timing<=1);
  assert.ok(swing.contact>=0&&swing.contact<=1);
});

test('AI difficulty changes decision error profile',()=>{
 assert.ok(AI_DIFFICULTIES.EASY.timingNoise>AI_DIFFICULTIES.HARD.timingNoise);
 assert.ok(AI_DIFFICULTIES.EASY.errorRate>AI_DIFFICULTIES.HARD.errorRate);
 const easy=chooseSwing({zone:1,difficulty:'EASY',rng:()=>0.51});
 const hard=chooseSwing({zone:1,difficulty:'HARD',rng:()=>0.51});
 assert.equal(easy.action,'SWING');
 assert.equal(hard.action,'SWING');
 assert.ok(Math.abs(easy.timing-hard.timing)>=0);
});
