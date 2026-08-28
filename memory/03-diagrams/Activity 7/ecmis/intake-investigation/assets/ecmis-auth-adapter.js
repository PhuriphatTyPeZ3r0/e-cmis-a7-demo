(function initializeIntakeAuthAdapter(root, factory) {
  const createIntakeAuthAdapter = factory
  const api = createIntakeAuthAdapter({
    auth: root.ECMISAuth,
    location: root.location,
    sessionStorage: root.sessionStorage,
    redirect: value => root.location?.replace?.(value)
  })
  root.ECMISIntakeAuth = api
  if (root.document) api.guard()
  if (typeof module !== 'undefined' && module.exports) module.exports = { createIntakeAuthAdapter }
})(typeof globalThis === 'undefined' ? window : globalThis, function createIntakeAuthAdapter(environment = {}) {
  const auth = environment.auth || null
  const location = environment.location || { pathname: '', search: '' }
  const storage = environment.sessionStorage || null
  const redirect = typeof environment.redirect === 'function' ? environment.redirect : () => {}
  const params = new URLSearchParams(String(location.search || ''))
  const activity = 'intake-investigation'
  const A4_ROLES = new Set(['central-registry-clerk', 'case-admin-clerk', 'admin', 'officer', 'regional-clerk', 'regional-officer', 'regional-director', 'center', 'division', 'acting', 'anonymous'])
  const A5_ROLES = new Set(['case-clerk', 'gbk-clerk', 'investigator', 'group-director', 'unit-director', 'assistant-secretary', 'deputy-secretary', 'secretary', 'inquiry-panel', 'inquiry-subcommittee', 'central-registry'])
  const WRITE_ACTIONS = new Set(['write', 'create', 'update', 'delete', 'sign', 'submit', 'approve', 'assign', 'dispatch'])

  function storageValue(key) {
    try {
      if (typeof storage?.getItem === 'function') return storage.getItem(key)
      if (typeof storage?.get === 'function') return storage.get(key)
    } catch {}
    return null
  }

  function mode() {
    if (params.get('demo') === '1') return 'demo'
    if (auth && typeof auth.getAuth === 'function') return 'aggregate'
    return 'standalone'
  }

  function rawIdentity() {
    if (mode() !== 'aggregate') return null
    return auth.getAuth() || null
  }

  function currentIdentity() {
    const source = rawIdentity()
    if (!source) return null
    return {
      username: String(source.username || ''),
      officerId: String(source.officerId || source.username || ''),
      name: String(source.displayName || source.name || source.username || ''),
      title: String(source.title || ''),
      org: String(source.org || ''),
      act: String(source.act || ''),
      roleId: String(source.roleId || ''),
      capabilities: [...new Set([...(Array.isArray(source.capabilities) ? source.capabilities : []), ...(Array.isArray(source.caps) ? source.caps : [])].map(String))]
    }
  }

  function roleFromCapability(identity, surface) {
    const allowed = surface === 'a5' ? A5_ROLES : A4_ROLES
    for (const capability of identity?.capabilities || []) {
      const match = capability.match(new RegExp(`^intake:${surface}:([a-z0-9-]+)$`, 'i'))
      if (match && allowed.has(match[1])) return match[1]
    }
    return null
  }

  function roleFromTitle(identity, surface) {
    const title = String(identity?.title || '').replace(/\s+/g, ' ').trim()
    if (!title) return null
    const rules = surface === 'a5' ? [
      [/สารบรรณกลาง/, 'central-registry'],
      [/ธุรการคดี.*(?:เขต|กองปราบ)/, 'case-clerk'],
      [/(?:กบค\.).*(?:รับคืน|จัดเส้นทาง)|(?:รับคืน|จัดเส้นทาง).*กบค\./, 'gbk-clerk'],
      [/คณะอนุกรรมการไต่สวน/, 'inquiry-subcommittee'],
      [/คณะพนักงานไต่สวน/, 'inquiry-panel'],
      [/ผู้รับผิดชอบสำนวน|นักสืบ|พนักงาน ป\.ป\.ท\./, 'investigator'],
      [/ผอ\.กลุ่ม|ผู้อำนวยการกลุ่ม/, 'group-director'],
      [/ผอ\.(?:สำนักงาน ป\.ป\.ท\. )?เขต|ผอ\.กองปราบ|ผอ\.หน่วยงาน|ผู้อำนวยการ.*(?:เขต|กองปราบ|หน่วยงาน)/, 'unit-director'],
      [/ผู้ช่วยเลขาธิการ/, 'assistant-secretary'],
      [/รองเลขาธิการ/, 'deputy-secretary'],
      [/เลขาธิการ/, 'secretary']
    ] : [
      [/สารบรรณกลาง/, 'central-registry-clerk'],
      [/ธุรการ.*กบค\./, 'case-admin-clerk'],
      [/ธุรการ.*ศรร\./, 'admin'],
      [/เจ้าหน้าที่รับเรื่องประจำเขต/, 'regional-officer'],
      [/เจ้าหน้าที่รับเรื่อง/, 'officer'],
      [/ธุรการ.*เขต/, 'regional-clerk'],
      [/ผอ\.(?:สำนักงาน ป\.ป\.ท\. )?เขต|ผู้อำนวยการ.*เขต/, 'regional-director'],
      [/ผู้อำนวยการศูนย์รับเรื่องร้องเรียน/, 'center'],
      [/ผู้อำนวยการกองบริหารคดี/, 'division'],
      [/รักษาราชการแทน|ปฏิบัติราชการแทน/, 'acting']
    ]
    return rules.find(([pattern]) => pattern.test(title))?.[1] || null
  }

  function aggregateRole(surface) {
    const identity = currentIdentity()
    if (!identity || auth.canSee?.(activity) !== true) return null
    const capabilityRole = roleFromCapability(identity, surface)
    if (capabilityRole) return capabilityRole
    const allowed = surface === 'a5' ? A5_ROLES : A4_ROLES
    if (allowed.has(identity.roleId)) return identity.roleId
    if (surface === 'a5' && identity.roleId === 'director') return roleFromTitle(identity, surface)
    return roleFromTitle(identity, surface)
  }

  function localRole(surface) {
    const allowed = surface === 'a5' ? A5_ROLES : A4_ROLES
    const fromUrl = params.get('role')
    if (allowed.has(fromUrl)) return fromUrl
    const stored = storageValue(surface === 'a5' ? 'ecmis-a5-role' : 'ecmis-a4-role')
    if (allowed.has(stored)) return stored
    return surface === 'a5' ? 'case-clerk' : 'admin'
  }

  function isWorkspaceOperator() {
    return mode() === 'aggregate' && rawIdentity()?.username === 'intake.officer'
  }

  function currentRole(surface = params.get('view') === 'a5' ? 'a5' : 'a4') {
    if (isWorkspaceOperator()) return localRole(surface)
    return mode() === 'aggregate' ? aggregateRole(surface) : localRole(surface)
  }

  function isReadOnly() {
    return mode() === 'aggregate' && auth.isReadOnly?.() === true
  }

  function can(action = 'read', context = {}) {
    if (mode() !== 'aggregate') return true
    if (!rawIdentity() || auth.canSee?.(activity) !== true) return false
    const surface = context.surface === 'a5' ? 'a5' : 'a4'
    if (!currentRole(surface)) return false
    return !(isReadOnly() && WRITE_ACTIONS.has(String(action).toLowerCase()))
  }

  function showRoleSelector() {
    return mode() !== 'aggregate' || isWorkspaceOperator()
  }

  function guard() {
    if (mode() !== 'aggregate') return true
    if (!rawIdentity()) {
      const rootPath = String(auth.root || '../')
      const next = `${location.pathname || ''}${location.search || ''}`
      redirect(`${rootPath}login.html?next=${encodeURIComponent(next)}`)
      return false
    }
    return auth.canSee?.(activity) === true
  }

  return Object.freeze({ mode, currentIdentity, currentRole, can, isReadOnly, showRoleSelector, guard })
})
