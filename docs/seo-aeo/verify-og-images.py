#!/usr/bin/env python3
"""Reproducible per-page OG/Twitter image verification.

Fetches each route, extracts og:image / twitter:image URLs, downloads the PNG,
records HTTP status, dimensions, and SHA-256. Outputs JSON to stdout.

Usage: python3 docs/seo-aeo/verify-og-images.py [base_url]
Default base_url: http://localhost:3456
"""
import json
import re
import sys
import hashlib
import urllib.request
import struct

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3456"

ROUTES = [
    "/", "/zh",
    "/editor", "/zh/editor",
    "/thread", "/zh/thread",
    "/code-to-image", "/zh/code-to-image",
    "/markdown-table-to-image", "/zh/markdown-table-to-image",
    "/mermaid-to-png", "/zh/mermaid-to-png",
    "/markdown-to-x-articles", "/zh/markdown-to-x-articles",
    "/compare", "/zh/compare",
    "/blog", "/zh/blog",
    "/privacy",
]

def fetch(path):
    with urllib.request.urlopen(BASE + path) as r:
        return r.read()

def extract(html, attr):
    m = re.search(rf'<meta[^>]*{attr}[^>]*content="([^"]*)"', html)
    return m.group(1) if m else None

def img_info(path):
    data = fetch(path)
    # PNG header: width/height at bytes 16-23
    w = struct.unpack(">I", data[16:20])[0]
    h = struct.unpack(">I", data[20:24])[0]
    sha = hashlib.sha256(data).hexdigest()[:16]
    return w, h, sha

results = []
for route in ROUTES:
    html = fetch(route).decode("utf-8")
    og = extract(html, 'property="og:image"')
    tw = extract(html, 'name="twitter:image"')
    canon = extract(html, 'property="og:url"')
    row = {"route": route, "og_url": og, "twitter_url": tw, "canonical": canon}
    for label, url in [("og", og), ("twitter", tw)]:
        if not url:
            row[f"{label}_status"] = "missing"
            continue
        path = url.replace("https://markdown2x.com", "")
        try:
            w, h, sha = img_info(path)
            row[f"{label}_status"] = 200
            row[f"{label}_size"] = f"{w}x{h}"
            row[f"{label}_sha"] = sha
        except Exception as e:
            row[f"{label}_status"] = f"error: {e}"
    results.append(row)

print(json.dumps(results, indent=2, ensure_ascii=False))
