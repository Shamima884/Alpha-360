/* ============================================================
   Meridian — Google Sheets database layer
   One spreadsheet = the database. One sheet per collection.
   Collections: Students · Users · Courses · Announcements · Results
   ============================================================ */
'use strict';

const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const SHEET_ID = '19zVoHeA5DiyKkA-980uMU4S76X5uL0P2_hdrtCqBDms';
const CREDS_FILE = path.join(__dirname, '..', 'credentials.json');

const COLLECTIONS = {
  students:      'Students',
  users:         'Users',
  courses:       'Courses',
  announcements: 'Announcements',
  results:       'Results'
};

let authClient = null;
let sheetsApi = null;

function getAuth() {
  if (authClient) return authClient;
  if (!fs.existsSync(CREDS_FILE)) {
    throw new Error('Google credentials file not found: ' + CREDS_FILE + '\nDownload it from Google Cloud Console → APIs & Services → Credentials → Service Account');
  }
  const creds = JSON.parse(fs.readFileSync(CREDS_FILE, 'utf8'));
  authClient = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  return authClient;
}

function getApi() {
  if (sheetsApi) return sheetsApi;
  sheetsApi = google.sheets({ version: 'v4', auth: getAuth() });
  return sheetsApi;
}

async function ensureSheet(title) {
  try {
    const meta = await getApi().spreadsheets.get({ spreadsheetId: SHEET_ID });
    const exists = meta.data.sheets.some(s => s.properties.title === title);
    if (!exists) {
      await getApi().spreadsheets.batchUpdate({
        spreadsheetId: SHEET_ID,
        resource: { requests: [{ addSheet: { properties: { title } } }] }
      });
    }
  } catch (err) {
    throw new Error('Cannot access spreadsheet. Share it with the service account. ' + err.message);
  }
}

async function readAll(title) {
  await ensureSheet(title);
  const res = await getApi().spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: title
  });
  const rows = res.data.values || [];
  if (rows.length < 2) return [];
  const headers = rows[0].map(h => String(h || '').trim());
  return rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i] !== undefined ? row[i] : ''; });
    return obj;
  });
}

async function writeAll(title, records) {
  await ensureSheet(title);
  const headers = [];
  records.forEach(r => Object.keys(r).forEach(k => { if (!headers.includes(k)) headers.push(k); }));
  const values = records.map(r => headers.map(h => {
    const v = r[h];
    if (v === undefined || v === null) return '';
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
  }));
  await getApi().spreadsheets.values.clear({ spreadsheetId: SHEET_ID, range: title });
  await getApi().spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: title,
    valueInputOption: 'USER_ENTERED',
    resource: { values: [headers, ...values] }
  });
}

async function appendRow(title, record) {
  await ensureSheet(title);
  const existing = await readAll(title);
  const headers = [];
  existing.forEach(r => Object.keys(r).forEach(k => { if (!headers.includes(k)) headers.push(k); }));
  Object.keys(record).forEach(k => { if (!headers.includes(k)) headers.push(k); });
  const row = headers.map(h => {
    const v = record[h];
    if (v === undefined || v === null) return '';
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
  });
  await getApi().spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: title,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    resource: { values: [row] }
  });
}

async function load() {
  const out = {};
  for (const [key, title] of Object.entries(COLLECTIONS)) {
    try { out[key] = await readAll(title); }
    catch (err) { console.error('[DB] failed to read ' + title + ':', err.message); out[key] = []; }
  }
  return out;
}

function checkLogin(email, password) {
  // Synchronous fallback - not used with async sheets API
  return null;
}

async function asyncCheckLogin(email, password) {
  const users = await readAll(COLLECTIONS.users);
  return users.find(u => String(u.email).toLowerCase() === String(email).toLowerCase() && String(u.password) === String(password));
}

module.exports = { load, readAll, writeAll, appendRow, checkLogin, asyncCheckLogin, COLLECTIONS, SHEET_ID };
