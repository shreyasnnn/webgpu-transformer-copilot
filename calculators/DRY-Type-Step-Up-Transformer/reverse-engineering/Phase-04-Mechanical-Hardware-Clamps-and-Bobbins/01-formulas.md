# Phase 04 — Mechanical Hardware (Clamps & Bobbins)
## File: 01-formulas.md

> **Scope:** Every engineering calculation belonging to Phase 4.
> These correspond to Steps 11–14 in `js/app.js` inside the `calculate()` function.
> The bobbin blueprint SVG label updates also occur in this phase (Step 13).
> No calculations from other phases are included.

---

## Step 11 — L-Clamp Span and Length

### Purpose
Computes the internal span width of the L-clamp assembly that must bridge across
both primary windings and the center gap, and derives the total plate length of
each L-clamp from the tongue width and span.

### Formula 11A — Clamp Span (A_clamp)
```
aClamp = (2 * tbobbinClamp) + (2 * priRadUsed) + (2 * extraSpaceClamp) + centerGapClamp
```

### Formula 11B — Clamp Plate Length
```
clampLen = tongueWidth + aClampUsed + tongueWidth
         = (2 * tongueWidth) + aClampUsed
```

### Variables Used — Step 11

| Symbol            | Description                                              | Source                        |
|-------------------|----------------------------------------------------------|-------------------------------|
| `tbobbinClamp`    | Bobbin wall thickness used for clamp span calc (mm)      | User input (default: 3.5)     |
| `priRadUsed`      | Primary radial winding thickness (mm)                    | Phase 3 Step 9 / override     |
| `extraSpaceClamp` | Extra clearance margin each side (mm)                    | User input (default: 9)       |
| `centerGapClamp`  | Center gap between the two winding slots (mm)            | User input (default: 10)      |
| `aClamp`          | Computed clamp span width (mm)                           | Computed here                 |
| `aClampUsed`      | Clamp span read back from DOM field                      | Computed / override           |
| `tongueWidth`     | Core tongue width (mm)                                   | Phase 2 user input            |
| `clampLen`        | Total clamp plate length (mm)                            | Computed here                 |

### Input Variables
- `tbobbinClamp` — from `#tbobbinClamp` (default: 3.5)
- `priRadUsed` — from `#priRadialOutput` (Phase 3 Step 9)
- `extraSpaceClamp` — from `#extraSpaceClamp` (default: 9)
- `centerGapClamp` — from `#centerGapClamp` (default: 10)
- `tongueWidth` — from `#tongueWidth` (Phase 2 user input)

### Output Variables
- `aClamp` — written to `#aClampOutput` (no rounding)
- `clampLen` — written to `#clampLenOutput` (no rounding)

### User-Overridable Values
- `#aClampOutput` — overridable (re-read as `aClampUsed` for Step 11B)
- `#clampLenOutput` — overridable

### Constants
- None. All terms are user-configurable values.

### Lookup Tables Referenced
- None.

### Rounding Applied
- NONE — both `aClamp` and `clampLen` are written as raw computed values.
- See `05-rounding.md`.

### Guard Condition
- If `priRadUsed` is null: `aClamp = null`, both outputs blank.
- `aClampUsed` is read from `#aClampOutput` after write.
- `clampLen` guard: `tongueWidth` must be non-null AND `aClampUsed` must be non-null.

---

## Step 12 — L-Clamp Weight

### Purpose
Computes the width of the L-clamp plate (accounting for bending deduction), then
calculates the mass of a single clamp plate and multiplies by quantity.

### Formula 12A — Clamp Plate Width
```
clampWidth = tongueWidth + (tongueWidth - bendingDed)
           = (2 * tongueWidth) - bendingDed
```

### Formula 12B — Weight Per Single Clamp Plate
```
wClampPer = clampLenUsed * clampWidthUsed * msThick * rhoMS * 1e-6
```

### Formula 12C — Total Clamps Weight
```
totalClampWt = wClampPer * clampQty
```

### Variables Used — Step 12

| Symbol          | Description                                    | Source                    |
|-----------------|------------------------------------------------|---------------------------|
| `tongueWidth`   | Core tongue width (mm)                         | Phase 2 user input        |
| `bendingDed`    | Material deduction for bending (mm)            | User input (default: 10)  |
| `msThick`       | Mild steel sheet thickness (mm)                | User input (default: 3)   |
| `rhoMS`         | Mild steel density (g/cc)                      | User input (default: 7.85)|
| `clampQty`      | Number of L-clamps in assembly                 | User input (default: 4)   |
| `clampLenUsed`  | Clamp plate length from Step 11                | Step 11 / override        |
| `clampWidthUsed`| Clamp plate width from this step               | Computed here / override  |
| `clampWidth`    | Computed clamp plate width (mm)                | Computed here             |
| `wClampPer`     | Mass of one clamp plate (kg)                   | Computed here             |
| `totalClampWt`  | Total mass of all clamp plates (kg)            | Computed here             |

