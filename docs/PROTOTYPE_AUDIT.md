# Original Google AI Studio prototype — technical and UX inventory

**Date:** 2026-10-15. **Source:** user's uploaded ZIP, SHA-256 `a5b5d68c5d54ba5d84969f8783dd1b1465a12f26082bd5745823a6bf7eaa86ab`.

This is a **source-code audit**, not a browser screenshot audit, production deployment, or proof of live SAP connectivity.

## Product surfaces

1. Dashboard — hard-coded FI, MM and Basis trend charts.
2. AI Consultant — persona-based Greek/English Gemini chat, with fallback responses.
3. GUI Copilot — SAP screen guidance.
4. Script Recorder — generation of artifacts/scripts.
5. ABAP Studio — generation and editing of ABAP.
6. ALV Grid Simulator — local simulation.
7. Table Browser — in-memory sample data, uploads and SQL-like simulator.
8. Dump Analyzer — diagnostic narrative for supplied dumps.

Cross-cutting elements: Connection Manager, Prompt Studio, Relationship Graph, Ctrl/Cmd+K palette and three SAP-inspired UI themes.

## Critical issues before public hosting

- **P0:** `/api/sap/test-connection` can report `connected: true` from a simulated fallback without any SAP connection.
- **P0:** `/api/sap/live-proxy` is a general request-forwarding endpoint with caller-controlled URL, method and optional credentials; it needs replacement by authenticated, policy-restricted outbound HTTPS destinations.
- **P0:** No confirmed organization-aware identity/access control and no tenant isolation.
- **P0:** Dashboard and status-bar telemetry use sample/hardcoded values, potentially misleading users about real connection status.
- **P1:** No production-ready persistent diagnostic schema in this uploaded prototype.
- **P1:** AI conclusions are not tied to verified SAP evidence, timestamps and coverage, and generated ABAP has no required approval workflow.
- **P1:** Runtime packaging, error handling, Vercel deployment compatibility, SAP version support and mobile/accessibility testing remain unverified.

## Keep

SAP-focused navigation, bilingual support, command palette, ABAP sandbox, ALV sandbox, technical module vocabulary and diagnostics-focused visual direction.

## Direction for the final PRD (proposals, NOT approved scope)

**Workflow:** Company signup → SAP system registration → allowed DEV/QAS collector or offline export → validated ingestion → evidence and freshness indicators → module diagnosis → ranked findings → AI advisor grounded in the selected snapshot → human-reviewed ABAP recommendations → reports.

**Navigation:** Overview / Systems / Assessments / Findings / Modules / Archiving / Migration / ABAP Workbench / AI Advisor / Reports / Settings.

**Stack:** React frontend and Express-compatible serverless API on Vercel; Supabase PostgreSQL with organization boundaries, RLS where exposed, no browser-side secrets; authorization for ingestion and role-limited diagnostics.

**Production guardrail:** SAP PROD remains read-only. Installing a transport itself is a controlled SAP change, not read-only. Generated corrections are instructions or transport proposals for authorized DEV/QAS workflows, never autonomous PRD actions.

**Status:** PRD not finalized; original application source still pending import under `prototype/google-ai-studio/`. Do not deploy this app unchanged.
