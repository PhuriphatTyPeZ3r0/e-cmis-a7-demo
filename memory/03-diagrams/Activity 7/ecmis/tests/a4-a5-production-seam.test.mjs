import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const BASE = 'http://127.0.0.1:8899'
const STORE_KEY = 'ecmis-a4-workspace-v3'
const browser = await chromium.launch({ headless: true })
const passed = []

function a5Case(id = 'A5-E2E-001') {
  return {
    caseData: { id, caseNumber: '0001/2569', subject: 'ทดสอบ production seam A4 A5', channel: 'Website', region: 'เขต 1', received: '2026-08-02', receivedAt: '2026-08-02T09:00:00.000Z', decision: '18/1ก' },
    workflow: { stage: 'a5-prelim', status: 'อนุมัติแผนคดีแล้ว', a5Status: 'PLAN_APPROVED', downstreamStatus: 'REPORT_213_DRAFT' },
    intake: { status: 'PLAN_APPROVED', receivedDate: { channel: 'Website', recordedAt: '2026-08-02', effectiveDate: '2026-08-02' } },
    inquiry: { intake: { unit: 'เขต 1', receivedFirstAt: '2026-08-02', investigator: 'a5.investigator.region1', team: [] }, prelim: { startedAt: '2026-08-02', deadlineAt: '2026-10-01', plan: 'ตรวจพยานเอกสารและพยานบุคคล', planStatus: 'approved' } },
    assignment: { primaryOfficerId: 'a5.investigator.region1', primaryOfficerName: 'ผู้รับผิดชอบสำนวน Mock', assistantOfficerIds: [], assignmentVersion: 1, acceptedAssignmentVersion: 1, acceptedBy: 'ผู้รับผิดชอบสำนวน Mock' },
    planLifecycle: { status: 'PLAN_APPROVED', plan: 'ตรวจพยานเอกสารและพยานบุคคล', version: 1, history: [] },
    a5DocumentStore: { version: 0, records: [] },
    a5Report213Lifecycle: { status: 'REPORT_213_DRAFT', submissions: [], boardPackages: [], results: [] },
    decisionHistory: [],
    documentData: {}
  }
}

async function scenario(name, username, body) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  try {
    await page.goto(`${BASE}/login.html`, { waitUntil: 'load' })
    const account = await page.evaluate(({ username }) => ECMISAuth.login(username, '1234'), { username })
    assert.ok(account, `login failed: ${username}`)
    await body(page)
    assert.deepEqual(errors, [], `${name}: browser pageerror`)
    passed.push(name)
  } finally {
    await context.close()
  }
}

await scenario('1 A4 approve and dispatch เขต 1', 'intake.officer', async page => {
  await page.goto(`${BASE}/intake-investigation/staff-workflow.html`, { waitUntil: 'load' })
  const result = await page.evaluate(() => {
    const state = {
      caseData: { id: 'E2E-A4-001', subject: 'เรื่องส่งเข้าระบบไต่สวน', channel: 'Website', region: 'เขต 1', received: '2026-08-21' },
      workflow: { stage: 'activity5-dispatch', complete: true, status: 'จัดส่งแล้ว' },
      documentData: { decision: '18/1ก', approvedAt: '2026-08-21T09:00:00.000Z', approvedBy: 'ผอ.กบค. Mock', dispatchConfirmedAt: '2026-08-21T10:00:00.000Z', dispatchLetterNo: 'ปป 0004.2/1', dispatchLetterDate: '2026-08-21', dispatchSentDate: '2026-08-21', dispatchSendMethod: 'EMS', dispatchEms: 'TH0001', dispatchDestinationUnit: 'เขต 1' },
      documentVersions: [], decisionHistory: []
    }
    const handoff = ECMISActivity5Handoff.create(localStorage, state, '2026-08-21T10:00:00.000Z', 'officer')
    const published = ECMISIntakeAggregate.publishCase(state)
    return { handoff, published, hub: ECMISHub.getCase('E2E-A4-001') }
  })
  assert.equal(result.handoff.eligible, true)
  assert.equal(result.handoff.handoff.destinationUnit, 'เขต 1')
  assert.equal(result.published.ok, true)
  assert.equal(result.hub.destinationUnit, 'เขต 1')
})

