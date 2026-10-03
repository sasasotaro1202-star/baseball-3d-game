import test from 'node:test';
import assert from 'node:assert/strict';
import {encodeSignal,decodeSignal,isOnlineSupported} from '../web/src/game/online.js';

test('online signal round-trips an SDP payload',()=>{
  const code=encodeSignal({type:'offer',sdp:'v=0\r\nmock-sdp'});
  const decoded=decodeSignal(code);
  assert.equal(decoded.type,'offer');
  assert.equal(decoded.sdp,'v=0\r\nmock-sdp');
});

test('invalid online signal is rejected',()=>{
  assert.throws(()=>decodeSignal('not-a-signal'),/接続コード/);
});

test('online transport exports browser capability check',()=>{
  assert.equal(typeof isOnlineSupported(),'boolean');
});
