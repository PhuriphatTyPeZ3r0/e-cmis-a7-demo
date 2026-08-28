import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createRequire } from "node:module";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const documents = require("../assets/activity5-extension-documents.js");
const stable = value => value === null || typeof value !== "object" ? JSON.stringify(value) : Array.isArray(value) ? `[${value.map(stable).join(",")}]` : `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}`;

function canonicalVersion(index, overrides = {}) {
  const sequence = String(index).padStart(3, "0");
  return {
    artifactId: `artifact-${sequence}`,
    versionId: `artifact-${sequence}-v1`,
    version: 1,
    name: `บันทึกทั่วไป ${sequence}`,
    documentType: "WORK_LOG",
    source: "ACTIVITY_5",
    documentNumber: `ทั่วไป ${sequence}`,
    reference: `REF-${sequence}`,
    availability: "REFERENCE_ONLY",
    createdAt: `2026-07-${String((index % 28) + 1).padStart(2, "0")}T00:00:00.000Z`,
    ...overrides
  };
}

test("normalizes canonical document versions with deterministic lineage without mutating metadata", () => {
  const source = [
    {
      artifactId: "doc-plan",
      versionId: "doc-plan-v2",
      version: 2,
      name: "แผนดำเนินการ",
      documentType: "CASE_PLAN",
      source: "ACTIVITY_5",
      documentNumber: "ปปท 0004/2",
      reference: "CASE-001",
      availability: "AVAILABLE",
      createdBy: "officer-1",
      createdAt: "2026-08-14T02:00:00.000Z",
      metadata: { pageCount: 3 }
    },
    {
      artifactId: "doc-plan",
      versionId: "doc-plan-v1",
      version: 1,
      name: "แผนดำเนินการ",
      documentType: "CASE_PLAN",
      source: "ACTIVITY_5",
      documentNumber: "ปปท 0004/1",
      reference: "CASE-001",
      availability: "AVAILABLE",
      createdBy: "officer-1",
      createdAt: "2026-08-13T02:00:00.000Z",
      metadata: { pageCount: 2 }
    }
  ];
  const before = structuredClone(source);
  const response = documents.normalizeExtensionRepository(source);

  assert.equal(response.ok, true);
  assert.equal(response.code, "REPOSITORY_NORMALIZED");
  assert.deepEqual(response.result.map(item => ({
    artifactId: item.artifactId,
    versionId: item.versionId,
    version: item.version,
    name: item.name,
    documentType: item.documentType,
    source: item.source,
    documentNumber: item.documentNumber,
    reference: item.reference,
    previousVersionId: item.previousVersionId,
    latestVersionId: item.latestVersionId,
    isLatest: item.isLatest
  })), [
    {
      artifactId: "doc-plan",
      versionId: "doc-plan-v2",
      version: 2,
      name: "แผนดำเนินการ",
      documentType: "CASE_PLAN",
      source: "ACTIVITY_5",
      documentNumber: "ปปท 0004/2",
      reference: "CASE-001",
      previousVersionId: "doc-plan-v1",
      latestVersionId: "doc-plan-v2",
      isLatest: true
    },
    {
      artifactId: "doc-plan",
      versionId: "doc-plan-v1",
      version: 1,
      name: "แผนดำเนินการ",
      documentType: "CASE_PLAN",
      source: "ACTIVITY_5",
      documentNumber: "ปปท 0004/1",
      reference: "CASE-001",
      previousVersionId: null,
      latestVersionId: "doc-plan-v2",
      isLatest: false
    }
  ]);
  assert.notEqual(response.result, source);
  assert.notEqual(response.result[0], source[0]);
  assert.notEqual(response.result[0].metadata, source[0].metadata);
  assert.equal(response.result.every(item => !Object.hasOwn(item, "requirementCode") && !Object.hasOwn(item, "requirementCodes")), true);
  assert.deepEqual(source, before);
  assert.deepEqual(Object.keys(response).sort(), ["code", "errors", "ok", "result"]);
});

test("rejects repository versions missing the required canonical schema fields", () => {
  const repository = [{
    versionId: "orphan-v1",
    availability: "AVAILABLE"
  }];
  const before = structuredClone(repository);
  const response = documents.normalizeExtensionRepository(repository);

  assert.equal(response.ok, false);
  assert.equal(response.code, "INVALID_REPOSITORY");
  assert.equal(response.result, null);
  assert.deepEqual(response.errors.map(error => error.field), [
    "repository[0].artifactId",
    "repository[0].version",
    "repository[0].name",
    "repository[0].documentType",
    "repository[0].source",
    "repository[0].createdAt"
  ]);
  assert.deepEqual(repository, before);
});

test("combines canonical search, filters, latest mode, sorting, and pagination across 25 versions", () => {
  const targetVersions = [1, 2, 3].flatMap(target => [1, 2].map(version => canonicalVersion(target, {
    artifactId: `target-${target}`,
    versionId: `target-${target}-v${version}`,
    version,
    name: `แผนงานคดี ต่ออายุ ${target}`,
    documentType: "CASE_PLAN",
    source: "ACTIVITY_4",
    documentNumber: `ปปท 0004/T${target}`,
    reference: `CASE-TARGET-${target}`,
    availability: "AVAILABLE",
    createdAt: `2026-08-${String(target * 2 + version).padStart(2, "0")}T00:00:00.000Z`
  })));
  const repository = [...targetVersions, ...Array.from({ length: 19 }, (_, index) => canonicalVersion(index + 10))];
  const assignmentLinks = targetVersions.map(item => ({
    requestId: "EXT-001",
    revisionNo: 1,
    requirementCode: "CASE_PLAN",
    documentVersionId: item.versionId
  }));
  const before = structuredClone(repository);
  const beforeAssignments = structuredClone(assignmentLinks);
  const response = documents.filterExtensionDocuments(repository, {
    search: "แผนงานคดี",
    documentType: ["CASE_PLAN"],
    source: ["ACTIVITY_4"],
    requirementCode: ["CASE_PLAN"],
    requestId: "EXT-001",
    revisionNo: 1,
    availability: ["AVAILABLE"],
    latestMode: "LATEST",
    sortBy: "createdAt",
    sortDirection: "desc",
    offset: 1,
    limit: 2
  }, assignmentLinks);

  assert.equal(response.ok, true);
  assert.equal(response.code, "DOCUMENTS_FILTERED");
  assert.deepEqual(response.result.items.map(item => item.versionId), ["target-2-v2", "target-1-v2"]);
  assert.equal(response.result.total, 3);
  assert.equal(response.result.offset, 1);
  assert.equal(response.result.limit, 2);
  assert.deepEqual(repository, before);
  assert.deepEqual(assignmentLinks, beforeAssignments);
});

