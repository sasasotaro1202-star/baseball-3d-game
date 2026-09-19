import * as THREE from 'three';
import {HISTORIC_PLAYERS} from './data/players.js';
import {pullOnce} from './game/gacha-service.js';
import {createMatchState,resolvePitch,applyOutcome} from './game/simulation.js';
import {loadSave,saveGame} from './game/save.js';
import {modeLabel} from './game/ui.js';
import {getCloudSave,putCloudSave,getCloudUser,signInWithMagicLink,signOutCloud} from './game/cloud-save.js';

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

let save=loadSave(); let match=createMatchState(); let pitchState='idle',t=0;
const $=id=>document.getElementById(id); const homeUI=$('home'),viewUI=$('view'),card=$('card'),matchUI=$('match-ui'),currency=$('currency');
function persist(){saveGame(save);currency.textContent=save.currency.toLocaleString('ja-JP');void putCloudSave(save).catch(()=>{});}
function setMode(mode){
  homeUI.classList.toggle('hidden',mode!=='home'); viewUI.classList.toggle('hidden',mode==='home'||mode==='match'); matchUI.classList.toggle('hidden',mode!=='match');
  if(mode!=='match') renderer.domElement.style.opacity='0.35'; else renderer.domElement.style.opacity='1';
  if(mode==='home')return;
  if(mode==='gacha')renderGacha(); else if(mode==='roster')renderCard('オーダー','スタメン・投手・ベンチを管理する画面。今後、守備適性・コンディション・交代戦略を統合します。');
  else if(mode==='training')renderCard('育成','選手の能力成長、経験値、特殊能力を管理します。');
  else if(mode==='collection')renderCollection(); else if(mode==='settings')renderSettings();
}
function renderCard(title,body){card.innerHTML='<h2>'+title+'</h2><p>'+body+'</p><button class="action back" id="back">ホームへ戻る</button>'; $('back').onclick=()=>setMode('home');}
async function renderSettings(){
  const user=await getCloudUser();
  card.innerHTML='<h2>設定</h2><p>ローカル保存に加えて、Supabaseクラウドセーブを利用できます。</p><p class="small">'+(user?'クラウド: 接続中':'クラウド: 未ログイン')+'</p>'+(user?'<button class="action" id="cloudLogout">クラウドからログアウト</button>':'<div class="row"><input id="cloudEmail" type="email" placeholder="メールアドレス" style="flex:2;padding:14px;border-radius:14px;border:1px solid #ffffff25;background:#101d2d;color:#fff"><button class="action" id="cloudLogin">ログインリンク</button></div>')+'<button class="action back" id="back">ホームへ戻る</button>';
  $('back').onclick=()=>setMode('home');
  if(user) $('cloudLogout').onclick=async()=>{await signOutCloud();renderSettings();};
  else $('cloudLogin').onclick=async()=>{const email=$('cloudEmail').value.trim();if(!email)return;const {error}=await signInWithMagicLink(email);if(error)alert(error.message);else alert('ログインリンクをメールに送信しました。');};
}
function renderCollection(){const names=save.collection.map(id=>HISTORIC_PLAYERS.find(p=>p.id===id)?.name).filter(Boolean);card.innerHTML='<h2>選手名鑑</h2><p>獲得 '+names.length+' 名</p><p class="small">'+(names.length?names.join(' / '):'まだ選手がいません')+'</p><button class="action back" id="back">ホームへ戻る</button>';$('back').onclick=()=>setMode('home');}
function renderGacha(){card.innerHTML='<h2>スカウト</h2><p>1回 250コイン</p><div id="reveal" class="reveal">—</div><div class="row"><button class="action" id="pull">スカウトする</button><button class="action" id="back">戻る</button></div>';$('pull').onclick=()=>{const r=pullOnce(save,HISTORIC_PLAYERS);if(r.error){$('reveal').textContent='コイン不足';return}save=r.state;persist();\nvoid getCloudSave().then(cloud=>{if(cloud){save={...save,currency:cloud.currency,collection:cloud.collection,team:cloud.team,progress:cloud.progress,settings:cloud.settings,matches:cloud.matches,wins:cloud.wins};persist();}}).catch(()=>{});$('reveal').textContent=r.result.rarity+'　'+r.result.player.name;};$('back').onclick=()=>setMode('home');}
function updateMatchHUD(){$('matchhud').textContent=`${match.inning}回${match.half==='TOP'?'表':'裏'}　${match.score.away} - ${match.score.home}　${match.outs} OUT　${match.balls}-${match.strikes}`;}
function pitch(){if(pitchState!=='idle'||match.ended)return;pitchState='pitch';t=0;}
function swing(){if(pitchState!=='pitch')return;pitchState='hit';t=0;const outcome=resolvePitch({timing:.55,contact:.82});match=applyOutcome(match,outcome);updateMatchHUD();}
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{setMode(b.dataset.mode);if(b.dataset.mode==='match'){match=createMatchState();updateMatchHUD();}}));
$('pitch').addEventListener('click',pitch);$('swing').addEventListener('click',swing);$('matchback').addEventListener('click',()=>setMode('home'));persist();
function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}addEventListener('resize',resize);
function animate(){requestAnimationFrame(animate);if(pitchState==='pitch'){t+=.018;const p=Math.min(t,1);ball.position.set(0,2.1-.25*p,3-11*p);if(p>=1){match=applyOutcome(match,resolvePitch({timing:.45,contact:.7}));updateMatchHUD();pitchState='idle';ball.position.set(0,2.1,3)}}else if(pitchState==='hit'){t+=.018;const p=Math.min(t,1);ball.position.set(4*p,2.1+7*p-5*p*p,-8-18*p);if(p>=1){pitchState='idle';ball.position.set(0,2.1,3)}}renderer.render(scene,camera)}animate();\nvoid getCloudSave().then(cloud=>{if(cloud){save={...save,currency:cloud.currency,collection:cloud.collection,team:cloud.team,progress:cloud.progress,settings:cloud.settings,matches:cloud.matches,wins:cloud.wins};saveGame(save);currency.textContent=save.currency.toLocaleString("ja-JP");}}).catch(()=>{});\nwindow.__gameReady=true;window.__gameVersion="baseball-3d-web-20260920-01";