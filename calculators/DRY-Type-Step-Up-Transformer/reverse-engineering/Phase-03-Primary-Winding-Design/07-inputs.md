# Phase 03 — Primary Winding Design
## File: 07-inputs.md

> **Scope:** Every user-facing input that directly participates in Phase 3 calculations.
> Auto-populated override fields are also included as they can act as user inputs.

---

## Primary User Inputs (Required — No Default)

### Input 1 — Primary Bobbin Height

| Property             | Value                                                              |
|----------------------|--------------------------------------------------------------------|
| UI Label             | Pri Bobbin Height (mm)                                             |
| Field ID             | `#bobbinHeightPri`                                                 |
| Variable Name        | `bobbinHeightPri`                                                  |
| Data Type            | Number (float)                                                     |
| Unit                 | mm                                                                 |
| Default Value        | None — field starts empty                                          |
| Required             | Yes for TPL/layers — if empty, Steps 8–9 produce null              |
| User Editable        | Yes                                                                |
| HTML Attributes      | `type="number"`, `step="any"`, `inputmode="decimal"`               |
| Validation Rules     | No explicit JS validation. If empty, `g()` returns null.           |
| Part of baseConstants| YES — never cleared by cascade reset                               |
| Used In Steps        | Step 8B (`priWindingLen = bobbinHeightPri - bobbinFlange`)         |

---

### Input 2 — Flat Wire Breadth (Flat Path Only)

| Property             | Value                                                              |
|----------------------|--------------------------------------------------------------------|
| UI Label             | Breadth (mm)                                                       |
| Field ID             | `#priFlatBreadth`                                                  |
| Variable Name        | `priFlatBreadth`                                                   |
| Data Type            | Number (float)                                                     |
| Unit                 | mm                                                                 |
| Default Value        | None — field starts empty                                          |
| Required             | Only when flat wire is selected                                    |
| User Editable        | Yes                                                                |
| HTML Attributes      | `type="number"`, `step="any"`, `inputmode="decimal"`               |
| Validation Rules     | No explicit validation. Silently skipped if null.                  |
| Part of baseConstants| NO                                                                 |
| Used In Steps        | Step 7F (enteredArea), Step 8C TPL divisor (flat path)             |

---

### Input 3 — Flat Wire Height (Flat Path Only)

| Property             | Value                                                              |
|----------------------|--------------------------------------------------------------------|
| UI Label             | Height (mm)                                                        |
| Field ID             | `#priFlatHeight`                                                   |
| Variable Name        | `priFlatHeight`                                                    |
| Data Type            | Number (float)                                                     |
| Unit                 | mm                                                                 |
| Default Value        | None — field starts empty                                          |
| Required             | Only when flat wire is selected                                    |
| User Editable        | Yes                                                                |
| HTML Attributes      | `type="number"`, `step="any"`, `inputmode="decimal"`               |
| Validation Rules     | No explicit validation. Silently skipped if null.                  |
| Part of baseConstants| NO                                                                 |
| Used In Steps        | Step 7F (enteredArea), Step 7G (effectiveHeight), Step 9 radial (flat path) |

---

## Configurable Design Constants (Have Defaults — User May Change)

### Input 4 — Current Density

| Property             | Value                                                              |
|----------------------|--------------------------------------------------------------------|
| UI Label             | Current Density delta (A/mm²)                                      |
| Field ID             | `#delta`                                                           |
| Variable Name        | `delta`                                                            |
| Data Type            | Number (float)                                                     |
| Unit                 | A/mm²                                                              |
| Default Value        | `2.5` (set in HTML `value` attribute)                              |
| Required             | Yes — if null, `priArea` = null and conductor chain fails          |
| User Editable        | Yes                                                                |
| HTML Attributes      | `type="number"`, `step="any"`, `value="2.5"`, `inputmode="decimal"`|
| Validation Rules     | Must be non-zero. No explicit JS validation.                       |
| Part of baseConstants| YES                                                                |
| Used In Steps        | Step 7B (`priArea = iPri / delta`); also Phase 5 Step 15           |

