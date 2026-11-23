# Phase 05 — Secondary Winding Design
## File: 07-inputs.md

> **Scope:** Every user-facing input that directly participates in Phase 5 calculations.
> Inputs shared with earlier phases are cross-referenced. Only Phase-5-specific
> inputs are described in full here.

---

## Inputs Inherited from Earlier Phases

### From Phase 1
| Field ID           | Variable         | Used in Phase 5 Steps | Cross-Reference                                    |
|--------------------|------------------|-----------------------|----------------------------------------------------|
| `#iSecInput`       | `iSecInputCalc`  | Step 15A (aSec)       | Phase-01-Capacity-and-Electrical-Turns/07-inputs.md |
| `#secondaryTurns`  | `secTurnsUsed`   | Step 16A (turns/limb) | Phase-01-Capacity-and-Electrical-Turns/07-inputs.md |

### From Phase 3
| Field ID            | Variable         | Used in Phase 5 Steps          | Cross-Reference                                    |
|---------------------|------------------|--------------------------------|----------------------------------------------------|
| `#delta`            | `delta`          | Step 15A (aSec divisor)        | Phase-03-Primary-Winding-Design/07-inputs.md       |
| `#limbsCount`       | `limbsCount`     | Step 16A, 17E                  | Phase-03-Primary-Winding-Design/07-inputs.md       |
| `#bobbinFlange`     | `bobbinFlange`   | Step 16B (secWindingLen)       | Phase-03-Primary-Winding-Design/07-inputs.md       |
| `#paperThickness`   | `paperThickness` | Steps 16E, 16F (radial build)  | Phase-03-Primary-Winding-Design/07-inputs.md       |
| `#rhoCu`            | `rhoCu`          | Step 17E (weight formula)      | Phase-03-Primary-Winding-Design/07-inputs.md       |

---

## Primary User Inputs (Required — No Default) — Phase 5 Specific

### Input 1 — Secondary Bobbin Height

| Property             | Value                                                               |
|----------------------|---------------------------------------------------------------------|
| UI Label             | Sec Bobbin Height (mm)                                              |
| Field ID             | `#bobbinHeightSec`                                                  |
| Variable Name        | `bobbinHeightSec`                                                   |
| Data Type            | Number (float)                                                      |
| Unit                 | mm                                                                  |
| Default Value        | None — field starts empty                                           |
| Required             | Yes for TPL/layers — if empty, Steps 16–17 produce null             |
| User Editable        | Yes                                                                 |
| HTML Attributes      | `type="number"`, `step="any"`, `inputmode="decimal"`                |
| Validation Rules     | No explicit JS validation. If empty, `g()` returns null.            |
| Part of baseConstants| YES                                                                 |
| Used In Steps        | Step 16B (`secWindingLen = bobbinHeightSec - bobbinFlange`)         |

**Critical Note:** This is a SEPARATE field from `#bobbinHeightPri`. The primary and
secondary bobbins can have different heights. Using the wrong field in implementation
would be a silent engineering error.

---

### Input 2 — Flat Wire Breadth — Secondary (Flat Path Only)

| Property             | Value                                                              |
|----------------------|--------------------------------------------------------------------|
| UI Label             | Breadth (mm)                                                       |
| Field ID             | `#secFlatBreadth`                                                  |
| Variable Name        | `secFlatBreadth`                                                   |
| Data Type            | Number (float)                                                     |
| Unit                 | mm                                                                 |
| Default Value        | None                                                               |
| Required             | Only when flat wire is selected for secondary                      |
| User Editable        | Yes                                                                |
| HTML Attributes      | `type="number"`, `step="any"`, `inputmode="decimal"`               |
| Validation Rules     | No explicit validation. Silently skipped if null.                  |
| Part of baseConstants| NO                                                                 |
| Used In Steps        | Step 15E (enteredArea), Step 16C TPL divisor (flat path)           |

---

### Input 3 — Flat Wire Height — Secondary (Flat Path Only)

