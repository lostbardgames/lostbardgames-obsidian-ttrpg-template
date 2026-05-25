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

// ── All folders that importers write to ───────────────────────────────────────
// Used when switching systems to purge imported notes from shared folders.
// System-specific folders (Races, Species, Ancestries, etc.) are handled
// separately by cleanupOldFolders(); these are the shared + possession folders.

const ALL_IMPORT_FOLDERS = [
    // Possessions (not in loreFolders but both importers write here)
    "Campaign/Possessions/Spells",
    "Campaign/Possessions/Items",
    // Character types — system-specific (also caught by cleanupOldFolders but safe to rescan)
    "Campaign/Lore/Races",
    "Campaign/Lore/Races/Traits",
    "Campaign/Lore/Species",
    "Campaign/Lore/Species/Traits",
    "Campaign/Lore/Ancestries",
    "Campaign/Lore/Ancestries/Heritages",
    "Campaign/Lore/Actions",
    // Shared lore folders (both importers write here — must be cleaned per-file)
    "Campaign/Lore/Classes",
    "Campaign/Lore/Classes/Features",
    "Campaign/Lore/Backgrounds",
    "Campaign/Lore/Backgrounds/Features",
    "Campaign/Lore/Feats",
    "Campaign/Lore/Conditions",
    "Campaign/Lore/Languages",
    "Campaign/Lore/Optional Features",
    // Deities live in Characters, not Lore
    "Campaign/Characters/Deities",
];

// ── PC frontmatter conversion maps ────────────────────────────────────────────
// Applied to every .md in Campaign/Characters/Players/ when switching systems.
// Keys under `add` use raw YAML value strings; "" means a blank (null) field.

const PC_CONVERSIONS = {
    // ── D&D 5e (2014) → Pathfinder 2e ──────────────────────────────────────
    "dnd5e:pf2e": {
        rename: { species: "ancestry" },
        remove: [
            "alignment", "occupation", "experience_next", "proficiencyBonus",
            "passivePerception", "passiveInsight", "passiveInvestigation",
            "hitDie", "isSpellcaster", "spellcastingAbility",
            "spell_save_dc", "spell_attack_bonus",
        ],
        add: {
            heritage: "", keyAbility: "", heroPoints: "1", hp_ancestry: "8",
            classdc: "10", perception_rank: "trained", fort_rank: "trained",
            ref_rank: "trained", will_rank: "expert",
        },
        update: { speed: "25" },
    },
    // ── D&D 5.5e (2024) → Pathfinder 2e ─────────────────────────────────────
    "dnd5e_2024:pf2e": {
        rename: { species: "ancestry" },
        remove: [
            "alignment", "occupation", "experience_next", "proficiencyBonus",
            "passivePerception", "passiveInsight", "passiveInvestigation",
            "hitDie", "isSpellcaster", "spellcastingAbility",
            "spell_save_dc", "spell_attack_bonus", "originFeat",
        ],
        add: {
            heritage: "", keyAbility: "", heroPoints: "1", hp_ancestry: "8",
            classdc: "10", perception_rank: "trained", fort_rank: "trained",
            ref_rank: "trained", will_rank: "expert",
        },
        update: { speed: "25" },
    },
    // ── Pathfinder 2e → D&D 5e (2014) ───────────────────────────────────────
    "pf2e:dnd5e": {
        rename: { ancestry: "species" },
        remove: [
            "heritage", "keyAbility", "heroPoints", "hp_ancestry", "classdc",
            "perception_rank", "fort_rank", "ref_rank", "will_rank",
        ],
        add: {
            alignment: "", occupation: "[]", experience_next: "300",
            proficiencyBonus: "2", passivePerception: "10", passiveInsight: "10",
            passiveInvestigation: "10", hitDie: "", isSpellcaster: "false",
            spellcastingAbility: "", spell_save_dc: "0", spell_attack_bonus: "0",
        },
        update: { speed: "30" },
    },
    // ── Pathfinder 2e → D&D 5.5e (2024) ─────────────────────────────────────
    "pf2e:dnd5e_2024": {
        rename: { ancestry: "species" },
        remove: [
            "heritage", "keyAbility", "heroPoints", "hp_ancestry", "classdc",
            "perception_rank", "fort_rank", "ref_rank", "will_rank",
        ],
        add: {
            alignment: "", occupation: "[]", experience_next: "300",
            proficiencyBonus: "2", passivePerception: "10", passiveInsight: "10",
            passiveInvestigation: "10", hitDie: "", isSpellcaster: "false",
            spellcastingAbility: "", spell_save_dc: "0", spell_attack_bonus: "0",
            originFeat: "",
        },
        update: { speed: "30" },
    },
    // ── D&D 5e (2014) ↔ D&D 5.5e (2024) ─────────────────────────────────────
    "dnd5e:dnd5e_2024": {
        add: { originFeat: "" },
    },
    "dnd5e_2024:dnd5e": {
        remove: ["originFeat"],
    },
};

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

