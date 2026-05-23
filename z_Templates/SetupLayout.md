<%*
// ── First-launch auto-reload ──────────────────────────────────────────────
// .obsidian/first-load is shipped in the vault zip. When it exists, this
// is the first run after the user trusted plugin authors. Delete the marker
// and reload so every plugin initialises cleanly with the correct layout.
const MARKER = ".obsidian/first-load";
if (await app.vault.adapter.exists(MARKER)) {
    await app.vault.adapter.remove(MARKER);
    app.commands.executeCommandById("app:reload");
    return;
}

// ── Game System Selection (first launch only) ─────────────────────────────
// Check vault-config.json. If no system is set, present the system picker
// before finishing layout setup. Uses tp.system.suggester (Templater API).
let systemAlreadyConfigured = false;
try {
    const cfgRaw = await app.vault.adapter.read("vault-config.json");
    const cfg = JSON.parse(cfgRaw);
    systemAlreadyConfigured = !!cfg.gameSystem;
} catch (_) {
    systemAlreadyConfigured = false;
}

if (!systemAlreadyConfigured) {
    // ── System definitions (kept in sync with SetupSystem.js) ────────────
    const SYSTEMS = [
        { id: "dnd5e",      name: "D&D 5th Edition (2014)",      icon: "⚔️", desc: "2014 Player's Handbook — Race, Class, Background, Spells" },
        { id: "dnd5e_2024", name: "D&D 5.5e (2024 / One D&D)",  icon: "⚔️", desc: "2024 revised rules — Species, Origin Feats, updated classes" },
        { id: "pf2e",       name: "Pathfinder 2nd Edition",      icon: "🔆", desc: "Ancestry, Heritage, Proficiency ranks, 3-action system" },
    ];

    const labels = SYSTEMS.map(s => `${s.icon}  ${s.name}  —  ${s.desc}`);

    // Show a welcome modal-style notice, then the suggester
    new Notice(
        "👋 Welcome! Select your game system to configure the vault.\n\nYou can change this later from the Vault section of Buttons.md.",
        8000
    );
    await new Promise(r => setTimeout(r, 400));

    const chosen = await tp.system.suggester(labels, SYSTEMS, true, "Select Your Game System");
    if (chosen) {
        // Load and call SetupSystem.js runSetup()
        try {
            const setupScriptFile = app.vault.getAbstractFileByPath(
                "z_Templates/Scripts/SetupSystem.js"
            );
            if (setupScriptFile) {
                const scriptContent = await app.vault.read(setupScriptFile);
                // Extract the SYSTEMS and runSetup by evaluating the module
                const mod = {};
                (new Function("module", "exports", "app", scriptContent))(
                    mod, mod, app
                );
                const runSetup = mod.exports?.runSetup || mod.runSetup;
                if (typeof runSetup === "function") {
                    // Find the matching system object in SetupSystem.js definitions
                    const sysList = mod.exports?.SYSTEMS || mod.SYSTEMS;
                    const sys = sysList?.find(s => s.id === chosen.id) || chosen;
                    await runSetup(app, null, sys, false);
                }
            }
        } catch (setupErr) {
            console.warn("[SetupLayout] system setup error:", setupErr);
            // Write config even if template copy fails
            try {
                const fallbackCfg = JSON.stringify({
                    gameSystem: chosen.id,
                    gameSystemName: chosen.name,
                    configuredAt: new Date().toISOString(),
                }, null, 2) + "\n";
                const cfgFile = app.vault.getAbstractFileByPath("vault-config.json");
                if (cfgFile) {
                    await app.vault.modify(cfgFile, fallbackCfg);
                } else {
                    await app.vault.create("vault-config.json", fallbackCfg);
                }
            } catch (_) {}
        }
    }
    // Brief pause so notices are readable before layout kicks in
    await new Promise(r => setTimeout(r, 600));
}

// ── Default split layout ──────────────────────────────────────────────────
await new Promise(r => setTimeout(r, 600));

