# Phase 01 — Capacity & Electrical Turns
## File: 02-flow.md

> **Scope:** This document describes the engineering execution flow of Phase 1.
> It does NOT repeat formulas. See `01-formulas.md` for exact formula definitions.

---

## Overview

Phase 1 is the entry point of the entire calculation pipeline. It takes the two
primary user-supplied electrical specifications (Secondary Voltage and Secondary
Current) and produces four fundamental outputs that every downstream phase depends on:
- Total Apparent Power (VA and kVA)
- Baseline Volts Per Turn (V/T)
- Primary Turns (integer)
- Actual Volts Per Turn (derived from ceiled primary turns)
- Secondary Turns (integer)

---

## Step-by-Step Execution Flow

### Step 1 — Total VA & kVA Capacity

```
INPUT:
  vSecInput  (from #vSecInput — user entry)
  iSecInput  (from #iSecInput — user entry)

GUARD:
  If either vSecInput or iSecInput is null -> VA = null, kVA = null
  All downstream steps that depend on VA/kVA remain blank.

PROCESS:
  VA   = vSecInput x iSecInput
  kVA  = VA / 1000

OUTPUT:
  -> #vaOutput    (VA, 2 decimal display)
  -> #kvaOutput   (kVA, 3 decimal display)
  -> #kvaInput    (kVA, 3 decimal — fed into Step 2)
```

**Decision Branch:**
- If guard fails (null inputs): VA and kVA are null. The auto() function writes
  empty string to all output fields. All subsequent steps also produce null.

---

### Step 2 — Volts Per Turn (Baseline V/T)

```
INPUT:
  k          (from #k — user entry, default 0.8)
  kvaInput   (from #kvaInput — auto-populated from Step 1, or user-overridden)

GUARD:
  If k is null OR kvaInput is null OR kvaInput < 0 -> rawVt = null, vt = null

PROCESS:
  rawVt = k x SQRT(kvaInput)
  vt    = Math.floor(rawVt x 10) / 10       [truncate to 1 decimal]

OUTPUT:
  -> #vt         (vt — baseline V/T, truncated)
  -> #vtInput    (vt — fed into Step 3, separately overridable)
```

**Decision Branch:**
- If kvaInput is overridden by the user in #kvaInput, this step uses the overridden
  value rather than the Step 1 computed value.
- The truncation rule always applies regardless of the raw value.

**Data Forward (not a calculation):**
- `auto("netAreaVTInput", vtUsed)` is called here in app.js to seed Phase 2 Step 5.
  This is a data forwarding action owned by Phase 2, not a Phase 1 calculation.

---

### Step 3 — Primary Turns & Actual Volts Per Turn

```
INPUT:
  primaryVoltage  (from #primaryVoltage — user entry)
  vtUsed          (from #vtInput — auto-populated from Step 2, or user-overridden)

GUARD:
  If primaryVoltage is null OR vtUsed is null/falsy -> all Step 3 outputs remain blank

PROCESS:
  primaryTurns_raw = primaryVoltage / vtUsed
  primaryTurns     = Math.ceil(primaryTurns_raw)       [always integer, always up]
  rawActualVT      = primaryVoltage / primaryTurns
  actualVT         = Math.floor(rawActualVT x 10) / 10 [truncate to 1 decimal]

OUTPUT:
  -> #primaryTurns    (ceiled integer)
  -> #actualVT        (truncated actual V/T)
  -> #actualVTInput   (actualVT — fed into Step 4, separately overridable)

DATA FORWARD (not calculations):
  -> #secondaryVoltage  auto-populated with vSecInput (from Step 1)
  -> #actualVTInput     auto-populated with actualVT
```

**Decision Branch:**
- If `#vtInput` is manually overridden by the user, this step uses the overridden V/T,
  NOT the Step 2 output. The override is locked by `dataset.edited`.