function buildImportButtons(system) {
    const lines = [];

    if (system.importButtons.includes("5etools")) {
        lines.push(`> > \`\`\`meta-bind-button
> > label: "Import 5e.tools Data"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000031
> > \`\`\``);
    }
    if (system.importButtons.includes("pf2etools")) {
        lines.push(`> > \`\`\`meta-bind-button
> > label: "Import PF2e.tools Data"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000034
> > \`\`\``);
    }
    if (system.importButtons.includes("dndbeyond")) {
        lines.push(`> > \`\`\`meta-bind-button
> > label: "Import Character from D&D Beyond"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000033
> > \`\`\``);
    }

    if (lines.length === 0) {
        return `> > *No data importers available for **${system.name}**.*`;
    }
    return lines.join("\n> >\n");
}

function buildCharactersSection(system) {
    const hasDnDBeyond = system.importButtons.includes("dndbeyond");
    const importCharBtn = hasDnDBeyond ? `> >
> > \`\`\`meta-bind-button
> > label: "Import Character from D&D Beyond"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000033
> > \`\`\`` : "";

    return `## 👥 Characters

> [!column|2 no-t]
>
> > [!note|no-t]
> >
> > \`\`\`meta-bind-button
> > label: "New Party"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000005
> > \`\`\`
> >
> > \`\`\`meta-bind-button
> > label: "New Player Character"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000001
> > \`\`\`
> >
> > \`\`\`meta-bind-button
> > label: "New NPC"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000002
> > \`\`\`
>
> > [!note|no-t]
> >
> > \`\`\`meta-bind-button
> > label: "New Deity"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000003
> > \`\`\`
> >
> > \`\`\`meta-bind-button
> > label: "New Organization"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000004
> > \`\`\`${importCharBtn ? "\n" + importCharBtn : ""}`;
}

function buildVaultSection(system) {
    const importButtons = buildImportButtons(system);
    return `## 🗄️ Vault

> [!column|3 no-t]
>
> > [!success|no-t] **Import Data**
> >
${importButtons}
> >
> > Non-destructive — existing notes are never overwritten. Requires Python 3 and an internet connection.
> >
> > > [!warning] ⚠️ License Disclaimer
> > > You are responsible for ensuring you have a valid license or legal right to access the content you import. Content from the SRD 5.1 is available under the Creative Commons license. All other sourcebooks require a valid purchase or license from the publisher.
>
> > [!info|no-t] **Vault Settings**
> >
> > \`\`\`meta-bind-button
> > label: "Configure Game System"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000038
> > \`\`\`
> >
> > \`\`\`meta-bind-button
> > label: "Check for Updates"
> > style: primary
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000032
> > \`\`\`
> >
> > 🎲 **Game System:** ${system.name}
> >
> > 📦 **Vault version:** v\`$= app.vault.adapter.read("version.json").then(f => JSON.parse(f).version)\`
> >
> > Checks GitHub for a newer version and walks you through the update. Templates, scripts, CSS snippets, and guide files are updated automatically. Tool files (Homepage, Buttons, GM Screen) are optional — they are backed up as \`.bak\` files before being overwritten.
> >
> > Your campaign data (\`Campaign/\`, \`z_Databases/\`, \`z_Assets/\`) is **never touched**. Requires an internet connection and Python 3.
>
> > [!danger] ⚠️ Danger Zone
> >
> > \`\`\`meta-bind-button
> > label: "Reset Vault"
> > style: destructive
> > actions:
> >   - type: command
> >     command: quickadd:choice:a1b2c3d4-0001-4000-8000-000000000030
> > \`\`\`
> >
> > Choose between **Campaign Data Only** or **Full Reset** (deletes everything). ⚠️ Files are permanently deleted and cannot be recovered.`;
}

// ── Folder cleanup helpers ────────────────────────────────────────────────────

