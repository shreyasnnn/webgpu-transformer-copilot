# Phase 03 — Primary Winding Design
## File: 03-variables.md

> **Scope:** Every engineering variable in Phase 3. Listed in first-introduction order.
> For exact formulas see `01-formulas.md`. For rounding see `05-rounding.md`.

---

## Variable Reference Table

| #  | Variable Name          | Purpose                                                   | Type     | Unit   | Default | User Editable |
|----|------------------------|-----------------------------------------------------------|----------|--------|---------|---------------|
| 1  | `vaOutput`             | VA capacity entering Phase 3                              | Derived  | VA     | —       | Yes (override)|
| 2  | `vPriUsed`             | Primary voltage entering Phase 3                          | Derived  | V      | —       | Yes (override)|
| 3  | `delta`                | Current density                                           | Input    | A/mm²  | 2.5     | Yes           |
| 4  | `iPri`                 | Computed primary current                                  | Derived  | A      | —       | Yes (override)|
| 5  | `priArea`              | Required conductor cross-sectional area                   | Derived  | mm²    | —       | No (internal) |
| 6  | `priInsAdd`            | Insulation increment added to bare diameter               | Input    | mm     | 0.1     | Yes           |
| 7  | `bareDiaPri`           | Target bare wire diameter (from area)                     | Derived  | mm     | —       | Yes (override)|
| 8  | `priBareDiaUsed`       | Bare diameter read back from DOM field                    | Derived  | mm     | —       | No (internal) |
| 9  | `priBareStd`           | Bare diameter truncated to 1 decimal                      | Derived  | mm     | —       | No (internal) |
| 10 | `insDiaPri`            | Calculated insulated wire diameter                        | Derived  | mm     | —       | Yes (override)|
| 11 | `insDiaPriUsed`        | Insulated diameter read from active field                 | Derived  | mm     | —       | Yes (override)|
| 12 | `isPriFlat`            | Wire type flag: true=flat, false=round                    | Derived  | bool   | false   | Yes (radio)   |
| 13 | `priFlatBreadth`       | Flat wire breadth dimension                               | Input    | mm     | None    | Yes           |
| 14 | `priFlatHeight`        | Flat wire height dimension                                | Input    | mm     | None    | Yes           |
| 15 | `priParallel`          | Number of parallel flat conductors                        | Input    | count  | 1       | Yes           |
| 16 | `enteredArea_pri`      | Single flat conductor cross-sectional area                | Derived  | mm²    | —       | No (display)  |
| 17 | `priEffectiveHeight`   | Total effective height of parallel flat conductor stack   | Derived  | mm     | —       | No (JS var)   |
| 18 | `priEffectiveArea`     | Total effective area of parallel flat conductor           | Derived  | mm²    | —       | No (display)  |
| 19 | `priTurnsUsed`         | Total primary turns from Phase 1                          | Derived  | turns  | —       | Yes (override)|
| 20 | `limbsCount`           | Number of transformer limbs                               | Input    | count  | 2       | Yes           |
| 21 | `priTurnsLimb`         | Primary turns distributed per limb                        | Derived  | turns  | —       | Yes (override)|
| 22 | `priTurnsLimbUsed`     | Turns/limb read back from DOM field                       | Derived  | turns  | —       | No (internal) |
| 23 | `bobbinHeightPri`      | Primary bobbin overall height                             | Input    | mm     | None    | Yes           |
| 24 | `bobbinFlange`         | Bobbin flange deduction per side                          | Input    | mm     | 7       | Yes           |
| 25 | `priSafetyMargin`      | Safety turns deducted from TPL                            | Input    | turns  | 1       | Yes           |
| 26 | `priWindingLen`        | Effective winding length = bobbinH - bobbinFlange         | Derived  | mm     | —       | No (internal) |
| 27 | `priTPL`               | Primary turns per layer                                   | Derived  | turns  | —       | Yes (override)|
| 28 | `priTPLUsed`           | TPL read back from DOM field                              | Derived  | turns  | —       | No (internal) |
| 29 | `priLayers`            | Number of primary winding layers                          | Derived  | count  | —       | Yes (override)|
| 30 | `priLayersUsed`        | Layers read back from DOM field                           | Derived  | count  | —       | No (internal) |
| 31 | `paperThickness`       | Interlayer paper insulation thickness                     | Input    | mm     | 0.127   | Yes           |
| 32 | `priPaperLayers`       | Number of paper insulation layers                         | Input    | count  | 4       | Yes           |
| 33 | `priRadBuild`          | Unceiled primary radial build thickness                   | Derived  | mm     | —       | No (internal) |
| 34 | `priRadUsed`           | Ceiled radial thickness read from DOM field               | Derived  | mm     | —       | Yes (override)|
| 35 | `coilClearance`        | Gap between core and first winding surface                | Input    | mm     | 3.5     | Yes           |
| 36 | `innerW`               | Inner coil winding width                                  | Derived  | mm     | —       | No (JS only)  |
| 37 | `innerL`               | Inner coil winding length                                 | Derived  | mm     | —       | No (JS only)  |
| 38 | `priOuterW`            | Outer winding perimeter width                             | Derived  | mm     | —       | No (internal) |
| 39 | `priOuterL`            | Outer winding perimeter length                            | Derived  | mm     | —       | No (internal) |
| 40 | `priLMT`               | Primary mean turn length (unrounded)                      | Derived  | m      | —       | Yes (override)|
| 41 | `priLMTUsed`           | LMT read back from DOM field                              | Derived  | m      | —       | No (internal) |
| 42 | `priActualArea`        | Circular conductor area used for weight                   | Derived  | mm²    | —       | No (internal) |
| 43 | `rhoCu`                | Conductor material density                                | Input    | g/cc   | 8.89    | Yes           |
| 44 | `priWeight`            | Total primary conductor weight                            | Derived  | kg     | —       | Yes (override)|

