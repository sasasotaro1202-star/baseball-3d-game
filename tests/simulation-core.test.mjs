import test from 'node:test';import assert from 'node:assert/strict';import {createMatchState,applyOutcome,resolveContact,resolvePitch,REGULATION_INNINGS,stealBase,tagUp,advanceRunners,resolveFieldingPlay,isValidMatchState,advancePitcher,createPitchPhysics,createBattedBallPhysics,stepBallPhysics,isFiniteBallPhysics} from '../web/src/game/simulation.js';
test('three outs rotate from top to bottom',()=>{let s=createMatchState();s=applyOutcome(s,'OUT');s=applyOutcome(s,'OUT');s=applyOutcome(s,'OUT');assert.equal(s.half,'BOTTOM');assert.equal(s.inning,1);assert.equal(s.outs,0);});
test('home run scores batter and clears bases',()=>{let s=createMatchState();s.runners=[{id:1,base:0,status:'LIVE'},{id:2,base:1,status:'LIVE'}];s.bases=[true,true,false];s=applyOutcome(s,'HOME_RUN');assert.equal(s.score.away,3);assert.deepEqual(s.bases,[false,false,false]);});
test('tied game after the 9th inning enters extra innings without automatic runners',()=>{let s=createMatchState();for(let inning=0;inning<9;inning++){for(let i=0;i<3;i++)s=applyOutcome(s,'OUT');for(let i=0;i<3;i++)s=applyOutcome(s,'OUT');}assert.equal(s.inning,10);assert.equal(s.half,'TOP');assert.equal(s.outs,0);assert.deepEqual(s.bases,[false,false,false]);assert.equal(s.extraInnings,true);});
test('non-tied game ends immediately after the 9th inning',()=>{let s=createMatchState();s.score.away=1;for(let inning=0;inning<9;inning++){for(let i=0;i<3;i++)s=applyOutcome(s,'OUT');for(let i=0;i<3;i++)s=applyOutcome(s,'OUT');}assert.equal(s.ended,true);});
test('contact resolver is deterministic with injected RNG',()=>{assert.equal(resolveContact({timing:1,power:1,contact:1,rng:()=>0}),'HOME_RUN');});
test('pitch resolver always returns a legal outcome',()=>{const legal=new Set(['BALL','STRIKE','FOUL','SINGLE','DOUBLE','TRIPLE','HOME_RUN','OUT']);for(const x of [0,.1,.2,.4,.8,.99])assert.ok(legal.has(resolvePitch({rng:()=>x})));});
test('runners are individual entities and sync to bases',()=>{let s=createMatchState();s.runners=[{id:1,base:0,status:'LIVE',speed:95,reaction:90},{id:2,base:1,status:'LIVE',speed:70,reaction:70}];s.bases=[true,true,false];s=applyOutcome(s,'SINGLE');assert.equal(s.runners.filter(r=>r.status==='LIVE').length,3);assert.deepEqual(s.runners.filter(r=>r.status==='LIVE').map(r=>r.base).sort((a,b)=>a-b),[0,1,2]);assert.deepEqual(s.bases,[true,true,true]);});
test('steal and tag-up APIs exist on individual runners',()=>{let s=createMatchState();s.runners=[{id:7,base:0,status:'LIVE',speed:99,reaction:99}];const stolen=stealBase(s,7,1);assert.equal(typeof stolen.success,'boolean');let t=createMatchState();t.runners=[{id:8,base:1,status:'LIVE',speed:99,reaction:99}];const tagged=tagUp(t,8,2,50);assert.equal(typeof tagged.success,'boolean');});
test('ground-out can become a double play based on defense context',()=>{let s=createMatchState();s.runners=[{id:1,base:0,status:'LIVE',speed:50,reaction:50},{id:2,base:1,status:'LIVE',speed:50,reaction:50}];s=advanceRunners(s,{result:'GROUND_OUT',fielderPosition:'INFIELD',runnerReaction:50});assert.ok(s.outs>=2);});test('pitch physics stays finite and reaches the plate without teleporting',()=>{
 const p=createPitchPhysics({speedMph:96,targetX:.25,targetY:-.2});
 let s=p;
 for(let i=0;i<80&&!s.done;i++)s=stepBallPhysics(s,.016);
 assert.ok(isFiniteBallPhysics(s));
 assert.ok(Math.abs(s.position[2]+8)<1);
 assert.ok(Math.hypot(...s.velocity)<30);
});
test('batted ball physics includes ballistic flight and controlled bounce',()=>{
 const b=createBattedBallPhysics({outcome:'SINGLE',exitVelocity:100,launchAngle:18,direction:.2});
 let s=b,peak=b.position[1];
 for(let i=0;i<220&&!s.done;i++){s=stepBallPhysics(s,.016);peak=Math.max(peak,s.position[1]);}
 assert.ok(isFiniteBallPhysics(s));
 assert.ok(peak>1);
 assert.ok(s.position[1]>=s.radius);
 assert.ok(s.bounces>=0&&s.bounces<=s.maxBounces);
});

