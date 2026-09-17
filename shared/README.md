# shared/ — assets common to all three panels

Nothing in this folder is panel-specific. If a file is used by more than
one panel, it belongs here; otherwise keep it inside the panel folder.

```
shared/
├─ css/
│  ├─ styles.css     design system: CSS variables, reset, layout,
│  │                 buttons, cards, tables, forms, dark mode
│  └─ admin.css      admin panel chrome + the login cards used by the
│                    admin and student panels
└─ js/
   ├─ api.js         data adapter — the single switch between backends:
   │                   'local'  localStorage only
   │                   'node'   backend/server.js (Express + Sheets API)
   │                   'google' Apps Script web app (cfg.googleUrl)
   │                 Cache-first: pulls a snapshot on boot, mirrors writes
   │                 to localStorage, and falls back to local data (seed
   │                 included) whenever the backend errors or is missing.
   ├─ data.js        embedded sample data + deterministic seed builders
   │                 (students, courses, results, attendance, alerts…)
   ├─ charts.js      dependency-free inline-SVG charts (spark, line, bar,
   │                 donut, progress)
   └─ ui.js          shared shell + widgets: icons(), toast(), modal(),
                     table helpers, exportCsv(), nav + hash router, theme
```

## How panels reference these files

- **student** and **faculty** sit one level below the root and use relative paths:
  ```html
  <link rel="stylesheet" href="../shared/css/styles.css">
  <script src="../shared/js/api.js?v=20260915"></script>
  ```
  Their own script stays local, e.g. `./js/student.js`.

- **admin** is served by `admin_server.py` at the repository root (`/`), so it
  references shared assets and its own script with **root-absolute** paths that
  work whether the page is loaded at `/` or `/admin/`:
  ```html
  <link rel="stylesheet" href="/shared/css/styles.css">
  <script src="/admin/js/admin.js?v=20260915"></script>
  ```

## Cache-busting

Every `<script>`/`<link>` in the three panels carries a version query
(`?v=20260915`). **Bump it in all three `index.html` files** whenever you
change a file in `shared/` so browsers do not serve a stale copy.

## Conventions

- Plain ES2017+ browser JS — no bundler, no modules, no build step.
- Load order matters: `api.js` → `data.js` → `charts.js` → `ui.js` →
  panel script.
- `api.js` is designed to be non-fatal: if the backend is unreachable the
  panels keep working from `data.js`.