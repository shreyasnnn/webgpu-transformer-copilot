# Phase 04 — Mechanical Hardware (Clamps & Bobbins)
## File: 07-inputs.md

> **Scope:** Every user-facing input that directly participates in Phase 4 calculations.
> Inputs shared with earlier phases (tongueWidth, stackHeight, priRadUsed, bobbinHeightPri,
> limbsCount) are cross-referenced here but fully documented in their originating phase.

---

## Primary User Inputs (Required — No Default) — From Earlier Phases

### Input 1 — Tongue Width (from Phase 2)
- **Field ID:** `#tongueWidth`
- **Phase where documented:** Phase-02-Core-Area-Dimensions/07-inputs.md
- **Used in Phase 4 Steps:** 11A, 11B, 12A, 13A
- **Role:** Core tongue width — used in clamp span, clamp length, clamp width, and bobbin inner width.

### Input 2 — Stack Height (from Phase 2)
- **Field ID:** `#stackHeight`
- **Phase where documented:** Phase-02-Core-Area-Dimensions/07-inputs.md
- **Used in Phase 4 Steps:** 13B (bobbinInnerL = stackHeight), 14C, 14D
- **Role:** Directly assigned as bobbin inner length. Used in wall weight calculations.

### Input 3 — Primary Radial Thickness (from Phase 3 Step 9)
- **Field ID:** `#priRadialOutput`
- **Phase where documented:** Phase-03-Primary-Winding-Design/07-inputs.md
- **Used in Phase 4 Steps:** 11A (clamp span), 13C (bobbin outer clearance)
- **Role:** Active engineering output of Phase 3 consumed as input by Phase 4.

### Input 4 — Primary Bobbin Height (from Phase 3 user input)
- **Field ID:** `#bobbinHeightPri`
- **Phase where documented:** Phase-03-Primary-Winding-Design/07-inputs.md
- **Used in Phase 4 Steps:** SVG label `h` (Step 13), 14C, 14D (wall weights)
- **Role:** Used in wall weight calculations and the SVG height label.

### Input 5 — Limbs Count (from Phase 3 user input)
- **Field ID:** `#limbsCount`
- **Phase where documented:** Phase-03-Primary-Winding-Design/07-inputs.md
- **Used in Phase 4 Steps:** 14F (total bobbin weight multiplier)

---

## Configurable Design Constants — Phase 4 Specific (Have Defaults — User May Change)

### Input 6 — Bobbin Wall Thickness for Clamp Calc

| Property             | Value                                                               |
|----------------------|---------------------------------------------------------------------|
| UI Label             | Bobbin Wall Thickness (mm)                                          |
| Field ID             | `#tbobbinClamp`                                                     |
| Variable Name        | `tbobbinClamp`                                                      |
| Data Type            | Number (float)                                                      |
| Unit                 | mm                                                                  |
| Default Value        | `3.5` (set in HTML `value` attribute)                               |
| Required             | Yes — fallback to `3.5` via `|| 3.5` if null                        |
| User Editable        | Yes                                                                 |
| HTML Attributes      | `type="number"`, `step="any"`, `value="3.5"`, `inputmode="decimal"` |
| Part of baseConstants| YES                                                                 |
| Used In Steps        | Step 11A (`2 * tbobbinClamp` in clamp span formula)                 |

---

### Input 7 — Extra Space Per Side of Clamp

| Property             | Value                                                              |
|----------------------|--------------------------------------------------------------------|
| UI Label             | Extra Space / Side (mm)                                            |
| Field ID             | `#extraSpaceClamp`                                                 |
| Variable Name        | `extraSpaceClamp`                                                  |
| Data Type            | Number (float)                                                     |
| Unit                 | mm                                                                 |
| Default Value        | `9` (set in HTML `value` attribute)                                |
| Required             | Yes — fallback to `9` via `|| 9` if null                           |
| User Editable        | Yes                                                                |
| HTML Attributes      | `type="number"`, `step="any"`, `value="9"`, `inputmode="decimal"`  |
| Part of baseConstants| YES                                                                |
| Used In Steps        | Step 11A (`2 * extraSpaceClamp` in clamp span formula)             |

---

### Input 8 — Center Gap Between Winding Slots

