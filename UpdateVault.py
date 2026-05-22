#!/usr/bin/env python3
"""
TTRPG Vault manifest-based updater — with comprehensive user data protection.

Called by UpdateVault.js in two steps:

  Step 1 — check for updates (no --confirm):
    python3 UpdateVault.py <vault_path>
    Returns JSON with status "up_to_date" or "update_available".

  Step 2 — apply update (with --confirm):
    python3 UpdateVault.py <vault_path> <new_version> <update_tools> --confirm <manifest_url>
    Returns JSON with status "success", "partial", or "failed".

All progress messages go to stderr; exactly one JSON object goes to stdout.
"""

import sys
import os
import json

# Force UTF-8 output on Windows (default console encoding is often cp1252)
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")
import hashlib
import shutil
import urllib.request

# ── Constants ──────────────────────────────────────────────────────────────────

REPO              = "lostbardgames/lostbardgames-obsidian-ttrpg-gm-template"
RELEASES_API      = f"https://api.github.com/repos/{REPO}/releases/latest"
RELEASES_LIST_API = f"https://api.github.com/repos/{REPO}/releases"
RAW_BASE          = f"https://raw.githubusercontent.com/{REPO}"
USER_AGENT        = "TTRPG-Vault-Updater/1.0"

BACKUP_DIR_NAME     = ".vault-backups"
MAX_BACKUP_VERSIONS = 2

# ── Protection constants (fallbacks if manifest doesn't supply them) ───────────

# Directories that are NEVER touched under any circumstances.
PROTECTED_DIRS = [
    "Characters",
    "Organizations",
    "Worlds",
    "Settlements",
    "Districts",
    "Areas",
    "POIs",
    "Parties",
    "Lore",
    "Possessions",
]

# Files inside .obsidian/ that the updater is allowed to touch.
# Everything else under .obsidian/ is blocked.
OBSIDIAN_ALLOWED = [
    os.path.join(".obsidian", "snippets", "TTRPG-Icons.css"),
    os.path.join(".obsidian", "snippets", "TTRPG-Folders.css"),
    os.path.join(".obsidian", "plugins", "quickadd", "data.json"),
]

# These files may have been customized by the user — always back up,
# and flag them as "has_local_changes" in the pre-confirm JSON if modified.
USER_CUSTOMIZABLE = [
    os.path.join("1.Tools", "Homepage.md"),
    os.path.join("1.Tools", "Buttons.md"),
    os.path.join("1.Tools", "GM Screen.md"),
    "HOW TO USE.md",
    "START HERE.md",
]


# ── Utilities ──────────────────────────────────────────────────────────────────

def eprint(*args):
    """Write progress to stderr (never pollutes the stdout JSON channel)."""
    print(*args, file=sys.stderr, flush=True)


def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def sha256_bytes(data):
    return hashlib.sha256(data).hexdigest()


def http_get_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())


def http_get_bytes(url):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def parse_version(tag):
    """'v1.2.3' or '1.2.3-beta' → (1, 2, 3)"""
    s = str(tag).lstrip("v").split("-")[0]
    parts = s.split(".")
    try:
        return tuple(int(p) for p in parts[:3])
    except ValueError:
        return (0, 0, 0)


def is_newer(candidate, current):
    return parse_version(candidate) > parse_version(current)


def norm(path):
    """Normalize path separators to os.sep for consistent comparison."""
    return path.replace("/", os.sep).replace("\\", os.sep)


# ── Protection ────────────────────────────────────────────────────────────────

def is_safe_to_write(rel_path, protected_dirs=None, obsidian_allowed=None):
    """
    Returns (safe: bool, reason: str).
    Checks three rules in order:
      1. Protected campaign directories — never touch.
      2. .obsidian surgical lock — only CSS snippets allowed.
      3. .vault-backups/ — never write inside the backup store.
    """
    if protected_dirs is None:
        protected_dirs = PROTECTED_DIRS
    if obsidian_allowed is None:
        obsidian_allowed = OBSIDIAN_ALLOWED

    # Normalize to os.sep for platform-safe prefix checks
    rel = norm(rel_path)

    # Check 1 — Protected campaign directories
    for d in protected_dirs:
        nd = norm(d)
        if rel == nd or rel.startswith(nd + os.sep):
            return False, f"Protected campaign directory: {d}/"

    # Check 2 — .obsidian surgical lock
    obsidian_prefix = norm(".obsidian") + os.sep
    if rel.startswith(obsidian_prefix):
        normalized_allowed = [norm(p) for p in obsidian_allowed]
        if rel not in normalized_allowed:
            return False, "Blocked: only CSS snippets may be updated inside .obsidian/"

    # Check 3 — Never write to backup directory
    if rel.startswith(norm(BACKUP_DIR_NAME)):
        return False, "Blocked: cannot write to backup directory"

    return True, ""


