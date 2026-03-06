from __future__ import annotations

from pathlib import Path
from typing import Iterable

ROOT = Path(__file__).resolve().parents[1]
PREVIEW_FILE = ROOT / "design" / "preview-mockup.html"


def _response(start_response, status: str, body: bytes, content_type: str = "text/plain; charset=utf-8") -> Iterable[bytes]:
    headers = [
        ("Content-Type", content_type),
        ("Content-Length", str(len(body))),
        ("Cache-Control", "no-store"),
    ]
    start_response(status, headers)
    return [body]


def application(environ, start_response):
    method = (environ.get("REQUEST_METHOD") or "GET").upper()
    path = environ.get("PATH_INFO") or "/"

    if path == "/healthz":
        return _response(start_response, "200 OK", b'{"ok":true,"service":"lead-scoring-pipeline"}', "application/json")

    if method not in {"GET", "HEAD"}:
        return _response(start_response, "405 Method Not Allowed", b"Method not allowed")

    if PREVIEW_FILE.exists():
        body = PREVIEW_FILE.read_bytes()
        if method == "HEAD":
            body = b""
        return _response(start_response, "200 OK", body, "text/html; charset=utf-8")

    fallback = b"LeadScore pipeline deploy is healthy, but preview file is missing."
    if method == "HEAD":
        fallback = b""
    return _response(start_response, "200 OK", fallback)
