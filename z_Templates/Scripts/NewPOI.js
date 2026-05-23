module.exports = async (params) => {
  const { app, quickAddApi: qa } = params;

  const poiFolders = [
    { path: "Campaign/Regions",     type: "Region" },
    { path: "Campaign/Settlements", type: "Settlement" },
    { path: "Campaign/Districts",   type: "District" },
    { path: "Campaign/Areas",       type: "Area" },
  ];
  const locationName = await selectParentLocation(app, qa, poiFolders, "Parent Location");
  if (locationName === null) return;

  const name = await qa.inputPrompt("New Point of Interest", "Enter POI name...");
  if (!name) return;

  const destPath = `Campaign/POIs/${name}.md`;
  if (app.vault.getAbstractFileByPath(destPath)) {
    new Notice(`"${name}" already exists!`);
    return;
  }

  const tpl = app.vault.getAbstractFileByPath("z_Templates/Locations/Template - Point of Interest.md");
  if (!tpl) { new Notice("POI template not found!"); return; }

  let content = await app.vault.read(tpl);
  if (locationName) {
    content = setSingleField(content, "location", locationName);
    content = setListField(content, "currentLocation", locationName);
  }

  const file = await app.vault.create(destPath, content);
  await getMainLeaf(app).openFile(file);
  new Notice(`"${name}" created!`);
};

async function selectParentLocation(app, qa, locationFolders, promptTitle) {
  const existing = [];
  for (const { path, type } of locationFolders) {
    const folder = app.vault.getAbstractFileByPath(path);
    if (folder?.children) {
      const group = folder.children
        .filter(f => !("children" in f) && f.extension === "md")
        .map(f => ({ display: `${f.basename}  [${type}]`, value: f.basename }));
      group.sort((a, b) => a.value.localeCompare(b.value));
      existing.push(...group);
    }
  }
  const SKIP = "[ None / Skip ]";
  const NEW = "＋ Enter New Name";
  const displays = [...existing.map(e => e.display), SKIP, NEW];
  const choice = await qa.suggester(displays, displays);
  if (!choice) return null;
  if (choice === SKIP) return "";
  if (choice === NEW) {
    const n = await qa.inputPrompt(promptTitle || "Parent Location Name", "Enter location name...");
    return n || null;
  }
  const found = existing.find(e => e.display === choice);
  return found ? found.value : null;
}

function setSingleField(content, field, value) {
  return content.replace(new RegExp(`^(${field}):.*$`, "m"), `$1: "[[${value}]]"`);
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
