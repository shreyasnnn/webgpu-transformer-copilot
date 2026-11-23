# Phase 01 — Capacity & Electrical Turns
## File: 07-inputs.md

> **Scope:** Every user-facing input that directly participates in Phase 1 calculations.
> Inputs that are auto-populated outputs of this phase (editable overrides) are also
> included because they can act as user inputs when manually overridden.

---

## Primary User Inputs (Required by User — No Default)

### Input 1 — Secondary Voltage

| Property          | Value                                                      |
|-------------------|------------------------------------------------------------|
| UI Label          | Secondary Voltage (V)                                      |
| Field ID          | `#vSecInput`                                               |
| Variable Name     | `vSecInput`                                                |
| Data Type         | Number (float)                                             |
| Unit              | Volts (V)                                                  |
| Default Value     | None — field starts empty                                  |
| Required          | Yes — if empty, VA = null and entire chain produces blanks |
| User Editable     | Yes                                                        |
| HTML Attributes   | `type="number"`, `step="any"`, `inputmode="decimal"`       |
| Validation Rules  | No explicit JS validation. If empty or non-numeric, `g()` returns null and calculation gracefully produces null. |
| Part of baseConstants | YES — never cleared by cascade reset                  |
| Used In Steps     | Step 1 (VA numerator term); Step 3 (forwarded to `#secondaryVoltage` for Step 4) |

---

### Input 2 — Secondary Current

| Property          | Value                                                      |
|-------------------|------------------------------------------------------------|
| UI Label          | Secondary Current (A)                                      |
| Field ID          | `#iSecInput`                                               |
| Variable Name     | `iSecInput`                                                |
| Data Type         | Number (float)                                             |
| Unit              | Amperes (A)                                                |
| Default Value     | None — field starts empty                                  |
| Required          | Yes — if empty, VA = null and entire chain produces blanks |
| User Editable     | Yes                                                        |
| HTML Attributes   | `type="number"`, `step="any"`, `inputmode="decimal"`       |
| Validation Rules  | No explicit JS validation. If empty or non-numeric, `g()` returns null. |
| Part of baseConstants | YES — never cleared by cascade reset                  |
| Used In Steps     | Step 1 (VA multiplicand); also used directly in Phase 5 Step 15 |

---

### Input 3 — Primary Voltage

| Property          | Value                                                      |
|-------------------|------------------------------------------------------------|
| UI Label          | Primary Voltage (V)                                        |
| Field ID          | `#primaryVoltage`                                          |
| Variable Name     | `primaryVoltage`                                           |
| Data Type         | Number (float)                                             |
| Unit              | Volts (V)                                                  |
| Default Value     | None — field starts empty                                  |
| Required          | Yes — if empty, Steps 3 & 4 produce blanks                 |
| User Editable     | Yes                                                        |
| HTML Attributes   | `type="number"`, `step="any"`, `inputmode="decimal"`       |
| Validation Rules  | No explicit JS validation. If empty, `g()` returns null.   |
| Part of baseConstants | YES — never cleared by cascade reset                  |
| Used In Steps     | Step 3 (numerator for primary turns and raw actual V/T)    |

---

## Configurable Design Constants (Have Defaults — User May Change)

### Input 4 — K Factor Constant

| Property          | Value                                                      |
|-------------------|------------------------------------------------------------|
| UI Label          | K Factor constant                                          |
| Field ID          | `#k`                                                       |
| Variable Name     | `k`                                                        |
| Data Type         | Number (float)                                             |
| Unit              | Dimensionless                                              |
| Default Value     | `0.8` (set in HTML `value` attribute)                      |
| Required          | Yes — if empty/null, Step 2 produces blank V/T             |
| User Editable     | Yes                                                        |
| HTML Attributes   | `type="number"`, `step="any"`, `value="0.8"`, `inputmode="decimal"` |
| Validation Rules  | No explicit JS validation. If empty, `g()` returns null.   |
| Part of baseConstants | YES — never cleared by cascade reset                  |
| Used In Steps     | Step 2 only (`rawVt = k x SQRT(kvaInput)`)                 |

---

## Editable Override Inputs (Auto-Populated — User May Override)

These fields are calculated outputs that the user can manually edit. When edited,
their manually entered values take precedence over recalculation for all downstream steps.

### Input 5 — Calculated VA (Override)

| Property          | Value                                                      |
|-------------------|------------------------------------------------------------|
| UI Label          | Calculated VA                                              |
| Field ID          | `#vaOutput`                                                |
| Variable Name     | `va`                                                       |
| Data Type         | Number (float)                                             |
| Unit              | VA                                                         |
| Default Value     | Auto-computed from Step 1                                  |
| Required          | Not directly required (read by Phase 3 Step 7)             |
| User Editable     | Yes — labeled "Editable Override" in UI                    |
| HTML Attributes   | `type="number"`, `step="any"`, `inputmode="decimal"`       |
| Validation Rules  | None explicit.                                             |
| Part of baseConstants | NO — subject to cascade reset                         |
| Used In Steps     | Value is read by Phase 3 Step 7 as `vaConductorInput`      |

