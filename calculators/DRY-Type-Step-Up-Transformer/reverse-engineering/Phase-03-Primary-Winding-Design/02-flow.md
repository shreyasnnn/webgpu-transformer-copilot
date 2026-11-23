# Phase 03 — Primary Winding Design
## File: 02-flow.md

> **Scope:** Engineering execution flow of Phase 3.
> Does NOT repeat formulas. See `01-formulas.md` for exact formula definitions.

---

## Overview

Phase 3 is the most computation-intensive phase. It contains a major binary branch
(round wire vs. flat/strip wire) that diverges at Step 7 and propagates through
Steps 8 and 9. The choice of wire type is determined automatically by the SWG
lookup result (SWG <= 13 triggers the flat wire option) and by the user's radio
button selection. All paths converge at Step 10 for LMT and weight calculation.

---

## Step-by-Step Execution Flow

### Step 7 — Primary Conductor Sizing

#### Phase entry data-forwards (executed before Step 7 formulas)
```
auto("vaConductorInput",   va)             [Phase 1 VA -> #vaConductorInput]
auto("vPriConductorInput", primaryVoltage) [Phase 1 V_pri -> #vPriConductorInput]
```
These are data-forwarding actions. Phase 3 reads from these fields.

#### Core computation
```
INPUT:
  vaOutput  (from #vaConductorInput)
  vPriUsed  (from #vPriConductorInput)
  delta     (from #delta, default 2.5)

GUARD:
  If vaOutput or vPriUsed null -> iPri = null, all Step 7 outputs blank.
  If delta null -> priArea = null.

PROCESS:
  iPri    = vaOutput / vPriUsed
  priArea = iPri / delta
```

#### SWG Lookup & Wire Section Visibility Decision
```
IF iPri is non-null:
    priSWG = getSWGForCurrent(iPri)    [lookup in swgTable]
    Write "X SWG" to #priSwgOutput

    IF parseInt(priSWG) <= 13:
        SHOW #priFlatWireSection
        Write generateStripSuggestions(priArea) to #priStripSuggestions
    ELSE:
        HIDE #priFlatWireSection
        Force #priWireTypeRound checked = true
ELSE:
    Write "" to #priSwgOutput
    HIDE #priFlatWireSection
```

#### Wire type branch detection
```
isPriFlat = (#priWireTypeFlat radio).checked

IF isPriFlat:
    SHOW #priFlatInputs div
ELSE:
    HIDE #priFlatInputs div
```

#### Flat Wire Branch (only when isPriFlat = true)
```
INPUT:
  priFlatBreadth  (from #priFlatBreadth)
  priFlatHeight   (from #priFlatHeight)
  priParallel     (from #priParallel, default 1)

IF priFlatBreadth AND priFlatHeight both non-null:
    enteredArea_pri    = priFlatBreadth * priFlatHeight
    priEffectiveHeight = priFlatHeight * priParallel
    priEffectiveArea   = priFlatBreadth * priEffectiveHeight

    Write enteredArea_pri.toFixed(2)    to #priEnteredAreaOutput
    Write priEffectiveHeight.toFixed(2) to #priEffectiveHeightOutput
    Write priEffectiveArea.toFixed(2)   to #priFlatAreaOutput

    Warning check:
        IF |priEffectiveArea - priArea| / priArea > 0.1:
            SHOW #priFlatWarning
        ELSE:
            HIDE #priFlatWarning
ELSE:
    Clear #priEnteredAreaOutput, #priEffectiveHeightOutput, #priFlatAreaOutput
    HIDE #priFlatWarning
```

#### Round wire diameter computation (always executed)
```
PROCESS:
  bareDiaPri = SQRT((priArea * 4) / PI)
  auto("priBareDiaOutput", bareDiaPri.toFixed(2))

  priBareDiaUsed = g("priBareDiaOutput")           [read-back after write]
  priBareStd     = Math.floor(priBareDiaUsed * 10) / 10   [truncate to 1 decimal]
  priInsAdd      = g("priInsAddition") || 0.1
  insDiaPri      = priBareStd + priInsAdd
  auto("priInsDiaInput", insDiaPri.toFixed(2))

  insDiaPriUsed  = g("priInsDiaInput")             [active calculation value]
```

