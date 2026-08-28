#!/bin/bash
# E-CMIS Activity 7 - Parallel Sub-Agent Pipeline Runner (3-Wave)
# Requires: Claude Code CLI (`claude`) on PATH.
#
# Each stage invokes `claude -p "<prompt>"` (non-interactive/print mode) as a
# background job, then `wait`s for the wave to finish before starting the
# next wave. Context is chained by concatenating the prior stage's output
# file into the next stage's prompt text (there is no --context flag).
#
# NOTE: `-p` sessions have no TTY to approve tool-use permission prompts.
# If a sub-agent needs to write files/branches/MCP calls, either pre-approve
# via --allowedTools, or run with --dangerously-skip-permissions ONLY in a
# sandboxed/trusted environment - never against production Google
# Sheets/Figma/git credentials without reviewing the prompt first.

set -euo pipefail

PROMPT_DIR="activity7/docs/agent-prompts"
OUT_DIR="outputs"
mkdir -p "$OUT_DIR"

echo "Starting E-CMIS Sub-Agent Parallel Pipeline..."

# ----------------------------------------------------
# STAGE 1: Parallel Execution (Sub-Agent 1 & Sub-Agent 4)
# ----------------------------------------------------
echo "[Stage 1] Running Sub-Agent 1 (Legal) & Sub-Agent 4 (UI Mockup) in parallel..."

claude -p "$(cat "$PROMPT_DIR/01-legal-ba.md")" > "$OUT_DIR/payload_01.md" &
PID_AGENT1=$!

claude -p "$(cat "$PROMPT_DIR/04-mockup-developer.md")" > "$OUT_DIR/payload_04.md" &
PID_AGENT4=$!

wait "$PID_AGENT1" "$PID_AGENT4"
echo "[Stage 1] Completed."

# ----------------------------------------------------
# STAGE 2: Parallel Execution (Sub-Agent 2 & Sub-Agent 3)
# Both depend on Sub-Agent 1's output (payload_01.md).
# ----------------------------------------------------
echo "[Stage 2] Running Sub-Agent 2 (Flow) & Sub-Agent 3 (QA) in parallel..."

claude -p "$(cat "$PROMPT_DIR/02-flow-architect.md")

# CONTEXT FROM STAGE 1 (Sub-Agent 1 output)
$(cat "$OUT_DIR/payload_01.md")" > "$OUT_DIR/payload_02.md" &
PID_AGENT2=$!

claude -p "$(cat "$PROMPT_DIR/03-qa-test-engineer.md")

# CONTEXT FROM STAGE 1 (Sub-Agent 1 output)
$(cat "$OUT_DIR/payload_01.md")" > "$OUT_DIR/payload_03.md" &
PID_AGENT3=$!

wait "$PID_AGENT2" "$PID_AGENT3"
echo "[Stage 2] Completed."

# ----------------------------------------------------
# STAGE 3: Final Cleansing (Sub-Agent 5)
# ----------------------------------------------------
echo "[Stage 3] Running Sub-Agent 5 (Content Cleansing)..."

claude -p "$(cat "$PROMPT_DIR/05-content-cleansing.md")

# INPUT CONTENT TO CLEANSE (Stage 1 + Stage 2 outputs)
$(cat "$OUT_DIR/payload_01.md")
$(cat "$OUT_DIR/payload_02.md")
$(cat "$OUT_DIR/payload_03.md")
$(cat "$OUT_DIR/payload_04.md")" > "$OUT_DIR/final_production_output.md"

echo "All Sub-Agents completed. Output saved to $OUT_DIR/final_production_output.md"
