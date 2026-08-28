"""
triage.py — Step 2b.

`gen`   : candidates.json           -> triage-<doc>.md   (human checklist)
`parse` : triage-<doc>.md (edited)  -> schema.json       (machine contract)

The Markdown file is the human interface. Each candidate becomes a block the
reviewer edits in place:

    ## f03  [gap]  p.1
    - context: `ผอ.กลุ่มงาน   <gap 92pt>`
    - class: field            # field | instruction | prefilled | ignore
    - id: group_director
    - label: ผอ.กลุ่มงาน
    - type: text              # text | date | textarea | number
    - hint:

`class`, `id`, `label`, `type`, `hint` are the only lines the reviewer touches.
Anything with class != field is dropped from schema.json (instructions become a
`hint` on a sibling field only if you paste the text there manually).
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

BLOCK_RE = re.compile(
    r"^##\s+(?P<auto>\w+)\s+\[(?P<kind>\w+)\]\s+p\.(?P<page>\d+)\s*$", re.M)
KV_RE = re.compile(r"^-\s+(?P<key>class|id|label|type|hint|context):\s?(?P<val>.*)$")
ANCHOR_RE = re.compile(r"⟦(.+?)⟧")


def gen(candidates_json: Path, out_md: Path) -> None:
    data = json.loads(candidates_json.read_text(encoding="utf-8"))
    cands = data["candidates"]
    lines: list[str] = []
    lines.append(f"# Triage — {data['doc_name']}")
    lines.append("")
    lines.append(f"Source: `{data['source_pdf']}`  ·  {len(cands)} candidates")
    lines.append("")
    lines.append("Edit each block: set `class` (field|instruction|prefilled|ignore), "
                 "and for `class: field` fix `id` (snake_case english), `label` "
                 "(Thai), `type` (text|date|textarea|number), optional `hint`.")
    lines.append("Only `class: field` blocks reach schema.json.")
    lines.append("")
    lines.append("---")
    lines.append("")
    for c in cands:
        ctx = c["line_text"] or c["marker_text"]
        marker = c["marker_text"]
        if marker and marker in ctx:
            ctx = ctx.replace(marker, f"⟦{marker}⟧", 1)
        elif marker:
            ctx = f"{ctx}   ⟦{marker}⟧"
        lines.append(f"## {c['auto_id']}  [{c['kind']}]  p.{c['page']}")
        lines.append(f"- context: `{ctx}`")
        if c["color"]:
            lines.append(f"- color: {c['color']}  ·  font: {c['font']}  ·  {c['size']}pt")
        lines.append(f"- note: {c['note']}")
        lines.append(f"- class: {c['suggested_class'] or 'ignore'}")
        lines.append(f"- id: {_auto_snake(c['label_guess']) if c['suggested_class']=='field' else ''}")
        lines.append(f"- label: {c['label_guess']}")
        lines.append(f"- type: {c['suggested_type'] or 'text'}")
        lines.append("- hint: ")
        lines.append("")
    out_md.write_text("\n".join(lines), encoding="utf-8")
    print(f"[triage.gen] {len(cands)} blocks -> {out_md}")


THAI_MAP = {
    "วันที่": "date", "ลว.": "doc_date", "เรื่อง": "subject", "ที่": "ref_no",
    "ส่วนราชการ": "division", "ผู้จัดทำ": "prepared_by", "ผอ.กบค": "kbc_director",
    "ผอ.กลุ่มงาน": "group_director", "เรียน": "attn", "ผู้รับผิดชอบ": "responsible_person",
    "พิมพ์": "typist", "ทาน": "proofreader",
}


def _auto_snake(label: str) -> str:
    for th, en in THAI_MAP.items():
        if th in label:
            return en
    ascii_only = re.sub(r"[^a-z0-9]+", "_", label.lower()).strip("_")
    return ascii_only or "field"


def parse(md_path: Path, out_json: Path, doc_name: str) -> None:
    text = md_path.read_text(encoding="utf-8")
    fields = []
    seen_ids: set[str] = set()
    matches = list(BLOCK_RE.finditer(text))
    for i, m in enumerate(matches):
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        body = text[start:end]
        rec = {"class": "", "id": "", "label": "", "type": "text", "hint": "",
               "context": ""}
        for bl in body.splitlines():
            km = KV_RE.match(bl.strip())
            if km:
                rec[km.group("key")] = km.group("val").strip()
        if rec["class"] != "field":
            continue
        am = ANCHOR_RE.search(rec["context"])
        anchor = am.group(1).strip() if am else ""
        ctx_before = ctx_after = ""
        if am:
            ctx_before = rec["context"][:am.start()].strip()[-24:]
            ctx_after = rec["context"][am.end():].strip()[:24]
        if anchor.strip("_") == "" or set(anchor) <= set("._…·． "):
            anchor = ""  # a blank marker, not a literal value to find
        fid = rec["id"] or _auto_snake(rec["label"]) or m.group("auto")
        base = fid
        k = 2
        while fid in seen_ids:
            fid = f"{base}_{k}"
            k += 1
        seen_ids.add(fid)
        entry = {
            "id": fid,
            "label": rec["label"],
            "type": rec["type"] or "text",
            "placeholder": "{" + fid + "}",
            "source": {"auto_id": m.group("auto"), "kind": m.group("kind"),
                       "page": int(m.group("page")),
                       # current literal text in the source PDF, used only at
                       # build time to locate the spot; NOT a default value.
                       "anchor": anchor,
                       "ctx_before": ctx_before,
                       "ctx_after": ctx_after},
        }
        if rec["hint"]:
            entry["hint"] = rec["hint"]
        fields.append(entry)

    schema = {
        "doc_name": doc_name,
        "version": 1,
        "placeholder_syntax": "single-brace {field}",
        "date_value_format": "ISO 8601 (YYYY-MM-DD); rendered as Thai Buddhist-era",
        "fields": fields,
    }
    out_json.write_text(json.dumps(schema, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[triage.parse] {len(fields)} fields -> {out_json}")


def main(argv: list[str]) -> int:
    if len(argv) < 2 or argv[1] not in {"gen", "parse"}:
        print("usage: python -m pipeline.triage gen   <candidates.json> <triage.md>\n"
              "       python -m pipeline.triage parse <triage.md> <schema.json>",
              file=sys.stderr)
        return 2
    if argv[1] == "gen":
        gen(Path(argv[2]), Path(argv[3]))
    else:
        md = Path(argv[2])
        parse(md, Path(argv[3]), doc_name=md.stem.replace("triage-", ""))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
