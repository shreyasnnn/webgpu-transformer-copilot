# Phase 01 — Capacity & Electrical Turns
## File: 01-formulas.md

> **Scope:** This document covers every engineering calculation belonging to Phase 1.
> These correspond to Steps 1-4 in `js/app.js` inside the `calculate()` function.
> No calculations from other phases are included.

---

## Step 1 — Total VA & kVA Capacity

### Purpose
Computes the total apparent power (VA) of the transformer from the secondary-side
electrical requirements, then converts it to kilovolt-amperes (kVA).

### Formula — VA
```
VA = vSecInput x iSecInput
```

### Formula — kVA
```
kVA = VA / 1000
```

### Variables Used

| Symbol       | Description                          | Source         |
|--------------|--------------------------------------|----------------|
| `vSecInput`  | Secondary Voltage (V)                | User input     |
| `iSecInput`  | Secondary Current (A)                | User input     |
| `VA`         | Total Apparent Power (VA)            | Computed here  |
| `kVA`        | Total Apparent Power (kVA)           | Computed here  |

### Input Variables
- `vSecInput` — read from field `#vSecInput`
- `iSecInput` — read from field `#iSecInput`

### Output Variables
- `VA` — written to field `#vaOutput` (rounded to 2 decimal places via toFixed(2) then parseFloat)
- `kVA` — written to field `#kvaOutput` (rounded to 3 decimal places via toFixed(3) then parseFloat)
- `kvaInput` — field `#kvaInput` is also auto-populated with `VA / 1000` (to 3 decimal places) for use in Step 2

### Dependencies on Previous Steps
- None. This is the first step in the calculation chain.

### Default Values
- None. Both inputs are required from the user.

### User-Overridable Values
- `#vaOutput` — The computed VA can be manually overridden by the user.
- `#kvaOutput` — The computed kVA can be manually overridden by the user.
- `#kvaInput` — The kVA value passed into Step 2 can be manually overridden.

### Constants
- None.

### Lookup Tables Referenced
- None.

### Rounding Applied
- `VA.toFixed(2)` then `parseFloat()` — 2 decimal places on VA output.
- `kVA.toFixed(3)` then `parseFloat()` — 3 decimal places on kVA output.
- `(VA / 1000).toFixed(3)` then `parseFloat()` — applied to the kvaInput feed value.
- See `05-rounding.md` for full rounding behavior documentation.

### Guard Condition
- If either `vSecInput` or `iSecInput` is null/empty, `VA` is set to `null` and all
  downstream outputs for this step remain blank.

---

## Step 2 — Volts Per Turn (Baseline V/T)

### Purpose
Computes the theoretical number of volts each turn of wire must support, using the
empirical K-Factor formula. The raw result is then truncated (not rounded) to one
decimal place to produce the baseline V/T used downstream.

### Formula — Raw V/T
```
rawVt = k x SQRT(kvaInput)
```

### Formula — Truncated V/T (Baseline)
```
vt = Math.floor(rawVt x 10) / 10
```

### Variables Used

| Symbol      | Description                                    | Source                    |
|-------------|------------------------------------------------|---------------------------|
| `k`         | K Factor Constant (empirical design constant)  | User input (default: 0.8) |
| `kvaInput`  | kVA value used for this step                   | From Step 1 / override    |
| `rawVt`     | Untruncated Volts Per Turn                     | Computed here             |
| `vt`        | Truncated Volts Per Turn (Baseline V/T)        | Computed here             |

### Input Variables
- `k` — read from field `#k` (default value: `0.8`)
- `kvaInput` — read from field `#kvaInput` (auto-populated from Step 1, user-overridable)

### Output Variables
- `vt` — written to field `#vt` (truncated to 1 decimal place)
- `vtInput` — field `#vtInput` is also auto-populated with `vt` for use in Step 3

### Dependencies on Previous Steps
- **Step 1:** `kvaInput` is sourced from the VA/kVA calculation.

### Default Values
- `k` = `0.8` (set in HTML value attribute on field `#k`)

