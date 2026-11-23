# Phase 05 — Secondary Winding Design
## File: 04-lookups.md

> **Scope:** Lookup tables and helper functions used in Phase 5.

---

## Lookups Used in Phase 5

Phase 5 uses the same two lookup mechanisms as Phase 3:

### getSWGForCurrent (used in Step 15)
```
secSWG = getSWGForCurrent(iSecInputCalc)
```
- Called with the secondary current in Amperes
- Returns the nearest SWG integer from `swgTable`
- If SWG <= 13: flat wire section shown for secondary
- If SWG > 13: flat wire section hidden, round radio forced

### generateStripSuggestions (used in Step 15)
```
generateStripSuggestions(aSec)
```
- Called with the computed secondary conductor area (`aSec`)
- Returns integer factor-pair dimension strings (e.g. `"18 x 1 mm | 9 x 2 mm"`)
- Written to `#secStripSuggestions` — display only

---

## Full Documentation Reference

Both functions and the complete `swgTable` are first introduced in Phase 3 and fully
documented in: `Phase-03-Primary-Winding-Design/04-lookups.md`

No new lookup tables are introduced in Phase 5.
