# Phase 01 — Capacity & Electrical Turns
## File: 05-rounding.md

> **Scope:** Every rounding rule applied to variables in Phase 1.
> Rules are documented in execution order.
> No inferred reasons are included — only what the code explicitly does.

---

## Rounding Rules

### Rule 1 — VA Display Output

| Property           | Value                                          |
|--------------------|------------------------------------------------|
| Variable           | `va` (written to `#vaOutput`)                  |
| Step               | Step 1                                         |
| Rounding Method    | Fixed decimal places                           |
| Exact Implementation | `parseFloat(va.toFixed(2))`                  |
| Decimal Places     | 2                                              |
| Direction          | Standard JS toFixed (applies half-up rounding) |
| Applied To         | Final display value written to `#vaOutput`     |

**Detail:** `toFixed(2)` is called on the raw float result, then `parseFloat()` removes
trailing zeros. The result is what gets written to the DOM field.

---

### Rule 2 — kVA Display Output

| Property           | Value                                          |
|--------------------|------------------------------------------------|
| Variable           | `kva` (written to `#kvaOutput`)                |
| Step               | Step 1                                         |
| Rounding Method    | Fixed decimal places                           |
| Exact Implementation | `parseFloat(kva.toFixed(3))`               |
| Decimal Places     | 3                                              |
| Direction          | Standard JS toFixed (applies half-up rounding) |
| Applied To         | Final display value written to `#kvaOutput`    |

---

### Rule 3 — kVA Feed Value into Step 2

| Property           | Value                                            |
|--------------------|--------------------------------------------------|
| Variable           | `kvaInput` (written to `#kvaInput`)              |
| Step               | Step 1                                           |
| Rounding Method    | Fixed decimal places                             |
| Exact Implementation | `parseFloat((va/1000).toFixed(3))`           |
| Decimal Places     | 3                                                |
| Direction          | Standard JS toFixed (applies half-up rounding)   |
| Applied To         | Feed value written to `#kvaInput` for Step 2 use |

**Detail:** This is computed independently of `kva` (Rule 2). Both evaluate `va/1000`
and both apply `.toFixed(3)`, so they produce the same numeric value under normal
conditions. However they are separate expressions in the code.

---

### Rule 4 — Baseline Volts Per Turn (vt) — TRUNCATION

| Property           | Value                                                  |
|--------------------|--------------------------------------------------------|
| Variable           | `vt` (written to `#vt` and `#vtInput`)                 |
| Step               | Step 2                                                 |
| Rounding Method    | FLOOR (truncation to 1 decimal place)                  |
| Exact Implementation | `Math.floor(rawVt * 10) / 10`                        |
| Decimal Places     | 1                                                      |
| Direction          | Always DOWN — this is truncation, NOT standard rounding|
| Applied To         | Baseline V/T before it enters Step 3                   |

**Critical Detail:** This is NOT `toFixed(1)` and NOT `Math.round()`.
`Math.floor(x * 10) / 10` always truncates toward zero for positive numbers.
For example: rawVt = 1.89 -> vt = 1.8 (NOT 1.9).
This rule is implemented in the shared helper function `truncateToOneDecimal(num)`.

**Helper Function (from app.js):**
```
function truncateToOneDecimal(num) {
    if (num === null || isNaN(num)) return null;
    return Math.floor(num * 10) / 10;
}
```

---

### Rule 5 — Raw V/T Display Trace

| Property           | Value                                               |
|--------------------|-----------------------------------------------------|
| Variable           | `rawVt` (displayed in `#calc2` trace only)          |
| Step               | Step 2                                              |
| Rounding Method    | Fixed decimal places                                |
| Exact Implementation | `rawVt.toFixed(4)`                              |
| Decimal Places     | 4                                                   |
| Direction          | Standard JS toFixed                                 |
| Applied To         | Display trace string ONLY — not used in any formula |

**Note:** This value appears in the human-readable calculation trace (`#calc2` innerHTML).
It is NOT used in the calculation chain.

---

### Rule 6 — Primary Turns (CEILING)

