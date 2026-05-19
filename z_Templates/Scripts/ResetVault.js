const IMPORTS_ONLY  = "Imported Data Only — delete 5e.tools imports, keep campaign";
const CAMPAIGN_ONLY = "Campaign Data Only — preserve 5e.tools imports";
const FULL_RESET    = "Full Reset — delete everything including 5e.tools imports";

const CAMPAIGN_FOLDERS = [
  "Campaign/Characters/Players",
  "Campaign/Characters/NPCs",
  "Campaign/Organizations",
  "Campaign/Worlds",
  "Campaign/Regions",
  "Campaign/Settlements",
  "Campaign/Districts",
  "Campaign/Areas",
  "Campaign/POIs",
  "Campaign/Planes",
  "Campaign/Parties/Adventures",
  "Campaign/Parties/Quests",
  "Campaign/Parties/Session Notes",
  "Campaign/Parties/Encounters",
  "Campaign/Parties/Service Requests",
  "Campaign/Parties/Party Dashboards",
  "Campaign/Parties/Journey Boards",
  "Campaign/Lore/Events",
];

const IMPORT_FOLDERS = [
  "Campaign/Characters/Deities",
  "Campaign/Lore/Classes",
  "Campaign/Lore/Feats",
  "Campaign/Lore/Classes/Features",
  "Campaign/Lore/Races",
  "Campaign/Lore/Races/Traits",
  "Campaign/Lore/Backgrounds",
  "Campaign/Lore/Backgrounds/Features",
  "Campaign/Lore/Conditions",
  "Campaign/Lore/Languages",
  "Campaign/Lore/Optional Features",
  "Campaign/Possessions/Spells",
  "Campaign/Possessions/Items",
];

module.exports = async (params) => {
  const { app, quickAddApi: qa } = params;

  const mode = await qa.suggester(
    [IMPORTS_ONLY, CAMPAIGN_ONLY, FULL_RESET],
    [IMPORTS_ONLY, CAMPAIGN_ONLY, FULL_RESET]
  );
  if (!mode) return;

  const isFull        = mode === FULL_RESET;
  const isImportsOnly = mode === IMPORTS_ONLY;

  const warning = isFull
    ? "This will delete ALL notes in the vault — campaign data AND all 5e.tools imports (spells, items, classes, feats, races, deities, etc.). The vault will be completely empty."
    : isImportsOnly
      ? "This will delete all 5e.tools imported data: spells, items, classes, races, feats, backgrounds, languages, deities, conditions, and optional features. Your campaign notes will be preserved."
      : "This will delete all campaign data: parties, characters, sessions, quests, locations, organizations, and encounters. 5e.tools imported data will be preserved.";

  const confirm1 = await qa.yesNoPrompt("⚠️ Reset Vault — Are you sure?", warning);
  if (!confirm1) return;

  const confirm2 = await qa.yesNoPrompt(
    "⚠️ Final Confirmation",
    `${isFull ? "ALL vault data" : isImportsOnly ? "All imported 5e.tools data" : "All campaign notes"} will be PERMANENTLY deleted and cannot be recovered. Type RESET in the next prompt to proceed.`
  );
  if (!confirm2) return;

  const typed = await qa.inputPrompt("Type RESET to confirm", "");
  if (typed?.trim().toUpperCase() !== "RESET") {
    new Notice("Reset cancelled.");
    return;
  }

  let deleted = 0;

  // Persistent progress notice — updated as each step completes
  const progress = new Notice("🗑️ Starting reset…", 0);
  const setProgress = (msg) => progress.noticeEl.setText(msg);

  const campaignFolders = !isImportsOnly ? CAMPAIGN_FOLDERS : [];
  const importFolders   = (isFull || isImportsOnly) ? IMPORT_FOLDERS : [];
  const allFolders      = [...campaignFolders, ...importFolders];
  const total           = allFolders.length + 1; // +1 for party databases step
  let   step            = 0;

  for (const folderPath of campaignFolders) {
    step++;
    setProgress(`🗑️ Deleting ${folderPath.split("/").pop()}… (${step}/${total})`);
    deleted += await emptyFolder(app, folderPath);
  }

  for (const folderPath of importFolders) {
    step++;
    setProgress(`🗑️ Deleting ${folderPath.split("/").pop()}… (${step}/${total})`);
    deleted += await emptyFolder(app, folderPath);
  }

  step++;
  setProgress(`🗑️ Clearing party databases… (${step}/${total})`);
  deleted += await clearPartyDatabases(app, isFull);

  if (!isImportsOnly) {
    setProgress("🗑️ Resetting page properties…");
    await resetPageProperties(app, "1.Tools/Homepage.md");
    await resetPageProperties(app, "1.Tools/GM Screen.md");
  }

  progress.hide();

  const label = isFull ? "Full vault reset" : isImportsOnly ? "Imported data reset" : "Campaign reset";
  new Notice(`✅ ${label} complete. ${deleted} file(s) deleted. Reloading…`);

  setTimeout(() => app.commands.executeCommandById("app:reload"), 1500);
};

async function emptyFolder(app, folderPath) {
  const folder = app.vault.getAbstractFileByPath(folderPath);
  if (!folder || !("children" in folder)) return 0;
  let count = 0;
  for (const child of [...folder.children]) {
    try {
      await app.vault.delete(child, true);
      count++;
      // yield every 10 deletions so the UI can update the progress notice
      if (count % 10 === 0) await new Promise(r => setTimeout(r, 0));
    } catch (e) {
      console.warn(`ResetVault: could not delete ${child.path}`, e);
    }
  }
  return count;
}

async function clearPartyDatabases(app, deleteAll = false) {
  const folder = app.vault.getAbstractFileByPath("z_Databases/Party");
  if (!folder?.children) return 0;
  let count = 0;
  for (const child of [...folder.children]) {
    if ("children" in child) {
      // Party-specific subfolders — always remove
      try {
        await app.vault.delete(child, true);
        count++;
      } catch (e) {
        console.warn(`ResetVault: could not delete ${child.path}`, e);
      }
    } else if (deleteAll) {
      // Full reset also removes the root template .base files
      try {
        await app.vault.delete(child, true);
        count++;
      } catch (e) {
        console.warn(`ResetVault: could not delete ${child.path}`, e);
      }
    }
  }
  return count;
}

async function resetPageProperties(app, filePath) {
  const file = app.vault.getAbstractFileByPath(filePath);
  if (!file || "children" in file) return;
  try {
    let content = await app.vault.read(file);
    content = content.replace(/^campaignName:.*$/m, "campaignName: My Campaign");
    content = content.replace(/^activeParty:.*$/m, "activeParty:");
    content = content.replace(/^currentSession:.*$/m, "currentSession:");
    await app.vault.modify(file, content);
  } catch (e) {
    console.warn(`ResetVault: could not reset properties in ${filePath}`, e);
  }
}
