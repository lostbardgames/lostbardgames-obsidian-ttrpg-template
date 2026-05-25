// NewCharacterType.js
// System-aware "New Race / Species / Ancestry" creator.
// Reads vault-config.json to route to the correct template and folder.

module.exports = async (params) => {
  const { app, quickAddApi: qa } = params;

  let systemId = "dnd5e";
  try {
    const cfg = JSON.parse(await app.vault.adapter.read("vault-config.json"));
    systemId = cfg.gameSystem || "dnd5e";
  } catch (_) {}

  const configs = {
    dnd5e:      { template: "z_Templates/Lore/Template - Race.md",     folder: "Campaign/Lore/Races",       label: "Race" },
    dnd5e_2024: { template: "z_Templates/Lore/Template - Race.md",     folder: "Campaign/Lore/Species",     label: "Species" },
    pf2e:       { template: "z_Templates/Lore/Template - Ancestry.md", folder: "Campaign/Lore/Ancestries",  label: "Ancestry" },
  };

  const config = configs[systemId] || configs["dnd5e"];

  const name = await qa.inputPrompt(`New ${config.label}`, `Enter ${config.label.toLowerCase()} name...`);
  if (!name) return;

  const destPath = `${config.folder}/${name}.md`;
  if (app.vault.getAbstractFileByPath(destPath)) {
    new Notice(`"${name}" already exists!`);
    return;
  }

  const tpl = app.vault.getAbstractFileByPath(config.template);
  if (!tpl) { new Notice(`${config.label} template not found!`); return; }

  const content = await app.vault.read(tpl);
  const file = await app.vault.create(destPath, content);
  await getMainLeaf(app).openFile(file);
  new Notice(`"${name}" created!`);
};

function getMainLeaf(app) {
  return app.workspace.getLeavesOfType("markdown")
    .find(l => l.view?.file?.path !== "1.Tools/Buttons.md")
    ?? app.workspace.getLeaf();
}