test('plate appearances advance the batting order after terminal outcomes',()=>{
 let s=createMatchState();
 s=applyOutcome(s,'STRIKE');s=applyOutcome(s,'STRIKE');s=applyOutcome(s,'STRIKEOUT');
 assert.equal(s.batterIndex.away,1);
 assert.equal(s.batters,1);
});
test('fielding can convert a single into an out on a strong throw',()=>{
 const s=createMatchState();
 const r=resolveFieldingPlay(s,{result:'SINGLE',distance:2,travelTime:.8,fielderReaction:95,fielderField:95,fielderCatch:95,fielderArm:99,throwDistance:15,batterSpeed:55,rng:()=>0});
 assert.equal(r.finalOutcome,'OUT');
 assert.equal(r.throwSuccess,true);
});
test('fielding catch miss turns a catchable fly ball into a live hit',()=>{
 const s=createMatchState();
 const r=resolveFieldingPlay(s,{result:'FLY_OUT',distance:25,travelTime:.6,fielderReaction:40,fielderField:40,fielderCatch:40,rng:()=>.99});
 assert.equal(r.finalOutcome,'SINGLE');
 assert.equal(r.catchSuccess,false);
});

test('runner speed changes advancement on singles',()=>{
 let fast=createMatchState();fast.runners=[{id:1,base:1,status:'LIVE',speed:95,reaction:90}];fast=applyOutcome(fast,'SINGLE');assert.deepEqual(fast.runners.filter(r=>r.status==='LIVE').map(r=>r.base).sort((a,b)=>a-b),[0,2]);
 let slow=createMatchState();slow.runners=[{id:1,base:1,status:'LIVE',speed:60,reaction:60}];slow=applyOutcome(slow,'SINGLE');assert.deepEqual(slow.runners.filter(r=>r.status==='LIVE').map(r=>r.base).sort((a,b)=>a-b),[0,1]);
});

test('match state invariant validator accepts a fresh legal state and rejects impossible state',()=>{
 const s=createMatchState();
 assert.equal(isValidMatchState(s),true);
 assert.equal(isValidMatchState({...s,outs:4}),false);
 assert.equal(isValidMatchState({...s,balls:4}),false);
 assert.equal(isValidMatchState({...s,score:{home:-1,away:0}}),false);
});
test('fielding difficulty changes catch probability deterministically',()=>{
 const s=createMatchState();
 const easy=resolveFieldingPlay(s,{result:'FLY_OUT',distance:8,travelTime:1,fielderReaction:70,fielderField:70,fielderCatch:70,difficulty:'EASY',rng:()=>.85});
 const hard=resolveFieldingPlay(s,{result:'FLY_OUT',distance:8,travelTime:1,fielderReaction:70,fielderField:70,fielderCatch:70,difficulty:'HARD',rng:()=>.85});
 assert.equal(easy.catchSuccess,false);
 assert.equal(hard.catchSuccess,true);
});

test('GameState invariant validator rejects impossible states',()=>{
 const s=createMatchState();
 assert.equal(isValidMatchState(s),true);
 assert.equal(isValidMatchState({...s,outs:4}),false);
 assert.equal(isValidMatchState({...s,balls:4}),false);
 assert.equal(isValidMatchState({...s,score:{home:-1,away:0}}),false);
 assert.equal(isValidMatchState({...s,bases:[true,false,false],runners:[]}),false);
});

test('pitcher substitution resets exhausted pitcher and advances pitcher index',()=>{
 const s=createMatchState();
 s.pitcherStamina.home=6;
 const r=advancePitcher(s,'home',3,8);
 assert.equal(r.changed,true);
 assert.equal(r.state.pitcherIndex.home,1);
 assert.equal(r.state.pitcherStamina.home,100);
});
test('pitcher substitution does not occur before threshold or without bullpen',()=>{
 const s=createMatchState();
 s.pitcherStamina.home=20;
 assert.equal(advancePitcher(s,'home',3,8).changed,false);
 const t=createMatchState();t.pitcherStamina.home=1;
 assert.equal(advancePitcher(t,'home',1,8).changed,false);
});

test('steal success and failure keep runner/base state valid',()=>{
 let s=createMatchState();
 s.runners=[{id:21,base:0,status:'LIVE',speed:99,reaction:99}];s.bases=[true,false,false];
 const success=stealBase(s,21,1,{catcherArm:50,pitcherStamina:20,difficulty:'EASY',rng:()=>0});
 assert.equal(success.success,true);assert.deepEqual(success.state.bases,[false,true,false]);assert.equal(isValidMatchState(success.state),true);
 let t=createMatchState();
 t.runners=[{id:22,base:0,status:'LIVE',speed:55,reaction:55}];t.bases=[true,false,false];
 const fail=stealBase(t,22,1,{catcherArm:99,pitcherStamina:100,difficulty:'HARD',rng:()=>.99});
 assert.equal(fail.success,false);assert.equal(fail.state.runners.length,0);assert.equal(fail.state.outs,1);assert.equal(isValidMatchState(fail.state),true);
});
