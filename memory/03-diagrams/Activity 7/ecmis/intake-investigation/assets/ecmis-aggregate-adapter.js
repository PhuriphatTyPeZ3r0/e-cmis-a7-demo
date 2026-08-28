(function initializeIntakeAggregateAdapter(root, factory) {
  const createIntakeAggregateAdapter = factory
  root.ECMISIntakeAggregate = createIntakeAggregateAdapter({
    hub: root.ECMISHub,
    handoff: root.ECMISHandoff
  })
  if (typeof module !== 'undefined' && module.exports) module.exports = { createIntakeAggregateAdapter }
})(typeof globalThis === 'undefined' ? window : globalThis, function createIntakeAggregateAdapter(environment = {}) {
  const hub = environment.hub || null
  const handoff = environment.handoff || null
  const now = typeof environment.now === 'function' ? environment.now : () => new Date().toISOString()

  function copy(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value))
  }

  function text(value) {
    return String(value == null ? '' : value).trim()
  }

  function isAvailable() {
    return Boolean(hub?.getCase && hub?.saveCase && hub?.addEvent && handoff?.send)
  }

  function caseIdOf(state) {
    return text(state?.caseData?.id || state?.id)
  }

  function destinationUnitOf(state) {
    return text(state?.inquiry?.intake?.unit || state?.documentData?.dispatchDestinationUnit || state?.destinationUnit)
  }

  function latestSubmission(state) {
    const submissions = Array.isArray(state?.a5Report213Lifecycle?.submissions) ? state.a5Report213Lifecycle.submissions : []
    return submissions.at(-1) || null
  }

  function latestBoardPackage(state) {
    const packages = Array.isArray(state?.a5Report213Lifecycle?.boardPackages) ? state.a5Report213Lifecycle.boardPackages : []
    return packages.at(-1) || null
  }

  function publishCase(localState) {
    if (!isAvailable()) return { ok: true, mode: 'standalone', published: null }
    const id = caseIdOf(localState)
    if (!id) return { ok: false, errorCode: 'CASE_ID_REQUIRED' }
    const submission = latestSubmission(localState)
    const patch = {
      id,
      subject: text(localState?.caseData?.subject),
      sourceActivity: 'intake-investigation',
      sourceChannel: text(localState?.caseData?.channel),
      receivedAt: text(localState?.caseData?.receivedAt),
      destinationUnit: destinationUnitOf(localState),
      owner: text(localState?.assignment?.primaryOfficerName || localState?.documentData?.assignedOfficer),
      ownerId: text(localState?.assignment?.primaryOfficerId),
      status: text(localState?.workflow?.status),
      intakeStage: text(localState?.workflow?.stage),
      report213Status: text(localState?.a5Report213Lifecycle?.status),
      report213Revision: Number(submission?.report?.revisionNo || 0)
    }
    hub.saveCase(patch)
    return { ok: true, mode: 'aggregate', published: copy(patch) }
  }

  function sentState(localState, envelope) {
    const state = copy(localState)
    state.a5Report213Lifecycle = {
      ...(state.a5Report213Lifecycle || {}),
      status: 'REPORT_213_WAIT_RESULT'
    }
    state.workflow = {
      ...(state.workflow || {}),
      stage: 'a7-213',
      owner: 'case-clerk',
      status: 'รอผลมติคณะกรรมการ ป.ป.ท.',
      downstreamStatus: 'REPORT_213_WAIT_RESULT'
    }
    state.aggregateBoardHandoff = {
      status: 'PENDING',
      revision: Number(envelope?.revision || 0),
      sentAt: now()
    }
    return state
  }

  function sendReport213ToBoard(localState, actor = {}) {
    const original = copy(localState)
    if (!isAvailable()) return { ok: true, mode: 'standalone', state: original, envelope: null }
    const id = caseIdOf(localState)
    if (!id) return { ok: false, errorCode: 'CASE_ID_REQUIRED', state: original }
    const submission = latestSubmission(localState)
    const boardPackage = latestBoardPackage(localState)
    const revision = Number(submission?.report?.revisionNo || 0)
    const destinationUnit = destinationUnitOf(localState)
    publishCase(localState)
    const spec = {
      caseId: id,
      from: 'intake-investigation',
      to: 'board-resolution',
      trigger: 'กบค. ส่งรายงาน 213 เพื่อรับมติคณะกรรมการ',
      docs: [`รายงาน 213 ฉบับที่ ${revision || 1}`, 'สำนวนและเอกสารประกอบ'],
      statusBefore: text(localState?.workflow?.status),
      statusAfter: 'รอผลมติคณะกรรมการ ป.ป.ท.',
      by: text(actor.name || actor.displayName || actor.id) || 'กบค.',
      patch: {
        report213: 'ส่งกิจกรรมที่ 7 แล้ว',
        report213Status: 'REPORT_213_WAIT_RESULT',
        destinationUnit,
        ownerRole: 'board-resolution',
        boardPackageId: text(boardPackage?.packageId)
      }
    }
    try {
      const envelope = handoff.send(spec)
      return { ok: true, mode: 'aggregate', state: sentState(localState, envelope), envelope: copy(envelope) }
    } catch (error) {
      return { ok: false, errorCode: 'BOARD_HANDOFF_FAILED', error, state: original }
    }
  }

  function consumeBoardResult(caseId) {
    if (!isAvailable()) return { ok: false, errorCode: 'AGGREGATE_UNAVAILABLE' }
    const id = text(caseId)
    const shared = id ? hub.getCase(id) : null
    if (!shared) return { ok: false, errorCode: 'CASE_NOT_FOUND' }
    if (!shared.boardResult?.decisionCode) return { ok: false, errorCode: 'BOARD_RESULT_NOT_READY' }
    return {
      ok: true,
      result: {
        ...copy(shared.boardResult),
        destinationUnit: text(shared.destinationUnit),
        ownerRole: 'case-clerk'
      }
    }
  }

  function resolutionReference(boardCase) {
    const meeting = text(boardCase?.meetingNo)
    const agenda = text(boardCase?.agendaNo)
    return [meeting ? `มติ ${meeting}` : '', agenda ? `วาระ ${agenda}` : ''].filter(Boolean).join(' ') || `มติสำนวน ${text(boardCase?.id)}`
  }

  function orderTypeFor(code) {
    if (code === 'ACCEPT_S24P1') return '24v1'
    if (code === 'ACCEPT_S24P3') return '24v3'
    return ''
  }

  function committeeTypeFor(code) {
    if (code === 'ACCEPT_S24P1') return 'คณะพนักงานไต่สวน'
    if (code === 'ACCEPT_S24P3') return 'คณะอนุกรรมการไต่สวน'
    return ''
  }

  function publishBoardResult(boardCase, details = {}) {
    if (!isAvailable()) return { ok: true, mode: 'standalone' }
    const id = text(boardCase?.id)
    const shared = id ? hub.getCase(id) : null
    if (!shared) return { ok: false, errorCode: 'CASE_NOT_FOUND' }
    const decisionCode = text(boardCase?.resolution)
    const decidedAt = text(boardCase?.resolvedAtIso) || now()
    const result = {
      decisionCode,
      resolutionText: text(details.text),
      resolutionReference: text(details.reference) || resolutionReference(boardCase),
      decidedAt,
      resolutionDocumentVersionId: text(details.documentVersionId) || `G7-RES-${id}-v1`,
      orderType: orderTypeFor(decisionCode),
      committeeType: committeeTypeFor(decisionCode)
    }
    hub.saveCase({
      id,
      status: 'มีมติแล้ว — รอธุรการคดีประจำเขตดำเนินการ',
      pending: null,
      ownerRole: 'case-clerk',
      destinationUnit: text(shared.destinationUnit),
      boardResult: result
    })
    hub.addEvent(id, {
      action: 'กิจกรรมที่ 7 ส่งผลมติกลับกิจกรรมที่ 5',
      from: 'board-resolution',
      to: 'intake-investigation',
      trigger: 'บันทึกมติคณะกรรมการ ป.ป.ท. สำเร็จ',
      statusBefore: text(shared.status),
      statusAfter: 'มีมติแล้ว — รอธุรการคดีประจำเขตดำเนินการ',
      by: text(details.by) || 'กิจกรรมที่ 7',
      resolutionReference: result.resolutionReference,
      boardResult: copy(result)
    })
    return { ok: true, mode: 'aggregate', result: copy(result) }
  }

  return Object.freeze({ isAvailable, publishCase, sendReport213ToBoard, consumeBoardResult, publishBoardResult })
})
