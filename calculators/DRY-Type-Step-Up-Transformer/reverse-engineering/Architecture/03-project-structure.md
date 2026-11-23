# Architecture Reverse Engineering
## File: 03-project-structure.md

> **Scope:** Every project file, folder, and its purpose.
> Includes import relationships, global variables, and shared utilities.

---

## Folder Hierarchy

```
DRY-Type-Step-Up-Transformer/
├── index.html                  ← Single-page application entry point
├── css/
│   └── style.css               ← All application styles + print media query
├── js/
│   ├── swgData.js              ← SWG wire gauge lookup table + helper
│   ├── app.js                  ← Core engineering calculation engine
│   └── costModule.js           ← Material cost estimation module (IIFE)
└── reverse-engineering/        ← Documentation (not part of the application)
    ├── Architecture/           ← This folder
    ├── Phase-01-*/             ← Phase 1 documentation
    ├── Phase-02-*/             ← Phase 2 documentation
    ├── Phase-03-*/             ← Phase 3 documentation
    ├── Phase-04-*/             ← Phase 4 documentation
    ├── Phase-05-*/             ← Phase 5 documentation
    └── Phase-06-*/             ← Phase 6 documentation
```

---

## File Responsibilities

### `index.html`
**Purpose:** The single HTML page that constitutes the entire application UI.

- Defines the complete DOM structure: all phases, all step cards, all input/output fields
- Contains two embedded SVG elements (inline blueprint + modal blueprint)
- Contains the Summary Modal `#summaryModal`
- Contains the FAB button group `.fab-container`
- Loads scripts in the correct order: swgData.js → app.js → costModule.js
- Loads styles: css/style.css
- Has NO inline JavaScript (all JS is in external files)
- All input IDs are unique and match the IDs referenced in `app.js`
- Fields with `data-cost-type` attributes serve as the interface between
  `app.js` and `costModule.js`

---

### `css/style.css`
**Purpose:** All visual styles for the application.

- Styles for `.container`, `.row`, `.card`, `.formula`, `.calculation`
- Styles for `.calc-wrapper`, `.override-text`
- Styles for `.wire-type-group`, `.wire-type-card`
- Styles for `.fab-container`, `.fab-btn` variants (summary-btn, print-btn, clear-btn)
- Styles for `.modal`, `.modal-content`, `.modal-header`, `.close-btn`
- Styles for `.summary-table`, `.cost-table`
- Styles for `.cost-total-item`, `.cost-totals-grid`, `.grand-total-box`
- `@media print` block — defines print layout (e.g. hides FABs, modals not printed unless open)
- No JavaScript dependency — pure CSS

---

### `js/swgData.js`
**Purpose:** SWG (Standard Wire Gauge) lookup table and current-to-SWG matching helper.

**Defines (global scope):**
- `swgTable` — array of objects, each with `{ swg, minCurrent, maxCurrent, dia }`
  representing the SWG–current–diameter mapping for standard copper/aluminium wire gauges
- `getSWGForCurrent(current)` — function that iterates `swgTable` and returns the
  SWG number string for a given current in Amperes

**Why it exists separately:**
- Data is large (many SWG entries) and logically separate from calculation logic
- Loaded before `app.js` so `getSWGForCurrent` is available when `app.js` executes

**Import relationship:**
- Required by: `app.js` (calls `getSWGForCurrent` in Steps 7 and 15)
- No imports of its own

---

### `js/app.js`
**Purpose:** The core engineering calculation engine. Contains all engineering
formulas for Phases 1–6, all helper utilities, session persistence, and modal control.

**Defines (global scope):**
- `baseConstants` — array of field IDs exempt from cascade reset
- `allInputs` — NodeList of all input/select elements (built at parse time)
- `generateStripSuggestions(requiredArea)` — helper for flat wire strip suggestions
- `g(id)` — safe DOM value reader
- `auto(id, val)` — safe DOM value writer with override protection
- `truncateToOneDecimal(num)` — Math.floor-based 1dp truncation utility
- `calculate()` — main engineering calculation engine (Steps 1–18 + modal population)
- `save()` — persists all field values to localStorage
- `load()` — restores field values from localStorage
- `clearAll()` — resets the application to default state
- `openSummary()` — shows the summary modal
- `closeSummary()` — hides the summary modal
- `window.onclick` — modal backdrop close handler

**Event listeners attached at module top-level (parse time):**
- Universal `input` listener on ALL inputs/selects (via `allInputs.forEach`)
- `change` listener on `#conductorMaterial`

