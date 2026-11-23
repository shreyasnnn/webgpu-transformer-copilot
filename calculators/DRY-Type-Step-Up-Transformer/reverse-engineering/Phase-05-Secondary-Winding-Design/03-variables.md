# Phase 05 — Secondary Winding Design
## File: 03-variables.md

> **Scope:** Every engineering variable in Phase 5. Listed in first-introduction order.
> Variables shared with Phase 3 are noted — full definitions are in Phase 3 documents.
> For exact formulas see `01-formulas.md`. For rounding see `05-rounding.md`.

---

## Variable Reference Table

| #  | Variable Name          | Purpose                                                         | Type     | Unit  | Default | User Editable |
|----|------------------------|-----------------------------------------------------------------|----------|-------|---------|---------------|
| 1  | `iSecInputCalc`        | Secondary current — read directly from #iSecInput               | Input    | A     | None    | Yes           |
| 2  | `delta`                | Current density (shared with Phase 3)                           | Input    | A/mm² | 2.5     | Yes           |
| 3  | `aSec`                 | Required secondary conductor cross-sectional area               | Derived  | mm²   | —       | No (internal) |
| 4  | `secInsAdd`            | Secondary insulation increment (NOTE: default 0.01, not 0.1)    | Input    | mm    | 0.01    | Yes           |
| 5  | `bareDiaSec`           | Target bare wire diameter                                       | Derived  | mm    | —       | Yes (override)|
| 6  | `secBareDiaUsed`       | Bare diameter read back from DOM field                          | Derived  | mm    | —       | No (internal) |
| 7  | `secBareStd`           | Bare diameter truncated to 1 decimal                            | Derived  | mm    | —       | No (internal) |
| 8  | `secInsDia`            | Calculated insulated wire diameter                              | Derived  | mm    | —       | Yes (override)|
| 9  | `insDiaSecUsed`        | Insulated diameter read from active override field              | Derived  | mm    | —       | Yes (override)|
| 10 | `isSecFlat`            | Wire type flag: true=flat, false=round                          | Derived  | bool  | false   | Yes (radio)   |
| 11 | `secFlatBreadth`       | Flat wire breadth dimension                                     | Input    | mm    | None    | Yes           |
| 12 | `secFlatHeight`        | Flat wire height dimension                                      | Input    | mm    | None    | Yes           |
| 13 | `secParallel`          | Number of parallel flat conductors                              | Input    | count | 1       | Yes           |
| 14 | `secEffectiveHeight`   | Total effective height of parallel flat conductor stack         | Derived  | mm    | —       | No (JS var)   |
| 15 | `secTurnsUsed`         | Total secondary turns from Phase 1                              | Derived  | turns | —       | Yes (override)|
| 16 | `limbsCount`           | Number of transformer limbs (shared with Phase 3)               | Input    | count | 2       | Yes           |
| 17 | `secTurnsLimb`         | Secondary turns distributed per limb                            | Derived  | turns | —       | Yes (override)|
| 18 | `secTurnsLimbUsed`     | Turns/limb read back from DOM field                             | Derived  | turns | —       | No (internal) |
| 19 | `bobbinHeightSec`      | Secondary bobbin overall height — SEPARATE from bobbinHeightPri | Input    | mm    | None    | Yes           |
| 20 | `bobbinFlange`         | Bobbin flange deduction (shared with Phase 3)                   | Input    | mm    | 7       | Yes           |
| 21 | `secSafetyMargin`      | Safety turns deducted from secondary TPL (NOTE: default 0)      | Input    | turns | 0       | Yes           |
| 22 | `secWindingLen`        | Available winding length on secondary bobbin                    | Derived  | mm    | —       | No (internal) |
| 23 | `secTPL`               | Secondary turns per layer                                       | Derived  | turns | —       | Yes (override)|
| 24 | `secTPLUsed`           | TPL read back from DOM field                                    | Derived  | turns | —       | No (internal) |
| 25 | `secLayers`            | Number of secondary winding layers                              | Derived  | count | —       | Yes (override)|
| 26 | `secLayersUsed`        | Layers read back from DOM field                                 | Derived  | count | —       | No (internal) |
| 27 | `paperThickness`       | Interlayer paper thickness (shared with Phase 3)                | Input    | mm    | 0.127   | Yes           |
| 28 | `secPaperLayers`       | Number of secondary paper insulation layers                     | Input    | count | 4       | Yes           |
| 29 | `secRadBuild`          | Unceiled secondary radial build thickness                       | Derived  | mm    | —       | No (internal) |
| 30 | `secRadUsed`           | Ceiled radial thickness read from DOM                           | Derived  | mm    | —       | Yes (override)|
| 31 | `innerW`               | Inner coil width from Phase 3 (JS variable)                     | Derived  | mm    | —       | No (JS only)  |
| 32 | `innerL`               | Inner coil length from Phase 3 (JS variable)                    | Derived  | mm    | —       | No (JS only)  |
| 33 | `secOuterW`            | Secondary outer winding width                                   | Derived  | mm    | —       | No (internal) |
| 34 | `secOuterL`            | Secondary outer winding length                                  | Derived  | mm    | —       | No (internal) |
| 35 | `secLMT`               | Secondary mean turn length, unrounded                           | Derived  | m     | —       | Yes (override)|
| 36 | `secLMTUsed`           | LMT read back from DOM field                                    | Derived  | m     | —       | No (internal) |
| 37 | `secActualArea`        | Circular conductor area for weight calculation                  | Derived  | mm²   | —       | No (internal) |
| 38 | `rhoCu`                | Conductor density (shared with Phase 3)                         | Input    | g/cc  | 8.89    | Yes           |
| 39 | `secWeight`            | Total secondary conductor weight                                | Derived  | kg    | —       | Yes (override)|

