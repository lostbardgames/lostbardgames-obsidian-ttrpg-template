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
// After reload (or on any subsequent open), ensure Buttons.md is visible
// in a split pane beside Homepage. Skip silently if it is already open.
await new Promise(r => setTimeout(r, 600));

const buttonPath = "1.Tools/Buttons.md";
const buttonFile = app.vault.getAbstractFileByPath(buttonPath);
if (!buttonFile) return;

const alreadyOpen = app.workspace.getLeavesOfType("markdown")
    .some(l => l.view?.file?.path === buttonPath);
if (alreadyOpen) return;

// Remember the active leaf before splitting so we can restore focus.
// The Homepage plugin opens Homepage.md in whatever leaf is active —
// if we leave the new right-pane leaf active it will put Homepage on
// the right instead of the left.
const activeLeaf = app.workspace.getMostRecentLeaf();

const leaf = app.workspace.getLeaf("split", "vertical");
await leaf.openFile(buttonFile, { state: { mode: "preview" } });

// Restore focus to the left pane so the Homepage plugin (if it fires
// after this template) places Homepage.md on the left, not the right.
if (activeLeaf) app.workspace.setActiveLeaf(activeLeaf, { focus: true });
%>
