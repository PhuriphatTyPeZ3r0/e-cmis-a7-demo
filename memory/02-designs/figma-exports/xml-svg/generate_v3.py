import os
import re

width = 1440
height = 900

navy_deep = "#0D1B3E"
navy = "#0a162d"
navy_mid = "#2A4A8F"
gold = "#c8a96e"
gold_light = "#E8C96A"
silver = "#B8C4D8"
off_white = "#F0F4FA"
card_bg = "#FFFFFF"
text_dark = "#0D1B3E"
text_muted = "#6B7A99"
green = "#4ade80"
red = "#dc2626"
yellow = "#fbbf24"

sidebar_w = 260
topbar_h = 64
pad = 32
main_w = width - sidebar_w
content_w = main_w - (pad * 2)

def get_icon(name, color="currentColor", size=16, x=0, y=0):
    path_file = f'node_modules/bootstrap-icons/icons/{name}.svg'
    if not os.path.exists(path_file):
        return f'<rect x="{x}" y="{y}" width="{size}" height="{size}" fill="red"/>'
    with open(path_file, 'r', encoding='utf-8') as f:
        svg_content = f.read()
    
    # Extract inner content
    inner = re.search(r'<svg[^>]*>(.*?)</svg>', svg_content, re.DOTALL)
    if not inner: return ""
    inner_str = inner.group(1).strip()
    
    # Replace any currentColor with our color
    inner_str = inner_str.replace('currentColor', color)
    # If no fill is defined, force it
    if 'fill="' not in inner_str and 'stroke="' not in inner_str:
        inner_str = inner_str.replace('<path ', f'<path fill="{color}" ')
        inner_str = inner_str.replace('<circle ', f'<circle fill="{color}" ')
    
    scale = size / 16.0
    return f'<g transform="translate({x},{y}) scale({scale})" fill="{color}">{inner_str}</g>'


