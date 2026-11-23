# Phase 03 — Primary Winding Design
## File: 05-rounding.md

> **Scope:** Every rounding rule applied to variables in Phase 3.
> Rules documented in execution order. No inferred reasons included.

---

## Rounding Rules

### Rule 1 — Primary Current

| Property             | Value                                                   |
|----------------------|---------------------------------------------------------|
| Variable             | `iPri` (written to `#iPriOutput`)                       |
| Step                 | Step 7A                                                 |
| Rounding Method      | Fixed decimal places                                    |
| Exact Implementation | `parseFloat(iPri.toFixed(2))`                          |
| Decimal Places       | 2                                                       |
| Direction            | Standard JS toFixed (half-up)                          |
| Applied To           | Display and override field for primary current          |

---

### Rule 2 — Target Bare Wire Diameter

| Property             | Value                                                   |
|----------------------|---------------------------------------------------------|
| Variable             | `bareDiaPri` (written to `#priBareDiaOutput`)           |
| Step                 | Step 7C                                                 |
| Rounding Method      | Fixed decimal places                                    |
| Exact Implementation | `parseFloat(bareDiaPri.toFixed(2))`                    |
| Decimal Places       | 2                                                       |
| Direction            | Standard JS toFixed (half-up)                          |
| Applied To           | Display and override field for bare diameter            |

---

### Rule 3 — Standardized Bare Diameter (TRUNCATION)

| Property             | Value                                                            |
|----------------------|------------------------------------------------------------------|
| Variable             | `priBareStd` (internal JS variable — NOT written to DOM)         |
| Step                 | Step 7D                                                          |
| Rounding Method      | FLOOR — Truncation to 1 decimal place                           |
| Exact Implementation | `Math.floor(priBareDiaUsed * 10) / 10`                          |
| Decimal Places       | 1                                                                |
| Direction            | Always DOWN — this is truncation, NOT standard rounding          |
| Applied To           | Intermediate bare diameter before insulation is added            |

**Critical Detail:** `priBareDiaUsed` is the value READ BACK from `#priBareDiaOutput`
AFTER the `auto()` write (which applied Rule 2). So the input to Rule 3 is already
at 2 decimal places from Rule 2 — the truncation then further reduces it to 1 decimal.
Example: `bareDiaPri = 2.347` -> Rule 2 writes `2.35` -> Rule 3 reads `2.35` ->
`Math.floor(2.35 * 10) / 10 = Math.floor(23.5) / 10 = 23 / 10 = 2.3`.

Uses the same helper function pattern as Phase 1:
```javascript
function truncateToOneDecimal(num) {
    if (num === null || isNaN(num)) return null;
    return Math.floor(num * 10) / 10;
}
```

---

### Rule 4 — Insulated Wire Diameter

| Property             | Value                                                   |
|----------------------|---------------------------------------------------------|
| Variable             | `insDiaPri` (written to `#priInsDiaInput`)              |
| Step                 | Step 7E                                                 |
| Rounding Method      | Fixed decimal places                                    |
| Exact Implementation | `parseFloat(insDiaPri.toFixed(2))`                     |
| Decimal Places       | 2                                                       |
| Direction            | Standard JS toFixed (half-up)                          |
| Applied To           | Active insulated diameter field (input to Steps 8, 9, 10) |

---

### Rule 5 — Flat Wire: Entered Area (Display)

| Property             | Value                                                         |
|----------------------|---------------------------------------------------------------|
| Variable             | Written to `#priEnteredAreaOutput`                            |
| Step                 | Step 7F                                                       |
| Rounding Method      | Fixed decimal places                                          |
| Exact Implementation | `parseFloat(enteredArea.toFixed(2))`                         |
| Decimal Places       | 2                                                             |
| Direction            | Standard JS toFixed                                           |
| Applied To           | Read-only display field — not used in any calculation         |

---

### Rule 6 — Flat Wire: Effective Height (Display)

