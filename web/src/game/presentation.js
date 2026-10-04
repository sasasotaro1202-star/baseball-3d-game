
function installPremiumDesignSystem(){
  if(document.getElementById('premium-design-system-v2')) return;
  const style=document.createElement('style');
  style.id='premium-design-system-v2';
  style.textContent=String.raw`
    :root{
      --ui-navy:#07111d;
      --ui-navy-2:#0b1725;
      --ui-navy-3:#101f2f;
      --ui-line:rgba(255,255,255,.12);
      --ui-line-strong:rgba(255,255,255,.20);
      --ui-text:#f4f7fa;
      --ui-muted:#94a4b2;
      --ui-gold:#d7b45a;
      --ui-gold-hi:#f2d889;
      --ui-green:#43c978;
    }
    body.premium-ui{background:var(--ui-navy);color:var(--ui-text)}
    body.premium-ui .panel{padding-left:max(12px,env(safe-area-inset-left));padding-right:max(12px,env(safe-area-inset-right))}
    body.premium-ui .top{height:46px}
    body.premium-ui .brand{font-size:12px;letter-spacing:.20em;font-weight:900;text-shadow:0 1px 12px #000}
    body.premium-ui .currency{
      padding:7px 10px;border-radius:8px;border:1px solid var(--ui-line-strong);
      background:linear-gradient(180deg,#142335e8,#07101ae8);font-weight:850;box-shadow:0 8px 22px #0008
    }
    body.premium-ui .home{justify-content:flex-end;gap:9px;padding-bottom:calc(env(safe-area-inset-bottom) + 16px)}
    body.premium-ui .hero{padding-top:48px;margin-bottom:auto}
    body.premium-ui .hero h1{font-size:40px;line-height:.95;letter-spacing:-.045em;margin:5px 0 8px;text-shadow:0 10px 35px #000}
    body.premium-ui .hero p{color:#aebbc8;max-width:290px;line-height:1.55;font-size:11px}
    body.premium-ui .home:after{
      content:'SEASON 2026  ·  BASEBALL 3D';
      position:absolute;top:calc(env(safe-area-inset-top) + 63px);left:0;right:0;
      text-align:center;letter-spacing:.18em;font-size:7px;color:#8d9aa8;pointer-events:none
    }
    body.premium-ui .match-mode-grid{gap:8px;margin-bottom:8px}
    body.premium-ui .match-mode-card{
      min-height:112px;border-radius:10px;border:1px solid var(--ui-line-strong);
      box-shadow:0 12px 28px #0009;padding:12px;background:
        radial-gradient(circle at 85% 15%,#ffffff10,transparent 35%),linear-gradient(145deg,#102237,#07101a)
    }
    body.premium-ui .match-mode-card strong{font-size:19px;letter-spacing:-.02em}
    body.premium-ui .match-mode-card small{font-size:9px}
    body.premium-ui .match-mode-card span{font-size:6px;letter-spacing:.18em;color:#8e9ca9}
    body.premium-ui .ai-match-card{background:radial-gradient(circle at 100% 0,#3d9a681c,transparent 42%),linear-gradient(145deg,#143524,#07140e)}
    body.premium-ui .online-match-card{background:radial-gradient(circle at 100% 0,#4f9bd91c,transparent 42%),linear-gradient(145deg,#112f48,#07111b)}
    body.premium-ui .menu-secondary{gap:6px}
    body.premium-ui .menu-secondary button,.screen .action{
      min-height:43px;border:1px solid var(--ui-line);border-radius:7px;
      background:linear-gradient(180deg,#102031,#07101a);color:#e9eef2;font-weight:850;
      box-shadow:0 7px 15px #0006
    }
    body.premium-ui .menu-secondary button:active,.screen .action:active{transform:translateY(1px);filter:brightness(1.12)}
    body.premium-ui #view .card{
      border:1px solid var(--ui-line);border-radius:11px;
      background:linear-gradient(180deg,#0b1724f5,#060d15f5);box-shadow:0 16px 45px #000a;
    }

    body.premium-ui .gacha-title{font-size:28px;line-height:1;margin:3px 0 3px;letter-spacing:-.035em}
    body.premium-ui .gacha-shell{display:grid;gap:10px}
    body.premium-ui .gacha-topline{display:flex;align-items:flex-end;justify-content:space-between;gap:12px}
    body.premium-ui .gacha-kicker{font-size:7px;letter-spacing:.18em;color:var(--ui-gold);font-weight:900}
    body.premium-ui .gacha-balance{
      display:flex!important;align-items:center;gap:7px!important;margin:0!important;padding:7px 9px!important;
      border:1px solid var(--ui-line)!important;border-radius:8px!important;
      background:linear-gradient(180deg,#0f1d2c,#07101a)!important;font-size:8px!important
    }
    body.premium-ui .gacha-balance b{font-size:13px;color:#fff}
    body.premium-ui .gacha-balance span:last-child{color:var(--ui-gold-hi)}
    body.premium-ui .gacha-tabs{
      display:flex!important;gap:6px!important;overflow-x:auto!important;padding:1px 0 3px!important;
      scrollbar-width:none!important
    }
    body.premium-ui .gacha-tabs::-webkit-scrollbar{display:none}
    body.premium-ui .gacha-tab{
      flex:0 0 auto!important;min-width:112px!important;padding:8px 9px!important;border-radius:7px!important;
      border:1px solid var(--ui-line)!important;background:#08121d!important;color:#9fadb9!important;text-align:left!important
    }
    body.premium-ui .gacha-tab.selected{
      color:#fff!important;border-color:#bfa05b!important;background:linear-gradient(180deg,#26351f,#131b16)!important;
      box-shadow:inset 0 0 0 1px #dec36a33,0 7px 18px #0007
    }
    body.premium-ui .gacha-tab b{display:block;font-size:9px;white-space:nowrap}
    body.premium-ui .gacha-tab small{display:block;font-size:7px;color:#7f8d99;margin-top:2px;white-space:nowrap}
    body.premium-ui .gacha-tab em{display:inline-block;font-style:normal;font-size:6px;letter-spacing:.14em;margin-top:5px;color:var(--ui-gold)}
    body.premium-ui .gacha-banner-card{
      position:relative;overflow:hidden;min-height:228px;border-radius:12px;border:1px solid #ffffff18;
      background:radial-gradient(circle at 84% 20%,#d5b55a22,transparent 35%),linear-gradient(140deg,#11253b,#07101a);
      box-shadow:0 16px 35px #0009
    }
    body.premium-ui .gacha-banner-card:before{
      content:'';position:absolute;inset:0;background:linear-gradient(100deg,#06101ad9 0 34%,transparent 72%),linear-gradient(160deg,#ffffff08,transparent 50%);pointer-events:none
    }
    body.premium-ui .gacha-banner-copy{position:absolute;z-index:2;left:14px;top:15px;width:42%}
    body.premium-ui .gacha-banner-copy small{font-size:7px;letter-spacing:.18em;color:var(--ui-gold);font-weight:900}
    body.premium-ui .gacha-banner-copy h3{font-size:21px;line-height:1.05;margin:7px 0 5px}
    body.premium-ui .gacha-banner-copy p{font-size:9px;color:#b6c2cd;line-height:1.45;margin:0 0 10px}
    body.premium-ui .gacha-banner-copy>b{display:inline-block;padding:5px 7px;border:1px solid #e2c76e33;border-radius:5px;background:#1a1b14cc;color:#e8ce76;font-size:7px}
    body.premium-ui .gacha-featured{position:absolute;z-index:2;right:9px;bottom:9px;display:flex;gap:6px;align-items:flex-end}
    body.premium-ui .gacha-feature-card{
      width:92px;overflow:hidden;border-radius:7px;border:1px solid #ffffff17;background:linear-gradient(180deg,#162535dd,#08111bdd);
      box-shadow:0 10px 22px #000a;transform:perspective(500px) rotateY(-5deg)
    }
    body.premium-ui .gacha-feature-card:nth-child(2){transform:perspective(500px) rotateY(4deg) translateY(-8px)}
    body.premium-ui .gacha-feature-card img,.gacha-feature-card .gacha-fallback{
      display:block;width:100%;height:103px;object-fit:cover;background:linear-gradient(145deg,#172d45,#0a111a)
    }
    body.premium-ui .gacha-feature-card strong{display:block;padding:6px 6px 0;font-size:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    body.premium-ui .gacha-feature-card small{display:block;padding:2px 6px 7px;color:#8f9ca8;font-size:6px}
    body.premium-ui .gacha-feature-card.limited{border-color:#d9bc5a80;box-shadow:0 0 0 1px #d9bc5a22,0 10px 24px #000b}
    body.premium-ui .gacha-feature-card.limited small{color:#d8bb65}
    body.premium-ui .gacha-actions{display:grid!important;grid-template-columns:1fr 1.42fr!important;gap:7px!important}
    body.premium-ui .gacha-actions button{
      min-height:53px!important;border-radius:8px!important;padding:6px 9px!important;
      border:1px solid #ffffff19!important;background:linear-gradient(180deg,#101e2b,#071019)!important;color:#fff!important;
      font-weight:950!important;box-shadow:0 9px 18px #0008!important
    }
    body.premium-ui .gacha-actions .gacha-pull-ten{
      border-color:#d9bc5a66!important;background:linear-gradient(180deg,#c5a34a,#80621e)!important;color:#171208!important
    }
    body.premium-ui .gacha-actions button span{display:block;font-size:7px;opacity:.66;margin-top:3px;font-weight:700}
    body.premium-ui .gacha-actions .gacha-pull-ten span{opacity:.78}
    body.premium-ui .banner-info{
      padding:9px 10px;border:1px solid var(--ui-line);border-radius:8px;background:#050c14c9
    }
    body.premium-ui .banner-info-head{display:flex;justify-content:space-between;gap:8px;font-size:8px}
    body.premium-ui .banner-info-head span{color:var(--ui-gold);font-size:7px}
    body.premium-ui .banner-info>strong{display:block;margin-top:3px;font-size:11px}
    body.premium-ui .banner-info>small{display:block;color:#8795a2;font-size:7px;margin-top:2px}
    body.premium-ui .rate-row{display:flex;gap:3px;margin-top:7px}
    body.premium-ui .rate-row span{flex:1;text-align:center;padding:5px 1px;border-radius:4px;background:#0c1825;color:#9ba8b3;font-size:6px}
    body.premium-ui .rate-row span:first-child{color:#f1d16d;background:#201c10}
    body.premium-ui .banner-note{margin-top:6px;color:#7f8d98;font-size:6px;line-height:1.35}
    body.premium-ui .gacha-results{padding:0!important}
    body.premium-ui .results-head{
      display:flex;align-items:flex-end;justify-content:space-between;gap:10px;padding:3px 1px 6px;border-bottom:1px solid var(--ui-line)
    }
    body.premium-ui .results-head b{font-size:10px}.results-head small{font-size:7px;color:#8997a3}
    body.premium-ui .gacha-result-grid{display:grid!important;grid-template-columns:repeat(5,1fr)!important;gap:5px!important;margin-top:7px}
    body.premium-ui .gacha-result-card{
      min-width:0;border-radius:6px!important;overflow:hidden!important;border:1px solid #ffffff12!important;
      background:linear-gradient(180deg,#132233,#071019)!important;box-shadow:0 6px 13px #0007!important;padding:0!important
    }
    body.premium-ui .gacha-result-card img,.gacha-result-card .gacha-fallback{width:100%;height:72px;object-fit:cover;display:block}
    body.premium-ui .gacha-result-card strong{display:block;padding:4px 4px 0;font-size:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    body.premium-ui .gacha-result-card small{display:block;padding:2px 4px 5px;color:#82909c;font-size:5px}
    body.premium-ui .result-badge{position:absolute;margin:3px;padding:2px 3px;border-radius:3px;font-size:6px;font-weight:950;background:#0b1118d9;border:1px solid #ffffff20;z-index:2}
    body.premium-ui .gacha-result-card.rank-S{border-color:#e2c863aa!important;box-shadow:0 0 0 1px #e2c8632b,0 6px 16px #0008!important}
    body.premium-ui .gacha-result-card.rank-A{border-color:#7da8d66b!important}
    body.premium-ui .gacha-result-card.limited{border-color:#cfb04d88!important}
    body.premium-ui .gacha-result-card em{
      display:block;margin:0 4px 5px;padding:3px;border-radius:3px;background:#2c2613;color:#d6b960;font-style:normal;font-size:5px
    }
    body.premium-ui .gacha-empty,.gacha-error{
      min-height:76px;display:grid;place-content:center;text-align:center;border:1px solid var(--ui-line);
      border-radius:8px;background:#050c14;color:#9aa7b3
    }
    body.premium-ui .gacha-empty b,.gacha-error b{font-size:9px;color:#dbe2e8}.gacha-empty small,.gacha-error small{font-size:7px;margin-top:3px}
    body.premium-ui .back{margin-top:2px}

    body.premium-ui .sc-player-grid{gap:7px!important}
    body.premium-ui .sc-player-card{
      border-radius:9px!important;border:1px solid #ffffff14!important;background:linear-gradient(180deg,#122131,#071019)!important;
      box-shadow:0 9px 20px #0007!important;overflow:hidden!important
    }
    body.premium-ui .sc-player-card.rank-S{border-color:#dbbf63aa!important}
    body.premium-ui .sc-player-card.rank-A{border-color:#7ea9d35e!important}
    body.premium-ui .sc-card-ribbon{background:linear-gradient(90deg,#0b1117f2,#101b27cc)!important;border-bottom:1px solid #ffffff10}
    body.premium-ui .sc-card-ribbon span{color:#e7cb75!important}
    body.premium-ui .sc-card-main{padding:8px!important}
    body.premium-ui .sc-card-portrait{border-radius:6px!important;overflow:hidden}
    body.premium-ui .sc-card-stats{background:#06101ae8!important;border-top:1px solid #ffffff0c!important}
    body.premium-ui .sc-card-stats span{border-right:1px solid #ffffff08!important}
    body.premium-ui .sc-card-stats b{color:#f1f4f6}
    body.premium-ui .sc-card-bottom{padding:6px 7px!important}

    body.premium-ui #presentation{
      font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif!important
    }
    body.premium-ui #presentation .gacha-stage{
      background:
        radial-gradient(circle at 50% 36%,#274766 0,transparent 24%),
        radial-gradient(circle at 50% 82%,#091c31 0 18%,transparent 43%),
        linear-gradient(180deg,#02070d,#081626 60%,#031019)!important;
    }
    body.premium-ui #presentation .gacha-sky{filter:brightness(.9) saturate(.85)}
    body.premium-ui #presentation .gacha-field{
      background:radial-gradient(ellipse at center,#163b2d,#06150e 72%)!important;
      opacity:.92
    }
    body.premium-ui #presentation .pres-card-frame{
      border-radius:12px!important;border:1px solid #e4cc786a!important;
      box-shadow:0 20px 55px #000d,0 0 0 1px #ffffff14,0 0 60px #d5b14e2b!important;
      background:linear-gradient(160deg,#142435,#06101a)!important
    }
    body.premium-ui #presentation .pres-card-art{background:linear-gradient(145deg,#0c2134,#06101a)!important}
    body.premium-ui #presentation .pres-card-top span{color:#d8bd67!important}
    body.premium-ui #presentation .pres-card-top b{color:#fff!important}
    body.premium-ui #presentation .pres-stat-row i{background:#091522!important;border:1px solid #ffffff12!important}
    body.premium-ui #presentation .pres-stat-row b{color:#f2d983!important}
    body.premium-ui #presentation .gacha-result-banner{filter:drop-shadow(0 10px 30px #000)}
    @media(max-width:390px){
      body.premium-ui .gacha-banner-card{min-height:216px}
      body.premium-ui .gacha-feature-card{width:78px}
      body.premium-ui .gacha-feature-card img,.gacha-feature-card .gacha-fallback{height:88px}
      body.premium-ui .gacha-banner-copy{width:46%}
      body.premium-ui .gacha-result-grid{grid-template-columns:repeat(5,1fr)!important}
      body.premium-ui .gacha-result-card img,.gacha-result-card .gacha-fallback{height:64px}
    }
  `;
  document.head.appendChild(style);
  document.body.classList.add('premium-ui');
}
installPremiumDesignSystem();