/**
 * Remove lore folders that belonged to the old system but are not used by
 * the new system. All contents (imported data, notes) are deleted — this is
 * intentional since system-specific lore can be re-imported at any time.
 * Deepest paths are removed first so child folders are gone before parents.
 */
async function cleanupOldFolders(app, oldSystemId, newSystem) {
    if (!oldSystemId) return;

    const oldSystem = SYSTEMS.find(s => s.id === oldSystemId);
    if (!oldSystem) return;

    const newSet = new Set(newSystem.loreFolders);
    const toRemove = oldSystem.loreFolders
        .filter(f => !newSet.has(f))
        // deepest first so children are removed before their parents
        .sort((a, b) => b.split("/").length - a.split("/").length);

    let removed = 0;
    for (const folderPath of toRemove) {
        const folder = app.vault.getAbstractFileByPath(folderPath);
        if (!folder || !("children" in folder)) continue;
        try {
            await app.vault.delete(folder, true /* recursive */);
            removed++;
            console.log(`[SetupSystem] Removed folder: ${folderPath}`);
        } catch (e) {
            console.warn(`[SetupSystem] Could not remove ${folderPath}:`, e);
        }
    }
    return removed;
}

/**
 * Recursively collect all .md TFile objects under an Obsidian TFolder.
 */
function getAllMarkdownFilesInFolder(folder) {
    const files = [];
    function recurse(node) {
        if ("children" in node) {
            for (const child of node.children) recurse(child);
        } else if (node.extension === "md") {
            files.push(node);
        }
    }
    recurse(folder);
    return files;
}

/**
 * Delete ALL notes in ALL_IMPORT_FOLDERS when switching systems.
 * Wipes every file regardless of whether it was imported or user-created —
 * lore reference data is always re-importable and should never carry over
 * between game systems.
 */
async function cleanupImportedNotes(app) {
    let deleted = 0;
    for (const folderPath of ALL_IMPORT_FOLDERS) {
        const folder = app.vault.getAbstractFileByPath(folderPath);
        if (!folder || !("children" in folder)) continue;

        const files = getAllMarkdownFilesInFolder(folder);
        for (const file of files) {
            try {
                await app.vault.delete(file);
                deleted++;
            } catch (e) {
                console.warn(`[SetupSystem] Could not delete ${file.path}:`, e);
            }
        }
    }
    return deleted;
}

/**
 * Apply a frontmatter conversion spec to raw note content.
 * conv = { rename, remove, add, update } — all properties optional.
 *   rename : { oldKey: newKey }             — renames the key, preserving value
 *   remove : [key, ...]                     — removes the key + any indented continuation lines
 *   add    : { key: yamlValue }             — adds key if not already present; "" = blank field
 *   update : { key: yamlValue }             — overwrites value regardless of current value
 */
function applyFrontmatterConversion(content, conv) {
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
    if (!fmMatch) return content;

    const fmRaw  = fmMatch[1];
    const body   = content.slice(fmMatch[0].length);
    const lines  = fmRaw.split("\n");
    const newLines = [];
    const seen   = new Set();
    let skipContinuation = false;

    for (const line of lines) {
        // Skip indented continuation lines (array items) of a removed key
        if (skipContinuation) {
            if (line.startsWith("  ") || line.startsWith("\t")) continue;
            skipContinuation = false;
        }

        // Match a top-level YAML key
        const keyMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*:/);
        if (!keyMatch) {
            newLines.push(line);
            continue;
        }

        const key = keyMatch[1];
        seen.add(key);

        if (conv.remove?.includes(key)) {
            skipContinuation = true; // skip indented lines belonging to this key
            continue;
        }

        if (conv.rename?.[key]) {
            const newKey = conv.rename[key];
            newLines.push(newKey + line.slice(key.length)); // keep ": value" intact
            seen.add(newKey);
            continue;
        }

        if (conv.update && Object.prototype.hasOwnProperty.call(conv.update, key)) {
            newLines.push(`${key}: ${conv.update[key]}`);
            continue;
        }

        newLines.push(line);
    }

    // Append new fields not already present
    if (conv.add) {
        for (const [key, val] of Object.entries(conv.add)) {
            if (seen.has(key)) continue;
            newLines.push(val === "" ? `${key}:` : `${key}: ${val}`);
        }
    }

    return `---\n${newLines.join("\n")}\n---\n${body}`;
}

/**
 * Convert player character frontmatter fields when switching game systems.
 * Only touches notes in Campaign/Characters/Players/ that have frontmatter
 * and were NOT created by an importer (no import_source field).
 */
