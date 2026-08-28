import xml.etree.ElementTree as ET
import re
import os
import shutil
import copy

def clean_html(text):
    if not text:
        return ""
    clean = re.compile('<.*?>')
    text = re.sub(clean, ' ', text)
    text = text.replace('&nbsp;', ' ').replace('\n', ' ')
    return re.sub(r'\s+', ' ', text).strip()

def get_root_layers(root_node):
    cells = root_node.findall('mxCell')
    cell0 = [c for c in cells if c.get('parent') is None][0]
    cell0_id = cell0.get('id')
    cell1 = [c for c in cells if c.get('parent') == cell0_id][0]
    cell1_id = cell1.get('id')
    return cell0_id, cell1_id

def create_mxcell(id_val, parent_val, value="", style="", vertex=None, edge=None, source=None, target=None, x=None, y=None, w=None, h=None):
    cell = ET.Element("mxCell")
    cell.set("id", str(id_val))
    if parent_val is not None:
        cell.set("parent", str(parent_val))
    
    if value:
        cell.set("value", str(value))
    if style:
        cell.set("style", str(style))
        
    if vertex is not None:
        cell.set("vertex", str(vertex))
    if edge is not None:
        cell.set("edge", str(edge))
        
    if source is not None:
        cell.set("source", str(source))
    if target is not None:
        cell.set("target", str(target))
        
    if x is not None or y is not None or w is not None or h is not None:
        geo = ET.SubElement(cell, "mxGeometry")
        geo.set("relative", "1" if edge else "0")
        if x is not None: geo.set("x", str(x))
        if y is not None: geo.set("y", str(y))
        if w is not None: geo.set("width", str(w))
        if h is not None: geo.set("height", str(h))
        geo.set("as", "geometry")
    elif edge:
        geo = ET.SubElement(cell, "mxGeometry")
        geo.set("relative", "1")
        geo.set("as", "geometry")
        
    return cell

def extract_tab_elements(diag_node):
    mx_model = diag_node.find('.//mxGraphModel')
    root_node = mx_model.find('root')
    cell0_id, cell1_id = get_root_layers(root_node)
    
    cells = list(root_node.findall('mxCell'))
    edge_ids = {cell.get('id') for cell in cells if cell.get('edge') == '1'}
    
    vertices = {}
    edges = []
    edge_labels = []
    tor_notes = []
    
    for cell in cells:
        cid = cell.get('id')
        if cid in [cell0_id, cell1_id]:
            continue
            
        vertex = cell.get('vertex')
        edge = cell.get('edge')
        val = cell.get('value', '').strip()
        style = cell.get('style', '')
        parent = cell.get('parent')
        
        geom = cell.find('mxGeometry')
        x = y = w = h = 0.0
        if geom is not None:
            x = float(geom.get('x', '0'))
            y = float(geom.get('y', '0'))
            w = float(geom.get('width', '0'))
            h = float(geom.get('height', '0'))
            
        if vertex == '1':
            # Skip background lanes and headers
            if (w > 250 and h > 1000) or (w > 200 and h == 90 and 'rounded=1' not in style and 'rhombus' not in style):
                continue
            if 'shape=note' in style or w > 800:
                tor_notes.append(cell)
                continue
            if parent in edge_ids or 'edgeLabel' in style:
                edge_labels.append(cell)
                continue
            vertices[cid] = {
                'cell': cell, 'id': cid, 'value': val, 'clean_val': clean_html(val),
                'style': style, 'x': x, 'y': y, 'w': w, 'h': h
            }
        elif edge == '1':
            edges.append(cell)
            
    return vertices, edges, edge_labels, tor_notes

def find_closest_vertex(pt, vertices_info):
    if pt is None:
        return None
    px = float(pt.get('x', '0'))
    py = float(pt.get('y', '0'))
    
    best_vid = None
    best_dist = float('inf')
    
    for vid, v in vertices_info.items():
        vx, vy, vw, vh = v['x'], v['y'], v['w'], v['h']
        dx = max(0.0, vx - px, px - (vx + vw))
        dy = max(0.0, vy - py, py - (vy + vh))
        dist = dx*dx + dy*dy
        if dist < best_dist:
            best_dist = dist
            best_vid = vid
            
    if best_dist < 4000:  # Proximity threshold
        return best_vid
    return None