await scenario('2 เขต 1 clerk sees the same dispatched case', 'a5.clerk.region1', async page => {
  const source = a5Case('A5-E2E-A4-002')
  source.caseData.subject = 'เรื่องเดียวกัน เขต 1'
  source.caseData.sourceReference = 'E2E-A4-002'
  source.workflow = { stage: 'a5-intake', status: 'ส่งถึงเขตผู้รับผิดชอบแล้ว — รอธุรการคดีรับสำนวน', owner: 'clerk', complete: false }
  source.inquiry.intake.handoffRef = 'activity4:E2E-A4-002:activity5'
  await page.evaluate(({ source, key }) => localStorage.setItem(key, JSON.stringify({ [source.caseData.id]: source })), { source, key: STORE_KEY })
  await page.goto(`${BASE}/intake-investigation/staff-workflow.html?view=a5`, { waitUntil: 'load' })
  assert.equal(await page.locator('#wsUnitA5').inputValue(), 'เขต 1')
  assert.equal(await page.getByText('เรื่องเดียวกัน เขต 1', { exact: true }).count(), 1)
})

await scenario('3 investigator plan returns after director approval', 'a5.investigator.region1', async page => {
  await page.goto(`${BASE}/intake-investigation/staff-workflow.html?view=a5`, { waitUntil: 'load' })
  const result = await page.evaluate(() => {
    const workflow = ECMISActivity5Workflow
    const base = workflow.normalizeA5State({ caseData: { id: 'A5-E2E-PLAN', received: '2026-08-01' }, workflow: { stage: 'a5-intake' }, inquiry: { intake: { unit: 'เขต 1' }, prelim: {} }, decisionHistory: [] })
    const recommendation = ECMISActivity5AssignmentRecommendation.recommendInvestigators({ difficulty: 2, requiredExperienceTags: [], completeness: 100, unit: 'เขต 1' }, [{ id: 'a5.investigator.region1', name: 'ผู้รับผิดชอบสำนวน Mock', unit: 'เขต 1', available: true, weightedWorkload: 1, complexityCapacity: 3, experienceTags: [] }], { generatedAt: '2026-08-21' })
    const commands = [
      ['clerk', 'intake-review-submit', { actorName: 'ธุรการคดี Mock', receivedDate: { channel: 'Website', recordedAt: '2026-08-01', effectiveDate: '2026-08-01' }, intakeReview: { documentResults: [{ id: 'form-3', result: 'COMPLETE' }], jurisdictionResult: 'IN_SCOPE', complaintTypeResult: 'CORRUPTION', completenessResult: 'COMPLETE', clerkOpinion: 'เอกสารครบ' } }],
      ['director', 'assignment-confirm', { actorName: 'ผอ.เขต Mock', primaryOfficerId: 'a5.investigator.region1', assistantOfficerIds: [], recommendationSnapshot: recommendation }],
      ['investigator', 'officer-accept', { actorName: 'ผู้รับผิดชอบสำนวน Mock', actorOfficerId: 'a5.investigator.region1', signature: 'SIGNED' }],
      ['investigator', 'plan-start', { actorName: 'ผู้รับผิดชอบสำนวน Mock', actorOfficerId: 'a5.investigator.region1' }],
      ['investigator', 'plan-submit', { actorName: 'ผู้รับผิดชอบสำนวน Mock', actorOfficerId: 'a5.investigator.region1', plan: 'ตรวจพยานเอกสารและพยานบุคคล' }],
      ['director', 'plan-approve', { actorName: 'ผอ.เขต Mock' }]
    ]
    let state = base
    const codes = []
    commands.forEach(([role, action, payload], index) => {
      const next = workflow.executeA5Action(state, role, action, { ...payload, at: `2026-08-21T0${index}:00:00.000Z` })
      codes.push(next.code)
      if (!next.ok) throw new Error(`${action}:${next.code}`)
      state = next.state
    })
    return { codes, status: state.workflow.a5Status, owner: state.assignment.primaryOfficerId, approvedBy: state.planLifecycle.approvedBy }
  })
  assert.equal(result.status, 'PLAN_APPROVED')
  assert.equal(result.owner, 'a5.investigator.region1')
  assert.equal(result.approvedBy, 'ผอ.เขต Mock')
})

