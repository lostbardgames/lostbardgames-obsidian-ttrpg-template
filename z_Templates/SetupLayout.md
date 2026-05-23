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

// ── Default split layout ──────────────────────────────────────────────────
await new Promise(r => setTimeout(r, 600));

const buttonPath   = "1.Tools/Buttons.md";
const homepagePath = "1.Tools/Homepage.md";
const buttonFile   = app.vault.getAbstractFileByPath(buttonPath);
if (!buttonFile) return;

// ── Guard against the Homepage plugin opening a duplicate tab ─────────────
// The plugin fires at an unpredictable time during startup — sometimes
// before this template, sometimes after. Register a short-lived workspace
// listener that closes any extra Homepage.md copies as soon as they appear,
// covering both cases (already open now, or opened in the next 2 seconds).
function closeDuplicateHomepages() {
    const leaves = app.workspace.getLeavesOfType("markdown")
        .filter(l => l.view?.file?.path === homepagePath);
    for (const leaf of leaves.slice(1)) leaf.detach();
}
closeDuplicateHomepages(); // handle any that already exist
const layoutRef = app.workspace.on("layout-change", closeDuplicateHomepages);
setTimeout(() => app.workspace.offref(layoutRef), 2000); // stop watching after 2 s

// ── Right-sidebar setup ───────────────────────────────────────────────────
// Walk the right split tree to collect every leaf panel currently open.
function getRightSidebarLeaves() {
    const leaves = [];
    function walk(node) {
        if (!node) return;
        if (node.view) { leaves.push(node); return; }
        (node.children || []).forEach(walk);
    }
    walk(app.workspace.rightSplit);
    return leaves;
}

const homeLeaves = app.workspace.getLeavesOfType("markdown")
    .filter(l => l.view?.file?.path === homepagePath);
const activeLeaf = homeLeaves[0] ?? app.workspace.getMostRecentLeaf();

// Step 1: Remove every right-sidebar panel that isn't Buttons or Dice Tray.
const snapshot = getRightSidebarLeaves();
for (const leaf of snapshot) {
    const isButtons = leaf.view?.file?.path === buttonPath;
    const isDice    = leaf.getViewState?.().type === "DICE_ROLLER_VIEW";
    if (!isButtons && !isDice) leaf.detach();
}

// Step 2: Close any Buttons.md copies that ended up in the main area.
for (const leaf of app.workspace.getLeavesOfType("markdown")) {
    if (leaf.view?.file?.path !== buttonPath) continue;
    let inRight = false;
    let node = leaf.parent;
    while (node) { if (node === app.workspace.rightSplit) { inRight = true; break; } node = node.parent; }
    if (!inRight) leaf.detach();
}

// Step 3: Add Buttons to the right sidebar if it's not already there.
const hasButtons = getRightSidebarLeaves().some(l => l.view?.file?.path === buttonPath);
if (!hasButtons) {
    const leaf = app.workspace.getRightLeaf(false);
    await leaf.openFile(buttonFile, { state: { mode: "preview" } });
}

// Step 4: Add Dice Tray to the right sidebar if it's not already there.
const hasDice = getRightSidebarLeaves().some(l => l.getViewState?.().type === "DICE_ROLLER_VIEW");
if (!hasDice) {
    const leaf = app.workspace.getRightLeaf(false);
    await leaf.setViewState({ type: "DICE_ROLLER_VIEW", active: false });
}

// Step 5: Expand the right sidebar and restore focus to Homepage.
if (app.workspace.rightSplit.collapsed) {
    app.workspace.rightSplit.toggle();
}

if (activeLeaf) app.workspace.setActiveLeaf(activeLeaf, { focus: true });
%>
