# ERP Intelligence AI — Pre-PRD: Full SAP Intelligence Assessment

**Version:** 0.1 (discussion draft)  
**Date:** 2026-10-15  
**Status:** Requirements and workflows being evaluated — NOT the approved PRD or a deployed application.  
**Product buyer:** A business operating SAP R/3/ECC. Greece-first, global-compatible.  
**Interface:** Enterprise AI Cockpit with grounded AI Advisor, Greek/English.  
**Deployment direction:** React + Vercel API + private Supabase PostgreSQL + approved SAP diagnostic collector.  
**Agreed guardrails:** DEV/QAS pilot. Production SAP strictly read-only if ever connected. Generated ABAP is a proposal, NEVER executed automatically. Self-service buying/onboarding.

## 1. Value proposition

"Understand your ERP. Identify risks. Know what to fix next."

Provide a **landscape-wide, evidence-qualified SAP assessment**, a prioritized remediation queue, and an SAP AI Advisor that answers using explicit time-stamped diagnostic evidence.

**Important scope rule:** *Full* describes coverage of the landscape and a unified workflow, **not** a guarantee of full functional verification of every FI, MM, SD, CO, localization or custom business process. Each check must report its own *coverage, supported source, depth, freshness, and diagnostic confidence*. Unchecked is not healthy.

## 2. Primary user / jobs-to-be-done

Primary business user: Head of IT / ERP Manager, with technical detail drill-down for SAP BASIS, ABAP and module owners. Initial self-service target is businesses with someone authorized to obtain SAP diagnostic exports or install an approved DEV/QAS transport.

Primary tasks:
1. Establish precisely which systems, clients, releases and components exist.
2. Obtain a baseline of health and risk with minimal, approved SAP permissions.
3. Understand the **top 5 issues**, evidence, risk, affected modules and what to do next.
4. Ask natural-language diagnostic questions; distinguish observations from hypotheses.
5. Obtain an ordered technical plan and approved ABAP/code-review suggestions.
6. Repeat the assessment and objectively determine which issues improved or worsened.

## 3. Golden path

1. Sign up / create company workspace -> organization and user membership (NOT generic shared access).
2. Register landscape -> system SID, environment DEV/QAS/PRD, clients, release, database, declared modules.
3. Choose connection: **A) offline approved, sanitized export** or **B) signed, versioned, allowlisted read-only collector in DEV/QAS** (initial selection unresolved).
4. Capability and permissions preflight -> what can be checked and what cannot; never falsely say "connected".
5. Collect/export -> upload/HTTPS POST to authenticated ingestion -> schema/content checks -> reject disallowed data.
6. Store evidence as an immutable snapshot -> collector and rule versions, collection time, source, system/client, checks executed, checks not executed.
7. Run deterministic rule engine and module-specific rules; record findings with transparent evidence refs.
8. Cross-module dependency and business impact enrichment -> ranked actions (severity + impact + likelihood; confidence separate).
9. Cockpit assessment report -> AI Advisor chat grounded to selected snapshot and retrieval of approved sources.
10. ABAP Workbench: draft suggestions in a sandbox; syntax verification on authorized DEV/QAS only; approval workflow by customer.
11. Export technical assessment and executive report; create trackable nested Action Plan.
12. Reassess -> snapshot diff, verify improvement, track time to resolution.

All steps need empty/loading/error/no-access/unsupported/partial-data states; UX must never replace "unknown" with a green pass.

## 4. Screens and information architecture

- **Overview / Mission Control:** selected organization, system, client, snapshot timestamp, connection mode, assessment coverage, critical findings, 5 recommended next actions.
- **Landscapes & Connections:** inventory, supported release, collector versions, collector permissions and capability test, connection audit; four honest states: Not configured / Collector ready / Data received / Last assessment successful (not generic "connected").
- **Assessments:** initiate/resume/report runs, status pipeline, completeness and data validation log.
- **Modules:** BASIS, FI/CO, MM, SD, IDocs/Interfaces, ABAP Z/Y, Data/Archiving, Migration, Security. Each module has assessed/not-assessed/unsupported and detailed evidence.
- **Findings:** searchable/faceted list, risk, confidence, affected objects/modules, supporting measurements and time, owner and status.
- **AI SAP Advisor:** chat scoped to specific system and snapshot; responds with what is established, what is a hypothesis, what to inspect next, and safe changes to consider.
- **Remediation Workbench:** proposed ABAP/diffs/checklists, syntax assumptions, version compatibility, impact, rollback/testing instructions. NO auto-write/transport.
- **Archiving & Migration:** evidence and recommended official SAP checks, not claims of legal approval or one-click deletion.
- **Reports / History:** export summary + technical deep-dive and compare snapshots.
- **Settings:** tenant memberships, roles, policies, retention, data-sharing consent, collection schedule, audit events.

