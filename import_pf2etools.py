#!/usr/bin/env python3
"""
PF2e.tools → Obsidian Vault Importer

Non-destructive: skips notes that already exist — safe to re-run at any time.

Usage:
  python import_pf2etools.py --vault /path/to/vault
  python import_pf2etools.py --vault /path/to/vault --source official
  python import_pf2etools.py --vault /path/to/vault --type spells feats
"""

import argparse
import json
import os
import re
import ssl
import subprocess
import sys
import urllib.request
import urllib.error
from pathlib import Path
from typing import Any, Optional

# Force UTF-8 output on Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")


# ── SSL (Windows certificate fix) ─────────────────────────────────────────────

def _make_ssl_context():
    try:
        import certifi
        return ssl.create_default_context(cafile=certifi.where())
    except ImportError:
        pass
    try:
        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", "certifi", "-q"],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        )
        import certifi
        return ssl.create_default_context(cafile=certifi.where())
    except Exception:
        pass
    return ssl.create_default_context()


_SSL_CTX = _make_ssl_context()

# ── Constants ──────────────────────────────────────────────────────────────────

DATA_BASE     = "https://pf2etools.com/data"
USER_AGENT    = "TTRPG-Vault-PF2e-Importer/1.0"

# Official Paizo source codes (Core Rulebook, APG, GMG, etc.)
OFFICIAL_SOURCES = {
    "CRB", "APG", "GMG", "SoM", "LOGM", "LOAG", "LOKL", "LOE", "LOL", "LOME",
    "TV", "DA", "AoA", "AoE", "AV", "FRP", "GW", "OoA", "PFB", "QFF", "SaS",
    "EC", "B1", "B2", "B3", "B4", "B5", "B6", "NPC",
}

# Content types → (data path pattern, top-level key, importer function name)
CONTENT_TYPE_MAP = {
    "spells":        ("spells/index.json",      "spell",      "import_spells"),
    "items":         ("items/index.json",        "item",       "import_items"),
    "backgrounds":   ("backgrounds/index.json",  "background", "import_backgrounds"),
    "classes":       ("class/index.json",        "class",      "import_classes"),
    "classfeatures": ("class/index.json",        "classFeature","import_class_features"),
    "ancestries":    ("ancestries/index.json",   "ancestry",   "import_ancestries"),
    "heritages":     ("ancestries/index.json",   "heritage",   "import_heritages"),
    "feats":         ("feats/index.json",        "feat",       "import_feats"),
    "deities":       ("deities.json",            "deity",      "import_deities"),
    "conditions":    ("conditions.json",         "condition",  "import_conditions"),
    "languages":     ("languages.json",          "language",   "import_languages"),
    "actions":       ("actions.json",            "action",     "import_actions"),
}

_WRITTEN_PATHS: set = set()
_NOTES_WRITTEN = 0


# ── HTTP helpers ───────────────────────────────────────────────────────────────

def http_get_json(url: str) -> Any:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=30, context=_SSL_CTX) as r:
        return json.loads(r.read())


def http_get_json_safe(url: str) -> Optional[Any]:
    try:
        return http_get_json(url)
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return None
        raise
    except Exception as e:
        print(f"  Warning: could not fetch {url}: {e}", file=sys.stderr)
        return None


# ── Utilities ──────────────────────────────────────────────────────────────────

def sanitize(name: str) -> str:
    """Strip characters that are illegal in filenames on Windows and macOS."""
    return re.sub(r'[\\/:*?"<>|]', "", name).strip()


def write_note(path: Path, content: str) -> bool:
    global _NOTES_WRITTEN
    key = str(path)
    if key in _WRITTEN_PATHS or path.exists():
        return False
    _WRITTEN_PATHS.add(key)
    # Inject import tracking field so the vault can identify and clean up imported notes
    if content.startswith("---\n"):
        content = '---\nimport_source: "pf2etools"\n' + content[4:]
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    _NOTES_WRITTEN += 1
    return True


def source_ok(entry: dict, source_filter: str) -> bool:
    """Return True if this entry's source passes the filter."""
    if source_filter == "all":
        return True
    src = (entry.get("source") or "").upper()
    return src in OFFICIAL_SOURCES


