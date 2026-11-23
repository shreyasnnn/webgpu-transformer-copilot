# Phase 04 — Mechanical Hardware (Clamps & Bobbins)
## File: 02-flow.md

> **Scope:** Engineering execution flow of Phase 4.
> Does NOT repeat formulas. See `01-formulas.md` for exact formula definitions.

---

## Overview

Phase 4 receives outputs from Phases 2 and 3 and computes all mechanical hardware
dimensions and masses. The phase has three sequential engineering streams:
1. **Steps 11–12:** L-clamp geometry and mass.
2. **Step 13:** Bobbin cavity dimensions + live SVG blueprint label updates.
3. **Step 14:** Bobbin mass calculation using Step 13 intermediate JS variables.

An important architectural detail: the bobbin intermediate variables (`bobbinInnerW`,
`bobbinInnerL`, `bobbinOuterW`, `bobbinOuterL`) computed in Step 13 are NOT written
to the DOM as calculation fields. They exist only in JS memory and are used directly
by Step 14 within the same `calculate()` invocation.

---

## Step-by-Step Execution Flow

### Step 11 — L-Clamp Span & Length

```
INPUT:
  tbobbinClamp    (from #tbobbinClamp, default 3.5)
  priRadUsed      (from #priRadialOutput — Phase 3 Step 9 output)
  extraSpaceClamp (from #extraSpaceClamp, default 9)
  centerGapClamp  (from #centerGapClamp, default 10)
  tongueWidth     (from #tongueWidth — Phase 2 user input)

GUARD:
  If priRadUsed is null -> aClamp = null, clampLen = null.
  If tongueWidth is null -> clampLen = null.

PROCESS:
  aClamp = (2*tbobbinClamp) + (2*priRadUsed) + (2*extraSpaceClamp) + centerGapClamp
  auto("aClampOutput", aClamp)    [no rounding]

  aClampUsed = g("aClampOutput")  [read-back — respects overrides]

  clampLen = tongueWidth + aClampUsed + tongueWidth
  auto("clampLenOutput", clampLen) [no rounding]

OUTPUT:
  -> #aClampOutput   (raw value, no rounding)
  -> #clampLenOutput (raw value, no rounding)
```

---

### Step 12 — L-Clamp Weight

```
INPUT:
  tongueWidth    (from #tongueWidth)
  bendingDed     (from #bendingDeduction, default 10)
  msThick        (from #msThickness, default 3)
  rhoMS          (from #rhoMS, default 7.85)
  clampQty       (from #clampQty, default 4)
  clampLenUsed   (from #clampLenOutput — Step 11 output)

GUARD:
  clampWidth guard: tongueWidth must be non-null.
  wClampPer guard: clampLenUsed AND clampWidthUsed both non-null.

PROCESS:
  clampWidth   = tongueWidth + (tongueWidth - bendingDed)
  auto("clampWidthOutput", clampWidth)   [no rounding]
  clampWidthUsed = g("clampWidthOutput") [read-back]

  wClampPer    = clampLenUsed * clampWidthUsed * msThick * rhoMS * 1e-6
  totalClampWt = wClampPer * clampQty
  auto("totalClampWtOutput", parseFloat(totalClampWt.toFixed(2)))

OUTPUT:
  -> #clampWidthOutput    (raw value, no rounding)
  -> #totalClampWtOutput  (2 decimal places; carries data-cost attributes)
```

---

### Step 13 — Bobbin Dimensions + SVG Label Updates

Step 13 has three sub-stages: A) compute inner dimensions, B) compute outer clearance,
C) compute outer dimensions + update SVG labels.

#### Sub-stage A: Inner Dimensions
```
INPUT:
  tongueWidth   (from #tongueWidth)
  stackHeight   (from #stackHeight)
  coreGapBobbin (from #coreGapBobbin, default 2)

PROCESS:
  bobbinInnerW = tongueWidth + coreGapBobbin
  bobbinInnerL = stackHeight              [direct assignment, no arithmetic]
```

#### Sub-stage B: Outer Clearance
```
INPUT:
  priRadUsed       (from #priRadialOutput)
  tapeBufferBobbin (from #tapeBufferBobbin, default 10)

PROCESS:
  bobbinOuterClear = priRadUsed + tapeBufferBobbin
  auto("bobbinOuterClearOutput", bobbinOuterClear)  [no rounding]
  bobbinOuterClearUsed = g("bobbinOuterClearOutput") [read-back]
```

#### Sub-stage C: Outer Dimensions + SVG Updates
```
INPUT:
  bobbinInnerW, bobbinInnerL, bobbinOuterClearUsed (from above)
  bobbinHeightPri (from #bobbinHeightPri — Phase 3 user input)

PROCESS:
  bobbinOuterW = bobbinInnerW + (2 * bobbinOuterClearUsed)
  bobbinOuterL = bobbinInnerL + (2 * bobbinOuterClearUsed)

  [Inline SVG text label updates]
  IF bobbinInnerW non-null:  #svg_a.textContent = `a = ${bobbinInnerW}`
  ELSE:                      #svg_a.textContent = "a = --"
  IF bobbinOuterW non-null:  #svg_b.textContent = `b = ${bobbinOuterW}`
  ELSE:                      #svg_b.textContent = "b = --"
  IF bobbinInnerL non-null:  #svg_c.textContent = `c = ${bobbinInnerL}`
  ELSE:                      #svg_c.textContent = "c = --"
  IF bobbinOuterL non-null:  #svg_d.textContent = `d = ${bobbinOuterL}`
  ELSE:                      #svg_d.textContent = "d = --"
  IF bobbinHeightPri non-null: #svg_h.textContent = `h = ${bobbinHeightPri}`
  ELSE:                        #svg_h.textContent = "h = --"

OUTPUT:
  -> #bobbinOuterClearOutput (raw value)
  -> #svg_a, #svg_b, #svg_c, #svg_d, #svg_h (SVG label text content)

INTERMEDIATE JS VARIABLES (not written to DOM as editable fields):
  bobbinInnerW, bobbinInnerL, bobbinOuterW, bobbinOuterL
  [used directly by Step 14]
```

