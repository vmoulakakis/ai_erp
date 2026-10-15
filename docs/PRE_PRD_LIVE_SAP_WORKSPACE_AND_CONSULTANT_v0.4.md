# ERP Intelligence AI — Live SAP Workspace & Conversational Consultant
Date: 2026-10-15
Status: PRE-PRD v0.4 / USER-APPROVED PRODUCT DIRECTION, not an implemented connector.
Scope: SAP R/3 / ECC first; DEV/QAS supervised sessions; production read-only later, only under separate organizational approval.

## 1. Clarified requirement

ERP Intelligence is not just business and technical assessment based on exported files. A customer wants BOTH:

**A. SAP Live Workspace ("AnyDesk-like")**:
From the ERP Intelligence Cockpit open an interactive SAP GUI session, see the actual SAP UI in the workspace, navigate transactions as the authenticated SAP user, and receive optional live AI co-pilot assistance specific to current transaction, screen, selected object and errors.

**B. AI SAP Consultant (conversational access to SAP DEV)**:
From the same Cockpit choose DEV/client and request authorized technical investigations in natural language. AI can plan and use explicit allowlisted read-only SAP capabilities, cite live evidence, interpret findings, guide investigation and prepare ABAP/customizing corrections for human approval.

These are separate **operational modes** that share identity, session context, SAP release knowledge, evidence, audit and authorization. Hybrid offline upload remains Level 1 for onboarding and assessment.

## 2. User flow A: Live Workspace

1. Sign in and select company/SID/client/environment.
2. Click "Open SAP Workspace"; choose connection source: **Local SAP GUI for Windows bridge** (MVP recommended) or **customer-approved managed Windows session** (later). Browser-based SAP GUI for HTML / ITS is an optional direct-render method, subject to customer SICF/SSO/network and browser embedding policy.
3. Local approved, signed Windows Companion/Agent starts or attaches to running SAP GUI for Windows, using the user's normal SAP login, network/VPN and roles. No SAP password passed to SaaS.
4. Consent dialog names exact SAP window, session, permitted data types, AI observation state and capture redaction policy; visual active indicator, Pause AI, Stop Sharing, End Session.
5. SAP window becomes visible in Cockpit via controlled stream if the full embedded experience is technically enabled and approved. MVP fallback: user keeps SAP GUI local, Cockpit receives structured permitted context + opt-in screenshots in a sidecar; do NOT claim the fully embedded mode is already working.
6. AI describes screen/field/status/tooltips/error with session context; human navigates manually. Optional explicitly confirmed non-destructive GUI navigation through an allowlisted action queue after SAP GUI Scripting check.
7. Session logout -> terminate stream and invalidate short-lived tokens. Metadata audit contains users/system/actions/timestamps but not passwords or unredacted screen.

### Context to capture (consent-scoped)
System SID, client, SAP GUI version, transaction code, window title, selected program/table/error class, field *metadata* where safe, timing, read-only diagnostic results. Do not constantly upload all screenshots, passwords, payroll, PII, customer financial records, business secrets or ALV full rows. Use local classification/redaction and explicit capture on demand.

## 3. User flow B: AI SAP Consultant

1. Select company / DEV (or QAS), client and diagnostic scopes.
2. Ask in Greek/English: "Show failed SM37 jobs last 24 hours and investigate recurrence", "Explain IDoc error", "Assess Z/Y program dependencies", "Suggest a fix to this ST22 dump".
3. AI generates a safe investigation plan, supported SAP data requirements, read-only tool calls and evidence needed.
4. Local agent or on-prem connector executes **only approved read methods** with SAP user authorizations; or uses already ingested/validated evidence. No arbitrary RFC endpoint, table SELECT, SE38 script, shell command or unrestricted network access driven by the LLM.
5. Normalize findings, exact source, timestamp, SID/client/transaction, known unknowns, root cause status.
6. AI returns answer, evidence and next checks plus optional ABAP patch proposal with version-specific syntax notes. Human reviews; in DEV/QAS code change is a separate approved workflow implemented by SAP operator, not autonomous.
7. Next snapshot or read check validates outcome.

### Natural-language examples
- "Τι πρόβλημα έχουν τα τελευταία αποτυχημένα Z jobs;" -> safe status summary, no assumed root cause.
- "Γιατί ένα MXPRFC IDoc έχει status 99;" -> gather allowed status metadata, type/partner and related logs only if access exists.
- "Έλεγξε το Z πρόγραμμα για performance" -> static source access only if authorized, ATC results and approved performance diagnostics; never claim runtime profiling without traces.
- "Άλλαξε τον FI λογαριασμό" -> **deny autonomous write**, offer configuration diagnosis, impact checklist and draft change instructions for human-approved DEV changes.
- "Πόσες πωλήσεις έχουμε στην παραγωγή;" -> DEV data cannot establish business KPI. Require separately authorized production data aggregates/exports.

## 4. Supported connection pathways: accuracy and tradeoffs

