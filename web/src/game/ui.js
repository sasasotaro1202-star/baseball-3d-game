export function esc(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
export function modeLabel(mode){return({match:'試合',gacha:'スカウト',roster:'オーダー',training:'育成',collection:'選手名鑑',settings:'設定',home:'ホーム'})[mode]||mode;}
