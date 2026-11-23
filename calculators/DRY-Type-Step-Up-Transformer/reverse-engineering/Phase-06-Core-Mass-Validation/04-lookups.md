# Phase 06 — Core Mass Validation
## File: 04-lookups.md

> **Scope:** Lookup tables referenced in Phase 6 calculations.

---

## Result

**Phase 6 references NO lookup tables.**

Step 18 is a direct arithmetic calculation — actual net area, frame perimeter, and
core mass are all computed from user inputs and shared constants. No SWG table,
strip suggestion helper, or any other lookup is used.

---

## Lookup Tables Used in This Project (For Reference)

| Table Name  | Source File     | First Documented In                           |
|-------------|-----------------|-----------------------------------------------|
| `swgTable`  | `js/swgData.js` | Phase-03-Primary-Winding-Design/04-lookups.md |
