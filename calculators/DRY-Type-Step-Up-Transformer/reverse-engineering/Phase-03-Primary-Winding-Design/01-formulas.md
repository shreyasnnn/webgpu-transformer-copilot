# Phase 03 — Primary Winding Design
## File: 01-formulas.md

> **Scope:** Every engineering calculation belonging to Phase 3.
> These correspond to Steps 7–10 in `js/app.js` inside the `calculate()` function.
> The SWG lookup (`js/swgData.js`) and strip suggestion helper are also first used here.
> No calculations from other phases are included.

---

## Step 7 — Primary Conductor Sizing

### Purpose
Determines the primary winding current from the transformer capacity and primary
voltage, then computes the required conductor cross-sectional area. From this area,
a bare wire diameter is derived and rounded, insulation is added to produce the
final insulated diameter, and the nearest SWG is looked up. For heavy conductors
(SWG <= 13), a flat (strip) wire alternative path is also computed.

---

### Formula 7A — Primary Current
```
iPri = vaOutput / vPriUsed
```

### Formula 7B — Required Conductor Area
```
priArea = iPri / delta
```

### Formula 7C — Target Bare Wire Diameter (Round Wire Path)
```
bareDiaPri = SQRT((priArea * 4) / PI)
           = Math.sqrt((priArea * 4) / Math.PI)
```

### Formula 7D — Standardized Bare Diameter (Truncation Step)
```
priBareStd = Math.floor(priBareDiaUsed * 10) / 10
```
Where `priBareDiaUsed` = value read from `#priBareDiaOutput` after `auto()` write.

### Formula 7E — Insulated Wire Diameter (Round Wire Path)
```
insDiaPri = priBareStd + priInsAdd
```

### Formula 7F — Flat Wire: Entered Area
```
enteredArea_pri = priFlatBreadth * priFlatHeight
```
*Only computed when flat wire is selected AND both dimensions are entered.*

### Formula 7G — Flat Wire: Effective Height (with parallel conductors)
```
priEffectiveHeight = priFlatHeight * priParallel
```

### Formula 7H — Flat Wire: Effective Area
```
priEffectiveArea = priFlatBreadth * priEffectiveHeight
                 = priFlatBreadth * (priFlatHeight * priParallel)
```

### Formula 7I — Flat Wire Warning Condition
```
showWarning = (|priEffectiveArea - priArea| / priArea) > 0.1
```
*If true, a warning is displayed. This is a UI display condition, not a formula
that changes any calculated value.*

---

### Variables Used — Step 7

| Symbol               | Description                                     | Source                         |
|----------------------|-------------------------------------------------|--------------------------------|
| `vaOutput`           | VA capacity fed into this step                  | From Phase 1 Step 1 / override |
| `vPriUsed`           | Primary voltage fed into this step              | From Phase 1 Step 3 / override |
| `delta`              | Current density (A/mm²)                         | User input (default: 2.5)      |
| `priInsAdd`          | Insulation increment added to bare diameter     | User input (default: 0.1)      |
| `iPri`               | Computed primary current (A)                    | Computed here                  |
| `priArea`            | Required conductor cross-sectional area (mm²)   | Computed here                  |
| `bareDiaPri`         | Target bare wire diameter (mm)                  | Computed here                  |
| `priBareDiaUsed`     | Bare diameter read back from DOM field          | Computed here (read-back)      |
| `priBareStd`         | Bare diameter truncated to 1 decimal (mm)       | Computed here                  |
| `insDiaPri`          | Calculated insulated wire diameter (mm)         | Computed here                  |
| `insDiaPriUsed`      | Insulated diameter read from override field     | Computed / user override       |
| `priFlatBreadth`     | Flat wire breadth dimension (mm)                | User input (flat path only)    |
| `priFlatHeight`      | Flat wire height dimension (mm)                 | User input (flat path only)    |
| `priParallel`        | Number of parallel flat conductors              | User input (default: 1)        |
| `priEffectiveHeight` | Total effective height of parallel flat wires   | Computed here (flat path)      |
| `enteredArea_pri`    | Single flat conductor area (mm²)                | Computed here (flat path)      |
| `priEffectiveArea`   | Total effective area of flat conductor (mm²)    | Computed here (flat path)      |