---

## Critical Differences from Phase 3 Variables

| Aspect                  | Phase 3 (Primary)            | Phase 5 (Secondary)                  |
|-------------------------|------------------------------|--------------------------------------|
| Current derivation      | `iPri = VA / V_pri`          | `iSecInputCalc = g("iSecInput")` directly |
| Insulation default      | `priInsAddition` = 0.1 mm    | `secInsAddition` = **0.01 mm**       |
| Bobbin height field     | `#bobbinHeightPri`           | **`#bobbinHeightSec`** (separate)    |
| Safety margin default   | `priSafetyMargin` = 1        | `secSafetyMargin` = **0**            |
| LMT base dimensions     | inner dimensions of core     | Same `innerW`/`innerL` (not priOuter)|
| Weight field id         | `#priWeightOutput`           | `#secWeightOutput`                   |

---

## Variables Inherited From Earlier Phases (Not Re-documented Here)

| Variable       | Originating Phase   | Full Documentation In                             |
|----------------|---------------------|---------------------------------------------------|
| `delta`        | Phase 3             | Phase-03-Primary-Winding-Design/03-variables.md   |
| `limbsCount`   | Phase 3             | Phase-03-Primary-Winding-Design/03-variables.md   |
| `bobbinFlange` | Phase 3             | Phase-03-Primary-Winding-Design/03-variables.md   |
| `paperThickness`| Phase 3            | Phase-03-Primary-Winding-Design/03-variables.md   |
| `rhoCu`        | Phase 3             | Phase-03-Primary-Winding-Design/03-variables.md   |
| `innerW`       | Phase 3 Step 10     | Phase-03-Primary-Winding-Design/03-variables.md   |
| `innerL`       | Phase 3 Step 10     | Phase-03-Primary-Winding-Design/03-variables.md   |
| `iSecInput`    | Phase 1             | Phase-01-Capacity-and-Electrical-Turns/03-variables.md |
| `secondaryTurns`| Phase 1 Step 4     | Phase-01-Capacity-and-Electrical-Turns/03-variables.md |

---

## baseConstants Membership (Phase 5 Fields)

| Field ID            | In baseConstants? |
|---------------------|-------------------|
| `secInsAddition`    | YES               |
| `bobbinHeightSec`   | YES               |
| `secSafetyMargin`   | YES               |
| `secPaperLayers`    | YES               |
| `secParallel`       | YES               |
| All derived outputs | NO                |