# ── Backup helpers ─────────────────────────────────────────────────────────────

def backup_file(vault_path, rel_path, version_tag):
    """
    Copy <vault>/<rel_path> to .vault-backups/<version_tag>/<rel_path>,
    preserving the full directory structure inside the backup folder.
    """
    src = os.path.join(vault_path, rel_path)
    if not os.path.isfile(src):
        return  # nothing to back up (new file being added)
    backup_root = os.path.join(vault_path, BACKUP_DIR_NAME, version_tag)
    dest = os.path.join(backup_root, rel_path)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    shutil.copy2(src, dest)


def restore_from_backup(vault_path, rel_path, version_tag):
    """Restore a file from .vault-backups/<version_tag>/<rel_path>."""
    src = os.path.join(vault_path, BACKUP_DIR_NAME, version_tag, rel_path)
    if not os.path.isfile(src):
        return False
    dst = os.path.join(vault_path, rel_path)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    shutil.copy2(src, dst)
    return True


def prune_old_backups(vault_path, keep=MAX_BACKUP_VERSIONS):
    """
    Remove backup version folders beyond the newest `keep` versions.
    Returns list of relative paths cleaned (e.g. ['.vault-backups/1.0.5/']).
    """
    backup_root = os.path.join(vault_path, BACKUP_DIR_NAME)
    cleaned = []
    if not os.path.isdir(backup_root):
        return cleaned
    versions = sorted(
        [d for d in os.listdir(backup_root)
         if os.path.isdir(os.path.join(backup_root, d))],
        key=parse_version,
    )
    for old in versions[:-keep]:
        shutil.rmtree(os.path.join(backup_root, old), ignore_errors=True)
        cleaned.append(f".vault-backups/{old}/")
        eprint(f"  Pruned old backup: {old}")
    return cleaned


# ── Path expansion ─────────────────────────────────────────────────────────────

def expand_managed_paths(managed_list, manifest_files):
    """
    Expand directory entries in the managed list to individual file paths.
    'z_Templates' → all 'z_Templates/...' keys in the manifest.
    Direct file entries are passed through as-is.
    """
    expanded = []
    seen = set()
    for entry in managed_list:
        if entry in manifest_files:
            if entry not in seen:
                expanded.append(entry)
                seen.add(entry)
        else:
            # Treat as directory prefix
            prefix = entry.rstrip("/") + "/"
            matched = [k for k in manifest_files if k.startswith(prefix)]
            for m in matched:
                if m not in seen:
                    expanded.append(m)
                    seen.add(m)
            if not matched:
                # Single file not yet in manifest (new addition)
                if entry not in seen:
                    expanded.append(entry)
                    seen.add(entry)
    return expanded


# ── Diff computation ───────────────────────────────────────────────────────────

def compute_diff(vault_path, manifest_files, paths_to_check):
    """
    Return list of (rel_path, remote_hash) for files that differ from local
    or don't exist locally yet.
    """
    to_update = []
    for rel in paths_to_check:
        if rel not in manifest_files:
            continue
        remote_hash = manifest_files[rel]
        local_path = os.path.join(vault_path, rel)
        if not os.path.isfile(local_path):
            to_update.append((rel, remote_hash))
            continue
        if sha256_file(local_path) != remote_hash:
            to_update.append((rel, remote_hash))
    return to_update


# ── User template protection ───────────────────────────────────────────────────

def scan_user_templates(vault_path, manifest_files):
    """
    Walk the user's z_Templates/ directory.
    Any file found there that is NOT a key in manifest_files is a user-created
    custom template — move it to z_Templates/_my_templates/ to protect it.
    Returns a list of relative paths (forward-slash) that were preserved.
    """
    preserved = []
    z_templates_path = os.path.join(vault_path, "z_Templates")
    if not os.path.isdir(z_templates_path):
        return preserved

    for root, dirs, files in os.walk(z_templates_path):
        # Never descend into _my_templates (already protected)
        dirs[:] = [d for d in dirs if d != "_my_templates"]
        for fname in files:
            abs_path = os.path.join(root, fname)
            rel_path = os.path.relpath(abs_path, vault_path)
            rel_key  = rel_path.replace(os.sep, "/")
            if rel_key not in manifest_files:
                dest_dir = os.path.join(vault_path, "z_Templates", "_my_templates")
                dest     = os.path.join(dest_dir, fname)
                os.makedirs(dest_dir, exist_ok=True)
                shutil.move(abs_path, dest)
                preserved.append(rel_key)
                eprint(f"  Preserved user template: {rel_key} → z_Templates/_my_templates/{fname}")

    return preserved


