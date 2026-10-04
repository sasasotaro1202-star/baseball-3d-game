import {ALL_PLAYERS} from '../web/src/data/players.js';

const ids=new Set();
const errors=[];
for(const p of ALL_PLAYERS){
  if(ids.has(p.id))errors.push('duplicate id '+p.id);
  ids.add(p.id);
  for(const k of ['id','name','pos','league','status'])if(p[k]===undefined||p[k]===null||p[k]==='')errors.push('missing '+k+' for '+p.name);
  for(const k of ['power','contact','field','speed','arm','control','stamina','vision']){
    if(typeof p[k]!=='number'||!Number.isFinite(p[k])||p[k]<1||p[k]>99)errors.push('invalid '+k+' for '+p.name);
  }
  if(!['S','A','B','C','D','F'].includes(p.rank))errors.push('invalid rank for '+p.name);
  if(p.league==='MLB'&&p.status==='LEGEND'&&p.featuredTag!=='MLB ICON')errors.push('MLB legend classification mismatch for '+p.name);
}
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log('validated players:',ALL_PLAYERS.length);
