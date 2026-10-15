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
export default function LiveCopilot({session,snap,onSignIn,supabase}){
 const [stream,setStream]=useState(null);
 const streamRef=useRef(null),videoRef=useRef(null),canvasRef=useRef(null),previewRef=useRef(null);
 const [captureError,setCaptureError]=useState('');
 const [capture,setCapture]=useState('');
 const [showMask,setShowMask]=useState(false);
 const [masking,setMasking]=useState(false);
 const [activeMask,setActiveMask]=useState(null);
 const [sapSid,setSapSid]=useState('DEV');
 const [sapClient,setSapClient]=useState('100');
 const [sapEnv,setSapEnv]=useState('DEV');
 const [tcode,setTcode]=useState('');
 const [notes,setNotes]=useState('');
 const [question,setQuestion]=useState('');
 const [messages,setMessages]=useState([]);
 const [sensitiveOk,setSensitiveOk]=useState(false);
 const [lastAction,setLastAction]=useState('');
 const [sending,setSending]=useState(false);
 const [chatError,setChatError]=useState('');
 const [attachScreen,setAttachScreen]=useState(false);
 const [connectionState,setConnectionState]=useState('not-tested');
 const [endpointReady,setEndpointReady]=useState(false);
 const [provider,setProvider]=useState('deepseek');
 const [model,setModel]=useState('deepseek-flash');
 const [customModel,setCustomModel]=useState('');
 const [catalog,setCatalog]=useState([]);
 const [providerStatuses,setProviderStatuses]=useState({});
 const currentModelId=model==='custom'?customModel.trim():model;
 const chosenCapability=catalog.find(m=>m.provider===provider&&m.id===currentModelId);
 const canReadScreen=!!chosenCapability?.vision;
 const [activeTab,setActiveTab]=useState('chat');
 const [showHelp,setShowHelp]=useState(false);
 const context=useMemo(()=>({sid:clean(sapSid,12)||'DEV',client:clean(sapClient,3)||'100',env:sapEnv,tcode:clean(tcode,30)}),[sapSid,sapClient,sapEnv,tcode]);
 const storageKey=PREFIX+'_'+(session?.user?.id||'demo')+'_'+context.sid+'_'+context.client;
 useEffect(()=>{
  let active=true;
  setEndpointReady(false);
  if(!session?.access_token||!supabase)return;
  supabase.functions.invoke('erp-copilot-chat',{method:'GET'})
    .then(({data,error})=>{
      if(!active||error)return;
      const list=Array.isArray(data?.models)?data.models:[];
      const states=Object.fromEntries((data?.providers||[]).map(p=>[p.id,p.ready===true]));
      setCatalog(list);setProviderStatuses(states);setEndpointReady(data?.ready===true);
    })
    .catch(()=>{if(active)setEndpointReady(false)});
  return()=>{active=false};
 },[session?.access_token,supabase]);
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
 const sendToAI=async()=>{
  const q=clean(question,1600);
  if(!q||sending)return;
  setChatError('');
  if(!session?.access_token||!supabase){onSignIn?.();setChatError('Για πραγματικό AI chat χρειάζεται η δική σου επιβεβαιωμένη σύνδεση ERP. Δεν ζητάμε SAP password.');return}
  if(!endpointReady||!providerStatuses[provider]){setChatError('Ο πάροχος '+provider+' δεν είναι ακόμη ενεργός στον ασφαλή server. Δεν στάλθηκε η ερώτηση ή screenshot. Χρησιμοποίησε Offline guide.');return}
  if(!currentModelId){setChatError('Επίλεξε μοντέλο για να συνεχίσεις.');return}
  if(attachScreen&&!canReadScreen){setChatError('Αυτό το μοντέλο δεν έχει επιβεβαιωμένη υποστήριξη screenshot. Επίλεξε μοντέλο Vision.');return}
  if(attachScreen&&(!capture||!sensitiveOk)){setActiveTab('screen');setChatError('Capture frame, κάλυψε εμπιστευτικά στοιχεία και επίλεξε ότι έλεγξες την εικόνα.');return}
  const history=messages.filter(m=>m.role==='user'||m.role==='assistant').slice(-8).map(m=>({role:m.role,content:m.content}));
  setSending(true);
  setMessages(m=>[...m,{role:'user',content:q+(attachScreen?' [Επισυνάφθηκε εγκεκριμένη εικόνα SAP]':''),time:Date.now()}].slice(-24));
  setQuestion('');
  try{
   const {data,error}=await supabase.functions.invoke('erp-copilot-chat',{body:{
     purpose:'sap-dev-qas-copilot',dataClassification:'redacted-approved',
     message:q,provider,model:currentModelId,context:{sid:context.sid,client:context.client,environment:context.env,tcode:context.tcode},
     history,
     image:attachScreen?capture:undefined,imageConsent:attachScreen&&sensitiveOk
   }});
   if(error||!data?.answer){
     let reason=data?.error||'';
     try{if(error?.context?.json){const body=await error.context.json();reason=body?.message||body?.error||reason}}catch{}
     setConnectionState('unavailable');
     const info=reason==='copilot_not_enabled'
      ?'Το ασφαλές AI endpoint είναι εγκατεστημένο, αλλά δεν έχει ενεργοποιηθεί ακόμη το server-only κλειδί και τα όρια κόστους.'
      :'Η ζωντανή σύνδεση AI δεν ολοκληρώθηκε ('+(reason||'endpoint_unavailable')+'). Δεν εμφανίζουμε τοπικές οδηγίες ως απάντηση LLM.';
     setChatError(info);
   }else{
     setMessages(m=>[...m,{role:'assistant',content:clean(data.answer,9000),time:Date.now(),screen:!!data.usedScreen,provider:data.provider,model:data.model}].slice(-24));
     setConnectionState('available');
     setLastAction(data.usedScreen?'Το '+(data.model||'AI')+' ανέλυσε το screenshot που ενέκρινες.':(data.model||'AI')+' απάντησε με κείμενο και δηλωμένο SAP context — χωρίς αποστολή εικόνας.');
   }
  }catch{setChatError('Δεν ολοκληρώθηκε η AI κλήση. Τα στοιχεία της συνεδρίας παραμένουν στο browser.');setConnectionState('unavailable')}
  finally{setSending(false);setAttachScreen(false)}
 };
 const exportContext=()=>{
  const body=['ERP Intelligence SAP session diagnostic package','System: '+context.sid,'Client: '+context.client,'Environment: '+context.env,'Transaction: '+(context.tcode||'not entered'),
   'Notes (manually sanitized): '+clean(notes,1000),'Question: '+clean(question,1600),'','No automatic live SAP database connection. Screen content not included. Never paste SAP passwords or private data.'].join('\n');
  navigator.clipboard?.writeText(body).then(()=>setLastAction('Context copied. No SAP screen or login data included.'),()=>setLastAction('Clipboard permission denied.'));
 };
 const reset=()=>{setMessages([]);setNotes('');setQuestion('');sessionStorage.removeItem(storageKey);setLastAction('Session messages and notes cleared from this browser tab.');};
 return <div className="liveapp">
  <div className="banner slim"><div><span className="eyebrow">SAP LIVE WORKSPACE / COPILOT WORKBENCH</span><h3>Work in SAP with an AI conversation beside you</h3><p>Πραγματικό SAP window αριστερά, SAP Consultant chat δεξιά. Στείλε επιλεγμένο και καθαρισμένο frame όταν το AI χρειάζεται να δει την οθόνη. Δεν υπάρχει άμεσο SAP RFC/GUI control.</p></div><span className={'status '+(stream?'status-ok':'status-warn')}>{stream?'WINDOW SHARING':'NO SAP WINDOW'}</span></div>
  <div className="live-body">
   <section className="panel live-view">
    <div className="sectiontitle"><div><h2><Monitor size={16} style={{verticalAlign:'middle',marginRight:8}}/> SAP GUI window</h2><p>{context.sid} · Client {context.client} · {context.env} · Read-only view</p></div>
    <div className="live-toolbar">{stream?<><button className="button ghost" onClick={snapshot}><Camera size={15}/> Capture frame</button><button className="button danger" onClick={stop}><Square size={15}/> Stop</button></>:<button className="button primary" onClick={start}><Monitor size={15}/> Share SAP window</button>}</div>
    </div>
    <div className="video-wrap live-player">{stream?<video ref={videoRef} autoPlay muted playsInline/>:<div className="video-empty"><Monitor size={48}/><h3>Open SAP DEV on your PC</h3><p>Click Share SAP window and choose only the SAP GUI window. SAP login stays in SAP GUI; the app cannot control keyboard or mouse inside the stream.</p></div>}</div>
    <canvas ref={canvasRef} style={{display:'none'}}/>
    {captureError&&<p className="error">{captureError}</p>}
    <div className="live-target"><label>SID<input value={sapSid} onChange={e=>setSapSid(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,12))} aria-label="SAP SID"/></label><label>Client<input value={sapClient} onChange={e=>setSapClient(e.target.value.replace(/[^0-9]/g,'').slice(0,3))} aria-label="SAP client"/></label><label>Environment<select value={sapEnv} onChange={e=>setSapEnv(e.target.value)}><option value="DEV">DEV</option><option value="QAS">QAS</option></select></label></div>
    <div className="live-context"><label>SAP Transaction / T-Code<input value={tcode} onChange={e=>setTcode(e.target.value.toUpperCase().replace(/[^A-Z0-9_/-]/g,'').slice(0,30))} placeholder="e.g. WE02, ST22, SE38" /></label>
    <label>Session notes (local only)<textarea value={notes} onChange={e=>setNotes(e.target.value.slice(0,1000))} rows={2} placeholder="Keep safe observations, no passwords or sensitive business details…"/></label></div>
    <div className="info"><ShieldCheck size={18}/><span>Browser screen sharing is local. No live screenshots are automatically uploaded or analyzed. Use Capture frame only when the screen contains no passwords or restricted business data.</span></div>
   </section>
   <section className="panel live-chat">
    <div className="sectiontitle"><div><h2><BrainCircuit size={17} style={{verticalAlign:'middle',marginRight:8}}/> SAP Conversation</h2><p>System-aware chat + session history</p></div><span className={'status '+(connectionState==='available'?'status-ok':'status-warn')}>{endpointReady?'AI READY':'AI OFFLINE'}</span></div>
    
    <div className="model-picker">
      <div className="model-picker-title"><BrainCircuit size={15}/> AI Model Selection <span className={'status '+(providerStatuses[provider]?'status-ok':'status-warn')}>{providerStatuses[provider]?'BACKEND READY':'NOT CONFIGURED'}</span></div>
      <div className="model-picker-fields">
        <label>Provider<select value={provider} onChange={e=>{
          const selected=e.target.value;
          setProvider(selected);
          const first=catalog.find(m=>m.provider===selected);
          setModel(first?.id||(selected==='openai'?'gpt-4.1-mini':selected==='huggingface'?'openai/gpt-oss-120b':'deepseek-flash'));
          setAttachScreen(false);
        }}><option value="deepseek">DeepSeek</option><option value="openai">OpenAI</option><option value="huggingface">Hugging Face</option></select></label>
        <label>Model<select value={model} onChange={e=>{setModel(e.target.value);setAttachScreen(false)}}>
          {(catalog.length?catalog:[
            {provider:'deepseek',id:'deepseek-flash',label:'DeepSeek Flash'},
            {provider:'openai',id:'gpt-4.1-mini',label:'GPT-4.1 mini'},
            {provider:'openai',id:'gpt-4o-mini',label:'GPT-4o mini'},
            {provider:'huggingface',id:'openai/gpt-oss-120b',label:'GPT-OSS 120B'}
          ]).filter(m=>m.provider===provider).map(m=><option key={m.id} value={m.id}>{m.label||m.id}{m.vision?' · Vision':''}</option>)}
          <option value="custom">Other model ID (text only)</option>
        </select></label>
      </div>
      {model==='custom'&&<label className="model-custom">Custom model ID<input value={customModel} maxLength={160} onChange={e=>setCustomModel(e.target.value)} placeholder={provider==='huggingface'?'author/model-name':'provider model id'}/></label>}
      <div className="model-picker-note">{canReadScreen?'Image + text supported by selected model.':'Text mode. For SAP screenshots, select an approved Vision model.'} Το ιστορικό παραμένει στην ίδια συνεδρία.</div>
    </div>
    <div className="live-tabs"><button className={activeTab==='chat'?'active':''} onClick={()=>setActiveTab('chat')}><MessageCircle size={15}/> Chat</button><button className={activeTab==='screen'?'active':''} onClick={()=>setActiveTab('screen')}><Camera size={15}/> Screen review</button><button className={activeTab==='memory'?'active':''} onClick={()=>setActiveTab('memory')}><FileText size={15}/> Memory</button></div>
    {activeTab==='chat'&&<div className="live-chatbox">
      <div className="chat-feed" role="log" aria-live="polite">
       {!messages.length&&<div className="chat-empty"><BrainCircuit size={30}/><h3>Ready for your SAP question</h3><p>Ρώτησε τον AI consultant για το SAP σου. Η πρόσβαση στο μοντέλο απαιτεί ενεργοποίηση του ασφαλούς backend. Μπορείς να χρησιμοποιήσεις και τις τοπικές οδηγίες όσο είναι ανενεργό.</p></div>}
       {messages.map((m,i)=><article key={i} className={'chat-bubble '+(m.role==='user'?'human':'assistant')}><div className="chat-role">{m.role==='user'?'YOU':m.role==='assistant'?(m.provider||'MODEL')+' · '+(m.model||'AI SAP CONSULTANT'):'LOCAL GUIDED CHECK · NOT LLM'}</div><div className="chat-text">{m.content}</div></article>)}
      </div>
      <div className="quick-prompts">{CHOICES.map(([label,q])=><button key={label} onClick={()=>setQuestion(q)}>{label}</button>)}</div>
      <div className="chat-composer">
       <textarea rows={3} value={question} maxLength={1600} onChange={e=>setQuestion(e.target.value)} placeholder="Ρώτησε τον SAP Consultant: Τι βλέπεις; Πού να πατήσω; Τι σημαίνει το σφάλμα;"/>
       <div className="chat-capture">
         <button className="button ghost" disabled={!stream} onClick={()=>{snapshot();setActiveTab('screen')}}><Camera size={14}/> Capture & mask</button>
         <label className="checkbox"><input type="checkbox" disabled={!capture||!sensitiveOk||!canReadScreen} checked={attachScreen} onChange={e=>setAttachScreen(e.target.checked)}/> Send reviewed screen with next question</label>
       </div>
       {chatError&&<p className="error" role="alert">{chatError}</p>}
       <div className="chat-actions">
         <button className="button ghost" onClick={exportContext}><ClipboardCopy size={14}/> Copy context</button>
         <button className="button ghost" disabled={!question.trim()||sending} onClick={()=>guideQuestion(question)}>Offline guide</button>
         <button className="button primary" disabled={!question.trim()||sending} onClick={sendToAI}><Send size={14}/>{sending?'Thinking…':'Ask AI Consultant'}</button>
       </div>
      </div>
    </div>}
    {activeTab==='screen'&&<div className="screen-review">
      {!capture?<div className="chat-empty"><Camera size={28}/><h3>No screenshot captured</h3><p>Share SAP, then click Capture frame. You can black out sensitive sections before saving a local image.</p></div>:<>
       <p className="note">Σκέπασε κωδικούς, στοιχεία πελατών και προσωπικά δεδομένα. Η εικόνα μεταδίδεται μόνο αν επιλέξεις «Send reviewed screen» και καλέσεις το AI. Η απόκρυψη αποτελεί δική σου ευθύνη.</p>
       <canvas className={'privacy-canvas '+(masking?'is-masking':'')} ref={previewRef} onPointerDown={down} onPointerUp={up} />
       <div className="chat-actions"><button className="button ghost" onClick={()=>setMasking(!masking)}><EyeOff size={15}/> {masking?'Stop masking':'Mask regions'}</button><button className="button ghost" onClick={download}><Download size={15}/> Save redacted JPG</button><button className="button ghost" onClick={()=>{setCapture('');setSensitiveOk(false)}}><Trash2 size={15}/> Remove</button></div>
       <label className="checkbox"><input type="checkbox" checked={sensitiveOk} onChange={e=>setSensitiveOk(e.target.checked)} /> I have reviewed the image and removed all sensitive data.</label>
       <div className="info"><ShieldAlert size={17}/><span>Κανονικά παραμένει τοπικά. Θα σταλεί στο DeepSeek μόνο με δική σου ρητή επιλογή στο Chat, μετά από έγκριση της εταιρικής πολιτικής. Το AI endpoint παραμένει απενεργοποιημένο μέχρι να ολοκληρωθεί η ασφαλής διαμόρφωσή του.</span></div>
      </>}
     </div>}
    {activeTab==='memory'&&<div className="memory-panel"><div className="min-row"><span>System / Client</span><b>{context.sid} / {context.client}</b></div><div className="min-row"><span>Environment</span><b>{context.env}</b></div><div className="min-row"><span>Transaction</span><b>{context.tcode||'Not specified'}</b></div><div className="min-row"><span>Messages</span><b>{messages.length}</b></div><p className="note">Memory is stored only in this browser tab (sessionStorage) under the selected account and system. Screenshots are not saved. This is not yet persistent encrypted enterprise memory.</p><button className="button danger" onClick={reset}><Trash2 size={15}/> Clear session memory</button></div>}
    <div className="connection-strip"><span><WifiOff size={14}/> {provider} · {model==='custom'?customModel:model} · {providerStatuses[provider]?'Active':'Not configured'}</span><span><ShieldCheck size={14}/> No SAP writes</span></div>
   </section>
  </div>
  {!!lastAction&&<p className="note">{lastAction}</p>}
 </div>;
}
