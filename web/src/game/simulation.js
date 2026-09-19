export const PITCHES=Object.freeze({FASTBALL:{speed:96,break:0.08},SLIDER:{speed:84,break:0.62},CURVEBALL:{speed:76,break:0.88},CHANGEUP:{speed:82,break:0.35}});
export function createMatchState(){return{inning:1,half:'TOP',outs:0,balls:0,strikes:0,score:{home:0,away:0},bases:[false,false,false],pitches:0,batters:0,ended:false,lastOutcome:'READY'};}
export function cloneState(s){return JSON.parse(JSON.stringify(s));}
function advanceRuns(s,bases,extra=0){let runs=extra+(bases[2]?1:0)+(bases[1]?1:0)+(bases[0]?1:0);return runs;}
export function applyOutcome(input,outcome){const s=cloneState(input);s.pitches++;
 if(outcome==='BALL'){s.balls++;if(s.balls>=4){s.balls=0;s.strikes=0;s.lastOutcome='WALK';s.bases=[true,s.bases[0],s.bases[1]];}return s;}
 if(outcome==='FOUL'){s.strikes=Math.min(2,s.strikes+1);s.lastOutcome='FOUL';return s;}
 if(outcome==='STRIKE'){s.strikes++;if(s.strikes>=3){s.outs++;s.balls=0;s.strikes=0;s.lastOutcome='STRIKEOUT';}return rotateHalf(s);}
 if(['SINGLE','DOUBLE','TRIPLE','HOME_RUN'].includes(outcome)){
   const old=s.bases.slice();s.bases=[false,false,false];let runs=0;
   if(outcome==='SINGLE'){s.bases[0]=true;runs=old[2]?1:0;if(old[1])s.bases[2]=true;if(old[0])s.bases[1]=true;}
   if(outcome==='DOUBLE'){s.bases[1]=true;runs=(old[2]?1:0)+(old[1]?1:0);if(old[0])s.bases[2]=true;}
   if(outcome==='TRIPLE'){s.bases[2]=true;runs=old.filter(Boolean).length;}
   if(outcome==='HOME_RUN'){runs=1+old.filter(Boolean).length;}
   s.score[s.half==='TOP'?'away':'home']+=runs;s.balls=0;s.strikes=0;s.batters++;s.lastOutcome=outcome;return rotateHalf(s);
 }
 if(outcome==='OUT'){s.outs++;s.balls=0;s.strikes=0;s.lastOutcome='OUT';return rotateHalf(s);}
 throw new Error('Unknown outcome: '+outcome);
}
function rotateHalf(s){if(s.outs<3)return s;s.outs=0;s.balls=0;s.strikes=0;s.bases=[false,false,false];if(s.half==='TOP')s.half='BOTTOM';else{s.half='TOP';s.inning++;}if(s.inning>9&&s.score.home!==s.score.away)s.ended=true;return s;}
export function resolveContact({timing=0.5,power=0.5,contact=0.5,rng=Math.random}={}){const quality=Math.max(0,Math.min(1,0.55*timing+0.25*power+0.20*contact));const x=rng();if(quality>.86&&x<.20)return'HOME_RUN';if(quality>.72&&x<.42)return'TRIPLE';if(quality>.58&&x<.62)return'DOUBLE';if(quality>.40&&x<.82)return'SINGLE';if(x<.94)return'OUT';return'FOUL';}
export function resolvePitch({pitch='FASTBALL',timing=0.5,contact=0.5,rng=Math.random}={}){const p=PITCHES[pitch]||PITCHES.FASTBALL;const miss=Math.max(0,Math.min(1,Math.abs(timing-.5)*1.8));const x=rng();if(x<0.04+miss*.12)return'BALL';if(x<0.16+miss*.12)return'STRIKE';if(x<0.21)return'FOUL';return resolveContact({timing,power:Math.min(1,p.speed/100),contact,rng});}
