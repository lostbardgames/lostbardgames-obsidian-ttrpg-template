module.exports = async (params) => {
  const { app, quickAddApi: qa } = params;

  const ancestryName = await selectFromFolder(app, qa, "Campaign/Lore/Ancestries", "Parent Ancestry", true);
  if (ancestryName === null) return;

  const name = await qa.inputPrompt("New Heritage", "Enter heritage name...");
  if (!name) return;

  const destPath = `Campaign/Lore/Ancestries/Heritages/${name}.md`;
  if (app.vault.getAbstractFileByPath(destPath)) {
    new Notice(`"${name}" already exists!`);
    return;
  }

  const tpl = app.vault.getAbstractFileByPath("z_Templates/Lore/Template - Heritage.md");
  if (!tpl) { new Notice("Heritage template not found!"); return; }

  let content = await app.vault.read(tpl);
  if (ancestryName) content = setSingleField(content, "parentAncestry", ancestryName);

  const file = await app.vault.create(destPath, content);
  await getMainLeaf(app).openFile(file);
  new Notice(`"${name}" created!`);
};

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

function setSingleField(content, field, value) {
  return content.replace(new RegExp(`^(${field}):.*$`, "m"), `$1: "[[${value}]]"`);
}

function getMainLeaf(app) {
  return app.workspace.getLeavesOfType("markdown")
    .find(l => l.view?.file?.path !== "1.Tools/Buttons.md")
    ?? app.workspace.getLeaf();
}