---

### Input 6 — Calculated kVA (Override)

| Property          | Value                                                      |
|-------------------|------------------------------------------------------------|
| UI Label          | Calculated kVA                                             |
| Field ID          | `#kvaOutput`                                               |
| Variable Name     | `kva`                                                      |
| Data Type         | Number (float)                                             |
| Unit              | kVA                                                        |
| Default Value     | Auto-computed from Step 1                                  |
| Required          | No — `#kvaOutput` is NOT read back in any calculation      |
| User Editable     | Yes — labeled "Editable Override" in UI                    |
| HTML Attributes   | `type="number"`, `step="any"`, `inputmode="decimal"`       |
| Validation Rules  | None explicit.                                             |
| Part of baseConstants | NO                                                    |
| Used In Steps     | Display only. Not consumed by any calculation.             |
| Note              | Different from `#kvaInput`. This field is display-only.    |

---

### Input 7 — kVA Value Used (Override Feed to Step 2)

| Property          | Value                                                      |
|-------------------|------------------------------------------------------------|
| UI Label          | kVA value used                                             |
| Field ID          | `#kvaInput`                                                |
| Variable Name     | `kvaInput`                                                 |
| Data Type         | Number (float)                                             |
| Unit              | kVA                                                        |
| Default Value     | Auto-populated from Step 1 (`VA / 1000`, 3 decimal places) |
| Required          | Yes — if null/empty, Step 2 produces blank V/T             |
| User Editable     | Yes — labeled "Editable Override" in UI                    |
| HTML Attributes   | `type="number"`, `step="any"`, `inputmode="decimal"`       |
| Validation Rules  | Guard: `kvaInput >= 0` required for valid square root      |
| Part of baseConstants | NO                                                    |
| Used In Steps     | Step 2 (`rawVt = k x SQRT(kvaInput)`)                      |

---

### Input 8 — Volts / Turn (Override)

| Property          | Value                                                      |
|-------------------|------------------------------------------------------------|
| UI Label          | Volts / Turn                                               |
| Field ID          | `#vt`                                                      |
| Variable Name     | `vt`                                                       |
| Data Type         | Number (float)                                             |
| Unit              | V/T                                                        |
| Default Value     | Auto-computed from Step 2                                  |
| Required          | No — `#vt` itself is not read back in calculations         |
| User Editable     | Yes — labeled "Editable Override" in UI                    |
| HTML Attributes   | `type="number"`, `step="any"`, `inputmode="decimal"`       |
| Validation Rules  | None explicit.                                             |
| Part of baseConstants | NO                                                    |
| Used In Steps     | Auto-populates `#vtInput`. Not directly read in formulas.  |
| Note              | The active calculation input for Step 3 is `#vtInput`, not `#vt`. |

---

### Input 9 — V/T Value Used (Override Feed to Step 3)

| Property          | Value                                                      |
|-------------------|------------------------------------------------------------|
| UI Label          | V/T value used                                             |
| Field ID          | `#vtInput`                                                 |
| Variable Name     | `vtUsed`                                                   |
| Data Type         | Number (float)                                             |
| Unit              | V/T                                                        |
| Default Value     | Auto-populated from `#vt` (Step 2 output)                  |
| Required          | Yes — if null/falsy, Step 3 produces blanks                |
| User Editable     | Yes — labeled "Editable Override" in UI                    |
| HTML Attributes   | `type="number"`, `step="any"`, `inputmode="decimal"`       |
| Validation Rules  | Must be non-zero (used as divisor in Step 3)               |
| Part of baseConstants | NO                                                    |
| Used In Steps     | Step 3 (`primaryTurns = CEIL(primaryVoltage / vtUsed)`)    |

---

### Input 10 — Primary Turns (Override)

| Property          | Value                                                      |
|-------------------|------------------------------------------------------------|
| UI Label          | Primary Turns                                              |
| Field ID          | `#primaryTurns`                                            |
| Variable Name     | `primaryTurns` / `priTurnsUsed`                            |
| Data Type         | Number (integer)                                           |
| Unit              | turns (dimensionless)                                      |
| Default Value     | Auto-computed from Step 3                                  |
| Required          | Indirectly — used as denominator in `rawActualVT`          |
| User Editable     | Yes — labeled "Editable Override" in UI                    |
| HTML Attributes   | `type="number"`, `step="any"`, `inputmode="decimal"`       |
| Validation Rules  | Must be non-zero (used as divisor)                         |
| Part of baseConstants | NO                                                    |
| Used In Steps     | Step 3 (denominator for `rawActualVT`); Phase 3 Step 8     |

