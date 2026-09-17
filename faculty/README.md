# Faculty Portal

The instructor-facing portal: dashboard, students, results entry,
attendance, assignments, analytics, notifications and settings.

```
faculty/
├─ index.html          entry point  (was index.html)
└─ js/
   ├─ pages-a.js       dashboard, students, student profile
   ├─ pages-b.js       results, attendance, assignments
   ├─ pages-c.js       analytics, notifications, reports
   └─ pages-d.js       settings, admin console views
```

Shared assets it loads from `../shared/`:

```
../shared/css/styles.css   design system
../shared/js/api.js        data adapter (local | node | google)
../shared/js/data.js       sample data / seed
../shared/js/charts.js     inline-SVG charts
../shared/js/ui.js         shell: sidebar, topbar, nav, router, icons
```

## Run

```bash
# from the repository root
python -m http.server 8000      # → http://localhost:8000/faculty/
```

## Login

There is **no login screen** — the portal opens directly on the faculty
dashboard (demo user `Dr. Sarah Mitchell`).

## Navigation

`shared/js/ui.js` renders the shell and routes on `location.hash`
(e.g. `#/dashboard`, `#/students`, `#/results`, `#/settings`); each route
is implemented by a `page*` function in `pages-a…d.js`.

## Links to the other panels

- Sidebar / avatar menu → **"Separate Admin Panel"** opens
  `../admin/index.html`
- `../admin/`'s login card links back here (`../faculty/index.html`)