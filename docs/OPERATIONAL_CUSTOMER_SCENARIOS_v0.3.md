# ERP Intelligence AI — Operational Customer Scenarios v0.3

**Date:** 2026-10-15. **Status:** Discussion draft, NOT implemented. All figures below are fictional.

## Product goal

An authorized company owner logs in and asks two related questions: (1) business-wise, where do revenue, receivables, fulfillment, procurement and inventory stand? (2) technically, how healthy and reliable is SAP, and can system faults affect operating results?

The product must connect the two through **evidence** and separate observation, correlation, hypothesized root cause and confirmed cause. It is NOT enough to show static KPI tiles. SAP DEV/QAS diagnostics cannot establish actual production business KPIs.

## Golden path after login

1. Select organization, SAP system/SID/client/environment, approved company code, plant and reporting period.
2. Select Full 360° / Business Performance / Technical Health / Diagnose Incident / Archiving & Migration.
3. Choose data path: initial offline **authorized sanitized production business aggregates** (if permitted) and SAP technical extracts; approved DEV/QAS collector later. Do not claim live PROD read-only access exists.
4. Review privacy, permissions, field-level preview and freshness; validate metric inputs and reconcile organizational scope.
5. Ingest versioned structured exports; data quality, incomplete coverage and unsupported metrics remain visible.
6. Compute deterministic business and technical measurements before AI summaries. Preserve definitions and denominators, currencies, posting/document state and reporting dates.
7. Show Business Health, Technical Health, Assessment Coverage and cross-module dependencies as separate lenses.
8. Drill into finding -> measured KPI, internal baseline, scope, source evidence, suspected vs verified cause, business impact estimate only when justified, assigned action, validation.
9. AI Advisor grounded in exact organization, client, snapshot and sources; never fabricate missing evidence.
10. Export executive/technical reports; compare next snapshot and confirm improvement.

## First customer screen

**Company:** DemoTrade AE; ECC; Client 100; 90-day period. **DEMO ONLY**.
- Net billed sales €12.4m (+5.1% versus approved prior period).
- DSO 63 days (+8 days). Not a generic health score.
- On-time deliveries 87% against declared internal target.
- Slow-moving inventory €1.4m at documented valuation basis.
- Technical signals: 18 failed jobs / 24h; 143 IDocs in error status in the specified window.

**Caveats:** billed sales are not receipts; €820k sales order backlog is not automatically €820k lost sales; DSO definitions differ by period and denominator; technical error counts alone do not prove business causality; cross-client or cross-tenant scope is never assumed.

## Operational scenarios

### A. Executive 360°
Question: "Where am I overall; what should I do next?"
Outcome: prioritize 3-5 evidenced business opportunities and technical risks. Make missing data explicit. Compare to own historical results / thresholds, not invented external market benchmarks.

### B. Sales — Order to Cash (SD)
Question: "Why are orders being invoiced/delivered late?"
Illustration: €820k blocked order value, 4.2 days order-to-billing latency, 143 error-status interface messages.
Sources: authorized aggregate sales order/delivery/billing document flow and timestamps, WE02/WE05 aggregate statuses.
Drill down: customer/channel/plant if permitted -> evidence for delivery blocks, stock availability, EDI mapping or failed jobs -> safe next diagnostic action.
Status: hypotheses until matching business/technical evidence confirms actual cause. No automatic unblocking of orders.

### C. Inventory — MM
Question: "Why do I have so much stock yet suffer availability issues?"
Illustration: €1.4m slow-moving stock, 92% material availability. Need valuation baseline, plant mappings, aging cutoff and movement/usage history.
Outcome: slow-moving cohorts, shortage exceptions, material/plant priorities; distinguish suggestions from verified financial benefits.

### D. Finance — FI/CO
Question: "Why is cash collection slower?"
Illustration: DSO 63 days, past-due receivables €1.15m. Authorized AR open/cleared documents, FI postings, billing totals, period and currency data.
Output: aging, credit and clearing exception cohorts, finance owner and verification plan. Do not create FI accounting entries.

