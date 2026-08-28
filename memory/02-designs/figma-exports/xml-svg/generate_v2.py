import json

width = 1440
height = 900

# Colors extracted from actual site
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
green = "#1B7A4A"
red = "#C0392B"
sidebar_w = 260
topbar_h = 64

def create_svg(is_wireframe):
    # Depending on is_wireframe, pick colors
    bg = "#FFFFFF" if is_wireframe else off_white
    card = "#FFFFFF" if is_wireframe else card_bg
    bdr = "#CCCCCC" if is_wireframe else "#E2E8F0"
    t_dark = "#333333" if is_wireframe else text_dark
    t_gray = "#888888" if is_wireframe else text_muted
    
    sb_bg = "#F5F5F5" if is_wireframe else navy_deep
    sb_bdr = "#CCCCCC" if is_wireframe else navy
    sb_text = "#333333" if is_wireframe else "#FFFFFF"
    sb_text_muted = "#888888" if is_wireframe else silver
    sb_hover = "#E0E0E0" if is_wireframe else "rgba(255,255,255,0.05)"
    sb_active = "#E0E0E0" if is_wireframe else "rgba(255,255,255,0.1)"
    
    brand_bg = "#F5F5F5" if is_wireframe else f"linear-gradient(135deg, {gold_light}, {gold})"
    
    header_start = "#F5F5F5" if is_wireframe else navy_deep
    header_end = "#F5F5F5" if is_wireframe else "#1e3575"
    header_text = "#333333" if is_wireframe else "#FFFFFF"
    header_text_muted = "#888888" if is_wireframe else "rgba(255,255,255,0.6)"
    
    success = "#333333" if is_wireframe else "#4ade80" # From HTML
    danger = "#333333" if is_wireframe else "#dc2626"
    draft_c = "#333333" if is_wireframe else "#fbbf24"
    
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
            <stop offset="0%" stop-color="{gold_light if not is_wireframe else '#f5f5f5'}" />
            <stop offset="100%" stop-color="{gold if not is_wireframe else '#f5f5f5'}" />
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="16" flood-color="#0f172a" flood-opacity="0.05" />
        </filter>
    </defs>
    '''

    shadow = 'filter="url(#shadow)"' if not is_wireframe else ''

    # Sidebar
    svg += f'''
    <g id="Sidebar">
        <rect x="0" y="0" width="{sidebar_w}" height="{height}" fill="{sb_bg}" />
        <line x1="{sidebar_w}" y1="0" x2="{sidebar_w}" y2="{height}" stroke="{sb_bdr}" />
        
        <!-- Brand -->
        <g id="Brand" transform="translate(20, 20)">
            <circle cx="22" cy="22" r="22" fill="url(#goldGrad)" stroke="{gold if not is_wireframe else bdr}" stroke-width="2"/>
            <text x="22" y="27" font-size="14" font-weight="800" fill="{text_dark if not is_wireframe else t_dark}" text-anchor="middle">ป.ป.ท.</text>
            <text x="56" y="20" font-size="20" font-weight="800" fill="{sb_text}">E-CMIS</text>
            <text x="56" y="34" font-size="10" font-weight="600" fill="{sb_text_muted}">COMPLAINT MANAGEMENT</text>
        </g>
        
        <!-- Nav -->
        <g id="Nav" transform="translate(16, 90)">
    '''
    
    nav_items = [
        "รับเรื่องร้องเรียน", "แสวงหาข้อเท็จจริง", "วินิจฉัย/สรุปผล", 
        "มติคณะกรรมการ ป.ป.ท.", "ติดตามภายหลังมติ", "การดำเนินการตามหมายจับ", 
        "งานกฎหมายและคดีศาล", "วิเคราะห์/รายงาน", "จัดการระบบ", 
        "บทบาทของฉัน", "บริหารกลางและสนับสนุน"
    ]
    
    y = 0
    for i, item in enumerate(nav_items):
        is_active = (item == "จัดการระบบ")
        item_bg = sb_active if is_active else "none"
        txt_col = sb_text
        icon_col = gold if is_active and not is_wireframe else sb_text_muted
        
        svg += f'''
            <rect x="0" y="{y}" width="228" height="40" rx="8" fill="{item_bg}" />
            <rect x="12" y="{y+12}" width="16" height="16" rx="2" fill="none" stroke="{icon_col}" stroke-width="1.5" />
            <text x="40" y="{y+25}" font-size="14" font-weight="600" fill="{txt_col}">{item}</text>
            <polyline points="204,{y+18} 208,{y+22} 212,{y+18}" fill="none" stroke="{sb_text_muted}" stroke-width="1.5" />
        '''
        if is_active:
            y += 40
            sub_items = [
                "ภาพรวมระบบ", "จัดการผู้ใช้งาน", "อนุมัติคำขอ", "ตั้งค่าเมนูและสิทธิ์", 
                "Master Data (หน่วยงาน/ตำแหน่ง)", "รายงาน Audit",
                "จัดการข่าวประชาสัมพันธ์", "ประกาศและ FAQ", "API Data Publishing"
            ]
            for j, sub in enumerate(sub_items):
                is_sub_active = (sub == "จัดการข่าวประชาสัมพันธ์")
                sub_bg = sb_hover if is_sub_active else "none"
                sub_txt = gold if is_sub_active and not is_wireframe else sb_text_muted
                sub_w = "600" if is_sub_active else "400"
                
                svg += f'''
                    <rect x="0" y="{y}" width="228" height="36" rx="8" fill="{sub_bg}" />
                    <circle cx="20" cy="{y+18}" r="3" fill="{sub_txt}" />
                    <text x="40" y="{y+23}" font-size="13" font-weight="{sub_w}" fill="{sub_txt}">{sub}</text>
                '''
                y += 36
        y += 44

    # User profile footer
    svg += f'''
        </g>
        <g id="UserFooter" transform="translate(0, 810)">
            <line x1="0" y1="0" x2="{sidebar_w}" y2="0" stroke="{sb_bdr}" />
            <circle cx="36" cy="45" r="18" fill="{gold if not is_wireframe else t_gray}" />
            <text x="36" y="51" font-size="16" font-weight="700" fill="{text_dark if not is_wireframe else card}" text-anchor="middle">T</text>
            <text x="64" y="40" font-size="14" font-weight="600" fill="{sb_text}">thanthita</text>
            <text x="64" y="56" font-size="12" font-weight="400" fill="{sb_text_muted}">Super Admin</text>
        </g>
    </g>
    '''

    # Topbar
    svg += f'''
    <g id="Topbar" transform="translate({sidebar_w}, 0)">
        <rect x="0" y="0" width="{width - sidebar_w}" height="{topbar_h}" fill="{card}" />
        <line x1="0" y1="{topbar_h}" x2="{width - sidebar_w}" y2="{topbar_h}" stroke="{bdr}" />
        
        <!-- Hamburger -->
        <g transform="translate(16, 16)">
            <rect x="0" y="0" width="32" height="32" rx="6" fill="{off_white if not is_wireframe else 'none'}" stroke="{bdr if is_wireframe else 'none'}" />
            <line x1="8" y1="12" x2="24" y2="12" stroke="{t_dark}" stroke-width="2" />
            <line x1="8" y1="16" x2="24" y2="16" stroke="{t_dark}" stroke-width="2" />
            <line x1="8" y1="20" x2="24" y2="20" stroke="{t_dark}" stroke-width="2" />
        </g>

        <!-- Search -->
        <g id="Search" transform="translate(64, 12)">
            <rect x="0" y="0" width="360" height="40" rx="20" fill="{off_white if not is_wireframe else 'none'}" stroke="{bdr if is_wireframe else 'none'}" />
            <circle cx="20" cy="20" r="6" fill="none" stroke="{t_gray}" stroke-width="1.5" />
            <line x1="24" y1="24" x2="28" y2="28" stroke="{t_gray}" stroke-width="1.5" />
            <text x="40" y="25" font-size="14" fill="{t_gray}">ค้นหาเลขเรื่อง ผู้ถูกร้อง หน่วยงาน...</text>
        </g>

        <!-- Actions -->
        <g id="TopActions" transform="translate(850, 12)">
            <!-- Bell -->
            <path d="M16 14a4 4 0 0 0-4 4v4l-2 2v1h12v-1l-2-2v-4a4 4 0 0 0-4-4z" fill="{t_gray}" />
            <circle cx="26" cy="10" r="4" fill="{danger}" />
            
            <!-- Book -->
            <rect x="46" y="8" width="16" height="20" rx="2" fill="{t_gray}" />
            
            <!-- Phone -->
            <path d="M86 10a4 4 0 0 0-4 4v8a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-8a4 4 0 0 0-4-4z" fill="{t_gray}" />
            
            <!-- Moon -->
            <path d="M126 12a7 7 0 1 0 5 11 5.5 5.5 0 0 1-5-11z" fill="{t_gray}" />
            
            <line x1="160" y1="4" x2="160" y2="36" stroke="{bdr}" />
            
            <!-- User Menu -->
            <rect x="180" y="0" width="140" height="40" rx="20" fill="{off_white if not is_wireframe else 'none'}" stroke="{bdr if is_wireframe else 'none'}" />
            <circle cx="200" cy="20" r="14" fill="{t_dark}" />
            <text x="200" y="25" font-size="12" font-weight="700" fill="{card}" text-anchor="middle">T</text>
            <text x="224" y="19" font-size="13" font-weight="600" fill="{t_dark}">thanthita</text>
            <text x="224" y="31" font-size="10" font-weight="400" fill="{t_gray}">Super Admin</text>
            <polyline points="296,18 300,22 304,18" fill="none" stroke="{t_gray}" stroke-width="1.5" />
        </g>
    </g>
    '''

    main_x = sidebar_w + 32
    main_w = width - sidebar_w - 64

    # Main Content
    svg += f'''
    <g id="MainContent" transform="translate({main_x}, {topbar_h + 24})">
        <!-- Header Banner -->
        <g id="HeaderBanner">
            <rect x="0" y="0" width="{main_w}" height="110" rx="18" fill="url(#headerGrad)" stroke="{bdr if is_wireframe else 'none'}" />
            <circle cx="{main_w - 40}" cy="-40" r="110" fill="{gold}" opacity="0.08" />
            
            <g transform="translate(32, 35)">
                <rect x="0" y="0" width="40" height="40" rx="12" fill="url(#goldGrad)" />
                <rect x="12" y="10" width="16" height="20" fill="none" stroke="{text_dark if not is_wireframe else t_dark}" stroke-width="1.5" />
                <line x1="16" y1="16" x2="24" y2="16" stroke="{text_dark if not is_wireframe else t_dark}" stroke-width="1.5" />
                <line x1="16" y1="20" x2="20" y2="20" stroke="{text_dark if not is_wireframe else t_dark}" stroke-width="1.5" />
                
                <text x="56" y="18" font-size="20" font-weight="800" fill="{header_text}">จัดการข่าวประชาสัมพันธ์</text>
                <text x="56" y="36" font-size="12" fill="{header_text_muted}">Public News Management — Central Support</text>
            </g>
            
            <g transform="translate({main_w - 440}, 28)">
                <rect x="0" y="0" width="80" height="54" rx="12" fill="{'rgba(255,255,255,0.1)' if not is_wireframe else 'none'}" stroke="{'rgba(255,255,255,0.15)' if not is_wireframe else bdr}" />
                <text x="40" y="20" font-size="10" font-weight="700" fill="{header_text_muted}" text-anchor="middle">DRAFT</text>
                <text x="40" y="44" font-size="22" font-weight="900" fill="{draft_c}" text-anchor="middle">0</text>
                
                <rect x="88" y="0" width="90" height="54" rx="12" fill="{'rgba(255,255,255,0.1)' if not is_wireframe else 'none'}" stroke="{'rgba(255,255,255,0.15)' if not is_wireframe else bdr}" />
                <text x="133" y="20" font-size="10" font-weight="700" fill="{header_text_muted}" text-anchor="middle">เผยแพร่แล้ว</text>
                <text x="133" y="44" font-size="22" font-weight="900" fill="{success}" text-anchor="middle">3</text>
                
                <rect x="186" y="9" width="36" height="36" rx="8" fill="{'rgba(255,255,255,0.15)' if not is_wireframe else 'none'}" stroke="{'rgba(255,255,255,0.25)' if not is_wireframe else bdr}" />
                <path d="M198 27a6 6 0 1 1 6-6v2m0-2h-3m3 0v-3" stroke="{header_text}" stroke-width="1.5" fill="none" />
                
                <rect x="230" y="9" width="96" height="36" rx="8" fill="{'rgba(255,255,255,0.15)' if not is_wireframe else 'none'}" stroke="{'rgba(255,255,255,0.25)' if not is_wireframe else bdr}" />
                <text x="278" y="32" font-size="13" font-weight="600" fill="{header_text}" text-anchor="middle">หมวดหมู่ข่าว</text>
                
                <rect x="334" y="9" width="106" height="36" rx="8" fill="{'rgba(255,255,255,0.2)' if not is_wireframe else 'none'}" stroke="{'rgba(255,255,255,0.3)' if not is_wireframe else bdr}" />
                <text x="387" y="32" font-size="13" font-weight="600" fill="{header_text}" text-anchor="middle">+ สร้างข่าวใหม่</text>
            </g>
        </g>
        
        <!-- Two Column Layout -->
        <g id="ContentGrid" transform="translate(0, 134)">
            <!-- Left List Column -->
            <g id="NewsList">
                <rect x="0" y="0" width="{main_w - 440 - 16}" height="600" rx="12" fill="{card}" stroke="{bdr}" {shadow} />
                
                <g id="ListHeader">
                    <rect x="16" y="16" width="60" height="28" rx="8" fill="{t_dark}" />
                    <text x="46" y="34" font-size="12" font-weight="600" fill="{card}" text-anchor="middle">ทั้งหมด</text>
                    
                    <rect x="84" y="16" width="50" height="28" rx="8" fill="none" stroke="{t_dark}" />
                    <text x="109" y="34" font-size="12" font-weight="600" fill="{t_dark}" text-anchor="middle">Draft</text>
                    
                    <rect x="142" y="16" width="76" height="28" rx="8" fill="none" stroke="{t_dark}" />
                    <text x="180" y="34" font-size="12" font-weight="600" fill="{t_dark}" text-anchor="middle">เผยแพร่แล้ว</text>
                    
                    <rect x="226" y="16" width="414" height="28" rx="8" fill="none" stroke="{bdr}" />
                    <text x="236" y="34" font-size="12" fill="{t_gray}">ค้นหาหัวข้อ...</text>
                    
                    <rect x="616" y="16" width="32" height="28" rx="8" fill="none" stroke="{t_dark}" />
                    <circle cx="632" cy="30" r="4" fill="none" stroke="{t_dark}" stroke-width="1.5" />
                    <line x1="635" y1="33" x2="638" y2="36" stroke="{t_dark}" stroke-width="1.5" />
                    
                    <line x1="0" y1="60" x2="{main_w - 440 - 16}" y2="60" stroke="{bdr}" />
                </g>
                
                <!-- List Items -->
                '''
    
    items = [
        {"title": "ประกาศ 001", "date": "30/06/2026", "badge": "ประกาศและคู่มือระบบ"},
        {"title": "คู่มือ 001", "date": "30/06/2026", "badge": "ประกาศและคู่มือระบบ"},
        {"title": "ข่าว 001", "date": "30/06/2026", "badge": "ประกาศ"}
    ]
    
    list_w = main_w - 440 - 16
    y = 60
    for item in items:
        svg += f'''
                <g transform="translate(0, {y})">
                    <rect x="16" y="16" width="120" height="20" rx="4" fill="{bg}" stroke="{bdr}" />
                    <text x="76" y="30" font-size="10" font-weight="600" fill="{t_gray}" text-anchor="middle">{item["badge"]}</text>
                    
                    <rect x="144" y="16" width="60" height="20" rx="4" fill="{success if not is_wireframe else bg}" stroke="{bdr if is_wireframe else 'none'}" />
                    <text x="174" y="30" font-size="10" font-weight="600" fill="{card if not is_wireframe else t_dark}" text-anchor="middle">เผยแพร่แล้ว</text>
                    
                    <text x="16" y="56" font-size="14" font-weight="700" fill="{t_dark}">{item["title"]}</text>
                    <text x="16" y="74" font-size="11" fill="{t_gray}">{item["date"]}</text>
                    
                    <rect x="{list_w - 40}" y="30" width="24" height="24" rx="4" fill="none" stroke="{danger}" />
                    <rect x="{list_w - 32}" y="38" width="8" height="10" fill="none" stroke="{danger}" />
                    <line x1="{list_w - 34}" y1="36" x2="{list_w - 22}" y2="36" stroke="{danger}" />
                    
                    <line x1="0" y1="90" x2="{list_w}" y2="90" stroke="{bdr}" />
                </g>
        '''
        y += 90
            
    svg += f'''
            </g>
            
            <!-- Right Editor Placeholder -->
            <g id="EditorArea" transform="translate({main_w - 420}, 0)">
                <rect x="0" y="0" width="420" height="200" rx="12" fill="{card}" stroke="{bdr}" {shadow} />
                <path d="M190 70h30v30h-30z" fill="none" stroke="{t_gray}" stroke-width="2"/>
                <path d="M220 70l15-15-30-30-15 15 30 30z" fill="none" stroke="{t_gray}" stroke-width="2"/>
                <text x="210" y="130" font-size="14" fill="{t_gray}" text-anchor="middle">เลือกข่าวเพื่อแก้ไข หรือกด "สร้างข่าวใหม่"</text>
            </g>
        </g>
    </g>
</svg>
    '''
    return svg

# Generate both versions
proto = create_svg(False)
wire = create_svg(True)

with open(r'C:\1_Projects\01_Active_Projects\Design-Figma\xml-svg\ecmis_news_prototype_1440.svg', 'w', encoding='utf-8') as f:
    f.write(proto)

with open(r'C:\1_Projects\01_Active_Projects\Design-Figma\xml-svg\ecmis_news_wireframe_1440.svg', 'w', encoding='utf-8') as f:
    f.write(wire)

print("Created 2 files matching actual layout and dark sidebar.")