test("rejects unsupported repository query keys instead of silently ignoring them", () => {
  const repository = [canonicalVersion(1)];
  const before = structuredClone(repository);
  const response = documents.filterExtensionDocuments(repository, {
    source: ["ACTIVITY_5"],
    ownerId: "officer-1",
    requirement: "WORK_LOG"
  });

  assert.equal(response.ok, false);
  assert.equal(response.code, "INVALID_FILTER");
  assert.deepEqual(response.errors, [
    { field: "options.ownerId", code: "UNSUPPORTED_FILTER" },
    { field: "options.requirement", code: "UNSUPPORTED_FILTER" }
  ]);
  assert.deepEqual(repository, before);
});

test("rejects malformed values for every supported repository query dimension", () => {
  const repository = [canonicalVersion(1)];
  const malformedQueries = [
    { search: 42 },
    { documentType: { value: "WORK_LOG" } },
    { source: ["ACTIVITY_5", null] },
    { requirementCode: [""] },
    { availability: {} },
    { latestMode: "CURRENT" },
    { sortBy: "artifactId" },
    { sortDirection: "sideways" },
    { offset: -1 },
    { limit: 1.5 }
  ];

  for (const query of malformedQueries) {
    const response = documents.filterExtensionDocuments(repository, query);
    assert.equal(response.ok, false, JSON.stringify(query));
    assert.equal(response.code, "INVALID_FILTER");
    assert.equal(response.result, null);
    assert.equal(response.errors.length > 0, true);
  }
});

test("requires and strictly validates separate requirement assignment links without mutating inputs", () => {
  const repository = [canonicalVersion(1, {
    versionId: "plan-v1",
    documentType: "WORK_LOG",
    availability: "AVAILABLE"
  })];
  const beforeRepository = structuredClone(repository);

  const missingContext = documents.filterExtensionDocuments(repository, {
    requirementCode: "CASE_PLAN",
    requestId: "EXT-001",
    revisionNo: 1
  });
  assert.deepEqual(missingContext, {
    ok: false,
    code: "INVALID_FILTER",
    result: null,
    errors: [{ field: "assignmentLinks", code: "REQUIRED" }]
  });

  const malformedAssignments = [
    null,
    { requestId: "EXT-001", revisionNo: 1, requirementCode: "", documentVersionId: "plan-v1" },
    { requestId: "EXT-001", revisionNo: 1, requirementCode: "CASE_PLAN" },
    {
      requestId: "EXT-001",
      revisionNo: 1,
      requirementCode: "CASE_PLAN",
      documentVersionId: "plan-v1",
      versionId: "other-v1"
    },
    { requestId: "EXT-001", revisionNo: 1, requirementCode: "CASE_PLAN", documentVersionId: "missing-v1" },
    { requestId: 99, revisionNo: 1, requirementCode: "CASE_PLAN", documentVersionId: "plan-v1" },
    { requestId: "EXT-001", revisionNo: 0, requirementCode: "CASE_PLAN", documentVersionId: "plan-v1" }
  ];
  const beforeAssignments = structuredClone(malformedAssignments);
  const malformed = documents.filterExtensionDocuments(repository, {
    requirementCode: "CASE_PLAN",
    requestId: "EXT-001",
    revisionNo: 1
  }, malformedAssignments);

  assert.equal(malformed.ok, false);
  assert.equal(malformed.code, "INVALID_FILTER");
  assert.equal(malformed.result, null);
  assert.deepEqual(malformed.errors.map(error => error.code), [
    "EXPECTED_OBJECT",
    "REQUIRED",
    "REQUIRED",
    "VERSION_ID_MISMATCH",
    "VERSION_NOT_FOUND",
    "INVALID_REQUEST_ID",
    "INVALID_REVISION_NO"
  ]);
  assert.deepEqual(repository, beforeRepository);
  assert.deepEqual(malformedAssignments, beforeAssignments);
});

test("requirement filtering never unions assignment links across requests or revisions", () => {
  const repository = [
    canonicalVersion(1, { versionId: "request-a-revision-1-v1", availability: "AVAILABLE" }),
    canonicalVersion(2, { versionId: "request-a-revision-2-v1", availability: "AVAILABLE" }),
    canonicalVersion(3, { versionId: "request-b-revision-2-v1", availability: "AVAILABLE" })
  ];
  const assignmentLinks = [
    {
      requestId: "EXT-A",
      revisionNo: 1,
      requirementCode: "CASE_PLAN",
      documentVersionId: "request-a-revision-1-v1"
    },
    {
      requestId: "EXT-A",
      revisionNo: 2,
      requirementCode: "CASE_PLAN",
      documentVersionId: "request-a-revision-2-v1"
    },
    {
      requestId: "EXT-B",
      revisionNo: 2,
      requirementCode: "CASE_PLAN",
      documentVersionId: "request-b-revision-2-v1"
    }
  ];
  const options = {
    requirementCode: "CASE_PLAN",
    requestId: "EXT-A",
    revisionNo: 2,
    sortBy: "version"
  };
  const beforeRepository = structuredClone(repository);
  const beforeAssignments = structuredClone(assignmentLinks);
  const beforeOptions = structuredClone(options);
  const response = documents.filterExtensionDocuments(repository, options, assignmentLinks);

  assert.equal(response.ok, true);
  assert.deepEqual(response.result.items.map(item => item.versionId), ["request-a-revision-2-v1"]);
  assert.deepEqual(repository, beforeRepository);
  assert.deepEqual(assignmentLinks, beforeAssignments);
  assert.deepEqual(options, beforeOptions);
});

