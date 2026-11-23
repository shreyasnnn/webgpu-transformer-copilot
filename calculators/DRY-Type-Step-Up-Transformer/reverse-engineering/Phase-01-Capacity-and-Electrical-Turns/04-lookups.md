# Phase 01 — Capacity & Electrical Turns
## File: 04-lookups.md

> **Scope:** Lookup tables referenced in Phase 1 calculations.

---

## Result

**Phase 1 references NO lookup tables.**

All four calculation steps in Phase 1 (VA, kVA, Volts Per Turn, Primary Turns,
Secondary Turns) are computed entirely from direct arithmetic operations on user
inputs and previously derived values.

The SWG lookup table (`swgTable` in `js/swgData.js`) is NOT used in Phase 1.
It is first accessed in Phase 3 (Step 7) and Phase 5 (Step 15) for conductor
wire gauge selection.

---

## Lookup Tables Used in This Project (For Reference)

| Table Name  | Source File       | First Used In |
|-------------|-------------------|---------------|
| `swgTable`  | `js/swgData.js`   | Phase 3 (Step 7) |

Full documentation of `swgTable` is in:
`Phase-03-Primary-Winding-Design/04-lookups.md`