**Key note:** The round wire diameter calculation (7C–7E) is ALWAYS executed regardless
of wire type. `insDiaPriUsed` is needed for Step 10 weight computation even in the flat
wire path (Step 10F uses `insDiaPriUsed` from `#priInsDiaInput` for `priActualArea`).

---

### Step 8 — Primary Turns Per Limb, TPL & Layers

```
INPUT:
  priTurnsUsed    (from #primaryTurns — Phase 1 output)
  limbsCount      (from #limbsCount, default 2)
  bobbinHeightPri (from #bobbinHeightPri)
  bobbinFlange    (from #bobbinFlange, default 7)
  priSafetyMargin (from #priSafetyMargin, default 1)
  isPriFlat       (wire type flag from radio button)
  insDiaPriUsed   (round wire path)
  priFlatBreadth  (flat wire path)

PROCESS:
  priTurnsLimb = Math.ceil(priTurnsUsed / limbsCount)
  auto("priTurnsLimbOutput", priTurnsLimb)
  priTurnsLimbUsed = g("priTurnsLimbOutput")

  priWindingLen = bobbinHeightPri - bobbinFlange

  IF isPriFlat AND priWindingLen non-null AND priFlatBreadth non-null:
      priTPL = Math.floor(priWindingLen / priFlatBreadth) - priSafetyMargin
  ELSE IF NOT isPriFlat AND priWindingLen non-null AND insDiaPriUsed non-null:
      priTPL = Math.floor(priWindingLen / insDiaPriUsed) - priSafetyMargin
  ELSE:
      priTPL = null

  auto("priTplOutput", priTPL)
  priTPLUsed = g("priTplOutput")

  priLayers = Math.ceil(priTurnsLimbUsed / priTPLUsed)   [or null if inputs null]
  auto("priLayersOutput", priLayers)
  priLayersUsed = g("priLayersOutput")

OUTPUT:
  -> #priTurnsLimbOutput
  -> #priTplOutput
  -> #priLayersOutput
```

---

### Step 9 — Primary Radial Thickness

```
INPUT:
  paperThickness  (from #paperThickness, default 0.127)
  priPaperLayers  (from #priPaperLayers, default 4)
  isPriFlat       (wire type flag)
  insDiaPriUsed   (round path)
  priEffectiveHeight (flat path — JS variable from Step 7)
  priLayersUsed   (from Step 8)

PROCESS:
  IF isPriFlat AND priEffectiveHeight non-null AND priLayersUsed non-null:
      priRadBuild = (priEffectiveHeight * priLayersUsed) + (paperThickness * priPaperLayers)
  ELSE IF NOT isPriFlat AND insDiaPriUsed non-null AND priLayersUsed non-null:
      priRadBuild = (insDiaPriUsed * priLayersUsed) + (paperThickness * priPaperLayers)
  ELSE:
      priRadBuild = null

  auto("priRadialOutput", Math.ceil(priRadBuild))
  priRadUsed = g("priRadialOutput")

OUTPUT:
  -> #priRadialOutput
```

---

### Step 10 — Primary LMT and Conductor Weight