test("requirement filtering rejects missing or malformed request and revision scope", () => {
  const repository = [canonicalVersion(1, { versionId: "plan-v1", availability: "AVAILABLE" })];
  const validAssignmentLinks = [{
    requestId: "EXT-001",
    revisionNo: 1,
    requirementCode: "CASE_PLAN",
    documentVersionId: "plan-v1"
  }];
  const invalidOptions = [
    { requirementCode: "CASE_PLAN", revisionNo: 1 },
    { requirementCode: "CASE_PLAN", requestId: "EXT-001" },
    { requirementCode: "CASE_PLAN", requestId: 99, revisionNo: 1 },
    { requirementCode: "CASE_PLAN", requestId: "   ", revisionNo: 1 },
    { requirementCode: "CASE_PLAN", requestId: "EXT-001", revisionNo: 0 },
    { requirementCode: "CASE_PLAN", requestId: "EXT-001", revisionNo: 1.5 }
  ];

  for (const options of invalidOptions) {
    const response = documents.filterExtensionDocuments(repository, options, validAssignmentLinks);
    assert.equal(response.ok, false, JSON.stringify(options));
    assert.equal(response.code, "INVALID_FILTER");
    assert.equal(response.result, null);
  }

  const missingLinkScopes = [
    { revisionNo: 1, requirementCode: "CASE_PLAN", documentVersionId: "plan-v1" },
    { requestId: "EXT-001", requirementCode: "CASE_PLAN", documentVersionId: "plan-v1" }
  ];
  const beforeRepository = structuredClone(repository);
  const beforeAssignments = structuredClone(missingLinkScopes);
  const response = documents.filterExtensionDocuments(repository, {
    requirementCode: "CASE_PLAN",
    requestId: "EXT-001",
    revisionNo: 1
  }, missingLinkScopes);

  assert.equal(response.ok, false);
  assert.equal(response.code, "INVALID_FILTER");
  assert.deepEqual(response.errors.map(error => error.code), ["REQUIRED", "REQUIRED"]);
  assert.deepEqual(repository, beforeRepository);
  assert.deepEqual(missingLinkScopes, beforeAssignments);
});

test("scope and assignment links do not affect a query without a requirement filter", () => {
  const repository = [
    canonicalVersion(1, { versionId: "doc-a-v1", name: "ก เอกสาร" }),
    canonicalVersion(2, { versionId: "doc-b-v1", name: "ข เอกสาร" })
  ];
  const irrelevantAssignments = [null, {
    requestId: "",
    revisionNo: 0,
    requirementCode: "",
    documentVersionId: "missing-v1"
  }];
  const beforeRepository = structuredClone(repository);
  const beforeAssignments = structuredClone(irrelevantAssignments);
  const response = documents.filterExtensionDocuments(repository, {
    requestId: 99,
    revisionNo: "invalid",
    sortBy: "name"
  }, irrelevantAssignments);

  assert.equal(response.ok, true);
  assert.deepEqual(response.result.items.map(item => item.versionId), ["doc-a-v1", "doc-b-v1"]);
  assert.deepEqual(repository, beforeRepository);
  assert.deepEqual(irrelevantAssignments, beforeAssignments);
});

test("requirement filtering follows exact assignment links and never infers from document type", () => {
  const repository = [
    canonicalVersion(1, {
      versionId: "assigned-v1",
      documentType: "WORK_LOG",
      availability: "AVAILABLE"
    }),
    canonicalVersion(2, {
      versionId: "same-type-unassigned-v1",
      documentType: "CASE_PLAN",
      availability: "AVAILABLE"
    })
  ];
  const assignmentLinks = [{
    requestId: "EXT-001",
    revisionNo: 3,
    requirementCode: "CASE_PLAN",
    documentVersionId: "assigned-v1"
  }];
  const response = documents.filterExtensionDocuments(repository, {
    requirementCode: "CASE_PLAN",
    requestId: "EXT-001",
    revisionNo: 3
  }, assignmentLinks);

  assert.equal(response.ok, true);
  assert.deepEqual(response.result.items.map(item => item.versionId), ["assigned-v1"]);
});

