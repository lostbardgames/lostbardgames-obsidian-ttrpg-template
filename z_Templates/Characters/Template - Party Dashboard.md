---
tags:
  - Party
art:
aliases:
partyID:
currentLocation:
partyLevel: 1
sessionCount: 0
activeAdventure:
funds_pp: 0
funds_gp: 0
funds_ep: 0
funds_sp: 0
funds_cp: 0
---

# `=this.file.name`

## Current Party

![[z_Databases/Party/Party 1/Database - Party Members.base]]

### Known Party Languages

```dataview
TABLE WITHOUT ID
  A as "Language",
  rows.file.link as "Spoken By"
FROM "Campaign/Characters/Players"
WHERE econtains(tags,"Player") AND econtains(whichParty, this.file.link) AND languages
FLATTEN languages AS A
GROUP BY A
SORT length(rows) DESC
```

## Party Treasury

> [!column|5 no-t]
> **PP:** `INPUT[number:funds_pp]`
>
> **GP:** `INPUT[number:funds_gp]`
>
> **EP:** `INPUT[number:funds_ep]`
>
> **SP:** `INPUT[number:funds_sp]`
>
> **CP:** `INPUT[number:funds_cp]`

## Relations

![[z_Databases/Party/Party 1/Database - Party 1 Relations.base]]

## Active Quests

```dataview
TABLE WITHOUT ID
  file.link as "Quest",
  questType as "Type",
  linkedAdventure as "Adventure",
  reward_gp as "GP Reward",
  completed as "Done"
FROM "Campaign/Parties/Quests"
WHERE econtains(tags,"Quest") AND completed = false
SORT file.name ASC
```

## Active Services

```dataview
TABLE WITHOUT ID
  file.link as "Service",
  provider as "Provider",
  serviceCost as "Cost (gp)",
  fc-date as "Due",
  completed as "Done"
FROM "Campaign/Parties/Service Requests"
WHERE econtains(tags,"Service") AND completed = false
SORT file.name ASC
```

## Story

![[z_Databases/Party/Party 1/Database - Story.base]]

## Session Log

```dataview
TABLE WITHOUT ID
  file.link as "Session",
  sessionNumber as "#",
  sessionDate as "Date",
  summary as "Summary"
FROM "Campaign/Parties/Session Notes/Party 1"
WHERE econtains(tags,"SessionNote")
SORT sessionNumber DESC
LIMIT 5
```

## Notes