def reconstruct_single_session_tab(diag_node, tab_name, tab_id, session, vertices, edges, edge_labels, tor_notes, sys_start_num, lane_config, role_mapping_func, session_idx):
    new_diag = copy.deepcopy(diag_node)
    new_diag.set('name', tab_name)
    new_diag.set('id', tab_id)
    
    mx_model = new_diag.find('.//mxGraphModel')
    mx_model.set('pageWidth', '827')
    mx_model.set('pageHeight', '1169')
    
    root_node = mx_model.find('root')
    
    # Clear root layer
    root_node.clear()
    
    # Create tab-unique root layers
    new_cell0_id = f"{tab_id}_0"
    new_cell1_id = f"{tab_id}_1"
    
    # Append cell 0 and 1
    c0 = ET.Element("mxCell")
    c0.set("id", new_cell0_id)
    root_node.append(c0)
    
    c1 = ET.Element("mxCell")
    c1.set("id", new_cell1_id)
    c1.set("parent", new_cell0_id)
    root_node.append(c1)
    
    current_y_offset = 50.0
    lane_height = 220.0
    current_sys_num = sys_start_num
    
    # Determine unique roles (lanes) inside this session
    sess_nodes_set = set(session['node_ids'])
    
    sess_roles = []
    role_priority = ['user', 'admin_origin', 'admin_dest', 'admin', 'center']
    
    if 'roles' in session and session['roles']:
        sess_roles = [r for r in role_priority if r in session['roles']]
    else:
        detected_roles = set()
        for nid in session['node_ids']:
            node = vertices[nid]
            role = role_mapping_func(node['x'], node['y'], nid)
            detected_roles.add(role)
        sess_roles = [r for r in role_priority if r in detected_roles]
        
    if not sess_roles:
        sess_roles = ['user']
        
    # Draw header separator for the session
    session_header_val = f"<b>{session['name']}</b>"
    session_header_style = "text;html=1;align=left;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontStyle=1;fontSize=15;fontColor=#1976d2;"
    header_cell = create_mxcell(
        id_val=f"{tab_id}_header", parent_val=new_cell1_id, value=session_header_val, style=session_header_style,
        vertex=1, x=50, y=current_y_offset, w=600, h=30
    )
    root_node.append(header_cell)
    current_y_offset += 35.0
    
    # Create swimlanes for this session
    lane_cells = {}
    for r_idx, role in enumerate(sess_roles):
        cfg = lane_config[role]
        lane_id = f"{tab_id}_lane_{role}"
        lane_val = cfg['name']
        lane_style = f"swimlane;horizontal=0;startSize=45;fillColor={cfg['color']};swimlaneFillColor=#ffffff;strokeColor={cfg['border']};html=1;fontStyle=1;fontSize=15;fontColor={cfg['font']};"
        
        lane_cell = create_mxcell(
            id_val=lane_id, parent_val=new_cell1_id, value=lane_val, style=lane_style,
            vertex=1, x=50, y=current_y_offset + r_idx * lane_height, w=2200, h=lane_height
        )
        root_node.append(lane_cell)
        lane_cells[role] = lane_id
        
    # Sort session nodes chronologically by original coordinates (Y first, then X)
    sorted_sess_nodes = sorted([vertices[nid] for nid in session['node_ids']], key=lambda n: (n['y'], n['x']))
    
    new_nodes_info = {}
    
    # Place session nodes inside the lanes
    for col_idx, node in enumerate(sorted_sess_nodes):
        role = role_mapping_func(node['x'], node['y'], node['id'])
        if role not in lane_cells:
            role = sess_roles[0]
            
        lane_id = lane_cells[role]
        cval = node['clean_val']
        is_process = 'rounded=1' in node['style'] and cval not in ['เริ่มต้น', 'เริ่ม', 'จบ', 'จบการทำงาน']
        is_start = cval in ['เริ่มต้น', 'เริ่ม']
        is_end = cval in ['จบ', 'จบการทำงาน']
        
        if is_process:
            sys_str = f"SYS{current_sys_num:03d}"
            cval_clean = re.sub(r'^SYS\d+[:\s]*', '', cval)
            new_val = f"<b>{sys_str}</b><br>{cval_clean}"
            current_sys_num += 1
            
            cfg = lane_config[role]
            new_style = f"rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor={cfg['border']};strokeWidth=1.5;fontSize=13;fontFamily=Arial;align=center;verticalAlign=middle;"
        elif is_start:
            new_val = "เริ่ม"
            new_style = "ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=#d5e8d4;strokeColor=#82b366;strokeWidth=2;fontColor=#000000;fontStyle=1;fontSize=13;align=center;verticalAlign=middle;"
        elif is_end:
            new_val = "จบ"
            new_style = "ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=#f8cecc;strokeColor=#b85450;strokeWidth=2;fontColor=#000000;fontStyle=1;fontSize=13;align=center;verticalAlign=middle;"
        elif 'rhombus' in node['style']:
            new_val = cval
            new_style = "rhombus;whiteSpace=wrap;html=1;fillColor=#ff8000;strokeColor=#ff8000;fontColor=#ffffff;fontStyle=1;fontSize=12;fontFamily=Arial;align=center;verticalAlign=middle;"
        elif node['w'] == 40 and node['h'] == 40: # Fork/Join circle
            new_val = ""
            new_style = "ellipse;whiteSpace=wrap;html=1;strokeColor=#000000;fillColor=#000000;"
        else:
            new_val = cval
            new_style = node['style']
            
        new_x = col_idx * 190 + 100
        new_y = (lane_height - node['h']) / 2
        
        new_node_id = f"{tab_id}_{node['id']}"
        cell_element = create_mxcell(
            id_val=new_node_id, parent_val=lane_id, value=new_val, style=new_style,
            vertex=1, x=new_x, y=new_y, w=node['w'], h=node['h']
        )
        root_node.append(cell_element)
        
        new_nodes_info[node['id']] = {
            'new_id': new_node_id,
            'x': new_x, 'y': new_y, 'w': node['w'], 'h': node['h'],
            'role': role, 'lane_id': lane_id
        }
        
    # Place session extra nodes (Off-page connectors, End ovals at boundaries)
    for ex_id, ex_val, ex_type, ex_role, ex_col in session['extra_nodes']:
        lane_id = lane_cells.get(ex_role, sess_roles[0])
        w, h = 60.0, 60.0
        if ex_type == 'offpage':
            new_style = "shape=offPageConnector;whiteSpace=wrap;html=1;fillColor=#e1d5e7;strokeColor=#9673a6;strokeWidth=2;fontColor=#000000;fontStyle=1;fontSize=12;align=center;verticalAlign=middle;"
            w, h = 65.0, 65.0
        else: # reject end oval
            new_style = "ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=#f8cecc;strokeColor=#b85450;strokeWidth=2;fontColor=#000000;fontStyle=1;fontSize=13;align=center;verticalAlign=middle;"
            
        new_x = ex_col * 190 + 100
        new_y = (lane_height - h) / 2
        
        new_ex_id = f"{tab_id}_{ex_id}"
        cell_element = create_mxcell(
            id_val=new_ex_id, parent_val=lane_id, value=ex_val, style=new_style,
            vertex=1, x=new_x, y=new_y, w=w, h=h
        )
        root_node.append(cell_element)
        
        new_nodes_info[ex_id] = {
            'new_id': new_ex_id,
            'x': new_x, 'y': new_y, 'w': w, 'h': h,
            'role': ex_role, 'lane_id': lane_id
        }
        
    # Draw edges for this session
    sess_edges = []
    added_cell_ids = set()
    for edge in edges:
        src = edge.get('source')
        tgt = edge.get('target')
        eid = edge.get('id')
        if src in sess_nodes_set and tgt in sess_nodes_set:
            if eid not in added_cell_ids:
                sess_edges.append(edge)
                added_cell_ids.add(eid)
                
    # Resolve unanchored edges using proximity
    for cell in edges:
        eid = cell.get('id')
        if eid in added_cell_ids:
            continue
            
        src = cell.get('source')
        tgt = cell.get('target')
        geo = cell.find('mxGeometry')
        
        if geo is not None:
            mx_pts = geo.findall('mxPoint')
            src_pt = [p for p in mx_pts if p.get('as') == 'sourcePoint']
            tgt_pt = [p for p in mx_pts if p.get('as') == 'targetPoint']
            
            belongs_to_sess = False
            matched_src = None
            matched_tgt = None
            
            if src and src in sess_nodes_set:
                belongs_to_sess = True
                matched_src = src
            elif src_pt:
                matched_src = find_closest_vertex(src_pt[0], {nid: vertices[nid] for nid in session['node_ids']})
                if matched_src:
                    belongs_to_sess = True
                    
            if tgt and tgt in sess_nodes_set:
                belongs_to_sess = True
                matched_tgt = tgt
            elif tgt_pt:
                matched_tgt = find_closest_vertex(tgt_pt[0], {nid: vertices[nid] for nid in session['node_ids']})
                if matched_tgt:
                    belongs_to_sess = True
                    
            if belongs_to_sess:
                new_edge_cell = copy.deepcopy(cell)
                if matched_src: new_edge_cell.set('source', matched_src)
                if matched_tgt: new_edge_cell.set('target', matched_tgt)
                sess_edges.append(new_edge_cell)
                added_cell_ids.add(eid)
                
    # Filter: only keep edges where BOTH endpoints exist in this tab
    all_tab_vertex_ids = set(new_nodes_info.keys())
    sess_edges = [e for e in sess_edges if e.get('source') in all_tab_vertex_ids and e.get('target') in all_tab_vertex_ids]
    
    # Append session edges
    for edge in sess_edges:
        eid = edge.get('id')
        new_eid = f"{tab_id}_{eid}"
        src = edge.get('source')
        tgt = edge.get('target')
        val = edge.get('value', '')
        
        new_src = new_nodes_info[src]['new_id']
        new_tgt = new_nodes_info[tgt]['new_id']
        
        edge_has_negative_label = False
        for lbl in edge_labels:
            if lbl.get('parent') == eid:
                lbl_val = clean_html(lbl.get('value', ''))
                if lbl_val in ['ไม่', 'ไม่อนุมัติ', 'ไม่ผ่าน', 'ผลไม่ผ่าน', 'ไม่ใช่']:
                    edge_has_negative_label = True
                    break
        
        if edge_has_negative_label or clean_html(val) in ['ไม่', 'ไม่อนุมัติ', 'ไม่ผ่าน', 'ผลไม่ผ่าน', 'ไม่ใช่']:
            new_style = "edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;strokeColor=#ff8000;strokeWidth=2;dashed=1;fontColor=#ff8000;fontSize=13;"
        else:
            new_style = "edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;strokeColor=#1976d2;strokeWidth=2;fontSize=13;"
            
        new_edge = create_mxcell(
            id_val=new_eid, parent_val=new_cell1_id, value=val, style=new_style,
            edge=1, source=new_src, target=new_tgt
        )
        root_node.append(new_edge)
        
    # Append session extra edges
    for ex_eid, ex_eval, ex_esrc, ex_etgt, is_neg in session['extra_edges']:
        new_ex_eid = f"{tab_id}_{ex_eid}"
        new_esrc = new_nodes_info[ex_esrc]['new_id']
        new_etgt = new_nodes_info[ex_etgt]['new_id']
        if is_neg or ex_eval in ['ไม่', 'ไม่อนุมัติ', 'ไม่ผ่าน', 'ผลไม่ผ่าน', 'ไม่ใช่']:
            new_style = "edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;strokeColor=#ff8000;strokeWidth=2;dashed=1;fontColor=#ff8000;fontSize=13;"
        else:
            new_style = "edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;strokeColor=#1976d2;strokeWidth=2;fontSize=13;"
            
        new_edge = create_mxcell(
            id_val=new_ex_eid, parent_val=new_cell1_id, value=ex_eval, style=new_style,
            edge=1, source=new_esrc, target=new_etgt
        )
        root_node.append(new_edge)
        
    # Append edge labels for session
    sess_edge_ids = {e.get('id') for e in sess_edges}
    for cell in edge_labels:
        parent_id = cell.get('parent')
        if parent_id in sess_edge_ids:
            new_label_id = f"{tab_id}_{cell.get('id')}"
            new_parent_id = f"{tab_id}_{parent_id}"
            
            label_cell = ET.Element("mxCell")
            label_cell.set("id", new_label_id)
            label_cell.set("parent", new_parent_id)
            label_cell.set("value", cell.get('value', ''))
            label_cell.set("style", cell.get('style', ''))
            label_cell.set("vertex", "1")
            
            orig_geo = cell.find('mxGeometry')
            if orig_geo is not None:
                geo = ET.SubElement(label_cell, "mxGeometry")
                geo.set("relative", "1")
                geo.set("as", "geometry")
                if orig_geo.get('x') is not None: geo.set("x", orig_geo.get('x'))
                if orig_geo.get('y') is not None: geo.set("y", orig_geo.get('y'))
                if orig_geo.get('width') is not None: geo.set("width", orig_geo.get('width'))
                if orig_geo.get('height') is not None: geo.set("height", orig_geo.get('height'))
                for pt in orig_geo.findall('mxPoint'):
                    new_pt = ET.SubElement(geo, "mxPoint")
                    for k, v in pt.items():
                        new_pt.set(k, v)
            root_node.append(label_cell)
            
    # Update current Y offset for notes
    current_y_offset += len(sess_roles) * lane_height + 40.0
    
    # Append TOR notes at the bottom
    for note in tor_notes:
        note_id = note.get('id')
        new_note_id = f"{tab_id}_{note_id}"
        note_val = note.get('value', '')
        note_style = note.get('style', '')
        geom = note.find('mxGeometry')
        nw, nh = float(geom.get('width')), float(geom.get('height'))
        
        new_note = create_mxcell(
            id_val=new_note_id, parent_val=new_cell1_id, value=note_val, style=note_style,
            vertex=1, x=50, y=current_y_offset, w=nw, h=nh
        )
        root_node.append(new_note)
        current_y_offset += nh + 40.0
        
    return new_diag, current_sys_num

