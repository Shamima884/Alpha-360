# Meridian Backend — Node.js + Google Sheets

## Architecture

```
student.html ──→ js/api.js ──→ backend/server.js ──→ Google Sheet (Sheets API)
                                            │
admin.html   ──→ js/api.js ──→ Google Apps Script ──→ Google Sheet (same)
                                            │
index.html   ──→ js/api.js ──→ Google Apps Script ──→ Google Sheet (same)
```

## Quick Start (Node.js Backend for Student Panel)

### 1. Install Node.js
Download from https://nodejs.org (LTS version)

### 2. Install dependencies
```bash
cd backend
npm install
```

### 3. Set up Google Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. Enable **Google Sheets API** and **Google Drive API**
4. Go to **Credentials** → **Create Credentials** → **Service Account**
5. Give it a name, click through, and **create a JSON key**
6. Download the JSON key file and save it as `backend/credentials.json`
7. **Share your Google Sheet** with the service account email (client_email from credentials.json) — give it **Editor** access

### 4. Set Sheet ID

Open `backend/db/sheets.js` and verify the `SHEET_ID` matches your sheet:
```js
const SHEET_ID = '19zVoHeA5DiyKkA-980uMU4S76X5uL0P2_hdrtCqBDms';
```

### 5. Start the server
```bash
cd backend
npm start
```

Output:
```
──────────────────────────────────────────────
  Meridian backend      http://localhost:3000
  Google Sheets DB       19zVoHeA5DiyKkA-980uMU4S76X5uL0P2_hdrtCqBDms
──────────────────────────────────────────────
```

### 6. Open the Student Panel
Open `student.html` in your browser (via the local server on port 8000)
Set `js/api.js` → `cfg.mode = 'node'` to use the Node.js backend

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/all` | Full snapshot of all collections |
| PUT | `/api/collection/:name` | Replace entire collection |
| POST | `/api/collection/:name` | Append record to collection |
| POST | `/api/auth/login` | Authenticate user |
| GET | `/api/student/:id` | Get student + their results |
| GET | `/api/student/:id/results` | Get student's results |
| GET | `/api/courses` | List all courses |
| GET | `/api/announcements` | List all announcements |

## Collections (Sheets)

- **Students** — Student records with course attendance
- **Users** — Login credentials
- **Courses** — Course catalog
- **Announcements** — Institution announcements
- **Results** — Exam results per student
- **AuditLog** — Change history

## Switching Backends

Edit `js/api.js`:
```js
cfg: {
  mode: 'google',   // 'local' | 'node' | 'google'
  base: 'http://localhost:3000/api',
  googleUrl: 'YOUR_APPS_SCRIPT_URL',
}
```

- `google` → Uses Google Apps Script (default, no Node.js needed)
- `node` → Uses Node.js backend with direct Sheets API
- `local` → localStorage only, no backend

## File map

```
backend/
├─ server.js          Express routes (this file is the whole API)
├─ db/sheets.js       Google Sheets database layer
├─ credentials.json   Google Service Account key (you provide)
├─ package.json       express · cors · googleapis
└─ README.md          this file
```

## Troubleshooting: Google Apps Script deployment

The Apps Script Web App (used by `google` mode in `js/api.js`) must contain
**only** the code from `google-apps-script/Code.gs`.

⚠️ **Never paste `backend/db/sheets.js` into the Apps Script editor.**
It is Node.js code (`require('googleapis')`) and will make every request fail
with `ReferenceError: require is not defined (line 11, file "Code")`. When
that happens the frontend falls back to the embedded seed data
(`js/data.js`) and login still works, but the shared spreadsheet is never
read or written.

### Verify a deployment

1. Open `<webAppUrl>?action=health` in a browser.
   ✅ Expected: `{"ok":true,"service":"Meridian Sheets API",...}`
   ❌ An error page (e.g. *require is not defined*) means the wrong code is
   deployed — re-paste `google-apps-script/Code.gs`, Save, then
   **Deploy → Manage deployments → ✏️ Edit → New version → Deploy** (keep
   the same Web App URL; no need to change `js/api.js`).
2. Open `<webAppUrl>?action=all` — it should return JSON with
   `data.students` (IDs like `STU-10231`). If `data` is empty, run the
   `setup` function once from the Apps Script editor to seed the sheet.
3. If you create a **new** deployment (new URL), update
   `js/api.js → cfg.googleUrl` accordingly.

### Frontend behavior when the backend is down

`js/api.js` treats any failure — network error, HTML error page, or
`{ok:false}` response — as "backend unreachable" and automatically falls
back to localStorage mirrors / the embedded seed, so the Student Panel
(`STU-10231` / `student123`) always works. Browser caching of old scripts
is prevented via the `?v=…` query strings on the `<script>` tags in
`student.html` — bump the version when you edit the JS files.