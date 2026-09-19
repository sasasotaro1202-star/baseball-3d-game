import {draw} from '../data/gacha.js';
export const GACHA_COST=250;
export function pullOnce(state,players,rng=Math.random){if(state.currency<GACHA_COST)return{state,error:'NOT_ENOUGH_CURRENCY'};const [result]=draw(players,1,rng);const next={...state,currency:state.currency-GACHA_COST,collection:[...state.collection,result.player.id]};return{state:next,result};}
