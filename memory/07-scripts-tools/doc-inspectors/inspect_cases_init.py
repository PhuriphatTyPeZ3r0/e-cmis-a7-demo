import re, sys
sys.stdout.reconfigure(encoding='utf-8')

for fname in ['activity5-workspace.js', 'activity5-workflow.js', 'activity4-workspace.js', 'ecmis.js']:
    with open(fname, encoding='utf-8') as f:
        content = f.read()
    print(f'=== {fname} ===')
    # Search for initial cases, seed data, mock data
    for line in content.splitlines():
        if any(k in line for k in ['INITIAL_CASES', 'SEED_CASES', 'mockCases', 'initCases', 'sampleCases', 'STORAGE_KEY', 'CASE_KEY', 'defaultCases', 'SEED_DATA']):
            print(' ', line[:120])
