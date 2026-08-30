"""
bundle.py — combine the per-doc order-fragment.js files that pipeline.build
emits into ONE file for the app: assets/order-memo-docs.js
(loaded by order.html + res/order.html).

Also copies each doc's template.docx into assets/templates/ under a stable name.

Run after pipeline.build has produced every output-template/<doc>/order-fragment.js:
    PYTHONUTF8=1 python -m pipeline.bundle
"""

from __future__ import annotations

import json
import shutil
import sys
from pathlib import Path

# repo root = three levels up from this file (tools/pdf-template-pipeline/pipeline)
REPO = Path(__file__).resolve().parents[3]
OUT_TPL = REPO / "output-template"

# doc id -> (output-template folder, assets/templates docx name)
DOCS = {
    "notify_zone": ("2.บันทึกแจ้งรายงานการไต่สวนและวินิจฉัยชี้",
                    "memo-7x-notify-zone.docx"),
    "transmit_kbc": ("5.บันทึกส่งให้กลุ่มงานบริหารติดตามคดี",
                     "memo-7x-transmit-kbc.docx"),
    "timebar_report": ("6.รายงานคดีขาดอายุความ ถึง ผอ.กบค^",
                       "memo-7x-timebar.docx"),
    "notify_discipline": ("4.ร่างหนังสือแจ้งให้พิจารณาโทษทางวินัย",
                          "memo-7x-notify-discipline.docx"),
    "submit_inquiry": ("1.แบบบันทึกเสนอรายงานไต่สวนฯ",
                       "memo-7x-submit-inquiry.docx"),
    "ruling_report": ("3.รายงานวินิจฉัยชี้มูลของคณะกรรมการ ปปท",
                      "memo-7x-ruling-report.docx"),
    "timebar_secgen": ("7.รายงานคดีขาดอายุความ ถึง เลขาฯ",
                       "memo-7x-timebar-secgen.docx"),
}
ORDER = ["notify_zone", "transmit_kbc", "timebar_report", "notify_discipline",
         "submit_inquiry", "ruling_report", "timebar_secgen"]

# schema field id -> key in order.html's prefill sources object. Hand-maintained.
PREFILL = {
    "notify_zone": {
        "case_no": "caseId", "recipient_region": "paccRegion",
        "meeting_no": "meetingNo", "meeting_date": "meetingDateISO",
        "agenda_item": "agendaNo", "case_owner_name": "ownerName",
    },
    "transmit_kbc": {
        "case_no": "caseId", "pacc_region": "paccRegion",
        "meeting_no": "meetingNo", "meeting_date": "meetingDateISO",
        "agenda_item": "agendaNo",
    },
    "timebar_report": {
        "case_no": "caseId", "pacc_region": "paccRegion",
        "meeting_no": "meetingNo", "meeting_date": "meetingDateISO",
        "agenda_item": "agendaNo",
    },
    "notify_discipline": {
        "case_no": "caseId", "pacc_region": "paccRegion",
        "meeting_no": "meetingNo", "meeting_date": "meetingDateISO",
        "agenda_item": "agendaNo", "case_officer": "ownerName",
    },
    "submit_inquiry": {
        "case_no": "caseId", "pacc_region": "paccRegion",
        "meeting_no": "meetingNo", "meeting_date": "meetingDateISO",
        "agenda_item": "agendaNo", "prepared_by_name": "ownerName",
    },
    "ruling_report": {
        "case_no": "caseId", "pacc_region": "paccRegion",
        "meeting_no": "meetingNo", "meeting_date": "meetingDateISO",
        "agenda_item": "agendaNo",
    },
    "timebar_secgen": {
        "case_no": "caseId", "pacc_region": "paccRegion",
        "meeting_no": "meetingNo", "meeting_date": "meetingDateISO",
        "agenda_item": "agendaNo", "case_officer_name": "ownerName",
    },
}


# bodyHtml literal -> placeholder fixups the line heuristics can't do
# (e.g. a long inline clause that should collapse to one textarea field).
BODY_SUBS = {
    "timebar_report": [
        ("ประมวลกฎหมายอาญา มาตรา 157 มาตรา 161 และพระราชบัญญัติประกอบรัฐธรรมนูญ "
         "ว่าด้วยการป้องกันและปราบปรามการทุจริต พ.ศ. ๒๕๔๒ และที่แก้ไขเพิ่มเติม "
         "มาตรา ๑๒๓/๑",
         "{lapsed_offences}"),
    ],
}


def _load_fragment(folder: str) -> dict:
    text = (OUT_TPL / folder / "order-fragment.js").read_text(encoding="utf-8")
    i = text.index("] = ") + 4
    return json.loads(text[i:].rstrip().rstrip(";"))


def main() -> int:
    docs = []
    for doc_id in ORDER:
        folder, docx_name = DOCS[doc_id]
        obj = _load_fragment(folder)
        obj["prefill"] = PREFILL.get(doc_id, {})
        for find, repl in BODY_SUBS.get(doc_id, []):
            if find not in obj["bodyHtml"]:
                print(f"[bundle] WARN: BODY_SUBS miss for {doc_id}: {find[:40]}...")
            obj["bodyHtml"] = obj["bodyHtml"].replace(find, repl)
        docs.append(obj)
        shutil.copyfile(OUT_TPL / folder / "template.docx",
                        REPO / "assets" / "templates" / docx_name)
        print(f"[bundle] {docx_name}")

    lines = [
        "/* AUTO-GENERATED bundle — pipeline.build emits per-doc fragments",
        "   (output-template/<doc>/order-fragment.js); pipeline.bundle combines",
        "   the 3 here for order.html + res/order.html. Re-run build then bundle",
        "   to regenerate. `prefill` maps a schema field id -> a key in the",
        "   order.html prefill sources object (see pipeline/bundle.py PREFILL). */",
        "window.ECMIS = window.ECMIS || {};",
        "window.ECMIS.OrderMemoDocs = window.ECMIS.OrderMemoDocs || {};",
        f"window.ECMIS.OrderMemoDocOrder = {json.dumps(ORDER)};",
        "",
    ]
    for d in docs:
        lines.append(
            f"window.ECMIS.OrderMemoDocs[{json.dumps(d['id'])}] = "
            + json.dumps(d, ensure_ascii=False, indent=2) + ";")
        lines.append("")

    dest = REPO / "assets" / "order-memo-docs.js"
    dest.write_text("\n".join(lines), encoding="utf-8")
    print(f"[bundle] {dest}  ({dest.stat().st_size} bytes, {len(docs)} docs)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
