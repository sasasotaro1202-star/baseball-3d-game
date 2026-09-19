import * as THREE from 'three';

const SKIN={light:0xf0b79a,medium:0xc98262,dark:0x70412f};
export function createPlayerModel({uniform=0x163a66,skin=SKIN.medium,scale=1,profile={}}={}){
  const g=new THREE.Group();
  const mat=(color,roughness=.78)=>new THREE.MeshStandardMaterial({color,roughness});
  const body=new THREE.Mesh(new THREE.CapsuleGeometry(.42,.95,8,12),mat(uniform));body.position.y=1.18;g.add(body);
  const chest=new THREE.Mesh(new THREE.SphereGeometry(.46,16,10),mat(uniform));chest.scale.set(1,.78,.72);chest.position.y=1.35;g.add(chest);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.27,18,14),mat(skin));head.position.y=1.98;g.add(head);
  const cap=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.12,18),mat(uniform));cap.position.y=2.23;g.add(cap);
  const brim=new THREE.Mesh(new THREE.CylinderGeometry(.3,.12,.035,18),mat(uniform));brim.scale.set(1,.7,1);brim.position.set(0,2.19,.18);g.add(brim);
  const armL=new THREE.Mesh(new THREE.CapsuleGeometry(.11,.62,6,9),mat(uniform));armL.position.set(-.5,1.32,0);armL.rotation.z=-.35;g.add(armL);
  const armR=armL.clone();armR.position.x=.5;armR.rotation.z=.35;g.add(armR);
  const legL=new THREE.Mesh(new THREE.CapsuleGeometry(.13,.72,6,9),mat(0x17202b));legL.position.set(-.2,.48,0);g.add(legL);
  const legR=legL.clone();legR.position.x=.2;g.add(legR);
  const belt=new THREE.Mesh(new THREE.BoxGeometry(.7,.08,.45),mat(0x11151c));belt.position.y=.78;g.add(belt);
  g.scale.setScalar(scale);
  g.userData.base={armL,armR,legL,legR};
  g.userData.profile={...profile};
  return g;
}
export function animatePlayer(model,type,t){
  if(!model?.userData.base)return;
  const {armL,armR,legL,legR}=model.userData.base,p=Math.max(0,Math.min(1,t));
  if(type==='pitch'){const w=Math.sin(p*Math.PI);armR.rotation.z=.35-w*1.7;armR.rotation.x=w*1.1;legL.rotation.x=w*.65;legR.rotation.x=-w*.35}
  else if(type==='swing'){const s=Math.sin(p*Math.PI);armL.rotation.y=-s*1.4;armR.rotation.y=s*1.4;armL.rotation.z=-.35-s*.7;armR.rotation.z=.35+s*.7;legL.rotation.z=s*.18;legR.rotation.z=-s*.18}
  else if(type==='run'){const s=Math.sin(p*Math.PI*2);legL.rotation.x=s*.8;legR.rotation.x=-s*.8;armL.rotation.x=-s*.55;armR.rotation.x=s*.55}
  else {armL.rotation.set(0,-.1,-.35);armR.rotation.set(0,.1,.35);legL.rotation.x=0;legR.rotation.x=0}
}