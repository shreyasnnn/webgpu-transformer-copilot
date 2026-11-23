# Architecture Reverse Engineering
## File: 01-application-flow.md

> **Scope:** Complete runtime execution flow of the application. Documents every
> major flow: startup, user interaction, data cascade, overrides, SVG updates,
> modal, print, and cost module.

---

## 1. Application Startup Sequence

```
Browser loads index.html
        │
        ├─ Parses and renders DOM
        ├─ Loads css/style.css
        ├─ Loads js/swgData.js  (defines swgTable[] and getSWGForCurrent())
        ├─ Loads js/app.js
        │       │
        │       ├─ Defines: baseConstants[]
        │       ├─ Builds: allInputs[]  (ALL input+select elements at parse time)
        │       ├─ Attaches: universal "input" event listeners to every input/select
        │       ├─ Attaches: "change" listener to #conductorMaterial
        │       ├─ Defines: helper functions (g, auto, truncateToOneDecimal,
        │       │            generateStripSuggestions, calculate, save, load, clearAll,
        │       │            openSummary, closeSummary)
        │       ├─ Attaches: window.onclick (modal backdrop close)
        │       ├─ Calls:    load()          ← restores last session from localStorage
        │       └─ Calls:    calculate()     ← runs full calculation on startup
        │
        └─ Loads js/costModule.js  (IIFE — runs immediately)
                │
                ├─ Defines: PRICE_IDS map, all cost functions (loadPrices, savePrices,
                │            calculateCosts, renderCostUI)
                ├─ Registers: DOMContentLoaded listener
                │       ├─ Calls: loadPrices()      ← restores prices from localStorage
                │       └─ Calls: calculateCosts()  ← initial cost render
                └─ Registers: body "input" event listener (setTimeout 50ms → calculateCosts)
```

**Script load order matters:** `swgData.js` must be loaded before `app.js` because
`app.js` calls `getSWGForCurrent()` which is defined in `swgData.js`.

---

## 2. The `calculate()` Function — Execution Order

`calculate()` is a single monolithic synchronous function. It runs top-to-bottom,
Steps 1 through 18, plus the Summary Modal population block, in one call.

```
calculate()
    │
    ├─ Step 1:   VA & kVA capacity
    ├─ Step 2:   Volts per Turn (VT)
    ├─ Step 3:   Primary Turns
    ├─ Step 4:   Secondary Turns
    │       └── auto-forwards: VA, V_pri → Phase 3 feed fields
    ├─ Step 5:   Net Core Area
    ├─ Step 6:   Gross Area & Core Selection
    ├─ Step 7:   Primary Conductor Sizing + SWG + Flat Wire Branch
    ├─ Step 8:   Primary Turns/Limb, TPL, Layers
    ├─ Step 9:   Primary Radial Build
    ├─ Step 10:  Primary LMT & Weight
    │       └── produces: innerW, innerL (JS vars — passed forward in scope)
    ├─ Step 11:  L-Clamp Span & Length
    ├─ Step 12:  L-Clamp Weight
    ├─ Step 13:  Bobbin Dimensions + Inline SVG label updates
    ├─ Step 14:  Bobbin Weight
    ├─ Step 15:  Secondary Conductor Sizing + SWG + Flat Wire Branch
    ├─ Step 16:  Secondary Turns/Limb, TPL, Layers, Radial Build
    ├─ Step 17:  Secondary LMT & Weight
    ├─ Step 18:  Core Frame Perimeter & Core Mass
    │
    └─ Summary Modal Population Block
            ├─ Writes: #sumMaterial, #sumPriVolts, #sumSecVolts, #sumVA, #sumCore
            ├─ Writes: #sumPriDetails (winding detail string, wire type aware)
            ├─ Writes: #sumSecDetails (winding detail string, wire type aware)
            ├─ Writes: #sumCoreWt, #sumBobbinWt, #sumClampWt
            └─ Writes: #modal_svg_a/b/c/d/h (Modal SVG label updates)
```

`calculate()` is triggered by:
- Page startup (direct call)
- Any `input` event on any input/select element
- `conductorMaterial` change (via synthetic `input` event dispatch)
- `clearAll()` (direct call at end)

---

## 3. User Interaction Flow

```
User types/changes any field
        │
        ├─ "input" event fires on the field
        ├─ [If e.isTrusted]:
        │       ├─ If field cleared: DELETE field.dataset.edited
        │       ├─ Else:             SET field.dataset.edited = "1"
        │       └─ CASCADE RESET:
        │               For every field AFTER this one in allInputs[]:
        │                   If NOT in baseConstants[]: DELETE field.dataset.edited
        ├─ calculate()   ← full recalculation
        └─ save()        ← persist to localStorage
```

