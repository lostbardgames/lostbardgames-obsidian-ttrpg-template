module.exports = async (params) => {
  const { app, quickAddApi: qa } = params;

  const partyName = await qa.inputPrompt("New Party", "Enter party name...");
  if (!partyName) return;

  const dashboardPath = `Campaign/Parties/Party Dashboards/${partyName}.md`;

  const existingDashboard = app.vault.getAbstractFileByPath(dashboardPath);
  if (existingDashboard) {
    new Notice(`Party "${partyName}" already exists.`);
    await getMainLeaf(app).openFile(existingDashboard);
    return;
  }

  // partyN drives partyID and the relation field name (party1Relation, party2Relation…)
  const partyN = getNextPartyNumber(app);
  const dbFolderPath = `z_Databases/Party/${partyName}`;

  await createFolderSafe(app, `Campaign/Characters/Players/${partyName}`);
  await createFolderSafe(app, dbFolderPath);

  // Copy shared bases from vault templates
  await copyBase(
    app,
    "z_Templates/Characters/Database - Party Members.base",
    `${dbFolderPath}/Database - Party Members.base`
  );
  await copyBase(
    app,
    "z_Templates/Characters/Database - Story.base",
    `${dbFolderPath}/Database - Story.base`
  );

  // Relations base is generated from an inline template so there is no
  // external source file that can go missing.
  const relationsContent = buildRelationsBase(`party${partyN}Relation`, partyName);
  await app.vault.create(
    `${dbFolderPath}/Database - ${partyName} Relations.base`,
    relationsContent
  );

  // Build dashboard: template uses "Party 1" as a placeholder.
  // Replacing it with partyName fixes all three embed paths at once.
  const templateFile = app.vault.getAbstractFileByPath(
    "z_Templates/Characters/Template - Party Dashboard.md"
  );
  if (!templateFile) {
    new Notice("Party Dashboard template not found!");
    return;
  }

  let content = await app.vault.read(templateFile);
  content = content.replaceAll("Party 1", partyName);
  content = content.replace(/^partyID:\s*$/m, `partyID: ${partyN}`);

  const dashboardFile = await app.vault.create(dashboardPath, content);

  // Update Homepage activeParty to the new party
  const homepage = app.vault.getAbstractFileByPath("1.Tools/Homepage.md");
  if (homepage) {
    await app.fileManager.processFrontMatter(homepage, (fm) => {
      fm.activeParty = partyName;
    });
  }

  await getMainLeaf(app).openFile(dashboardFile);
  new Notice(`Party "${partyName}" created (ID: ${partyN})!`);
};

// ── helpers ───────────────────────────────────────────────────────────────────

function getNextPartyNumber(app) {
  const folder = app.vault.getAbstractFileByPath("Campaign/Parties/Party Dashboards");
  if (!folder || !folder.children) return 1;
  const count = folder.children.filter(
    (f) => !("children" in f) && f.extension === "md"
  ).length;
  return count + 1;
}

async function createFolderSafe(app, path) {
  try { await app.vault.createFolder(path); } catch (_) {}
}

async function copyBase(app, srcPath, destPath) {
  const src = app.vault.getAbstractFileByPath(srcPath);
  if (!src) { new Notice(`Base template not found: ${srcPath}`); return; }
  const content = await app.vault.read(src);
  await app.vault.create(destPath, content);
}

// Builds the Relations base YAML with the correct party relation field name.
function buildRelationsBase(relationField, partyName) {
  return `properties:
  file.name:
    displayName: Name
  property.aliases:
    displayName: Aliases
  property.organization:
    displayName: Organizations
  property.religions:
    displayName: Religions
  property.currentLocation:
    displayName: Location
  property.occupation:
    displayName: Occupations
views:
  - type: cards
    name: Family
    filters:
      and:
        - file.inFolder("Campaign/Characters")
        - ${relationField}.contains("Family")
        - or:
            - '!condition.contains("Dead")'
            - condition.isEmpty()
    order:
      - file.name
      - aliases
      - currentLocation
    columnSize:
      file.name: 140
      property.aliases: 190
      property.organization: 234
      property.religions: 147
      property.currentLocation: 203
    image: note.art
    cardSize: 100
  - type: cards
    name: Allies
    filters:
      and:
        - file.inFolder("Campaign/Characters")
        - ${relationField}.contains("Ally")
        - or:
            - '!condition.contains("Dead")'
            - condition.isEmpty()
    order:
      - file.name
      - aliases
      - currentLocation
    columnSize:
      file.name: 140
      property.aliases: 190
      property.organization: 234
      property.religions: 147
      property.currentLocation: 203
    image: note.art
    cardSize: 100
  - type: cards
    name: Friends
    filters:
      and:
        - file.inFolder("Campaign/Characters")
        - ${relationField}.contains("Friend")
        - or:
            - '!condition.contains("Dead")'
            - condition.isEmpty()
    order:
      - file.name
      - aliases
      - currentLocation
    columnSize:
      file.name: 140
      property.aliases: 190
      property.organization: 234
      property.religions: 147
      property.currentLocation: 203
    image: note.art
    cardSize: 100
  - type: cards
    name: Enemy
    filters:
      and:
        - file.inFolder("Campaign/Characters")
        - ${relationField}.contains("Enemy")
        - or:
            - '!condition.contains("Dead")'
            - condition.isEmpty()
    order:
      - file.name
      - aliases
      - currentLocation
    columnSize:
      file.name: 140
      property.aliases: 190
      property.organization: 234
      property.religions: 147
      property.currentLocation: 203
    image: note.art
    cardSize: 100
  - type: cards
    name: All
    filters:
      and:
        - file.inFolder("Campaign/Characters")
        - or:
            - '!condition.contains("Dead")'
            - condition.isEmpty()
        - '!file.tags.contains("Player")'
        - whichParty.contains("[[${partyName}]]")
    order:
      - file.name
      - aliases
      - currentLocation
    columnSize:
      file.name: 140
      property.aliases: 190
      property.organization: 234
      property.religions: 147
      property.currentLocation: 203
    image: note.art
    cardSize: 100
`;
}

// Opens a file in the main pane rather than the Buttons panel.
// Finds the first markdown leaf that isn't Buttons.md; falls back to
// whatever leaf Obsidian would pick by default.
function getMainLeaf(app) {
  return app.workspace.getLeavesOfType("markdown")
    .find(l => l.view?.file?.path !== "1.Tools/Buttons.md")
    ?? app.workspace.getLeaf();
}
