# 🤖 GEMINI.md — Project Memory & AI Directives for Antigravity (Gemini)

## 🧠 Shared Memory with Obsidian & Claude Code
This project uses a shared Obsidian Memory Vault located at `docs/memory/`.

### 📌 Mandatory Startup Protocol:
1. **Read Memory on Wakeup:** Always reference `docs/memory/handovers/LATEST_HANDOVER.md` for current project state before starting any task.
2. **Follow Coding, Routing & Workflow Standards:**
   - URL & Routing: `docs/memory/standards/naming-and-routing.md`
   - Coding & UI: `docs/memory/standards/coding-and-ui.md`
   - Git & Workflow: `docs/memory/standards/git-and-workflow.md`
3. **Synchronize Changes:** Keep notes in `docs/memory/` updated so Claude Code can seamlessly resume tasks.

### 🔄 4-Phase Workflow Cycle:
1. **Wakeup & Sync:** Read `LATEST_HANDOVER.md` + pull latest `main`.
2. **Dev & Verify:** Modify code in `e-cmis-a7-demo/res/` / `assets/` and verify in browser.
3. **Memory Handoff:** Update `LATEST_HANDOVER.md` with accomplishments and next steps.
4. **Git Commit & Push:** Commit with Conventional Commits (e.g. `feat(res): ...`, `fix(auth): ...`) and push to `origin main`.