---

## Detailed Descriptions for Key Variables

### `conductorMaterial` (selector — not a calculation variable)
- **Field ID:** `#conductorMaterial`
- **Type:** UI selector (drives `rhoCu` value)
- **Options:** "Copper" (default) / "Aluminium"
- **Effect:** When changed, triggers a `change` event listener that sets `#rhoCu` to
  `8.89` (Copper) or `2.703` (Aluminium) and dispatches a synthetic `input` event
  to retrigger the full calculation chain.
- **Part of baseConstants:** YES

### `rhoCu`
- **Field ID:** `#rhoCu`
- **Default:** `8.89` g/cc (Copper). Set to `2.703` g/cc when Aluminium is selected.
- **Part of baseConstants:** YES — never cleared by cascade reset
- **Used In:** Step 10G (weight formula as density)
- **Note:** The field label is `rhoCu` in code but it stores the density of whichever
  conductor material is currently selected (Copper OR Aluminium).

### `priEffectiveHeight` (JS variable — never written to DOM as a calculation input)
- Only `#priEffectiveHeightOutput` is written (read-only display field).
- The variable `priEffectiveHeight` lives only in JS memory and is passed to:
  - Step 9 radial build (flat path)
  - The `#priEffectiveHeightOutput` read-only display field

### `innerW` and `innerL` (JS variables — never written to DOM)
- Computed in Step 10 as intermediate values.
- Passed as in-memory JS variables to Phase 5 Step 17 (secondary LMT).
- Because `calculate()` is a single monolithic function, these variables remain in scope
  across all steps in the same execution. They are NOT re-computed in Phase 5.

---

## baseConstants Membership (Phase 3 Fields)

| Field ID            | In baseConstants? |
|---------------------|-------------------|
| `delta`             | YES               |
| `priInsAddition`    | YES               |
| `limbsCount`        | YES               |
| `bobbinHeightPri`   | YES               |
| `bobbinFlange`      | YES               |
| `priSafetyMargin`   | YES               |
| `paperThickness`    | YES               |
| `priPaperLayers`    | YES               |
| `coilClearance`     | YES               |
| `rhoCu`             | YES               |
| `conductorMaterial` | YES               |
| `priParallel`       | YES               |
| All derived outputs | NO                |
