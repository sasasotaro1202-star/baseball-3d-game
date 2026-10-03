import test from 'node:test';
import assert from 'node:assert/strict';
import {choosePitch,chooseSwing} from '../web/src/game/ai.js';

test('pitching AI is safe with explicit count and default count',()=>{
  const legal=new Set(['FASTBALL','SLIDER','CURVEBALL','CHANGEUP']);
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
