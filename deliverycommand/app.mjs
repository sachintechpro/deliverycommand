import {ACTIONS,SCENARIO,DEFAULT_DECISIONS,simulate} from './engine.mjs';
const decisions = { ...DEFAULT_DECISIONS };
const $ = id => document.getElementById(id);
const currency = n => `${n < 0 ? '−' : n > 0 ? '+' : ''}$${Math.round(Math.abs(n)/1000).toLocaleString()}K`;
const million = n => `$${(n / 1000000).toFixed(2)}M`;
const escape = s => String(s).replace(/[&<>"']/g, ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const fmtSlip = n => n ? `${n} week${n===1?'':'s'} late` : 'On or ahead of baseline';
let latest;

function initOptions() {
  $('actionOptions').innerHTML = ACTIONS.map(a => `<label class="option" id="option-${a.id}"><div class="option-line"><input type="checkbox" data-action="${a.id}" aria-label="${escape(a.title)}"><div class="option-content"><div class="option-top"><strong>${escape(a.title)}</strong><span class="option-cat">${escape(a.category)}</span></div><div class="option-summary">${escape(a.impact)} <b>· ${a.extraCost < 0 ? 'Savings ' : 'Cost '}${currency(a.extraCost).replace(/^\+/,'')}</b></div><div class="option-note">${escape(a.note)}</div></div></div></label>`).join('');
  document.querySelectorAll('[data-action]').forEach(i=> i.addEventListener('change',()=>{decisions[i.dataset.action]=i.checked;update()}));
}
function setStatus(id, rag) {$(id).textContent=rag;$(id).className=`status ${rag.toLowerCase()}`}
function renderTimeline(model) {
  const min=SCENARIO.currentWeek,max=Math.max(44,model.finishWeek+1),span=max-min;
  let ticks=''; for(let w=min;w<=max;w+=2)ticks+=`<span>W${w}</span>`;
  $('timelineRows').innerHTML=`<div class="timeline-scale"><div></div><div class="timeline-ticks">${ticks}</div></div>`+model.rows.map(t=>{
    const left=(t.start-min)/span*100,width=t.duration/span*100;
    return `<div class="timeline-row"><div class="task-title">${escape(t.name)}<small>${escape(t.owner)} · Float: ${t.float}w</small></div><div class="track"><div title="Week ${t.start}–${t.end}, ${t.duration} weeks, ${t.critical?'critical':'not critical'}" class="bar ${t.critical?'critical':''}" style="left:${left}%;width:${width}%">${t.duration}w</div></div></div>`;
  }).join('');
  $('criticalPath').textContent=model.criticalPath.join(' → ');
}
function renderReport(model) {
  $('reportLead').textContent=`Status ${model.rag}. The forecast is Week ${model.finishWeek}, ${model.slipWeeks} weeks beyond the approved Week 33 baseline. ${model.recoveryWeeks} weeks recovered compared with the original unmitigated forecast. All recovery actions remain proposed until owners validate them.`;
  $('reportSchedule').textContent=fmtSlip(model.slipWeeks);
  $('reportBudget').textContent=million(model.estimateAtCompletion);
  $('reportRecommendation').textContent=model.recommendation;
  $('reportWarnings').innerHTML=model.warnings.map(x=>`<li>${escape(x)}</li>`).join('') || '<li>Confirm all remaining estimates and dependencies before approving the revised delivery baseline.</li>';
}
function update() {
  const r=latest=simulate(decisions);
  for(const a of ACTIONS){const item=$(`option-${a.id}`);item.classList.toggle('selected',decisions[a.id]);item.querySelector('input').checked=decisions[a.id]}
  for(const id of ['heroStatus','outcomeStatus','reportStatus']) setStatus(id,r.rag);
  $('heroSlip').textContent=`+${r.slipWeeks}`;
  $('heroForecast').textContent=`Week ${r.finishWeek}`;
  $('metricSlip').textContent=`+${r.slipWeeks} weeks`;
  $('metricEac').textContent=million(r.estimateAtCompletion);
  $('metricBudget').textContent=currency(r.budgetVariance);
  $('metricQuality').textContent=r.qualityRisk.charAt(0)+r.qualityRisk.slice(1).toLowerCase();
  $('resultFinish').textContent=r.finishWeek;
  $('resultSlip').textContent=fmtSlip(r.slipWeeks);
  $('resultRecovered').textContent=`${r.recoveryWeeks} week${r.recoveryWeeks===1?'':'s'}`;
  $('resultCost').textContent=currency(r.interventionCost);
  $('resultEac').textContent=million(r.estimateAtCompletion);
  $('resultVariance').textContent=currency(r.budgetVariance);
  $('resultQuality').textContent=r.qualityRisk;
  $('recommendation').textContent=r.recommendation;
  $('heroContext').textContent=r.slipWeeks?'behind the approved delivery baseline':'at the approved delivery baseline';
  renderTimeline(r);renderReport(r);
}
function asBrief(r){
 const selected=ACTIONS.filter(a=>r.decisions[a.id]);
 return [`DELIVERYCOMMAND | EXECUTIVE PROJECT RECOVERY BRIEF`,`Fictional enterprise delivery scenario — all values are illustrative`, ``, `PROJECT: ${SCENARIO.name}`,`STATUS: ${r.rag}`,`APPROVED BASELINE: Week ${SCENARIO.baselineFinishWeek}`,`CURRENT PLANNING POINT: Week ${SCENARIO.currentWeek}`,`REVISED FINISH: Week ${r.finishWeek}`,`SCHEDULE VARIANCE: ${r.slipWeeks} week(s) late`,`RECOVERY VS UNMITIGATED FORECAST: ${r.recoveryWeeks} week(s)`, `APPROVED BUDGET: ${million(SCENARIO.authorizedBudget)}`,`SPENT TO DATE: ${million(SCENARIO.actualSpend)}`,`ESTIMATE AT COMPLETION: ${million(r.estimateAtCompletion)}`,`FORECAST BUDGET VARIANCE: ${currency(r.budgetVariance)}`,`QUALITY EXPOSURE: ${r.qualityRisk}`,``,`PROPOSED ACTIONS`,...(selected.length?selected.map(a=>`- ${a.title} (${a.impact}, ${currency(a.extraCost)})`):['- No acceleration actions selected']),``,`CRITICAL PATH: ${r.criticalPath.join(' -> ')}`,``,`RECOVERY RECOMMENDATION: ${r.recommendation}`,``,`ASSUMPTIONS / APPROVALS`,...r.warnings.map(w=>`- ${w}`),``,`NEXT FIVE BUSINESS DAYS`,`1. Reconcile planned vs. actual vendor and workstream deliverables.`,`2. Validate all task estimates and finish-to-start dependencies.`,`3. Seek sponsor decisions on funding, timing, scope and quality exceptions.`,`4. Publish accountable owners, checkpoints and blocker escalation.`,``,`MODEL LIMITATION: Deterministic scenario estimates; no probabilistic risk analysis or real commitments.`].join('\n');
}
function download(filename,content,mime){const blob=new Blob([content],{type:mime});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
$('reset').addEventListener('click',()=>{Object.assign(decisions,DEFAULT_DECISIONS);update()});
$('downloadBrief').addEventListener('click',()=>download('deliverycommand-executive-brief.txt',asBrief(latest),'text/plain'));
$('downloadData').addEventListener('click',()=>download('deliverycommand-scenario.json',JSON.stringify({scenario:SCENARIO,actions:ACTIONS,result:latest},null,2),'application/json'));
$('printReport').addEventListener('click',()=>window.print());
initOptions();update();
