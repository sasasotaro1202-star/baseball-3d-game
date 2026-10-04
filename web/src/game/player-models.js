import * as THREE from 'three';

const geometryCache=new Map();
const materialCache=new Map();

function hash(s=''){
  let h=2166136261;
  for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}
  return h>>>0;
}
function geom(key,create){if(!geometryCache.has(key))geometryCache.set(key,create());return geometryCache.get(key);}
function mat(color,{roughness=.78,metalness=0}={}){
  const key=[color,roughness,metalness].join(':');
  if(!materialCache.has(key))materialCache.set(key,new THREE.MeshStandardMaterial({color,roughness,metalness}));
  return materialCache.get(key);
}
function box(size,key){return geom(key||('box:'+size.join(',')),()=>new THREE.BoxGeometry(...size));}
function capsule(radius,length,radial=8,segments=10,key=''){
  return geom(key||('capsule:'+radius+':'+length+':'+radial+':'+segments),()=>new THREE.CapsuleGeometry(radius,length,radial,segments));
}
function sphere(radius,ws=14,hs=10,key=''){return geom(key||('sphere:'+radius+':'+ws+':'+hs),()=>new THREE.SphereGeometry(radius,ws,hs));}
function cylinder(rt,rb,h,seg=16,key=''){return geom(key||('cyl:'+rt+':'+rb+':'+h+':'+seg),()=>new THREE.CylinderGeometry(rt,rb,h,seg));}

const SKIN_TONES=[0xd9a07e,0xe2b08b,0xc98567,0xb96f57,0xecbd9d,0x9e604f];
const HAIR_TONES=[0x17120f,0x251b16,0x3a2416,0x0c0c0c];

function createNumberBadge(number){
  if(typeof document==='undefined')return null;
  const canvas=document.createElement('canvas');canvas.width=128;canvas.height=76;
  const ctx=canvas.getContext('2d');if(!ctx)return null;
  ctx.clearRect(0,0,128,76);ctx.fillStyle='#fff';ctx.font='900 42px -apple-system,BlinkMacSystemFont,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.strokeStyle='#11151c';ctx.lineWidth=7;ctx.strokeText(String(number).padStart(2,'0'),64,39);ctx.fillStyle='#fff';ctx.fillText(String(number).padStart(2,'0'),64,39);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  return new THREE.Mesh(box([.32,.20,.01],'number-plane'),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}));
}

