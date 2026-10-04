export const GACHA_BANNERS=Object.freeze([
  {id:'npb-series',name:'NPB 2026 SERIES',subtitle:'現役NPBセレクション',kind:'現役',rateBonus:'NPB現役選手中心。球団・実績・能力値で構成',filter:p=>p.league==='NPB'&&p.status==='ACTIVE'},
  {id:'npb-stars',name:'NPB STARS',subtitle:'NPBスターズ',kind:'注目',rateBonus:'Sランク・Aランクの現役NPB選手を重点',filter:p=>p.league==='NPB'&&p.status==='ACTIVE'&&(p.rank==='S'||p.rank==='A')},
  {id:'npb-next',name:'NPB NEXT',subtitle:'若手・ブレイク候補',kind:'次世代',rateBonus:'B〜Cランク中心。若手・控え・ブレイク候補も登場',filter:p=>p.league==='NPB'&&p.status==='ACTIVE'&&(p.rank==='B'||p.rank==='C')},
  {id:'npb-legends',name:'NPB LEGENDS',subtitle:'球史を代表するレジェンド',kind:'歴代',rateBonus:'王・長嶋・野村・落合など、NPB史を代表する選手',filter:p=>p.league==='NPB'&&p.status==='LEGEND'},
  {id:'japan-mlb',name:'JAPAN MLB',subtitle:'MLBで戦う日本人選手',kind:'海外',rateBonus:'現役MLBの日本人選手を収録',filter:p=>p.league==='MLB'&&p.status==='ACTIVE'&&p.origin==='JAPAN'},
  {id:'mlb-icons',name:'MLB ICONS',subtitle:'MLB史を代表するレジェンド',kind:'超限定',rateBonus:'MLBの歴史的アイコンのみ。通常枠には混在させない',filter:p=>p.league==='MLB'&&p.status==='LEGEND'},
  {id:'selection',name:'SELECTION',subtitle:'注目選手セレクション',kind:'限定',rateBonus:'現役スターから厳選した強化カード',filter:p=>p.featuredTag&&['STAR','ACE','POWER','LEADOFF','GLOVE'].includes(p.featuredTag)},
  {id:'moment',name:'STAR MOMENT',subtitle:'球場を沸かせる一枚',kind:'限定',rateBonus:'MOMENT限定カード',filter:p=>p.featuredTag==='MOMENT'},
  {id:'two-way',name:'TWO-WAY ICON',subtitle:'投打二刀流',kind:'限定',rateBonus:'投手・二刀流を重点',filter:p=>p.pos?.includes('P')||p.abilities?.some(a=>a[0]==='two_way')},
  {id:'power',name:'POWER',subtitle:'長距離砲スカウト',kind:'打撃型',rateBonus:'パワー80以上を重点',filter:p=>(p.power||0)>=80},
  {id:'speed-defense',name:'SPEED & DEFENSE',subtitle:'走守特化スカウト',kind:'走守型',rateBonus:'走力・守備80以上を重点',filter:p=>Math.max(p.speed||0,p.field||0)>=80}
]);

export const RANK_RATES=Object.freeze({S:.001,A:.08,B:.15,C:.22,D:.25,F:.295});
export const LIMITED_RATE=.04;
export const RARITIES=Object.freeze({LEGEND:{rate:.005},STAR:{rate:.025},PRO:{rate:.10},ROOKIE:{rate:.32},MOB:{rate:.55}});

export const RANK_SCORE=Object.freeze({S:6,A:5,B:4,C:3,D:2,F:1});
const BANNER_ALIASES=Object.freeze({
  standard:'npb-series',legends:'npb-legends',limited:'selection',power:'power','speed':'speed-defense','speed-defense':'speed-defense','two-way':'two-way',
});
export function bannerById(id='npb-series'){
  const key=BANNER_ALIASES[id]||id;
  return GACHA_BANNERS.find(b=>b.id===key)||GACHA_BANNERS[0];
}
export function rollRank(rng=Math.random){
  const x=Math.max(0,Math.min(.999999,rng()));let c=0;
  for(const [rank,rate] of Object.entries(RANK_RATES)){c+=rate;if(x<c)return rank}
  return'F';
}
export function rollLimited(rng=Math.random){return Math.max(0,Math.min(.999999,rng()))<LIMITED_RATE}
export function roll(rng=Math.random){
  const x=Math.max(0,Math.min(.999999,rng()));let c=0;
  for(const [rarity,{rate}] of Object.entries(RARITIES)){c+=rate;if(x<c)return rarity}
  return'MOB';
}
function weightedPick(pool,rank,rng){
  if(!pool.length)return null;
  const same=pool.filter(p=>p.rank===rank);
  const source=same.length?same:pool;
  const index=Math.floor(Math.max(0,Math.min(.999999,rng()))*source.length);
  return source[index]||source[0];
}
export function drawGuaranteedAtLeast(players,minRank='B',rng=Math.random,bannerId='npb-series'){
  const banner=bannerById(bannerId);
  const pool=players.filter(p=>banner.filter(p));
  const source=pool.filter(p=>(RANK_SCORE[p.rank]??0)>=(RANK_SCORE[minRank]??4));
  const fallback=players.filter(p=>(RANK_SCORE[p.rank]??0)>=(RANK_SCORE[minRank]??4));
  const player=(source.length?source:fallback)[Math.floor(Math.max(0,Math.min(.999999,rng()))*(source.length?source.length:fallback.length))];
  if(!player)return null;
  return {rarity:player.rarity||'PRO',rank:player.rank||minRank,limited:!!player.limited,player,banner:banner.id,guaranteed:true};
}
export function draw(players,count=1,rng=Math.random,bannerId='npb-series'){
  const banner=bannerById(bannerId);
  return Array.from({length:Math.max(1,Math.min(10,Number(count)||1))},()=>{
    const pool=players.filter(p=>banner.filter(p));
    const sourcePool=pool.length?pool:players;
    const rolledRank=rollRank(rng);
    const limitedHit=rollLimited(rng);
    let candidates=sourcePool.filter(p=>p.rank===rolledRank);
    if(limitedHit){
      const limited=candidates.filter(p=>p.limited);
      if(limited.length)candidates=limited;
    }else{
      const normal=candidates.filter(p=>!p.limited);
      if(normal.length)candidates=normal;
    }
    const player=weightedPick(candidates.length?candidates:sourcePool,rolledRank,rng);
    return {rarity:player?.rarity||roll(rng),rank:player?.rank||rolledRank,limited:!!player?.limited,player,banner:banner.id};
  });
}