---

### Input 11 — Actual Volts / Turn (Override)

| Property          | Value                                                      |
|-------------------|------------------------------------------------------------|
| UI Label          | Actual Volts / Turn                                        |
| Field ID          | `#actualVT`                                                |
| Variable Name     | `actualVT`                                                 |
| Data Type         | Number (float)                                             |
| Unit              | V/T                                                        |
| Default Value     | Auto-computed from Step 3                                  |
| Required          | No — `#actualVT` itself is not read back in formulas       |
| User Editable     | Yes — labeled "Editable Override" in UI                    |
| HTML Attributes   | `type="number"`, `step="any"`, `inputmode="decimal"`       |
| Validation Rules  | None explicit.                                             |
| Part of baseConstants | NO                                                    |
| Used In Steps     | Auto-populates `#actualVTInput`. Not directly read.        |

---

### Input 12 — Actual V/T Feed to Step 4 (Override)

| Property          | Value                                                      |
|-------------------|------------------------------------------------------------|
| UI Label          | Actual V/T used                                            |
| Field ID          | `#actualVTInput`                                           |
| Variable Name     | `secActVTUsed`                                             |
| Data Type         | Number (float)                                             |
| Unit              | V/T                                                        |
| Default Value     | Auto-populated from `#actualVT` (Step 3 output)            |
| Required          | Yes — if null/falsy, Step 4 produces blanks                |
| User Editable     | Yes — labeled "Editable Override" in UI                    |
| HTML Attributes   | `type="number"`, `step="any"`, `inputmode="decimal"`       |
| Validation Rules  | Must be non-zero (used as divisor in Step 4)               |
| Part of baseConstants | NO                                                    |
| Used In Steps     | Step 4 (`secondaryTurns = CEIL(secVoltsUsed / secActVTUsed)`) |

---

### Input 13 — Secondary Voltage (Override Feed to Step 4)

| Property          | Value                                                      |
|-------------------|------------------------------------------------------------|
| UI Label          | Secondary Voltage used                                     |
| Field ID          | `#secondaryVoltage`                                        |
| Variable Name     | `secVoltsUsed`                                             |
| Data Type         | Number (float)                                             |
| Unit              | Volts (V)                                                  |
| Default Value     | Auto-populated from `vSecInput` (Step 1 input, via Step 3 forward) |
| Required          | Yes — if null, Step 4 produces blanks                      |
| User Editable     | Yes — labeled "Editable Override" in UI                    |
| HTML Attributes   | `type="number"`, `step="any"`, `inputmode="decimal"`       |
| Validation Rules  | None explicit.                                             |
| Part of baseConstants | NO                                                    |
| Used In Steps     | Step 4 (numerator for secondary turns)                     |

---

### Input 14 — Secondary Turns (Override)

| Property          | Value                                                      |
|-------------------|------------------------------------------------------------|
| UI Label          | Secondary Turns                                            |
| Field ID          | `#secondaryTurns`                                          |
| Variable Name     | `secondaryTurns` / `secTurnsUsed`                          |
| Data Type         | Number (integer)                                           |
| Unit              | turns (dimensionless)                                      |
| Default Value     | Auto-computed from Step 4                                  |
| Required          | Indirectly — consumed by Phase 5 Step 16                   |
| User Editable     | Yes — labeled "Editable Override" in UI                    |
| HTML Attributes   | `type="number"`, `step="any"`, `inputmode="decimal"`       |
| Validation Rules  | None explicit.                                             |
| Part of baseConstants | NO                                                    |
| Used In Steps     | Phase 5 Step 16 (`secTurnsLimb = CEIL(secTurnsUsed / limbsCount)`) |

---

## Input Helper Function — g(id)

All inputs in this project are read via the shared helper function `g(id)`:

```javascript
function g(id) {
    let el = document.getElementById(id);
    if (!el || el.value === "") return null;
    return parseFloat(el.value);
}
```

- Returns `null` for empty or missing fields.
- Returns `parseFloat(el.value)` for all non-empty fields.
- `parseFloat` of a non-numeric string returns `NaN`, which the calculation guards
  treat as falsy.

## Input Write Function — auto(id, val)

All calculated outputs are written to fields via:

```javascript
function auto(id, val) {
    let e = document.getElementById(id);
    if (e && !e.dataset.edited && document.activeElement !== e) {
        e.value = (val !== null && val !== undefined && !isNaN(val)) ? val : "";
    }
}
```

- Will NOT overwrite a field if the user has manually edited it (`dataset.edited` is set).
- Will NOT overwrite the field that is currently focused (`document.activeElement`).
- Writes empty string if value is null, undefined, or NaN.
