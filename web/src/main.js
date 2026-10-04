import * as THREE from 'three';
import {ALL_PLAYERS} from './data/players.js';
import {pullOnce,pullMany} from './game/gacha-service.js';
import {GACHA_BANNERS} from './data/gacha.js';
import {createMatchState,resolvePitch,applyOutcome,resolveFieldingPlay,isValidMatchState,advancePitcher,substitutePitcher,PITCHES,createPitchPhysics,createBattedBallPhysics,stepBallPhysics,isFiniteBallPhysics} from './game/simulation.js';
import {loadSave,saveGame} from './game/save.js';
import {modeLabel} from './game/ui.js';
import {getCloudSave,putCloudSave,getCloudUser,signInWithMagicLink,signOutCloud} from './game/cloud-save.js';
import {ensurePresentationLayer,playGachaReveal,playMatchEvent} from './game/presentation.js';
import {createPlayerModel,animatePlayer} from './game/player-models.js';
import {choosePitch,chooseSwing,AI_DIFFICULTIES} from './game/ai.js';
import {AI_TEAM_LINEUP,AI_TEAM_PITCHERS} from './game/ai-roster.js';
import {cardModel,modelConfig,aiProfile,developmentFor,trainPlayer,duplicateReward,releasePlayer,triggerSpecialAbility} from './game/player-system.js';
import {createOnlineHost,createOnlineGuest,acceptOnlineAnswer,isOnlineSupported} from './game/online.js';

ensurePresentationLayer();
const canvas=document.querySelector('#game');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setSize(innerWidth,innerHeight,false); renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.08;
const scene=new THREE.Scene(); scene.background=new THREE.Color(0x08111f); scene.fog=new THREE.Fog(0x08111f,35,110);
const camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,.1,200); camera.position.set(0,16,27); camera.lookAt(0,2,-8);
scene.add(new THREE.HemisphereLight(0xffffff,0x203040,2.2));
const sun=new THREE.DirectionalLight(0xffffff,2.5);sun.position.set(12,30,10);scene.add(sun);
const field=new THREE.Mesh(new THREE.CircleGeometry(34,96),new THREE.MeshStandardMaterial({color:0x2e7d32,roughness:1}));field.rotation.x=-Math.PI/2;field.position.y=-.15;scene.add(field);
const infield=new THREE.Mesh(new THREE.CircleGeometry(10,4),new THREE.MeshStandardMaterial({color:0xb98250,roughness:1}));infield.rotation.x=-Math.PI/2;infield.rotation.z=Math.PI/4;scene.add(infield);
const mound=new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.5,.3,32),new THREE.MeshStandardMaterial({color:0xc89565}));mound.position.set(0,.15,3);scene.add(mound);
const home=new THREE.Mesh(new THREE.CylinderGeometry(.65,.65,.12,5),new THREE.MeshStandardMaterial({color:0xffffff}));home.rotation.y=Math.PI/4;home.position.set(0,.08,-8);scene.add(home);
const ball=new THREE.Mesh(new THREE.SphereGeometry(.16,20,20),new THREE.MeshStandardMaterial({color:0xffffff}));ball.position.set(0,2.1,3);scene.add(ball);
let pitcher=createPlayerModel(modelConfig(ALL_PLAYERS[0]));pitcher.position.set(0,0,3);pitcher.userData.identity.playerId=ALL_PLAYERS[0].id;scene.add(pitcher);
let batter=createPlayerModel(modelConfig(ALL_PLAYERS[4]));batter.position.set(2.2,0,-8);batter.rotation.y=Math.PI;batter.userData.identity.playerId=ALL_PLAYERS[4].id;scene.add(batter);
const FIELDER_STARTS=Object.freeze([[-10,0,1],[0,0,13],[10,0,1],[-17,0,-3],[17,0,-3],[-7,0,8],[7,0,8],[12,0,13],[-12,0,13]]);
const fielders=FIELDER_STARTS.map(([x,y,z],i)=>{const p=createPlayerModel({uniform:0x163a66,scale:.9});p.position.set(x,y,z);scene.add(p);return p});
const catcher=createPlayerModel({uniform:0x163a66,scale:.86});catcher.position.set(0,0,-9.7);catcher.rotation.y=Math.PI;scene.add(catcher);
const runnerVisuals=[0,1,2].map(()=>{const p=createPlayerModel({uniform:0xb33a3a,scale:.78});p.visible=false;scene.add(p);return p;});
const BASE_POSITIONS=Object.freeze([[0,-8],[8,-8],[8,0],[0,0]]);
function resetFielderPositions(){
  fielders.forEach((p,i)=>{const [x,y,z]=FIELDER_STARTS[i];p.position.set(x,y,z);});
  catcher.position.set(0,0,-9.7);catcher.rotation.y=Math.PI;runnerVisuals.forEach(p=>p.visible=false);
}
function updateRunnerVisuals(){
  const live=(match.runners||[]).filter(r=>r.status==='LIVE'&&r.base>=0);
  runnerVisuals.forEach((p,i)=>{
    const r=live[i];
    if(!r){p.visible=false;return;}
    const [x,z]=BASE_POSITIONS[Math.min(3,Math.max(0,Number(r.base)||0))];
    p.visible=true;p.position.x+=(x-p.position.x)*.18;p.position.z+=(z-p.position.z)*.18;
  });
}

/* Lightweight 3D stadium dressing: geometry only, no external assets. */
function addFieldLine(a,b,width=.035){
  const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);
  const m=new THREE.Mesh(new THREE.BoxGeometry(width,.012,len),new THREE.MeshBasicMaterial({color:0xffffff}));
  m.position.set((a[0]+b[0])/2,.02,(a[1]+b[1])/2);m.rotation.y=-Math.atan2(dx,dz);scene.add(m);
}
addFieldLine([-8,-8],[0,-8]);addFieldLine([0,-8],[8,-8]);addFieldLine([8,-8],[0,0]);addFieldLine([0,0],[-8,-8]);
for(const x of [-30,-20,-10,0,10,20,30]){
  const stand=new THREE.Mesh(new THREE.BoxGeometry(7,4,1.5),new THREE.MeshStandardMaterial({color:0x1b2633,roughness:.9}));
  stand.position.set(x,2,19);scene.add(stand);
}
const backstop=new THREE.Mesh(new THREE.BoxGeometry(46,8,.45),new THREE.MeshStandardMaterial({color:0x17212b,roughness:.95}));
backstop.position.set(0,4,24);scene.add(backstop);
const wall=new THREE.Mesh(new THREE.CylinderGeometry(28,28,3,64,1,true,0,Math.PI),new THREE.MeshStandardMaterial({color:0x0d3b24,roughness:1,side:THREE.DoubleSide}));
wall.rotation.y=Math.PI;wall.position.set(0,1,9);scene.add(wall);
const baseMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.7});
for(const [x,z] of [[0,-8],[8,-8],[8,0],[0,0]]){const b=new THREE.Mesh(new THREE.BoxGeometry(.5,.08,.5),baseMat);b.position.set(x,.1,z);b.rotation.y=Math.PI/4;scene.add(b);}

function addPremiumStadiumDressing(){
  const stripeMatA=new THREE.MeshStandardMaterial({color:0x2f8139,roughness:.95});
  const stripeMatB=new THREE.MeshStandardMaterial({color:0x276f31,roughness:.95});
  for(let i=0;i<7;i++){
    const strip=new THREE.Mesh(new THREE.BoxGeometry(46,.01,4),i%2?stripeMatA:stripeMatB);
    strip.position.set(0,-.13,4+i*4.8);
    scene.add(strip);
  }
  const track=new THREE.Mesh(new THREE.RingGeometry(24.5,27.5,96,1,Math.PI*.04,Math.PI*.92),new THREE.MeshStandardMaterial({color:0x9b6a46,roughness:1}));
  track.rotation.x=-Math.PI/2;track.position.set(0,-.08,9);scene.add(track);
  for(const x of [-30,-20,-10,0,10,20,30]){
    const upper=new THREE.Mesh(new THREE.BoxGeometry(8,1.5,1),new THREE.MeshStandardMaterial({color:0x263746,roughness:.8}));
    upper.position.set(x,5.2,19);scene.add(upper);
    const rail=new THREE.Mesh(new THREE.BoxGeometry(8.2,.08,.12),new THREE.MeshStandardMaterial({color:0x60707d,metalness:.35,roughness:.5}));
    rail.position.set(x,6.0,18.35);scene.add(rail);
  }
  for(const x of [-25,25]){
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(.10,.14,11,10),new THREE.MeshStandardMaterial({color:0x3e4a55,metalness:.5,roughness:.45}));
    pole.position.set(x,5.5,16);scene.add(pole);
    const head=new THREE.Mesh(new THREE.BoxGeometry(1.2,.35,.6),new THREE.MeshStandardMaterial({color:0xdbe3e8,emissive:0x71808d,emissiveIntensity:.55}));
    head.position.set(x,10.6,15.8);scene.add(head);
    const light=new THREE.PointLight(0xdbe6ef,1.8,28,.9);light.position.set(x,10.4,15.2);scene.add(light);
  }
  const board=new THREE.Mesh(new THREE.BoxGeometry(15,2.7,.35),new THREE.MeshStandardMaterial({color:0x0c1722,metalness:.2,roughness:.6,emissive:0x061421,emissiveIntensity:.7}));
  board.position.set(0,4.6,23.3);scene.add(board);
  const boardGlow=new THREE.Mesh(new THREE.BoxGeometry(14.2,2.1,.06),new THREE.MeshBasicMaterial({color:0x1c4057,transparent:true,opacity:.72}));
  boardGlow.position.set(0,4.6,23.08);scene.add(boardGlow);
}
addPremiumStadiumDressing();
let fieldingFrom={x:0,z:0};let fielderTarget=null;let fielderIndex=0;let ballPhysics=null;let pendingOutcome=null;

let save=loadSave(); let match=createMatchState();
let pitchState='idle',t=0; let selectedPitch='FASTBALL'; let pitchStart=0; let swingWindowOpen=false; let pitchTarget={x:0,y:0}; let aimTarget={x:0,y:0}; let cameraMode='BATTER'; let aimDragging=false;
let matchMode='AI'; let matchDifficulty=save.settings?.aiDifficulty||'NORMAL'; let onlineRole=null; let onlineConnection=null; let onlineConnected=false; let onlinePendingPitchId=null; let onlinePendingPitch=null; let onlineRemoteRoster=[]; let onlineRosters={away:[],home:[]};
let onlineRevision=0;let onlineSessionStarted=false;let onlineActionSentForPitch=false;let onlineStealPending=false;
let fielderAction='idle';let fielderActionUntil=0;let lastFrameTime=performance.now();let stealTargetBase=1;
let fielderManualInput=false;let fielderThrowTarget=0;let fieldingPadPointer=null;
const $=id=>document.getElementById(id); const homeUI=$('home'),viewUI=$('view'),card=$('card'),matchUI=$('match-ui'),currency=$('currency');
function updateProfileUI(){const count=save.collection.length;const power=save.collection.reduce((sum,id)=>{const p=ALL_PLAYERS.find(x=>x.id===id);return sum+(p?Math.round(((p.power||70)+(p.contact||70)+(p.field||70)+(p.control||70))/4):0)},0);$('record').textContent=`${save.wins}勝 ${save.matches}試合`;$('roster-count').textContent=count;$('team-power').textContent=count?Math.round(power/count):'—';}

