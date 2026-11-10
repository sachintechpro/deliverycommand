/** DeliveryCommand: deterministic, illustrative project-recovery model. */
export const SCENARIO = Object.freeze({
  name: 'Policy Platform Modernization',
  currentWeek: 20,
  baselineFinishWeek: 33,
  authorizedBudget: 4_000_000,
  actualSpend: 2_700_000,
  tasks: [
    { id: 'vendor', name: 'Vendor API delivery', owner: 'External integration vendor', duration: 6, cost: 270000, dependsOn: [] },
    { id: 'environment', name: 'SIT environment stabilization', owner: 'Platform / infrastructure', duration: 3, cost: 135000, dependsOn: [] },
    { id: 'migration', name: 'Data migration validation', owner: 'Data engineering', duration: 4, cost: 200000, dependsOn: [] },
    { id: 'integration', name: 'End-to-end integration', owner: 'Application integration', duration: 6, cost: 380000, dependsOn: ['vendor', 'environment'] },
    { id: 'sit', name: 'System integration testing', owner: 'QA / test management', duration: 5, cost: 270000, dependsOn: ['integration', 'migration'] },
    { id: 'uat', name: 'Business UAT and sign-off', owner: 'Business product owners', duration: 4, cost: 200000, dependsOn: ['sit'] },
    { id: 'cutover', name: 'Cutover and launch readiness', owner: 'Release management', duration: 2, cost: 145000, dependsOn: ['uat'] }
  ],
});
export const ACTIONS = Object.freeze([
  { id: 'vendorExpedite', title: 'Expedite vendor API delivery', category: 'Vendor', impact: 'Vendor work −2 weeks', extraCost: 140000, note: 'Requires vendor-approved recovery commitment and integrated test evidence.' },
  { id: 'integrationSwarm', title: 'Parallel integration workstream', category: 'Delivery', impact: 'Integration −2 weeks', extraCost: 220000, note: 'Assumes extra engineers and stable interface contracts; coordination risk increases.' },
  { id: 'testAutomation', title: 'Targeted SIT automation support', category: 'Quality', impact: 'SIT −1 week', extraCost: 70000, note: 'Only feasible with stable test environments and no reduction in required coverage.' },
  { id: 'phasedRelease', title: 'Phase noncritical scope after launch', category: 'Scope', impact: 'Integration −2 weeks; UAT −1 week', extraCost: -120000, note: 'Requires sponsor approval and acceptance of explicitly deferred capabilities.' },
  { id: 'compressedUat', title: 'Time-box UAT with risk acceptance', category: 'Quality', impact: 'UAT −1 week', extraCost: 45000, note: 'Higher chance of late business defects; cannot waive mandatory acceptance criteria.' },
]);
export const DEFAULT_DECISIONS = Object.freeze({ vendorExpedite: false, integrationSwarm: false, testAutomation: false, phasedRelease: false, compressedUat: false });

function resolveDurations(decisions) {
  const duration = Object.fromEntries(SCENARIO.tasks.map(t => [t.id, t.duration]));
  if (decisions.vendorExpedite) duration.vendor -= 2;
  if (decisions.integrationSwarm) duration.integration -= 2;
  if (decisions.testAutomation) duration.sit -= 1;
  if (decisions.phasedRelease) { duration.integration -= 2; duration.uat -= 1; }
  if (decisions.compressedUat) duration.uat -= 1;
  for (const id of Object.keys(duration)) duration[id] = Math.max(1, duration[id]);
  return duration;
}

export function simulate(input = {}) {
  const decisions = Object.fromEntries(ACTIONS.map(a => [a.id, Boolean(input[a.id])]));
  const durations = resolveDurations(decisions);
  const rows = [];
  const byId = {};
  for (const t of SCENARIO.tasks) {
    const start = t.dependsOn.length ? Math.max(...t.dependsOn.map(d => byId[d].end)) : SCENARIO.currentWeek;
    const end = start + durations[t.id];
    const row = { ...t, duration: durations[t.id], start, end };
    byId[t.id] = row;
    rows.push(row);
  }
  const finishWeek = Math.max(...rows.map(t => t.end));
  // CPM late-pass over the directed acyclic network; critical tasks have zero float.
  const successors = Object.fromEntries(rows.map(t => [t.id, rows.filter(r => r.dependsOn.includes(t.id)).map(r => r.id)]));
  const latestStart = {};
  for (const t of [...rows].reverse()) {
    const downstream = successors[t.id];
    const latestEnd = downstream.length ? Math.min(...downstream.map(id => latestStart[id])) : finishWeek;
    latestStart[t.id] = latestEnd - t.duration;
    t.float = latestStart[t.id] - t.start;
    t.critical = t.float === 0;
  }
  const estimatedBaseRemaining = SCENARIO.tasks.reduce((sum, t) => sum + t.cost, 0);
  const interventionCost = ACTIONS.reduce((sum, a) => sum + (decisions[a.id] ? a.extraCost : 0), 0);
  const estimateAtCompletion = SCENARIO.actualSpend + estimatedBaseRemaining + interventionCost;
  const budgetVariance = estimateAtCompletion - SCENARIO.authorizedBudget;
  const slipWeeks = Math.max(0, finishWeek - SCENARIO.baselineFinishWeek);
  const recoveryWeeks = 43 - finishWeek;
  const rag = slipWeeks > 4 || budgetVariance > SCENARIO.authorizedBudget * 0.1 ? 'RED' :
    slipWeeks > 0 || budgetVariance > 0 ? 'AMBER' : 'GREEN';
  const qualityRisk = decisions.compressedUat ? 'HIGH' : decisions.phasedRelease ? 'ELEVATED' : 'CONTROLLED';
  const warnings = [];
  if (decisions.phasedRelease) warnings.push('Scope deferral requires product owner, sponsor, and any regulatory approval before baselining.');
  if (decisions.compressedUat) warnings.push('Shortening UAT increases residual defect risk; mandatory sign-offs and regulatory tests remain required.');
  if (decisions.integrationSwarm) warnings.push('Parallel engineering requires approved staffing and a viable work breakdown; additional people do not guarantee schedule savings.');
  if (decisions.vendorExpedite) warnings.push('Vendor acceleration is a proposal, not a commitment, until a revised delivery plan is formally accepted.');
  if (decisions.testAutomation) warnings.push('Automation can save execution time only when environments, data, and stable tests are available.');
  if (budgetVariance > 0) warnings.push('Estimate at completion exceeds the authorized budget; a funding decision or further replan is required.');
  if (slipWeeks > 0) warnings.push('The plan still misses the original baseline; do not claim the original release date is protected.');
  const recommendation = decisions.compressedUat ? 'Do not approve a compressed UAT window without a documented quality and business-risk exception.' :
    decisions.phasedRelease ? 'Request formal sponsor approval for phased scope, with acceptance criteria and a separate completion commitment.' :
    decisions.vendorExpedite || decisions.integrationSwarm || decisions.testAutomation ? 'Validate assumptions with accountable leads, secure commitments, and submit a change-controlled recovery plan.' :
    'Maintain RED status. Establish a verified integrated plan, resolve ownership, and present recovery options to the steering committee.';
  return { decisions, rows, finishWeek, slipWeeks, recoveryWeeks, estimatedBaseRemaining, interventionCost, estimateAtCompletion, budgetVariance, rag, qualityRisk, warnings, recommendation, criticalPath: rows.filter(t => t.critical).map(t => t.name) };
}
