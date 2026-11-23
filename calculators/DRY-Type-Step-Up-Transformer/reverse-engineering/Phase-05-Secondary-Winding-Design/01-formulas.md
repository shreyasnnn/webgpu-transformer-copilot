# Phase 05 — Secondary Winding Design
## File: 01-formulas.md

> **Scope:** Every engineering calculation belonging to Phase 5.
> These correspond to Steps 15–17 in `js/app.js` inside the `calculate()` function.
> Phase 5 mirrors Phase 3 (Primary Winding Design) but applies to the secondary winding.
> Key differences from Phase 3 are documented explicitly.
> No calculations from other phases are included.

---

## Step 15 — Secondary Conductor Sizing

### Purpose
Determines the secondary conductor cross-sectional area from the secondary current
(read directly as user input — no VA/voltage division here), looks up the SWG,
computes the target bare wire diameter, standardizes it, and adds insulation.
For heavy conductors (SWG <= 13), a flat wire path is also computed.

**Difference from Phase 3:** The primary current `iPri` was derived from `VA / V_pri`.
The secondary current uses `iSecInput` DIRECTLY (no computation in this step) because
the secondary current is a known specification input, not a derived value.

---

### Formula 15A — Required Conductor Cross-Sectional Area
```
aSec = iSecInputCalc / delta
```
Where `iSecInputCalc = g("iSecInput")` — the secondary current read directly from user input field.

### Formula 15B — Target Bare Wire Diameter (Round Wire Path)
```
bareDiaSec = SQRT((aSec * 4) / PI)
           = Math.sqrt((aSec * 4) / Math.PI)
```

### Formula 15C — Standardized Bare Diameter (Truncation Step)
```
secBareStd = Math.floor(secBareDiaUsed * 10) / 10
```
Where `secBareDiaUsed = g("secBareDiaOutput")` — read back after auto() write.

### Formula 15D — Insulated Wire Diameter (Round Wire Path)
```
secInsDia = secBareDiaUsed + secInsAdd
```

### Formula 15E — Flat Wire: Entered Area
```
enteredArea_sec = secFlatBreadth * secFlatHeight
```
*Only computed when flat wire is selected AND both dimensions are entered.*

### Formula 15F — Flat Wire: Effective Height (with parallel conductors)
```
secEffectiveHeight = secFlatHeight * secParallel
```

### Formula 15G — Flat Wire: Effective Area
```
secEffectiveArea = secFlatBreadth * secEffectiveHeight
                 = secFlatBreadth * (secFlatHeight * secParallel)
```

### Formula 15H — Flat Wire Warning Condition
```
showWarning = (|secEffectiveArea - aSec| / aSec) > 0.1
```
*UI display condition only — does not change any calculated value.*

### Variables Used — Step 15

| Symbol               | Description                                     | Source                          |
|----------------------|-------------------------------------------------|---------------------------------|
| `iSecInputCalc`      | Secondary current (read directly from `g()`)    | Phase 1 user input `#iSecInput` |
| `delta`              | Current density (A/mm²)                         | Phase 3 user input (default 2.5)|
| `aSec`               | Required conductor cross-sectional area (mm²)   | Computed here                   |
| `secInsAdd`          | Secondary insulation increment (mm)             | User input (default 0.01)       |
| `bareDiaSec`         | Target bare wire diameter (mm)                  | Computed here                   |
| `secBareDiaUsed`     | Bare diameter read back from DOM field          | Computed here (read-back)       |
| `secBareStd`         | Bare diameter truncated to 1 decimal (mm)       | Computed here (internal)        |
| `secInsDia`          | Calculated insulated wire diameter (mm)         | Computed here                   |
| `insDiaSecUsed`      | Insulated diameter read from active field       | Computed / override             |
| `secFlatBreadth`     | Flat wire breadth (mm)                          | User input (flat path only)     |
| `secFlatHeight`      | Flat wire height (mm)                           | User input (flat path only)     |
| `secParallel`        | Number of parallel flat conductors              | User input (default 1)          |
| `secEffectiveHeight` | Total effective height of parallel flat wires   | Computed here (flat path)       |
| `secEffectiveArea`   | Total effective area of flat conductor (mm²)    | Computed here (flat path)       |

### Input Variables
- `iSecInputCalc` — read from `g("iSecInput")` — same field as Phase 1 `iSecInput`
- `delta` — shared with Phase 3, from `#delta` (default 2.5)
- `secInsAdd` — from `#secInsAddition` (default 0.01)

