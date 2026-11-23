# Phase 02 — Core Area Dimensions
## File: 05-rounding.md

> **Scope:** Every rounding rule applied to variables in Phase 2.
> Rules are documented in execution order.
> No inferred reasons are included — only what the code explicitly does.

---

## Rounding Rules

### Rule 1 — Net Core Area Display Output

| Property             | Value                                                     |
|----------------------|-----------------------------------------------------------|
| Variable             | Written to `#netAreaOutput`                               |
| Step                 | Step 5                                                    |
| Rounding Method      | Round to nearest integer                                  |
| Exact Implementation | `Math.round(netArea)` — passed to `auto("netAreaOutput", Math.round(netArea))` |
| Decimal Places       | 0 (integer result)                                        |
| Direction            | Standard rounding — 0.5 rounds up                        |
| Applied To           | Final display and override field for net core area        |

**Detail:** The raw `netArea` float is never written to the DOM. `Math.round()` is
applied before the `auto()` call. The rounded integer is what the user sees and
what cascade reset compares against.

---

### Rule 2 — Net Core Area Feed Value into Step 6

| Property             | Value                                                     |
|----------------------|-----------------------------------------------------------|
| Variable             | Written to `#netAreaInput`                                |
| Step                 | Step 5                                                    |
| Rounding Method      | Round to nearest integer                                  |
| Exact Implementation | `Math.round(netArea)` — passed to `auto("netAreaInput", Math.round(netArea))` |
| Decimal Places       | 0 (integer result)                                        |
| Direction            | Standard rounding — 0.5 rounds up                        |
| Applied To           | Feed value to Step 6 Sub-A                                |

**Detail:** This is a separate `auto()` call from Rule 1, but applies the same
`Math.round(netArea)` expression to the same raw float. Under normal (non-overridden)
conditions, `#netAreaOutput` and `#netAreaInput` will contain identical values.

---

### Rule 3 — Gross Core Area Required

| Property             | Value                                                     |
|----------------------|-----------------------------------------------------------|
| Variable             | Written to `#grossArea`                                   |
| Step                 | Step 6 Sub-A                                              |
| Rounding Method      | Round to nearest integer                                  |
| Exact Implementation | `Math.round(grossArea)` — passed to `auto("grossArea", Math.round(grossArea))` |
| Decimal Places       | 0 (integer result)                                        |
| Direction            | Standard rounding — 0.5 rounds up                        |
| Applied To           | Required gross area written to display field              |

---

### Rule 4 — Selected Core Area (NO ROUNDING)

| Property             | Value                                                     |
|----------------------|-----------------------------------------------------------|
| Variable             | Written to `#selectedArea`                                |
| Step                 | Step 6 Sub-B                                              |
| Rounding Method      | NONE                                                      |
| Exact Implementation | `auto("selectedArea", selectedArea)` — raw float product  |
| Decimal Places       | As many as the JavaScript float provides                  |
| Direction            | N/A                                                       |
| Applied To           | Physical selected core area (TW x SH)                    |

**Detail:** `tongueWidth * stackHeight` produces a float that is written directly
with no rounding applied. If both inputs are integers (as is typical for core
dimensions), the result will naturally be an integer, but this is not enforced.

---

## Summary Table

| Rule | Variable / Field     | Step     | Method              | Implementation                              |
|------|----------------------|----------|---------------------|---------------------------------------------|
| 1    | `#netAreaOutput`     | Step 5   | Math.round          | `Math.round(netArea)`                       |
| 2    | `#netAreaInput`      | Step 5   | Math.round          | `Math.round(netArea)`                       |
| 3    | `#grossArea`         | Step 6 A | Math.round          | `Math.round(grossArea)`                     |
| 4    | `#selectedArea`      | Step 6 B | NONE                | raw `tongueWidth * stackHeight`             |

---

## Display Trace Formatting (Not Used in Calculations)

The `#calc6` display trace formats values using string interpolation:
```javascript
`Gross Req: ${netAreaUsed} / ${stackingFactor} = ${Math.round(grossArea)} mm²
Selected Core: ${tongueWidth}mm x ${stackHeight}mm = ${selectedArea} mm²`
```

- `Math.round(grossArea)` — same as Rule 3, used again in the trace string.
- `selectedArea` — raw float, same as Rule 4, used in the trace string.
- Neither trace value participates in any downstream calculation.
