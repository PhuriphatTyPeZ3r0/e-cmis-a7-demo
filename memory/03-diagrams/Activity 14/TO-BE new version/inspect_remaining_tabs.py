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

target_tabs = ["TOBE_14.2", "TOBE_14.3", "TOBE_14.4", "TOBE_14.4.1", "TOBE_14.4.2", "TOBE_14.4.3", "TOBE_14.4.4", "TOBE_14.4.5", "TOBE_14.4.6", "TOBE_14.5", "TOBE_14.6"]

diagrams = root.findall('.//diagram')
print(f"Total diagrams: {len(diagrams)}")

for d in diagrams:
    name = d.get('name')
    if name not in target_tabs:
        continue
    
    print(f"\n==================== TAB: {name} ====================")
    mx_model = d.find('.//mxGraphModel')
    if mx_model is None:
        print("No mxGraphModel found")
        continue
    root_node = mx_model.find('root')
    if root_node is None:
        print("No root found")
        continue
    
    vertices = []
    edges = []
    
    for cell in root_node.findall('mxCell'):
        cid = cell.get('id')
        val = cell.get('value', '').strip()
        style = cell.get('style', '')
        parent = cell.get('parent')
        vertex = cell.get('vertex')
        edge = cell.get('edge')
        
        geom = cell.find('mxGeometry')
        x = y = w = h = 0.0
        if geom is not None:
            x = float(geom.get('x', '0'))
            y = float(geom.get('y', '0'))
            w = float(geom.get('width', '0'))
            h = float(geom.get('height', '0'))
            
        if vertex == '1':
            # Skip big container lanes
            if (w > 250 and h > 1000) or (w > 200 and h == 90 and 'rounded=1' not in style and 'rhombus' not in style):
                continue
            if 'shape=note' in style or w > 800:
                continue
            
            clean_val = clean_html(val)
            vertices.append((cid, clean_val, x, y, w, h, style))
        elif edge == '1':
            src = cell.get('source')
            tgt = cell.get('target')
            edges.append((cid, val, src, tgt))
            
    # Sort vertices by Y then X
    vertices.sort(key=lambda item: (item[3], item[2]))
    
    print(f"Vertices ({len(vertices)}):")
    for v in vertices:
        print(f"  ID: {v[0]:<30} | Val: {v[1]:<50} | X: {v[2]:<6} Y: {v[3]:<6} W: {v[4]:<5} H: {v[5]:<5}")
        
    print(f"Edges ({len(edges)}):")
    for e in edges[:20]: # show first 20 edges
        src_str = str(e[2]) if e[2] is not None else "None"
        tgt_str = str(e[3]) if e[3] is not None else "None"
        print(f"  ID: {e[0]:<30} | Val: {e[1]:<10} | Src: {src_str:<30} -> Tgt: {tgt_str}")
    if len(edges) > 20:
        print(f"  ... and {len(edges) - 20} more edges")
