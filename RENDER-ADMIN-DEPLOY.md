# Deploy ONLY the Admin Panel — Render

This guide publishes **just the admin control panel** (`admin.html`).
The faculty portal (`index.html`) and student portal (`student.html`) are
**not** served by this deployment — they return a branded 404.

```
GET /  /admin  /admin/index.html          → admin/index.html        ✅
GET /admin/js/admin.js                    → admin panel script      ✅
GET /shared/css/styles.css  .  admin.css  → shared stylesheets      ✅
GET /shared/js/api.js  data.js  charts.js  ui.js → shared scripts   ✅
GET /faculty/…   /student/…               → ❌ 404 (not deployed)
GET /index.html  /student.html  /js/…  /css/… → ❌ 404 (old layout)
GET /admin_server.py  /.gitignore  /.git/**   → ❌ 404
GET /healthz                              → ✅ JSON (public)
```

The server is `admin_server.py` (Python standard library only — **no
dependencies, no build step**), configured by `render.yaml`.

---

## 1. Push the code (already done)

`render.yaml` and `admin_server.py` must be on the branch Render deploys
(`main`):

```bash
git add -A
git commit -m "add Render deployment for admin panel only"
git push origin main
```

---

## 2. Deploy — Option A: Blueprint (recommended)

1. Sign in to <https://dashboard.render.com>
2. **New ▸ Blueprint**
3. Connect the repo **`Shamima884/Alpha-360`** (authorise GitHub if asked)
4. Render reads `render.yaml` and shows the service **`meridian-admin`**
5. Fill the two environment variables (or leave blank to publish with no
   password — **not recommended**):
   - `ADMIN_USER` → e.g. `admin`
   - `ADMIN_PASS` → a strong password
6. **Apply** → Render installs nothing, starts the server and health-checks
   `/healthz`. The public URL appears as
   `https://meridian-admin.onrender.com` (or similar).

## 2'. Deploy — Option B: Manual web service

**New ▸ Web Service** → connect the same repo → use exactly these values:

| Field | Value |
|---|---|
| Name | `meridian-admin` |
| Language / Runtime | **Python 3** |
| Branch | `main` |
| Root Directory | *(leave empty)* |
| Build Command | `echo no dependencies` |
| Start Command | `python admin_server.py` |
| Instance Type | Free |
| Health Check Path | `/healthz` |

Then **Environment ▸ Add Environment Variable**: `ADMIN_USER`, `ADMIN_PASS`.

---

## 3. Environment variables

| Key | Required | Purpose |
|---|---|---|
| `ADMIN_USER` | optional | Username for HTTP Basic Auth. If **both** `ADMIN_USER` and `ADMIN_PASS` are set, the whole panel is password-protected. |
| `ADMIN_PASS` | optional | Password for HTTP Basic Auth. |
| `PYTHON_VERSION` | optional | `3.12.10` — already set in `render.yaml`. |
| `PORT` | automatic | Injected by Render; `admin_server.py` reads it (`8080` locally). |

`/healthz` is always public so Render's health check works with auth on.

---

## 4. Test the deployment

```bash
# health (public)
curl https://<your-service>.onrender.com/healthz
# → {"ok":true,"service":"meridian-admin","scope":"admin-panel-only","auth":true}

# admin panel (200) — with Basic Auth creds if you set them
curl -u admin:YOURPASS -I https://<your-service>.onrender.com/

# these must all be 404 — proves only the admin panel is deployed
curl -o /dev/null -w "%{http_code}\n" https://<your-service>.onrender.com/student/
curl -o /dev/null -w "%{http_code}\n" https://<your-service>.onrender.com/faculty/
```

In the browser: open the service URL → the **Meridian Admin** login card →
sign in with the panel's own credentials (`admin@meridian.edu` / any
password of 6+ characters, e.g. `admin123`) → the admin dashboard loads.

---

## 5. Run the same server locally

```bash
python admin_server.py                 # → http://localhost:8080
```

With access protection:

```bash
# Windows PowerShell
$env:ADMIN_USER="admin"; $env:ADMIN_PASS="secret123"; python admin_server.py

# macOS / Linux / Render shell
ADMIN_USER=admin ADMIN_PASS=secret123 python admin_server.py
```

Use a different port: `PORT=9000 python admin_server.py`

---

## Notes & behaviour

- **Data source.** `shared/js/api.js` runs with `mode:'google'` and talks to the
  Google Apps Script web app (`cfg.googleUrl`). If that endpoint is
  unreachable or returns an error, the panel automatically falls back to the
  embedded seed data in `js/data.js`, so the deployment always loads. Once
  the Apps Script deployment in `google-apps-script/Code.gs` is live, the
  hosted panel reads/writes your Google Sheet.
- **Two layers of login.** The panel's own login (`admin@meridian.edu`,
  6+ characters) is client-side only — it is *not* real security. Set
  `ADMIN_USER` / `ADMIN_PASS` to protect the deployment with HTTP Basic Auth.
- **Free plan.** The service sleeps after ~15 minutes of inactivity; the
  first request afterwards takes ~30–60 s to wake.
- **Auto-deploy.** `autoDeploy: true` in `render.yaml` redeploys on every
  push to the connected branch.
- **Not exposed on purpose.** `admin/js/admin.js` and `shared/js/*` are
  served (the panel needs them), but the source files `admin_server.py`,
  `.gitignore` and the faculty / student panels are not reachable. Change
  `ALLOWED` in `admin_server.py` if you later want to publish those too.
- **Custom domain.** Render ▸ your service ▸ **Settings ▸ Custom Domains**.
- **No secrets in the repo.** `backend/credentials.json` (Google service
  account key) is git-ignored and is *not* needed for this deployment —
  the admin panel uses Apps Script, not the Node backend.