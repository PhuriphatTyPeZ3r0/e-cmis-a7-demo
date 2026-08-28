import xml.etree.ElementTree as ET
import re

import sys

out = open(r"C:\Users\iznamu\OneDrive - Panyapiwat Institute of Management\CAI 2nd Year 2025\CAI 2.2 2026\PMO1-03-08-2026\E-CMIS\diagram\Activity 14\TO-BE new version\flows_summary.txt", "w", encoding="utf-8")
def print(*args, **kwargs):
    kwargs['file'] = out
    __builtins__.print(*args, **kwargs)

file_path = r"C:\Users\iznamu\OneDrive - Panyapiwat Institute of Management\CAI 2nd Year 2025\CAI 2.2 2026\PMO1-03-08-2026\E-CMIS\diagram\Activity 14\TO-BE new version\TOBE_Activity_14_v1_9.drawio.bak_refactor_tobe"
tree = ET.parse(file_path)
root = tree.getroot()

def clean_html(text):
    if not text:
        return ""
    clean = re.compile('<.*?>')
    text = re.sub(clean, ' ', text)
    text = text.replace('&nbsp;', ' ').replace('\n', ' ')
    return re.sub(r'\s+', ' ', text).strip()

target_tabs = ["TOBE_14.2", "TOBE_14.3", "TOBE_14.4", "TOBE_14.4.1", "TOBE_14.4.2", "TOBE_14.4.3", "TOBE_14.4.4", "TOBE_14.4.5", "TOBE_14.4.6", "TOBE_14.5", "TOBE_14.6"]

for d in root.findall('.//diagram'):
    name = d.get('name')
    if name not in target_tabs:
        continue
    
    print(f"\n==================== TAB: {name} ====================")
    mx_model = d.find('.//mxGraphModel')
    if mx_model is None:
        continue
    root_node = mx_model.find('root')
    if root_node is None:
        continue
    
    processes = []
    starts = []
    ends = []
    decisions = []
    
    for cell in root_node.findall('mxCell'):
        if cell.get('vertex') != '1':
            continue
        geom = cell.find('mxGeometry')
        if geom is None:
            continue
        w = float(geom.get('width', '0'))
        h = float(geom.get('height', '0'))
        style = cell.get('style', '')
        val = clean_html(cell.get('value', ''))
        
        # Skip lanes and headers
        if (w > 250 and h > 1000) or (w > 200 and h == 90 and 'rounded=1' not in style and 'rhombus' not in style) or w > 800:
            continue
            
        x = float(geom.get('x', '0'))
        y = float(geom.get('y', '0'))
        
        cid = cell.get('id')
        if val in ['เริ่มต้น', 'เริ่ม']:
            starts.append((cid, val, x, y))
        elif val in ['จบ', 'จบการทำงาน']:
            ends.append((cid, val, x, y))
        elif 'rhombus' in style:
            decisions.append((cid, val, x, y))
        elif 'rounded=1' in style:
            processes.append((cid, val, x, y, w, h))
            
    processes.sort(key=lambda item: (item[3], item[2]))
    print(f"Starts: {starts}")
    print(f"Ends: {ends}")
    print(f"Decisions: {decisions}")
    print(f"Processes ({len(processes)}):")
    for p in processes:
        print(f"  ID: {p[0]:<30} | Y: {p[3]:<6.1f} | X: {p[2]:<6.1f} | {p[1]}")

out.close()
