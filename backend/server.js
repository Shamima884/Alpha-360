/* ============================================================
   Meridian backend — Node.js + Express, Google Sheets database
   Run:  cd backend && npm install && npm start   →  :3000
   ============================================================ */
'use strict';

const express = require('express');
const cors = require('cors');
const db = require('./db/sheets');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

/* ---------- health ---------- */
app.get('/api/health', (req, res) => {
  res.json({ ok: true, mode: 'google-sheets', sheet: db.SHEET_ID, time: new Date().toISOString() });
});

/* ---------- full snapshot (frontend boot) ---------- */
app.get('/api/all', async (req, res) => {
  try { res.json({ ok: true, data: await db.load() }); }
  catch (err) { res.status(500).json({ ok: false, error: err.message }); }
});

/* ---------- collection-level replace ---------- */
app.put('/api/collection/:name', async (req, res) => {
  try {
    const name = req.params.name;
    if (!(name in db.COLLECTIONS)) return res.status(400).json({ ok: false, error: 'Unknown collection: ' + name });
    if (!Array.isArray(req.body)) return res.status(400).json({ ok: false, error: 'JSON array expected' });
    await db.writeAll(db.COLLECTIONS[name], req.body);
    res.json({ ok: true, collection: name, count: req.body.length });
  } catch (err) { res.status(500).json({ ok: false, error: err.message }); }
});

/* ---------- per-record append ---------- */
app.post('/api/collection/:name', async (req, res) => {
  try {
    const name = req.params.name;
    if (!(name in db.COLLECTIONS)) return res.status(400).json({ ok: false, error: 'Unknown collection: ' + name });
    await db.appendRow(db.COLLECTIONS[name], req.body);
    res.status(201).json({ ok: true, record: req.body });
  } catch (err) { res.status(500).json({ ok: false, error: err.message }); }
});

/* ---------- auth ---------- */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const user = await db.asyncCheckLogin(email, password);
    if (!user) return res.status(401).json({ ok: false, error: 'Invalid credentials' });
    res.json({ ok: true, user });
  } catch (err) { res.status(500).json({ ok: false, error: err.message }); }
});

/* ---------- student-specific endpoints ---------- */
app.get('/api/student/:id', async (req, res) => {
  try {
    const students = await db.readAll(db.COLLECTIONS.students);
    const student = students.find(s => String(s.id) === String(req.params.id));
    if (!student) return res.status(404).json({ ok: false, error: 'Student not found' });
    const results = await db.readAll(db.COLLECTIONS.results);
    const studentResults = results.filter(r => String(r.studentId) === String(req.params.id));
    res.json({ ok: true, student, results: studentResults });
  } catch (err) { res.status(500).json({ ok: false, error: err.message }); }
});

app.get('/api/student/:id/results', async (req, res) => {
  try {
    const results = await db.readAll(db.COLLECTIONS.results);
    res.json({ ok: true, results: results.filter(r => String(r.studentId) === String(req.params.id)) });
  } catch (err) { res.status(500).json({ ok: false, error: err.message }); }
});

/* ---------- announcements ---------- */
app.get('/api/announcements', async (req, res) => {
  try { res.json({ ok: true, announcements: await db.readAll(db.COLLECTIONS.announcements) }); }
  catch (err) { res.status(500).json({ ok: false, error: err.message }); }
});

/* ---------- courses ---------- */
app.get('/api/courses', async (req, res) => {
  try { res.json({ ok: true, courses: await db.readAll(db.COLLECTIONS.courses) }); }
  catch (err) { res.status(500).json({ ok: false, error: err.message }); }
});

/* ---------- start ---------- */
app.listen(PORT, () => {
  console.log('──────────────────────────────────────────────');
  console.log('  Meridian backend      http://localhost:' + PORT);
  console.log('  Google Sheets DB       ' + db.SHEET_ID);
  console.log('──────────────────────────────────────────────');
});
