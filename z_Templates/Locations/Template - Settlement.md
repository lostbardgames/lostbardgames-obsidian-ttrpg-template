---
tags:
  - Location
  - Settlement
mapmarker: Settlement
art: "[[PlaceholderSettlement.png]]"
mapSketch:
aliases:
settlementType:
defence:
currentLocation: []
rulers: []
leaders: []
organizations: []
population:
wealthLevel:
threatLevel:
tradePartners:
imports:
exports:
---

> [!infobox | no-blending black]+ <font color="#ffffff">Infobox</font>
>
> `VIEW[!{art}][text(renderMarkdown)]`
>
> # Info
> | |
> |---|---|
> | **Aliases** | `VIEW[{aliases}][text]` |
> | **Type** | `VIEW[{settlementType}][text]` |
> | **Defences** | `VIEW[{defence}][text]` |
> | **Wealth** | `VIEW[{wealthLevel}][text]` |
> | **Threat Level** | `VIEW[{threatLevel}][text]` |
> | **Location** | `VIEW[{currentLocation}][link]` |
>
> # Demographics
> | |
> |---|---|
> | **Rulers** | `VIEW[{rulers}][link]` |
> | **Leaders** | `VIEW[{leaders}][link]` |
> | **Dominion** | `VIEW[{organizations}][link]` |
> | **Population** | `VIEW[{population}][text]` |
>
> # [[Travel Calculator]]
> | |
> |---|---|
> | **TBD** | `VIEW[round(0 / (({Travel Calculator#MilesPerHour}*{Travel Calculator#HoursPerDay})*{Travel Calculator#SpeedMultiplier}),1)]` Day(s) |

# `=this.file.name`

> [!quote]- Scene Introduction
> A script to read from when the party arrives to this settlement for the first time to set the scene.

> *<font color="#7f7f7f">Summarize the settlement by describing its size, purpose, and defining features, along with what makes it stand out from others.</font>*

## Database

![[z_Databases/Locations/Database - Settlement Note.base]]

## Maps

> [!metadata|map] Interactive Map
> ```leaflet
> id: TBD
> image: [[PlaceholderImage.png]]
> lock: true
> recenter: true
> noScrollZoom: false
> lat: 0
> long: 0
> minZoom: 1
> maxZoom: 6.5
> defaultZoom: 1
> zoomDelta: 0.5
> unit: miles
> scale: 1
> darkMode: false
> ```

### Hand-Drawn Map

`VIEW[!{mapSketch}][text(renderMarkdown)]`

## Overview

### Description

> *<font color="#7f7f7f">What is the settlement's environment, architecture, culture, and overall atmosphere? Describe its look and feel, who lives there, and how it fits into the surrounding region.</font>*

### Society & Culture

> *<font color="#7f7f7f">What is daily life like in the settlement? How do its people think, behave, and interact? Describe customs, traditions, beliefs, and social structure.</font>*

### Government & Law

> *<font color="#7f7f7f">How is the settlement governed and by whom? What laws exist and how are they enforced? Any ongoing political tensions?</font>*

## Commerce

> [!column|2 no-t]
> <font color="#9bbb59">**Imported Goods:**</font> `VIEW[{imports}][text]`
>
> <font color="#c0504d">**Exported Goods:**</font> `VIEW[{exports}][text]`

### Trade Agreements

- *<font color="#7f7f7f">[[Settlement Name]] — <font color="#9bbb59">Import</font> / <font color="#c0504d">Export</font> — reason for the deal</font>*

## Present

### Current Events

- *<font color="#7f7f7f">Example Quest — summary of a quest the party can get involved in.</font>*
- *<font color="#7f7f7f">Example Event — summary of an ongoing event in this settlement.</font>*

## Districts

```dataview
TABLE WITHOUT ID
  file.link as "District",
  districtType as "Type",
  population as "Population",
  wealthLevel as "Wealth",
  threatLevel as "Threat"
FROM "Campaign/Districts"
WHERE econtains(tags,"District") AND parentSettlement = this.file.link
SORT file.name ASC
```

## Points of Interest

```dataview
TABLE WITHOUT ID
  file.link as "Location",
  poiType as "Type",
  status as "Status",
  threatLevel as "Threat"
FROM "Campaign/POIs"
WHERE econtains(tags,"POI") AND !econtains(tags,"Shop") AND econtains(currentLocation, this.file.link)
SORT file.name ASC
```

## Shops & Services

```dataview
TABLE WITHOUT ID
  file.link as "Shop",
  shopType as "Type",
  owners as "Owner",
  priceModifier as "Prices"
FROM "Campaign/POIs"
WHERE econtains(tags,"Shop") AND econtains(currentLocation, this.file.link)
SORT file.name ASC
```

## Notable NPCs

```dataview
TABLE WITHOUT ID
  file.link as "NPC",
  occupation as "Occupation",
  organizations as "Organization",
  condition as "Condition"
FROM "Campaign/Characters/NPCs"
WHERE econtains(tags,"NPC") AND econtains(currentLocation, this.file.link)
SORT file.name ASC
```

## Past

### History

> *<font color="#7f7f7f">Describe the history of the settlement, including its founding, key events, and how it developed into what it is today.</font>*

### Secrets, Rumours & Legends

> *<font color="#7f7f7f">Describe the secrets, rumors, and legends tied to the settlement.</font>*

## Notes