```
INPUT:
  coilClearance    (from #coilClearance, default 3.5)
  rhoCu            (from #rhoCu — driven by conductorMaterial selection)
  tongueWidth      (Phase 2 user input)
  stackHeight      (Phase 2 user input)
  priRadUsed       (Step 9)
  insDiaPriUsed    (Step 7 — always used for priActualArea regardless of wire type)
  priTurnsLimbUsed (Step 8)
  limbsCount       (user input)

PROCESS:
  innerW    = tongueWidth + (2 * coilClearance)
  innerL    = stackHeight + (2 * coilClearance)
  priOuterW = innerW + (2 * priRadUsed)
  priOuterL = innerL + (2 * priRadUsed)
  priLMT    = (innerW + priOuterW + innerL + priOuterL) / 1000

  auto("priLmtOutput", parseFloat(priLMT.toFixed(3)))
  priLMTUsed = g("priLmtOutput")

  priActualArea = (Math.PI * Math.pow(insDiaPriUsed, 2)) / 4
  priWeight = priLMTUsed * priTurnsLimbUsed * limbsCount * priActualArea * rhoCu * 1e-3

  auto("priWeightOutput", parseFloat(priWeight.toFixed(2)))

OUTPUT:
  -> #priLmtOutput
  -> #priWeightOutput (also has data-cost attributes for Phase 7)

INTERMEDIATE VARIABLES RETAINED IN MEMORY (used by Phase 5):
  innerW, innerL  [NOT written to DOM — passed as JS closure variables]
```

---

## Conductor Material Change Event (Special Listener)

A separate `change` event listener on `#conductorMaterial` (not part of `calculate()`):
```
IF conductorMaterial === "Aluminium":
    Set #rhoCu.value = "2.703"
ELSE (Copper):
    Set #rhoCu.value = "8.89"

delete #rhoCu.dataset.edited     [ensure auto() can overwrite on next calculate()]
Dispatch synthetic "input" event on #rhoCu -> triggers calculate() + save()
```

This modifies `rhoCu` in the DOM which is then read by Step 10.
The listener fires BEFORE `calculate()` on material change.

---

## Cross-Step Dependency Map

```
Phase 1 va ----------auto-fwd---------> #vaConductorInput
Phase 1 primaryVoltage --auto-fwd-----> #vPriConductorInput
                                              |
                            Step 7 ──────────┘
                               |
              iPri ────────────┤
                               |──> SWG lookup ──> wire section visibility
              priArea ─────────┤
              bareDiaPri ──────┤
              priBareStd ──────┤
              insDiaPri ──────>|──> #priInsDiaInput (insDiaPriUsed)
              [flat path] ─────┤
              priEffectiveHeight (JS var, not DOM)
                               |
                            Step 8 ──────────────────────────────────────┐
                               |                                          |
              priTurnsLimb, priTPL, priLayers                            |
              priLayersUsed ─────────────────────────────────────────────┤
                               |                                          |
                            Step 9                                        |
                               |                                          |
              priRadBuild -> priRadUsed ───────────────────────────────┐  |
                               |                                       |  |
                            Step 10 <──────────────────────────────────┘  |
                               |  <───────────────────────────────────────┘
              innerW, innerL (JS vars -> Phase 5)
              priLMT, priWeight ──> outputs
```

---

## Final Outputs of Phase 3

| Output Field           | Value                         | Consumed By                      |
|------------------------|-------------------------------|----------------------------------|
| `#iPriOutput`          | Primary current (A)           | Display only                     |
| `#priSwgOutput`        | SWG recommendation string     | Display / Summary modal          |
| `#priBareDiaOutput`    | Target bare diameter (mm)     | Display / override               |
| `#priInsDiaInput`      | Insulated diameter (mm)       | Step 8, 9, 10 (active input)     |
| `#priTurnsLimbOutput`  | Turns per limb                | Step 8 downstream, Step 10       |
| `#priTplOutput`        | Turns per layer               | Step 8 downstream                |
| `#priLayersOutput`     | Layer count                   | Step 9                           |
| `#priRadialOutput`     | Radial thickness (mm)         | Phase 4 Steps 11, 13             |
| `#priLmtOutput`        | Primary LMT (m)               | Display only                     |
| `#priWeightOutput`     | Primary conductor weight (kg) | Phase 7 cost module              |
| `innerW` (JS var)      | Inner coil width (mm)         | Phase 5 Step 17                  |
| `innerL` (JS var)      | Inner coil length (mm)        | Phase 5 Step 17                  |
