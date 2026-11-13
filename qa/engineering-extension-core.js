
/* QA engineering evidence extension. Inlined inside the existing QA Bench IIFE.
 * Existing six lifecycle panels and their click/change/submit handlers are retained.
 * All source tests are linked to actual repository paths and source excerpts. */
let qaTechFilter='All';
let qaCiRuns=null, qaCiBusy=false, qaCiError='', qaCiAt='';
const qaCategories=[
  'Unit / business rules','Functional / regression','API / contract',
  'SIT / integration','E2E / workflow','UX / responsive',
  'Security / RBAC','UAT / smoke'
];
const qaEsc=s=>esc(s);
function qaSrcLink(x){
  const p=String(x.file||'').split('/').map(encodeURIComponent).join('/');
  return 'https://github.com/sachintechpro/'+encodeURIComponent(C.repository)+'/blob/main/'+p+(x.line?'#L'+x.line:'');
}
function qaBadge(st){
 const label=String(st||'Not checked');
 const cls=label==='success'||label==='Passed'?'passed':label==='failure'||label==='Failed'?'failed':label==='in_progress'||label==='queued'?'blocked':'';
 return '<span class="tag '+cls+'">'+qaEsc(label.replaceAll('_',' '))+'</span>';
}
function qaCatCounts(){
 return qaCategories.map(cat=>({name:cat,count:(C.technicalCases||[]).filter(t=>t.category===cat).length}))
}
function qaCiWorkflowLink(path){
 const file=String(path||'').split('/').pop();
 return 'https://github.com/sachintechpro/'+encodeURIComponent(C.repository)+'/actions/workflows/'+encodeURIComponent(file);
}
function qaCiResult(file){
 if(!Array.isArray(qaCiRuns))return null;
 return qaCiRuns.find(r=>String(r.path||'')===file)||null;
}
function qaCiLink(r){
 const u=String(r?.html_url||'');
 return u.startsWith('https://github.com/')?'<a target="_blank" rel="noopener noreferrer" href="'+qaEsc(u)+'">Inspect actual run ↗</a>':'';
}
function qaEngineering(){
 const tc=C.technicalCases||[];
 const manualRan=new Set(state.executions.map(x=>x.caseId)).size;
 const actual=Object.values(state.auto||{});
 const proofCount=actual.filter(x=>x.status==='Passed').length;
 const latestRun=Array.isArray(qaCiRuns)?qaCiRuns[0]:null;
 return '<section class="tech-workbench"><div class="tech-hero"><div><span class="tech-kicker">LIVE TEST ENGINEERING · '+qaEsc(C.domain)+'</span><h2>Actual tests. Source assertions. Verifiable evidence.</h2><p>Source-backed cases come from this application’s real repository. Browser-local manual verdicts, safe HTTP checks and GitHub CI results remain separate—no prefilled pass rates.</p></div><a class="btn" href="'+qaEsc(C.sourceUrl)+'" target="_blank" rel="noopener noreferrer">Inspect repository ↗</a></div>'+
 '<div class="tech-stats">'+
 '<div class="tech-stat"><strong>'+tc.length+'</strong><span>Source-backed test cases</span><small>Test functions and assertions</small></div>'+
 '<div class="tech-stat"><strong>'+(C.suites||[]).length+'</strong><span>Test suites/files</span><small>Clickable source paths</small></div>'+
 '<div class="tech-stat"><strong>'+C.automatic.length+'</strong><span>Runnable live checks</span><small>'+proofCount+' passed of '+actual.length+' attempted</small></div>'+
 '<div class="tech-stat"><strong>'+cases().length+'</strong><span>Manual cases</span><small>'+manualRan+' cases executed in this browser</small></div>'+
 '</div>'+
 '<div class="tech-layout"><section class="panel"><h3>Source coverage by test level</h3><p class="fine">Counts reflect tests found in source files; they are not pass counts.</p><div class="tech-cat-grid">'+qaCatCounts().map(c=>'<button class="tech-cat" data-act="qa-open-category" data-cat="'+qaEsc(c.name)+'"><strong>'+c.count+'</strong><span>'+qaEsc(c.name)+'</span></button>').join('')+'</div></section>'+
 '<section class="panel"><h3>Execution evidence</h3>'+
 '<div class="tech-evidence-line"><div><strong>Live safe checks</strong><small>Runs on demand in this browser</small></div>'+qaBadge(actual.length?proofCount+' / '+actual.length+' passed':'Not run')+'</div>'+
 '<div class="tech-evidence-line"><div><strong>GitHub Actions</strong><small>Repository workflow and test logs</small></div>'+qaBadge(latestRun?latestRun.conclusion||latestRun.status:'Not fetched')+'</div>'+
 '<div class="tech-evidence-line"><div><strong>Manual QA</strong><small>Human-entered observations and attachments</small></div>'+qaBadge(manualRan+' / '+cases().length+' executed')+'</div>'+
 '<div class="actions"><button class="btn alt" data-act="qa-go-ci">Open CI evidence</button><button class="btn alt" data-act="qa-go-runner">Run safe live checks</button></div></section></div>'+
 '<section class="panel"><h3>Engineering walkthrough for hiring managers</h3>'+
 '<div class="tech-walkthrough">'+
 '<div><strong>01 · Inspect a business rule</strong><p>Open a real test function and verify its input, assertion and source location.</p></div>'+
 '<div><strong>02 · Execute a safe check</strong><p>Run live read-only HTTP or deterministic engine checks and inspect actual responses.</p></div>'+
 '<div><strong>03 · Inspect CI history</strong><p>Verify the exact workflow, commit, conclusion and logs in GitHub Actions.</p></div>'+
 '<div><strong>04 · Record QA evidence</strong><p>Complete a manual case, capture observed behavior, link a defect and export the result.</p></div></div></section></section>';
}
function qaCatalog(){
 const source=C.technicalCases||[];
 const filtered=qaTechFilter==='All'?source:source.filter(x=>x.category===qaTechFilter);
 return '<section class="tech-workbench"><h2>Technical test catalog</h2><p>Actual tests and assertions extracted from version-controlled source files. The catalog is a reviewable inventory; execution statuses are obtained from CI or real live runs, never inferred from source code.</p>'+
 '<div class="tech-controls"><label>Test category<select id="qa-tech-category"><option>All</option>'+qaCategories.map(cat=>'<option '+(qaTechFilter===cat?'selected':'')+'>'+qaEsc(cat)+'</option>').join('')+'</select></label>'+
 '<span class="fine">'+filtered.length+' of '+source.length+' sourced tests</span></div>'+
 '<div class="tech-source-list">'+filtered.map(t=>'<details class="panel tech-source"><summary><span class="tech-source-title"><strong>'+qaEsc(t.id)+'</strong> '+qaEsc(t.title)+'</span><span>'+qaBadge(t.category)+'</span></summary>'+
 '<div class="tech-source-body"><div class="tech-tags"><span>'+qaEsc(t.framework)+'</span><span>'+qaEsc(t.file)+'</span><span>Line '+qaEsc(t.line)+'</span></div>'+
 '<p><b>Actual assertion / technical check from source</b></p><pre>'+qaEsc(t.excerpt||'See source for implementation')+'</pre>'+
 '<p class="fine">Linked source reference is inspectable. CI results are shown in the separate CI & artifacts section; test code alone is not evidence of execution.</p>'+
 '<div class="cardlinks"><a href="'+qaSrcLink(t)+'" target="_blank" rel="noopener noreferrer">View exact source line ↗</a><a href="'+qaCiWorkflowLink((C.workflows||[])[0]?.path)+'" target="_blank" rel="noopener noreferrer">CI workflows ↗</a></div></div></details>').join('')+'</div>'+
 (filtered.length?'':'<div class="note">No source-backed tests in this category yet; this is a visibility gap, not a pass.</div>')+'</section>';
}
async function qaRefreshCi(){
 if(qaCiBusy)return;
 qaCiBusy=true;qaCiError='';draw();
 try{
   const url='https://api.github.com/repos/sachintechpro/'+encodeURIComponent(C.repository)+'/actions/runs?per_page=45';
   const r=await fetch(url,{cache:'no-store',headers:{'Accept':'application/vnd.github+json'}});
   if(!r.ok)throw Error('GitHub API HTTP '+r.status+(r.status===403?' (rate limit or access restriction)':''));
   const body=await r.json();
   if(!Array.isArray(body.workflow_runs))throw Error('GitHub response has no workflow_runs array');
   qaCiRuns=body.workflow_runs.map(x=>({
     name:String(x.name||''),path:String(x.path||''),status:String(x.status||''),
     conclusion:String(x.conclusion||''),head_sha:String(x.head_sha||''),
     run_started_at:String(x.run_started_at||x.created_at||''),html_url:String(x.html_url||'')
   }));
   qaCiAt=new Date().toISOString();
 }catch(err){qaCiError=String(err?.message||err);qaCiRuns=null;}
 finally{qaCiBusy=false;draw();}
}
function qaCiView(){
 const workflows=C.workflows||[];
 const fetchState=qaCiBusy?'Checking GitHub Actions…':qaCiError?'Unable to verify CI: '+qaCiError:Array.isArray(qaCiRuns)?'Last checked: '+new Date(qaCiAt).toLocaleString():'No API request made yet — CI status unknown';
 const relevant=Array.isArray(qaCiRuns)?qaCiRuns.filter(r=>workflows.some(w=>w.path===r.path)).slice(0,14):[];
 return '<section class="tech-workbench"><h2>CI executions, code provenance & artifacts</h2><p>Evidence is fetched directly from the public GitHub Actions API, not from manually maintained pass counters. Click the run link for logs, failures, artifacts and commit details.</p>'+
 '<div class="tech-ci-header"><span class="fine" role="status">'+qaEsc(fetchState)+'</span><button class="btn" data-act="qa-refresh-ci" '+(qaCiBusy?'disabled':'')+'>'+ (qaCiBusy?'Checking…':'Refresh actual CI status')+'</button></div>'+
 '<div class="grid">'+workflows.map(w=>{const run=qaCiResult(w.path);return '<article class="panel"><div class="row"><strong>'+qaEsc(w.name)+'</strong>'+qaBadge(run?run.conclusion||run.status:'Not checked')+'</div>'+
 '<p>'+qaEsc(w.description||'Repository workflow')+'</p><p class="fine">Workflow: '+qaEsc(w.path)+'</p>'+
 (run?'<p class="fine">Started '+qaEsc(run.run_started_at)+' · '+qaEsc(run.head_sha.slice(0,10))+'</p>':'<p class="fine">No verified result loaded for this workflow.</p>')+
 '<div class="cardlinks"><a href="'+qaCiWorkflowLink(w.path)+'" target="_blank" rel="noopener noreferrer">Workflow history ↗</a> '+qaCiLink(run)+'</div></article>'}).join('')+'</div>'+
 '<div class="panel"><h3>Recent real workflow runs</h3>'+
 (relevant.length?'<div class="tablewrap"><table><thead><tr><th>Workflow</th><th>Outcome</th><th>Git SHA</th><th>Run started</th><th>Evidence</th></tr></thead><tbody>'+relevant.map(r=>'<tr><td>'+qaEsc(r.name)+'</td><td>'+qaBadge(r.conclusion||r.status)+'</td><td><code>'+qaEsc(r.head_sha.slice(0,10))+'</code></td><td>'+qaEsc(r.run_started_at)+'</td><td>'+qaCiLink(r)+'</td></tr>').join('')+'</tbody></table></div>':'<p class="fine">No verified workflow runs loaded. Refresh to check GitHub; do not infer that a test passed.</p>')+
 '</div><div class="panel"><h3>Artifacts and failure investigation</h3><p>GitHub Actions run details provide step logs and available downloaded artifacts. Failed runs remain visible alongside later successful runs, showing debugging and regression history.</p>'+
 '<p class="fine">Source files used by these workflows are listed in the catalog. An existing source file does not imply it was executed; verify the workflow steps on GitHub.</p>'+
 '<a class="btn alt" href="'+qaEsc(C.ciUrl)+'" target="_blank" rel="noopener noreferrer">View repository actions and artifacts ↗</a></div></section>';
}
function qaQualityGates(){
 const manual=cases(),runs=state.executions,latestRuns=new Map();
 for(const r of runs)if(!latestRuns.has(r.caseId))latestRuns.set(r.caseId,r);
 const passed=[...latestRuns.values()].filter(r=>r.status==='Passed').length;
 const failed=[...latestRuns.values()].filter(r=>r.status==='Failed').length;
 const blocked=[...latestRuns.values()].filter(r=>r.status==='Blocked').length;
 const live=Object.values(state.auto||{});
 const failures=live.filter(r=>r.status==='Failed').length;
 const requiredSources=C.technicalCases||[];
 const reqs=C.requirements.map(r=>{
   const relevant=manual.filter(c=>c.req===r.id), executed=relevant.filter(c=>latestRuns.has(c.id)).length;
   return {r,relevant,executed}
 });
 const gate=failed||failures?'NO-GO: failures require triage': 'EVIDENCE INCOMPLETE: no release sign-off';
 return '<section class="tech-workbench"><h2>Requirement traceability & quality gates</h2><p>Reconcile business acceptance criteria with designed manual cases, actually recorded executions and the source-backed automation catalog. These are distinct evidence types.</p>'+
 '<div class="panel"><div class="row"><h3>Risk-based release recommendation</h3>'+qaBadge(failed||failures?'Failed checks exist':'Not signed off')+'</div>'+
 '<p><strong>'+qaEsc(gate)+'</strong></p>'+
 '<div class="tech-gate-metrics"><span>'+passed+' manual passed</span><span>'+failed+' manual failed</span><span>'+blocked+' manual blocked</span><span>'+failures+' live-check failures</span><span>'+requiredSources.length+' sourced tests (not pass count)</span></div>'+
 '<p class="fine">Final production approval requires business/UAT sign-off, review of all failed or unexecuted critical cases, CI evidence, environment controls and documented residual-risk acceptance.</p></div>'+
 '<div class="panel"><h3>Requirement-to-test traceability</h3><div class="tablewrap"><table><thead><tr><th>Requirement</th><th>Risk</th><th>Designed cases</th><th>Manual execution</th><th>Acceptance status</th></tr></thead><tbody>'+reqs.map(({r,relevant,executed})=>'<tr><td><strong>'+qaEsc(r.id)+'</strong><div class="fine">'+qaEsc(r.title)+'</div></td><td>'+qaBadge(r.risk)+'</td><td>'+relevant.length+'<div class="fine">'+qaEsc(relevant.map(c=>c.id).join(', '))+'</div></td><td>'+executed+' / '+relevant.length+'</td><td>'+qaBadge(executed===relevant.length&&relevant.length?'Executed (review verdicts)':'Coverage not complete')+'</td></tr>').join('')+'</tbody></table></div></div>'+
 '<div class="panel"><h3>Environment, execution scope & known gaps</h3>'+
 '<p><b>Technology:</b> '+qaEsc((C.suites||[]).map(s=>s.framework).filter((x,i,a)=>a.indexOf(x)===i).join(' · '))+'</p>'+
 '<p><b>Safe visitor execution:</b> Existing live-runner GET/API contract checks and pure deterministic engine calls (as configured). No data-changing CI tests run against shared Render environments.</p>'+
 '<p><b>CI test provenance:</b> '+qaEsc((C.workflows||[]).map(w=>w.name).join(' · '))+'</p>'+
 '<p><b>Known limitations:</b> '+qaEsc(C.caveats)+'</p>'+
 '<p><b>Coverage gaps:</b> '+qaEsc(qaCategories.filter(cat=>!requiredSources.some(t=>t.category===cat)).join('; ')||'All categories represented in source (verify CI coverage separately)')+'</p>'+
 '<div class="actions"><button class="btn alt" data-act="qa-go-catalog">Inspect sourced tests</button><button class="btn alt" data-act="qa-go-ci">Verify CI execution</button></div></div></section>';
}
