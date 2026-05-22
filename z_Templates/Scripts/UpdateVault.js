// ── Config ────────────────────────────────────────────────────────────────────

const PYTHON_SCRIPT = "UpdateVault.py"; // relative to vault root

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Detect the correct Python executable name for the current OS.
 * Windows uses "python"; macOS/Linux use "python3".
 * Falls back to "python3" if detection fails.
 */
async function detectPython() {
    const { exec }      = require("child_process");
    const { promisify } = require("util");
    const execAsync     = promisify(exec);

    // On Windows, "python3" triggers the Microsoft Store stub and fails.
    // "python" is the correct command when Python is properly installed.
    const candidates = process.platform === "win32"
        ? ["python", "python3"]
        : ["python3", "python"];

    for (const cmd of candidates) {
        try {
            const { stdout } = await execAsync(`${cmd} --version`);
            if (stdout.includes("Python 3") || stdout.includes("Python 2")) {
                return cmd;
            }
        } catch (_) {
            // try next candidate
        }
    }
    return candidates[0]; // best guess
}

/**
 * Run UpdateVault.py and return the parsed JSON result.
 * Progress lines emitted to stderr are silently consumed.
 * Throws if the process errors or produces no JSON.
 */
async function runPython(vaultPath, args) {
    const { exec }      = require("child_process");
    const { promisify } = require("util");
    const execAsync     = promisify(exec);

    const python = await detectPython();

    const quotedArgs = args
        .map(a => `"${String(a).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`)
        .join(" ");
    const cmd = `${python} "${vaultPath}/${PYTHON_SCRIPT}" ${quotedArgs}`;

    const { stdout } = await execAsync(cmd, { maxBuffer: 10 * 1024 * 1024 });

    // The last non-empty stdout line is always the JSON result
    const lines = stdout.trim().split("\n").filter(Boolean);
    return JSON.parse(lines[lines.length - 1]);
}

// ── Main ───────────────────────────────────────────────────────────────────────

module.exports = async (params) => {
    const { app, quickAddApi: qa } = params;
    const vaultPath = app.vault.adapter.basePath;

    // ── Step A: Check for updates ─────────────────────────────────────────────
    new Notice("Checking for updates…");

    let check;
    try {
        // Single arg: vault_path. Python reads version.json and fetches GitHub.
        check = await runPython(vaultPath, [vaultPath]);
    } catch (e) {
        new Notice(`❌ Update check failed: ${e.message}`, 10000);
        console.error("UpdateVault check error:", e);
        return;
    }

    if (check.status === "failed") {
        new Notice(`❌ Update check failed: ${check.error}`, 10000);
        return;
    }

    if (check.status === "up_to_date") {
        new Notice(`✅ Already up to date (v${check.current_version})`);
        return;
    }

    // ── status === "update_available" ─────────────────────────────────────────

    // Show changelog as a persistent notice — visible while prompts are open
    const changelog = check.changelog
        ? check.changelog.slice(0, 800) + (check.changelog.length > 800 ? "…" : "")
        : "No changelog provided.";

    new Notice(
        `Update available: v${check.current_version} → ${check.latest_tag}\n\nWhat's New:\n${changelog}`,
        20000
    );

    // ── Surface customization warnings before asking to proceed ───────────────
    const customized = (check.customized_files || []).filter(f => f.has_local_changes);
    if (customized.length > 0) {
        const names = customized.map(f => f.path.split("/").pop()).join(", ");
        new Notice(
            `⚠️ Customized files detected — these will be backed up before updating:\n${names}\n\n` +
            `Find backups in .vault-backups/${check.current_version}/ after the update.`,
            15000
        );
    }

    // Build a summary of what will change
    const alwaysCount   = (check.files_to_update   || []).length;
    const optionalCount = (check.optional_to_update || []).length;

    let filesSummary = `${alwaysCount} file(s) will be updated automatically.`;
    if (optionalCount > 0) {
        filesSummary += `\n${optionalCount} optional tool file(s) also available.`;
    }

    const proceed = await qa.yesNoPrompt(
        `Update vault from v${check.current_version} to ${check.latest_tag}?\n\n${filesSummary}`
    );
    if (!proceed) return;

    // ── Ask about optional tool files ─────────────────────────────────────────
    let updateTools = false;
    if (optionalCount > 0) {
        const optNames = (check.optional_to_update || [])
            .map(f => f.split("/").pop())
            .join(", ");
        updateTools = await qa.yesNoPrompt(
            `Also update tool files? (${optNames})\n` +
            "Your current versions will be backed up to .vault-backups/ first."
        );
        if (updateTools === null || updateTools === undefined) return;
    }

    // ── Step B: Apply update ──────────────────────────────────────────────────
    new Notice("⬇️  Downloading and applying update…");

    let result;
    try {
        result = await runPython(vaultPath, [
            vaultPath,
            check.new_version,
            String(updateTools),
            "--confirm",
            check.manifest_url,
        ]);
    } catch (e) {
        new Notice(`❌ Update failed: ${e.message}`, 12000);
        console.error("UpdateVault confirm error:", e);
        return;
    }

    // ── Delete retired files (JS-side, so it always runs on the current script) ──
    const toDelete = check.delete || [];
    for (const rel of toDelete) {
        const exists = await app.vault.adapter.exists(rel);
        if (exists) {
            try {
                await app.vault.adapter.remove(rel);
            } catch (e) {
                console.error(`UpdateVault: could not delete ${rel}:`, e);
            }
        }
    }

    // ── Show result ───────────────────────────────────────────────────────────
    if (result.status === "success" || result.status === "partial") {
        const count     = (result.updated                  || []).length;
        const fails     = (result.failed                   || []).length;
        const blocked   = (result.blocked                  || []).length;
        const preserved = (result.user_templates_preserved || []).length;
        const custFiles = (result.customized_files_updated || []).length;

        let msg = `✅ Updated to ${check.latest_tag}!\n${count} file(s) replaced.`;

        if (custFiles > 0)  msg += `\n\n${result.customized_files_note || `${custFiles} customized file(s) backed up.`}`;
        if (preserved > 0)  msg += `\n\n${result.user_templates_note   || `${preserved} custom template(s) moved to z_Templates/_my_templates/.`}`;
        if (blocked   > 0)  msg += `\n\n⊘ ${blocked} file(s) skipped (protected directories).`;
        if (fails     > 0)  msg += `\n\n⚠️ ${fails} file(s) failed — see developer console.`;

        if (result.old_backups_cleaned && result.old_backups_cleaned.length > 0) {
            msg += `\n\nCleaned ${result.old_backups_cleaned.length} old backup folder(s).`;
        }

        if (updateTools) msg += "\n\nCheck your Campaign Name in Homepage if it was reset.";

        new Notice(msg, 15000);

        // Reload Obsidian after a short delay so the user can read the notice
        setTimeout(() => app.commands.executeCommandById("app:reload"), 3500);

    } else {
        new Notice(`❌ Update failed: ${result.error || "Unknown error"}`, 12000);
        console.error("UpdateVault result:", result);
    }
};
