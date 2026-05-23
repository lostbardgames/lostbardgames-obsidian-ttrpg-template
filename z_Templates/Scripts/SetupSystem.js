// ── SetupSystem.js ────────────────────────────────────────────────────────────
// Game system configuration script for the LBG TTRPG GM Template.
// Can be called from SetupLayout.md on first launch, or run manually
// from Buttons.md to reconfigure the vault for a different game system.
// ─────────────────────────────────────────────────────────────────────────────

// ── System Definitions ────────────────────────────────────────────────────────

const SYSTEMS = [
    {
        id: "dnd5e",
        name: "D&D 5th Edition (2014)",
        description: "Dungeons & Dragons 5e — 2014 Player's Handbook rules",
        icon: "⚔️",
        pcTemplate: "z_Templates/Systems/dnd5e/Template - Player Character.md",
        loreFolders: [
            "Campaign/Lore/Races",
            "Campaign/Lore/Classes",
            "Campaign/Lore/Classes/Subclasses",
            "Campaign/Lore/Classes/Features",
            "Campaign/Lore/Backgrounds",
            "Campaign/Lore/Feats",
            "Campaign/Lore/Optional Features",
            "Campaign/Lore/Conditions",
            "Campaign/Lore/Languages",
            "Campaign/Lore/Events",
        ],
        loreButtonsId: "dnd5e",
        importButtons: ["5etools", "dndbeyond"],
        characterTypeLabel: "Race",
        classLabel: "Class",
    },
    {
        id: "dnd5e_2024",
        name: "D&D 5.5e (2024 / One D&D)",
        description: "Dungeons & Dragons 5e — 2024 revised rules with Species & Origin Feats",
        icon: "⚔️",
        pcTemplate: "z_Templates/Systems/dnd5e_2024/Template - Player Character.md",
        loreFolders: [
            "Campaign/Lore/Species",
            "Campaign/Lore/Classes",
            "Campaign/Lore/Classes/Subclasses",
            "Campaign/Lore/Classes/Features",
            "Campaign/Lore/Backgrounds",
            "Campaign/Lore/Feats",
            "Campaign/Lore/Conditions",
            "Campaign/Lore/Languages",
            "Campaign/Lore/Events",
        ],
        loreButtonsId: "dnd5e_2024",
        importButtons: ["5etools", "dndbeyond"],
        characterTypeLabel: "Species",
        classLabel: "Class",
    },
    {
        id: "pf2e",
        name: "Pathfinder 2nd Edition",
        description: "Pathfinder 2e — Ancestries, Heritages, Proficiency ranks, and Actions",
        icon: "🔆",
        pcTemplate: "z_Templates/Systems/pf2e/Template - Player Character.md",
        loreFolders: [
            "Campaign/Lore/Ancestries",
            "Campaign/Lore/Ancestries/Heritages",
            "Campaign/Lore/Classes",
            "Campaign/Lore/Classes/Subclasses",
            "Campaign/Lore/Classes/Features",
            "Campaign/Lore/Backgrounds",
            "Campaign/Lore/Feats",
            "Campaign/Lore/Actions",
            "Campaign/Lore/Conditions",
            "Campaign/Lore/Languages",
            "Campaign/Lore/Events",
        ],
        loreButtonsId: "pf2e",
        importButtons: ["pf2etools"],
        characterTypeLabel: "Ancestry",
        classLabel: "Class",
    },
];

// ── Lore Section Buttons (per system) ─────────────────────────────────────────