| Property             | Value                                                              |
|----------------------|--------------------------------------------------------------------|
| UI Label             | Height (mm)                                                        |
| Field ID             | `#secFlatHeight`                                                   |
| Variable Name        | `secFlatHeight`                                                    |
| Data Type            | Number (float)                                                     |
| Unit                 | mm                                                                 |
| Default Value        | None                                                               |
| Required             | Only when flat wire is selected for secondary                      |
| User Editable        | Yes                                                                |
| HTML Attributes      | `type="number"`, `step="any"`, `inputmode="decimal"`               |
| Validation Rules     | No explicit validation. Silently skipped if null.                  |
| Part of baseConstants| NO                                                                 |
| Used In Steps        | Step 15E (enteredArea), Step 15F (effectiveHeight), Step 16F (flat radial build) |

---

## Configurable Design Constants — Phase 5 Specific (Have Defaults)

### Input 4 — Secondary Insulation Increment

| Property             | Value                                                               |
|----------------------|---------------------------------------------------------------------|
| UI Label             | Insulation Increment (mm)                                           |
| Field ID             | `#secInsAddition`                                                   |
| Variable Name        | `secInsAdd`                                                         |
| Data Type            | Number (float)                                                      |
| Unit                 | mm                                                                  |
| Default Value        | `0.01` (set in HTML `value` attribute)                              |
| Required             | Yes — fallback to `0.01` via `|| 0.01` if null                      |
| User Editable        | Yes                                                                 |
| HTML Attributes      | `type="number"`, `step="any"`, `value="0.01"`, `inputmode="decimal"`|
| Validation Rules     | No explicit validation.                                             |
| Part of baseConstants| YES                                                                 |
| Used In Steps        | Step 15D (`secInsDia = secBareDiaUsed + secInsAdd`)                 |

**IMPORTANT DIFFERENCE FROM PRIMARY:** `priInsAddition` defaults to `0.1` mm.
`secInsAddition` defaults to `0.01` mm. This is implemented in app.js line 462:
`let secInsAdd = g("secInsAddition") || 0.01;`
This difference must be preserved exactly in any reimplementation.

---

### Input 5 — Secondary Safety Margin

| Property             | Value                                                              |
|----------------------|--------------------------------------------------------------------|
| UI Label             | Safety Margin (Turns)                                              |
| Field ID             | `#secSafetyMargin`                                                 |
| Variable Name        | `secSafetyMargin`                                                  |
| Data Type            | Number (float — typically integer)                                 |
| Unit                 | turns                                                              |
| Default Value        | `0` (set in HTML `value` attribute)                                |
| Required             | Yes — fallback to `0` via `|| 0` if null                           |
| User Editable        | Yes                                                                |
| HTML Attributes      | `type="number"`, `step="any"`, `value="0"`, `inputmode="decimal"`  |
| Validation Rules     | No explicit validation.                                            |
| Part of baseConstants| YES                                                                |
| Used In Steps        | Step 16C (`secTPL = Math.floor(...) - secSafetyMargin`)            |

**IMPORTANT DIFFERENCE FROM PRIMARY:** `priSafetyMargin` defaults to `1`.
`secSafetyMargin` defaults to `0`.

---

### Input 6 — Secondary Paper Layers

| Property             | Value                                                              |
|----------------------|--------------------------------------------------------------------|
| UI Label             | Paper Layers Count                                                 |
| Field ID             | `#secPaperLayers`                                                  |
| Variable Name        | `secPaperLayers`                                                   |
| Data Type            | Number (float — typically integer)                                 |
| Unit                 | count                                                              |
| Default Value        | `4` (set in HTML `value` attribute)                                |
| Required             | Yes — fallback to `4` via `|| 4` if null                           |
| User Editable        | Yes                                                                |
| HTML Attributes      | `type="number"`, `step="any"`, `value="4"`, `inputmode="decimal"`  |
| Validation Rules     | No explicit validation.                                            |
| Part of baseConstants| YES                                                                |
| Used In Steps        | Steps 16E, 16F (`paperThickness * secPaperLayers` in radial build) |

