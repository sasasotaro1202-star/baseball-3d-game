export const GACHA_BANNERS=Object.freeze([
{id:'standard',name:'STANDARD',subtitle:'通常スカウト',kind:'通常',rateBonus:'全選手から幅広く登場',filter:p=>true},
{id:'legends',name:'LEGENDS',subtitle:'歴代レジェンド',kind:'歴代',rateBonus:'高ランク選手を優先',filter:p=>p.rank==='S'||p.rank==='A'},
{id:'limited',name:'LIMITED',subtitle:'限定強化スカウト',kind:'限定',rateBonus:'限定カード確率アップ',filter:p=>p.limited},
{id:'power',name:'POWER',subtitle:'長距離砲スカウト',kind:'打撃型',rateBonus:'パワー型を優先',filter:p=>(p.power||0)>=80},
{id:'speed',name:'SPEED & DEFENSE',subtitle:'走守特化スカウト',kind:'走守型',rateBonus:'走力・守備型を優先',filter:p=>Math.max(p.speed||0,p.field||0)>=80},
{id:'two-way',name:'TWO-WAY',subtitle:'二刀流・投手型スカウト',kind:'投手/二刀流',rateBonus:'投手能力を優先',filter:p=>p.pos?.includes('P')||p.abilities?.some(a=>a[0]==='two_way')}
]);
export const RANK_RATES={S:.03,A:.08,B:.14,C:.20,D:.25,F:.30};
export const LIMITED_RATE=.06;
export const RARITIES={LEGEND:{rate:.005},STAR:{rate:.025},PRO:{rate:.10},ROOKIE:{rate:.32},MOB:{rate:.55}};
export function rollRank(rng=Math.random){const x=rng();let c=0;for(const [rank,rate] of Object.entries(RANK_RATES)){c+=rate;if(x<c)return rank}return'F'}
export function rollLimited(rng=Math.random){return rng()<LIMITED_RATE}
export function roll(rng=Math.random){const x=rng();let c=0;for(const [rarity,{rate}] of Object.entries(RARITIES)){c+=rate;if(x<c)return rarity}return'MOB'}
function weightedPick(pool,rank,rng){const byRank=pool.filter(p=>p.rank===rank);const source=byRank.length?byRank:pool;return source[Math.floor(rng()*source.length)]}
function mobPool(players){const p=players.filter(x=>x.rank==='F'||x.rank==='D'||x.rank==='C'||x.rarity==='MOB');return p.length?p:players}
export function draw(players,count=1,rng=Math.random,bannerId='standard'){return Array.from({length:count},()=>{const banner=GACHA_BANNERS.find(b=>b.id===bannerId)||GACHA_BANNERS[0];const limited=rollLimited(rng);const rank=rollRank(rng);let pool=players.filter(p=>banner.filter(p));if(!pool.length)pool=players;const limitedPool=pool.filter(p=>p.limited);const normalPool=pool.filter(p=>!p.limited);let source=limited&&limitedPool.length?limitedPool:normalPool.length?normalPool:pool;const mobRoll=rank==='F'||rng()<.55;if(mobRoll)source=mobPool(source);const player=weightedPick(source,rank,rng);return{rarity:player.rarity||roll(rng),rank:player.rank||rank,limited:!!player.limited,player,banner:banner.id}})}
