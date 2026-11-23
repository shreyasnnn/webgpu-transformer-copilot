# Architecture Reverse Engineering
## File: 04-components-and-events.md

> **Scope:** All reusable functions, event listeners, helpers, and components.
> Every important function is documented with Purpose, Called From, Calls To,
> Dependencies, and Side Effects.

---

## A. Core Helper Functions (`js/app.js`)

---

### `g(id)`

| Property     | Detail                                                                  |
|--------------|-------------------------------------------------------------------------|
| **Purpose**  | Safe DOM value reader. Returns a parsed float or null.                  |
| **Signature**| `g(id: string) → number | null`                                         |
| **Called From** | `calculate()` — every step reads inputs via `g()`                   |
| **Calls To** | `document.getElementById()`, `parseFloat()`                             |
| **Dependencies** | None                                                                |
| **Side Effects** | None — pure read                                                    |

**Implementation:**
```javascript
function g(id) {
    let el = document.getElementById(id);
    if (!el || el.value === "") return null;
    return parseFloat(el.value);
}
```

**Key behaviors:**
- Returns `null` for missing elements
- Returns `null` for empty string values
- Does NOT distinguish between 0 and missing — `parseFloat("0")` returns 0 (non-null)

---

### `auto(id, val)`

| Property     | Detail                                                                     |
|--------------|----------------------------------------------------------------------------|
| **Purpose**  | Safe DOM value writer. Writes val to field ONLY if not user-overridden     |
|              | and not currently active.                                                  |
| **Signature**| `auto(id: string, val: number | null | undefined) → void`                  |
| **Called From** | `calculate()` — every auto-populated output field                      |
| **Calls To** | `document.getElementById()`                                                |
| **Dependencies** | `element.dataset.edited`, `document.activeElement`                     |
| **Side Effects** | Modifies DOM field value if guard conditions pass                      |

**Implementation:**
```javascript
function auto(id, val) {
    let e = document.getElementById(id);
    if (e && !e.dataset.edited && document.activeElement !== e) {
        e.value = (val !== null && val !== undefined && !isNaN(val)) ? val : "";
    }
}
```

**Three-condition guard:**
1. `!e.dataset.edited` — skip if user has explicitly overridden this field
2. `document.activeElement !== e` — skip if user is currently typing in this field
3. Value validity — writes "" if val is null/undefined/NaN

---

### `truncateToOneDecimal(num)`

| Property     | Detail                                                                  |
|--------------|-------------------------------------------------------------------------|
| **Purpose**  | Truncates a number to 1 decimal place using Math.floor (always down).   |
| **Signature**| `truncateToOneDecimal(num: number | null) → number | null`              |
| **Called From** | `calculate()` — Steps 2, 3 (VT truncation)                         |
| **Calls To** | `Math.floor()`                                                          |
| **Dependencies** | None                                                                |
| **Side Effects** | None — pure computation                                             |

**Implementation:**
```javascript
function truncateToOneDecimal(num) {
    if (num === null || isNaN(num)) return null;
    return Math.floor(num * 10) / 10;
}
```

**Important:** This is FLOOR, not rounding. 1.89 → 1.8, NOT 1.9.

---

### `generateStripSuggestions(requiredArea)`

| Property     | Detail                                                                  |
|--------------|-------------------------------------------------------------------------|
| **Purpose**  | Generates integer factor-pair dimension hints for flat strip wire.      |
| **Signature**| `generateStripSuggestions(requiredArea: number) → string`               |
| **Called From** | `calculate()` — Steps 7 and 15 (flat wire SWG branch)              |
| **Calls To** | `Math.round()`, `Math.sqrt()`                                           |
| **Dependencies** | None                                                                |
| **Side Effects** | None — pure computation                                             |

**Implementation:**
```javascript
function generateStripSuggestions(requiredArea) {
    if (!requiredArea || requiredArea <= 0) return "--";
    let target = Math.round(requiredArea);
    if (target === 0) target = 1;
    let suggestions = [];
    for (let h = 1; h <= Math.sqrt(target); h++) {
        if (target % h === 0) {
            let b = target / h;
            suggestions.push(`${b} × ${h} mm`);
        }
    }
    return suggestions.length > 0 ? suggestions.join(" | ") : "--";
}
```

