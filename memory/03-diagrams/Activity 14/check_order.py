import xml.etree.ElementTree as ET
import re

file_path = r'C:\Users\iznamu\OneDrive - Panyapiwat Institute of Management\CAI 2nd Year 2025\CAI 2.2 2026\PMO1-03-08-2026\E-CMIS\diagram\Activity 14\ASIS_Activity_14_v1_2_1_1.drawio'
tree = ET.parse(file_path)
root = tree.getroot()
res = []

for i, diag in enumerate(root.findall('.//diagram')):
    for cell in diag.findall('.//mxCell'):
        v = cell.get('value', '')
        if 'SYS' in v:
            geo = cell.find('mxGeometry')
            y = float(geo.get('y', '0')) if geo is not None else 0
            x = float(geo.get('x', '0')) if geo is not None else 0
            m = re.search(r'SYS\d+', v)
            sys_str = m.group(0) if m else 'SYS???'
            res.append((i, round(y, 1), round(x, 1), sys_str, v[:30].replace('\n', ' ')))

# We'll print the first 30 elements to inspect their ordering
for r in res[:30]:
    print(r)
