---
tags:
  - Location
  - POI
mapmarker:
art: "[[PlaceholderPOI.png]]"
mapSketch:
aliases:
poiType:
status:
  - Unexplored
threatLevel:
dominion: []
owners: []
organizations: []
currentLocation: []
associatedQuest:
associatedAdventure:
---

> [!infobox | no-blending black]+ <font color="#ffffff">Infobox</font>
>
> `VIEW[!{art}][text(renderMarkdown)]`
>
> # Info
> | |
> |---|---|
> | **Aliases** | `VIEW[{aliases}][text]` |
> | **Type** | `VIEW[{poiType}][text]` |
> | **Status** | `VIEW[{status}][text]` |
> | **Threat Level** | `VIEW[{threatLevel}][text]` |
> | **Dominion** | `VIEW[{dominion}][link]` |
> | **Owners** | `VIEW[{owners}][link]` |
> | **Organizations** | `VIEW[{organizations}][link]` |
> | **Location** | `VIEW[{currentLocation}][link]` |
>
> # [[Travel Calculator]]
> | |
> |---|---|
> | **TBD** | `VIEW[round(52 / (({Travel Calculator#MilesPerHour}*{Travel Calculator#HoursPerDay})*{Travel Calculator#SpeedMultiplier}),1)]` Day(s)
> | **TBD** | `VIEW[round(0.5 / ({Travel Calculator#MilesPerHour} * {Travel Calculator#SpeedMultiplier}) * 60, 1)]` Minute(s)

# `=this.file.name`

> [!quote]- Scene Introduction
> A script to read from when the party arrives for the first time to set the scene.

> *<font color="#7f7f7f">Summarize the point of interest, describing what it is, why it stands out, and its importance to the area or story.</font>*

## Database

![[z_Databases/Locations/Database - POI Note.base]]

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

### Hand-Drawn / Dungeon Map

`VIEW[!{mapSketch}][text(renderMarkdown)]`

## Layout & Structure

> *<font color="#7f7f7f">Describe the layout of this location. How many floors, rooms, or distinct areas does it have? What are the defining structural features?</font>*

| Area / Floor | Description | Status | Notable Feature |
| ------------ | ----------- | ------ | --------------- |
| | | | |
| | | | |

## Encounters

### Inhabitants

> *<font color="#7f7f7f">Who or what currently occupies this location? Note any factions, creatures, or individuals of interest.</font>*

### Key Encounters

| Room / Area | Encounter | CR | Notes |
| ----------- | --------- | -- | ----- |
| | | | |
| | | | |

### Traps & Hazards

> *<font color="#7f7f7f">Detail any traps, environmental hazards, or magical dangers the party may face.</font>*

## Treasure & Loot

| Name | Type | Value | Location |
| ---- | ---- | ----- | -------- |
| | | | |

## Present

### Current Events

- *<font color="#7f7f7f">Example Quest — summary of a quest the party can get involved in.</font>*

## Past

### History

> *<font color="#7f7f7f">Describe the history of this point of interest, including its origin, past uses, and any significant events that shaped it.</font>*

### Secrets, Rumours & Legends

> *<font color="#7f7f7f">Detail the secrets, rumors, and legends tied to this location.</font>*

## Session Visits

```dataview
TABLE WITHOUT ID
  file.link as "Session",
  sessionNumber as "#",
  sessionDate as "Date",
  summary as "Summary"
FROM "Campaign/Parties/Session Notes"
WHERE econtains(tags,"SessionNote") AND contains(file.outlinks, this.file.link)
SORT sessionNumber DESC
LIMIT 5
```

## Notes

