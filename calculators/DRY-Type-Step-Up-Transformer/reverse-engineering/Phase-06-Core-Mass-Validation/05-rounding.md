# Phase 06 — Core Mass Validation
## File: 05-rounding.md

> **Scope:** Every rounding rule applied to Phase 6 variables.
> Rules documented in execution order. No inferred reasons included.

---

## Rounding Rules

### Rule 1 — Actual Net Core Area (ROUND — nearest integer)

| Property             | Value                                                             |
|----------------------|-------------------------------------------------------------------|
| Variable             | `actualNetArea` (written to `#actualNetAreaOutput`)               |
| Step                 | Step 18A                                                          |
| Rounding Method      | Standard rounding to nearest integer                              |
| Exact Implementation | `Math.round(selectedArea * finalCoreSf)`                         |
| Decimal Places       | 0 (integer mm²)                                                   |
| Direction            | Standard rounding — half rounds up                               |
| Applied To           | Net core area before use in mass formula                          |

**Important:** This rounded integer value is the one used directly in the mass
formula (Formula 18D), NOT the unrounded product.

---

### Rule 2 — Frame Perimeter (NO ROUNDING)

| Property             | Value                                                      |
|----------------------|------------------------------------------------------------|
| Variable             | `framePerimeterCalc` (written to `#framePerimeterOutput`)  |
| Step                 | Step 18C                                                   |
| Rounding Method      | NONE                                                       |
| Exact Implementation | Raw JS float arithmetic result written directly            |
| Decimal Places       | As produced by JS float arithmetic                         |
| Applied To           | Total lamination frame perimeter (display and mass formula)|

---

### Rule 3 — Core Mass

| Property             | Value                                                         |
|----------------------|---------------------------------------------------------------|
| Variable             | `coreMass` (written to `#coreMassOutput`)                     |
| Step                 | Step 18D                                                      |
| Rounding Method      | Fixed decimal places                                          |
| Exact Implementation | `parseFloat(coreMass.toFixed(2))`                            |
| Decimal Places       | 2                                                             |
| Direction            | Standard JS toFixed (half-up)                                 |
| Applied To           | Final core steel mass in kg (read by Phase 7 cost module)     |

---

## Summary Table

| Rule | Variable / Field          | Step | Method          | Implementation                          |
|------|---------------------------|------|-----------------|-----------------------------------------|
| 1    | `#actualNetAreaOutput`    | 18A  | Math.round      | `Math.round(selectedArea * finalCoreSf)` |
| 2    | `#framePerimeterOutput`   | 18C  | NONE            | raw float                               |
| 3    | `#coreMassOutput`         | 18D  | toFixed(2)      | `parseFloat(coreMass.toFixed(2))`       |
