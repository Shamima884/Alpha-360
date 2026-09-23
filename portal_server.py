#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════════════
 Meridian — ALL PANELS server (Render-ready)

 Serves the whole Meridian suite in one deployment, linked together:

     /                → portal.html   (landing page linking the 3 panels)
     /faculty/…       → faculty/index.html + faculty/js/pages-{a,b,c,d}.js
     /admin/…         → admin/index.html  + admin/js/admin.js
     /student/…       → student/index.html + student/js/student.js
     /shared/…        → css/styles.css  css/admin.css
                         js/api.js  js/data.js  js/charts.js  js/ui.js

 The panels are interlinked:
     - faculty sidebar / avatar menu → "Separate Admin Panel"
     - admin login card → "← Back to Faculty Portal"
     - admin sidebar → "Faculty Portal"
     - student login card → "← Back to Faculty Portal"

 Pure Python standard library: no dependencies, no build step.

 RUN LOCALLY
     python portal_server.py             →  http://localhost:8080

 DEPLOY (Render)
     startCommand: python portal_server.py
     PORT is injected by Render automatically.

 OPTIONAL ACCESS PROTECTION (recommended for a public URL)
     PORTAL_USER=<user>  PORTAL_PASS=<pass>
     → HTTP Basic Auth guards every page; /healthz stays public for
       Render's health check.