def traits_str(entry: dict) -> str:
    traits = entry.get("traits") or []
    return ", ".join(str(t).title() for t in traits) if traits else ""


def entries_to_md(entries: Any, depth: int = 0) -> str:
    """Recursively render 5etools-style entries array to Markdown."""
    if not entries:
        return ""
    if isinstance(entries, str):
        return entries
    if isinstance(entries, list):
        parts = []
        for e in entries:
            parts.append(entries_to_md(e, depth))
        return "\n\n".join(p for p in parts if p)
    if isinstance(entries, dict):
        etype = entries.get("type", "")
        if etype == "section":
            name = entries.get("name", "")
            inner = entries_to_md(entries.get("entries"), depth + 1)
            prefix = "#" * (depth + 3)
            return f"{prefix} {name}\n\n{inner}" if name else inner
        if etype in ("entries", "entry"):
            name = entries.get("name", "")
            inner = entries_to_md(entries.get("entries"), depth)
            return f"**{name}** {inner}" if name else inner
        if etype == "list":
            items = entries.get("items") or []
            return "\n".join(f"- {entries_to_md(i, depth)}" for i in items)
        if etype == "table":
            rows = entries.get("rows") or []
            col_labels = entries.get("colLabels") or []
            lines = []
            if col_labels:
                lines.append("| " + " | ".join(str(c) for c in col_labels) + " |")
                lines.append("|" + "|".join("---" for _ in col_labels) + "|")
            for row in rows:
                cells = row if isinstance(row, list) else [row]
                lines.append("| " + " | ".join(entries_to_md(c) for c in cells) + " |")
            return "\n".join(lines)
        if etype == "ability":
            name = entries.get("name", "")
            inner = entries_to_md(entries.get("entries"), depth)
            return f"**{name}:** {inner}" if name else inner
        # Fallback: render name + entries
        name = entries.get("name", "")
        inner = entries_to_md(entries.get("entries"), depth)
        return f"**{name}** {inner}".strip() if name else inner
    return str(entries)


def fetch_index(path_or_url: str) -> dict:
    """Fetch an index.json and return the source→filename mapping."""
    if path_or_url.endswith("index.json"):
        url = f"{DATA_BASE}/{path_or_url}"
        data = http_get_json_safe(url)
        return data if isinstance(data, dict) else {}
    return {}


def fetch_entries(index_or_path: str, top_key: str, source_filter: str) -> list:
    """Fetch all entries for a content type, filtered by source."""
    is_indexed = index_or_path.endswith("index.json")
    entries = []

    if is_indexed:
        index = fetch_index(index_or_path)
        base_dir = index_or_path.rsplit("/", 1)[0]
        for src_code, filename in index.items():
            if source_filter != "all" and src_code.upper() not in OFFICIAL_SOURCES:
                continue
            url = f"{DATA_BASE}/{base_dir}/{filename}"
            data = http_get_json_safe(url)
            if data and top_key in data:
                for e in data[top_key]:
                    if source_ok(e, source_filter):
                        entries.append(e)
    else:
        url = f"{DATA_BASE}/{index_or_path}"
        data = http_get_json_safe(url)
        if data and top_key in data:
            entries = [e for e in data[top_key] if source_ok(e, source_filter)]

    return entries


# ── Importers ──────────────────────────────────────────────────────────────────

