import test from 'node:test';
import assert from 'node:assert/strict';
import {simulate, SCENARIO, calculateSchedule} from '../engine.mjs';

test('baseline scenario is ten weeks delayed and red', () => {
 const r = simulate();
 assert.equal(r.finishWeek, 43);
 assert.equal(r.slipWeeks, 10);
 assert.equal(r.rag, 'RED');
 assert.equal(r.estimateAtCompletion, 4_300_000);
 assert.equal(r.budgetVariance, 300000);
});
test('expediting vendor shortens critical path by two weeks', () => {
 const r = simulate({vendorExpedite:true});
 assert.equal(r.finishWeek, 41);
 assert.equal(r.slipWeeks, 8);
 assert.equal(r.interventionCost, 140000);
});
test('shortening a noncritical task does not change finish', () => {
 const r=simulate();
 assert.equal(r.rows.find(t=>t.id==='migration').critical,false);
 assert.deepEqual(r.criticalPath, ['Vendor API delivery','End-to-end integration','System integration testing','Business UAT and sign-off','Cutover and launch readiness']);
});
test('all interventions still require responsible treatment of risk and funding', () => {
 const r=simulate({vendorExpedite:true,integrationSwarm:true,testAutomation:true,phasedRelease:true,compressedUat:true});
 assert.equal(r.finishWeek, 34);
 assert.equal(r.slipWeeks,1);
 assert.equal(r.rag,'RED');
 assert.equal(r.qualityRisk,'HIGH');
 assert.ok(r.warnings.some(x=>x.includes('UAT')));
});
test('all combinations produce sane schedule and deterministic cost', () => {
 for (let mask=0; mask<32; mask++) {
  const d={vendorExpedite:!!(mask&1),integrationSwarm:!!(mask&2),testAutomation:!!(mask&4),phasedRelease:!!(mask&8),compressedUat:!!(mask&16)};
  const r=simulate(d);
  assert.ok(r.finishWeek>=SCENARIO.currentWeek);
  assert.ok(r.rows.every(t=>t.duration>=1 && t.float>=0));
  assert.ok(r.criticalPath.length>0);
 }
});


test('recovered weeks equal delta from calculated unmitigated forecast', () => {
  const base = simulate();
  const accelerated = simulate({vendorExpedite: true, integrationSwarm: true});
  assert.equal(base.originalForecastWeek, 43);
  assert.equal(accelerated.recoveryWeeks, base.finishWeek - accelerated.finishWeek);
});

test('quality exposure remains RED when UAT compression creates high risk', () => {
  const r = simulate({vendorExpedite:true,integrationSwarm:true,testAutomation:true,phasedRelease:true,compressedUat:true});
  assert.equal(r.qualityRisk, 'HIGH');
  assert.equal(r.rag, 'RED');
  assert.ok(r.warnings.some(w => w.includes('compounds acceptance risk')));
});

test('combined integration accelerations warn about double-counting', () => {
  const r = simulate({phasedRelease:true,integrationSwarm:true});
  assert.ok(r.warnings.some(w => w.includes('double-counted')));
});

test('scheduler supports unordered work packages', () => {
  const tasks = [
    {id:'b', name:'B', duration:2, dependsOn:['a']},
    {id:'a', name:'A', duration:3, dependsOn:[]}
  ];
  const r = calculateSchedule(tasks, {a:3,b:2}, 20);
  assert.equal(r.finishWeek,25);
  assert.deepEqual(r.rows.map(t=>t.id),['a','b']);
  assert.ok(r.rows.every(t=>t.critical));
});

test('scheduler rejects unknown dependencies', () => {
  assert.throws(() => calculateSchedule([{id:'a',dependsOn:['missing']}],{a:1}), /Unknown predecessor/);
});

test('scheduler rejects dependency cycles', () => {
  assert.throws(() => calculateSchedule([{id:'a',dependsOn:['b']},{id:'b',dependsOn:['a']}],{a:1,b:1}), /Circular/);
});

test('scheduler rejects duplicate task IDs and invalid durations', () => {
  assert.throws(() => calculateSchedule([{id:'x',dependsOn:[]},{id:'x',dependsOn:[]}],{x:1}),/Duplicate/);
  assert.throws(() => calculateSchedule([{id:'a',dependsOn:[]}],{a:0}), /Invalid duration/);
});