# ── Customization detection ────────────────────────────────────────────────────

def fetch_previous_manifest(latest_tag):
    """
    Fetch files.json from the release immediately before latest_tag.
    Returns the manifest dict, or None if unavailable.
    """
    try:
        releases = http_get_json(RELEASES_LIST_API + "?per_page=10")
    except Exception as e:
        eprint(f"  Could not fetch releases list: {e}")
        return None

    tags = [r.get("tag_name") for r in releases]
    try:
        idx = tags.index(latest_tag)
    except ValueError:
        return None

    # Releases list is newest-first; the previous release is at idx + 1
    if idx + 1 >= len(releases):
        return None

    prev_release = releases[idx + 1]
    assets = prev_release.get("assets", [])
    manifest_asset = next((a for a in assets if a["name"] == "files.json"), None)
    if not manifest_asset:
        return None

    try:
        return http_get_json(manifest_asset["browser_download_url"])
    except Exception as e:
        eprint(f"  Could not fetch previous manifest: {e}")
        return None


def detect_customizations(vault_path, to_update_paths, latest_tag, user_customizable, current_version):
    """
    For each file in user_customizable that is in to_update_paths, compare
    the local file's hash against the PREVIOUS release's manifest hash to
    determine if the user has made local edits beyond the factory version.

    Returns a list of dicts:
      { path, has_local_changes, warning }
    """
    # Normalize user_customizable to forward slashes for manifest key comparison
    uc_normalized = {p.replace(os.sep, "/") for p in user_customizable}

    # Which customizable files actually need updating?
    to_check = [p for p in to_update_paths if p in uc_normalized]
    if not to_check:
        return []

    eprint("  Fetching previous release manifest for customization detection…")
    prev_manifest = fetch_previous_manifest(latest_tag)
    prev_files    = prev_manifest.get("files", {}) if prev_manifest else {}

    result = []
    for rel in to_check:
        local_path = os.path.join(vault_path, rel)
        if not os.path.isfile(local_path):
            # New file being added — not customized
            result.append({"path": rel, "has_local_changes": False, "warning": None})
            continue

        local_hash = sha256_file(local_path)
        prev_hash  = prev_files.get(rel)

        if prev_hash is None:
            # No previous record — can't determine; assume not customized
            has_changes = False
        else:
            has_changes = (local_hash != prev_hash)

        warning = None
        if has_changes:
            backup_loc = f".vault-backups/{current_version}/{rel}"
            warning = (
                f"You have customized this file. Your version will be "
                f"backed up to {backup_loc} before updating."
            )

        result.append({
            "path":             rel,
            "has_local_changes": has_changes,
            "warning":          warning,
        })

    return result


# ── Step 1: Check ──────────────────────────────────────────────────────────────