test("combines canonical reference search and filters across 100 versions and searches document numbers", () => {
  const repository = Array.from({ length: 50 }, (_, artifactOffset) => {
    const artifactNo = artifactOffset + 1;
    const sequence = String(artifactNo).padStart(3, "0");
    return [1, 2].map(version => canonicalVersion(artifactNo, {
      artifactId: `bulk-${sequence}`,
      versionId: `bulk-${sequence}-v${version}`,
      version,
      name: artifactNo % 2 === 0 ? `เอกสารเป้าหมาย ${sequence}` : `เอกสารทั่วไป ${sequence}`,
      documentType: artifactNo % 2 === 0 ? "CASE_PLAN" : "WORK_LOG",
      source: artifactNo % 4 === 0 ? "ACTIVITY_4" : "ACTIVITY_5",
      documentNumber: `ปปท BULK-${sequence}`,
      reference: `BULK-REF-${sequence}`,
      availability: version === 2 && artifactNo % 4 === 0 ? "AVAILABLE" : "REFERENCE_ONLY",
      createdAt: `2026-08-${String((artifactNo % 28) + 1).padStart(2, "0")}T0${version}:00:00.000Z`
    }));
  }).flat();
  const assignmentLinks = repository
    .filter(item => item.documentType === "CASE_PLAN")
    .map((item, index) => ({
      requestId: "EXT-100",
      revisionNo: 2,
      requirementCode: "CASE_PLAN",
      ...(index % 2 === 0 ? { documentVersionId: item.versionId } : { versionId: item.versionId })
    }));
  const before = structuredClone(repository);
  const beforeAssignments = structuredClone(assignmentLinks);
  const response = documents.filterExtensionDocuments(repository, {
    search: "BULK-REF",
    documentType: "CASE_PLAN",
    source: "ACTIVITY_4",
    requirementCode: "CASE_PLAN",
    requestId: "EXT-100",
    revisionNo: 2,
    availability: "AVAILABLE",
    latestMode: "LATEST",
    sortBy: "name",
    sortDirection: "asc",
    offset: 5,
    limit: 5
  }, assignmentLinks);

  assert.equal(response.ok, true);
  assert.equal(response.result.total, 12);
  assert.deepEqual(response.result.items.map(item => item.versionId), [
    "bulk-024-v2",
    "bulk-028-v2",
    "bulk-032-v2",
    "bulk-036-v2",
    "bulk-040-v2"
  ]);

  const byNumber = documents.filterExtensionDocuments(repository, {
    search: "ปปท BULK-044",
    latestMode: "ALL",
    sortBy: "version",
    sortDirection: "desc"
  });
  assert.deepEqual(byNumber.result.items.map(item => item.versionId), ["bulk-044-v2", "bulk-044-v1"]);
  assert.deepEqual(repository, before);
  assert.deepEqual(assignmentLinks, beforeAssignments);
});

test("bulk selection changes visible versions only and preserves hidden selected versions", () => {
  const selected = new Set(["doc-hidden-v1", "doc-visible-a-v1"]);
  const selectedResult = documents.updateVisibleSelection(
    selected,
    ["doc-visible-a-v1", "doc-visible-b-v2"],
    "SELECT"
  );

  assert.equal(selectedResult.ok, true);
  assert.deepEqual(selectedResult.result, ["doc-hidden-v1", "doc-visible-a-v1", "doc-visible-b-v2"]);
  assert.deepEqual([...selected], ["doc-hidden-v1", "doc-visible-a-v1"]);

  const unselectedResult = documents.updateVisibleSelection(
    selectedResult.result,
    ["doc-visible-a-v1", "doc-visible-b-v2"],
    "UNSELECT"
  );
  assert.deepEqual(unselectedResult.result, ["doc-hidden-v1"]);
});

test("assigns the selected exact version IDs to a rule requirement", () => {
  const repository = [
    canonicalVersion(1, { artifactId: "plan", versionId: "plan-v1", version: 1, name: "แผนฉบับเดิม", availability: "AVAILABLE" }),
    canonicalVersion(2, { artifactId: "plan", versionId: "plan-v2", version: 2, name: "แผนฉบับล่าสุด", availability: "AVAILABLE" })
  ];
  const assignments = { WORK_LOG: ["log-v1"] };
  const beforeRepository = structuredClone(repository);
  const beforeAssignments = structuredClone(assignments);
  const response = documents.assignRequirement(assignments, "CASE_PLAN", ["plan-v1"], repository);

  assert.equal(response.ok, true);
  assert.equal(response.code, "REQUIREMENT_ASSIGNED");
  assert.deepEqual(response.result, { WORK_LOG: ["log-v1"], CASE_PLAN: ["plan-v1"] });
  assert.deepEqual(assignments, beforeAssignments);
  assert.deepEqual(repository, beforeRepository);
});

test("assignRequirement preserves explicit old-version confirmation metadata on the exact link", () => {
  const repository = [canonicalVersion(1, { versionId: "plan-v1", availability: "AVAILABLE" })];
  const response = documents.assignRequirement({}, "CASE_PLAN", [{
    versionId: "plan-v1",
    oldVersionConfirmed: true,
    oldVersionReason: "ใช้ฉบับที่ตรงกับช่วงเวลาของคำขอ"
  }], repository);

  assert.equal(response.ok, true);
  assert.deepEqual(response.result, {
    CASE_PLAN: [{
      versionId: "plan-v1",
      oldVersionConfirmed: true,
      oldVersionReason: "ใช้ฉบับที่ตรงกับช่วงเวลาของคำขอ"
    }]
  });
});

test("Form 2 checklist reports one missing requirement and is not ready", () => {
  const repository = [
    canonicalVersion(1, { versionId: "plan-v1", name: "แผน", documentType: "CASE_PLAN", availability: "AVAILABLE" }),
    canonicalVersion(2, { versionId: "log-v3", name: "บันทึกการทำงาน", availability: "AVAILABLE" })
  ];
  const response = documents.evaluateExtensionDocumentChecklist("PRELIMINARY_INQUIRY", repository, {
    CASE_PLAN: ["plan-v1"],
    WORK_LOG: ["log-v3"]
  });

  assert.equal(response.ok, true);
  assert.equal(response.code, "CHECKLIST_EVALUATED");
  assert.equal(response.result.formId, "FORM_2");
  assert.equal(response.result.complete, false);
  assert.deepEqual(response.result.requiredDocumentCodes, ["CASE_PLAN", "WORK_LOG", "RECEIVED_DATE_EVIDENCE"]);
  assert.deepEqual(response.result.missingDocumentCodes, ["RECEIVED_DATE_EVIDENCE"]);
  assert.deepEqual(
    response.result.requirements.find(item => item.requirementCode === "RECEIVED_DATE_EVIDENCE"),
    {
      requirementCode: "RECEIVED_DATE_EVIDENCE",
      complete: false,
      assignedVersionIds: [],
      satisfiedVersionIds: [],
      failures: [{ code: "NO_VERSION_ASSIGNED", versionId: null, availability: null }]
    }
  );
});

