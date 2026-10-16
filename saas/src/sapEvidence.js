// ERP Intelligence: approved offline SAP diagnostic export reader.
// This parser runs exclusively in the browser. No SAP passwords or raw business data.
export const SAP_METRICS=Object.freeze({
 failedJobs24h:"BASIS",shortDumps7d:"BASIS",idocErrors24h:"IDOC",idocOldestHours:"IDOC",
 fiUnreconciledDocuments:"FI",coAllocationErrors:"CO",mmInventoryDifferences:"MM",
 sdBillingErrors:"SD",customAbapObjects:"ABAP",atcHighFindings:"ABAP",dbSizeGb:"ARCHIVE",
 dbGrowthGbMonth:"ARCHIVE",archivingBacklogYears:"ARCHIVE",
 migrationSimplificationItems:"MIGRATION",criticalAuthorizationFindings:"SECURITY"
});
export function readSapDiagnostic(text, filename=""){
 if(typeof text!=="string"||text.length>1024*1024)throw Error("File must be no larger than 1 MB.");
 let input;
 if(filename.toLowerCase().endsWith(".json"))input=JSON.parse(text);
 else if(filename.toLowerCase().endsWith(".txt")){
  const lines=text.split(/\r?\n/).map(x=>x.trim()).filter(x=>x.includes("SAP_DIAG_V1|"));
  if(!lines.length||lines.length>300)throw Error("No valid SAP_DIAG_V1 lines or record limit exceeded.");
  const meta={},metrics={},evidence={},seen=new Set();
  for(const line of lines){
   const ix=line.indexOf("SAP_DIAG_V1|");if(ix>18)throw Error("Invalid line prefix.");
   const parts=line.slice(ix).split("|").map(x=>x.trim());
   if(parts.length!==4||parts[0]!=="SAP_DIAG_V1")throw Error("Malformed SAP export record.");
   const [,field,value,source]=parts;
   if(seen.has(field)||!source||source.length>150)throw Error("Duplicate field / invalid provenance.");
   seen.add(field);
   if(field.startsWith("system.")){
    const name=field.slice(7);
    if(!["sid","client","environment","release","localDate","localTime"].includes(name)||value.length>100)throw Error("Unexpected system field.");
    meta[name]=value;
   }else if(field.startsWith("metric.")){
    const name=field.slice(7);
    if(!Object.hasOwn(SAP_METRICS,name)||!/^\d{1,10}$/.test(value))throw Error("Unapproved diagnostic metric: "+name);
    metrics[name]=Number(value);evidence[name]="SAP export / "+source;
   }else throw Error("Unexpected export field.");
  }
  if(!/^\d{8}$/.test(meta.localDate||"")||!/^\d{6}$/.test(meta.localTime||""))throw Error("SAP local capture date/time missing.");
  const stamp=meta.localDate+" "+meta.localTime+" (SAP local)";
  Object.keys(evidence).forEach(k=>evidence[k]+=" / "+stamp);
  input={schemaVersion:1,system:{sid:meta.sid,client:meta.client,environment:meta.environment,
   release:meta.release||"Unspecified",database:"Not collected",capturedAt:new Date().toISOString()},metrics,evidence};
 }else throw Error("Only .json and SAP_DIAG_V1 .txt are supported.");
 if(!input||input.schemaVersion!==1||!input.system||!input.metrics)throw Error("Invalid diagnostic schemaVersion 1.");
 const s=input.system;
 if(!/^[A-Z0-9]{2,12}$/i.test(s.sid||"")||!/^\d{3}$/.test(s.client||"")||!["DEV","QAS"].includes(s.environment))
 throw Error("SID, 3-digit client or DEV/QAS environment invalid.");
 if(typeof s.release!=="string"||s.release.length>100||typeof s.database!=="string"||s.database.length>100||Number.isNaN(Date.parse(s.capturedAt)))
 throw Error("Release/database/timestamp invalid.");
 const m=input.metrics;if(typeof m!=="object"||Array.isArray(m))throw Error("Invalid metrics.");
 const cleanMetrics={};
 for(const [key,value] of Object.entries(m)){
  if(!Object.hasOwn(SAP_METRICS,key)||typeof value!=="number"||!Number.isFinite(value)||value<0||value>1e9)throw Error("Unapproved or invalid aggregate: "+key);
  cleanMetrics[key]=value;
 }
 if(!Object.keys(cleanMetrics).length)throw Error("File has no validated numeric evidence.");
 const evidence={};
 for(const [key,value] of Object.entries(input.evidence||{})){
  if(!Object.hasOwn(SAP_METRICS,key)||typeof value!=="string"||value.length>240)throw Error("Invalid evidence metadata.");
  evidence[key]=value;
 }
 return {system_sid:s.sid.toUpperCase(),system_client:s.client,environment:s.environment,
  release:s.release,source:"LOCAL_APPROVED_SAP_EXPORT",is_synthetic:false,
  captured_at:s.capturedAt,received_at:new Date().toISOString(),
  metrics:cleanMetrics,evidence};
}
export function sapEvidenceCoverage(m){
 const coverage=Object.fromEntries([...new Set(Object.values(SAP_METRICS))].map(x=>[x,"NOT ASSESSED"]));
 Object.keys(m||{}).forEach(k=>{if(SAP_METRICS[k])coverage[SAP_METRICS[k]]="PARTIAL"});
 return coverage;
}
