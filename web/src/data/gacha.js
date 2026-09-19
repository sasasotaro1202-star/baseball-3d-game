// Original clean-room gacha tuning. Temporary prototype rates requested by user.
// S rank = 50%. Limited event slot = 10%.
export const RANK_RATES={S:.50,A:.20,B:.15,C:.10,D:.05};
export const LIMITED_RATE=.10;
export const RARITIES={LEGEND:{rate:.01},STAR:{rate:.07},PRO:{rate:.22},ROOKIE:{rate:.70}};
export function rollRank(rng=Math.random){const x=rng();let c=0;for(const [rank,rate] of Object.entries(RANK_RATES)){c+=rate;if(x<c)return rank}return'D'}
export function rollLimited(rng=Math.random){return rng()<LIMITED_RATE}
export function roll(rng=Math.random){const x=rng();let c=0;for(const [rarity,{rate}] of Object.entries(RARITIES)){c+=rate;if(x<c)return rarity}return'ROOKIE'}
export function draw(players,count=1,rng=Math.random){return Array.from({length:count},()=>{const limited=rollLimited(rng);const rank=rollRank(rng);const limitedPool=players.filter(p=>p.limited&&p.rank===rank);const normalPool=players.filter(p=>!p.limited&&p.rank===rank);const source=limited&&limitedPool.length?limitedPool:normalPool.length?normalPool:players;const player=source[Math.floor(rng()*source.length)];return{rarity:limited?'LIMITED':player.rarity||roll(rng),rank:player.rank||rank,limited:!!player.limited,player}})}
