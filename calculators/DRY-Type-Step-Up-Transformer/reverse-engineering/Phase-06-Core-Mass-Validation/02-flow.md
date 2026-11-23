# Phase 06 — Core Mass Validation
## File: 02-flow.md

> **Scope:** Engineering execution flow of Phase 6 (Step 18 only).
> Does NOT repeat formulas. See `01-formulas.md` for exact formula definitions.

---

## Overview

Phase 6 is the shortest engineering phase — a single Step (18) with four sequential
sub-computations. Its output (`coreMass`) is the total transformer core steel mass.

The phase has one unique architectural behavior: two intermediate values
(`actualNetArea` and `framePerimeterCalc`) are written to the DOM for display but
are deliberately NOT read back from the DOM for the mass formula. The JS memory
variables are used directly. This is a verified intentional design in app.js.

---

## Step 18 — Core Frame Perimeter, Net Area & Core Mass

### Sub-stage 18A: Actual Net Core Area (from Phase 2 JS variable)

```
INPUT:
  selectedArea  (JS variable from Phase 2 Step 5 — still in scope)
  finalCoreSf   (from #finalCoreSf, default 0.98)

GUARD:
  If selectedArea null -> actualNetArea = null.

PROCESS:
  actualNetArea = Math.round(selectedArea * finalCoreSf)

  auto("actualNetAreaOutput", actualNetArea)
  [Written to DOM for DISPLAY ONLY — NOT read back for mass formula]
```

### Sub-stage 18B: Auto-Population of Frame Dimension Defaults

```
INPUT:
  tongueWidth  (JS variable from Phase 2)
  stackHeight  (JS variable from Phase 2)

PROCESS:
  auto("coreD",  tongueWidth)   [only if #coreD has not been user-edited]
  auto("coreST", stackHeight)   [only if #coreST has not been user-edited]

  [This provides sensible starting values for two of the four segments]
  [#coreL and #coreA have no auto-population — user must enter them]

  coreD  = g("coreD")
  coreL  = g("coreL")
  coreA  = g("coreA")
  coreST = g("coreST")
```

### Sub-stage 18C: Frame Perimeter

```
INPUT:
  coreD, coreL, coreA, coreST (all from DOM — user values / overrides)

GUARD:
  If ANY of coreD, coreL, coreA, coreST is null -> framePerimeterCalc = null.

PROCESS:
  framePerimeterCalc = (2 * coreD) + (2 * coreL) + (2 * coreA) + (2 * coreST)

  auto("framePerimeterOutput", framePerimeterCalc)
  [Written to DOM for DISPLAY ONLY — NOT read back for mass formula]
```

### Sub-stage 18D: Core Mass

```
INPUT:
  framePerimeterCalc  (JS memory variable from 18C — NOT re-read from DOM)
  actualNetArea       (JS memory variable from 18A — NOT re-read from DOM)
  rhoSteel            (from #rhoSteel, default 7.65)

GUARD:
  If framePerimeterCalc null OR actualNetArea null OR rhoSteel null -> coreMass = null.

PROCESS:
  coreMass = framePerimeterCalc * actualNetArea * rhoSteel * 1e-6

  auto("coreMassOutput", parseFloat(coreMass.toFixed(2)))

OUTPUT:
  -> #actualNetAreaOutput (display — integer, not re-read for coreMass)
  -> #framePerimeterOutput (display — raw float, not re-read for coreMass)
  -> #coreMassOutput (2 decimal places — carries data-cost attributes)
```

---

## Critical Flow Distinction — Memory vs DOM for Intermediates

```
selectedArea (Phase 2 JS var)
    │
    ▼  × finalCoreSf → Math.round → actualNetArea ─────────────────────────┐
                                         │                                  │
                              auto("actualNetAreaOutput", ...)              │
                              [DOM write — display only, NOT read back]     │
                                                                            │
tongueWidth → auto("coreD") ──► coreD (read from DOM) ──┐                  │
                                                         │                  │
             [coreL — user entry] ──────────────────────►│                  │
             [coreA — user entry] ──────────────────────►├─► framePerimeter─┤
stackHeight → auto("coreST") ──► coreST (read from DOM) ─┘      │          │
                                                                  │          │
                              auto("framePerimeterOutput", ...)   │          │
                              [DOM write — display only, NOT read]│          │
                                                                  │          │
                                              framePerimeterCalc ◄┘          │
                                              (JS memory var)                │
                                                              │              │
                                              × actualNetArea ◄──────────────┘
                                              (JS memory var)
                                              × rhoSteel
                                              × 1e-6
                                                   │
                                                   ▼
                                              coreMass
                                                   │
                                         auto("coreMassOutput", ...)
                                         [DOM write — user may override]
```

---

## Final Outputs of Phase 6

| Output Field             | Value                        | DOM Writable | Consumed By         |
|--------------------------|------------------------------|--------------|---------------------|
| `#actualNetAreaOutput`   | Net core area (mm², integer) | Display only | Not re-read         |
| `#framePerimeterOutput`  | Frame perimeter (mm)         | Display only | Not re-read         |
| `#coreMassOutput`        | Core steel mass (kg)         | User-override| Phase 7 cost module |

---

## End of calculate() — Summary Modal & Modal SVG (Non-Engineering)

After Step 18, the remainder of `calculate()` (lines 583–637) populates the summary
modal display with formatted strings from existing computed values. This includes:

- Conductor material display (`#sumMaterial`)
- Primary/secondary voltages, VA (`#sumPriVolts`, `#sumSecVolts`, `#sumVA`)
- Core area summary (`#sumCore`)
- Primary winding details (`#sumPriDetails`) — formatted for round or flat wire
- Secondary winding details (`#sumSecDetails`) — formatted for round or flat wire
- Core mass (`#sumCoreWt`), bobbin weight (`#sumBobbinWt`), clamp weight (`#sumClampWt`)
- Modal SVG label updates (`#modal_svg_a/b/c/d/h`) — same values as inline SVG

**None of these perform any engineering calculation.** All values are read from
DOM fields that were already written by Phases 1–6. The summary modal is a
presentation layer only.

The modal SVG updates are documented in:
`Phase-04-Mechanical-Hardware-Clamps-and-Bobbins/06-svg.md`