def create_svg(is_wireframe):
    bg = "#FFFFFF" if is_wireframe else off_white
    card = "#FFFFFF" if is_wireframe else card_bg
    bdr = "#E2E8F0" if is_wireframe else "#E5E7EB"
    
    t_dark = "#1E293B" if is_wireframe else text_dark
    t_gray = "#64748B" if is_wireframe else text_muted
    
    sb_bg = "#F8FAFC" if is_wireframe else navy_deep
    sb_bdr = "#E2E8F0" if is_wireframe else navy
    sb_text = "#1E293B" if is_wireframe else "#FFFFFF"
    sb_text_muted = "#64748B" if is_wireframe else silver
    sb_hover = "#F1F5F9" if is_wireframe else "rgba(255,255,255,0.05)"
    sb_active = "#E2E8F0" if is_wireframe else "rgba(255,255,255,0.1)"
    
    header_start = "#F1F5F9" if is_wireframe else navy_deep
    header_end = "#F1F5F9" if is_wireframe else "#1e3575"
    header_text = "#1E293B" if is_wireframe else "#FFFFFF"
    header_text_muted = "#64748B" if is_wireframe else "rgba(255,255,255,0.6)"
    
    gold_c = "#E2E8F0" if is_wireframe else gold
    gold_l = "#F1F5F9" if is_wireframe else gold_light
    
    c_green = "#64748B" if is_wireframe else green
    c_red = "#64748B" if is_wireframe else red
    c_yellow = "#64748B" if is_wireframe else yellow
    
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" style="background-color: {bg}; font-family: 'Sarabun', sans-serif;">
    <defs>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700;800&amp;display=swap');
            text {{ font-family: 'Sarabun', sans-serif; }}
        </style>
        <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="{header_start}" />
            <stop offset="100%" stop-color="{header_end}" />
        </linearGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="{gold_l}" />
            <stop offset="100%" stop-color="{gold_c}" />
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="16" flood-color="#0f172a" flood-opacity="0.05" />
        </filter>
        <filter id="shadow_sm" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f172a" flood-opacity="0.05" />
        </filter>
    </defs>
    '''

    shadow = 'filter="url(#shadow)"' if not is_wireframe else ''
    shadow_sm = 'filter="url(#shadow_sm)"' if not is_wireframe else ''

    # SIDEBAR
    svg += f'''
    <g id="Sidebar">
        <rect x="0" y="0" width="{sidebar_w}" height="{height}" fill="{sb_bg}" />
        <line x1="{sidebar_w}" y1="0" x2="{sidebar_w}" y2="{height}" stroke="{sb_bdr}" />
        
        <!-- Brand -->
        <g id="Brand" transform="translate(20, 20)">
            <circle cx="22" cy="22" r="22" fill="url(#goldGrad)" />
            <text x="22" y="27" font-size="14" font-weight="800" fill="{t_dark if not is_wireframe else sb_text}" text-anchor="middle">ป.ป.ท.</text>
            <text x="56" y="20" font-size="20" font-weight="800" fill="{sb_text}">E-CMIS</text>
            <text x="56" y="34" font-size="10" font-weight="600" fill="{sb_text_muted}">COMPLAINT MANAGEMENT</text>
        </g>
        
        <g id="Nav" transform="translate(16, 90)">
    '''
    
    nav_items = [
        ("รับเรื่องร้องเรียน", "inbox-fill"), ("แสวงหาข้อเท็จจริง", "search"), ("วินิจฉัย/สรุปผล", "file-earmark-check-fill"), 
        ("มติคณะกรรมการ ป.ป.ท.", "people-fill"), ("ติดตามภายหลังมติ", "clock-history"), ("การดำเนินการตามหมายจับ", "file-earmark-person"), 
        ("งานกฎหมายและคดีศาล", "bank2"), ("วิเคราะห์/รายงาน", "bar-chart-line-fill"), ("จัดการระบบ", "gear-fill"), 
        ("บทบาทของฉัน", "person-badge-fill"), ("บริหารกลางและสนับสนุน", "life-preserver")
    ]
    
    y = 0
    for title, icon in nav_items:
        is_active = (title == "จัดการระบบ")
        item_bg = sb_active if is_active else "none"
        txt_col = sb_text
        icon_col = gold_c if is_active and not is_wireframe else sb_text_muted
        
        svg += f'''
            <rect x="0" y="{y}" width="228" height="40" rx="8" fill="{item_bg}" />
            {get_icon(icon, color=icon_col, size=16, x=12, y=y+12)}
            <text x="40" y="{y+25}" font-size="14" font-weight="600" fill="{txt_col}">{title}</text>
            {get_icon("chevron-down", color=sb_text_muted, size=12, x=204, y=y+14)}
        '''
        if is_active:
            y += 40
            sub_items = [
                "ภาพรวมระบบ", "จัดการผู้ใช้งาน", "อนุมัติคำขอ", "ตั้งค่าเมนูและสิทธิ์", 
                "Master Data (หน่วยงาน/ตำแหน่ง)", "รายงาน Audit",
                "จัดการข่าวประชาสัมพันธ์", "ประกาศและ FAQ", "API Data Publishing"
            ]
            for sub in sub_items:
                is_sub_active = (sub == "จัดการข่าวประชาสัมพันธ์")
                sub_bg = sb_hover if is_sub_active else "none"
                sub_txt = gold_c if is_sub_active and not is_wireframe else sb_text_muted
                sub_w = "600" if is_sub_active else "400"
                
                svg += f'''
                    <rect x="0" y="{y}" width="228" height="36" rx="8" fill="{sub_bg}" />
                    <circle cx="20" cy="{y+18}" r="3" fill="{sub_txt}" />
                    <text x="40" y="{y+23}" font-size="13" font-weight="{sub_w}" fill="{sub_txt}">{sub}</text>
                '''
                y += 36
        y += 44

    svg += f'''
        </g>
        <g id="UserFooter" transform="translate(0, 820)">
            <line x1="0" y1="0" x2="{sidebar_w}" y2="0" stroke="{sb_bdr}" />
            <circle cx="36" cy="40" r="18" fill="{gold_c if not is_wireframe else bdr}" />
            <text x="36" y="46" font-size="16" font-weight="700" fill="{t_dark if not is_wireframe else sb_text}" text-anchor="middle">T</text>
            <text x="64" y="35" font-size="14" font-weight="600" fill="{sb_text}">thanthita</text>
            <text x="64" y="51" font-size="12" font-weight="400" fill="{sb_text_muted}">Super Admin</text>
        </g>
    </g>
    '''

    # TOPBAR
    svg += f'''
    <g id="Topbar" transform="translate({sidebar_w}, 0)">
        <rect x="0" y="0" width="{main_w}" height="{topbar_h}" fill="{card}" />
        <line x1="0" y1="{topbar_h}" x2="{main_w}" y2="{topbar_h}" stroke="{bdr}" />
        
        <g transform="translate(16, 16)">
            {get_icon("list", color=t_dark, size=24, x=4, y=4)}
        </g>

        <g id="Search" transform="translate(64, 12)">
            <rect x="0" y="0" width="360" height="40" rx="20" fill="{off_white if not is_wireframe else 'none'}" stroke="{bdr if is_wireframe else 'none'}" />
            {get_icon("search", color=t_gray, size=16, x=16, y=12)}
            <text x="40" y="25" font-size="14" fill="{t_gray}">ค้นหาเลขเรื่อง ผู้ถูกร้อง หน่วยงาน...</text>
        </g>

        <g id="TopActions" transform="translate({main_w - 380}, 12)">
            {get_icon("bell-fill", color=t_gray, size=18, x=10, y=11)}
            <circle cx="24" cy="11" r="4" fill="{c_red}" />
            
            {get_icon("book-fill", color=t_gray, size=18, x=46, y=11)}
            {get_icon("telephone-fill", color=t_gray, size=18, x=82, y=11)}
            {get_icon("moon-stars-fill", color=t_gray, size=18, x=118, y=11)}
            
            <line x1="154" y1="8" x2="154" y2="32" stroke="{bdr}" />
            
            <rect x="170" y="0" width="180" height="40" rx="20" fill="{off_white if not is_wireframe else 'none'}" stroke="{bdr if is_wireframe else 'none'}" />
            <circle cx="190" cy="20" r="14" fill="{t_dark}" />
            <text x="190" y="25" font-size="12" font-weight="700" fill="{card}" text-anchor="middle">T</text>
            <text x="214" y="19" font-size="13" font-weight="600" fill="{t_dark}">thanthita</text>
            <text x="214" y="31" font-size="10" font-weight="400" fill="{t_gray}">Super Admin</text>
            {get_icon("chevron-down", color=t_gray, size=12, x=326, y=14)}
        </g>
    </g>
    '''

    main_x = sidebar_w + pad
    
    list_w = 680
    editor_w = content_w - list_w - 16

    # MAIN CONTENT
    svg += f'''
    <g id="MainContent" transform="translate({main_x}, {topbar_h + 24})">
        <!-- Header Banner -->
        <g id="HeaderBanner">
            <rect x="0" y="0" width="{content_w}" height="110" rx="18" fill="url(#headerGrad)" stroke="{bdr if is_wireframe else 'none'}" />
            <circle cx="{content_w - 40}" cy="-40" r="110" fill="{gold_c}" opacity="0.08" />
            
            <g transform="translate(32, 28)">
                <rect x="0" y="0" width="40" height="40" rx="12" fill="url(#goldGrad)" />
                {get_icon("newspaper", color=t_dark if not is_wireframe else t_dark, size=20, x=10, y=10)}
                
                <text x="52" y="18" font-size="20" font-weight="800" fill="{header_text}">จัดการข่าวประชาสัมพันธ์</text>
                <text x="52" y="36" font-size="12" fill="{header_text_muted}">Public News Management — Central Support</text>
            </g>
            
            <!-- Stats & Actions right-aligned -->
            <g transform="translate({content_w - 490}, 28)">
                <rect x="0" y="0" width="80" height="54" rx="12" fill="{'rgba(255,255,255,0.1)' if not is_wireframe else 'none'}" stroke="{'rgba(255,255,255,0.15)' if not is_wireframe else bdr}" />
                <text x="40" y="20" font-size="10" font-weight="700" fill="{header_text_muted}" text-anchor="middle">DRAFT</text>
                <text x="40" y="44" font-size="22" font-weight="900" fill="{c_yellow}" text-anchor="middle">0</text>
                
                <rect x="88" y="0" width="80" height="54" rx="12" fill="{'rgba(255,255,255,0.1)' if not is_wireframe else 'none'}" stroke="{'rgba(255,255,255,0.15)' if not is_wireframe else bdr}" />
                <text x="128" y="20" font-size="10" font-weight="700" fill="{header_text_muted}" text-anchor="middle">เผยแพร่แล้ว</text>
                <text x="128" y="44" font-size="22" font-weight="900" fill="{c_green}" text-anchor="middle">3</text>
                
                <rect x="176" y="9" width="36" height="36" rx="8" fill="{'rgba(255,255,255,0.15)' if not is_wireframe else 'none'}" stroke="{'rgba(255,255,255,0.25)' if not is_wireframe else bdr}" />
                {get_icon("arrow-clockwise", color=header_text, size=16, x=186, y=19)}
                
                <rect x="220" y="9" width="116" height="36" rx="8" fill="{'rgba(255,255,255,0.15)' if not is_wireframe else 'none'}" stroke="{'rgba(255,255,255,0.25)' if not is_wireframe else bdr}" />
                {get_icon("tags", color=header_text, size=14, x=232, y=20)}
                <text x="254" y="32" font-size="13" font-weight="600" fill="{header_text}">หมวดหมู่ข่าว</text>
                
                <rect x="344" y="9" width="126" height="36" rx="8" fill="{'rgba(255,255,255,0.2)' if not is_wireframe else 'none'}" stroke="{'rgba(255,255,255,0.3)' if not is_wireframe else bdr}" />
                {get_icon("plus-lg", color=header_text, size=14, x=356, y=20)}
                <text x="376" y="32" font-size="13" font-weight="600" fill="{header_text}">สร้างข่าวใหม่</text>
            </g>
        </g>
        
        <!-- Two Column Layout (Grid) -->
        <g id="ContentGrid" transform="translate(0, 134)">
            <!-- Left List Column -->
            <g id="NewsList">
                <rect x="0" y="0" width="{list_w}" height="600" rx="12" fill="{card}" stroke="{bdr}" {shadow} />
                
                <g id="ListHeader">
                    <rect x="24" y="24" width="70" height="32" rx="16" fill="{t_dark}" />
                    <text x="59" y="45" font-size="13" font-weight="600" fill="{card}" text-anchor="middle">ทั้งหมด (3)</text>
                    
                    <rect x="102" y="24" width="66" height="32" rx="16" fill="none" stroke="{bdr}" />
                    <text x="135" y="45" font-size="13" font-weight="600" fill="{t_gray}" text-anchor="middle">Draft (0)</text>
                    
                    <rect x="176" y="24" width="100" height="32" rx="16" fill="none" stroke="{bdr}" />
                    <text x="226" y="45" font-size="13" font-weight="600" fill="{t_gray}" text-anchor="middle">เผยแพร่แล้ว (3)</text>
                    
                    <rect x="380" y="24" width="220" height="36" rx="8" fill="none" stroke="{bdr}" />
                    {get_icon("search", color=t_gray, size=14, x=392, y=35)}
                    <text x="416" y="47" font-size="13" fill="{t_gray}">ค้นหาหัวข้อข่าว...</text>
                    
                    <rect x="616" y="24" width="40" height="36" rx="8" fill="none" stroke="{bdr}" />
                    {get_icon("funnel", color=t_gray, size=16, x=628, y=34)}
                    
                    <line x1="0" y1="72" x2="{list_w}" y2="72" stroke="{bdr}" />
                </g>
                
                <!-- List Items -->
                '''
    
    items = [
        {"title": "ประกาศคณะกรรมการ ป.ป.ท. เรื่อง หลักเกณฑ์และวิธีการ", "date": "30/06/2026", "badge": "ประกาศและคู่มือระบบ"},
        {"title": "คู่มือการใช้งานระบบ E-CMIS สำหรับประชาชน", "date": "30/06/2026", "badge": "ประกาศและคู่มือระบบ"},
        {"title": "ปรับปรุงระบบประจำเดือน กรกฎาคม", "date": "29/06/2026", "badge": "ประกาศ"}
    ]
    
    y = 72
    for item in items:
        svg += f'''
                <g transform="translate(0, {y})">
                    <rect x="24" y="24" width="40" height="40" rx="8" fill="{bg}" />
                    {get_icon("newspaper", color=t_gray, size=20, x=34, y=34)}
                    
                    <text x="80" y="40" font-size="15" font-weight="700" fill="{t_dark}">{item["title"]}</text>
                    
                    <rect x="80" y="50" width="120" height="22" rx="4" fill="{bg}" />
                    <text x="140" y="65" font-size="11" font-weight="600" fill="{t_gray}" text-anchor="middle">{item["badge"]}</text>
                    
                    <rect x="208" y="50" width="70" height="22" rx="4" fill="{'rgba(74, 222, 128, 0.1)' if not is_wireframe else bg}" stroke="{bdr if is_wireframe else 'none'}" />
                    <text x="243" y="65" font-size="11" font-weight="600" fill="{c_green}" text-anchor="middle">เผยแพร่แล้ว</text>
                    
                    <text x="{list_w - 90}" y="40" font-size="12" fill="{t_gray}">{item["date"]}</text>
                    
                    <rect x="{list_w - 64}" y="32" width="40" height="32" rx="6" fill="none" stroke="{bdr}" />
                    {get_icon("trash3", color=c_red, size=16, x=list_w - 52, y=40)}
                    
                    <line x1="0" y1="96" x2="{list_w}" y2="96" stroke="{bdr}" />
                </g>
        '''
        y += 96
            
    svg += f'''
            </g>
            
            <!-- Right Editor Placeholder -->
            <g id="EditorArea" transform="translate({list_w + 16}, 0)">
                <rect x="0" y="0" width="{editor_w}" height="600" rx="12" fill="{card}" stroke="{bdr}" {shadow} />
                
                <!-- Blank state -->
                <g transform="translate({editor_w/2 - 40}, 220)">
                    <rect x="0" y="0" width="80" height="80" rx="40" fill="{bg}" />
                    {get_icon("pencil-square", color=t_gray, size=32, x=24, y=24)}
                </g>
                <text x="{editor_w/2}" y="340" font-size="16" font-weight="600" fill="{t_dark}" text-anchor="middle">ยังไม่ได้เลือกรายการ</text>
                <text x="{editor_w/2}" y="364" font-size="14" fill="{t_gray}" text-anchor="middle">เลือกข่าวเพื่อแก้ไข หรือกด "สร้างข่าวใหม่"</text>
            </g>
        </g>
    </g>
</svg>
    '''
    return svg

proto = create_svg(False)
wire = create_svg(True)

with open(r'C:\1_Projects\01_Active_Projects\Design-Figma\xml-svg\ecmis_news_prototype_1440.svg', 'w', encoding='utf-8') as f:
    f.write(proto)

with open(r'C:\1_Projects\01_Active_Projects\Design-Figma\xml-svg\ecmis_news_wireframe_1440.svg', 'w', encoding='utf-8') as f:
    f.write(wire)

print("Created 2 files with Bootstrap Icons injected and accurate layout.")
