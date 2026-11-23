# Phase 05 — Secondary Winding Design
## File: 02-flow.md

> **Scope:** Engineering execution flow of Phase 5.
> Does NOT repeat formulas. See `01-formulas.md` for exact formula definitions.

---

## Overview

Phase 5 mirrors Phase 3 (Primary Winding Design) in structure. It has the same
binary wire-type branch (round vs. flat), the same SWG lookup mechanism, and the
same three-stage structure (conductor sizing → turns/layers → LMT/weight).

**Key differences from Phase 3:**
1. **No iPri derivation:** Secondary current (`iSecInputCalc`) is read directly
   from `#iSecInput` — the same Phase 1 user input field. No VA/voltage division.
2. **Separate bobbin height:** Uses `bobbinHeightSec` (a separate field from
   `bobbinHeightPri`). The flange deduction `bobbinFlange` is shared.
3. **Insulation default:** `secInsAddition` defaults to `0.01` mm (not `0.1` mm
   like `priInsAddition`).
4. **LMT uses innerW/innerL directly:** The secondary LMT is computed using
   `innerW` and `innerL` from Phase 3 — NOT from priOuterW/priOuterL. This is
   the exact behavior in app.js (lines 524–526).

---

## Step-by-Step Execution Flow

### Step 15 — Secondary Conductor Sizing

```
INPUT:
  iSecInputCalc = g("iSecInput")   [direct read of Phase 1 secondary current field]
  delta          (from #delta, default 2.5 — shared with Phase 3)

GUARD:
  If iSecInputCalc null OR delta null -> aSec = null, chain fails.
  If aSec < 0 -> bareDiaSec = null.

PROCESS:
  aSec       = iSecInputCalc / delta
  bareDiaSec = SQRT((aSec * 4) / PI)
  auto("secBareDiaOutput", parseFloat(bareDiaSec.toFixed(2)))
```

#### SWG Lookup & Wire Section Visibility
```
IF iSecInputCalc non-null:
    secSWG = getSWGForCurrent(iSecInputCalc)
    Write "X SWG" to #secSwgOutput

    IF parseInt(secSWG) <= 13:
        SHOW #secFlatWireSection
        Write generateStripSuggestions(aSec) to #secStripSuggestions
    ELSE:
        HIDE #secFlatWireSection
        Force #secWireTypeRound checked = true
ELSE:
    Write "" to #secSwgOutput
    HIDE #secFlatWireSection
```

#### Wire type branch
```
isSecFlat = (#secWireTypeFlat radio).checked
IF isSecFlat: SHOW #secFlatInputs div
ELSE:         HIDE #secFlatInputs div
```

#### Flat Wire Branch (only when isSecFlat = true)
```
INPUT:
  secFlatBreadth (from #secFlatBreadth)
  secFlatHeight  (from #secFlatHeight)
  secParallel    (from #secParallel, default 1)

IF both non-null:
    enteredArea_sec    = secFlatBreadth * secFlatHeight
    secEffectiveHeight = secFlatHeight * secParallel
    secEffectiveArea   = secFlatBreadth * secEffectiveHeight

    Write to #secEnteredAreaOutput, #secEffectiveHeightOutput, #secFlatAreaOutput (all .toFixed(2))

    Warning: IF |secEffectiveArea - aSec| / aSec > 0.1: SHOW #secFlatWarning
             ELSE: HIDE #secFlatWarning
ELSE:
    Clear outputs, HIDE warning
```

#### Round wire diameter (always executed)
```
secBareDiaUsed = g("secBareDiaOutput")   [read-back after write]
secBareStd     = Math.floor(secBareDiaUsed * 10) / 10   [truncate to 1 decimal]
secInsAdd      = g("secInsAddition") || 0.01             [NOTE: 0.01, not 0.1]
secInsDia      = secBareDiaUsed + secInsAdd
auto("secInsDiaInput", parseFloat(secInsDia.toFixed(2)))
insDiaSecUsed  = g("secInsDiaInput")
```

---

### Step 16 — Secondary Turns Per Limb, TPL, Layers & Radial Thickness

```
INPUT:
  secTurnsUsed   (from #secondaryTurns — Phase 1 Step 4 output)
  limbsCount     (from #limbsCount, default 2)
  bobbinHeightSec (from #bobbinHeightSec — SEPARATE from bobbinHeightPri)
  bobbinFlange   (from #bobbinFlange, default 7 — shared with Phase 3)
  secSafetyMargin (from #secSafetyMargin, default 0)
  isSecFlat      (wire type flag)
  insDiaSecUsed  (round path)
  secFlatBreadth (flat path)
  secEffectiveHeight (JS var from Step 15 flat path)
  paperThickness  (from #paperThickness, shared with Phase 3)
  secPaperLayers  (from #secPaperLayers, default 4)

PROCESS:
  secTurnsLimb  = Math.ceil(secTurnsUsed / limbsCount)
  auto("secTurnsLimbOutput", secTurnsLimb)
  secTurnsLimbUsed = g("secTurnsLimbOutput")

  secWindingLen = bobbinHeightSec - bobbinFlange

  IF isSecFlat AND secWindingLen non-null AND secFlatBreadth non-null:
      secTPL = Math.floor(secWindingLen / secFlatBreadth) - secSafetyMargin
  ELSE IF NOT isSecFlat AND secWindingLen non-null AND insDiaSecUsed non-null:
      secTPL = Math.floor(secWindingLen / insDiaSecUsed) - secSafetyMargin
  ELSE:
      secTPL = null

  auto("secTplOutput", secTPL)
  secTPLUsed = g("secTplOutput")

  secLayers = Math.ceil(secTurnsLimbUsed / secTPLUsed)
  auto("secLayersOutput", secLayers)
  secLayersUsed = g("secLayersOutput")

  [Radial build — within same Step 16 block in app.js]:
  IF isSecFlat AND secEffectiveHeight non-null AND secLayersUsed non-null:
      secRadBuild = (secEffectiveHeight * secLayersUsed) + (paperThickness * secPaperLayers)
  ELSE IF NOT isSecFlat AND insDiaSecUsed non-null AND secLayersUsed non-null:
      secRadBuild = (insDiaSecUsed * secLayersUsed) + (paperThickness * secPaperLayers)
  ELSE:
      secRadBuild = null

  auto("secRadialOutput", Math.ceil(secRadBuild))
  secRadUsed = g("secRadialOutput")

OUTPUT:
  -> #secTurnsLimbOutput
  -> #secTplOutput
  -> #secLayersOutput
  -> #secRadialOutput
```

