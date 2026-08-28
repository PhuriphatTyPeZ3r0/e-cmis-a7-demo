(function initializeIntakeStorageMigration(root, factory) {
  const createIntakeStorageMigration = factory
  const api = createIntakeStorageMigration({ storage: root.localStorage })
  root.ECMISIntakeStorageMigration = api
  if (root.document) root.ECMISIntakeStorageMigrationResult = api.run()
  if (typeof module !== 'undefined' && module.exports) module.exports = { createIntakeStorageMigration }
})(typeof globalThis === 'undefined' ? window : globalThis, function createIntakeStorageMigration(environment = {}) {
  const storage = environment.storage
  const now = typeof environment.now === 'function' ? environment.now : () => new Date().toISOString()
  const markerKey = 'ecmis-intake-production-migration-v1'
  const workspaceKey = 'ecmis-a4-workspace-v3'
  const disposablePrefixes = ['ecmis-a4-workspace-v3-invalid-']
  const waitingStatuses = new Set([
    'REPORT_213_SENT_TO_BOARD',
    'REPORT_213_SENT_TO_A7',
    'REPORT_213_BOARD_PENDING'
  ])

  function copy(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value))
  }

  function parseObject(raw) {
    if (!raw) return { ok: true, value: {} }
    try {
      const value = JSON.parse(raw)
      return value && typeof value === 'object' && !Array.isArray(value)
        ? { ok: true, value }
        : { ok: false, errorCode: 'INVALID_ACTIVE_STORE' }
    } catch {
      return { ok: false, errorCode: 'INVALID_ACTIVE_STORE' }
    }
  }

  function normalizeCase(state) {
    if (!state || typeof state !== 'object' || Array.isArray(state)) return false
    const lifecycle = state.a5Report213Lifecycle
    if (!lifecycle || !waitingStatuses.has(String(lifecycle.status || ''))) return false
    lifecycle.status = 'REPORT_213_WAIT_RESULT'
    state.workflow = {
      ...(state.workflow || {}),
      stage: 'a7-213',
      owner: 'case-clerk',
      status: 'รอผลมติคณะกรรมการ ป.ป.ท.',
      downstreamStatus: 'REPORT_213_WAIT_RESULT'
    }
    return true
  }

  function disposableKeys() {
    const keys = []
    for (let index = 0; index < Number(storage?.length || 0); index += 1) {
      const key = storage.key(index)
      if (disposablePrefixes.some(prefix => String(key || '').startsWith(prefix))) keys.push(key)
    }
    return keys
  }

  function quotaFailure(error) {
    return {
      ok: false,
      errorCode: 'STORAGE_QUOTA_EXCEEDED',
      error,
      message: 'พื้นที่จัดเก็บข้อมูลของ Browser เต็ม กรุณาลบไฟล์หรือ cache ที่ไม่ใช่ข้อมูลสำนวนแล้วลองใหม่'
    }
  }

  function run() {
    if (!storage?.getItem || !storage?.setItem) return { ok: true, changed: false, mode: 'unavailable' }
    if (storage.getItem(markerKey)) return { ok: true, changed: false, marker: storage.getItem(markerKey) }
    const original = storage.getItem(workspaceKey)
    const parsed = parseObject(original)
    if (!parsed.ok) return { ok: false, errorCode: parsed.errorCode, message: 'ข้อมูลสำนวนเดิมอ่านไม่ได้ ระบบยังไม่ได้แก้ไขหรือล้างข้อมูล' }
    const workspace = copy(parsed.value)
    let normalizedCases = 0
    Object.values(workspace).forEach(state => {
      if (normalizeCase(state)) normalizedCases += 1
    })
    const transformed = JSON.stringify(workspace)
    const changed = transformed !== (original || '{}')
    try {
      disposableKeys().forEach(key => storage.removeItem(key))
      if (changed) storage.setItem(workspaceKey, transformed)
      const marker = JSON.stringify({ version: 1, completedAt: now(), normalizedCases })
      storage.setItem(markerKey, marker)
      return { ok: true, changed, normalizedCases, marker }
    } catch (error) {
      if (error?.name === 'QuotaExceededError') return quotaFailure(error)
      return { ok: false, errorCode: 'STORAGE_MIGRATION_FAILED', error, message: String(error?.message || error) }
    }
  }

  return Object.freeze({ run })
})
