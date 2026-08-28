# Activity 7 Multi-Agent Pipeline Prompts

Reference prompts for orchestrating a 5-stage sub-agent pipeline covering
Activity 7 (กระบวนงานพิจารณาและดำเนินการตามมติคณะกรรมการ ป.ป.ท. — เริ่มจากเลขาธิการ ป.ป.ท.).
Saved 2026-08-05 as reference material; not yet executed.

| # | File | Role | Primary Output |
|---|------|------|-----------------|
| 0 | [00-orchestrator.md](00-orchestrator.md) | Master Orchestrator | Pipeline status + payload handoff |
| 1 | [01-legal-ba.md](01-legal-ba.md) | Legal Compliance & BA | Legal Rules / SLA Matrix, Integration Matrix → Google Sheet `[กิจกรรมที่ 7]` |
| 2 | [02-flow-architect.md](02-flow-architect.md) | Process & Flow Architect | AS-IS/TO-BE mapping, BPMN breakdown, Draw.io XML patch |
| 3 | [03-qa-test-engineer.md](03-qa-test-engineer.md) | QA & Test Scenario Engineer | Unit Test Matrix (EP/BVA/State Transition), E2E Scenarios |
| 4 | [04-mockup-developer.md](04-mockup-developer.md) | Frontend & Mockup Developer | UI code merged into git branch `Mock-up-7` |
| 5 | [05-content-cleansing.md](05-content-cleansing.md) | Content Cleansing & Text Humanizer | Sanitized production Thai copy + UI Strings/Label Matrix |

See [06-parallel-execution.md](06-parallel-execution.md) for running Stages
1-5 as a 3-wave parallel pipeline (Sub-Agents 1+4, then 2+3, then 5), with
runnable scripts at [`../../scripts/run_pipeline_parallel.sh`](../../scripts/run_pipeline_parallel.sh)
and [`../../scripts/run_pipeline_parallel.py`](../../scripts/run_pipeline_parallel.py).

## Key references used across prompts

- Law source: `C:\6_Working\PMO1-03-08-2026\E-CMIS\diagram\Activity 7\law_pacc_68.pdf`
- Requirements sheet: Google Sheet tab `[กิจกรรมที่ 7]`
  https://docs.google.com/spreadsheets/d/1YHcP3a1b9Y7EWwJTf-ih6AJsnOV0jcOGydEzaGAdVfQ/edit?usp=sharing
- Diagram source: `C:\6_Working\PMO1-03-08-2026\E-CMIS\diagram\Activity 7\กิจกรรมที่ 7-V2.0.drawio`
- Figma MCP: https://www.figma.com/design/eGV3ESj90HSq712gz0f5uI/E-CMIS?m=dev
- Mockup code path: `C:\6_Working\PMO1-03-08-2026\E-CMIS\diagram\Activity 7\Mockup`
- Template Drive folder: https://drive.google.com/drive/folders/1AEnGzGMobywCp-sdrdi8ogTSlqRdbM42?usp=drive_link
- Target git branch: `Mock-up-7`

## Notes

- Each sub-agent prompt is designed to run in its own thread/context to avoid
  loading raw source files (PDF, XLSX, XML) into the orchestrator's context —
  only structured Markdown summaries should pass between stages.
- Sub-Agent 4 targets this repo (`E-CMIS-A4`, branch `Mock-up-7`), but the
  "Mockup code path" it references is the sibling `Activity 7/Mockup` folder,
  not `activity7/` in this repo — reconcile paths before running it.