### Output Variables
- `bareDiaSec` — written to `#secBareDiaOutput` (2 decimal places)
- SWG string — written to `#secSwgOutput` (read-only display)
- `secInsDia` — written to `#secInsDiaInput` (2 decimal places)
- `enteredArea_sec` display — written to `#secEnteredAreaOutput` (flat path, 2dp)
- `secEffectiveHeight` display — written to `#secEffectiveHeightOutput` (flat path, 2dp)
- `secEffectiveArea` display — written to `#secFlatAreaOutput` (flat path, 2dp)
- `#secFlatWireSection` — visibility toggled (block if SWG <= 13, none otherwise)

### SWG Lookup
- `getSWGForCurrent(iSecInputCalc)` called with raw secondary current
- Returns nearest SWG from `swgTable` in `js/swgData.js`
- If SWG <= 13: `secFlatWireSection` shown, strip suggestions generated
- If SWG > 13: flat section hidden, round radio forced
- Full documentation in `Phase-03-Primary-Winding-Design/04-lookups.md`

### Strip Suggestion Helper
- `generateStripSuggestions(aSec)` called with computed secondary area
- Output written to `#secStripSuggestions` (display only)
- Full documentation in `Phase-03-Primary-Winding-Design/04-lookups.md`

### Default Values
- `delta` = `2.5` A/mm² (shared with Phase 3)
- `secInsAddition` = `0.01` mm (NOTE: default is 0.01, NOT 0.1 like primary)
- `secParallel` = `1`

### User-Overridable Values
- `#secBareDiaOutput` — overridable (read back as `secBareDiaUsed`)
- `#secInsDiaInput` — overridable (active calculation input)

### Constants
- `Math.PI` — JavaScript built-in

### Rounding Applied
- `parseFloat(bareDiaSec.toFixed(2))` — bare diameter, 2 decimal places
- `Math.floor(secBareDiaUsed * 10) / 10` — TRUNCATION to 1 decimal (secBareStd)
- `parseFloat(secInsDia.toFixed(2))` — insulated diameter, 2 decimal places
- Flat path display: `parseFloat(x.toFixed(2))` for entered area, effective height, effective area
- See `05-rounding.md`.

### Guard Conditions
- `aSec` guard: `iSecInputCalc` AND `delta` non-null
- `bareDiaSec` guard: `aSec !== null && aSec >= 0`
- SWG lookup guard: `iSecInputCalc !== null`
- Flat path guard: `isSecFlat === true` AND both `secFlatBreadth` and `secFlatHeight` non-null

---

## Step 16 — Secondary Turns Per Limb, TPL, Layers & Radial Thickness

### Purpose
Distributes secondary turns across limbs, computes turns per layer using the
secondary bobbin height (a SEPARATE field from `bobbinHeightPri`), computes layer
count, and derives the radial build of the secondary winding.

**Difference from Phase 3:** Uses `bobbinHeightSec` (not `bobbinHeightPri`) and
`secSafetyMargin` (not `priSafetyMargin`). The bobbin flange deduction (`bobbinFlange`)
is shared between primary and secondary.

### Formula 16A — Secondary Turns Per Limb
```
secTurnsLimb = Math.ceil(secTurnsUsed / limbsCount)
```

### Formula 16B — Secondary Available Winding Length
```
secWindingLen = bobbinHeightSec - bobbinFlange
```

### Formula 16C — Turns Per Layer (Round Wire Path)
```
secTPL = Math.floor(secWindingLen / insDiaSecUsed) - secSafetyMargin
```

### Formula 16C — Turns Per Layer (Flat Wire Path)
```
secTPL = Math.floor(secWindingLen / secFlatBreadth) - secSafetyMargin
```

### Formula 16D — Secondary Layers
```
secLayers = Math.ceil(secTurnsLimbUsed / secTPLUsed)
```

### Formula 16E — Secondary Radial Build (Round Wire Path)
```
secRadBuild = (insDiaSecUsed * secLayersUsed) + (paperThickness * secPaperLayers)
```

### Formula 16F — Secondary Radial Build (Flat Wire Path)
```
secRadBuild = (secEffectiveHeight * secLayersUsed) + (paperThickness * secPaperLayers)
```

### Variables Used — Step 16