### Input Variables
- `vaOutput` — read from field `#vaConductorInput` (auto-populated from Phase 1 `va`)
- `vPriUsed` — read from field `#vPriConductorInput` (auto-populated from Phase 1 `primaryVoltage`)
- `delta` — read from field `#delta` (default: `2.5`)
- `priInsAdd` — read from field `#priInsAddition` (default: `0.1`)

### Output Variables
- `iPri` — written to `#iPriOutput` (2 decimal places)
- SWG string — written to `#priSwgOutput` (e.g. "12 SWG") — read-only display
- `bareDiaPri` — written to `#priBareDiaOutput` (2 decimal places)
- `insDiaPri` — written to `#priInsDiaInput` (2 decimal places)
- `priEnteredAreaOutput` — flat path only (2 decimal places)
- `priEffectiveHeightOutput` — flat path only (2 decimal places)
- `priFlatAreaOutput` — flat path only (2 decimal places)
- `priFlatWireSection` — visibility toggled (display:block if SWG <= 13, else display:none)

### SWG Lookup
- `getSWGForCurrent(iPri)` — called with computed `iPri`
- Returns the nearest SWG number from `swgTable` in `js/swgData.js`
- If SWG result <= 13: `priFlatWireSection` is shown; strip suggestions generated
- If SWG result > 13: flat wire section is hidden; round wire radio forced
- See `04-lookups.md` for full `swgTable` and `getSWGForCurrent` documentation

### Strip Suggestion Helper
- `generateStripSuggestions(priArea)` — called with computed `priArea`
- Returns factor-pair strings for the rounded area
- Output written to `#priStripSuggestions` (display only — not used in calculation)
- See `04-lookups.md` for full `generateStripSuggestions` documentation

### Default Values
- `delta` = `2.5` A/mm²
- `priInsAddition` = `0.1` mm
- `priParallel` = `1`

### User-Overridable Values
- `#vaConductorInput`, `#vPriConductorInput` — feed values can be overridden
- `#iPriOutput` — computed current can be overridden
- `#priBareDiaOutput` — computed bare diameter can be overridden
- `#priInsDiaInput` — computed insulated diameter can be overridden (active calculation input)

### Constants
- `PI` = `Math.PI` (JavaScript built-in, ≈ 3.14159265...)

### Rounding Applied
- `parseFloat(iPri.toFixed(2))` — primary current to 2 decimal places
- `parseFloat(bareDiaPri.toFixed(2))` — bare diameter to 2 decimal places
- `Math.floor(priBareDiaUsed * 10) / 10` — bare diameter TRUNCATED to 1 decimal (priBareStd)
- `parseFloat(insDiaPri.toFixed(2))` — insulated diameter to 2 decimal places
- `parseFloat(enteredArea.toFixed(2))` — flat entered area to 2 decimal places (flat path)
- `parseFloat(priEffectiveHeight.toFixed(2))` — effective height to 2 decimal places (flat path)
- `parseFloat(priEffectiveArea.toFixed(2))` — effective area to 2 decimal places (flat path)
- See `05-rounding.md` for full documentation.

### Guard Conditions
- If `vaOutput` or `vPriUsed` is null/falsy: `iPri = null`, all Step 7 outputs blank
- If `iPri` is null: SWG lookup skipped, flat section hidden
- If `delta` is null/falsy: `priArea = null`, diameter outputs blank
- Flat path only executes when `isPriFlat === true` AND both `priFlatBreadth` and `priFlatHeight` are non-null

---

## Step 8 — Primary Turns Per Limb, TPL, and Layers

### Purpose
Distributes the total primary turns across the transformer limbs, then determines
how many turns fit per layer given the available bobbin winding length, and from
that computes the number of winding layers needed.

### Formula 8A — Primary Turns Per Limb
```
priTurnsLimb = Math.ceil(priTurnsUsed / limbsCount)
```

### Formula 8B — Available Winding Length
```
priWindingLen = bobbinHeightPri - bobbinFlange
```

### Formula 8C — Turns Per Layer (Round Wire Path)
```
priTPL = Math.floor(priWindingLen / insDiaPriUsed) - priSafetyMargin
```

### Formula 8C — Turns Per Layer (Flat Wire Path)
```
priTPL = Math.floor(priWindingLen / priFlatBreadth) - priSafetyMargin
```