---

## 4. The `auto()` Override Mechanism

```
auto(id, val) called during calculate():
        │
        ├─ Get element by id
        ├─ IF element.dataset.edited exists:  SKIP (preserve user override)
        ├─ IF document.activeElement === element: SKIP (user is actively typing)
        └─ ELSE: set element.value = val (or "" if null/NaN)
```

**Override lifecycle:**
```
User types in override field → dataset.edited = "1" → auto() skips it
User clears the override field → dataset.edited deleted → auto() can write again
Upstream field changes → cascade reset deletes dataset.edited on all downstream
  non-baseConstant fields → auto() can write again
clearAll() called → ALL dataset.edited deleted → all fields reset to defaults or ""
```

---

## 5. Cascade Reset Mechanism

When the user edits any field, ALL downstream fields (by DOM order in `allInputs[]`)
that are NOT in `baseConstants[]` have their `dataset.edited` flag cleared.

This ensures that if a user overrides an output field but then changes an earlier
input, the override is released and the computed value flows through again.

```
allInputs = [field_0, field_1, ..., field_n]

User edits field_k (trusted):
    For i = k+1 to n:
        If allInputs[i].id NOT in baseConstants[]:
            delete allInputs[i].dataset.edited
```

**baseConstants fields are NEVER cascade-reset.** Their `dataset.edited` flags
are only removed by:
- `clearAll()` (resets everything)
- `conductorMaterial` change (explicitly deletes `#rhoCu.dataset.edited`)
- User manually clearing the field (empty value → delete dataset.edited)

---

## 6. conductorMaterial Change Event Flow

```
User changes #conductorMaterial select
        │
        ├─ "change" listener fires (NOT the universal "input" listener)
        ├─ Set #rhoCu.value = "2.703" (Aluminium) OR "8.89" (Copper)
        ├─ DELETE #rhoCu.dataset.edited
        └─ Dispatch synthetic new Event("input") on #rhoCu
                │
                └─ Universal "input" listener fires (e.isTrusted = FALSE)
                        ├─ [isTrusted check SKIPPED — no dataset.edited change]
                        ├─ calculate()
                        └─ save()
```

---

## 7. Data Flow — Auto-Forwarding Between Phases

Several fields are auto-forwarded within `calculate()` to decouple phases:

| Source Variable      | Target Field ID      | Purpose                              |
|----------------------|----------------------|--------------------------------------|
| `va`                 | `#vaConductorInput`  | Phase 1 VA → Phase 3 feed            |
| `primaryVoltage`     | `#vPriConductorInput`| Phase 1 V_pri → Phase 3 feed        |
| `vSecInput`          | `#secondaryVoltage`  | Phase 1 V_sec → Phase 3 display      |
| `actVTUsed`          | `#actualVTInput`     | Phase 1 act VT → Phase 3 display     |
| `kva` (÷1000)        | `#kvaInput`          | Phase 1 kVA → Phase 2 feed           |
| `vt`                 | `#vtInput`           | Phase 2 VT baseline → Phase 2 feed   |
| `netAreaUsed`        | `#netAreaInput`      | Phase 2 net area → Phase 2 gross     |
| `tongueWidth`        | `#coreD`             | Phase 2 → Phase 6 segment D default  |
| `stackHeight`        | `#coreST`            | Phase 2 → Phase 6 segment ST default |

---

## 8. SVG Update Flow

```
calculate() runs Step 13 (Bobbin Dimensions):
        │
        ├─ Computes: bobbinInnerW, bobbinInnerL, bobbinOuterW, bobbinOuterL
        │
        ├─ INLINE SVG updates (immediately in Step 13):
        │       #svg_a.textContent ← "a = {bobbinInnerW}" or "a = --"
        │       #svg_b.textContent ← "b = {bobbinOuterW}" or "b = --"
        │       #svg_c.textContent ← "c = {bobbinInnerL}" or "c = --"
        │       #svg_d.textContent ← "d = {bobbinOuterL}" or "d = --"
        │       #svg_h.textContent ← "h = {bobbinHeightPri}" or "h = --"
        │
        └─ MODAL SVG updates (end of calculate(), Summary Modal block):
                #modal_svg_a/b/c/d/h.textContent ← same values
                [bobbinInnerW etc. still in scope from Step 13 — same call]
```

