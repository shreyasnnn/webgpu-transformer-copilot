# Phase 02 — Core Area Dimensions
## File: 04-lookups.md

> **Scope:** Lookup tables referenced in Phase 2 calculations.

---

## Result

**Phase 2 references NO lookup tables.**

Both calculation steps in Phase 2 (Net Core Area and Gross Core Selection) are
computed entirely from direct arithmetic operations using user inputs, defaults,
and hardcoded constants.

The SWG lookup table (`swgTable` in `js/swgData.js`) is NOT used in Phase 2.
It is first accessed in Phase 3 (Step 7) and Phase 5 (Step 15).

---

## Lookup Tables Used in This Project (For Reference)

| Table Name  | Source File       | First Used In    |
|-------------|-------------------|------------------|
| `swgTable`  | `js/swgData.js`   | Phase 3 (Step 7) |

Full documentation of `swgTable` is in:
`Phase-03-Primary-Winding-Design/04-lookups.md`