await scenario('4 report 213 draft accepts incomplete mock content', 'a5.investigator.region1', async page => {
  await page.goto(`${BASE}/intake-investigation/staff-workflow.html?view=a5`, { waitUntil: 'load' })
  const saved = await page.evaluate(source => {
    const api = ECMISActivity5Report213
    const normalized = api.normalizeReport213A5(source)
    const record = normalized.state.a5DocumentStore.records.find(item => item.documentId === api.FORM_ID)
    const payload = structuredClone(record.payload)
    payload.documentMeta.preparedAt = '2026-08-21'
    payload.legalBasis.lawRows = [{ rowId: 'law-1', order: 1, lawName: 'ข้อความ Mock', section: 'มาตราทดลอง', text: '' }]
    const result = api.saveReport213DraftA5(normalized.state, { caseId: source.caseData.id, expectedVersion: normalized.state.a5DocumentStore.version, actorId: 'a5.investigator.region1', at: '2026-08-21T10:00:00.000Z', idempotencyKey: 'e2e-draft-1', payload })
    return { ok: result.ok, code: result.code, status: result.state.a5DocumentStore.records.find(item => item.documentId === api.FORM_ID)?.status }
  }, a5Case('A5-E2E-DRAFT'))
  assert.deepEqual(saved, { ok: true, code: 'REPORT_213_DRAFT_SAVED', status: 'DRAFT' })
})

await scenario('5 GBK sends report 213 to Activity 7', 'a5.gbk', async page => {
  await page.goto(`${BASE}/intake-investigation/staff-workflow.html?view=a5`, { waitUntil: 'load' })
  const sent = await page.evaluate(source => {
    source.a5Report213Lifecycle = { status: 'REPORT_213_GBK_PENDING', submissions: [{ packageId: 'pkg-1', report: { revisionNo: 1 } }], boardPackages: [{ packageId: 'board-pkg-1' }] }
    const result = ECMISIntakeAggregate.sendReport213ToBoard(source, { id: 'a5.gbk', name: 'กบค. Mock' })
    return { ok: result.ok, state: result.state.workflow, pending: ECMISHub.getCase(source.caseData.id)?.pending }
  }, a5Case('A5-E2E-BOARD'))
  assert.equal(sent.ok, true)
  assert.equal(sent.state.stage, 'a7-213')
  assert.equal(sent.pending.to, 'board-resolution')
})

await scenario('6 Activity 7 records and publishes board result', 'Thanakrit.B', async page => {
  await page.goto(`${BASE}/board-resolution/board-resolution.html?case=0001%2F2569`, { waitUntil: 'load' })
  const result = await page.evaluate(() => {
    ECMISHub.saveCase({ id: 'A5-E2E-RESULT', subject: 'รอมติบอร์ด', destinationUnit: 'เขต 1', status: 'รอผลมติ', accused: 'ผู้ถูกร้อง Mock' })
    const published = ECMISIntakeAggregate.publishBoardResult({ id: 'A5-E2E-RESULT', resolution: 'ACCEPT_S24P1', resolvedAtIso: '2026-08-21T12:00:00.000Z', meetingNo: '1/2569', agendaNo: '1.1' }, { text: 'รับไว้ไต่สวน', by: 'เจ้าหน้าที่มติ Mock' })
    return { published, shared: ECMISHub.getCase('A5-E2E-RESULT') }
  })
  assert.equal(result.published.ok, true)
  assert.equal(result.shared.boardResult.decisionCode, 'ACCEPT_S24P1')
  assert.equal(result.shared.ownerRole, 'case-clerk')
})

