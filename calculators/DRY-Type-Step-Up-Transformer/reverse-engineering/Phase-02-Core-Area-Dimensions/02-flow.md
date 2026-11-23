# Phase 02 — Core Area Dimensions
## File: 02-flow.md

> **Scope:** Engineering execution flow of Phase 2.
> Does NOT repeat formulas. See `01-formulas.md` for exact formula definitions.

---

## Overview

Phase 2 receives the baseline Volts Per Turn from Phase 1 and computes
two independent but related engineering outputs:
1. The minimum net magnetic cross-sectional area the iron core must provide.
2. The actual physical area of the user-selected core dimensions, compared
   against the required gross area (net area inflated by stacking factor).

Phase 2 has two parallel output streams: one for the required area (computed)
and one for the selected area (user-driven physical choice). Both outputs flow
downstream into Phase 3 and Phase 6.

---

## Step-by-Step Execution Flow

### Step 5 — Net Core Area

```
INPUT:
  netAreaVTInput  (from #netAreaVTInput — auto-populated from Phase 1 vtUsed, or user-overridden)
  fluxDensity     (from #fluxDensity — default: 1 Tesla)
  frequency       (from #frequency — default: 50 Hz)

GUARD:
  If netAreaVTInput OR fluxDensity OR frequency is null/falsy -> netArea = null
  Both output fields remain blank. Step 6 netAreaInput also remains blank.

PROCESS:
  netArea = (netAreaVTInput * 1,000,000) / (4.44 * fluxDensity * frequency)

ROUNDING:
  netArea_rounded = Math.round(netArea)    [nearest integer mm²]

OUTPUT:
  -> #netAreaOutput   (Math.round(netArea) — display and override field)
  -> #netAreaInput    (Math.round(netArea) — separately auto-populated feed to Step 6)
```

---

### Step 6 — Gross Core Area & Selection

Step 6 contains TWO independent sub-calculations that execute sequentially.

#### Sub-calculation A: Gross Required Area

```
INPUT:
  netAreaUsed    (from #netAreaInput — auto-populated from Step 5, or user-overridden)
  stackingFactor (from #stackingFactor — default: 0.9)

GUARD A:
  If netAreaUsed is null OR stackingFactor is null/falsy -> grossArea = null
  #grossArea remains blank.

PROCESS:
  grossArea = netAreaUsed / stackingFactor

ROUNDING:
  grossArea_rounded = Math.round(grossArea)

OUTPUT:
  -> #grossArea   (Math.round(grossArea) — display and override field)
```

#### Sub-calculation B: Selected Core Physical Area

```
INPUT:
  tongueWidth  (from #tongueWidth — user entry, no default)
  stackHeight  (from #stackHeight — user entry, no default)

GUARD B:
  If tongueWidth is null OR stackHeight is null -> selectedArea = null
  #selectedArea remains blank.

PROCESS:
  selectedArea = tongueWidth * stackHeight

ROUNDING:
  NO rounding applied — raw product written directly.

OUTPUT:
  -> #selectedArea   (raw float — display and override field)
```

**Important:** Guards A and B are fully independent. One can succeed while the other
fails. The `#calc6` display trace only renders when BOTH grossArea and selectedArea
are non-null.

---

## Cross-Step Dependency Map

```
Phase 1 (vtUsed) ──auto-forward──> #netAreaVTInput ──> Step 5
                                                             |
                              fluxDensity (default: 1) ─────┤
                              frequency  (default: 50) ─────┤
                                                             |
                                                    netArea (Math.round)
                                                             |
                                        -> #netAreaOutput (display)
                                        -> #netAreaInput  ──────────> Step 6 Sub-A
                                                                            |
                                        stackingFactor (default: 0.9) ─────┤
                                                                            |
                                                              grossArea (Math.round)
                                                                            |
                                                            -> #grossArea (display)

tongueWidth (user) ─────────────────────────────────> Step 6 Sub-B
stackHeight (user) ─────────────────────────────────>       |
                                                             |
                                                    selectedArea (no rounding)
                                                             |
                                           -> #selectedArea (display)
```

---

## Override Behavior Impact on Flow

Following the same override system as Phase 1 (see Phase 01 `02-flow.md`):

- If `#netAreaVTInput` is overridden: Step 5 uses the overridden V/T, ignoring Phase 1.
- If `#netAreaOutput` is overridden: the overridden value does NOT flow to `#netAreaInput`.
  `#netAreaInput` is auto-populated from the computed `netArea` variable, not from
  `#netAreaOutput`. Both fields derive from the same in-memory `netArea` value via
  separate `auto()` calls.
- If `#netAreaInput` is overridden: Step 6 uses the overridden net area for grossArea.
- If `#grossArea` is overridden: the override is preserved until an upstream change triggers cascade.
- If `#selectedArea` is overridden: the override is preserved similarly.

**Fields in baseConstants relevant to Phase 2:**
- `stackingFactor`, `tongueWidth`, `stackHeight`, `fluxDensity`, `frequency` —
  all are in `baseConstants`. They are NEVER cleared by cascade reset.

---

## Final Outputs of Phase 2 (Consumed by Later Phases)

| Output Field       | Value Produced                | Consumed By                         |
|--------------------|-------------------------------|-------------------------------------|
| `#netAreaOutput`   | Net Core Area (mm²)           | Display only (not read back)         |
| `#netAreaInput`    | Net Core Area feed value      | Phase 2 Step 6 Sub-A (`netAreaUsed`)|
| `#grossArea`       | Required Gross Area (mm²)     | Display / comparison only            |
| `#selectedArea`    | Actual physical area (mm²)    | Phase 6 Step 18 (`selectedArea`)     |
| `tongueWidth`      | Tongue width (mm)             | Phase 3 Step 10, Phase 4 Steps 11–13|
| `stackHeight`      | Stack height (mm)             | Phase 3 Step 10, Phase 4 Step 13    |

Note: `tongueWidth` and `stackHeight` are user inputs first read in Phase 2 Step 6,
but they propagate throughout multiple downstream phases. They are NOT outputs of
Phase 2 — they are user constants that Phase 2 first consumes.