---

### Input 5 — Primary Insulation Increment

| Property             | Value                                                              |
|----------------------|--------------------------------------------------------------------|
| UI Label             | Insulation Increment (mm)                                          |
| Field ID             | `#priInsAddition`                                                  |
| Variable Name        | `priInsAdd`                                                        |
| Data Type            | Number (float)                                                     |
| Unit                 | mm                                                                 |
| Default Value        | `0.1` (set in HTML `value` attribute)                              |
| Required             | Yes — fallback to `0.1` via `|| 0.1` if null                      |
| User Editable        | Yes                                                                |
| HTML Attributes      | `type="number"`, `step="any"`, `value="0.1"`, `inputmode="decimal"`|
| Validation Rules     | No explicit validation. Null falls back to 0.1.                    |
| Part of baseConstants| YES                                                                |
| Used In Steps        | Step 7E (`insDiaPri = priBareStd + priInsAdd`)                     |

---

### Input 6 — Limbs Count

| Property             | Value                                                              |
|----------------------|--------------------------------------------------------------------|
| UI Label             | Limbs Count                                                        |
| Field ID             | `#limbsCount`                                                      |
| Variable Name        | `limbsCount`                                                       |
| Data Type            | Number (float — typically integer)                                 |
| Unit                 | count (dimensionless)                                              |
| Default Value        | `2` (set in HTML `value` attribute)                                |
| Required             | Yes — fallback to `2` via `|| 2` if null                           |
| User Editable        | Yes                                                                |
| HTML Attributes      | `type="number"`, `step="any"`, `value="2"`, `inputmode="decimal"`  |
| Validation Rules     | No explicit validation.                                            |
| Part of baseConstants| YES                                                                |
| Used In Steps        | Step 8A (turns/limb divisor); Step 10G (weight multiplier)         |

---

### Input 7 — Bobbin Flange

| Property             | Value                                                              |
|----------------------|--------------------------------------------------------------------|
| UI Label             | Bobbin Flange (mm)                                                 |
| Field ID             | `#bobbinFlange`                                                    |
| Variable Name        | `bobbinFlange`                                                     |
| Data Type            | Number (float)                                                     |
| Unit                 | mm                                                                 |
| Default Value        | `7` (set in HTML `value` attribute)                                |
| Required             | Yes — fallback to `7` via `|| 7` if null                           |
| User Editable        | Yes                                                                |
| HTML Attributes      | `type="number"`, `step="any"`, `value="7"`, `inputmode="decimal"`  |
| Validation Rules     | No explicit validation.                                            |
| Part of baseConstants| YES                                                                |
| Used In Steps        | Step 8B (`priWindingLen = bobbinHeightPri - bobbinFlange`); also Phase 5 Step 16 |

---

### Input 8 — Primary Safety Margin

| Property             | Value                                                              |
|----------------------|--------------------------------------------------------------------|
| UI Label             | Safety Margin (Turns)                                              |
| Field ID             | `#priSafetyMargin`                                                 |
| Variable Name        | `priSafetyMargin`                                                  |
| Data Type            | Number (float — typically integer)                                 |
| Unit                 | turns                                                              |
| Default Value        | `1` (set in HTML `value` attribute)                                |
| Required             | Yes — fallback to `0` via `|| 0` if null                           |
| User Editable        | Yes                                                                |
| HTML Attributes      | `type="number"`, `step="any"`, `value="1"`, `inputmode="decimal"`  |
| Validation Rules     | No explicit validation.                                            |
| Part of baseConstants| YES                                                                |
| Used In Steps        | Step 8C (`priTPL = Math.floor(...) - priSafetyMargin`)             |

---

### Input 9 — Paper Thickness

