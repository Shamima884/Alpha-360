# Admin Panel

Administrator control center for Meridian — student records, courses,
results, users, announcements, audit log and settings.

```
admin/
├─ index.html     entry point  (was admin.html)
└─ js/admin.js    all panel logic (login, sidebar, views, CRUD)
```

Everything else it needs lives in `/shared/`:

```
/shared/css/styles.css      design system
/shared/css/admin.css       admin styles + login card
/shared/js/api.js           data adapter (local | node | google)
/shared/js/data.js          sample data / seed
/shared/js/charts.js        inline-SVG charts
/shared/js/ui.js            icons, toasts, modals, helper widgets
```

Its own script is `/admin/js/admin.js`.

> `shared/js/ui.js` powers the "Separate Admin Panel" button seen in the
> faculty portal, so the two stay linked.

## Run

```bash
# full project (all three panels), from the repository root
python -m http.server 8000      # → http://localhost:8000/admin/

# admin panel only — the production setup
python admin_server.py          # → http://localhost:8080
```

## Login

Demo credentials: **`admin@meridian.edu`** / **`admin123`**
(any password of 6+ characters is accepted; the check is client-side).

## Deploy

Deployed alone on Render via `admin_server.py` + `render.yaml` — the
faculty and student panels are *not* served there. Full instructions:
**[../RENDER-ADMIN-DEPLOY.md](../RENDER-ADMIN-DEPLOY.md)**

To add or remove served paths, edit the `ALLOWED` allow-list at the top of
`admin_server.py`.