async function convertPlayerCharacters(app, oldSystemId, newSystemId) {
    const convKey = `${oldSystemId}:${newSystemId}`;
    const conv    = PC_CONVERSIONS[convKey];
    if (!conv) return 0; // same system or no conversion defined

    const folder = app.vault.getAbstractFileByPath("Campaign/Characters/Players");
    if (!folder || !("children" in folder)) return 0;

    const files = getAllMarkdownFilesInFolder(folder);
    let converted = 0;

    for (const file of files) {
        try {
            const cache = app.metadataCache.getFileCache(file);
            if (!cache?.frontmatter) continue;              // no frontmatter
            if (cache.frontmatter.import_source) continue;  // imported note, skip

            const content    = await app.vault.read(file);
            const newContent = applyFrontmatterConversion(content, conv);
            if (newContent !== content) {
                await app.vault.modify(file, newContent);
                converted++;
                console.log(`[SetupSystem] Converted PC note: ${file.path}`);
            }
        } catch (e) {
            console.warn(`[SetupSystem] Could not convert ${file.path}:`, e);
        }
    }
    return converted;
}

/**
 * After a system switch, ask the user what to do with existing player characters.
 * Only shown if there are user-created (non-imported) notes in Campaign/Characters/Players/.
 * Options: Convert fields to the new system, Start Fresh (delete all PCs), or Do Nothing.
 */
async function promptPCConversion(app, qa, oldSystemId, newSystemId) {
    const folder = app.vault.getAbstractFileByPath("Campaign/Characters/Players");
    if (!folder || !("children" in folder)) return;

    // Find user-created PC notes (no import_source)
    const allFiles  = getAllMarkdownFilesInFolder(folder);
    const userFiles = allFiles.filter(f => {
        const cache = app.metadataCache.getFileCache(f);
        return cache?.frontmatter && !cache.frontmatter.import_source;
    });
    if (userFiles.length === 0) return; // nothing to do

    const count = userFiles.length;
    const label = count === 1 ? "1 player character" : `${count} player characters`;

    const OPT_CONVERT = `🔄  Convert — update ${label} to ${newSystemId} field schema`;
    const OPT_FRESH   = `🗑️  Start Fresh — delete ${label} and begin anew`;
    const OPT_KEEP    = `⏭️  Keep As-Is — leave ${label} unchanged`;

    const choice = await qa.suggester(
        [OPT_CONVERT, OPT_FRESH, OPT_KEEP],
        [OPT_CONVERT, OPT_FRESH, OPT_KEEP],
        false,
        `You have ${label}. What should happen to them?`
    );
    if (!choice || choice === OPT_KEEP) return;

    if (choice === OPT_CONVERT) {
        const conv = PC_CONVERSIONS[`${oldSystemId}:${newSystemId}`];
        if (!conv) {
            new Notice(`ℹ️ No field conversion defined for ${oldSystemId} → ${newSystemId}. Characters left unchanged.`, 6000);
            return;
        }
        let converted = 0;
        for (const file of userFiles) {
            try {
                const content    = await app.vault.read(file);
                const newContent = applyFrontmatterConversion(content, conv);
                if (newContent !== content) {
                    await app.vault.modify(file, newContent);
                    converted++;
                }
            } catch (e) {
                console.warn(`[SetupSystem] Could not convert ${file.path}:`, e);
            }
        }
        new Notice(`✅ Converted ${converted} of ${count} character note(s) to ${newSystemId}.`, 5000);

    } else if (choice === OPT_FRESH) {
        let deleted = 0;
        for (const file of userFiles) {
            try {
                await app.vault.delete(file);
                deleted++;
            } catch (e) {
                console.warn(`[SetupSystem] Could not delete ${file.path}:`, e);
            }
        }
        new Notice(`🗑️ Deleted ${deleted} player character note(s).`, 5000);
    }
}

// ── Core Setup Function ───────────────────────────────────────────────────────