await scenario('7 destination clerk receives board result', 'a5.clerk.region1', async page => {
  const source = a5Case('A5-E2E-RETURN')
  source.workflow = { stage: 'a7-213', status: 'รอผลมติ', downstreamStatus: 'REPORT_213_WAIT_RESULT' }
  source.a5Report213Lifecycle = { status: 'REPORT_213_WAIT_RESULT', submissions: [], boardPackages: [{ packageId: 'board-return-1' }], results: [] }
  await page.evaluate(({ source, key }) => {
    localStorage.setItem(key, JSON.stringify({ [source.caseData.id]: source }))
  }, { source, key: STORE_KEY })
  await page.goto(`${BASE}/intake-investigation/staff-workflow.html?view=a5&case=${source.caseData.id}`, { waitUntil: 'load' })
  await page.evaluate(source => ECMISHub.saveCase({ id: source.caseData.id, subject: source.caseData.subject, destinationUnit: 'เขต 1', boardResult: { decisionCode: 'ACCEPT_S24P1', resolutionText: 'รับไว้ไต่สวน', resolutionReference: 'มติ 1/2569 วาระ 1.1', decidedAt: '2026-08-21T12:00:00.000Z', resolutionDocumentVersionId: 'G7-RES-A5-E2E-RETURN-v1', orderType: '24v1', committeeType: 'คณะพนักงานไต่สวน' } }), source)
  await page.reload({ waitUntil: 'load' })
  const state = await page.evaluate(({ key, id }) => JSON.parse(localStorage.getItem(key))[id], { key: STORE_KEY, id: source.caseData.id })
  assert.equal(state.workflow.owner, 'case-clerk')
  assert.equal(state.workflow.stage, 'a5-board-result')
  assert.equal(state.aggregateBoardResult.decisionCode, 'ACCEPT_S24P1')
})

await scenario('8 upload preview and reload persist in IndexedDB', 'a5.investigator.region1', async page => {
  const source = a5Case('A5-E2E-UPLOAD')
  await page.evaluate(({ source, key }) => localStorage.setItem(key, JSON.stringify({ [source.caseData.id]: source })), { source, key: STORE_KEY })
  await page.goto(`${BASE}/intake-investigation/staff-workflow.html?view=a5&case=${source.caseData.id}`, { waitUntil: 'load' })
  const input = page.locator('.universal-doc-upload input[type=file]').first()
  await input.waitFor({ state: 'attached' })
  await input.setInputFiles([
    { name: 'e2e-note.txt', mimeType: 'text/plain', buffer: Buffer.from('เอกสารทดสอบ preview') },
    { name: 'e2e-image.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="navy"/></svg>') }
  ])
  await page.waitForFunction(async id => (await ECMISUniversalDocumentUpload.listActiveDocuments('a5', id)).length === 2, source.caseData.id)
  await page.locator('.universal-doc-upload .ud-file-main').first().click()
  await page.locator('.ud-preview-stage:not([hidden])').waitFor({ state: 'visible' })
  await page.reload({ waitUntil: 'load' })
  const count = await page.evaluate(id => ECMISUniversalDocumentUpload.listActiveDocuments('a5', id).then(items => items.length), source.caseData.id)
  assert.equal(count, 2)
  await page.locator('.universal-doc-upload .ud-file-main').first().waitFor({ state: 'visible' })
  await page.locator('.universal-doc-upload .ud-file-main').first().click()
  await page.locator('.ud-preview-stage:not([hidden])').waitFor({ state: 'visible' })
})

await scenario('9 reload back and query retain active case', 'a5.investigator.region1', async page => {
  const source = a5Case('A5-E2E-ROUTE')
  await page.evaluate(({ source, key }) => localStorage.setItem(key, JSON.stringify({ [source.caseData.id]: source })), { source, key: STORE_KEY })
  const detail = `${BASE}/intake-investigation/staff-workflow.html?view=a5&case=${source.caseData.id}`
  await page.goto(detail, { waitUntil: 'load' })
  await page.reload({ waitUntil: 'load' })
  assert.equal(new URL(page.url()).searchParams.get('case'), source.caseData.id)
  await page.goto(`${BASE}/intake-investigation/staff-workflow.html?view=a5`, { waitUntil: 'load' })
  await page.goBack({ waitUntil: 'load' })
  assert.equal(new URL(page.url()).searchParams.get('case'), source.caseData.id)
  assert.equal(await page.getByText(source.caseData.subject, { exact: true }).count() > 0, true)
})

await scenario('10 unauthorized direct URL exposes no A5 action', 'Somboon.T', async page => {
  await page.goto(`${BASE}/intake-investigation/staff-workflow.html?view=a5&role=investigator&case=A5-E2E-ROUTE`, { waitUntil: 'load' })
  assert.equal(await page.locator('#ecmisDeny').count(), 1)
  assert.equal(await page.locator('[data-a5-action]').count(), 0)
})

await browser.close()
console.log(`PASS a4-a5-production-seam: ${passed.length}/10 scenarios`)
