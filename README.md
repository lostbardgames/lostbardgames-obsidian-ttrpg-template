# LBG TTRPG GM Template for Obsidian

A Game Master vault template for [Obsidian](https://obsidian.md) with multi-system support, one-click note creation, and data importers for D&D and Pathfinder content.

> Designed for GMs. A player-focused template is planned for a future release.

---

## Features

- **Multi-system support** — Configure for D&D 5e (2014), D&D 5.5e (2024 / One D&D), or Pathfinder 2e
- **29 GM note types** — Characters, locations, organizations, quests, encounters, lore, and more
- **One-click note creation** — Quick Create buttons for every note type
- **Data importers** — Import spells, classes, feats, items, and more from 5e.tools and PF2e.tools; import player characters from D&D Beyond
- **System-aware Buttons page** — Import and character creation buttons update automatically when you switch game systems
- **17 pre-installed plugins** — Configured and ready out of the box
- **Built-in updater** — Check for and apply new vault versions without touching your campaign data

---

## Installation

1. Go to the [latest release](../../releases/latest) and download `TTRPG-Vault-vX.X.X.zip`
2. Extract the zip to a location of your choice
3. Open **Obsidian** → **Open folder as vault** → select the extracted `TTRPG Vault` folder
4. When prompted, click **Turn on community plugins**
   - If not prompted: **Settings → Community Plugins → Turn off Restricted Mode**
5. Go to **Settings → Appearance** and confirm **ITS Theme** is selected
6. Go to **Settings → Appearance → CSS Snippets** and enable **TTRPG-Icons** and **TTRPG-Folders**

---

## Setup

### 1. Configure your game system

Open **1.Tools/Buttons.md**, scroll to the **Vault** section, and click **Configure Game System**. Choose from:

- ⚔️ D&D 5th Edition (2014)
- ⚔️ D&D 5.5e (2024 / One D&D)
- 🔆 Pathfinder 2nd Edition

This sets up the correct lore folders, player character template, and import buttons for your system. You can switch systems at any time — imported data is cleared on switch and can be re-imported for the new system.

### 2. (Optional) Import game content

**D&D systems** — Click **Import 5e.tools Data** in the Vault section of Buttons.md. Requires Python 3 and an internet connection.

**Pathfinder 2e** — Click **Import PF2e.tools Data** in the Vault section of Buttons.md. Requires Python 3 and an internet connection.

**D&D Beyond characters** — Click **Import Character from D&D Beyond** in the Characters section of Buttons.md (D&D systems only).

> **License notice:** You are responsible for ensuring you have a valid license or legal right to the content you import. SRD 5.1 content is available under the Creative Commons license. All other sourcebooks require a valid purchase from the publisher.

### 3. Start your campaign

Open **1.Tools/Homepage.md**, set your campaign name, create your first party, and start building.

---

## Updating

Click **Check for Updates** in the Vault section of **1.Tools/Buttons.md**. The updater compares your files against the latest release, shows you what will change, and backs up any customized files before overwriting them. Your campaign data is never touched.

---

## Requirements

- [Obsidian](https://obsidian.md) (free)
- Python 3 — only required for the data importers; the vault prompts you to install it if missing

---

## Support

For plugin-specific issues, refer to the documentation in **Settings → Community Plugins**. The [Obsidian community forum](https://forum.obsidian.md) is a great resource for general Obsidian questions.
