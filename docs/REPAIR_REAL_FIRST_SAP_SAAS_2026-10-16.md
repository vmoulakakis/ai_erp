# ERP Intelligence AI — Real-First SAP SaaS Repair, 2026-10-16

Status: deployed Vercel SaaS repair and staged real SAP integration; NOT a verified automated SAP connector.
Production URL: https://erp-intelligence-ai.vercel.app/
Repo: https://github.com/vmoulakakis/ai_erp/tree/main/saas

## Uploaded Google AI Studio ZIP audit
- The source ZIP contains a literal DeepSeek secret in server/aiProvider.ts and must NEVER be pushed unchanged. Rotate/revoke that key.
- Legacy test-connection, smart-connect-and-extract, live-proxy and screen-guide endpoints can simulate connected status, accept credentials/hosts or return hardcoded screen advice. They are NOT an authenticated SAP connection.
- Prepared a separate sanitized downloadable source archive with inline token removed, unsafe routes denied (HTTP 501) and local AI fallback not represented as a real provider reply. Pilot contract tests pass; full ZIP Vite build could not run locally due to unavailable npm packages.

## Work performed in the actual GitHub/Vercel SaaS project
- saas/src/sapEvidence.js validates permitted SAP_DIAG_V1 TXT exports and schemaVersion 1 JSON. Browser-local analysis; no actual company exports uploaded to shared Supabase.
- saas/src/ManualSAPIntake.jsx allows company-authorized manually observed DEV/QAS counts from SM37, WE02/WE05, ST22 and approved Z/Y inventory without ABAP transport.
- saas/src/App.jsx defaults to NO SAP DATA instead of fictional sales/diagnostic counters. Business KPIs say Not collected; module coverage is computed from provided evidence. Synthetic pilot data are separate and opt-in.
- saas/src/LiveCopilot.jsx provides manual approved T-Code copy/paste navigation (SM37, ST22, SM21, WE02, WE05, SE38, SE11, RZ11). It does not execute SAP transactions.
- tools/windows-companion/Check-SAPGUI.ps1 safely detects Windows SAP GUI processes; it cannot verify SAP SID/client/t-code or live session.
- Vercel production Vite builds have completed successfully for these changes. Verify the latest deployment SHA before treating newest code as LIVE.

## Supabase boundaries
- Project vmdb remains only for synthetic pilot data. Existing public/erp_intelligence schema objects were NOT modified in this repair.
- Existing erp-saas-pilot Edge Function requires JWT and serves synthetic pilot snapshots only.
- Multi-provider erp-copilot-chat is deployed but provider inference remains blocked by approved-account, server-side provider secrets and budget controls. Do not call templates real LLM replies.
- Auth email may redirect to SocialMarket because ERP canonical URL is not on shared Supabase allowed Redirect URLs. Add the exact ERP URL without altering Site URL of SocialMarket, and test a fresh email link.

## SAP GUI for Windows — proven environment
- Client-side SAP GUI scripting switch is ON, but SAP RZ11 parameter sapgui/user_scripting = FALSE and sapgui/user_scripting_set_readonly = FALSE.
- Screen sharing from Chrome can display real SAP pixels, but is not authenticated SAP data or remote keyboard/mouse connection.
- Without BASIS-approved scripting or a separate approved SAP interface, Windows Companion cannot read transaction context through the scripting engine. Do not bypass corporate policy.
- Verified automatic transaction navigation and authenticated SAP diagnostic extraction require a separately developed and IT-approved local connector and Windows acceptance test.

## Next mandatory acceptance
1. Open production and check NO SAP DATA and absence of fake metrics.
2. Enter real authorized DEV/QAS SM37 counts through Hybrid Onboarding; verify technical findings and provenance are user-declared.
3. Import a sanitized SAP_DIAG_V1 TXT file and confirm no network uploads.
4. Copy an allowlisted /nSM37 command in Live Workspace and paste in SAP GUI manually.
5. Fix the Supabase ERP Auth redirect allowlist while leaving SocialMarket settings alone.
6. Test one genuine provider inference using a synthetic screenshot after private credentials, per-user authorization and spend limits are ready.
7. Build approved Windows on-prem agent with a safe diagnostic interface. No ABAP/customizing/business writes.

## Commercial release not complete
Multi-company RBAC and isolation, user validation, privacy/DPA, audited local connector, signed installer, cost budgets, provider calls, integration tests and Vercel commercial hosting plan remain prerequisites.