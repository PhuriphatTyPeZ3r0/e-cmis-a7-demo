(function initializeActivity5AssignmentRecommendation(root) {
  const MODEL_VERSION = "deterministic-v1";
  const WEIGHTS = Object.freeze({ workload: 0.4, difficultyFit: 0.25, relevantExperience: 0.25, dataCompleteness: 0.1 });

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function bounded(value) {
    return Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
  }

  function hasNumber(value) {
    return value !== "" && value !== null && value !== undefined && Number.isFinite(Number(value));
  }

  function stableStringify(value) {
    if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
    if (value && typeof value === "object") return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
    return JSON.stringify(value);
  }

  function snapshotId(value) {
    const text = stableStringify(value);
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return `a5-rec-${(hash >>> 0).toString(16).padStart(8, "0")}`;
  }

  function scoreCandidate(caseProfile, officer) {
    const missingFields = [];
    const workload = hasNumber(officer.weightedWorkload)
      ? bounded(100 - (Number(officer.weightedWorkload) * 10))
      : (missingFields.push("weightedWorkload"), 0);
    const difficulty = Number(caseProfile.difficulty);
    const capacity = Number(officer.complexityCapacity);
    const difficultyFit = hasNumber(caseProfile.difficulty) && hasNumber(officer.complexityCapacity)
      ? bounded(100 - (Math.abs(difficulty - capacity) * 25))
      : (missingFields.push(!hasNumber(caseProfile.difficulty) ? "difficulty" : "complexityCapacity"), 0);
    const requiredTags = Array.isArray(caseProfile.requiredExperienceTags) ? [...new Set(caseProfile.requiredExperienceTags.map(String).filter(Boolean))] : [];
    const officerTags = Array.isArray(officer.experienceTags) ? new Set(officer.experienceTags.map(String)) : null;
    const relevantExperience = requiredTags.length && officerTags
      ? bounded((requiredTags.filter(tag => officerTags.has(tag)).length / requiredTags.length) * 100)
      : (missingFields.push(requiredTags.length ? "experienceTags" : "requiredExperienceTags"), 0);
    const dataCompleteness = hasNumber(caseProfile.completeness)
      ? bounded(caseProfile.completeness)
      : (missingFields.push("completeness"), 0);
    const breakdown = { workload, difficultyFit, relevantExperience, dataCompleteness };
    const totalScore = bounded(Object.entries(WEIGHTS).reduce((sum, [key, weight]) => sum + (breakdown[key] * weight), 0));
    const reasons = [
      `ภาระงาน ${workload}/100`,
      `ความเหมาะสมกับความยาก ${difficultyFit}/100`,
      `ประสบการณ์ที่เกี่ยวข้อง ${relevantExperience}/100`,
      `ความครบถ้วนข้อมูล ${dataCompleteness}/100`
    ];
    if (missingFields.length) reasons.push(`ข้อมูลไม่ครบ: ${missingFields.join(", ")}`);
    return {
      officerId: String(officer.id),
      officerName: String(officer.name || officer.id),
      eligible: true,
      totalScore,
      confidence: dataCompleteness,
      breakdown,
      reasons,
      missingFields: [...new Set(missingFields)]
    };
  }

  function recommendInvestigators(sourceCaseProfile, sourceProfiles, options = {}) {
    const caseProfile = clone(sourceCaseProfile || {});
    const profiles = clone(Array.isArray(sourceProfiles) ? sourceProfiles : []);
    const generatedAt = String(options.generatedAt || new Date().toISOString());
    const candidates = profiles
      .filter(profile => profile.available === true && String(profile.unit || "") === String(caseProfile.unit || ""))
      .map(profile => scoreCandidate(caseProfile, profile))
      .sort((left, right) => right.totalScore - left.totalScore || left.officerId.localeCompare(right.officerId, "en"));
    const snapshot = { generatedAt, modelVersion: MODEL_VERSION, caseProfile, candidates };
    return Object.freeze({ id: snapshotId(snapshot), ...snapshot });
  }

  function validateRecommendationSnapshot(sourceSnapshot) {
    if (!sourceSnapshot || typeof sourceSnapshot !== "object" || Array.isArray(sourceSnapshot)) return false;
    const { id, ...snapshot } = sourceSnapshot;
    if (snapshot.modelVersion !== MODEL_VERSION || !String(id || "").trim() || !String(snapshot.generatedAt || "").trim()) return false;
    if (!snapshot.caseProfile || typeof snapshot.caseProfile !== "object" || Array.isArray(snapshot.caseProfile)) return false;
    if (!Array.isArray(snapshot.candidates) || snapshot.candidates.length === 0) return false;
    const candidateIds = snapshot.candidates.map(candidate => String(candidate?.officerId || "").trim());
    if (candidateIds.some(candidateId => !candidateId) || new Set(candidateIds).size !== candidateIds.length) return false;
    const inRange = value => hasNumber(value) && Number(value) >= 0 && Number(value) <= 100;
    const validCandidates = snapshot.candidates.every(candidate => candidate?.eligible === true
      && inRange(candidate.totalScore)
      && inRange(candidate.confidence)
      && candidate.breakdown && typeof candidate.breakdown === "object" && !Array.isArray(candidate.breakdown)
      && Object.keys(WEIGHTS).every(key => inRange(candidate.breakdown[key]))
      && Array.isArray(candidate.reasons)
      && Array.isArray(candidate.missingFields));
    return validCandidates && snapshotId(snapshot) === id;
  }

  const api = Object.freeze({ MODEL_VERSION, WEIGHTS, recommendInvestigators, scoreCandidate, validateRecommendationSnapshot });
  root.ECMISActivity5AssignmentRecommendation = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