function playerTeamColor(p){
  const palette={T:'#d94d52',G:'#283c80',DB:'#4a78d2',D:'#4e78ad',C:'#e09a41',S:'#173f7a',B:'#ba6f2f',H:'#f1a62a',F:'#315aa7',E:'#8c3fb4',L:'#1f7a67',M:'#162f62'};
  return palette[p.teamCode]||'#7f8fa4';
}
function playerRankClass(rank){return ['S','A','B','C','D','F'].includes(rank)?rank:'B';}
function playerCardMarkup(p,{owned=true,release=false,showAbilities=true}={}){
  const c=cardModel(p,developmentFor(save,p.id));
  const level=developmentFor(save,p.id)?.level||1;
  const team=String(p.team||'NPB').replace('NPB HISTORY','NPB HISTORY');
  const role=p.pos?.includes('P')?'PITCHER':'HITTER';
  const initials=String(p.name||'?').replace(/[\s・—–-]/g,'').slice(0,3);
  const color=playerTeamColor(p);
  const ability=showAbilities&&c.abilities.length
    ? c.abilities.slice(0,3).map(a=>'<span class="sc-card-ability '+(a.kind==='special'?'special':'')+'"><b>'+a.name+'</b><em>'+a.ratePercent+'%</em></span>').join('')
    : '<span class="sc-card-empty">特殊能力 未習得</span>';
  const statRows=role==='PITCHER'
    ? [['球威',c.stats.power],['制球',c.stats.control],['スタ',c.stats.stamina],['肩',c.stats.arm],['選球',c.stats.vision]]
    : [['ミート',c.stats.contact],['パワー',c.stats.power],['走力',c.stats.speed],['肩力',c.stats.arm],['守備',c.stats.field]];
  const statHtml=statRows.map(([label,value])=>'<span><small>'+label+'</small><b>'+value+'</b></span>').join('');
  const photo=owned&&p.image
    ? '<img src="'+p.image+'" alt="" loading="lazy" referrerpolicy="no-referrer">'
    : '';
  const fallback=owned
    ? '<div class="sc-card-avatar-fallback" style="display:'+(p.image?'none':'grid')+'"><strong>'+initials+'</strong><small>'+role+'</small></div>'
    : '<div class="sc-card-avatar-fallback locked"><strong>?</strong><small>LOCKED</small></div>';
  return '<article class="sc-player-card rank-'+playerRankClass(c.rank)+' '+(owned?'':'is-locked')+'" data-player-id="'+p.id+'" style="--team:'+color+'">'+
    '<div class="sc-card-ribbon"><span>'+c.rank+' RANK</span><b>'+(p.limited?'LIMITED':'2026 SERIES')+'</b></div>'+
    '<div class="sc-card-main">'+
      '<div class="sc-card-portrait">'+photo+fallback+'<i class="sc-card-team-dot"></i></div>'+
      '<div class="sc-card-copy">'+
        '<div class="sc-card-team"><span>'+team+'</span><em>'+String(p.teamCode||'NPB')+'</em></div>'+
        '<h3>'+(owned?c.name:'？？？？？？')+'</h3>'+
        '<div class="sc-card-position"><b>'+c.pos+'</b><span>'+role+'</span><span>'+(p.status==='LEGEND'?'LEGEND':p.league||'NPB')+'</span></div>'+
        '<div class="sc-card-rating"><strong>'+c.overall+'</strong><span>OVR</span><small>Lv.'+level+'</small></div>'+
      '</div>'+
    '</div>'+
    '<div class="sc-card-stats">'+statHtml+'</div>'+
    '<div class="sc-card-bottom"><div class="sc-card-abilities">'+ability+'</div><span class="sc-card-id">ID '+String(p.id).padStart(4,'0')+'</span></div>'+
    (release?'<button type="button" class="sc-card-release release-player" data-id="'+p.id+'">放出</button>':'')+
  '</article>';
}
function playerCards(){
  return resolveOwnedPlayers().map(p=>playerCardMarkup(p,{owned:true,release:true})).join('');
}
function showPlayer3D(id){
  const p=ALL_PLAYERS.find(x=>x.id===Number(id));
  if(!p)return;
  const cfg=modelConfig(p);
  const preview=createPlayerModel(cfg);
  preview.position.set(0,0,-2);
  scene.add(preview);
  const old=scene.userData.playerPreview;
  if(old)scene.remove(old);
  scene.userData.playerPreview=preview;
  const root=ensurePresentationLayer();
  root.className='pres-show';
  $('pres-kicker').textContent='PLAYER';
  $('pres-title').textContent=p.name;
  const pc=cardModel(p,developmentFor(save,p.id)); $('pres-sub').textContent=(p.pos||'')+' · '+pc.rank+' RANK · OVR '+pc.overall+'　3D PREVIEW';
  setTimeout(()=>{root.className='';},1100);
}
let cloudSyncTimer=null;
let cloudSyncEnabled=false;
getCloudUser().then(user=>{cloudSyncEnabled=Boolean(user)}).catch(()=>{});
function persist(){
  saveGame(save);
  currency.textContent=save.unlimitedCoins?'∞':save.currency.toLocaleString('ja-JP');
  updateProfileUI();
  if(!cloudSyncEnabled)return;
  clearTimeout(cloudSyncTimer);
  cloudSyncTimer=setTimeout(()=>{void putCloudSave(save).catch(()=>{});},30000);
}
function setMode(mode){
  homeUI.classList.toggle('hidden',mode!=='home');
  viewUI.classList.toggle('hidden',mode==='home'||mode==='match');
  matchUI.classList.toggle('hidden',mode!=='match');
  if(mode!=='match') renderer.domElement.style.opacity='0.35'; else renderer.domElement.style.opacity='1';
  if(mode==='home')return;
  if(mode==='gacha')renderGacha(); else if(mode==='roster')renderRoster();
  else if(mode==='training')renderTraining();
  else if(mode==='collection')renderCollection(); else if(mode==='settings')renderSettings();
  else if(mode==='online-lobby')renderOnlineLobby();
}
window.__setMode=(mode)=>{try{return setMode(mode);}catch(err){window.__lastGameError=String(err?.message||err);if(window.__fallbackMode){return window.__fallbackMode(mode,true);}throw err;}};
function showAbilityDetails(playerId,abilityId){
  const p=ALL_PLAYERS.find(x=>x.id===Number(playerId)); if(!p)return;
  const a=cardModel(p,developmentFor(save,p.id)).abilityEffects.find(x=>x.id===abilityId); if(!a)return;
  let modal=document.getElementById('ability-modal');
  if(!modal){modal=document.createElement('div');modal.id='ability-modal';document.body.appendChild(modal);}
  const labels={power:'パワー',contact:'ミート',field:'守備',speed:'走力',arm:'肩力',control:'制球',stamina:'スタミナ',vision:'選球眼'};
  const effects=Object.entries(a.effects).map(([k,v])=>'<span>'+labels[k]+' <b>+'+v+'</b></span>').join('');
  modal.innerHTML='<div class="ability-modal-box"><div class="ability-modal-kicker">SPECIAL ABILITY</div><h3>'+a.name+'</h3><p>発動率 '+a.ratePercent+'%</p><div class="ability-effects">'+(effects||'<span>固有効果</span>')+'</div><small>発動時に表示能力へ反映されるゲーム内補正</small><button type="button" id="ability-close">閉じる</button></div>';
  modal.classList.add('show'); modal.querySelector('#ability-close').onclick=()=>modal.classList.remove('show');
}
function bindPlayerCards(){
  card.querySelectorAll('[data-player-id]:not(.is-locked)').forEach(b=>b.onclick=()=>showPlayer3D(b.dataset.playerId));
  card.querySelectorAll('.ability-info').forEach(b=>b.onclick=e=>{e.stopPropagation();showAbilityDetails(b.closest('[data-player-id]')?.dataset.playerId,b.dataset.ability);});
  card.querySelectorAll('.release-player').forEach(b=>b.onclick=e=>{e.stopPropagation();const p=ALL_PLAYERS.find(x=>x.id===Number(b.dataset.id));if(!p)return;if(!confirm(p.name+'を放出しますか？'))return;const r=releasePlayer(save,p);if(r.error)return;save=r.state;persist();renderRoster();});
}
function playerCardsFor(players){
  return players.map(p=>playerCardMarkup(p,{owned:true,release:true})).join('');
}
function resolveOwnedPlayers(){
  const ids=[...(save.collection||[])].map(id=>Number(id)).filter(Number.isFinite);
  return [...new Set(ids)].map(id=>ALL_PLAYERS.find(p=>Number(p.id)===id)).filter(Boolean);
}
function portraitMarkup(p,extra=''){
  const image=p.image||'';
  const initials=p.name.split(' ').map(x=>x[0]).join('').slice(0,3);
  return '<div class="player-portrait '+extra+'"><span class="rank-badge">'+(p.rank||'—')+'</span>'+
    (image?'<img src="'+image+'" alt="'+p.name+'" loading="eager" referrerpolicy="no-referrer" decoding="async" onerror="this.onerror=null;this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'"><div class="portrait-fallback" style="display:none"><span>'+initials+'</span><small>PHOTO UNAVAILABLE</small></div>':
    '<div class="portrait-fallback"><span>'+initials+'</span><small>PHOTO UNAVAILABLE</small></div>')+'</div>';
}
function renderCard(title,body){card.innerHTML='<h2>'+title+'</h2><p>'+body+'</p><button class="action back" id="back">ホームへ戻る</button>'; $('back').onclick=()=>setMode('home');}
async function renderSettings(){
  const user=await getCloudUser();
  const settings={quickPitch:true,battingModeDefault:'CONTACT',cursorSpeed:1,...(save.settings||{})};
  card.innerHTML='<h2>試合設定</h2>'+
    '<div class="settings-list">'+
    '<label class="settings-row"><span>クイック投球</span><input id="set-quick-pitch" type="checkbox" '+(settings.quickPitch?'checked':'')+'></label>'+
    '<div class="settings-row"><span>初期打撃モード</span><div class="settings-segment"><button type="button" id="set-contact" class="'+(settings.battingModeDefault==='CONTACT'?'selected':'')+'">ミート</button><button type="button" id="set-power" class="'+(settings.battingModeDefault==='POWER'?'selected':'')+'">強振</button></div></div>'+
    '<label class="settings-row"><span>カーソル速度 <b id="set-cursor-value">'+Number(settings.cursorSpeed).toFixed(1)+'</b></span><input id="set-cursor-speed" type="range" min="0.5" max="1.5" step="0.1" value="'+Number(settings.cursorSpeed).toFixed(1)+'"></label>'+
    '</div>'+
    '<h3 class="settings-subtitle">クラウドセーブ</h3><p class="small">ローカル保存を優先し、ログイン中はクラウドへ同期します。</p>'+
    '<p class="small">'+(user?'クラウド: 接続中':'クラウド: 未ログイン')+'</p>'+
    (user?'<button class="action" id="cloudLogout">クラウドからログアウト</button>':'<div class="row"><input id="cloudEmail" type="email" placeholder="メールアドレス" style="flex:2;padding:14px;border-radius:14px;border:1px solid #ffffff25;background:#101d2d;color:#fff"><button class="action" id="cloudLogin">ログインリンク</button></div>')+
    '<button class="action back" id="back">ホームへ戻る</button>';
  const writeSettings=next=>{save.settings={...settings,...next};persist();};
  $('set-quick-pitch').onchange=e=>writeSettings({quickPitch:e.target.checked});
  const refreshMode=mode=>{writeSettings({battingModeDefault:mode});$('set-contact').classList.toggle('selected',mode==='CONTACT');$('set-power').classList.toggle('selected',mode==='POWER');};
  $('set-contact').onclick=()=>refreshMode('CONTACT');$('set-power').onclick=()=>refreshMode('POWER');
  $('set-cursor-speed').oninput=e=>{const v=Number(e.target.value);$('set-cursor-value').textContent=v.toFixed(1);writeSettings({cursorSpeed:v});};
  $('back').onclick=()=>setMode('home');
  if(user) $('cloudLogout').onclick=async()=>{await signOutCloud();renderSettings();};
  else $('cloudLogin').onclick=async()=>{const email=$('cloudEmail').value.trim();if(!email)return;const {error}=await signInWithMagicLink(email);if(error)alert(error.message);else alert('ログインリンクをメールに送信しました。');};
}
function renderCollection(){
  const owned=new Set(save.collection||[]);
  const total=ALL_PLAYERS.length;
  const filters=[['ALL','ALL'],['NPB ACTIVE','NPB_ACTIVE'],['LEGENDS','LEGENDS'],['MLB','MLB']];
  card.innerHTML=
    '<div class="collection-head">'+
      '<div><span class="section-kicker">PLAYER ARCHIVE</span><h2>選手名鑑</h2><p>現役NPBを主軸に、レジェンド・MLBを収録。</p></div>'+
      '<div class="collection-count"><strong id="collection-owned-count">0</strong><span>/ '+total+'</span><small>COLLECTED</small></div>'+
    '</div>'+
    '<div class="collection-filter-row">'+filters.map((f,i)=>'<button type="button" class="collection-filter '+(i===0?'selected':'')+'" data-filter="'+f[1]+'">'+f[0]+'</button>').join('')+'</div>'+
    '<div class="sc-player-grid" id="collection-grid"></div>'+
    '<button type="button" class="action back" id="back">ホームへ戻る</button>';
  const grid=$('collection-grid');
  function matches(p,filter){
    if(filter==='NPB_ACTIVE')return p.league==='NPB'&&p.status==='ACTIVE';
    if(filter==='LEGENDS')return p.status==='LEGEND';
    if(filter==='MLB')return p.league==='MLB';
    return true;
  }
  function renderFiltered(filter){
    const players=ALL_PLAYERS.filter(p=>matches(p,filter));
    grid.innerHTML=players.map(p=>playerCardMarkup(p,{owned:owned.has(p.id),release:false,showAbilities:owned.has(p.id)})).join('');
    $('collection-owned-count').textContent=players.filter(p=>owned.has(p.id)).length;
    grid.querySelectorAll('.is-locked').forEach(b=>b.onclick=()=>setMode('gacha'));
    bindPlayerCards();
  }
  card.querySelectorAll('.collection-filter').forEach(btn=>btn.onclick=()=>{
    card.querySelectorAll('.collection-filter').forEach(x=>x.classList.toggle('selected',x===btn));
    renderFiltered(btn.dataset.filter);
  });
  $('back').onclick=()=>setMode('home');
  renderFiltered('ALL');
}

