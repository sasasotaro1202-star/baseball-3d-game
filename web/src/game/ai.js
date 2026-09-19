export const AI_PROFILES={
  pitcher:{aggression:.62,variation:.22,clutch:.68},
  batter:{selectivity:.58,powerRisk:.46,contactFocus:.72},
  fielder:{reaction:.72,arm:.68,route:.76},
  runner:{stealRisk:.34,advanceRisk:.42}
};
export function choosePitch({count,runnerThreat=0,profile=AI_PROFILES.pitcher,rng=Math.random}){
 const [balls,strikes]=count;
 const pressure=(strikes===2?.18:0)+(balls===3?.22:0)+runnerThreat*.15;
 const roll=rng();
 if(strikes===2 && roll<.52) return 'FASTBALL';
 if(balls>=2 && roll<.35) return 'CHANGEUP';
 if(roll<profile.aggression+pressure*.2) return 'SLIDER';
 return roll<.5?'FASTBALL':'CURVEBALL';
}
export function chooseSwing({pitch,zone=.5,profile=AI_PROFILES.batter,rng=Math.random}){
 const takeChance=clamp(1-zone)*profile.selectivity;
 if(rng()<takeChance) return {action:'TAKE'};
 return {action:'SWING',timing:clamp(.42+zone*.16+(rng()-.5)*.12),contact:clamp(profile.contactFocus+(rng()-.5)*.2)};
}
function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