### Input Variables
- `bendingDed` — from `#bendingDeduction` (default: 10)
- `msThick` — from `#msThickness` (default: 3)
- `rhoMS` — from `#rhoMS` (default: 7.85)
- `clampQty` — from `#clampQty` (default: 4)
- `clampLenUsed` — from `#clampLenOutput` (Step 11 output)

### Output Variables
- `clampWidth` — written to `#clampWidthOutput` (no rounding)
- `totalClampWt` — written to `#totalClampWtOutput` as `parseFloat(totalClampWt.toFixed(2))`
  (also carries `data-cost-type="clamp"` and `data-cost-name="Clamp"` HTML attributes)

### User-Overridable Values
- `#clampWidthOutput` — overridable (read back as `clampWidthUsed` for weight calc)
- `#totalClampWtOutput` — overridable

### Constants
- `1e-6` — unit conversion factor. Converts mm² (area) × mm (thickness) × g/cc (density)
  to kg. Hardcoded in formula.

### Lookup Tables Referenced
- None.

### Rounding Applied
- `clampWidth` — NO rounding, raw value written.
- `totalClampWt` — `parseFloat(totalClampWt.toFixed(2))` — 2 decimal places.
- See `05-rounding.md`.

### Guard Condition
- `clampWidth` guard: `tongueWidth` must be non-null.
- `wClampPer` guard: `clampLenUsed` AND `clampWidthUsed` must both be non-null.
- `totalClampWt` guard: `wClampPer` must be non-null.

---

## Step 13 — Bobbin Dimensions & SVG Blueprint Labels

### Purpose
Derives the inner and outer bobbin cavity dimensions from the core geometry and
the winding build, and updates the text labels on the inline SVG blueprint diagram
and the summary modal SVG blueprint.

### Formula 13A — Bobbin Inner Width
```
bobbinInnerW = tongueWidth + coreGapBobbin
```

### Formula 13B — Bobbin Inner Length
```
bobbinInnerL = stackHeight
```
*No arithmetic — stackHeight is directly assigned as bobbinInnerL.*

### Formula 13C — Bobbin Outer Clearance
```
bobbinOuterClear = priRadUsed + tapeBufferBobbin
```

### Formula 13D — Bobbin Outer Width
```
bobbinOuterW = bobbinInnerW + (2 * bobbinOuterClearUsed)
```

### Formula 13E — Bobbin Outer Length
```
bobbinOuterL = bobbinInnerL + (2 * bobbinOuterClearUsed)
```

### SVG Label Updates (Step 13 — both inline and modal SVG)
The following text element `textContent` values are updated:
```
#svg_a   <- bobbinInnerW  (or "a = --" if null)
#svg_b   <- bobbinOuterW  (or "b = --" if null)
#svg_c   <- bobbinInnerL  (or "c = --" if null)
#svg_d   <- bobbinOuterL  (or "d = --" if null)
#svg_h   <- bobbinHeightPri (or "h = --" if null)

#modal_svg_a <- bobbinInnerW  (or "a = --" if null)
#modal_svg_b <- bobbinOuterW  (or "b = --" if null)
#modal_svg_c <- bobbinInnerL  (or "c = --" if null)
#modal_svg_d <- bobbinOuterL  (or "d = --" if null)
#modal_svg_h <- bobbinHeightPri (or "h = --" if null)
```

### Variables Used — Step 13

| Symbol                  | Description                                         | Source                      |
|-------------------------|-----------------------------------------------------|-----------------------------|
| `tongueWidth`           | Core tongue width (mm)                              | Phase 2 user input          |
| `stackHeight`           | Core stack height (mm)                              | Phase 2 user input          |
| `coreGapBobbin`         | Gap between bobbin inner wall and core (mm)         | User input (default: 2)     |
| `tapeBufferBobbin`      | Tape/clearance buffer beyond winding (mm)           | User input (default: 10)    |
| `priRadUsed`            | Primary radial winding thickness (mm)               | Phase 3 Step 9 / override   |
| `bobbinHeightPri`       | Primary bobbin height (mm)                          | Phase 3 user input          |
| `bobbinInnerW`          | Bobbin cavity inner width (mm)                      | Computed here               |
| `bobbinInnerL`          | Bobbin cavity inner length = stackHeight (mm)       | Computed here (direct assign)|
| `bobbinOuterClear`      | Outer clearance beyond winding (mm)                 | Computed here               |
| `bobbinOuterClearUsed`  | Outer clearance read back from DOM field            | Computed / override         |
| `bobbinOuterW`          | Bobbin outer width including clearances (mm)        | Computed here               |
| `bobbinOuterL`          | Bobbin outer length including clearances (mm)       | Computed here               |