**Output example:** For area ≈ 18mm²: `"18 × 1 mm | 9 × 2 mm | 6 × 3 mm"`

---

## B. Main Calculation Function

---

### `calculate()`

| Property     | Detail                                                                  |
|--------------|-------------------------------------------------------------------------|
| **Purpose**  | Runs the complete engineering calculation pipeline (Steps 1–18) and     |
|              | populates the summary modal display.                                    |
| **Signature**| `calculate() → void`                                                    |
| **Called From** | Universal `input` event listener (every field change), `clearAll()`,|
|              | startup (direct call at app.js bottom)                                  |
| **Calls To** | `g()`, `auto()`, `truncateToOneDecimal()`, `generateStripSuggestions()`,|
|              | `getSWGForCurrent()` (from swgData.js), `Math.*`, `document.getElementById()` |
| **Dependencies** | All DOM input fields, swgData.js SWG functions                     |
| **Side Effects** | Writes to ALL output DOM fields. Updates inline SVG text labels.    |
|              | Updates all Summary Modal display cells. Does NOT write to localStorage. |

**Execution:** Purely synchronous. Steps execute linearly, top to bottom.
JS variables declared with `let` in one step remain in scope for all later steps
within the same `calculate()` call. This is the mechanism for passing data between
phases without DOM read-back.

---

## C. Persistence Functions

---

### `save()`

| Property     | Detail                                                                  |
|--------------|-------------------------------------------------------------------------|
| **Purpose**  | Serializes all input/select field values and edit flags to localStorage. |
| **Signature**| `save() → void`                                                         |
| **Called From** | Universal `input` event listener (after every `calculate()` call)  |
| **Calls To** | `document.querySelectorAll()`, `localStorage.setItem()`, `JSON.stringify()` |
| **Dependencies** | All DOM input/select elements                                       |
| **Side Effects** | Writes to `localStorage["split_tx"]`                               |

**Serialized format per field:** `[id, value, dataset.edited || ""]`
For radio buttons: value is `"true"` or `"false"` (string).

---

### `load()`

| Property     | Detail                                                                  |
|--------------|-------------------------------------------------------------------------|
| **Purpose**  | Restores all input/select field values from localStorage.               |
| **Signature**| `load() → void`                                                         |
| **Called From** | Startup (direct call at app.js bottom, before calculate())          |
| **Calls To** | `localStorage.getItem()`, `JSON.parse()`, `document.getElementById()`  |
| **Dependencies** | `localStorage["split_tx"]` existing                                |
| **Side Effects** | Sets `.value` and `.checked` on DOM elements. Restores `dataset.edited`. |

---

### `clearAll()`

| Property     | Detail                                                                  |
|--------------|-------------------------------------------------------------------------|
| **Purpose**  | Resets application to factory defaults. Clears localStorage.            |
| **Signature**| `clearAll() → void`                                                     |
| **Called From** | "Clear Data" FAB button (`onclick="clearAll()"`)                    |
| **Calls To** | `localStorage.clear()`, `document.querySelectorAll()`, `calculate()`   |
| **Dependencies** | `baseConstants[]`, hardcoded `defaults` object                     |
| **Side Effects** | Clears localStorage entirely (both "split_tx" and "material_prices").|
|              | Resets all DOM fields. Removes all `dataset.edited` flags.              |
|              | Forces radio buttons to "round" checked. Calls `calculate()`.           |

**Hardcoded defaults object in `clearAll()`:**
```javascript
{
    "k": "0.8", "fluxDensity": "1", "frequency": "50", "stackingFactor": "0.9",
    "delta": "2.5", "limbsCount": "2", "bobbinFlange": "7", "priInsAddition": "0.1",
    "secInsAddition": "0.01", "paperThickness": "0.127", "coilClearance": "3.5",
    "rhoCu": "8.89", "rhoSteel": "7.65", "priSafetyMargin": "1", "secSafetyMargin": "1",
    "priPaperLayers": "4", "secPaperLayers": "4", "finalCoreSf": "0.98",
    "tbobbinClamp": "3.5", "extraSpaceClamp": "9", "centerGapClamp": "10",
    "bendingDeduction": "10", "msThickness": "3", "rhoMS": "7.85", "clampQty": "4",
    "coreGapBobbin": "2", "tapeBufferBobbin": "10", "tbobbinMat": "3", "rhoBobbin": "2.20",
    "coreL": "150", "coreA": "95", "conductorMaterial": "Copper"
}
```