### Formula 8D — Primary Layers
```
priLayers = Math.ceil(priTurnsLimbUsed / priTPLUsed)
```

### Variables Used — Step 8

| Symbol            | Description                                       | Source                           |
|-------------------|---------------------------------------------------|----------------------------------|
| `priTurnsUsed`    | Total primary turns                               | Phase 1 Step 3 `primaryTurns`    |
| `limbsCount`      | Number of transformer limbs                       | User input (default: 2)          |
| `bobbinHeightPri` | Primary bobbin height (mm)                        | User input                       |
| `bobbinFlange`    | Bobbin flange deduction (mm)                      | User input (default: 7)          |
| `priSafetyMargin` | Safety turns deducted from TPL                    | User input (default: 1)          |
| `insDiaPriUsed`   | Insulated wire diameter (mm)                      | Step 7 / override                |
| `priFlatBreadth`  | Flat wire breadth (mm) — flat path divisor        | User input (flat path only)      |
| `priTurnsLimb`    | Turns distributed per limb (integer)              | Computed here                    |
| `priWindingLen`   | Effective winding length on bobbin (mm)           | Computed here (intermediate)     |
| `priTPL`          | Turns per layer (integer)                         | Computed here                    |
| `priLayers`       | Number of winding layers (integer)                | Computed here                    |

### Input Variables
- `priTurnsUsed` — read from `#primaryTurns` (Phase 1 output / override)
- `limbsCount` — read from `#limbsCount` (default: 2)
- `bobbinHeightPri` — read from `#bobbinHeightPri`
- `bobbinFlange` — read from `#bobbinFlange` (default: 7)
- `priSafetyMargin` — read from `#priSafetyMargin` (default: 1)
- Wire diameter or breadth: from Step 7 outputs

### Output Variables
- `priTurnsLimb` — written to `#priTurnsLimbOutput`
- `priTPL` — written to `#priTplOutput`
- `priLayers` — written to `#priLayersOutput`

### User-Overridable Values
- `#priTurnsLimbOutput`, `#priTplOutput`, `#priLayersOutput` — all overridable

### Rounding Applied
- `Math.ceil(priTurnsUsed / limbsCount)` — turns per limb always rounded UP
- `Math.floor(priWindingLen / diameter) - priSafetyMargin` — TPL always rounded DOWN then deducted
- `Math.ceil(priTurnsLimbUsed / priTPLUsed)` — layers always rounded UP
- See `05-rounding.md` for full documentation.

### Guard Conditions
- If `priTurnsUsed` or `limbsCount` is null/falsy: `priTurnsLimb = null`
- If `bobbinHeightPri` is null: `priWindingLen = null`, `priTPL = null`
- Flat path: requires `priFlatBreadth` non-null; round path: requires `insDiaPriUsed` non-null
- If `priTurnsLimbUsed` or `priTPLUsed` is null/falsy: `priLayers = null`

---

## Step 9 — Primary Radial Thickness

### Purpose
Computes the total radial build (depth) of the primary winding, accounting for
the number of wire layers and the interlayer paper insulation sheets.

### Formula 9 — Primary Radial Build (Round Wire Path)
```
priRadBuild = (insDiaPriUsed * priLayersUsed) + (paperThickness * priPaperLayers)
```

### Formula 9 — Primary Radial Build (Flat Wire Path)
```
priRadBuild = (priEffectiveHeight * priLayersUsed) + (paperThickness * priPaperLayers)
```

### Variables Used — Step 9

| Symbol             | Description                                          | Source                    |
|--------------------|------------------------------------------------------|---------------------------|
| `insDiaPriUsed`    | Insulated wire diameter per layer (mm) — round path  | Step 7 / override         |
| `priEffectiveHeight`| Effective flat wire height (mm) — flat path         | Step 7 flat computation   |
| `priLayersUsed`    | Number of winding layers                             | Step 8 / override         |
| `paperThickness`   | Interlayer paper insulation thickness (mm)           | User input (default: 0.127)|
| `priPaperLayers`   | Number of paper insulation sheets                    | User input (default: 4)   |
| `priRadBuild`      | Total primary radial thickness (mm, unceiled)        | Computed here             |

### Output Variables
- `priRadialOutput` — written as `Math.ceil(priRadBuild)`

