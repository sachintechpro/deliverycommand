return (async function(){
 const classify=(file,name)=>{
   const s=(file+" "+name).toLowerCase();
   if(/browser_mobile|responsive|viewport|overflow|mobile|floating|sidebar|screen|width|scroll/.test(s))return"UX / responsive";
   if(/mfa|auth|login|logout|session|password|lockout|role|permission|csrf|security|token|reset|recovery code|audit omits|unauthorized|denied|expired|lock/.test(s))return"Security / RBAC";
   if(/journey|complete.customer|handoff|end.to.end|dispatch|fulfillment|order.ready|order.shortage|approved.handoff|checkout|customer.to.satisfaction/.test(s))return"E2E / workflow";
   if(/http|endpoint|catalog|api|route|csv|request|upload|image.sku|image.mismatch|status|404/.test(s))return"API / contract";
   if(/integrat|dependency|vendor|scheduled|capacity|contract|payment|cross.team|state.transit|no.partial.reservation|notification/.test(s))return"SIT / integration";
   if(/chat|browser|keyboard|tooltip|ui|render|dom|accessib/.test(s))return"UX / responsive";
   if(/smoke|bootstrap|health/.test(s))return"UAT / smoke";
   if(/scenario|budget|forecast|cost|score|calculate|simulation|simulate|priority|finish|effort|unknown|invalid|reject|data|quantity|price|zero|rounding|margin|nonfinite|critical/.test(s))return"Unit / business rules";
   return"Functional / regression";
 };
 const describe=s=>s.replace(/^test_\d*_?/,'').replace(/^test_/,'').replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase());
 const results=[];
 for(const spec of specs){
   const full="sachintechpro/"+spec.repo;
   const files=await Promise.all(spec.files.map(async path=>{
     try{
       const f=(await tools.mcp__GitHub__fetch_file({repository_full_name:full,path})).result;
       const lines=f.content.split("\n"),found=[];
       for(let i=0;i<lines.length;i++){
          const current=lines[i].trim();
          const a=current.match(/^test\(\s*(['"\x60])(.+?)\1\s*,/);
          const b=current.match(/^def (test_[\w]+)\s*\(/);
          if(!a&&!b)continue;
          const title=a?a[2]:describe(b[1]);
          const next=lines.slice(i,Math.min(i+18,lines.length));
          const line=next.find(x=>/assert\W|assertEqual|assertRaises|assertTrue|assertFalse|assert\b/.test(x))||current;
          let excerpt=line.trim();
          if(a&&excerpt.includes('test(')&&excerpt.includes('assert.'))excerpt=excerpt.slice(excerpt.indexOf('assert.'));
          excerpt=excerpt.slice(0,280)+(excerpt.length>280?' …':'');
          found.push({title,file:path,line:i+1,excerpt,category:classify(path,title),framework:path.endsWith('.mjs')?'Node.js test runner':/browser|test_chat/.test(path)?'Python + Playwright':'Python unittest',sourceKind:'Test function'});
       }
       if(!found.length&&/browser|test_chat/.test(path)){
          const checks=lines.map((s,i)=>({s:s.trim(),line:i+1})).filter(x=>/^assert\s/.test(x.s));
          const picked=checks.slice(0,path.includes("test_chat")?12:9);
          for(const item of picked){
            const title=item.s.includes("scrollWidth")?"No horizontal layout overflow":
              item.s.includes("chatLauncher")?"Context-aware chat launcher renders":
              item.s.includes("chatContext")?"Chat answers follow current program module":
              item.s.includes("clientWidth")?"Viewport boundaries honored":
              item.s.includes("ops-metric")?"Operations metrics visible":
              item.s.includes("mobile-menu")?"Mobile navigation available":
              item.s.includes("chatPanel")?"Chat open/close interaction works":
              "Verified browser assertion "+item.line;
            found.push({title,file:path,line:item.line,excerpt:item.s.slice(0,280)+(item.s.length>280?' …':''),category:classify(path,title),framework:'Python + Playwright',sourceKind:'Assertion in browser run'});
          }
       }
       return{file:path,tests:found};
     }catch(e){return{file:path,tests:[],error:String(e)}}
   }));
   const tests=files.flatMap(f=>f.tests);
   tests.forEach((t,i)=>t.id="SRC-"+String(i+1).padStart(3,"0"));
   const suites=files.map(f=>({file:f.file,framework:f.tests[0]?.framework||'Source tests',testCount:f.tests.length,category:f.tests[0]?.category||'Functional / regression',error:f.error||null}));
   const p=spec.dir+'/qa-bench.html';
   const f=(await tools.mcp__GitHub__fetch_file({repository_full_name:full,path:p})).result;
   const match=f.content.match(/(<script id="qa-config" type="application\/json">)([\s\S]*?)(<\/script>)/);
   if(!match)throw Error("QA configuration missing for "+spec.repo);
   const c=JSON.parse(match[2]);
   c.technicalCases=tests;c.suites=suites;c.workflows=spec.workflows;c.technicalCatalogGeneratedAt='2026-11-13';
   const patch=f.content.replace(match[0],match[1]+JSON.stringify(c).replace(/</g,"\\u003c")+match[3]);
   const r=await tools.mcp__GitHub__update_file({repository_full_name:full,path:p,sha:f.sha,content:patch,message:"Add source-backed engineering test catalog with actual assertions and CI workflow references"});
   results.push({repo:spec.repo,commit:r.result.commit_sha,testCount:tests.length,suites:suites.map(x=>({file:x.file,count:x.testCount,error:x.error})),workflows:spec.workflows.length,categories:[...new Set(tests.map(x=>x.category))]});
 }
 return results;
})();