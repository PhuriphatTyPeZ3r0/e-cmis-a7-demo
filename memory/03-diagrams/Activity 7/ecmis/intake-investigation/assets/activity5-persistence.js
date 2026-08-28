(function initializeActivity5Persistence(root) {
  "use strict";

  const META_SUFFIX = "-persistence-meta-v1";
  const JOURNAL_SUFFIX = "-persistence-journal-v1";
  const BACKUP_SUFFIX = "-last-good-v1";
  const CHECKPOINT_SUFFIX = "-checkpoints-v1";
  const DRAFT_SUFFIX = "-drafts-v1";
  const CURRENT_CASE_KEY = "ecmis-a5-current-case";
  const MAX_CHECKPOINTS = 3;
  const draftTimers = new Map();

  const clone = value => JSON.parse(JSON.stringify(value));
  const object = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const parseObject = raw => {
    if (typeof raw !== "string" || !raw.trim()) return {};
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  };
  const keys = key => ({
    meta: `${key}${META_SUFFIX}`,
    journal: `${key}${JOURNAL_SUFFIX}`,
    backup: `${key}${BACKUP_SUFFIX}`,
    checkpoints: `${key}${CHECKPOINT_SUFFIX}`,
    drafts: `${key}${DRAFT_SUFFIX}`
  });
  const readMeta = (storage, key) => {
    const parsed = parseObject(storage.getItem(keys(key).meta));
    return {
      revision: Number.isInteger(parsed?.revision) ? parsed.revision : 0,
      caseRevisions: object(parsed?.caseRevisions)
    };
  };
  const storageError = (code, message, details = {}) => Object.assign(new Error(message), { name: code, code, ...details });

  function recoverPending(storage, key) {
    const storageKeys = keys(key);
    const journal = parseObject(storage.getItem(storageKeys.journal));
    if (!journal || journal.status !== "PENDING") return "";
    if (journal.mode === "CASE" && journal.caseId && journal.state) {
      const current = parseObject(storage.getItem(key)) || parseObject(storage.getItem(storageKeys.backup)) || {};
      current[journal.caseId] = clone(journal.state);
      storage.setItem(key, JSON.stringify(current));
      if (journal.nextMeta) storage.setItem(storageKeys.meta, JSON.stringify(journal.nextMeta));
      storage.removeItem(storageKeys.journal);
      return "JOURNAL";
    }
    if (parseObject(journal.nextRaw)) {
      storage.setItem(key, journal.nextRaw);
      if (journal.nextMeta) storage.setItem(storageKeys.meta, JSON.stringify(journal.nextMeta));
      storage.removeItem(storageKeys.journal);
      return "JOURNAL";
    }
    const backup = storage.getItem(storageKeys.backup);
    if (parseObject(backup)) storage.setItem(key, backup);
    storage.removeItem(storageKeys.journal);
    return "BACKUP";
  }

  function recoverCheckpoints(storage, key) {
    const registry = parseObject(storage.getItem(keys(key).checkpoints));
    const cases = object(registry?.cases);
    const store = {};
    Object.entries(cases).forEach(([caseId, rows]) => {
      const latest = Array.isArray(rows) ? rows.at(-1) : null;
      if (latest?.state && typeof latest.state === "object") store[caseId] = clone(latest.state);
    });
    return store;
  }

  function readStore(storage, key) {
    if (!storage || !key) throw storageError("A5_STORAGE_CONFIGURATION_ERROR", "storage และ key ต้องมีค่า");
    let recoveredFrom = recoverPending(storage, key);
    let store = parseObject(storage.getItem(key));
    if (!store) {
      const backup = parseObject(storage.getItem(keys(key).backup));
      if (backup) {
        store = backup;
        storage.setItem(key, JSON.stringify(store));
        recoveredFrom = "BACKUP";
      } else {
        store = recoverCheckpoints(storage, key);
        if (Object.keys(store).length) {
          storage.setItem(key, JSON.stringify(store));
          recoveredFrom = "CHECKPOINT";
        } else {
          store = {};
          recoveredFrom = "EMPTY";
        }
      }
    }
    return { ok: true, store: clone(store), meta: clone(readMeta(storage, key)), recoveredFrom };
  }

  function writeCheckpoint(storage, key, caseId, state, revision, at) {
    const checkpointKey = keys(key).checkpoints;
    const registry = parseObject(storage.getItem(checkpointKey)) || { schemaVersion: 1, cases: {} };
    registry.cases = object(registry.cases);
    const rows = Array.isArray(registry.cases[caseId]) ? registry.cases[caseId] : [];
    rows.push({ revision, at, state: clone(state) });
    registry.cases[caseId] = rows.slice(-MAX_CHECKPOINTS);
    try { storage.setItem(checkpointKey, JSON.stringify(registry)); } catch {}
  }

  function commitRaw(storage, key, nextStore, nextMeta, checkpoint = null) {
    const storageKeys = keys(key);
    const previousRaw = storage.getItem(key);
    const previousValidRaw = parseObject(previousRaw) ? previousRaw : "{}";
    const nextRaw = JSON.stringify(nextStore);
    const journal = { status: "PENDING", createdAt: new Date().toISOString(), nextRaw, nextMeta };
    try {
      storage.setItem(storageKeys.backup, previousValidRaw);
      storage.setItem(storageKeys.journal, JSON.stringify(journal));
      storage.setItem(key, nextRaw);
      if (storage.getItem(key) !== nextRaw) throw storageError("A5_STORAGE_VERIFY_FAILED", "ตรวจสอบข้อมูลหลังบันทึกไม่ผ่าน");
      storage.setItem(storageKeys.meta, JSON.stringify(nextMeta));
      if (checkpoint) writeCheckpoint(storage, key, checkpoint.caseId, checkpoint.state, checkpoint.revision, journal.createdAt);
      storage.removeItem(storageKeys.journal);
      return { ok: true, store: clone(nextStore), meta: clone(nextMeta) };
    } catch (error) {
      try { storage.setItem(key, previousValidRaw); } catch {}
      try { storage.removeItem(storageKeys.journal); } catch {}
      throw error;
    }
  }

  function commitCase(storage, key, caseId, state, options = {}) {
    const current = readStore(storage, key);
    const currentRevision = Number(current.meta.caseRevisions[caseId] || 0);
    if (options.expectedRevision !== undefined && Number(options.expectedRevision) !== currentRevision) {
      throw storageError("A5_STORAGE_VERSION_CONFLICT", "ข้อมูลสำนวนถูกแก้จาก tab อื่นแล้ว", { caseId, expectedRevision: Number(options.expectedRevision), actualRevision: currentRevision });
    }
    const nextRevision = currentRevision + 1;
    const nextState = clone(state);
    nextState.a5PersistenceRevision = nextRevision;
    const nextStore = { ...current.store, [caseId]: nextState };
    const nextMeta = {
      revision: current.meta.revision + 1,
      caseRevisions: { ...current.meta.caseRevisions, [caseId]: nextRevision }
    };
    const storageKeys = keys(key);
    const previousRaw = storage.getItem(key);
    const nextRaw = JSON.stringify(nextStore);
    const journal = { status: "PENDING", mode: "CASE", caseId, state: nextState, nextMeta, createdAt: new Date().toISOString() };
    try {
      storage.setItem(storageKeys.journal, JSON.stringify(journal));
      storage.setItem(key, nextRaw);
      if (storage.getItem(key) !== nextRaw) throw storageError("A5_STORAGE_VERIFY_FAILED", "ตรวจสอบข้อมูลหลังบันทึกไม่ผ่าน");
      storage.setItem(storageKeys.meta, JSON.stringify(nextMeta));
      writeCheckpoint(storage, key, caseId, nextState, nextRevision, journal.createdAt);
      storage.removeItem(storageKeys.journal);
      return { ok: true, store: clone(nextStore), meta: clone(nextMeta), state: clone(nextState), revision: nextRevision };
    } catch (error) {
      try {
        if (previousRaw === null) storage.removeItem(key);
        else storage.setItem(key, previousRaw);
      } catch {}
      try { storage.removeItem(storageKeys.journal); } catch {}
      throw error;
    }
  }

  function commitStore(storage, key, store) {
    const current = readStore(storage, key);
    const nextStore = clone(object(store));
    const caseRevisions = { ...current.meta.caseRevisions };
    Object.keys(nextStore).forEach(caseId => {
      const currentState = current.store[caseId] ? clone(current.store[caseId]) : null;
      const nextState = clone(nextStore[caseId]);
      if (currentState) delete currentState.a5PersistenceRevision;
      delete nextState.a5PersistenceRevision;
      const changed = JSON.stringify(currentState) !== JSON.stringify(nextState);
      const revision = Number(caseRevisions[caseId] || 0) + (changed ? 1 : 0);
      caseRevisions[caseId] = revision;
      nextStore[caseId].a5PersistenceRevision = revision;
    });
    const nextMeta = { revision: current.meta.revision + 1, caseRevisions };
    return commitRaw(storage, key, nextStore, nextMeta);
  }

  function readDraft(storage, key, caseId, scope) {
    const registry = parseObject(storage.getItem(keys(key).drafts));
    return clone(object(registry?.entries)[`${caseId}:${scope}`] || null);
  }

  function saveDraft(storage, key, caseId, scope, payload) {
    const draftKey = keys(key).drafts;
    const registry = parseObject(storage.getItem(draftKey)) || { schemaVersion: 1, entries: {} };
    registry.entries = object(registry.entries);
    registry.entries[`${caseId}:${scope}`] = { updatedAt: new Date().toISOString(), payload: clone(payload) };
    storage.setItem(draftKey, JSON.stringify(registry));
    return clone(registry.entries[`${caseId}:${scope}`]);
  }

  function clearDraft(storage, key, caseId, scope = "") {
    const draftKey = keys(key).drafts;
    const registry = parseObject(storage.getItem(draftKey));
    const cancelPending = () => {
      for (const [timerKey, entry] of draftTimers.entries()) {
        if (timerKey.startsWith(`${key}:${caseId}:`) && (!scope || timerKey === `${key}:${caseId}:${scope}`)) entry.cancel();
      }
    };
    if (!registry) {
      cancelPending();
      return 0;
    }
    registry.entries = object(registry.entries);
    let removed = 0;
    Object.keys(registry.entries).forEach(entryKey => {
      if (entryKey === `${caseId}:${scope}` || (!scope && entryKey.startsWith(`${caseId}:`))) {
        delete registry.entries[entryKey];
        removed += 1;
      }
    });
    storage.setItem(draftKey, JSON.stringify(registry));
    cancelPending();
    return removed;
  }

  function scheduleDraftAutosave(storage, key, caseId, scope, readPayload, options = {}) {
    const timerKey = `${key}:${caseId}:${scope}`;
    draftTimers.get(timerKey)?.cancel();
    options.onStatus?.("SAVING");
    let cancelled = false;
    const flush = () => {
      if (cancelled) return null;
      clearTimeout(draftTimers.get(timerKey)?.timer);
      draftTimers.delete(timerKey);
      try {
        const saved = saveDraft(storage, key, caseId, scope, readPayload());
        options.onStatus?.("SAVED", saved);
        return saved;
      } catch (error) {
        options.onStatus?.("FAILED", error);
        throw error;
      }
    };
    const cancel = () => {
      cancelled = true;
      clearTimeout(draftTimers.get(timerKey)?.timer);
      draftTimers.delete(timerKey);
    };
    const timer = setTimeout(() => { try { flush(); } catch {} }, Number(options.delay || 800));
    draftTimers.set(timerKey, { timer, cancel });
    return { flush, cancel };
  }

  function rememberCurrentCase(storage, caseId) {
    if (!caseId) storage.removeItem(CURRENT_CASE_KEY);
    else storage.setItem(CURRENT_CASE_KEY, String(caseId));
  }

  function restoreCurrentCase(storage) {
    return String(storage.getItem(CURRENT_CASE_KEY) || "").trim();
  }

  const api = Object.freeze({
    readStore, commitCase, commitStore, readDraft, saveDraft, clearDraft,
    scheduleDraftAutosave, rememberCurrentCase, restoreCurrentCase,
    CURRENT_CASE_KEY, MAX_CHECKPOINTS
  });
  root.ECMISActivity5Persistence = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