| Property             | Value                                                              |
|----------------------|--------------------------------------------------------------------|
| UI Label             | Paper Thickness (mm)                                               |
| Field ID             | `#paperThickness`                                                  |
| Variable Name        | `paperThickness`                                                   |
| Data Type            | Number (float)                                                     |
| Unit                 | mm                                                                 |
| Default Value        | `0.127` (set in HTML `value` attribute)                            |
| Required             | Yes — fallback to `0.127` via `|| 0.127` if null                   |
| User Editable        | Yes                                                                |
| HTML Attributes      | `type="number"`, `step="any"`, `value="0.127"`, `inputmode="decimal"` |
| Validation Rules     | No explicit validation.                                            |
| Part of baseConstants| YES                                                                |
| Used In Steps        | Step 9 radial build for both paths; also Phase 5 Step 16           |

---

### Input 10 — Primary Paper Layers

| Property             | Value                                                              |
|----------------------|--------------------------------------------------------------------|
| UI Label             | Paper Layers Count                                                 |
| Field ID             | `#priPaperLayers`                                                  |
| Variable Name        | `priPaperLayers`                                                   |
| Data Type            | Number (float — typically integer)                                 |
| Unit                 | count                                                              |
| Default Value        | `4` (set in HTML `value` attribute)                                |
| Required             | Yes — fallback to `4` via `|| 4` if null                           |
| User Editable        | Yes                                                                |
| HTML Attributes      | `type="number"`, `step="any"`, `value="4"`, `inputmode="decimal"`  |
| Validation Rules     | No explicit validation.                                            |
| Part of baseConstants| YES                                                                |
| Used In Steps        | Step 9 (`paperThickness * priPaperLayers`)                         |

---

### Input 11 — Core Clearance

| Property             | Value                                                              |
|----------------------|--------------------------------------------------------------------|
| UI Label             | Core Clearance Gap (mm)                                            |
| Field ID             | `#coilClearance`                                                   |
| Variable Name        | `coilClearance`                                                    |
| Data Type            | Number (float)                                                     |
| Unit                 | mm                                                                 |
| Default Value        | `3.5` (set in HTML `value` attribute)                              |
| Required             | Yes — fallback to `3.5` via `|| 3.5` if null                       |
| User Editable        | Yes                                                                |
| HTML Attributes      | `type="number"`, `step="any"`, `value="3.5"`, `inputmode="decimal"`|
| Validation Rules     | No explicit validation.                                            |
| Part of baseConstants| YES                                                                |
| Used In Steps        | Step 10A/10B (innerW/innerL)                                       |

---

### Input 12 — Conductor Density (rhoCu)

| Property             | Value                                                              |
|----------------------|--------------------------------------------------------------------|
| UI Label             | Conductor Density rho (g/cc)                                       |
| Field ID             | `#rhoCu`                                                           |
| Variable Name        | `rhoCu`                                                            |
| Data Type            | Number (float)                                                     |
| Unit                 | g/cc                                                               |
| Default Value        | `8.89` (Copper). Set to `2.703` when Aluminium selected.           |
| Required             | Yes — fallback to `8.89` via `|| 8.89` if null                     |
| User Editable        | Yes — also auto-set by `conductorMaterial` change event            |
| HTML Attributes      | `type="number"`, `step="any"`, `value="8.89"`, `inputmode="decimal"`, `style="border-color:#ffb74d"` |
| Validation Rules     | No explicit validation.                                            |
| Part of baseConstants| YES                                                                |
| Used In Steps        | Step 10G (`priWeight = ... * rhoCu * 1e-3`)                        |

---

### Input 13 — Conductor Material Selector

