# Student Panel

Students sign in with their student ID and see **only their own**
academic data.

```
student/
├─ index.html          entry point  (was student.html)
└─ js/student.js       login, session, sidebar, six views
```

Shared assets it loads from `../shared/`:

```
../shared/css/styles.css   design system
../shared/css/admin.css    login-card styling
../shared/js/api.js        data adapter (local | node | google)
../shared/js/data.js       sample data / seed
../shared/js/charts.js     inline-SVG charts
../shared/js/ui.js         icons, toasts, helpers
```

## Run

```bash
# from the repository root
python -m http.server 8000      # → http://localhost:8000/student/
```

## Login

| Field | Value |
|---|---|
| Student ID | `STU-10231` |
| Password | `student123` |

Other IDs (same password): `STU-10232`, `STU-10284`, `STU-10255`,
`STU-10258`, `STU-10261`. Prefix-less input also works — `10231` matches
`STU-10231`.

## Views

Hash-routed, six views rendered into `#sMain`:

| Route | View |
|---|---|
| `#/overview` | Welcome, GPA/CGPA, attendance summary, risk flags |
| `#/results` | Course-by-course marks, grades, grade points |
| `#/attendance` | Per-course attendance with thresholds |
| `#/courses` | Enrolled courses with instructors and credits |
| `#/announcements` | Institution-wide announcements |
| `#/timeline` | Academic activity timeline |

`renderSidebar()` and `renderPage()` (bottom of `js/student.js`) hold the
navigation: the sidebar sets `location.hash`, and `renderPage()` dispatches
to the matching `render*` function and toggles the `.active` nav state.

## Notes

- The session is kept in `localStorage` under `mu_student_session`, so a
  reload returns you straight to the panel; "Sign out" clears it.
- Data: `findStudent()` searches the live cache first, then the embedded
  seed, matching IDs with or without the `STU-` prefix and tolerating
  different spreadsheet column names (`id`, `studentId`, `userId`, `roll`…).
- If no backend is reachable the panel runs on the seed data in
  `../shared/js/data.js` — login still works.