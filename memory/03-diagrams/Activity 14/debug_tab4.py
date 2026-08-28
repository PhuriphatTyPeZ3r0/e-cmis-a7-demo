import xml.etree.ElementTree as ET
import re

file_path = r'C:\Users\iznamu\OneDrive - Panyapiwat Institute of Management\CAI 2nd Year 2025\CAI 2.2 2026\PMO1-03-08-2026\E-CMIS\diagram\Activity 14\ASIS_Activity_14_v1_2_1_1.drawio'
tree = ET.parse(file_path)
root = tree.getroot()

for i, diag in enumerate(root.findall('.//diagram')):
    if i == 3:
        for cell in diag.findall('.//mxCell'):
            v = cell.get('value', '')
            if 'SYS' in v:
                geo = cell.find('mxGeometry')
                if geo is not None:
                    y = float(geo.get('y', '0'))
                    x = float(geo.get('x', '0'))
                    m = re.search(r'SYS\d+', v)
                    print(f"Y:{y} X:{x} ID:{cell.get('id')} Val:{v[:20]}")
