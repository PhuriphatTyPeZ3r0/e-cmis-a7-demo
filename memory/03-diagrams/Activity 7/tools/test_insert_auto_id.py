import requests

SUPABASE_URL = 'https://ljhabbwjxnoucrcrsoii.supabase.co'
SUPABASE_KEY = 'sb_publishable_2Bps-dWMZHz_7cs3BppF6A_ul1_A_xd'

headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

test_row = {
    'trob_group': 'ทดสอบ',
    'trob_law_name': 'ทดสอบ',
    'trob_article_no': 'มาตรา 999',
    'trob_article_label': 'ทดสอบ',
    'trob_sort_order': 999
}

r = requests.post(f'{SUPABASE_URL}/rest/v1/tbl_res_offense_basis', headers=headers, json=test_row)
print("Insert status:", r.status_code)
print("Response:", r.text)

if r.status_code in [200, 201]:
    new_id = r.json()[0]['trob_id']
    print(f"Created with id: {new_id}")
    r_del = requests.delete(f'{SUPABASE_URL}/rest/v1/tbl_res_offense_basis?trob_id=eq.{new_id}', headers=headers)
    print("Delete status:", r_del.status_code)