| Symbol              | Description                                         | Source                        |
|---------------------|-----------------------------------------------------|-------------------------------|
| `secTurnsUsed`      | Total secondary turns                               | Phase 1 Step 4 / override     |
| `limbsCount`        | Number of transformer limbs                         | Phase 3 user input            |
| `bobbinHeightSec`   | Secondary bobbin overall height (mm)                | User input — SEPARATE from pri|
| `bobbinFlange`      | Bobbin flange deduction (shared with primary)       | Phase 3 user input (default 7)|
| `secSafetyMargin`   | Safety turns deducted from secondary TPL            | User input (default 0)        |
| `insDiaSecUsed`     | Insulated wire diameter — round path                | Step 15 / override            |
| `secFlatBreadth`    | Flat wire breadth — flat path divisor               | User input (flat path only)   |
| `secEffectiveHeight`| Effective flat wire height — flat path              | Step 15 (JS variable)         |
| `paperThickness`    | Interlayer paper thickness (shared with primary)    | Phase 3 user input (0.127)    |
| `secPaperLayers`    | Number of paper layers for secondary                | User input (default 4)        |
| `secTurnsLimb`      | Secondary turns per limb (integer)                  | Computed here                 |
| `secWindingLen`     | Available winding length on secondary bobbin        | Computed here (intermediate)  |
| `secTPL`            | Secondary turns per layer (integer)                 | Computed here                 |
| `secLayers`         | Secondary layer count (integer)                     | Computed here                 |
| `secRadBuild`       | Unceiled secondary radial build (mm)                | Computed here                 |

### Output Variables
- `secTurnsLimb` — written to `#secTurnsLimbOutput`
- `secTPL` — written to `#secTplOutput`
- `secLayers` — written to `#secLayersOutput`
- `secRadBuild` — written as `Math.ceil(secRadBuild)` to `#secRadialOutput`

### Rounding Applied
- `Math.ceil(secTurnsUsed / limbsCount)` — turns/limb CEIL
- `Math.floor(secWindingLen / divisor) - secSafetyMargin` — TPL FLOOR then subtract
- `Math.ceil(secTurnsLimbUsed / secTPLUsed)` — layers CEIL
- `Math.ceil(secRadBuild)` — radial CEIL
- See `05-rounding.md`.

---

## Step 17 — Secondary LMT and Conductor Weight

### Purpose
Computes the mean turn length of the secondary winding and derives the total
secondary conductor weight.

**CRITICAL ARCHITECTURE NOTE:** The secondary LMT formula uses `innerW` and `innerL`
DIRECTLY — the same inner coil dimensions computed in Phase 3 Step 10 (which represent
the core surface + coil clearance). This means the secondary LMT calculation treats
the secondary as if it starts at the core surface, NOT outside the primary winding.
This is the exact behavior of the existing code regardless of physical interpretation.

### Formula 17A — Secondary Outer Width
```
secOuterW = innerW + (2 * secRadUsed)
```

### Formula 17B — Secondary Outer Length
```
secOuterL = innerL + (2 * secRadUsed)
```

### Formula 17C — Secondary Mean Turn Length (LMT)
```
secLMT = (innerW + secOuterW + innerL + secOuterL) / 1000
```
*Division by 1000 converts mm to metres.*

### Formula 17D — Actual Wire Cross-Sectional Area (for weight)
```
secActualArea = (Math.PI * Math.pow(insDiaSecUsed, 2)) / 4
```
*Uses the insulated diameter — always uses round wire formula regardless of wire type.*

### Formula 17E — Secondary Conductor Weight
```
secWeight = secLMTUsed * secTurnsLimbUsed * limbsCount * secActualArea * rhoCu * 1e-3
```

### Variables Used — Step 17

| Symbol              | Description                                        | Source                       |
|---------------------|----------------------------------------------------|------------------------------|
| `innerW`            | Inner coil width (mm) — from Phase 3 Step 10       | Phase 3 JS variable          |
| `innerL`            | Inner coil length (mm) — from Phase 3 Step 10      | Phase 3 JS variable          |
| `secRadUsed`        | Secondary radial thickness (mm, integer)           | Step 16 / override           |
| `insDiaSecUsed`     | Insulated wire diameter (mm)                       | Step 15 / override           |
| `secTurnsLimbUsed`  | Secondary turns per limb                           | Step 16 / override           |
| `limbsCount`        | Number of limbs                                    | Phase 3 user input           |
| `rhoCu`             | Conductor material density (g/cc)                  | Phase 3 user input           |
| `secOuterW`         | Secondary outer winding width (mm)                 | Computed here (intermediate) |
| `secOuterL`         | Secondary outer winding length (mm)                | Computed here (intermediate) |
| `secLMT`            | Secondary mean turn length, unrounded (m)          | Computed here                |
| `secLMTUsed`        | LMT read back from DOM field                       | Computed / override          |
| `secActualArea`     | Circular conductor area for weight calc (mm²)      | Computed here (intermediate) |
| `secWeight`         | Total secondary conductor weight (kg)              | Computed here                |