**Import relationship:**
- Depends on: `js/swgData.js` (must be loaded first)
- Does not import `costModule.js` — communication via DOM only
- No ES6 module system — plain script loaded with `<script src="js/app.js">`

---

### `js/costModule.js`
**Purpose:** Completely independent material cost estimation module.

**Pattern:** IIFE (Immediately Invoked Function Expression) — all code is wrapped in
`(function() { ... })()`. No global pollution except `window.CostEstimation`.

**Defines (IIFE-private):**
- `PRICE_IDS` — map of material names to price input field IDs
- `loadPrices()` — restores price inputs from localStorage `"material_prices"`
- `savePrices()` — persists price inputs to localStorage
- `formatCurrency(amount)` — formats number as ₹XX.XX string
- `getPriceForMaterial(materialName)` — reads the relevant price input field
- `calculateCosts()` — discovers all `[data-cost-type]` elements, computes costs,
  calls renderCostUI
- `renderCostUI(breakdown, totalsByMaterial, grandTotal)` — builds and injects HTML
  into both the live cost table and the summary modal cost table

**Defines (global):**
- `window.CostEstimation = { calculate: calculateCosts }` — exported for external use

**Import relationship:**
- No imports of its own
- Depends on DOM state produced by `app.js` (the weight fields with `data-cost-type`)
- Depends on `#conductorMaterial` for winding material determination
- No function calls to `app.js`

---

## Global Variables (Window Scope)

| Name                   | Defined In     | Type     | Description                          |
|------------------------|----------------|----------|--------------------------------------|
| `swgTable`             | swgData.js     | Array    | SWG lookup table                     |
| `getSWGForCurrent`     | swgData.js     | Function | SWG matching helper                  |
| `baseConstants`        | app.js         | Array    | Field IDs exempt from cascade reset  |
| `allInputs`            | app.js         | Array    | All input/select DOM elements        |
| `generateStripSuggestions` | app.js     | Function | Strip dimension hint generator       |
| `g`                    | app.js         | Function | Safe DOM reader                      |
| `auto`                 | app.js         | Function | Safe DOM writer with override guard  |
| `truncateToOneDecimal` | app.js         | Function | Math.floor to 1dp                    |
| `calculate`            | app.js         | Function | Main calculation engine              |
| `save`                 | app.js         | Function | localStorage persist                 |
| `load`                 | app.js         | Function | localStorage restore                 |
| `clearAll`             | app.js         | Function | Full application reset               |
| `openSummary`          | app.js         | Function | Show summary modal                   |
| `closeSummary`         | app.js         | Function | Hide summary modal                   |
| `window.onclick`       | app.js         | Handler  | Modal backdrop close handler         |
| `window.CostEstimation`| costModule.js  | Object   | `{ calculate: calculateCosts }`      |

---

## localStorage Keys

| Key                | Managed By      | Contents                                      |
|--------------------|-----------------|-----------------------------------------------|
| `"split_tx"`       | app.js          | JSON array of all input values + edited flags |
| `"material_prices"`| costModule.js   | JSON object of 5 price field values           |

`clearAll()` in app.js calls `localStorage.clear()` which removes BOTH keys.

---

## DOM Attribute Contracts (Interface Between Modules)

### `data-cost-type` / `data-cost-name`
Used on weight output fields to mark them as cost data sources.
Consumed exclusively by `costModule.js`.

| Field ID               | data-cost-type | data-cost-name |
|------------------------|----------------|----------------|
| `#priWeightOutput`     | `"winding"`    | `"Primary"`    |
| `#secWeightOutput`     | `"winding"`    | `"Secondary"`  |
| `#coreMassOutput`      | `"core"`       | `"Iron Core"`  |
| `#totalBobbinWtOutput` | `"bobbin"`     | `"Bobbin"`     |
| `#totalClampWtOutput`  | `"clamp"`      | `"Clamp"`      |

### `data-cost-material-source`
Used on winding weight fields to link to the material selector.

| Field ID           | data-cost-material-source |
|--------------------|---------------------------|
| `#priWeightOutput` | `"conductorMaterial"`     |
| `#secWeightOutput` | `"conductorMaterial"`     |

### `data-edited`
Set by `app.js` event handler to mark user overrides.
Consumed by `auto()` to skip overridden fields.
Cleared by cascade reset and `clearAll()`.

### `class="price-input"`
Applied to all 5 price input fields.
Used by `costModule.js` to identify price-change events.
