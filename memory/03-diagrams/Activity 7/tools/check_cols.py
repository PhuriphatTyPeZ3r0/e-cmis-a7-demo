import requests

SUPABASE_URL = 'https://ljhabbwjxnoucrcrsoii.supabase.co'
SUPABASE_KEY = 'sb_publishable_2Bps-dWMZHz_7cs3BppF6A_ul1_A_xd'

headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}'
}

r = requests.get(f'{SUPABASE_URL}/rest/v1/tbl_res_offense_basis?limit=1', headers=headers)
if r.status_code == 200:
    print("Columns in tbl_res_offense_basis:", list(r.json()[0].keys()))