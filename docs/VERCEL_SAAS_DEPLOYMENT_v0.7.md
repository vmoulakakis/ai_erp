# ERP Intelligence AI — Vercel SaaS pilot v0.7 deployment

**Date:** 2026-10-15
**Deployment stage:** Live Vercel production URL for a **protected synthetic-only pilot**, **NOT full commercial SaaS**.
**URL:** https://erp-intelligence-ai.vercel.app/
**Vercel project:** `erp-intelligence-ai` (project `prj_2lZzsfrvKh4qVgtsV04Eu0Co6wdk`)
**Code:** `vmoulakakis/ai_erp/saas`, `main`, commit `fb72f120946d48e51b0772e1f6174844be3b3e29`.
**Vercel deployment:** `dpl_8uMepnJmhuWenbw4TQ9p2FFoDRnB` — READY with Vite successful build, 1,637 modules transformed.

## Implemented

- React + Vite responsive ERP enterprise UI, separate URL and Git-linked Vercel project.
- Supabase Auth email magic link client; on successful user JWT it can call `erp-saas-pilot`, a new JWT-verifying Edge Function in vmdb that returns **only synthetic** snapshots from `erp_intelligence.diagnostic_snapshots`.
- Mission Control with unmistakably illustrative business KPIs.
- SAP module coverage matrix (Not assessed vs partially observed).
- Synthetic technical stats, deterministic diagnostic findings and evidence/next-step cards.
- Local in-browser opt-in JSON preview (no storage or external model transmission) and JSON report export.
- SAP Live Workspace uses browser `getDisplayMedia` window sharing of SAP GUI on the same user's desktop — view-only, no remote keyboard/mouse, no screenshot-to-AI transmission.
- AI SAP Consultant currently a deterministic investigation planner, NOT live model inference.
- Vercel environment includes only PUBLIC Supabase URL and publishable key. Neither SAP secrets nor DeepSeek API key in GitHub/Vercel/frontend.
- Vercel deployment protection (SSO) currently enabled, including production `*.vercel.app` URL.

## Verified

- Vercel deployment READY on second deployment (environment variables configured before build).
- Vercel build logs show Vite production build successfully completed and outputs emitted.
- Supabase new `erp-saas-pilot` function deployment ACTIVE with `verify_jwt=true`.
- vmdb unchanged prior to pilot: existing `public` and `erp_intelligence` tables not modified as part of this SaaS deployment. `erp_intelligence` remains two synthetic rows and zero real SAP rows.
- DeepSeek Vault key exists, but shared AI Gateway remains disabled; 0 usage records.

## Not yet verified / not implemented

- No browser screenshot acceptance review from this environment; no test login performed using an actual email inbox.
- Supabase Auth **Additional Redirect URLs** may need `https://erp-intelligence-ai.vercel.app/**`; do not overwrite the Site URL shared by other apps.
- No tested live SAP Windows Companion Agent, AnyDesk-style streaming, SAP RPC or ABAP transport connection.
- No multi-company persisted workspaces, tenant membership tables/RLS tests, billing/subscriptions or production business data. **Commercial use forbidden until proper infrastructure/security and plan.**
- Original 82-entry prototype ZIP is *not deployed unchanged*; dangerous `live-proxy`, `smart-connect`, credential-forwarding routes were not included in deployed SaaS source.
- Final production SaaS needs: multi-tenant isolation, privacy compliance, retained architecture, certified SAP 7.00 collector, companion agent, AI gateway auth/quota, QA and commercial plan.

## User test

1. Open https://erp-intelligence-ai.vercel.app/ (Vercel team login may be required).
2. Review Mission Control. All business figures are DEMO.
3. Select **Live SAP Workspace**, open Windows SAP GUI on the same PC, click **Share SAP window**, choose that window and confirm. This is a local browser screen preview, not remote control.
4. Under **Workspace & Security** or header, click Sign in and enter email for Supabase magic link.
5. If login link goes to wrong site, set Additional Redirect URL under Supabase Authentication > URL Configuration to `https://erp-intelligence-ai.vercel.app/**`. This adjustment is **not done**.
6. After login, go to **Reports & History** to see JWT-protected synthetic DEV/QAS snapshot records if the authenticated Edge Function passes E2E authorization (not yet tested).

## Commercial hosting note

Vercel team is on **Hobby** plan. Vercel terms restrict Hobby usage to personal/non-commercial. A commercially available SaaS will need Pro/Enterprise or suitable compliant hosting. Do not change billing plan without explicit user approval.