### Output Variables
- `bobbinOuterClear` — written to `#bobbinOuterClearOutput` (no rounding)
- SVG labels (`#svg_a`, `#svg_b`, `#svg_c`, `#svg_d`, `#svg_h`) — text content updated
- Modal SVG labels (`#modal_svg_a/b/c/d/h`) — text content updated at end of `calculate()`
- `bobbinInnerW`, `bobbinOuterW`, `bobbinInnerL`, `bobbinOuterL` — retained as JS
  variables for Step 14 (not written to DOM except indirectly via SVG labels)

### User-Overridable Values
- `#bobbinOuterClearOutput` — overridable (read back as `bobbinOuterClearUsed`)

### Constants
- None.

### Lookup Tables Referenced
- None.

### Rounding Applied
- NONE applied to any bobbin dimension variable in this step.
- See `05-rounding.md`.

### Guard Conditions
- `bobbinInnerW` guard: `tongueWidth` must be non-null.
- `bobbinInnerL`: always equals `stackHeight` (can be null if stackHeight is null).
- `bobbinOuterClear` guard: `priRadUsed` must be non-null.
- `bobbinOuterW` guard: `bobbinInnerW` AND `bobbinOuterClearUsed` must be non-null.
- `bobbinOuterL` guard: `bobbinInnerL` AND `bobbinOuterClearUsed` must be non-null.
- SVG labels: each is independently guarded — null produces "x = --" fallback.

---

## Step 14 — Bobbin Weight Calculation

### Purpose
Computes the mass of a single bobbin (consisting of two flanges and four walls —
two long, two short) then multiplies by the number of transformer limbs to get
the total bobbins mass for the complete assembly.

### Formula 14A — Flange Area (one flange)
```
aFlange = (bobbinOuterW * bobbinOuterL) - (bobbinInnerW * bobbinInnerL)
```

### Formula 14B — Weight of One Flange
```
wFlange = aFlange * tbobbinMat * rhoBobbin * 1e-6
```

### Formula 14C — Weight of One Long Wall
```
wWallLong = bobbinInnerL * bobbinHeightPri * tbobbinMat * rhoBobbin * 1e-6
```

### Formula 14D — Weight of One Short Wall
```
wWallShort = bobbinInnerW * bobbinHeightPri * tbobbinMat * rhoBobbin * 1e-6
```

### Formula 14E — Weight of One Complete Bobbin
```
wSingleBobbin = (2 * wFlange) + (2 * wWallLong) + (2 * wWallShort)
```

### Formula 14F — Total Weight of All Bobbins (All Limbs)
```
totalBobbinWt = wSingleBobbin * limbsCount
```

### Variables Used — Step 14

| Symbol           | Description                                         | Source                      |
|------------------|-----------------------------------------------------|-----------------------------|
| `bobbinOuterW`   | Bobbin outer width (mm)                             | Step 13 (JS variable)       |
| `bobbinOuterL`   | Bobbin outer length (mm)                            | Step 13 (JS variable)       |
| `bobbinInnerW`   | Bobbin inner width (mm)                             | Step 13 (JS variable)       |
| `bobbinInnerL`   | Bobbin inner length = stackHeight (mm)              | Step 13 (JS variable)       |
| `bobbinHeightPri`| Primary bobbin overall height (mm)                  | Phase 3 user input          |
| `tbobbinMat`     | Bobbin material plate thickness (mm)                | User input (default: 3)     |
| `rhoBobbin`      | Bobbin material density (g/cc)                      | User input (default: 2.20)  |
| `limbsCount`     | Number of transformer limbs                         | Phase 3 user input          |
| `aFlange`        | Cross-sectional area of one flange plate (mm²)      | Computed here               |
| `wFlange`        | Mass of one flange plate (kg)                       | Computed here               |
| `wWallLong`      | Mass of one long side wall (kg)                     | Computed here               |
| `wWallShort`     | Mass of one short side wall (kg)                    | Computed here               |
| `wSingleBobbin`  | Total mass of one complete bobbin assembly (kg)     | Computed here               |
| `totalBobbinWt`  | Total mass of all bobbins for all limbs (kg)        | Computed here               |

### Output Variables
- `wFlange` — written to `#flangeWtOutput` as `parseFloat(wFlange.toFixed(3))` (read-only field)
- Wall weights — written to `#wallWtOutput` as a formatted string: `"X.XXX / Y.YYY"` (read-only)
- `totalBobbinWt` — written to `#totalBobbinWtOutput` as `parseFloat(totalBobbinWt.toFixed(2))`
  (also carries `data-cost-type="bobbin"` and `data-cost-name="Bobbin"` HTML attributes)

