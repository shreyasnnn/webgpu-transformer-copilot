# Phase 02 — Core Area Dimensions
## File: 03-variables.md

> **Scope:** Every engineering variable involved in Phase 2 calculations.
> Variables are listed in order of first introduction in the execution flow.
> For exact formulas, see `01-formulas.md`. For rounding rules, see `05-rounding.md`.

---

## Variable Reference Table

| # | Variable Name      | Purpose                                               | Type     | Unit | Default | User Editable |
|---|--------------------|-------------------------------------------------------|----------|------|---------|---------------|
| 1 | `netAreaVTInput`   | Baseline V/T entering the core area formula           | Derived  | V/T  | —       | Yes (override)|
| 2 | `fluxDensity`      | Magnetic flux density B                               | Input    | T    | 1       | Yes           |
| 3 | `frequency`        | Supply frequency                                      | Input    | Hz   | 50      | Yes           |
| 4 | `netArea`          | Computed net magnetic core area (unrounded)           | Derived  | mm²  | —       | No            |
| 5 | `netAreaUsed`      | Net area value fed into Step 6 (rounded integer)      | Derived  | mm²  | —       | Yes (override)|
| 6 | `stackingFactor`   | Lamination stacking factor SF                         | Input    | —    | 0.9     | Yes           |
| 7 | `tongueWidth`      | Physical tongue width of selected core                | Input    | mm   | None    | Yes           |
| 8 | `stackHeight`      | Physical stack height of selected core                | Input    | mm   | None    | Yes           |
| 9 | `grossArea`        | Required gross core area                              | Derived  | mm²  | —       | Yes (override)|
|10 | `selectedArea`     | Actual physical area of user-selected core            | Derived  | mm²  | —       | Yes (override)|

---

## Detailed Variable Descriptions

### 1. `netAreaVTInput`
- **UI Label:** V/T baseline used
- **Field ID:** `#netAreaVTInput`
- **Type:** Derived (auto-populated from Phase 1 `vtUsed`, user-overridable)
- **Unit:** V/T (Volts per Turn)
- **Default:** None — auto-populated by forwarding from Phase 1
- **User Editable:** YES — editable override
- **First Introduced:** Phase 1 Step 2 forward (`auto("netAreaVTInput", vtUsed)`)
- **Read In:** Phase 2 Step 5
- **Produced By:** Phase 1 Step 2 (data forwarding action, not a Phase 2 calculation)
- **Used By:** Step 5 (numerator multiplied by 1e6)
- **Part of baseConstants:** NO — subject to cascade reset

---

### 2. `fluxDensity`
- **UI Label:** Flux Density B (Tesla)
- **Field ID:** `#fluxDensity`
- **Type:** Input (configurable engineering constant)
- **Unit:** Tesla (T)
- **Default:** `1` (set in HTML `value` attribute)
- **User Editable:** Yes
- **First Introduced:** Step 5
- **Used By:** Step 5 (denominator: `4.44 * fluxDensity * frequency`)
- **Part of baseConstants:** YES — never cleared by cascade reset

---

### 3. `frequency`
- **UI Label:** Frequency (Hz)
- **Field ID:** `#frequency`
- **Type:** Input (configurable engineering constant)
- **Unit:** Hertz (Hz)
- **Default:** `50` (set in HTML `value` attribute)
- **User Editable:** Yes
- **First Introduced:** Step 5
- **Used By:** Step 5 (denominator: `4.44 * fluxDensity * frequency`)
- **Part of baseConstants:** YES — never cleared by cascade reset

---

### 4. `netArea`
- **UI Label:** (none — internal JS variable)
- **Field ID:** Not written to DOM directly — the rounded version is written
- **Type:** Derived (intermediate, ephemeral)
- **Unit:** mm²
- **Default:** None
- **User Editable:** No — never written to DOM in unrounded form
- **First Introduced:** Step 5
- **Produced By:** Step 5 (`(netAreaVTInput * 1e6) / (4.44 * fluxDensity * frequency)`)
- **Used By:** Step 5 rounding steps only; both `#netAreaOutput` and `#netAreaInput`
  receive `Math.round(netArea)` — they do NOT receive the raw float

---

### 5. `netAreaUsed`
- **UI Label:** Net Area used (mm²)
- **Field ID:** `#netAreaInput`
- **Type:** Derived (auto-populated, user-overridable)
- **Unit:** mm²
- **Default:** None — auto-populated as `Math.round(netArea)` from Step 5
- **User Editable:** YES — editable override
- **First Introduced:** Step 5 (auto-populated) / Step 6 (read)
- **Produced By:** Step 5 writes `Math.round(netArea)` to `#netAreaInput`
- **Used By:** Step 6 Sub-A (`grossArea = netAreaUsed / stackingFactor`)
- **Part of baseConstants:** NO — subject to cascade reset
- **Note:** This is a separate field from `#netAreaOutput`. Both receive the same
  `Math.round(netArea)` value under normal conditions. `#netAreaInput` exists to
  allow the user to override the net area entering Step 6 independently.

