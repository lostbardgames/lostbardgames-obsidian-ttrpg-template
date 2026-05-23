// ── Config ────────────────────────────────────────────────────────────────────

const PYTHON_SCRIPT = "UpdateVault.py"; // relative to vault root

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Detect the correct Python 3 executable for the current OS.
 * Windows uses "python" (or "py"); macOS/Linux use "python3".
 * Returns null if no Python 3 is found.
 */
async function detectPython() {
    // On Windows "python3" triggers the Microsoft Store stub — try "python" first.
    const candidates = process.platform === "win32"
        ? ["python", "py", "python3"]
        : ["python3", "python"];

    for (const cmd of candidates) {
        const found = await checkPython3(cmd);
        if (found) return cmd;
    }
    return null;
}

function checkPython3(cmd) {
    return new Promise((resolve) => {
        const { exec } = require("child_process");
        exec(`"${cmd}" --version`, { timeout: 8000 }, (err, stdout, stderr) => {
            // Python 3 prints "Python 3.x.y" to stdout (or stderr on older builds)
            const output = (stdout + stderr).trim();
            resolve(!err && /Python 3\./.test(output) ? cmd : null);
        });
    });
}

function commandExists(cmd) {
    return new Promise((resolve) => {
        const { exec } = require("child_process");
        const check = process.platform === "win32" ? `where ${cmd}` : `which ${cmd}`;
        exec(check, { timeout: 5000 }, (err) => resolve(!err));
    });
}

function runCommand(command, timeout = 120000) {
    return new Promise((resolve, reject) => {
        const { exec } = require("child_process");
        exec(command, { timeout }, (err, stdout, stderr) => {
            if (err) reject(new Error(stderr?.trim() || err.message));
            else resolve({ stdout, stderr });
        });
    });
}

async function handleMissingPython(qa) {
    const platform = process.platform;
    const options  = [];

    if (platform === "darwin") {
        const hasBrew = await commandExists("brew");
        if (hasBrew) {
            options.push({ label: "Install via Homebrew (recommended)", action: async () => {
                const notice = new Notice("⏳ Installing Python 3 via Homebrew… this may take a few minutes.", 0);
                try {
                    await runCommand("brew install python3", 300000);
                    notice.hide();
                    new Notice("✅ Python 3 installed. Retrying update check…", 5000);
                    return await detectPython();
                } catch (e) {
                    notice.hide();
                    new Notice(`❌ Homebrew install failed:\n${e.message}\n\nTry installing manually from python.org.`, 10000);
                    return null;
                }
            }});
        } else {
            options.push({ label: "Install Homebrew + Python", action: async (qa) => {
                const confirm = await qa.yesNoPrompt(
                    "Install Homebrew?",
                    "This will open a Terminal window to install Homebrew and Python 3. Your system password may be required. Continue?"
                );
                if (!confirm) return null;
                const { exec } = require("child_process");
                exec(`osascript -e 'tell application "Terminal" to do script "/bin/bash -c \\"$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\\" && brew install python3"'`);
                new Notice("⏳ Homebrew installer opened in Terminal.\n\nFollow the prompts there, then click Check for Updates again.", 12000);
                return null;
            }});
        }
        options.push({ label: "Open python.org download page", action: () => {
            require("electron").shell.openExternal("https://www.python.org/downloads/");
            new Notice("🌐 Opening python.org.\n\nAfter installing Python 3, restart Obsidian and click Check for Updates again.", 10000);
            return null;
        }});
    } else if (platform === "win32") {
        const hasWinget = await commandExists("winget");
        if (hasWinget) {
            options.push({ label: "Install via winget (recommended)", action: async () => {
                const notice = new Notice("⏳ Installing Python 3 via winget… this may take a few minutes.", 0);
                // winget requires the minor version in the package ID (e.g. Python.Python.3.13).
                // Try versions newest-first so this stays current as Python releases new versions.
                const versions = ["3.13", "3.12", "3.11", "3.10"];
                let installed = false;
                for (const v of versions) {
                    try {
                        await runCommand(`winget install --id Python.Python.${v} --source winget --silent`, 300000);
                        installed = true;
                        break;
                    } catch (_) { /* try next version */ }
                }
                notice.hide();
                if (installed) {
                    new Notice("✅ Python 3 installed. You may need to restart Obsidian for the PATH to update.", 8000);
                    return await detectPython();
                } else {
                    new Notice("❌ winget install failed for all Python versions.\n\nTry installing manually from python.org.", 10000);
                    return null;
                }
            }});
        }
        options.push({ label: "Open python.org download page", action: () => {
            require("electron").shell.openExternal("https://www.python.org/downloads/");
            new Notice("🌐 Opening python.org.\n\nInstall Python 3 and check \"Add Python to PATH\", then restart Obsidian and click Check for Updates again.", 12000);
            return null;
        }});
    } else {
        options.push({ label: "Open python.org download page", action: () => {
            require("electron").shell.openExternal("https://www.python.org/downloads/");
            new Notice("🌐 Opening python.org.\n\nAfter installing Python 3, restart Obsidian and click Check for Updates again.", 10000);
            return null;
        }});
    }

    options.push({ label: "Cancel", action: null });

    const labels = options.map(o => o.label);
    const choice = await qa.suggester(labels, labels);
    if (!choice || choice === "Cancel") return null;

    const selected = options.find(o => o.label === choice);
    return selected?.action ? await selected.action(qa) : null;
}

/**
 * Run UpdateVault.py and return the parsed JSON result.
 * Progress lines emitted to stderr are silently consumed.
 * Throws if the process errors or produces no JSON.
 */
async function runPython(vaultPath, args, python) {
    const { exec }      = require("child_process");
    const { promisify } = require("util");
    const path          = require("path");
    const execAsync     = promisify(exec);

    const scriptPath = path.join(vaultPath, PYTHON_SCRIPT);
    const quotedArgs = args
        .map(a => `"${String(a).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`)
        .join(" ");
    const cmd = `"${python}" "${scriptPath}" ${quotedArgs}`;

    const { stdout } = await execAsync(cmd, { maxBuffer: 10 * 1024 * 1024 });

    // The last non-empty stdout line is always the JSON result
    const lines = stdout.trim().split("\n").filter(Boolean);
    return JSON.parse(lines[lines.length - 1]);
}

// ── Main ───────────────────────────────────────────────────────────────────────

module.exports = async (params) => {
    const { app, quickAddApi: qa } = params;
    const vaultPath = app.vault.adapter.basePath;

    // ── Detect Python once ────────────────────────────────────────────────────
    let python = await detectPython();
    if (!python) {
        python = await handleMissingPython(qa);
        if (!python) return;
    }

    // ── Step A: Check for updates ─────────────────────────────────────────────
    new Notice("Checking for updates…");

    let check;
    try {
        // Single arg: vault_path. Python reads version.json and fetches GitHub.
        check = await runPython(vaultPath, [vaultPath], python);
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
        ], python);
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