---

## D. Modal Control Functions

---

### `openSummary()`

| Property     | Detail                                                                  |
|--------------|-------------------------------------------------------------------------|
| **Purpose**  | Shows the Summary Modal.                                                |
| **Signature**| `openSummary() → void`                                                  |
| **Called From** | "Summary" FAB button (`onclick="openSummary()"`)                    |
| **Calls To** | `document.getElementById()`                                            |
| **Dependencies** | `#summaryModal` element existing in DOM                            |
| **Side Effects** | Sets `#summaryModal.style.display = "block"`                       |

---

### `closeSummary()`

| Property     | Detail                                                                  |
|--------------|-------------------------------------------------------------------------|
| **Purpose**  | Hides the Summary Modal.                                                |
| **Signature**| `closeSummary() → void`                                                 |
| **Called From** | Modal ✕ close button (`onclick="closeSummary()"`), `window.onclick` |
| **Calls To** | `document.getElementById()`                                            |
| **Dependencies** | `#summaryModal` element existing in DOM                            |
| **Side Effects** | Sets `#summaryModal.style.display = "none"`                        |

---

## E. Event Listeners

---

### Universal Input Listener (on every input/select)

| Property     | Detail                                                                              |
|--------------|-------------------------------------------------------------------------------------|
| **Purpose**  | Responds to any user input across ALL fields. Manages cascade reset + recalculation.|
| **Attached To** | Every `input` and `select` element — via `allInputs.forEach`                   |
| **Trigger**  | `"input"` event                                                                     |
| **Guards**   | `e.isTrusted` check — skips dataset management for synthetic events                 |
| **Calls**    | `calculate()`, `save()`                                                             |
| **Side Effects** | Updates `dataset.edited` on current and downstream fields. Full recalculate.   |

**isTrusted significance:** When `conductorMaterial` changes and dispatches a synthetic
`input` event on `#rhoCu`, `e.isTrusted` is `false`. The cascade reset and
`dataset.edited` logic is SKIPPED for synthetic events — only `calculate()` and
`save()` run.

---

### conductorMaterial Change Listener

| Property     | Detail                                                                  |
|--------------|-------------------------------------------------------------------------|
| **Purpose**  | Automatically updates `#rhoCu` density when material is changed.        |
| **Attached To** | `#conductorMaterial` `<select>`                                     |
| **Trigger**  | `"change"` event                                                        |
| **Calls**    | `document.getElementById()`, `rhoInput.dispatchEvent(new Event("input"))` |
| **Side Effects** | Sets `#rhoCu.value`, clears `#rhoCu.dataset.edited`, dispatches     |
|              | synthetic `input` event on `#rhoCu` (triggers universal listener → calculate) |

---

### window.onclick — Modal Backdrop Close

| Property     | Detail                                                                  |
|--------------|-------------------------------------------------------------------------|
| **Purpose**  | Closes the summary modal when user clicks outside the modal content.    |
| **Attached To** | `window`                                                            |
| **Trigger**  | Any click anywhere on the page                                          |
| **Calls**    | (inline) `modal.style.display = "none"`                                 |
| **Guard**    | `event.target === modal` — only fires if click is on the backdrop div   |

---

## F. Cost Module Functions (`js/costModule.js`)

---

### `calculateCosts()`

| Property     | Detail                                                                  |
|--------------|-------------------------------------------------------------------------|
| **Purpose**  | Reads all weight fields (by `data-cost-type` attr), computes material   |
|              | costs, renders live and summary cost breakdowns.                        |
| **Signature**| `calculateCosts() → void`                                               |
| **Called From** | `DOMContentLoaded`, body `input` listener (50ms delay)              |
| **Calls To** | `document.querySelectorAll()`, `getPriceForMaterial()`, `renderCostUI()` |
| **Dependencies** | Weight output fields with `data-cost-type`, price input fields,     |
|              | `#conductorMaterial` for winding material resolution                    |
| **Side Effects** | Writes HTML to `#liveCostBody`, `#liveCostTotals`, `#liveGrandTotal`,  |
|              | `#summaryCostBody`, `#summaryCostTotals`, `#summaryGrandTotal`          |