---

### Input 7 — Parallel Flat Conductors — Secondary

| Property             | Value                                                              |
|----------------------|--------------------------------------------------------------------|
| UI Label             | Parallel Flat Conductors                                           |
| Field ID             | `#secParallel`                                                     |
| Variable Name        | `secParallel`                                                      |
| Data Type            | Number (integer)                                                   |
| Unit                 | count                                                              |
| Default Value        | `1` (set in HTML `value` attribute, fallback via `|| 1`)           |
| Required             | Flat path only — fallback to `1` if null                           |
| User Editable        | Yes                                                                |
| HTML Attributes      | `type="number"`, `step="1"`, `min="1"`, `value="1"`, `inputmode="numeric"` |
| Validation Rules     | `min="1"` enforced by browser HTML attribute. No JS validation.    |
| Part of baseConstants| YES                                                                |
| Used In Steps        | Step 15F (`secEffectiveHeight = secFlatHeight * secParallel`)      |

---

## Wire Type Radio Inputs — Secondary

| Field ID             | Type  | Name group     | Value    | Default Checked |
|----------------------|-------|----------------|----------|-----------------|
| `#secWireTypeRound`  | radio | `secWireType`  | `"round"`| YES             |
| `#secWireTypeFlat`   | radio | `secWireType`  | `"flat"` | NO              |

Read via:
```javascript
let isSecFlat = document.getElementById("secWireTypeFlat") &&
                document.getElementById("secWireTypeFlat").checked;
```
Saved/restored via `localStorage`. In `clearAll()`, round is forced to checked.

---

## Editable Override Inputs (Auto-Populated — User May Override)

| Field ID               | UI Label                    | Produced By   | Next Consumer                        |
|------------------------|-----------------------------|---------------|--------------------------------------|
| `#secBareDiaOutput`    | Target Bare d (mm)          | Step 15B      | Step 15C (read-back for secBareStd)  |
| `#secInsDiaInput`      | Selected Insulated d (mm)   | Step 15D      | Steps 16C, 17D (active input)        |
| `#secTurnsLimbOutput`  | Sec Turns/Limb              | Step 16A      | Step 17E                             |
| `#secTplOutput`        | Sec Turns Per Layer (TPL)   | Step 16C      | Step 16D                             |
| `#secLayersOutput`     | Sec Layers                  | Step 16D      | Steps 16E, 16F (radial build)        |
| `#secRadialOutput`     | Sec Radial Thickness (mm)   | Step 16E/F    | Step 17A, 17B (LMT geometry)         |
| `#secLmtOutput`        | Secondary LMT (m)           | Step 17C      | Step 17E (weight)                    |
| `#secWeightOutput`     | Sec Conductor Weight (kg)   | Step 17E      | Phase 7 cost module                  |

All the above are `type="number"`, `step="any"`, `inputmode="decimal"`, editable overrides,
NOT in `baseConstants`.

---

## Read-Only Display Fields (Not User-Editable)

| Field ID                    | Content                       | Produced By  | Note                       |
|-----------------------------|-------------------------------|--------------|----------------------------|
| `#secSwgOutput`             | SWG recommendation string     | Step 15-SWG  | Not a number input         |
| `#secStripSuggestions`      | Factor-pair strip hints       | Step 15-SWG  | innerText — display only   |
| `#secEnteredAreaOutput`     | Single flat wire area (mm²)   | Step 15E     | Value written directly     |
| `#secEffectiveHeightOutput` | Total flat wire height (mm)   | Step 15F     | Value written directly     |
| `#secFlatAreaOutput`        | Total flat wire area (mm²)    | Step 15G     | Value written directly     |
| `#secFlatWarning`           | Over-10% area warning         | Step 15H     | Visibility toggle only     |

---

## Input Helper Functions

Phase 5 uses the same `g(id)` and `auto(id, val)` helper functions as Phase 1.
See `Phase-01-Capacity-and-Electrical-Turns/07-inputs.md` for full definitions.
