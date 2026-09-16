/* ============================================================
   Excel "database" layer — backend/db/excel.js
   One workbook (data/meridian.xlsx), one sheet per collection.
   Object/array columns are stored as JSON strings and restored
   on read. All writes go through save() → single source of truth.
   ============================================================ */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const XLSX = require('xlsx');

const DATA_DIR = path.join(__dirname, '..', 'data');
const FILE = path.join(DATA_DIR, 'meridian.xlsx');

/* collection key → sheet name */
const SHEET = {
  students: 'Students',
  users: 'Faculty',
  courses: 'Courses',
  announcements: 'Announcements',
  enrollments: 'Enrollments',
  changelog: 'AuditLog'
};

/* columns that hold arrays/objects in the app but must be JSON strings in Excel */
const JSON_COLS = {
  students: ['gpaTrend', 'courseAtt'],
  users: [],
  courses: [],
  announcements: [],
  enrollments: [],
  changelog: []
};

let cache = null;   /* in-memory {students:[], users:[], ...} */

function ensureDir(){ fs.mkdirSync(DATA_DIR, { recursive: true }); }

function sha256(s){ return crypto.createHash('sha256').update(String(s)).digest('hex'); }

/* ---------- seed ---------- */
function seed(){
  return require('../seed/seed.json');
}

/* ---------- serialize / deserialize ---------- */
function toSheet(name, rows){
  return (rows || []).map(r => {
    const o = { ...r };
    (JSON_COLS[name] || []).forEach(c => {
      if(o[c] && typeof o[c] === 'object') o[c] = JSON.stringify(o[c]);
    });
    return o;
  });
}
function fromSheet(name, rows){
  return (rows || []).map(r => {
    const o = { ...r };
    (JSON_COLS[name] || []).forEach(c => {
      if(typeof o[c] === 'string'){
        try { o[c] = JSON.parse(o[c]); } catch(e){ /* keep raw string */ }
      }
    });
    return o;
  });
}

/* ---------- load / save ---------- */
function load(){
  if(cache) return cache;
  const db = {};
  Object.keys(SHEET).forEach(k => { db[k] = []; });
  if(fs.existsSync(FILE)){
    const wb = XLSX.readFile(FILE);
    Object.keys(SHEET).forEach(k => {
      const ws = wb.Sheets[SHEET[k]];
      db[k] = ws ? fromSheet(k, XLSX.utils.sheet_to_json(ws)) : [];
    });
  } else {
    Object.assign(db, seed());
    save(db);                       /* create the workbook on first boot */
  }
  cache = db;
  return db;
}

function save(db){
  ensureDir();
  const wb = XLSX.utils.book_new();
  Object.keys(SHEET).forEach(k => {
    const ws = XLSX.utils.json_to_sheet(toSheet(k, db[k] || []));
    XLSX.utils.book_append_sheet(wb, ws, SHEET[k]);
  });
  XLSX.writeFile(wb, FILE);
  cache = db;
}

function set(name, rows){
  if(!(name in SHEET)) throw new Error('Unknown collection: ' + name);
  const db = load();
  db[name] = rows;
  save(db);
}

function pushRecord(name, record){
  const db = load();
  db[name].push(record);
  save(db);
  return record;
}

/* ---------- auth (demo-grade; swap for hashed creds in production) ---------- */
function checkLogin(email, password){
  const db = load();
  const u = (db.users || []).find(u =>
    String(u.email).toLowerCase() === String(email || '').toLowerCase() &&
    (u.password === password || u.passwordHash === sha256(password)));
  if(!u) return null;
  return { id: u.id, name: u.name, email: u.email, role: u.role };
}

/* ---------- import / export ---------- */
function importSnapshot(snap){
  const db = load();
  Object.keys(SHEET).forEach(k => {
    if(Array.isArray(snap[k])) db[k] = snap[k];
  });
  save(db);
}

function file(){ return FILE; }
function init(){ ensureDir(); load(); }

module.exports = { load, save, set, pushRecord, checkLogin, importSnapshot, file, init, sha256, SHEET };