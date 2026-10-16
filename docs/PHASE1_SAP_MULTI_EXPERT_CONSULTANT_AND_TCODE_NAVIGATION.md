# ERP Intelligence AI — Phase 1: Multi-Expert SAP Consultant + Transaction Navigator

**Status:** User-directed product requirement; planned, **not yet implemented**.  
**Date:** 2026-10-16  
**Product:** ERP Intelligence AI SAP Live Workspace (Windows SAP GUI; legacy SAP R/3/ECC first).  
**Do not confuse this requirement with generic chatbot, ABAP code generator or a fake remote SAP connection.**

## Approved Phase-1 intent

The end user wants to work naturally with an expert SAP consultant spanning **technical BASIS, functional SAP modules, ABAP and cross-module analysis**, and to request navigation to genuine SAP transaction codes from the chat. In Phase 1, the assistant **must not alter SAP application code, SAP customizing, business documents or production data**.

**Two distinct promises (do not conflate):**
1. AI conversation: context-aware, evidence-based, version-aware, multi-discipline SAP expertise.
2. SAP action: initiate **explicitly approved navigation only** to an allowed T-code in the user's currently authenticated SAP GUI for Windows session. This capability is not available in the current Vercel product; a company-approved local Windows Companion still needs to be developed, installed and validated. **SAP GUI Scripting is server-disabled** on the inspected DEV application server (`sapgui/user_scripting=FALSE`, `sapgui/user_scripting_set_readonly=FALSE`). Do not falsely claim that a screen-sharing browser can input T-codes or that server policy has changed.

## Expert orchestration / SAP expertise

The model may be selected among DeepSeek, OpenAI and supported Hugging Face models. A **SAP Expert Router** classifies an intent, invokes knowledge relevant to the release, combines related disciplines and provides one cohesive answer rather than incompatible independent bots.

Expert domains:
- BASIS / NetWeaver / SAP GUI / jobs / dumps / logs / interfaces / performance / upgrades
- ABAP / SQL / ALV / transports / program dependencies / ATC (static explanation and review, no code writes)
- FI/CO / AR/AP / GL / reconciliations / closing, MM / Inventory / Procurement, SD / Sales / Billing, PP / production, PM / maintenance, WM / warehouse, HCM (only authorized data)
- IDoc / ALE / RFC and external integration, authorization/audit, legacy Greek localization and e-invoicing
- SARA archiving, dependencies and SAP ECC -> S/4HANA readiness

The assistant must never claim omniscience or certified legal/financial correctness. Answers distinguish general SAP knowledge, customer-provided documentation, user-approved screenshot observations and **verified tool evidence**. Release-specific instructions must adapt to actual SAP_BASIS version; never assume SAP 7.4+ syntax for an unverified older R/3 system.

**Knowledge layer:** official licensed SAP documentation/customer-provided manuals/approved release notes, terminology, customer landscape metadata and vetted diagnostic playbooks. No unauthorized automated scraping of SAP Notes or redistribution of licensed materials. Retrieval must cite source and version. Memory: case/session recap (selected SID/client/transaction/findings/next action) scoped by authenticated organization, with retention and deletion controls. Existing local browser sessionStorage is temporary only, not enterprise memory.

## Interaction 1 — Natural consultation

User: "Βλέπεις το IDoc; Γιατί έχει αυτό το status;"  
AI: identifies what the uploaded redacted screenshot actually shows, proposes interpretation, requests one precise missing piece (e.g. status records), and suggests a non-destructive next step, with no fabricated live SAP queries.

User: "Ως BASIS πώς θα ελέγξουμε τα failed jobs;"  
AI: selects SM37 and relevant checks, states required SAP permissions, asks approval to navigate, then explains the visible results after user shares consented context.

User: "Χρειάζομαι FI + SD + ABAP διάγνωση"  
AI: decomposes module relationships and provides one unified investigation plan with evidence gaps and assumptions.

