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
function closeDuplicateHomepages() {
    const leaves = app.workspace.getLeavesOfType("markdown")
        .filter(l => l.view?.file?.path === homepagePath);
    for (const leaf of leaves.slice(1)) leaf.detach();
}
closeDuplicateHomepages();
const layoutRef = app.workspace.on("layout-change", closeDuplicateHomepages);
setTimeout(() => app.workspace.offref(layoutRef), 2000);

// ── Helpers ───────────────────────────────────────────────────────────────
// Walk the right-split tree and return every leaf panel in it.
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

// Returns true if a leaf lives inside the right sidebar.
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
    // getRightLeaf(false) may return the existing Buttons leaf — guard against that.
    const candidate = app.workspace.getRightLeaf(false);
    if (candidate === buttonsLeaf) {
        // Force a genuinely new tab by splitting then collapsing the split into tabs.
        diceLeaf = app.workspace.createLeafBySplit(buttonsLeaf, "vertical", false);
    } else {
        diceLeaf = candidate;
    }
    await diceLeaf.setViewState({ type: "DICE_ROLLER_VIEW", active: false });
}

// ── Step 5: Enforce order — Buttons tab 0, Dice Tray tab 1 ───────────────
// The WorkspaceTabs container is the first child of the right split.
const rightTabs = app.workspace.rightSplit?.children?.[0];
if (rightTabs?.children && buttonsLeaf && diceLeaf) {
    const tabs = rightTabs.children;
    const bIdx = tabs.indexOf(buttonsLeaf);
    const dIdx = tabs.indexOf(diceLeaf);
    if (bIdx !== -1 && dIdx !== -1 && bIdx !== 0) {
        // Splice Buttons to the front.
        tabs.splice(bIdx, 1);
        tabs.unshift(buttonsLeaf);
    }
    // Activate Buttons as the selected tab.
    rightTabs.currentTab = 0;
    app.workspace.trigger("layout-change");
}

// ── Step 6: Expand right sidebar and restore focus to Homepage ────────────
if (app.workspace.rightSplit.collapsed) {
    app.workspace.rightSplit.toggle();
}

if (activeLeaf) app.workspace.setActiveLeaf(activeLeaf, { focus: true });
%>
