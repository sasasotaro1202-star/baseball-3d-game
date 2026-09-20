import * as THREE from 'three';
import {ALL_PLAYERS} from './data/players.js';
import {pullOnce,pullMany} from './game/gacha-service.js';
import {GACHA_BANNERS} from './data/gacha.js';
import {createMatchState,resolvePitch,applyOutcome,PITCHES} from './game/simulation.js';
import {loadSave,saveGame} from './game/save.js';
import {modeLabel} from './game/ui.js';
import {getCloudSave,putCloudSave,getCloudUser,signInWithMagicLink,signOutCloud} from './game/cloud-save.js';
import {ensurePresentationLayer,playGachaReveal,playMatchEvent} from './game/presentation.js';
import {createPlayerModel,animatePlayer} from './game/player-models.js';
import {choosePitch,chooseSwing} from './game/ai.js';
import {cardModel,modelConfig,aiProfile,developmentFor,trainPlayer,duplicateReward,releasePlayer} from './game/player-system.js';

ensurePresentationLayer();
const canvas=document.querySelector('#game');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setSize(innerWidth,innerHeight,false);
const scene=new THREE.Scene(); scene.background=new THREE.Color(0x08111f); scene.fog=new THREE.Fog(0x08111f,35,110);
const camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,.1,200); camera.position.set(0,16,27); camera.lookAt(0,2,-8);
scene.add(new THREE.HemisphereLight(0xffffff,0x203040,2.2));
const sun=new THREE.DirectionalLight(0xffffff,2.5);sun.position.set(12,30,10);scene.add(sun);
const field=new THREE.Mesh(new THREE.CircleGeometry(34,96),new THREE.MeshStandardMaterial({color:0x2e7d32,roughness:1}));field.rotation.x=-Math.PI/2;field.position.y=-.15;scene.add(field);
const infield=new THREE.Mesh(new THREE.CircleGeometry(10,4),new THREE.MeshStandardMaterial({color:0xb98250,roughness:1}));infield.rotation.x=-Math.PI/2;infield.rotation.z=Math.PI/4;scene.add(infield);
const mound=new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.5,.3,32),new THREE.MeshStandardMaterial({color:0xc89565}));mound.position.set(0,.15,3);scene.add(mound);
const home=new THREE.Mesh(new THREE.CylinderGeometry(.65,.65,.12,5),new THREE.MeshStandardMaterial({color:0xffffff}));home.rotation.y=Math.PI/4;home.position.set(0,.08,-8);scene.add(home);
const ball=new THREE.Mesh(new THREE.SphereGeometry(.16,20,20),new THREE.MeshStandardMaterial({color:0xffffff}));ball.position.set(0,2.1,3);scene.add(ball);
const pitcher=createPlayerModel(modelConfig(ALL_PLAYERS[0]));pitcher.position.set(0,0,3);scene.add(pitcher);
const batter=createPlayerModel(modelConfig(ALL_PLAYERS[4]));batter.position.set(2.2,0,-8);batter.rotation.y=Math.PI;scene.add(batter);
const fielders=[[-10,0,1],[0,0,13],[10,0,1],[-17,0,-3],[17,0,-3],[-7,0,8],[7,0,8],[12,0,13],[-12,0,13]].map(([x,y,z],i)=>{const p=createPlayerModel({uniform:0x163a66,scale:.9});p.position.set(x,y,z);scene.add(p);return p});

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
let fieldingFrom={x:0,z:0};let fielderTarget=null;

