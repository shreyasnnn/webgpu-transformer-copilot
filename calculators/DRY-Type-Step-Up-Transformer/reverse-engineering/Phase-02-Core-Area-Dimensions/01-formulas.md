# Phase 02 — Core Area Dimensions
## File: 01-formulas.md

> **Scope:** This document covers every engineering calculation belonging to Phase 2.
> These correspond to Steps 5–6 in `js/app.js` inside the `calculate()` function.
> No calculations from other phases are included.

---

## Step 5 — Net Core Area

### Purpose
Computes the minimum magnetic cross-sectional area the iron core must provide to
support the required magnetic flux at the given flux density and supply frequency.
Uses the baseline Volts Per Turn (V/T) — not the actual V/T — as its input.

### Formula — Net Core Area
```
netArea = (netAreaVTInput * 1e6) / (4.44 * fluxDensity * frequency)
```

### Variables Used

| Symbol             | Description                                        | Source                     |
|--------------------|----------------------------------------------------|----------------------------|
| `netAreaVTInput`   | Baseline V/T used for core area calculation        | From Phase 1 Step 2 / override |
| `fluxDensity`      | Magnetic flux density B (Tesla)                    | User input (default: 1)    |
| `frequency`        | Supply frequency (Hz)                              | User input (default: 50)   |
| `netArea`          | Required net magnetic core area (mm²)              | Computed here              |

### Input Variables
- `netAreaVTInput` — read from field `#netAreaVTInput` (auto-populated from `vtUsed`
  of Phase 1 Step 2, user-overridable)
- `fluxDensity` — read from field `#fluxDensity` (default: `1`)
- `frequency` — read from field `#frequency` (default: `50`)

### Output Variables
- `netArea` — written to field `#netAreaOutput` (rounded via `Math.round`)
- `netAreaInput` — field `#netAreaInput` is also auto-populated with `Math.round(netArea)`
  for use in Step 6

### Dependencies on Previous Steps
- **Phase 1 Step 2:** `netAreaVTInput` is sourced from `vtUsed` (baseline V/T).
  The forwarding line `auto("netAreaVTInput", vtUsed)` in app.js populates this field.

### Default Values
- `fluxDensity` = `1` (Tesla) — set in HTML `value` attribute on field `#fluxDensity`
- `frequency` = `50` (Hz) — set in HTML `value` attribute on field `#frequency`

### User-Overridable Values
- `#netAreaVTInput` — The V/T baseline fed into this step can be manually overridden.
- `#netAreaOutput` — The computed Net Core Area can be manually overridden.
- `#netAreaInput` — The Net Core Area passed into Step 6 can be independently overridden.

### Constants
- `4.44` — the EMF constant (4 × form factor × π/4 × 2 = 4.44 for sinusoidal AC).
  This value is hardcoded directly in the formula expression in app.js.
- `1e6` (= 1,000,000) — unit conversion factor from V/T to mm² (converts V to µV
  and m² to mm² in the EMF equation). Hardcoded in the formula.

### Lookup Tables Referenced
- None.

### Rounding Applied
- `Math.round(netArea)` — result is rounded to the nearest integer (mm²).
  Applied to both `#netAreaOutput` and the `#netAreaInput` feed.
- See `05-rounding.md` for full rounding behavior documentation.

### Guard Condition
- If `netAreaVTInput`, `fluxDensity`, or `frequency` is null/empty/zero (falsy),
  `netArea` is set to `null` and both output fields remain blank.

---

## Step 6 — Gross Core Area & Core Selection Validation

### Purpose
Computes the minimum gross (physical) core area required to achieve the net area
after accounting for the lamination stacking factor. Separately computes the
actual physical area of the user-selected core (Tongue Width × Stack Height) and
presents both for comparison.

### Formula — Gross Core Area Required
```
grossArea = netAreaUsed / stackingFactor
```

### Formula — Selected Core Area
```
selectedArea = tongueWidth * stackHeight
```

### Variables Used

| Symbol           | Description                                        | Source                     |
|------------------|----------------------------------------------------|----------------------------|
| `netAreaUsed`    | Net area value fed into Step 6                     | From Step 5 / override     |
| `stackingFactor` | Lamination stacking factor (SF)                    | User input (default: 0.9)  |
| `tongueWidth`    | Physical tongue width of selected core (mm)        | User input                 |
| `stackHeight`    | Physical stack height of selected core (mm)        | User input                 |
| `grossArea`      | Required gross core area (mm²)                     | Computed here              |
| `selectedArea`   | Actual physical area of selected core (mm²)        | Computed here              |

### Input Variables
- `netAreaUsed` — read from field `#netAreaInput` (auto-populated from Step 5, user-overridable)
- `stackingFactor` — read from field `#stackingFactor` (default: `0.9`)
- `tongueWidth` — read from field `#tongueWidth` (no default — required user entry)
- `stackHeight` — read from field `#stackHeight` (no default — required user entry)

### Output Variables
- `grossArea` — written to field `#grossArea` (rounded via `Math.round`)
- `selectedArea` — written to field `#selectedArea` (no rounding — direct product)

### Dependencies on Previous Steps
- **Step 5:** `netAreaUsed` is sourced from `#netAreaInput`.

### Default Values
- `stackingFactor` = `0.9` — set in HTML `value` attribute on field `#stackingFactor`

### User-Overridable Values
- `#netAreaInput` — Net area entering Step 6 can be independently overridden.
- `#grossArea` — The computed required gross area can be manually overridden.
- `#selectedArea` — The computed selected physical area can be manually overridden.

### Constants
- None in this step. All divisors and multiplicands are user-provided values.

### Lookup Tables Referenced
- None.

### Rounding Applied
- `Math.round(grossArea)` — required gross area rounded to nearest integer (mm²).
- `selectedArea` receives NO rounding — the raw product `tongueWidth * stackHeight`
  is written directly.
- See `05-rounding.md` for full rounding behavior documentation.

### Guard Condition — grossArea
- If `netAreaUsed` is null or `stackingFactor` is null/falsy, `grossArea` is null
  and `#grossArea` remains blank.

### Guard Condition — selectedArea
- If `tongueWidth` is null OR `stackHeight` is null, `selectedArea` is null
  and `#selectedArea` remains blank.
- The two guards are independent. One can succeed while the other fails.

---

## Phase 2 — Completeness Review

### All Calculations Documented

| Step | Calculation                                                    | Documented |
|------|----------------------------------------------------------------|------------|
| 5    | netArea = (netAreaVTInput * 1e6) / (4.44 * fluxDensity * frequency) | YES |
| 6    | grossArea = netAreaUsed / stackingFactor                       | YES        |
| 6    | selectedArea = tongueWidth * stackHeight                       | YES        |

### Cross-Phase Contamination Check
- `auto("netAreaVTInput", vtUsed)` is the data forwarding action from Phase 1 Step 2.
  That forward is owned by Phase 1. Phase 2 only reads `#netAreaVTInput` — it does
  not compute it.
- `selectedArea` computed here is later consumed by Phase 6 Step 18 (`actualNetArea`).
  Phase 2 does NOT perform Phase 6 calculations.

### Execution Order Verified
Steps 5 → 6 match the exact sequential execution order in `calculate()` within `js/app.js`.

### Omission Check
No Phase 2 engineering calculation has been omitted.
