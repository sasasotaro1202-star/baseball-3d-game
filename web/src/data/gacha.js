// Original gacha probability table. Higher ranks are deliberately scarce.
// Rates sum to 100%. No proprietary game's exact rates are copied.
export const RARITIES={
  LEGEND:{rate:0.01},
  STAR:{rate:0.07},
  PRO:{rate:0.22},
  ROOKIE:{rate:0.70}
};
export const RANK_RATES={S:.01,A:.07,B:.22,C:.35,D:.35};
export function roll(rng=Math.random){
  const x=rng(); let c=0;
  for(const [rarity,{rate}] of Object.entries(RARITIES)){c+=rate;if(x<c)return rarity}
  return 'ROOKIE';
}
export function rollRank(rng=Math.random){
  const x=rng(); let c=0;
  for(const [rank,rate] of Object.entries(RANK_RATES)){c+=rate;if(x<c)return rank}
  return 'D';
}
export function draw(players,count=1,rng=Math.random){
  return Array.from({length:count},()=>{
    const rarity=roll(rng);
    const pool=players.filter(p=>(p.rank||'D')===rollRank(rng));
    const source=pool.length?pool:players;
    return {rarity,player:source[Math.floor(rng()*source.length)]};
  });
}