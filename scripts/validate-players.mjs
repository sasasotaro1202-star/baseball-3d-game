import {HISTORIC_PLAYERS} from '../web/src/data/players.js';
const ids=new Set();const errors=[];for(const p of HISTORIC_PLAYERS){if(ids.has(p.id))errors.push('duplicate id '+p.id);ids.add(p.id);for(const k of ['id','name','pos'])if(p[k]===undefined||p[k]===null||p[k]==='')errors.push('missing '+k+' for '+JSON.stringify(p));for(const k of ['power','contact'])if(typeof p[k]!=='number'||p[k]<0||p[k]>100)errors.push('invalid '+k+' for '+p.name);}
if(errors.length){console.error(errors.join('\n'));process.exit(1)}console.log('validated players:',HISTORIC_PLAYERS.length);