**Note on app.js structure:** In app.js, the radial build (Steps 16E/F in this doc) is
coded in the same comment block as Step 16 — it is NOT a separate `// STEP 17` block.
The `// STEP 17` in app.js begins at the LMT calculation. Steps 16 and radial build
share one code block. This documentation groups radial build with Step 16 to match
its logical dependency chain.

---

### Step 17 — Secondary LMT and Conductor Weight

```
INPUT:
  innerW      (JS variable from Phase 3 Step 10 — still in scope in same calculate() call)
  innerL      (JS variable from Phase 3 Step 10 — still in scope)
  secRadUsed  (from #secRadialOutput — Step 16 output)
  insDiaSecUsed (from #secInsDiaInput — Step 15 output)
  secTurnsLimbUsed (from #secTurnsLimbOutput — Step 16 output)
  limbsCount  (from #limbsCount)
  rhoCu       (from #rhoCu — conductor density, Phase 3 shared input)

GUARD:
  secOuterW guard: innerW AND secRadUsed non-null
  secOuterL guard: innerL AND secRadUsed non-null
  secLMT guard: innerW, innerL, secOuterW, secOuterL all non-null
  secActualArea guard: insDiaSecUsed non-null
  secWeight guard: all of secLMTUsed, secTurnsLimbUsed, limbsCount, secActualArea, rhoCu non-null

PROCESS:
  secOuterW    = innerW + (2 * secRadUsed)
  secOuterL    = innerL + (2 * secRadUsed)
  secLMT       = (innerW + secOuterW + innerL + secOuterL) / 1000

  auto("secLmtOutput", parseFloat(secLMT.toFixed(3)))
  secLMTUsed   = g("secLmtOutput")

  secActualArea = (PI * insDiaSecUsed^2) / 4
  secWeight     = secLMTUsed * secTurnsLimbUsed * limbsCount * secActualArea * rhoCu * 1e-3

  auto("secWeightOutput", parseFloat(secWeight.toFixed(2)))

OUTPUT:
  -> #secLmtOutput
  -> #secWeightOutput (carries data-cost attributes for Phase 7)
```

---

## Cross-Step Dependency Map

```
Phase 1 #iSecInput ─────────── g("iSecInput") ──> Step 15 (aSec, bareDiaSec)
Phase 3 delta ─────────────────────────────────────────────────────>
                                                          |
              Step 15 -> bareDiaSec, secBareStd, secInsDia -> insDiaSecUsed
              Step 15 -> secEffectiveHeight (flat, JS var)
                                                          |
Phase 1 #secondaryTurns (secTurnsUsed) ────────────> Step 16
                                                          |
              bobbinHeightSec (user) ──────────────> secWindingLen
              bobbinFlange (Phase 3) ──────────────>
              insDiaSecUsed / secFlatBreadth ──────> secTPL -> secLayers -> secRadBuild
                                                                                   |
                                              secRadUsed <──────────────────────────
                                                          |
Phase 3 innerW (JS var) ───────────────────────────> Step 17
Phase 3 innerL (JS var) ───────────────────────────>      |
              secRadUsed ──────────────────────────>      |
              insDiaSecUsed ──────────────────────>       |
              secTurnsLimbUsed, limbsCount, rhoCu ──>     |
                                              secLMT, secWeight <──────────────────
```

---

## Final Outputs of Phase 5

| Output Field            | Value                          | Consumed By                  |
|-------------------------|--------------------------------|------------------------------|
| `#secSwgOutput`         | SWG recommendation string      | Display / Summary modal      |
| `#secBareDiaOutput`     | Target bare diameter (mm)      | Step 15D (read-back)         |
| `#secInsDiaInput`       | Insulated diameter (mm)        | Steps 16C, 17D (active input)|
| `#secTurnsLimbOutput`   | Turns per limb                 | Step 17E                     |
| `#secTplOutput`         | Turns per layer                | Step 16D                     |
| `#secLayersOutput`      | Layer count                    | Steps 16E/F (radial build)   |
| `#secRadialOutput`      | Radial thickness (mm)          | Phase 6 Step 18              |
| `#secLmtOutput`         | Secondary LMT (m)              | Step 17E (weight)            |
| `#secWeightOutput`      | Secondary weight (kg)          | Phase 7 cost module          |
