// ── Helpers ────────────────────────────────────────────────────────────────

function extractCharId(input) {
    const trimmed = input.trim();
    const match = trimmed.match(/\/characters?\/(\d+)/i);
    if (match) return match[1];
    if (/^\d+$/.test(trimmed)) return trimmed;
    return null;
}

function getParties(app) {
    return app.vault.getMarkdownFiles()
        .filter(f => f.path.startsWith("Campaign/Parties/Party Dashboards/"))
        .map(f => f.basename)
        .sort();
}

// ── Party creation (mirrors NewParty.js logic) ─────────────────────────────

function getNextPartyNumber(app) {
    const folder = app.vault.getAbstractFileByPath("Campaign/Parties/Party Dashboards");
    if (!folder?.children) return 1;
    return folder.children.filter(f => !("children" in f) && f.extension === "md").length + 1;
}

async function createFolderSafe(app, path) {
    try { await app.vault.createFolder(path); } catch (_) {}
}

function buildRelationsBase(relationField) {
    const views = ["Family", "Allies", "Friends", "Enemy"].map(name => {
        const filter = name === "Enemy"
            ? `${relationField}.contains("Enemy")`
            : `${relationField}.contains("${name === "Allies" ? "Ally" : name.slice(0,-1)}")`;
        // Simpler: just use the name directly
        return `  - type: cards
    name: ${name}
    filters:
      and:
        - file.inFolder("Campaign/Characters")
        - ${relationField}.contains("${name === "Allies" ? "Ally" : name === "Friends" ? "Friend" : name === "Enemy" ? "Enemy" : "Family"}")
        - or:
            - '!condition.contains("Dead")'
            - condition.isEmpty()
    order:
      - file.name
    image: note.art
    cardSize: 100`;
    });
    return `properties:
  file.name:
    displayName: Name
  property.aliases:
    displayName: Aliases
  property.currentLocation:
    displayName: Location
views:
${views.join("\n")}
  - type: cards
    name: All
    filters:
      and:
        - file.inFolder("Campaign/Characters")
        - or:
            - '!condition.contains("Dead")'
            - condition.isEmpty()
        - '!file.tags.contains("Player")'
    order:
      - file.name
    image: note.art
    cardSize: 100
`;
}

async function ensureParty(app, partyName) {
    const dashboardPath = `Campaign/Parties/Party Dashboards/${partyName}.md`;
    if (app.vault.getAbstractFileByPath(dashboardPath)) return; // already exists

    const partyN      = getNextPartyNumber(app);
    const dbFolder    = `z_Databases/Party/${partyName}`;

    await createFolderSafe(app, `Campaign/Characters/Players/${partyName}`);
    await createFolderSafe(app, dbFolder);

    // Copy base templates
    for (const base of ["Database - Party Members.base", "Database - Story.base"]) {
        const src = app.vault.getAbstractFileByPath(`z_Templates/Characters/${base}`);
        if (src) {
            try { await app.vault.create(`${dbFolder}/${base}`, await app.vault.read(src)); } catch (_) {}
        }
    }

    // Relations base
    await app.vault.create(
        `${dbFolder}/Database - ${partyName} Relations.base`,
        buildRelationsBase(`party${partyN}Relation`)
    );

    // Party dashboard from template
    const tmpl = app.vault.getAbstractFileByPath("z_Templates/Characters/Template - Party Dashboard.md");
    if (tmpl) {
        let content = await app.vault.read(tmpl);
        content = content.replaceAll("Party 1", partyName);
        content = content.replace(/^partyID:\s*$/m, `partyID: ${partyN}`);
        await app.vault.create(dashboardPath, content);
    }

    // Set activeParty on Homepage
    const homepage = app.vault.getAbstractFileByPath("1.Tools/Homepage.md");
    if (homepage) {
        await app.fileManager.processFrontMatter(homepage, fm => { fm.activeParty = partyName; });
    }
}

// ── Main ───────────────────────────────────────────────────────────────────

module.exports = async (params) => {
    const { app, quickAddApi: qa } = params;
    const vaultPath = app.vault.adapter.basePath;

    // ── Character URL / ID ────────────────────────────────────────────────
    const input = await qa.inputPrompt(
        "D&D Beyond character URL or ID",
        "https://www.dndbeyond.com/characters/123456789"
    );
    if (!input) return;

    const charId = extractCharId(input);
    if (!charId) {
        new Notice("❌ Could not find a character ID in that input.", 6000);
        return;
    }

    // ── Party selection ───────────────────────────────────────────────────
    const parties = getParties(app);
    let partyName = "";

    if (parties.length > 0) {
        const options = [...parties, "➕ Create new party", "— No party —"];
        const chosen  = await qa.suggester(options, options);
        if (chosen === undefined) return;
        if (chosen === "— No party —") {
            partyName = "";
        } else if (chosen === "➕ Create new party") {
            partyName = (await qa.inputPrompt("New party name", "")) || "";
        } else {
            partyName = chosen;
        }
    } else {
        partyName = (await qa.inputPrompt("Party name (leave blank to skip)", "")) || "";
    }

    // Create party if it doesn't exist yet
    if (partyName) {
        try {
            await ensureParty(app, partyName);
        } catch (e) {
            new Notice(`⚠️ Could not create party: ${e.message}`, 8000);
        }
    }

    // ── Run Python importer ───────────────────────────────────────────────
    const { exec }      = require("child_process");
    const { promisify } = require("util");
    const execAsync     = promisify(exec);

    // Detect python3 vs python (Windows uses "python", not "python3")
    const pythonCandidates = process.platform === "win32"
        ? ["python", "python3"]
        : ["python3", "python"];
    let pythonCmd = pythonCandidates[0];
    for (const candidate of pythonCandidates) {
        try {
            await execAsync(`${candidate} --version`);
            pythonCmd = candidate;
            break;
        } catch (_) {}
    }

    const cmd = `${pythonCmd} "${vaultPath}/ImportDnDBeyond.py" "${vaultPath}" "${charId}" "${partyName}"`;

    new Notice("⏳ Fetching character from D&D Beyond…");

    let result;
    try {
        const { stdout } = await execAsync(cmd, { maxBuffer: 10 * 1024 * 1024 });
        const lines = stdout.trim().split("\n");
        result = JSON.parse(lines[lines.length - 1]);
    } catch (e) {
        new Notice(`❌ Import failed: ${e.message}`, 10000);
        return;
    }

    // ── Private character ─────────────────────────────────────────────────
    if (result.error === "character_private") {
        new Notice(
            "🔒 This character is set to private on D&D Beyond.\n\nAsk the player to go to their character sheet → Share → set visibility to Public, then try importing again.",
            15000
        );
        return;
    }

    if (result.error) {
        new Notice(`❌ Import failed: ${result.error}`, 10000);
        return;
    }

    // ── Open note ─────────────────────────────────────────────────────────
    new Notice(`✅ Imported ${result.name}! Reloading vault…`);
    setTimeout(() => app.commands.executeCommandById("app:reload"), 1500);
};