| Property             | Value                                                              |
|----------------------|--------------------------------------------------------------------|
| UI Label             | Center Gap (mm)                                                    |
| Field ID             | `#centerGapClamp`                                                  |
| Variable Name        | `centerGapClamp`                                                   |
| Data Type            | Number (float)                                                     |
| Unit                 | mm                                                                 |
| Default Value        | `10` (set in HTML `value` attribute)                               |
| Required             | Yes — fallback to `10` via `|| 10` if null                         |
| User Editable        | Yes                                                                |
| HTML Attributes      | `type="number"`, `step="any"`, `value="10"`, `inputmode="decimal"` |
| Part of baseConstants| YES                                                                |
| Used In Steps        | Step 11A (`+ centerGapClamp` in clamp span formula)                |

---

### Input 9 — Bending Deduction

| Property             | Value                                                              |
|----------------------|--------------------------------------------------------------------|
| UI Label             | Bending Deduction (mm)                                             |
| Field ID             | `#bendingDeduction`                                                |
| Variable Name        | `bendingDed`                                                       |
| Data Type            | Number (float)                                                     |
| Unit                 | mm                                                                 |
| Default Value        | `10` (set in HTML `value` attribute)                               |
| Required             | Yes — fallback to `10` via `|| 10` if null                         |
| User Editable        | Yes                                                                |
| HTML Attributes      | `type="number"`, `step="any"`, `value="10"`, `inputmode="decimal"` |
| Part of baseConstants| YES                                                                |
| Used In Steps        | Step 12A (`clampWidth = tongueWidth + (tongueWidth - bendingDed)`) |

---

### Input 10 — Mild Steel Plate Thickness

| Property             | Value                                                              |
|----------------------|--------------------------------------------------------------------|
| UI Label             | MS Thickness (mm)                                                  |
| Field ID             | `#msThickness`                                                     |
| Variable Name        | `msThick`                                                          |
| Data Type            | Number (float)                                                     |
| Unit                 | mm                                                                 |
| Default Value        | `3` (set in HTML `value` attribute)                                |
| Required             | Yes — fallback to `3` via `|| 3` if null                           |
| User Editable        | Yes                                                                |
| HTML Attributes      | `type="number"`, `step="any"`, `value="3"`, `inputmode="decimal"`  |
| Part of baseConstants| YES                                                                |
| Used In Steps        | Step 12B (`wClampPer = ... * msThick * rhoMS * 1e-6`)              |

---

### Input 11 — Mild Steel Density

| Property             | Value                                                               |
|----------------------|---------------------------------------------------------------------|
| UI Label             | MS Density rho (g/cc)                                               |
| Field ID             | `#rhoMS`                                                            |
| Variable Name        | `rhoMS`                                                             |
| Data Type            | Number (float)                                                      |
| Unit                 | g/cc                                                                |
| Default Value        | `7.85` (set in HTML `value` attribute)                              |
| Required             | Yes — fallback to `7.85` via `|| 7.85` if null                      |
| User Editable        | Yes                                                                 |
| HTML Attributes      | `type="number"`, `step="any"`, `value="7.85"`, `inputmode="decimal"`|
| Part of baseConstants| YES                                                                 |
| Used In Steps        | Step 12B (weight per clamp plate)                                   |

---

### Input 12 — Clamp Quantity

| Property             | Value                                                              |
|----------------------|--------------------------------------------------------------------|
| UI Label             | Clamp Quantity                                                     |
| Field ID             | `#clampQty`                                                        |
| Variable Name        | `clampQty`                                                         |
| Data Type            | Number (integer)                                                   |
| Unit                 | count                                                              |
| Default Value        | `4` (set in HTML `value` attribute)                                |
| Required             | Yes — fallback to `4` via `|| 4` if null                           |
| User Editable        | Yes                                                                |
| HTML Attributes      | `type="number"`, `step="1"`, `min="1"`, `value="4"`, `inputmode="numeric"` |
| Part of baseConstants| YES                                                                |
| Used In Steps        | Step 12C (`totalClampWt = wClampPer * clampQty`)                   |

---

### Input 13 — Core Gap for Bobbin

| Property             | Value                                                              |
|----------------------|--------------------------------------------------------------------|
| UI Label             | Core Gap (Bobbin) (mm)                                             |
| Field ID             | `#coreGapBobbin`                                                   |
| Variable Name        | `coreGapBobbin`                                                    |
| Data Type            | Number (float)                                                     |
| Unit                 | mm                                                                 |
| Default Value        | `2` (set in HTML `value` attribute)                                |
| Required             | Yes — fallback to `2` via `|| 2` if null                           |
| User Editable        | Yes                                                                |
| HTML Attributes      | `type="number"`, `step="any"`, `value="2"`, `inputmode="decimal"`  |
| Part of baseConstants| YES                                                                |
| Used In Steps        | Step 13A (`bobbinInnerW = tongueWidth + coreGapBobbin`)            |