function buildLoreSection(systemId) {
    const sections = {
        agnostic: `## 📖 Lore

> [!column|2 no-t]
>
> > [!note|no-t]
> >
> > \`\`\`meta-bind-button
> > label: "New Condition"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000019
> > \`\`\`
> >
> > \`\`\`meta-bind-button
> > label: "New Event"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000020
> > \`\`\`
>
> > [!note|no-t]
> >
> > \`\`\`meta-bind-button
> > label: "New Language"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000021
> > \`\`\``,

        dnd5e: `## 📖 Lore

> [!column|3 no-t]
>
> > [!note|no-t]
> >
> > \`\`\`meta-bind-button
> > label: "New Class"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000014
> > \`\`\`
> >
> > \`\`\`meta-bind-button
> > label: "New Subclass"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000015
> > \`\`\`
> >
> > \`\`\`meta-bind-button
> > label: "New Race"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000016
> > \`\`\`
>
> > [!note|no-t]
> >
> > \`\`\`meta-bind-button
> > label: "New Background"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000017
> > \`\`\`
> >
> > \`\`\`meta-bind-button
> > label: "New Feat"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000018
> > \`\`\`
> >
> > \`\`\`meta-bind-button
> > label: "New Condition"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000019
> > \`\`\`
>
> > [!note|no-t]
> >
> > \`\`\`meta-bind-button
> > label: "New Event"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000020
> > \`\`\`
> >
> > \`\`\`meta-bind-button
> > label: "New Language"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000021
> > \`\`\`
> >
> > \`\`\`meta-bind-button
> > label: "New Optional Feature"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000022
> > \`\`\``,

        dnd5e_2024: `## 📖 Lore

> [!column|3 no-t]
>
> > [!note|no-t]
> >
> > \`\`\`meta-bind-button
> > label: "New Class"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000014
> > \`\`\`
> >
> > \`\`\`meta-bind-button
> > label: "New Subclass"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000015
> > \`\`\`
> >
> > \`\`\`meta-bind-button
> > label: "New Species"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000016
> > \`\`\`
>
> > [!note|no-t]
> >
> > \`\`\`meta-bind-button
> > label: "New Background"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000017
> > \`\`\`
> >
> > \`\`\`meta-bind-button
> > label: "New Feat"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000018
> > \`\`\`
> >
> > \`\`\`meta-bind-button
> > label: "New Condition"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000019
> > \`\`\`
>
> > [!note|no-t]
> >
> > \`\`\`meta-bind-button
> > label: "New Event"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000020
> > \`\`\`
> >
> > \`\`\`meta-bind-button
> > label: "New Language"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000021
> > \`\`\``,

        pf2e: `## 📖 Lore

> [!column|3 no-t]
>
> > [!note|no-t]
> >
> > \`\`\`meta-bind-button
> > label: "New Class"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000014
> > \`\`\`
> >
> > \`\`\`meta-bind-button
> > label: "New Subclass"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000015
> > \`\`\`
> >
> > \`\`\`meta-bind-button
> > label: "New Ancestry"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000016
> > \`\`\`
> >
> > \`\`\`meta-bind-button
> > label: "New Heritage"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000035
> > \`\`\`
>
> > [!note|no-t]
> >
> > \`\`\`meta-bind-button
> > label: "New Background"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000017
> > \`\`\`
> >
> > \`\`\`meta-bind-button
> > label: "New Feat"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000018
> > \`\`\`
> >
> > \`\`\`meta-bind-button
> > label: "New Action"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000036
> > \`\`\`
> >
> > \`\`\`meta-bind-button
> > label: "New Condition"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000019
> > \`\`\`
>
> > [!note|no-t]
> >
> > \`\`\`meta-bind-button
> > label: "New Event"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000020
> > \`\`\`
> >
> > \`\`\`meta-bind-button
> > label: "New Language"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000021
> > \`\`\``,

        pf1e: `## 📖 Lore

> [!column|3 no-t]
>
> > [!note|no-t]
> >
> > \`\`\`meta-bind-button
> > label: "New Class"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000014
> > \`\`\`
> >
> > \`\`\`meta-bind-button
> > label: "New Subclass / Archetype"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000015
> > \`\`\`
> >
> > \`\`\`meta-bind-button
> > label: "New Race"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000016
> > \`\`\`
>
> > [!note|no-t]
> >
> > \`\`\`meta-bind-button
> > label: "New Background"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000017
> > \`\`\`
> >
> > \`\`\`meta-bind-button
> > label: "New Feat"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000018
> > \`\`\`
> >
> > \`\`\`meta-bind-button
> > label: "New Condition"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000019
> > \`\`\`
>
> > [!note|no-t]
> >
> > \`\`\`meta-bind-button
> > label: "New Event"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000020
> > \`\`\`
> >
> > \`\`\`meta-bind-button
> > label: "New Language"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000021
> > \`\`\``,

        coc7e: `## 📖 Lore

> [!column|2 no-t]
>
> > [!note|no-t]
> >
> > \`\`\`meta-bind-button
> > label: "New Occupation"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000016
> > \`\`\`
> >
> > \`\`\`meta-bind-button
> > label: "New Condition"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000019
> > \`\`\`
>
> > [!note|no-t]
> >
> > \`\`\`meta-bind-button
> > label: "New Event"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000020
> > \`\`\`
> >
> > \`\`\`meta-bind-button
> > label: "New Language"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000021
> > \`\`\``,

        vtm5: `## 📖 Lore

> [!column|2 no-t]
>
> > [!note|no-t]
> >
> > \`\`\`meta-bind-button
> > label: "New Clan"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000016
> > \`\`\`
> >
> > \`\`\`meta-bind-button
> > label: "New Discipline"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000037
> > \`\`\`
> >
> > \`\`\`meta-bind-button
> > label: "New Condition"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000019
> > \`\`\`
>
> > [!note|no-t]
> >
> > \`\`\`meta-bind-button
> > label: "New Event"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000020
> > \`\`\`
> >
> > \`\`\`meta-bind-button
> > label: "New Language"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000021
> > \`\`\``,

        starfinder: `## 📖 Lore

> [!column|3 no-t]
>
> > [!note|no-t]
> >
> > \`\`\`meta-bind-button
> > label: "New Class"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000014
> > \`\`\`
> >
> > \`\`\`meta-bind-button
> > label: "New Archetype"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000015
> > \`\`\`
> >
> > \`\`\`meta-bind-button
> > label: "New Species"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000016
> > \`\`\`
>
> > [!note|no-t]
> >
> > \`\`\`meta-bind-button
> > label: "New Theme"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000017
> > \`\`\`
> >
> > \`\`\`meta-bind-button
> > label: "New Feat"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000018
> > \`\`\`
> >
> > \`\`\`meta-bind-button
> > label: "New Condition"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000019
> > \`\`\`
>
> > [!note|no-t]
> >
> > \`\`\`meta-bind-button
> > label: "New Event"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000020
> > \`\`\`
> >
> > \`\`\`meta-bind-button
> > label: "New Language"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000021
> > \`\`\``,

        swade: `## 📖 Lore

> [!column|3 no-t]
>
> > [!note|no-t]
> >
> > \`\`\`meta-bind-button
> > label: "New Race"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000016
> > \`\`\`
> >
> > \`\`\`meta-bind-button
> > label: "New Archetype"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000014
> > \`\`\`
>
> > [!note|no-t]
> >
> > \`\`\`meta-bind-button
> > label: "New Condition"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000019
> > \`\`\`
> >
> > \`\`\`meta-bind-button
> > label: "New Event"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000020
> > \`\`\`
>
> > [!note|no-t]
> >
> > \`\`\`meta-bind-button
> > label: "New Language"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000021
> > \`\`\``,
    };
    return sections[systemId] || sections["agnostic"];
}

