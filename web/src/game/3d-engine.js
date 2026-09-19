export const FIELD={dimensions:{foulLine:95,center:122,basePath:27.4317,moundDistance:18.44},bases:{home:[0,0,0],first:[27.4317,0,0],second:[27.4317,0,27.4317],third:[0,0,27.4317]},wall:{height:3.2}};
export const CAMERAS={BATTER:{position:[0,3.1,10],target:[0,1.1,0]},PITCHER:{position:[0,2.8,-12],target:[0,1.1,0]},CENTER:{position:[0,18,30],target:[0,0,0]},BROADCAST:{position:[32,13,28],target:[0,1,8]},FIELD:{position:[0,32,0],target:[0,0,0]}};
export function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
export function pitchTrajectory({releaseSpeed,breakAmount,pitchT=0}){
 const p=clamp(pitchT,0,1), z=12-24*p;
 return {x:breakAmount*Math.sin(Math.PI*p),y:2.05-0.7*p+0.12*Math.sin(Math.PI*p),z,speed:releaseSpeed};
}
export function battingQuality({timing,contact,power,location}){
 const timingError=Math.abs(clamp(timing,0,1)-.5)*2;
 const contactQuality=clamp(contact,0,1)*(1-timingError);
 const exitVelocity=70+power*75*contactQuality;
 const launch=location?.launchAngle??18+(contactQuality-.5)*28;
 return {contactQuality,exitVelocity,launchAngle:clamp(launch,-10,48),perfect:contactQuality>.94};
}
export function fieldingTarget({outcome,runnerAdvance=0}){
 return {priority:outcome==='HOME_RUN'?0:outcome==='SINGLE'?1:2,runnerAdvance};
}
