import json
import urllib.request
import urllib.error
import subprocess

SPREADSHEET_ID = "1YHcP3a1b9Y7EWwJTf-ih6AJsnOV0jcOGydEzaGAdVfQ"
SHEET_TITLE = "แก้ไขmock"

UPDATES = [
    (5, "ทำแล้ว", "2026-08-24"),   # Item 4
    (13, "ทำแล้ว", "2026-08-24"),  # Item 12
    (22, "ทำแล้ว", "2026-08-24"),  # Item 21
    (23, "ทำแล้ว", "2026-08-24"),  # Item 22
    (24, "ทำแล้ว", "2026-08-24"),  # Item 23
    (25, "ทำแล้ว", "2026-08-24"),  # Item 24
    (26, "ทำแล้ว", "2026-08-24"),  # Item 25
    (27, "ทำแล้ว", "2026-08-24")   # Item 26
]

def get_token():
    out = subprocess.check_output(["powershell", "-NoProfile", "-Command", "gcloud auth print-access-token"], text=True).strip()
    return out

token = get_token()
url = f"https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}/values:batchUpdate"

data_payload = []
for row, st, dt in UPDATES:
    data_payload.append({
        "range": f"'{SHEET_TITLE}'!E{row}:F{row}",
        "values": [[st, dt]]
    })

body = {
    "valueInputOption": "USER_ENTERED",
    "data": data_payload
}

req = urllib.request.Request(
    url,
    data=json.dumps(body, ensure_ascii=False).encode("utf-8"),
    headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json; charset=utf-8"
    },
    method="POST"
)

try:
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        print(f"SUCCESS: Updated {res.get('totalUpdatedCells')} cells across {res.get('totalUpdatedRows')} rows in sheet '{SHEET_TITLE}'!")
except urllib.error.HTTPError as e:
    print(f"HTTP Error {e.code}: {e.read().decode('utf-8')}")
except Exception as e:
    print("Error:", e)