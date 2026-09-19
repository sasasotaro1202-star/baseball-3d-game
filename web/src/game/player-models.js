import * as THREE from 'three';
function hash(s=''){let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
export function createPlayerModel({uniform=0x163a66,skin=0xc98262,scale=1,profile={}}={}){
 const g=new THREE.Group(),mat=(color,roughness=.78)=>new THREE.MeshStandardMaterial({color,roughness});
 const build=profile.build||'athletic',sig=profile.signature||'standard',h=hash(sig);
 const width=build==='stocky'?1.16:build==='power'?1.08:build==='lean'?.88:1;
 const height=profile.height||1;
 const body=new THREE.Mesh(new THREE.CapsuleGeometry(.42*width,.95,8,12),mat(uniform));body.position.y=1.18;g.add(body);
 const chest=new THREE.Mesh(new THREE.SphereGeometry(.46,16,10),mat(uniform));chest.scale.set(width,.78,.72);chest.position.y=1.35;g.add(chest);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.27,18,14),mat(skin));head.scale.set(1+(h%7)*.012,1+((h>>3)%6)*.012,1);head.position.y=1.98;g.add(head);
 const nose=new THREE.Mesh(new THREE.ConeGeometry(.055,.12,6),mat(skin));nose.rotation.x=Math.PI/2;nose.position.set(0,1.98,.27);g.add(nose);
 const hair=new THREE.Mesh(new THREE.SphereGeometry(.275,14,8),mat((h%2)?0x17120f:0x251b16));hair.scale.set(1,.42,1);hair.position.set(0,2.13,-.03);g.add(hair);
 const cap=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.12,18),mat(uniform));cap.position.y=2.23;g.add(cap);
 const brim=new THREE.Mesh(new THREE.CylinderGeometry(.3,.12,.035,18),mat(uniform));brim.scale.set(1,.7,1);brim.position.set(0,2.19,.18);g.add(brim);
 const eyeL=new THREE.Mesh(new THREE.SphereGeometry(.025,6,6),mat(0x111111));eyeL.position.set(-.095,2.02,.255);g.add(eyeL);
 const eyeR=eyeL.clone();eyeR.position.x=.095;g.add(eyeR);
 const armL=new THREE.Mesh(new THREE.CapsuleGeometry(.11,.62,6,9),mat(uniform));armL.position.set(-.5*width,1.32,0);armL.rotation.z=-.35;g.add(armL);
 const armR=armL.clone();armR.position.x=.5*width;armR.rotation.z=.35;g.add(armR);
 const legL=new THREE.Mesh(new THREE.CapsuleGeometry(.13,.72,6,9),mat(0x17202b));legL.position.set(-.2*width,.48,0);g.add(legL);
 const legR=legL.clone();legR.position.x=.2*width;g.add(legR);
 const belt=new THREE.Mesh(new THREE.BoxGeometry(.7*width,.08,.45),mat(0x11151c));belt.position.y=.78;g.add(belt);
 const number=new THREE.Mesh(new THREE.PlaneGeometry(.22,.14),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.9}));number.position.set(0,1.35,-.73);number.rotation.y=Math.PI;g.add(number);
 g.scale.setScalar(scale*height);g.userData.base={armL,armR,legL,legR};g.userData.profile=profile;g.userData.identity={signature:sig,visualSeed:h};
 if(profile.batting==='left')g.rotation.y=Math.PI*.06;if(profile.batting==='right')g.rotation.y=-Math.PI*.06;return g;
}
export function animatePlayer(model,type,t){if(!model?.userData.base)return;const{armL,armR,legL,legR}=model.userData.base,p=Math.max(0,Math.min(1,t)),sig=model.userData.profile?.signature;if(type==='pitch'){const w=Math.sin(p*Math.PI);armR.rotation.z=.35-w*(sig==='ohtani'?1.9:1.7);armR.rotation.x=w*(sig==='ruth'?.9:1.1);legL.rotation.x=w*.65;legR.rotation.x=-w*.35}else if(type==='swing'){const s=Math.sin(p*Math.PI),wide=sig==='ruth'?.9:sig==='ichiro'?.62:1;armL.rotation.y=-s*1.4*wide;armR.rotation.y=s*1.4*wide;armL.rotation.z=-.35-s*.7;armR.rotation.z=.35+s*.7;legL.rotation.z=s*.18;legR.rotation.z=-s*.18}else if(type==='run'){const s=Math.sin(p*Math.PI*2),speed=sig==='ichiro'||sig==='cobb'?1.15:1;legL.rotation.x=s*.8*speed;legR.rotation.x=-s*.8*speed;armL.rotation.x=-s*.55*speed;armR.rotation.x=s*.55*speed}else{armL.rotation.set(0,-.1,-.35);armR.rotation.set(0,.1,.35);legL.rotation.x=0;legR.rotation.x=0}}
