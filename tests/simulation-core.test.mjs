import test from 'node:test';import assert from 'node:assert/strict';import {createMatchState,applyOutcome,resolveContact,resolvePitch,REGULATION_INNINGS,stealBase,tagUp,advanceRunners,createPitchPhysics,createBattedBallPhysics,stepBallPhysics,isFiniteBallPhysics} from '../web/src/game/simulation.js';
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