**UX design:** Dense enterprise cockpit; not a colorful static dashboard. One selected system context at a time, guided "what next" first, deeper technical views on demand. Command palette/ALV-like filters can be retained from the prototype.

## 5. Coverage matrix (planned, not all supported yet)

| Area | Starter evidence | MVP depth | Deferred |
|---|---|---|---|
| System baseline | System release, components, SID/client, timestamp | Inventory and compatibility flags | Landscape discovery without human enrollment |
| BASIS | Approved job counts/status; allowed dumps/EWA export | Repeat failures, temporal signals | Full root cause/performance tracing |
| IDocs / interfaces | EDIDC status totals + optional sanitized status aggregates | Failure trends, partner/message grouping when available | Payload parsing, auto-reprocessing |
| ABAP Z/Y | TADIR object inventory, package, allowed static metadata; optional ATC import | Inventory, dependency candidates and risks | Runtime use tracing, full automated fix |
| FI/CO | Approved configuration/specific aggregate reconciliation exports | Configuration coverage + advisory checks | Complete financial reconciliation |
| MM | Approved inventory/procurement aggregate exports | Partial business-process risks | Deep valuation/accounting validation |
| SD | Approved order/billing and exception aggregates | Partial billing/document-flow risks | Full end-to-end financial checks |
| Data/Archiving | DB metadata, permitted counts/age histograms, SAP archiving prerequisites | Growth/candidate assessment, warnings | Automated deletion or archiving |
| S/4HANA migration | SAP Readiness Check & remote ATC imported official outputs when available | Consolidated evidence/roadmap | Independent replacement for SAP tools |
| Security | Approved metadata, privileges/capability checks | Connector and access audit | Penetration testing, comprehensive SAP authorization certification |
| Greek localization | Optional approved tax/e-invoice metadata | Coverage reporting only | Tax correctness conclusions |

**Reality check:** The original pilot collector has only narrow counts from TBTCO, EDIDC and optional TADIR. Thus FI/MM/SD are NOT assessed by those counts, and any dashboard claiming otherwise is misleading.

## 6. Findings contract (non-negotiable)

Each finding:
- `finding_id`, `tenant_id`, `system_id`, `client`, `snapshot_id`
- `module`, `subdomain`, `rule_id`, `rule_version`
- `title`, `observation`, `evidence_refs[]`, `detected_at`
- `severity`, `business_impact`, `confidence`, `coverage_state`
- `root_cause_status = confirmed | hypothesis | unknown`
- `recommendations[]`, `safe_verification_steps[]`
- `owner`, `status`, `first_seen`, `last_seen`

**Never calculate universal system health from absent module data.** Show both "Observations risk rating" and "Assessment coverage". A suggestion of an archiving candidate must not be a determination that records can legally or technically be deleted.

## 7. AI trust and security

- Deterministic validation/rules **before** LLM-generated explanation.
- Show exact source snapshot, checked objects, timing, tool/rule versions, missing evidence.
- Prompt injection defense, approved retrieval sources, full conversation tenant isolation, no private chain-of-thought logs.
- No customer SAP credentials in frontend, git, exports, chat prompts or database records.
- Reject unrestricted URL-proxy endpoints, arbitrary SAP table access and writable RFC modules.
- Read-only enforced via allowlisted SAP collector code and SAP authorization review, not a label in UI.
- Data minimization, sanitized aggregates by default; no commercial data, IDs, full payloads or PII without distinct consent and risk review.
- Prod connection = future option, separately approved; installing a transport is itself a managed SAP change.
- Self-service audit and privacy controls, export/delete lifecycle and region/residency policy required before multi-customer launch.

