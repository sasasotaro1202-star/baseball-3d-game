const KEY='baseball3d.save.v1';
export function defaultSave(){return{version:1,currency:1000,collection:[],team:[],settings:{sound:true,haptics:true},progress:{matches:0,wins:0}};}
export function loadSave(storage=globalThis.localStorage){try{const raw=storage?.getItem(KEY);return raw?{...defaultSave(),...JSON.parse(raw)}:defaultSave();}catch{return defaultSave();}}
export function saveGame(state,storage=globalThis.localStorage){const payload={...defaultSave(),...state};storage?.setItem(KEY,JSON.stringify(payload));return payload;}
export function resetSave(storage=globalThis.localStorage){storage?.removeItem(KEY);return defaultSave();}
