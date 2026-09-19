import {SPECIAL_ABILITIES,abilityRate,resolveAbility,abilityEffects} from '../data/special-abilities.js';

const DEFAULTS={power:70,contact:70,field:70,control:70,speed:70,arm:70,stamina:70,vision:70};
export const DEVELOPMENT_COST=100;
export const DEVELOPMENT_XP=25;
export const RELEASE_REWARD={LEGEND:1200,STAR:700,PRO:350,COMMON:150};
export function releasePlayer(save,player){
  if(!player)return{state:save,error:'PLAYER_NOT_FOUND'};
  const collection=(save.collection||[]).filter(id=>id!==player.id);
  const team=(save.team||[]).filter(id=>id!==player.id);
  const reward=RELEASE_REWARD[player.rarity]??RELEASE_REWARD.COMMON;
  return {state:{...save,collection,team,currency:save.unlimitedCoins?save.currency:(save.currency||0)+reward},reward};
}
export function playerStats(player,progress={}){
  const base={...DEFAULTS,...player};
  const growth=progress?.stats||{};
  const stats={};
  for(const k of Object.keys(DEFAULTS)) stats[k]=Math.max(1,Math.min(99,(base[k]??DEFAULTS[k])+(growth[k]||0)));
  return stats;
}
export function overall(player,progress={}){
  const s=playerStats(player,progress);
  const keys=player.pos?.includes('P')||player.pos==='P'?['control','stamina','power','contact']:['power','contact','field','speed','arm'];
  return Math.round(keys.reduce((a,k)=>a+s[k],0)/keys.length);
}
export function specialAbilities(player){
  return (player.abilities||[]).map(([id,modifier=0])=>{
    const a=SPECIAL_ABILITIES.find(x=>x.id===id);
    return a?{...a,rate:abilityRate(id,modifier),ratePercent:Math.round(abilityRate(id,modifier)*100)}:null;
  }).filter(Boolean);
}
export function triggerSpecialAbility(player,id,rng=Math.random){
  const entry=(player.abilities||[]).find(x=>x[0]===id);
  return entry?resolveAbility(id,rng,entry[1]||0):false;
}
export function abilityStatEffects(player){return (player.abilities||[]).map(([id,modifier=0])=>({id,name:SPECIAL_ABILITIES.find(x=>x.id===id)?.name||id,ratePercent:Math.round(abilityRate(id,modifier)*100),effects:abilityEffects(id)}));}\nexport function cardModel(player,progress={}){
  const s=playerStats(player,progress);
  return {id:player.id,name:player.name,era:player.era,pos:player.pos,overall:overall(player,progress),stats:s,rarity:player.rarity||'LEGEND',rank:player.rank||'B',abilities:specialAbilities(player),abilityEffects:abilityStatEffects(player),achievements:player.achievements||[]};
}
export function modelConfig(player,progress={}){
  const s=playerStats(player,progress);
  const hue=(Number(player.id)*0.137)%1;
  const color=new Uint8Array([Math.floor(50+130*hue),Math.floor(70+90*(1-hue)),Math.floor(120+80*hue)]);
  const uniform=(color[0]<<16)|(color[1]<<8)|color[2];
  return {uniform,skin:player.skinColor??0xc98262,scale:0.94+(s.power/99)*0.12,profile:{height:player.height||1,build:player.build||'athletic',batting:player.batting||'right',signature:player.signature||'standard'}};
}
export function aiProfile(player,progress={}){
  const s=playerStats(player,progress);
  return {
    aggression:0.45+(s.power/99)*0.35,
    selectivity:0.35+(s.vision/99)*0.5,
    powerRisk:0.25+(s.power/99)*0.55,
    contactFocus:0.45+(s.contact/99)*0.45,
    reaction:0.35+(s.field/99)*0.6,
    arm:0.35+(s.arm/99)*0.6,
    route:0.35+(s.speed/99)*0.6,
    stealRisk:0.15+(s.speed/99)*0.55,
    advanceRisk:0.2+(s.vision/99)*0.5
  };
}
export function ensureDevelopment(save,id){
  const progress={...(save.progress||{})};
  const players={...(progress.players||{})};
  if(!players[id]) players[id]={level:1,xp:0,stats:{}};
  return {...save,progress:{...progress,players}};
}
export function trainPlayer(save,player,focus='contact'){
  const next=ensureDevelopment(save,player.id);
  if(!next.unlimitedCoins && (next.currency||0)<DEVELOPMENT_COST)return{state:next,error:'NOT_ENOUGH_CURRENCY'};
  const p={...next.progress.players[player.id]};
  const stats={...(p.stats||{})};
  stats[focus]=Math.min(15,(stats[focus]||0)+1);
  p.level=(p.level||1)+1;p.xp=(p.xp||0)+DEVELOPMENT_XP;p.stats=stats;
  return{state:{...next,currency:next.unlimitedCoins?next.currency:next.currency-DEVELOPMENT_COST,progress:{...next.progress,players:{...next.progress.players,[player.id]:p}}},result:p};
}
export function developmentFor(save,id){return save.progress?.players?.[id]||{level:1,xp:0,stats:{}};}
export function duplicateReward(rarity){return rarity==='LEGEND'?500:rarity==='STAR'?300:rarity==='PRO'?150:75;}
