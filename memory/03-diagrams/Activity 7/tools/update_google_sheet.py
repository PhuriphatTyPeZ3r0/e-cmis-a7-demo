import json
import urllib.request
import urllib.error
import subprocess

SPREADSHEET_ID = "1YHcP3a1b9Y7EWwJTf-ih6AJsnOV0jcOGydEzaGAdVfQ"
SHEET_TITLE = " 213 / อนุมัติ"

# List of row updates (1-indexed row number, status_E, date_F)
UPDATES = [
    (10, "ทำแล้ว", "2026-08-07"),
    (11, "ทำแล้ว", "2026-08-12"),
    (12, "ทำแล้ว", "2026-08-12"),
    (13, "ทำแล้ว", "2026-08-24"),
    (14, "ทำแล้ว", "2026-08-12"),
    (15, "ทำแล้ว", "2026-08-12"),
    (16, "ทำแล้ว", "2026-08-10"),
    (17, "ทำแล้ว", "2026-08-12"),
    (18, "ทำแล้ว", "2026-08-14"),
    (19, "ทำแล้ว", "2026-08-14"),
    (21, "ทำแล้ว", "2026-08-14"),
    (22, "ทำแล้ว", "2026-08-24"),
    (24, "ทำแล้ว", "2026-08-14"),
    (25, "ทำแล้ว", "2026-08-14"),
    (26, "ทำแล้ว", "2026-08-14"),
    (27, "ทำแล้ว", "2026-08-14"),
    (28, "ทำแล้ว", "2026-08-14"),
    (29, "ทำแล้ว", "2026-08-14"),
    (30, "ทำแล้ว", "2026-08-14"),
    (31, "ทำแล้ว", "2026-08-14"),
    (32, "ทำแล้ว", "2026-08-24"),
    (33, "ทำแล้ว", "2026-08-24"),
    (34, "ทำแล้ว", "2026-08-24"),
    (35, "ทำแล้ว", "2026-08-24"),
    (36, "ทำแล้ว", "2026-08-24"),
    (39, "ทำแล้ว", "2026-08-24")
]

def get_access_token():
    try:
        out = subprocess.check_output(["gcloud", "auth", "print-access-token"], text=True).strip()
        return out
    except Exception as e:
        print("Error getting token:", e)
        return None

def update_sheet():
    token = get_access_token()
    if not token:
        print("No access token available.")
        return False

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
        data=json.dumps(body).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req) as resp:
            res_data = json.loads(resp.read().decode("utf-8"))
            print("Successfully updated Google Sheet!")
            print(f"Total updated cells: {res_data.get('totalUpdatedCells')}")
            return True
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        print(f"HTTP Error {e.code}: {err_msg}")
        return False
    except Exception as e:
        print("Error:", e)
        return False

if __name__ == "__main__":
    update_sheet()