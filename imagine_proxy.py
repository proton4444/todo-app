#!/usr/bin/env python3
"""
Simple HTTP proxy for OpenClaw image generation API.
Listens on port 18788 and forwards requests to the local gateway.
"""

import http.server
import socketserver
import urllib.request
import urllib.error
import json

PORT = 18788
GATEWAY_URL = "http://127.0.0.1:18789"

class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

class ProxyHandler(http.server.BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        print(f"[proxy] {args[0]}")

    def do_GET(self):
        if self.path == "/" or self.path == "":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({
                "status": "ok",
                "service": "imagine-proxy",
                "port": PORT,
                "gateway": GATEWAY_URL
            }).encode())
            return
        self._proxy_request()

    def do_POST(self):
        self._proxy_request()

    def _proxy_request(self):
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length) if content_length > 0 else None

            url = f"{GATEWAY_URL}{self.path}"
            req = urllib.request.Request(url, data=body, method=self.command)
            
            for header, value in self.headers.items():
                if header.lower() not in ("host", "content-length"):
                    req.add_header(header, value)

            with urllib.request.urlopen(req, timeout=120) as response:
                self.send_response(response.status)
                for header, value in response.getheaders():
                    if header.lower() not in ("transfer-encoding",):
                        self.send_header(header, value)
                self.end_headers()
                self.wfile.write(response.read())

        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())
        except Exception as e:
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())

if __name__ == "__main__":
    print(f"[proxy] Starting imagine proxy on port {PORT}")
    print(f"[proxy] Forwarding to {GATEWAY_URL}")
    with ReusableTCPServer(("0.0.0.0", PORT), ProxyHandler) as httpd:
        print(f"[proxy] Listening on 0.0.0.0:{PORT}")
        httpd.serve_forever()
