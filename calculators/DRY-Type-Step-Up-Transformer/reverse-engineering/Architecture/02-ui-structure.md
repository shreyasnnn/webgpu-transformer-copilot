# Architecture Reverse Engineering
## File: 02-ui-structure.md

> **Scope:** UI organization — screens, sections, cards, modals, navigation.
> No CSS, colors, fonts, or styling. Documents structure ONLY.

---

## Top-Level Layout

The entire application is a single HTML page (`index.html`) with no routing.
There is exactly ONE screen. The page is a vertically-scrolling single-column
layout containing:

1. `<div class="container">` — the primary layout container holding everything
2. `<div class="fab-container">` — floating action buttons (outside the container)
3. `<div id="summaryModal">` — overlay modal (outside the container)

---

## Page Title

```
<h1>DRY-TYPE TRANSFORMER CALCULATOR (SPLIT-BOBBIN)</h1>
```

Renders at the top of the container. No navigation bar. No sidebar.

---

## Main Sections (Engineering Phases)

Each engineering phase is delineated by an `<h2>` section header inside the
`<div class="container">`. Below each header is a `<div class="row">` containing
one or more `<div class="card">` elements.

| Section # | h2 Text                              | HTML Line | Cards (Steps)                      |
|-----------|--------------------------------------|-----------|-------------------------------------|
| 1         | Phase 1: Capacity & Turns            | 14        | Step 1, Step 2, Step 3, Step 4      |
| 2         | Phase 2: Core Area Dimensions        | 103       | Step 5, Step 6                      |
| 3         | Phase 3: Primary Winding             | 149       | Step 7, Step 8, Step 9, Step 10     |
| 4         | Phase 4: Clamps & Bobbins            | 294       | Step 11, Step 12, Step 13, Step 14  |
| 5         | Phase 5: Secondary Winding           | 425       | Step 15, Step 16, Step 17           |
| 6         | Phase 6: Core Mass Validation        | 544       | Step 18                             |
| 7         | Phase 7: Material Cost Estimation    | 588       | Single wide card (Cost UI)          |

---

## Card Structure (Standard Pattern)

Every Step card follows this consistent pattern:

```html
<div class="card">
    <h3>STEP N: Step Name</h3>
    <div class="formula">Formula expression</div>

    <!-- Input fields (user inputs and feed fields) -->
    <label>Field Label</label>
    <input type="number" id="fieldId" ...>

    <!-- Calculation trace display -->
    <div class="calculation" id="calcN"></div>

    <!-- Editable override outputs (calc-wrapper) -->
    <div class="calc-wrapper">
        <label>Output Label</label>
        <input type="number" id="outputId" ...>
        <span class="override-text">Editable Override</span>
    </div>
</div>
```

---

## Special Card Variants

### Wire Type Card (Steps 7 and 15 — Primary and Secondary Conductor)

Both primary and secondary conductor cards contain a **conditionally visible** flat
wire section (`#priFlatWireSection` / `#secFlatWireSection`). Shown only when
`getSWGForCurrent()` returns SWG ≤ 13.

Inside the flat wire section:
- **Wire Type Radio Group** — two `.wire-type-card` labels containing radio inputs:
  - Round Wire radio (`#priWireTypeRound` / `#secWireTypeRound`)
  - Flat Wire radio (`#priWireTypeFlat` / `#secWireTypeFlat`)
- **Flat Wire Inputs** (`#priFlatInputs` / `#secFlatInputs`) — shown when flat selected:
  - Breadth field, Height field, Parallel count field
  - Display-only: Entered area, Effective height, Effective area
  - Warning banner (`#priFlatWarning` / `#secFlatWarning`) — shown if >10% area mismatch
  - Strip suggestions text (`#priStripSuggestions` / `#secStripSuggestions`)

### Bobbin Diagram Card (Step 13)

Contains a sub-heading "Live Dimension Blueprint" followed by an embedded `<svg>`
element (the inline bobbin cross-section blueprint). The SVG is static geometry
with 5 dynamic `<text>` elements (`#svg_a/b/c/d/h`).

### Conductor Selection Sub-panel (Step 2 Card)

Inside the Step 2 card, there is a boxed sub-panel (not a card) containing:
- `#conductorMaterial` — `<select>` (Copper / Aluminium)
- `#rhoCu` — density input (auto-updated on material change)

### Phase 6 — 2×2 Grid Input (Step 18)

The core frame dimensions (D, L, A, ST) are laid out in a `2×2 CSS grid` inside
the Step 18 card — not in separate `.calc-wrapper` divs.