export function createPlayerModel({uniform=0x163a66,skin=null,scale=1,profile={}}={}){
  const g=new THREE.Group();
  const seed=Number.isFinite(Number(profile.visualSeed))?Number(profile.visualSeed):hash(profile.signature||uniform);
  const faceSeed=Math.abs(seed)%SKIN_TONES.length;
  const hairSeed=Math.abs(Math.floor(seed/7))%HAIR_TONES.length;
  const build=profile.build||'athletic',role=profile.role||'fielder',sig=profile.signature||'standard';
  const width=build==='stocky'?1.15:build==='power'?1.08:build==='lean'?.91:build==='tall'?.98:1;
  const height=Number(profile.height)||1;
  const skinTone=skin??SKIN_TONES[faceSeed],hairTone=HAIR_TONES[hairSeed];
  const limbBias=1+(Math.abs(Math.floor(seed/13))%9-4)*.018;
  const shoulder=width*(1+(Math.abs(Math.floor(seed/19))%6)*.015);

  const pants=mat(0x151a21,{roughness:.88}),uniformMat=mat(uniform,{roughness:.73}),skinMat=mat(skinTone,{roughness:.84});
  const shoeMat=mat(0x090c10,{roughness:.58}),hairMat=mat(hairTone,{roughness:.9}),gloveMat=mat(0x6f4328,{roughness:.96});

  const pelvis=new THREE.Mesh(capsule(.34*width,.32,7,9,'pelvis:'+width.toFixed(3)),pants);pelvis.scale.y=1.05;pelvis.position.y=.76;g.add(pelvis);
  const torso=new THREE.Mesh(capsule(.41*width,.72,8,11,'torso:'+width.toFixed(3)),uniformMat);torso.position.y=1.32;g.add(torso);
  const chest=new THREE.Mesh(sphere(.46,16,10,'chest:'+width.toFixed(3)),uniformMat);chest.scale.set(shoulder,.82,.73);chest.position.y=1.43;g.add(chest);
  const neck=new THREE.Mesh(cylinder(.13,.145,.17,10,'neck:'+skinTone),skinMat);neck.position.y=1.82;g.add(neck);
  const head=new THREE.Mesh(sphere(.275,18,14,'head:'+faceSeed),skinMat);head.scale.set(1+(Math.abs(seed)%7)*.011,1+(Math.abs(Math.floor(seed/3))%5)*.012,1);head.position.y=2.04;g.add(head);
  for(const x of [-.24,.24]){const ear=new THREE.Mesh(sphere(.052,8,8,'ear:'+faceSeed),skinMat);ear.position.set(x,2.03,.02);g.add(ear);}
  const nose=new THREE.Mesh(cylinder(.035,.07,.115,6,'nose:'+faceSeed),skinMat);nose.rotation.x=Math.PI/2;nose.position.set(0,2.01,.274);g.add(nose);
  const hair=new THREE.Mesh(sphere(.276,14,9,'hair:'+hairSeed),hairMat);hair.scale.set(1.01,.46,1.01);hair.position.set(0,2.18,-.035);g.add(hair);
  const cap=new THREE.Mesh(cylinder(.30,.31,.12,18,'cap:'+uniform),uniformMat);cap.position.y=2.285;g.add(cap);
  const brim=new THREE.Mesh(cylinder(.30,.12,.038,18,'brim:'+uniform),uniformMat);brim.scale.set(1,.68,1);brim.position.set(0,2.245,.17);g.add(brim);
  if(role==='batter'){const guard=new THREE.Mesh(capsule(.09,.14,6,8,'guard:'+uniform),uniformMat);guard.position.set(profile.batting==='left'?-.23:.23,2.08,.07);g.add(guard);}
  for(const x of [-.098,.098]){const eye=new THREE.Mesh(sphere(.022,6,6,'eye:'+faceSeed),mat(0x111111,{roughness:.7}));eye.position.set(x,2.045,.255);g.add(eye);}

  const armL=new THREE.Group();armL.position.set(-.47*shoulder,1.48,0);g.add(armL);
  const sleeveL=new THREE.Mesh(capsule(.12,.29,6,8,'sleeve:'+width.toFixed(3)),uniformMat);sleeveL.position.y=-.11;armL.add(sleeveL);
  const foreL=new THREE.Mesh(capsule(.095,.43,6,8,'fore:'+Math.round(limbBias*100)),skinMat);foreL.position.y=-.42;armL.add(foreL);
  const handL=new THREE.Mesh(sphere(.11,10,8,'hand:'+faceSeed),skinMat);handL.position.y=-.69;armL.add(handL);
  const armR=armL.clone();armR.position.x=.47*shoulder;g.add(armR);

  const makeLeg=(side)=>{
    const leg=new THREE.Group();leg.position.set(side*.185*width,.76,0);
    const thigh=new THREE.Mesh(capsule(.135,.47,6,8,'thigh:'+width.toFixed(3)),pants);thigh.position.y=-.25;leg.add(thigh);
    const shin=new THREE.Mesh(capsule(.11,.42,6,8,'shin:'+width.toFixed(3)),pants);shin.position.y=-.70;leg.add(shin);
    const sock=new THREE.Mesh(cylinder(.12,.13,.20,10,'sock:'+uniform),mat(0xf4f4f0,{roughness:.9}));sock.position.y=-.93;leg.add(sock);
    const shoe=new THREE.Mesh(box([.27,.12,.44],'shoe:'+side),shoeMat);shoe.position.set(0,-1.04,.055);leg.add(shoe);
    return leg;
  };
  const legL=makeLeg(-1),legR=makeLeg(1);g.add(legL,legR);

  const belt=new THREE.Mesh(box([.70*width,.085,.46],'belt:'+width.toFixed(3)),mat(0x11151c,{roughness:.62}));belt.position.y=.83;g.add(belt);
  const stripeColor=new THREE.Color(uniform);stripeColor.offsetHSL(0,0,-.14);
  const stripeMat=mat(stripeColor.getHex(),{roughness:.73});
  for(const x of [-.47,.47]){const band=new THREE.Mesh(cylinder(.126,.126,.045,12,'armband:'+width.toFixed(3)),stripeMat);band.rotation.z=Math.PI/2;band.position.set(x*shoulder,1.44,.005);g.add(band);}

  if(role!=='batter'){const glove=new THREE.Mesh(sphere(.13,10,8,'glove:'+faceSeed),gloveMat);glove.scale.set(1.15,.72,.95);glove.position.set(-.62*shoulder,1.03,.11);g.add(glove);}
  if(profile.jerseyNumber!=null){const badge=createNumberBadge(profile.jerseyNumber);if(badge){badge.position.set(0,1.39,-.725);badge.rotation.y=Math.PI;g.add(badge);}}

  g.scale.setScalar(scale*height);
  g.userData.base={armL,armR,legL,legR};g.userData.profile={...profile,visualSeed:seed};g.userData.identity={signature:sig,visualSeed:seed};
  if(profile.batting==='left')g.rotation.y=Math.PI*.06;
  if(profile.batting==='right')g.rotation.y=-Math.PI*.06;
  return g;
}