function renderGacha(){
  const escape=(v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const rankScore={S:6,A:5,B:4,C:3,D:2,F:1};
  const rankRate={S:'0.1%',A:'8%',B:'15%',C:'22%',D:'25%',F:'29.5%'};
  let bannerId=GACHA_BANNERS[0].id,busy=false,lastResults=[];
  card.innerHTML=
    '<div class="gacha-shell">'+
      '<div class="gacha-topline">'+
        '<div><span class="gacha-kicker">SCOUT / PLAYER ACQUISITION</span><h2 class="gacha-title">スカウト</h2></div>'+
        '<div class="gacha-balance"><span>COINS</span><b id="gacha-coins">'+(save.unlimitedCoins?'∞':save.currency.toLocaleString('ja-JP'))+'</b></div>'+
      '</div>'+
      '<div class="gacha-tabs" id="gacha-tabs">'+
        GACHA_BANNERS.map((b,i)=>'<button type="button" class="gacha-tab '+(i===0?'selected':'')+'" data-banner="'+escape(b.id)+'"><b>'+escape(b.name)+'</b><small>'+escape(b.subtitle)+'</small><em>'+escape(b.kind)+'</em></button>').join('')+
      '</div>'+
      '<section class="gacha-banner-card" id="gacha-banner-card"></section>'+
      '<div class="gacha-actions">'+
        '<button type="button" class="gacha-pull-one" id="pull"><b>1回スカウト</b><span>250 コイン</span></button>'+
        '<button type="button" class="gacha-pull-ten" id="pull10"><b>10連スカウト</b><span>2,500 コイン · B以上1枚確定</span></button>'+
      '</div>'+
      '<div id="banner-info" class="banner-info"></div>'+
      '<section class="gacha-results" id="gacha-results">'+
        '<div class="gacha-empty"><b>SCOUT READY</b><small>バナーを選んで選手を獲得</small></div>'+
      '</section>'+
      '<button type="button" class="action back" id="back">ホームへ戻る</button>'+
    '</div>';

  const tabs=card.querySelectorAll('.gacha-tab');
  const coinsEl=$('gacha-coins');
  const resultEl=$('gacha-results');
  const getBanner=()=>GACHA_BANNERS.find(x=>x.id===bannerId)||GACHA_BANNERS[0];
  const updateBalance=()=>{coinsEl.textContent=save.unlimitedCoins?'∞':save.currency.toLocaleString('ja-JP');};

  function featuredCard(p,index){
    const initials=String(p.name||'?').replace(/[\s・—–-]/g,'').slice(0,3);
    const featuredCardModel=cardModel(p,developmentFor(save,p.id));
    const tag=p.limited?'LIMITED':(p.featuredTag||'FEATURED');
    return '<button type="button" class="gacha-feature-card '+(p.limited?'limited':'')+'" data-player-id="'+escape(p.id)+'">'+
      (p.image?'<img src="'+escape(p.image)+'" alt="" loading="lazy" referrerpolicy="no-referrer">':'<div class="gacha-fallback"><b>'+escape(initials)+'</b></div>')+
      '<span class="gacha-feature-rank">'+escape(p.rank||'—')+'</span>'+
      '<div class="gacha-feature-meta"><strong>'+escape(p.name)+'</strong><b>OVR '+escape(featuredCardModel.overall)+'</b><small>'+escape(tag)+' · '+escape(p.teamCode||'NPB')+' · '+escape(p.pos||'PLAYER')+'</small></div>'+
    '</button>';
  }

  function renderBanner(){
    const b=getBanner();
    const pool=ALL_PLAYERS.filter(b.filter);
    const featured=[...pool.filter(p=>p.limited),...pool.filter(p=>!p.limited)].slice(0,3);
    $('banner-info').innerHTML=
      '<div class="banner-info-head"><b>'+escape(b.name)+'</b><span>'+escape(b.kind)+'</span></div>'+
      '<strong>'+escape(b.subtitle)+'</strong>'+
      '<small>'+escape(b.rateBonus)+'</small>'+
      '<div class="rate-row">'+Object.entries(rankRate).map(([rank,rate])=>'<span><b>'+rank+'</b> '+rate+'</span>').join('')+'</div>'+
      '<div class="banner-note">排出対象 '+pool.length+'名 · 10連はBランク以上1枚確定</div>';
    $('gacha-banner-card').innerHTML=
      '<div class="gacha-banner-copy"><small>SCOUT BANNER · '+escape(b.kind)+'</small><h3>'+escape(b.name)+'</h3><p>'+escape(b.subtitle)+'</p><b>'+escape(b.rateBonus)+'</b><div class="gacha-banner-kpis"><span><em>対象</em><strong>'+pool.length+'</strong></span><span><em>S</em><strong>0.1%</strong></span><span><em>10連</em><strong>B以上</strong></span></div></div>'+
      '<div class="gacha-featured">'+(featured.length?featured.map(featuredCard).join(''):'<div class="gacha-no-pool">対象選手を準備中</div>')+'</div>'+
      '<div class="gacha-banner-footer"><span>PICK UP</span><i></i><span>BASEBALL 3D · '+escape(b.id)+'</span></div>';
    tabs.forEach((btn,index)=>btn.classList.toggle('selected',btn.dataset.banner===bannerId));
    card.querySelectorAll('.gacha-feature-card').forEach(btn=>btn.onclick=()=>showPlayer3D(btn.dataset.playerId));
  }

  function renderResults(results,bonusApplied=false){
    lastResults=Array.isArray(results)?results:[];
    if(!lastResults.length){
      resultEl.innerHTML='<div class="gacha-empty"><b>SCOUT READY</b><small>まだ獲得結果はありません</small></div>';
      return;
    }
    const sorted=[...lastResults].sort((a,b)=>(rankScore[b.result.rank]||0)-(rankScore[a.result.rank]||0));
    const best=sorted[0];
    const p=best.result.player;
    const resultCount=sorted.length;
    const newCount=sorted.filter(x=>!x.duplicate).length;
    const dupCount=resultCount-newCount;
    const hero=playerCardMarkup(p,{owned:true,release:false,showAbilities:true});
    const mini=sorted.slice(0,10).map((x,index)=>{
      const player=x.result.player,initials=String(player.name||'?').replace(/[\s・—–-]/g,'').slice(0,3);
      return '<button type="button" class="gacha-result-card rank-'+escape(x.result.rank)+' '+(x.result.limited?'limited':'')+'" data-player-id="'+escape(player.id)+'">'+
        '<span class="result-badge">'+escape(x.result.rank)+'</span>'+
        (player.image?'<img src="'+escape(player.image)+'" alt="" loading="lazy" referrerpolicy="no-referrer">':'<div class="gacha-fallback"><b>'+escape(initials)+'</b></div>')+
        '<strong>'+escape(player.name)+'</strong>'+
        '<small>OVR '+escape(cardModel(player,developmentFor(save,player.id)).overall)+' · '+escape(player.teamCode||'NPB')+' · '+escape(player.pos||'PLAYER')+(x.result.limited?' · LIMITED':'')+'</small>'+
        (x.duplicate?'<em>重複 +'+x.duplicateReward+'</em>':index===0&&bonusApplied?'<em>10連保証枠</em>':'')+
      '</button>';
    }).join('');
    resultEl.innerHTML=
      '<div class="results-head"><div><b>'+resultCount+'連 結果</b><small>新規 '+newCount+' · 重複 '+dupCount+(bonusApplied?' · B以上確定':'')+'</small></div><span>RESULTS</span></div>'+
      '<div class="gacha-result-feature">'+
        '<div class="gacha-result-feature-art">'+(p.image?'<img src="'+escape(p.image)+'" alt="" loading="lazy" referrerpolicy="no-referrer">':'<div class="gacha-fallback"><b>'+escape(String(p.name||'?').replace(/[\s・—–-]/g,'').slice(0,3))+'</b></div>')+'</div>'+
        '<div class="gacha-result-feature-copy"><small>BEST RESULT · '+escape(best.result.rank)+' RANK</small><strong>'+escape(p.name)+'</strong><span>'+escape(p.pos||'PLAYER')+' · OVR '+(cardModel(p,developmentFor(save,p.id)).overall||'—')+'</span><button type="button" id="result-detail">選手詳細</button></div>'+
      '</div>'+
      '<div class="gacha-result-grid">'+mini+'</div>';
    $('result-detail').onclick=()=>showPlayer3D(p.id);
    resultEl.querySelectorAll('.gacha-result-card').forEach(btn=>btn.onclick=()=>showPlayer3D(btn.dataset.playerId));
  }

  tabs.forEach(btn=>btn.onclick=()=>{
    if(busy)return;
    bannerId=btn.dataset.banner;
    renderBanner();
    resultEl.innerHTML='<div class="gacha-empty"><b>'+escape(getBanner().name)+'</b><small>このバナーの結果がここに表示されます</small></div>';
  });

  async function runPull(count){
    if(busy)return;
    const cost=250*count;
    const activeBanner=getBanner();
    const activePool=ALL_PLAYERS.filter(activeBanner.filter);
    if(!activePool.length){
      resultEl.innerHTML='<div class="gacha-error"><b>このスカウトは準備中です</b><small>現在の対象選手が0名のため実行できません。</small></div>';
      return;
    }
    if(!save.unlimitedCoins && Number(save.currency||0)<cost){
      resultEl.innerHTML='<div class="gacha-error"><b>コイン不足</b><small>必要 '+cost.toLocaleString('ja-JP')+' / 所持 '+Number(save.currency||0).toLocaleString('ja-JP')+'</small></div>';
      return;
    }
    busy=true;
    const one=$('pull'),ten=$('pull10');
    one.disabled=true;ten.disabled=true;
    one.classList.add('loading');ten.classList.add('loading');
    try{
      resultEl.innerHTML='<div class="gacha-empty"><b>SCOUT PROCESSING</b><small>抽選結果を確定しています…</small></div>';
      const r=count===1?pullOnce(save,ALL_PLAYERS,Math.random,bannerId):pullMany(save,ALL_PLAYERS,count,Math.random,bannerId);
      if(!r||r.error||!r.state)throw new Error(r?.error||'SCOUT_STATE_INVALID');
      save=r.state;
      persist();
      updateBalance();
      const results=count===1?[{result:r.result,duplicate:!!r.duplicate,duplicateReward:r.duplicateReward||0}]:Array.isArray(r.results)?r.results:[];
      if(!results.length||!results.every(x=>x?.result?.player))throw new Error('SCOUT_RESULT_EMPTY');
      renderResults(results,Boolean(r.bonusApplied));
      const best=results.slice().sort((a,b)=>(rankScore[b.result.rank]||0)-(rankScore[a.result.rank]||0))[0];
      try{
        const bestCard=cardModel(best.result.player,developmentFor(save,best.result.player.id));
        await playGachaReveal({
          rarity:best.result.rarity,
          name:best.result.player.name,
          image:best.result.player.image,
          rank:best.result.rank,
          limited:best.result.limited,
          duplicate:best.duplicate,
          banner:bannerId,
          cardType:best.result.player.cardType,
          limitedTheme:best.result.player.limitedTheme,
          overall:bestCard.overall,
          position:best.result.player.pos,
          stats:bestCard.stats
        });
      }catch(revealErr){console.warn('gacha reveal skipped',revealErr);}
    }catch(err){
      console.error('SCOUT_ERROR',err);
      resultEl.innerHTML='<div class="gacha-error"><b>スカウト処理エラー</b><small>'+escape(String(err?.message||err||'UNKNOWN_ERROR'))+'</small></div>';
    }finally{
      busy=false;one.disabled=false;ten.disabled=false;one.classList.remove('loading');ten.classList.remove('loading');
      one.querySelector('span').textContent='250 コイン';ten.querySelector('span').textContent='2,500 コイン · B以上1枚確定';
    }
  }
  renderBanner();
  const bindTap=(el,handler)=>{
    if(!el)return;
    let lastTouch=0;
    el.addEventListener('touchend',e=>{e.preventDefault();lastTouch=Date.now();handler();},{passive:false});
    el.addEventListener('click',()=>{if(Date.now()-lastTouch<650)return;handler();});
  };
  bindTap($('pull'),()=>runPull(1));
  bindTap($('pull10'),()=>runPull(10));
  bindTap($('back'),()=>setMode('home'));
}

function ensureMatchPresentation(){
  let hud=document.getElementById('match-premium-hud');
  if(hud)return hud;
  hud=document.createElement('div');
  hud.id='match-premium-hud';
  hud.innerHTML='<div class="mph-top"><div class="mph-team"><b id="mph-away">AWAY</b><strong id="mph-away-score">0</strong></div><div class="mph-inning"><small id="mph-count">1回表</small><b id="mph-outs">●●●</b></div><div class="mph-team mph-home"><b id="mph-home">HOME</b><strong id="mph-home-score">0</strong></div></div>'+
  '<div class="mph-batter"><span id="mph-batter">BATTER</span><b id="mph-rank">RANK</b><small id="mph-ovr">OVR --</small></div>'+
  '<div class="mph-count"><b id="mph-balls">B 0</b><b id="mph-strikes">S 0</b><b id="mph-pitches">P 0</b></div>'+
  '<div class="mph-base"><i data-base="3"></i><i data-base="2"></i><i data-base="1"></i><i data-base="0"></i></div>'+
  '<div id="mph-event"></div><div id="mph-speed"></div>';
  matchUI.appendChild(hud);return hud;
}
function updatePremiumHUD(){
  const h=ensureMatchPresentation(), batting=match.half==='TOP';
  const p=isOnlineMatch()?onlineRosterPlayer(match.half==='TOP'?'away':'home',Number(match.batterIndex?.[match.half==='TOP'?'away':'home']||0)):lineupPlayer(0);
  const pc=p?cardModel(p,developmentFor(save,p.id)):null;
  $('mph-away').textContent=isOnlineMatch()?(onlineRole==='HOST'?'YOU':'RIVAL'):'YOU';
  $('mph-home').textContent=isOnlineMatch()?(onlineRole==='GUEST'?'YOU':'CPU'):'CPU';
  $('mph-away-score').textContent=match.score.away;$('mph-home-score').textContent=match.score.home;
  $('mph-count').textContent=match.inning+'回'+(batting?'表':'裏');
  $('mph-outs').textContent='●'.repeat(match.outs)+'○'.repeat(Math.max(0,3-match.outs));
  $('mph-batter').textContent=batting?(p?.name||'打者'):'CPU打者';
  $('mph-rank').textContent=pc?.rank||'—';$('mph-ovr').textContent=pc?'OVR '+pc.overall:'AI';
  $('mph-balls').textContent='B '+match.balls;$('mph-strikes').textContent='S '+match.strikes;
  $('mph-pitches').textContent='P '+(match.pitches||0);
  const pitcherSide=match.half==='TOP'?'home':'away';
  const stamina=Math.round(Math.max(0,Math.min(100,Number(match.pitcherStamina?.[pitcherSide]??100))));
  const st=$('pitcher-stamina');if(st)st.textContent='ST '+stamina;
  document.querySelectorAll('.mph-base i').forEach(x=>x.classList.toggle('on',false));
  (match.runners||[]).forEach(r=>{const b=document.querySelector('.mph-base i[data-base="'+r.base+'"]');if(b)b.classList.add('on')});
}
function matchEvent(text,kind='normal'){
  const e=document.getElementById('mph-event');if(!e)return;
  e.textContent=text;e.className='show '+kind;clearTimeout(window.__mphEventTimer);window.__mphEventTimer=setTimeout(()=>e.className='',900);
}
let topPitchTimer=null;
function scheduleTopPitch(delay=650){
  clearTimeout(topPitchTimer);
  const multiplier=save.settings?.quickPitch===false?1:.62;
  topPitchTimer=setTimeout(()=>{topPitchTimer=null;if(match.half==='TOP'&&!match.ended&&pitchState==='idle')pitch();},Math.max(180,Math.round(delay*multiplier)));
}
function updateAimFromPointer(e){
  const rect=$('aim-area')?.getBoundingClientRect();if(!rect)return;
  const speed=Math.max(.5,Math.min(1.5,Number(save.settings?.cursorSpeed)||1));
  aimTarget.x=Math.max(-1.5,Math.min(1.5,((e.clientX-rect.left)/rect.width-.5)*1.5*speed));
  aimTarget.y=Math.max(-1.5,Math.min(1.5,(.5-(e.clientY-rect.top)/rect.height)*1.5*speed));
  updateAimUI();
}
function updateAimUI(){
  const a=$('aim-cursor');if(a){a.style.left=(50+aimTarget.x*28)+'%';a.style.top=(50-aimTarget.y*28)+'%';}
}
function updateZoneUI(){const z=$('strike-zone');if(z)z.style.transform='translate(-50%,-50%) scale('+(1+Math.abs(aimTarget.x)*.05)+')';}
function updatePitchControlUI(){
  document.querySelectorAll('[data-pitch]').forEach(b=>{
    const selected=b.dataset.pitch===selectedPitch;
    b.classList.toggle('selected',selected);
    const info=PITCHES[b.dataset.pitch];
    if(info)b.innerHTML='<b>'+({FASTBALL:'ストレート',SLIDER:'スライダー',CURVEBALL:'カーブ',FORK:'フォーク',CHANGEUP:'チェンジアップ'}[b.dataset.pitch]||b.dataset.pitch)+'</b><small>'+Math.round(info.speed||0)+'</small>';
  });
}
function choosePitchManual(type){
  selectedPitch=PITCHES_FOR_UI[type]?type:'FASTBALL';
  updatePitchControlUI();
  matchEvent('選択 '+selectedPitch,'pitch');
  updatePremiumHUD();
}
function pitch(){
  const aiPitchAuthority=matchMode==='AI'&&match.half==='TOP';
  if(match.ended||pitchState!=='idle'||(match.half!=='TOP'&&match.half!=='BOTTOM')||(!isLocalPitcher()&&!aiPitchAuthority))return;
  pitchState='pitch';t=0;onlineActionSentForPitch=false;window.__pitchCount=(window.__pitchCount||0)+1;
  const pitcherPlayer=pitcherPlayerForSide(match.half==='TOP'?'home':'away');
  if(!isOnlineMatch()&&match.half==='TOP'){
    const decision=choosePitch({
      count:[match.balls,match.strikes],
      runnerThreat:(match.runners||[]).length/3,
      profile:gameplayProfile(pitcherPlayer),
      difficulty:matchDifficulty
    });
    selectedPitch=typeof decision==='string'?decision:(decision?.pitch||selectedPitch);
    const pitcherProfile=gameplayProfile(pitcherPlayer);
    const control=Math.max(40,Math.min(95,Number(pitcherPlayer.control||70)+(pitcherProfile.aggression-.6)*12));
    const pitcherSide=match.half==='TOP'?'home':'away';
    const stamina=Math.max(0,Math.min(100,Number(match.pitcherStamina?.[pitcherSide]??100)));
    const spread=Math.max(.55,Math.min(1.28,1.15-(control-40)*.008+(100-stamina)*.0017));
    pitchTarget={x:(Math.random()-.5)*spread,y:(Math.random()-.5)*spread};
  }else{
    pitchTarget={x:aimTarget.x,y:aimTarget.y};
  }
  updatePitchControlUI();window.__lastPitch=selectedPitch;
  const pitchInfo=PITCHES[selectedPitch]||PITCHES.FASTBALL;
  const arm=Math.max(45,Math.min(99,Number(pitcherPlayer.arm||70)));
  const pitcherSideForVelocity=match.half==='TOP'?'home':'away';
  const stamina=Math.max(0,Math.min(100,Number(match.pitcherStamina?.[pitcherSideForVelocity]??100)));
  const staminaFactor=.82+.18*(stamina/100);
  const velocityFactor=(.91+(arm/99)*.10)*staminaFactor;
  window.__pitchVelocity=Math.round((pitchInfo.speed||90)*velocityFactor*(0.985+Math.random()*.03));window.__pitchStart=performance.now();
  const id=(crypto.randomUUID?.()||String(Date.now())+'-'+Math.random());
  ballPhysics=createPitchPhysics({speedMph:window.__pitchVelocity,targetX:pitchTarget.x,targetY:pitchTarget.y,breakX:(Number(pitchInfo.break)||0)*(selectedPitch==='CURVEBALL'?-1:1),breakY:(Number(pitchInfo.break)||0)*.3});
  if(isOnlineMatch()){onlinePendingPitchId=id;onlinePendingPitch={id,pitch:selectedPitch,target:pitchTarget,velocity:window.__pitchVelocity,breakX:(Number(pitchInfo.break)||0)*(selectedPitch==='CURVEBALL'?-1:1),breakY:(Number(pitchInfo.break)||0)*.3};onlineSend({type:'ONLINE_PITCH',...onlinePendingPitch});}
  updateMatchHUD();updatePremiumHUD();matchEvent(selectedPitch,'pitch');
}
function swing(){
  if(match.ended||!isLocalBatter()||pitchState!=='pitch')return;
  const timing=Math.max(0,Math.min(1,t/(ballPhysics?.duration||.9))), dx=Math.abs(aimTarget.x-pitchTarget.x),dy=Math.abs(aimTarget.y-pitchTarget.y);
  const p=isOnlineMatch()?onlineRosterPlayer(match.half==='TOP'?'away':'home',Number(match.batterIndex?.[match.half==='TOP'?'away':'home']||0)):lineupPlayer(0)||ALL_PLAYERS[4], prof=gameplayProfile(p);
  const modePower=battingMode==='POWER'?1:.72;
  if(isOnlineMatch()&&onlineRole==='GUEST'){
    if(onlineActionSentForPitch)return;
    onlineActionSentForPitch=true;
    onlineSend({type:'ONLINE_SWING',pitchId:onlinePendingPitchId,timing:clampNetworkNumber(timing,0,1,.5),aimX:clampNetworkNumber(aimTarget.x,-1.5,1.5,0),aimY:clampNetworkNumber(aimTarget.y,-1.5,1.5,0),mode:battingMode==='POWER'?'POWER':'CONTACT'});
    return;
  }
  const contact=Math.max(.05,Math.min(.98,(prof.contact||.65)*(1-(dx+dy)*.35)));
  const outcome=resolvePitch({pitch:selectedPitch,timing,contact,power:Math.min(1,(prof.power||.7)*modePower)});
  matchEvent(outcome,'result');
  if(['SINGLE','DOUBLE','TRIPLE','HOME_RUN','GROUND_OUT','FLY_OUT'].includes(outcome)){
    beginBattedBall(outcome,p,prof);
    if(isOnlineMatch()&&onlineRole==='HOST')onlineSend({type:'ONLINE_CONTACT',outcome,physics:ballPhysics});
  }else{
    finishPlay(outcome);
  }
}
function take(){
  if(match.ended||!isLocalBatter()||pitchState!=='pitch')return;
  if(isOnlineMatch()&&onlineRole==='GUEST'){if(onlineActionSentForPitch)return;onlineActionSentForPitch=true;onlineSend({type:'ONLINE_TAKE',pitchId:onlinePendingPitchId});return;}
  const inZone=Math.abs(pitchTarget.x)<.55&&Math.abs(pitchTarget.y)<.55;
  finishPlay(inZone?'STRIKE':'BALL');pitchState='idle';ball.position.set(0,2.1,3);
}
function pitcherFatigueCost(pitcher){
  const ids=new Set((pitcher?.abilities||[]).map(x=>x[0]));
  if(ids.has('stamina')||ids.has('durability'))return .72;
  if(ids.has('consistency'))return .86;
  return 1;
}
function finishPlay(outcome,options={}){
  if(isOnlineMatch()&&onlineRole==='GUEST')return;
  const pitchingSideBefore=match.half==='TOP'?'home':'away';
  const pitcherBefore=pitcherPlayerForSide(pitchingSideBefore);
  const fatigue={...options,fatigueCost:Number(options.fatigueCost)||pitcherFatigueCost(pitcherBefore)};
  pitchState='idle';t=0;match=applyOutcome(match,outcome,fatigue);
  const sub=advancePitcher(match,pitchingSideBefore,pitcherIdsForSide(pitchingSideBefore).length,8);
  match=sub.state;
  if(sub.changed)matchEvent('投手交代','change');
  if(!isValidMatchState(match)){
    window.__lastGameError='INVALID_MATCH_STATE';
    match={...match,ended:true,lastOutcome:'INVALID_MATCH_STATE'};
    matchEvent('MATCH ERROR','error');
    return;
  }
  if(outcome==='HOME_RUN')matchEvent('ホームラン！','hr');
  else if(outcome==='TRIPLE')matchEvent('TRIPLE','hit');
  else if(outcome==='DOUBLE')matchEvent('DOUBLE','hit');
  else if(outcome==='SINGLE')matchEvent('HIT','hit');
  else if(outcome==='STRIKE')matchEvent('STRIKE','strike');
  else if(outcome==='BALL')matchEvent('BALL','ball');
  updateMatchHUD();updatePremiumHUD();
  if(isOnlineMatch()){onlineRevision+=1;onlineSend({type:'ONLINE_STATE',revision:onlineRevision,match});}
  recordMatchResult();
  if(isOnlineMatch()){
    if(match.ended)return;
    if(isLocalPitcher()&&pitchState==='idle')setTimeout(()=>pitch(),450);
    return;
  }
  if(match.half==='TOP'&&!match.ended&&!['SINGLE','DOUBLE','TRIPLE','HOME_RUN','GROUND_OUT','FLY_OUT'].includes(outcome))scheduleTopPitch(450);
}
function aiBatterAtBat(){
  const batterPlayer=lineupPlayer(0),prof=gameplayProfile(batterPlayer);
  const decision=chooseSwing({pitch:window.__lastPitch||'FASTBALL',zone:.55,profile:prof,difficulty:matchDifficulty});
  const timing=decision.action==='TAKE'?0.2:Math.max(.05,Math.min(.98,decision.timing));
  const contact=decision.action==='TAKE'?0.08:decision.contact;
  const outcome=decision.action==='TAKE'?((Math.random()<.58)?'BALL':'STRIKE'):resolvePitch({pitch:window.__lastPitch||'FASTBALL',timing,contact,power:prof.powerRisk});
  matchEvent(outcome,'result');
  if(['SINGLE','DOUBLE','TRIPLE','HOME_RUN','GROUND_OUT','FLY_OUT'].includes(outcome))beginBattedBall(outcome,batterPlayer,prof);else finishPlay(outcome);
}
function pointerSwing(){swing();}
function beginBattedBall(outcome,p,prof){
  const launchByOutcome={GROUND_OUT:4,SINGLE:10,DOUBLE:19,TRIPLE:27,HOME_RUN:26,FLY_OUT:28};
  const exitVelocity=70+(Number(prof.powerRisk||.5)*42)+(Number(prof.contactFocus||.5)*18);
  window.__fieldingIntent=outcome;
  const origin=[pitchTarget.x,Math.max(.85,2.05+pitchTarget.y*.45),-7.85];
  ballPhysics=createBattedBallPhysics({
    origin,
    outcome,
    exitVelocity,
    launchAngle:launchByOutcome[outcome]??18,
    direction:Number(aimTarget.x||0)*.55
  });
  if(!isFiniteBallPhysics(ballPhysics)){
    window.__lastGameError='INVALID_BATTED_BALL_PHYSICS';
    ballPhysics=null;pendingOutcome=null;finishPlay('OUT');return;
  }
  const lx=ballPhysics.landing?.[0]??0,lz=ballPhysics.landing?.[2]??3;
  fielderTarget={x:Math.max(-24,Math.min(24,lx)),z:Math.max(-6,Math.min(28,lz))};
  pendingOutcome=outcome;window.__hitOutcome=outcome;pitchState='hit';t=0;setFielderTarget(outcome);
}
function setFielderTarget(outcome){
  cameraMode=outcome==='HOME_RUN'?'HOME_RUN':'FIELDING';
  const q=fielderTarget||{x:0,z:3};
  let best=0,bestD=Infinity;
  fielders.forEach((p,i)=>{const d=Math.hypot(p.position.x-q.x,p.position.z-q.z);if(d<bestD){bestD=d;best=i;}});
  fielderIndex=best;fieldingFrom={x:fielders[fielderIndex].position.x,z:fielders[fielderIndex].position.z};
  updateFieldingUI();
  matchEvent(outcome==='HOME_RUN'?'HOMERUN':outcome==='GROUND_OUT'?'FIELDING':outcome==='FLY_OUT'?'FLY BALL':'IN PLAY','field');
}

/* Premium console-baseball presentation layer. Clean-room UI; no proprietary assets/code. */
function rosterIdsForSide(side){
  if(isOnlineMatch()){
    return onlineRosters?.[side]?.length?onlineRosters[side]:(side==='away'?encodeTeamForOnline():(onlineRemoteRoster.length?onlineRemoteRoster:encodeTeamForOnline()));
  }
  if(matchMode==='AI'&&side==='home')return AI_TEAM_LINEUP;
  const lineup=save.team?.lineup?.length?save.team.lineup:save.collection;
  return Array.isArray(lineup)?lineup:[];
}
function lineupPlayer(index){
  const side=match.half==='TOP'?'away':'home',ids=rosterIdsForSide(side);
  const slot=(Number(match.batterIndex?.[side]||0)+Number(index||0))%Math.max(1,ids.length);
  const id=ids.length?ids[slot]:side==='home'?AI_TEAM_LINEUP[0]:ALL_PLAYERS[0]?.id;
  return ALL_PLAYERS.find(p=>Number(p.id)===Number(id))||ALL_PLAYERS[0];
}
function pitcherIdsForSide(side){
  if(matchMode==='AI'&&side==='home')return AI_TEAM_PITCHERS;
  if(isOnlineMatch()){
    const roster=rosterIdsForSide(side);
    const pitchers=roster.filter(id=>ALL_PLAYERS.find(p=>Number(p.id)===Number(id))?.pos?.includes('P'));
    return pitchers.length?pitchers:roster.slice(0,3);
  }
  if(save.team?.pitchers?.length)return save.team.pitchers;
  const roster=rosterIdsForSide(side);
  const pitchers=roster.filter(id=>ALL_PLAYERS.find(p=>Number(p.id)===Number(id))?.pos?.includes('P'));
  return pitchers.length?pitchers:roster.slice(0,3);
}
function pitcherPlayerForSide(side){
  const ids=pitcherIdsForSide(side);
  const idx=Math.min(Math.max(0,Number(match.pitcherIndex?.[side]||0)),Math.max(0,ids.length-1));
  const id=ids[idx];
  return ALL_PLAYERS.find(p=>Number(p.id)===Number(id))||ALL_PLAYERS[0];
}
function fieldingPlayer(index){
  const side=match.half==='TOP'?'home':'away',ids=rosterIdsForSide(side);
  const offset=4+(Number(index)||0);
  const id=ids.length?ids[offset%ids.length]:ALL_PLAYERS[0]?.id;
  return ALL_PLAYERS.find(p=>Number(p.id)===Number(id))||ALL_PLAYERS[0];
}
function catcherPlayerForSide(side){
  const ids=rosterIdsForSide(side);
  return ALL_PLAYERS.find(p=>ids.includes(Number(p.id))&&String(p.pos||'').includes('C'))||fieldingPlayer(8);
}
function syncVisualPlayers(){
  const currentBatter=isOnlineMatch()?onlineRosterPlayer(match.half==='TOP'?'away':'home',Number(match.batterIndex?.[match.half==='TOP'?'away':'home']||0)):lineupPlayer(0);
  const currentPitcher=isOnlineMatch()?pitcherPlayerForSide(match.half==='TOP'?'home':'away'):pitcherPlayerForSide(match.half==='TOP'?'home':'away');
  if(currentBatter&&batter.userData.identity.playerId!==currentBatter.id){
    scene.remove(batter);batter=createPlayerModel(modelConfig(currentBatter));batter.position.set(2.2,0,-8);batter.rotation.y=Math.PI;batter.userData.identity.playerId=currentBatter.id;scene.add(batter);
  }
  if(currentPitcher&&pitcher.userData.identity.playerId!==currentPitcher.id){
    scene.remove(pitcher);pitcher=createPlayerModel(modelConfig(currentPitcher));pitcher.position.set(0,0,3);pitcher.userData.identity.playerId=currentPitcher.id;scene.add(pitcher);
  }
}
function miniPlayer(p,label){
  const c=cardModel(p,developmentFor(save,p.id)),img=p.image||'',team=p.teamCode||'NPB',initials=String(p.name||'?').replace(/[\s・—–-]/g,'').slice(0,2);
  const portrait=img?'<img src="'+img+'" alt="" loading="lazy" referrerpolicy="no-referrer">':'<span class="lineup-avatar">'+initials+'</span>';
  return '<div class="lineup-slot premium-lineup-slot"><div class="lineup-slot-top"><b>'+label+'</b><i>'+team+'</i></div><div class="lineup-slot-body">'+portrait+'<div><strong>'+c.name+'</strong><small>'+c.pos+' · '+c.rank+' · OVR '+c.overall+'</small></div></div></div>';
}
function renderRoster(){
  const pos=[['LF','左翼手',12,17],['CF','中堅手',50,11],['RF','右翼手',88,17],['3B','三塁手',20,47],['SS','遊撃手',38,41],['2B','二塁手',62,41],['1B','一塁手',80,47],['DH','指名打者',50,67],['C','捕手',50,82]];
  const bench=(save.collection||[]).slice(9,14).map((id,i)=>{const p=ALL_PLAYERS.find(x=>x.id===id);return p?miniPlayer(p,'ベンチ '+(i+1)):''}).join('');
  const slots=pos.map(([a,l,x,y],i)=>{const p=lineupPlayer(i);return '<div style="position:absolute;left:'+x+'%;top:'+y+'%">'+miniPlayer(p,l)+'</div>'}).join('');
  const p=lineupPlayer(9);
  card.innerHTML='<h2>通常オーダー</h2><div class="order-tabs"><button class="selected">野手</button><button>控え</button><button>投手</button></div><div class="order-field">'+slots+'</div><div class="row" style="overflow:auto;gap:4px">'+bench+'</div><div class="row"><button class="action" id="order-reset">リセット</button><button class="action" id="order-save">オーダー保存</button><button class="action" id="back">ホーム</button></div>';
  $('back').onclick=()=>setMode('home');
  $('order-save').onclick=()=>{save.team={...(save.team||{}),lineup:(save.collection||[]).slice(0,14)};persist();$('order-save').textContent='保存済み';};
  $('order-reset').onclick=()=>renderRoster();
}
function renderTraining(){
  const players=(save.collection||[]).map(id=>ALL_PLAYERS.find(p=>p.id===id)).filter(Boolean);
  card.innerHTML='<h2>選手育成</h2><p>選手カードを確認しながら、打撃・パワー・守備を個別強化。</p><div class="player-grid training-grid">'+(players.map(p=>{
    const d=developmentFor(save,p.id),c=cardModel(p,d),image=p.image||'';
    const portrait=image?'<img src="'+image+'" alt="" loading="lazy">':'<div class="portrait-fallback"><span>'+p.name.split(' ').map(x=>x[0]).join('').slice(0,3)+'</span></div>';
    return '<div class="player-card training-player"><div class="player-portrait training-portrait">'+portrait+'<span class="training-level">LV '+d.level+'</span></div><div class="player-head"><strong>'+c.name+'</strong><b>OVR '+c.overall+'</b></div><span class="player-meta">'+c.pos+' · XP '+d.xp+'</span><div class="mini-stats"><span>打 '+c.stats.contact+'</span><span>パ '+c.stats.power+'</span><span>守 '+c.stats.field+'</span><span>走 '+c.stats.speed+'</span></div><div class="row"><button class="action train" data-id="'+p.id+'" data-focus="contact">ミート</button><button class="action train" data-id="'+p.id+'" data-focus="power">パワー</button><button class="action train" data-id="'+p.id+'" data-focus="field">守備</button></div></div>';
  }).join('')||'<p>スカウトで選手を獲得してください。</p>')+'</div><button class="action back" id="back">ホームへ</button>';
  $('back').onclick=()=>setMode('home');
  card.querySelectorAll('.train').forEach(b=>b.onclick=()=>{const p=ALL_PLAYERS.find(x=>x.id===Number(b.dataset.id));const r=trainPlayer(save,p,b.dataset.focus);if(r.error){alert('育成に必要なコインが不足しています');return}save=r.state;persist();renderTraining();});
}
function isOnlineMatch(){return matchMode==='ONLINE'&&Boolean(onlineConnection);}
function isLocalBatter(){
  if(!isOnlineMatch())return match.half==='TOP';
  return match.half==='TOP'?onlineRole==='HOST':onlineRole==='GUEST';
}
function isLocalPitcher(){
  if(!isOnlineMatch())return match.half==='BOTTOM';
  return match.half==='TOP'?onlineRole==='GUEST':onlineRole==='HOST';
}
function sanitizeRoster(ids){
  const allowed=new Set(ALL_PLAYERS.map(p=>Number(p.id)));
  return [...new Set((Array.isArray(ids)?ids:[]).map(Number).filter(id=>Number.isFinite(id)&&allowed.has(id)))].slice(0,14);
}
function clampNetworkNumber(v,min,max,fallback){
  const n=Number(v);return Number.isFinite(n)?Math.max(min,Math.min(max,n)):fallback;
}
function sanitizeNetworkPitch(msg){
  const pitch=Object.prototype.hasOwnProperty.call(PITCHES,msg?.pitch)?msg.pitch:'FASTBALL';
  return {
    id:String(msg?.id||''),
    pitch,
    target:{x:clampNetworkNumber(msg?.target?.x,-1.5,1.5,0),y:clampNetworkNumber(msg?.target?.y,-1.5,1.5,0)},
    velocity:clampNetworkNumber(msg?.velocity,65,110,PITCHES[pitch].speed),
    breakX:clampNetworkNumber(msg?.breakX,-1.5,1.5,0),
    breakY:clampNetworkNumber(msg?.breakY,-1.5,1.5,0)
  };
}

function onlineSend(message){onlineConnection?.send?.({v:1,...message});}
function onlineRosterPlayer(side,index=0){
  const ids=onlineRosters?.[side]?.length?onlineRosters[side]:(side==='away'?encodeTeamForOnline():(onlineRemoteRoster.length?onlineRemoteRoster:encodeTeamForOnline()));
  const id=ids[index%Math.max(1,ids.length)];
  return ALL_PLAYERS.find(p=>Number(p.id)===Number(id))||ALL_PLAYERS[index%ALL_PLAYERS.length];
}
function gameplayProfile(player){
  const prof=aiProfile(player,developmentFor(save,player.id));
  for(const [id] of (player?.abilities||[])){
    if(!triggerSpecialAbility(player,id))continue;
    if(['power_hitter','pull_power','legend_power'].includes(id))prof.powerRisk=Math.min(1,prof.powerRisk+.08);
    if(['contact_hitter','clutch','two_strike','legend_contact'].includes(id))prof.contactFocus=Math.min(1,prof.contactFocus+.08);
    if(['walk_machine','plate_discipline'].includes(id))prof.selectivity=Math.min(1,prof.selectivity+.08);
    if(['first_step','range','sure_hands','legend_field'].includes(id))prof.reaction=Math.min(1,prof.reaction+.10);
    if(['strong_arm','quick_throw'].includes(id))prof.arm=Math.min(1,prof.arm+.10);
    if(['speedster','base_running','legend_speed'].includes(id))prof.stealRisk=Math.min(1,prof.stealRisk+.10);
    if(['ace','control_artist','pitch_mix','consistency'].includes(id))prof.aggression=Math.min(1,prof.aggression+.06);
  }
  return prof;
}
function setAIDifficulty(level){
  matchDifficulty=AI_DIFFICULTIES[level]?level:'NORMAL';
  document.querySelectorAll('[data-ai-difficulty]').forEach(b=>b.classList.toggle('selected',b.dataset.aiDifficulty===matchDifficulty));
  save.settings={...(save.settings||{}),aiDifficulty:matchDifficulty};persist();
}
function startAIMatch(){
  matchMode='AI';if(!AI_DIFFICULTIES[matchDifficulty])matchDifficulty='NORMAL';onlineRole=null;onlineRevision=0;onlineSessionStarted=false;onlineActionSentForPitch=false;onlineConnection?.close?.();onlineConnection=null;onlineConnected=false;onlinePendingPitchId=null;onlinePendingPitch=null;
  match=createMatchState();matchResultRecorded=false;$('swing').disabled=false;$('pitch').disabled=false;setMode('match');resetMatchView();setBattingMode(save.settings?.battingModeDefault==='POWER'?'POWER':'CONTACT');updateMatchHUD();scheduleTopPitch(700);
}
function getStealCandidate(){
  const candidates=(match.runners||[]).filter(r=>r.status==='LIVE'&&Number(r.base)>=0&&Number(r.base)<2).sort((a,b)=>Number(b.base)-Number(a.base));
  if(!candidates.length)return null;
  const r=candidates[0];return{runnerId:r.id,targetBase:Number(r.base)+1};
}
function isLocalFielder(){
  return isOnlineMatch()?isLocalPitcher():match.half==='BOTTOM';
}
function updateFieldingUI(){
  const root=$('fielding-console');if(!root)return;
  const active=Boolean(pitchState==='hit'&&cameraMode==='FIELDING'&&isLocalFielder()&&!match.ended);
  root.style.display=active?'flex':'none';
}
function fieldingPadStart(e){
  if(!isLocalFielder()||pitchState!=='hit')return;
  fieldingPadPointer={id:e.pointerId,x:e.clientX,y:e.clientY};
  fielderManualInput=true;
  e.currentTarget.setPointerCapture?.(e.pointerId);
  fieldingPadMove(e);
}
function fieldingPadMove(e){
  if(!fieldingPadPointer||fieldingPadPointer.id!==e.pointerId)return;
  const dx=e.clientX-fieldingPadPointer.x,dy=e.clientY-fieldingPadPointer.y;
  const len=Math.hypot(dx,dy)||1;
  const nx=Math.max(-1,Math.min(1,dx/52)),nz=Math.max(-1,Math.min(1,dy/52));
  const lead=fielders[fielderIndex];if(!lead)return;
  const moveScale=4.5;
  fielderTarget={x:lead.position.x+nx*moveScale,z:lead.position.z+nz*moveScale};
  updateFieldingUI();
}
function fieldingPadEnd(e){
  if(fieldingPadPointer?.id!==e.pointerId)return;
  fieldingPadPointer=null;fielderManualInput=false;
}
function selectThrowBase(base){
  if(!isLocalFielder()||pitchState!=='hit')return;
  const b=Number(base);if(!Number.isInteger(b)||b<1||b>4)return;
  fielderThrowTarget=b;
  document.querySelectorAll('[data-throw-base]').forEach(x=>x.classList.toggle('selected',Number(x.dataset.throwBase)===b));
  fielderAction='throw';fielderActionUntil=performance.now()+240;
}

function updateBullpenButton(){
  const b=$('bullpen');if(!b)return;
  const side=match.half==='TOP'?'home':'away';
  const ids=pitcherIdsForSide(side);
  const current=Number(match.pitcherIndex?.[side]||0);
  const show=Boolean(isLocalPitcher()&&pitchState==='idle'&&!match.ended&&ids.length>1&&current<ids.length-1);
  b.style.display=show?'block':'none';
  if(show)b.textContent='継投 '+(current+2)+'人目';
}
function performPitcherChange(){
  const side=match.half==='TOP'?'home':'away';
  if(!isLocalPitcher()||pitchState!=='idle'||match.ended)return;
  const ids=pitcherIdsForSide(side),current=Number(match.pitcherIndex?.[side]||0);
  if(current>=ids.length-1)return;
  const result=substitutePitcher(match,side,current+1);
  if(!result.success)return;
  match=result.state;matchEvent('PITCHER CHANGE','change');updateMatchHUD();updatePremiumHUD();
  if(isOnlineMatch())onlineRevision+=1,onlineSend({type:'ONLINE_STATE',revision:onlineRevision,match});
}
function updateStealButton(){
  const b=$('steal');if(!b)return;
  const candidate=getStealCandidate();
  const show=Boolean(candidate&&isLocalBatter()&&pitchState==='idle'&&!match.ended);
  b.style.display=show?'block':'none';
  if(show){stealTargetBase=candidate.targetBase;b.textContent='盗塁 '+candidate.targetBase+'塁';}
}
function performSteal(){
  const candidate=getStealCandidate();
  if(!candidate||!isLocalBatter()||pitchState!=='idle'||match.ended)return;
  if(isOnlineMatch()&&onlineRole==='GUEST'){
    if(!onlineActionSentForPitch){onlineActionSentForPitch=true;onlineSend({type:'ONLINE_STEAL',runnerId:candidate.runnerId,targetBase:candidate.targetBase});}
    return;
  }
  const catcher=catcherPlayerForSide(match.half==='TOP'?'home':'away');const pitcher=pitcherPlayerForSide(match.half==='TOP'?'home':'away');
  const result=stealBase(match,candidate.runnerId,candidate.targetBase,{catcherArm:catcher?.arm||70,pitcherStamina:match.pitcherStamina?.[match.half==='TOP'?'home':'away']??100,difficulty:matchMode==='AI'?matchDifficulty:'NORMAL'});
  match=result.state;
  matchEvent(result.success?'STEAL SUCCESS':'STEAL OUT','run');
  updateMatchHUD();updatePremiumHUD();
  if(isOnlineMatch()){onlineStealPending=false;onlineRevision+=1;onlineSend({type:'ONLINE_STATE',revision:onlineRevision,match});}
  if(match.half==='TOP'&&!match.ended&&matchMode==='AI')scheduleTopPitch(450);
  if(isOnlineMatch()&&isLocalPitcher()&&!match.ended)setTimeout(()=>pitch(),450);
}
function onlineSignalStatus(textValue){const el=$('online-status');if(el)el.textContent=textValue;}
function renderOnlineLobby(){
  card.innerHTML='<div class="online-header"><span class="mode-kicker">ONLINE MATCH</span><h2>オンライン戦</h2><p>1対1のP2P対戦。投球・打撃・試合結果を同期します。</p></div>'+
  '<div class="online-mode-grid"><button class="online-choice primary" id="online-create">対戦部屋を作る<small>HOST</small></button><button class="online-choice" id="online-join">対戦部屋に参加<small>GUEST</small></button></div>'+
  '<div class="online-panel"><label id="offer-label">接続コード<textarea id="online-offer-input" rows="4" placeholder="ホストのコードをここに入力"></textarea></label>'+
  '<button class="action" id="online-action">参加コードを作成</button>'+
  '<label id="answer-label" hidden>回答コード<textarea id="online-answer" rows="4" readonly></textarea></label>'+
  '<label id="host-answer-label" hidden>相手の回答コード<textarea id="online-answer-input" rows="4" placeholder="参加側の回答コードを入力"></textarea></label>'+
  '<div class="row"><button class="action" id="online-copy">コードをコピー</button><button class="action" id="online-apply">接続</button></div>'+
  '<div class="online-status" id="online-status">ルーム対戦は無料のP2P接続で行います</div></div>'+
  '<button class="action back" id="online-back">ホームへ戻る</button>';
  let mode='JOIN';
  const setHost=()=>{mode='HOST';$('offer-label').firstChild.textContent='ホスト接続コード';$('online-action').textContent='部屋を作る';$('host-answer-label').hidden=false;$('offer-label').querySelector('textarea').readOnly=false;};
  const setJoin=()=>{mode='JOIN';$('offer-label').firstChild.textContent='ホスト接続コード';$('online-action').textContent='参加コードを作成';$('host-answer-label').hidden=true;$('offer-label').querySelector('textarea').readOnly=false;};
  $('online-create').onclick=async()=>{setHost();try{await startOnlineHost();}catch(err){onlineSignalStatus(err.message||String(err));}};
  $('online-join').onclick=()=>setJoin();
  $('online-action').onclick=async()=>{try{if(mode==='HOST')await startOnlineHost();else await startOnlineGuest();}catch(err){onlineSignalStatus(err.message||String(err));}};
  $('online-copy').onclick=async()=>{
    const v=mode==='HOST'?$('online-offer-input').value:$('online-answer').value;if(!v)return;
    try{if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(v);else{$('online-offer-input').focus();$('online-offer-input').select();document.execCommand('copy');}onlineSignalStatus('コードをコピーしました');}catch{onlineSignalStatus('コードを選択して手動でコピーしてください');}
  };
  $('online-share').onclick=async()=>{
    const v=mode==='HOST'?$('online-offer-input').value:$('online-answer').value;if(!v)return;
    try{
      if(navigator.share)await navigator.share({title:'BASEBALL 3D ONLINE MATCH',text:v});
      else{await navigator.clipboard?.writeText(v);onlineSignalStatus('共有機能がないためコードをコピーしました');}
    }catch{}
  };
  $('online-apply').onclick=async()=>{try{if(mode!=='HOST')return;await acceptOnlineAnswer(onlineConnection,$('online-answer-input').value.trim());onlineSignalStatus('接続中…');}catch(err){onlineSignalStatus(err.message||String(err));}};
  $('online-back').onclick=()=>{onlineConnection?.close?.();onlineConnection=null;onlineRole=null;onlineConnected=false;setMode('home');};
}
async function startOnlineHost(){
  if(!isOnlineSupported())throw new Error('このブラウザはオンライン対戦に対応していません');
  matchMode='ONLINE';onlineRole='HOST';onlineRemoteRoster=[];onlinePendingPitchId=null;onlinePendingPitch=null;onlineRevision=0;onlineSessionStarted=false;onlineActionSentForPitch=false;onlineStealPending=false;
  onlineSignalStatus('部屋を作成中…');
  onlineConnection=await createOnlineHost({
    onOpen(){onlineConnected=true;onlineSignalStatus('相手を待っています。回答コードを入力してください');},
    onClose(){onlineConnected=false;onlineSignalStatus('相手との接続が終了しました');},
    onConnectionState:s=>onlineSignalStatus('接続: '+s),
    onMessage:handleOnlineMessage,
    onError:()=>onlineSignalStatus('通信エラー')
  });
  $('online-offer-input').value=onlineConnection.code;
  $('online-offer-input').readOnly=true;
  $('answer-label').hidden=true;$('host-answer-label').hidden=false;
}
async function startOnlineGuest(){
  if(!isOnlineSupported())throw new Error('このブラウザはオンライン対戦に対応していません');
  const offer=$('online-offer-input').value.trim();if(!offer)throw new Error('ホストの接続コードを入力してください');
  matchMode='ONLINE';onlineRole='GUEST';onlineRemoteRoster=[];onlinePendingPitchId=null;onlinePendingPitch=null;onlineRevision=0;onlineSessionStarted=false;onlineActionSentForPitch=false;onlineStealPending=false;
  onlineSignalStatus('参加コードを作成中…');
  onlineConnection=await createOnlineGuest(offer,{
    onOpen(){onlineConnected=true;onlineSignalStatus('接続しました。ホストの開始を待っています');onlineSend({type:'ONLINE_READY',collection:sanitizeRoster(encodeTeamForOnline())});},
    onClose(){onlineConnected=false;onlineSignalStatus('接続が終了しました');},
    onConnectionState:s=>onlineSignalStatus('接続: '+s),
    onMessage:handleOnlineMessage,
    onError:()=>onlineSignalStatus('通信エラー')
  });
  $('answer-label').hidden=false;$('answer-label textarea').value=onlineConnection.code;
}
function handleOnlineMessage(msg){
  if(!msg||typeof msg.type!=='string')return;
  if(onlineRole==='HOST'){
    if(msg.type==='ONLINE_READY'&&!onlineSessionStarted){
      onlineRemoteRoster=sanitizeRoster(msg.collection);
      onlineRosters={away:sanitizeRoster(encodeTeamForOnline()),home:sanitizeRoster(onlineRemoteRoster)};
      onlineSessionStarted=true;onlineRevision=0;
      onlineSend({type:'ONLINE_START',match,revision:onlineRevision,rosters:onlineRosters});
      startOnlineMatchView();
    }else if(msg.type==='ONLINE_PITCH'&&match.half==='TOP'&&pitchState==='idle'){
      startPitchFromNetwork(msg);
    }else if(msg.type==='ONLINE_SWING'&&match.half==='BOTTOM'&&pitchState==='pitch'){
      resolveRemoteBatting(msg);
    }else if(msg.type==='ONLINE_TAKE'&&match.half==='BOTTOM'&&pitchState==='pitch'){
      resolveRemoteBatting(msg);
    }else if(msg.type==='ONLINE_FIELDING_RESULT'&&onlineSessionStarted&&onlineRole==='HOST'){
      if(isLocalFielder()||pitchState!=='fielding-wait')return;
      if(String(msg.pitchId||'')!==String(onlinePendingPitchId||''))return;
      const finalOutcome=['SINGLE','DOUBLE','TRIPLE','HOME_RUN','GROUND_OUT','FLY_OUT','OUT'].includes(msg.finalOutcome)?msg.finalOutcome:'OUT';
      matchEvent(msg.event==='THROW_ON_TARGET'?'OUT AT BASE':msg.event==='CATCH_MISS'?'CATCH MISS':msg.event==='FIELDING_ERROR'?'ERROR':'FIELDING RESULT','field');
      fielderAction=msg.throwSuccess?'throw':msg.catchSuccess?'catch':'idle';fielderActionUntil=performance.now()+260;
      pendingOutcome=null;window.__hitOutcome=null;ballPhysics=null;fielderTarget=null;pitchState='idle';updateFieldingUI();
      finishPlay(finalOutcome);
    }else if(msg.type==='ONLINE_STEAL'&&isLocalPitcher()&&pitchState==='idle'){
      if(!Number.isFinite(Number(msg.runnerId))||!Number.isInteger(Number(msg.targetBase))||Number(msg.targetBase)<1||Number(msg.targetBase)>2)return;
      const catcher=catcherPlayerForSide(match.half==='TOP'?'home':'away');const pitcher=pitcherPlayerForSide(match.half==='TOP'?'home':'away');
      const result=stealBase(match,Number(msg.runnerId),Number(msg.targetBase),{catcherArm:catcher?.arm||70,pitcherStamina:match.pitcherStamina?.[match.half==='TOP'?'home':'away']??100,difficulty:'NORMAL'});
      match=result.state;onlineStealPending=false;onlineRevision+=1;onlineSend({type:'ONLINE_STATE',revision:onlineRevision,match});
      matchEvent(result.success?'STEAL SUCCESS':'STEAL OUT','run');updateMatchHUD();updatePremiumHUD();
      if(!match.ended)setTimeout(()=>pitch(),450);
    }
    return;
  }
  if(msg.type==='ONLINE_START'){
    if(!isValidMatchState(msg.match))return;
    matchMode='ONLINE';onlineRosters={away:sanitizeRoster(msg.rosters?.away),home:sanitizeRoster(msg.rosters?.home)};match=msg.match;onlineRevision=Number(msg.revision)||0;onlineSessionStarted=true;startOnlineMatchView();onlineSend({type:'ONLINE_READY_ACK',revision:onlineRevision});
  }else if(msg.type==='ONLINE_PITCH'&&match.half==='BOTTOM'&&pitchState==='idle'){
    startPitchFromNetwork(msg);
  }else if(msg.type==='ONLINE_CONTACT'){
    startBattedBallFromNetwork(msg);
  }else if(msg.type==='ONLINE_STATE'){
    const revision=Number(msg.revision)||0;
    if(revision<=onlineRevision)return;
    if(!isValidMatchState(msg.match))return;
    onlineRevision=revision;match=msg.match;pitchState='idle';t=0;ballPhysics=null;pendingOutcome=null;fielderTarget=null;updateMatchHUD();updatePremiumHUD();if(match.ended)recordMatchResult();
  }
}
function startOnlineMatchView(){setMode('match');resetMatchView();setBattingMode(save.settings?.battingModeDefault==='POWER'?'POWER':'CONTACT');$('swing').disabled=false;$('pitch').disabled=false;updateMatchHUD();updatePremiumHUD();matchEvent('ONLINE MATCH','result');}
function startPitchFromNetwork(msg){
  const safe=sanitizeNetworkPitch(msg);
  selectedPitch=safe.pitch;pitchTarget=safe.target;window.__lastPitch=selectedPitch;window.__pitchVelocity=safe.velocity;
  pitchState='pitch';t=0;onlineActionSentForPitch=false;onlinePendingPitchId=safe.id;onlinePendingPitch=safe;
  const info=PITCHES[selectedPitch]||PITCHES.FASTBALL;
  ballPhysics=createPitchPhysics({speedMph:window.__pitchVelocity,targetX:pitchTarget.x,targetY:pitchTarget.y,breakX:safe.breakX,breakY:safe.breakY});
  updateMatchHUD();updatePremiumHUD();matchEvent(selectedPitch,'pitch');
}
function resolveRemoteBatting(msg){
  if(!onlinePendingPitch||msg.pitchId!==onlinePendingPitchId)return;
  const batter=onlineRosterPlayer('home',Number(match.batterIndex?.home||0)),prof=localPlayerProfile(batter);
  if(msg.type==='ONLINE_TAKE'){finishPlay(Math.abs(pitchTarget.x)<.55&&Math.abs(pitchTarget.y)<.55?'STRIKE':'BALL');return;}
  const aimX=clampNetworkNumber(msg.aimX,-1.5,1.5,0),aimY=clampNetworkNumber(msg.aimY,-1.5,1.5,0);
  const dx=Math.abs(aimX-pitchTarget.x),dy=Math.abs(aimY-pitchTarget.y);
  const contact=Math.max(.05,Math.min(.98,(prof.contact||.65)*(1-(dx+dy)*.35)));
  const powerMode=msg.mode==='POWER'?1:.72;
  const timing=Number.isFinite(Number(msg.timing))?Number(msg.timing):.5;
  const outcome=resolvePitch({pitch:selectedPitch,timing,contact,power:Math.min(1,(prof.power||.7)*powerMode)});
  if(['SINGLE','DOUBLE','TRIPLE','HOME_RUN','GROUND_OUT','FLY_OUT'].includes(outcome)){
    beginBattedBall(outcome,batter,prof);onlineSend({type:'ONLINE_CONTACT',pitchId:onlinePendingPitchId,outcome,physics:ballPhysics});
  }else finishPlay(outcome);
}
function startBattedBallFromNetwork(msg){
  if(!msg.physics||!isFiniteBallPhysics(msg.physics))return;
  const outcome=['SINGLE','DOUBLE','TRIPLE','HOME_RUN','GROUND_OUT','FLY_OUT'].includes(msg.outcome)?msg.outcome:'OUT';
  if(msg.pitchId)onlinePendingPitchId=String(msg.pitchId);
  ballPhysics=JSON.parse(JSON.stringify(msg.physics));pendingOutcome=outcome;window.__hitOutcome=outcome;pitchState='hit';t=ballPhysics.time||0;
  const lx=ballPhysics.landing?.[0]??0,lz=ballPhysics.landing?.[2]??3;fielderTarget={x:Math.max(-24,Math.min(24,lx)),z:Math.max(-6,Math.min(28,lz))};setFielderTarget(outcome);
}
function resolveLiveFieldingOutcome(completed){
  const defender=fieldingPlayer(fielderIndex);
  const lead=fielders[fielderIndex]||fielders[0];
  const catchDistance=Math.hypot((ballPhysics?.position?.[0]??fielderTarget?.x??0)-(lead?.position.x??0),(ballPhysics?.position?.[2]??fielderTarget?.z??0)-(lead?.position.z??0));
  return resolveFieldingPlay(match,{
    result:completed,
    distance:catchDistance,
    travelTime:Math.max(.05,t),
    fielderReaction:defender?.reaction||defender?.field||70,
    fielderField:defender?.field||70,
    fielderCatch:defender?.catch||defender?.field||70,
    fielderArm:defender?.arm||defender?.field||70,
    throwDistance:fielderThrowTarget===1?18:fielderThrowTarget===2?31:fielderThrowTarget===3?38:completed==='SINGLE'?27:42,
    batterSpeed:Number(lineupPlayer(0)?.speed)||70,
    difficulty:(matchMode==='AI'&&match.half==='TOP')?matchDifficulty:'NORMAL'
  });
}
function recordMatchResult(){
  if(!match.ended||matchResultRecorded)return;
  matchResultRecorded=true;
  save.matches=Math.max(0,Number(save.matches)||0)+1;
  const localWon=isOnlineMatch()?((onlineRole==='GUEST'&&match.score.home>match.score.away)||(onlineRole==='HOST'&&match.score.away>match.score.home)):match.score.away>match.score.home;
  if(localWon)save.wins=Math.max(0,Number(save.wins)||0)+1;
  persist();
  matchEvent(match.score.away===match.score.home?'試合終了':'試合終了 '+(localWon?'WIN':'LOSE'),'result');
  showMatchResult(localWon);
  $('swing').disabled=true;
  $('pitch').disabled=true;
}
function showMatchResult(localWon){
  let panel=document.getElementById('match-result-panel');
  if(!panel){panel=document.createElement('div');panel.id='match-result-panel';document.body.appendChild(panel);}
  const title=match.score.away===match.score.home?'DRAW':(localWon?'WIN':'LOSE');
  panel.innerHTML='<div class="match-result-box"><span>FINAL SCORE</span><strong>'+title+'</strong><div class="result-score"><b>'+match.score.away+'</b><i>-</i><b>'+match.score.home+'</b></div><small>'+match.inning+'回 '+(match.half==='TOP'?'表':'裏')+'</small><button type="button" id="result-home">ホームへ</button><button type="button" id="result-retry">もう一度</button></div>';
  panel.classList.add('show');
  $('result-home').onclick=()=>{panel.classList.remove('show');onlineConnection?.close?.();onlineConnection=null;onlineRole=null;onlineSessionStarted=false;setMode('home');};
  $('result-retry').onclick=()=>{panel.classList.remove('show');if(matchMode==='ONLINE'){onlineConnection?.close?.();onlineConnection=null;setMode('online-lobby');}else startAIMatch();};
}
function resetMatchView(){
  ensureMatchPresentation();
  resetFielderPositions();fielderAction='idle';fielderActionUntil=0;onlinePendingPitchId=null;onlinePendingPitch=null;
  pitchState='idle';t=0;ballPhysics=null;pendingOutcome=null;window.__pitchVelocity=0;window.__hitOutcome=null;fielderTarget=null;
  updatePremiumHUD();updateFieldingUI();
  fielderManualInput=false;fielderThrowTarget=0;fieldingPadPointer=null;
  cameraMode='BATTER';
  camera.fov=52;camera.updateProjectionMatrix();
  camera.position.set(0,6.8,22.5);
  camera.lookAt(0,2.1,-7.5);
  aimTarget={x:0,y:0};updateAimUI();updateZoneUI();
  let ov=document.getElementById('match-intro');
  if(!ov){ov=document.createElement('div');ov.id='match-intro';ov.innerHTML='<div class="match-intro-kicker">BASEBALL 3D</div><strong>PLAY BALL</strong><span>1回表 · STARTING LINEUP</span>';document.body.appendChild(ov);}
  ov.classList.remove('hide');setTimeout(()=>ov.classList.add('hide'),1150);
}
let battingMode='CONTACT';
function setBattingMode(mode){
  battingMode=mode==='POWER'?'POWER':'CONTACT';
  $('bat-contact-mode')?.classList.toggle('selected',battingMode==='CONTACT');
  $('bat-power-mode')?.classList.toggle('selected',battingMode==='POWER');
  const pill=$('bat-mode-pill');if(pill)pill.dataset.mode=battingMode;
}
function updateMatchHUD(){
  syncVisualPlayers();
  const batting=isLocalBatter();
  matchUI.classList.toggle('batting-phase',batting);
  matchUI.classList.toggle('pitching-phase',!batting);
  const batter=isOnlineMatch()?onlineRosterPlayer(match.half==='TOP'?'away':'home',Number(match.batterIndex?.[match.half==='TOP'?'away':'home']||0)):lineupPlayer(0);
  $('matchhud').textContent=match.inning+'回'+(match.half==='TOP'?'表':'裏')+'　'+match.score.away+' - '+match.score.home;
  $('inning-label').textContent=match.inning+'回'+(match.half==='TOP'?'表':'裏');
  $('away-score').textContent=match.score.away;$('home-score').textContent=match.score.home;
  $('count-label').textContent='B'+match.balls+' S'+match.strikes+' O'+match.outs;
  $('batter-name').textContent=batter?.name||'打者';
  if(catcher)catcher.visible=true;
  $('pitch-readout').textContent=pitchState==='pitch'?selectedPitch:'READY';
  $('pitch').querySelector('span').textContent=isOnlineMatch()?'投球':'投球';
  $('pitch').style.display=isLocalPitcher()?'block':'none';
  updateStealButton();
  updateBullpenButton();
  updateFieldingUI();
  $('take').style.display=batting?'block':'none';
  $('swing').style.display=batting?'block':'none';
  document.querySelectorAll('[data-pitch]').forEach(b=>b.style.display=isLocalPitcher()?'block':'none');
  const help=$('aim-help');if(help)help.textContent=batting?'タップでスイング ・ ドラッグでミート位置':'ドラッグでコース指定 → 投球';
  const zone=$('strike-zone');if(zone)zone.classList.toggle('active',true);
  updatePitchControlUI();
}
const PITCHES_FOR_UI={FASTBALL:'FASTBALL',SLIDER:'SLIDER',CURVEBALL:'CURVEBALL',FORK:'FORK',CHANGEUP:'CHANGEUP'}; const PITCH_CURVE={FASTBALL:0,SLIDER:.65,CURVEBALL:-.8,FORK:.74,CHANGEUP:.35};
document.querySelectorAll('[data-ai-difficulty]').forEach(b=>b.addEventListener('click',()=>setAIDifficulty(b.dataset.aiDifficulty)));
$('take').addEventListener('click',take);document.querySelectorAll('[data-pitch]').forEach(b=>b.addEventListener('click',()=>choosePitchManual(b.dataset.pitch)));
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{
  const mode=b.dataset.mode;
  if(mode==='match'||mode==='ai-match'){startAIMatch();return;}
  setMode(mode);
}));
let aimPointerStart=null;let aimPointerMoved=false;
$('aim-area')?.addEventListener('pointerdown',e=>{aimDragging=true;aimPointerMoved=false;aimPointerStart={x:e.clientX,y:e.clientY};updateAimFromPointer(e);$('aim-area').setPointerCapture?.(e.pointerId);});
$('aim-area')?.addEventListener('pointermove',e=>{if(!aimDragging)return;if(aimPointerStart&&Math.hypot(e.clientX-aimPointerStart.x,e.clientY-aimPointerStart.y)>8)aimPointerMoved=true;updateAimFromPointer(e);});
$('aim-area')?.addEventListener('pointerup',e=>{const tap=!aimPointerMoved;aimDragging=false;if(tap&&isLocalBatter()&&pitchState==='pitch')pointerSwing();aimPointerStart=null;aimPointerMoved=false;$('aim-area').releasePointerCapture?.(e.pointerId);});
$('aim-area')?.addEventListener('pointercancel',e=>{aimDragging=false;aimPointerStart=null;aimPointerMoved=false;});
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>setMatchCamera(b.dataset.view)));
$('pitch').addEventListener('click',pitch);$('swing').addEventListener('click',swing);$('steal')?.addEventListener('click',performSteal);$('bullpen')?.addEventListener('click',performPitcherChange);
$('fielding-pad')?.addEventListener('pointerdown',fieldingPadStart);
$('fielding-pad')?.addEventListener('pointermove',fieldingPadMove);
$('fielding-pad')?.addEventListener('pointerup',fieldingPadEnd);
$('fielding-pad')?.addEventListener('pointercancel',fieldingPadEnd);
document.querySelectorAll('[data-throw-base]').forEach(b=>b.addEventListener('click',()=>selectThrowBase(b.dataset.throwBase)));$('bat-contact-mode')?.addEventListener('click',()=>setBattingMode('CONTACT'));$('bat-power-mode')?.addEventListener('click',()=>setBattingMode('POWER'));$('matchback').addEventListener('click',()=>{onlineConnection?.close?.();onlineConnection=null;onlineRole=null;onlineSessionStarted=false;setMode('home');});persist();updateProfileUI();updateAimUI();updateZoneUI();setAIDifficulty(matchDifficulty);setBattingMode(save.settings?.battingModeDefault==='POWER'?'POWER':'CONTACT');
function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}addEventListener('resize',resize);
function animate(){requestAnimationFrame(animate);const now=performance.now();const frameDt=Math.max(0,Math.min(.05,(now-lastFrameTime)/1000));lastFrameTime=now;updateRunnerVisuals();animatePlayer(pitcher,pitchState==='pitch'?'pitch':'idle',pitchState==='pitch'?t:0);animatePlayer(batter,pitchState==='hit'?'swing':'idle',pitchState==='hit'?t:0);if(pitchState==='hit'&&fielderTarget){const lead=fielders[fielderIndex];const defender=fieldingPlayer(fielderIndex);const reaction=Math.max(.75,Math.min(1.35,(Number(defender?.reaction||defender?.field||70)/70)));const dx=fielderTarget.x-lead.position.x,dz=fielderTarget.z-lead.position.z;const d=Math.hypot(dx,dz);const step=Math.min(.14*reaction,d);if(d>.1){lead.position.x+=dx/d*step;lead.position.z+=dz/d*step;animatePlayer(lead,'run',t*2*reaction)}}else if(fielderAction!=='idle'&&performance.now()<fielderActionUntil){const lead=fielders[fielderIndex];animatePlayer(lead,fielderAction,.5)}else if(fielderAction!=='idle'){fielderAction='idle';}if(pitchState==='pitch'){
  const previous=ballPhysics;
  ballPhysics=previous?stepBallPhysics(previous,frameDt):null;
  if(!ballPhysics||!isFiniteBallPhysics(ballPhysics)){window.__lastGameError='INVALID_PITCH_PHYSICS';ballPhysics=null;finishPlay('BALL');}
  else{
    t=ballPhysics.time;ball.position.set(...ballPhysics.position);
    $('mph-speed')&&($('mph-speed').textContent=Math.round((window.__pitchVelocity||0)*1.60934)+' km/h');
    if(ballPhysics.done){
      ballPhysics=null;
      if(isOnlineMatch()){
        onlinePendingPitch=onlinePendingPitch||{id:onlinePendingPitchId};
        if(isLocalBatter()&&!onlineActionSentForPitch){
          onlineActionSentForPitch=true;
          if(onlineRole==='GUEST')onlineSend({type:'ONLINE_TAKE',pitchId:onlinePendingPitchId});
          else finishPlay(Math.abs(pitchTarget.x)<.55&&Math.abs(pitchTarget.y)<.55?'STRIKE':'BALL');
        }
      }else if(match.half==='BOTTOM')aiBatterAtBat();
      else{const inZone=Math.abs(pitchTarget.x)<.55&&Math.abs(pitchTarget.y)<.55;finishPlay(inZone?'STRIKE':'BALL');}
    }
  }
}else if(pitchState==='hit'){
  ballPhysics=ballPhysics?stepBallPhysics(ballPhysics,frameDt):null;
  if(!ballPhysics||!isFiniteBallPhysics(ballPhysics)){window.__lastGameError='INVALID_BATTED_BALL_PHYSICS';ballPhysics=null;pendingOutcome=null;finishPlay('OUT');}
  else{
    t=ballPhysics.time;ball.position.set(...ballPhysics.position);
    if(fielderTarget&&cameraMode==='FIELDING'){
      const lead=fielders[fielderIndex];
      if(lead){
        const dx=fielderTarget.x-lead.position.x,dz=fielderTarget.z-lead.position.z,d=Math.hypot(dx,dz),step=Math.min(.14,d);
        if(d>.1){lead.position.x+=dx/d*step;lead.position.z+=dz/d*step;animatePlayer(lead,'run',t*1.6);}
      }
    }
    if(ballPhysics.done){
      const completed=pendingOutcome||'OUT';
      const lead=fielders[fielderIndex]||fielders[0];
      const isOnlineRemoteDefense=isOnlineMatch()&&onlineRole==='GUEST'&&isLocalFielder();
      const isOnlineRemoteBatter=isOnlineMatch()&&onlineRole==='HOST'&&!isLocalFielder();
      if(isOnlineRemoteDefense){
        const finalResult=resolveLiveFieldingOutcome(completed);
        fielderAction=finalResult.throwSuccess?'throw':finalResult.catchSuccess?'catch':'idle';fielderActionUntil=performance.now()+280;
        onlineActionSentForPitch=true;
        onlineSend({type:'ONLINE_FIELDING_RESULT',pitchId:onlinePendingPitchId,finalOutcome:finalResult.finalOutcome,catchSuccess:finalResult.catchSuccess,throwSuccess:finalResult.throwSuccess,event:finalResult.event});
        pendingOutcome=completed;window.__hitOutcome=null;ballPhysics=null;fielderTarget=lead?{x:lead.position.x,z:lead.position.z}:null;pitchState='fielding-wait';updateFieldingUI();
      }else if(isOnlineRemoteBatter){
        pendingOutcome=completed;ballPhysics=null;fielderTarget=lead?{x:lead.position.x,z:lead.position.z}:null;pitchState='fielding-wait';updateFieldingUI();
      }else{
        const finalResult=resolveLiveFieldingOutcome(completed);
        fielderAction=finalResult.throwSuccess?'throw':finalResult.catchSuccess?'catch':'idle';fielderActionUntil=performance.now()+280;
        fielderManualInput=false;fielderThrowTarget=0;fieldingPadPointer=null;document.querySelectorAll('[data-throw-base]').forEach(x=>x.classList.remove('selected'));
        matchEvent(finalResult.event==='THROW_ON_TARGET'?'OUT AT BASE':finalResult.event==='CATCH_MISS'?'CATCH MISS':finalResult.event==='FIELDING_ERROR'?'ERROR':finalResult.event==='CLEAN_CATCH'?'CATCH':'IN PLAY','field');
        pendingOutcome=null;window.__hitOutcome=null;window.__fieldingIntent=null;ballPhysics=null;
        const batterSpeed=Number(lineupPlayer(0)?.speed)||70;
        finishPlay(finalResult.finalOutcome,{batterSpeed,runnerReaction:Number(lineupPlayer(0)?.vision)||70});
        fielderTarget=null;ball.position.set(0,2.1,3);if(!match.ended)setMatchCamera('BATTER');if(match.half==='TOP'&&!match.ended)scheduleTopPitch(350);
      }
    }
  }
}else if(cameraMode==='FIELDING'&&fielderTarget){
  const lead=fielders[fielderIndex]||fielders[0],camTarget=new THREE.Vector3(lead.position.x+6.5,6.4,lead.position.z+7.5);
  camera.position.lerp(camTarget,.07);camera.lookAt(lead.position.x,1.1,lead.position.z);
}else if(cameraMode==='HOME_RUN'){
  camera.position.lerp(new THREE.Vector3(0,13,9),.025);camera.lookAt(0,3,-2)
}renderer.render(scene,camera)}animate();
void getCloudSave().then(cloud=>{if(cloud){save={...save,currency:cloud.currency,collection:cloud.collection,team:cloud.team,progress:cloud.progress,settings:cloud.settings,matches:cloud.matches,wins:cloud.wins};saveGame(save);currency.textContent=save.unlimitedCoins?'∞':save.currency.toLocaleString("ja-JP");}}).catch(()=>{});
window.__gameReady = true;window.__gameVersion="baseball-3d-web-20261004-premium-ui-v3";
