const wait=(ms)=>new Promise(r=>setTimeout(r,ms));

export function ensurePresentationLayer(){
  let el=document.getElementById('presentation');
  if(el)return el;
  el=document.createElement('div');
  el.id='presentation';
  el.innerHTML='<div class="pres-vignette"></div><div id="pres-kicker" class="pres-kicker"></div><div id="pres-title" class="pres-title"></div><div id="pres-sub" class="pres-sub"></div><div id="pres-flash" class="pres-flash"></div>';
  document.body.appendChild(el);
  return el;
}

export async function playGachaReveal({rarity,name}){
  ensurePresentationLayer();
  const root=document.getElementById('presentation');
  const kicker=document.getElementById('pres-kicker');
  const title=document.getElementById('pres-title');
  const sub=document.getElementById('pres-sub');
  root.className='pres-show gacha-sequence';
  kicker.textContent='SCOUTING';
  title.textContent='新しい選手を発見';
  sub.textContent='スカウト結果を確認しています…';
  await wait(650);
  root.className='pres-show gacha-sequence gacha-build';
  kicker.textContent='SIGNAL LOCK';
  title.textContent='……';
  sub.textContent='選手データを解析中';
  await wait(850);
  root.className='pres-show gacha-reveal '+String(rarity||'').toLowerCase();
  kicker.textContent=String(rarity||'PLAYER');
  title.textContent=name||'PLAYER';
  sub.textContent='NEW PLAYER';
  const flash=document.getElementById('pres-flash');
  flash.className='pres-flash active';
  setTimeout(()=>flash.className='pres-flash',180);
  await wait(1500);
  root.className='';
}

export async function playMatchEvent(type,detail=''){
  ensurePresentationLayer();
  const root=document.getElementById('presentation');
  const kicker=document.getElementById('pres-kicker');
  const title=document.getElementById('pres-title');
  const sub=document.getElementById('pres-sub');
  const map={
    inning:['GAME PRESENTATION',detail||'PLAY BALL'],
    pitch:['PITCH',detail||'投球開始'],
    single:['HIT','SINGLE'],
    double:['HIT','DOUBLE'],
    triple:['HIT','TRIPLE'],
    home_run:['HOME RUN','GOING DEEP'],
    strikeout:['STRIKEOUT','BATTER OUT'],
    out:['OUT','PLAY MADE'],
    walk:['BASE ON BALLS','TAKE YOUR BASE']
  };
  const v=map[type]||['PLAY',''+detail];
  root.className='pres-show match-event '+(type||'');
  kicker.textContent=v[0];
  title.textContent=v[1];
  sub.textContent=detail&&detail!==v[1]?detail:'';
  await wait(type==='home_run'?1700:850);
  root.className='';
}
