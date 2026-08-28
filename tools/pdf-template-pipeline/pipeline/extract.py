"""
extract.py — Step 2a of the PDF -> template pipeline.

Reads one born-digital PDF and emits a `candidates.json` describing every spot
that *might* be a fill-in point. Detection is deliberately permissive; the human
triage step (triage-<doc>.md) decides what each candidate really is.

Four detection channels (see docs/memory survey 2026-08-28):
  1. colored     - span colour != black. Red runs are usually drafter
                   instructions; red whitespace-only spans are "insert here"
                   flags.
  2. white       - span colour == white (#ffffff): data already filled into the
                   source PDF invisibly (names, 13-digit citizen IDs, vendors).
  3. dotleader   - a run of dots ".........." after a label.
  4. gap         - an oversized horizontal whitespace gap after a short label
                   on an otherwise normal line.

No single channel covers more than ~4 of the 7 sample files, so all four run.
"""

from __future__ import annotations

import json
import re
import sys
from dataclasses import dataclass, asdict, field
from pathlib import Path

import pymupdf  # PyMuPDF >= 1.24

# ---------------------------------------------------------------------------
# tuning knobs
# ---------------------------------------------------------------------------
GAP_FONT_MULTIPLE = 2.4      # a gap wider than this * font-size (pt) is a candidate
GAP_MIN_PT = 28.0            # ...but never below this absolute width
TRAIL_GAP_MIN_PT = 120.0     # trailing gap to right margin must be at least this wide
TRAIL_MAX_WORDS = 5          # ...and the line must be a short label, not a sentence
LEFT_MARGIN_SLACK = 6.0      # a line starts "at the margin" within this many pt
LABEL_MAX_WORDS = 8          # keep this many trailing tokens as the label guess
LABEL_MAX_CHARS = 60
THAI_SENTENCE_ENDERS = ("นั้น", "ครับ", "ค่ะ", "แล้ว", "ด้วย")
DOTLEADER_RE = re.compile(r"[.\u2026\u00b7\uff0e]{3,}")
TRAILING_SENTENCE_RE = re.compile(r"[\u0e2f.\u2026:]\s*$")  # ฯ . … :
BLACK = 0x000000
WHITE = 0xFFFFFF


def _hex(color_int: int) -> str:
    return f"#{color_int & 0xFFFFFF:06x}"


def _is_reddish(color_int: int) -> bool:
    r = (color_int >> 16) & 0xFF
    g = (color_int >> 8) & 0xFF
    b = color_int & 0xFF
    return r >= 0xC0 and g <= 0x60 and b <= 0x60


def _clean_label(text: str) -> str:
    text = re.sub(r"\s+", " ", text).strip(" .\u2026\u00b7\uff0e:\u0e2f-")
    words = text.split(" ")
    if len(words) > LABEL_MAX_WORDS:
        text = " ".join(words[-LABEL_MAX_WORDS:])
    if len(text) > LABEL_MAX_CHARS:
        text = text[-LABEL_MAX_CHARS:]
    return text.strip()


@dataclass
class Candidate:
    auto_id: str
    page: int              # 1-based
    kind: str              # colored | white | dotleader | gap
    label_guess: str
    line_text: str         # full reconstructed line for context
    marker_text: str       # the exact text of the marker span, if any
    color: str             # hex, "" when n/a
    bbox: list             # [x0, y0, x1, y1] of the marker / gap
    font: str = ""
    size: float = 0.0
    note: str = ""         # extractor's hint for the human
    suggested_class: str = ""  # extractor's guess: field|instruction|prefilled|ignore
    suggested_type: str = ""   # text|date|textarea|number
    tags: list = field(default_factory=list)


def _line_spans(line: dict) -> list[dict]:
    spans = [s for s in line.get("spans", []) if s.get("text") is not None]
    spans.sort(key=lambda s: s["bbox"][0])
    return spans


def _line_text(spans: list[dict]) -> str:
    return re.sub(r"\s+", " ", "".join(s["text"] for s in spans)).strip()


