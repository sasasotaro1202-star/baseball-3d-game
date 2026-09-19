const wait=(ms)=>new Promise(r=>setTimeout(r,ms));
export function ensurePresentationLayer(){let el=document.getElementById('presentation');if(el)return el;el=document.createElement('div');el.id='presentation';el.innerHTML='<div class="pres-vignette"></div><div id="pres-kicker" class="pres-kicker"></div><div id="pres-title" class="pres-title"></div><div id="pres-sub" class="pres-sub"></div><div id="pres-flash" class="pres-flash"></div><div id="pres-card" class="pres-card"></div>';document.body.appendChild(el);return el;}
export function gachaRevealType(result){
  if(result?.duplicate)return'DUPLICATE';
  if(result?.limited&&result?.rank==='S')return'LIMITED_S';
  if(result?.rank==='S')return'S_GUARANTEED';
  if(result?.rank==='A')return'A_HIGH';
  if(result?.rarity==='LEGEND')return'LEGEND';
  if(result?.rarity==='STAR')return'STAR';
  if(result?.rarity==='PRO')return'PRO';
  return'ROOKIE';
}
export async function playGachaReveal({rarity,name,image,rank,limited,duplicate=false,banner}){
  ensurePresentationLayer();const root=document.getElementById('presentation'),k=document.getElementById('pres-kicker'),t=document.getElementById('pres-title'),s=document.getElementById('pres-sub'),flash=document.getElementById('pres-flash'),pc=document.getElementById('pres-card');
  const type=gachaRevealType({rarity,name,image,rank,limited,duplicate,banner});root.className='pres-show gacha-sequence '+type.toLowerCase();
  const labels={DUPLICATE:['DUPLICATE','限界突破素材','重複選手を変換'],LIMITED_S:['LIMITED S','SPECIAL SIGNAL','限定Sランク確定'],S_GUARANTEED:['S RANK','HIGH SIGNAL','Sランク確定演出'],A_HIGH:['A RANK','STRONG SIGNAL','Aランク以上の強演出'],LEGEND:['LEGEND','LEGEND SIGNAL','レジェンド演出'],STAR:['STAR','STAR SIGNAL','スター演出'],PRO:['PRO','PRO SIGNAL','プロ演出'],ROOKIE:['ROOKIE','SCOUT SIGNAL','通常演出']};
  const l=labels[type]||labels.ROOKIE;k.textContent=l[0];t.textContent=l[1];s.textContent=l[2];if(pc)pc.innerHTML=image?'<img src="'+image+'" alt="">':'';
  await wait(type==='ROOKIE'?380:type==='PRO'?620:900);
  root.className='pres-show gacha-reveal '+type.toLowerCase();k.textContent=l[0];t.textContent=name||'PLAYER';s.textContent=(limited?'LIMITED · ':'')+((rank||rarity||'').toString())+' · '+(banner||'SCOUT');
  flash.className='pres-flash active';setTimeout(()=>flash.className='pres-flash',220);
  await wait(type==='S_GUARANTEED'||type==='LIMITED_S'?1900:type==='LEGEND'?1700:1250);root.className='';
}
export async function playMatchEvent(type,detail=''){ensurePresentationLayer();const root=document.getElementById('presentation'),k=document.getElementById('pres-kicker'),t=document.getElementById('pres-title'),s=document.getElementById('pres-sub');const map={inning:['GAME PRESENTATION',detail||'PLAY BALL'],pitch:['PITCH',detail||'投球開始'],single:['HIT','SINGLE'],double:['HIT','DOUBLE'],triple:['HIT','TRIPLE'],home_run:['HOME RUN','GOING DEEP'],strikeout:['STRIKEOUT','BATTER OUT'],out:['OUT','PLAY MADE'],walk:['BASE ON BALLS','TAKE YOUR BASE']};const v=map[type]||['PLAY',''+detail];root.className='pres-show match-event '+(type||'');k.textContent=v[0];t.textContent=v[1];s.textContent=detail&&detail!==v[1]?detail:'';await wait(type==='home_run'?1700:850);root.className='';}