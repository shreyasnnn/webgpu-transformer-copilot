# Phase 05 — Secondary Winding Design
## File: 05-rounding.md

> **Scope:** Every rounding rule applied to Phase 5 variables.
> Rules documented in execution order. No inferred reasons included.
> Phase 5 uses the same rounding patterns as Phase 3 (Primary Winding Design).

---

## Rounding Rules

### Rule 1 — Target Bare Wire Diameter

| Property             | Value                                                   |
|----------------------|---------------------------------------------------------|
| Variable             | `bareDiaSec` (written to `#secBareDiaOutput`)           |
| Step                 | Step 15B                                                |
| Rounding Method      | Fixed decimal places                                    |
| Exact Implementation | `parseFloat(bareDiaSec.toFixed(2))`                    |
| Decimal Places       | 2                                                       |
| Direction            | Standard JS toFixed (half-up)                          |
| Applied To           | Display and override field for bare diameter            |

---

### Rule 2 — Standardized Bare Diameter (TRUNCATION)

| Property             | Value                                                            |
|----------------------|------------------------------------------------------------------|
| Variable             | `secBareStd` (internal JS variable — NOT written to DOM)         |
| Step                 | Step 15C                                                         |
| Rounding Method      | FLOOR — Truncation to 1 decimal place                           |
| Exact Implementation | `Math.floor(secBareDiaUsed * 10) / 10`                          |
| Decimal Places       | 1                                                                |
| Direction            | Always DOWN — truncation, NOT standard rounding                 |
| Applied To           | Intermediate bare diameter before insulation increment is added  |

**Chained rounding detail:** `secBareDiaUsed` is read back from `#secBareDiaOutput`
AFTER Rule 1 (2dp). So `secBareStd` truncates the already-2dp value to 1dp.
Example: `bareDiaSec = 1.847` → Rule 1 writes `1.85` → Rule 2: `Math.floor(1.85 * 10) / 10 = 1.8`

---

### Rule 3 — Insulated Wire Diameter

| Property             | Value                                                   |
|----------------------|---------------------------------------------------------|
| Variable             | `secInsDia` (written to `#secInsDiaInput`)              |
| Step                 | Step 15D                                                |
| Rounding Method      | Fixed decimal places                                    |
| Exact Implementation | `parseFloat(secInsDia.toFixed(2))`                     |
| Decimal Places       | 2                                                       |
| Direction            | Standard JS toFixed (half-up)                          |
| Applied To           | Active insulated diameter field (input to Steps 16, 17) |

---

### Rule 4 — Flat Wire: Entered Area (Display)

| Property             | Value                                                         |
|----------------------|---------------------------------------------------------------|
| Variable             | Written to `#secEnteredAreaOutput`                            |
| Step                 | Step 15E                                                      |
| Rounding Method      | Fixed decimal places                                          |
| Exact Implementation | `parseFloat(enteredArea.toFixed(2))`                         |
| Decimal Places       | 2                                                             |
| Direction            | Standard JS toFixed                                           |
| Applied To           | Read-only display field — not used in any calculation         |

---

### Rule 5 — Flat Wire: Effective Height (Display)

| Property             | Value                                                         |
|----------------------|---------------------------------------------------------------|
| Variable             | Written to `#secEffectiveHeightOutput`                        |
| Step                 | Step 15F                                                      |
| Rounding Method      | Fixed decimal places                                          |
| Exact Implementation | `parseFloat(secEffectiveHeight.toFixed(2))`                  |
| Decimal Places       | 2                                                             |
| Direction            | Standard JS toFixed                                           |
| Applied To           | Read-only display only — raw JS var `secEffectiveHeight` is used in Step 16F radial build |

---

### Rule 6 — Flat Wire: Effective Area (Display)

| Property             | Value                                                         |
|----------------------|---------------------------------------------------------------|
| Variable             | Written to `#secFlatAreaOutput`                               |
| Step                 | Step 15G                                                      |
| Rounding Method      | Fixed decimal places                                          |
| Exact Implementation | `parseFloat(secEffectiveArea.toFixed(2))`                    |
| Decimal Places       | 2                                                             |
| Direction            | Standard JS toFixed                                           |
| Applied To           | Read-only display only — not used in any calculation          |

---

### Rule 7 — Secondary Turns Per Limb (CEILING)

| Property             | Value                                                         |
|----------------------|---------------------------------------------------------------|
| Variable             | `secTurnsLimb` (written to `#secTurnsLimbOutput`)             |
| Step                 | Step 16A                                                      |
| Rounding Method      | CEIL — always rounds up to nearest integer                    |
| Exact Implementation | `Math.ceil(secTurnsUsed / limbsCount)`                        |
| Decimal Places       | 0 (integer)                                                   |
| Direction            | Always UP                                                     |
| Applied To           | Secondary turns-per-limb distribution                         |

---

### Rule 8 — Secondary Turns Per Layer (FLOOR then subtract)

| Property             | Value                                                            |
|----------------------|------------------------------------------------------------------|
| Variable             | `secTPL` (written to `#secTplOutput`)                            |
| Step                 | Step 16C                                                         |
| Rounding Method      | FLOOR then integer subtraction                                   |
| Exact Implementation | `Math.floor(secWindingLen / divisor) - secSafetyMargin`          |
| Decimal Places       | 0 (integer)                                                      |
| Direction            | Floor first (always DOWN), then subtract safety margin           |
| Applied To           | Turns-per-layer count for both round and flat wire paths         |

**Divisor is:**
- `insDiaSecUsed` for round wire path
- `secFlatBreadth` for flat wire path

---

### Rule 9 — Secondary Layers (CEILING)

