(function initializeActivity4SeedPolicy(root) {
  "use strict";

  const ACTIVE_IDS = Object.freeze([
    "ECMIS-2569-000184",
    "seed-central-registry-letter-001",
    "ECMIS-2569-000181",
    "seed-admin-registry-m62-003",
    "seed-nacc-api-srr-003"
  ]);
  const ACTIVE_ID_SET = new Set(ACTIVE_IDS);
  const MANAGED_EXACT_IDS = new Set([
    "seed-admin-registry-letter-002",
    "seed-admin-registry-m62-003",
    "seed-central-registry-letter-001",
    "ECMIS-2569-000184",
    "ECMIS-2569-000183",
    "ECMIS-2569-000182",
    "ECMIS-2569-000181",
    "ECMIS-2569-000180",
    "seed-nacc-api-central-registry-001",
    "seed-nacc-api-case-admin-002",
    "seed-nacc-api-srr-003"
  ]);

  function isManagedSeedId(value) {
    const id = String(value || "");
    return MANAGED_EXACT_IDS.has(id) || /^demo-start-a4-\d{3}$/.test(id);
  }

  function selectActiveSeeds(records) {
    return (Array.isArray(records) ? records : []).filter(record => ACTIVE_ID_SET.has(String(record?.id || "")));
  }

  function compactWorkspaceStore(sourceStore) {
    const store = sourceStore && typeof sourceStore === "object" && !Array.isArray(sourceStore) ? { ...sourceStore } : {};
    const removedIds = [];
    Object.keys(store).forEach(key => {
      const id = String(store[key]?.caseData?.id || store[key]?.id || key);
      if (!isManagedSeedId(id) || ACTIVE_ID_SET.has(id)) return;
      delete store[key];
      removedIds.push(key);
    });
    return Object.freeze({ store, removed: removedIds.length, removedIds: Object.freeze(removedIds) });
  }

  const api = Object.freeze({ ACTIVE_IDS, isManagedSeedId, selectActiveSeeds, compactWorkspaceStore });
  root.ECMISActivity4SeedPolicy = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis === "undefined" ? window : globalThis);
