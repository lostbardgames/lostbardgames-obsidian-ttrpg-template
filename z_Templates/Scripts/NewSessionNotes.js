module.exports = async (params) => {
  const { app, quickAddApi: qa } = params;

  const partyName = await selectFromFolder(app, qa, "Campaign/Parties/Party Dashboards", "Party", true);
  if (partyName === null) return;

  const sessionNum = getNextSessionNumber(app, partyName);

  const name = await qa.inputPrompt("New Session Notes", `Enter session title (e.g. Session ${sessionNum})...`);
  if (!name) return;

  // Save into party-specific subfolder so the dashboard query is scoped per party
  const subfolder = partyName
    ? `Campaign/Parties/Session Notes/${partyName}`
    : `Campaign/Parties/Session Notes`;
  const destPath = `${subfolder}/${name}.md`;

  if (app.vault.getAbstractFileByPath(destPath)) {
    new Notice(`"${name}" already exists!`);
    return;
  }

  // Ensure the party subfolder exists
  if (partyName && !app.vault.getAbstractFileByPath(subfolder)) {
    await app.vault.createFolder(subfolder).catch(() => {});
  }

  const tpl = app.vault.getAbstractFileByPath("z_Templates/Story/Template - Session Notes.md");
  if (!tpl) { new Notice("Session Notes template not found!"); return; }

  let content = await app.vault.read(tpl);
  if (partyName) content = setListField(content, "whichParty", partyName);
  content = content.replace(/^sessionNumber:.*$/m, `sessionNumber: ${sessionNum}`);

  const today = new Date().toISOString().split("T")[0];
  content = content.replace(/^sessionDate:.*$/m, `sessionDate: ${today}`);

  const file = await app.vault.create(destPath, content);
  await getMainLeaf(app).openFile(file);
  new Notice(`"${name}" created (Session ${sessionNum})!`);
};

function getNextSessionNumber(app, partyName) {
  // Count sessions across both the party subfolder and the flat root
  let count = 0;
  const roots = partyName
    ? [`Campaign/Parties/Session Notes/${partyName}`, "Campaign/Parties/Session Notes"]
    : ["Campaign/Parties/Session Notes"];
  for (const root of roots) {
    const folder = app.vault.getAbstractFileByPath(root);
    if (folder?.children) {
      count += folder.children.filter(f => !("children" in f) && f.extension === "md").length;
    }
  }
  return count + 1;
}

async function selectFromFolder(app, qa, folderPath, label, allowSkip = false) {
  const folder = app.vault.getAbstractFileByPath(folderPath);
  const existing = (folder?.children || [])
    .filter(f => !("children" in f) && f.extension === "md")
    .map(f => f.basename);
  const SKIP = "[ None / Skip ]";
  const NEW = "＋ Enter New Name";
  const opts = [...existing];
  if (allowSkip) opts.push(SKIP);
  opts.push(NEW);
  const choice = await qa.suggester(opts, opts);
  if (!choice) return null;
  if (choice === SKIP) return "";
  if (choice === NEW) {
    const n = await qa.inputPrompt(`${label} Name`, "Enter name...");
    return n || null;
  }
  return choice;
}

function setListField(content, field, value) {
  return content.replace(new RegExp(`^${field}:.*$`, "m"), `${field}:\n  - "[[${value}]]"`);
}

// Opens a file in the main pane rather than the Buttons panel.
// Finds the first markdown leaf that isn't Buttons.md; falls back to
// whatever leaf Obsidian would pick by default.
function getMainLeaf(app) {
  return app.workspace.getLeavesOfType("markdown")
    .find(l => l.view?.file?.path !== "1.Tools/Buttons.md")
    ?? app.workspace.getLeaf();
}