def main():
    file_path = r"C:\Users\iznamu\OneDrive - Panyapiwat Institute of Management\CAI 2nd Year 2025\CAI 2.2 2026\PMO1-03-08-2026\E-CMIS\diagram\Activity 14\TO-BE new version\TOBE_Activity_14_v1_9.drawio"
    backup_path = file_path + ".bak_refactor_tobe"
    
    orig_ref_path = r"C:\Users\iznamu\OneDrive\Documents\TOBE_Activity_14_v1_9.drawio"
    print(f"Updating backup from original source: {orig_ref_path}")
    shutil.copy2(orig_ref_path, backup_path)
    
    print(f"Reading template from backup: {backup_path}")
    tree = ET.parse(backup_path)
    root = tree.getroot()
    
    lane_config = {
        'user': {
            'name': 'บุคลากรสำนักงาน ป.ป.ท.',
            'color': '#f5eedb', 'border': '#b8a571', 'font': '#6d5a3f'
        },
        'admin': {
            'name': 'เจ้าหน้าที่ธุรการกองหน่วยงาน',
            'color': '#efe6f7', 'border': '#6d5a95', 'font': '#4a3b68'
        },
        'admin_origin': {
            'name': 'เจ้าหน้าที่ธุรการกองหน่วยงาน (ต้นทาง)',
            'color': '#efe6f7', 'border': '#6d5a95', 'font': '#4a3b68'
        },
        'admin_dest': {
            'name': 'เจ้าหน้าที่ธุรการกองหน่วยงาน (ปลายทาง)',
            'color': '#EAF2F8', 'border': '#6C8EBF', 'font': '#2A4D7C'
        },
        'center': {
            'name': 'เจ้าหน้าที่ศูนย์เทคโนโลยีสารสนเทศฯ',
            'color': '#E9F7F8', 'border': '#0e8088', 'font': '#095458'
        }
    }
    
    diagrams = root.findall('.//diagram')
    sys_num = 1
    
    # ----------------------------------------------------
    # TAB 14.1.1 - Registration
    # ----------------------------------------------------
    diag_14_1_1 = [d for d in diagrams if d.get('name') == "A4 TOBE_14.1.1"][0]
    v1, e1, l1, n1 = extract_tab_elements(diag_14_1_1)
    
    s1_nodes_p1 = [
        'szvE4JhnObREoADsnGys-14', 'szvE4JhnObREoADsnGys-15', 'szvE4JhnObREoADsnGys-16', 
        'szvE4JhnObREoADsnGys-17', 'szvE4JhnObREoADsnGys-18', '6HSq2guSSt-pe_y_Tyjt-0'
    ]
    s1_nodes_p2 = [
        '_xHUBsZAX6sNiZWudkp5-2', 'szvE4JhnObREoADsnGys-19', 'szvE4JhnObREoADsnGys-20', 
        'szvE4JhnObREoADsnGys-21', 'szvE4JhnObREoADsnGys-22', '6HSq2guSSt-pe_y_Tyjt-25'
    ]
    s1_nodes_p3 = [
        '6HSq2guSSt-pe_y_Tyjt-8', '6HSq2guSSt-pe_y_Tyjt-10', '6HSq2guSSt-pe_y_Tyjt-13', 
        '6HSq2guSSt-pe_y_Tyjt-18', '6HSq2guSSt-pe_y_Tyjt-14', '6HSq2guSSt-pe_y_Tyjt-16', 
        '6HSq2guSSt-pe_y_Tyjt-20'
    ]
    
    s1_roles = {
        'szvE4JhnObREoADsnGys-14': 'user', 'szvE4JhnObREoADsnGys-15': 'user',
        'szvE4JhnObREoADsnGys-16': 'user', 'szvE4JhnObREoADsnGys-17': 'user',
        'szvE4JhnObREoADsnGys-18': 'user', '6HSq2guSSt-pe_y_Tyjt-0': 'user',
        '_xHUBsZAX6sNiZWudkp5-2': 'center', 'szvE4JhnObREoADsnGys-19': 'admin',
        'szvE4JhnObREoADsnGys-20': 'admin', 'szvE4JhnObREoADsnGys-21': 'admin',
        'szvE4JhnObREoADsnGys-22': 'admin', '6HSq2guSSt-pe_y_Tyjt-25': 'user',
        '6HSq2guSSt-pe_y_Tyjt-8': 'user', '6HSq2guSSt-pe_y_Tyjt-10': 'user',
        '6HSq2guSSt-pe_y_Tyjt-13': 'user', '6HSq2guSSt-pe_y_Tyjt-18': 'user',
        '6HSq2guSSt-pe_y_Tyjt-14': 'user', '6HSq2guSSt-pe_y_Tyjt-16': 'user',
        '6HSq2guSSt-pe_y_Tyjt-20': 'user'
    }
    
    s1_sessions = [
        {
            'name': 'Session 1: ขอลงทะเบียนเข้าใช้งาน',
            'node_ids': s1_nodes_p1, 'roles': ['user'],
            'extra_nodes': [('offpage_1_to_2', 'ต่อ Session 2', 'offpage', 'user', 5)],
            'extra_edges': [('edge_1_to_2', '', '6HSq2guSSt-pe_y_Tyjt-0', 'offpage_1_to_2', False)]
        },
        {
            'name': 'Session 2: ตรวจสอบและอนุมัติการลงทะเบียน',
            'node_ids': s1_nodes_p2, 'roles': ['user', 'admin', 'center'],
            'extra_nodes': [
                ('offpage_2_from_1', 'จาก Session 1', 'offpage', 'admin', 0),
                ('offpage_2_to_3', 'ต่อ Session 3', 'offpage', 'admin', 5),
                ('end_s2_reject', 'จบ', 'end', 'user', 5)
            ],
            'extra_edges': [
                ('edge_2_from_1_to_5', '', 'offpage_2_from_1', '_xHUBsZAX6sNiZWudkp5-2', False),
                ('edge_2_from_1_to_6', '', 'offpage_2_from_1', 'szvE4JhnObREoADsnGys-19', False),
                ('edge_2_to_3', '', 'szvE4JhnObREoADsnGys-22', 'offpage_2_to_3', False),
                ('edge_2_reject', '', '6HSq2guSSt-pe_y_Tyjt-25', 'end_s2_reject', True)
            ]
        },
        {
            'name': 'Session 3: เข้าใช้งานระบบครั้งแรกและตั้งรหัสผ่านใหม่',
            'node_ids': s1_nodes_p3, 'roles': ['user'],
            'extra_nodes': [('offpage_3_from_2', 'จาก Session 2', 'offpage', 'user', 0)],
            'extra_edges': [('edge_3_from_2', '', 'offpage_3_from_2', '6HSq2guSSt-pe_y_Tyjt-8', False)]
        }
    ]
    
    # ----------------------------------------------------
    # TAB 14.1.2 - Login / Personal Info
    # ----------------------------------------------------
    diag_14_1_2 = [d for d in diagrams if d.get('name') == "A4 TOBE_14.1.2"][0]
    v2, e2, l2, n2 = extract_tab_elements(diag_14_1_2)
    
    flow2_1 = [nid for nid, n in v2.items() if n['y'] < 16900]
    flow2_2 = [nid for nid, n in v2.items() if 17000 <= n['y'] < 18300]
    flow2_3 = [nid for nid, n in v2.items() if 18300 <= n['y']]
    
    def role_map_14_1_2(x, y, nid):
        if y < 16900:
            if x < 2160: return 'user'
            elif x < 2500: return 'admin'
            else: return 'center'
        elif y < 18300:
            if x < 2180: return 'user'
            elif x < 2520: return 'admin'
            else: return 'center'
        else:
            if x < 2180: return 'user'
            elif x < 2520: return 'admin_origin'
            elif x < 2860: return 'admin_dest'
            else: return 'center'
            
    s2_sessions = [
        {
            'name': 'Session 1: กรณีลืมรหัสผ่าน (Forgot Password)',
            'node_ids': flow2_1, 'roles': ['user', 'admin', 'center'],
            'extra_nodes': [], 'extra_edges': []
        },
        {
            'name': 'Session 2: การจัดการข้อมูลส่วนตัว (Edit Personal Info)',
            'node_ids': flow2_2, 'roles': ['user', 'admin', 'center'],
            'extra_nodes': [], 'extra_edges': []
        },
        {
            'name': 'Session 3: การขอเปลี่ยนสังกัดหน่วยงาน (Change Department)',
            'node_ids': flow2_3, 'roles': ['user', 'admin_origin', 'admin_dest', 'center'],
            'extra_nodes': [], 'extra_edges': []
        }
    ]
    
    # ----------------------------------------------------
    # TAB 14.1.3 - Admin Actions
    # ----------------------------------------------------
    diag_14_1_3 = [d for d in diagrams if d.get('name') == "A4 of TOBE_14.1.3"][0]
    v3, e3, l3, n3 = extract_tab_elements(diag_14_1_3)
    
    flow3_1_a = [
        'M8PcYiCU2L-84uyNqedl-71', 'M8PcYiCU2L-84uyNqedl-50', 'M8PcYiCU2L-84uyNqedl-51', 
        'M8PcYiCU2L-84uyNqedl-52', 'M8PcYiCU2L-84uyNqedl-65', 'M8PcYiCU2L-84uyNqedl-53', 
        'M8PcYiCU2L-84uyNqedl-54', 'M8PcYiCU2L-84uyNqedl-55', 'M8PcYiCU2L-84uyNqedl-66'
    ]
    flow3_1_b = [
        'M8PcYiCU2L-84uyNqedl-21', 'PVy1guCEzkk1prECMam5-107', 'M8PcYiCU2L-84uyNqedl-22', 
        'M8PcYiCU2L-84uyNqedl-34', 'M8PcYiCU2L-84uyNqedl-23', 'M8PcYiCU2L-84uyNqedl-24', 
        'M8PcYiCU2L-84uyNqedl-25', 'M8PcYiCU2L-84uyNqedl-40'
    ]
    flow3_2 = [nid for nid, n in v3.items() if 19800 <= n['y'] < 20700]
    flow3_3_a = [
        'M8PcYiCU2L-84uyNqedl-89', 'M8PcYiCU2L-84uyNqedl-90', 'M8PcYiCU2L-84uyNqedl-91', 
        'M8PcYiCU2L-84uyNqedl-84', 'M8PcYiCU2L-84uyNqedl-85', 'M8PcYiCU2L-84uyNqedl-86', 
        'M8PcYiCU2L-84uyNqedl-93', 'M8PcYiCU2L-84uyNqedl-87'
    ]
    flow3_3_b = [
        'M8PcYiCU2L-84uyNqedl-80', 'M8PcYiCU2L-84uyNqedl-81', 'M8PcYiCU2L-84uyNqedl-82', 
        'M8PcYiCU2L-84uyNqedl-111', 'M8PcYiCU2L-84uyNqedl-83', 'M8PcYiCU2L-84uyNqedl-105', 
        'M8PcYiCU2L-84uyNqedl-107', 'M8PcYiCU2L-84uyNqedl-114'
    ]
    flow3_4 = [nid for nid, n in v3.items() if 22800 <= n['y']]
    
    def role_map_14_1_3(x, y, nid):
        if nid == 'M8PcYiCU2L-84uyNqedl-114': return 'admin_dest'
        if y < 20700:
            if nid in ['M8PcYiCU2L-84uyNqedl-71', 'M8PcYiCU2L-84uyNqedl-50', 'M8PcYiCU2L-84uyNqedl-55', 'PVy1guCEzkk1prECMam5-107']:
                return 'user'
            else:
                return 'admin'
        elif y < 22700:
            if x < 350: return 'admin_dest'
            elif x < 750: return 'admin_origin'
            else: return 'user'
        else:
            if x < 900: return 'admin'
            else: return 'user'
            
    s3_sessions = [
        {
            'name': 'Session 1: พิจารณาและอนุมัติการลงทะเบียน',
            'node_ids': flow3_1_a, 'roles': ['user', 'admin'],
            'extra_nodes': [
                ('offpage_3_1_to_2', 'ต่อ Session 2', 'offpage', 'admin', 5),
                ('end_reject_3_1', 'จบ', 'end', 'user', 5)
            ],
            'extra_edges': [
                ('edge_3_1_to_2', '', 'M8PcYiCU2L-84uyNqedl-54', 'offpage_3_1_to_2', False),
                ('edge_3_1_reject', '', 'M8PcYiCU2L-84uyNqedl-53', 'end_reject_3_1', True)
            ]
        },
        {
            'name': 'Session 2: จัดการสถานะผู้ใช้งานระบบ',
            'node_ids': flow3_1_b, 'roles': ['user', 'admin'],
            'extra_nodes': [('offpage_3_2_from_1', 'จาก Session 1', 'offpage', 'admin', 0)],
            'extra_edges': [('edge_3_2_from_1', '', 'offpage_3_2_from_1', 'M8PcYiCU2L-84uyNqedl-21', False)]
        },
        {
            'name': 'Session 3: การจัดการรหัสผ่านผู้ใช้งานระบบ',
            'node_ids': flow3_2, 'roles': ['user', 'admin'],
            'extra_nodes': [], 'extra_edges': []
        },
        {
            'name': 'Session 4: อนุมัติย้ายหน่วยงาน (ขั้นตอนต้นทาง)',
            'node_ids': flow3_3_a, 'roles': ['user', 'admin_origin'],
            'extra_nodes': [
                ('offpage_3_3_to_4', 'ต่อ Session 5', 'offpage', 'admin_origin', 6),
                ('end_reject_3_3', 'จบ', 'end', 'user', 6)
            ],
            'extra_edges': [
                ('edge_3_3_to_4', '', 'M8PcYiCU2L-84uyNqedl-87', 'offpage_3_3_to_4', False),
                ('edge_3_3_reject', '', 'M8PcYiCU2L-84uyNqedl-93', 'end_reject_3_3', True)
            ]
        },
        {
            'name': 'Session 5: อนุมัติย้ายหน่วยงาน (ขั้นตอนปลายทาง)',
            'node_ids': flow3_3_b, 'roles': ['user', 'admin_dest'],
            'extra_nodes': [
                ('offpage_3_4_from_3', 'จาก Session 4', 'offpage', 'admin_dest', 0),
                ('end_reject_3_4', 'จบ', 'end', 'user', 5)
            ],
            'extra_edges': [
                ('edge_3_4_from_3', '', 'offpage_3_4_from_3', 'M8PcYiCU2L-84uyNqedl-80', False),
                ('edge_3_4_reject', '', 'M8PcYiCU2L-84uyNqedl-111', 'end_reject_3_4', True)
            ]
        },
        {
            'name': 'Session 6: อนุมัติแก้ไขสิทธิ์การเข้าใช้งานระบบ',
            'node_ids': flow3_4, 'roles': ['user', 'admin'],
            'extra_nodes': [], 'extra_edges': []
        }
    ]
    
    # ----------------------------------------------------
    # TAB 14.1.4 - Super Admin Actions
    # ----------------------------------------------------
    diag_14_1_4 = [d for d in diagrams if d.get('name') == "A4 of TOBE_14.1.4"][0]
    v4, e4, l4, n4 = extract_tab_elements(diag_14_1_4)
    
    flow4_1 = [nid for nid, n in v4.items() if n['y'] < 1500 and nid.startswith("V9uP")]
    flow4_2 = [nid for nid, n in v4.items() if n['y'] < 1500 and nid.startswith("nOir")]
    flow4_3 = [nid for nid, n in v4.items() if 15000 <= n['y'] < 19000]
    flow4_4 = [nid for nid, n in v4.items() if 19100 <= n['y'] < 20000]
    flow4_5 = [nid for nid, n in v4.items() if 20000 <= n['y'] < 22000]
    flow4_6 = [nid for nid, n in v4.items() if 22000 <= n['y']]
    
    flow4_1_a = [
        'V9uPNwDC_NfuPW4zthRv-88', 'V9uPNwDC_NfuPW4zthRv-89', 'V9uPNwDC_NfuPW4zthRv-90', 
        'V9uPNwDC_NfuPW4zthRv-84', 'V9uPNwDC_NfuPW4zthRv-85', 'V9uPNwDC_NfuPW4zthRv-86', 
        'V9uPNwDC_NfuPW4zthRv-91', 'V9uPNwDC_NfuPW4zthRv-87'
    ]
    flow4_1_b = [
        'V9uPNwDC_NfuPW4zthRv-80', 'V9uPNwDC_NfuPW4zthRv-81', 'V9uPNwDC_NfuPW4zthRv-82', 
        'V9uPNwDC_NfuPW4zthRv-107', 'V9uPNwDC_NfuPW4zthRv-83', 'V9uPNwDC_NfuPW4zthRv-101', 
        'V9uPNwDC_NfuPW4zthRv-103', 'V9uPNwDC_NfuPW4zthRv-110'
    ]
    
    flow4_3_a = [
        'IC9jcjwwnxsJSC_GN0si-41', 'IC9jcjwwnxsJSC_GN0si-22', 'IC9jcjwwnxsJSC_GN0si-23', 
        'IC9jcjwwnxsJSC_GN0si-24', 'IC9jcjwwnxsJSC_GN0si-37', 'IC9jcjwwnxsJSC_GN0si-25', 
        'IC9jcjwwnxsJSC_GN0si-26', 'IC9jcjwwnxsJSC_GN0si-27', 'IC9jcjwwnxsJSC_GN0si-38'
    ]
    flow4_3_b = [
        'IC9jcjwwnxsJSC_GN0si-2', 'IC9jcjwwnxsJSC_GN0si-43', 'IC9jcjwwnxsJSC_GN0si-3', 
        'IC9jcjwwnxsJSC_GN0si-13', 'IC9jcjwwnxsJSC_GN0si-4', 'IC9jcjwwnxsJSC_GN0si-5', 
        'IC9jcjwwnxsJSC_GN0si-14', 'IC9jcjwwnxsJSC_GN0si-6', 'IC9jcjwwnxsJSC_GN0si-19'
    ]
    
    def role_map_14_1_4(x, y, nid):
        if nid == 'V9uPNwDC_NfuPW4zthRv-110': return 'admin_dest'
        if nid == 'IC9jcjwwnxsJSC_GN0si-38': return 'center'
        if y < 1500:
            if nid in flow4_1 or nid in flow4_1_a or nid in flow4_1_b:
                if x < 350: return 'admin_dest'
                elif x < 750: return 'admin_origin'
                elif x < 1200: return 'center'
                else: return 'user'
            else:
                if x < 1200: return 'center'
                else: return 'user'
        else:
            if x < 1700: return 'center'
            else: return 'user'
            
    s4_sessions = [
        {
            'name': 'Session 1: จัดการแก้ไขหน่วยงาน (ขั้นตอนต้นทาง)',
            'node_ids': flow4_1_a, 'roles': ['user', 'admin_origin'],
            'extra_nodes': [
                ('offpage_4_1_to_2', 'ต่อ Session 2', 'offpage', 'admin_origin', 6),
                ('end_reject_4_1', 'จบ', 'end', 'user', 6)
            ],
            'extra_edges': [
                ('edge_4_1_to_2', '', 'V9uPNwDC_NfuPW4zthRv-87', 'offpage_4_1_to_2', False),
                ('edge_4_1_reject', '', 'V9uPNwDC_NfuPW4zthRv-91', 'end_reject_4_1', True)
            ]
        },
        {
            'name': 'Session 2: จัดการแก้ไขหน่วยงาน (ขั้นตอนปลายทาง)',
            'node_ids': flow4_1_b, 'roles': ['user', 'admin_dest'],
            'extra_nodes': [
                ('offpage_4_2_from_1', 'จาก Session 1', 'offpage', 'admin_dest', 0),
                ('end_reject_4_2', 'จบ', 'end', 'user', 5)
            ],
            'extra_edges': [
                ('edge_4_2_from_1', '', 'offpage_4_2_from_1', 'V9uPNwDC_NfuPW4zthRv-80', False),
                ('edge_4_2_reject', '', 'V9uPNwDC_NfuPW4zthRv-107', 'end_reject_4_2', True)
            ]
        },
        {
            'name': 'Session 3: บริหารจัดการฐานข้อมูลกลาง (Master Data)',
            'node_ids': flow4_2, 'roles': ['user', 'center'],
            'extra_nodes': [], 'extra_edges': []
        },
        {
            'name': 'Session 4: พิจารณาและอนุมัติการลงทะเบียน (ระบบกลาง)',
            'node_ids': flow4_3_a, 'roles': ['user', 'center'],
            'extra_nodes': [
                ('offpage_4_3_to_4', 'ต่อ Session 5', 'offpage', 'center', 5),
                ('end_reject_4_3', 'จบ', 'end', 'user', 5)
            ],
            'extra_edges': [
                ('edge_4_3_to_4', '', 'IC9jcjwwnxsJSC_GN0si-26', 'offpage_4_3_to_4', False),
                ('edge_4_3_reject', '', 'IC9jcjwwnxsJSC_GN0si-25', 'end_reject_4_3', True)
            ]
        },
        {
            'name': 'Session 5: จัดการข้อมูลและสถานะผู้ใช้งานระบบกลาง',
            'node_ids': flow4_3_b, 'roles': ['user', 'center'],
            'extra_nodes': [('offpage_4_4_from_3', 'จาก Session 4', 'offpage', 'center', 0)],
            'extra_edges': [('edge_4_4_from_3', '', 'offpage_4_4_from_3', 'IC9jcjwwnxsJSC_GN0si-2', False)]
        },
        {
            'name': 'Session 6: การจัดการรหัสผ่านผู้ใช้งาน (ระบบกลาง)',
            'node_ids': flow4_4, 'roles': ['user', 'center'],
            'extra_nodes': [], 'extra_edges': []
        },
        {
            'name': 'Session 7: มอบหมายบทบาทและสิทธิ์การใช้งาน (Delegation)',
            'node_ids': flow4_5, 'roles': ['user', 'center'],
            'extra_nodes': [], 'extra_edges': []
        },
        {
            'name': 'Session 8: บริหารจัดการสิทธิ์การเข้าใช้งานระบบกลาง',
            'node_ids': flow4_6, 'roles': ['user', 'center'],
            'extra_nodes': [], 'extra_edges': []
        }
    ]
    
    # ----------------------------------------------------
    # TAB 14.1.5 - Role Assignment
    # ----------------------------------------------------
    diag_14_1_5 = [d for d in diagrams if d.get('name') == "A4 TOBE_14.1.5"][0]
    v5, e5, l5, n5 = extract_tab_elements(diag_14_1_5)
    
    flow5_1 = list(v5.keys())
    def role_map_14_1_5(x, y, nid):
        if x < 600: return 'center'
        else: return 'user'
        
    s5_sessions = [
        {
            'name': 'Session 1: การกำหนดสิทธิ์เข้าใช้งานตามระดับผู้ใช้งาน',
            'node_ids': flow5_1, 'roles': ['user', 'center'],
            'extra_nodes': [], 'extra_edges': []
        }
    ]
    
    # ----------------------------------------------------
    # TAB 14.1.6 - Reports
    # ----------------------------------------------------
    diag_14_1_6 = [d for d in diagrams if d.get('name') == "A4 TOBE_14.1.6"][0]
    v6, e6, l6, n6 = extract_tab_elements(diag_14_1_6)
    
    flow6_1 = list(v6.keys())
    def role_map_14_1_6(x, y, nid):
        return 'center'
        
    s6_sessions = [
        {
            'name': 'Session 1: ระบบรายงานข้อมูลผู้ใช้งานระบบกลาง',
            'node_ids': flow6_1, 'roles': ['center'],
            'extra_nodes': [], 'extra_edges': []
        }
    ]
    
    # Create the list of target tabs to generate (excluding 14.1.4 which is processed unsplit below)
    # Format: (original_diag_node, main_tab_name, base_id, sessions_list, vertices, edges, edge_labels, tor_notes, role_map_func)
    tab_tasks = [
        (diag_14_1_1, "A4 TOBE_14.1.1", "diag_14_1_1", s1_sessions, v1, e1, l1, n1, s1_roles if isinstance(s1_roles, dict) else role_map_14_1_2),
        (diag_14_1_2, "A4 TOBE_14.1.2", "diag_14_1_2", s2_sessions, v2, e2, l2, n2, role_map_14_1_2),
        (diag_14_1_3, "A4 TOBE_14.1.3", "diag_14_1_3", s3_sessions, v3, e3, l3, n3, role_map_14_1_3),
        (diag_14_1_5, "A4 TOBE_14.1.5", "diag_14_1_5", s5_sessions, v5, e5, l5, n5, role_map_14_1_5),
        (diag_14_1_6, "A4 TOBE_14.1.6", "diag_14_1_6", s6_sessions, v6, e6, l6, n6, role_map_14_1_6)
    ]
    
    final_diagrams = []
    
    # 1. Process 14.1.1 to 14.1.3
    for task in tab_tasks[:3]:
        orig_node, main_name, base_id, sessions, vt, ed, lb, nt, r_map = task
        if isinstance(r_map, dict):
            r_func = lambda x, y, nid, m=r_map: m[nid]
        else:
            r_func = r_map
            
        for s_idx, session in enumerate(sessions):
            tab_name = f"{main_name} S{s_idx+1}"
            tab_id = f"{base_id}_s_{s_idx+1}"
            print(f"Generating tab: {tab_name}...")
            
            new_diag, sys_num = reconstruct_single_session_tab(
                orig_node, tab_name, tab_id, session, vt, ed, lb, nt,
                sys_num, lane_config, r_func, s_idx+1
            )
            final_diagrams.append(new_diag)
            
    # 2. Process 14.1.4 as a single unsplit tab with continuous SYS numbering
    print("Processing tab 14.1.4 as a single unsplit tab...")
    diag_14_1_4 = [d for d in diagrams if d.get('name') == "A4 of TOBE_14.1.4"][0]
    new_diag_14_1_4 = copy.deepcopy(diag_14_1_4)
    new_diag_14_1_4.set('name', "A4 TOBE_14.1.4")
    new_diag_14_1_4.set('id', "diag_14_1_4")
    
    mx_model = new_diag_14_1_4.find('.//mxGraphModel')
    root_node = mx_model.find('root')
    
    process_cells = []
    for cell in root_node.findall('mxCell'):
        if cell.get('vertex') == '1':
            style = cell.get('style', '')
            val = clean_html(cell.get('value', ''))
            is_process = 'rounded=1' in style and val not in ['เริ่มต้น', 'เริ่ม', 'จบ', 'จบการทำงาน']
            if is_process:
                geom = cell.find('mxGeometry')
                if geom is not None:
                    x = float(geom.get('x', 0))
                    y = float(geom.get('y', 0))
                    process_cells.append((cell, y, x, val))
                    
    # Sort processes chronologically by original layout (Y first, then X)
    process_cells.sort(key=lambda item: (item[1], item[2]))
    for cell, _, _, val in process_cells:
        sys_str = f"SYS{sys_num:03d}"
        cval_clean = re.sub(r'^SYS\d+[:\s]*', '', val)
        new_val = f"<b>{sys_str}</b><br>{cval_clean}"
        cell.set('value', new_val)
        sys_num += 1
        
    final_diagrams.append(new_diag_14_1_4)
    
    # 3. Process 14.1.5 and 14.1.6
    for task in tab_tasks[3:]:
        orig_node, main_name, base_id, sessions, vt, ed, lb, nt, r_map = task
        if isinstance(r_map, dict):
            r_func = lambda x, y, nid, m=r_map: m[nid]
        else:
            r_func = r_map
            
        for s_idx, session in enumerate(sessions):
            tab_name = f"{main_name} S{s_idx+1}"
            tab_id = f"{base_id}_s_{s_idx+1}"
            print(f"Generating tab: {tab_name}...")
            
            new_diag, sys_num = reconstruct_single_session_tab(
                orig_node, tab_name, tab_id, session, vt, ed, lb, nt,
                sys_num, lane_config, r_func, s_idx+1
            )
            final_diagrams.append(new_diag)
            
    # Include all other unmodified tabs in their original positions/order
    # First, let's build the list of all diagrams that are not A4 TOBE_14.1.*
    all_diags = list(root.findall('.//diagram'))
    for d in all_diags:
        name = d.get('name')
        if not (name.startswith("A4 TOBE_14.1.") or name.startswith("A4 of TOBE_14.1.")):
            final_diagrams.append(d)
            
    # Clear root and re-append all diagrams
    for d in list(root.findall('.//diagram')):
        try:
            root.remove(d)
        except ValueError:
            pass
            
    for d in final_diagrams:
        root.append(d)
        
    print(f"\nTotal tabs in final diagram file: {[d.get('name') for d in root.findall('.//diagram')]}")
    
    # Write back XML file
    tree.write(file_path, encoding='utf-8', xml_declaration=True)
    print(f"\nSuccessfully split tabs, resolved duplicate IDs, and saved to: {file_path}")

if __name__ == "__main__":
    main()
