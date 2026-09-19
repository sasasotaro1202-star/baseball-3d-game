import {draw} from '../data/gacha.js';
import {duplicateReward,ensureDevelopment} from './player-system.js';
export const GACHA_COST=250;
export function pullOnce(state,players,rng=Math.random){
  if(state.currency<GACHA_COST)return{state,error:'NOT_ENOUGH_CURRENCY'};
  const [result]=draw(players,1,rng);
  const has=state.collection.includes(result.player.id);
  let next=ensureDevelopment({...state,currency:state.currency-GACHA_COST},result.player.id);
  if(has){
    next={...next,currency:next.currency+duplicateReward(result.rarity)};
    return{state:next,result,duplicate:true,duplicateReward:duplicateReward(result.rarity)};
  }
  next={...next,collection:[...next.collection,result.player.id]};
  return{state:next,result,duplicate:false};
}