---

### Input 14 — Tape Buffer for Bobbin

| Property             | Value                                                               |
|----------------------|---------------------------------------------------------------------|
| UI Label             | Tape Buffer (Bobbin) (mm)                                           |
| Field ID             | `#tapeBufferBobbin`                                                 |
| Variable Name        | `tapeBufferBobbin`                                                  |
| Data Type            | Number (float)                                                      |
| Unit                 | mm                                                                  |
| Default Value        | `10` (set in HTML `value` attribute)                                |
| Required             | Yes — fallback to `10` via `|| 10` if null                          |
| User Editable        | Yes                                                                 |
| HTML Attributes      | `type="number"`, `step="any"`, `value="10"`, `inputmode="decimal"`  |
| Part of baseConstants| YES                                                                 |
| Used In Steps        | Step 13C (`bobbinOuterClear = priRadUsed + tapeBufferBobbin`)       |

---

### Input 15 — Bobbin Material Thickness

| Property             | Value                                                              |
|----------------------|--------------------------------------------------------------------|
| UI Label             | Bobbin Material Thickness (mm)                                     |
| Field ID             | `#tbobbinMat`                                                      |
| Variable Name        | `tbobbinMat`                                                       |
| Data Type            | Number (float)                                                     |
| Unit                 | mm                                                                 |
| Default Value        | `3` (set in HTML `value` attribute)                                |
| Required             | Yes — fallback to `3` via `|| 3` if null                           |
| User Editable        | Yes                                                                |
| HTML Attributes      | `type="number"`, `step="any"`, `value="3"`, `inputmode="decimal"`  |
| Part of baseConstants| YES                                                                |
| Used In Steps        | Steps 14B, 14C, 14D (all three bobbin component weight formulas)   |

---

### Input 16 — Bobbin Material Density

| Property             | Value                                                               |
|----------------------|---------------------------------------------------------------------|
| UI Label             | Bobbin Density rho (g/cc)                                           |
| Field ID             | `#rhoBobbin`                                                        |
| Variable Name        | `rhoBobbin`                                                         |
| Data Type            | Number (float)                                                      |
| Unit                 | g/cc                                                                |
| Default Value        | `2.20` (set in HTML `value` attribute — typical for polypropylene)  |
| Required             | Yes — fallback to `2.20` via `|| 2.20` if null                      |
| User Editable        | Yes                                                                 |
| HTML Attributes      | `type="number"`, `step="any"`, `value="2.20"`, `inputmode="decimal"`|
| Part of baseConstants| YES                                                                 |
| Used In Steps        | Steps 14B, 14C, 14D                                                 |

---

## Editable Override Inputs (Auto-Populated — User May Override)

| Field ID                   | UI Label                    | Produced By | Next Consumer            |
|----------------------------|-----------------------------|-------------|--------------------------|
| `#aClampOutput`            | Clamp Span A (mm)           | Step 11A    | Step 11B (`clampLen`)    |
| `#clampLenOutput`          | Clamp Length (mm)           | Step 11B    | Step 12B (`wClampPer`)   |
| `#clampWidthOutput`        | Clamp Width (mm)            | Step 12A    | Step 12B (`wClampPer`)   |
| `#totalClampWtOutput`      | Total Clamp Weight (kg)     | Step 12C    | Phase 7 cost module      |
| `#bobbinOuterClearOutput`  | Bobbin Outer Clearance (mm) | Step 13C    | Steps 13D, 13E           |
| `#totalBobbinWtOutput`     | Total Bobbin Weight (kg)    | Step 14F    | Phase 7 cost module      |

All the above are `type="number"`, `step="any"`, `inputmode="decimal"`, editable overrides,
NOT in `baseConstants`.

## Readonly Display Fields (NOT User-Editable)

| Field ID           | UI Label             | Produced By | Note                                     |
|--------------------|----------------------|-------------|------------------------------------------|
| `#flangeWtOutput`  | Flange Wt (kg)       | Step 14B    | `readonly` HTML attribute. Not overridable. |
| `#wallWtOutput`    | Wall Wt (L / S) (kg) | Steps 14C/D | `readonly` HTML attribute. Formatted string. |

---

## Input Helper Functions

Phase 4 uses the same `g(id)` and `auto(id, val)` helper functions as Phase 1.
See `Phase-01-Capacity-and-Electrical-Turns/07-inputs.md` for full definitions.