def cmd_check(vault_path):
    # Read current installed version
    current_version = "0.0.0"
    try:
        with open(os.path.join(vault_path, "version.json"), encoding="utf-8") as f:
            current_version = json.load(f).get("version", "0.0.0")
    except Exception:
        pass

    eprint(f"Current version: {current_version}")
    eprint("Fetching latest release info…")

    # Fetch latest release metadata
    try:
        release = http_get_json(RELEASES_API)
    except Exception as e:
        return {"status": "failed", "error": f"Could not reach GitHub: {e}"}

    latest_tag  = release.get("tag_name", "")
    new_version = latest_tag.lstrip("v").split("-")[0]
    changelog   = release.get("body", "")

    if not is_newer(latest_tag, current_version):
        return {
            "status":          "up_to_date",
            "current_version": current_version,
            "latest_tag":      latest_tag,
        }

    # Find the files.json manifest asset
    assets = release.get("assets", [])
    manifest_asset = next((a for a in assets if a["name"] == "files.json"), None)
    if not manifest_asset:
        return {"status": "failed", "error": "No files.json manifest in the latest release."}

    eprint("Fetching manifest…")
    try:
        manifest = http_get_json(manifest_asset["browser_download_url"])
    except Exception as e:
        return {"status": "failed", "error": f"Could not fetch manifest: {e}"}

    manifest_files = manifest.get("files", {})
    managed        = manifest.get("managed", {})

    # Prefer lists from the manifest; fall back to script constants
    user_customizable = [
        norm(p) for p in manifest.get("user_customizable", [p.replace(os.sep, "/") for p in USER_CUSTOMIZABLE])
    ]

    # Expand both always and optional paths so we can give a complete picture
    always_paths   = expand_managed_paths(managed.get("always", []),        manifest_files)
    optional_paths = expand_managed_paths(managed.get("user_optional", []), manifest_files)

    always_diff   = compute_diff(vault_path, manifest_files, always_paths)
    optional_diff = compute_diff(vault_path, manifest_files, optional_paths)

    all_update_paths = [r for r, _ in always_diff] + [r for r, _ in optional_diff]

    # Detect customizations across all files that need updating
    eprint("Checking for user customizations…")
    customized_files = detect_customizations(
        vault_path, all_update_paths, latest_tag, user_customizable, current_version
    )

    # Find zip asset URL (carried to JS for display only; confirm step doesn't use it)
    zip_asset = next((a for a in assets if a["name"].endswith(".zip")), None)
    zip_url   = zip_asset["browser_download_url"] if zip_asset else None

    return {
        "status":           "update_available",
        "current_version":  current_version,
        "latest_tag":       latest_tag,
        "new_version":      new_version,
        "changelog":        changelog,
        "files_to_update":  [r for r, _ in always_diff],
        "optional_to_update": [r for r, _ in optional_diff],
        "file_count":       len(always_diff),
        "customized_files": customized_files,
        "manifest_url":     manifest_asset["browser_download_url"],
        "zip_url":          zip_url,
        "delete":           manifest.get("delete", []),
    }


# ── Step 2: Confirm / Apply ────────────────────────────────────────────────────

