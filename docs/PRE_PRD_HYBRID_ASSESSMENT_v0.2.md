# ERP Intelligence AI — Hybrid Assessment UX & Coverage Blueprint v0.2

**Date:** 2026-10-15  
**Status:** Pre-PRD discussion draft. Hybrid onboarding chosen and approved as direction, implementation NOT started.  
**Previous document:** [PRE_PRD_FULL_ASSESSMENT_v0.1.md](./PRE_PRD_FULL_ASSESSMENT_v0.1.md)

## 0. Approved decisions versus proposals

**Approved:** Business customers using SAP R/3/ECC; Greece first/global later; Full SAP Intelligence Assessment as MVP centre; Hybrid first-level sanitized export, second-level reviewed ABAP transport collector; approved DEV/QAS pilot; production access, if ever developed, strictly read-only; ABAP fixes as proposals only; self-service AI Cockpit; initial budget 0€.

**Proposed / yet to approve:** Exact export pack and schema, access roles, severity rubric, information architecture, dashboard layout, pricing, and launch-ready module minimums.

**Critical distinction:** A coherent *full landscape assessment* is not proof that every functional area has been deeply examined. Never mark not-assessed areas as healthy. DEV/QAS reports do not establish production workload health.

## 1. Users and goals

**Economic buyer:** Head of IT / ERP Manager / CFO-sponsored transformation owner at an SAP-using company.  
**Daily operator:** Internal SAP BASIS/ABAP technical owner or authorized external consultant employed by customer.  
**Reader:** CIO/Finance/Operations manager receiving the executive report.

**Jobs:** Understand system baseline, quantify covered and uncovered risks, rank issues, find explanation and evidence, get safe remediation proposal, reassess to see measurable change. Work without live support calls.

## 2. Product stages

### Level 1 — Instant Assessment / no transport

**Workflow states:**
- Workspace and verified user -> approved company membership
- Add SAP landscape: declare environment (DEV/QAS/PRD), release, SID and client
- Privacy gate: assert export authorization, choose data-classification and permitted files
- Choose template pack -> download versioned guidance and *supported file specification*
- Client-side inspect/redact; show what will be uploaded, filename/size/fields
- HTTPS upload -> server scans/validates, rejects unrecognized raw payload and fields
- Derive immutable snapshot, timestamp, schema validation score and coverage matrix
- Execute deterministic rules, record findings, severity, evidence refs
- Generate executive and technical report + prioritized nested actions
- AI Advisor scoped to this exact system/client/snapshot

**Default starter export pack (minimum useful if authorized):**
1. **SAP System Status**: SID, client, SAP_BASIS / EA-APPL, ECC release/EHP, basic database component information. Source: system status / components view. Structured template not random screenshot OCR.
2. **SM37**: approved, date-bounded aggregated counts by job outcome/time window (avoid usernames/job logs and sensitive variants).
3. **WE02/WE05**: approved, date-bounded counts of current IDoc status/direction/message type; sanitized status summary only (never IDoc segments or identifiers).
4. **TADIR object inventory**: Z/Y totals by object type/package, only if authorized with a safe aggregate export.
Optional: authorized **ST22** sanitized dump categories/counts (NOT stack variables/personal data), **DB02/ST04** aggregated database sizing, **TAANA** existing historical distribution (no unbounded on-demand table reads), **Readiness Check/ATC** official output if the customer is authorized to reuse it.

The exact export format is **not yet implemented**. MVP should publish one validated CSV/JSON format per source, with schema version, locale/encoding rules, separator handling, timestamp/timezone, max size/row counts, hash and sensitivity disclosure. CSV formula injection protections are mandatory on any downloaded or re-exported CSV.

**No-transport limitation:** incomplete coverage, one-off snapshot, user-controlled freshness; no authenticated live SAP connection claim.

### Level 2 — Deep Assessment / approved ABAP collector

- Workspace owner selects "Upgrade to deeper diagnostics".
- Compatibility matrix: supported SAP_BASIS, client, code page, HTTPS/certificates, authorization test, intended data classes.
- Download signed, pinned collector package and installation instructions.
- Customer's SAP owner performs SE38 syntax/activation and approved SE09/SE10/STMS transport DEV -> QAS; no SaaS-initiated import.
- Before any run, report approved SID/client allowlist, permitted extractors and per-source limits.
- Diagnostic collector gathers only coded allowlisted read-only aggregates, bounded time ranges and performance budgets.
- **Transport deployment is a managed SAP change.** Production installation is not part of the pilot.
- Secure push/approved upload to authenticated HTTPS gateway; backend validates client certificate or equivalent short-lived credential, payload signature, schema, replay protection, consent, tenant and system association.
- Store immutable snapshot with collector version, permission audit and coverage. Compare with Level-1 baseline.
- Do not enable writable RFC, general-purpose SQL or generic network proxy.
- AI-generated technical suggestions remain review-only. No execution or transport release by AI.

### Future (not MVP): authorized production read-only diagnostics