SVG geometry is static HTML — never modified by JS. Only 5 `<text>` elements
per SVG are updated at runtime.

---

## 9. Summary Modal Flow

```
User clicks "Summary" FAB button
        │
        └─ openSummary() called
                └─ #summaryModal.style.display = "block"

Modal is already populated because calculate() (called on every input event)
populates #sumMaterial, #sumPriDetails, etc. and #modal_svg_a/b/c/d/h
at the END of every calculate() call.

Modal close — 3 ways:
    1. User clicks ✕ button → closeSummary() → display = "none"
    2. User clicks modal backdrop → window.onclick → display = "none"
    3. [No keyboard close implemented]
```

---

## 10. Print Flow

```
User clicks "Print" FAB button
        │
        └─ window.print() called directly
                └─ Browser print dialog opens
                        └─ CSS @media print rules in style.css determine layout
                           [No special JS print logic — pure CSS print handling]
```

---

## 11. Cost Module Flow

```
DOMContentLoaded fires (after app.js has run):
        │
        ├─ loadPrices()     ← restores priceCu/Al/Fe/Bobbin/Clamp from localStorage
        └─ calculateCosts() ← initial cost render

Any "input" event on body (50ms delayed):
        └─ calculateCosts()

calculateCosts():
        │
        ├─ Queries ALL elements with [data-cost-type] attribute
        │       (priWeightOutput, secWeightOutput, coreMassOutput,
        │        totalBobbinWtOutput, totalClampWtOutput)
        │
        ├─ For each element:
        │       ├─ Reads weight from .value
        │       ├─ Reads material:
        │       │       if data-cost-type="winding": read #conductorMaterial.value
        │       │       else: use data-cost-name as material key
        │       ├─ Gets price/kg from price input field
        │       └─ Computes subtotal = weight × price
        │
        ├─ Aggregates by material
        ├─ Renders to #liveCostBody + #liveCostTotals + #liveGrandTotal
        └─ Renders to #summaryCostBody + #summaryCostTotals + #summaryGrandTotal

savePrices():
        └─ Called when any .price-input changes
           Saves all 5 prices to localStorage key "material_prices"
```

---

## 12. Persistence Flow (localStorage)

```
Key: "split_tx"
    Format: JSON array of [id, value, dataset.edited] triples for every input/select

save():
    Serializes all input/select elements → localStorage["split_tx"]
    Called after every user input event.

load():
    Reads localStorage["split_tx"]
    For each entry: sets element.value (or radio.checked) and dataset.edited
    Called ONCE at startup, before calculate().

clearAll():
    localStorage.clear()    ← removes "split_tx" AND "material_prices"
    Resets all baseConstant fields to hardcoded defaults
    Resets all non-baseConstant fields to "" (empty)
    Forces round radio buttons for both primary and secondary
    Removes all dataset.edited flags
    Calls calculate()

Key: "material_prices"
    Format: JSON object { priceCu: "...", priceAl: "...", ... }
    Managed exclusively by costModule.js
```

---

## 13. Error Handling Flow

The application has no explicit try/catch error handling in `calculate()` or `app.js`.

Error handling strategy:
- **Null propagation:** Every calculation step checks if its required inputs are
  non-null. If any input is null, the output is set to null (or ""). Downstream
  steps that receive null inputs produce null outputs, which appear as empty fields.
- **Division by zero:** Not explicitly guarded in most cases. JS produces `Infinity`
  or `NaN` which propagate and eventually show as empty/NaN in fields.
- **g() safety:** `g(id)` returns `null` if element is missing or value is "".
  `parseFloat("")` returns `NaN` — guarded by the null check `if (!el || el.value === "") return null`.
- **auto() safety:** Checks for null/undefined/NaN before setting value.
- **costModule.js:** Wraps `loadPrices()` in try/catch (only place in codebase).

---

## 14. Module Dependencies

```
index.html
    ├── css/style.css          [no JS — pure styles]
    ├── js/swgData.js          [defines swgTable[], getSWGForCurrent()]
    │                          [no imports — standalone global]
    ├── js/app.js              [depends on: swgData.js (getSWGForCurrent)]
    │                          [no module system — global scope]
    └── js/costModule.js       [depends on: DOM state after app.js has run]
                               [IIFE — does not depend on app.js functions]
                               [communicates only via DOM (data-cost-type attrs)]
```

`costModule.js` and `app.js` are fully decoupled — they share NO function calls.
Communication is exclusively through the DOM: `app.js` writes weight values to
fields with `data-cost-type` attributes; `costModule.js` reads those attribute
values independently.
