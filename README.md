# Meridian — Faculty 360 Portal Suite

Three separate single-page panels sharing one data layer, plus the
optional backends that feed them.

## Repository layout

```
admin/               Admin control panel        (its own deployment)
  index.html         entry point
  js/admin.js        panel logic
student/             Student panel
  index.html         entry point
  js/student.js      panel logic
faculty/             Faculty portal
  index.html         entry point
  js/pages-a…d.js    page modules
shared/              Assets used by ALL panels
  css/styles.css     design system (variables, components, layout)
  css/admin.css      admin panel + login screens
  js/api.js          data adapter — local | node | google
  js/data.js         embedded sample data + seed
  js/charts.js       inline-SVG charts
  js/ui.js           shared UI helpers (icons, toasts, modals, nav)
backend/             Optional Node.js + Express + Google Sheets API
google-apps-script/  Apps Script web app (serverless backend option)
admin_server.py      Serves ONLY the admin panel (production server)
render.yaml          Render Blueprint → admin-only deployment
RENDER-ADMIN-DEPLOY.md  Deployment guide
```

Each panel is independent: it loads `../shared/…` for the design system
and data layer, and its own script from its local `js/` folder.

## Run locally

Serve the repository root with any static server:

```bash
python -m http.server 8000
```

| Panel | URL |
|---|---|
| Admin control panel | http://localhost:8000/admin/ |
| Student panel | http://localhost:8000/student/ |
| Faculty portal | http://localhost:8000/faculty/ |

To run the **admin panel exactly as it is deployed** (nothing else served):

```bash
python admin_server.py        # → http://localhost:8080
```

## Demo credentials

| Panel | Credentials |
|---|---|
| Admin | `admin@meridian.edu` / `admin123` |
| Student | `STU-10231` / `student123` |
| Faculty | no login — opens straight to the dashboard |

Also valid student IDs (password `student123`): `STU-10232`, `STU-10284`,
`STU-10255`, `STU-10258`, `STU-10261`.

## Data source

`shared/js/api.js` picks the backend in `API.cfg.mode`:

- `google` — Google Apps Script web app (set `API.cfg.googleUrl`), see
  `google-apps-script/Code.gs` and `backend/README.md`
- `node` — the Express + Sheets backend in `backend/` (`npm start`)
- `local` — localStorage only, no backend

If the configured backend is unreachable or returns an error, the panels
fall back to the embedded seed data, so the UI always works.

## Deployment

The admin panel is deployed on its own (Render) — see
**[RENDER-ADMIN-DEPLOY.md](RENDER-ADMIN-DEPLOY.md)**.