| Path | Visual UX | SAP connection | Constraints | Recommended |
| --- | --- | --- | --- | --- |
| **Windows Companion + existing SAP GUI for Windows** | In-place sidecar first; streamed window later | Customer PC or approved corporate workstation with LAN/VPN and SAP GUI | Signed installer, OS permissions, scripting often admin-controlled, explicit capture consent | First live MVP |
| **Customer-approved Windows remote workspace** | True embedded AnyDesk-like remote control + AI panel | Registered corporate Windows desktop with SAP GUI | WebRTC screen/control relay, TURN, endpoint trust, admin policies, session limits, cost and licensing | Advanced product tier |
| **SAP GUI for HTML / integrated ITS** | Native HTML SAP session, possibly launch in a separate secure tab; embed only if CSP/SSO permitted | SAP ICM/ICF service \`/sap/bc/gui/sap/its/webgui\` if installed/activated and authorized | GUI features differ vs Windows, CORS/frame restrictions, internal reachability and reverse proxy/SSO | Optional alternative |
| **Backend ABAP read-only collector** | Natural-language diagnosis and structured findings, no native SAP desktop | Approved SAP transport in DEV/QAS with strict allowlist | Doesn't provide arbitrary real-time GUI window control | Main consultant data channel |

**Not possible simply by pasting SAP Logon connection properties into cloud/Vercel.** The SAP application server is private LAN. The authorized browser/desktop gateway must be within the corporate network/VPN or through secure outbound agent/tunnel; do not publicly expose SAP GUI port, RFC, dispatcher, ITS, nor collect GUI passwords in ERP Intelligence.

**Legacy compatibility:** SAP GUI Scripting is documented for SAP GUI for Windows/Java but depends on installed client features and SAP/application server security settings. Verify in a test DEV session before promising. SAP GUI for HTML uses ITS and does not support every native Windows SAP control.

## 5. Interface composition

Route \`/workspace\`: persistent context bar (company/SID/client/SAP user role/source/consent), left SAP session viewer (70%), right AI assistant panel (30%), bottom controlled actions & evidence drawer; session sharing indicator, Stop/Blur/Freeze and security settings.

Route \`/consultant\`: chat-first mode with selected SID/client and permissions badge, AI investigation plan, explicit read-only action approvals, execution evidence timeline, module finding drill-down, ABAP proposal handoff.

Both routes feed the broader 360° mission control assessment history and nested action plan. Separate connection truth states: agent online, SAP GUI user connected, scripting capability verified, session streaming connected, data collector ready, last assessment fresh/stale. No generic fake \`connected=true\` state.

## 6. Security and governance

- No SAP password in application servers, local AI payloads, prompts, logs, Vault or GitHub; use existing SAP GUI session and approved SAP authentication.
- Agent locally enforces transaction/tool allowlist and user/admin authorization; cloud AI never receives OS/RFC shell execute capability.
- Remote desktop session must have explicit user consent, a unique short-lived bound identity, corporate approval, controlled screen scope and redaction, visible sharing indicator, keyboard/mouse permissions separated from viewing, E2E transport encryption, timed automatic disconnect and audit.
- Read-only means no SAP business writes by AI; note that GUI scripting may technically perform writes, so must be gated using policy and customer permissions, not assumed safe.
- Upload only minimized data; separate AI model provider data processing agreement and retention review before sending live SAP screen/customer data.
- Each project/customer has tenant isolation, RBAC and audit; no sensitive production data in shared \`vmdb\` synthetic pilot.
- Prompt injection defense: on-screen SAP text is untrusted input; do not turn it into actions without allowlisted commands and human confirmation.
- **No unattended AnyDesk-style access**, no screen recording by default, no hidden monitoring of employees.

## 7. MVP slices and acceptance

**MVP-Live 1 (must demonstrate):** Signed local Windows Companion with voluntary attach to SAP GUI DEV, safe display of SID/client/T-code/status and opt-in screenshot; co-pilot explains current screen; one allowlisted read-only job/IDoc diagnostic; auditable Start/Stop sharing; test on explicitly specified SAP_BASIS/SAP GUI versions.

**MVP-Live 2:** Browser SAP session viewer using approved window streaming (not just a static screenshot), keyboard/mouse user control if approved; secure session bootstrap, user-consent and disconnect tests; verify corporate networks and bandwidth. Mark this "AnyDesk-like" only after actual interactive validation.

**MVP-Consultant:** Conversation -> plan -> permission check -> allowlisted read tool -> grounded response -> non-executing ABAP fix draft -> audit.

**Acceptance tests:**
1. Attach to an authorized running DEV SAP GUI and accurately detect T-code, screen context and client.
2. AI explains a supplied error with evidence but does not invent live SAP findings when not connected.
3. Deny SAP login via stored password/proxy; require SAP operator login.
4. Block read of credentials/masked fields and refuse writing actions by design.
5. Stop AI observation actually stops capture, transport and future requests.
6. Two independent organizations cannot view each other's SAP screens, snapshots or runs.
7. Remote stream is not claimed supported until two-way keyboard/mouse, timeout/reconnection and permission behavior are verified.
8. Compatibility tests on customer's actual SAP GUI version & SAP_BASIS release; old ABAP syntax.
9. Full technical and privacy/security review before live customer screens leave corporate network.

## 8. Decision for next stage

Choose the **first live proof of concept**:
- A. Attach to SAP GUI already running on your Windows corporate workstation, with Companion Agent and AI side panel, then build embedded streaming.
- B. Stand up a customer-approved remote Windows workstation, connect via browser stream, then add AI.
Recommendation: A first (fewer infrastructure assumptions), B as the second stage. This prioritization is proposed, not a reduction of the approved two-mode product scope.

## Official SAP references

- SAP GUI for Windows Scripting API: https://help.sap.com/docs/sap_gui_for_windows/b47d018c3b9b45e897faf66a6c0885a8
- SAP GUI Scripting Security Guide: https://help.sap.com/doc/97d2d0bc2ed248a4a85a0bec608704f8/770.04/en-US/sap_gui_scripting_sec_guide.pdf
- SAP GUI for HTML restrictions: https://help.sap.com/doc/saphelp_snc700_ehp01/7.0.1/en-US/4d/aeae42cd7fb611e10000000a155106/content.htm
- SAP GUI for HTML / ITS webgui service: https://help.sap.com/helpdata/en/a6/cf3d4050d89523e10000000a1550b/content.htm