def extract(pdf_path: Path) -> list[Candidate]:
    doc = pymupdf.open(pdf_path)
    out: list[Candidate] = []
    n = 0

    def next_id() -> str:
        nonlocal n
        n += 1
        return f"f{n:02d}"

    for pno in range(doc.page_count):
        page = doc[pno]
        page_no = pno + 1
        page_right = page.rect.x1
        data = page.get_text("dict")

        # left text margin = smallest span x0 seen on the page (ignores strays)
        xs = [s["bbox"][0]
              for b in data.get("blocks", []) if b.get("type") == 0
              for ln in b.get("lines", []) for s in ln.get("spans", [])]
        left_margin = min(xs) if xs else 0.0

        for block in data.get("blocks", []):
            if block.get("type") != 0:
                continue
            for line in block.get("lines", []):
                spans = _line_spans(line)
                if not spans:
                    continue
                ltext = _line_text(spans)
                sizes = [s.get("size", 0) for s in spans if s.get("size")]
                base_size = (sorted(sizes)[len(sizes) // 2]) if sizes else 16.0

                # ---- channel 1 & 2: coloured / white spans -------------------
                for s in spans:
                    col = int(s.get("color", 0))
                    stext = s.get("text", "")
                    if col == BLACK:
                        continue
                    if col == WHITE:
                        out.append(Candidate(
                            auto_id=next_id(), page=page_no, kind="white",
                            label_guess=_clean_label(ltext.replace(stext, " ")),
                            line_text=ltext, marker_text=stext.strip(),
                            color=_hex(col), bbox=[round(v, 1) for v in s["bbox"]],
                            font=s.get("font", ""), size=round(s.get("size", 0), 1),
                            note="white hidden text = data already filled into the "
                                 "source PDF. Extract as field, DISCARD the value.",
                            suggested_class="prefilled",
                            suggested_type="text",
                        ))
                        continue
                    # non-black, non-white
                    blank_only = stext.strip() == ""
                    reddish = _is_reddish(col)
                    if blank_only:
                        note = ("red whitespace-only span = an 'insert text here' "
                                "flag in the source.")
                        sclass = "field"
                    elif reddish:
                        note = ("red text = usually a DRAFTER INSTRUCTION "
                                "(what/when to fill), not a field. Consider "
                                "class=instruction and move to field hint.")
                        sclass = "instruction"
                    else:
                        note = "non-black coloured run; review."
                        sclass = ""
                    out.append(Candidate(
                        auto_id=next_id(), page=page_no, kind="colored",
                        label_guess=_clean_label(ltext.replace(stext, " ") if not blank_only else ltext),
                        line_text=ltext,
                        marker_text=stext.strip(),
                        color=_hex(col), bbox=[round(v, 1) for v in s["bbox"]],
                        font=s.get("font", ""), size=round(s.get("size", 0), 1),
                        note=note, suggested_class=sclass,
                        suggested_type="textarea" if not blank_only else "text",
                    ))

                # ---- channel 3: dot leaders --------------------------------
                for m in DOTLEADER_RE.finditer(ltext):
                    # label = text between the previous leader (or line start)
                    # and this leader, so "A .... B ...." yields A then B
                    prev = 0
                    for pm in DOTLEADER_RE.finditer(ltext):
                        if pm.start() >= m.start():
                            break
                        prev = pm.end()
                    label = _clean_label(ltext[prev:m.start()])
                    if not label:
                        continue
                    out.append(Candidate(
                        auto_id=next_id(), page=page_no, kind="dotleader",
                        label_guess=label, line_text=ltext,
                        marker_text=m.group(0), color="",
                        bbox=[round(spans[0]["bbox"][0], 1), round(line["bbox"][1], 1),
                              round(line["bbox"][2], 1), round(line["bbox"][3], 1)],
                        size=round(base_size, 1),
                        note="dotted leader after a label = classic fill-in blank.",
                        suggested_class="field",
                        suggested_type=_guess_type(label),
                    ))

                # ---- channel 4: oversized inter-span gaps -----------------
                gap_threshold = max(GAP_MIN_PT, base_size * GAP_FONT_MULTIPLE)
                for i in range(len(spans) - 1):
                    left, right = spans[i], spans[i + 1]
                    gap = right["bbox"][0] - left["bbox"][2]
                    if gap < gap_threshold:
                        continue
                    label = _clean_label("".join(s["text"] for s in spans[: i + 1]))
                    if not label or len(label) < 2:
                        continue
                    out.append(Candidate(
                        auto_id=next_id(), page=page_no, kind="gap",
                        label_guess=label, line_text=ltext,
                        marker_text=f"<gap {gap:.0f}pt>", color="",
                        bbox=[round(left["bbox"][2], 1), round(left["bbox"][1], 1),
                              round(right["bbox"][0], 1), round(left["bbox"][3], 1)],
                        size=round(base_size, 1),
                        note=f"wide whitespace gap ({gap:.0f}pt) after a label.",
                        suggested_class="field",
                        suggested_type=_guess_type(label),
                    ))
                # trailing gap to the right margin — only for a short line that
                # starts hard against the left margin (routing labels do; headings,
                # slogans, centred signature lines do not) and is not a sentence.
                last = spans[-1]
                first = spans[0]
                trail = page_right - last["bbox"][2]
                is_left_aligned = first["bbox"][0] <= left_margin + LEFT_MARGIN_SLACK
                looks_like_sentence = (
                    len(ltext) > LABEL_MAX_CHARS
                    or ltext.endswith(THAI_SENTENCE_ENDERS)
                    or TRAILING_SENTENCE_RE.search(ltext) is not None
                    or len(ltext.split(" ")) > TRAIL_MAX_WORDS)
                if (trail >= TRAIL_GAP_MIN_PT and is_left_aligned
                        and not looks_like_sentence and len(ltext) >= 2):
                    label = _clean_label(ltext)
                    if label:
                        out.append(Candidate(
                            auto_id=next_id(), page=page_no, kind="gap",
                            label_guess=label, line_text=ltext,
                            marker_text=f"<trailing gap {trail:.0f}pt>", color="",
                            bbox=[round(last["bbox"][2], 1), round(last["bbox"][1], 1),
                                  round(page_right, 1), round(last["bbox"][3], 1)],
                            size=round(base_size, 1),
                            note=f"short left-aligned line ends {trail:.0f}pt short "
                                 f"of the right margin — likely a fill-in blank.",
                            suggested_class="field",
                            suggested_type=_guess_type(label),
                        ))

    doc.close()
    return out


DATE_HINTS = ("วันที่", "ลว.", "ลงวันที่", "เมื่อวันที่")
NUM_HINTS = ("จำนวน", "ราย", "บาท", "ครั้งที่")


def _guess_type(label: str) -> str:
    if any(h in label for h in DATE_HINTS):
        return "date"
    if any(h in label for h in NUM_HINTS):
        return "number"
    return "text"


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        print("usage: python -m pipeline.extract <pdf> [out_dir]", file=sys.stderr)
        return 2
    pdf_path = Path(argv[1])
    out_dir = Path(argv[2]) if len(argv) > 2 else Path("output-template") / pdf_path.stem
    out_dir.mkdir(parents=True, exist_ok=True)

    cands = extract(pdf_path)
    payload = {
        "source_pdf": str(pdf_path),
        "doc_name": pdf_path.stem,
        "candidate_count": len(cands),
        "candidates": [asdict(c) for c in cands],
    }
    (out_dir / "candidates.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[extract] {pdf_path.name}: {len(cands)} candidates -> {out_dir/'candidates.json'}")
    by_kind: dict[str, int] = {}
    for c in cands:
        by_kind[c.kind] = by_kind.get(c.kind, 0) + 1
    for k, v in sorted(by_kind.items()):
        print(f"           {k:10s} {v}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
