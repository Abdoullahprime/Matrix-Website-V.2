#!/usr/bin/env bash
# Splits deploy/app/ into two small, compressed zips for hosts whose upload form rejects
# large files (Plesk File Manager did at ~1 MB). Extract BOTH into the same folder.
#   1 = server + site code      2 = images (.webp)
set -euo pipefail
cd "$(dirname "$0")/.."
[ -d deploy/app ] || { echo "Run 'npm run build:deploy' first."; exit 1; }
python - <<'PY'
import os, zipfile
root = "deploy/app"
files = sorted(
    os.path.relpath(os.path.join(d, f), root).replace(os.sep, "/")
    for d, _, fs in os.walk(root) for f in fs
)
groups = {
    "deploy/matrix-upload-1-app.zip": [f for f in files if not f.endswith(".webp")],
    "deploy/matrix-upload-2-images.zip": [f for f in files if f.endswith(".webp")],
}
for out, members in groups.items():
    if os.path.exists(out):
        os.remove(out)
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for m in members:
            z.write(os.path.join(root, m), m)
    print(f"{os.path.getsize(out):9,d} bytes  {out}  ({len(members)} files)")
PY