def import_spells(vault: Path, source_filter: str) -> int:
    print("  Fetching spells…", file=sys.stderr)
    out_dir = vault / "Campaign" / "Possessions" / "Spells"
    out_dir.mkdir(parents=True, exist_ok=True)
    written = 0
    entries = fetch_entries("spells/index.json", "spell", source_filter)
    for s in entries:
        name = s.get("name", "")
        if not name:
            continue
        level     = s.get("level", 0)
        traditions = s.get("traditions") or []
        traits    = traits_str(s)
        source    = s.get("source", "")
        page      = s.get("page", "")
        cast      = s.get("cast") or {}
        cast_str  = cast if isinstance(cast, str) else (
            ", ".join(f"{k}: {v}" for k, v in cast.items()) if isinstance(cast, dict) else ""
        )
        area      = (s.get("area") or {}).get("entry", "") if isinstance(s.get("area"), dict) else str(s.get("area") or "")
        targets   = s.get("targets", "")
        duration  = (s.get("duration") or {}).get("entry", "") if isinstance(s.get("duration"), dict) else str(s.get("duration") or "")
        save      = s.get("savingThrow", {})
        save_str  = save.get("type", [""])[0] if isinstance(save, dict) else ""
        desc      = entries_to_md(s.get("entries"))
        heightened = s.get("heightened") or {}
        ht_lines  = []
        for ht_key, ht_val in (heightened.items() if isinstance(heightened, dict) else []):
            ht_lines.append(f"**+{ht_key}:** {entries_to_md(ht_val.get('entries') if isinstance(ht_val, dict) else ht_val)}")
        heightened_block = "\n\n".join(ht_lines)

        content = f"""---
tags:
  - Spell
  - PF2e
name: {name}
level: {level}
traditions: {json.dumps(traditions)}
traits: {json.dumps(s.get("traits") or [])}
source: {source}
page: {page}
cast: "{cast_str}"
area: "{area}"
targets: "{targets}"
duration: "{duration}"
savingThrow: "{save_str}"
---

# {name}

> [!infobox | no-blending black]+ <font color="#ffffff">Infobox</font>
>
> # Details
> | | |
> |---|---|
> | **Level** | {level} |
> | **Traditions** | {", ".join(traditions)} |
> | **Traits** | {traits} |
> | **Cast** | {cast_str} |
> | **Area** | {area} |
> | **Targets** | {targets} |
> | **Duration** | {duration} |
> | **Saving Throw** | {save_str} |
> | **Source** | {source} p.{page} |

{desc}

{"## Heightened" + chr(10) + heightened_block if heightened_block else ""}

## Notes

"""
        fname = sanitize(name)
        written += write_note(out_dir / f"{fname}.md", content)
    print(f"    → {written} spells written", file=sys.stderr)
    return written


def import_items(vault: Path, source_filter: str) -> int:
    print("  Fetching items…", file=sys.stderr)
    out_dir = vault / "Campaign" / "Possessions" / "Items"
    written = 0
    entries = fetch_entries("items/index.json", "item", source_filter)
    for item in entries:
        name = item.get("name", "")
        if not name:
            continue
        category  = item.get("category", "")
        item_type = item.get("type", "")
        level     = item.get("level", 0)
        price     = item.get("price") or {}
        price_str = f"{price.get('amount', '')} {price.get('coin', '')}".strip() if isinstance(price, dict) else str(price)
        traits    = traits_str(item)
        bulk      = item.get("bulk", "")
        source    = item.get("source", "")
        page      = item.get("page", "")
        desc      = entries_to_md(item.get("entries"))

        content = f"""---
tags:
  - Item
  - PF2e
name: {name}
category: "{category}"
itemType: "{item_type}"
level: {level}
price: "{price_str}"
bulk: "{bulk}"
traits: {json.dumps(item.get("traits") or [])}
source: {source}
page: {page}
---

# {name}

> [!infobox | no-blending black]+ <font color="#ffffff">Infobox</font>
>
> # Details
> | | |
> |---|---|
> | **Category** | {category} |
> | **Type** | {item_type} |
> | **Level** | {level} |
> | **Price** | {price_str} |
> | **Bulk** | {bulk} |
> | **Traits** | {traits} |
> | **Source** | {source} p.{page} |

{desc}

## Notes

"""
        fname = sanitize(name)
        written += write_note(out_dir / f"{fname}.md", content)
    print(f"    → {written} items written", file=sys.stderr)
    return written


