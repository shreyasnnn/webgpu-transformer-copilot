# Phase 02 — Core Area Dimensions
## File: 07-inputs.md

> **Scope:** Every user-facing input that directly participates in Phase 2 calculations.
> Auto-populated overridable fields are also included because they can act as user
> inputs when manually edited.

---

## Primary User Inputs (Required by User — No Default)

### Input 1 — Tongue Width

| Property             | Value                                                            |
|----------------------|------------------------------------------------------------------|
| UI Label             | Tongue Width TW (mm)                                             |
| Field ID             | `#tongueWidth`                                                   |
| Variable Name        | `tongueWidth`                                                    |
| Data Type            | Number (float, typically integer in practice)                    |
| Unit                 | mm                                                               |
| Default Value        | None — field starts with `placeholder="Enter TW"`               |
| Required             | Yes for `selectedArea` — if empty, Sub-B produces null           |
| User Editable        | Yes                                                              |
| HTML Attributes      | `type="number"`, `step="any"`, `inputmode="decimal"`             |
| Validation Rules     | No explicit JS validation. If empty, `g()` returns null.         |
| Part of baseConstants| YES — never cleared by cascade reset                             |
| Used In Steps        | Step 6 Sub-B; also consumed by Phase 3 Steps 10–11, Phase 4 Steps 11–13, Phase 6 Step 18 |

---

### Input 2 — Stack Height

| Property             | Value                                                            |
|----------------------|------------------------------------------------------------------|
| UI Label             | Stack Height SH (mm)                                             |
| Field ID             | `#stackHeight`                                                   |
| Variable Name        | `stackHeight`                                                    |
| Data Type            | Number (float, typically integer in practice)                    |
| Unit                 | mm                                                               |
| Default Value        | None — field starts with `placeholder="Enter SH"`               |
| Required             | Yes for `selectedArea` — if empty, Sub-B produces null           |
| User Editable        | Yes                                                              |
| HTML Attributes      | `type="number"`, `step="any"`, `inputmode="decimal"`             |
| Validation Rules     | No explicit JS validation. If empty, `g()` returns null.         |
| Part of baseConstants| YES — never cleared by cascade reset                             |
| Used In Steps        | Step 6 Sub-B; also consumed by Phase 3 Step 10, Phase 4 Step 13, Phase 6 Step 18 |

---

## Configurable Design Constants (Have Defaults — User May Change)

### Input 3 — Flux Density

| Property             | Value                                                            |
|----------------------|------------------------------------------------------------------|
| UI Label             | Flux Density B (Tesla)                                           |
| Field ID             | `#fluxDensity`                                                   |
| Variable Name        | `fluxDensity`                                                    |
| Data Type            | Number (float)                                                   |
| Unit                 | Tesla (T)                                                        |
| Default Value        | `1` (set in HTML `value` attribute)                              |
| Required             | Yes — if null/falsy, Step 5 guard fails and netArea = null       |
| User Editable        | Yes                                                              |
| HTML Attributes      | `type="number"`, `step="any"`, `value="1"`, `inputmode="decimal"`|
| Validation Rules     | No explicit JS validation. Must be non-zero (used as denominator factor). |
| Part of baseConstants| YES — never cleared by cascade reset                             |
| Used In Steps        | Step 5 only (`4.44 * fluxDensity * frequency`)                   |

---

### Input 4 — Frequency

| Property             | Value                                                            |
|----------------------|------------------------------------------------------------------|
| UI Label             | Frequency (Hz)                                                   |
| Field ID             | `#frequency`                                                     |
| Variable Name        | `frequency`                                                      |
| Data Type            | Number (float)                                                   |
| Unit                 | Hz                                                               |
| Default Value        | `50` (set in HTML `value` attribute)                             |
| Required             | Yes — if null/falsy, Step 5 guard fails and netArea = null       |
| User Editable        | Yes                                                              |
| HTML Attributes      | `type="number"`, `step="any"`, `value="50"`, `inputmode="decimal"`|
| Validation Rules     | No explicit JS validation. Must be non-zero (used as denominator factor). |
| Part of baseConstants| YES — never cleared by cascade reset                             |
| Used In Steps        | Step 5 only (`4.44 * fluxDensity * frequency`)                   |

---

### Input 5 — Stacking Factor

| Property             | Value                                                            |
|----------------------|------------------------------------------------------------------|
| UI Label             | Stacking Factor (SF)                                             |
| Field ID             | `#stackingFactor`                                                |
| Variable Name        | `stackingFactor`                                                 |
| Data Type            | Number (float)                                                   |
| Unit                 | Dimensionless                                                    |
| Default Value        | `0.9` (set in HTML `value` attribute)                            |
| Required             | Yes for grossArea — if null/falsy, Sub-A guard fails             |
| User Editable        | Yes                                                              |
| HTML Attributes      | `type="number"`, `step="any"`, `value="0.9"`, `inputmode="decimal"`|
| Validation Rules     | Must be non-zero (used as divisor). No explicit JS validation.   |
| Part of baseConstants| YES — never cleared by cascade reset                             |
| Used In Steps        | Step 6 Sub-A (`grossArea = netAreaUsed / stackingFactor`)        |

