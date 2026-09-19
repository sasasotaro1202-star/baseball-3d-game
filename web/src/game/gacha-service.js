import {draw} from '../data/gacha.js';
import {duplicateReward,ensureDevelopment} from './player-system.js';
export const GACHA_COST=250;
export function pullOnce(state,players,rng=Math.random,bannerId='standard'){
  if(!state.unlimitedCoins && state.currency<GACHA_COST)return{state,error:'NOT_ENOUGH_CURRENCY'};
  const [result]=draw(players,1,rng,bannerId);
  const collection=Array.isArray(state.collection)?state.collection:[];
  if(!result?.player)return{state,error:'NO_PLAYER_POOL'};
  const has=collection.includes(result.player.id);
  let next=ensureDevelopment({...state,currency:state.unlimitedCoins?state.currency:state.currency-GACHA_COST},result.player.id);
  if(has){
    next={...next,currency:next.currency+duplicateReward(result.rarity)};
    return{state:next,result,duplicate:true,duplicateReward:duplicateReward(result.rarity)};
  }
  next={...next,collection:[...(Array.isArray(next.collection)?next.collection:[]),result.player.id]};
  return{state:next,result,duplicate:false};
}

export function pullMany(state,players,count=10,rng=Math.random,bannerId='standard'){
  const pulls=Math.max(1,Math.min(10,Number(count)||10));
  const total=GACHA_COST*pulls;
  if(!state.unlimitedCoins && state.currency<total)return{state,error:'NOT_ENOUGH_CURRENCY'};
  let next={...state,collection:Array.isArray(state.collection)?state.collection:[]};
  const results=[];
  let duplicates=0;
  for(let i=0;i<pulls;i++){
    const [result]=draw(players,1,rng,bannerId);
    if(!result?.player)return{state,error:'NO_PLAYER_POOL'};
    const has=next.collection.includes(result.player.id);
    next=ensureDevelopment({...next,currency:next.unlimitedCoins?next.currency:next.currency-GACHA_COST},result.player.id);
    if(has){
      const reward=duplicateReward(result.rarity);
      next={...next,currency:next.currency+reward};
      duplicates++;
      results.push({result,duplicate:true,duplicateReward:reward});
    }else{
      next={...next,collection:[...(Array.isArray(next.collection)?next.collection:[]),result.player.id]};
      results.push({result,duplicate:false,duplicateReward:0});
    }
  }
  return{state:next,results,duplicates,cost:total};
}
