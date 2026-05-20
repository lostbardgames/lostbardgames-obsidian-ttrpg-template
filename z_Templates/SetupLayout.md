<%*
// Ensure Buttons.md is open in a split pane alongside Homepage.
// This runs every time the vault opens; it skips silently if Buttons is
// already visible (so returning users see no disruption).
await new Promise(r => setTimeout(r, 400));

const buttonPath = "1.Tools/Buttons.md";
const buttonFile = app.vault.getAbstractFileByPath(buttonPath);
if (!buttonFile) return;

const alreadyOpen = app.workspace.getLeavesOfType("markdown")
    .some(l => l.view?.file?.path === buttonPath);
if (alreadyOpen) return;

const leaf = app.workspace.getLeaf("split", "vertical");
await leaf.openFile(buttonFile, { state: { mode: "preview" } });
%>
