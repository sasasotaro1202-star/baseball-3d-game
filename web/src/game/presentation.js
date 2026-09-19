const wait=(ms)=>new Promise(r=>setTimeout(r,ms));
export function ensurePresentationLayer(){let el=document.getElementById('presentation');if(el)return el;el=document.createElement('div');el.id='presentation';el.innerHTML='<div class="gacha-stage"><div class="gacha-sky"></div><div class="gacha-lights"></div><div class="gacha-field"></div><div class="gacha-ball"></div><div class="gacha-card-slot"><div id="pres-card" class="pres-card"></div></div><div class="gacha-particles"></div></div><div class="pres-vignette"></div><div id="gacha-result-banner" class="gacha-result-banner"><div id="gacha-result-rank" class="gacha-result-rank"></div><div id="gacha-result-status" class="gacha-result-status"></div><div id="gacha-result-type" class="gacha-result-type"></div></div><div id="pres-kicker" class="pres-kicker"></div><div id="pres-title" class="pres-title"></div><div id="pres-sub" class="pres-sub"></div><div id="pres-flash" class="pres-flash"></div>';document.body.appendChild(el);return el;}
export function gachaRevealType(result){if(result?.duplicate)return'DUPLICATE';if(result?.limited&&result?.rank==='S')return'LIMITED_S';if(result?.rank==='S')return'S_GUARANTEED';if(result?.rank==='A')return'A_HIGH';if(result?.rarity==='LEGEND')return'LEGEND';if(result?.rarity==='STAR')return'STAR';if(result?.rarity==='PRO')return'PRO';return'ROOKIE';}
export async function playGachaReveal({rarity,name,image,rank,limited,duplicate=false,banner,cardType,limitedTheme}){
 const root=ensurePresentationLayer(),k=document.getElementById('pres-kicker'),t=document.getElementById('pres-title'),s=document.getElementById('pres-sub'),flash=document.getElementById('pres-flash'),pc=document.getElementById('pres-card');
 const type=gachaRevealType({rarity,name,image,rank,limited,duplicate,banner});
 const special=limited?'limited':rank==='S'?'s-rank':rank==='A'?'a-rank':rarity==='LEGEND'?'legend':rarity==='STAR'?'star':'normal';
 root.className='pres-show gacha-page gacha-opening '+type.toLowerCase()+' '+special+(limited?' limited-card ':'')+' '+String(cardType||'').toLowerCase();
 k.textContent='SCOUT';t.textContent='';s.textContent='PLAYER ACQUISITION';
 if(pc)pc.innerHTML='';
 await wait(180);
 root.classList.add('gacha-stadium');
 await wait(limited?1800:rank==='S'?1900:type==='ROOKIE'?900:type==='PRO'?1150:1450);
 root.classList.remove('gacha-opening');root.classList.add('gacha-reveal');
 k.textContent=limited?(limitedTheme||cardType||'LIMITED CARD'):(type==='S_GUARANTEED'||type==='LIMITED_S'?'SPECIAL':'RESULT'); root.classList.add('gacha-rank-'+(rank==='S'?'s':rank==='A'?'a':rank==='B'?'b':'lower'));if(limited)root.classList.add('gacha-limited-result');const rb=document.getElementById('gacha-result-banner'),rr=document.getElementById('gacha-result-rank'),rs=document.getElementById('gacha-result-status'),rt=document.getElementById('gacha-result-type');if(rr)rr.textContent=(rank||rarity||'—')+' RANK';if(rs)rs.textContent=limited?'LIMITED':'NORMAL';if(rt)rt.textContent=limited?(limitedTheme||cardType||'LIMITED CARD'):'STANDARD CARD';
 t.textContent=name||'PLAYER';s.textContent=(limited?'LIMITED CARD · ':'')+((rank||rarity||'').toString())+' · '+(banner||'SCOUT');
 if(pc)pc.innerHTML=image?'<img src="'+image+'" alt="">':'<div class="no-card">PLAYER</div>';
 flash.className='pres-flash active';setTimeout(()=>flash.className='pres-flash',limited||rank==='S'?520:260);
 await wait(limited?3000:rank==='S'?2800:type==='S_GUARANTEED'||type==='LIMITED_S'?2100:type==='LEGEND'?1800:1450);
 root.className='';return type;
}
export async function playMatchEvent(type,detail=''){ensurePresentationLayer();const root=document.getElementById('presentation'),k=document.getElementById('pres-kicker'),t=document.getElementById('pres-title'),s=document.getElementById('pres-sub');const map={inning:['GAME PRESENTATION',detail||'PLAY BALL'],pitch:['PITCH',detail||'投球開始'],single:['HIT','SINGLE'],double:['HIT','DOUBLE'],triple:['HIT','TRIPLE'],home_run:['HOME RUN','GOING DEEP'],strikeout:['STRIKEOUT','BATTER OUT'],out:['OUT','PLAY MADE'],walk:['BASE ON BALLS','TAKE YOUR BASE']};const v=map[type]||['PLAY',''+detail];root.className='pres-show match-event '+(type||'');k.textContent=v[0];t.textContent=v[1];s.textContent=detail&&detail!==v[1]?detail:'';await wait(type==='home_run'?1700:850);root.className='';}