let save=loadSave(); let match=createMatchState(); let pitchState='idle',t=0; let selectedPitch='FASTBALL'; let pitchStart=0; let swingWindowOpen=false; let pitchTarget={x:0,y:0}; let aimTarget={x:0,y:0}; let cameraMode='BATTER'; let aimDragging=false;
const $=id=>document.getElementById(id); const homeUI=$('home'),viewUI=$('view'),card=$('card'),matchUI=$('match-ui'),currency=$('currency');
function updateProfileUI(){const count=save.collection.length;const power=save.collection.reduce((sum,id)=>{const p=ALL_PLAYERS.find(x=>x.id===id);return sum+(p?Math.round(((p.power||70)+(p.contact||70)+(p.field||70)+(p.control||70))/4):0)},0);$('record').textContent=`${save.wins}勝 ${save.matches}試合`;$('roster-count').textContent=count;$('team-power').textContent=count?Math.round(power/count):'—';}
function playerCards(){
  return save.collection.map(id=>ALL_PLAYERS.find(p=>p.id===id)).filter(Boolean).map(p=>{
    const c=cardModel(p,developmentFor(save,p.id));
    const image=p.image||'';
    const limited=p.limited===true;
    const type=p.cardType||'STANDARD';
    const typeLabel={SELECTION:'SELECTION',ANNIVERSARY:'ANNIVERSARY',BEST9:'BEST 9',LEGEND_OB:'LEGEND OB',AWAKENED:'覚醒選手',CROWN:'CROWN',MOMENT:'MOMENT',TWO_WAY:'TWO-WAY',STANDARD:'STANDARD'}[type]||'LIMITED';
    const abilities=c.abilities.slice(0,4).map(a=>'<span class="ability-chip '+(a.kind==='special'?'ability-special':'')+'">'+a.name+' '+a.ratePercent+'%<button type="button" class="ability-info" data-ability="'+a.id+'">i</button></span>').join('');
    return '<div class="player-card compact-player '+(limited?'limited-player limited-'+type.toLowerCase():'')+'" data-player-id="'+p.id+'">'+
      '<div class="player-portrait"><span class="rank-badge">'+c.rank+'</span>'+(limited?'<span class="limited-badge">LIMITED</span>':'')+(image?'<img src="'+image+'" alt="'+p.name+'" loading="eager" referrerpolicy="no-referrer" onerror="this.onerror=null;this.parentElement.innerHTML=\'<div class=\"portrait-fallback\"><span>'+p.name.split(' ').map(x=>x[0]).join('').slice(0,3)+'</span><small>PHOTO UNAVAILABLE</small></div>\'">':'<div class="portrait-fallback"><span>'+p.name.split(' ').map(x=>x[0]).join('').slice(0,3)+'</span><small>PHOTO UNAVAILABLE</small></div>')+'</div>'+
      '<div class="player-head"><strong>'+c.name+'</strong><b>OVR '+c.overall+'</b></div>'+
      '<span class="player-meta">'+(limited?'<b class="card-type-label">'+typeLabel+'</b> ':'')+c.pos+' · '+c.era+'</span>'+
      '<div class="mini-stats"><span>打 '+c.stats.contact+'</span><span>パ '+c.stats.power+'</span><span>守 '+c.stats.field+'</span><span>走 '+c.stats.speed+'</span></div>'+
      '<div class="ability-list">'+abilities+'</div>'+
      '<button type="button" class="action release-player" data-id="'+p.id+'">放出</button>'+
    '</div>';
  }).join('');
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
  homeUI.classList.toggle('hidden',mode!=='home'); viewUI.classList.toggle('hidden',mode==='home'||mode==='match'); matchUI.classList.toggle('hidden',mode!=='match');
  if(mode!=='match') renderer.domElement.style.opacity='0.35'; else renderer.domElement.style.opacity='1';
  if(mode==='home')return;
  if(mode==='gacha')renderGacha(); else if(mode==='roster')renderRoster();
  else if(mode==='training')renderTraining();
  else if(mode==='collection')renderCollection(); else if(mode==='settings')renderSettings();
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
  card.querySelectorAll('[data-player-id]').forEach(b=>b.onclick=()=>showPlayer3D(b.dataset.playerId));
  card.querySelectorAll('.ability-info').forEach(b=>b.onclick=e=>{e.stopPropagation();showAbilityDetails(b.closest('[data-player-id]')?.dataset.playerId,b.dataset.ability);});
  card.querySelectorAll('.release-player').forEach(b=>b.onclick=e=>{e.stopPropagation();const p=ALL_PLAYERS.find(x=>x.id===Number(b.dataset.id));if(!p)return;if(!confirm(p.name+'を放出しますか？'))return;const r=releasePlayer(save,p);if(r.error)return;save=r.state;persist();renderRoster();});
}
function playerCardsFor(players){
  return players.map(p=>{
    const c=cardModel(p,developmentFor(save,p.id)),image=p.image||'',limited=p.limited===true,type=p.cardType||'STANDARD';
    const typeLabel={CROWN:'CROWN',MOMENT:'MOMENT',TWO_WAY:'TWO-WAY',STANDARD:'STANDARD'}[type]||'LIMITED';
    const abilities=c.abilities.slice(0,4).map(a=>'<span class="ability-chip '+(a.kind==='special'?'ability-special':'')+'">'+a.name+' '+a.ratePercent+'%</span>').join('');
    return '<div class="player-card compact-player '+(limited?'limited-player limited-'+type.toLowerCase():'')+'" data-player-id="'+p.id+'"><div class="player-portrait"><span class="rank-badge">'+c.rank+'</span>'+(limited?'<span class="limited-badge">LIMITED</span>':'')+(image?'<img src="'+image+'" alt="'+p.name+'" loading="eager" referrerpolicy="no-referrer" onerror="this.onerror=null;this.parentElement.innerHTML=\'<div class=\"portrait-fallback\"><span>'+p.name.split(' ').map(x=>x[0]).join('').slice(0,3)+'</span><small>PHOTO UNAVAILABLE</small></div>\'">':'<div class="portrait-fallback"><span>'+p.name.split(' ').map(x=>x[0]).join('').slice(0,3)+'</span><small>PHOTO UNAVAILABLE</small></div>')+'</div><div class="player-head"><strong>'+c.name+'</strong><b>OVR '+c.overall+'</b></div><span class="player-meta">'+(limited?'<b class="card-type-label">'+typeLabel+'</b> ':'')+c.pos+' · '+c.era+'</span><div class="mini-stats"><span>打 '+c.stats.contact+'</span><span>パ '+c.stats.power+'</span><span>守 '+c.stats.field+'</span><span>走 '+c.stats.speed+'</span></div><div class="ability-list">'+abilities+'</div><button type="button" class="action release-player" data-id="'+p.id+'">放出</button></div>';
  }).join('');
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
function renderRoster(){
  const owned=resolveOwnedPlayers();
  const render=()=>{const q=(document.getElementById('owned-search')?.value||'').trim().toLowerCase();const rank=document.getElementById('owned-rank')?.value||'ALL';const list=owned.filter(p=>(!q||p.name.toLowerCase().includes(q)||String(p.pos||'').toLowerCase().includes(q))&&(rank==='ALL'||p.rank===rank));const wrap=document.getElementById('owned-list');if(wrap){wrap.innerHTML=list.length?playerCardsFor(list):'<p class="small">条件に一致する所持選手はいません。</p>';bindPlayerCards();}};
  const starters=owned.slice(0,9);
  card.innerHTML=`<h2>オーダー</h2><p>所持選手 ${owned.length} 名 ・ スタメン ${starters.length} 名</p><div class="order-starting-grid">${starters.map((p,i)=>'<div class="lineup-player"><div class="lineup-number">'+(i+1)+'</div>'+portraitMarkup(p,'lineup-portrait')+'<strong>'+p.name+'</strong><small>'+p.pos+' · OVR '+cardModel(p,developmentFor(save,p.id)).overall+'</small></div>').join('')||'<p>スカウトで選手を獲得すると、ここに表示されます。</p>'}</div><h3 class="order-section-title">全所持選手</h3><div class="owned-toolbar"><input id="owned-search" type="search" placeholder="選手名・守備位置で検索"><select id="owned-rank"><option value="ALL">全ランク</option><option>S</option><option>A</option><option>B</option><option>C</option><option>D</option><option>F</option></select></div><div id="owned-list" class="player-grid"></div><button class="action back" id="back">ホームへ戻る</button>`;
  $('back').onclick=()=>setMode('home');document.getElementById('owned-search').oninput=render;document.getElementById('owned-rank').onchange=render;render();
}function renderTraining(){
  const players=resolveOwnedPlayers();
  card.innerHTML='<h2>育成</h2><p>選手名鑑と同じ顔写真カードで、育成対象を一目で確認できます。</p><div class="player-grid training-grid">'+(players.map(p=>{
    const d=developmentFor(save,p.id),c=cardModel(p,d),image=p.image||'';
    const portrait=portraitMarkup(p,'training-portrait');
    return '<div class="player-card training-player" data-player-id="'+p.id+'"><div class="player-portrait training-portrait">'+portrait+'<span class="training-level">LV '+d.level+'</span></div><div class="player-head"><strong>'+c.name+'</strong><b>OVR '+c.overall+'</b></div><span class="player-meta">'+c.pos+' · XP '+d.xp+'</span><div class="mini-stats"><span>打 '+c.stats.contact+'</span><span>パ '+c.stats.power+'</span><span>守 '+c.stats.field+'</span><span>走 '+c.stats.speed+'</span></div><div class="row"><button class="action train" data-id="'+p.id+'" data-focus="contact">打撃</button><button class="action train" data-id="'+p.id+'" data-focus="power">パワー</button><button class="action train" data-id="'+p.id+'" data-focus="field">守備</button></div></div>';
  }).join('')||'<p>育成する選手がいません。</p>')+'</div><button class="action back" id="back">ホームへ戻る</button>';
  $('back').onclick=()=>setMode('home');bindPlayerCards();
  card.querySelectorAll('.train').forEach(b=>b.onclick=()=>{const p=ALL_PLAYERS.find(x=>x.id===Number(b.dataset.id));const r=trainPlayer(save,p,b.dataset.focus);if(r.error){alert('コイン不足');return}save=r.state;persist();renderTraining();});
}
function renderCard(title,body){card.innerHTML='<h2>'+title+'</h2><p>'+body+'</p><button class="action back" id="back">ホームへ戻る</button>'; $('back').onclick=()=>setMode('home');}
async function renderSettings(){
  const user=await getCloudUser();
  card.innerHTML='<h2>設定</h2><p>ローカル保存に加えて、Supabaseクラウドセーブを利用できます。</p><p class="small">'+(user?'クラウド: 接続中':'クラウド: 未ログイン')+'</p>'+(user?'<button class="action" id="cloudLogout">クラウドからログアウト</button>':'<div class="row"><input id="cloudEmail" type="email" placeholder="メールアドレス" style="flex:2;padding:14px;border-radius:14px;border:1px solid #ffffff25;background:#101d2d;color:#fff"><button class="action" id="cloudLogin">ログインリンク</button></div>')+'<button class="action back" id="back">ホームへ戻る</button>';
  $('back').onclick=()=>setMode('home');
  if(user) $('cloudLogout').onclick=async()=>{await signOutCloud();renderSettings();};
  else $('cloudLogin').onclick=async()=>{const email=$('cloudEmail').value.trim();if(!email)return;const {error}=await signInWithMagicLink(email);if(error)alert(error.message);else alert('ログインリンクをメールに送信しました。');};
}
function renderCollection(){
  const owned=new Set(save.collection||[]);
  const total=ALL_PLAYERS.length;
  const cards=ALL_PLAYERS.map(p=>{
    const ownedNow=owned.has(p.id);
    const c=cardModel(p,developmentFor(save,p.id));
    const image=p.image||'';
    const limited=p.limited===true;
    const type=p.cardType||'STANDARD';
    const typeLabel={CROWN:'CROWN',MOMENT:'MOMENT',TWO_WAY:'TWO-WAY',STANDARD:'STANDARD'}[type]||'LIMITED';
    const abilities=c.abilities.slice(0,4).map(a=>'<span class="ability-chip '+(a.kind==='special'?'ability-special':'')+'">'+a.name+' '+a.ratePercent+'%</span>').join('');
    const portrait=ownedNow
      ? (image?'<img src="'+image+'" alt="'+p.name+'" loading="eager" referrerpolicy="no-referrer" onerror="this.onerror=null;this.parentElement.innerHTML=\'<div class=\"portrait-fallback\"><span>'+p.name.split(' ').map(x=>x[0]).join('').slice(0,3)+'</span><small>PHOTO UNAVAILABLE</small></div>\'">':'<div class="portrait-fallback"><span>'+p.name.split(' ').map(x=>x[0]).join('').slice(0,3)+'</span><small>PHOTO UNAVAILABLE</small></div>')
      : '<div class="portrait-fallback locked-portrait"><span>?</span><small>LOCKED</small></div>';
    return '<div class="player-card compact-player encyclopedia-card '+(!ownedNow?'locked':'')+' '+(limited?'limited-player limited-'+type.toLowerCase():'')+'" data-player-id="'+p.id+'">'+
      '<div class="player-portrait">'+portrait+'<span class="rank-badge">'+c.rank+'</span>'+(ownedNow&&limited?'<span class="limited-badge">LIMITED</span>':'')+'</div>'+
      '<div class="player-head"><strong>'+ (ownedNow?c.name:'？？？') +'</strong><b>'+(ownedNow?'OVR '+c.overall:'LOCKED')+'</b></div>'+
      '<span class="player-meta">'+(ownedNow?(limited?'<b class="card-type-label">'+typeLabel+'</b> ':'')+c.pos+' · '+c.era:'スカウトで解放')+'</span>'+
      '<div class="mini-stats">'+(ownedNow?'<span>打 '+c.stats.contact+'</span><span>パ '+c.stats.power+'</span><span>守 '+c.stats.field+'</span><span>走 '+c.stats.speed+'</span>':'<span>？？</span><span>？？</span><span>？？</span><span>？？</span>')+'</div>'+
      '<div class="ability-list">'+(ownedNow?abilities:'<span class="small">未獲得選手</span>')+'</div>'+
    '</div>';
  }).join('');
  const unlocked=[...owned].filter(id=>ALL_PLAYERS.some(p=>p.id===id)).length;
  card.innerHTML='<h2>選手名鑑</h2><p>解放 '+unlocked+' / 全 '+total+' 名　・　未獲得選手も一覧表示</p><div class="player-grid">'+cards+'</div><button class="action back" id="back">ホームへ戻る</button>';
  $('back').onclick=()=>setMode('home');
  card.querySelectorAll('.encyclopedia-card.locked').forEach(b=>b.onclick=()=>setMode('gacha'));
  bindPlayerCards();
}
function renderGacha(){
  const escape=(v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const rankRate=(rank)=>({S:'0.1%',A:'8%',B:'15%',C:'22%',D:'25%',F:'29.5%'}[rank]||'-');
  let bannerId=GACHA_BANNERS[0].id,busy=false;

  card.innerHTML=`
    <h2 class="gacha-title">スカウト</h2>
    <div class="gacha-balance"><span>所持コイン</span><b id="gacha-coins">${save.unlimitedCoins?'∞':save.currency.toLocaleString('ja-JP')}</b><span>1回 250</span><span>10連 2,500</span></div>
    <div class="gacha-tabs" id="gacha-tabs">
      ${GACHA_BANNERS.map((b,i)=>`<button type="button" class="gacha-tab ${i===0?'selected':''}" data-banner="${escape(b.id)}"><b>${escape(b.name)}</b><small>${escape(b.subtitle)}</small><em>${escape(b.kind)}</em></button>`).join('')}
    </div>
    <section class="gacha-banner-card" id="gacha-banner-card"></section>
    <div class="gacha-actions">
      <button type="button" class="gacha-pull-one" id="pull">1回スカウト<span>250 コイン</span></button>
      <button type="button" class="gacha-pull-ten" id="pull10">10連スカウト<span>2,500 コイン</span></button>
    </div>
    <div id="banner-info" class="banner-info"></div>
    <section class="gacha-results" id="gacha-results">
      <div class="gacha-empty"><b>SCOUT READY</b><small>スカウトを選択して選手を獲得</small></div>
    </section>
    <button type="button" class="action back" id="back">ホームへ</button>
  `;

  const tabs=card.querySelectorAll('.gacha-tab');
  const coinsEl=$('gacha-coins');
  const resultEl=$('gacha-results');
  const updateBalance=()=>{coinsEl.textContent=save.unlimitedCoins?'∞':save.currency.toLocaleString('ja-JP');};
  const getBanner=()=>GACHA_BANNERS.find(x=>x.id===bannerId)||GACHA_BANNERS[0];

  function renderBanner(){
    const b=getBanner();
    const pool=ALL_PLAYERS.filter(b.filter);
    const featured=pool.filter(p=>p.limited).slice(0,2);
    const normal=pool.filter(p=>!p.limited).slice(0,3);
    const picks=[...featured,...normal].slice(0,3);
    $('banner-info').innerHTML=`
      <div class="banner-info-head"><b>${escape(b.name)}</b><span>${escape(b.kind)}</span></div>
      <strong>${escape(b.subtitle)}</strong>
      <small>${escape(b.rateBonus)}</small>
      <div class="rate-row"><span>S 0.1%</span><span>A 8%</span><span>B 15%</span><span>C 22%</span><span>D 25%</span><span>F 29.5%</span></div>
      <div class="banner-note">MOB・低ランク選手も多く登場。Sランクは極めて低確率。</div>
    `;
    $('gacha-banner-card').innerHTML=`
      <div class="gacha-banner-copy"><small>SCOUT BANNER</small><h3>${escape(b.name)}</h3><p>${escape(b.subtitle)}</p><b>${escape(b.rateBonus)}</b></div>
      <div class="gacha-featured">${picks.length?picks.map(p=>`<div class="gacha-feature-card ${p.limited?'limited':''}">${p.image?'<img src="'+escape(p.image)+'" alt="" loading="lazy">':'<div class="gacha-fallback">?</div>'}<strong>${escape(p.name)}</strong><small>${escape(p.rank)} · ${p.limited?'LIMITED':'STANDARD'}</small></div>`).join(''):'<div class="gacha-no-pool">対象選手を準備中</div>'}</div>
    `;
  }

  function renderResults(results){
    if(!results?.length)return;
    const sorted=[...results].sort((a,b)=>{
      const score={S:6,A:5,B:4,C:3,D:2,F:1};
      return (score[b.result.rank]||0)-(score[a.result.rank]||0);
    });
    resultEl.innerHTML=`
      <div class="results-head"><b>${results.length}連結果</b><small>新規 ${results.filter(x=>!x.duplicate).length} / 重複 ${results.filter(x=>x.duplicate).length}</small></div>
      <div class="gacha-result-grid">${sorted.map((x,i)=>{const p=x.result.player;return `<div class="gacha-result-card rank-${escape(x.result.rank)} ${x.result.limited?'limited':''}">
        <div class="result-badge">${escape(x.result.rank)}</div>
        ${p.image?'<img src="'+escape(p.image)+'" alt="" loading="lazy">':'<div class="gacha-fallback">?</div>'}
        <strong>${escape(p.name)}</strong>
        <small>${escape(x.result.rarity)}${x.result.limited?' · LIMITED':''}</small>
        ${x.duplicate?'<em>重複 +'+x.duplicateReward+'</em>':''}
      </div>`}).join('')}</div>
    `;
  }

  renderBanner();
  tabs.forEach(btn=>btn.onclick=()=>{
    if(busy)return;
    bannerId=btn.dataset.banner;
    tabs.forEach(x=>x.classList.toggle('selected',x===btn));
    renderBanner();
    resultEl.innerHTML='<div class="gacha-empty"><b>'+escape(getBanner().name)+'</b><small>このガチャの結果がここに表示されます</small></div>';
  });

  async function runPull(count){
    if(busy)return;
    const cost=250*count;
    const normalizeSave=()=>{
      const currency=Number.isFinite(Number(save.currency))?Number(save.currency):1000;
      save={...save,currency,collection:Array.isArray(save.collection)?save.collection:[],progress:(save.progress&&typeof save.progress==='object')?save.progress:{},team:Array.isArray(save.team)?save.team:[]};
    };
    normalizeSave();
    if(!save.unlimitedCoins && save.currency<cost){
      resultEl.innerHTML='<div class="gacha-error"><b>コイン不足</b><small>必要 '+cost.toLocaleString('ja-JP')+' / 所持 '+save.currency.toLocaleString('ja-JP')+'</small></div>';
      return;
    }
    busy=true;
    const one=$('pull'),ten=$('pull10');
    one.disabled=true;ten.disabled=true;
    one.classList.add('loading');ten.classList.add('loading');
    one.querySelector('span').textContent='処理中…';ten.querySelector('span').textContent='処理中…';
    try{
      resultEl.innerHTML='<div class="gacha-empty"><b>SCOUT PROCESSING</b><small>選手抽選を実行しています…</small></div>';
      const r=count===1
        ? pullOnce(save,ALL_PLAYERS,Math.random,bannerId)
        : pullMany(save,ALL_PLAYERS,count,Math.random,bannerId);
      if(!r || r.error) throw new Error(r?.error||'SCOUT_RESULT_INVALID');
      if(!r.state) throw new Error('SCOUT_STATE_INVALID');
      save=r.state;
      persist();
      updateBalance();
      const results=count===1
        ? [{result:r.result,duplicate:!!r.duplicate,duplicateReward:r.duplicateReward||0}]
        : (Array.isArray(r.results)?r.results:[]);
      if(!results.length || !results.every(x=>x?.result?.player)) throw new Error('SCOUT_RESULT_EMPTY');
      renderResults(results);
      const best=results.slice().sort((x,y)=>({S:6,A:5,B:4,C:3,D:2,F:1}[y.result.rank]||0)-({S:6,A:5,B:4,C:3,D:2,F:1}[x.result.rank]||0))[0];
      if(best?.result?.player){
        try{
          await playGachaReveal({
            rarity:best.result.rarity,
            name:best.result.player.name,
            image:best.result.player.image,
            rank:best.result.rank,
            limited:best.result.limited,
            duplicate:best.duplicate,
            banner:bannerId,
            cardType:best.result.player.cardType,
            limitedTheme:best.result.player.limitedTheme
          });
        }catch(revealErr){console.warn('gacha reveal skipped',revealErr);}
      }
    }catch(err){
      console.error('SCOUT_ERROR',err);
      const detail=String(err?.message||err||'UNKNOWN_ERROR');
      resultEl.innerHTML='<div class="gacha-error"><b>スカウト処理エラー</b><small>'+escape(detail)+'</small></div>';
    }finally{
      busy=false;
      one.disabled=false;ten.disabled=false;
      one.classList.remove('loading');ten.classList.remove('loading');
      one.querySelector('span').textContent='250 コイン';ten.querySelector('span').textContent='2,500 コイン';
    }
  }

  $('pull').onclick=()=>runPull(1);
  $('pull10').onclick=()=>runPull(10);
  $('back').onclick=()=>setMode('home');
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
  const p=lineupPlayer(0), pc=p?cardModel(p,developmentFor(save,p.id)):null;
  $('mph-away-score').textContent=match.score.away;$('mph-home-score').textContent=match.score.home;
  $('mph-count').textContent=match.inning+'回'+(batting?'表':'裏');
  $('mph-outs').textContent='●'.repeat(match.outs)+'○'.repeat(Math.max(0,3-match.outs));
  $('mph-batter').textContent=batting?(p?.name||'打者'):'AI打者';
  $('mph-rank').textContent=pc?.rank||'—';$('mph-ovr').textContent=pc?'OVR '+pc.overall:'OVR --';
  $('mph-balls').textContent='B '+match.balls;$('mph-strikes').textContent='S '+match.strikes;
  $('mph-pitches').textContent='P '+(match.pitches||0);
  document.querySelectorAll('.mph-base i').forEach(x=>x.classList.toggle('on',false));
  (match.runners||[]).forEach(r=>{const b=document.querySelector('.mph-base i[data-base="'+r.base+'"]');if(b)b.classList.add('on')});
}
function matchEvent(text,kind='normal'){
  const e=document.getElementById('mph-event');if(!e)return;
  e.textContent=text;e.className='show '+kind;clearTimeout(window.__mphEventTimer);window.__mphEventTimer=setTimeout(()=>e.className='',900);
}
function updateAimFromPointer(e){
  const rect=$('aim-area')?.getBoundingClientRect();if(!rect)return;
  aimTarget.x=((e.clientX-rect.left)/rect.width-.5)*1.5;aimTarget.y=(.5-(e.clientY-rect.top)/rect.height)*1.5;
  updateAimUI();
}
function updateAimUI(){
  const a=$('aim-cursor');if(a){a.style.left=(50+aimTarget.x*28)+'%';a.style.top=(50-aimTarget.y*28)+'%';}
}
function updateZoneUI(){const z=$('strike-zone');if(z)z.style.transform='translate(-50%,-50%) scale('+(1+Math.abs(aimTarget.x)*.05)+')';}
function choosePitchManual(type){selectedPitch=PITCHES_FOR_UI[type]?type:'FASTBALL';matchEvent('選択 '+selectedPitch,'pitch');updatePremiumHUD();}
function pitch(){
  if(match.half!=='BOTTOM'||pitchState==='pitch')return;
  pitchState='pitch';t=0;window.__pitchCount=(window.__pitchCount||0)+1;
  const pitcherPlayer=ALL_PLAYERS[0];
  const decision=choosePitch({profile:aiProfile(pitcherPlayer,developmentFor(save,pitcherPlayer.id))});
  selectedPitch=decision?.pitch||selectedPitch;
  pitchTarget={x:aimTarget.x,y:aimTarget.y};window.__lastPitch=selectedPitch;
  const pitchInfo=PITCHES[selectedPitch]||PITCHES.FASTBALL;window.__pitchVelocity=Math.round((pitchInfo.speed||90)*(0.97+Math.random()*.06));window.__pitchStart=performance.now();
  updateMatchHUD();updatePremiumHUD();matchEvent(selectedPitch,'pitch');
}
function swing(){
  if(match.half!=='TOP'||pitchState!=='pitch')return;
  const timing=Math.max(0,Math.min(1,t/1.0)), dx=Math.abs(aimTarget.x-pitchTarget.x),dy=Math.abs(aimTarget.y-pitchTarget.y);
  const p=lineupPlayer(0)||ALL_PLAYERS[4], prof=aiProfile(p,developmentFor(save,p.id));
  const contact=Math.max(.05,Math.min(.98,(prof.contact||.65)*(1-(dx+dy)*.35)));
  const outcome=resolvePitch({pitch:selectedPitch,timing,contact,power:(prof.power||.7)});
  matchEvent(outcome,'result');finishPlay(outcome);window.__hitOutcome=outcome;pitchState='hit';t=0;setFielderTarget(outcome);
}
function take(){
  if(match.half!=='TOP'||pitchState!=='pitch')return;
  const inZone=Math.abs(pitchTarget.x)<.55&&Math.abs(pitchTarget.y)<.55;
  finishPlay(inZone?'STRIKE':'BALL');pitchState='idle';ball.position.set(0,2.1,3);
}
function finishPlay(outcome){
  pitchState='idle';t=0;applyOutcome(match,outcome);
  if(outcome==='HOME_RUN')matchEvent('ホームラン！','hr');
  else if(outcome==='TRIPLE')matchEvent('TRIPLE','hit');
  else if(outcome==='DOUBLE')matchEvent('DOUBLE','hit');
  else if(outcome==='SINGLE')matchEvent('HIT','hit');
  else if(outcome==='STRIKE')matchEvent('STRIKE','strike');
  else if(outcome==='BALL')matchEvent('BALL','ball');
  updateMatchHUD();updatePremiumHUD();
}
function resetMatchView(){cameraMode='BATTER';camera.position.set(0,7.5,18);camera.lookAt(0,2,-5);aimTarget={x:0,y:0};updateAimUI();updateZoneUI();}
function aiBatterAtBat(){const batterPlayer=ALL_PLAYERS[4];const decision=chooseSwing({pitch:window.__lastPitch||'FASTBALL',profile:aiProfile(batterPlayer,developmentFor(save,batterPlayer.id))});const timing=decision.action==='TAKE'?0.2:Math.max(.05,Math.min(.98,decision.timing));const contact=decision.action==='TAKE'?0.08:decision.contact;const outcome=decision.action==='TAKE'?((Math.random()<.58)?'BALL':'STRIKE'):resolvePitch({pitch:window.__lastPitch||'FASTBALL',timing,contact,power:.75});finishPlay(outcome);if(!['BALL','STRIKE','STRIKEOUT'].includes(outcome)){window.__hitOutcome=outcome;pitchState='hit';t=0;setFielderTarget(outcome);}}
function pointerSwing(){swing();}
function setFielderTarget(outcome){
  cameraMode=outcome==='HOME_RUN'?'HOME_RUN':'FIELDING';
  const targets={SINGLE:[0,3],DOUBLE:[-7,1],TRIPLE:[11,-2],HOME_RUN:[0,18],GROUND_OUT:[4,2],FLY_OUT:[-9,0]};
  const q=targets[outcome]||[0,3];fielderTarget={x:q[0],z:q[1]};fieldingFrom={x:fielders[0].position.x,z:fielders[0].position.z};
  matchEvent(outcome==='HOME_RUN'?'HOMERUN':outcome==='GROUND_OUT'?'FIELDING':outcome==='FLY_OUT'?'FLY BALL':'IN PLAY','field');
}

/* Premium console-baseball presentation layer. Clean-room UI; no proprietary assets/code. */
function lineupPlayer(index){
  const ids=save.collection||[];
  return ids.length?ALL_PLAYERS.find(p=>p.id===ids[index%ids.length])||ALL_PLAYERS[index%ALL_PLAYERS.length]:ALL_PLAYERS[index%ALL_PLAYERS.length];
}
function miniPlayer(p,label){
  const c=cardModel(p,developmentFor(save,p.id)),img=p.image||'';
  return '<div class="lineup-slot"><b>'+label+'</b>'+(img?'<img src="'+img+'" alt="" style="width:30px;height:30px;object-fit:cover;border-radius:3px;float:left;margin-right:4px">':'')+'<strong>'+c.name+'</strong><small>'+c.rank+' · OVR '+c.overall+'</small></div>';
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
function resetMatchView(){
  ensureMatchPresentation();
  window.__pitchVelocity=0;window.__hitOutcome=null;fielderTarget=null;
  updatePremiumHUD();
  cameraMode='BATTER';
  camera.fov=52;camera.updateProjectionMatrix();
  camera.position.set(0,6.8,22.5);
  camera.lookAt(0,2.1,-7.5);
  aimTarget={x:0,y:0};updateAimUI();updateZoneUI();
  let ov=document.getElementById('match-intro');
  if(!ov){ov=document.createElement('div');ov.id='match-intro';ov.innerHTML='<div class="match-intro-kicker">BASEBALL 3D</div><strong>PLAY BALL</strong><span>1回表 · STARTING LINEUP</span>';document.body.appendChild(ov);}
  ov.classList.remove('hide');setTimeout(()=>ov.classList.add('hide'),1150);
}
function updateMatchHUD(){
  const batting=match.half==='TOP';
  const batter=lineupPlayer(0);
  $('matchhud').textContent=match.inning+'回'+(batting?'表':'裏')+'　'+match.score.away+' - '+match.score.home;
  $('inning-label').textContent=match.inning+'回'+(batting?'表':'裏');
  $('away-score').textContent=match.score.away;$('home-score').textContent=match.score.home;
  $('count-label').textContent='B'+match.balls+' S'+match.strikes+' O'+match.outs;
  $('batter-name').textContent=batting?(batter?.name||'打者'):'AI打者';
  $('pitch-readout').textContent=pitchState==='pitch'?selectedPitch:'READY';
  $('pitch').querySelector('span').textContent=batting?'投手AI':'投球';
  $('pitch').style.display=batting?'none':'block';
  document.querySelectorAll('[data-pitch]').forEach(b=>b.style.display=batting?'none':'block');
  const zone=$('strike-zone');if(zone)zone.classList.toggle('active',true);
}
const PITCHES_FOR_UI={FASTBALL:'FASTBALL',SLIDER:'SLIDER',CURVEBALL:'CURVEBALL',CHANGEUP:'CHANGEUP'}; const PITCH_CURVE={FASTBALL:0,SLIDER:.65,CURVEBALL:-.8,CHANGEUP:.35};
$('take').addEventListener('click',take);document.querySelectorAll('[data-pitch]').forEach(b=>b.addEventListener('click',()=>choosePitchManual(b.dataset.pitch)));
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{setMode(b.dataset.mode);if(b.dataset.mode==='match'){match=createMatchState();resetMatchView();updateMatchHUD();}}));
$('aim-area')?.addEventListener('pointerdown',e=>{aimDragging=true;updateAimFromPointer(e);if(match.half==='TOP'&&pitchState==='pitch')pointerSwing();$('aim-area').setPointerCapture?.(e.pointerId);});$('aim-area')?.addEventListener('pointermove',e=>{if(aimDragging)updateAimFromPointer(e);});$('aim-area')?.addEventListener('pointerup',e=>{aimDragging=false;$('aim-area').releasePointerCapture?.(e.pointerId);});$('aim-area')?.addEventListener('pointercancel',()=>aimDragging=false);document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>setMatchCamera(b.dataset.view)));
$('pitch').addEventListener('click',pitch);$('swing').addEventListener('click',swing);$('matchback').addEventListener('click',()=>setMode('home'));persist();updateProfileUI();updateAimUI();updateZoneUI();
function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}addEventListener('resize',resize);
function animate(){requestAnimationFrame(animate);animatePlayer(pitcher,pitchState==='pitch'?'pitch':'idle',pitchState==='pitch'?t:0);animatePlayer(batter,pitchState==='hit'?'swing':'idle',pitchState==='hit'?t:0);if(pitchState==='hit'&&fielderTarget){const lead=fielders[0];const dx=fielderTarget.x-lead.position.x,dz=fielderTarget.z-lead.position.z;const d=Math.hypot(dx,dz);const step=Math.min(.16,d);if(d>.1){lead.position.x+=dx/d*step;lead.position.z+=dz/d*step;animatePlayer(lead,'run',t*2)}}if(pitchState==='pitch'){t+=.018;const p=Math.min(t,1);const curve=Number(PITCH_CURVE[selectedPitch]||0);const x=pitchTarget.x*(p*p)+curve*Math.sin(Math.PI*p)*.28;const y=2.1+pitchTarget.y*(p*p)-.25*p+curve*Math.sin(Math.PI*p)*.12;ball.position.set(x,y,3-11*p);$('mph-speed')&&($('mph-speed').textContent=Math.round((window.__pitchVelocity||0))+' km/h');if(p>=1){if(match.half==='BOTTOM'){aiBatterAtBat();}else{const inZone=Math.abs(pitchTarget.x)<.55&&Math.abs(pitchTarget.y)<.55;finishPlay(inZone?'STRIKE':'BALL');}}}else if(pitchState==='hit'){t+=.018;const p=Math.min(t,1);const o=window.__hitOutcome||'SINGLE';const arc=o==='GROUND_OUT'||o==='SINGLE'?1.2:o==='DOUBLE'?4:o==='TRIPLE'?7:o==='HOME_RUN'?13:5;const lateral=o==='DOUBLE'?-7:o==='TRIPLE'?10:o==='HOME_RUN'?0:4;ball.position.set(lateral*p,2.1+arc*Math.sin(Math.PI*p)+1.2*p,-8-(o==='HOME_RUN'?26:18)*p);if(p>=1){pitchState='idle';window.__hitOutcome=null;fielderTarget=null;ball.position.set(0,2.1,3);setMatchCamera(cameraMode==='PITCHER'?'PITCHER':'BATTER')}}else if(cameraMode==='FIELDING'&&fielderTarget){camera.position.lerp(new THREE.Vector3(8,8,15),.035);camera.lookAt(fielderTarget.x,1,fielderTarget.z)}else if(cameraMode==='HOME_RUN'){camera.position.lerp(new THREE.Vector3(0,13,9),.025);camera.lookAt(0,3,-2)}renderer.render(scene,camera)}animate();
void getCloudSave().then(cloud=>{if(cloud){save={...save,currency:cloud.currency,collection:cloud.collection,team:cloud.team,progress:cloud.progress,settings:cloud.settings,matches:cloud.matches,wins:cloud.wins};saveGame(save);currency.textContent=save.unlimitedCoins?'∞':save.currency.toLocaleString("ja-JP");}}).catch(()=>{});
window.__gameReady = true;window.__gameVersion="baseball-3d-web-20260920-15-syntax-fix";