import xml.etree.ElementTree as ET
import re

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

target_tabs = ["TOBE_14.2", "TOBE_14.3", "TOBE_14.4.1", "TOBE_14.4.2", "TOBE_14.4.3", "TOBE_14.4.4", "TOBE_14.4.5", "TOBE_14.4.6", "TOBE_14.5", "TOBE_14.6"]

with open("lanes_dump.txt", "w", encoding="utf-8") as out:
    for d in root.findall('.//diagram'):
        name = d.get('name')
        if name not in target_tabs:
            continue
        out.write(f"\n==================== TAB: {name} ====================\n")
        mx_model = d.find('.//mxGraphModel')
        if mx_model is None:
            continue
        root_node = mx_model.find('root')
        if root_node is None:
            continue
            
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
            
            # Detect swimlane or big parent container lane
            is_swimlane = 'swimlane' in style
            is_large_container = w > 240 and h > 400
            
            if is_swimlane or is_large_container:
                x = float(geom.get('x', '0'))
                y = float(geom.get('y', '0'))
                out.write(f"  ID: {cell.get('id'):<30} | Val: {val:<50} | X: {x:<6.1f} Y: {y:<6.1f} W: {w:<5.1f} H: {h:<5.1f}\n")
print("Done dumping lanes.")