---

### Step 14 — Bobbin Weight

```
INPUT:
  bobbinOuterW, bobbinOuterL, bobbinInnerW, bobbinInnerL (JS variables from Step 13)
  bobbinHeightPri (from #bobbinHeightPri)
  tbobbinMat      (from #tbobbinMat, default 3)
  rhoBobbin       (from #rhoBobbin, default 2.20)
  limbsCount      (from #limbsCount — Phase 3 user input)

GUARD (per component):
  aFlange guard: all four inner/outer dimensions non-null.
  wFlange guard: aFlange non-null.
  wWallLong guard: bobbinInnerL AND bobbinHeightPri non-null.
  wWallShort guard: bobbinInnerW AND bobbinHeightPri non-null.
  wSingleBobbin guard: all three component weights non-null.

PROCESS:
  aFlange       = (bobbinOuterW * bobbinOuterL) - (bobbinInnerW * bobbinInnerL)
  wFlange       = aFlange * tbobbinMat * rhoBobbin * 1e-6
  wWallLong     = bobbinInnerL * bobbinHeightPri * tbobbinMat * rhoBobbin * 1e-6
  wWallShort    = bobbinInnerW * bobbinHeightPri * tbobbinMat * rhoBobbin * 1e-6
  wSingleBobbin = (2 * wFlange) + (2 * wWallLong) + (2 * wWallShort)
  totalBobbinWt = wSingleBobbin * limbsCount

  auto("flangeWtOutput", parseFloat(wFlange.toFixed(3)))   [readonly display]
  auto("wallWtOutput",   `${wWallLong.toFixed(3)} / ${wWallShort.toFixed(3)}`) [readonly display]
  auto("totalBobbinWtOutput", parseFloat(totalBobbinWt.toFixed(2)))

OUTPUT:
  -> #flangeWtOutput      (3 decimal places — readonly, not user-editable)
  -> #wallWtOutput        (string "L.LLL / S.SSS" — readonly, not user-editable)
  -> #totalBobbinWtOutput (2 decimal places — user-overridable; carries data-cost attributes)
```

---

### Modal SVG Label Updates (End of calculate())

After all 18 steps complete, the end of `calculate()` updates the summary modal SVGs:
```
PROCESS:
  IF bobbinInnerW non-null:  #modal_svg_a.textContent = `a = ${bobbinInnerW}`
  ELSE:                      #modal_svg_a.textContent = "a = --"
  ...same logic for b, c, d, h...

  (bobbinInnerW, bobbinOuterW, bobbinInnerL, bobbinOuterL, bobbinHeightPri)
  are still in JS scope from Step 13 within the same calculate() call.
```

---

## Cross-Step Dependency Map

```
Phase 3 priRadUsed ─────────────────────────> Step 11 (aClamp) ──────> Step 12 (via clampLenUsed)
Phase 2 tongueWidth ─────────────────────────> Step 11 (clampLen), Step 12, Step 13
Phase 2 stackHeight ─────────────────────────> Step 13 (bobbinInnerL), Step 14
Phase 3 bobbinHeightPri ─────────────────────> Step 13 (SVG label), Step 14

Step 11 aClampOutput (aClampUsed) ──────────> Step 11B (clampLen)
Step 11 clampLenOutput (clampLenUsed) ──────> Step 12 (wClampPer)
Step 12 clampWidthOutput (clampWidthUsed) ──> Step 12 (wClampPer)
Step 13 bobbinOuterClearOutput (used) ──────> Step 13D, 13E

Step 13 JS vars ─────────────────────────────> Step 14 (all bobbin components)
                |
                └──> SVG labels (inline #svg_a/b/c/d/h)
                └──> Modal SVG (#modal_svg_a/b/c/d/h) at end of calculate()
```

---

## Final Outputs of Phase 4

| Output Field              | Value                        | Consumed By                     |
|---------------------------|------------------------------|---------------------------------|
| `#aClampOutput`           | Clamp span (mm)              | Step 11B (clampLen)             |
| `#clampLenOutput`         | Clamp plate length (mm)      | Step 12 (weight calc)           |
| `#clampWidthOutput`       | Clamp plate width (mm)       | Step 12 (weight calc)           |
| `#totalClampWtOutput`     | Total clamp weight (kg)      | Phase 7 cost module             |
| `#bobbinOuterClearOutput` | Bobbin outer clearance (mm)  | Step 13D, 13E                   |
| `#svg_a/b/c/d/h`          | Inline SVG label texts       | UI display                      |
| `#modal_svg_a/b/c/d/h`    | Modal SVG label texts        | UI Summary Modal                |
| `#flangeWtOutput`         | Single flange weight (kg)    | Display only — readonly         |
| `#wallWtOutput`           | Wall weights string          | Display only — readonly         |
| `#totalBobbinWtOutput`    | Total bobbin weight (kg)     | Phase 7 cost module             |
