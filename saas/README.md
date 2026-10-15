# ERP Intelligence AI — Vercel SaaS pilot v0.7

**Security-first deployed product foundation.** React + Vite with Supabase Auth, private JWT-validated synthetic pilot API, hybrid export preview, finding/action screens, and user-consented live **view-only** Windows SAP GUI capture via Web Screen Capture API.

## Important limitations

- **SYNTHETIC** snapshots only. All business values are synthetic demonstration, never real company performance.
- The authenticated pilot endpoint `erp-saas-pilot` checks user JWT then returns only `erp_intelligence` synthetic data.
- No SAP server, password or RFC is connected. The browser can show an explicitly shared SAP GUI **window** but does not provide AnyDesk-like remote control or SAP-aware AI screenshot analysis. A company-approved Windows Companion is required.
- No multi-tenant organizations/roles, subscriptions, invoicing, production dataset or real SAP writes are enabled. This is NOT yet ready to take commercial customer data.
- No unrestricted proxy from the legacy prototype is included.

## Preview

```bash
npm install
npm run build
npm run dev
```

Set public VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in Vercel. These values are public and not provider or service-role secrets. **Never place DeepSeek API keys in VITE_ variables.**

For a real end-user login enter email and use magic link. The demo can be explored without a login, with clear synthetic-only labels. After login the authenticated server API may show the two synthetic snapshots, never private ERP customer data.

Original AI Studio prototype remains separate under user-provided ZIP; legacy unsafe API routes are intentionally not deployed here.
