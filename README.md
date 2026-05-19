# TTRPG Vault for Obsidian

A fully featured campaign management vault template for [Obsidian](https://obsidian.md). Built for Game Masters running tabletop RPG campaigns.

---

## Features

- **Homepage dashboard** — Active party tracker, world overview, quick-create buttons, and inspiration tables with rollable dice
- **GM Screen** — Initiative tracker, rules reference, and live session notes in one place
- **29 note types** — Each with matching icons and colors on internal links and in the file explorer
- **One-click note creation** — Quick Create buttons for characters, locations, lore, story, and possessions
- **5e.tools importer** — Import spells, items, classes, races, feats, backgrounds, deities, and more with one click
- **Obsidian Bases** — Party dashboards with dynamic member cards and adventure tracking
- **17 pre-installed plugins** — Configured and ready to use out of the box
- **Reset Vault** — Wipe campaign data cleanly when starting a new campaign

---

## Setup

> **Estimated time:** 5–10 minutes for core setup · 15–30 minutes if importing 5e content

### Step 1 — Open the Vault in Obsidian

> You must have [Obsidian](https://obsidian.md) installed. Download it free if you haven't already.

1. Download `TTRPG-Vault-vX.X.X.zip` from the [latest release](../../releases/latest)
2. Extract the zip
3. Open **Obsidian** → click **"Open folder as vault"**
4. Navigate to and select the **TTRPG** folder
5. Click **Open**

---

### Step 2 — Enable Community Plugins

All plugins are pre-installed. You just need to turn them on.

> Obsidian will show a Safe Mode warning — this is normal. All plugins in this vault are open-source and widely used by the TTRPG community.

1. When prompted, click **"Turn on community plugins"**
   - If you don't see the prompt: **Settings → Community Plugins → Turn off Restricted Mode**
2. All 17 plugins activate automatically — no manual enabling needed

| Plugin | Purpose |
|--------|---------|
| Dataview | Powers all dynamic tables and lists |
| Meta Bind | Inline editable fields on notes |
| QuickAdd | One-click note creation with templates |
| Templater | Advanced template scripting |
| Supercharged Links | Colored icons on links in notes |
| File Color | Colored folder names in the explorer |
| Dice Roller | Inline dice rolls throughout the vault |
| Calendarium | In-world campaign calendar |
| 5e Statblocks | Monster/NPC stat block renderer |
| Leaflet | Interactive maps |
| Excalidraw | Freehand drawing and maps |
| Hover Editor | Pop-up note preview and editing |
| Editing Toolbar | Formatting toolbar in the editor |
| Homepage | Auto-opens Homepage on launch |
| Style Settings | Theme customization controls |
| Pretty Properties | Cleaner property display |
| Various Complements | Autocomplete for note links |

---

### Step 3 — Verify the Theme

The vault uses the **ITS Theme** for layout and callout styling.

1. Go to **Settings → Appearance**
2. Confirm **ITS Theme** is selected under Themes
3. If not: click **Manage** → search `ITS Theme` → install → set as active

---

### Step 4 — Enable CSS Snippets

1. Go to **Settings → Appearance → CSS Snippets** (scroll to the bottom)
2. Toggle both of these **ON**:
   - `TTRPG-Icons` — icons and colors on internal note links
   - `TTRPG-Folders` — icons and colors on folders in the file explorer

> If you don't see them, click the refresh icon next to "CSS Snippets" to reload the list.

---

### Step 5 — (Optional) Import 5e Content

The vault includes a one-click importer for spells, items, classes, races, feats, backgrounds, languages, deities, conditions, and optional features from 5e.tools.

> **License Disclaimer:** You are responsible for ensuring you have a valid license or legal right to the content you import. SRD 5.1 content is available under the Creative Commons license. All other sourcebooks require a valid purchase from the publisher.

**Requirements:** Python 3 must be installed. The importer will detect it and offer to install if missing.

1. Open **1.Tools/Buttons.md**
2. Scroll to the **Vault** section
3. Click **"Import 5e.tools Data"**
4. Follow the prompts — choose source, select books, pick content types, confirm
5. A notification appears when complete

The importer never overwrites existing notes — safe to re-run at any time.

---

### Step 6 — Start Your Campaign

1. Open **1.Tools/Homepage.md**
2. Set your **Campaign Name** using the inline text field at the top
3. Click **New Party** in the Quick Create panel — the Active Party is set automatically
4. Start creating with the Quick Create buttons or the full **1.Tools/Buttons.md** page

---

## Key Files

| File | Purpose |
|------|---------|
| `1.Tools/Homepage.md` | Campaign dashboard — party tracker, world overview, inspiration tables |
| `1.Tools/GM Screen.md` | Session tool — initiative tracker, rules reference, live notes |
| `1.Tools/Buttons.md` | All quick-create buttons organized by category |
| `HOW TO USE.md` | Comprehensive guide covering every note type, all fields explained, written for Obsidian beginners |

---

## Folder Structure

```
Campaign/
├── Characters/       Players · NPCs · Deities
├── Organizations/    Guilds, factions, groups
├── Worlds/           Worlds · Planes · Regions
├── Settlements/      Cities, towns, villages
├── Districts/        Districts and neighborhoods
├── Areas/            Dungeons, forests, landmarks
├── POIs/             Points of Interest & Shops
├── Parties/          Adventures · Quests · Sessions · Encounters
├── Lore/             Classes · Races · Feats · Spells · Conditions
└── Possessions/      Items & Spells
```

---

## Icon & Color System

Every note type has a matching icon and color that appears automatically on internal links and in the file explorer based on the note's tags.

| Tag | Icon | Color |
|-----|------|-------|
| Player | ⚔️ | Gold |
| NPC | 👤 | Gray |
| Deity | ✨ | Purple |
| Organization | 🏛️ | Blue |
| Party | 🛡️ | Red |
| World | 🌍 | Green |
| Settlement | 🏰 | Orange |
| Quest | ⚡ | Yellow |
| SessionNote | 📝 | Mint |
| Encounter | 🗡️ | Coral |
| Spell | 🔮 | Lavender |
| Item | 🎒 | Teal |

---

## Resetting the Vault

The **Reset Vault** button (Buttons.md → Vault section) wipes campaign data when starting a new campaign.

- **Campaign Data Only** — deletes characters, sessions, quests, and locations while keeping imported 5e content
- **Full Reset** — permanently deletes everything and reloads Obsidian

> **Warning:** Files are permanently deleted with no recovery. Triple confirmation is required.

---

## Updating the Vault

From **v1.0.9** onwards, the vault includes a built-in updater. Open **1.Tools/Buttons.md**, scroll to the **Vault** section, and click **Check for Updates**. The updater will:

- Compare your local files against the latest release using SHA-256 checksums
- Show you a changelog and a list of files that will change before anything is touched
- Warn you if any files you may have customized (Homepage, Buttons, GM Screen, etc.) are about to be replaced, and back them up first
- Move any custom templates you've added to `z_Templates/` into `z_Templates/_my_templates/` so they are never deleted
- Never touch your campaign data (Characters, Organizations, Worlds, etc.)

### Migrating from v1.0.3 or earlier

The updater in older vault versions has a bug that prevents it from running. You need to replace one file manually before the updater will work:

**Terminal (fastest):**
```bash
curl -L "https://raw.githubusercontent.com/lostbardgames/lostbardgames-obsidian-ttrpg-gm-template/main/z_Templates/Scripts/UpdateVault.js" \
  -o "<path-to-your-vault>/z_Templates/Scripts/UpdateVault.js"
```

**Manual download:**
1. Open this URL in your browser: `https://raw.githubusercontent.com/lostbardgames/lostbardgames-obsidian-ttrpg-gm-template/main/z_Templates/Scripts/UpdateVault.js`
2. Save the page (Cmd+S / Ctrl+S) as `UpdateVault.js`
3. Replace the file at `<your-vault>/z_Templates/Scripts/UpdateVault.js`
4. Reload Obsidian
5. Run **Check for Updates** — it will complete successfully and upgrade you to the latest version

---

## Support

For plugin-specific issues, refer to the documentation linked in **Settings → Community Plugins**. The [Obsidian community forum](https://forum.obsidian.md) is also an excellent resource.
