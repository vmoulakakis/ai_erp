import React,{useEffect,useMemo,useRef,useState} from 'react';
import {BrainCircuit,Camera,CheckCircle2,ClipboardCopy,Download,EyeOff,FileText,KeyRound,MessageCircle,Monitor,Pause,Play,RotateCcw,Send,ShieldAlert,ShieldCheck,Square,Trash2,UploadCloud,WifiOff,X} from 'lucide-react';

const PREFIX='erp_intelligence_copilot_session_v1';
const CHOICES=[
 ['SM37 jobs','Πώς ελέγχω με ασφάλεια τα αποτυχημένα background jobs στο SM37;'],
 ['ST22 dumps','Πώς αναλύω ένα short dump στο ST22 και ποια στοιχεία χρειάζονται;'],
 ['IDoc error','Βοήθησέ με να διερευνήσω ένα IDoc status/error χωρίς αλλαγή δεδομένων.'],
 ['ABAP review','Τι πρέπει να ελέγξω σε ένα Z/Y ABAP πρόγραμμα στο SAP R/3;'],
];
function clean(v,n){return typeof v==='string'?v.trim().slice(0,n):''}
function guide(q,ctx){
 const s=q.toLowerCase();
 const base=['**Context:** '+ctx.sid+' / '+ctx.client+' / '+ctx.env+(ctx.tcode?' · '+ctx.tcode:''),
 '**Read-only investigation guide — not an AI response and no SAP action was performed.**'];
 const lines=s.includes('idoc')||s.includes('we02')||s.includes('we05')?[
 '1. Open WE02 or WE05 and limit the selection by date, IDoc type and status.',
 '2. Read the status records and error text; avoid opening or exporting segment contents.',
 '3. Identify message type, direction and processing phase. Distinguish status metadata from actual business failure.',
 '4. Compare with BD87 only for inspection; do not reprocess without a change approval.'
 ]:s.includes('dump')||s.includes('st22')?[
 '1. Open ST22, filter by date, time and affected user/program.',
 '2. Record exception category, runtime error, ABAP program and line number (omit private values).',
 '3. Check transport history / recent code changes with a BASIS or ABAP owner.',
 '4. Confirm impact in DEV/QAS before proposing a fix; never execute generated code automatically.'
 ]:s.includes('abap')||s.includes('se38')?[
 '1. Open SE38/SE80 on the approved DEV client and inspect the program.',
 '2. Check syntax/release compatibility, database access, SELECT conditions and variants.',
 '3. If authorized, capture a sanitized static-code excerpt and explain its purpose.',
 '4. Test changes through normal SAP transport approval; no direct production write.'
 ]:[
 '1. Open SM37 and filter by the last 24 hours and status Cancelled/Finished.',
 '2. Review the job log of relevant failures; check related ST22 dumps if available.',
 '3. Identify recurring job name, program/variant, dates and dependencies.',
 '4. Decide the next non-destructive check; do not restart jobs automatically.'
 ];
 return [...base,'',...lines,'','For contextual interpretation by a live LLM, a separately authorized and tested model gateway is required.'];
}
export default function LiveCopilot({session,snap,onSignIn}){
 const [stream,setStream]=useState(null);
 const streamRef=useRef(null),videoRef=useRef(null),canvasRef=useRef(null),previewRef=useRef(null);
 const [captureError,setCaptureError]=useState('');
 const [capture,setCapture]=useState('');
 const [showMask,setShowMask]=useState(false);
 const [masking,setMasking]=useState(false);
 const [activeMask,setActiveMask]=useState(null);
 const [tcode,setTcode]=useState('');
 const [notes,setNotes]=useState('');
 const [question,setQuestion]=useState('');
 const [messages,setMessages]=useState([]);
 const [sensitiveOk,setSensitiveOk]=useState(false);
 const [lastAction,setLastAction]=useState('');
 const [activeTab,setActiveTab]=useState('chat');
 const [showHelp,setShowHelp]=useState(false);
 const context=useMemo(()=>({sid:clean(snap.system_sid,12)||'DEV',client:clean(snap.system_client,3)||'100',env:clean(snap.environment,3)||'DEV',tcode:clean(tcode,30)}),[snap.system_sid,snap.system_client,snap.environment,tcode]);
 const storageKey=PREFIX+'_'+(session?.user?.id||'demo')+'_'+context.sid+'_'+context.client;
 useEffect(()=>{
  try{const j=JSON.parse(sessionStorage.getItem(storageKey)||'{}');setMessages(Array.isArray(j.messages)?j.messages.slice(-24):[]);setNotes(clean(j.notes||'',1000));setTcode(clean(j.tcode||'',30))}catch{setMessages([]);setNotes('');}
 },[storageKey]);
 useEffect(()=>{try{sessionStorage.setItem(storageKey,JSON.stringify({messages:messages.slice(-24),notes,tcode}))}catch{}},[messages,notes,tcode,storageKey]);
 useEffect(()=>{
  if(stream&&videoRef.current){videoRef.current.srcObject=stream;videoRef.current.play().catch(()=>{});}
 },[stream]);
 useEffect(()=>()=>{streamRef.current?.getTracks().forEach(t=>t.stop());},[]);
 const start=async()=>{
  setCaptureError('');
  if(!navigator.mediaDevices?.getDisplayMedia){setCaptureError('Χρειάζεται HTTPS και πρόσφατος Chrome/Edge.');return;}
  try{
   const s=await navigator.mediaDevices.getDisplayMedia({video:{cursor:'always'},audio:false});
   streamRef.current=s;setStream(s);
   s.getVideoTracks()[0].addEventListener('ended',()=>{setStream(null);streamRef.current=null;},{once:true});
  }catch(e){setCaptureError(e?.name==='NotAllowedError'?'Η κοινή χρήση ακυρώθηκε.':'Δεν δόθηκε πρόσβαση στο παράθυρο SAP.');}
 };
 const stop=()=>{streamRef.current?.getTracks().forEach(t=>t.stop());streamRef.current=null;setStream(null);setCapture('');setShowMask(false);};
 const snapshot=()=>{
  const v=videoRef.current;if(!v||!v.videoWidth){setCaptureError('Το SAP window δεν έχει ακόμη ενεργό frame.');return;}
  const target=canvasRef.current;
  const width=Math.min(1120,v.videoWidth),height=Math.round(width*v.videoWidth**-1*v.videoHeight);
  target.width=width;target.height=height;
  target.getContext('2d').drawImage(v,0,0,width,height);
  setCapture(target.toDataURL('image/jpeg',.72));
  setMasking(false);setShowMask(true);setSensitiveOk(false);
  setActiveTab('screen');setLastAction('Local screenshot captured. Nothing uploaded.');
 };
 useEffect(()=>{
  const can=previewRef.current;
  if(can&&capture){const im=new Image();im.onload=()=>{can.width=im.naturalWidth;can.height=im.naturalHeight;can.getContext('2d').drawImage(im,0,0);};im.src=capture;}
 },[capture,activeTab]);
 const down=(e)=>{if(!masking||!previewRef.current)return;
  const r=e.currentTarget.getBoundingClientRect();
  setActiveMask({x:(e.clientX-r.left)/r.width*e.currentTarget.width,y:(e.clientY-r.top)/r.height*e.currentTarget.height});
  e.currentTarget.setPointerCapture?.(e.pointerId);
 };
 const up=(e)=>{if(!activeMask||!previewRef.current)return;const c=previewRef.current,r=c.getBoundingClientRect();const x=(e.clientX-r.left)/r.width*c.width,y=(e.clientY-r.top)/r.height*c.height;
  const ctx=c.getContext('2d');ctx.fillStyle='#000';ctx.fillRect(Math.min(x,activeMask.x),Math.min(y,activeMask.y),Math.abs(x-activeMask.x),Math.abs(y-activeMask.y));setActiveMask(null);
  setCapture(c.toDataURL('image/jpeg',.73));setSensitiveOk(false);setLastAction('Selected region permanently covered in this local preview.');
 };
 const download=()=>{if(!capture)return;const a=document.createElement('a');a.href=capture;a.download='sap-redacted-local-'+Date.now()+'.jpg';a.click();};
 const guideQuestion=(txt)=>{
  const q=clean(txt,1600);if(!q)return;
  setMessages(m=>[...m,{role:'user',content:q,time:Date.now()},{role:'guide',content:guide(q,context).join('\n'),time:Date.now()}].slice(-24));
  setQuestion('');setActiveTab('chat');
 };
 const exportContext=()=>{
  const body=['ERP Intelligence SAP session diagnostic package','System: '+context.sid,'Client: '+context.client,'Environment: '+context.env,'Transaction: '+(context.tcode||'not entered'),
   'Notes (manually sanitized): '+clean(notes,1000),'Question: '+clean(question,1600),'','No automatic live SAP database connection. Screen content not included. Never paste SAP passwords or private data.'].join('\n');
  navigator.clipboard?.writeText(body).then(()=>setLastAction('Context copied. No SAP screen or login data included.'),()=>setLastAction('Clipboard permission denied.'));
 };
 const reset=()=>{setMessages([]);setNotes('');setQuestion('');sessionStorage.removeItem(storageKey);setLastAction('Session messages and notes cleared from this browser tab.');};
 return <div className="liveapp">
  <div className="banner slim"><div><span className="eyebrow">SAP LIVE WORKSPACE / COPILOT WORKBENCH</span><h3>Work in SAP with an AI conversation beside you</h3><p>Controlled browser session: one SAP GUI window, SAP context, local session history, guided checks and prepared screen review. Model inference is not connected yet.</p></div><span className={'status '+(stream?'status-ok':'status-warn')}>{stream?'WINDOW SHARING':'NO SAP WINDOW'}</span></div>
  <div className="live-body">
   <section className="panel live-view">
    <div className="sectiontitle"><div><h2><Monitor size={16} style={{verticalAlign:'middle',marginRight:8}}/> SAP GUI window</h2><p>{context.sid} · Client {context.client} · {context.env} · Read-only view</p></div>
    <div className="live-toolbar">{stream?<><button className="button ghost" onClick={snapshot}><Camera size={15}/> Capture frame</button><button className="button danger" onClick={stop}><Square size={15}/> Stop</button></>:<button className="button primary" onClick={start}><Monitor size={15}/> Share SAP window</button>}</div>
    </div>
    <div className="video-wrap live-player">{stream?<video ref={videoRef} autoPlay muted playsInline/>:<div className="video-empty"><Monitor size={48}/><h3>Open SAP DEV on your PC</h3><p>Click Share SAP window and choose only the SAP GUI window. SAP login stays in SAP GUI; the app cannot control keyboard or mouse inside the stream.</p></div>}</div>
    <canvas ref={canvasRef} style={{display:'none'}}/>
    {captureError&&<p className="error">{captureError}</p>}
    <div className="live-context"><label>SAP Transaction / T-Code<input value={tcode} onChange={e=>setTcode(e.target.value.toUpperCase().replace(/[^A-Z0-9_/-]/g,'').slice(0,30))} placeholder="e.g. WE02, ST22, SE38" /></label>
    <label>Session notes (local only)<textarea value={notes} onChange={e=>setNotes(e.target.value.slice(0,1000))} rows={2} placeholder="Keep safe observations, no passwords or sensitive business details…"/></label></div>
    <div className="info"><ShieldCheck size={18}/><span>Browser screen sharing is local. No live screenshots are automatically uploaded or analyzed. Use Capture frame only when the screen contains no passwords or restricted business data.</span></div>
   </section>
   <section className="panel live-chat">
    <div className="sectiontitle"><div><h2><BrainCircuit size={17} style={{verticalAlign:'middle',marginRight:8}}/> SAP Conversation</h2><p>System-aware chat + session history</p></div><span className="status status-warn">LLM OFFLINE</span></div>
    <div className="live-tabs"><button className={activeTab==='chat'?'active':''} onClick={()=>setActiveTab('chat')}><MessageCircle size={15}/> Chat</button><button className={activeTab==='screen'?'active':''} onClick={()=>setActiveTab('screen')}><Camera size={15}/> Screen review</button><button className={activeTab==='memory'?'active':''} onClick={()=>setActiveTab('memory')}><FileText size={15}/> Memory</button></div>
    {activeTab==='chat'&&<div className="live-chatbox">
      <div className="chat-feed" role="log" aria-live="polite">
       {!messages.length&&<div className="chat-empty"><BrainCircuit size={30}/><h3>Ready for your SAP question</h3><p>The secure LLM gateway still needs activation. You can use the guided diagnostic templates now, with session memory preserved in this tab.</p></div>}
       {messages.map((m,i)=><article key={i} className={'chat-bubble '+(m.role==='user'?'human':'assistant')}><div className="chat-role">{m.role==='user'?'YOU':'LOCAL GUIDED CHECK · NOT LLM'}</div><div className="chat-text">{m.content}</div></article>)}
      </div>
      <div className="quick-prompts">{CHOICES.map(([label,q])=><button key={label} onClick={()=>guideQuestion(q)}>{label}</button>)}</div>
      <div className="chat-composer"><textarea rows={3} value={question} maxLength={1600} onChange={e=>setQuestion(e.target.value)} placeholder="Ρώτησε για το SAP transaction, dump, IDoc, πρόγραμμα…"/><div className="chat-actions"><button className="button ghost" onClick={exportContext}><ClipboardCopy size={14}/> Copy context</button><button className="button primary" disabled={!question.trim()} onClick={()=>guideQuestion(question)}><Send size={14}/> Guided check</button></div></div>
    </div>}
    {activeTab==='screen'&&<div className="screen-review">
      {!capture?<div className="chat-empty"><Camera size={28}/><h3>No screenshot captured</h3><p>Share SAP, then click Capture frame. You can black out sensitive sections before saving a local image.</p></div>:<>
       <p className="note">Click «Mask regions», then drag over passwords, identities, customer details or other sensitive areas. Every black rectangle is applied locally to the image.</p>
       <canvas className={'privacy-canvas '+(masking?'is-masking':'')} ref={previewRef} onPointerDown={down} onPointerUp={up} />
       <div className="chat-actions"><button className="button ghost" onClick={()=>setMasking(!masking)}><EyeOff size={15}/> {masking?'Stop masking':'Mask regions'}</button><button className="button ghost" onClick={download}><Download size={15}/> Save redacted JPG</button><button className="button ghost" onClick={()=>{setCapture('');setSensitiveOk(false)}}><Trash2 size={15}/> Remove</button></div>
       <label className="checkbox"><input type="checkbox" checked={sensitiveOk} onChange={e=>setSensitiveOk(e.target.checked)} /> I have reviewed the image and removed all sensitive data.</label>
       <div className="info"><ShieldAlert size={17}/><span>The image remains in this browser; transmission to an AI provider is disabled until an authenticated multimodal endpoint is security-reviewed. You can save a redacted copy to submit manually after company approval.</span></div>
      </>}
     </div>}
    {activeTab==='memory'&&<div className="memory-panel"><div className="min-row"><span>System / Client</span><b>{context.sid} / {context.client}</b></div><div className="min-row"><span>Environment</span><b>{context.env}</b></div><div className="min-row"><span>Transaction</span><b>{context.tcode||'Not specified'}</b></div><div className="min-row"><span>Messages</span><b>{messages.length}</b></div><p className="note">Memory is stored only in this browser tab (sessionStorage) under the selected account and system. Screenshots are not saved. This is not yet persistent encrypted enterprise memory.</p><button className="button danger" onClick={reset}><Trash2 size={15}/> Clear session memory</button></div>}
    <div className="connection-strip"><span><WifiOff size={14}/> DeepSeek not connected</span><span><ShieldCheck size={14}/> No SAP writes</span></div>
   </section>
  </div>
  {!!lastAction&&<p className="note">{lastAction}</p>}
 </div>;
}