A separate, explicitly approved enterprise deployment and security review is required. Must not confuse "no writes from application code" with "no SAP changes" when shipping transports. Production-specific workloads cannot be judged using DEV/QAS traces alone.

## 3. UX journey and state machines

**Onboarding steps displayed as a progress indicator:**
1. Company
2. SAP landscape
3. Connection choice: "Upload safe reports" (recommended) or "Install collector"
4. Import/privacy verification
5. Coverage preview
6. Assessment processing
7. Mission Control + Next Actions

At each step show a clear completion condition and back/skip semantics. Never require a video call.

**Connection state**: not_configured / configured_not_verified / upload_received / export_validated / assessment_complete / stale / error / unsupported. There is no generic Boolean "connected" if data is from offline upload.

**Upload failure UX**:
- unsupported input format -> offer exact template & field mapping
- detected personal or business-sensitive detail -> block server persistence, ask for redacted export
- malformed or partial export -> line/field-level error and re-upload
- wrong SID/client/date -> reconciliation screen and confirmation
- duplicate export -> same-snapshot reuse (idempotent)
- import timeout -> resumable asynchronous job
- report has empty results -> no findings != no risk; show what was assessed

**Security UX**: always show DEMO/SYNTHETIC / customer-provided / collector-origin, data source and collection time. Never report fake green health.

## 4. Module coverage (source → claims)

| Module | Level 1 — exports | Level 2 — collector | Never claim from insufficient data |
| --- | --- | --- | --- |
| System | status, component releases, client | verified technical metadata | all versions are supported |
| BASIS | SM37 summary; sanitized ST22 optional | bounded job, exception and system diagnostics | automatic root cause from counts alone |
| IDoc | WE02/WE05 aggregated status trend | status by type/direction/partner class only if approved | content-level IDoc validation or guaranteed fix |
| Z/Y ABAP | TADIR inventory and optional customer-approved ATC | object metadata/dependency candidates | verified quality of every program |
| FI/CO | customer-provided reconciliation/check extracts | later versioned module extractor | full accounting consistency from status totals |
| MM | customer-approved procurement/inventory aggregates | later versioned module extractor | valuation accuracy from header counts |
| SD | order/billing/exception summaries | later versioned module extractor | full SD-FI flow consistency |
| Archiving | DB02/ST04 aggregates; existing TAANA; DB15 mapping | bounded statistics and archive prerequisites | archive eligibility or delete permission |
| Migration | official SAP Readiness Check/ATC outputs if permitted | annotated compatible custom-code/report data | replacement for official readiness checks |
| Security | approved connector permissions metadata | collector allowlist and access audit | comprehensive SAP security certification |
| Greek localization | optional aggregated e-invoice interface exceptions | localized approved extractor (later) | legal/tax compliance guarantee |

**Status per module:** not assessed | partially assessed | assessed within stated scope | blocked | unsupported.  
**Coverage** is separate from **risk severity**. Model coverage on a per-check basis, not solely on presence of an export file.

**First sellable release hypothesis:** System + BASIS + IDoc + Z/Y + Archiving overview; FI/MM/SD only when evidence packs exist. Avoid presenting blank modules as "green."

## 5. Evidence → Finding → Decision contract

Each finding stores:
- organization_id, system_id, client, assessment_id, snapshot_id
- check_id, ruleset_version, module, scope, data_source, collected_at, evaluation_at
- observation, normalized evidence fields, evidence checksum, which checks actually ran
- severity (critical/high/medium/low), confidence (high/medium/low), confidence rationale
- root_cause_status (verified/hypothesis/unknown), known missing evidence
- business impact hypothesis, suggested verification, non-destructive remediation guidance
- prerequisites, owner, status, validation check, and links to related modules/findings

**Trust principles:** hard-coded rules establish raw facts, graph/dependency engine proposes relevant relationships, LLM narrates with citations and doesn't invent absent SAP evidence. The system must distinguish association from proof of root cause.

**Action hierarchy:** Company > SAP system > module > finding > 1) Confirm evidence 2) Assess business impact 3) Prepare change 4) Test DEV/QAS 5) Customer-controlled approval 6) Reassess.

## 6. UX information architecture

**Primary nav:**
- Mission Control
- Landscapes & Connections
- Assessments & Imports
- Modules (BASIS / FI/CO / MM / SD / IDocs / Z-Y / Data & Archiving / Migration / Security)
- Findings & Dependencies
- AI Advisor
- Remediation Workbench
- Reports & History
- Admin / Privacy / Access

**Persistent context bar:** Organization | SID | Client | Environment | Snapshot date/time | Source | Synthetic/Real | Coverage state.

**Mission Control:**
- Header: selected system plus current assessment source/freshness;
- Top strip: checked capabilities X/Y, unassessed critical domains, severe findings, diagnostic recency (no invented global health score);
- Main column (60–70%): "What to do next?" prioritized grouped actions, impact, confidence, prerequisites;
- Right column (30–40%): AI Advisor with pinned system snapshot context and common question prompts;
- Bottom: per-module coverage heatmap (not health heatmap), failure trends, dependency graph preview, historical change.