| Property             | Value                                                         |
|----------------------|---------------------------------------------------------------|
| Variable             | `secLayers` (written to `#secLayersOutput`)                   |
| Step                 | Step 16D                                                      |
| Rounding Method      | CEIL — always rounds up to nearest integer                    |
| Exact Implementation | `Math.ceil(secTurnsLimbUsed / secTPLUsed)`                   |
| Decimal Places       | 0 (integer)                                                   |
| Direction            | Always UP                                                     |
| Applied To           | Secondary layer count                                         |

---

### Rule 10 — Secondary Radial Thickness (CEILING)

| Property             | Value                                                         |
|----------------------|---------------------------------------------------------------|
| Variable             | `secRadBuild` result (written to `#secRadialOutput`)          |
| Step                 | Steps 16E / 16F                                               |
| Rounding Method      | CEIL — always rounds up to nearest integer mm                 |
| Exact Implementation | `Math.ceil(secRadBuild)`                                      |
| Decimal Places       | 0 (integer mm)                                                |
| Direction            | Always UP                                                     |
| Applied To           | Final radial thickness used in Phase 5 Step 17 and Phase 6    |

**Note:** `secRadBuild.toFixed(2)` is used in the `#calc16` display trace string
only — not in any calculation chain.

---

### Rule 11 — Secondary LMT

| Property             | Value                                                         |
|----------------------|---------------------------------------------------------------|
| Variable             | `secLMT` (written to `#secLmtOutput`)                         |
| Step                 | Step 17C                                                      |
| Rounding Method      | Fixed decimal places                                          |
| Exact Implementation | `parseFloat(secLMT.toFixed(3))`                              |
| Decimal Places       | 3                                                             |
| Direction            | Standard JS toFixed                                           |
| Applied To           | Mean turn length in metres                                    |

---

### Rule 12 — Secondary Conductor Weight

| Property             | Value                                                         |
|----------------------|---------------------------------------------------------------|
| Variable             | `secWeight` (written to `#secWeightOutput`)                   |
| Step                 | Step 17E                                                      |
| Rounding Method      | Fixed decimal places                                          |
| Exact Implementation | `parseFloat(secWeight.toFixed(2))`                           |
| Decimal Places       | 2                                                             |
| Direction            | Standard JS toFixed                                           |
| Applied To           | Final weight value (read by Phase 7 cost module)              |

---

### Rule 13 — Actual Conductor Area (Display Trace Only)

| Property             | Value                                                         |
|----------------------|---------------------------------------------------------------|
| Variable             | `secActualArea` (in `#calc17` display trace)                  |
| Step                 | Step 17D / 17E                                                |
| Rounding Method      | Fixed decimal places — display trace ONLY                     |
| Exact Implementation | `secActualArea.toFixed(2)` — used in trace string only        |
| Decimal Places       | 2                                                             |
| Applied To           | Display trace `#calc17` ONLY — raw float used in weight formula |

---

### Rule 14 — Strip Suggestion Area (Internal to Helper)

| Property             | Value                                                              |
|----------------------|--------------------------------------------------------------------|
| Variable             | `target` inside `generateStripSuggestions()`                       |
| Step                 | Step 15 (strip suggestion helper)                                  |
| Rounding Method      | Round to nearest integer                                           |
| Exact Implementation | `Math.round(requiredArea)` inside `generateStripSuggestions`       |
| Decimal Places       | 0 (integer)                                                        |
| Direction            | Standard rounding                                                  |
| Applied To           | Area used to find integer factor pairs for strip dimension hints    |

---

## Summary Table

| Rule | Variable / Field             | Step    | Method               | Implementation                                      |
|------|------------------------------|---------|----------------------|-----------------------------------------------------|
| 1    | `#secBareDiaOutput`          | 15B     | toFixed(2)           | `parseFloat(bareDiaSec.toFixed(2))`                |
| 2    | `secBareStd` (internal)      | 15C     | FLOOR/truncate       | `Math.floor(secBareDiaUsed * 10) / 10`             |
| 3    | `#secInsDiaInput`            | 15D     | toFixed(2)           | `parseFloat(secInsDia.toFixed(2))`                 |
| 4    | `#secEnteredAreaOutput`      | 15E     | toFixed(2)           | `parseFloat(enteredArea.toFixed(2))` — display only |
| 5    | `#secEffectiveHeightOutput`  | 15F     | toFixed(2)           | `parseFloat(secEffectiveHeight.toFixed(2))` — display only |
| 6    | `#secFlatAreaOutput`         | 15G     | toFixed(2)           | `parseFloat(secEffectiveArea.toFixed(2))` — display only |
| 7    | `#secTurnsLimbOutput`        | 16A     | CEIL                 | `Math.ceil(secTurnsUsed / limbsCount)`             |
| 8    | `#secTplOutput`              | 16C     | FLOOR + subtract     | `Math.floor(len / diam) - margin`                  |
| 9    | `#secLayersOutput`           | 16D     | CEIL                 | `Math.ceil(secTurnsLimbUsed / secTPLUsed)`         |
| 10   | `#secRadialOutput`           | 16E/16F | CEIL                 | `Math.ceil(secRadBuild)`                           |
| 11   | `#secLmtOutput`              | 17C     | toFixed(3)           | `parseFloat(secLMT.toFixed(3))`                    |
| 12   | `#secWeightOutput`           | 17E     | toFixed(2)           | `parseFloat(secWeight.toFixed(2))`                 |
| 13   | `secActualArea` (trace)      | 17D/17E | toFixed(2)           | `secActualArea.toFixed(2)` — trace only            |
| 14   | `target` in strip helper     | 15 helper| Math.round          | `Math.round(requiredArea)` — in helper function    |