def import_backgrounds(vault: Path, source_filter: str) -> int:
    print("  Fetching backgrounds…", file=sys.stderr)
    out_dir = vault / "Campaign" / "Lore" / "Backgrounds"
    written = 0
    entries = fetch_entries("backgrounds/index.json", "background", source_filter)
    for bg in entries:
        name = bg.get("name", "")
        if not name:
            continue
        source = bg.get("source", "")
        page   = bg.get("page", "")
        boosts = bg.get("boosts") or []
        skills = bg.get("skills") or []
        feats  = bg.get("feats") or []
        feat_links = ", ".join(f"[[{f}]]" if isinstance(f, str) else f"[[{f.get('name','')}]]" for f in feats)
        desc   = entries_to_md(bg.get("entries"))

        content = f"""---
tags:
  - Background
  - PF2e
name: {name}
system: PF2e
boosts: {json.dumps(boosts)}
skills: {json.dumps(skills)}
source: {source}
page: {page}
summary: ""
---

> [!infobox | no-blending black]+ <font color="#ffffff">Infobox</font>
>
> # Details
> | | |
> |---|---|
> | **Ability Boosts** | {", ".join(str(b) for b in boosts)} |
> | **Trained Skills** | {", ".join(str(s) for s in skills)} |
> | **Skill Feats** | {feat_links} |
> | **Source** | {source} p.{page} |

# {name}

{desc}

## Notes

"""
        fname = sanitize(name)
        written += write_note(out_dir / f"{fname}.md", content)
    print(f"    → {written} backgrounds written", file=sys.stderr)
    return written


def _load_ancestry_files(source_filter: str):
    """
    Yield (ancestry_entry, filename) pairs from pf2etools ancestry data.

    The ancestry index maps ancestry-name → filename (e.g. "dwarf" →
    "ancestry-dwarf.json").  The keys are NOT source codes, so we must
    load every file and filter by each entry's own ``source`` field.
    Duplicate filenames in the index are visited only once.
    """
    index = fetch_index("ancestries/index.json")
    seen_files: set = set()
    for filename in index.values():
        if filename in seen_files:
            continue
        seen_files.add(filename)
        url  = f"{DATA_BASE}/ancestries/{filename}"
        data = http_get_json_safe(url)
        if not data or "ancestry" not in data:
            continue
        for entry in data["ancestry"]:
            yield entry


def import_ancestries(vault: Path, source_filter: str) -> int:
    print("  Fetching ancestries…", file=sys.stderr)
    out_dir = vault / "Campaign" / "Lore" / "Ancestries"
    out_dir.mkdir(parents=True, exist_ok=True)
    written = 0

    for a in _load_ancestry_files(source_filter):
        if not source_ok(a, source_filter):
            continue
        name = a.get("name", "")
        if not name:
            continue
        hp     = a.get("hp", 0)
        size   = a.get("size") or []
        speed  = a.get("speed") or {}
        speed_str = str(speed.get("walk", "")) if isinstance(speed, dict) else str(speed)
        boosts = a.get("boosts") or []
        flaws  = a.get("flaws") or a.get("flaw") or []
        langs  = a.get("languages") or []
        traits = traits_str(a)
        source = a.get("source", "")
        page   = a.get("page", "")
        desc   = entries_to_md(a.get("flavor") or a.get("entries"))

        content = f"""---
tags:
  - Ancestry
  - PF2e
name: {name}
system: PF2e
hp: {hp}
size: {json.dumps(size)}
speed: "{speed_str}"
boosts: {json.dumps(boosts)}
flaws: {json.dumps(flaws)}
languages: {json.dumps(langs)}
traits: {json.dumps(a.get("traits") or [])}
source: {source}
page: {page}
summary: ""
---

> [!infobox | no-blending black]+ <font color="#ffffff">Infobox</font>
>
> # Details
> | | |
> |---|---|
> | **HP** | {hp} |
> | **Size** | {", ".join(str(s) for s in size)} |
> | **Speed** | {speed_str} ft |
> | **Ability Boosts** | {", ".join(str(b) for b in boosts)} |
> | **Ability Flaws** | {", ".join(str(f) for f in flaws)} |
> | **Languages** | {", ".join(str(l) for l in langs)} |
> | **Traits** | {traits} |
> | **Source** | {source} p.{page} |

# {name}

{desc}

## Heritages

```dataview
LIST
FROM "Campaign/Lore/Ancestries/Heritages"
WHERE econtains(tags,"Heritage") AND parentAncestry = this.file.link
SORT file.name ASC
```

## Notes

"""
        fname = sanitize(name)
        written += write_note(out_dir / f"{fname}.md", content)
    print(f"    → {written} ancestries written", file=sys.stderr)
    return written