test("Form 3 rejects reference-only, pending, withdrawn, and missing exact versions with structured failures", () => {
  const repository = [
    canonicalVersion(1, { versionId: "plan-metadata-v1", name: "รายการอ้างอิงแผน", documentType: "CASE_PLAN", availability: undefined }),
    canonicalVersion(2, { versionId: "log-upload-v1", name: "ไฟล์บันทึกรอจัดเก็บ", availability: "UPLOAD_PENDING" }),
    canonicalVersion(3, { versionId: "received-v1", name: "หลักฐานวันที่รับ", documentType: "RECEIVED_DATE_EVIDENCE", availability: "WITHDRAWN" })
  ];
  const response = documents.evaluateExtensionDocumentChecklist("FULL_INQUIRY", repository, {
    CASE_PLAN: ["plan-metadata-v1"],
    WORK_LOG: ["log-upload-v1"],
    RECEIVED_DATE_EVIDENCE: ["received-v1"],
    INQUIRY_APPOINTMENT_ORDER: ["appointment-missing-v2"]
  });

  assert.equal(response.ok, true);
  assert.equal(response.result.formId, "FORM_3");
  assert.equal(response.result.requirements.length, 4);
  assert.equal(response.result.complete, false);
  assert.deepEqual(response.result.missingDocumentCodes, [
    "CASE_PLAN",
    "WORK_LOG",
    "RECEIVED_DATE_EVIDENCE",
    "INQUIRY_APPOINTMENT_ORDER"
  ]);
  assert.deepEqual(
    response.result.requirements.map(item => item.failures[0]),
    [
      { code: "REFERENCE_ONLY", versionId: "plan-metadata-v1", availability: "REFERENCE_ONLY" },
      { code: "UPLOAD_PENDING", versionId: "log-upload-v1", availability: "UPLOAD_PENDING" },
      { code: "WITHDRAWN", versionId: "received-v1", availability: "WITHDRAWN" },
      { code: "VERSION_NOT_FOUND", versionId: "appointment-missing-v2", availability: null }
    ]
  );
});

test("creates an injected upload metadata version as pending without claiming binary persistence", () => {
  const uploadMetadata = {
    artifactId: "appointment-order",
    version: 4,
    previousVersionId: "appointment-order-v3",
    name: "คำสั่งแต่งตั้งคณะไต่สวน",
    documentType: "INQUIRY_APPOINTMENT_ORDER",
    source: "ACTIVITY_5",
    documentNumber: "ปปท 0004/44",
    reference: "CASE-001",
    mediaType: "application/pdf",
    size: 2048,
    pageCount: 2,
    availability: "AVAILABLE",
    binaryPersisted: true,
    requirementCodes: ["INQUIRY_APPOINTMENT_ORDER"],
    metadata: { signed: false }
  };
  const injection = {
    versionId: "appointment-order-v4",
    actorId: "officer-7",
    at: "2026-08-14T04:30:00.000Z"
  };
  const beforeMetadata = structuredClone(uploadMetadata);
  const response = documents.createUploadedDocumentVersion(uploadMetadata, injection);

  assert.equal(response.ok, true);
  assert.equal(response.code, "UPLOAD_VERSION_CREATED");
  assert.deepEqual(response.result, {
    artifactId: "appointment-order",
    version: 4,
    previousVersionId: "appointment-order-v3",
    name: "คำสั่งแต่งตั้งคณะไต่สวน",
    documentType: "INQUIRY_APPOINTMENT_ORDER",
    source: "UPLOAD",
    documentNumber: "ปปท 0004/44",
    reference: "CASE-001",
    mediaType: "application/pdf",
    size: 2048,
    pageCount: 2,
    availability: "UPLOAD_PENDING",
    binaryPersisted: false,
    metadata: { signed: false },
    versionId: "appointment-order-v4",
    latestVersionId: "appointment-order-v4",
    isLatest: true,
    createdBy: "officer-7",
    createdAt: "2026-08-14T04:30:00.000Z"
  });
  assert.notEqual(response.result.metadata, uploadMetadata.metadata);
  assert.deepEqual(uploadMetadata, beforeMetadata);
});

test("rejects uploaded metadata missing canonical artifact, version, name, and document type", () => {
  const response = documents.createUploadedDocumentVersion({}, {
    versionId: "upload-v1",
    actorId: "officer-1",
    at: "2026-08-14T05:00:00.000Z"
  });

  assert.equal(response.ok, false);
  assert.equal(response.code, "INVALID_UPLOAD_METADATA");
  assert.deepEqual(response.errors.map(error => error.field), [
    "metadata.artifactId",
    "metadata.version",
    "metadata.name",
    "metadata.documentType"
  ]);
});

