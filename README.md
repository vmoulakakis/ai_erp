# ERP Intelligence AI — SAP Diagnostic Copilot

> **Status (2026-10-15): Vercel SaaS pilot v0.7 deployed at https://erp-intelligence-ai.vercel.app/ ; it is SSO-protected and synthetic-only. No actual SAP connection, cross-tenant commercial SaaS backend, or live AI provider integration is ready.**

This repository is the home for the ERP Intelligence AI product, initially focused on SAP R/3 and ECC. We are reviewing an existing Google AI Studio React/Express prototype before selecting the production product requirements and architecture.

## Product direction (agreed)

- Target customer: businesses operating SAP systems; Greece first, global later.
- Main UX: evidence-led AI Cockpit + SAP Advisor, diagnostics by module, archiving and migration intelligence.
- SAP integration: authorized diagnostic collector installed through SAP transport in DEV/QAS; eventual production data access strictly read-only.
- AI-generated ABAP or configuration advice **only**, no automatic code execution or SAP writes.
- Infrastructure under consideration: Vercel + Supabase PostgreSQL, with tenant isolation, restricted ingestion and audit history.
- Go-to-market: self-service; availability and commercial viability still require validation.

## Hosted SaaS pilot

- [Vercel staging app](https://erp-intelligence-ai.vercel.app/) — actual successful production build, Vercel Auth protection enabled.
- [React/Vite source](./saas/) — company-style Mission Control, Supabase magic link, approved JSON local preview, live SAP GUI window capture (view-only), diagnostics, modules and export.
- [Deployment acceptance status](./docs/VERCEL_SAAS_DEPLOYMENT_v0.7.md) — confirms exact completed versus pending scope.
- The app is **not** a replacement for the full original AI Studio source; original ABAP Studio and all legacy features are pending safe migration.

## Source baseline

The original Google AI Studio prototype is being audited and will be imported under `prototype/google-ai-studio/` after verifying that no passwords, access tokens, or customer data are committed. **The application source has not yet been imported to this repository.** This README is the initial safe repository setup, not a claim of a running application.

Original AI Studio project (may require access): https://ai.studio/apps/b2cf7b67-e481-4e16-8a4b-b53b0ad1dd44

## Known issues before deployment

1. The original `/api/sap/test-connection` has a mock fallback that can return `connected: true` without an authenticated SAP connection.
2. `/api/sap/live-proxy` accepts arbitrary destinations and methods. Do not expose this endpoint to the public internet without strict authorization, HTTPS destination allowlisting and read-only controls.
3. Dashboard measurements are demonstration arrays, not SAP telemetry.
4. The prototype does not yet provide multi-tenant authentication, verified data isolation, or a real diagnostic ingestion lifecycle.
5. Never commit `.env`, DB credentials, API tokens, SAP connection passwords, or actual production exports.

## Next steps

1. Review original screens, workflows, interfaces and risks.
2. Agree the MVP scope and final PRD.
3. Import the untouched audited baseline.
4. Rebuild secure tenant-aware API and SAP collector integration.
5. Connect authorized test data to Supabase and verify build/deployment on Vercel.

**No production SAP changes are authorized by this repository.**
