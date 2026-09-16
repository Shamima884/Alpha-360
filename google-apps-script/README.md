# Meridian — Google Sheets Backend (Apps Script)

Google Sheets is now a supported database for the Admin Panel & Faculty Portal.
The Apps Script lives in **`google-apps-script/Code.gs`**.

## Setup (5 minutes)

1. **Open your Apps Script project**
   Use the project URL you shared (`https://script.google.com/u/0/home/projects/1-uYYj…/edit`).

2. **Paste the script**
   Copy the entire contents of `google-apps-script/Code.gs`, replace everything
   in the editor (`Code.gs`), and **Save** (Ctrl+S).

3. **Run `setup` once**
   In the toolbar, pick the function dropdown → select **`setup`** → **Run**.
   Approve the authorization prompt (Review permissions → choose your account →
   Advanced → *Go to project (unsafe)* → Allow).
   The script creates a spreadsheet named **“Meridian DB (auto-created)”** with
   seeded sheets: `Students · Users · Courses · Announcements · Enrollments · AuditLog`.
   *(To bind to an existing sheet instead, paste its ID into `CONFIG.SPREADSHEET_ID` at the top.)*

4. **Deploy as Web App**
   **Deploy → New deployment → ⚙ Web app**
   - Description: anything
   - Execute as: **Me**
   - Who has access: **Anyone**
   → **Deploy** → copy the **Web App URL** (ends in `/exec`).

5. **Point the frontend at it**
   Open **`js/api.js`** and set:
   ```js
   cfg: {
     mode: 'google',
     googleUrl: 'https://script.google.com/macros/s/…/exec',
     timeout: 8000
   }
   ```
   Reload the Admin Panel (`admin.html`) or Faculty Portal (`index.html`).
   Console shows: `[API] connected · mode = google`.

6. **Verify** — open `<webAppUrl>?action=health` in a browser tab:
   `{"ok":true,"service":"Meridian Sheets API",…}`

## Actions (REST via the Web App)

| Action | Transport | Payload |
|---|---|---|
| `health` | GET | — |
| `all` | GET | — → full snapshot of all 6 sheets |
| `get` | GET | `collection`, `id` |
| `save` | POST | `{action, collection, rows:[…]}` (replaces sheet) |
| `append` | POST | `{action, collection, row}` |
| `update` | POST | `{action, collection, id, patch}` |
| `delete` | POST | `{action, collection, id}` |
| `login` | POST | `{action, email, password}` |
| `setup` | GET | `force=1` to re-seed empty sheets |

All admin-panel edits (students, users, courses, announcements, enrollments,
change log) automatically flow through `save` — the Google Sheet **is** the
live database, editable by hand too.

## Notes
- Frontend POSTs use `text/plain` bodies (JSON inside) — this deliberately
  avoids the CORS preflight that Apps Script can't answer.
- Demo logins in the `Users` sheet: `admin@meridian.edu / admin123`,
  `s.mitchell@meridian.edu / faculty123`. Clear the `password` column and
  use real auth before any production use.
- To migrate your full local dataset into Sheets, run this in the browser
  console once (with the panel open):
  ```js
  API.gRequest({action:'save',collection:'students',
    rows: JSON.parse(localStorage.getItem('mu_admin_students')||'[]')});
  // repeat for users / courses / announcements / enrollments, then reload
  ```
- Re-deploy a **new version** after editing the script
  (Deploy → Manage deployments → ✏ → Version: New → Deploy), or set
  version “Head” — otherwise the old code keeps serving.