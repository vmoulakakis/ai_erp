import LiveCopilot from './LiveCopilot.jsx';
import {readSapDiagnostic} from './sapEvidence.js';
import React, {useEffect,useMemo,useRef,useState} from 'react';
import { createClient } from '@supabase/supabase-js';
import {
 Activity, ArrowDownToLine, ArrowRight, BarChart3, Blocks, Bot, BrainCircuit,
 CheckCircle2, ChevronDown, CircleAlert, ClipboardList, Database, FileCheck2,
 FileSearch, FileText, GitBranch, HardDrive, KeyRound, LayoutDashboard, LockKeyhole,
 LogIn, LogOut, Menu, Monitor, MonitorPlay, Network, Package, Play, Plus, RefreshCw,
 Search, Server, Settings, ShieldCheck, Square, TrendingUp, Upload, Wallet, X
} from 'lucide-react';

const sbUrl=import.meta.env.VITE_SUPABASE_URL;
const sbKey=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase=sbUrl&&sbKey?createClient(sbUrl,sbKey,{auth:{detectSessionInUrl:true}}):null;
const NO_DATA={system_sid:'DEV',system_client:'100',environment:'DEV',release:'Unverified',source:'NO_SAP_DATA',metrics:{},is_synthetic:false};
const demo={
 tenant_id:'pilot-demo',system_sid:'Q01',system_client:'100',environment:'QAS',
 release:'SAP_BASIS 740 · SYNTHETIC',source:'SYNTHETIC_FIXTURE',
 metrics:{failedJobs24h:12,idocErrors24h:147,customAbapObjects:1284,dumps7d:34},
 is_synthetic:true
};
const business=[
 {id:'revenue',title:'Net billed sales',value:'€12.4M',delta:'+5.1%',subtitle:'Illustrative prior-period comparison',icon:TrendingUp},
 {id:'dso',title:'Days Sales Outstanding',value:'63 days',delta:'+8 days',subtitle:'Illustrative cash conversion',icon:Wallet},
 {id:'otd',title:'On-time delivery',value:'87%',delta:'Below target',subtitle:'Example fulfillment indicator',icon:Package},
 {id:'stock',title:'Slow-moving inventory',value:'€1.4M',delta:'Requires review',subtitle:'Illustrative stock at cost',icon:BarChart3}
];
const modules=[
 ['System landscape','SYSTEM','Partial','Components, SID, client and release'],
 ['Background jobs','BASIS','Partial','SM37 job exceptions by period'],
 ['IDoc & interfaces','IDOC','Partial','WE02/WE05 status and error counts'],
 ['Custom ABAP','Z/Y','Partial','TADIR inventory (not code-quality verification)'],
 ['Finance & controlling','FI / CO','Not assessed','Authorized accounting aggregates required'],
 ['Materials & inventory','MM','Not assessed','Inventory, valuation and purchasing aggregates needed'],
 ['Sales & distribution','SD','Not assessed','Order-to-billing aggregates required'],
 ['Data & archiving','SARA','Not assessed','DB02/TAANA and retention rules required'],
 ['Migration readiness','S/4','Not assessed','Official readiness checks / ATC required'],
 ['Authorizations','SEC','Not assessed','Approved roles and audit metadata required'],
];
const paths=[
 {id:'mission',label:'Mission Control',icon:LayoutDashboard},
 {id:'business',label:'Business Assessment',icon:BarChart3},
 {id:'technical',label:'Technical Intelligence',icon:Activity},
 {id:'modules',label:'SAP Modules',icon:Blocks},
 {id:'findings',label:'Findings & Actions',icon:ClipboardList},
 {id:'live',label:'Live SAP Workspace',icon:MonitorPlay},
 {id:'advisor',label:'AI SAP Consultant',icon:BrainCircuit},
 {id:'imports',label:'Hybrid Onboarding',icon:Upload},
 {id:'reports',label:'Reports & History',icon:FileText},
 {id:'settings',label:'Workspace & Security',icon:Settings},
];
const fmt=(v)=>Number.isFinite(Number(v))?new Intl.NumberFormat('en-US').format(Number(v)):'Not collected';
const first=(n)=>typeof n==='string'?n:'';
function Status({children,tone='neutral'}){return <span className={'status status-'+tone}>{children}</span>}
function Tile({title,value,hint,icon:Icon,delta}){return <div className="tile"><div className="tile-top"><span>{title}</span><Icon size={18}/></div><strong>{value}</strong><div className="tile-footer"><span>{hint}</span>{delta&&<em>{delta}</em>}</div></div>}
function Empty({icon:Icon=FileSearch,title,children}){return <div className="empty"><Icon size={28}/><h3>{title}</h3><p>{children}</p></div>}
function SectionTitle({title,subtitle,children}){return <div className="sectiontitle"><div><h2>{title}</h2>{subtitle&&<p>{subtitle}</p>}</div>{children}</div>}