const wait=(ms)=>new Promise(r=>setTimeout(r,ms));
export function ensurePresentationLayer(){let el=document.getElementById('presentation');if(el)return el;el=document.createElement('div');el.id='presentation';el.innerHTML='<div class="gacha-stage"><div class="gacha-sky"></div><div class="gacha-lights"></div><div class="gacha-field"></div><div class="gacha-ball"></div><div class="gacha-card-slot"><div id="pres-card" class="pres-card"></div></div><div class="gacha-particles"></div></div><div class="pres-vignette"></div><div id="gacha-result-banner" class="gacha-result-banner"><div id="gacha-result-rank" class="gacha-result-rank"></div><div id="gacha-result-status" class="gacha-result-status"></div><div id="gacha-result-type" class="gacha-result-type"></div></div><div id="pres-kicker" class="pres-kicker"></div><div id="pres-title" class="pres-title"></div><div id="pres-sub" class="pres-sub"></div><div id="pres-flash" class="pres-flash"></div>';document.body.appendChild(el);return el;}
export function gachaRevealType(result){if(result?.duplicate)return'DUPLICATE';if(result?.limited&&result?.rank==='S')return'LIMITED_S';if(result?.rank==='S')return'S_GUARANTEED';if(result?.rank==='A')return'A_HIGH';if(result?.rarity==='LEGEND')return'LEGEND';if(result?.rarity==='STAR')return'STAR';if(result?.rarity==='PRO')return'PRO';return'ROOKIE';}
export async function playGachaReveal({rarity,name,image,rank,limited,duplicate=false,banner,cardType,limitedTheme,overall,position,stats}){
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
 if(pc)pc.innerHTML='<div class="pres-card-frame"><div class="pres-card-top"><span>'+((limitedTheme||cardType||'BASEBALL 3D'))+'</span><b>'+((rank||rarity||'—'))+'</b></div><div class="pres-card-art">'+(image?'<img src="'+image+'" alt="">':'<div class="no-card">PLAYER</div>')+'</div><div class="pres-card-info"><small>'+((position||'PLAYER')+' · OVR '+(overall??'—'))+'</small><strong>'+((name||'PLAYER'))+'</strong><div class="pres-stat-row">'+Object.entries(stats||{}).slice(0,4).map(([k,v])=>'<i><em>'+k.toUpperCase()+'</em><b>'+v+'</b></i>').join('')+'</div></div></div>';
 flash.className='pres-flash active';setTimeout(()=>flash.className='pres-flash',limited||rank==='S'?520:260);
 await wait(limited?3000:rank==='S'?2800:type==='S_GUARANTEED'||type==='LIMITED_S'?2100:type==='LEGEND'?1800:1450);
 root.className='';return type;
}
export async function playMatchEvent(type,detail=''){ensurePresentationLayer();const root=document.getElementById('presentation'),k=document.getElementById('pres-kicker'),t=document.getElementById('pres-title'),s=document.getElementById('pres-sub');const map={inning:['GAME PRESENTATION',detail||'PLAY BALL'],pitch:['PITCH',detail||'投球開始'],single:['HIT','SINGLE'],double:['HIT','DOUBLE'],triple:['HIT','TRIPLE'],home_run:['HOME RUN','GOING DEEP'],strikeout:['STRIKEOUT','BATTER OUT'],out:['OUT','PLAY MADE'],walk:['BASE ON BALLS','TAKE YOUR BASE']};const v=map[type]||['PLAY',''+detail];root.className='pres-show match-event '+(type||'');k.textContent=v[0];t.textContent=v[1];s.textContent=detail&&detail!==v[1]?detail:'';await wait(type==='home_run'?1700:850);root.className='';}
