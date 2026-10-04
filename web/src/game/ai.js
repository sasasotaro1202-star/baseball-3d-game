export const AI_DIFFICULTIES=Object.freeze({
 EASY:{takeBonus:.12,timingNoise:.16,decisionBias:-.12,errorRate:.12},
 NORMAL:{takeBonus:0,timingNoise:.10,decisionBias:0,errorRate:.07},
 HARD:{takeBonus:-.10,timingNoise:.055,decisionBias:.12,errorRate:.035}
});
export const AI_PROFILES={
  pitcher:{aggression:.62,variation:.22,clutch:.68},
  batter:{selectivity:.58,powerRisk:.46,contactFocus:.72},
  fielder:{reaction:.72,arm:.68,route:.76},
  runner:{stealRisk:.34,advanceRisk:.42}
};
export function choosePitch({count=[0,0],runnerThreat=0,profile=AI_PROFILES.pitcher,rng=Math.random,difficulty='NORMAL'}){
 const [balls,strikes]=count;const d=AI_DIFFICULTIES[difficulty]||AI_DIFFICULTIES.NORMAL;
 const pressure=(strikes===2 ? .18 : 0)+(balls===3 ? .22 : 0)+runnerThreat*.15;
 const roll=rng();const aggression=Math.max(.05,Math.min(.95,profile.aggression+d.decisionBias+pressure*.2));
 if(strikes===2&&roll<.52+aggression*.08)return'FASTBALL';
 if(balls>=2&&roll<.35+Math.max(0,d.decisionBias)*.25)return'CHANGEUP';
 if(roll<.62)return'FORK';
 if(roll<aggression)return'SLIDER';
 return roll<.5?'FASTBALL':'CURVEBALL';
}
export function chooseSwing({pitch,zone=.5,profile=AI_PROFILES.batter,rng=Math.random,difficulty='NORMAL'}){
 const d=AI_DIFFICULTIES[difficulty]||AI_DIFFICULTIES.NORMAL;
 const takeChance=clamp((1-zone)*profile.selectivity+d.takeBonus,0,.95);
 if(rng()<takeChance) return {action:'TAKE'};
 return {action:'SWING',timing:clamp(.42+zone*.16+(rng()-.5)*d.timingNoise),contact:clamp(profile.contactFocus+(rng()-.5)*(.12+d.errorRate))};
}
function clamp(v,min=0,max=1){return Math.max(min,Math.min(max,v))}
