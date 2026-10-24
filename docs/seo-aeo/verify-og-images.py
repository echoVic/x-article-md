#!/usr/bin/env python3
"""Reproducible per-page OG/Twitter image + URL consistency verification.

Fetches each route from a local build, extracts og:image / twitter:image /
og:url / canonical / hreflang URLs, downloads the PNG, records HTTP status,
dimensions, and SHA-256. Also fetches sitemap.xml and records every <loc>.

IMPORTANT: this runs against a local next start server (verification_origin),
NOT production. The og_url / twitter_url strings embedded in HTML are absolute
production URLs (https://markdown2x.com/...); they are rewritten to the local
origin for the actual HTTP 200 check. tested_og_url / tested_twitter_url record
the local URLs that were actually fetched.

Usage: python3 docs/seo-aeo/verify-og-images.py [base_url]
Default base_url: http://localhost:3456
"""
import json
import re
import sys
import hashlib
import urllib.request
import struct
import subprocess

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3456"
PROD = "https://markdown2x.com"

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
    # meta tags: <meta property="..." content="..."> or <meta name="..." content="...">
    m = re.search(rf'<meta[^>]*{attr}[^>]*content="([^"]*)"', html)
    if m:
        return m.group(1)
    # link tags: <link rel="canonical" href="...">
    m = re.search(rf'<link[^>]*{attr}[^>]*href="([^"]*)"', html)
    return m.group(1) if m else None


def extract_links(html):
    """Return dict of hreflang -> href from <link rel="alternate">."""
    out = {}
    for m in re.finditer(
        r'<link[^>]*rel="alternate"[^>]*href(?:Lang|lang)="([^"]*)"[^>]*href="([^"]*)"',
        html,
    ):
        out[m.group(1)] = m.group(2)
    return out


def img_info(path):
    data = fetch(path)
    w = struct.unpack(">I", data[16:20])[0]
    h = struct.unpack(">I", data[20:24])[0]
    sha = hashlib.sha256(data).hexdigest()[:16]
    return w, h, sha


# Build / ref info
try:
    git_head = subprocess.check_output(
        ["git", "rev-parse", "HEAD"], cwd="/Users/bytedance/Documents/GitHub/x-article-md"
    ).decode().strip()
except Exception:
    git_head = "unknown"

build_info = {
    "verification_origin": BASE,
    "production_url_prefix": PROD,
    "git_head": git_head,
    "note": "HTTP 200 checks ran against the local build at verification_origin; "
            "og_url/twitter_url in HTML are absolute production URLs (rewritten "
            "to local origin for testing).",
}

# Sitemap locs
sitemap_xml = fetch("/sitemap.xml").decode("utf-8")
sitemap_locs = re.findall(r"<loc>([^<]+)</loc>", sitemap_xml)

results = []
for route in ROUTES:
    html = fetch(route).decode("utf-8")
    og = extract(html, 'property="og:image"')
    tw = extract(html, 'name="twitter:image"')
    og_url = extract(html, 'property="og:url"')
    canon = extract(html, 'rel="canonical"')
    hreflang = extract_links(html)
    row = {
        "route": route,
        "canonical": canon,
        "og_url": og_url,
        "hreflang": hreflang,
        "og_url_html": og,
        "twitter_url_html": tw,
    }
    for label, url in [("og", og), ("twitter", tw)]:
        if not url:
            row[f"{label}_status"] = "missing"
            continue
        # Rewrite production URL to local origin for the actual fetch
        local_path = url.replace(PROD, "")
        row[f"tested_{label}_url"] = BASE + local_path
        try:
            w, h, sha = img_info(local_path)
            row[f"{label}_status"] = 200
            row[f"{label}_size"] = f"{w}x{h}"
            row[f"{label}_sha"] = sha
        except Exception as e:
            row[f"{label}_status"] = f"error: {e}"
    results.append(row)

output = {
    "build": build_info,
    "sitemap_locs": sitemap_locs,
    "routes": results,
}
print(json.dumps(output, indent=2, ensure_ascii=False))