### User-Overridable Values
- `#priRadialOutput` — overridable

### Rounding Applied
- `Math.ceil(priRadBuild)` — radial thickness always rounded UP to next integer mm
- Display trace uses `priRadBuild.toFixed(2)` (trace only)
- See `05-rounding.md` for full documentation.

### Guard Conditions
- Round path: both `insDiaPriUsed` and `priLayersUsed` must be non-null
- Flat path: both `priEffectiveHeight` and `priLayersUsed` must be non-null
- If guard fails: `priRadBuild = null`, `#priRadialOutput` remains blank

---

## Step 10 — Primary LMT and Conductor Weight

### Purpose
Computes the mean length of a single primary winding turn (LMT) by averaging the
inner and outer winding perimeters, then multiplies by the total number of turns
and the conductor's volume-to-mass ratio to get the total primary conductor weight.

### Formula 10A — Inner Coil Width
```
innerW = tongueWidth + (2 * coilClearance)
```

### Formula 10B — Inner Coil Length
```
innerL = stackHeight + (2 * coilClearance)
```

### Formula 10C — Outer Coil Width (after primary winding)
```
priOuterW = innerW + (2 * priRadUsed)
```

### Formula 10D — Outer Coil Length (after primary winding)
```
priOuterL = innerL + (2 * priRadUsed)
```

### Formula 10E — Primary Mean Turn Length (LMT)
```
priLMT = (innerW + priOuterW + innerL + priOuterL) / 1000
```
*Division by 1000 converts mm to metres.*

### Formula 10F — Actual Wire Cross-Sectional Area (for weight)
```
priActualArea = (Math.PI * Math.pow(insDiaPriUsed, 2)) / 4
```
*Uses the insulated diameter (from field `#priInsDiaInput`), not the bare diameter.*

### Formula 10G — Primary Conductor Weight
```
priWeight = priLMTUsed * priTurnsLimbUsed * limbsCount * priActualArea * rhoCu * 1e-3
```
*Multiplication by `1e-3` converts mm² to cm² equivalent for the density-based mass formula.*

### Variables Used — Step 10

| Symbol            | Description                                           | Source                          |
|-------------------|-------------------------------------------------------|---------------------------------|
| `tongueWidth`     | Core tongue width (mm)                                | Phase 2 / user input            |
| `stackHeight`     | Core stack height (mm)                                | Phase 2 / user input            |
| `coilClearance`   | Gap between core surface and first winding (mm)       | User input (default: 3.5)       |
| `priRadUsed`      | Primary radial thickness (mm, integer)                | Step 9 / override               |
| `innerW`          | Inner winding width (mm)                              | Computed here (intermediate)    |
| `innerL`          | Inner winding length (mm)                             | Computed here (intermediate)    |
| `priOuterW`       | Outer winding width after primary (mm)                | Computed here (intermediate)    |
| `priOuterL`       | Outer winding length after primary (mm)               | Computed here (intermediate)    |
| `priLMT`          | Primary mean turn length (metres)                     | Computed here                   |
| `insDiaPriUsed`   | Insulated wire diameter (mm)                          | Step 7 / override               |
| `priActualArea`   | Actual circular cross-section area (mm²)              | Computed here (intermediate)    |
| `priTurnsLimbUsed`| Turns per limb                                        | Step 8 / override               |
| `limbsCount`      | Number of limbs                                       | User input (default: 2)         |
| `rhoCu`           | Conductor material density (g/cc)                     | User input / material selection |
| `priWeight`       | Total primary conductor weight (kg)                   | Computed here                   |

### Input Variables
- `coilClearance` — from `#coilClearance` (default: 3.5)
- `rhoCu` — from `#rhoCu` (default: 8.89 for Copper; 2.703 for Aluminium)

### Output Variables
- `priLmtOutput` — written as `parseFloat(priLMT.toFixed(3))`
- `priWeightOutput` — written as `parseFloat(priWeight.toFixed(2))`
  (also carries `data-cost-type="winding"` and `data-cost-name="Primary"` attributes
  for the cost module to read)

### User-Overridable Values
- `#priLmtOutput`, `#priWeightOutput` — both overridable

