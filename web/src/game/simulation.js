export const PITCHES=Object.freeze({FASTBALL:{speed:96,break:0.08},SLIDER:{speed:84,break:0.62},CURVEBALL:{speed:76,break:0.88},CHANGEUP:{speed:82,break:0.35}});
export function createMatchState(){return{inning:1,half:'TOP',outs:0,balls:0,strikes:0,score:{home:0,away:0},bases:[false,false,false],pitches:0,batters:0,ended:false,lastOutcome:'READY'};}
export function cloneState(s){return JSON.parse(JSON.stringify(s));}
function rotateHalf(s){if(s.outs<3)return s;s.outs=0;s.balls=0;s.strikes=0;s.bases=[false,false,false];if(s.half==='TOP'){s.half='BOTTOM';}else{if(s.inning>=9&&s.score.home!==s.score.away){s.ended=true;return s;}s.half='TOP';s.inning++;}return s;}
function scoreAndAdvance(s,newBases,runs){s.score[s.half==='TOP'?'away':'home']+=runs;s.bases=newBases;s.balls=0;s.strikes=0;s.batters++;return rotateHalf(s);}
export function applyOutcome(input,outcome){const s=cloneState(input);s.pitches++;
 if(outcome==='BALL'){s.balls++;if(s.balls>=4){s.balls=0;s.strikes=0;const old=s.bases.slice();if(old[0]&&old[1]&&old[2]){s.score[s.half==='TOP'?'away':'home']++;s.bases=[true,true,true];}else if(old[0]&&old[1]){s.bases=[true,true,old[2]];}else if(old[0]){s.bases=[true,old[1],old[2]];}else{s.bases=[true,old[1],old[2]];}s.lastOutcome='WALK';}return s;}
 if(outcome==='FOUL'){s.strikes=Math.min(2,s.strikes+1);s.lastOutcome='FOUL';return s;}
 if(outcome==='STRIKE'){s.strikes++;if(s.strikes>=3){s.outs++;s.balls=0;s.strikes=0;s.lastOutcome='STRIKEOUT';return rotateHalf(s);}s.lastOutcome='STRIKE';return s;}
 if(outcome==='SINGLE'){const old=s.bases.slice();const nb=[true,false,false];let runs=old[2]?1:0;if(old[1]){nb[2]=true;}if(old[0]){nb[1]=true;}return scoreAndAdvance(s,nb,runs);}
 if(outcome==='DOUBLE'){const old=s.bases.slice();const nb=[false,true,false];let runs=(old[2]?1:0)+(old[1]?1:0);if(old[0])nb[2]=true;return scoreAndAdvance(s,nb,runs);}
 if(outcome==='TRIPLE'){const runs=s.bases.filter(Boolean).length;return scoreAndAdvance(s,[false,false,true],runs);}
 if(outcome==='HOME_RUN'){const runs=1+s.bases.filter(Boolean).length;return scoreAndAdvance(s,[false,false,false],runs);}
 if(outcome==='OUT'){s.outs++;s.balls=0;s.strikes=0;s.lastOutcome='OUT';return rotateHalf(s);}
 throw new Error('Unknown outcome: '+outcome);
}
export function resolveContact({timing=0.5,power=0.5,contact=0.5,rng=Math.random}={}){const quality=Math.max(0,Math.min(1,0.55*timing+0.25*power+0.20*contact));const x=rng();if(quality>.86&&x<.20)return'HOME_RUN';if(quality>.72&&x<.42)return'TRIPLE';if(quality>.58&&x<.62)return'DOUBLE';if(quality>.40&&x<.82)return'SINGLE';if(x<.94)return'OUT';return'FOUL';}
export function resolvePitch({pitch='FASTBALL',timing=0.5,contact=0.5,power=0.5,rng=Math.random}={}){const p=PITCHES[pitch]||PITCHES.FASTBALL;const miss=Math.max(0,Math.min(1,Math.abs(timing-.5)*1.8));const x=rng();if(x<0.04+miss*.12)return'BALL';if(x<0.16+miss*.12)return'STRIKE';if(x<0.21)return'FOUL';return resolveContact({timing,power:Math.min(1,p.speed/100),contact,rng});}