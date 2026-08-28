import requests

SUPABASE_URL = 'https://ljhabbwjxnoucrcrsoii.supabase.co'
SUPABASE_KEY = 'sb_publishable_2Bps-dWMZHz_7cs3BppF6A_ul1_A_xd'

headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}'
}

# 1. Check if tbl_res_offense_basis exists and fetch rows
try:
    r = requests.get(f'{SUPABASE_URL}/rest/v1/tbl_res_offense_basis?select=*', headers=headers)
    print(f'Status: {r.status_code}')
    if r.status_code == 200:
        data = r.json()
        print(f'Found {len(data)} rows in tbl_res_offense_basis:')
        for row in data:
            print(row)
    else:
        print(f'Error response: {r.text}')
except Exception as e:
    print(f'Exception: {e}')