### User-Overridable Values
- `#totalBobbinWtOutput` — overridable
- `#flangeWtOutput` — labeled `readonly` in HTML (NOT user-overridable)
- `#wallWtOutput` — labeled `readonly` in HTML (NOT user-overridable)

### Constants
- `1e-6` — unit conversion factor (same as Step 12). Converts volume in mm³ × density
  in g/cc to mass in kg. Hardcoded in all three wall/flange weight formulas.
- `2` — multiplier for symmetric pairs (2 flanges, 2 long walls, 2 short walls).
  Hardcoded in Formula 14E.

### Lookup Tables Referenced
- None.

### Rounding Applied
- `wFlange` — `parseFloat(wFlange.toFixed(3))` — 3 decimal places.
- `wWallLong` and `wWallShort` — `toFixed(3)` each, used in string concatenation for `#wallWtOutput`.
- `totalBobbinWt` — `parseFloat(totalBobbinWt.toFixed(2))` — 2 decimal places.
- See `05-rounding.md`.

### Guard Condition
- `aFlange` guard: `bobbinOuterW`, `bobbinOuterL`, `bobbinInnerW`, `bobbinInnerL` all non-null.
- `wFlange` guard: `aFlange` non-null.
- `wWallLong` guard: `bobbinInnerL` AND `bobbinHeightPri` non-null.
- `wWallShort` guard: `bobbinInnerW` AND `bobbinHeightPri` non-null.
- `wSingleBobbin` guard: ALL of `wFlange`, `wWallLong`, `wWallShort` non-null.
- `totalBobbinWt` guard: `wSingleBobbin` AND `limbsCount` non-null.

---

## Phase 4 — Completeness Review

### All Calculations Documented

| Step  | Calculation                                                                         | Documented |
|-------|-------------------------------------------------------------------------------------|------------|
| 11A   | aClamp = (2*tbobbinClamp) + (2*priRadUsed) + (2*extraSpaceClamp) + centerGapClamp  | YES        |
| 11B   | clampLen = tongueWidth + aClampUsed + tongueWidth                                   | YES        |
| 12A   | clampWidth = tongueWidth + (tongueWidth - bendingDed)                               | YES        |
| 12B   | wClampPer = clampLenUsed * clampWidthUsed * msThick * rhoMS * 1e-6                 | YES        |
| 12C   | totalClampWt = wClampPer * clampQty                                                 | YES        |
| 13A   | bobbinInnerW = tongueWidth + coreGapBobbin                                          | YES        |
| 13B   | bobbinInnerL = stackHeight (direct assignment)                                      | YES        |
| 13C   | bobbinOuterClear = priRadUsed + tapeBufferBobbin                                    | YES        |
| 13D   | bobbinOuterW = bobbinInnerW + (2 * bobbinOuterClearUsed)                            | YES        |
| 13E   | bobbinOuterL = bobbinInnerL + (2 * bobbinOuterClearUsed)                            | YES        |
| 13-SVG| SVG text label updates (a, b, c, d, h) for inline and modal SVGs                   | YES        |
| 14A   | aFlange = (OuterW*OuterL) - (InnerW*InnerL)                                        | YES        |
| 14B   | wFlange = aFlange * tbobbinMat * rhoBobbin * 1e-6                                  | YES        |
| 14C   | wWallLong = bobbinInnerL * bobbinHeightPri * tbobbinMat * rhoBobbin * 1e-6         | YES        |
| 14D   | wWallShort = bobbinInnerW * bobbinHeightPri * tbobbinMat * rhoBobbin * 1e-6        | YES        |
| 14E   | wSingleBobbin = (2*wFlange) + (2*wWallLong) + (2*wWallShort)                       | YES        |
| 14F   | totalBobbinWt = wSingleBobbin * limbsCount                                          | YES        |

### Cross-Phase Contamination Check
- `priRadUsed` is consumed from Phase 3 — not recomputed here. ✓
- `tongueWidth`, `stackHeight` are Phase 2 user inputs consumed here. ✓
- `bobbinHeightPri`, `limbsCount` are Phase 3 user inputs also consumed here. ✓
- `totalClampWtOutput` and `totalBobbinWtOutput` carry data-cost attributes — cost
  computation belongs to Phase 7, not Phase 4. ✓
- SVG labels updated in both `calculate()` (Step 13) and at the end of `calculate()`
  (modal SVG section). Both sets use the same source variables. ✓

### Execution Order Verified
Steps 11A → 11B → 12A → 12B → 12C → 13A → 13B → 13C → 13D → 13E →
SVG label updates (inline) → 14A → 14B → 14C → 14D → 14E → 14F →
Modal SVG label updates (end of calculate()) match execution in `js/app.js`.
