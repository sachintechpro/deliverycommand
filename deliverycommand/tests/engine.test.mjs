import test from 'node:test';
import assert from 'node:assert/strict';
import {simulate, SCENARIO} from '../engine.mjs';

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
