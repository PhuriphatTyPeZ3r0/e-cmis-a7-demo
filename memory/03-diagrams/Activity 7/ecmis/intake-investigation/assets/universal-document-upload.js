(function () {
  'use strict';

  const DB_NAME = 'ecmis-case-documents';
  const DB_VERSION = 1;
  const STORE_NAME = 'documents';
  const MAX_FILE_SIZE = 50 * 1024 * 1024;
  const MAX_TEXT_PREVIEW = 200000;
  let databasePromise;
  let mountTimer;
  const mountedShells = new Set();

  function openDatabase() {
    if (databasePromise) return databasePromise;
    databasePromise = new Promise(function (resolve, reject) {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = function () {
        const db = request.result;
        if (db.objectStoreNames.contains(STORE_NAME)) return;
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('caseKey', 'caseKey', { unique: false });
      };
      request.onsuccess = function () { resolve(request.result); };
      request.onerror = function () { reject(request.error); };
    });
    return databasePromise;
  }

  async function recordsForCase(caseKey, includeDeleted) {
    const db = await openDatabase();
    return new Promise(function (resolve, reject) {
      const request = db.transaction(STORE_NAME, 'readonly')
        .objectStore(STORE_NAME)
        .index('caseKey')
        .getAll(caseKey);
      request.onsuccess = function () {
        const records = includeDeleted ? request.result : request.result.filter(function (record) {
          return record.status !== 'DELETED';
        });
        resolve(records.sort(function (a, b) {
          return b.uploadedAt.localeCompare(a.uploadedAt);
        }));
      };
      request.onerror = function () { reject(request.error); };
    });
  }

  async function recordById(id) {
    const db = await openDatabase();
    return new Promise(function (resolve, reject) {
      const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(id);
      request.onsuccess = function () { resolve(request.result || null); };
      request.onerror = function () { reject(request.error); };
    });
  }

  async function writeRecord(record) {
    const db = await openDatabase();
    return new Promise(function (resolve, reject) {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).put(record);
      transaction.oncomplete = function () { resolve(); };
      transaction.onerror = function () { reject(transaction.error); };
      transaction.onabort = function () { reject(transaction.error); };
    });
  }

  function randomId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
  }

  function activityFor(host) {
    return host.closest('#a5App') ? 'a5' : 'a4';
  }

  function currentCaseId(activity, host) {
    const queryCase = new URLSearchParams(window.location.search).get('case');
    if (queryCase) return queryCase;
    const scoped = host.closest('[data-case-id]');
    if (scoped && scoped.dataset.caseId) return scoped.dataset.caseId;
    if (activity === 'a5') return sessionStorage.getItem('ecmis-a5-current-case') || '';
    return sessionStorage.getItem('ecmis-a4-current-case') || '';
  }

  function currentUploader() {
    const params = new URLSearchParams(window.location.search);
    const role = params.get('role') || sessionStorage.getItem('ecmis-a5-role') || sessionStorage.getItem('ecmis-a4-role') || 'user';
    try {
      if (window.ECMISAuth && typeof window.ECMISAuth.getAuth === 'function') {
        const auth = window.ECMISAuth.getAuth();
        if (auth && (auth.displayName || auth.username)) return auth.displayName || auth.username;
      }
    } catch (error) {
      return role;
    }
    return role;
  }

  function formatSize(size) {
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
    return (size / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function formatDate(value) {
    return new Intl.DateTimeFormat('th-TH', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(value));
  }

  function canPreview(type) {
    return type === 'application/pdf' || type.startsWith('image/') || type.startsWith('text/') || type.startsWith('audio/') || type.startsWith('video/');
  }

  function previewKind(record) {
    const type = record.type || '';
    const extension = (record.name.split('.').pop() || '').toLowerCase();
    if (type === 'application/pdf' || extension === 'pdf') return 'pdf';
    if (type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) return 'image';
    if (type.startsWith('text/') || ['txt', 'csv', 'json', 'xml', 'log', 'md'].includes(extension)) return 'text';
    if (type.startsWith('audio/')) return 'audio';
    if (type.startsWith('video/')) return 'video';
    return 'unsupported';
  }

  async function checksumFor(file) {
    if (window.crypto && window.crypto.subtle && typeof file.arrayBuffer === 'function') {
      const digest = await window.crypto.subtle.digest('SHA-256', await file.arrayBuffer());
      return Array.from(new Uint8Array(digest)).map(function (byte) {
        return byte.toString(16).padStart(2, '0');
      }).join('');
    }
    return [file.name, file.size, file.lastModified || 0].join(':');
  }

  function withAudit(record, action) {
    const next = Object.assign({}, record);
    next.auditTrail = Array.isArray(record.auditTrail) ? record.auditTrail.slice() : [];
    next.auditTrail.push({ action: action, by: currentUploader(), at: new Date().toISOString() });
    return next;
  }

  function saveBlob(record) {
    const url = URL.createObjectURL(record.blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = record.name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
  }

  function buildShell(caseKey) {
    const shell = document.createElement('section');
    shell.className = 'universal-doc-upload';
    shell.dataset.caseKey = caseKey;
    shell.innerHTML = [
      '<div class="ud-upload-zone">',
      '<input class="ud-file-input" type="file" multiple hidden>',
      '<button class="ud-upload-button" type="button"><span aria-hidden="true">+</span> เพิ่มเอกสาร</button>',
      '<div class="ud-upload-copy"><strong>อัปโหลดเอกสารเข้าสำนวน</strong><span>เลือกหลายไฟล์หรือลากไฟล์มาวาง · ไม่เกิน 50 MB ต่อไฟล์</span></div>',
      '<span class="ud-upload-status" role="status" aria-live="polite"></span>',
      '</div>',
      '<div class="ud-progress" hidden><div class="ud-progress-track"><span></span></div><small></small></div>',
      '<div class="ud-upload-queue" hidden></div>',
      '<div class="ud-file-list" aria-label="เอกสารที่อัปโหลด"></div>',
      '<details class="ud-trash" hidden><summary>ไฟล์ที่ลบ <span>0</span></summary><div class="ud-trash-list"></div></details>'
    ].join('');
    return shell;
  }

  function setStatus(shell, text, isError) {
    const status = shell.querySelector('.ud-upload-status');
    status.textContent = text;
    status.classList.toggle('is-error', Boolean(isError));
  }

  function setProgress(shell, complete, total) {
    const progress = shell.querySelector('.ud-progress');
    if (!total) {
      progress.hidden = true;
      return;
    }
    const percent = Math.round((complete / total) * 100);
    progress.hidden = false;
    progress.querySelector('span').style.width = percent + '%';
    progress.querySelector('small').textContent = 'ดำเนินการ ' + complete + ' จาก ' + total + ' ไฟล์ · ' + percent + '%';
  }

  function cleanupPreview(shell) {
    if (shell._udPreviewUrl) URL.revokeObjectURL(shell._udPreviewUrl);
    shell._udPreviewUrl = '';
  }

  function closePreview(shell) {
    cleanupPreview(shell);
    const pane = shell.closest('.ws-doc-pane');
    const stage = pane && pane.querySelector(':scope > .ud-preview-stage');
    if (pane) pane.classList.remove('ud-preview-active');
    if (stage) stage.hidden = true;
    shell.querySelectorAll('.ud-file-row.is-selected').forEach(function (row) {
      row.classList.remove('is-selected');
    });
  }

  function ensurePreviewStage(shell) {
    const pane = shell.closest('.ws-doc-pane');
    if (!pane) return null;
    let stage = pane.querySelector(':scope > .ud-preview-stage');
    if (!stage) {
      stage = document.createElement('section');
      stage.className = 'ud-preview-stage';
      stage.hidden = true;
      stage.innerHTML = '<header><div><small>เอกสารที่อัปโหลด</small><strong class="ud-preview-title"></strong></div><div><button type="button" class="ud-file-action" data-ud-preview-download>ดาวน์โหลด</button><button type="button" class="ud-file-action" data-ud-preview-close>กลับไปเอกสารสำนวน</button></div></header><div class="ud-preview-body"></div>';
      pane.appendChild(stage);
      stage.querySelector('[data-ud-preview-close]').addEventListener('click', function () { closePreview(shell); });
      stage.querySelector('[data-ud-preview-download]').addEventListener('click', async function () {
        const record = await recordById(stage.dataset.recordId);
        if (!record) return;
        await writeRecord(withAudit(record, 'DOWNLOAD'));
        saveBlob(record);
      });
    }
    return stage;
  }

  async function showPreview(shell, record) {
    const pane = shell.closest('.ws-doc-pane');
    const stage = ensurePreviewStage(shell);
    if (!pane || !stage) return;
    cleanupPreview(shell);
    const body = stage.querySelector('.ud-preview-body');
    const kind = previewKind(record);
    stage.dataset.recordId = record.id;
    stage.querySelector('.ud-preview-title').textContent = record.name;
    body.replaceChildren();
    pane.classList.add('ud-preview-active');
    stage.hidden = false;
    shell.querySelectorAll('.ud-file-row').forEach(function (row) {
      row.classList.toggle('is-selected', row.dataset.id === record.id);
    });

    if (kind === 'text') {
      const pre = document.createElement('pre');
      let content;
      try {
        content = await record.blob.text();
      } catch (error) {
        content = '[เปิดอ่านข้อความไม่สำเร็จ กรุณาดาวน์โหลดไฟล์เพื่อตรวจสอบ]';
      }
      if (stage.dataset.recordId !== record.id) return;
      pre.textContent = content.length > MAX_TEXT_PREVIEW ? content.slice(0, MAX_TEXT_PREVIEW) + '\n\n[แสดงเฉพาะ 200,000 ตัวอักษรแรก]' : content;
      body.appendChild(pre);
      return;
    }

    if (kind === 'unsupported') {
      const empty = document.createElement('div');
      empty.className = 'ud-preview-unavailable';
      empty.innerHTML = '<strong>ไฟล์ชนิดนี้ Preview ใน Browser ไม่ได้</strong><span>ตรวจชื่อไฟล์และขนาด แล้วกดดาวน์โหลดเพื่อเปิดด้วยโปรแกรมที่รองรับ</span>';
      body.appendChild(empty);
      return;
    }

    const url = URL.createObjectURL(record.blob);
    shell._udPreviewUrl = url;
    let media;
    if (kind === 'pdf') {
      media = document.createElement('iframe');
      media.title = 'ตัวอย่างเอกสาร ' + record.name;
    } else if (kind === 'image') {
      media = document.createElement('img');
      media.alt = record.name;
    } else {
      media = document.createElement(kind);
      media.controls = true;
      media.preload = 'metadata';
    }
    media.src = url;
    body.appendChild(media);
  }

  function fileRow(record, deleted) {
    const row = document.createElement('article');
    row.className = 'ud-file-row';
    row.dataset.id = record.id;

    const open = document.createElement(deleted ? 'div' : 'button');
    if (!deleted) open.type = 'button';
    open.className = 'ud-file-main';
    if (!deleted) {
      open.dataset.action = 'preview';
      open.dataset.id = record.id;
    }
    const name = document.createElement('strong');
    name.className = 'ud-file-name';
    name.textContent = record.name;
    name.title = record.name;
    const meta = document.createElement('span');
    meta.className = 'ud-file-meta';
    meta.textContent = formatSize(record.size) + ' · ' + record.uploadedBy + ' · ' + formatDate(record.uploadedAt);
    open.append(name, meta);

    const actions = document.createElement('div');
    actions.className = 'ud-file-actions';
    if (deleted) {
      const restore = document.createElement('button');
      restore.type = 'button';
      restore.className = 'ud-file-action';
      restore.dataset.action = 'restore';
      restore.dataset.id = record.id;
      restore.textContent = 'กู้คืน';
      actions.appendChild(restore);
    } else {
      const preview = document.createElement('button');
      preview.type = 'button';
      preview.className = 'ud-file-action';
      preview.dataset.action = 'preview';
      preview.dataset.id = record.id;
      preview.textContent = canPreview(record.type || '') || previewKind(record) !== 'unsupported' ? 'Preview' : 'รายละเอียด';
      const download = document.createElement('button');
      download.type = 'button';
      download.className = 'ud-file-action';
      download.dataset.action = 'download';
      download.dataset.id = record.id;
      download.textContent = 'ดาวน์โหลด';
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'ud-file-action is-danger';
      remove.dataset.action = 'delete';
      remove.dataset.id = record.id;
      remove.textContent = 'ลบ';
      actions.append(preview, download, remove);
    }
    row.append(open, actions);
    return row;
  }

  async function renderRecords(shell) {
    const list = shell.querySelector('.ud-file-list');
    const trash = shell.querySelector('.ud-trash');
    const trashList = shell.querySelector('.ud-trash-list');
    const allRecords = await recordsForCase(shell.dataset.caseKey, true);
    const records = allRecords.filter(function (record) { return record.status !== 'DELETED'; });
    const deleted = allRecords.filter(function (record) { return record.status === 'DELETED'; });
    list.replaceChildren();
    if (!records.length) list.innerHTML = '<div class="ud-empty">ยังไม่มีเอกสารที่อัปโหลด</div>';
    records.forEach(function (record) { list.appendChild(fileRow(record, false)); });
    trashList.replaceChildren();
    deleted.forEach(function (record) { trashList.appendChild(fileRow(record, true)); });
    trash.hidden = !deleted.length;
    trash.querySelector('summary span').textContent = String(deleted.length);
  }

  function queueRow(shell, file) {
    const queue = shell.querySelector('.ud-upload-queue');
    const id = randomId();
    const row = document.createElement('div');
    row.className = 'ud-queue-row';
    row.dataset.queueId = id;
    row.innerHTML = '<div><strong></strong><span></span></div><small>รอตรวจสอบ</small>';
    row.querySelector('strong').textContent = file.name;
    row.querySelector('span').textContent = formatSize(file.size);
    queue.appendChild(row);
    queue.hidden = false;
    return row;
  }

  function updateQueueRow(row, status, text) {
    row.dataset.status = status;
    const label = row.querySelector('small');
    label.textContent = text;
  }

  async function uploadFiles(shell, files, activity, caseId) {
    const button = shell.querySelector('.ud-upload-button');
    const candidates = Array.from(files);
    if (!candidates.length) return;
    if (shell.dataset.uploading === 'true') {
      setStatus(shell, 'กำลังบันทึกชุดปัจจุบัน กรุณารอให้เสร็จก่อน', true);
      return;
    }
    const queue = shell.querySelector('.ud-upload-queue');
    queue.replaceChildren();
    shell._udFailedFiles = new Map();
    shell.dataset.uploading = 'true';
    button.disabled = true;
    setStatus(shell, 'กำลังตรวจและบันทึก ' + candidates.length + ' ไฟล์', false);
    setProgress(shell, 0, candidates.length);
    let saved = 0;
    let skipped = 0;
    let failed = 0;
    try {
      const existing = await recordsForCase(activity + ':' + caseId);
      for (let index = 0; index < candidates.length; index += 1) {
        const file = candidates[index];
        const row = queueRow(shell, file);
        if (!file.size || file.size > MAX_FILE_SIZE) {
          updateQueueRow(row, 'failed', !file.size ? 'ไฟล์ว่าง' : 'เกิน 50 MB');
          failed += 1;
          setProgress(shell, index + 1, candidates.length);
          continue;
        }
        try {
          updateQueueRow(row, 'checking', 'กำลังตรวจไฟล์');
          const checksum = await checksumFor(file);
          const duplicate = existing.some(function (record) {
            return record.checksum ? record.checksum === checksum : record.name === file.name && record.size === file.size;
          });
          if (duplicate) {
            updateQueueRow(row, 'skipped', 'มีไฟล์นี้ในสำนวนแล้ว');
            skipped += 1;
          } else {
            updateQueueRow(row, 'saving', 'กำลังบันทึก');
            const uploadedAt = new Date().toISOString();
            const record = {
              id: randomId(),
              caseKey: activity + ':' + caseId,
              activity: activity,
              caseId: caseId,
              name: file.name,
              type: file.type || 'application/octet-stream',
              size: file.size,
              checksum: checksum,
              originalLastModified: file.lastModified || null,
              uploadedAt: uploadedAt,
              uploadedBy: currentUploader(),
              source: 'USER_UPLOAD',
              status: 'ACTIVE',
              auditTrail: [{ action: 'UPLOAD', by: currentUploader(), at: uploadedAt }],
              blob: file
            };
            await writeRecord(record);
            existing.push(record);
            updateQueueRow(row, 'done', 'บันทึกแล้ว');
            saved += 1;
          }
        } catch (error) {
          updateQueueRow(row, 'failed', 'บันทึกไม่สำเร็จ · กดลองใหม่');
          row.dataset.action = 'retry';
          shell._udFailedFiles.set(row.dataset.queueId, file);
          failed += 1;
        }
        setProgress(shell, index + 1, candidates.length);
      }
      await renderRecords(shell);
      setStatus(shell, 'เพิ่ม ' + saved + ' ไฟล์' + (skipped ? ' · ซ้ำ ' + skipped : '') + (failed ? ' · ไม่สำเร็จ ' + failed : ''), Boolean(failed));
    } catch (error) {
      setStatus(shell, 'เปิดพื้นที่จัดเก็บไม่สำเร็จ กรุณาลองใหม่', true);
    } finally {
      delete shell.dataset.uploading;
      button.disabled = false;
      shell.querySelector('.ud-file-input').value = '';
    }
  }

  function bindShell(shell, activity, caseId) {
    const input = shell.querySelector('.ud-file-input');
    shell.querySelector('.ud-upload-button').addEventListener('click', function () { input.click(); });
    input.addEventListener('change', function () { uploadFiles(shell, input.files, activity, caseId); });
    ['dragenter', 'dragover'].forEach(function (eventName) {
      shell.addEventListener(eventName, function (event) {
        event.preventDefault();
        shell.classList.add('is-dragging');
      });
    });
    ['dragleave', 'drop'].forEach(function (eventName) {
      shell.addEventListener(eventName, function (event) {
        event.preventDefault();
        shell.classList.remove('is-dragging');
      });
    });
    shell.addEventListener('drop', function (event) {
      if (event.dataTransfer && event.dataTransfer.files.length) {
        uploadFiles(shell, event.dataTransfer.files, activity, caseId);
      }
    });
    shell.addEventListener('click', async function (event) {
      const retryRow = event.target.closest('.ud-queue-row[data-action="retry"]');
      if (retryRow) {
        const file = shell._udFailedFiles && shell._udFailedFiles.get(retryRow.dataset.queueId);
        if (file) uploadFiles(shell, [file], activity, caseId);
        return;
      }
      const control = event.target.closest('[data-action]');
      if (!control) return;
      try {
        const record = await recordById(control.dataset.id);
        if (!record) {
          setStatus(shell, 'ไม่พบไฟล์นี้แล้ว', true);
          await renderRecords(shell);
          return;
        }
        if (control.dataset.action === 'preview') {
          await showPreview(shell, record);
          try { await writeRecord(withAudit(record, 'PREVIEW')); } catch (error) { setStatus(shell, 'เปิด Preview ได้ แต่บันทึกประวัติไม่สำเร็จ', true); }
        }
        if (control.dataset.action === 'download') {
          await writeRecord(withAudit(record, 'DOWNLOAD'));
          saveBlob(record);
        }
        if (control.dataset.action === 'delete') {
          if (!window.confirm('ลบเอกสาร “' + record.name + '” หรือไม่')) return;
          const deleted = withAudit(record, 'DELETE');
          deleted.status = 'DELETED';
          deleted.deletedAt = new Date().toISOString();
          deleted.deletedBy = currentUploader();
          await writeRecord(deleted);
          if (shell.closest('.ws-doc-pane')?.querySelector('.ud-preview-stage')?.dataset.recordId === record.id) closePreview(shell);
          await renderRecords(shell);
          setStatus(shell, 'ย้ายไฟล์ไปส่วนไฟล์ที่ลบแล้ว', false);
        }
        if (control.dataset.action === 'restore') {
          const restored = withAudit(record, 'RESTORE');
          restored.status = 'ACTIVE';
          delete restored.deletedAt;
          delete restored.deletedBy;
          await writeRecord(restored);
          await renderRecords(shell);
          setStatus(shell, 'กู้คืนเอกสารแล้ว', false);
        }
      } catch (error) {
        setStatus(shell, 'ดำเนินการกับเอกสารไม่สำเร็จ กรุณาลองใหม่', true);
      }
    });

    const pane = shell.closest('.ws-doc-pane');
    if (pane && !pane.dataset.udPreviewBound) {
      pane.dataset.udPreviewBound = 'true';
      pane.addEventListener('click', function (event) {
        if (event.target.closest('.universal-doc-upload, .ud-preview-stage')) return;
        if (event.target.closest('.ws-doc-tab, [data-wi-tab], [data-doc], [data-a5-inbound-doc]')) closePreview(shell);
      });
    }
  }

  async function mountHost(host) {
    const activity = activityFor(host);
    const caseId = currentCaseId(activity, host);
    if (!caseId) return;
    const caseKey = activity + ':' + caseId;
    const documentPane = Array.from(host.children).find(function (child) {
      return child.classList && child.classList.contains('ws-doc-pane');
    });
    if (!documentPane) return;
    const uploadShells = Array.from(host.querySelectorAll('.universal-doc-upload'));
    const existing = uploadShells.find(function (shell) {
      return shell.parentElement === documentPane && shell.dataset.caseKey === caseKey;
    });
    uploadShells.forEach(function (shell) {
      if (shell !== existing) shell.remove();
    });
    if (existing) return;
    const shell = buildShell(caseKey);
    const toolbar = Array.from(documentPane.children).find(function (child) {
      return child.classList && child.classList.contains('ws-doc-toolbar');
    });
    if (toolbar) toolbar.insertAdjacentElement('afterend', shell);
    else documentPane.prepend(shell);
    mountedShells.add(shell);
    bindShell(shell, activity, caseId);
    try {
      await renderRecords(shell);
    } catch (error) {
      setStatus(shell, 'เปิดพื้นที่เอกสารไม่สำเร็จ', true);
    }
  }

  function mountAll() {
    mountedShells.forEach(function (shell) {
      if (shell.isConnected) return;
      cleanupPreview(shell);
      mountedShells.delete(shell);
    });
    document.querySelectorAll('.document-workspace').forEach(function (host) {
      mountHost(host);
    });
  }

  function scheduleMount() {
    window.clearTimeout(mountTimer);
    mountTimer = window.setTimeout(mountAll, 60);
  }

  window.ECMISUniversalDocumentUpload = Object.freeze({
    listActiveDocuments: function (activity, caseId) {
      return recordsForCase(String(activity) + ':' + String(caseId), false);
    },
    previewKind: previewKind,
    formatSize: formatSize
  });

  function start() {
    mountAll();
    const root = document.getElementById('workspaceHost') || document.body;
    new MutationObserver(scheduleMount).observe(root, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
}());