### Constants
- `Math.PI` — JavaScript built-in
- `1e-3` — unit conversion factor (hardcoded in weight formula)
- `1000` — mm to metres conversion (hardcoded in LMT formula)

### Rounding Applied
- `parseFloat(priLMT.toFixed(3))` — LMT to 3 decimal places
- `parseFloat(priWeight.toFixed(2))` — weight to 2 decimal places
- `priActualArea.toFixed(2)` — used in display trace only, not in calculation chain
- See `05-rounding.md` for full documentation.

### Guard Conditions
- `innerW` requires `tongueWidth` non-null; `innerL` requires `stackHeight` non-null
- `priLMT` requires all four perimeter terms non-null
- `priActualArea` requires `insDiaPriUsed` non-null
- `priWeight` requires all of: `priLMTUsed`, `priTurnsLimbUsed`, `priActualArea`, `rhoCu` non-null

### Cross-Phase Note
- `innerW` and `innerL` are computed here and used as-is by Phase 5 Step 17
  (secondary LMT calculation). They are intermediate JS variables not written to DOM.

---

## Phase 3 — Completeness Review

### All Calculations Documented

| Step  | Calculation                                                                      | Documented |
|-------|----------------------------------------------------------------------------------|------------|
| 7A    | iPri = vaOutput / vPriUsed                                                       | YES        |
| 7B    | priArea = iPri / delta                                                           | YES        |
| 7C    | bareDiaPri = SQRT((priArea * 4) / PI)                                           | YES        |
| 7D    | priBareStd = Math.floor(priBareDiaUsed * 10) / 10                               | YES        |
| 7E    | insDiaPri = priBareStd + priInsAdd                                               | YES        |
| 7F    | enteredArea_pri = priFlatBreadth * priFlatHeight (flat path)                     | YES        |
| 7G    | priEffectiveHeight = priFlatHeight * priParallel (flat path)                     | YES        |
| 7H    | priEffectiveArea = priFlatBreadth * priEffectiveHeight (flat path)               | YES        |
| 7I    | Warning condition: |priEffectiveArea - priArea| / priArea > 0.1                  | YES        |
| 7-SWG | getSWGForCurrent(iPri) lookup                                                   | YES        |
| 8A    | priTurnsLimb = Math.ceil(priTurnsUsed / limbsCount)                             | YES        |
| 8B    | priWindingLen = bobbinHeightPri - bobbinFlange                                   | YES        |
| 8C    | priTPL = Math.floor(priWindingLen / diameter) - priSafetyMargin (both paths)    | YES        |
| 8D    | priLayers = Math.ceil(priTurnsLimbUsed / priTPLUsed)                            | YES        |
| 9     | priRadBuild = (diameter * layers) + (paperThickness * paperLayers) (both paths) | YES        |
| 10A   | innerW = tongueWidth + (2 * coilClearance)                                      | YES        |
| 10B   | innerL = stackHeight + (2 * coilClearance)                                      | YES        |
| 10C   | priOuterW = innerW + (2 * priRadUsed)                                           | YES        |
| 10D   | priOuterL = innerL + (2 * priRadUsed)                                           | YES        |
| 10E   | priLMT = (innerW + priOuterW + innerL + priOuterL) / 1000                       | YES        |
| 10F   | priActualArea = (PI * insDiaPriUsed^2) / 4                                      | YES        |
| 10G   | priWeight = priLMT * priTurnsLimb * limbsCount * priActualArea * rhoCu * 1e-3  | YES        |

### Cross-Phase Contamination Check
- `vaConductorInput` and `vPriConductorInput` are data-forwarded from Phase 1.
  Phase 3 only reads them — does not compute them. ✓
- `innerW` and `innerL` are intermediate variables first computed in Phase 3 Step 10.
  Phase 5 Step 17 reuses them as JS variables (not DOM reads). Correctly owned by Phase 3. ✓
- `priWeightOutput` carries HTML data attributes consumed by Phase 7 cost module.
  The weight calculation is Phase 3. The cost calculation is Phase 7. ✓

### Execution Order Verified
Steps 7A → 7B → 7C → 7D → 7E → (7F → 7G → 7H → 7I flat path) → SWG lookup →
8A → 8B → 8C → 8D → 9 → 10A → 10B → 10C → 10D → 10E → 10F → 10G
matches the exact sequential execution in `js/app.js`.
