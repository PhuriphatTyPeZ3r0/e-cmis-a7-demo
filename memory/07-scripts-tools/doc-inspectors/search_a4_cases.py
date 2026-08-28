import re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('activity4-workspace.js', encoding='utf-8') as f:
    text = f.read()

# Look for object keys with case IDs like 0001/2569 or 2569- or similar
cases = re.findall(r'"([0-9]{4}/256[0-9])"\s*:\s*\{', text)
print('Cases found in activity4-workspace.js:', cases)

# If none, look for any sample data in activity4-workspace.js
for line in text.splitlines():
    if any(k in line for k in ['mockCases', 'SAMPLE_CASES', 'DEFAULT_CASES', 'DEMO_CASES', 'seed', 'SEED']):
        print('  ', line[:100])