| Property             | Value                                                              |
|----------------------|--------------------------------------------------------------------|
| UI Label             | Conductor Material                                                 |
| Field ID             | `#conductorMaterial`                                               |
| Variable Name        | `conductorMaterial` (read as string for cost module)               |
| Data Type            | String (select option value)                                       |
| Unit                 | N/A                                                                |
| Default Value        | `"Copper"`                                                         |
| Options              | `"Copper"` / `"Aluminium"`                                         |
| Required             | Yes — drives rhoCu value and cost material label                   |
| User Editable        | Yes                                                                |
| HTML Attributes      | `<select id="conductorMaterial">` with two `<option>` elements     |
| Validation Rules     | None. Only two options available.                                  |
| Part of baseConstants| YES                                                                |
| Used In Steps        | Indirectly drives `#rhoCu` value; directly read by Phase 7 cost module |

---

### Input 14 — Parallel Flat Conductors

| Property             | Value                                                              |
|----------------------|--------------------------------------------------------------------|
| UI Label             | Parallel Flat Conductors                                           |
| Field ID             | `#priParallel`                                                     |
| Variable Name        | `priParallel`                                                      |
| Data Type            | Number (integer)                                                   |
| Unit                 | count                                                              |
| Default Value        | `1` (set in HTML `value` attribute)                                |
| Required             | Flat path only — fallback to `1` via `|| 1` if null               |
| User Editable        | Yes                                                                |
| HTML Attributes      | `type="number"`, `step="1"`, `min="1"`, `value="1"`, `inputmode="numeric"` |
| Validation Rules     | `min="1"` enforced by browser HTML attribute. No JS validation.    |
| Part of baseConstants| YES                                                                |
| Used In Steps        | Step 7G (`priEffectiveHeight = priFlatHeight * priParallel`)       |

---

## Editable Override Inputs (Auto-Populated — User May Override)

### Input 15 — VA Capacity Feed (Override from Phase 1)

| Property             | Value                                                              |
|----------------------|--------------------------------------------------------------------|
| UI Label             | VA capacity used                                                   |
| Field ID             | `#vaConductorInput`                                                |
| Variable Name        | `vaOutput`                                                         |
| Data Type            | Number (float)                                                     |
| Unit                 | VA                                                                 |
| Default Value        | Auto-populated from Phase 1 `va`                                   |
| Required             | Yes — if null, `iPri` = null and chain fails                       |
| User Editable        | Yes — labeled "Editable Override" in UI                            |
| HTML Attributes      | `type="number"`, `step="any"`, `inputmode="decimal"`               |
| Part of baseConstants| NO                                                                 |
| Used In Steps        | Step 7A (`iPri = vaOutput / vPriUsed`)                             |

---

### Input 16 — Primary Voltage Feed (Override from Phase 1)

| Property             | Value                                                              |
|----------------------|--------------------------------------------------------------------|
| UI Label             | Primary Voltage used                                               |
| Field ID             | `#vPriConductorInput`                                              |
| Variable Name        | `vPriUsed`                                                         |
| Data Type            | Number (float)                                                     |
| Unit                 | V                                                                  |
| Default Value        | Auto-populated from Phase 1 `primaryVoltage`                       |
| Required             | Yes — if null/falsy, `iPri` = null                                 |
| User Editable        | Yes — labeled "Editable Override" in UI                            |
| HTML Attributes      | `type="number"`, `step="any"`, `inputmode="decimal"`               |
| Part of baseConstants| NO                                                                 |
| Used In Steps        | Step 7A (`iPri = vaOutput / vPriUsed`)                             |

---

### Input 17 — Primary Current (Override)

| Property             | Value                                                              |
|----------------------|--------------------------------------------------------------------|
| UI Label             | Primary Current (A)                                                |
| Field ID             | `#iPriOutput`                                                      |
| Variable Name        | `iPri`                                                             |
| Data Type            | Number (float)                                                     |
| Unit                 | A                                                                  |
| Default Value        | Auto-computed from Step 7A                                         |
| Required             | Not directly — `#iPriOutput` is not read back in formula chain      |
| User Editable        | Yes — labeled "Editable Override" in UI                            |
| HTML Attributes      | `type="number"`, `step="any"`, `inputmode="decimal"`               |
| Part of baseConstants| NO                                                                 |
| Note                 | The SWG lookup uses the in-memory `iPri` variable, not this field  |