function buildImportSection(system) {
    const buttons = [];

    if (system.importButtons.includes("5etools")) {
        buttons.push(`\`\`\`meta-bind-button
> > label: "Import 5e.tools Data"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000031
> > \`\`\``);
    }
    if (system.importButtons.includes("pf2etools")) {
        buttons.push(`\`\`\`meta-bind-button
> > label: "Import PF2e.tools Data"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000034
> > \`\`\``);
    }
    if (system.importButtons.includes("dndbeyond")) {
        buttons.push(`\`\`\`meta-bind-button
> > label: "Import Character from D&D Beyond"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000033
> > \`\`\``);
    }

    if (buttons.length === 0) {
        return `> *No data importers available for **${system.name}**.* `;
    }
    return "> > " + buttons.join("\n> >\n> > ");
}

// ── Core Setup Function ───────────────────────────────────────────────────────

async function runSetup(app, qa, system, isReconfig) {
    const notice = new Notice(`⚙️ Configuring vault for ${system.name}…`, 0);

    try {
        // 1. Create lore folders
        for (const folder of system.loreFolders) {
            try { await app.vault.createFolder(folder); } catch (_) { /* already exists */ }
        }

        // 2. Copy PC template
        const pcSrc = app.vault.getAbstractFileByPath(system.pcTemplate);
        if (pcSrc) {
            const pcContent = await app.vault.read(pcSrc);
            const dest = "z_Templates/Characters/Template - Player Character.md";
            const existing = app.vault.getAbstractFileByPath(dest);
            if (existing) {
                await app.vault.modify(existing, pcContent);
            } else {
                await app.vault.create(dest, pcContent);
            }
        }

        // 3. Copy PF2e-specific lore templates if needed
        if (system.id === "pf2e") {
            const pf2eTemplates = [
                { src: "z_Templates/Systems/pf2e/Template - Ancestry.md",  dest: "z_Templates/Lore/Template - Ancestry.md" },
                { src: "z_Templates/Systems/pf2e/Template - Heritage.md",  dest: "z_Templates/Lore/Template - Heritage.md" },
                { src: "z_Templates/Systems/pf2e/Template - Action.md",    dest: "z_Templates/Lore/Template - Action.md" },
            ];
            for (const { src, dest } of pf2eTemplates) {
                const srcFile = app.vault.getAbstractFileByPath(src);
                if (!srcFile) continue;
                const content = await app.vault.read(srcFile);
                const destFile = app.vault.getAbstractFileByPath(dest);
                if (destFile) {
                    await app.vault.modify(destFile, content);
                } else {
                    await app.vault.create(dest, content);
                }
            }
        }

        // 4. Update Buttons.md lore section and import section
        const buttonsPath = "1.Tools/Buttons.md";
        const buttonsFile = app.vault.getAbstractFileByPath(buttonsPath);
        if (buttonsFile) {
            let content = await app.vault.read(buttonsFile);

            // Replace lore section between markers
            const loreStart = "<!-- SYSTEM-LORE-START -->";
            const loreEnd   = "<!-- SYSTEM-LORE-END -->";
            const loreBlock = buildLoreSection(system.id);
            const startIdx  = content.indexOf(loreStart);
            const endIdx    = content.indexOf(loreEnd);
            if (startIdx !== -1 && endIdx !== -1) {
                content = content.slice(0, startIdx + loreStart.length) +
                    "\n\n" + loreBlock + "\n\n" +
                    content.slice(endIdx);
            }

            // Replace import section between markers
            const importStart = "<!-- SYSTEM-IMPORT-START -->";
            const importEnd   = "<!-- SYSTEM-IMPORT-END -->";
            const importBlock = buildImportSection(system);
            const iStartIdx   = content.indexOf(importStart);
            const iEndIdx     = content.indexOf(importEnd);
            if (iStartIdx !== -1 && iEndIdx !== -1) {
                content = content.slice(0, iStartIdx + importStart.length) +
                    "\n" + importBlock + "\n" +
                    content.slice(iEndIdx);
            }

            await app.vault.modify(buttonsFile, content);
        }

        // 5. Write vault-config.json
        const configPath = "vault-config.json";
        const configContent = JSON.stringify({
            gameSystem: system.id,
            gameSystemName: system.name,
            configuredAt: new Date().toISOString(),
        }, null, 2) + "\n";
        const configFile = app.vault.getAbstractFileByPath(configPath);
        if (configFile) {
            await app.vault.modify(configFile, configContent);
        } else {
            await app.vault.create(configPath, configContent);
        }

        notice.hide();

        const msg = isReconfig
            ? `✅ Vault reconfigured for ${system.name}. Reload Obsidian to see all changes.`
            : `✅ Vault configured for ${system.name}! You're ready to play.`;
        new Notice(msg, 7000);

        if (isReconfig) {
            setTimeout(() => app.commands.executeCommandById("app:reload"), 2000);
        }

    } catch (err) {
        notice.hide();
        new Notice(`❌ Setup failed: ${err.message}`, 10000);
        console.error("[SetupSystem] error:", err);
    }
}

