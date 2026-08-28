# PDF → template pipeline

Standalone tool. Converts the born-digital Thai government PDFs in
`04-เอกสาร-20260827/` into reusable form templates:

* `schema.json`    — the field contract (id, label, type, placeholder)
* `reference.docx` — layout-faithful LibreOffice conversion (NO placeholders; for eyeballing)
* `template.docx`  — clean skeleton with every `{field}` placeholder, for docxtemplater export
* `preview.html`   — A4 `.doc-paper` fragment using the repo's ECMIS classes
* `form.html`      — Bootstrap left-pane form generated from the schema
* `index.html`     — 2-pane demo wiring form + preview + schema live (preview inlined; open over http for DOCX export)

**Not wired into the app or its CI.** Output goes to `../../output-template/`
(git-ignored). Integrating a template into a real dual-route page is a separate
manual step.

## Requirements

* Python 3.11 + `pymupdf`, `python-docx`  (`pip install -r requirements.txt`)
* LibreOffice (`soffice`) on PATH or at `C:\Program Files\LibreOffice\program\soffice.exe`
* Always run with `PYTHONUTF8=1` (Thai text on a cp1252 console otherwise crashes)

## Flow (per document)

```
# 2a. extract fill-in candidates from the PDF
PYTHONUTF8=1 python -m pipeline.extract "<pdf>" "../../output-template/<name>"

# 2b. turn candidates into a human checklist
PYTHONUTF8=1 python -m pipeline.triage gen \
    "../../output-template/<name>/candidates.json" \
    "../../output-template/<name>/triage-<name>.md"

#  --- HUMAN edits triage-<name>.md: set class / id / label / type / hint ---

# 2c. checklist -> schema.json
PYTHONUTF8=1 python -m pipeline.triage parse \
    "../../output-template/<name>/triage-<name>.md" \
    "../../output-template/<name>/schema.json"

# 2d. build reference.docx + template.docx + preview.html + form.html + index.html
PYTHONUTF8=1 python -m pipeline.build "../../output-template/<name>"

# view the demo
cd ../../output-template && python -m http.server 8899
#   -> http://localhost:8899/<name>/index.html
```

## Detection channels (`pipeline/extract.py`)

| kind       | signal                                             | default class |
|------------|----------------------------------------------------|---------------|
| `colored`  | span colour ≠ black; red text ⇒ usually a *drafter instruction*, red blank span ⇒ insert-here flag | instruction / field |
| `white`    | span colour = `#ffffff`; data pre-filled invisibly (names, citizen IDs) | prefilled |
| `dotleader`| a run of `..........` after a label                | field |
| `gap`      | oversized inter-span gap, or a short left-aligned line ending far from the right margin | field |

All channels are permissive by design — the triage step is where a human
decides what each candidate actually is.

## Status

* Files in scope now: **2, 5, 6** (clean one-page memos).
* Files 1, 3, 4, 7 (drafter instructions + hidden variables + 10-page narrative)
  are deferred to a later design.
