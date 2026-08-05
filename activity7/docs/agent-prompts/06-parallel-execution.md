# ⚡ Parallel Sub-Agent Execution Strategy (3-Wave)

Running the 5-stage pipeline serially wastes time on independent stages.
Sub-Agents 1 and 4 don't depend on each other, and once Sub-Agent 1 finishes,
Sub-Agents 2 and 3 can both consume its output in parallel. Grouping the
pipeline into 3 waves cuts wall-clock time versus running all 5 stages
back-to-back, while keeping each sub-agent's context isolated (each still
runs in its own thread/process, so token usage per agent doesn't grow).

## Wave structure

```
[ Wave 1: Parallel ] ──────────► [ Wave 2: Parallel ] ──────────► [ Wave 3: Final ]
  ├── Sub-Agent 1 (Legal & BA)     ├── Sub-Agent 2 (Flow Architect)   └── Sub-Agent 5 (Content Cleansing)
  └── Sub-Agent 4 (UI & Figma)     └── Sub-Agent 3 (QA Test Engineer)
```

- **Wave 1:** Sub-Agent 1 (legal/regulatory analysis) and Sub-Agent 4 (Figma
  pull + UI code) have no shared dependency - run concurrently.
- **Wave 2:** Sub-Agent 2 (flow diagram) and Sub-Agent 3 (test cases) both
  consume Sub-Agent 1's output and run concurrently against it.
- **Wave 3:** Sub-Agent 5 (content cleansing) merges and sanitizes the
  output of all four prior agents - runs last, alone.

## Running it

### Option 1: Bash (Claude Code CLI, Git Bash/WSL/macOS/Linux)

Use [`../../scripts/run_pipeline_parallel.sh`](../../scripts/run_pipeline_parallel.sh).
It backgrounds each `claude -p` call with `&` and synchronizes each wave with
`wait` before starting the next:

```bash
bash activity7/scripts/run_pipeline_parallel.sh
```

### Option 2: Python asyncio runner

Use [`../../scripts/run_pipeline_parallel.py`](../../scripts/run_pipeline_parallel.py)
for explicit error/return-code handling per agent:

```bash
python activity7/scripts/run_pipeline_parallel.py
```

### Option 3: IDE with split chat/terminal panes (Cursor / VS Code / Windsurf)

1. Open two chat panes. Pane 1: run Sub-Agent 1 (`@01-legal-ba.md`). Pane 2:
   run Sub-Agent 4 (`@04-mockup-developer.md`).
2. Once both finish, Pane 1: run Sub-Agent 2 referencing Sub-Agent 1's
   output. Pane 2: run Sub-Agent 3 referencing Sub-Agent 1's output.
3. In the main chat, run Sub-Agent 5 to merge and cleanse everything from
   Waves 1-2 into the final official-Thai output.

## Correcting the CLI syntax

Earlier drafts of this pipeline referenced `claude -f <file>` and
`claude ... --context <file>` - **neither flag exists** in the Claude Code
CLI (verified against `claude --help`). The scripts above use the real
non-interactive invocation instead:

- Load a prompt file: `claude -p "$(cat prompt.md)"` (the prompt is passed
  as an argument, not read from a file via `-f`).
- Chain context from a prior stage: concatenate the previous stage's output
  into the next stage's prompt text before invoking `claude -p` - there's no
  built-in flag for it.

## Caveats

1. **No TTY in `-p` mode:** non-interactive runs can't answer tool-use
   permission prompts. If a sub-agent needs to write files, push to a git
   branch, or call an MCP tool (Google Sheets, Figma), pre-approve the
   required tools before running this unattended, and review each prompt
   file first - don't blanket `--dangerously-skip-permissions` against
   production credentials.
2. **File/branch conflicts:** sub-agents running in the same wave must not
   write to the same file or git branch simultaneously. In this pipeline,
   Sub-Agent 1 writes to the Google Sheet and Sub-Agent 4 writes to git
   branch `Mock-up-7`, so Wave 1 is safe as designed.
3. **Create `outputs/` first:** both runners create it automatically, but if
   invoking `claude -p` manually, create `outputs/` before redirecting
   stdout into it.
