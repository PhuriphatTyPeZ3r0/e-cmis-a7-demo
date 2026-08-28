"""E-CMIS Activity 7 - Parallel Sub-Agent Pipeline Runner (3-Wave).

Requires the Claude Code CLI (`claude`) on PATH. Each sub-agent runs as a
one-shot, non-interactive `claude -p <prompt>` process; prompts are passed
as an argv list (not a shell string) so multi-line prompt files with quotes
or special characters don't break invocation. There is no `--context` flag
in the CLI - prior-stage context is chained by concatenating the previous
stage's output file into the next stage's prompt text before the call.

NOTE: `-p` sessions have no TTY to approve tool-use permission prompts. If a
sub-agent needs to write files/branches/MCP calls, pre-approve the required
tools (e.g. via a --settings file or --allowedTools) before running this
unattended, and review each prompt file first.
"""

import asyncio
from pathlib import Path

PROMPT_DIR = Path("activity7/docs/agent-prompts")
OUT_DIR = Path("outputs")


async def run_agent(prompt_file: str, context_files: list[str] | None, output_file: str) -> None:
    prompt = (PROMPT_DIR / prompt_file).read_text(encoding="utf-8")
    if context_files:
        context_blocks = "\n\n".join(
            (OUT_DIR / f).read_text(encoding="utf-8") for f in context_files
        )
        prompt = f"{prompt}\n\n# CONTEXT FROM PREVIOUS STAGE\n{context_blocks}"

    print(f"Starting: {prompt_file}")
    process = await asyncio.create_subprocess_exec(
        "claude", "-p", prompt,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await process.communicate()

    (OUT_DIR / output_file).write_text(stdout.decode("utf-8"), encoding="utf-8")
    if process.returncode != 0:
        print(f"FAILED: {prompt_file} (exit {process.returncode})\n{stderr.decode('utf-8')}")
    else:
        print(f"Finished: {prompt_file}")


async def main() -> None:
    OUT_DIR.mkdir(exist_ok=True)

    print("--- STAGE 1 ---")
    await asyncio.gather(
        run_agent("01-legal-ba.md", None, "payload_01.md"),
        run_agent("04-mockup-developer.md", None, "payload_04.md"),
    )

    print("--- STAGE 2 ---")
    await asyncio.gather(
        run_agent("02-flow-architect.md", ["payload_01.md"], "payload_02.md"),
        run_agent("03-qa-test-engineer.md", ["payload_01.md"], "payload_03.md"),
    )

    print("--- STAGE 3 ---")
    await run_agent(
        "05-content-cleansing.md",
        ["payload_01.md", "payload_02.md", "payload_03.md", "payload_04.md"],
        "final_production_output.md",
    )


if __name__ == "__main__":
    asyncio.run(main())