test("snapshots selected exact document links as a deep clone without rendering or submission side effects", () => {
  const repository = [
    canonicalVersion(1, { versionId: "plan-v1", name: "แผน", availability: "AVAILABLE", metadata: { pages: [1, 2] } }),
    canonicalVersion(2, { versionId: "log-v2", name: "บันทึก", availability: "AVAILABLE", metadata: { pages: [1] } })
  ];
  const assignments = {
    CASE_PLAN: [{
      versionId: "plan-v1",
      oldVersionConfirmed: true,
      oldVersionReason: "เลือกฉบับที่ตรงกับช่วงเวลา"
    }],
    WORK_LOG: ["log-v2"]
  };
  const beforeRepository = structuredClone(repository);
  const beforeAssignments = structuredClone(assignments);
  const response = documents.snapshotSelectedDocuments(repository, new Set(["log-v2", "plan-v1"]), assignments);

  assert.equal(response.ok, true);
  assert.equal(response.code, "DOCUMENT_SNAPSHOT_CREATED");
  assert.deepEqual(response.result.selectedVersionIds, ["log-v2", "plan-v1"]);
  assert.deepEqual(response.result.documents.map(item => item.versionId), ["log-v2", "plan-v1"]);
  assert.deepEqual(response.result.requirementAssignments, assignments);
  response.result.documents[0].metadata.pages.push(99);
  response.result.requirementAssignments.WORK_LOG.push("tampered-v1");
  response.result.requirementAssignments.CASE_PLAN[0].oldVersionReason = "tampered";
  assert.deepEqual(repository, beforeRepository);
  assert.deepEqual(assignments, beforeAssignments);
});

test("rejects duplicate stable version IDs without mutating the caller repository", () => {
  const repository = [
    canonicalVersion(1, { versionId: "same-v1", name: "รายการแรก", availability: "AVAILABLE" }),
    canonicalVersion(2, { versionId: "same-v1", name: "รายการซ้ำ", availability: "REFERENCE_ONLY" })
  ];
  const before = structuredClone(repository);
  const response = documents.normalizeExtensionRepository(repository);

  assert.equal(response.ok, false);
  assert.equal(response.code, "INVALID_REPOSITORY");
  assert.equal(response.result, null);
  assert.deepEqual(response.errors, [{
    field: "repository[1].versionId",
    code: "DUPLICATE_VERSION_ID",
    versionId: "same-v1"
  }]);
  assert.deepEqual(repository, before);
});

test("checks the assigned version exactly and never substitutes a newer available version", () => {
  const repository = [
    canonicalVersion(1, { artifactId: "plan", versionId: "plan-v1", version: 1, name: "แผนเดิม", availability: "WITHDRAWN" }),
    canonicalVersion(2, { artifactId: "plan", versionId: "plan-v2", version: 2, name: "แผนใหม่", availability: "AVAILABLE" }),
    canonicalVersion(3, { versionId: "log-v1", name: "บันทึก", availability: "AVAILABLE" }),
    canonicalVersion(4, { versionId: "received-v1", name: "หลักฐานวันรับ", availability: "AVAILABLE" })
  ];
  const response = documents.evaluateExtensionDocumentChecklist("PRELIMINARY_INQUIRY", repository, {
    CASE_PLAN: ["plan-v1"],
    WORK_LOG: ["log-v1"],
    RECEIVED_DATE_EVIDENCE: ["received-v1"]
  });

  assert.equal(response.result.complete, false);
  assert.deepEqual(response.result.missingDocumentCodes, ["CASE_PLAN"]);
  assert.deepEqual(response.result.requirements[0].satisfiedVersionIds, []);
  assert.deepEqual(response.result.requirements[0].failures, [
    { code: "WITHDRAWN", versionId: "plan-v1", availability: "WITHDRAWN" }
  ]);
});

test("an older available exact version is incomplete without explicit confirmation and reason", () => {
  const repository = [
    canonicalVersion(1, {
      artifactId: "plan",
      versionId: "plan-v1",
      version: 1,
      name: "แผนงานคดี",
      documentType: "CASE_PLAN",
      availability: "AVAILABLE"
    }),
    canonicalVersion(2, {
      artifactId: "plan",
      versionId: "plan-v2",
      version: 2,
      name: "แผนงานคดี",
      documentType: "CASE_PLAN",
      availability: "AVAILABLE"
    }),
    canonicalVersion(3, { versionId: "log-v1", availability: "AVAILABLE" }),
    canonicalVersion(4, {
      versionId: "received-v1",
      documentType: "RECEIVED_DATE_EVIDENCE",
      availability: "AVAILABLE"
    })
  ];
  const response = documents.evaluateExtensionDocumentChecklist("PRELIMINARY_INQUIRY", repository, {
    CASE_PLAN: ["plan-v1"],
    WORK_LOG: ["log-v1"],
    RECEIVED_DATE_EVIDENCE: ["received-v1"]
  });

  assert.equal(response.ok, true);
  assert.equal(response.result.complete, false);
  assert.deepEqual(response.result.missingDocumentCodes, ["CASE_PLAN"]);
  assert.deepEqual(response.result.requirements[0].failures, [{
    code: "OLD_VERSION_CONFIRMATION_REQUIRED",
    versionId: "plan-v1",
    availability: "AVAILABLE",
    latestVersionId: "plan-v2"
  }]);
});

test("an older available exact version satisfies only with explicit confirmation and a non-empty reason", () => {
  const repository = [
    canonicalVersion(1, { artifactId: "plan", versionId: "plan-v1", version: 1, availability: "AVAILABLE" }),
    canonicalVersion(2, { artifactId: "plan", versionId: "plan-v2", version: 2, availability: "AVAILABLE" }),
    canonicalVersion(3, { versionId: "log-v1", availability: "AVAILABLE" }),
    canonicalVersion(4, { versionId: "received-v1", availability: "AVAILABLE" })
  ];
  const assignments = {
    CASE_PLAN: [{
      versionId: "plan-v1",
      oldVersionConfirmed: true,
      oldVersionReason: "ฉบับล่าสุดยังไม่ครอบคลุมช่วงเวลาที่ขอขยาย"
    }],
    WORK_LOG: ["log-v1"],
    RECEIVED_DATE_EVIDENCE: ["received-v1"]
  };
  const beforeRepository = structuredClone(repository);
  const beforeAssignments = structuredClone(assignments);
  const confirmed = documents.evaluateExtensionDocumentChecklist("PRELIMINARY_INQUIRY", repository, assignments);

  assert.equal(confirmed.ok, true);
  assert.equal(confirmed.result.complete, true);
  assert.deepEqual(confirmed.result.requirements[0].satisfiedVersionIds, ["plan-v1"]);
  assert.deepEqual(confirmed.result.requirements[0].failures, []);

  const missingReason = documents.evaluateExtensionDocumentChecklist("PRELIMINARY_INQUIRY", repository, {
    ...assignments,
    CASE_PLAN: [{ versionId: "plan-v1", oldVersionConfirmed: true, oldVersionReason: "   " }]
  });
  assert.equal(missingReason.result.complete, false);
  assert.equal(missingReason.result.requirements[0].failures[0].code, "OLD_VERSION_CONFIRMATION_REQUIRED");
  assert.deepEqual(repository, beforeRepository);
  assert.deepEqual(assignments, beforeAssignments);
});

