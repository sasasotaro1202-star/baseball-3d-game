import test from 'node:test';
import assert from 'node:assert/strict';
import {ALL_PLAYERS} from '../web/src/data/players.js';
import {AI_TEAM_LINEUP,AI_TEAM_PITCHERS} from '../web/src/game/ai-roster.js';

test('AI roster resolves to stable active catalog IDs',()=>{
  assert.equal(AI_TEAM_LINEUP.length,16);
  assert.equal(AI_TEAM_PITCHERS.length,3);
  assert.equal(new Set(AI_TEAM_LINEUP).size,AI_TEAM_LINEUP.length);
  assert.equal(new Set(AI_TEAM_PITCHERS).size,AI_TEAM_PITCHERS.length);
  for(const id of AI_TEAM_LINEUP){
    const p=ALL_PLAYERS.find(x=>x.id===id);
    assert.ok(p, `missing lineup player ${id}`);
    assert.equal(p.status,'ACTIVE');
    assert.equal(p.league,'NPB');
    assert.equal(String(p.pos||'').includes('P'),false);
  }
  for(const id of AI_TEAM_PITCHERS){
    const p=ALL_PLAYERS.find(x=>x.id===id);
    assert.ok(p, `missing pitcher ${id}`);
    assert.equal(p.status,'ACTIVE');
    assert.equal(p.league,'NPB');
    assert.equal(String(p.pos||'').includes('P'),true);
  }
});