def import_heritages(vault: Path, source_filter: str) -> int:
    print("  Fetching heritages…", file=sys.stderr)
    out_dir = vault / "Campaign" / "Lore" / "Ancestries" / "Heritages"
    out_dir.mkdir(parents=True, exist_ok=True)
    written = 0

    # Heritages live inside each ancestry object under the "heritage" key,
    # NOT as a top-level key in the file.  Iterate ancestry files and pull
    # h from a["heritage"] for each ancestry entry a.
    for a in _load_ancestry_files(source_filter):
        ancestry_name = a.get("name", "")
        for h in (a.get("heritage") or []):
            if not source_ok(h, source_filter):
                continue
            name = h.get("name", "")
            if not name:
                continue
            source = h.get("source", "")
            page   = h.get("page", "")
            traits = traits_str(h)
            desc   = entries_to_md(h.get("entries"))

            content = f"""---
tags:
  - Heritage
  - PF2e
name: {name}
parentAncestry: "[[{ancestry_name}]]"
traits: {json.dumps(h.get("traits") or [])}
source: {source}
page: {page}
summary: ""
---

> [!infobox | no-blending black]+ <font color="#ffffff">Infobox</font>
>
> # Details
> | | |
> |---|---|
> | **Ancestry** | `VIEW[{{parentAncestry}}][link]` |
> | **Traits** | {traits} |
> | **Source** | {source} p.{page} |

# {name}

{desc}

## Notes

"""
            fname = sanitize(name)
            written += write_note(out_dir / f"{fname}.md", content)
    print(f"    → {written} heritages written", file=sys.stderr)
    return written


def import_classes(vault: Path, source_filter: str) -> int:
    print("  Fetching classes…", file=sys.stderr)
    out_dir = vault / "Campaign" / "Lore" / "Classes"
    written = 0
    entries = fetch_entries("class/index.json", "class", source_filter)
    for cls in entries:
        name      = cls.get("name", "")
        if not name:
            continue
        source    = cls.get("source", "")
        page      = cls.get("page", "")
        hp        = cls.get("hp", 0)
        key_ability = cls.get("keyAbility") or []
        if isinstance(key_ability, str):
            key_ability = [key_ability]
        desc      = entries_to_md(cls.get("flavor") or cls.get("fluff") or cls.get("entries"))

        content = f"""---
tags:
  - Class
  - PF2e
name: {name}
system: PF2e
hp: {hp}
keyAbility: {json.dumps(key_ability)}
source: {source}
page: {page}
summary: ""
---

> [!infobox | no-blending black]+ <font color="#ffffff">Infobox</font>
>
> # Details
> | | |
> |---|---|
> | **HP per Level** | {hp} |
> | **Key Ability** | {", ".join(str(k) for k in key_ability)} |
> | **Source** | {source} p.{page} |

# {name}

{desc}

## Notes

"""
        fname = sanitize(name)
        written += write_note(out_dir / f"{fname}.md", content)
    print(f"    → {written} classes written", file=sys.stderr)
    return written


def import_class_features(vault: Path, source_filter: str) -> int:
    print("  Fetching class features…", file=sys.stderr)
    out_dir = vault / "Campaign" / "Lore" / "Classes" / "Features"
    written = 0
    entries = fetch_entries("class/index.json", "classFeature", source_filter)
    for f in entries:
        name      = f.get("name", "")
        cls_name  = f.get("className", "")
        if not name or not cls_name:
            continue
        level     = f.get("level", 1)
        source    = f.get("source", "")
        page      = f.get("page", "")
        desc      = entries_to_md(f.get("entries"))
        fname_str = f"{name} ({cls_name})"

        content = f"""---
tags:
  - ClassFeature
  - PF2e
name: {name}
parentClass: "[[{cls_name}]]"
level: {level}
source: {source}
page: {page}
---

# {name}

> **Class:** `VIEW[{{parentClass}}][link]` · **Level:** {level} · **Source:** {source} p.{page}

{desc}

## Notes

"""
        written += write_note(out_dir / f"{sanitize(fname_str)}.md", content)
    print(f"    → {written} class features written", file=sys.stderr)
    return written


