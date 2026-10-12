/**
 * ZiaFlow form intake → Google Sheets (+ Drive for attachments).
 *
 * DEPLOY
 *  1. Open the target Google Sheet → Extensions → Apps Script → paste this file as Code.gs.
 *  2. Project Settings → Script Properties → add SHARED_SECRET (long random string, ≥ 32 chars).
 *     Optional: ATTACHMENTS_FOLDER_ID (Drive folder ID); otherwise a folder is created on setup().
 *  3. Run setup() once from the editor and approve the Sheets/Drive permissions.
 *  4. Deploy → New deployment → Web app → Execute as: Me → Who has access: Anyone → copy the /exec URL.
 *  5. In Vercel (Production + Preview) set GOOGLE_SCRIPT_URL=<exec URL> and GOOGLE_SCRIPT_SECRET=<same secret>.
 *  After editing this script: Deploy → Manage deployments → edit → Version: New version (URL stays the same).
 *
 * REQUEST (POST, JSON body)
 *  { secret, submissionId, tab, columns: [{header, value}], attachment?: {name, mimeType, base64} }
 * RESPONSE (always HTTP 200 — Apps Script cannot set status codes)
 *  { ok: true, duplicate: boolean } | { ok: false, error: 'unauthorized' | 'bad_request' | 'server_error' }
 */

var ID_HEADER = 'Submission ID';
var LOGGED_AT_HEADER = 'Logged At';
var ATTACHMENT_HEADER = 'Attachment';
var UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
var MAX_COLUMNS = 60;
var MAX_CELL_LENGTH = 10000;
var MAX_ATTACHMENT_BYTES = 3 * 1024 * 1024;
var ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

/** Run once from the editor to authorize scopes and validate configuration. */
function setup() {
  var props = PropertiesService.getScriptProperties();
  var secret = props.getProperty('SHARED_SECRET');
  if (!secret || secret.length < 16) {
    throw new Error('Add a SHARED_SECRET (at least 16 characters) under Project Settings → Script Properties first.');
  }
  getAttachmentsFolder_();
  SpreadsheetApp.getActiveSpreadsheet().getName();
  Logger.log('Setup complete. Now Deploy → Web app (Execute as: Me, Access: Anyone).');
}

function doGet() {
  // Do not reveal anything useful to unauthenticated callers.
  return json_({ ok: false, error: 'bad_request' });
}

function doPost(e) {
  var body;
  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || '');
  } catch (err) {
    return json_({ ok: false, error: 'bad_request' });
  }

  // 1. Authenticate before touching anything.
  var expected = PropertiesService.getScriptProperties().getProperty('SHARED_SECRET');
  if (!expected || typeof body.secret !== 'string' || !safeEquals_(body.secret, expected)) {
    return json_({ ok: false, error: 'unauthorized' });
  }

  // 2. Validate shape.
  var submissionId = String(body.submissionId || '');
  var tab = sanitizeTabName_(body.tab);
  var columns = Array.isArray(body.columns) ? body.columns.slice(0, MAX_COLUMNS) : null;
  if (!UUID_RE.test(submissionId) || !tab || !columns || columns.length === 0) {
    return json_({ ok: false, error: 'bad_request' });
  }

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(25000);
  } catch (err) {
    return json_({ ok: false, error: 'server_error' });
  }

  try {
    // 3. Idempotency: cached fast-path, then authoritative lookup in the sheet.
    var cache = CacheService.getScriptCache();
    var cacheKey = 'sub_' + submissionId;
    if (cache.get(cacheKey)) return json_({ ok: true, duplicate: true });

    var sheet = getOrCreateSheet_(tab);
    var headers = ensureHeaders_(
      sheet,
      [ID_HEADER, LOGGED_AT_HEADER].concat(
        columns.map(function (c) {
          return String(c.header || '').slice(0, 100);
        }),
        [ATTACHMENT_HEADER]
      )
    );

    if (findSubmission_(sheet, headers, submissionId)) {
      cache.put(cacheKey, '1', 21600);
      return json_({ ok: true, duplicate: true });
    }

    // 4. Optional attachment → Drive, linked from the sheet.
    var attachmentFormula = '';
    if (body.attachment && body.attachment.base64) {
      attachmentFormula = saveAttachment_(body.attachment, submissionId);
    }

    // 5. Build the row in header order with formula-injection sanitizing.
    var values = {};
    columns.forEach(function (c) {
      values[String(c.header || '').slice(0, 100)] = c.value;
    });
    values[ID_HEADER] = submissionId;

    var row = headers.map(function (h) {
      if (h === LOGGED_AT_HEADER) return new Date();
      if (h === ATTACHMENT_HEADER) return '';
      return sanitizeCell_(values[h]);
    });

    sheet.appendRow(row);

    if (attachmentFormula) {
      var lastRow = sheet.getLastRow();
      sheet.getRange(lastRow, headers.indexOf(ATTACHMENT_HEADER) + 1).setFormula(attachmentFormula);
    }

    cache.put(cacheKey, '1', 21600);
    return json_({ ok: true, duplicate: false });
  } catch (err) {
    console.error('intake_error: ' + (err && err.message));
    return json_({ ok: false, error: 'server_error' });
  } finally {
    lock.releaseLock();
  }
}

