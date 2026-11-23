# Phase 06 — Core Mass Validation
## File: 03-variables.md

> **Scope:** Every engineering variable in Phase 6. Listed in first-introduction order.
> Variables inherited from earlier phases are cross-referenced.
> For exact formulas see `01-formulas.md`. For rounding see `05-rounding.md`.

---

## Variable Reference Table

| #  | Variable Name          | Purpose                                                          | Type     | Unit  | Default | User Editable |
|----|------------------------|------------------------------------------------------------------|----------|-------|---------|---------------|
| 1  | `selectedArea`         | Core cross-sectional area from Phase 2 Step 5 (JS var)           | Derived  | mm²   | —       | Yes (Phase 2 override) |
| 2  | `finalCoreSf`          | Final stacking factor applied to selectedArea                    | Input    | ratio | 0.98    | Yes           |
| 3  | `actualNetArea`        | Rounded actual net core area (computed in JS memory)             | Derived  | mm²   | —       | No (display only — NOT re-read) |
| 4  | `tongueWidth`          | Core tongue width (Phase 2 — used to auto-populate coreD)        | Input    | mm    | None    | Yes (Phase 2) |
| 5  | `stackHeight`          | Core stack height (Phase 2 — used to auto-populate coreST)       | Input    | mm    | None    | Yes (Phase 2) |
| 6  | `coreD`                | Mean path segment D of lamination frame                          | Input    | mm    | tongueWidth | Yes      |
| 7  | `coreL`                | Mean path segment L of lamination frame                          | Input    | mm    | None    | Yes           |
| 8  | `coreA`                | Mean path segment A of lamination frame                          | Input    | mm    | None    | Yes           |
| 9  | `coreST`               | Mean path segment ST of lamination frame                         | Input    | mm    | stackHeight | Yes      |
| 10 | `framePerimeterCalc`   | Total frame perimeter (computed in JS memory — NOT re-read)      | Derived  | mm    | —       | No (display only — NOT re-read) |
| 11 | `rhoSteel`             | Electrical steel density                                         | Input    | g/cc  | 7.65    | Yes           |
| 12 | `coreMass`             | Total core steel mass                                            | Derived  | kg    | —       | Yes (override)|

---

## Critical DOM Behavior Notes

### actualNetArea — Written but NOT Read Back
- Written to `#actualNetAreaOutput` via `auto()` for display purposes.
- **NOT re-fetched** with `g()` before the mass formula.
- Overriding `#actualNetAreaOutput` in the UI has no effect on `coreMass`.
- The JS memory variable `actualNetArea` is used directly in the mass formula.
- This is documented in app.js with a "CRITICAL FIX" comment (line 568).

### framePerimeterCalc — Written but NOT Read Back
- Written to `#framePerimeterOutput` via `auto()` for display purposes.
- **NOT re-fetched** with `g()` before the mass formula.
- Overriding `#framePerimeterOutput` in the UI has no effect on `coreMass`.
- The JS memory variable `framePerimeterCalc` is used directly.

### coreMass — Written AND Can Be Overridden
- Written to `#coreMassOutput` via `auto()`.
- This field IS user-overridable (carries `data-edited` tracking).
- Its value IS read by Phase 7 cost module from the DOM.

---

## coreD and coreST — Auto-Populated But User-Editable

| Field   | Auto-populated From | Auto-populate Mechanism        |
|---------|---------------------|--------------------------------|
| `coreD` | `tongueWidth`       | `auto("coreD", tongueWidth)`   |
| `coreST`| `stackHeight`       | `auto("coreST", stackHeight)`  |

These use the standard `auto()` function — if the user has set `data-edited` on
the field, the auto-population is suppressed and the user value is preserved.

`coreL` and `coreA` have NO auto-population. They start empty and must be entered
manually by the user. `framePerimeterCalc` remains null until all four are filled.

---

## Variables Inherited From Earlier Phases

| Variable       | Originating Phase   | Full Documentation In                              |
|----------------|---------------------|----------------------------------------------------|
| `selectedArea` | Phase 2 Step 5      | Phase-02-Core-Area-Dimensions/03-variables.md      |
| `tongueWidth`  | Phase 2             | Phase-02-Core-Area-Dimensions/03-variables.md      |
| `stackHeight`  | Phase 2             | Phase-02-Core-Area-Dimensions/03-variables.md      |

---

## baseConstants Membership (Phase 6 Fields)

| Field ID              | In baseConstants? |
|-----------------------|-------------------|
| `finalCoreSf`         | YES               |
| `rhoSteel`            | YES               |
| `coreD`               | YES               |
| `coreL`               | YES               |
| `coreA`               | YES               |
| `coreST`              | YES               |
| All derived outputs   | NO                |
