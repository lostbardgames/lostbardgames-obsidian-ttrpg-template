const REPO    = "lostbardgames/obsidian-ttrpg-vault";
const API_URL = `https://api.github.com/repos/${REPO}/releases/latest`;

// ── Version helpers ────────────────────────────────────────────────────────

function parseVersion(tag) {
    // "v1.0.3-beta" → "1.0.3"
    return String(tag).replace(/^v/, "").replace(/-[a-z]+$/i, "");
}

function isNewer(candidate, current) {
    const a = parseVersion(candidate).split(".").map(Number);
    const b = parseVersion(current).split(".").map(Number);
    for (let i = 0; i < 3; i++) {
        if ((a[i] || 0) > (b[i] || 0)) return true;
        if ((a[i] || 0) < (b[i] || 0)) return false;
    }
    return false;
}

// ── Update prompt (QuickAdd-compatible — no require("obsidian") needed) ────

async function showUpdatePrompt(qa, info) {
    // Show changelog as a persistent notice so it's readable while the prompt is open
    new Notice(
        `Update available: ${info.currentVersion} → ${info.latestTag}\n\nWhat's New:\n${info.changelog || "No changelog provided."}`,
        20000
    );

    const proceed = await qa.yesNoPrompt(
        `Update vault from v${info.currentVersion} to ${info.latestTag}?`
    );
    if (!proceed) return null;

    const updateTools = await qa.yesNoPrompt(
        "Also update tool files? (Homepage, Buttons, GM Screen)\nThese will be backed up as .bak first."
    );
    return updateTools;
}

// ── Main ───────────────────────────────────────────────────────────────────

module.exports = async (params) => {
    const { app, quickAddApi: qa } = params;
    const vaultPath = app.vault.adapter.basePath;

    // Read installed version
    let currentVersion = "0.0.0";
    try {
        const raw = await app.vault.adapter.read("version.json");
        currentVersion = JSON.parse(raw).version;
    } catch (_) {}

    new Notice("Checking for updates…");

    // Fetch latest release from GitHub
    let release;
    try {
        const res = await fetch(API_URL, {
            headers: { "User-Agent": "obsidian-ttrpg-vault-updater" }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        release = await res.json();
    } catch (e) {
        new Notice(`❌ Could not reach GitHub: ${e.message}`, 8000);
        return;
    }

    const latestTag  = release.tag_name;
    const newVersion = parseVersion(latestTag);

    if (!isNewer(latestTag, currentVersion)) {
        new Notice(`✅ Already up to date (v${currentVersion})`);
        return;
    }

    // Find zip asset
    const zipAsset = (release.assets || []).find(a => a.name.endsWith(".zip"));
    if (!zipAsset) {
        new Notice("❌ No zip found in the latest release.", 8000);
        return;
    }

    // Show prompt and wait for user decision
    const updateTools = await showUpdatePrompt(qa, {
        currentVersion,
        latestTag,
        changelog: release.body
    });

    if (updateTools === null) return; // user cancelled

    new Notice("⬇️ Downloading update…");

    try {
        const { exec }    = require("child_process");
        const { promisify } = require("util");
        const execAsync   = promisify(exec);

        const cmd = `python3 "${vaultPath}/UpdateVault.py" "${vaultPath}" "${zipAsset.browser_download_url}" "${updateTools}" "${newVersion}"`;
        const { stdout } = await execAsync(cmd, { maxBuffer: 10 * 1024 * 1024 });

        // Last line of stdout is the JSON result
        const lines  = stdout.trim().split("\n");
        const result = JSON.parse(lines[lines.length - 1]);

        const count   = result.updated.length;
        const backups = result.backed_up.length;

        let msg = `✅ Updated to ${latestTag}! ${count} file(s) replaced.`;
        if (backups > 0) msg += ` ${backups} backed up as .bak`;
        if (updateTools) msg += "\n\nCheck your Campaign Name in Homepage if it was reset.";

        new Notice(msg, 10000);
        setTimeout(() => app.commands.executeCommandById("app:reload"), 2500);

    } catch (e) {
        new Notice(`❌ Update failed: ${e.message}`, 12000);
        console.error("UpdateVault error:", e);
    }
};