### Phase 7 — Cost Estimation Card

The single Phase 7 card uses an internal flexbox layout with two sub-panels:

**Left Panel — Material Prices:**
- 5 price inputs in a 2-column grid: `#priceCu`, `#priceAl`, `#priceFe`,
  `#priceBobbin`, `#priceClamp` — all carry `class="price-input"`

**Right Panel — Cost Breakdown:**
- `#liveCostTable` — live cost breakdown table (populated by costModule.js)
  - `<thead>`: Name / Material / Weight(kg) / Price/kg / Subtotal
  - `<tbody id="liveCostBody">` — dynamically populated
- `#liveCostTotals` — per-material totals grid (dynamically populated)
- `#liveGrandTotal` — grand total display

---

## Floating Action Buttons (FAB)

Located in `<div class="fab-container">` — positioned OUTSIDE `.container`,
fixed/sticky at the bottom or corner of the viewport.

| Button        | Class           | Action                      |
|---------------|-----------------|-----------------------------|
| Summary       | `fab-btn summary-btn` | `openSummary()`       |
| Print         | `fab-btn print-btn`   | `window.print()`      |
| Clear Data    | `fab-btn clear-btn`   | `clearAll()`          |

---

## Summary Modal (`#summaryModal`)

An overlay modal positioned OUTSIDE `.container`. Hidden by default
(`display: none`). Shown by `openSummary()`.

### Modal Structure
```
div#summaryModal (.modal)
    └── div.modal-content
            ├── div.modal-header
            │       ├── h2 "Transformer Summary"
            │       └── span.close-btn [✕ → closeSummary()]
            │
            ├── table.summary-table [Engineering summary rows]
            │       ├── Conductor Material     → #sumMaterial
            │       ├── Primary Voltage        → #sumPriVolts
            │       ├── Secondary Voltage      → #sumSecVolts
            │       ├── Total VA               → #sumVA
            │       ├── Core (Net Area/Tongue×Stack) → #sumCore
            │       ├── Primary Winding        → #sumPriDetails
            │       ├── Secondary Winding      → #sumSecDetails
            │       ├── Total Core Weight      → #sumCoreWt
            │       ├── Total Bobbins Weight   → #sumBobbinWt
            │       └── Total Clamps Weight    → #sumClampWt
            │
            ├── div#summaryCostSection (.summary-cost-section)
            │       ├── h3 "Material Cost Estimation"
            │       ├── table#summaryCostTable (.cost-table)
            │       │       └── tbody#summaryCostBody  [populated by costModule]
            │       ├── div#summaryCostTotals (.cost-totals-grid)
            │       └── div#summaryGrandTotal (.grand-total-box)
            │
            └── div.modal-svg-container
                    ├── h3 "Blueprint Dimensions (Scaled)"
                    └── svg [Modal copy of bobbin blueprint]
                            └── 5 dynamic text labels:
                                #modal_svg_a/b/c/d/h
```

### Modal Close Triggers
1. Click ✕ `span.close-btn` → `closeSummary()`
2. Click modal backdrop (`window.onclick` checks `event.target === modal`)

---

## User Interaction Hierarchy

```
Page Load (no interactions)
    └── Full calculation auto-runs → All auto-populated fields fill in

User Input Flow:
    Input/Select field change
        └── Cascade reset → calculate() → save()

Conductor Material change:
    #conductorMaterial select
        └── #rhoCu update → synthetic input event → calculate() → save()

FAB Buttons:
    [Summary]   → openSummary() → Modal shows
    [Print]     → window.print()
    [Clear]     → clearAll() → calculate()

Modal Interactions:
    Open:  click [Summary] FAB
    Close: click ✕ | click backdrop
```

---

## Read-Only Display Elements

Several elements are NOT `<input>` fields but display computed information:

| Element                    | Type        | Content                                |
|----------------------------|-------------|----------------------------------------|
| `div.calculation#calcN`    | div         | Calculation trace / formula trace      |
| `#priSwgOutput`            | `<input readonly type="text">` | SWG recommendation |
| `#secSwgOutput`            | `<input readonly type="text">` | SWG recommendation |
| `#priStripSuggestions`     | element     | Strip dimension hints (innerText)      |
| `#secStripSuggestions`     | element     | Strip dimension hints (innerText)      |
| `#flangeWtOutput`          | `<input>`   | 1× Flange Weight (kg) — readonly       |
| `#wallWtOutput`            | `<input>`   | Long/Short Wall Weights — readonly     |
| Summary modal text cells   | `<td>`      | All `sumXxx` elements — innerText only |
