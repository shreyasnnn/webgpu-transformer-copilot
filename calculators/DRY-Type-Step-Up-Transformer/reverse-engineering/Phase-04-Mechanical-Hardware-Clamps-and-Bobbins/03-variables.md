# Phase 04 — Mechanical Hardware (Clamps & Bobbins)
## File: 03-variables.md

> **Scope:** Every engineering variable in Phase 4. Listed in first-introduction order.
> For exact formulas see `01-formulas.md`. For rounding see `05-rounding.md`.

---

## Variable Reference Table

| #  | Variable Name           | Purpose                                                   | Type     | Unit  | Default | User Editable |
|----|-------------------------|-----------------------------------------------------------|----------|-------|---------|---------------|
| 1  | `tbobbinClamp`          | Bobbin wall thickness used for clamp span calculation     | Input    | mm    | 3.5     | Yes           |
| 2  | `priRadUsed`            | Primary radial winding thickness (from Phase 3)           | Derived  | mm    | —       | Yes (override)|
| 3  | `extraSpaceClamp`       | Extra clearance margin per side of clamp span             | Input    | mm    | 9       | Yes           |
| 4  | `centerGapClamp`        | Center gap between winding slots in clamp                 | Input    | mm    | 10      | Yes           |
| 5  | `tongueWidth`           | Core tongue width (from Phase 2)                          | Input    | mm    | None    | Yes           |
| 6  | `aClamp`                | Computed clamp internal span width                        | Derived  | mm    | —       | Yes (override)|
| 7  | `aClampUsed`            | Clamp span read back from DOM after write                 | Derived  | mm    | —       | No (internal) |
| 8  | `clampLen`              | Total clamp plate length                                  | Derived  | mm    | —       | Yes (override)|
| 9  | `clampLenUsed`          | Clamp length read from DOM for weight calculation         | Derived  | mm    | —       | No (internal) |
| 10 | `bendingDed`            | Bending deduction from tongue width for clamp width       | Input    | mm    | 10      | Yes           |
| 11 | `msThick`               | Mild steel plate thickness for L-clamp                    | Input    | mm    | 3       | Yes           |
| 12 | `rhoMS`                 | Mild steel density                                        | Input    | g/cc  | 7.85    | Yes           |
| 13 | `clampQty`              | Number of L-clamp plates in assembly                      | Input    | count | 4       | Yes           |
| 14 | `clampWidth`            | Computed clamp plate width                                | Derived  | mm    | —       | Yes (override)|
| 15 | `clampWidthUsed`        | Clamp width read back from DOM                            | Derived  | mm    | —       | No (internal) |
| 16 | `wClampPer`             | Mass of one L-clamp plate                                 | Derived  | kg    | —       | No (internal) |
| 17 | `totalClampWt`          | Total mass of all L-clamp plates                          | Derived  | kg    | —       | Yes (override)|
| 18 | `coreGapBobbin`         | Gap between bobbin inner wall and core surface            | Input    | mm    | 2       | Yes           |
| 19 | `tapeBufferBobbin`      | Tape/clearance buffer beyond primary winding              | Input    | mm    | 10      | Yes           |
| 20 | `stackHeight`           | Core stack height (from Phase 2)                          | Input    | mm    | None    | Yes           |
| 21 | `bobbinHeightPri`       | Primary bobbin overall height (from Phase 3)              | Input    | mm    | None    | Yes           |
| 22 | `bobbinInnerW`          | Bobbin cavity inner width                                 | Derived  | mm    | —       | No (JS only)  |
| 23 | `bobbinInnerL`          | Bobbin cavity inner length (= stackHeight directly)       | Derived  | mm    | —       | No (JS only)  |
| 24 | `bobbinOuterClear`      | Outer clearance beyond winding edge to bobbin wall        | Derived  | mm    | —       | Yes (override)|
| 25 | `bobbinOuterClearUsed`  | Outer clearance read back from DOM                        | Derived  | mm    | —       | No (internal) |
| 26 | `bobbinOuterW`          | Bobbin outer overall width                                | Derived  | mm    | —       | No (JS only)  |
| 27 | `bobbinOuterL`          | Bobbin outer overall length                               | Derived  | mm    | —       | No (JS only)  |
| 28 | `tbobbinMat`            | Bobbin material plate thickness                           | Input    | mm    | 3       | Yes           |
| 29 | `rhoBobbin`             | Bobbin material density                                   | Input    | g/cc  | 2.20    | Yes           |
| 30 | `aFlange`               | Cross-sectional area of one flange plate                  | Derived  | mm²   | —       | No (internal) |
| 31 | `wFlange`               | Mass of one flange plate                                  | Derived  | kg    | —       | No (readonly) |
| 32 | `wWallLong`             | Mass of one long side wall                                | Derived  | kg    | —       | No (readonly) |
| 33 | `wWallShort`            | Mass of one short side wall                               | Derived  | kg    | —       | No (readonly) |
| 34 | `wSingleBobbin`         | Total mass of one complete bobbin                         | Derived  | kg    | —       | No (internal) |
| 35 | `totalBobbinWt`         | Total mass of all bobbins for all limbs                   | Derived  | kg    | —       | Yes (override)|
| 36 | `limbsCount`            | Number of transformer limbs (from Phase 3)                | Input    | count | 2       | Yes           |

---

## Key Notes on Variable Scope

### Variables Never Written to DOM as Calculation Fields
The following variables are computed as intermediate JS values within `calculate()`
but are NEVER written to editable DOM fields. They cannot be overridden by the user:

- `bobbinInnerW` — computed in Step 13A. Used by SVG labels and Step 14.
- `bobbinInnerL` — assigned from `stackHeight` in Step 13B. Used by SVG labels and Step 14.
- `bobbinOuterW` — computed in Step 13D. Used by SVG labels and Step 14.
- `bobbinOuterL` — computed in Step 13E. Used by SVG labels and Step 14.
- `wClampPer` — computed in Step 12B. Used only to compute `totalClampWt`.
- `aFlange`, `wFlange`, `wWallLong`, `wWallShort`, `wSingleBobbin` — all internal.

`wFlange` and `wWallLong/wWallShort` ARE written to readonly display fields
(`#flangeWtOutput`, `#wallWtOutput`) but these fields are marked `readonly` in HTML
and NOT user-editable. They do not participate in further calculation reads.

### SVG Label Variables
The SVG `textContent` strings are NOT tracked as DOM editable fields. They are
write-only operations from the calculation to the SVG. The underlying engineering
values (`bobbinInnerW`, etc.) remain as JS variables.

---

## baseConstants Membership (Phase 4 Fields)

| Field ID              | In baseConstants? |
|-----------------------|-------------------|
| `tbobbinClamp`        | YES               |
| `extraSpaceClamp`     | YES               |
| `centerGapClamp`      | YES               |
| `bendingDeduction`    | YES               |
| `msThickness`         | YES               |
| `rhoMS`               | YES               |
| `clampQty`            | YES               |
| `coreGapBobbin`       | YES               |
| `tapeBufferBobbin`    | YES               |
| `tbobbinMat`          | YES               |
| `rhoBobbin`           | YES               |
| All derived outputs   | NO                |
