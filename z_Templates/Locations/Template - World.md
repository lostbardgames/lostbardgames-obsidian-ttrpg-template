---
tags:
  - Location
  - World
mapmarker:
art: "[[PlaceholderWorld.png]]"
mapSketch:
aliases:
worldType:
climate:
magicLevel:
technologyLevel:
organizations: []
currentLocation:
dominantSpecies: []
dominantLanguages: []
dominantReligions: []
currentWorldDate:
---

> [!infobox | no-blending black]+ <font color="#ffffff">Infobox</font>
>
> `VIEW[!{art}][text(renderMarkdown)]`
>
> # Info
> | |
> |---|---|
> | **Aliases** | `VIEW[{aliases}][text]` |
> | **Type** | `VIEW[{worldType}][text]` |
> | **Climate** | `VIEW[{climate}][text]` |
> | **Magic Level** | `VIEW[{magicLevel}][text]` |
> | **Technology** | `VIEW[{technologyLevel}][text]` |
> | **Dominant Species** | `VIEW[{dominantSpecies}][link]` |
> | **Dominant Languages** | `VIEW[{dominantLanguages}][link]` |
> | **Dominant Religions** | `VIEW[{dominantReligions}][link]` |
> | **Dominion** | `VIEW[{organizations}][link]` |
> | **Location** | `VIEW[{currentLocation}][link]` |
> | **Current World Date** | `VIEW[{currentWorldDate}][text]` |

# `=this.file.name`

> [!quote]- Scene Introduction
> A script to read from when the party arrives to this world for the first time to set the scene.

> *<font color="#7f7f7f">Write a short summary of the world, highlighting its most defining traits such as its environment, atmosphere, and its role or significance.</font>*

## Database

![[z_Databases/Locations/Database - World Note.base]]

## Maps

> [!metadata|map] Interactive Map
> ```leaflet
> id: {{VALUE}}
> image: [[PlaceholderImage.png]]
> lock: true
> recenter: true
> noScrollZoom: false
> bounds: [[0,0], [5000, 5000]]
> lat: 0
> long: 0
> minZoom: -3.5
> maxZoom: 6.5
> defaultZoom: -3.5
> zoomDelta: 0.5
> unit: miles
> scale: 0.0404
> markerTag:
> - "#MapIt-TBD"
> ```

### Hand-Drawn Map

`VIEW[!{mapSketch}][text(renderMarkdown)]`

## Overview

### Cosmology & Structure

> *<font color="#7f7f7f">Where does this world sit in the wider cosmology? Describe its relationship to planes, other worlds, or the cosmic order.</font>*

### Culture & Peoples

> *<font color="#7f7f7f">What are the common traits, values, and traditions shared across the world? Describe dominant species, languages, and religions.</font>*

## Present

### Current Events

- *<font color="#7f7f7f">Example Quest — summary of a quest the party can get involved in.</font>*
- *<font color="#7f7f7f">Example Event — summary of an ongoing world event.</font>*

## Past

### History

> *<font color="#7f7f7f">What key events have shaped this world over time? Consider ancient civilizations, major wars, migrations, natural disasters, or political shifts.</font>*

### Secrets, Rumours & Legends

> *<font color="#7f7f7f">What hidden truths or mysteries lie across the world? Lost kingdoms, forbidden magic, hidden societies, or concealed agendas.</font>*

## Regions

```dataview
TABLE WITHOUT ID
  file.link as "Region",
  regionType as "Type",
  climate as "Climate",
  threatLevel as "Threat"
FROM "Campaign/Regions"
WHERE econtains(tags,"Region") AND econtains(currentLocation, this.file.link)
SORT file.name ASC
```

## Settlements

```dataview
TABLE WITHOUT ID
  file.link as "Settlement",
  settlementType as "Type",
  population as "Population",
  wealthLevel as "Wealth"
FROM "Campaign/Settlements"
WHERE econtains(tags,"Settlement") AND econtains(currentLocation, this.file.link)
SORT file.name ASC
```

## Planes

```dataview
TABLE WITHOUT ID
  file.link as "Plane",
  planeType as "Type",
  alignmentAxis as "Alignment"
FROM "Campaign/Planes"
WHERE econtains(tags,"Plane") AND econtains(currentLocation, this.file.link)
SORT file.name ASC
```

## Pantheon

```dataview
TABLE WITHOUT ID
  file.link as "Deity",
  domain as "Domain",
  alignment as "Alignment",
  deityPower as "Power"
FROM "Campaign/Characters/Deities"
WHERE econtains(tags,"Deity") AND econtains(currentLocation, this.file.link)
SORT file.name ASC
```

## Organizations

```dataview
TABLE WITHOUT ID
  file.link as "Organization",
  organizationTypes as "Type",
  alignment as "Alignment",
  influence as "Influence"
FROM "Campaign/Organizations"
WHERE econtains(tags,"Organization") AND econtains(currentLocation, this.file.link)
SORT file.name ASC
```

## Languages

```dataview
TABLE WITHOUT ID
  file.link as "Language",
  languageType as "Type",
  script as "Script",
  rarity as "Rarity"
FROM "Campaign/Lore/Languages"
WHERE econtains(tags,"Language") AND econtains(currentLocation, this.file.link)
SORT file.name ASC
```

## Notes

