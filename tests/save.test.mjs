import test from 'node:test';import assert from 'node:assert/strict';import {defaultSave,loadSave,saveGame} from '../web/src/game/save.js';
function storage(){const m=new Map();return{getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)}}
test('save roundtrip preserves currency and collection',()=>{const s=storage();const state={...defaultSave(),currency:750,collection:[1,2,3]};saveGame(state,s);const loaded=loadSave(s);assert.equal(loaded.currency,750);assert.deepEqual(loaded.collection,[1,2,3]);});
test('releasePlayer preserves object-based team lineup state',async()=>{
 const {releasePlayer}=await import('../web/src/game/player-system.js');
 const save={collection:[1,2],team:{lineup:[1,2],bench:[2],pitchers:[1]},currency:0,unlimitedCoins:true};
 const result=releasePlayer(save,{id:1,rarity:'LEGEND'});
 assert.deepEqual(result.state.team,{lineup:[2],bench:[2],pitchers:[]});
});
