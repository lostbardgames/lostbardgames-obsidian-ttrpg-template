---
tags:
  - Location
  - District
mapmarker: District
art: "[[PlaceholderDistrict.png]]"
mapSketch:
aliases:
districtType:
parentSettlement:
currentLocation: []
rulers: []
leaders: []
organizations: []
population:
wealthLevel:
threatLevel:
condition:
  - Active
knownFor:
---

> [!infobox | no-blending black]+ <font color="#ffffff">Infobox</font>
>
> `VIEW[!{art}][text(renderMarkdown)]`
>
> # Info
> | |
> |---|---|
> | **Aliases** | `VIEW[{aliases}][text]` |
> | **Type** | `VIEW[{districtType}][text]` |
> | **Settlement** | `VIEW[{parentSettlement}][link]` |
> | **Wealth** | `VIEW[{wealthLevel}][text]` |
> | **Threat Level** | `VIEW[{threatLevel}][text]` |
> | **Condition** | `VIEW[{condition}][text]` |
> | **Location** | `VIEW[{currentLocation}][link]` |
>
> # Demographics
> | |
> |---|---|
> | **Rulers** | `VIEW[{rulers}][link]` |
> | **Leaders** | `VIEW[{leaders}][link]` |
> | **Dominion** | `VIEW[{organizations}][link]` |
> | **Population** | `VIEW[{population}][text]` |
> | **Known For** | `VIEW[{knownFor}][text]` |

# `=this.file.name`

> [!quote]- Scene Introduction
> A script to read from when the party enters this district for the first time to set the scene.

> *<font color="#7f7f7f">Summarize the district by describing its purpose, defining atmosphere, and what role it plays within the broader settlement.</font>*

## Database

![[z_Databases/Locations/Database - District Note.base]]

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

> *<font color="#7f7f7f">What does the district look, feel, and smell like? Describe its architecture, street layout, the kinds of people found here, and the general atmosphere a visitor would notice walking in.</font>*

### Society & Culture

> *<font color="#7f7f7f">Who lives or works here and how do they interact? Describe the social makeup, common attitudes, customs, and any cultural identity unique to this district.</font>*

### Government & Law

> *<font color="#7f7f7f">Is this district governed differently from the rest of the settlement? Who enforces the law here? Note any local power figures, ward bosses, or guild authority that operates in this space.</font>*

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

## Present

### Current Events

- *<font color="#7f7f7f">Example Quest — summary of a quest the party can get involved in here.</font>*
- *<font color="#7f7f7f">Example Event — summary of an ongoing event or tension in this district.</font>*

### Rumors

- *<font color="#7f7f7f">Example Rumor — something locals whisper about in this district.</font>*

## Past

### History

> *<font color="#7f7f7f">Describe the history of this district, including how it came to be, what it was used for in the past, and any significant events that shaped its current character.</font>*

### Secrets, Rumours & Legends

> *<font color="#7f7f7f">Describe the secrets, rumors, and legends tied to this district, including hidden truths and myths that shape how it is perceived.</font>*

## Notes

