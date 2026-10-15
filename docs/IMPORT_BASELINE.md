# Importing the archived Google AI Studio source

This repository was initialized with product/audit documentation only. **The full React/Express source is not yet in GitHub.**

The reviewed Google AI Studio export contains 30 files / 38 ZIP entries and is preserved in a separate `ai_erp_GitHub_baseline_import_and_audit.zip` package prepared in this ChatGPT conversation.

The bundle includes a `publish_to_github.ps1` helper for Windows and an unmodified `prototype/google-ai-studio/` directory.

## Windows import

1. Download and extract the **GitHub baseline import and audit** ZIP from this conversation.
2. Install [Git for Windows](https://git-scm.com/downloads/win) if needed.
3. Open PowerShell in the extracted bundle.
4. Run:
   ```powershell
   Set-ExecutionPolicy -Scope Process Bypass
   .\publish_to_github.ps1
   ```
5. Authenticate to GitHub when Git Credential Manager asks, then confirm the new `prototype/google-ai-studio/` directory appears in `main`.

The script stages only that source directory and the two audit documents, never a local `.env` or `.env.local`.

**WARNING:** This GitHub repository is public. Do not import secrets, licensed customer data, or production SAP exports. The original `/api/sap/live-proxy` is unsafe for public deployment and the connection test can report fabricated successes. Do not deploy the prototype without remediation.

No Supabase or Vercel configuration, SAP transport or production deployment is performed by the importer.
