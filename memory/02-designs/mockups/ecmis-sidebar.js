(() => {
  const ROLE_KEY = 'ecmis-a4-role';
  const A5_ROLE_KEY = 'ecmis-a5-role';
  const REGION_KEY = 'ecmis-a4-regional-region';
  const COLLAPSED_KEY = 'ecmis-a4-sidebar-collapsed';
  const ROLE_LABELS = {
    admin: 'ธุรการ ศรร.',
    'central-registry-clerk': 'ธุรการสารบรรณกลาง ชั้น 14',
    'case-admin-clerk': 'ธุรการ กบค.',
    officer: 'เจ้าหน้าที่รับเรื่อง',
    'regional-clerk': 'ธุรการประจำเขต',
    'regional-officer': 'เจ้าหน้าที่รับเรื่องประจำเขต',
    'regional-director': 'ผอ.สำนักงาน ป.ป.ท. เขต',
    center: 'ผอ.ศรร.',
    division: 'ผอ.กบค.',
    acting: 'ผู้รักษาราชการแทนตามคำสั่ง',
    anonymous: 'กล่องบัตรสนเท่ห์'
  };
  /* บทบาทของระบบไต่สวน (Activity 5) — แยกจาก A4 เพราะ role เป็นคนละชุด
   * sidebar ต้องรู้จักทั้งสองชุด เพื่อแสดงสิทธิ์ที่ตรงกับระบบที่กำลังเปิดอยู่ */
  const A5_ROLE_LABELS = {
    clerk: 'ธุรการคดี',
    investigator: 'ผู้รับผิดชอบสำนวน (นักสืบ)',
    'group-director': 'ผอ.กลุ่มงาน (สายตรวจ)',
    director: 'ผอ.สำนักงาน ป.ป.ท. เขต/กอง/สำนัก',
    secretary: 'ผู้ช่วย/รอง/เลขาธิการ ป.ป.ท.',
    committee: 'คณะกรรมการ ป.ป.ท.',
    anonymous: 'กล่องบัตรสนเท่ห์'
  };
  const A5_MENU_ITEMS = [
    ['all', 'รายการสำนวนคดี'],
    ['prelim', 'ไต่สวนเบื้องต้น (213)'],
    ['inquiry', 'ไต่สวนชี้มูล (644)'],
    ['review', 'รอความเห็นตามลำดับชั้น'],
    ['committee', 'เรื่องเสนอ คกก.'],
    ['ext', 'รออนุมัติขยายเวลา'],
    ['due', 'ใกล้ครบกำหนด'],
    ['fast', 'ใบด่วน/เร่งด่วน'],
    ['m62', 'คดีรับจาก ป.ป.ช.'],
    ['582', 'ตรวจสอบข้อเท็จจริง 58/2']
  ];
  const ICONS = {
    dashboard: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    inbox: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v16H4z"/><path d="M4 14h4l2 3h4l2-3h4"/></svg>',
    assigned: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 11l2 2 4-4"/><circle cx="12" cy="9" r="5"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/></svg>',
    form: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h14v18H5z"/><path d="M8 7h8M8 11h8M8 15h5"/></svg>',
    review: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5M8 11l2 2 4-4"/></svg>',
    settings: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1A8 8 0 0 0 15 6l-.3-2.6h-4L10.4 6A8 8 0 0 0 9 7.1l-2.4-1-2 3.4 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.4-1A8 8 0 0 0 10.4 18l.3 2.6h4L15 18a8 8 0 0 0 1.5-1.1l2.4 1 2-3.4-2-1.5a7 7 0 0 0 .1-1z"/></svg>',
    anonymous: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11h18M7 11l1-5h8l1 5"/><circle cx="8" cy="15" r="2"/><circle cx="16" cy="15" r="2"/><path d="M10 15h4"/></svg>'
  };

  function currentRole() {
    const role = new URLSearchParams(location.search).get('role') || sessionStorage.getItem(ROLE_KEY) || 'admin';
    return ROLE_LABELS[role] ? role : 'admin';
  }

  /* บทบาทของระบบไต่สวน — อ่าน ecmis-a5-role (ที่ A5 เขียน) ก่อน, fallback map จาก role A4
   * ให้ตรงกับ activeRole() ใน activity5-workspace.js เพื่อ sidebar แสดงสิทธิ์ A5 ถูกต้อง */
  function currentA5Role() {
    const stored = sessionStorage.getItem(A5_ROLE_KEY);
    if (stored && A5_ROLE_LABELS[stored]) return stored;
    const a4 = currentRole();
    const map = { admin: 'clerk', officer: 'investigator', center: 'director', division: 'director', acting: 'secretary' };
    return map[a4] || 'clerk';
  }

  function roleLabel(role) {
    return ROLE_LABELS[role] || role;
  }

  function a5RoleLabel(role) {
    return A5_ROLE_LABELS[role] || role;
  }

  function roleUrl(path, role, extra = {}) {
    const url = new URL(path, location.href);
    url.searchParams.set('role', role);
    if (['regional-clerk', 'regional-officer', 'regional-director'].includes(role)) {
      const region = new URLSearchParams(location.search).get('region') || sessionStorage.getItem(REGION_KEY) || 'เขต 1';
      url.searchParams.set('region', region);
    }
    Object.entries(extra).forEach(([key, value]) => url.searchParams.set(key, value));
    return `${url.pathname.split('/').pop()}${url.search}`;
  }

  function menuFor(role) {
    const list = [{ label: 'รายการเรื่องร้องเรียน', icon: 'dashboard', href: roleUrl('staff-workflow.html', role) }];
    if (role === 'admin') {
      list.push(
        { label: 'เรื่องยังไม่มอบหมาย', icon: 'inbox', href: roleUrl('staff-workflow.html', role, { queue: 'unassigned' }) },
        { label: 'เรื่องมอบหมายแล้ว', icon: 'assigned', href: roleUrl('staff-workflow.html', role, { queue: 'assigned' }) },
        { label: 'บันทึกเรื่องร้องเรียน', icon: 'form', href: roleUrl('staff-intake.html', role) },
        { label: 'จัดการคำแนะนำ', icon: 'settings', command: 'manageSuggestions' },
        { label: 'จัดการผู้ปฏิบัติงานแทน', icon: 'settings', command: 'manageBackups' }
      );
    } else if (role === 'officer' || role === 'regional-clerk' || role === 'regional-officer') {
      list.push({ label: 'บันทึกเรื่องร้องเรียน', icon: 'form', href: roleUrl('staff-intake.html', role) });
    } else if (role === 'anonymous') {
      list[0] = { label: 'กล่องบัตรสนเท่ห์', icon: 'anonymous', href: roleUrl('staff-workflow.html', role) };
    } else {
      list.push({ label: 'เรื่องรอพิจารณา', icon: 'review', href: roleUrl('staff-workflow.html', role) });
    }
    return list;
  }

  /* เมนูระบบไต่สวน (Activity 5) — ลิงก์ทุกกลุ่มกรอง (a5q) ไปที่หน้า view=a5 */
  function a5MenuFor(role) {
    return A5_MENU_ITEMS.map(([q, label]) => ({
      label,
      icon: q === '582' ? 'anonymous' : q === 'all' ? 'dashboard' : 'review',
      href: roleUrl('staff-workflow.html', role, { view: 'a5', a5q: q })
    }));
  }

  function isActive(item) {
    if (!item.href || item.command) return false;
    const current = new URL(location.href);
    const target = new URL(item.href, location.href);
    if (current.pathname.split('/').pop() !== target.pathname.split('/').pop()) return false;
    if (target.searchParams.has('a5q')) return current.searchParams.get('a5q') === target.searchParams.get('a5q');
    if (target.searchParams.has('queue')) return current.searchParams.get('queue') === target.searchParams.get('queue');
    return !current.searchParams.has('queue');
  }

  function menuMarkup(items) {
    return items.map(item => {
      const body = `<span class="ecmis-sidebar-icon">${ICONS[item.icon]}</span><span class="ecmis-sidebar-label">${item.label}</span>`;
      if (item.command) return `<button type="button" class="ecmis-sidebar-command" data-sidebar-command="${item.command}" title="${item.label}">${body}</button>`;
      return `<a class="ecmis-sidebar-link${isActive(item) ? ' active' : ''}" href="${item.href}" title="${item.label}"${isActive(item) ? ' aria-current="page"' : ''}>${body}</a>`;
    }).join('');
  }

  function render() {
    const host = document.querySelector('.a4-workspace, .a4-walkin-shell');
    if (!host) return;
    const isA5 = new URLSearchParams(location.search).get('view') === 'a5';
    const baseRole = currentRole();
    /* ในหน้า A5 ใช้ role ของระบบไต่สวน (ecmis-a5-role) — sidebar แสดงสิทธิ์ตรงกับ
     * dropdown มุมขวาบนของ A5; ในหน้า A4 ใช้ role เดิม */
    const role = isA5 ? currentA5Role() : baseRole;
    const roleName = isA5 ? a5RoleLabel(role) : roleLabel(role);
    let sidebar = document.getElementById('ecmisSidebar');
    if (!sidebar) {
      document.body.classList.add('ecmis-sidebar-enabled');
      document.body.classList.toggle('ecmis-sidebar-collapsed', localStorage.getItem(COLLAPSED_KEY) === 'true');
      sidebar = document.createElement('aside');
      sidebar.id = 'ecmisSidebar';
      sidebar.className = 'ecmis-sidebar';
      sidebar.setAttribute('aria-label', 'เมนูหลัก');
      host.prepend(sidebar);
      const overlay = document.createElement('button');
      overlay.type = 'button';
      overlay.className = 'ecmis-sidebar-overlay';
      overlay.setAttribute('aria-label', 'ปิดเมนู');
      host.prepend(overlay);
      overlay.addEventListener('click', () => document.body.classList.remove('ecmis-sidebar-mobile-open'));
    }
    const canA5 = baseRole !== 'anonymous';
    const switchHtml = canA5 ? `<div class="ecmis-sidebar-switch" role="tablist" aria-label="สลับระบบงาน"><a class="ecmis-sidebar-switch-btn${isA5 ? '' : ' active'}" href="${roleUrl('staff-workflow.html', baseRole)}" role="tab" aria-selected="${String(!isA5)}">รับเรื่องร้องเรียน</a><a class="ecmis-sidebar-switch-btn${isA5 ? ' active' : ''}" href="${roleUrl('staff-workflow.html', baseRole, { view: 'a5' })}" role="tab" aria-selected="${String(isA5)}">กระบวนการไต่สวน</a></div>` : '';
    const menuHtml = isA5
      ? `<div class="ecmis-sidebar-section">เมนูกระบวนการไต่สวน</div>${menuMarkup(a5MenuFor(role))}`
      : `<div class="ecmis-sidebar-section">เมนูตามสิทธิ์</div>${menuMarkup(menuFor(role))}`;
    sidebar.innerHTML = `<div class="ecmis-sidebar-brand"><span class="ecmis-sidebar-logo">ป.ป.ท.</span><span class="ecmis-sidebar-brand-text"><strong>E-CMIS</strong><small>ระบบรับเรื่องร้องเรียน</small></span></div>
    ${switchHtml}
    <nav class="ecmis-sidebar-nav">${menuHtml}</nav><footer class="ecmis-sidebar-footer"><div class="ecmis-sidebar-user"><span class="ecmis-sidebar-avatar">${roleName.slice(0, 2)}</span><span class="ecmis-sidebar-user-copy"><strong>${roleName}</strong><small>สิทธิ์การทำงานปัจจุบัน</small></span></div><button type="button" class="ecmis-sidebar-toggle" aria-label="ย่อหรือขยายเมนู" title="ย่อหรือขยายเมนู"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg></button><button type="button" class="ecmis-sidebar-logout" aria-label="ออกจากระบบ" title="ออกจากระบบ"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg><span class="ecmis-sidebar-label">ออกจากระบบ</span></button></footer>`;
    sidebar.querySelector('.ecmis-sidebar-logout').addEventListener('click', () => {
      sessionStorage.removeItem(ROLE_KEY);
      sessionStorage.removeItem(REGION_KEY);
      localStorage.removeItem(COLLAPSED_KEY);
      sessionStorage.removeItem('ecmis-a4-sidebar-command');
      location.href = 'index.html';
    });
    sidebar.querySelector('.ecmis-sidebar-toggle').addEventListener('click', () => {
      const collapsed = document.body.classList.toggle('ecmis-sidebar-collapsed');
      localStorage.setItem(COLLAPSED_KEY, String(collapsed));
    });
    sidebar.querySelectorAll('[data-sidebar-command]').forEach(button => button.addEventListener('click', () => {
      const target = document.getElementById(button.dataset.sidebarCommand);
      if (target) target.click();
      else {
        sessionStorage.setItem('ecmis-a4-sidebar-command', button.dataset.sidebarCommand);
        location.href = roleUrl('staff-workflow.html', role);
      }
      document.body.classList.remove('ecmis-sidebar-mobile-open');
    }));
    ensureMobileToggle();
    const pendingCommand = sessionStorage.getItem('ecmis-a4-sidebar-command');
    const pendingTarget = pendingCommand && document.getElementById(pendingCommand);
    if (pendingTarget) {
      sessionStorage.removeItem('ecmis-a4-sidebar-command');
      requestAnimationFrame(() => pendingTarget.click());
    }
  }

  function ensureMobileToggle() {
    const topbar = document.querySelector('.ws-topbar-inner');
    if (!topbar || topbar.querySelector('.ecmis-sidebar-mobile-toggle')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ecmis-sidebar-mobile-toggle';
    button.setAttribute('aria-label', 'เปิดเมนูหลัก');
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
    button.addEventListener('click', () => document.body.classList.toggle('ecmis-sidebar-mobile-open'));
    topbar.prepend(button);
  }

  document.addEventListener('DOMContentLoaded', () => {
    render();
    document.addEventListener('change', event => {
      if (event.target.id !== 'wsRole' && event.target.id !== 'wsRegionalRegion' && event.target.id !== 'wsRoleA5') return;
      requestAnimationFrame(render);
    });
    window.addEventListener('popstate', render);
  });
})();
