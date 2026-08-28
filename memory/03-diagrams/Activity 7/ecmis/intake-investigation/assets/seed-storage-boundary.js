(function () {
  'use strict';

  const SHARED_KEY = 'ecmis-a4-workspace-v3';
  const A5_SEED_KEY = 'ecmis-a5-seed-workspace-v1';

  function readObject(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '{}');
      return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    } catch {
      return {};
    }
  }

  function isA5Placeholder(state) {
    const subject = String(state?.caseData?.subject || state?.caseData?.detail || '');
    return /ตัวอย่างคดีสำหรับการไต่สวน|example case for investigation/i.test(subject);
  }

  const shared = readObject(SHARED_KEY);
  const a5Seed = readObject(A5_SEED_KEY);
  let changed = false;

  Object.entries(shared).forEach(function ([id, state]) {
    if (!isA5Placeholder(state)) return;
    a5Seed[id] = state;
    delete shared[id];
    changed = true;
  });

  if (!changed) return;
  localStorage.setItem(A5_SEED_KEY, JSON.stringify(a5Seed));
  localStorage.setItem(SHARED_KEY, JSON.stringify(shared));
}());
