import test from 'node:test';import assert from 'node:assert/strict';import {defaultSave,loadSave,saveGame,SAVE_VERSION} from '../web/src/game/save.js';
function storage(){const m=new Map();return{getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)}}
test('save roundtrip preserves currency and collection',()=>{const s=storage();const state={...defaultSave(),currency:750,collection:[1,2,3]};saveGame(state,s);const loaded=loadSave(s);assert.equal(loaded.currency,750);assert.deepEqual(loaded.collection,[1,2,3]);});
test('releasePlayer preserves object-based team lineup state',async()=>{
 const {releasePlayer}=await import('../web/src/game/player-system.js');
 const save={collection:[1,2],team:{lineup:[1,2],bench:[2],pitchers:[1]},currency:0,unlimitedCoins:true};
 const result=releasePlayer(save,{id:1,rarity:'LEGEND'});
 assert.deepEqual(result.state.team,{lineup:[2],bench:[2],pitchers:[]});
});

test('save v1 data migrates without losing collection or team',()=>{
 const x=storage();
 x.setItem('baseball3d.save.v1',JSON.stringify({version:1,currency:640,collection:[1,2],team:{lineup:[1,2]},settings:{sound:false}}));
 const loaded=loadSave(x);
 assert.equal(loaded.version,SAVE_VERSION);
 assert.equal(loaded.currency,640);
 assert.deepEqual(loaded.collection,[1,2]);
 assert.deepEqual(loaded.team,{lineup:[1,2]});
 assert.equal(loaded.settings.quickPitch,true);
});
test('corrupt save is backed up before fallback',()=>{
 const x=storage();
 const bad='{"version":';
 x.setItem('baseball3d.save.v1',bad);
 const loaded=loadSave(x);
 assert.equal(loaded.version,SAVE_VERSION);
 assert.equal(x.getItem('baseball3d.save.v1.corrupt.last'),bad);
});