---

### `renderCostUI(breakdown, totalsByMaterial, grandTotal)`

| Property     | Detail                                                                  |
|--------------|-------------------------------------------------------------------------|
| **Purpose**  | Renders the cost breakdown table and totals into both the live and      |
|              | summary modal cost containers.                                          |
| **Called From** | `calculateCosts()`                                                  |
| **Calls To** | `document.getElementById()`, `document.createElement()`, `formatCurrency()` |
| **Side Effects** | Replaces innerHTML of 6 DOM containers                             |

---

### `loadPrices()` and `savePrices()`

| Property     | `loadPrices()`                              | `savePrices()`                              |
|--------------|---------------------------------------------|---------------------------------------------|
| **Purpose**  | Restore price inputs from localStorage      | Persist price inputs to localStorage        |
| **Called From** | `DOMContentLoaded`                       | body `input` listener (when `.price-input`) |
| **Side Effects** | Sets price input `.value` from storage  | Writes to `localStorage["material_prices"]` |

---

### `getPriceForMaterial(materialName)`

| Property     | Detail                                                                  |
|--------------|-------------------------------------------------------------------------|
| **Purpose**  | Reads current price per kg from the appropriate price input field.      |
| **Calls To** | `document.getElementById()`, `parseFloat()`                             |
| **Returns**  | `number` — price per kg, or 0 if not set                                |

---

### `formatCurrency(amount)`

| Property     | Detail                                              |
|--------------|-----------------------------------------------------|
| **Purpose**  | Formats a number as `₹XX.XX`                        |
| **Returns**  | `string`                                            |
| **Side Effects** | None — pure string formatter                    |

---

## G. SWG Helper (`js/swgData.js`)

---

### `getSWGForCurrent(current)`

| Property     | Detail                                                                  |
|--------------|-------------------------------------------------------------------------|
| **Purpose**  | Returns the recommended SWG number for a given conductor current.       |
| **Signature**| `getSWGForCurrent(current: number) → string | null`                     |
| **Called From** | `calculate()` — Steps 7 and 15 (primary and secondary conductor sizing) |
| **Calls To** | Array iteration over `swgTable`                                         |
| **Dependencies** | `swgTable[]` — must be loaded before this function is called       |
| **Side Effects** | None — pure lookup                                                  |

---

## H. Component Relationships Diagram

```
┌─────────────────────────────────────────────────────┐
│                    index.html (DOM)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │ input fields │  │ output fields │  │ FAB btns  │  │
│  │ (user data)  │  │ (auto/calc)  │  │ (onclick) │  │
│  └──────┬───────┘  └──────┬───────┘  └─────┬─────┘  │
│         │                 │                 │         │
└─────────│─────────────────│─────────────────│─────────┘
          │ input events    │ DOM writes      │ onclick
          ▼                 │                 ▼
┌─────────────────────┐     │   openSummary / closeSummary
│     app.js          │─────┘   clearAll / window.print
│                     │
│  [universal input]  │──► g() ──► calculate() ──► auto()
│  [change listener]  │                │
│                     │           getSWGForCurrent()
│  calculate()        │           generateStripSuggestions()
│  save() / load()    │           truncateToOneDecimal()
│  clearAll()         │
│  openSummary()      │──► localStorage ("split_tx")
│  closeSummary()     │
└──────────┬──────────┘
           │ data-cost-type DOM attributes (no function calls)
           ▼
┌─────────────────────┐
│   costModule.js     │──► calculateCosts() ──► renderCostUI()
│                     │──► loadPrices() / savePrices()
│   [DOMContentLoaded]│──► localStorage ("material_prices")
│   [body input]      │
└─────────────────────┘
           │
           ▼
┌─────────────────────┐
│    swgData.js       │  getSWGForCurrent() / swgTable[]
│   (global scope)    │
└─────────────────────┘
```
