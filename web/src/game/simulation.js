export const PITCHES=Object.freeze({
 FASTBALL:{speed:96,break:0.08},SLIDER:{speed:84,break:0.62},CURVEBALL:{speed:76,break:0.88},CHANGEUP:{speed:82,break:0.35}
});
export const REGULATION_INNINGS=2;
export const EXTRA_INNING_START_BASES=Object.freeze([true,true,false]);

function runner(id,base,speed=70,reaction=70){return{id,base,speed,reaction,status:'LIVE',tagged:false,advanceIntent:'HOLD',startBase:base};}
export function createMatchState(){return{inning:1,half:'TOP',outs:0,balls:0,strikes:0,score:{home:0,away:0},bases:[false,false,false],runners:[],nextRunnerId:1,pitches:0,batters:0,ended:false,lastOutcome:'READY',regulationInnings:REGULATION_INNINGS,extraInnings:false,defense:{pitcherId:null,fielders:[]},lastPlay:null};}
export function cloneState(s){return JSON.parse(JSON.stringify(s));}
function offenseKey(s){return s.half==='TOP'?'away':'home';}
function resetCount(s){s.balls=0;s.strikes=0;}
function isExtra(s){return s.inning>REGULATION_INNINGS;}
function syncBases(s){s.bases=[0,1,2].map(b=>s.runners.some(r=>r.status==='LIVE'&&r.base===b));}
function nextRunner(s,speed=70,reaction=70){const id=s.nextRunnerId++;return runner(id,'HOME',speed,reaction);}
function enterHalf(s,half,inning){s.half=half;s.inning=inning;s.outs=0;resetCount(s);s.extraInnings=isExtra(s);s.runners=s.extraInnings?[runner(s.nextRunnerId++,1,70,70),runner(s.nextRunnerId++,0,70,70)]:[];syncBases(s);s.lastPlay={type:'HALF_START',extra:s.extraInnings};}
function rotateHalf(s){if(s.outs<3)return s;const nextHalf=s.half==='TOP'?'BOTTOM':'TOP';const nextInning=s.half==='TOP'?s.inning:s.inning+1;if(s.half==='TOP'&&s.inning>=REGULATION_INNINGS&&s.score.home>s.score.away){s.ended=true;return s;}if(s.half==='BOTTOM'&&s.inning>=REGULATION_INNINGS&&s.score.home!==s.score.away){s.ended=true;return s;}enterHalf(s,nextHalf,nextInning);return s;}
function scoreRuns(s,runs){if(runs>0)s.score[offenseKey(s)]+=runs;}
function checkGameEndAfterScore(s){if(s.half==='BOTTOM'&&s.score.home>s.score.away&&s.inning>=REGULATION_INNINGS)s.ended=true;}
function advanceRunnerTo(s,r,to){r.base=to;if(to===3){scoreRuns(s,1);r.status='SCORED';}}
function removeScored(s){s.runners=s.runners.filter(r=>r.status==='LIVE');}
function addBatter(s,speed=70,reaction=70){const r=nextRunner(s,speed,reaction);r.base=-1;s.runners.push(r);return r;}
function forceAdvance(s,from,to){const r=s.runners.find(x=>x.status==='LIVE'&&x.base===from);if(r)advanceRunnerTo(s,r,to);}
function advanceOnSingle(s){const old=s.runners.filter(r=>r.status==='LIVE').sort((a,b)=>b.base-a.base);for(const r of old){if(r.base===2)advanceRunnerTo(s,r,3);else if(r.base===1)advanceRunnerTo(s,r,2);else if(r.base===0)advanceRunnerTo(s,r,1);}addBatter(s);removeScored(s);}
function advanceOnDouble(s){const old=s.runners.filter(r=>r.status==='LIVE').sort((a,b)=>b.base-a.base);for(const r of old){if(r.base===2||r.base===1)advanceRunnerTo(s,r,3);else if(r.base===0)advanceRunnerTo(s,r,2);}addBatter(s);removeScored(s);}
function advanceOnTriple(s){for(const r of s.runners.filter(r=>r.status==='LIVE'))advanceRunnerTo(s,r,3);addBatter(s);removeScored(s);}
function homer(s){for(const r of s.runners.filter(r=>r.status==='LIVE')){r.status='SCORED';scoreRuns(s,1);}addBatter(s);const b=s.runners.find(r=>r.status==='LIVE'&&r.base===-1);if(b)b.status='SCORED';scoreRuns(s,1);s.runners=[];}
function walk(s){const live=s.runners.filter(r=>r.status==='LIVE').sort((a,b)=>b.base-a.base);let force=true;for(const r of live){if(force&&r.base===2){r.status='SCORED';scoreRuns(s,1);}else if(force&&r.base===1){r.base=2;}else if(force&&r.base===0){r.base=1;}else force=false;}addBatter(s);const b=s.runners.find(r=>r.base===-1);if(b)b.base=0;removeScored(s);}
function sacrifice(s,fly=false){const live=s.runners.filter(r=>r.status==='LIVE').sort((a,b)=>b.base-a.base);if(live.length){const r=live[0];if(r.base===2){if(fly)advanceRunnerTo(s,r,3);else r.base=3;}else if(r.base===1)r.base=2;else if(r.base===0)r.base=1;}s.outs++;s.lastOutcome=fly?'SACRIFICE_FLY':'SACRIFICE_BUNT';return rotateHalf(s);}
function doublePlay(s){const r2=s.runners.find(r=>r.status==='LIVE'&&r.base===1);const r1=s.runners.find(r=>r.status==='LIVE'&&r.base===0);if(r2)r2.status='OUT';if(r1)r1.status='OUT';s.runners=s.runners.filter(r=>r.status==='LIVE');s.outs=Math.min(3,s.outs+2);s.lastOutcome='DOUBLE_PLAY';return rotateHalf(s);}
export function stealBase(input,runnerId,targetBase=1){const s=cloneState(input);const r=s.runners.find(x=>x.id===runnerId&&x.status==='LIVE');if(!r||targetBase<=r.base)return{state:s,success:false};const chance=Math.max(.05,Math.min(.95,.45+(r.speed-70)*.012-(targetBase-r.base)*.04));const success=Math.random()<chance;if(success)r.base=targetBase;else{r.status='OUT';s.outs++;}syncBases(s);s.lastPlay={type:success?'STEAL_SUCCESS':'STEAL_OUT',runnerId,targetBase};return{state:rotateHalf(s),success};}
export function tagUp(input,runnerId,targetBase=3,throwStrength=70){const s=cloneState(input);const r=s.runners.find(x=>x.id===runnerId&&x.status==='LIVE');if(!r)return{state:s,success:false};const chance=Math.max(.05,Math.min(.95,.55+(r.speed-70)*.01-(throwStrength-70)*.008));const success=Math.random()<chance;if(success)r.base=targetBase;else{r.status='OUT';s.outs++;}syncBases(s);s.lastPlay={type:success?'TAG_UP_SUCCESS':'TAG_UP_OUT',runnerId,targetBase};return{state:rotateHalf(s),success};}
export function advanceRunners(input,{result='SINGLE',fielderPosition='NORMAL',batterSpeed=70,runnerReaction=70}={}){const s=cloneState(input);const defenseMod={INFIELD:.88,SHALLOW:.94,NORMAL:1,DEEP:1.12}[fielderPosition]||1;const risk=runnerReaction/100*defenseMod;if(result==='GROUND_OUT'){if(s.runners.some(r=>r.base===1)&&s.runners.some(r=>r.base===0)&&risk<.72)return doublePlay(s);s.outs++;s.lastOutcome='GROUND_OUT';return rotateHalf(s);}if(result==='FLY_OUT'){s.outs++;s.lastOutcome='FLY_OUT';return rotateHalf(s);}if(result==='SAC_BUNT')return sacrifice(s,false);if(result==='SAC_FLY')return sacrifice(s,true);if(result==='SINGLE')advanceOnSingle(s);else if(result==='DOUBLE')advanceOnDouble(s);else if(result==='TRIPLE')advanceOnTriple(s);else if(result==='HOME_RUN')homer(s);syncBases(s);s.lastOutcome=result;s.lastPlay={type:result,fielderPosition};checkGameEndAfterScore(s);return s;}
export function applyOutcome(input,outcome,options={}){const s=cloneState(input);s.pitches++;if(s.ended)return s;
if(outcome==='BALL'){s.balls++;if(s.balls>=4){resetCount(s);walk(s);s.lastOutcome='WALK';}else s.lastOutcome='BALL';syncBases(s);return s;}
if(outcome==='FOUL'){s.strikes=Math.min(2,s.strikes+1);s.lastOutcome='FOUL';return s;}
if(outcome==='STRIKE'){s.strikes++;if(s.strikes>=3){s.outs++;resetCount(s);s.lastOutcome='STRIKEOUT';return rotateHalf(s);}s.lastOutcome='STRIKE';return s;}
if(['SINGLE','DOUBLE','TRIPLE','HOME_RUN','GROUND_OUT','FLY_OUT','SAC_BUNT','SAC_FLY'].includes(outcome))return advanceRunners(s,{result:outcome,...options});
if(outcome==='OUT'){s.outs++;resetCount(s);s.lastOutcome='OUT';return rotateHalf(s);}
if(outcome==='DOUBLE_PLAY')return doublePlay(s);
throw new Error('Unknown outcome: '+outcome);}
export function resolveContact({timing=.5,power=.5,contact=.5,rng=Math.random,defensePosition='NORMAL'}={}){const q=Math.max(0,Math.min(1,.55*timing+.25*power+.20*contact)),x=rng();if(q>.86&&x<.20)return'HOME_RUN';if(q>.72&&x<.42)return'DOUBLE';if(q>.58&&x<.62)return'SINGLE';if(x<.18)return'GROUND_OUT';if(x<.30)return'FLY_OUT';if(x<.94)return'OUT';return'FOUL';}
export function resolvePitch({pitch='FASTBALL',timing=.5,contact=.5,power=.5,rng=Math.random}={}){const p=PITCHES[pitch]||PITCHES.FASTBALL;const miss=Math.max(0,Math.min(1,Math.abs(timing-.5)*1.8)),x=rng();if(x<.04+miss*.12)return'BALL';if(x<.16+miss*.12)return'STRIKE';if(x<.21)return'FOUL';return resolveContact({timing,power:Math.min(1,p.speed/100),contact,rng});}
