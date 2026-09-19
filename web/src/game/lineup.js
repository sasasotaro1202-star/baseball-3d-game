export const POSITIONS=['P','C','1B','2B','3B','SS','LF','CF','RF','DH'];
export function createLineup(players=[]){return{starters:players.slice(0,9).map((p,i)=>({slot:i,playerId:p.id,position:POSITIONS[i]})),bench:players.slice(9,13).map(p=>p.id),pitchers:players.slice(13,18).map(p=>p.id)};}
export function setStarter(lineup,slot,playerId,position){if(!Number.isInteger(slot)||slot<0||slot>8)throw new Error('invalid slot');const starters=lineup.starters.map(x=>x.slot===slot?{...x,playerId,position}:x);return {...lineup,starters};}