def import_feats(vault: Path, source_filter: str) -> int:
    print("  Fetching feats…", file=sys.stderr)
    out_dir = vault / "Campaign" / "Lore" / "Feats"
    written = 0
    entries = fetch_entries("feats/index.json", "feat", source_filter)
    for feat in entries:
        name   = feat.get("name", "")
        if not name:
            continue
        level  = feat.get("level", 1)
        traits = traits_str(feat)
        prereq = feat.get("prerequisites", "")
        source = feat.get("source", "")
        page   = feat.get("page", "")
        desc   = entries_to_md(feat.get("entries"))

        content = f"""---
tags:
  - Feat
  - PF2e
name: {name}
system: PF2e
level: {level}
traits: {json.dumps(feat.get("traits") or [])}
prerequisites: "{prereq}"
source: {source}
page: {page}
---

> [!infobox | no-blending black]+ <font color="#ffffff">Infobox</font>
>
> # Details
> | | |
> |---|---|
> | **Level** | {level} |
> | **Traits** | {traits} |
> | **Prerequisites** | {prereq} |
> | **Source** | {source} p.{page} |

# {name}

{desc}

## Notes

"""
        fname = sanitize(name)
        written += write_note(out_dir / f"{fname}.md", content)
    print(f"    → {written} feats written", file=sys.stderr)
    return written


def import_deities(vault: Path, source_filter: str) -> int:
    print("  Fetching deities…", file=sys.stderr)
    out_dir = vault / "Campaign" / "Characters" / "Deities"
    written = 0
    entries = fetch_entries("deities.json", "deity", source_filter)
    for d in entries:
        name      = d.get("name", "")
        if not name:
            continue
        alignment = d.get("alignment") or {}
        align_str = alignment.get("entry", "") if isinstance(alignment, dict) else str(alignment)
        domains   = d.get("domains") or []
        edicts    = d.get("edicts") or []
        anathema  = d.get("anathema") or []
        source    = d.get("source", "")
        page      = d.get("page", "")
        desc      = entries_to_md(d.get("entries"))

        content = f"""---
tags:
  - Deity
  - PF2e
name: {name}
alignment: "{align_str}"
domains: {json.dumps(domains)}
edicts: {json.dumps(edicts)}
anathema: {json.dumps(anathema)}
source: {source}
page: {page}
summary: ""
---

> [!infobox | no-blending black]+ <font color="#ffffff">Infobox</font>
>
> # Details
> | | |
> |---|---|
> | **Alignment** | {align_str} |
> | **Domains** | {", ".join(str(dom) for dom in domains)} |
> | **Edicts** | {"; ".join(str(e) for e in edicts)} |
> | **Anathema** | {"; ".join(str(a) for a in anathema)} |
> | **Source** | {source} p.{page} |

# {name}

{desc}

## Notes

"""
        fname = sanitize(name)
        written += write_note(out_dir / f"{fname}.md", content)
    print(f"    → {written} deities written", file=sys.stderr)
    return written


def import_conditions(vault: Path, source_filter: str) -> int:
    print("  Fetching conditions…", file=sys.stderr)
    out_dir = vault / "Campaign" / "Lore" / "Conditions"
    written = 0
    entries = fetch_entries("conditions.json", "condition", source_filter)
    for c in entries:
        name   = c.get("name", "")
        if not name:
            continue
        source = c.get("source", "")
        page   = c.get("page", "")
        desc   = entries_to_md(c.get("entries"))

        content = f"""---
tags:
  - Condition
  - PF2e
name: {name}
source: {source}
page: {page}
---

# {name}

> **Source:** {source} p.{page}

{desc}

## Notes

"""
        fname = sanitize(name)
        written += write_note(out_dir / f"{fname}.md", content)
    print(f"    → {written} conditions written", file=sys.stderr)
    return written