const buttonPath   = "1.Tools/Buttons.md";
const homepagePath = "1.Tools/Homepage.md";
const buttonFile   = app.vault.getAbstractFileByPath(buttonPath);
if (!buttonFile) return;

// ── Guard against the Homepage plugin opening a duplicate tab ─────────────
function closeDuplicateHomepages() {
    const leaves = app.workspace.getLeavesOfType("markdown")
        .filter(l => l.view?.file?.path === homepagePath);
    for (const leaf of leaves.slice(1)) leaf.detach();
}
closeDuplicateHomepages();
const layoutRef = app.workspace.on("layout-change", closeDuplicateHomepages);
setTimeout(() => app.workspace.offref(layoutRef), 2000);

// ── Helpers ───────────────────────────────────────────────────────────────
function getRightLeaves() {
    const leaves = [];
    function walk(node) {
        if (!node) return;
        if (node.view) { leaves.push(node); return; }
        (node.children || []).forEach(walk);
    }
    walk(app.workspace.rightSplit);
    return leaves;
}

function isInRight(leaf) {
    let n = leaf.parent;
    while (n) { if (n === app.workspace.rightSplit) return true; n = n.parent; }
    return false;
}

const homeLeaves = app.workspace.getLeavesOfType("markdown")
    .filter(l => l.view?.file?.path === homepagePath);
const activeLeaf = homeLeaves[0] ?? app.workspace.getMostRecentLeaf();

// ── Step 1: Remove every right-sidebar panel that isn't Buttons or Dice ───
for (const leaf of getRightLeaves()) {
    const isButtons = leaf.view?.file?.path === buttonPath;
    const isDice    = leaf.getViewState?.().type === "DICE_ROLLER_VIEW";
    if (!isButtons && !isDice) leaf.detach();
}

// ── Step 2: Close any Buttons.md copies in the main editing area ──────────
for (const leaf of app.workspace.getLeavesOfType("markdown")) {
    if (leaf.view?.file?.path === buttonPath && !isInRight(leaf)) leaf.detach();
}

// ── Step 3: Ensure Buttons is in the right sidebar ────────────────────────
let buttonsLeaf = getRightLeaves().find(l => l.view?.file?.path === buttonPath);
if (!buttonsLeaf) {
    buttonsLeaf = app.workspace.getRightLeaf(false);
    await buttonsLeaf.openFile(buttonFile, { state: { mode: "preview" } });
}

// ── Step 4: Ensure Dice Tray is in the right sidebar ─────────────────────
let diceLeaf = getRightLeaves().find(l => l.getViewState?.().type === "DICE_ROLLER_VIEW");
if (!diceLeaf) {
    const candidate = app.workspace.getRightLeaf(false);
    if (candidate === buttonsLeaf) {
        diceLeaf = app.workspace.createLeafBySplit(buttonsLeaf, "vertical", false);
    } else {
        diceLeaf = candidate;
    }
    await diceLeaf.setViewState({ type: "DICE_ROLLER_VIEW", active: false });
}

// ── Step 5: Enforce order — Buttons tab 0, Dice Tray tab 1 ───────────────
const rightTabs = app.workspace.rightSplit?.children?.[0];
if (rightTabs?.children && buttonsLeaf && diceLeaf) {
    const tabs = rightTabs.children;
    const bIdx = tabs.indexOf(buttonsLeaf);
    if (bIdx !== -1 && bIdx !== 0) {
        tabs.splice(bIdx, 1);
        tabs.unshift(buttonsLeaf);
    }
    rightTabs.currentTab = 0;
    app.workspace.trigger("layout-change");
}

// ── Step 6: Expand right sidebar and restore focus to Homepage ────────────
if (app.workspace.rightSplit.collapsed) {
    app.workspace.rightSplit.toggle();
}

if (activeLeaf) app.workspace.setActiveLeaf(activeLeaf, { focus: true });
%>