- If `#primaryTurns` is manually overridden, the override persists and is used directly
  by downstream steps without triggering recalculation of actualVT.
  NOTE: If primaryTurns is overridden, actualVT is still recalculated from the
  overridden value because actualVT reads `g("primaryTurns")` which respects the override.

---

### Step 4 — Secondary Turns

```
INPUT:
  secVoltsUsed   (from #secondaryVoltage — auto-populated from vSecInput, or overridden)
  secActVTUsed   (from #actualVTInput — auto-populated from actualVT, or overridden)

GUARD:
  If secVoltsUsed is null OR secActVTUsed is null/falsy -> secondaryTurns remains blank

PROCESS:
  secondaryTurns_raw = secVoltsUsed / secActVTUsed
  secondaryTurns     = Math.ceil(secondaryTurns_raw)   [always integer, always up]

OUTPUT:
  -> #secondaryTurns  (ceiled integer)
```

**Decision Branch:**
- Either or both input fields can be independently overridden by the user.
  If overridden, the overridden values are used directly.

---

## Cross-Step Dependency Map

```
vSecInput ──────────────────────────────────────────────────────> Step 4 (#secondaryVoltage)
    |
    v
Step 1 ──> VA, kVA ──> #kvaInput ──> Step 2 ──> vt ──> #vtInput ──> Step 3
                                                                          |
primaryVoltage ──────────────────────────────────────────────────> Step 3
                                                                          |
                                          primaryTurns, actualVT <────────
                                                    |
                                          #actualVTInput ──────────> Step 4
                                                                          |
                                                            secondaryTurns <────
```

---

## Override Behavior Impact on Flow

The project uses an "editable override" system. Any output field marked with
`dataset.edited = "1"` will NOT be overwritten by `auto()` on subsequent recalculations.

This means:
- If `#kvaInput` is overridden: Step 2 uses overridden kVA, Step 1 output is ignored.
- If `#vt` is overridden: `#vtInput` still gets auto-populated unless it too is overridden.
- If `#vtInput` is overridden: Step 3 uses the overridden V/T, independent of `#vt`.
- If `#primaryTurns` is overridden: Step 3 uses overridden turns count for actualVT.
- If `#actualVT` is overridden: `#actualVTInput` still gets auto-populated from it.
- If `#actualVTInput` is overridden: Step 4 uses overridden value independently.
- If `#secondaryVoltage` is overridden: Step 4 uses overridden voltage.
- If `#secondaryTurns` is overridden: the override value is used by downstream phases.

**Cascade Reset Rule:**
When any upstream input is changed by the user (trusted event), the cascade reset
mechanism deletes `dataset.edited` from all downstream fields that are NOT in the
`baseConstants` list. This forces downstream calculated fields to recalculate fresh.

Fields in `baseConstants` relevant to Phase 1:
- `vSecInput`, `iSecInput`, `k`, `primaryVoltage` — these are NEVER cleared by cascade.

---

## Final Outputs of Phase 1 (Consumed by Later Phases)

| Output Field       | Value Produced        | Consumed By        |
|--------------------|-----------------------|--------------------|
| `#vaOutput`        | VA (apparent power)   | Phase 3 (Step 7)   |
| `#kvaOutput`       | kVA                   | (display only)     |
| `#kvaInput`        | kVA for Step 2        | Phase 1 Step 2     |
| `#vt`              | Baseline V/T          | (display only)     |
| `#vtInput`         | V/T for Step 3        | Phase 1 Step 3     |
| `#netAreaVTInput`  | V/T for core calc     | Phase 2 (Step 5)   |
| `#primaryTurns`    | Primary turn count    | Phase 3 (Step 8)   |
| `#actualVT`        | Actual V/T            | (display only)     |
| `#actualVTInput`   | Actual V/T for Step 4 | Phase 1 Step 4     |
| `#secondaryVoltage`| Secondary voltage     | Phase 1 Step 4     |
| `#secondaryTurns`  | Secondary turn count  | Phase 5 (Step 16)  |