def import_languages(vault: Path, source_filter: str) -> int:
    print("  Fetching languages…", file=sys.stderr)
    out_dir = vault / "Campaign" / "Lore" / "Languages"
    written = 0
    entries = fetch_entries("languages.json", "language", source_filter)
    for lang in entries:
        name      = lang.get("name", "")
        if not name:
            continue
        typeval   = lang.get("type", "")
        speakers  = lang.get("typicalSpeakers") or []
        source    = lang.get("source", "")
        page      = lang.get("page", "")
        desc      = entries_to_md(lang.get("entries"))

        content = f"""---
tags:
  - Language
  - PF2e
name: {name}
languageType: "{typeval}"
typicalSpeakers: {json.dumps(speakers)}
source: {source}
page: {page}
---

# {name}

> | | |
> |---|---|
> | **Type** | {typeval} |
> | **Typical Speakers** | {", ".join(str(s) for s in speakers)} |
> | **Source** | {source} p.{page} |

{desc}

## Notes

"""
        fname = sanitize(name)
        written += write_note(out_dir / f"{fname}.md", content)
    print(f"    → {written} languages written", file=sys.stderr)
    return written


def import_actions(vault: Path, source_filter: str) -> int:
    print("  Fetching actions…", file=sys.stderr)
    out_dir = vault / "Campaign" / "Lore" / "Actions"
    out_dir.mkdir(parents=True, exist_ok=True)
    written = 0
    entries = fetch_entries("actions.json", "action", source_filter)
    for a in entries:
        name   = a.get("name", "")
        if not name:
            continue
        traits = traits_str(a)
        source = a.get("source", "")
        page   = a.get("page", "")
        desc   = entries_to_md(a.get("entries"))

        content = f"""---
tags:
  - Action
  - PF2e
name: {name}
traits: {json.dumps(a.get("traits") or [])}
source: {source}
page: {page}
---

# {name}

> | | |
> |---|---|
> | **Traits** | {traits} |
> | **Source** | {source} p.{page} |

{desc}

## Notes

"""
        fname = sanitize(name)
        written += write_note(out_dir / f"{fname}.md", content)
    print(f"    → {written} actions written", file=sys.stderr)
    return written


# ── Dispatcher ─────────────────────────────────────────────────────────────────

IMPORTERS = {
    "spells":        import_spells,
    "items":         import_items,
    "backgrounds":   import_backgrounds,
    "classes":       import_classes,
    "classfeatures": import_class_features,
    "ancestries":    import_ancestries,
    "heritages":     import_heritages,
    "feats":         import_feats,
    "deities":       import_deities,
    "conditions":    import_conditions,
    "languages":     import_languages,
    "actions":       import_actions,
}

ALL_TYPES = list(IMPORTERS.keys())


# ── Entry point ────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Import PF2e.tools data into an Obsidian vault")
    parser.add_argument("--vault",   required=True, help="Absolute path to the vault root")
    parser.add_argument("--source",  default="official", choices=["official", "all"],
                        help="Source filter: official Paizo sources only, or all sources")
    parser.add_argument("--type",    nargs="+", choices=ALL_TYPES, default=ALL_TYPES,
                        help="Content types to import (default: all)")
    args = parser.parse_args()

    vault = Path(args.vault)
    if not vault.is_dir():
        print(json.dumps({"error": f"Vault not found: {vault}"}))
        sys.exit(1)

    print(f"Vault: {vault}", file=sys.stderr)
    print(f"Source filter: {args.source}", file=sys.stderr)
    print(f"Types: {', '.join(args.type)}", file=sys.stderr)

    for content_type in args.type:
        importer = IMPORTERS.get(content_type)
        if importer:
            importer(vault, args.source)

    print(f"Wrote {_NOTES_WRITTEN} notes total", file=sys.stderr)
    print(json.dumps({"status": "success", "notes_written": _NOTES_WRITTEN}))


if __name__ == "__main__":
    main()
