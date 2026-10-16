import React,{useState} from 'react';
import {ClipboardList,ShieldCheck} from 'lucide-react';
// No network: operator enters actual observed aggregates from SAP DEV/QAS.
// No SAP code, credentials or transport is installed by this component.
const allowed={failedJobs24h:'SM37 · cancelled jobs over last 24h',idocErrors24h:'WE02/WE05 · error-status IDocs over last 24h',shortDumps7d:'ST22 · short dumps over last 7d',customAbapObjects:'Authorized repository Z/Y aggregate'};
export default function ManualSAPIntake({onSnapshot}){
 const [sid,setSid]=useState('DEV'),[client,setClient]=useState('100'),[environment,setEnvironment]=useState('DEV');
 const [release,setRelease]=useState('SAP_BASIS 700 (unverified)'),[values,setValues]=useState({});
 const [approved,setApproved]=useState(false),[message,setMessage]=useState('');
 const submit=(e)=>{
  e.preventDefault();setMessage('');
  if(!approved){setMessage('Confirm authorized read-only observations and no private values.');return;}
  if(!/^[A-Z0-9]{2,12}$/.test(sid)||!/^\d{3}$/.test(client)){setMessage('SID and SAP client are invalid.');return;}
  const metrics={},evidence={};
  for(const [k,v] of Object.entries(values)){
   if(v==='')continue;
   if(!/^\d{1,9}$/.test(String(v))){setMessage('Only non-negative numeric aggregate counts are supported.');return;}
   metrics[k]=Number(v);evidence[k]='User-confirmed '+allowed[k];
  }
  if(!Object.keys(metrics).length){setMessage('Enter at least one observed count from SAP.');return;}
  const snap={system_sid:sid,system_client:client,environment,release,source:'MANUALLY_VERIFIED_SAP_OBSERVATION',
    captured_at:new Date().toISOString(),metrics,evidence,is_synthetic:false};
  onSnapshot(snap);setMessage('Validated locally. Not uploaded.');
 };
 return <form onSubmit={submit} className="sap-manual-form">
  <h3><ClipboardList size={17} style={{verticalAlign:'middle',marginRight:7}}/>Manual SAP Evidence · No transport needed</h3>
  <p className="note">Read the counts in your own SAP GUI and record them here. These are user-declared observations, not data read directly by the AI.</p>
  <div className="sap-manual-meta">
   <label>SID<input value={sid} onChange={e=>setSid(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,12))}/></label>
   <label>Client<input value={client} onChange={e=>setClient(e.target.value.replace(/\D/g,'').slice(0,3))}/></label>
   <label>Environment<select value={environment} onChange={e=>setEnvironment(e.target.value)}><option>DEV</option><option>QAS</option></select></label>
  </div>
  <label>SAP Release (as verified in System → Status)<input value={release} maxLength={100} onChange={e=>setRelease(e.target.value)}/></label>
  {Object.entries(allowed).map(([k,title])=><label key={k}>{title}
   <input inputMode="numeric" type="text" value={values[k]??''} placeholder="Leave empty if not checked" onChange={e=>setValues(v=>({...v,[k]:e.target.value}))}/>
  </label>)}
  <label className="checkbox"><input type="checkbox" checked={approved} onChange={e=>setApproved(e.target.checked)}/> I have authorization for these aggregates; no sensitive business records are included.</label>
  {message&&<p className="note" role="status">{message}</p>}
  <button className="button primary" type="submit"><ShieldCheck size={16}/> Assess verified local observations</button>
 </form>;
}