| Property           | Value                                              |
|--------------------|----------------------------------------------------|
| Variable           | `primaryTurns` (written to `#primaryTurns`)        |
| Step               | Step 3                                             |
| Rounding Method    | CEIL (always rounds up to nearest integer)         |
| Exact Implementation | `Math.ceil(primaryVoltage / vtUsed)`           |
| Decimal Places     | 0 (integer result)                                 |
| Direction          | Always UP                                          |
| Applied To         | Final primary turn count                           |

**Detail:** No fractional turns are possible. Any non-integer result is always
rounded up. This is an engineering constraint, not a display rule.

---

### Rule 7 — Actual Volts Per Turn (actualVT) — TRUNCATION

| Property           | Value                                                    |
|--------------------|----------------------------------------------------------|
| Variable           | `actualVT` (written to `#actualVT` and `#actualVTInput`) |
| Step               | Step 3                                                   |
| Rounding Method    | FLOOR (truncation to 1 decimal place)                    |
| Exact Implementation | `Math.floor(rawActualVT * 10) / 10`                    |
| Decimal Places     | 1                                                        |
| Direction          | Always DOWN — truncation                                 |
| Applied To         | Actual V/T after primary turns are ceiled                |

**Same helper function as Rule 4:** `truncateToOneDecimal(rawActualVT)`.

**Critical Detail:** `rawActualVT` is computed from the CEILED `primaryTurns`.
The truncation is then applied to this post-ceiling result. Both truncations
(Rule 4 and Rule 7) use the same `Math.floor(x * 10) / 10` pattern.

---

### Rule 8 — Raw Actual V/T Display Trace

| Property           | Value                                               |
|--------------------|-----------------------------------------------------|
| Variable           | `rawActualVT` (displayed in `#calc3` trace only)    |
| Step               | Step 3                                              |
| Rounding Method    | Fixed decimal places                                |
| Exact Implementation | `rawActualVT.toFixed(4)`                        |
| Decimal Places     | 4                                                   |
| Direction          | Standard JS toFixed                                 |
| Applied To         | Display trace string ONLY — not used in any formula |

---

### Rule 9 — Secondary Turns (CEILING)

| Property           | Value                                                |
|--------------------|------------------------------------------------------|
| Variable           | `secondaryTurns` (written to `#secondaryTurns`)      |
| Step               | Step 4                                               |
| Rounding Method    | CEIL (always rounds up to nearest integer)           |
| Exact Implementation | `Math.ceil(secVoltsUsed / secActVTUsed)`         |
| Decimal Places     | 0 (integer result)                                   |
| Direction          | Always UP                                            |
| Applied To         | Final secondary turn count                           |

**Same rule as Rule 6.** Secondary turns use the identical CEIL strategy as primary turns.

---

## Summary Table

| Rule | Variable        | Step | Method           | Implementation                      |
|------|-----------------|------|------------------|-------------------------------------|
| 1    | va (display)    | 1    | toFixed(2)       | `parseFloat(va.toFixed(2))`         |
| 2    | kva (display)   | 1    | toFixed(3)       | `parseFloat(kva.toFixed(3))`        |
| 3    | kvaInput (feed) | 1    | toFixed(3)       | `parseFloat((va/1000).toFixed(3))`  |
| 4    | vt              | 2    | FLOOR / truncate | `Math.floor(rawVt * 10) / 10`       |
| 5    | rawVt (trace)   | 2    | toFixed(4)       | `rawVt.toFixed(4)` — display only   |
| 6    | primaryTurns    | 3    | CEIL             | `Math.ceil(primaryVoltage / vtUsed)`|
| 7    | actualVT        | 3    | FLOOR / truncate | `Math.floor(rawActualVT * 10) / 10` |
| 8    | rawActualVT (trace)| 3 | toFixed(4)       | `rawActualVT.toFixed(4)` — display only |
| 9    | secondaryTurns  | 4    | CEIL             | `Math.ceil(secVoltsUsed / secActVTUsed)` |

---

## Helper Function — truncateToOneDecimal

Used in Rules 4 and 7.

```javascript
function truncateToOneDecimal(num) {
    if (num === null || isNaN(num)) return null;
    return Math.floor(num * 10) / 10;
}
```

- Returns `null` if input is null or NaN.
- For all valid positive numbers: always floors to 1 decimal place.
- Defined once in `js/app.js` and reused across multiple phases.