test("Form 3 is complete only when all four rule requirements have an available exact version", () => {
  const required = [
    ["CASE_PLAN", "plan-v1"],
    ["WORK_LOG", "log-v1"],
    ["RECEIVED_DATE_EVIDENCE", "received-v1"],
    ["INQUIRY_APPOINTMENT_ORDER", "appointment-v1"]
  ];
  const repository = required.map(([requirementCode, versionId]) => ({
    ...canonicalVersion(required.findIndex(item => item[0] === requirementCode) + 1),
    versionId,
    name: requirementCode,
    documentType: requirementCode,
    availability: "AVAILABLE"
  }));
  const assignments = Object.fromEntries(required.map(([requirementCode, versionId]) => [requirementCode, [versionId]]));
  const response = documents.evaluateExtensionDocumentChecklist("FULL_INQUIRY", repository, assignments);

  assert.equal(response.result.complete, true);
  assert.deepEqual(response.result.missingDocumentCodes, []);
  assert.equal(response.result.requirements.every(item => item.complete), true);
});

test("all fallible operations return structured errors for malformed input without throwing or mutation", () => {
  const repository = [canonicalVersion(1, { versionId: "plan-v1", name: "แผน", availability: "AVAILABLE" })];
  const assignments = { CASE_PLAN: ["plan-v1"] };
  const beforeRepository = structuredClone(repository);
  const beforeAssignments = structuredClone(assignments);
  const operations = [
    () => documents.normalizeExtensionRepository(null),
    () => documents.filterExtensionDocuments(repository, []),
    () => documents.updateVisibleSelection({}, ["plan-v1"], "SELECT_ALL"),
    () => documents.assignRequirement(assignments, "UNKNOWN", ["missing-v1"], repository),
    () => documents.evaluateExtensionDocumentChecklist("UNKNOWN", repository, assignments),
    () => documents.createUploadedDocumentVersion(null, { versionId: "", actorId: "", at: "" }),
    () => documents.snapshotSelectedDocuments(repository, ["missing-v1"], assignments)
  ];

  for (const operation of operations) {
    let response;
    assert.doesNotThrow(() => {
      response = operation();
    });
    assert.deepEqual(Object.keys(response).sort(), ["code", "errors", "ok", "result"]);
    assert.equal(response.ok, false);
    assert.equal(response.result, null);
    assert.equal(Array.isArray(response.errors), true);
    assert.equal(response.errors.length > 0, true);
  }
  assert.deepEqual(repository, beforeRepository);
  assert.deepEqual(assignments, beforeAssignments);
});

test("document module exposes the same public interface through the browser global", () => {
  const context = vm.createContext({});
  vm.runInContext(readFileSync(new URL("../assets/activity5-extension-rules.js", import.meta.url), "utf8"), context);
  vm.runInContext(readFileSync(new URL("../assets/activity5-extension-documents.js", import.meta.url), "utf8"), context);

  const api = context.ECMISActivity5ExtensionDocuments;
  for (const name of [
    "normalizeExtensionRepository",
    "filterExtensionDocuments",
    "updateVisibleSelection",
    "assignRequirement",
    "evaluateExtensionDocumentChecklist",
    "createUploadedDocumentVersion",
    "snapshotSelectedDocuments"
  ]) {
    assert.equal(typeof api[name], "function", `${name} is exposed`);
  }
});

test("requirement assignment rejects persisted codes outside the approved rules", () => {
  const repository = [canonicalVersion(1, { versionId: "plan-v1", name: "แผน", availability: "AVAILABLE" })];
  const response = documents.assignRequirement(
    { INVENTED_REQUIREMENT: ["plan-v1"] },
    "CASE_PLAN",
    ["plan-v1"],
    repository
  );

  assert.equal(response.ok, false);
  assert.equal(response.code, "INVALID_REQUIREMENT_ASSIGNMENT");
  assert.deepEqual(response.errors, [{
    field: "assignments.INVENTED_REQUIREMENT",
    code: "UNKNOWN_REQUIREMENT_CODE"
  }]);
});