**Findings drill-down:** show precise SAP module + table/transaction context, impact, timestamped evidence, exact rule and version, causes grouped as verified vs hypotheses, safe technical next steps, rollback/testing criteria. "Generate ABAP Draft" is enabled only for compatible, manually reviewable suggestions; code execution never happens from web UI.

**Reports:** executive (1–2 page), technical details and evidence appendix, downloadable with synthetic label and missing-check disclosures.

**Accessibility and responsive:** desktop-first dense cockpit (1440px), usable at 1024px, mobile read-only prioritized view (360px), keyboard navigation and accessible tables. Avoid color-only distinctions; statuses always have text and icons.

## 7. User permissions (proposed)

- Organization Owner: manage membership, plans, privacy and allowlists
- ERP Manager: register systems, request assessments, approve report delivery
- Technical Operator: handle exports, collector compatibility, diagnostics, propose workbench drafts
- Viewer/Auditor: read reports and limited evidence, no uploads/configuration

**Self-service** does NOT waive SAP-side authority. Every export/upload/transport must be performed by an authorized customer operator.

## 8. Platform architecture, constraints and data model

**Frontend:** React + TS (reuse original demo navigation and SAP visual language), hosted on Vercel.
**Backend:** authenticated Vercel endpoint for file workflow, tenant authorization, validated ingest and read-only/report endpoints.
**Data:** Supabase Postgres tables (proposed, not deployed): organizations, memberships, systems, environments, collector_capabilities, uploads, immutable_snapshots, assessment_runs, check_results, findings, finding_evidence, actions, report_exports, audit_events. Row ownership must be enforced using explicit organization membership/roles, server controls and RLS as defense in depth.
**Files:** private bucket or other encrypted object storage with short-lived download URLs, retention, payload hashes and data deletion.
**Engine:** deterministic checks and safe normalization first; job queue for long assessments; approved LLM for explanations and proposal code.
**No secrets** in browser, logs, GitHub or SAP extracts; no customer telemetry in shared demonstration Supabase project.

**Current storage restriction:** Existing shared vmdb schema \`erp_intelligence\` contains a single forced-RLS, no-public-grant \`diagnostic_snapshots\` table with 2 synthetic D01/Q01 records. Only synthetic pilot data is authorized there. Do not change the vmdb schema, roles, policies or insert real customer data without a distinct user approval. Multi-customer use requires separate architecture and authorization.

## 9. Security, performance and trust gates

**Authorization gate:** two test organizations with forbidden cross-org reads/writes, no anonymous access, no direct browser credentials, backend rejects all unauthorized requests.

**Data gate:** schema-versioned validated export formats, redaction and field allowlist, content checks, archive/binary rejection, size and time limits; no personal identifiers, raw IDoc segments or complete dump variable contents as MVP defaults.

**Diagnostic gate:** deterministic fixture tests reproduce expected findings for failed jobs, IDoc statuses, Z/Y inventory; all findings show exact evidence; empty, stale, partial and contradictory snapshots handled.

**Collector gate:** ABAP syntax and resource check against documented SAP_BASIS release, and explicit permissions review. Collector read-only by allowlisted ABAP and SAP authorizations, never dynamic execution.

**Performance gate:** limit export sizes, bounded table reads and job runtimes; the customer/operator schedules large TAANA analyses in SAP as appropriate.

**UX gate:** one pilot business user completes onboarding → validated sanitized export → coverage → assessment → question → action plan → report without a call; test incorrect files and no-data states.

**Release gate:** no public claims of real SAP connection until an authenticated DEV/QAS E2E test proves it. Browser/mobile interaction tests and deployment logs required before production release.

## 10. Pending product decisions

1. Initial Level-1 starter pack: **4 files (System, SM37, WE02/WE05, TADIR) vs 6 (add sanitized ST22 + DB02/TAANA summary)**?
2. Must the first paid product require BASIS + IDocs + Z/Y + Data and Archiving, or only verified system/BASIS with others optional?
3. Which exact SAP_BASIS/ECC releases will be *certified* as supported after tests?
4. How much private SAP metadata can customers approve for SaaS ingestion? Default strict aggregation.
5. Pricing and market validation with actual Greek customer willingness to pay.

## Evidence and official references

- SAP background job monitoring SM37: https://help.sap.com/docs/SUPPORT_CONTENT/basis/3354611163.html
- SAP IDoc display WE02: https://help.sap.com/docs/SUPPORT_CONTENT/sapclass/3363506673.html
- SAP TAANA analysis and background recommendation: https://help.sap.com/docs/SAP_ERP/c6ef916aeac74db0a6bec2142bc00248/4d9c34799be813fde10000000a42189c-277.html
- SAP remote ATC for older releases: https://help.sap.com/docs/ABAP_PLATFORM_BW4HANA/ba879a6e2ea04d9bb94c7ccd7cdac446/e75d0aa74857455e82746ed198fc494a.html
- Supabase security: https://supabase.com/docs/guides/database/secure-data
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