export function animatePlayer(model,type,t){
  if(!model?.userData.base)return;
  const {armL,armR,legL,legR}=model.userData.base;
  const p=Math.max(0,Math.min(1,t)),sig=model.userData.profile?.signature;
  if(type==='pitch'){
    const w=Math.sin(p*Math.PI);armR.rotation.z=.35-w*(sig==='ohtani'?1.9:1.7);armR.rotation.x=w*(sig==='ruth'?.9:1.1);legL.rotation.x=w*.65;legR.rotation.x=-w*.35;armL.rotation.x=-w*.25;
  }else if(type==='swing'){
    const s=Math.sin(p*Math.PI),wide=sig==='ruth'?.9:sig==='ichiro'?.62:1;armL.rotation.y=-s*1.4*wide;armR.rotation.y=s*1.4*wide;armL.rotation.z=-.35-s*.7;armR.rotation.z=.35+s*.7;legL.rotation.z=s*.18;legR.rotation.z=-s*.18;
  }else if(type==='run'){
    const s=Math.sin(p*Math.PI*2),speed=sig==='ichiro'||sig==='cobb'?1.15:1;legL.rotation.x=s*.8*speed;legR.rotation.x=-s*.8*speed;armL.rotation.x=-s*.55*speed;armR.rotation.x=s*.55*speed;
  }else if(type==='catch'){
    const s=Math.sin(p*Math.PI);armL.rotation.x=-s*.9;armR.rotation.x=-s*.9;armL.rotation.z=-.65;armR.rotation.z=.65;
  }else if(type==='throw'){
    const s=Math.sin(p*Math.PI),snap=Math.sin(Math.min(1,p)*Math.PI*1.4);armR.rotation.z=.35-snap*1.65;armR.rotation.x=s*1.25;armL.rotation.z=-.35+s*.25;legL.rotation.x=-s*.18;legR.rotation.x=s*.18;
  }else{
    armL.rotation.set(0,-.1,-.35);armR.rotation.set(0,.1,.35);legL.rotation.x=0;legR.rotation.x=0;armL.rotation.x=0;armR.rotation.x=0;
  }
}