test("submitted plan and worklog adapt to distinct immutable versions", () => {
  const planBody = { payload: { plan: "ฉบับสอง" }, submittedAt: "2026-08-15T09:00:00+07:00" };
  const worklogBody = { payload: { entries: [] }, submittedAt: "2026-08-15T09:00:00+07:00" };
  const plan = documents.adaptDocumentStoreVersion({ caseId: "CASE-1", reportType: "213", documentType: "CASE_PLAN", record: { caseId: "CASE-1", documentId: "FORM_1_CASE_PLAN", revisionNo: 2, submittedSnapshot: { ...planBody, snapshotFingerprint: stable(planBody) } } });
  const worklog = documents.adaptDocumentStoreVersion({ caseId: "CASE-1", reportType: "213", documentType: "WORK_LOG", record: { caseId: "CASE-1", documentId: "ACTIVITY5_DAILY_WORKLOG", revisionNo: 3, submittedSnapshot: { ...worklogBody, snapshotFingerprint: stable(worklogBody) } } });
  assert.equal(plan.result.versionId, "CASE-1:FORM_1_CASE_PLAN:r2");
  assert.equal(worklog.result.versionId, "CASE-1:ACTIVITY5_DAILY_WORKLOG:r3");
  assert.equal(plan.result.availability, "AVAILABLE");
  assert.equal(plan.result.signedArtifactRef.snapshotFingerprint, stable(planBody));
  assert.equal(documents.adaptDocumentStoreVersion({ caseId: "CASE-1", reportType: "213", documentType: "CASE_PLAN", record: { caseId: "CASE-1", documentId: "FORM_1_CASE_PLAN", revisionNo: 1, submittedSnapshot: { payload: {} } } }).code, "DOCUMENT_ARTIFACT_NOT_IMMUTABLE");
  assert.equal(documents.adaptDocumentStoreVersion({ caseId: "CASE-1", reportType: "213", documentType: "CASE_PLAN", record: { caseId: "CASE-1", documentId: "FORM_1_CASE_PLAN", revisionNo: 2, submittedSnapshot: { ...planBody, payload: { plan: "ถูกแก้หลังส่ง" }, snapshotFingerprint: stable(planBody) } } }).code, "DOCUMENT_SNAPSHOT_TAMPERED");
});

test("scalar evidence and unsigned order metadata cannot become available artifacts", () => {
  assert.equal(documents.adaptSignedEvidenceVersion({ caseId: "CASE-1", documentType: "RECEIVED_DATE_EVIDENCE", signedArtifact: { documentId: "received", revisionNo: 1 }, semantic: { receivedAt: "2026-08-01" } }).code, "DOCUMENT_ARTIFACT_NOT_IMMUTABLE");
  const metadata = { artifactId: "order", versionId: "order:r1", version: 1, name: "คำสั่ง", documentType: "INQUIRY_APPOINTMENT_ORDER", source: "SIGNED_EXTERNAL", createdAt: "2026-08-01T00:00:00+07:00", availability: "AVAILABLE", lineage: { caseId: "CASE-1", sourceDocumentId: "order" }, semantic: { orderNo: "1", orderType: "24v1", orderDate: "2026-08-01", panelFingerprint: "p" } };
  assert.equal(documents.validateCanonicalDocumentVersion(metadata, { caseId: "CASE-1", reportType: "644", appointmentContext: metadata.semantic }).code, "DOCUMENT_ARTIFACT_NOT_IMMUTABLE");
});

test("registers received date only from an actual A4 signed snapshot", () => {
  const unsigned = { caseData: { id: "CASE-1", received: "2026-08-01" }, inquiry: { intake: { receivedFirstAt: "2026-08-01" } }, documentVersions: [] };
  assert.equal(documents.registerA4ReceivedDateEvidence(unsigned, { receivedAt: "2026-08-01" }).code, "A4_SIGNED_RECEIVED_EVIDENCE_REQUIRED");
  const signed = structuredClone(unsigned);
  signed.documentVersions.push({ version: 2, status: "signed", lastSignedAt: "2026-08-02T09:00:00+07:00", signedSnapshot: { division: { capturedAt: "2026-08-02T09:00:00+07:00", documents: [{ documentId: "SCREENING_REPORT", html: "<article>signed</article>" }] } } });
  const registered = documents.registerA4ReceivedDateEvidence(signed, { receivedAt: "2026-08-01" });
  assert.equal(registered.ok, true);
  assert.equal(registered.state.inquiry.extensionSignedArtifacts[0].source, "A4_SIGNED_HANDOFF");
  assert.equal(registered.state.inquiry.extensionSignedArtifacts[0].semantic.receivedAt, "2026-08-01");
});

test("appointment order register requires an exact immutable signed artifact", () => {
  const state = { caseData: { id: "CASE-1" }, inquiry: {} };
  assert.equal(documents.registerSignedAppointmentOrder(state, { signedArtifact: { documentId: "ORDER-1", revisionNo: 1 } }).code, "SIGNED_APPOINTMENT_ORDER_REQUIRED");
  const immutableSnapshot = { orderNo: "1/2569", signedBy: "secretary", signedAt: "2026-08-10" };
  const registered = documents.registerSignedAppointmentOrder(state, { signedArtifact: { documentId: "ORDER-1", revisionNo: 1, signedAt: "2026-08-10T09:00:00+07:00", immutableSnapshot, snapshotFingerprint: stable(immutableSnapshot) }, semantic: { orderNo: "1/2569", orderType: "24v1", orderDate: "2026-08-10", panelFingerprint: "panel-v1" } });
  assert.equal(registered.ok, true);
  assert.equal(registered.state.inquiry.extensionSignedArtifacts[0].documentType, "INQUIRY_APPOINTMENT_ORDER");
});

test("upload becomes available only after persisted binary and SHA-256", () => {
  const pending = { artifactId: "upload", versionId: "upload:r1", version: 1, name: "หลักฐาน", documentType: "RECEIVED_DATE_EVIDENCE", source: "UPLOAD", createdAt: "2026-08-15T00:00:00+07:00", availability: "UPLOAD_PENDING", binaryPersisted: false };
  assert.equal(documents.finalizeUploadedDocumentVersion(pending, { storageRef: "store/1", sha256: "bad" }).code, "DOCUMENT_INTEGRITY_MISSING");
  const finalized = documents.finalizeUploadedDocumentVersion(pending, { storageRef: "store/1", sha256: "a".repeat(64), persistedAt: "2026-08-15T00:00:00+07:00", actorId: "owner" });
  assert.equal(finalized.result.availability, "AVAILABLE");
  assert.equal(finalized.result.integrity.digest, "a".repeat(64));
  assert.equal(pending.availability, "UPLOAD_PENDING");
});
