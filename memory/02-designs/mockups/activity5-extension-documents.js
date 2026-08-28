(function initializeActivity5ExtensionDocuments(root) {
  const rules = root.ECMISActivity5ExtensionRules
    || (typeof require === "function" ? require("./activity5-extension-rules.js") : null);
  const documentDomain = root.ECMISActivity5DocumentDomain
    || (typeof require === "function" ? require("./activity5-document-domain.js") : null);

  const DOCUMENT_AVAILABILITY = Object.freeze({
    AVAILABLE: "AVAILABLE",
    REFERENCE_ONLY: "REFERENCE_ONLY",
    UPLOAD_PENDING: "UPLOAD_PENDING",
    WITHDRAWN: "WITHDRAWN"
  });

  function asText(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function clone(value, seen = new WeakMap()) {
    if (Array.isArray(value)) {
      if (seen.has(value)) return seen.get(value);
      const copy = [];
      seen.set(value, copy);
      value.forEach(item => copy.push(clone(item, seen)));
      return copy;
    }
    if (value && typeof value === "object") {
      if (seen.has(value)) return seen.get(value);
      const copy = {};
      seen.set(value, copy);
      Object.entries(value).forEach(([key, item]) => {
        copy[key] = clone(item, seen);
      });
      return copy;
    }
    return value;
  }

  function envelope(ok, code, result = null, errors = []) {
    return { ok, code, result, errors };
  }

  function compareDocumentVersions(left, right) {
    const leftNumber = Number(left.version);
    const rightNumber = Number(right.version);
    const bothNumeric = Number.isFinite(leftNumber) && Number.isFinite(rightNumber);
    if (bothNumeric && leftNumber !== rightNumber) return leftNumber - rightNumber;
    if (!bothNumeric) {
      const byVersion = String(left.version ?? "").localeCompare(String(right.version ?? ""), "en", { numeric: true });
      if (byVersion !== 0) return byVersion;
    }
    const byDate = asText(left.createdAt).localeCompare(asText(right.createdAt));
    if (byDate !== 0) return byDate;
    return left.versionId.localeCompare(right.versionId, "en", { numeric: true });
  }

  function normalizeExtensionRepository(sourceEntries) {
    if (!Array.isArray(sourceEntries)) {
      return envelope(false, "INVALID_REPOSITORY", null, [{ field: "repository", code: "EXPECTED_ARRAY" }]);
    }
    const errors = [];
    const seenVersionIds = new Set();
    const result = [];
    sourceEntries.forEach((source, index) => {
      if (!source || typeof source !== "object" || Array.isArray(source)) {
        errors.push({ field: `repository[${index}]`, code: "EXPECTED_OBJECT" });
        return;
      }
      const versionId = asText(source.versionId);
      if (!versionId) {
        errors.push({ field: `repository[${index}].versionId`, code: "REQUIRED" });
        return;
      }
      if (seenVersionIds.has(versionId)) {
        errors.push({ field: `repository[${index}].versionId`, code: "DUPLICATE_VERSION_ID", versionId });
        return;
      }
      seenVersionIds.add(versionId);
      const artifactId = asText(source.artifactId) || asText(source.documentId);
      const version = source.version ?? source.versionNo;
      const validVersion = (typeof version === "number" && Number.isFinite(version) && version > 0)
        || (typeof version === "string" && Boolean(version.trim()));
      const name = asText(source.name) || asText(source.title) || asText(source.fileName);
      const documentType = asText(source.documentType);
      const documentSource = asText(source.source);
      const createdAt = asText(source.createdAt);
      if (!artifactId) errors.push({ field: `repository[${index}].artifactId`, code: "REQUIRED" });
      if (!validVersion) errors.push({ field: `repository[${index}].version`, code: "REQUIRED" });
      if (!name) errors.push({ field: `repository[${index}].name`, code: "REQUIRED" });
      if (!documentType) errors.push({ field: `repository[${index}].documentType`, code: "REQUIRED" });
      if (!documentSource) errors.push({ field: `repository[${index}].source`, code: "REQUIRED" });
      if (!createdAt) errors.push({ field: `repository[${index}].createdAt`, code: "REQUIRED" });
      const availability = asText(source.availability) || DOCUMENT_AVAILABILITY.REFERENCE_ONLY;
      if (!Object.hasOwn(DOCUMENT_AVAILABILITY, availability)) {
        errors.push({ field: `repository[${index}].availability`, code: "INVALID_AVAILABILITY", versionId });
        return;
      }
      if (!artifactId || !validVersion || !name || !documentType || !documentSource || !createdAt) return;
      const item = clone(source);
      delete item.requirementCode;
      delete item.requirementCodes;
      item.versionId = versionId;
      item.artifactId = artifactId;
      item.version = version;
      item.name = name;
      item.documentType = documentType;
      item.source = documentSource;
      item.documentNumber = asText(source.documentNumber);
      item.reference = asText(source.reference);
      item.createdAt = createdAt;
      item.availability = availability;
      result.push(item);
    });
    if (errors.length) return envelope(false, "INVALID_REPOSITORY", null, errors);
    const versionsByArtifact = new Map();
    result.forEach(item => {
      if (!versionsByArtifact.has(item.artifactId)) versionsByArtifact.set(item.artifactId, []);
      versionsByArtifact.get(item.artifactId).push(item);
    });
    versionsByArtifact.forEach(versions => {
      const ordered = [...versions].sort(compareDocumentVersions);
      const latestVersionId = ordered.at(-1).versionId;
      ordered.forEach((item, index) => {
        item.previousVersionId = index === 0 ? null : ordered[index - 1].versionId;
        item.latestVersionId = latestVersionId;
        item.isLatest = item.versionId === latestVersionId;
      });
    });
    return envelope(true, "REPOSITORY_NORMALIZED", result, []);
  }

  function normalizeFilterAssignmentLinks(sourceAssignmentLinks, repositoryVersionIds) {
    if (sourceAssignmentLinks === undefined) {
      return { values: null, errors: [{ field: "assignmentLinks", code: "REQUIRED" }] };
    }
    if (!Array.isArray(sourceAssignmentLinks)) {
      return { values: null, errors: [{ field: "assignmentLinks", code: "EXPECTED_ARRAY" }] };
    }
    const errors = [];
    const values = [];
    const seen = new Set();
    sourceAssignmentLinks.forEach((sourceLink, index) => {
      if (!isRecord(sourceLink)) {
        errors.push({ field: `assignmentLinks[${index}]`, code: "EXPECTED_OBJECT" });
        return;
      }
      const requirementCode = asText(sourceLink.requirementCode);
      const documentVersionId = asText(sourceLink.documentVersionId);
      const versionIdAlias = asText(sourceLink.versionId);
      const versionId = documentVersionId || versionIdAlias;
      const requestId = asText(sourceLink.requestId);
      const revisionNo = sourceLink.revisionNo;
      if (!requirementCode) {
        errors.push({ field: `assignmentLinks[${index}].requirementCode`, code: "REQUIRED" });
      }
      if (!versionId) {
        errors.push({ field: `assignmentLinks[${index}].documentVersionId`, code: "REQUIRED" });
      }
      if (documentVersionId && versionIdAlias && documentVersionId !== versionIdAlias) {
        errors.push({ field: `assignmentLinks[${index}].versionId`, code: "VERSION_ID_MISMATCH" });
      }
      if (!requestId) {
        errors.push({
          field: `assignmentLinks[${index}].requestId`,
          code: sourceLink.requestId === undefined ? "REQUIRED" : "INVALID_REQUEST_ID"
        });
      }
      if (!Number.isInteger(revisionNo) || revisionNo <= 0) {
        errors.push({
          field: `assignmentLinks[${index}].revisionNo`,
          code: sourceLink.revisionNo === undefined ? "REQUIRED" : "INVALID_REVISION_NO"
        });
      }
      if (versionId && !repositoryVersionIds.has(versionId)) {
        errors.push({ field: `assignmentLinks[${index}].documentVersionId`, code: "VERSION_NOT_FOUND", versionId });
      }
      if (!requirementCode || !versionId || !requestId || !Number.isInteger(revisionNo) || revisionNo <= 0
        || (documentVersionId && versionIdAlias && documentVersionId !== versionIdAlias)
        || !repositoryVersionIds.has(versionId)) return;
      const key = `${requestId}\u0000${revisionNo}\u0000${requirementCode}\u0000${versionId}`;
      if (seen.has(key)) return;
      seen.add(key);
      values.push({ requestId, revisionNo, requirementCode, versionId });
    });
    return { values, errors };
  }

  function filterExtensionDocuments(sourceRepository, sourceOptions = {}, sourceAssignmentLinks) {
    const normalized = normalizeExtensionRepository(sourceRepository);
    if (!normalized.ok) return normalized;
    if (!sourceOptions || typeof sourceOptions !== "object" || Array.isArray(sourceOptions)) {
      return envelope(false, "INVALID_FILTER", null, [{ field: "options", code: "EXPECTED_OBJECT" }]);
    }
    const options = sourceOptions;
    const supportedKeys = new Set([
      "search",
      "documentType",
      "source",
      "requirementCode",
      "requestId",
      "revisionNo",
      "availability",
      "latestMode",
      "sortBy",
      "sortDirection",
      "offset",
      "limit"
    ]);
    const unsupportedErrors = Object.keys(options)
      .filter(key => !supportedKeys.has(key))
      .map(key => ({ field: `options.${key}`, code: "UNSUPPORTED_FILTER" }));
    if (unsupportedErrors.length) return envelope(false, "INVALID_FILTER", null, unsupportedErrors);
    const optionErrors = [];
    if (options.search !== undefined && typeof options.search !== "string") {
      optionErrors.push({ field: "search", code: "EXPECTED_STRING" });
    }
    const search = asText(options.search).toLocaleLowerCase("th");
    function filterValues(key) {
      if (options[key] === undefined) return [];
      const sourceValues = Array.isArray(options[key]) ? options[key] : [options[key]];
      if ((!Array.isArray(options[key]) && typeof options[key] !== "string")
        || sourceValues.some(value => typeof value !== "string" || !value.trim())) {
        optionErrors.push({ field: key, code: "EXPECTED_NON_EMPTY_STRING_OR_ARRAY" });
        return [];
      }
      return [...new Set(sourceValues.map(asText))];
    }
    const documentTypes = filterValues("documentType");
    const sources = filterValues("source");
    const requirementCodes = filterValues("requirementCode");
    const availability = filterValues("availability");
    if (availability.some(value => !Object.hasOwn(DOCUMENT_AVAILABILITY, value))) {
      optionErrors.push({ field: "availability", code: "INVALID_AVAILABILITY" });
    }
    for (const key of ["latestMode", "sortBy", "sortDirection"]) {
      if (options[key] !== undefined && (typeof options[key] !== "string" || !options[key].trim())) {
        optionErrors.push({ field: key, code: "EXPECTED_NON_EMPTY_STRING" });
      }
    }
    const requestId = asText(options.requestId);
    const revisionNo = options.revisionNo;
    if (requirementCodes.length > 0) {
      if (!requestId) {
        optionErrors.push({
          field: "requestId",
          code: options.requestId === undefined ? "REQUIRED" : "INVALID_REQUEST_ID"
        });
      }
      if (!Number.isInteger(revisionNo) || revisionNo <= 0) {
        optionErrors.push({
          field: "revisionNo",
          code: options.revisionNo === undefined ? "REQUIRED" : "INVALID_REVISION_NO"
        });
      }
    }
    if (optionErrors.length) return envelope(false, "INVALID_FILTER", null, optionErrors);
    const repositoryVersionIds = new Set(normalized.result.map(item => item.versionId));
    const assignmentContext = requirementCodes.length > 0
      ? normalizeFilterAssignmentLinks(sourceAssignmentLinks, repositoryVersionIds)
      : { values: [], errors: [] };
    if (assignmentContext.errors.length) {
      return envelope(false, "INVALID_FILTER", null, assignmentContext.errors);
    }
    const latestMode = asText(options.latestMode).toUpperCase() || "ALL";
    if (!new Set(["LATEST", "ALL"]).has(latestMode)) {
      return envelope(false, "INVALID_FILTER", null, [{ field: "latestMode", code: "INVALID_LATEST_MODE" }]);
    }
    const sortBy = asText(options.sortBy) || "name";
    const allowedSortFields = new Set(["createdAt", "name", "documentType", "version"]);
    if (!allowedSortFields.has(sortBy)) {
      return envelope(false, "INVALID_FILTER", null, [{ field: "sortBy", code: "INVALID_SORT_FIELD" }]);
    }
    const sortDirection = asText(options.sortDirection).toLowerCase() || "asc";
    if (!new Set(["asc", "desc"]).has(sortDirection)) {
      return envelope(false, "INVALID_FILTER", null, [{ field: "sortDirection", code: "INVALID_SORT_DIRECTION" }]);
    }
    const offset = options.offset === undefined ? 0 : options.offset;
    const limit = options.limit === undefined ? normalized.result.length : options.limit;
    if (!Number.isInteger(offset) || offset < 0 || !Number.isInteger(limit) || limit < 0) {
      return envelope(false, "INVALID_FILTER", null, [{ field: "pagination", code: "INVALID_RANGE" }]);
    }
    const documentTypeSet = new Set(documentTypes);
    const sourceSet = new Set(sources);
    const requirementCodeSet = new Set(requirementCodes);
    const assignedVersionIds = new Set(assignmentContext.values
      .filter(link => link.requestId === requestId
        && link.revisionNo === revisionNo
        && requirementCodeSet.has(link.requirementCode))
      .map(link => link.versionId));
    const availabilitySet = new Set(availability);
    const direction = sortDirection === "desc" ? -1 : 1;
    const items = normalized.result.filter(item => {
      const matchesDocumentType = documentTypeSet.size === 0 || documentTypeSet.has(item.documentType);
      const matchesSource = sourceSet.size === 0 || sourceSet.has(item.source);
      const matchesRequirement = requirementCodeSet.size === 0
        || assignedVersionIds.has(item.versionId);
      const matchesAvailability = availabilitySet.size === 0 || availabilitySet.has(item.availability);
      const matchesLatest = latestMode === "ALL" || item.isLatest;
      const haystack = [item.name, item.documentNumber, item.reference]
        .map(asText)
        .join(" ")
        .toLocaleLowerCase("th");
      return matchesDocumentType
        && matchesSource
        && matchesRequirement
        && matchesAvailability
        && matchesLatest
        && (!search || haystack.includes(search));
    }).sort((left, right) => {
      if (sortBy === "version") return compareDocumentVersions(left, right) * direction;
      const leftValue = asText(left[sortBy]);
      const rightValue = asText(right[sortBy]);
      if (leftValue === rightValue) return asText(left.versionId).localeCompare(asText(right.versionId)) * direction;
      return (leftValue < rightValue ? -1 : 1) * direction;
    });
    return envelope(true, "DOCUMENTS_FILTERED", {
      items: items.slice(offset, offset + limit),
      total: items.length,
      offset,
      limit
    }, []);
  }

  function normalizeVersionIds(source, field) {
    const values = source instanceof Set ? [...source] : source;
    if (!Array.isArray(values)) {
      return { values: null, errors: [{ field, code: "EXPECTED_ARRAY_OR_SET" }] };
    }
    const errors = [];
    const unique = [];
    const seen = new Set();
    values.forEach((value, index) => {
      const versionId = asText(value);
      if (!versionId) {
        errors.push({ field: `${field}[${index}]`, code: "INVALID_VERSION_ID" });
      } else if (!seen.has(versionId)) {
        seen.add(versionId);
        unique.push(versionId);
      }
    });
    return { values: unique, errors };
  }

  function normalizeRequirementLinks(source, field) {
    const values = source instanceof Set ? [...source] : source;
    if (!Array.isArray(values)) {
      return { values: null, errors: [{ field, code: "EXPECTED_ARRAY_OR_SET" }] };
    }
    const errors = [];
    const links = [];
    const seen = new Set();
    values.forEach((value, index) => {
      const sourceLink = typeof value === "string" ? { versionId: value } : value;
      if (!isRecord(sourceLink)) {
        errors.push({ field: `${field}[${index}]`, code: "INVALID_REQUIREMENT_LINK" });
        return;
      }
      const versionId = asText(sourceLink.versionId);
      if (!versionId) {
        errors.push({ field: `${field}[${index}].versionId`, code: "INVALID_VERSION_ID" });
        return;
      }
      if (sourceLink.oldVersionConfirmed !== undefined && typeof sourceLink.oldVersionConfirmed !== "boolean") {
        errors.push({ field: `${field}[${index}].oldVersionConfirmed`, code: "EXPECTED_BOOLEAN" });
        return;
      }
      if (sourceLink.oldVersionReason !== undefined && typeof sourceLink.oldVersionReason !== "string") {
        errors.push({ field: `${field}[${index}].oldVersionReason`, code: "EXPECTED_STRING" });
        return;
      }
      if (seen.has(versionId)) return;
      seen.add(versionId);
      links.push({
        versionId,
        oldVersionConfirmed: sourceLink.oldVersionConfirmed === true,
        oldVersionReason: asText(sourceLink.oldVersionReason)
      });
    });
    return { values: links, errors };
  }

  function serializeRequirementLinks(source, links) {
    const values = source instanceof Set ? [...source] : source;
    const usesLinkMetadata = Array.isArray(values) && values.some(value => isRecord(value));
    return usesLinkMetadata ? links.map(link => clone(link)) : links.map(link => link.versionId);
  }

  function updateVisibleSelection(sourceSelectedVersionIds, sourceVisibleVersionIds, sourceAction) {
    const selected = normalizeVersionIds(sourceSelectedVersionIds, "selectedVersionIds");
    const visible = normalizeVersionIds(sourceVisibleVersionIds, "visibleVersionIds");
    const action = asText(sourceAction).toUpperCase();
    const errors = [...selected.errors, ...visible.errors];
    if (!new Set(["SELECT", "UNSELECT"]).has(action)) {
      errors.push({ field: "action", code: "INVALID_SELECTION_ACTION" });
    }
    if (errors.length) return envelope(false, "INVALID_SELECTION", null, errors);

    const result = new Set(selected.values);
    visible.values.forEach(versionId => {
      if (action === "SELECT") result.add(versionId);
      else result.delete(versionId);
    });
    return envelope(true, "SELECTION_UPDATED", [...result], []);
  }

  function isRecord(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value) && !(value instanceof Set);
  }

  function requiredDocumentCodeSet() {
    const extensionRules = rules?.EXTENSION_RULES;
    if (!extensionRules || typeof extensionRules !== "object") return new Set();
    return new Set(Object.values(extensionRules).flatMap(rule => Array.isArray(rule?.requiredDocumentCodes)
      ? rule.requiredDocumentCodes
      : []));
  }

  function assignRequirement(sourceAssignments, sourceRequirementCode, sourceSelectedVersionIds, sourceRepository) {
    const errors = [];
    const assignments = {};
    const requirementCode = asText(sourceRequirementCode);
    const knownRequirementCodes = requiredDocumentCodeSet();
    if (!knownRequirementCodes.has(requirementCode)) {
      errors.push({ field: "requirementCode", code: "UNKNOWN_REQUIREMENT_CODE", requirementCode });
    }
    if (!isRecord(sourceAssignments)) {
      errors.push({ field: "assignments", code: "EXPECTED_OBJECT" });
    } else {
      Object.entries(sourceAssignments).forEach(([code, versionIds]) => {
        if (!knownRequirementCodes.has(code)) {
          errors.push({ field: `assignments.${code}`, code: "UNKNOWN_REQUIREMENT_CODE" });
          return;
        }
        const checked = normalizeRequirementLinks(versionIds, `assignments.${code}`);
        errors.push(...checked.errors);
        assignments[code] = checked.values ? serializeRequirementLinks(versionIds, checked.values) : [];
      });
    }
    const selected = normalizeRequirementLinks(sourceSelectedVersionIds, "selectedVersionIds");
    errors.push(...selected.errors);
    if (selected.values && selected.values.length === 0) {
      errors.push({ field: "selectedVersionIds", code: "REQUIRED" });
    }
    const normalized = normalizeExtensionRepository(sourceRepository);
    if (!normalized.ok) errors.push(...normalized.errors);
    if (normalized.ok && selected.values) {
      const repositoryVersionIds = new Set(normalized.result.map(item => item.versionId));
      selected.values.forEach(({ versionId }) => {
        if (!repositoryVersionIds.has(versionId)) {
          errors.push({ field: "selectedVersionIds", code: "VERSION_NOT_FOUND", versionId });
        }
      });
    }
    if (errors.length) return envelope(false, "INVALID_REQUIREMENT_ASSIGNMENT", null, errors);

    const result = clone(assignments);
    result[requirementCode] = serializeRequirementLinks(sourceSelectedVersionIds, selected.values);
    return envelope(true, "REQUIREMENT_ASSIGNED", result, []);
  }

  function evaluateExtensionDocumentChecklist(sourceExtensionType, sourceRepository, sourceAssignments, validationContext = null) {
    const extensionType = asText(sourceExtensionType);
    const rule = rules?.getExtensionRule(extensionType) || null;
    const errors = [];
    if (!rule) errors.push({ field: "extensionType", code: "UNKNOWN_EXTENSION_TYPE" });
    const normalized = normalizeExtensionRepository(sourceRepository);
    if (!normalized.ok) errors.push(...normalized.errors);
    if (!isRecord(sourceAssignments)) {
      errors.push({ field: "assignments", code: "EXPECTED_OBJECT" });
    }
    if (errors.length) return envelope(false, "INVALID_CHECKLIST_INPUT", null, errors);

    const assignments = {};
    rule.requiredDocumentCodes.forEach(requirementCode => {
      const checked = normalizeRequirementLinks(sourceAssignments[requirementCode] || [], `assignments.${requirementCode}`);
      errors.push(...checked.errors);
      assignments[requirementCode] = checked.values || [];
    });
    if (errors.length) return envelope(false, "INVALID_CHECKLIST_INPUT", null, errors);

    const repositoryByVersionId = new Map(normalized.result.map(item => [item.versionId, item]));
    const requirements = rule.requiredDocumentCodes.map(requirementCode => {
      const assignedLinks = assignments[requirementCode];
      const assignedVersionIds = assignedLinks.map(link => link.versionId);
      if (assignedLinks.length === 0) {
        return {
          requirementCode,
          complete: false,
          assignedVersionIds: [],
          satisfiedVersionIds: [],
          failures: [{ code: "NO_VERSION_ASSIGNED", versionId: null, availability: null }]
        };
      }
      const satisfiedVersionIds = [];
      const failures = [];
      assignedLinks.forEach(link => {
        const versionId = link.versionId;
        const documentVersion = repositoryByVersionId.get(versionId);
        if (!documentVersion) {
          failures.push({ code: "VERSION_NOT_FOUND", versionId, availability: null });
        } else if (documentVersion.availability === DOCUMENT_AVAILABILITY.AVAILABLE) {
          const canonical = validationContext ? validateCanonicalDocumentVersion(documentVersion, validationContext) : { ok: true };
          if (!canonical.ok) {
            failures.push({ code: canonical.code, versionId, availability: documentVersion.availability });
            return;
          }
          const olderVersionConfirmed = link.oldVersionConfirmed === true && Boolean(link.oldVersionReason);
          if (!documentVersion.isLatest && !olderVersionConfirmed) {
            failures.push({
              code: "OLD_VERSION_CONFIRMATION_REQUIRED",
              versionId,
              availability: documentVersion.availability,
              latestVersionId: documentVersion.latestVersionId
            });
          } else {
            satisfiedVersionIds.push(versionId);
          }
        } else {
          failures.push({ code: documentVersion.availability, versionId, availability: documentVersion.availability });
        }
      });
      return {
        requirementCode,
        complete: satisfiedVersionIds.length > 0,
        assignedVersionIds: [...assignedVersionIds],
        satisfiedVersionIds,
        failures
      };
    });
    const missingDocumentCodes = requirements
      .filter(requirement => !requirement.complete)
      .map(requirement => requirement.requirementCode);
    return envelope(true, "CHECKLIST_EVALUATED", {
      extensionType,
      formId: rule.formId,
      complete: missingDocumentCodes.length === 0,
      requiredDocumentCodes: [...rule.requiredDocumentCodes],
      missingDocumentCodes,
      requirements
    }, []);
  }

  function createUploadedDocumentVersion(sourceMetadata, sourceInjection) {
    const errors = [];
    if (!isRecord(sourceMetadata)) errors.push({ field: "metadata", code: "EXPECTED_OBJECT" });
    if (!isRecord(sourceInjection)) errors.push({ field: "injection", code: "EXPECTED_OBJECT" });
    const metadata = isRecord(sourceMetadata) ? sourceMetadata : {};
    const artifactId = asText(metadata.artifactId) || asText(metadata.documentId);
    const version = metadata.version ?? metadata.versionNo;
    const validVersion = (typeof version === "number" && Number.isFinite(version) && version > 0)
      || (typeof version === "string" && Boolean(version.trim()));
    const name = asText(metadata.name) || asText(metadata.title) || asText(metadata.fileName);
    const documentType = asText(metadata.documentType);
    if (isRecord(sourceMetadata) && !artifactId) errors.push({ field: "metadata.artifactId", code: "REQUIRED" });
    if (isRecord(sourceMetadata) && !validVersion) errors.push({ field: "metadata.version", code: "REQUIRED" });
    if (isRecord(sourceMetadata) && !name) errors.push({ field: "metadata.name", code: "REQUIRED" });
    if (isRecord(sourceMetadata) && !documentType) errors.push({ field: "metadata.documentType", code: "REQUIRED" });
    const injection = isRecord(sourceInjection) ? sourceInjection : {};
    const versionId = asText(injection.versionId);
    const actorId = asText(injection.actorId);
    const at = asText(injection.at);
    if (!versionId) errors.push({ field: "injection.versionId", code: "REQUIRED" });
    if (!actorId) errors.push({ field: "injection.actorId", code: "REQUIRED" });
    if (!at) errors.push({ field: "injection.at", code: "REQUIRED" });
    if (errors.length) return envelope(false, "INVALID_UPLOAD_METADATA", null, errors);

    const result = clone(sourceMetadata);
    delete result.requirementCode;
    delete result.requirementCodes;
    result.artifactId = artifactId;
    result.version = version;
    result.name = name;
    result.documentType = documentType;
    result.versionId = versionId;
    result.source = "UPLOAD";
    result.availability = DOCUMENT_AVAILABILITY.UPLOAD_PENDING;
    result.binaryPersisted = false;
    result.latestVersionId = versionId;
    result.isLatest = true;
    result.createdBy = actorId;
    result.createdAt = at;
    return envelope(true, "UPLOAD_VERSION_CREATED", result, []);
  }

  function snapshotSelectedDocuments(sourceRepository, sourceSelectedVersionIds, sourceAssignments = {}) {
    const errors = [];
    const normalized = normalizeExtensionRepository(sourceRepository);
    if (!normalized.ok) errors.push(...normalized.errors);
    const selected = normalizeVersionIds(sourceSelectedVersionIds, "selectedVersionIds");
    errors.push(...selected.errors);
    if (!isRecord(sourceAssignments)) {
      errors.push({ field: "assignments", code: "EXPECTED_OBJECT" });
    }
    const knownRequirementCodes = requiredDocumentCodeSet();
    const assignmentCopy = {};
    const assignmentLinks = {};
    if (isRecord(sourceAssignments)) {
      Object.entries(sourceAssignments).forEach(([requirementCode, versionIds]) => {
        if (!knownRequirementCodes.has(requirementCode)) {
          errors.push({ field: `assignments.${requirementCode}`, code: "UNKNOWN_REQUIREMENT_CODE" });
          return;
        }
        const checked = normalizeRequirementLinks(versionIds, `assignments.${requirementCode}`);
        errors.push(...checked.errors);
        assignmentLinks[requirementCode] = checked.values || [];
        assignmentCopy[requirementCode] = checked.values ? serializeRequirementLinks(versionIds, checked.values) : [];
      });
    }
    const repositoryByVersionId = normalized.ok
      ? new Map(normalized.result.map(item => [item.versionId, item]))
      : new Map();
    const selectedSet = new Set(selected.values || []);
    (selected.values || []).forEach(versionId => {
      if (!repositoryByVersionId.has(versionId)) {
        errors.push({ field: "selectedVersionIds", code: "VERSION_NOT_FOUND", versionId });
      }
    });
    Object.entries(assignmentLinks).forEach(([requirementCode, links]) => {
      links.forEach(({ versionId }) => {
        if (!selectedSet.has(versionId)) {
          errors.push({ field: `assignments.${requirementCode}`, code: "VERSION_NOT_SELECTED", versionId });
        }
      });
    });
    if (errors.length) return envelope(false, "INVALID_DOCUMENT_SNAPSHOT", null, errors);

    return envelope(true, "DOCUMENT_SNAPSHOT_CREATED", {
      selectedVersionIds: [...selected.values],
      documents: selected.values.map(versionId => clone(repositoryByVersionId.get(versionId))),
      requirementAssignments: clone(assignmentCopy)
    }, []);
  }

  function fingerprint(value) {
    if (value === null || typeof value !== "object") return JSON.stringify(value);
    if (Array.isArray(value)) return `[${value.map(fingerprint).join(",")}]`;
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${fingerprint(value[key])}`).join(",")}}`;
  }

  function adaptDocumentStoreVersion(source = {}) {
    const record = isRecord(source.record) ? source.record : null;
    const caseId = asText(source.caseId);
    const reportType = asText(source.reportType);
    const documentType = asText(source.documentType);
    if (!record || !caseId || !["213", "644"].includes(reportType) || !documentType || !record.submittedSnapshot
      || !Number.isInteger(record.revisionNo) || record.revisionNo < 1 || asText(record.caseId) !== caseId) {
      return envelope(false, "DOCUMENT_ARTIFACT_NOT_IMMUTABLE", null, [{ field: "record.submittedSnapshot" }]);
    }
    const allowedIds = {
      CASE_PLAN: reportType === "213" ? "FORM_1_CASE_PLAN" : "FORM_1_CASE_PLAN_644",
      WORK_LOG: reportType === "213" ? "ACTIVITY5_DAILY_WORKLOG" : "ACTIVITY5_DAILY_WORKLOG_644"
    };
    if (allowedIds[documentType] !== record.documentId) return envelope(false, "DOCUMENT_SCOPE_MISMATCH", null, [{ field: "record.documentId" }]);
    const snapshotFingerprint = asText(record.submittedSnapshot.snapshotFingerprint);
    if (!snapshotFingerprint) return envelope(false, "DOCUMENT_ARTIFACT_NOT_IMMUTABLE", null, [{ field: "record.submittedSnapshot.snapshotFingerprint" }]);
    if (documentDomain?.fingerprintA5SubmittedSnapshot?.(record.submittedSnapshot) !== snapshotFingerprint) return envelope(false, "DOCUMENT_SNAPSHOT_TAMPERED", null, [{ field: "record.submittedSnapshot.snapshotFingerprint" }]);
    return envelope(true, "DOCUMENT_STORE_VERSION_ADAPTED", {
      artifactId: `${caseId}:${record.documentId}`,
      versionId: `${caseId}:${record.documentId}:r${record.revisionNo}`,
      version: record.revisionNo,
      documentType,
      reportType,
      name: documentType === "CASE_PLAN" ? `แผนงานคดี ${reportType}` : `บันทึกการปฏิบัติงาน ${reportType}`,
      source: "A5_DOCUMENT_STORE",
      createdAt: asText(record.submittedSnapshot.submittedAt) || asText(record.updatedAt) || asText(record.createdAt),
      availability: DOCUMENT_AVAILABILITY.AVAILABLE,
      binaryPersisted: false,
      storageRef: null,
      integrity: null,
      signedArtifactRef: { store: "A5_DOCUMENT_STORE", documentId: record.documentId, revisionNo: record.revisionNo, snapshotFingerprint },
      lineage: { caseId, sourceDocumentId: record.documentId, sourceRevisionNo: record.revisionNo, sourceVersionId: null, sourceEvent: "DOCUMENT_SUBMITTED" },
      semantic: clone(record.semantic || {})
    });
  }

  function adaptSignedEvidenceVersion(source = {}) {
    const artifact = isRecord(source.signedArtifact) ? source.signedArtifact : null;
    const caseId = asText(source.caseId);
    const documentType = asText(source.documentType);
    const semantic = isRecord(source.semantic) ? clone(source.semantic) : {};
    if (!artifact || !caseId || !documentType || !asText(artifact.documentId) || !Number.isInteger(artifact.revisionNo)
      || !artifact.immutableSnapshot || !asText(artifact.snapshotFingerprint)
      || fingerprint(artifact.immutableSnapshot) !== artifact.snapshotFingerprint) {
      return envelope(false, "DOCUMENT_ARTIFACT_NOT_IMMUTABLE", null, [{ field: "signedArtifact" }]);
    }
    return envelope(true, "SIGNED_EVIDENCE_VERSION_ADAPTED", {
      artifactId: `${caseId}:${artifact.documentId}`,
      versionId: `${caseId}:${artifact.documentId}:r${artifact.revisionNo}`,
      version: artifact.revisionNo,
      documentType,
      reportType: source.reportType || null,
      name: asText(artifact.name) || documentType,
      source: asText(artifact.source) || "SIGNED_EXTERNAL",
      createdAt: asText(artifact.signedAt) || asText(artifact.createdAt),
      availability: DOCUMENT_AVAILABILITY.AVAILABLE,
      binaryPersisted: false,
      storageRef: null,
      integrity: null,
      signedArtifactRef: { store: asText(artifact.store) || "EXTERNAL_REGISTER", documentId: artifact.documentId, revisionNo: artifact.revisionNo, snapshotFingerprint: artifact.snapshotFingerprint },
      lineage: { caseId, sourceDocumentId: artifact.documentId, sourceRevisionNo: artifact.revisionNo, sourceVersionId: null, sourceEvent: asText(artifact.sourceEvent) || "SIGNED_ARTIFACT_REGISTERED" },
      semantic
    });
  }

  function registerA4ReceivedDateEvidence(sourceState, sourceCommand = {}) {
    const state = clone(sourceState);
    const caseId = asText(state.caseData?.id);
    const receivedAt = asText(sourceCommand.receivedAt);
    const versions = Array.isArray(state.documentVersions) ? state.documentVersions : [];
    const signedVersion = versions.filter(item => item?.status === "signed" && item?.signedSnapshot?.division).sort((left, right) => Number(right.version) - Number(left.version))[0];
    const immutableSnapshot = signedVersion?.signedSnapshot?.division;
    if (!caseId || !receivedAt || !immutableSnapshot || !Number.isInteger(Number(signedVersion.version))) return envelope(false, "A4_SIGNED_RECEIVED_EVIDENCE_REQUIRED", null, [{ field: "documentVersions" }]);
    const canonicalReceivedAt = asText(state.inquiry?.intake?.receivedFirstAt) || asText(state.caseData?.received);
    if (!canonicalReceivedAt || receivedAt !== canonicalReceivedAt) return envelope(false, "RECEIVED_DATE_EVIDENCE_MISMATCH", null, [{ field: "receivedAt" }]);
    state.inquiry = isRecord(state.inquiry) ? state.inquiry : {};
    state.inquiry.extensionSignedArtifacts = Array.isArray(state.inquiry.extensionSignedArtifacts) ? state.inquiry.extensionSignedArtifacts : [];
    const documentId = `A4_INBOUND_RECEIVED_DATE_${signedVersion.version}`;
    if (!state.inquiry.extensionSignedArtifacts.some(item => item.documentId === documentId && item.revisionNo === Number(signedVersion.version))) {
      state.inquiry.extensionSignedArtifacts.push({ documentId, revisionNo: Number(signedVersion.version), name: "หลักฐานวันรับเรื่องจากฉบับลงนามกิจกรรมที่ 4", source: "A4_SIGNED_HANDOFF", sourceEvent: "A4_DISPATCHED", store: "A4_DOCUMENT_STORE", immutableSnapshot: clone(immutableSnapshot), snapshotFingerprint: fingerprint(immutableSnapshot), signedAt: asText(immutableSnapshot.capturedAt) || asText(signedVersion.lastSignedAt), documentType: "RECEIVED_DATE_EVIDENCE", semantic: { receivedAt } });
    }
    return { ...envelope(true, "A4_RECEIVED_DATE_EVIDENCE_REGISTERED", state.inquiry.extensionSignedArtifacts, []), state };
  }

  function registerSignedAppointmentOrder(sourceState, sourceCommand = {}) {
    const state = clone(sourceState), artifact = clone(sourceCommand.signedArtifact);
    const caseId = asText(state.caseData?.id);
    if (!caseId || !isRecord(artifact) || !artifact.immutableSnapshot || !asText(artifact.snapshotFingerprint)
      || fingerprint(artifact.immutableSnapshot) !== artifact.snapshotFingerprint || !Number.isInteger(artifact.revisionNo)
      || !asText(artifact.documentId) || !asText(artifact.signedAt)) return envelope(false, "SIGNED_APPOINTMENT_ORDER_REQUIRED", null, [{ field: "signedArtifact" }]);
    artifact.documentType = "INQUIRY_APPOINTMENT_ORDER";
    artifact.source = asText(artifact.source) || "SIGNED_EXTERNAL";
    artifact.sourceEvent = asText(artifact.sourceEvent) || "SIGNED_ARTIFACT_REGISTERED";
    artifact.store = asText(artifact.store) || "EXTERNAL_REGISTER";
    artifact.semantic = clone(sourceCommand.semantic || artifact.semantic || {});
    const adapted = adaptSignedEvidenceVersion({ caseId, reportType: "644", documentType: artifact.documentType, signedArtifact: artifact, semantic: artifact.semantic });
    if (!adapted.ok) return adapted;
    state.inquiry = isRecord(state.inquiry) ? state.inquiry : {};
    state.inquiry.extensionSignedArtifacts = Array.isArray(state.inquiry.extensionSignedArtifacts) ? state.inquiry.extensionSignedArtifacts : [];
    if (state.inquiry.extensionSignedArtifacts.some(item => item.documentId === artifact.documentId && item.revisionNo === artifact.revisionNo)) return envelope(false, "SIGNED_ARTIFACT_ALREADY_REGISTERED", null, [{ field: "signedArtifact.documentId" }]);
    state.inquiry.extensionSignedArtifacts.push(artifact);
    return { ...envelope(true, "SIGNED_APPOINTMENT_ORDER_REGISTERED", state.inquiry.extensionSignedArtifacts, []), state };
  }

  function finalizeUploadedDocumentVersion(sourcePending, sourceCommand = {}) {
    const pending = isRecord(sourcePending) ? clone(sourcePending) : null;
    const storageRef = asText(sourceCommand.storageRef);
    const sha256 = asText(sourceCommand.sha256);
    if (!pending || pending.availability !== DOCUMENT_AVAILABILITY.UPLOAD_PENDING) return envelope(false, "INVALID_TRANSITION", null, [{ field: "pendingVersion" }]);
    if (!storageRef) return envelope(false, "DOCUMENT_BINARY_NOT_PERSISTED", null, [{ field: "storageRef" }]);
    if (!/^[a-fA-F0-9]{64}$/.test(sha256)) return envelope(false, "DOCUMENT_INTEGRITY_MISSING", null, [{ field: "sha256" }]);
    pending.availability = DOCUMENT_AVAILABILITY.AVAILABLE;
    pending.binaryPersisted = true;
    pending.storageRef = storageRef;
    pending.integrity = { algorithm: "SHA-256", digest: sha256.toLowerCase() };
    pending.persistedAt = asText(sourceCommand.persistedAt);
    pending.persistedBy = asText(sourceCommand.actorId);
    pending.lineage = { ...(pending.lineage || {}), sourceEvent: "UPLOAD_PERSISTED" };
    return envelope(true, "UPLOAD_VERSION_FINALIZED", pending);
  }

  function validateCanonicalDocumentVersion(sourceVersion, context = {}) {
    const version = isRecord(sourceVersion) ? sourceVersion : null;
    if (!version) return envelope(false, "DOCUMENT_VERSION_NOT_FOUND", null, [{ field: "version" }]);
    if (version.availability !== DOCUMENT_AVAILABILITY.AVAILABLE) return envelope(false, "DOCUMENT_VERSION_UNAVAILABLE", null, [{ field: "availability" }]);
    if (asText(version.lineage?.caseId) !== asText(context.caseId) || !asText(version.lineage?.sourceDocumentId)) return envelope(false, "DOCUMENT_LINEAGE_MISSING", null, [{ field: "lineage" }]);
    const immutableRef = version.signedArtifactRef && asText(version.signedArtifactRef.snapshotFingerprint);
    const persistedBinary = version.binaryPersisted === true && asText(version.storageRef) && version.integrity?.algorithm === "SHA-256" && /^[a-fA-F0-9]{64}$/.test(asText(version.integrity?.digest));
    if (!immutableRef && !persistedBinary) return envelope(false, version.binaryPersisted ? "DOCUMENT_INTEGRITY_MISSING" : "DOCUMENT_ARTIFACT_NOT_IMMUTABLE", null, [{ field: "artifact" }]);
    if (["CASE_PLAN", "WORK_LOG"].includes(version.documentType)) {
      const expectedDocumentId = version.documentType === "CASE_PLAN"
        ? (context.reportType === "213" ? "FORM_1_CASE_PLAN" : "FORM_1_CASE_PLAN_644")
        : (context.reportType === "213" ? "ACTIVITY5_DAILY_WORKLOG" : "ACTIVITY5_DAILY_WORKLOG_644");
      if (version.reportType !== context.reportType || version.lineage.sourceDocumentId !== expectedDocumentId) return envelope(false, "DOCUMENT_SCOPE_MISMATCH", null, [{ field: "reportType" }]);
    }
    if (version.documentType === "RECEIVED_DATE_EVIDENCE") {
      if (!["A4_SIGNED_HANDOFF", "SIGNED_EXTERNAL"].includes(version.source)
        || !["A4_DISPATCHED", "SIGNED_ARTIFACT_REGISTERED"].includes(version.lineage.sourceEvent)) return envelope(false, "DOCUMENT_SCOPE_MISMATCH", null, [{ field: "source" }]);
      if (version.semantic?.receivedAt !== context.deadlineBasis?.startedAt) return envelope(false, "RECEIVED_DATE_EVIDENCE_MISMATCH", null, [{ field: "semantic.receivedAt" }]);
    }
    if (version.documentType === "INQUIRY_APPOINTMENT_ORDER") {
      if (!["A4_SIGNED_HANDOFF", "SIGNED_EXTERNAL"].includes(version.source)
        || !["SIGNED_ARTIFACT_REGISTERED", "A4_DISPATCHED"].includes(version.lineage.sourceEvent)) return envelope(false, "DOCUMENT_SCOPE_MISMATCH", null, [{ field: "source" }]);
      const appointment = context.appointmentContext || {};
      for (const field of ["orderNo", "orderType", "orderDate", "panelFingerprint"]) {
        if (!version.semantic?.[field] || version.semantic[field] !== appointment[field]) return envelope(false, "APPOINTMENT_ORDER_MISMATCH", null, [{ field: `semantic.${field}` }]);
      }
    }
    return envelope(true, "DOCUMENT_VERSION_VALID", clone(version));
  }

  function buildExtensionRepository(source = {}) {
    const state = source.state;
    const caseId = asText(state?.caseData?.id);
    const reportType = asText(source.reportType);
    if (!caseId || !["213", "644"].includes(reportType)) return envelope(false, "INVALID_REPOSITORY", null, [{ field: "state" }]);
    const repository = [];
    const records = Array.isArray(state.a5DocumentStore?.records) ? state.a5DocumentStore.records : [];
    for (const documentType of ["CASE_PLAN", "WORK_LOG"]) {
      records.filter(record => record?.submittedSnapshot).forEach(record => {
        const adapted = adaptDocumentStoreVersion({ caseId, reportType, documentType, record });
        if (adapted.ok) repository.push(adapted.result);
      });
    }
    const signedArtifacts = Array.isArray(state.inquiry?.extensionSignedArtifacts) ? state.inquiry.extensionSignedArtifacts : [];
    signedArtifacts.forEach(item => {
      const adapted = adaptSignedEvidenceVersion({ caseId, reportType, documentType: item.documentType, signedArtifact: item, semantic: item.semantic });
      if (adapted.ok) repository.push(adapted.result);
    });
    return normalizeExtensionRepository(repository);
  }

  const api = Object.freeze({
    DOCUMENT_AVAILABILITY,
    normalizeExtensionRepository,
    filterExtensionDocuments,
    updateVisibleSelection,
    assignRequirement,
    evaluateExtensionDocumentChecklist,
    createUploadedDocumentVersion,
    finalizeUploadedDocumentVersion,
    adaptDocumentStoreVersion,
    adaptSignedEvidenceVersion,
    registerA4ReceivedDateEvidence,
    registerSignedAppointmentOrder,
    validateCanonicalDocumentVersion,
    buildExtensionRepository,
    snapshotSelectedDocuments
  });

  root.ECMISActivity5ExtensionDocuments = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