### User-Overridable Values
- `#k` — K Factor can be changed by the user.
- `#kvaInput` — The kVA feed into this step can be manually overridden.
- `#vt` — The resulting Baseline V/T can be manually overridden.
- `#vtInput` — The V/T value passed into Step 3 can be independently overridden.

### Constants
- None. The K Factor (`k`) is a user-configurable design constant, not a fixed system constant.

### Lookup Tables Referenced
- None.

### Rounding Applied
- `Math.floor(rawVt x 10) / 10` — This is a TRUNCATION, NOT standard rounding.
  The raw value is always floored to one decimal place regardless of the digit
  in the second decimal position.
- `rawVt.toFixed(4)` — used only in the display trace (#calc2), not in the calculation chain.
- See `05-rounding.md` for full rounding behavior documentation.

### Guard Condition
- If `k` or `kvaInput` is null/empty, `rawVt` is set to `null` and `vt` remains blank.
- `kvaInput` must be >= 0 for the square root to be valid; the guard checks:
  `kvaInput !== null && kvaInput >= 0`.

---

## Step 3 — Primary Turns & Actual Volts Per Turn

### Purpose
Computes the number of primary winding turns required using the baseline V/T, then
derives the true (actual) Volts Per Turn that results from rounding turns up to the
nearest integer (CEIL). This actual V/T replaces the baseline V/T for all downstream
secondary calculations.

### Formula — Raw Primary Turns
```
primaryTurns_raw = primaryVoltage / vtUsed
```

### Formula — Rounded Primary Turns
```
primaryTurns = Math.ceil(primaryVoltage / vtUsed)
```

### Formula — Raw Actual V/T
```
rawActualVT = primaryVoltage / primaryTurns
```

### Formula — Truncated Actual V/T
```
actualVT = Math.floor(rawActualVT x 10) / 10
```

### Variables Used

| Symbol             | Description                          | Source                 |
|--------------------|--------------------------------------|------------------------|
| `primaryVoltage`   | Primary (input) side voltage (V)     | User input             |
| `vtUsed`           | V/T value fed into this step         | From Step 2 / override |
| `primaryTurns_raw` | Unceiled primary turn count          | Computed here          |
| `primaryTurns`     | Ceiled primary turn count (integer)  | Computed here          |
| `rawActualVT`      | Untruncated actual Volts Per Turn    | Computed here          |
| `actualVT`         | Truncated actual Volts Per Turn      | Computed here          |

### Input Variables
- `primaryVoltage` — read from field `#primaryVoltage`
- `vtUsed` — read from field `#vtInput` (auto-populated from Step 2 `vt`, user-overridable)

### Output Variables
- `primaryTurns` — written to field `#primaryTurns`
- `actualVT` — written to field `#actualVT`
- `actualVTInput` — field `#actualVTInput` is also auto-populated with `actualVT` for use in Step 4
- `secondaryVoltage` — field `#secondaryVoltage` is auto-populated with `vSecInput` (carried forward from Step 1)

### Dependencies on Previous Steps
- **Step 1:** `vSecInput` is forwarded to `#secondaryVoltage` for Step 4.
- **Step 2:** `vtUsed` sourced from `vt` (baseline V/T).

### Default Values
- None. `primaryVoltage` is a required user input with no default.

### User-Overridable Values
- `#primaryVoltage` — Primary voltage is a direct user input.
- `#vtInput` — The V/T fed into this step can be overridden independently of Step 2.
- `#primaryTurns` — The ceiled primary turn count can be manually overridden.
- `#actualVT` — The resulting actual V/T can be manually overridden.
- `#actualVTInput` — The actual V/T forwarded to Step 4 can be independently overridden.
- `#secondaryVoltage` — Auto-populated from `vSecInput` but remains user-overridable.

### Constants
- None.

### Lookup Tables Referenced
- None.

### Rounding Applied
- `Math.ceil(primaryVoltage / vtUsed)` — Primary turns are always rounded UP to
  the nearest integer. No partial turns are possible.
- `Math.floor(rawActualVT x 10) / 10` — Actual V/T is TRUNCATED (floored) to one decimal place.
- `rawActualVT.toFixed(4)` — used only in the display trace (#calc3), not in the chain.
- See `05-rounding.md` for full rounding behavior documentation.

### Guard Condition
- If `primaryVoltage` or `vtUsed` is null/empty (or vtUsed is 0/falsy), all outputs
  for this step remain blank.

---

## Step 4 — Secondary Turns

### Purpose
Computes the number of secondary winding turns required. Uses the ACTUAL Volts Per
Turn (derived from the ceiled primary turns in Step 3) — not the baseline V/T —
to ensure the turns ratio remains physically consistent with the built core.

### Formula — Raw Secondary Turns
```
secondaryTurns_raw = secVoltsUsed / secActVTUsed
```

### Formula — Rounded Secondary Turns
```
secondaryTurns = Math.ceil(secVoltsUsed / secActVTUsed)
```

### Variables Used

| Symbol               | Description                          | Source                 |
|----------------------|--------------------------------------|------------------------|
| `secVoltsUsed`       | Secondary voltage fed into this step | From Step 3 fwd / override |
| `secActVTUsed`       | Actual V/T fed into this step        | From Step 3 / override |
| `secondaryTurns_raw` | Unceiled secondary turn count        | Computed here          |
| `secondaryTurns`     | Ceiled secondary turn count (integer)| Computed here          |

### Input Variables
- `secVoltsUsed` — read from field `#secondaryVoltage` (auto-populated with `vSecInput`
  from Step 1 via Step 3 forward, user-overridable)
- `secActVTUsed` — read from field `#actualVTInput` (auto-populated from Step 3 `actualVT`,
  user-overridable)

### Output Variables
- `secondaryTurns` — written to field `#secondaryTurns`

### Dependencies on Previous Steps
- **Step 1:** `#secondaryVoltage` is sourced from `vSecInput`.
- **Step 3:** `#actualVTInput` is sourced from `actualVT`.

### Default Values
- None.

### User-Overridable Values
- `#secondaryVoltage` — Secondary voltage entering this step can be independently overridden.
- `#actualVTInput` — Actual V/T entering this step can be independently overridden.
- `#secondaryTurns` — The ceiled secondary turn count can be manually overridden.

### Constants
- None.

### Lookup Tables Referenced
- None.

### Rounding Applied
- `Math.ceil(secVoltsUsed / secActVTUsed)` — Secondary turns are always rounded UP
  to the nearest integer. Same rule as primary turns.
- See `05-rounding.md` for full rounding behavior documentation.

### Guard Condition
- If `secVoltsUsed` or `secActVTUsed` is null/empty (or `secActVTUsed` is 0/falsy),
  `secondaryTurns` remains blank.

---

## Phase 1 — Completeness Review

### All Calculations Documented

| Step | Calculation                                          | Documented |
|------|------------------------------------------------------|------------|
| 1    | VA = vSecInput x iSecInput                           | YES        |
| 1    | kVA = VA / 1000                                      | YES        |
| 2    | rawVt = k x SQRT(kvaInput)                           | YES        |
| 2    | vt = Math.floor(rawVt x 10) / 10                     | YES        |
| 3    | primaryTurns = Math.ceil(primaryVoltage / vtUsed)    | YES        |
| 3    | rawActualVT = primaryVoltage / primaryTurns          | YES        |
| 3    | actualVT = Math.floor(rawActualVT x 10) / 10         | YES        |
| 4    | secondaryTurns = Math.ceil(secVoltsUsed / secActVTUsed) | YES     |

### Cross-Phase Contamination Check
- The `netAreaVTInput` auto-population (`auto("netAreaVTInput", vtUsed)`) occurs inside
  the Phase 1 code block in app.js. However, this is a DATA FORWARDING action that
  feeds Phase 2 — it is NOT a Phase 1 calculation and is NOT documented here.
  It is correctly owned by Phase 2 (Step 5).

### Execution Order Verified
Steps 1 -> 2 -> 3 -> 4 match the exact sequential execution order in `calculate()`
within `js/app.js`.

### Omission Check
No Phase 1 engineering calculation has been omitted.