def cmd_confirm(vault_path, new_version, update_tools, manifest_url):
    eprint("Re-fetching manifest for apply…")
    try:
        manifest = http_get_json(manifest_url)
    except Exception as e:
        return {"status": "failed", "error": f"Could not fetch manifest: {e}"}

    manifest_files = manifest.get("files", {})
    managed        = manifest.get("managed", {})

    # Read protection lists from manifest; fall back to script constants
    protected_dirs = manifest.get("protected_dirs", PROTECTED_DIRS)
    obsidian_allowed = [
        norm(p) for p in manifest.get("obsidian_allowed", [p.replace(os.sep, "/") for p in OBSIDIAN_ALLOWED])
    ]
    user_customizable_raw = manifest.get(
        "user_customizable",
        [p.replace(os.sep, "/") for p in USER_CUSTOMIZABLE]
    )
    user_customizable_normalized = {norm(p) for p in user_customizable_raw}

    # Read current version for backup folder name
    current_version = "0.0.0"
    try:
        with open(os.path.join(vault_path, "version.json"), encoding="utf-8") as f:
            current_version = json.load(f).get("version", "0.0.0")
    except Exception:
        pass

    # Expand paths to update
    always_paths   = expand_managed_paths(managed.get("always", []),        manifest_files)
    optional_paths = expand_managed_paths(managed.get("user_optional", []), manifest_files) if update_tools else []
    all_paths      = always_paths + optional_paths

    to_update = compute_diff(vault_path, manifest_files, all_paths)

    # ── Protect user templates BEFORE overwriting z_Templates ─────────────────
    eprint("Scanning z_Templates for user-created files…")
    preserved_templates = scan_user_templates(vault_path, manifest_files)

    # Raw URL base for fetching individual files.
    # The repo root IS the vault root, so paths map directly with no subfolder.
    manifest_version = manifest.get("version", new_version)
    tag      = f"v{manifest_version}"
    raw_base = f"{RAW_BASE}/{tag}"

    updated               = []
    backed_up             = []
    blocked               = []
    failed                = []
    customized_updated    = []

    backup_folder = f".vault-backups/{current_version}/"

    for rel, expected_hash in to_update:
        # ── Safety check ──────────────────────────────────────────────────────
        safe, reason = is_safe_to_write(rel, protected_dirs, obsidian_allowed)
        if not safe:
            eprint(f"  ⊘ Blocked {rel}: {reason}")
            blocked.append({"path": rel, "reason": reason})
            continue

        url = f"{raw_base}/{rel}"
        eprint(f"  Fetching {rel}…")
        try:
            data = http_get_bytes(url)
        except Exception as e:
            eprint(f"  ✗ Download failed for {rel}: {e}")
            failed.append(rel)
            continue

        # ── Verify hash before writing ─────────────────────────────────────
        actual_hash = sha256_bytes(data)
        if actual_hash != expected_hash:
            eprint(f"  ✗ Hash mismatch for {rel}")
            failed.append(rel)
            continue

        # ── Back up existing file ──────────────────────────────────────────
        local_path = os.path.join(vault_path, rel)
        if os.path.isfile(local_path):
            backup_file(vault_path, rel, current_version)
            backed_up.append(rel)
            if norm(rel) in user_customizable_normalized:
                customized_updated.append(rel)

        # ── Write new file ─────────────────────────────────────────────────
        os.makedirs(os.path.dirname(local_path) if os.path.dirname(local_path) else vault_path, exist_ok=True)
        try:
            with open(local_path, "wb") as fh:
                fh.write(data)
            updated.append(rel)
            eprint(f"  ✓ {rel}")
        except Exception as e:
            eprint(f"  ✗ Write failed for {rel}: {e}")
            restored = restore_from_backup(vault_path, rel, current_version)
            eprint(f"    {'Restored from backup.' if restored else 'Could not restore.'}")
            failed.append(rel)

    # ── Delete retired files ───────────────────────────────────────────────────
    deleted_files = []
    for rel in manifest.get("delete", []):
        local_path = os.path.join(vault_path, rel)
        if os.path.isfile(local_path):
            try:
                os.remove(local_path)
                deleted_files.append(rel)
                eprint(f"  ✓ Removed {rel}")
            except Exception as e:
                eprint(f"  ✗ Could not remove {rel}: {e}")

    # ── Stamp new version ──────────────────────────────────────────────────────
    try:
        with open(os.path.join(vault_path, "version.json"), "w", encoding="utf-8") as fh:
            json.dump({"version": new_version}, fh, indent=2)
        updated.append("version.json")
    except Exception as e:
        eprint(f"  ✗ Could not write version.json: {e}")

    # ── Prune old backups ──────────────────────────────────────────────────────
    old_backups_cleaned = prune_old_backups(vault_path)

    overall = "success" if not failed else "partial" if updated else "failed"

    result = {
        "status":      overall,
        "new_version": new_version,
        "updated":     updated,
        "failed":      failed,
        "blocked":     blocked,
        "deleted":     deleted_files,
        "backed_up_to": backup_folder,
        "old_backups_cleaned": old_backups_cleaned,
        "user_templates_preserved": preserved_templates,
        "customized_files_updated": customized_updated,
    }

    if preserved_templates:
        n = len(preserved_templates)
        result["user_templates_note"] = (
            f"{n} custom template{'s' if n != 1 else ''} moved to "
            f"z_Templates/_my_templates/ to protect them. They were not deleted."
        )

    if customized_updated:
        result["customized_files_note"] = (
            "Your customized files were backed up before updating. "
            f"Find them in {backup_folder}"
        )

    return result


# ── Entry point ────────────────────────────────────────────────────────────────

def main():
    """
    Dispatch to cmd_check or cmd_confirm based on presence of --confirm flag.

      Check:   UpdateVault.py <vault_path>
      Confirm: UpdateVault.py <vault_path> <new_version> <update_tools> --confirm <manifest_url>
    """
    if len(sys.argv) < 2:
        print(json.dumps({
            "status": "failed",
            "error": "Usage: UpdateVault.py <vault_path> [<new_version> <update_tools> --confirm <manifest_url>]",
        }))
        sys.exit(0)

    vault_path = sys.argv[1]

    if "--confirm" in sys.argv:
        if len(sys.argv) < 6:
            print(json.dumps({
                "status": "failed",
                "error": "Confirm usage: UpdateVault.py <vault_path> <new_version> <update_tools> --confirm <manifest_url>",
            }))
            sys.exit(0)
        new_version  = sys.argv[2]
        update_tools = sys.argv[3].lower() == "true"
        confirm_idx  = sys.argv.index("--confirm")
        manifest_url = sys.argv[confirm_idx + 1]
        result = cmd_confirm(vault_path, new_version, update_tools, manifest_url)
    else:
        result = cmd_check(vault_path)

    print(json.dumps(result))


if __name__ == "__main__":
    main()
