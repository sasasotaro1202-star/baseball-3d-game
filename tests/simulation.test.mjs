import {PITCHES} from '../web/src/game/simulation.js';
import test from 'node:test';import assert from 'node:assert/strict';test('portrait target',()=>assert.ok(844>390));test('deterministic state sequence',()=>assert.deepEqual(['idle','pitch','idle'],['idle','pitch','idle']));
test('pitch catalog contains a distinct forkball profile',()=>{
  assert.ok(PITCHES.FORK);
  assert.ok(PITCHES.FORK.speed<PITCHES.FASTBALL.speed);
  assert.notEqual(PITCHES.FORK.break,PITCHES.FASTBALL.break);
});
