const KEY='baseball3d.save.v1';
export const SAVE_VERSION=2;

function baseSettings(){
  return {
    sound:true,
    haptics:true,
    quickPitch:true,
    replay:true,
    battingModeDefault:'CONTACT',
    cursorSpeed:1
  };
}
export function defaultSave(){
  return {
    version:SAVE_VERSION,
    currency:1000,
    unlimitedCoins:true,
    collection:[],
    team:[],
    settings:baseSettings(),
    progress:{matches:0,wins:0}
  };
}
function sanitizeSettings(value){
  const s={...baseSettings(),...(value&&typeof value==='object'?value:{})};
  s.sound=Boolean(s.sound);
  s.haptics=Boolean(s.haptics);
  s.quickPitch=Boolean(s.quickPitch);
  s.replay=Boolean(s.replay);
  s.battingModeDefault=s.battingModeDefault==='POWER'?'POWER':'CONTACT';
  const n=Number(s.cursorSpeed);
  s.cursorSpeed=Number.isFinite(n)?Math.max(.5,Math.min(1.5,n)):1;
  return s;
}
function migrate(input){
  const base=defaultSave();
  const source=input&&typeof input==='object'?input:{};
  const version=Number.isInteger(source.version)?source.version:1;
  const next={...base,...source};
  next.version=SAVE_VERSION;
  next.currency=Number.isFinite(Number(source.currency))?Math.max(0,Number(source.currency)):base.currency;
  next.unlimitedCoins=Boolean(source.unlimitedCoins);
  next.collection=[...new Set((Array.isArray(source.collection)?source.collection:[]).map(Number).filter(Number.isFinite))];
  if(Array.isArray(source.team)) next.team=source.team;
  else if(source.team&&typeof source.team==='object') next.team={...source.team};
  else next.team={};
  next.settings=sanitizeSettings(source.settings);
  next.progress={...base.progress,...(source.progress&&typeof source.progress==='object'?source.progress:{})};
  next.progress.matches=Math.max(0,Number(next.progress.matches)||0);
  next.progress.wins=Math.max(0,Number(next.progress.wins)||0);
  if(version<2) next.settings={...baseSettings(),...next.settings};
  return next;
}
export function loadSave(storage=globalThis.localStorage){
  try{
    const raw=storage?.getItem(KEY);
    if(!raw)return defaultSave();
    const parsed=JSON.parse(raw);
    if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw new Error('INVALID_SAVE');
    const next=migrate(parsed);
    if(next.version!==Number(parsed.version))saveGame(next,storage);
    return next;
  }catch{
    try{
      const bad=storage?.getItem(KEY);
      if(bad)storage?.setItem(KEY+'.corrupt.last',bad);
    }catch{}
    return defaultSave();
  }
}
export function saveGame(state,storage=globalThis.localStorage){
  const payload=migrate({...defaultSave(),...(state&&typeof state==='object'?state:{})});
  payload.version=SAVE_VERSION;
  storage?.setItem(KEY,JSON.stringify(payload));
  return payload;
}
export function resetSave(storage=globalThis.localStorage){
  storage?.removeItem(KEY);
  return defaultSave();
}