| Property             | Value                                                         |
|----------------------|---------------------------------------------------------------|
| Variable             | Written to `#priEffectiveHeightOutput`                        |
| Step                 | Step 7G                                                       |
| Rounding Method      | Fixed decimal places                                          |
| Exact Implementation | `parseFloat(priEffectiveHeight.toFixed(2))`                  |
| Decimal Places       | 2                                                             |
| Direction            | Standard JS toFixed                                           |
| Applied To           | Read-only display only — the raw JS variable `priEffectiveHeight` is used in Step 9, not this field |

---

### Rule 7 — Flat Wire: Effective Area (Display)

| Property             | Value                                                         |
|----------------------|---------------------------------------------------------------|
| Variable             | Written to `#priFlatAreaOutput`                               |
| Step                 | Step 7H                                                       |
| Rounding Method      | Fixed decimal places                                          |
| Exact Implementation | `parseFloat(priEffectiveArea.toFixed(2))`                    |
| Decimal Places       | 2                                                             |
| Direction            | Standard JS toFixed                                           |
| Applied To           | Read-only display only — not used in any calculation          |

---

### Rule 8 — Primary Turns Per Limb (CEILING)

| Property             | Value                                                         |
|----------------------|---------------------------------------------------------------|
| Variable             | `priTurnsLimb` (written to `#priTurnsLimbOutput`)             |
| Step                 | Step 8A                                                       |
| Rounding Method      | CEIL — always rounds up to nearest integer                    |
| Exact Implementation | `Math.ceil(priTurnsUsed / limbsCount)`                        |
| Decimal Places       | 0 (integer)                                                   |
| Direction            | Always UP                                                     |
| Applied To           | Turns-per-limb distribution                                   |

---

### Rule 9 — Turns Per Layer (FLOOR then subtract)

| Property             | Value                                                            |
|----------------------|------------------------------------------------------------------|
| Variable             | `priTPL` (written to `#priTplOutput`)                            |
| Step                 | Step 8C                                                          |
| Rounding Method      | FLOOR then integer subtraction                                   |
| Exact Implementation | `Math.floor(priWindingLen / diameter) - priSafetyMargin`         |
| Decimal Places       | 0 (integer)                                                      |
| Direction            | Floor first (always DOWN), then subtract safety margin turns     |
| Applied To           | Turns-per-layer count for both round and flat wire paths         |

**Diameter is:**
- `insDiaPriUsed` for round wire path
- `priFlatBreadth` for flat wire path

---

### Rule 10 — Primary Layers (CEILING)

| Property             | Value                                                         |
|----------------------|---------------------------------------------------------------|
| Variable             | `priLayers` (written to `#priLayersOutput`)                   |
| Step                 | Step 8D                                                       |
| Rounding Method      | CEIL — always rounds up to nearest integer                    |
| Exact Implementation | `Math.ceil(priTurnsLimbUsed / priTPLUsed)`                   |
| Decimal Places       | 0 (integer)                                                   |
| Direction            | Always UP                                                     |
| Applied To           | Layer count calculation                                       |

---

### Rule 11 — Primary Radial Thickness (CEILING)

| Property             | Value                                                         |
|----------------------|---------------------------------------------------------------|
| Variable             | `priRadBuild` result (written to `#priRadialOutput`)          |
| Step                 | Step 9                                                        |
| Rounding Method      | CEIL — always rounds up to nearest integer mm                 |
| Exact Implementation | `Math.ceil(priRadBuild)`                                      |
| Decimal Places       | 0 (integer mm)                                                |
| Direction            | Always UP                                                     |
| Applied To           | Final radial thickness used by Phase 4 hardware calculations  |

**Display trace only:** `priRadBuild.toFixed(2)` used in `#calc9` string — not in chain.

---

### Rule 12 — Primary LMT

| Property             | Value                                                         |
|----------------------|---------------------------------------------------------------|
| Variable             | `priLMT` (written to `#priLmtOutput`)                         |
| Step                 | Step 10E                                                      |
| Rounding Method      | Fixed decimal places                                          |
| Exact Implementation | `parseFloat(priLMT.toFixed(3))`                              |
| Decimal Places       | 3                                                             |
| Direction            | Standard JS toFixed                                           |
| Applied To           | Mean turn length in metres                                    |