async function runSetup(app, qa, system, isReconfig) {
    const notice = new Notice(`⚙️ Configuring vault for ${system.name}…`, 0);

    try {
        // 0. Read old system ID for cleanup (before we overwrite vault-config.json)
        let oldSystemId = null;
        try {
            const cfg = JSON.parse(await app.vault.adapter.read("vault-config.json"));
            if (cfg.gameSystem && cfg.gameSystem !== system.id) {
                oldSystemId = cfg.gameSystem;
            }
        } catch (_) {}

        // 1a. Delete all imported notes (import_source field present) from every importer folder.
        //     This clears shared folders (Classes, Backgrounds, Feats, etc.) and Possessions.
        if (oldSystemId) {
            const importedDeleted = await cleanupImportedNotes(app);
            console.log(`[SetupSystem] Deleted ${importedDeleted} imported notes`);
        }

        // 1b. Remove system-specific lore folders that the new system doesn't use.
        if (oldSystemId) {
            await cleanupOldFolders(app, oldSystemId, system);
        }

        // 2. Create lore folders for the new system
        for (const folder of system.loreFolders) {
            try { await app.vault.createFolder(folder); } catch (_) { /* already exists */ }
        }

        // 3. Copy PC template
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

        // 4. Copy PF2e-specific lore templates if needed
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

        // 5. Update Buttons.md — characters section, lore section, and vault section
        const buttonsPath = "1.Tools/Buttons.md";
        const buttonsFile = app.vault.getAbstractFileByPath(buttonsPath);
        if (buttonsFile) {
            let content = await app.vault.read(buttonsFile);

            // Replace characters section between markers
            const charStart = "<!-- SYSTEM-CHARACTERS-START -->";
            const charEnd   = "<!-- SYSTEM-CHARACTERS-END -->";
            const charBlock = buildCharactersSection(system);
            const cStartIdx = content.indexOf(charStart);
            const cEndIdx   = content.indexOf(charEnd);
            if (cStartIdx !== -1 && cEndIdx !== -1) {
                content = content.slice(0, cStartIdx + charStart.length) +
                    "\n\n" + charBlock + "\n\n" +
                    content.slice(cEndIdx);
            }

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

            // Replace vault section between markers (markers are outside callout hierarchy)
            const importStart = "<!-- SYSTEM-IMPORT-START -->";
            const importEnd   = "<!-- SYSTEM-IMPORT-END -->";
            const vaultBlock  = buildVaultSection(system);
            const iStartIdx   = content.indexOf(importStart);
            const iEndIdx     = content.indexOf(importEnd);
            if (iStartIdx !== -1 && iEndIdx !== -1) {
                content = content.slice(0, iStartIdx + importStart.length) +
                    "\n\n" + vaultBlock + "\n\n" +
                    content.slice(iEndIdx);
            }

            await app.vault.modify(buttonsFile, content);
        }

        // 6. Write vault-config.json
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

        // Ask what to do with existing player character notes (only on system switch)
        if (isReconfig && oldSystemId && oldSystemId !== system.id) {
            await promptPCConversion(app, qa, oldSystemId, system.id);
        }

        const msg = isReconfig
            ? `✅ Vault reconfigured for ${system.name}. Reloading…`
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
    let currentSystemId = null;
    try {
        const cfg = JSON.parse(await app.vault.adapter.read("vault-config.json"));
        if (cfg.gameSystem) {
            isReconfig = true;
            currentSystem   = cfg.gameSystemName;
            currentSystemId = cfg.gameSystem;
        }
    } catch (_) {}

    const title = isReconfig
        ? `Change Game System (currently: ${currentSystem})`
        : "Select Your Game System";

    const labels = SYSTEMS.map(s => {
        const active = s.id === currentSystemId ? "  ✅ Active" : "";
        return `${s.icon}  ${s.name}${active}  —  ${s.description}`;
    });
    const selectedLabel = await qa.suggester(labels, labels, true, title);
    if (!selectedLabel) return;

    const selectedIdx = labels.indexOf(selectedLabel);
    const system = SYSTEMS[selectedIdx];
    if (!system) return;

    if (isReconfig) {
        const confirm = await qa.yesNoPrompt(
            `Switch to ${system.name}?\n\nThis will:\n• Delete all imported lore data (spells, classes, races/ancestries, etc.) — it can be re-imported any time\n• Remove system-specific lore folders from the old system\n• Create lore folders for the new system\n• Update the Player Character template and Lore/Import buttons\n• Ask what to do with any existing player characters (convert, delete, or keep)\n\nLocations, parties, session notes, and other campaign data are never touched. The vault will reload when done.`
        );
        if (!confirm) return;
    }

    await runSetup(app, qa, system, isReconfig);
};

// ── Export for use by SetupLayout.md ─────────────────────────────────────────
module.exports.SYSTEMS = SYSTEMS;
module.exports.runSetup = runSetup;