---

### Input 18 — Target Bare Diameter (Override)

| Property             | Value                                                              |
|----------------------|--------------------------------------------------------------------|
| UI Label             | Target Bare d (mm)                                                 |
| Field ID             | `#priBareDiaOutput`                                                |
| Variable Name        | `priBareDiaUsed` (read-back after write)                           |
| Data Type            | Number (float)                                                     |
| Unit                 | mm                                                                 |
| Default Value        | Auto-computed from Step 7C                                         |
| Required             | Yes — read back as `priBareDiaUsed` for truncation step 7D         |
| User Editable        | Yes — labeled "Editable Override" in UI                            |
| HTML Attributes      | `type="number"`, `step="any"`, `inputmode="decimal"`               |
| Part of baseConstants| NO                                                                 |
| Used In Steps        | Step 7D reads `g("priBareDiaOutput")` for `priBareStd` truncation  |

---

### Input 19 — Selected Insulated Diameter (Active Override)

| Property             | Value                                                              |
|----------------------|--------------------------------------------------------------------|
| UI Label             | Selected Insulated d (mm)                                          |
| Field ID             | `#priInsDiaInput`                                                  |
| Variable Name        | `insDiaPriUsed`                                                    |
| Data Type            | Number (float)                                                     |
| Unit                 | mm                                                                 |
| Default Value        | Auto-computed from Step 7E                                         |
| Required             | Yes — active input to Steps 8C, 9, 10F                             |
| User Editable        | Yes — labeled "Editable Override" in UI                            |
| HTML Attributes      | `type="number"`, `step="any"`, `inputmode="decimal"`               |
| Part of baseConstants| NO                                                                 |
| Used In Steps        | Step 8C (round wire TPL divisor), Step 9 (round wire radial), Step 10F (priActualArea) |

---

### Inputs 20–22 — Overridable Computed Outputs (Steps 8–10)

| Field ID               | UI Label                    | Produced By | Consumed By (downstream)           |
|------------------------|-----------------------------|-------------|-------------------------------------|
| `#priTurnsLimbOutput`  | Pri Turns/Limb              | Step 8A     | Step 8D, Step 10G                   |
| `#priTplOutput`        | Pri Turns Per Layer (TPL)   | Step 8C     | Step 8D                             |
| `#priLayersOutput`     | Pri Layers                  | Step 8D     | Step 9                              |
| `#priRadialOutput`     | Pri Radial Thickness (mm)   | Step 9      | Phase 4 Steps 11, 13                |
| `#priLmtOutput`        | Primary LMT (m)             | Step 10E    | Step 10G                            |
| `#priWeightOutput`     | Primary Conductor Wt (kg)   | Step 10G    | Phase 7 cost module                 |

All the above are `type="number"`, `step="any"`, `inputmode="decimal"`, editable overrides,
NOT in `baseConstants`.

---

## Input Helper Functions

Phase 3 uses the same `g(id)` and `auto(id, val)` helper functions as Phase 1.
See `Phase-01-Capacity-and-Electrical-Turns/07-inputs.md` for full definitions.

### Wire Type Radio Inputs

| Field ID            | Type  | Name group     | Value    | Default Checked |
|---------------------|-------|----------------|----------|-----------------|
| `#priWireTypeRound` | radio | `priWireType`  | `"round"`| YES             |
| `#priWireTypeFlat`  | radio | `priWireType`  | `"flat"` | NO              |

The radio state is read via:
```javascript
let isPriFlat = document.getElementById("priWireTypeFlat") &&
                document.getElementById("priWireTypeFlat").checked;
```
Radio state is saved/restored via `localStorage` using the same `save()`/`load()`
mechanism as all other fields. In `clearAll()`, round is forced to checked.