---

### 6. `stackingFactor`
- **UI Label:** Stacking Factor (SF)
- **Field ID:** `#stackingFactor`
- **Type:** Input (configurable engineering constant)
- **Unit:** Dimensionless (ratio, typically 0.85–0.95)
- **Default:** `0.9` (set in HTML `value` attribute)
- **User Editable:** Yes
- **First Introduced:** Step 6 Sub-A
- **Used By:** Step 6 Sub-A (divisor in `grossArea = netAreaUsed / stackingFactor`)
- **Cross-Phase Use:** Also used in Phase 6 Step 18 as `finalCoreSf` (different field,
  different variable name — see Phase 6 documentation)
- **Part of baseConstants:** YES — never cleared by cascade reset

---

### 7. `tongueWidth`
- **UI Label:** Tongue Width TW (mm)
- **Field ID:** `#tongueWidth`
- **Type:** Input
- **Unit:** mm
- **Default:** None — required user entry
- **User Editable:** Yes
- **First Introduced:** Step 6 Sub-B (first read in Phase 2)
- **Used By (Phase 2):** Step 6 Sub-B (`selectedArea = tongueWidth * stackHeight`)
- **Used By (Downstream):**
  - Phase 3 Step 10: `innerW = tongueWidth + (2 * coilClearance)`
  - Phase 4 Step 11: clamp span and length calculations
  - Phase 4 Step 12: clamp width calculation
  - Phase 4 Step 13: bobbin inner width
  - Phase 6 Step 18: auto-populated into `#coreD`
- **Part of baseConstants:** YES — never cleared by cascade reset

---

### 8. `stackHeight`
- **UI Label:** Stack Height SH (mm)
- **Field ID:** `#stackHeight`
- **Type:** Input
- **Unit:** mm
- **Default:** None — required user entry
- **User Editable:** Yes
- **First Introduced:** Step 6 Sub-B (first read in Phase 2)
- **Used By (Phase 2):** Step 6 Sub-B (`selectedArea = tongueWidth * stackHeight`)
- **Used By (Downstream):**
  - Phase 3 Step 10: `innerL = stackHeight + (2 * coilClearance)`
  - Phase 4 Step 13: `bobbinInnerL = stackHeight`
  - Phase 6 Step 18: auto-populated into `#coreST`
- **Part of baseConstants:** YES — never cleared by cascade reset

---

### 9. `grossArea`
- **UI Label:** Gross Area Req (mm²)
- **Field ID:** `#grossArea`
- **Type:** Derived
- **Unit:** mm²
- **Default:** None
- **User Editable:** YES — editable override
- **First Introduced:** Step 6 Sub-A
- **Produced By:** Step 6 Sub-A (`Math.round(netAreaUsed / stackingFactor)`)
- **Used By:** Display and comparison only. `#grossArea` is NOT read back in any
  downstream calculation. It serves as a reference for the engineer to compare against `#selectedArea`.
- **Part of baseConstants:** NO

---

### 10. `selectedArea`
- **UI Label:** Selected Area (TW x SH)
- **Field ID:** `#selectedArea`
- **Type:** Derived
- **Unit:** mm²
- **Default:** None
- **User Editable:** YES — editable override
- **First Introduced:** Step 6 Sub-B
- **Produced By:** Step 6 Sub-B (`tongueWidth * stackHeight`)
- **Used By:** Phase 6 Step 18 (`actualNetArea = Math.round(selectedArea * finalCoreSf)`)
- **Part of baseConstants:** NO

---

## Hardcoded Constants Used in Phase 2

These are fixed numeric literals embedded directly in the formula expression in `app.js`.
They are NOT user inputs and NOT configurable.

| Constant | Value     | Location in Formula                               | Used In |
|----------|-----------|---------------------------------------------------|---------|
| `4.44`   | 4.44      | Denominator: `4.44 * fluxDensity * frequency`     | Step 5  |
| `1e6`    | 1,000,000 | Numerator multiplier: `netAreaVTInput * 1e6`      | Step 5  |

---

## baseConstants Membership (Phase 2 Fields)

| Field ID          | In baseConstants? |
|-------------------|-------------------|
| `fluxDensity`     | YES               |
| `frequency`       | YES               |
| `stackingFactor`  | YES               |
| `tongueWidth`     | YES               |
| `stackHeight`     | YES               |
| `netAreaVTInput`  | NO                |
| `netAreaOutput`   | NO                |
| `netAreaInput`    | NO                |
| `grossArea`       | NO                |
| `selectedArea`    | NO                |
