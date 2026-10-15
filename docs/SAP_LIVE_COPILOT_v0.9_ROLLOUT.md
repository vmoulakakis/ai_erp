# ERP Intelligence AI — SAP Live Consultant v0.9 rollout

Date: 2026-10-15. Status: SOURCE COMMITTED, EDGE API DEPLOYED BUT DISABLED, VERCEL DEPLOYMENT BLOCKED BY DAILY QUOTA.

## User experience
- Shared SAP GUI window on the left. Context inputs: SID, client, DEV/QAS and transaction.
- AI SAP consultant chat on the right, with conversation history in browser sessionStorage.
- "Capture & mask" takes a local frame from the operator-approved screen share.
- Operator blackens sensitive areas, reviews screenshot and ticks approval.
- Only when "Send reviewed screen with next question" is checked does the next AI message include the JPEG.
- A real model answer, if one is received, has an explicit "DEEPSEEK / AI SAP CONSULTANT" label. Local guided templates are separately labeled "NOT LLM".
- The AI may ask the user to navigate to transaction/field/report and return with another screenshot. No autonomous SAP changes.

## Source and runtime
- New UI component: `saas/src/LiveCopilot.jsx`, integrated through `saas/src/App.jsx`.
- New Supabase Edge Function: `erp-copilot-chat`, deployed with JWT verification ON; access requires verified Supabase user, approved origin, DEV/QAS context, image review/consent and bounded message/image lengths.
- The Edge Function requires private environment settings `ERP_COPILOT_ENABLED=true` and `ERP_COPILOT_DEEPSEEK_API_KEY`, both absent/unverified. It therefore responds 503 and makes no billable model requests. The existing `vault.deepseek_api_key` is NOT automatically copied to function secrets and its value has not been exposed by this change.
- No chat text, image, SAP password or screenshot is written to Supabase by this function.
- The model protocol is DeepSeek Chat Completions using `deepseek-flash`, supporting user image URLs and text. No verified end-to-end request to the provider has taken place.
- Model is an adviser with the user's declared SAP context and screenshots; it **does not** have a real SAP collector, remote desktop control, SAP table data, DB access or executed RFC results.

## Deploy blocker
- Vercel API gave HTTP 402 `api-deployments-free-per-day` (more than 100) with retry after 86400 seconds. No retry/cost upgrade was attempted. Existing https://erp-intelligence-ai.vercel.app/ is still the older proven version.
- Before claiming v0.9 available, trigger build once deployment quota allows, verify Vite build and UI in Windows Chrome, sign-in redirect, image capture/mask workflow and error handling.
- Do not enable DeepSeek until secrets, account budgets, per-user spending cap, data-processing permissions and access boundaries are reviewed. Existing shared vmdb synthetic-only authorization remains unchanged.

## Verification acceptance
1. Login and select real DEV/client. No synthetic QAS claims in SAP Live.
2. Capture and stop sharing; no screenshot sent without review.
3. Mask sensitive regions; verify image bytes depict the mask before any allowed send.
4. Text question: JWT authenticated, gateway enabled, DeepSeek returns labelled response.
5. Image question: consented masked frame; model explicitly cites visible information and requests needed next evidence.
6. Persistent user session context within current tab; clear memory works.
7. No network or model calls while no consent or while gateway disabled.
8. Role/tenant isolation and per-user quota must be implemented before actual commercial SAP data.

## Next independent infrastructure work
- Securely set the Edge-only DeepSeek key through Supabase Functions Secrets (not ChatGPT, GitHub or browser JS); the existing Vault key may only be read by an authorized server-side mechanism.
- Configure provider spending limits and server-side per-user daily quota.
- Run redacted synthetic screenshot E2E test, then authorized DEV screen session.
- Implement signed local Companion for structured SAP GUI scripting read-only observability and allowlisted DEV/QAS diagnostic collectors; current screen share is view-only.
