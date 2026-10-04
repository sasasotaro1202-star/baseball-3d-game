const DEFAULT_ICE_SERVERS=[
  {urls:["stun:stun.l.google.com:19302"]},
  {urls:["stun:stun.cloudflare.com:3478"]}
];

function bytesToBase64(bytes){
  if(typeof Buffer!=="undefined")return Buffer.from(bytes).toString("base64");
  let binary="";
  for(const byte of bytes)binary+=String.fromCharCode(byte);
  return btoa(binary);
}
function base64ToBytes(value){
  if(typeof Buffer!=="undefined")return new Uint8Array(Buffer.from(value,"base64"));
  const binary=atob(value);
  const out=new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++)out[i]=binary.charCodeAt(i);
  return out;
}
function toBase64Url(value){
  return bytesToBase64(new TextEncoder().encode(value)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}
function fromBase64Url(value){
  const normalized=String(value||"").replace(/-/g,"+").replace(/_/g,"/");
  return new TextDecoder().decode(base64ToBytes(normalized+"=".repeat((4-normalized.length%4)%4)));
}

export function encodeSignal(description){
  return toBase64Url(JSON.stringify({v:1,type:description.type,sdp:description.sdp}));
}

export function decodeSignal(code){
  let parsed;
  try{parsed=JSON.parse(fromBase64Url(String(code||"").trim()));}
  catch(err){throw new Error("接続コードを読み取れませんでした");}
  if(!parsed||parsed.v!==1||!parsed.type||typeof parsed.sdp!=="string")throw new Error("接続コードの形式が正しくありません");
  return parsed;
}

function waitForIceGathering(pc,timeoutMs=8000){
  if(pc.iceGatheringState==="complete")return Promise.resolve();
  return new Promise((resolve,reject)=>{
    let timer=setTimeout(()=>{cleanup();reject(new Error("ICE接続情報の取得がタイムアウトしました"));},timeoutMs);
    const onState=()=>{
      if(pc.iceGatheringState==="complete"){cleanup();resolve();}
    };
    const cleanup=()=>{clearTimeout(timer);pc.removeEventListener("icegatheringstatechange",onState);};
    pc.addEventListener("icegatheringstatechange",onState);
  });
}

function attachChannel(channel,{onOpen,onClose,onMessage,onError}={}){
  const allowed=new Set(["ONLINE_READY","ONLINE_READY_ACK","ONLINE_START","ONLINE_PITCH","ONLINE_SWING","ONLINE_TAKE","ONLINE_CONTACT","ONLINE_STATE"]);
  channel.onopen=()=>onOpen?.();
  channel.onclose=()=>onClose?.();
  channel.onerror=event=>onError?.(event);
  channel.onmessage=event=>{
    if(typeof event.data!=="string"||event.data.length>50000)return;
    let message;
    try{message=JSON.parse(event.data);}catch{return;}
    if(!message||message.v!==1||!allowed.has(message.type))return;
    onMessage?.(message);
  };
}

function createPeerConnection(iceServers=DEFAULT_ICE_SERVERS){
  if(typeof RTCPeerConnection==="undefined")throw new Error("このブラウザはオンライン対戦に対応していません");
  return new RTCPeerConnection({iceServers});
}

export async function createOnlineHost(options={}){
  const pc=createPeerConnection(options.iceServers||DEFAULT_ICE_SERVERS);
  const channel=pc.createDataChannel("baseball-match",{ordered:true});
  const connection={role:"HOST",pc,channel,send(message){if(channel.readyState==="open")channel.send(JSON.stringify(message));},close(){channel.close();pc.close();}};
  attachChannel(channel,options);
  pc.oniceconnectionstatechange=()=>options.onConnectionState?.(pc.iceConnectionState);
  const offer=await pc.createOffer();
  await pc.setLocalDescription(offer);
  await waitForIceGathering(pc);
  return {...connection,code:encodeSignal(pc.localDescription)};
}

export async function createOnlineGuest(offerCode,options={}){
  const signal=decodeSignal(offerCode);
  if(signal.type!=="offer")throw new Error("ホスト用の接続コードを入力してください");
  const pc=createPeerConnection(options.iceServers||DEFAULT_ICE_SERVERS);
  let channel;
  const connection={role:"GUEST",pc,send(message){if(channel?.readyState==="open")channel.send(JSON.stringify(message));},close(){channel?.close();pc.close();}};
  pc.ondatachannel=event=>{
    channel=event.channel;
    connection.channel=channel;
    attachChannel(channel,options);
  };
  pc.oniceconnectionstatechange=()=>options.onConnectionState?.(pc.iceConnectionState);
  await pc.setRemoteDescription({type:signal.type,sdp:signal.sdp});
  const answer=await pc.createAnswer();
  await pc.setLocalDescription(answer);
  await waitForIceGathering(pc);
  return {...connection,code:encodeSignal(pc.localDescription)};
}

export async function acceptOnlineAnswer(connection,answerCode){
  if(!connection?.pc)throw new Error("ホスト接続がありません");
  const signal=decodeSignal(answerCode);
  if(signal.type!=="answer")throw new Error("参加側が作成した回答コードを入力してください");
  await connection.pc.setRemoteDescription({type:signal.type,sdp:signal.sdp});
}

export function isOnlineSupported(){
  return typeof RTCPeerConnection!=="undefined";
}