/* ------------------------------------------------------------- helpers */

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function safeEquals_(a, b) {
  if (a.length !== b.length) return false;
  var diff = 0;
  for (var i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function sanitizeTabName_(name) {
  var s = String(name || '')
    .replace(/[\[\]\*\/\\\?:]/g, ' ')
    .trim()
    .slice(0, 90);
  return s || null;
}

/** Prevent CSV/formula injection: prefix values that a spreadsheet would treat as formulas. */
function sanitizeCell_(value) {
  if (value === null || value === undefined) return '';
  var s = String(value).slice(0, MAX_CELL_LENGTH);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return s;
}

function getOrCreateSheet_(tab) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(tab);
  if (!sheet) {
    sheet = ss.insertSheet(tab);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/** Ensure every wanted header exists (appending new ones on the right); returns the full header row. */
function ensureHeaders_(sheet, wanted) {
  var lastCol = sheet.getLastColumn();
  var existing =
    lastCol > 0
      ? sheet
          .getRange(1, 1, 1, lastCol)
          .getValues()[0]
          .map(function (h) {
            return String(h);
          })
      : [];

  var added = false;
  wanted.forEach(function (h) {
    if (h && existing.indexOf(h) === -1) {
      existing.push(h);
      added = true;
    }
  });

  if (added) {
    sheet.getRange(1, 1, 1, existing.length).setValues([existing]).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return existing;
}

function findSubmission_(sheet, headers, submissionId) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;
  var col = headers.indexOf(ID_HEADER) + 1;
  var match = sheet
    .getRange(2, col, lastRow - 1, 1)
    .createTextFinder(submissionId)
    .matchEntireCell(true)
    .findNext();
  return !!match;
}

function getAttachmentsFolder_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('ATTACHMENTS_FOLDER_ID');
  if (id) {
    try {
      return DriveApp.getFolderById(id);
    } catch (err) {
      /* fall through and recreate */
    }
  }
  var folder = DriveApp.createFolder('ZiaFlow Form Attachments');
  props.setProperty('ATTACHMENTS_FOLDER_ID', folder.getId());
  return folder;
}

/** Decode base64 → Drive file (private to the script owner) → HYPERLINK formula. */
function saveAttachment_(attachment, submissionId) {
  var mimeType = String(attachment.mimeType || '');
  if (ALLOWED_MIME_TYPES.indexOf(mimeType) === -1) return '';
  var bytes = Utilities.base64Decode(String(attachment.base64));
  if (bytes.length === 0 || bytes.length > MAX_ATTACHMENT_BYTES) return '';

  var safeName = String(attachment.name || 'attachment')
    .replace(/[^\w.\- ]+/g, '_')
    .slice(0, 120);
  var blob = Utilities.newBlob(bytes, mimeType, submissionId.slice(0, 8) + '_' + safeName);
  var file = getAttachmentsFolder_().createFile(blob);
  // Sharing intentionally left private: only the owner/collaborators can open the link.

  var label = safeName.replace(/"/g, '""');
  return '=HYPERLINK("' + file.getUrl() + '","' + label + '")';
}
