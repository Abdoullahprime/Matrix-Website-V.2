#!/usr/bin/env bash
# Builds the zips used to deploy to Plesk (Windows/IIS), whose File Manager rejects large
# uploads and whose "NPM install" fails with EPERM. Run `npm run build:deploy` first.
#   1 = server + site code     2 = images (.webp)     3 = server + ready-made node_modules
# Extract all three into the same folder; see DEPLOYMENT.md.
set -euo pipefail
cd "$(dirname "$0")/.."
[ -d deploy/app ] || { echo "Run 'npm run build:deploy' first."; exit 1; }
python - <<'PY'
import os, shutil, subprocess, tempfile, zipfile

def make_zip(out, members):
    """members: list of (path on disk, path inside the zip)."""
    if os.path.exists(out):
        os.remove(out)
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for src, arc in members:
            z.write(src, arc)
    print(f"{os.path.getsize(out):10,d} bytes  {out}  ({len(members)} files)")

root = "deploy/app"
files = sorted(
    os.path.relpath(os.path.join(d, f), root).replace(os.sep, "/")
    for d, _, fs in os.walk(root) for f in fs
)
as_members = lambda names: [(os.path.join(root, n), n) for n in names]
make_zip("deploy/matrix-upload-1-app.zip", as_members([f for f in files if not f.endswith(".webp")]))
make_zip("deploy/matrix-upload-2-images.zip", as_members([f for f in files if f.endswith(".webp")]))

# Zip 3: install production dependencies here, then ship them, because `npm install`
# cannot run on the server. All of them are pure JavaScript, so they are portable.
tmp = tempfile.mkdtemp()
try:
    shutil.copy(os.path.join(root, "package.json"), tmp)
    subprocess.run("npm install --omit=dev --no-fund --no-audit --ignore-scripts",
                   cwd=tmp, shell=True, check=True, stdout=subprocess.DEVNULL)
    modules = os.path.join(tmp, "node_modules")
    shutil.rmtree(os.path.join(modules, ".bin"), ignore_errors=True)   # shims; not needed, and EPERM-prone
    native = [f for _, _, fs in os.walk(modules) for f in fs if f.endswith(".node")]
    assert not native, f"native modules cannot run on the server: {native}"
    members = [(os.path.join(root, "index.js"), "index.js"), (os.path.join(root, "package.json"), "package.json")]
    for d, _, fs in os.walk(modules):
        for f in fs:
            full = os.path.join(d, f)
            members.append((full, os.path.relpath(full, tmp).replace(os.sep, "/")))
    make_zip("deploy/matrix-server-and-modules.zip", members)
finally:
    shutil.rmtree(tmp, ignore_errors=True)
PY
