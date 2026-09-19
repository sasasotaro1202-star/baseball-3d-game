import * as THREE from 'three';

export function createPlayerModel({uniform=0x163a66,skin=0xc98b72,scale=1}={}){
  const g=new THREE.Group();
  const mat=(color)=>new THREE.MeshStandardMaterial({color,roughness:.78});
  const body=new THREE.Mesh(new THREE.CapsuleGeometry(.42,.95,6,10),mat(uniform)); body.position.y=1.18; g.add(body);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.27,16,12),mat(skin)); head.position.y=1.98; g.add(head);
  const cap=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.12,16),mat(uniform)); cap.position.y=2.23; g.add(cap);
  const armL=new THREE.Mesh(new THREE.CapsuleGeometry(.11,.62,5,8),mat(uniform)); armL.position.set(-.5,1.32,0); armL.rotation.z=-.35; g.add(armL);
  const armR=armL.clone(); armR.position.x=.5; armR.rotation.z=.35; g.add(armR);
  const legL=new THREE.Mesh(new THREE.CapsuleGeometry(.13,.72,5,8),mat(0x17202b)); legL.position.set(-.2,.48,0); g.add(legL);
  const legR=legL.clone(); legR.position.x=.2; g.add(legR);
  g.scale.setScalar(scale);
  g.userData.base={armL,armR,legL,legR};
  return g;
}
export function animatePlayer(model,type,t){
  if(!model?.userData.base)return;
  const {armL,armR,legL,legR}=model.userData.base;
  const p=Math.max(0,Math.min(1,t));
  if(type==='pitch'){
    const w=Math.sin(p*Math.PI);
    armR.rotation.z=.35-w*1.7; armR.rotation.x=w*1.1;
    legL.rotation.x=w*.65; legR.rotation.x=-w*.35;
  }else if(type==='swing'){
    const s=Math.sin(p*Math.PI);
    armL.rotation.y=-s*1.4; armR.rotation.y=s*1.4;
    armL.rotation.z=-.35-s*.7; armR.rotation.z=.35+s*.7;
    legL.rotation.z=s*.18; legR.rotation.z=-s*.18;
  }else if(type==='run'){
    const s=Math.sin(p*Math.PI*2);
    legL.rotation.x=s*.8; legR.rotation.x=-s*.8;
    armL.rotation.x=-s*.55; armR.rotation.x=s*.55;
  }else{
    armL.rotation.set(0,-.1,-.35); armR.rotation.set(0,.1,.35);
    legL.rotation.x=0; legR.rotation.x=0;
  }
}