═══════════════════════════════════════════════════════════════════════
"""

import base64
import hmac
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse

BASE_DIR = Path(__file__).resolve().parent

# Pages are never cached (so a redeploy is picked up immediately);
# versioned assets (?v=…) may be cached briefly.
NO_CACHE_PATHS = {
    "", "/", "/portal",
    "/faculty", "/faculty/index.html",
    "/admin", "/admin/index.html",
    "/student", "/student/index.html",
}

PORTAL_USER = os.environ.get("PORTAL_USER", "").strip()
PORTAL_PASS = os.environ.get("PORTAL_PASS", "")
AUTH_ON = bool(PORTAL_USER and PORTAL_PASS)

PORT = int(os.environ.get("PORT", "8080"))

SERVICE_NAME = "meridian-portal"

# ── ALL paths this deployment exposes ───────────────────────────────────
# (query strings such as ?v=20260915 are ignored when matching)
ALLOWED = {
    # landing page
    "": "portal.html",
    "/": "portal.html",
    "/portal": "portal.html",
    # faculty panel
    "/faculty": "faculty/index.html",
    "/faculty/index.html": "faculty/index.html",
    "/faculty/js/pages-a.js": "faculty/js/pages-a.js",
    "/faculty/js/pages-b.js": "faculty/js/pages-b.js",
    "/faculty/js/pages-c.js": "faculty/js/pages-c.js",
    "/faculty/js/pages-d.js": "faculty/js/pages-d.js",
    # admin panel
    "/admin": "admin/index.html",
    "/admin/index.html": "admin/index.html",
    "/admin/js/admin.js": "admin/js/admin.js",
    # student panel
    "/student": "student/index.html",
    "/student/index.html": "student/index.html",
    "/student/js/student.js": "student/js/student.js",
    # shared design system + data layer
    "/shared/css/styles.css": "shared/css/styles.css",
    "/shared/css/admin.css": "shared/css/admin.css",
    "/shared/js/api.js": "shared/js/api.js",
    "/shared/js/data.js": "shared/js/data.js",
    "/shared/js/charts.js": "shared/js/charts.js",
    "/shared/js/ui.js": "shared/js/ui.js",
}

MIME = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".ico": "image/x-icon",
}

NOT_FOUND_HTML = """<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>Not found · Meridian Portal</title>
<style>
 body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
      font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#f8fafc;color:#0f172a}
 .card{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:36px 40px;max-width:460px;
       box-shadow:0 4px 24px rgba(0,0,0,.06);text-align:center}
 h1{font-size:20px;margin:0 0 8px}
 p{color:#64748b;font-size:14px;line-height:1.6;margin:0 0 18px}
 a{display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;font-weight:600;font-size:14px;
   padding:10px 20px;border-radius:9px}
 code{background:#f1f5f9;padding:2px 6px;border-radius:5px;font-size:12.5px}
</style></head><body>
 <div class="card">
  <h1>404 — page not found</h1>
  <p>The page <code>__PATH__</code> is not part of the Meridian portal.</p>
  <a href="/">← Back to the portal home</a>
 </div>
</body></html>"""


class PortalHandler(BaseHTTPRequestHandler):
    server_version = "meridian-portal/1.0"

    # ── response helpers ──────────────────────────────────────────────────
    def _send(self, status, body, ctype, extra=None, no_store=False):
        if isinstance(body, str):
            body = body.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        if no_store:
            self.send_header("Cache-Control", "no-store, must-revalidate")
            self.send_header("Pragma", "no-cache")
        for k, v in (extra or {}).items():
            self.send_header(k, v)
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)

    # ── optional HTTP Basic Auth ──────────────────────────────────────────
    def _authorized(self):
        if not AUTH_ON:
            return True
        header = self.headers.get("Authorization", "")
        if not header.startswith("Basic "):
            return False
        try:
            decoded = base64.b64decode(header[6:]).decode("utf-8")
        except Exception:
            return False
        user, _, password = decoded.partition(":")
        return (hmac.compare_digest(user, PORTAL_USER)
                and hmac.compare_digest(password, PORTAL_PASS))

    def _challenge(self):
        self._send(401, "Authentication required\n", "text/plain; charset=utf-8",
                   {"WWW-Authenticate": 'Basic realm="Meridian Portal", charset="UTF-8"'},
                   no_store=True)

    # ── request routing ───────────────────────────────────────────────────
    def _handle(self):
        path = unquote(urlparse(self.path).path)
        if len(path) > 1 and path.endswith("/"):
            path = path.rstrip("/")

        # Render health check stays public
        if path == "/healthz":
            self._send(200,
                       '{"ok":true,"service":"%s","scope":"faculty+admin+student","auth":%s}'
                       % (SERVICE_NAME, "true" if AUTH_ON else "false"),
                       "application/json; charset=utf-8", no_store=True)
            return

        if path == "/favicon.ico":
            self._send(204, b"", "image/x-icon", no_store=True)
            return

        if not self._authorized():
            self._challenge()
            return

        target = ALLOWED.get(path)
        if target is None:
            self._send(404, NOT_FOUND_HTML.replace("__PATH__", path),
                       "text/html; charset=utf-8", no_store=True)
            return

        file_path = BASE_DIR / target
        try:
            data = file_path.read_bytes()
        except OSError:
            self._send(500, "Missing asset: %s\n" % target,
                       "text/plain; charset=utf-8", no_store=True)
            return

        self._send(200, data, MIME.get(file_path.suffix.lower(), "application/octet-stream"),
                   no_store=(path in NO_CACHE_PATHS))

    def do_GET(self):
        self._handle()

    def do_HEAD(self):
        self._handle()

    def do_POST(self):
        self._send(405, "Method Not Allowed\n", "text/plain; charset=utf-8",
                   {"Allow": "GET, HEAD"}, no_store=True)

    def log_message(self, fmt, *args):          # tidy Render logs
        print("[%s] %s" % (self.log_date_time_string(), fmt % args), flush=True)


def main():
    httpd = ThreadingHTTPServer(("0.0.0.0", PORT), PortalHandler)
    print("-" * 62, flush=True)
    print("  Meridian Portal  (faculty + admin + student, linked)")
    print("  URL              http://0.0.0.0:%d" % PORT)
    print("  Access control   %s" % ("ON  (HTTP Basic Auth)" if AUTH_ON
                                     else "OFF - set PORTAL_USER + PORTAL_PASS"))
    print("  Serving          / (portal home) - /faculty - /admin - /student")
    print("  Not served       backend/ - *_server.py - portal_server.py")
    print("-" * 62, flush=True)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down...", flush=True)
    finally:
        httpd.server_close()


if __name__ == "__main__":
    main()