## 8. Architecture and state as of 2026-10-15

- GitHub `vmoulakakis/ai_erp`: documentation initialized; original Google AI Studio source is **NOT yet imported**. Prototype contains mock health figures and an unsafe general-purpose proxy that must not be published.
- Supabase `vmdb`: `erp_intelligence.diagnostic_snapshots` exists with forced RLS, no public role grants, and **exactly two synthetic snapshots** (D01/DEV, Q01/QAS). This does not make it multi-tenant SaaS-ready, and it does not yet have application runtime access.
- No confirmed Vercel deployment, SAP transport installation, or end-to-end HTTPS ingestion.

**Design direction (to be tested):**
Browser → authenticated Vercel API → authorization + private DB access → snapshot ingestion and background deterministic rules → Postgres findings/evidence → Cockpit/AI Advisor. SAP collector/export is a separate approved ingress channel. Durable background workers may need a job/queue mechanism beyond request lifetime.

**Shared VMDB boundary:** Synthetic only. Do not add tables/roles/policies or real customer SAP data to vmdb without explicit authorization. For future commercial customers, prioritize a dedicated isolated project.

## 9. MVP scope prioritization

**P0 (must be real):** organization login, system inventory, capability preflight, synthetic/offline import, valid snapshots, module coverage, BASIS/IDoc/Z-Y starter findings, evidence-linked actions, snapshot history, clear safety and access controls.

**P1 (first sellable assessment if validated):** approved DEV/QAS collector integration, normalized FI/MM/SD limited aggregates, actionable dependency signals, report export, human-review ABAP proposals.

**Later:** unattended production telemetry, actual migration conversion automation, full accounting integrity, autonomous code repairs, unrestricted SAP SQL, low-level GUI remote control.

## 10. Acceptance gates (proposed)

A. **Truthfulness:** No successful connection state unless an authenticated data collection was received; DEMO/SYNTHETIC permanently marked; missing modules = "not assessed".

B. **Security:** Deny cross-tenant reads/writes under at least 2 independent organizations; deny anon/authenticated access to private diagnostics; no secrets in browser/server logs/GitHub; zero write-capable SAP pathways.

C. **Diagnostic quality:** Known seeded fixtures produce exact deterministic findings. Every result links to snapshot + rule version + evidence and differentiates hypothesis from confirmation.

D. **Compatibility:** test on explicitly documented release/client pair before describing a collector as compatible. Validate even basic ABAP on SAP_BASIS 7.00 if that's the target.

E. **Product flow:** A technically authorized pilot customer completes register → synthetic/offline import → assessment → explain → report without support call.

F. **No go-live** until dependency installs, build, integration tests, security checks, browser screenshots and DEV/QAS collection have been independently verified.

## 11. Open decisions for discussion

- **Highest priority:** first real assessment starts with offline validated exports, an installed ABAP transport collector, or both?
- Which exact versions must v1 officially support and which are best effort?
- Does the MVP buyer have an internal SAP BASIS owner to approve transport and exports?
- What constitutes a sufficiently valuable **paid** assessment for the Greek market without live PROD data?
- Which module-specific assessments are truly necessary for first sellable scope versus represented as not assessed?
- Deployment on Vercel with background worker provider and privacy boundaries.
- Legal/commercial use of SAP trademark and customer intellectual property in derived diagnostics.

## Official grounding

- SAP Readiness Check: https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE
- Remote ATC for older SAP: https://help.sap.com/docs/ABAP_PLATFORM_BW4HANA/ba879a6e2ea04d9bb94c7ccd7cdac446/16e11b7b7fcf48ac812e21aa8de77381.html
- SAP RFC access controls: https://help.sap.com/docs/ABAP_PLATFORM_BW4HANA/c495ada972d045b2be2869f5573af8e7/488d1bd1ae444e6ee10000000a421937.html
- Vercel Express: https://vercel.com/docs/frameworks/backend/express
- Supabase API and RLS: https://supabase.com/docs/guides/api/securing-your-api