export default function App(){
 const [page,setPage]=useState('mission');
 const [mobileNav,setMobileNav]=useState(false);
 const [session,setSession]=useState(null);
 const [loginEmail,setLoginEmail]=useState('');
 const [loginMsg,setLoginMsg]=useState('');
 const [loginLoading,setLoginLoading]=useState(false);
 const [authVisible,setAuthVisible]=useState(false);
 const [remote,setRemote]=useState([]);
 const [remoteStatus,setRemoteStatus]=useState('not_loaded');
 const [selected,setSelected]=useState('Q01');
 const [local,setLocal]=useState(null);
 const [showDemo,setShowDemo]=useState(false);
 const [fileError,setFileError]=useState('');
 const [importInfo,setImportInfo]=useState('');
 const [consent,setConsent]=useState(false);
 const [activeItem,setActiveItem]=useState(null);
 const [query,setQuery]=useState('');
 const [plan,setPlan]=useState('');
 const [stream,setStream]=useState(null);
 const videoRef=useRef(null);
 const streamRef=useRef(null);
 const [captureError,setCaptureError]=useState('');
 const [workspace,setWorkspace]=useState({company:'Pilot Workspace',sid:'Q01',client:'100',environment:'QAS'});
 useEffect(()=>{
  if(!supabase) return;
  supabase.auth.getSession().then(({data})=>setSession(data.session)).catch(()=>{});
  const {data}=supabase.auth.onAuthStateChange((_event,value)=>setSession(value));
  return ()=>data.subscription.unsubscribe();
 },[]);
 useEffect(()=>{
  if(!session||!supabase){setRemote([]);setRemoteStatus('not_authenticated');return;}
  let active=true;setRemoteStatus('loading');
  supabase.functions.invoke('erp-saas-pilot',{method:'GET'}).then(({data,error})=>{
   if(!active)return;
   if(error||!Array.isArray(data?.items)){setRemoteStatus('error');return;}
   setRemote(data.items);setRemoteStatus('verified');
  }).catch(()=>active&&setRemoteStatus('error'));
  return ()=>{active=false};
 },[session]);
 useEffect(()=>{if(videoRef.current&&stream){videoRef.current.srcObject=stream;videoRef.current.play().catch(()=>{});}},[stream,page]);
 useEffect(()=>()=>{for(const track of streamRef.current?.getTracks()||[])track.stop();},[]);
 const selectedRemote=showDemo?remote.find(s=>s.system_sid===selected):null;
 const snap=local||selectedRemote||(showDemo?demo:NO_DATA);
 const metrics=snap.metrics||{};
 const findings=useMemo(()=>{
  const a=[];
  const failed=Number(metrics.failedJobs24h);
  const idocs=Number(metrics.idocErrors24h);
  if(Number.isFinite(failed)&&failed>0)a.push({id:'jobs',title:'Failed background jobs require investigation',module:'BASIS',level:failed>10?'HIGH':'MEDIUM',evidence:failed+' failed jobs in a 24h aggregate',explanation:'Inspect SM37 job logs and program dependencies. A count does not confirm the underlying cause.',action:'Collect sanitized failed-job status and related ST22 dump summary.'});
  if(Number.isFinite(idocs)&&idocs>0)a.push({id:'idocs',title:'IDoc processing exceptions',module:'IDOC',level:idocs>100?'HIGH':'MEDIUM',evidence:idocs+' IDocs in an error category',explanation:'Inspect message type, direction and status details; do not infer business order loss from counts.',action:'Collect approved WE02/WE05 status totals by direction and message type.'});
  if(Number.isFinite(Number(metrics.customAbapObjects)))a.push({id:'abap',title:'Custom ABAP inventory coverage only',module:'Z/Y',level:'INFO',evidence:fmt(metrics.customAbapObjects)+' custom objects inventoried',explanation:'Object counts alone do not establish code quality or S/4 readiness.',action:'Import authorized ATC results for actionable code findings.'});
  return a;
 },[metrics]);
 const setNav=(id)=>{setPage(id);setMobileNav(false);setActiveItem(null)};
 const runLogin=async(e)=>{e.preventDefault();if(!supabase){setLoginMsg('Supabase login is not configured for this deployment.');return;}
  setLoginLoading(true);setLoginMsg('');try{
   const {error}=await supabase.auth.signInWithOtp({email:loginEmail,options:{emailRedirectTo:'https://erp-intelligence-ai.vercel.app/'}});
   setLoginMsg(error?error.message:'Check your inbox for a secure sign-in link.');
  }catch{setLoginMsg('Sign-in is temporarily unavailable.')}finally{setLoginLoading(false)}
 };
 const logout=async()=>{await supabase?.auth.signOut();setSession(null);setAuthVisible(false)};
 const loadJson=async(e)=>{
  const f=e.target.files?.[0];if(!f)return;
  setFileError('');setImportInfo('');
  try {
   if(!consent)throw Error('Confirm that this SAP export is authorized and contains no confidential/personal records.');
   if(f.size>1048576)throw Error('Maximum file size is 1 MB.');
   const parsed=readSapDiagnostic(await f.text(),f.name);
   setLocal(parsed);setShowDemo(false);setSelected(parsed.system_sid);
   setImportInfo('Accepted '+parsed.system_sid+' / client '+parsed.system_client+' · '+Object.keys(parsed.metrics).length+' approved aggregates. Local browser analysis; no cloud upload.');
   setPage('technical');
  }catch(err){setFileError(String(err?.message||'Invalid SAP diagnostic export'))}
  finally{e.target.value=''}
 };
 const stopShare=()=>{streamRef.current?.getTracks().forEach(t=>t.stop());streamRef.current=null;setStream(null);setCaptureError('')};
 const startShare=async()=>{
  setCaptureError('');
  if(!navigator.mediaDevices?.getDisplayMedia){setCaptureError('Screen capture needs HTTPS and a supported desktop browser.');return}
  try{
   const s=await navigator.mediaDevices.getDisplayMedia({video:true,audio:false});
   s.getVideoTracks()[0].addEventListener('ended',stopShare,{once:true});
   streamRef.current=s;setStream(s);
  }catch(e){setCaptureError(e?.name==='NotAllowedError'?'Screen sharing was cancelled.':'Unable to capture window. Check browser permissions.')}
 };
 const exportReport=()=>{
  const report={title:'ERP Intelligence pilot assessment',generatedAt:new Date().toISOString(),
   classification:snap.is_synthetic?'SYNTHETIC':'LOCAL_CUSTOMER_DECLARED_UNVERIFIED',
   system:{sid:snap.system_sid,client:snap.system_client,environment:snap.environment},
   source:snap.source,metrics,findings,coverage:modules.map(x=>({module:x[1],status:x[2]})),
   note:'Not a certified business or SAP production assessment. No live SAP connection.'};
  const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='erp-intelligence-pilot-report.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),500);
 };
 const generatePlan=()=>{
  if(!query.trim())return;
  const q=query.toLowerCase();
  const idoc=q.includes('idoc')||q.includes('we02')||q.includes('we05');
  const jobs=q.includes('job')||q.includes('sm37');
  setPlan((idoc?'IDoc diagnostics':'Background job diagnostics')+'\n\n'+
  (idoc?'1. Check permitted WE02/WE05 status aggregates and message type.\n2. Review the corresponding authorized application status text.\n3. Correlate interface schedule with the failure timeline.':
  jobs?'1. Review SM37 jobs and start/end time.\n2. Examine permitted job logs and ST22 categories.\n3. Check job variants and dependencies after review.':
  '1. Select the relevant SAP module and system/client.\n2. Obtain an approved export or allowlisted collector evidence.\n3. Reassess with precise timestamps and checks.')+
  '\n\nEvidence boundary: Current environment is '+snap.system_sid+'/'+snap.environment+
  ', source '+snap.source+'. This is guidance, NOT a live AI response or executed SAP action.');
 };
 const dataLabel=snap.source==='NO_SAP_DATA'?'NO SAP DATA':snap.is_synthetic?'SYNTHETIC DEMO':'LOCAL SAP EXPORT · UNVERIFIED';
 const topHeader=()=>{
  const titles={mission:['Mission Control','360° ERP intelligence overview'],business:['Business Assessment','Performance, cash, fulfillment and working capital'],technical:['Technical Intelligence','Actual collected scope, trends and exceptions'],modules:['Module Coverage','Assessed versus not assessed'],findings:['Findings & Actions','Evidence-first diagnostic decisions'],live:['Live SAP Workspace','View your SAP GUI with explicit local consent'],advisor:['AI SAP Consultant','Safe read-only investigation planner'],imports:['Hybrid Assessment','Upload an approved aggregate or prepare the DEV collector'],reports:['Reports & History','Export traceable assessments'],settings:['Workspace & Security','Authentication and connectivity status']};
  return <div className="page-heading"><div className="crumb">WORKSPACE <span>/</span> {page.toUpperCase()}</div><h1>{titles[page][0]}</h1><p>{titles[page][1]}</p></div>;
 };
 const diagnosticTiles=<div className="metric-grid">
  <Tile title="Failed jobs (24h)" value={metrics.failedJobs24h===undefined?'Not collected':fmt(metrics.failedJobs24h)} hint="Aggregated SM37 evidence" icon={Activity}/>
  <Tile title="IDoc exceptions" value={metrics.idocErrors24h===undefined?'Not collected':fmt(metrics.idocErrors24h)} hint="Approved status counts" icon={Network}/>
  <Tile title="Custom ABAP objects" value={metrics.customAbapObjects===undefined?'Not collected':fmt(metrics.customAbapObjects)} hint="Inventory, not a quality score" icon={Blocks}/>
  <Tile title="Dumps (7d)" value={(metrics.shortDumps7d??metrics.dumps7d)===undefined?'Not collected':fmt(metrics.shortDumps7d??metrics.dumps7d)} hint="Only if sanitized ST22 provided" icon={Server}/>
 </div>;
 const findingsView=<div className="listpanel">{findings.length?findings.map(f=><button type="button" className={'finding '+(activeItem===f.id?'selected':'')} key={f.id} onClick={()=>setActiveItem(activeItem===f.id?null:f.id)}>
  <span className={'severity '+f.level.toLowerCase()}>{f.level}</span><div className="findingmain"><b>{f.title}</b><p>{f.module} · {f.evidence}</p>
  {activeItem===f.id&&<div className="expanded"><p><b>What we know:</b> {f.explanation}</p><p><b>Next safe step:</b> {f.action}</p><p><b>Root cause:</b> Not confirmed · <b>Source:</b> {snap.source}</p></div>}</div><ArrowRight size={16}/>
 </button>):<Empty title="No evaluated findings">This does not mean the system is healthy. Upload approved data to increase coverage.</Empty>}</div>;
 return <div className="shell">
  <aside className={'sidebar '+(mobileNav?'show':'')}>
   <div className="brand"><span className="brand-icon"><BrainCircuit size={24}/></span><div><strong>ERP Intelligence</strong><small>AI CONSULTING PLATFORM</small></div></div>
   <div className="workspace-card"><span className="eyebrow">ACTIVE WORKSPACE</span><b>{workspace.company}</b><span>QAS / DEV synthetic pilot</span></div>
   <div className="nav-label">PLATFORM</div>
   <nav aria-label="Main navigation">{paths.map(p=><button className={page===p.id?'active':''} key={p.id} onClick={()=>setNav(p.id)}><p.icon size={18}/><span>{p.label}</span>{page===p.id&&<i/>}</button>)}</nav>
   <div className="sidebar-foot"><ShieldCheck size={18}/><span>Encrypted transit · AI execution restricted</span></div>
  </aside>
  {mobileNav&&<button className="overlay" aria-label="Close menu" onClick={()=>setMobileNav(false)} />}
  <main className="main">
   <header className="topbar">
    <button className="mobile-menu" onClick={()=>setMobileNav(true)} aria-label="Open navigation"><Menu size={23}/></button>
    <span className="top-context"><Server size={15}/> <b>{snap.system_sid}</b> · Client {snap.system_client} · {snap.environment}</span>
    <div className="top-actions"><Status tone="warn">{dataLabel}</Status><span className="sep"/>
     {session?<button className="top-button" onClick={logout}><LogOut size={16}/> Sign out</button>:
     <button className="top-button" onClick={()=>setAuthVisible(true)}><LogIn size={16}/> Sign in</button>}</div>
   </header>
   <div className="content">
    {topHeader()}
    {(page==='mission'||page==='business')&&<>
     <div className="banner"><div><span className="eyebrow">REAL DATA MODE · CONTROLLED PILOT</span><h3>Know your ERP. Diagnose with evidence. Act with confidence.</h3><p>No SAP connection exists yet. Import approved DEV/QAS exports for actual diagnostic metrics. Synthetic demo is opt-in only.</p></div><button onClick={()=>setNav('imports')} className="button primary">Import SAP evidence <ArrowRight size={17}/></button></div>
     <SectionTitle title="Business performance" subtitle="Business KPIs require separately authorized production aggregates"><Status tone="warn">{showDemo?'DEMO METRICS':'NO BUSINESS DATA'}</Status></SectionTitle>
     <div className="metric-grid">{business.map(m=><Tile key={m.id} title={m.title} value={showDemo?m.value:'Not collected'} hint={showDemo?m.subtitle:'Requires authorized production business aggregates'} delta={showDemo?m.delta:undefined} icon={m.icon}/>)}</div>
     <div className="two-col">
      <div className="panel"><SectionTitle title="Where to focus" subtitle="Only measured evidence can justify findings"/>{!showDemo&&<div className="info"><ShieldCheck size={19}/><span>Business process health has not been assessed. The items below are generic guidance templates, not detected problems.</span></div>}
       <div className="workstream"><span className="number">01</span><div><strong>Improve receivables visibility</strong><p>Validate overdue receivables, clearing rates and DSO calculation against FI extracts.</p></div><Status>FI/CO</Status></div>
       <div className="workstream"><span className="number">02</span><div><strong>Investigate delivery exceptions</strong><p>Separate late delivery events from unresolved order and IDoc statuses.</p></div><Status>SD</Status></div>
       <div className="workstream"><span className="number">03</span><div><strong>Measure slow-moving inventory</strong><p>Use approved plant-level stock valuation and usage cohorts.</p></div><Status>MM</Status></div>
      </div>
      <div className="panel"><SectionTitle title="Technical highlights" subtitle="System / client scoped counts"/>{diagnosticTiles}<button className="textlink" onClick={()=>setNav('technical')}>Open Technical Assessment <ArrowRight size={15}/></button></div>
     </div>
    </>}
    {page==='technical'&&<>
      <div className="banner slim"><div><span className="eyebrow">EVIDENCE CONTEXT</span><h3>{snap.system_sid} · {snap.environment} · Client {snap.system_client}</h3><p>{snap.release} · {snap.source} · No authenticated live SAP collector connected</p></div><Status tone={snap.is_synthetic?'warn':'neutral'}>{dataLabel}</Status></div>
      {diagnosticTiles}
      <div className="two-col"><div className="panel"><SectionTitle title="Detected signals" subtitle="Deterministic rules applied to available counters"/>{findingsView}</div><div className="panel"><SectionTitle title="What is missing?" subtitle="No green health status without evidence"/>{modules.filter(x=>x[2]!=='Partial').slice(0,7).map(x=><div key={x[1]} className="min-row"><span>{x[0]}</span><Status tone="neutral">NOT ASSESSED</Status></div>)}</div></div>
    </>}
    {page==='modules'&&<div className="panel"><SectionTitle title="SAP coverage matrix" subtitle="A module is only assessed when the relevant checks ran against valid evidence"/><div className="coverage-table">{modules.map(m=><div className="coverage-row" key={m[1]}><span className="code">{m[1]}</span><div><b>{m[0]}</b><small>{m[3]}</small></div><Status tone={m[2]==='Partial'?'warn':'neutral'}>{m[2]}</Status></div>)}</div></div>}
    {page==='findings'&&<div className="panel"><SectionTitle title="Findings & action plan" subtitle="Select a finding to see evidence and the next non-destructive diagnostic step"/>{findingsView}</div>}
    {page==='live'&&<LiveCopilot session={session} snap={snap} supabase={supabase} onSignIn={()=>setAuthVisible(true)}/>}
    {page==='advisor'&&<div className="two-col"><div className="panel"><SectionTitle title="Ask the SAP Consultant" subtitle="Offline diagnostic planner · AI provider not connected to this deployment"/><label className="field-label" htmlFor="sap-question">What do you need to investigate?</label><textarea id="sap-question" rows={5} placeholder="Example: Why are IDocs in error in QAS client 100?" value={query} onChange={e=>setQuery(e.target.value)} maxLength={1500}/><button className="button primary" onClick={generatePlan} disabled={!query.trim()}>Prepare safe investigation <ArrowRight size={16}/></button>{plan&&<pre className="plan">{plan}</pre>}</div><div className="panel"><SectionTitle title="Connected intelligence" subtitle="Source-aware, never guessing"/><div className="workstream"><Status tone="warn">DISABLED</Status><div><b>DeepSeek inference</b><p>Vault key exists in Supabase, but the shared gateway remains disabled pending scoped application credentials and limits.</p></div></div><div className="workstream"><Status tone="warn">MISSING</Status><div><b>Read-only SAP tool calls</b><p>The on-prem Windows/SAP connector must be installed and authorized in DEV/QAS.</p></div></div><div className="workstream"><Status tone="ok">AVAILABLE</Status><div><b>Evidence-based templates</b><p>Deterministic investigation instructions are available without API calls.</p></div></div></div></div>}
    {page==='imports'&&<div className="two-col"><div className="panel"><SectionTitle title="Level 1 · Approved file import" subtitle="Local preview in your browser, no upload to cloud"/><div className="steps">{['Select system','Review data scope','Upload aggregates','Inspect findings'].map((x,i)=><div key={x}><span>{i+1}</span>{x}</div>)}</div><p className="note">Versioned SAP_DIAG_V1 .txt or schemaVersion=1 .json; max 1 MB. Supports 15 aggregate metrics, validates SID/client and DEV/QAS, browser-only processing.</p><label className="checkbox"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/> I am authorized and have removed sensitive or personal data.</label><label className={'uploadbutton '+(!consent?'disabled':'')}><Upload size={19}/> Select authorized SAP .txt / .json<input disabled={!consent} type="file" accept=".txt,.json,text/plain,application/json" onChange={loadJson}/></label>{fileError&&<div className="error">{fileError}</div>}{importInfo&&<p className="note">{importInfo}</p>}</div><div className="panel"><SectionTitle title="Level 2 · DEV/QAS SAP Collector" subtitle="To be implemented with SAP BASIS approval"/>{[['System','System → Status'],['Background jobs','SM37 approved aggregates'],['IDoc monitoring','WE02 / WE05 sanitized totals'],['Custom ABAP','TADIR Z/Y inventory'],['Dumps (optional)','ST22 categories'],['Table statistics (optional)','DB02 / existing TAANA']].map(x=><div className="min-row" key={x[0]}><span>{x[0]}</span><small>{x[1]}</small></div>)}<div className="info"><ShieldCheck size={19}/><span>Transport installation and read access must be approved by the corporate SAP owner. There is no live collector connected yet.</span></div></div></div>}
    {page==='reports'&&<div className="two-col"><div className="panel"><SectionTitle title="Assessment report" subtitle="Current snapshot only"/><div className="report-block"><FileCheck2 size={38}/><h3>{snap.system_sid} / {snap.environment}</h3><p>{snap.source}</p><Status tone={snap.is_synthetic?'warn':'neutral'}>{dataLabel}</Status></div><button className="button primary" onClick={exportReport}><ArrowDownToLine size={17}/> Download JSON report</button></div><div className="panel"><SectionTitle title="Snapshot history" subtitle="JWT-protected Supabase synthetic pilot"/><div className="min-row"><span>Database state</span><Status tone={remoteStatus==='verified'?'ok':'warn'}>{remoteStatus.replaceAll('_',' ').toUpperCase()}</Status></div>{remote.map(x=><button onClick={()=>{setLocal(null);setSelected(x.system_sid);setPage('technical')}} className="snapshot" key={x.system_sid+x.received_at}><Server size={16}/><span>{x.system_sid} · {x.environment} · {x.source}</span><ArrowRight size={15}/></button>)}{!remote.length&&<p className="note">Sign in to query the authenticated synthetic pilot. No customer data are stored in this workspace.</p>}</div></div>}
    {page==='settings'&&<div className="two-col"><div className="panel"><SectionTitle title="Identity" subtitle="Supabase Auth sign-in"/><div className="min-row"><span>Account</span><b>{session?.user?.email||'Demo visitor'}</b></div><div className="min-row"><span>Authentication</span><Status tone={session?'ok':'warn'}>{session?'SIGNED IN':'DEMO MODE'}</Status></div><div className="min-row"><span>Data policy</span><b>Synthetic pilot only</b></div><button className="button ghost" onClick={()=>setAuthVisible(true)}>Sign in with email <ArrowRight size={16}/></button></div><div className="panel"><SectionTitle title="Connection checklist" subtitle="Zero false connectivity claims"/>{[['Supabase Auth',session?'User verified':'Not signed in'],['Pilot synthetic API',remoteStatus==='verified'?'Authenticated':'Not verified'],['SAP DEV Companion','Not installed'],['SAP GUI view',stream?'Local window active':'Not shared'],['Shared DeepSeek Gateway','Disabled by policy'],['Production SAP','No connection']].map(x=><div className="min-row" key={x[0]}><span>{x[0]}</span><small>{x[1]}</small></div>)}</div></div>}
    <footer className="footer">ERP Intelligence AI · Secure staged SaaS foundation v0.7 · <b>{dataLabel}</b> · No live SAP access, production data or automatic write operations</footer>
   </div>
  </main>
  {authVisible&&<div className="modal-backdrop" onClick={()=>setAuthVisible(false)}><div className="modal" onClick={e=>e.stopPropagation()}><button className="close" aria-label="Close" onClick={()=>setAuthVisible(false)}><X size={18}/></button><div className="modal-icon"><KeyRound size={24}/></div><h2>Sign in to ERP Intelligence</h2><p>Use a secure email link to access the authenticated synthetic pilot. Company data and SAP access are not enabled.</p>{session?<><div className="info">Signed in as {session.user.email}</div><button className="button ghost" onClick={logout}>Sign out</button></>:<form onSubmit={runLogin}><label className="field-label" htmlFor="email">Work email</label><input type="email" id="email" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} placeholder="you@company.com" required autoComplete="email"/><button disabled={loginLoading} className="button primary">{loginLoading?'Sending…':'Send secure sign-in link'} <ArrowRight size={16}/></button>{loginMsg&&<p className="note">{loginMsg}</p>}</form>}</div></div>}
 </div>;
}