---

## Editable Override Inputs (Auto-Populated — User May Override)

### Input 6 — V/T Baseline Feed (Override from Phase 1)

| Property             | Value                                                            |
|----------------------|------------------------------------------------------------------|
| UI Label             | V/T baseline used                                               |
| Field ID             | `#netAreaVTInput`                                                |
| Variable Name        | `netAreaVTInput`                                                 |
| Data Type            | Number (float)                                                   |
| Unit                 | V/T                                                              |
| Default Value        | Auto-populated from Phase 1 `vtUsed` (baseline V/T)             |
| Required             | Yes — if null, Step 5 guard fails and netArea = null             |
| User Editable        | Yes — labeled "Editable Override" in UI                          |
| HTML Attributes      | `type="number"`, `step="any"`, `inputmode="decimal"`             |
| Validation Rules     | No explicit JS validation. Must be non-zero (denominator factor).|
| Part of baseConstants| NO — subject to cascade reset                                    |
| Used In Steps        | Step 5 (`(netAreaVTInput * 1e6) / (4.44 * fluxDensity * frequency)`) |

---

### Input 7 — Net Core Area Display (Override)

| Property             | Value                                                            |
|----------------------|------------------------------------------------------------------|
| UI Label             | Net Core Area (mm²)                                              |
| Field ID             | `#netAreaOutput`                                                 |
| Variable Name        | (display only — not read back in calculations)                   |
| Data Type            | Number (integer)                                                 |
| Unit                 | mm²                                                              |
| Default Value        | Auto-computed as `Math.round(netArea)` from Step 5               |
| Required             | No — this field is NOT read back in any downstream formula       |
| User Editable        | Yes — labeled "Editable Override" in UI                          |
| HTML Attributes      | `type="number"`, `step="any"`, `inputmode="decimal"`             |
| Validation Rules     | None explicit.                                                   |
| Part of baseConstants| NO                                                               |
| Used In Steps        | Display only. Overriding this field does NOT affect Step 6.      |
| Note                 | Step 6 reads `#netAreaInput`, not `#netAreaOutput`.              |

---

### Input 8 — Net Core Area Feed to Step 6 (Override)

| Property             | Value                                                            |
|----------------------|------------------------------------------------------------------|
| UI Label             | Net Area used (mm²)                                              |
| Field ID             | `#netAreaInput`                                                  |
| Variable Name        | `netAreaUsed`                                                    |
| Data Type            | Number (integer)                                                 |
| Unit                 | mm²                                                              |
| Default Value        | Auto-computed as `Math.round(netArea)` from Step 5               |
| Required             | Yes for grossArea — if null, Sub-A guard fails                   |
| User Editable        | Yes — labeled "Editable Override" in UI                          |
| HTML Attributes      | `type="number"`, `step="any"`, `inputmode="decimal"`             |
| Validation Rules     | None explicit.                                                   |
| Part of baseConstants| NO                                                               |
| Used In Steps        | Step 6 Sub-A (`grossArea = netAreaUsed / stackingFactor`)        |

---

### Input 9 — Gross Area Required (Override)

| Property             | Value                                                            |
|----------------------|------------------------------------------------------------------|
| UI Label             | Gross Area Req (mm²)                                             |
| Field ID             | `#grossArea`                                                     |
| Variable Name        | `grossArea`                                                      |
| Data Type            | Number (integer)                                                 |
| Unit                 | mm²                                                              |
| Default Value        | Auto-computed as `Math.round(netAreaUsed / stackingFactor)`      |
| Required             | No — display and comparison only; not read back in calculations  |
| User Editable        | Yes — labeled "Editable Override" in UI                          |
| HTML Attributes      | `type="number"`, `step="any"`, `inputmode="decimal"`             |
| Validation Rules     | None explicit.                                                   |
| Part of baseConstants| NO                                                               |
| Used In Steps        | Display only. Not consumed by any downstream formula.            |

---

### Input 10 — Selected Core Area (Override)

| Property             | Value                                                            |
|----------------------|------------------------------------------------------------------|
| UI Label             | Selected Area (TW x SH)                                          |
| Field ID             | `#selectedArea`                                                  |
| Variable Name        | `selectedArea`                                                   |
| Data Type            | Number (float)                                                   |
| Unit                 | mm²                                                              |
| Default Value        | Auto-computed as `tongueWidth * stackHeight`                     |
| Required             | Indirectly — consumed by Phase 6 Step 18                         |
| User Editable        | Yes — labeled "Editable Override" in UI                          |
| HTML Attributes      | `type="number"`, `step="any"`, `inputmode="decimal"`             |
| Validation Rules     | None explicit.                                                   |
| Part of baseConstants| NO                                                               |
| Used In Steps        | Phase 6 Step 18 (`actualNetArea = Math.round(selectedArea * finalCoreSf)`) |

---

## Input Helper Functions

Phase 2 uses the same `g(id)` and `auto(id, val)` functions as Phase 1.
See `Phase-01-Capacity-and-Electrical-Turns/07-inputs.md` for full definitions.