// ── Entry Point ───────────────────────────────────────────────────────────────

module.exports = async (params) => {
    const { app, quickAddApi: qa } = params;

    // Detect if this is a reconfiguration (vault already has a system)
    let isReconfig = false;
    let currentSystem = null;
    try {
        const cfg = JSON.parse(await app.vault.adapter.read("vault-config.json"));
        if (cfg.gameSystem) {
            isReconfig = true;
            currentSystem = cfg.gameSystemName;
        }
    } catch (_) {}

    const title = isReconfig
        ? `Change Game System (currently: ${currentSystem})`
        : "Select Your Game System";

    const labels = SYSTEMS.map(s => `${s.icon}  ${s.name}  —  ${s.description}`);
    const selectedLabel = await qa.suggester(labels, labels, true, title);
    if (!selectedLabel) return;

    const selectedIdx = labels.indexOf(selectedLabel);
    const system = SYSTEMS[selectedIdx];
    if (!system) return;

    if (isReconfig) {
        const confirm = await qa.yesNoPrompt(
            `Switch to ${system.name}?\n\nThis will:\n• Update the Player Character template\n• Create system-specific lore folders\n• Update the Lore and Import buttons\n\nExisting notes and campaign data are not affected. The vault will reload when done.`
        );
        if (!confirm) return;
    }

    await runSetup(app, qa, system, isReconfig);
};

// ── Export for use by SetupLayout.md ─────────────────────────────────────────
module.exports.SYSTEMS = SYSTEMS;
module.exports.runSetup = runSetup;
