export const PITCHES=Object.freeze({
  FASTBALL:{speed:96,break:0.08},
  SLIDER:{speed:84,break:0.62},
  CURVEBALL:{speed:76,break:0.88},
  CHANGEUP:{speed:82,break:0.35}
});
export const REGULATION_INNINGS=2;
export const EXTRA_INNING_START_BASES=Object.freeze([true,true,false]);
export function createMatchState(){return{inning:1,half:'TOP',outs:0,balls:0,strikes:0,score:{home:0,away:0},bases:[false,false,false],pitches:0,batters:0,ended:false,lastOutcome:'READY',regulationInnings:REGULATION_INNINGS,extraInnings:false};}
export function cloneState(s){return JSON.parse(JSON.stringify(s));}
function offenseKey(s){return s.half==='TOP'?'away':'home';}
function resetCount(s){s.balls=0;s.strikes=0;}
function isExtra(s){return s.inning>REGULATION_INNINGS;}
function enterHalf(s,half,inning){s.half=half;s.inning=inning;s.outs=0;resetCount(s);s.bases=isExtra(s)?[true,true,false]:[false,false,false];s.extraInnings=isExtra(s);}
function rotateHalf(s){if(s.outs<3)return s;const nextHalf=s.half==='TOP'?'BOTTOM':'TOP';const nextInning=s.half==='TOP'?s.inning:s.inning+1;if(s.half==='BOTTOM'&&s.inning>=REGULATION_INNINGS&&s.score.home!==s.score.away){s.ended=true;return s;}enterHalf(s,nextHalf,nextInning);return s;}
function scoreRuns(s,runs){if(runs>0)s.score[offenseKey(s)]+=runs;}
function checkGameEndAfterScore(s){if(s.half==='BOTTOM'&&s.score.home>s.score.away){if(s.inning>=REGULATION_INNINGS||s.inning>REGULATION_INNINGS)s.ended=true;}}
function advanceWalk(s){const b=s.bases.slice();if(b[0]&&b[1]&&b[2]){scoreRuns(s,1);checkGameEndAfterScore(s);return[true,true,true];}if(b[0]&&b[1])return[true,true,b[2]];if(b[0])return[true,b[1],b[2]];return[true,b[1],b[2]];}
function scoreAndAdvance(s,newBases,runs){scoreRuns(s,runs);checkGameEndAfterScore(s);s.bases=newBases;s.batters++;resetCount(s);if(s.ended)return s;return rotateHalf(s);}
export function applyOutcome(input,outcome){const s=cloneState(input);s.pitches++;if(s.ended)return s;
if(outcome==='BALL'){s.balls++;if(s.balls>=4){s.balls=0;s.strikes=0;s.bases=advanceWalk(s);s.lastOutcome='WALK';s.batters++;}else s.lastOutcome='BALL';return s;}
if(outcome==='FOUL'){s.strikes=Math.min(2,s.strikes+1);s.lastOutcome='FOUL';return s;}
if(outcome==='STRIKE'){s.strikes++;if(s.strikes>=3){s.outs++;resetCount(s);s.lastOutcome='STRIKEOUT';return rotateHalf(s);}s.lastOutcome='STRIKE';return s;}
if(outcome==='SINGLE'){const b=s.bases.slice(),nb=[true,false,false];let runs=b[2]?1:0;if(b[1])nb[2]=true;if(b[0])nb[1]=true;return scoreAndAdvance(s,nb,runs);}
if(outcome==='DOUBLE'){const b=s.bases.slice(),nb=[false,true,false];let runs=(b[2]?1:0)+(b[1]?1:0);if(b[0])nb[2]=true;return scoreAndAdvance(s,nb,runs);}
if(outcome==='TRIPLE'){const runs=s.bases.filter(Boolean).length;return scoreAndAdvance(s,[false,false,true],runs);}
if(outcome==='HOME_RUN'){const runs=1+s.bases.filter(Boolean).length;return scoreAndAdvance(s,[false,false,false],runs);}
if(outcome==='OUT'){s.outs++;resetCount(s);s.lastOutcome='OUT';return rotateHalf(s);}
throw new Error('Unknown outcome: '+outcome);}
export function resolveContact({timing=0.5,power=0.5,contact=0.5,rng=Math.random}={}){const q=Math.max(0,Math.min(1,0.55*timing+0.25*power+0.20*contact)),x=rng();if(q>.86&&x<.20)return'HOME_RUN';if(q>.72&&x<.42)return'TRIPLE';if(q>.58&&x<.62)return'DOUBLE';if(q>.40&&x<.82)return'SINGLE';if(x<.94)return'OUT';return'FOUL';}
export function resolvePitch({pitch='FASTBALL',timing=0.5,contact=0.5,power=0.5,rng=Math.random}={}){const p=PITCHES[pitch]||PITCHES.FASTBALL;const miss=Math.max(0,Math.min(1,Math.abs(timing-.5)*1.8)),x=rng();if(x<0.04+miss*.12)return'BALL';if(x<0.16+miss*.12)return'STRIKE';if(x<0.21)return'FOUL';return resolveContact({timing,power:Math.min(1,p.speed/100),contact,rng});}