### E. Technical — BASIS/ABAP/IDoc
Question: "What technical issues threaten operations?"
Illustration: 18 failed jobs / 24h, 34 short dumps / 7d, 143 failed IDocs, p95 response 2.6 seconds.
Sources: aggregated SM37, ST22, ST03N and permitted system/ABAP metadata.
Outcome: ranked technical checks, affected job/report/module, evidence and proposals for ABAP review. Do not equate correlation with causation.

### F. Archiving & S/4HANA Migration
Question: "What can be retired, cleaned or upgraded safely?"
Sources: approved table sizes, distributions and retention metadata; official SAP Readiness Check and ATC reports when available.
Outcome: risk and dependency map, candidates, blockers and customer-controlled technical plan. No legal deletion approval or automatic SARA/deletion/transport.

## Proposed UX navigation

**Mission Control | Business Performance | Technical Health | Process Intelligence | Module Intelligence | Findings & Dependencies | AI Advisor | Remediation | Archiving & Migration | Reports | Systems & Settings**

Global context ribbon: Organization > SAP SID > Client > Environment > Date range > Source date > Coverage.

Executive dashboard: business KPI band; technical exception band; joined business/technical investigation queue; prioritized actions; contextual AI Advisor; module coverage heatmap with Not Assessed status.

Every drill-down must display evidence provenance and a data coverage state. Show meaningfully different screens for CEO, CFO, Operations and ERP/SAP owner, while sharing the same system facts.

## Minimal MVP source contracts

| Lens | Evidence input | Claims |
| --- | --- | --- |
| System | versioned SAP system status, component inventory | SID/client/release |
| SD | order/delivery/billing approved aggregates | backlog, lead time, fulfillment |
| FI | AR/AP open/cleared and reconciled invoice/ledger aggregates | aging, DSO with defined calculation |
| MM | stock valuation, movement/usage, PO/GR/IR summaries | aged stock, availability and exception trends |
| BASIS | SM37, ST22, ST03N aggregates | job/dump/performance signals |
| IDoc | sanitized WE02/WE05 statuses | exception counts/trends |
| ABAP | TADIR/ATC approved object and quality outputs | Z/Y inventory and limited findings |

No unrestricted database SELECT generator, open HTTP proxy, live SAP writes or autonomous code execution.

## Technical and safety acceptance

- Signed-in role and tenant isolation; fail-closed data access.
- Synthetic data is always labeled, no fake SAP connected-success state.
- Sensitive exports blocked unless explicitly authorized, sanitized and classified.
- Deterministic metric formulas with explicit periods/companies/currencies.
- AI responses cite exact evidence and distinguish hypotheses from confirmed causes.
- Production SAP read-only is a future deployment requiring separate approvals. Transport to DEV/QAS is SAP-side controlled.
- Shared vmdb ERP schema is for synthetic pilot ONLY; not authorized for real customer business data.
- E2E Vercel, database, auth, SAP collector, browser and security tests before go-live.

## Crucial unresolved PRD decision

For genuine business intelligence in the first paid product, will customers be allowed to manually export **approved, aggregated production ERP performance data** to the SaaS while automatic SAP collectors remain DEV/QAS-only? Without production business aggregates, business dashboards are demonstrations, not reflections of real company operations.

## Relevant SAP official sources

- https://help.sap.com/docs/signavio-process-insights/user-guide/performance-indicators-overview
- https://help.sap.com/docs/signavio-process-intelligence/user-guide/576d42376dab10148cfcc70dfc2ca89e.html
- https://help.sap.com/docs/signavio-process-intelligence/user-guide/6ef6255cdbbf4f60b218a6ae5ce66fc5.html
- https://help.sap.com/docs/SAP_DATASPHERE/6eb1eff34e4c4b1f90adfbfba1334240/a8973f566bfc1014a79e69594ccc91ad.html
