

(function (global) {
'use strict';

const ECMIS = global.ECMIS;
if (!ECMIS) { throw new Error('ecmis-model.js must load after ecmis-app.js'); }

const MODEL_VERSION = '2026-08-14-model-v1';

// ---------- StatusStore: reference lookup over the existing STATUS map ----------
// Labels/scope/owner already live in ECMIS.STATUS (ecmis-app.js) — this just gives
// Controllers a named lookup API instead of reaching into ECMIS.STATUS[code] directly.
// Transition guards stay in ECMIS.TRANSITIONS/canTransition — business rules, not data.
const StatusStore = {
  get(code) { return ECMIS.STATUS[code] || null; },
  label(code) { const s = ECMIS.STATUS[code]; return s ? s.label : code; },
  all() { return Object.keys(ECMIS.STATUS).map(code => Object.assign({ code }, ECMIS.STATUS[code])); }
};

// ---------- CaseStore: explicit-method wrapper over the existing CASES array ----------
// Same underlying data/shape as today — gives Controllers ECMIS.Model.CaseStore.update(id, patch)
// instead of `kase.foo = x; ECMIS.saveCases()` scattered across pages.
const CaseStore = {
  find(id) { return ECMIS.CASES.find(c => c.id === id) || null; },
  list(filterFn) { return filterFn ? ECMIS.CASES.filter(filterFn) : ECMIS.CASES.slice(); },
  update(id, patch) {
    const kase = CaseStore.find(id);
    if (!kase) return null;
    Object.assign(kase, patch);
    ECMIS.saveCases();
    return kase;
  }
};

// ---------- sessionStorage-backed append-only record store (Round / Signature) ----------
function makeRecordStore(storageKey) {
  let records = [];
  if (typeof sessionStorage !== 'undefined') {
    const savedVersion = sessionStorage.getItem(storageKey + '_version');
    const saved = sessionStorage.getItem(storageKey);
    if (saved && savedVersion === MODEL_VERSION) {
      try { records = JSON.parse(saved); }
      catch (e) { console.error('Failed to load ' + storageKey + ':', e); records = []; }
    } else if (saved) {
      sessionStorage.removeItem(storageKey);
      sessionStorage.removeItem(storageKey + '_version');
    }
  }
  let seq = records.reduce((max, r) => Math.max(max, r.id || 0), 0);

  function persist() {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(storageKey, JSON.stringify(records));
      sessionStorage.setItem(storageKey + '_version', MODEL_VERSION);
    }
  }

  return {
    list(caseId) { return caseId ? records.filter(r => r.caseId === caseId) : records.slice(); },
    latest(caseId, phase) {
      const rows = records.filter(r => r.caseId === caseId && (!phase || r.phase === phase));
      return rows.length ? rows[rows.length - 1] : null;
    },
    create(record) {
      const row = Object.assign({ id: ++seq, createdAt: new Date().toISOString() }, record);
      records.push(row);
      persist();
      return row;
    }
  };
}

// RoundStore record shape: { id, caseId, phase:'7.1'|'7.2', roundNumber, scopeCode, reasonText, triggeredBy, createdAt }
// Used for the ม.24 วรรคท้าย reverse-to-investigation loops (Page 1 "มติอื่นๆ", Page 2 "ไต่สวนเพิ่มเติม").
const RoundStore = makeRecordStore('ecmis_rounds');

// SignatureStore record shape: { id, caseId, docType, signerRole, signerName, method, signedAt, createdAt }
// Mock audit record only — method is 'hand'|'cert' from signDialog(), not a real e-signature/PKI integration.
const SignatureStore = makeRecordStore('ecmis_signatures');

ECMIS.Model = { CaseStore, StatusStore, RoundStore, SignatureStore };

})(window);
