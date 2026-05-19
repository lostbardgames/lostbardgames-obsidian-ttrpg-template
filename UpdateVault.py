#!/usr/bin/env python3
"""
TTRPG Vault updater.
Called by UpdateVault.js — args: <vault_path> <zip_url> <update_tools> <new_version>
Prints a single JSON object to stdout on completion.
"""

import sys
import os
import json
import urllib.request
import zipfile
import shutil
import tempfile

# These directories are fully replaced on every update.
ALWAYS_UPDATE_DIRS = [
    "z_Templates",
]

# These individual files are always overwritten (backed up first).
ALWAYS_UPDATE_FILES = [
    "START HERE.md",
    "HOW TO USE.md",
    "import_5etools.py",
    "ImportDnDBeyond.py",
    "UpdateVault.py",
    os.path.join(".obsidian", "snippets", "TTRPG-Icons.css"),
    os.path.join(".obsidian", "snippets", "TTRPG-Folders.css"),
]

# These files are only updated when the user opts in.
TOOL_FILES = [
    os.path.join("1.Tools", "Homepage.md"),
    os.path.join("1.Tools", "Buttons.md"),
    os.path.join("1.Tools", "GM Screen.md"),
]


def main():
    if len(sys.argv) < 5:
        print(json.dumps({"error": "Usage: UpdateVault.py <vault> <zip_url> <update_tools> <new_version>"}))
        sys.exit(1)

    vault_path   = sys.argv[1]
    zip_url      = sys.argv[2]
    update_tools = sys.argv[3].lower() == "true"
    new_version  = sys.argv[4]

    tmp_dir  = tempfile.mkdtemp()
    updated  = []
    backed_up = []

    try:
        # ── Download ──────────────────────────────────────────────────────────
        zip_path = os.path.join(tmp_dir, "update.zip")
        print(f"Downloading {zip_url} ...", flush=True)
        urllib.request.urlretrieve(zip_url, zip_path)

        # ── Extract ───────────────────────────────────────────────────────────
        extract_dir = os.path.join(tmp_dir, "extracted")
        with zipfile.ZipFile(zip_path, "r") as zf:
            zf.extractall(extract_dir)

        # The zip wraps everything inside a TTRPG/ subfolder.
        source_root = os.path.join(extract_dir, "TTRPG")
        if not os.path.isdir(source_root):
            source_root = extract_dir

        # ── Helpers ───────────────────────────────────────────────────────────
        def update_dir(rel):
            src = os.path.join(source_root, rel)
            dst = os.path.join(vault_path, rel)
            if not os.path.isdir(src):
                return
            if os.path.exists(dst):
                shutil.rmtree(dst)
            shutil.copytree(src, dst)
            updated.append(rel + "/")

        def update_file(rel):
            src = os.path.join(source_root, rel)
            dst = os.path.join(vault_path, rel)
            if not os.path.isfile(src):
                return
            if os.path.isfile(dst):
                shutil.copy2(dst, dst + ".bak")
                backed_up.append(rel)
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            shutil.copy2(src, dst)
            updated.append(rel)

        # ── Apply updates ─────────────────────────────────────────────────────
        for d in ALWAYS_UPDATE_DIRS:
            update_dir(d)

        for f in ALWAYS_UPDATE_FILES:
            update_file(f)

        if update_tools:
            for f in TOOL_FILES:
                update_file(f)

        # ── Stamp new version ─────────────────────────────────────────────────
        version_path = os.path.join(vault_path, "version.json")
        with open(version_path, "w") as fh:
            json.dump({"version": new_version}, fh, indent=2)
        updated.append("version.json")

    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)

    print(json.dumps({"updated": updated, "backed_up": backed_up}))


if __name__ == "__main__":
    main()