### Output Variables
- `secLMT` — written to `#secLmtOutput` as `parseFloat(secLMT.toFixed(3))`
- `secWeight` — written to `#secWeightOutput` as `parseFloat(secWeight.toFixed(2))`
  (carries `data-cost-type="winding"` and `data-cost-name="Secondary"` HTML attributes)

### Constants
- `Math.PI` — JavaScript built-in
- `1e-3` — unit conversion (hardcoded in weight formula)
- `1000` — mm to metres conversion (hardcoded in LMT formula)

### Rounding Applied
- `parseFloat(secLMT.toFixed(3))` — LMT, 3 decimal places
- `parseFloat(secWeight.toFixed(2))` — weight, 2 decimal places
- `secActualArea.toFixed(2)` — display trace only
- See `05-rounding.md`.

---

## Phase 5 — Completeness Review

### All Calculations Documented

| Step  | Calculation                                                                          | Documented |
|-------|--------------------------------------------------------------------------------------|------------|
| 15A   | aSec = iSecInputCalc / delta                                                         | YES        |
| 15B   | bareDiaSec = SQRT((aSec * 4) / PI)                                                  | YES        |
| 15C   | secBareStd = Math.floor(secBareDiaUsed * 10) / 10                                   | YES        |
| 15D   | secInsDia = secBareDiaUsed + secInsAdd                                               | YES        |
| 15E   | enteredArea_sec = secFlatBreadth * secFlatHeight (flat)                              | YES        |
| 15F   | secEffectiveHeight = secFlatHeight * secParallel (flat)                              | YES        |
| 15G   | secEffectiveArea = secFlatBreadth * secEffectiveHeight (flat)                        | YES        |
| 15H   | Warning: |secEffectiveArea - aSec| / aSec > 0.1                                     | YES        |
| 15-SWG| getSWGForCurrent(iSecInputCalc)                                                     | YES        |
| 16A   | secTurnsLimb = Math.ceil(secTurnsUsed / limbsCount)                                 | YES        |
| 16B   | secWindingLen = bobbinHeightSec - bobbinFlange                                      | YES        |
| 16C   | secTPL = Math.floor(secWindingLen / divisor) - secSafetyMargin (both paths)         | YES        |
| 16D   | secLayers = Math.ceil(secTurnsLimbUsed / secTPLUsed)                                | YES        |
| 16E/F | secRadBuild = (diameter * layers) + (paperThickness * secPaperLayers) (both paths) | YES        |
| 17A   | secOuterW = innerW + (2 * secRadUsed)                                               | YES        |
| 17B   | secOuterL = innerL + (2 * secRadUsed)                                               | YES        |
| 17C   | secLMT = (innerW + secOuterW + innerL + secOuterL) / 1000                           | YES        |
| 17D   | secActualArea = (PI * insDiaSecUsed^2) / 4                                          | YES        |
| 17E   | secWeight = secLMT * secTurnsLimb * limbsCount * secActualArea * rhoCu * 1e-3      | YES        |

### Cross-Phase Contamination Check
- `iSecInputCalc = g("iSecInput")` reads Phase 1 field directly — not a Phase 5 computation. ✓
- `delta` is shared with Phase 3 — read from same `#delta` field. ✓
- `innerW`, `innerL` are Phase 3 Step 10 JS variables consumed here — correctly noted. ✓
- `secWeightOutput` carries data-cost attributes for Phase 7 — cost computation is Phase 7. ✓
- `secTurnsUsed` is from Phase 1 Step 4 `#secondaryTurns` — not recomputed here. ✓

### Notable Difference from Phase 3: secInsAdd Default
- `priInsAddition` default = `0.01` mm
- `secInsAddition` default = `0.01` mm  
  Wait — from line 462: `let secInsAdd = g("secInsAddition") || 0.01;`
  The primary uses `|| 0.1` (line approx Phase 3). The secondary uses `|| 0.01`.
  This is a meaningful engineering difference that must be preserved exactly.

### Execution Order Verified
Steps 15A → 15B → 15C → 15D → (15E–15H flat path) → SWG lookup →
16A → 16B → 16C → 16D → 16E/F → 17A → 17B → 17C → 17D → 17E
match exact sequential execution in `js/app.js`.