## Interaction 2 — Transaction navigation from chat

1. User explicitly requests `Open SM37` or clicks the proposed **Open transaction** action.
2. AI maps intent to an allowlisted transaction; determines whether it is **display/navigation only** and the correct SID/client.
3. A visible confirmation identifies `SAP DEV / Client 100 / SM37 / Navigational access` and prompts user approval.
4. A *signed, company-approved local Windows Companion* verifies the foreground SAP GUI window and correct login session, checks that its action policy and company policy allow this transaction, and issues the minimal navigation input. No backend knows SAP password.
5. Companion returns **observed success/failure**, not fabricated "connected" state. AI may request a consented screenshot of the result to interpret, or an approved, allowlisted read-only export if later integrated.
6. Explicit Stop/Pause, timeout and per-action audit, with no unattended access.

**Constraint with scripting OFF:** a possible future approach is narrowly scoped local Windows UI Automation / accessibility or foreground keyboard operation after authorization; it is not guaranteed to work on every SAP GUI control. Validate on DEV workstation and stop if focus/session cannot be proven. **Do not silently bypass a corporate policy against automation.** The safe fallback is a prominent `Copy T-code` button and human pastes `/nSM37` in SAP command field. No SAP server parameter changes are required for manual navigation.

**Starter allowlist (navigation only):** SM37, ST22, SM21, WE02, WE05, RZ11 (Display), SE38 (Display), SE11 (Display), system status — subject to actual user permissions. Launching one of these does not entitle the assistant to run programs, read arbitrary personal data, reprocess IDocs, edit ABAP or change profile parameters. No unrestricted `/n<arbitrary user Tcode>` injection.

## Clear Phase-1 No-Write Contract

**Allowed:** explain current screen, answer expert questions, request a sanitized screenshot, select an approved T-code, propose a diagnostic plan, read permitted results supplied by user, preserve session context with consent.  
**Not allowed:** edit/activate ABAP source, run arbitrary code, create/release/import transports, change customizing, post documents, release/delete jobs, restart failed processes, reprocess IDocs, modify users/authorizations, bypass SAP GUI scripting server restriction, store SAP passwords, run hidden unattended monitoring or pull unrestricted tables.

**UI clarity:** show `SAP Live: Screen shared` separately from `SAP GUI Connection: verified`, `Windows Companion: connected`, `AI model: verified`, and `SAP diagnostic tool: ready`. Never treat screen capture as an authenticated SAP read connection.

## Non-UI dependencies still missing (as of this phase)

- Multi-provider selector exists as frontend + gated backend, but **real OpenAI/DeepSeek/Hugging Face inference has not passed an end-to-end test and is not proven active**.
- No signed local Windows Companion installed; no SAP scripting engine access; cannot yet launch T-code by AI from browser.
- No verified knowledge retrieval/RAG pipeline or enterprise memory; no SAP connector for table/transaction read evidence; no customer tenant isolation suitable for commercial use.
- Supabase shared `vmdb` remains synthetic-only under prior user restriction.

## Required first acceptance test

On an authorized Windows DEV workstation with SAP GUI for Windows already logged in:
1. Ask consultant naturally in Greek to inspect jobs.
2. Assistant suggests SM37 with user-visible **Open T-code** / fallback **Copy T-code**.
3. User approves and, only if local companion exists, the correct SAP window navigates to SM37 without SAP password handling and without writing data.
4. A sanitized screenshot is shared on demand; the verified model explains only the observed screen, asks for next data and remembers the case.
5. Manual navigation remains usable if the scripting policy prohibits any automation.
6. Different domains (BASIS, IDoc, FI/SD, ABAP) receive coherent version-specific specialist answers with source/evidence distinctions.

**Next engineering milestone:** enable end-to-end authenticated LLM chat first, then build and test the signed Windows Companion's navigation-only interface in the authorized Windows workstation without modifying SAP server profile.
