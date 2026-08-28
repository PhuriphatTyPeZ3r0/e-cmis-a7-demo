(function initializeSeedForceRefresh(root) {
  const KEYS = Object.freeze({
    workspace: 'ecmis-a4-workspace-v3',
    activity5Seeds: 'ecmis-a5-seed-workspace-v1',
    activity5SeedVersion: 'ecmis-a5-seed-version',
    activity5Handoffs: 'ecmis-a4-a5-handoffs-v1',
    activity7Handoffs: 'ecmis-a4-a7-handoffs-v1'
  });
  const SHORTCUT_WINDOW_MS = null;
  const REFRESH_RECEIPT_KEY = 'ecmis-seed-force-refresh-receipt';

  function parseObject(value) {
    try {
      const parsed = JSON.parse(value || '');
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  function seedIds() {
    return new Set(Array.isArray(root.ECMISActivity4SeedRegistry?.ids) ? root.ECMISActivity4SeedRegistry.ids : []);
  }

  function replaceWorkspaceSeeds(storage, ids) {
    const raw = storage.getItem(KEYS.workspace);
    const store = parseObject(raw) || {};
    let removed = 0;
    Object.keys(store).forEach(id => {
      const sourceReference = String(store[id]?.caseData?.sourceReference || store[id]?.sourceReference || '');
      if (!ids.has(id) && !ids.has(sourceReference)) return;
      delete store[id];
      removed += 1;
    });
    const freshSeeds = root.ECMISActivity4SeedRegistry?.createStates?.() || {};
    let restored = 0;
    Object.entries(freshSeeds).forEach(([id, state]) => {
      if (!ids.has(id)) return;
      store[id] = state;
      restored += 1;
    });
    storage.setItem(KEYS.workspace, JSON.stringify(store));
    return { removed, restored };
  }

  function pruneHandoffs(storage, key, ids) {
    const envelope = parseObject(storage.getItem(key));
    if (!envelope || !envelope.records || typeof envelope.records !== 'object') return 0;
    let removed = 0;
    Object.keys(envelope.records).forEach(id => {
      const record = envelope.records[id];
      if (!ids.has(id) && !ids.has(String(record?.sourceReference || ''))) return;
      delete envelope.records[id];
      removed += 1;
    });
    if (removed) storage.setItem(key, JSON.stringify(envelope));
    return removed;
  }

  function refresh(storage = root.localStorage) {
    if (!storage) return { ok: false, errorCode: 'STORAGE_UNAVAILABLE' };
    try {
      const ids = seedIds();
      const activity4 = replaceWorkspaceSeeds(storage, ids);
      const removedActivity5Handoffs = pruneHandoffs(storage, KEYS.activity5Handoffs, ids);
      const removedActivity7Handoffs = pruneHandoffs(storage, KEYS.activity7Handoffs, ids);
      storage.removeItem(KEYS.activity5Seeds);
      storage.removeItem(KEYS.activity5SeedVersion);
      return {
        ok: true,
        removedActivity4Seeds: activity4.removed,
        restoredActivity4Seeds: activity4.restored,
        removedActivity5Handoffs,
        removedActivity7Handoffs
      };
    } catch (error) {
      return { ok: false, errorCode: 'SEED_REFRESH_FAILED', error };
    }
  }

  function isEditableTarget(target) {
    const tagName = String(target?.tagName || '').toLowerCase();
    return ['input', 'textarea', 'select'].includes(tagName) || Boolean(target?.isContentEditable);
  }

  function createShortcutHandler({
    refreshAction = () => refresh(),
    reloadAction = () => root.location?.reload(),
    markAction = result => {
      try { root.sessionStorage?.setItem(REFRESH_RECEIPT_KEY, JSON.stringify(result)); } catch {}
    }
  } = {}) {
    let presses = 0;
    return event => {
      if (event?.repeat || event?.ctrlKey || event?.metaKey || event?.altKey) return;
      const isPhysicalR = event?.code === 'KeyR';
      const isLetterR = ['r', 'พ'].includes(String(event?.key || '').toLowerCase());
      if (!isPhysicalR && !isLetterR) {
        presses = 0;
        return;
      }
      presses += 1;
      if (presses < 3) return;
      presses = 0;
      const result = refreshAction();
      if (result?.ok) {
        markAction(result);
        reloadAction();
      }
    };
  }

  function showRefreshReceipt() {
    let result = null;
    try {
      result = parseObject(root.sessionStorage?.getItem(REFRESH_RECEIPT_KEY));
      root.sessionStorage?.removeItem(REFRESH_RECEIPT_KEY);
    } catch {}
    if (!result?.ok) return false;
    const restored = Number(result.restoredActivity4Seeds) || 0;
    if (root.Swal?.fire) {
      root.Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'รีเฟรช Seed แล้ว',
        text: `คืนข้อมูลตั้งต้นระบบรับเรื่อง ${restored} รายการ และระบบไต่สวนแล้ว`,
        showConfirmButton: false,
        timer: 3500,
        timerProgressBar: true
      });
    }
    return true;
  }

  const api = Object.freeze({ KEYS, SHORTCUT_WINDOW_MS, REFRESH_RECEIPT_KEY, refresh, createShortcutHandler, isEditableTarget, showRefreshReceipt });
  root.ECMISSeedForceRefresh = api;
  if (root.document?.addEventListener) {
    root.document.addEventListener('keydown', createShortcutHandler(), { capture: true });
    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', showRefreshReceipt, { once: true });
    else showRefreshReceipt();
  }
})(typeof globalThis === 'undefined' ? window : globalThis);
