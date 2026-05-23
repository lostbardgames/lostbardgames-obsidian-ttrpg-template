---
tags:
  - Location
  - POI
  - Shop
mapmarker:
art: "[[PlaceholderPOI.png]]"
aliases:
poiType:
  - Shop
shopType:
dominion: []
owners: []
assistants: []
organizations: []
currentLocation: []
tradePartners:
priceModifier: "1x (Standard)"
---

> [!infobox | no-blending black]+ <font color="#ffffff">Infobox</font>
>
> `VIEW[!{art}][text(renderMarkdown)]`
>
> # Info
> | |
> |---|---|
> | **Aliases** | `VIEW[{aliases}][text]` |
> | **Type** | `VIEW[{shopType}][text]` |
> | **Dominion** | `VIEW[{dominion}][link]` |
> | **Owners** | `VIEW[{owners}][link]` |
> | **Assistants** | `VIEW[{assistants}][link]` |
> | **Organizations** | `VIEW[{organizations}][link]` |
> | **Location** | `VIEW[{currentLocation}][link]` |
> | **Price Modifier** | `VIEW[{priceModifier}][text]` |
>
> # [[Travel Calculator]]
> | |
> |---|---|
> | **TBD** | `VIEW[round(52 / (({Travel Calculator#MilesPerHour}*{Travel Calculator#HoursPerDay})*{Travel Calculator#SpeedMultiplier}),1)]` Day(s)
> | **TBD** | `VIEW[round(0.5 / ({Travel Calculator#MilesPerHour} * {Travel Calculator#SpeedMultiplier}) * 60, 1)]` Minute(s)

# `=this.file.name`

> [!quote]- Scene Introduction
> A script to read from when the party arrives to this shop for the first time to set the scene.

> *<font color="#7f7f7f">Summarize the shop, describing what it sells, what makes it stand out, and its importance to the area or story.</font>*

## Database

![[z_Databases/Locations/Database - POI Note.base]]

## Goods & Services

### Goods

| Name | Price (gp) | Information / Description |
| ---- | ---------- | ------------------------- |
| Example | 0.1 | |

### Services

| Name | Price (gp) | Information / Description |
| ---- | ---------- | ------------------------- |
| Example | 0.1 | |

## Present

### Local Inhabitants (Random Encounter)

| `dice: 1d20\|noform` (Result) | Name | Information / Description |
| ------------------------------ | ---- | ------------------------- |
| 1 | Example | |

### Trade Deals

<font color="#ffc000">**Trade Partners:**</font> `VIEW[{tradePartners}][link]`

> *<font color="#7f7f7f">Detail any significant trade deals this shop is currently engaging in.</font>*

### Current Events

- *<font color="#7f7f7f">Example Quest — summary of a quest the party can get involved in.</font>*
- *<font color="#7f7f7f">Example Event — summary of an ongoing event in or around this shop.</font>*

## Past

### History

> *<font color="#7f7f7f">Describe the history of this shop, including its origin, past uses, and any significant events that shaped it.</font>*

### Secrets, Rumours & Legends

> *<font color="#7f7f7f">Detail the secrets, rumors, and legends tied to this shop.</font>*

## Notes

