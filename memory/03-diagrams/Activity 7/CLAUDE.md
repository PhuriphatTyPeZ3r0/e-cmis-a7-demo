# 🤖 CLAUDE.md — Project Memory & AI Directives for Claude Code

## 🧠 Shared Memory Vault (Obsidian)
This project uses a shared Obsidian Memory Vault located at `docs/memory/`.

### 📌 Mandatory Startup Protocol:
1. **Read the Master Workflow first:** `docs/memory/standards/dev-workflow.md` — single entry point for
   the full Plan → Implement → Test → Commit cycle, shared by the whole team and every AI agent
   (Claude Code, Antigravity/Gemini).
2. **Read Memory on Wakeup:** Always reference `docs/memory/handovers/LATEST_HANDOVER.md` for current project state before starting any task.
3. **Follow Coding & Routing Standards:**
   - URL & Routing: `docs/memory/standards/naming-and-routing.md`
   - Coding & UI: `docs/memory/standards/coding-and-ui.md`
   - Git & Workflow: `docs/memory/standards/git-and-workflow.md`
4. **Synchronize Changes:** Keep notes in `docs/memory/` updated so Antigravity (Gemini) can seamlessly resume tasks.

### 🔄 6-Phase Workflow Cycle (full detail in `docs/memory/standards/dev-workflow.md`):
0. **Wakeup & Sync:** Read `LATEST_HANDOVER.md` + `dev-workflow.md` + pull latest `main`.
1. **Plan:** Write a task-level plan to `docs/memory/plans/<YYYY-MM-DD>-<slug>.md` before non-trivial work (see `dev-workflow.md` Phase 1).
2. **Implement:** Modify code in `e-cmis-a7-demo/res/` / `assets/` following existing standards.
3. **Test:** Pick the test layer(s) per change type — static CI, manual browser check, data-layer integration test, and/or Playwright E2E (see `dev-workflow.md` Phase 3 table).
4. **Memory Handoff:** Update `LATEST_HANDOVER.md` and mark the plan file `status: done`.
5. **Git Commit & Push:** Commit with Conventional Commits (e.g. `feat(res): ...`, `fix(auth): ...`) and push to `origin main`.