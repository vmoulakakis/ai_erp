# ERP Intelligence AI — Multi-Provider SAP Consultant v1.0

Date: 2026-10-15  
Status: **UI production build READY; Edge API v4 ACTIVE, but inference intentionally DISABLED until approved provider credentials, budgets and pilot access controls.** This does not provide live direct SAP RFC/GUI control.

## User choice

The user explicitly requested interchangeable models from DeepSeek, OpenAI and Hugging Face inside the *same* Live SAP Workspace, including vision models for manually approved SAP screenshots.

The chosen provider/model travels with each message. Browser session memory remains in place when provider changes; replies show the provider and model identity. Model-specific vision support is shown and screenshot attachment is blocked for unapproved text-only models.

## Implemented (deployed source)

**Vercel** `https://erp-intelligence-ai.vercel.app/`
- `saas/src/LiveCopilot.jsx`: provider and model selectors; supported model catalog; optional custom model name; distinct screenshot availability; truthful per-provider readiness; chat history and masked screenshot approval flow.
- `saas/src/style.css`: responsive model selector in SAP Live Workspace.
- Production deployment `dpl_946qtTiybfNAphH2UEE5Csrsd4Dp`, commit `63cdc1d9388ae6d0348114579bc68511985ebb3c`, **READY**; Vite completed `npm run build`, 1,638 transformed modules.
- Does **not** replace the enterprise-approved Windows SAP Companion or SAP diagnostic collector.

**Supabase** project `vmdb`, Edge Function `erp-copilot-chat` v4, `verify_jwt=true`:
- Calls routed to fixed, allowlisted provider hosts only: DeepSeek, OpenAI, Hugging Face Inference Router. There is no user-controlled proxy URL.
- Requires verified user JWT plus *explicit pilot user ID allowlist* `ERP_COPILOT_ALLOWED_USER_IDS`; empty by default.
- Requires `ERP_COPILOT_ENABLED=true`; disabled unless explicitly activated.
- API keys server-side only, per-provider secrets: `ERP_COPILOT_DEEPSEEK_API_KEY`, `ERP_COPILOT_OPENAI_API_KEY`, `ERP_COPILOT_HF_TOKEN`. None is passed to Vercel/frontend or committed to GitHub.
- Uses existing `ai_gateway.daily_request_budget` for atomic per-account limit of 10 requests/day; requires private Edge database connection `SUPABASE_DB_URL`.
- Custom model IDs allowed only after inclusion in the trusted server-side `ERP_COPILOT_EXTRA_MODELS_JSON` catalog; dynamic catalog entries are **text-only by default**.
- An opt-in JPEG screenshot is accepted only for trusted catalog Vision models, within size limit, after explicit masking review; otherwise questions are text only.
- Chats/screenshots are forwarded to model provider only if all gates pass; no screenshot or chat persistence is implemented.
- Model replies are not evidence of having queried SAP. User-selected session context remains self-declared until verified by a real SAP connector.

## Initial model presets (illustrative; actual API availability/billing must be tested)

| Provider | Model ID | Vision | Remarks |
| --- | --- | --- | --- |
| DeepSeek | `deepseek-flash` | yes | Supports image + text per official Vision docs |
| OpenAI | `gpt-4.1-mini` | yes | General SAP chat and screenshot reading |
| OpenAI | `gpt-4o-mini` | yes | Fast low-cost screenshot/chat |
| Hugging Face | `CohereLabs/aya-vision-32b:cohere` | yes | Availability subject to HF inference provider/account |
| Hugging Face | `Qwen/Qwen2.5-VL-3B-Instruct` | yes | Provider availability must be verified |
| Hugging Face | `openai/gpt-oss-120b` | no | Text only in approved catalog |

The model list is a UI catalog, **not proof that the user's provider key or model entitlement works**. HF access through ChatGPT OAuth does NOT equal an HF Inference Provider token; the connected OAuth scopes seen were read profile/repo, not inference calling. An OpenAI ChatGPT subscription is not a Platform API key.

## Required to activate inference (pending)

1. Keep pilot on DEV/QAS **synthetic or fully sanitized authorized material only**, no client financial/PII data until separate privacy/DPA and tenant security review.
2. Obtain and store server-only provider secrets (and rotate any credentials previously pasted in chat): create Edge Function Secrets with the exact names above. **The existing DeepSeek key in Supabase Vault is not auto-attached to an Edge Environment variable.** No value was read/exposed.
3. Configure `ERP_COPILOT_ALLOWED_USER_IDS` with approved Supabase Auth user IDs. Pilot restricted to explicitly allowed users.
4. Configure `SUPABASE_DB_URL` in trusted Edge secret manager, following project-safe database configuration; never expose it.
5. Configure per-provider account **spend limits**, and review data-processing consent, model capabilities, retention and logs before turning on. A daily request cap alone does not guarantee spend limit.
6. Set `ERP_COPILOT_ENABLED=true` **last**, after verifying backend and authorization.
7. Test one synthetic text prompt per provider, then one redacted synthetic screenshot through a Vision model; verify correct model selection, no screenshots to text-only, correct 403/429/503 errors.
8. Verify actual logged-in browser behavior and session continuity separately. READY build alone is not E2E login/provider acceptance.

## Safety and product boundaries

- LLM cannot read SAP tables, live status or GUI event metadata directly; user shares screen view and approved screenshots. Real SAP data retrieval requires a reviewed Windows Companion Agent and approved SAP diagnostic read-only collector.
- No SAP username/password entered into the web app.
- No automatic SAP writes, ABAP deployment or transport release.
- Change of LLM provider does not change SAP session, audit boundaries or data permissions.
- Preserve clear text labels: live model explanation vs grounded SAP collector evidence vs local static guidance.
- This is a protected pilot, **not yet commercially ready multi-tenant SaaS**.

## Official documentation

- DeepSeek Vision: https://api-docs.deepseek.com/guides/vision/
- OpenAI chat image input: https://platform.openai.com/docs/guides/images-vision
- Hugging Face Chat/Vision: https://huggingface.co/docs/inference-providers/en/tasks/chat-completion
- Hugging Face Inference Router: https://huggingface.co/docs/inference-providers/index
- Supabase Edge secrets: https://supabase.com/docs/guides/functions/secrets