---

### Rule 13 — Primary Conductor Weight

| Property             | Value                                                         |
|----------------------|---------------------------------------------------------------|
| Variable             | `priWeight` (written to `#priWeightOutput`)                   |
| Step                 | Step 10G                                                      |
| Rounding Method      | Fixed decimal places                                          |
| Exact Implementation | `parseFloat(priWeight.toFixed(2))`                           |
| Decimal Places       | 2                                                             |
| Direction            | Standard JS toFixed                                           |
| Applied To           | Final weight value (also consumed by Phase 7 cost module)     |

---

### Rule 14 — Actual Conductor Area (Display Trace Only)

| Property             | Value                                                         |
|----------------------|---------------------------------------------------------------|
| Variable             | `priActualArea` (in `#calc10` display trace)                  |
| Step                 | Step 10F / 10G                                                |
| Rounding Method      | Fixed decimal places                                          |
| Exact Implementation | `priActualArea.toFixed(2)` — used in trace string only        |
| Decimal Places       | 2                                                             |
| Applied To           | Display trace `#calc10` ONLY — raw `priActualArea` float used in weight formula |

---

### Rule 15 — Strip Suggestion Area (Internal to Helper)

| Property             | Value                                                              |
|----------------------|--------------------------------------------------------------------|
| Variable             | `target` inside `generateStripSuggestions()`                       |
| Step                 | Step 7 (strip suggestion helper)                                   |
| Rounding Method      | Round to nearest integer                                           |
| Exact Implementation | `Math.round(requiredArea)` inside `generateStripSuggestions`       |
| Decimal Places       | 0 (integer)                                                        |
| Direction            | Standard rounding                                                  |
| Applied To           | The area used to find integer factor pairs for strip dimension hints |

---

## Summary Table

| Rule | Variable / Field            | Step    | Method               | Implementation                                      |
|------|-----------------------------|---------|----------------------|-----------------------------------------------------|
| 1    | `#iPriOutput`               | 7A      | toFixed(2)           | `parseFloat(iPri.toFixed(2))`                      |
| 2    | `#priBareDiaOutput`         | 7C      | toFixed(2)           | `parseFloat(bareDiaPri.toFixed(2))`                |
| 3    | `priBareStd` (internal)     | 7D      | FLOOR/truncate       | `Math.floor(priBareDiaUsed * 10) / 10`             |
| 4    | `#priInsDiaInput`           | 7E      | toFixed(2)           | `parseFloat(insDiaPri.toFixed(2))`                 |
| 5    | `#priEnteredAreaOutput`     | 7F      | toFixed(2)           | `parseFloat(enteredArea.toFixed(2))` — display only |
| 6    | `#priEffectiveHeightOutput` | 7G      | toFixed(2)           | `parseFloat(priEffectiveHeight.toFixed(2))` — display only |
| 7    | `#priFlatAreaOutput`        | 7H      | toFixed(2)           | `parseFloat(priEffectiveArea.toFixed(2))` — display only |
| 8    | `#priTurnsLimbOutput`       | 8A      | CEIL                 | `Math.ceil(priTurnsUsed / limbsCount)`             |
| 9    | `#priTplOutput`             | 8C      | FLOOR + subtract     | `Math.floor(len / diam) - margin`                  |
| 10   | `#priLayersOutput`          | 8D      | CEIL                 | `Math.ceil(priTurnsLimbUsed / priTPLUsed)`         |
| 11   | `#priRadialOutput`          | 9       | CEIL                 | `Math.ceil(priRadBuild)`                           |
| 12   | `#priLmtOutput`             | 10E     | toFixed(3)           | `parseFloat(priLMT.toFixed(3))`                    |
| 13   | `#priWeightOutput`          | 10G     | toFixed(2)           | `parseFloat(priWeight.toFixed(2))`                 |
| 14   | `priActualArea` (trace)     | 10F/10G | toFixed(2)           | `priActualArea.toFixed(2)` — trace only            |
| 15   | `target` in strip helper    | 7 helper| Math.round           | `Math.round(requiredArea)` — in helper function    |
