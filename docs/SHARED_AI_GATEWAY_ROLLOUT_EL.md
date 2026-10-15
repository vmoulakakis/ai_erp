# Shared AI Gateway — ασφαλής προετοιμασία (2026-10-15)

**Κατάσταση: DEPLOYED / DISABLED / NOT READY FOR PRODUCTION**

Supabase project: `vmdb` (`gqpbskssrvpfjtujwezc`)  
New Edge Function: `shared-ai-gateway` (version 1)  
New private schema: `ai_gateway`; table `daily_request_budget`  
Secret expected: Supabase Vault name `deepseek_api_key` — **NOT PRESENT** as of this review.

## What was actually done

- A **new isolated** quota table was created (not in `public` and not in `erp_intelligence`).
- RLS was enabled and forced, no policies, and grants to `anon`, `authenticated`, `service_role` were removed.
- A *new* `shared-ai-gateway` Edge Function was deployed; existing Edge Functions were not edited.
- Safe source was added under `infrastructure/ai-gateway/index.ts` in `ai_erp`. **No API key, customer data, or runtime token was committed.**
- Existing `public` relation count still 154; existing synthetic `erp_intelligence.diagnostic_snapshots` rows still 2.
- The provider key has **not** been created or saved. A previously posted DeepSeek key is not suitable for production; revoke it.

## Fail-closed behavior

1. HTTP POST is denied with a 503 response unless the private Edge environment variable `AI_GATEWAY_ENABLED=true` is explicitly set.
2. Requests must be server-to-server; direct browser `Origin` requests are rejected.
3. Independent per-project tokens are required by `AI_GATEWAY_CLIENTS_JSON`, with token SHA-256 hashes only and configurable daily limits.
4. An authenticated call can only use the explicitly allowed `deepseek-flash` model with `classification: "synthetic"`; input length and completion tokens are bounded.
5. The key is retrieved inside the trusted Edge server only from `vault.decrypted_secrets`, never returned as an HTTP response.
6. Daily request limits are reserved atomically in `ai_gateway.daily_request_budget`.
7. Prompt text and provider secrets are not persisted or printed by the gateway code.
8. Service is **not production ready**: no real client configured, no billing approvals, no end-to-end invocation, no security load tests, and no verified provider request.

## One remaining human authorization

A brand-new DeepSeek API key must be issued under the **authenticated DeepSeek account** at https://platform.deepseek.com/api_keys. The current chat connection cannot browse the logged-in DeepSeek account or generate a provider key without it. This is not a feature of Supabase. Never reuse a key that was pasted into a conversation, Git repository, or logs.

Once generated, add it **directly in the Supabase Vault UI**:

https://supabase.com/dashboard/project/gqpbskssrvpfjtujwezc/integrations/vault

Create secret:
- Name: `deepseek_api_key`
- Secret value: the *newly generated* DeepSeek API key
- Do not copy the value into chat, GitHub, client-side Vercel variables, or spreadsheets.

Confirm by metadata query only:
```sql
SELECT count(*) AS configured
FROM vault.secrets
WHERE name = 'deepseek_api_key';
```

Do **not** select from `vault.decrypted_secrets` in logs, chat, or dashboards to verify the value.

## Future integration checklist (NOT done)

- Provision separate random 256-bit application tokens, **one per backend**, with only their SHA-256 fingerprints configured in the Edge environment.
- Store each raw app token in the corresponding backend secret manager (for example, Vercel project environment variables) — NEVER in browser `NEXT_PUBLIC_*` values.
- Configure daily token and spend budgets, allowlisted use cases, data retention/PII policy and admin kill switch.
- Verify actual permission denial, quotas, upstream DeepSeek response, billing and cost limits, and prompt sensitivity detection.
- Enable `AI_GATEWAY_ENABLED=true` only after all tests, billing limits, updated active key and explicit approval.
- Integrate one test app at a time; leave ERP, TravelAI, PISIPOUK and other production applications unchanged until their owners approve an individual integration.

## Notes on Supabase Edge authentication

`verify_jwt=false` is intentionally paired with **mandatory custom server-to-server Bearer token verification inside the function**, and the independent master switch is disabled by default. A public Supabase publishable key alone cannot authorize inference. This setup must receive a security review before enabling it; serverless stateless daily rate limits alone do not replace provider-level spending caps.

## Links

- Supabase Vault: https://supabase.com/docs/guides/database/vault
- Supabase Edge secrets: https://supabase.com/docs/guides/functions/secrets
- DeepSeek API: https://api-docs.deepseek.com/guides/codex
