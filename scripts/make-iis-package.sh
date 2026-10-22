#!/usr/bin/env bash
# Builds deploy/matrix-site.zip: everything that goes in the website folder on Plesk for
# Windows (IIS). It is the compiled site, the PHP contact API and a web.config. No Node.js.
#   npm run build:iis   (build, SEO step, then this)
set -euo pipefail
cd "$(dirname "$0")/.."
[ -f dist/index.html ] || { echo "No dist/ found. Run 'npm run build' first."; exit 1; }
[ -f dist/web.config ] || { echo "dist/web.config missing. Run 'npm run build:iis' (it runs the SEO step)."; exit 1; }
mkdir -p deploy
python - <<'PY'
import os, zipfile
out = "deploy/matrix-site.zip"
if os.path.exists(out):
    os.remove(out)
members = []                                            # (path on disk, path inside the zip)
for d, _, files in os.walk("dist"):                     # the compiled site goes at the zip root
    for f in files:
        full = os.path.join(d, f)
        members.append((full, os.path.relpath(full, "dist").replace(os.sep, "/")))
for f in sorted(os.listdir("iis/api")):                 # the PHP API goes in api/
    members.append((os.path.join("iis/api", f), "api/" + f))
names = [m[1] for m in members]
assert "index.html" in names and "api/contact.php" in names and "web.config" in names, "package is missing a required file"
assert "sitemap.xml" in names and "robots.txt" in names, "SEO files missing: run the SEO step"
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for src, arc in sorted(members, key=lambda m: m[1]):
        z.write(src, arc)
print(f"{os.path.getsize(out):,d} bytes  {out}  ({len(members)} files)")
PY
