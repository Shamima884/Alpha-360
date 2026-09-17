#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════════════
 Meridian — ADMIN PANEL ONLY server (Render-ready)

 Serves *only* the administrator control panel:

     admin/index.html
     admin/js/admin.js
     shared/css/styles.css   shared/css/admin.css
     shared/js/api.js  shared/js/data.js  shared/js/charts.js  shared/js/ui.js

 Everything else — the faculty portal (faculty/), the student portal
 (student/) and their scripts — returns 404, so this deployment exposes
 the admin panel and nothing else.

 Pure Python standard library: no dependencies, no build step.

 RUN LOCALLY
     python admin_server.py              →  http://localhost:8080

 DEPLOY (Render)
     startCommand: python admin_server.py
     PORT is injected by Render automatically.

 OPTIONAL ACCESS PROTECTION (recommended for a public URL)
     ADMIN_USER=<user>  ADMIN_PASS=<pass>
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

SERVICE_NAME = "meridian-admin"

# ── the ONLY paths this deployment exposes ──────────────────────────────
# (query strings such as ?v=20260915 are ignored when matching)
ALLOWED = {
    "": "admin/index.html",
    "/": "admin/index.html",
    "/admin": "admin/index.html",
    "/admin/index.html": "admin/index.html",
    "/admin/js/admin.js": "admin/js/admin.js",
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

# Pages are never cached (so a redeploy is picked up immediately);
# versioned assets (?v=…) may be cached briefly.
NO_CACHE_PATHS = {"", "/", "/admin", "/admin/index.html"}

ADMIN_USER = os.environ.get("ADMIN_USER", "").strip()
ADMIN_PASS = os.environ.get("ADMIN_PASS", "")
AUTH_ON = bool(ADMIN_USER and ADMIN_PASS)

PORT = int(os.environ.get("PORT", "8080"))

NOT_FOUND_HTML = """<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>Not found · Meridian Admin</title>
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
</style></head><body><div class="card">
<h1>404 — page not deployed</h1>
<p>This deployment hosts <strong>only the Meridian Admin Panel</strong>.
The faculty and student portals are not available here.</p>
<p><code>faculty/</code> and <code>student/</code> are intentionally not served by this deployment.</p>
<a href="/">Go to the Admin Panel</a>
</div></body></html>
"""


class AdminPanelHandler(BaseHTTPRequestHandler):
    server_version = "MeridianAdmin/1.0"
    protocol_version = "HTTP/1.1"

    # ── low-level response helper ───────────────────────────────────────
    def _send(self, code, body, ctype, extra=None, no_store=False):
        if isinstance(body, str):
            body = body.encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", "0" if code == 204 else str(len(body)))
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Robots-Tag", "noindex, nofollow")
        self.send_header("Cache-Control", "no-store" if no_store else "public, max-age=300")
        for k, v in (extra or {}).items():
            self.send_header(k, v)
        self.end_headers()
        if code != 204 and self.command != "HEAD" and body:
            self.wfile.write(body)

    # ── optional HTTP Basic Auth ────────────────────────────────────────
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
        return (hmac.compare_digest(user, ADMIN_USER)
                and hmac.compare_digest(password, ADMIN_PASS))

    def _challenge(self):
        self._send(401, "Authentication required\n", "text/plain; charset=utf-8",
                   {"WWW-Authenticate": 'Basic realm="Meridian Admin", charset="UTF-8"'},
                   no_store=True)

    # ── request routing ─────────────────────────────────────────────────
    def _handle(self):
        path = unquote(urlparse(self.path).path)
        if len(path) > 1 and path.endswith("/"):
            path = path.rstrip("/")

        # Render health check stays public
        if path == "/healthz":
            self._send(200,
                       '{"ok":true,"service":"%s","scope":"admin-panel-only","auth":%s}'
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
            self._send(404, NOT_FOUND_HTML, "text/html; charset=utf-8", no_store=True)
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
    httpd = ThreadingHTTPServer(("0.0.0.0", PORT), AdminPanelHandler)
    print("-" * 62, flush=True)
    print("  Meridian Admin Panel  (admin-only deployment)")
    print("  URL              http://0.0.0.0:%d" % PORT)
    print("  Access control   %s" % ("ON  (HTTP Basic Auth)" if AUTH_ON
                                     else "OFF - set ADMIN_USER + ADMIN_PASS"))
    print("  Serving          admin/index.html - admin/js/admin.js")
    print("                   shared/css/{styles,admin}.css - shared/js/{api,data,charts,ui}.js")
    print("  Not served       faculty/ - student/ - backend/ - admin_server.py")
    print("-" * 62, flush=True)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down...", flush=True)
    finally:
        httpd.server_close()


if __name__ == "__main__":
    main()