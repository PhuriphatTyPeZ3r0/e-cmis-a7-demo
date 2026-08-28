(function initializeActivity4OutgoingRegisters(root) {
  "use strict";

  const LEDGER_STORAGE_KEY = "ecmis-a4-outgoing-ledger-v1";
  const LEDGER_BACKUP_KEY = "ecmis-a4-outgoing-ledger-v1-backup";
  const CATALOG_STORAGE_KEY = "ecmis-a4-outgoing-register-catalog-v1";
  const LEDGER_VERSION = 1;
  const CENTRAL_REGISTER_IDS = Object.freeze(["srr", "kbk"]);
  const REGISTER_DEFINITIONS = Object.freeze({
    srr: Object.freeze({
      id: "srr",
      label: "ทะเบียนเลขหนังสือขาออก ศรร.",
      prefix: "ปป 0004.2",
      sequenceWidth: 4,
      scope: "central"
    }),
    kbk: Object.freeze({
      id: "kbk",
      label: "ทะเบียนเลขหนังสือขาออก กบค.",
      prefix: "ปป 0004",
      sequenceWidth: 4,
      scope: "central"
    })
  });

  const FIXED_DOCUMENT_REGISTERS = Object.freeze({
    "1-05": "kbk",
    "1-07": "kbk",
    "1-09": "kbk",
    "1-13": "kbk"
  });
  const SELECT_DOCUMENT_IDS = new Set(["1-03", "1-04", "1-06", "1-08", "1-10", "1-11", "1-14", "58/2-03", "58/2-04", "58/2-05"]);
  const CUSTOM_REGISTER_DOCUMENT_IDS = new Set(["1-03", "1-04", "1-06"]);
  const ACTOR_ROLES = new Set(["officer", "regional-officer"]);
  const ISSUE_STAGES = new Set(["officer-dispatch", "nacc-dispatch"]);

  function asObject(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  }

  function text(value) {
    return String(value == null ? "" : value).trim();
  }

  function clone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function emptyLedger() {
    return {
      version: LEDGER_VERSION,
      counters: {},
      issuancesByIdempotencyKey: {},
      activeSlotIndex: {}
    };
  }

  function normalizeLedger(value) {
    const source = asObject(value);
    return {
      version: LEDGER_VERSION,
      counters: { ...asObject(source.counters) },
      issuancesByIdempotencyKey: { ...asObject(source.issuancesByIdempotencyKey) },
      activeSlotIndex: { ...asObject(source.activeSlotIndex) }
    };
  }

  function normalizedCatalogValue(value) {
    return text(value).replace(/\s+/g, " ").toLocaleLowerCase("th-TH");
  }

  function normalizeCustomRegister(value) {
    const source = asObject(value);
    const id = text(source.id);
    const label = text(source.label).replace(/\s+/g, " ");
    const prefix = text(source.prefix).replace(/\s+/g, " ");
    if (!id.startsWith("custom-") || !label || !prefix) return null;
    return Object.freeze({ id, label, prefix, sequenceWidth: 4, scope: "custom" });
  }

  function storageOf(candidate) {
    if (candidate && typeof candidate.getItem === "function" && typeof candidate.setItem === "function") return candidate;
    if (root.localStorage) return root.localStorage;
    throw new Error("OUTGOING_LEDGER_STORAGE_UNAVAILABLE");
  }

  function readLedger(storageCandidate) {
    const storage = storageOf(storageCandidate);
    try {
      const raw = storage.getItem(LEDGER_STORAGE_KEY);
      return raw ? normalizeLedger(JSON.parse(raw)) : emptyLedger();
    } catch {
      return emptyLedger();
    }
  }

  function writeLedger(storageCandidate, ledger, options = {}) {
    const storage = storageOf(storageCandidate);
    try {
      const current = storage.getItem(LEDGER_STORAGE_KEY);
      if (options.backup && current != null) storage.setItem(LEDGER_BACKUP_KEY, current);
      storage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(normalizeLedger(ledger)));
      return true;
    } catch {
      return false;
    }
  }

  function readCustomRegisterCatalog(storageCandidate) {
    let storage;
    try {
      storage = storageOf(storageCandidate);
      const parsed = JSON.parse(storage.getItem(CATALOG_STORAGE_KEY) || "[]");
      const entries = Array.isArray(parsed) ? parsed : Array.isArray(parsed.registers) ? parsed.registers : [];
      return Object.freeze(entries.map(normalizeCustomRegister).filter(Boolean));
    } catch {
      return Object.freeze([]);
    }
  }

  function customRegisterId() {
    const random = root.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return `custom-${random}`;
  }

  function createCustomRegister(request = {}) {
    if (!CUSTOM_REGISTER_DOCUMENT_IDS.has(text(request.documentId))) return { ok: false, register: null, errorCode: "REGISTER_NOT_ALLOWED" };
    const label = text(request.label).replace(/\s+/g, " ");
    const prefix = text(request.prefix).replace(/\s+/g, " ");
    if (!label || !prefix) return { ok: false, register: null, errorCode: "CATALOG_FIELDS_REQUIRED" };
    try {
      const storage = storageOf(request.storage);
      const custom = [...readCustomRegisterCatalog(storage)];
      const catalog = [...Object.values(REGISTER_DEFINITIONS), ...custom];
      const normalizedLabel = normalizedCatalogValue(label);
      const normalizedPrefix = normalizedCatalogValue(prefix);
      if (catalog.some(register => normalizedCatalogValue(register.label) === normalizedLabel || normalizedCatalogValue(register.prefix) === normalizedPrefix)) {
        return { ok: false, register: null, errorCode: "CATALOG_DUPLICATE" };
      }
      let id = customRegisterId();
      while (catalog.some(register => register.id === id)) id = customRegisterId();
      const register = normalizeCustomRegister({ id, label, prefix });
      storage.setItem(CATALOG_STORAGE_KEY, JSON.stringify([...custom, register]));
      return { ok: true, register: clone(register), errorCode: null };
    } catch {
      return { ok: false, register: null, errorCode: "CATALOG_WRITE_FAILED" };
    }
  }

  function officialDocumentIds(caseState) {
    const state = asObject(caseState);
    const data = asObject(state.documentData);
    if (Array.isArray(data.officialDocumentIds)) return data.officialDocumentIds.map(text).filter(Boolean);
    const resolved = root.ECMISActivity4DocumentRules?.resolveDocumentRequirements?.(state);
    if (Array.isArray(resolved?.officialDocumentIds)) {
      return resolved.officialDocumentIds.filter(id => !["ecmis-review-record", "pcms-review-record"].includes(id));
    }
    return [];
  }

  function isRegionalCase(caseState, actorContext = {}) {
    const state = asObject(caseState);
    const caseData = asObject(state.caseData);
    const data = asObject(state.documentData);
    const workflow = asObject(state.workflow);
    const intakeOwner = asObject(workflow.intakeOwner);
    return text(asObject(actorContext).role) === "regional-officer"
      || text(workflow.owner) === "regional-officer"
      || text(intakeOwner.role) === "regional-officer"
      || text(data.operatingUnitType) === "regional"
      || text(caseData.receivingUnitType) === "regional";
  }

  function slotRule(documentId, purpose, regional, regionalRegisters) {
    const slotId = `${documentId}:${purpose}`;
    if (documentId === "1-12") {
      return Object.freeze({ slotId, documentId, purpose, mode: "reference", fixedRegisterId: null, referenceSlotId: "1-11:main", allowedRegisterIds: Object.freeze([]) });
    }
    if (regional) {
      const configuredIds = Object.keys(asObject(regionalRegisters));
      if (!configuredIds.length) {
        return Object.freeze({ slotId, documentId, purpose, mode: "blocked-unconfigured", fixedRegisterId: null, referenceSlotId: null, allowedRegisterIds: Object.freeze([]) });
      }
      return Object.freeze({ slotId, documentId, purpose, mode: "select", fixedRegisterId: null, referenceSlotId: null, allowedRegisterIds: Object.freeze(configuredIds) });
    }
    const fixedRegisterId = FIXED_DOCUMENT_REGISTERS[documentId] || null;
    if (fixedRegisterId) {
      return Object.freeze({ slotId, documentId, purpose, mode: "fixed", fixedRegisterId, referenceSlotId: null, allowedRegisterIds: CENTRAL_REGISTER_IDS });
    }
    if (SELECT_DOCUMENT_IDS.has(documentId)) {
      return Object.freeze({ slotId, documentId, purpose, mode: "select", fixedRegisterId: null, referenceSlotId: null, allowedRegisterIds: CENTRAL_REGISTER_IDS });
    }
    return Object.freeze({ slotId, documentId, purpose, mode: "none", fixedRegisterId: null, referenceSlotId: null, allowedRegisterIds: Object.freeze([]) });
  }

  function resolveOutgoingSlots(caseState, options = {}) {
    const regional = isRegionalCase(caseState, options.actorContext);
    const regionalRegisters = asObject(options.regionalRegisters || asObject(asObject(caseState).documentData).regionalOutgoingRegisters);
    return Object.freeze(officialDocumentIds(caseState)
      .map(documentId => slotRule(documentId, "main", regional, regionalRegisters))
      .filter(slot => slot.mode !== "none"));
  }

  function registerCatalog(actorContext = {}) {
    const regional = asObject(actorContext).regionalRegisters;
    const custom = readCustomRegisterCatalog(asObject(actorContext).storage);
    return { ...REGISTER_DEFINITIONS, ...Object.fromEntries(custom.map(register => [register.id, register])), ...asObject(regional) };
  }

  function allowedRegistersForSlot(slot, actorContext = {}) {
    const rule = asObject(slot);
    if (["reference", "none", "blocked-unconfigured"].includes(rule.mode)) return Object.freeze([]);
    const catalog = registerCatalog(actorContext);
    const allowed = Array.isArray(rule.allowedRegisterIds) ? [...rule.allowedRegisterIds] : [];
    if (CUSTOM_REGISTER_DOCUMENT_IDS.has(rule.documentId) && text(asObject(actorContext).role) !== "regional-officer") {
      allowed.push(...readCustomRegisterCatalog(asObject(actorContext).storage).map(register => register.id));
    }
    return Object.freeze(allowed.map(id => catalog[id]).filter(Boolean));
  }

  function validateRegisterSelection(slot, registerId, actorContext = {}) {
    const rule = asObject(slot);
    const selected = text(registerId);
    const errors = [];
    if (rule.mode === "blocked-unconfigured") errors.push("REGISTER_UNCONFIGURED");
    else if (!selected) errors.push("REGISTER_REQUIRED");
    else if (rule.mode === "fixed" && selected !== rule.fixedRegisterId) errors.push("REGISTER_NOT_ALLOWED");
    else if (!allowedRegistersForSlot(rule, actorContext).some(register => register.id === selected)) errors.push("REGISTER_NOT_ALLOWED");
    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  function formatOutgoingNumber(registerId, sequence, actorContext = {}) {
    const register = registerCatalog(actorContext)[text(registerId)];
    const value = Number(sequence);
    if (!register || !Number.isInteger(value) || value < 1) return "";
    return `${register.prefix}/${String(value).padStart(register.sequenceWidth || 4, "0")}`;
  }

  function parseLegacyOutgoingNumber(value) {
    const number = text(value).replace(/\s+/g, " ");
    let match = number.match(/^ปป\s*0004\.2\/(\d+)$/i);
    if (match) return Object.freeze({ registerId: "srr", sequence: Number(match[1]), number: `ปป 0004.2/${String(Number(match[1])).padStart(4, "0")}` });
    match = number.match(/^ปป\s*0004\/(\d+)$/i);
    if (match) return Object.freeze({ registerId: "kbk", sequence: Number(match[1]), number: `ปป 0004/${String(Number(match[1])).padStart(4, "0")}` });
    return null;
  }

  function idempotencyKeyOf(request) {
    return `${text(request.caseId)}:${text(request.slotId)}:${Number(request.buddhistYear)}`;
  }

  function activeSlotKey(caseId, slotId) {
    return `${text(caseId)}:${text(slotId)}`;
  }

  function issuanceId(nowValue) {
    const random = root.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return `OUT-${random}-${String(nowValue).replace(/\D/g, "").slice(0, 14)}`;
  }

  function issuanceTimestamp(value) {
    const supplied = text(value);
    if (supplied) {
      const parsed = new Date(supplied);
      if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
    }
    return new Date().toISOString();
  }

  function requestError(request) {
    const slotDocumentId = text(request.slotId).split(":")[0];
    const requestedDocumentId = text(request.documentId);
    if (requestedDocumentId && slotDocumentId && requestedDocumentId !== slotDocumentId) return "REGISTER_NOT_ALLOWED";
    if (!text(request.registerId)) return "REGISTER_REQUIRED";
    const actorContext = { ...asObject(request.actorContext), storage: request.storage || asObject(request.actorContext).storage };
    const register = registerCatalog(actorContext)[request.registerId];
    if (!register) return "REGISTER_NOT_ALLOWED";
    if (!ACTOR_ROLES.has(text(asObject(request.actor).role))) return "INVALID_ACTOR";
    if (!ISSUE_STAGES.has(text(request.workflowStage))) return "INVALID_WORKFLOW_STAGE";
    if (!text(request.caseId) || !text(request.slotId) || !Number.isInteger(Number(request.buddhistYear))) return "LEDGER_WRITE_FAILED";
    const documentId = requestedDocumentId || slotDocumentId;
    if (documentId === "1-12") return "REGISTER_NOT_ALLOWED";
    if (FIXED_DOCUMENT_REGISTERS[documentId] && FIXED_DOCUMENT_REGISTERS[documentId] !== request.registerId) return "REGISTER_NOT_ALLOWED";
    if (text(asObject(request.actor).role) === "regional-officer" && !Object.keys(asObject(asObject(request.actorContext).regionalRegisters)).includes(request.registerId)) return "REGISTER_UNCONFIGURED";
    if (text(asObject(request.actor).role) === "officer" && !CENTRAL_REGISTER_IDS.includes(request.registerId) && !(CUSTOM_REGISTER_DOCUMENT_IDS.has(documentId) && register.scope === "custom")) return "REGISTER_NOT_ALLOWED";
    return "";
  }

  function browserLockAdapter(task) {
    if (root.navigator?.locks?.request) return root.navigator.locks.request("ecmis-a4-outgoing-ledger", task);
    return Promise.resolve().then(task);
  }

  async function issueLocalOutgoingNumber(request = {}) {
    const errorCode = requestError(request);
    if (errorCode) return { ok: false, issuance: null, replayed: false, errorCode };
    const execute = async () => {
      const storage = storageOf(request.storage);
      const ledger = readLedger(storage);
      const key = idempotencyKeyOf(request);
      const existing = ledger.issuancesByIdempotencyKey[key];
      if (existing) return { ok: existing.status === "issued", issuance: clone(existing), replayed: true, errorCode: existing.status === "issued" ? null : "SLOT_ALREADY_ISSUED", prototypeLimitation: !request.lockAdapter && !root.navigator?.locks?.request };

      const counterKey = `${request.registerId}:${Number(request.buddhistYear)}`;
      const highestIssued = Object.values(ledger.issuancesByIdempotencyKey)
        .filter(item => item?.registerId === request.registerId && Number(item?.buddhistYear) === Number(request.buddhistYear))
        .reduce((highest, item) => Math.max(highest, Number(item.sequence) || 0), 0);
      const sequence = Math.max(Number(ledger.counters[counterKey]) || 0, highestIssued) + 1;
      const nowValue = issuanceTimestamp(request.now);
      const actor = asObject(request.actor);
      const register = registerCatalog({ ...asObject(request.actorContext), storage })[text(request.registerId)];
      const issuance = {
        issuanceId: issuanceId(nowValue),
        caseId: text(request.caseId),
        slotId: text(request.slotId),
        documentId: text(request.documentId || String(request.slotId).split(":")[0]),
        purpose: text(request.purpose || "main"),
        registerId: text(request.registerId),
        registerLabel: text(register?.label),
        registerPrefix: text(register?.prefix),
        buddhistYear: Number(request.buddhistYear),
        sequence,
        number: `${register.prefix}/${String(sequence).padStart(register.sequenceWidth || 4, "0")}`,
        selectionSource: request.selectionSource === "fixed" ? "fixed" : "user",
        status: "issued",
        idempotencyKey: key,
        issuedAt: nowValue,
        issuedBy: text(actor.name || actor.id),
        voidedAt: null,
        voidedBy: null,
        voidReason: null
      };
      ledger.counters[counterKey] = sequence;
      ledger.issuancesByIdempotencyKey[key] = issuance;
      ledger.activeSlotIndex[activeSlotKey(request.caseId, request.slotId)] = key;
      if (!writeLedger(storage, ledger)) return { ok: false, issuance: null, replayed: false, errorCode: "LEDGER_WRITE_FAILED" };
      return { ok: true, issuance: clone(issuance), replayed: false, errorCode: null, prototypeLimitation: !request.lockAdapter && !root.navigator?.locks?.request };
    };
    try {
      return await (request.lockAdapter ? request.lockAdapter(execute) : browserLockAdapter(execute));
    } catch {
      return { ok: false, issuance: null, replayed: false, errorCode: "LEDGER_WRITE_FAILED" };
    }
  }

  async function voidLocalOutgoingNumber(request = {}) {
    if (!ACTOR_ROLES.has(text(asObject(request.actor).role))) return { ok: false, issuance: null, errorCode: "INVALID_ACTOR" };
    if (!text(request.reason)) return { ok: false, issuance: null, errorCode: "VOID_REASON_REQUIRED" };
    const execute = async () => {
      const storage = storageOf(request.storage);
      const ledger = readLedger(storage);
      const entry = Object.entries(ledger.issuancesByIdempotencyKey).find(([, item]) => item?.issuanceId === request.issuanceId);
      if (!entry) return { ok: false, issuance: null, errorCode: "ISSUANCE_NOT_FOUND" };
      const [key, current] = entry;
      if (current.status === "void") return { ok: false, issuance: clone(current), errorCode: "ALREADY_VOID" };
      const issuance = { ...current, status: "void", voidedAt: text(request.now || new Date().toISOString()), voidedBy: text(asObject(request.actor).name || asObject(request.actor).id), voidReason: text(request.reason) };
      ledger.issuancesByIdempotencyKey[key] = issuance;
      delete ledger.activeSlotIndex[activeSlotKey(current.caseId, current.slotId)];
      if (!writeLedger(storage, ledger)) return { ok: false, issuance: null, errorCode: "LEDGER_WRITE_FAILED" };
      return { ok: true, issuance: clone(issuance), errorCode: null };
    };
    try {
      return await (request.lockAdapter ? request.lockAdapter(execute) : browserLockAdapter(execute));
    } catch {
      return { ok: false, issuance: null, errorCode: "LEDGER_WRITE_FAILED" };
    }
  }

  function recordManualAuthoritativeNumber(request = {}) {
    if (!ACTOR_ROLES.has(text(asObject(request.actor).role))) return { ok: false, issuance: null, errorCode: "INVALID_ACTOR" };
    if (!text(request.number) || !text(request.sourceNote)) return { ok: false, issuance: null, errorCode: "OUTGOING_NUMBER_REQUIRED" };
    const storage = storageOf(request.storage);
    const ledger = readLedger(storage);
    const key = idempotencyKeyOf(request);
    const existing = ledger.issuancesByIdempotencyKey[key];
    if (existing) return { ok: existing.status === "manual-authoritative", issuance: clone(existing), replayed: true, ledger, errorCode: existing.status === "manual-authoritative" ? null : "SLOT_ALREADY_ISSUED" };
    const nowValue = text(request.now || new Date().toISOString());
    const issuance = {
      issuanceId: issuanceId(nowValue), caseId: text(request.caseId), slotId: text(request.slotId), documentId: text(request.documentId), purpose: text(request.purpose || "main"),
      registerId: null, buddhistYear: Number(request.buddhistYear), sequence: null, number: text(request.number), selectionSource: "manual-authoritative", status: "manual-authoritative",
      idempotencyKey: key, issuedAt: nowValue, issuedBy: text(asObject(request.actor).name || asObject(request.actor).id), sourceNote: text(request.sourceNote), voidedAt: null, voidedBy: null, voidReason: null
    };
    ledger.issuancesByIdempotencyKey[key] = issuance;
    ledger.activeSlotIndex[activeSlotKey(request.caseId, request.slotId)] = key;
    if (!writeLedger(storage, ledger)) return { ok: false, issuance: null, ledger, errorCode: "LEDGER_WRITE_FAILED" };
    return { ok: true, issuance: clone(issuance), replayed: false, ledger, errorCode: null };
  }

  function legacySources(caseState) {
    const data = asObject(asObject(caseState).documentData);
    const items = [];
    for (const [documentId, number] of Object.entries(asObject(data.outgoingNumbers))) {
      if (text(number)) items.push({ sourceField: `outgoingNumbers.${documentId}`, slotId: `${documentId}:main`, documentId, number: text(number) });
    }
    const mainSlot = primarySlotIdForCase(caseState);
    if (text(data.dispatchLetterNo) && mainSlot) items.push({ sourceField: "dispatchLetterNo", slotId: mainSlot, documentId: mainSlot.split(":")[0], number: text(data.dispatchLetterNo) });
    const naccSlot = asObject(data).naccTransferKind === "return" ? "1-09:main" : "1-11:main";
    if (text(data.naccLetterNo)) items.push({ sourceField: "naccLetterNo", slotId: naccSlot, documentId: naccSlot.split(":")[0], number: text(data.naccLetterNo) });
    return items;
  }

  function migrateLegacyOutgoingState(sourceState, options = {}) {
    const original = clone(sourceState);
    const state = clone(sourceState);
    const storage = storageOf(options.storage);
    const ledger = readLedger(storage);
    const buddhistYear = Number(options.buddhistYear || new Date().getFullYear() + 543);
    let changed = false;
    try {
      if (Number(asObject(state.documentData).outgoingMigrationVersion) === LEDGER_VERSION) {
        return { caseState: rehydrateOutgoingProjection(state, ledger), ledger: clone(ledger), changed: false };
      }
      for (const source of legacySources(state)) {
        const key = `${text(asObject(state.caseData).id)}:${source.slotId}:${buddhistYear}:legacy:${source.sourceField}`;
        if (ledger.issuancesByIdempotencyKey[key]) continue;
        const parsed = parseLegacyOutgoingNumber(source.number);
        const slot = resolveOutgoingSlots(state, options).find(item => item.slotId === source.slotId);
        const parsedRegisterAllowed = Boolean(parsed && slot && (
          (slot.mode === "fixed" && parsed.registerId === slot.fixedRegisterId)
          || (slot.mode === "select" && slot.allowedRegisterIds.includes(parsed.registerId))
        ));
        const status = parsedRegisterAllowed ? "issued" : "legacy-unverified";
        const issuance = {
          issuanceId: `OUT-LEGACY-${encodeURIComponent(key)}`, caseId: text(asObject(state.caseData).id), slotId: source.slotId, documentId: source.documentId, purpose: "main",
          registerId: parsed?.registerId || null, buddhistYear, sequence: parsed?.sequence || null, number: parsed?.number || source.number, selectionSource: "legacy", status,
          idempotencyKey: key, issuedAt: text(options.migratedAt || new Date().toISOString()), issuedBy: "legacy-migration", legacySourceField: source.sourceField,
          voidedAt: null, voidedBy: null, voidReason: null
        };
        ledger.issuancesByIdempotencyKey[key] = issuance;
        if (!ledger.activeSlotIndex[activeSlotKey(issuance.caseId, issuance.slotId)]) ledger.activeSlotIndex[activeSlotKey(issuance.caseId, issuance.slotId)] = key;
        if (parsedRegisterAllowed) {
          const counterKey = `${parsed.registerId}:${buddhistYear}`;
          ledger.counters[counterKey] = Math.max(Number(ledger.counters[counterKey]) || 0, parsed.sequence);
        }
        changed = true;
      }
      const data = asObject(state.documentData);
      if (changed || data.outgoingMigrationVersion !== LEDGER_VERSION) {
        data.outgoingMigrationVersion = LEDGER_VERSION;
        state.documentData = data;
        changed = true;
      }
      if (changed && !writeLedger(storage, ledger, { backup: true })) throw new Error("LEDGER_WRITE_FAILED");
      return { caseState: rehydrateOutgoingProjection(state, ledger), ledger: clone(ledger), changed };
    } catch {
      return { caseState: original, ledger: readLedger(storage), changed: false, errorCode: "LEDGER_WRITE_FAILED" };
    }
  }

  function issuanceForSlot(caseState, slotId, ledgerCandidate) {
    const ledger = ledgerCandidate ? normalizeLedger(ledgerCandidate) : readLedger();
    const caseId = text(asObject(caseState).caseData?.id);
    const key = ledger.activeSlotIndex[activeSlotKey(caseId, slotId)];
    return key ? clone(ledger.issuancesByIdempotencyKey[key]) : null;
  }

  function primarySlotIdForCase(caseState) {
    const data = asObject(asObject(caseState).documentData);
    if (data.decision === "send-nacc") return data.naccTransferKind === "return" ? "1-09:main" : "1-11:main";
    const preferred = { "18/1ก": "1-03:main", "18/1ข": "1-05:main", "18/4": "1-04:main", "58/2": "58/2-05:main" }[data.decision];
    const slots = resolveOutgoingSlots(caseState);
    if (preferred && slots.some(slot => slot.slotId === preferred)) return preferred;
    return slots.find(slot => !["reference", "none"].includes(slot.mode))?.slotId || "";
  }

  function rehydrateOutgoingProjection(sourceState, ledgerCandidate) {
    const state = clone(sourceState);
    const ledger = ledgerCandidate ? normalizeLedger(ledgerCandidate) : readLedger();
    const data = asObject(state.documentData);
    data.outgoingIssuances = {};
    for (const slot of resolveOutgoingSlots(state)) {
      let issuance = issuanceForSlot(state, slot.slotId, ledger);
      if (slot.mode === "reference") issuance = issuanceForSlot(state, slot.referenceSlotId, ledger);
      if (issuance) data.outgoingIssuances[slot.slotId] = issuance;
    }
    const primary = primarySlotIdForCase(state);
    const main = primary ? issuanceForSlot(state, primary, ledger) : null;
    if (main && ["issued", "manual-authoritative"].includes(main.status)) {
      if (data.decision === "send-nacc") data.naccLetterNo = main.number;
      else data.dispatchLetterNo = main.number;
    }
    state.documentData = data;
    return state;
  }

  function requiredIssuedSlotsForDispatch(caseState) {
    return Object.freeze(resolveOutgoingSlots(caseState)
      .filter(slot => ["fixed", "select", "blocked-unconfigured"].includes(slot.mode))
      .map(slot => slot.slotId));
  }

  function validateRequiredIssuances(caseState, ledgerCandidate, options = {}) {
    const ledger = ledgerCandidate ? normalizeLedger(ledgerCandidate) : readLedger();
    const errors = [];
    for (const slot of resolveOutgoingSlots(caseState)) {
      if (slot.mode === "reference") {
        const referenced = issuanceForSlot(caseState, slot.referenceSlotId, ledger);
        if (!referenced || !["issued", "manual-authoritative"].includes(referenced.status)) errors.push(`OUTGOING_NUMBER_REQUIRED:${slot.referenceSlotId}`);
        continue;
      }
      if (!["fixed", "select", "blocked-unconfigured"].includes(slot.mode)) continue;
      const issuance = issuanceForSlot(caseState, slot.slotId, ledger);
      if (!issuance) errors.push(slot.mode === "blocked-unconfigured" ? `REGISTER_UNCONFIGURED:${slot.slotId}` : `OUTGOING_NUMBER_REQUIRED:${slot.slotId}`);
      else if (issuance.status === "legacy-unverified") errors.push(`LEGACY_NUMBER_UNVERIFIED:${slot.slotId}`);
      else if (issuance.status === "void") errors.push(`OUTGOING_NUMBER_REQUIRED:${slot.slotId}`);
      else if (slot.mode === "fixed" && issuance.registerId !== slot.fixedRegisterId) errors.push(`REGISTER_NOT_ALLOWED:${slot.slotId}`);
      else if (slot.mode === "select" && issuance.registerId && !allowedRegistersForSlot(slot, { storage: options.storage || root.localStorage }).some(register => register.id === issuance.registerId)) errors.push(`REGISTER_NOT_ALLOWED:${slot.slotId}`);
    }
    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  const api = Object.freeze({
    LEDGER_STORAGE_KEY,
    LEDGER_BACKUP_KEY,
    CATALOG_STORAGE_KEY,
    REGISTER_DEFINITIONS,
    FIXED_DOCUMENT_REGISTERS,
    resolveOutgoingSlots,
    allowedRegistersForSlot,
    validateRegisterSelection,
    registerCatalog,
    readCustomRegisterCatalog,
    createCustomRegister,
    formatOutgoingNumber,
    parseLegacyOutgoingNumber,
    readLedger,
    issueLocalOutgoingNumber,
    voidLocalOutgoingNumber,
    recordManualAuthoritativeNumber,
    migrateLegacyOutgoingState,
    issuanceForSlot,
    rehydrateOutgoingProjection,
    primarySlotIdForCase,
    requiredIssuedSlotsForDispatch,
    validateRequiredIssuances
  });
  root.ECMISActivity4OutgoingRegisters = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis === "undefined" ? window : globalThis);
