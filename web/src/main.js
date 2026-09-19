import * as THREE from 'three';
import {ALL_PLAYERS} from './data/players.js';
import {pullOnce} from './game/gacha-service.js';
import {createMatchState,resolvePitch,applyOutcome} from './game/simulation.js';
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
let fieldingFrom={x:0,z:0};let fielderTarget=null;

let save=loadSave(); let match=createMatchState(); let pitchState='idle',t=0; let selectedPitch='FASTBALL'; let pitchStart=0; let swingWindowOpen=false;
const $=id=>document.getElementById(id); const homeUI=$('home'),viewUI=$('view'),card=$('card'),matchUI=$('match-ui'),currency=$('currency');
function updateProfileUI(){const count=save.collection.length;const power=save.collection.reduce((sum,id)=>{const p=ALL_PLAYERS.find(x=>x.id===id);return sum+(p?Math.round(((p.power||70)+(p.contact||70)+(p.field||70)+(p.control||70))/4):0)},0);$('record').textContent=`${save.wins}勝 ${save.matches}試合`;$('roster-count').textContent=count;$('team-power').textContent=count?Math.round(power/count):'—';}
function playerCards(){
  return save.collection.map(id=>ALL_PLAYERS.find(p=>p.id===id)).filter(Boolean).map(p=>{
    const c=cardModel(p,developmentFor(save,p.id));
    const image=p.image||'';
    const abilities=c.abilities.slice(0,4).map(a=>'<span class="ability-chip '+(a.kind==='special'?'ability-special':'')+'">'+a.name+' '+a.ratePercent+'%</span>').join('');
    return '<div class="player-card compact-player" data-player-id="'+p.id+'">'+
      '<div class="player-portrait"><span class="rank-badge">'+c.rank+'</span>'+(image?'<img src="'+image+'" alt="'+p.name+'" loading="lazy">':'<div class="portrait-fallback"><span>'+p.name.split(' ').map(x=>x[0]).join('').slice(0,3)+'</span></div>')+'</div>'+
      '<div class="player-head"><strong>'+c.name+'</strong><b>OVR '+c.overall+'</b></div>'+
      '<span class="player-meta">'+c.pos+' · '+c.era+'</span>'+
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
function persist(){saveGame(save);currency.textContent=save.unlimitedCoins?'∞':save.currency.toLocaleString('ja-JP');updateProfileUI();void putCloudSave(save).catch(()=>{});}
function setMode(mode){
  homeUI.classList.toggle('hidden',mode!=='home'); viewUI.classList.toggle('hidden',mode==='home'||mode==='match'); matchUI.classList.toggle('hidden',mode!=='match');
  if(mode!=='match') renderer.domElement.style.opacity='0.35'; else renderer.domElement.style.opacity='1';
  if(mode==='home')return;
  if(mode==='gacha')renderGacha(); else if(mode==='roster')renderRoster();
  else if(mode==='training')renderTraining();
  else if(mode==='collection')renderCollection(); else if(mode==='settings')renderSettings();
}
function bindPlayerCards(){card.querySelectorAll('[data-player-id]').forEach(b=>b.onclick=()=>showPlayer3D(b.dataset.playerId));card.querySelectorAll('.release-player').forEach(b=>b.onclick=e=>{e.stopPropagation();const p=ALL_PLAYERS.find(x=>x.id===Number(b.dataset.id));if(!p)return;if(!confirm(p.name+'を放出しますか？'))return;const r=releasePlayer(save,p);if(r.error)return;save=r.state;persist();renderRoster();});}
function renderRoster(){const cards=playerCards()||'<p>まずスカウトで選手を獲得してください。</p>';card.innerHTML=`<h2>オーダー</h2><p>所持選手からスタメン・ベンチを組みます。</p><h3>MY PLAYERS</h3><div class="player-grid">${cards}</div><button class="action back" id="back">ホームへ戻る</button>`;$('back').onclick=()=>setMode('home');bindPlayerCards();}
function renderTraining(){
  const players=save.collection.map(id=>ALL_PLAYERS.find(p=>p.id===id)).filter(Boolean);
  card.innerHTML='<h2>育成</h2><p>無料・コイン無制限。能力上昇は選手ごとに保存されます。</p><div class="player-grid">'+(players.map(p=>{
    const d=developmentFor(save,p.id),c=cardModel(p,d);
    return '<div class="player-card"><div class="player-portrait"><div class="portrait-fallback"><span>'+p.name.split(' ').map(x=>x[0]).join('').slice(0,3)+'</span><small>LV '+d.level+'</small></div></div><strong>'+c.name+'</strong><span>OVR '+c.overall+' · XP '+d.xp+'</span><div class="row"><button class="action train" data-id="'+p.id+'" data-focus="contact">打撃</button><button class="action train" data-id="'+p.id+'" data-focus="power">パワー</button><button class="action train" data-id="'+p.id+'" data-focus="field">守備</button></div></div>';
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
function renderCollection(){const names=save.collection.map(id=>ALL_PLAYERS.find(p=>p.id===id)?.name).filter(Boolean);card.innerHTML='<h2>選手名鑑</h2><p>獲得 '+names.length+' 名 / 全選手データは順次拡張</p><div class="player-grid">'+(playerCards()||'<p>まだ選手がいません</p>')+'</div><button class="action back" id="back">ホームへ戻る</button>';$('back').onclick=()=>setMode('home');bindPlayerCards();}
function renderGacha(){card.innerHTML='<h2>スカウト</h2><p>無料・コイン無制限</p><div id="reveal" class="reveal">—</div><div class="row"><button class="action" id="pull">スカウトする</button><button class="action" id="back">戻る</button></div>';$('pull').onclick=()=>{const r=pullOnce(save,ALL_PLAYERS);if(r.error){$('reveal').textContent='コイン不足';return}save=r.state;persist();void playGachaReveal({rarity:r.result.rarity,name:r.result.player.name});
void getCloudSave().then(cloud=>{if(cloud){save={...save,currency:cloud.currency,collection:cloud.collection,team:cloud.team,progress:cloud.progress,settings:cloud.settings,matches:cloud.matches,wins:cloud.wins};persist();}}).catch(()=>{});$('reveal').textContent=r.result.rarity+'　'+r.result.player.name+(r.duplicate?'　重複→'+r.duplicateReward+'コイン':'');};$('back').onclick=()=>setMode('home');}
function updateMatchHUD(){const batting=match.half==='TOP';$('matchhud').textContent=`${match.inning}回${batting?'表':'裏'}　${match.score.away} - ${match.score.home}`;$('inning-label').textContent=`${match.inning}回${batting?'表':'裏'}`;$('away-score').textContent=match.score.away;$('home-score').textContent=match.score.home;$('count-label').textContent=`B ${match.balls} / S ${match.strikes} / O ${match.outs}`;$('batter-name').textContent=batting?'Shohei Ohtani':'Batter';$('pitch-readout').textContent=pitchState==='pitch'?selectedPitch:'READY';$('pitch').textContent=batting?'投球開始':'投球';$('swing').textContent=batting?'スイング':'守備を操作';$('take').textContent=batting?'見送る':'配球';}
function finishPlay(outcome){match=applyOutcome(match,outcome);updateMatchHUD();$('pitch-readout').textContent=outcome;if(['SINGLE','DOUBLE','TRIPLE','HOME_RUN'].includes(outcome)){fielderTarget={x:(Math.random()-.5)*18,z:Math.random()*16+2};fieldingFrom={x:0,z:0};}const type=outcome==='HOME_RUN'?'home_run':outcome==='DOUBLE'?'double':outcome==='TRIPLE'?'triple':outcome==='SINGLE'?'single':outcome==='OUT'?'out':outcome==='STRIKE'?'strikeout':outcome==='BALL'?'walk':'play';void playMatchEvent(type,outcome);pitchState='idle';t=0;window.__lastPitch=null;updateMatchHUD();}
function pitch(){if(pitchState!=='idle'||match.ended)return;if(match.half==='TOP'){pitchState='pitch';t=0;pitchStart=performance.now();swingWindowOpen=true;const pitcherPlayer=ALL_PLAYERS[0];selectedPitch=choosePitch({count:[match.balls,match.strikes],profile:aiProfile(pitcherPlayer,developmentFor(save,pitcherPlayer.id))});window.__lastPitch=selectedPitch;$('pitch-readout').textContent=selectedPitch;void playMatchEvent('pitch',selectedPitch);}else{pitchState='pitch';t=0;pitchStart=performance.now();swingWindowOpen=false;window.__lastPitch=selectedPitch;$('pitch-readout').textContent=selectedPitch;void playMatchEvent('pitch',selectedPitch);}}
function swing(){if(pitchState!=='pitch'||match.ended||match.half!=='TOP')return;const timing=Math.max(0,Math.min(1,t));const sweet=Math.max(0,1-Math.abs(timing-.88)*4.2);const contact=Math.max(.1,Math.min(1,sweet));const outcome=resolvePitch({pitch:window.__lastPitch||'FASTBALL',timing,contact,power:.75});pitchState='hit';t=0;finishPlay(outcome);}
function take(){if(pitchState!=='pitch'||match.ended||match.half!=='TOP')return;const timing=Math.max(0,Math.min(1,t));const inZone=timing>.52&&timing<.94;finishPlay(inZone?(Math.random()<.55?'STRIKE':'BALL'):'BALL');}
function choosePitchManual(type){if(pitchState!=='idle'||match.ended||match.half!=='BOTTOM')return;selectedPitch=type;$('pitch-readout').textContent=type;}
const PITCHES_FOR_UI={FASTBALL:'FASTBALL',SLIDER:'SLIDER',CURVEBALL:'CURVEBALL',CHANGEUP:'CHANGEUP'};
$('take').addEventListener('click',take);document.querySelectorAll('[data-pitch]').forEach(b=>b.addEventListener('click',()=>choosePitchManual(b.dataset.pitch)));
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{setMode(b.dataset.mode);if(b.dataset.mode==='match'){match=createMatchState();updateMatchHUD();}}));
$('pitch').addEventListener('click',pitch);$('swing').addEventListener('click',swing);$('matchback').addEventListener('click',()=>setMode('home'));persist();updateProfileUI();
function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}addEventListener('resize',resize);
function animate(){requestAnimationFrame(animate);animatePlayer(pitcher,pitchState==='pitch'?'pitch':'idle',pitchState==='pitch'?t:0);animatePlayer(batter,pitchState==='hit'?'swing':'idle',pitchState==='hit'?t:0);if(pitchState==='hit'&&fielderTarget){const lead=fielders[0];const dx=fielderTarget.x-lead.position.x,dz=fielderTarget.z-lead.position.z;const d=Math.hypot(dx,dz);const step=Math.min(.12,d);if(d>.1){lead.position.x+=dx/d*step;lead.position.z+=dz/d*step;animatePlayer(lead,'run',t*2)}}if(pitchState==='pitch'){t+=.018;const p=Math.min(t,1);ball.position.set(0,2.1-.25*p,3-11*p);if(p>=1){const missedSwing=Math.random()<.55; if(missedSwing){const outcome=Math.random()<.62?'STRIKE':'BALL';match=applyOutcome(match,outcome);updateMatchHUD();$('pitch-readout').textContent=outcome;void playMatchEvent(outcome==='STRIKE'?'strikeout':'walk',outcome);} pitchState='idle';ball.position.set(0,2.1,3)}}else if(pitchState==='hit'){t+=.018;const p=Math.min(t,1);ball.position.set(4*p,2.1+7*p-5*p*p,-8-18*p);if(p>=1){pitchState='idle';ball.position.set(0,2.1,3)}}renderer.render(scene,camera)}animate();
void getCloudSave().then(cloud=>{if(cloud){save={...save,currency:cloud.currency,collection:cloud.collection,team:cloud.team,progress:cloud.progress,settings:cloud.settings,matches:cloud.matches,wins:cloud.wins};saveGame(save);currency.textContent=save.unlimitedCoins?'∞':save.currency.toLocaleString("ja-JP");}}).catch(()=>{});
window.__gameReady=true;window.__gameVersion="baseball-3d-web-20260920-03";