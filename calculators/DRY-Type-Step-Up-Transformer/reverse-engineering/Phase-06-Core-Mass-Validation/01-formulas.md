# Phase 06 — Core Mass Validation
## File: 01-formulas.md

> **Scope:** Every engineering calculation belonging to Phase 6.
> Phase 6 corresponds to Step 18 in `js/app.js` (comment: `// --- PHASE 6: CORE MASS VALIDATION ---`).
> Phase 6 is the final engineering computation phase — it validates/computes the total
> core steel mass from the lamination frame perimeter and net cross-sectional area.
> No calculations from other phases are included.

---

## Step 18 — Core Frame Perimeter, Net Area & Core Mass

### Purpose
Computes the actual net cross-sectional area of the core (applying a stacking factor
to the selected core area), derives the total mean perimeter of the lamination frame
from four user-defined core path segment lengths, and multiplies these to obtain
the total core mass.

**Architecture note (from app.js comments):** The code explicitly computes
`actualNetArea` and `framePerimeterCalc` in JavaScript memory and passes them
directly to the mass formula WITHOUT reading them back from DOM fields. This is a
deliberate design choice ("CRITICAL FIX" comment in source) to avoid DOM read-back
errors for these intermediate values.

---

### Formula 18A — Actual Net Core Area

```
actualNetArea = Math.round(selectedArea * finalCoreSf)
```

Where:
- `selectedArea` is the core area from Phase 2 Step 5 (read directly as JS variable, not re-fetched)
- `finalCoreSf` is the final stacking factor read from `#finalCoreSf` (default: 0.98)

### Formula 18B — Auto-Population of Core Dimension Defaults

```
auto("coreD", tongueWidth)    [only if #coreD not user-edited]
auto("coreST", stackHeight)   [only if #coreST not user-edited]
```

This auto-populates two of the four segment fields with Phase 2 core dimensions
as starting defaults. The user can override all four.

### Formula 18C — Frame Perimeter

```
framePerimeterCalc = (2 * coreD) + (2 * coreL) + (2 * coreA) + (2 * coreST)
```

Where `coreD`, `coreL`, `coreA`, `coreST` are the four mean path segment lengths
of the lamination frame (all in mm).

### Formula 18D — Core Mass

```
coreMass = framePerimeterCalc * actualNetArea * rhoSteel * 1e-6
```

Where `rhoSteel` is the electrical steel density in g/cc (default: 7.65).

The unit conversion `1e-6` converts:
- `framePerimeterCalc` (mm) × `actualNetArea` (mm²) × `rhoSteel` (g/cc) → kg

---

### Variables Used — Step 18

| Symbol               | Description                                               | Source                         |
|----------------------|-----------------------------------------------------------|--------------------------------|
| `selectedArea`       | Core area from Phase 2 Step 5 (JS variable — not re-read) | Phase 2 JS variable            |
| `finalCoreSf`        | Final stacking factor for actual area calculation         | User input (default: 0.98)     |
| `actualNetArea`      | Rounded actual net core area                             | Computed here                  |
| `tongueWidth`        | Core tongue width (Phase 2 user input)                    | Phase 2 user input             |
| `stackHeight`        | Core stack height (Phase 2 user input)                    | Phase 2 user input             |
| `coreD`              | Mean path segment D of lamination frame (mm)              | User input (auto from tongueWidth) |
| `coreL`              | Mean path segment L of lamination frame (mm)              | User input (manual)            |
| `coreA`              | Mean path segment A of lamination frame (mm)              | User input (manual)            |
| `coreST`             | Mean path segment ST of lamination frame (mm)             | User input (auto from stackHeight) |
| `framePerimeterCalc` | Total lamination frame perimeter (mm)                     | Computed here (pure JS memory) |
| `rhoSteel`           | Electrical steel density (g/cc)                           | User input (default: 7.65)     |
| `coreMass`           | Total core steel mass (kg)                                | Computed here                  |

### Input Variables
- `finalCoreSf` — from `#finalCoreSf` (default: 0.98)
- `coreD` — from `#coreD` (auto-populated with `tongueWidth`, user can override)
- `coreL` — from `#coreL` (no auto-population — user must enter)
- `coreA` — from `#coreA` (no auto-population — user must enter)
- `coreST` — from `#coreST` (auto-populated with `stackHeight`, user can override)
- `rhoSteel` — from `#rhoSteel` (default: 7.65)

### Output Variables
- `actualNetArea` — written to `#actualNetAreaOutput` (raw integer — Math.round applied)
- `framePerimeterCalc` — written to `#framePerimeterOutput` (raw value — NO rounding)
- `coreMass` — written to `#coreMassOutput` as `parseFloat(coreMass.toFixed(2))`
  (also carries `data-cost-type="core"` and `data-cost-name="Core"` HTML attributes)

### User-Overridable Values
- `#coreD` — overridable (re-read as `coreD`)
- `#coreL` — user-entered and re-read as `coreL`
- `#coreA` — user-entered and re-read as `coreA`
- `#coreST` — overridable (re-read as `coreST`)
- `#actualNetAreaOutput` — overridable (NOT re-read — see architecture note below)
- `#coreMassOutput` — overridable

### Architecture Note — DOM Read-Back NOT Used for actualNetArea and framePerimeterCalc
```javascript
// From app.js (lines 568–572):
// "CRITICAL FIX: Calculate mass using the memory variables (framePerimeterCalc & actualNetArea)
// We no longer rely on g() to fetch these intermediate steps from the HTML."

let coreMass = (framePerimeterCalc !== null && actualNetArea !== null && rhoSteel !== null)
               ? (framePerimeterCalc * actualNetArea * rhoSteel * 1e-6)
               : null;
```

This means:
- `actualNetAreaOutput` IS written to the DOM (for display) but is NOT read back.
- `framePerimeterOutput` IS written to the DOM (for display) but is NOT read back.
- The mass formula uses the raw JS variables directly.
- Overriding `#actualNetAreaOutput` or `#framePerimeterOutput` in the UI has NO effect
  on the computed `coreMass`. This is intentional.

### Constants
- `1e-6` — unit conversion factor (hardcoded in mass formula)
- `2` — symmetric multiplier for each frame segment pair (hardcoded)

### Lookup Tables Referenced
- None.

### Rounding Applied
- `Math.round(selectedArea * finalCoreSf)` — rounds to nearest integer
- `framePerimeterCalc` — NO rounding (raw float written to DOM)
- `parseFloat(coreMass.toFixed(2))` — 2 decimal places
- See `05-rounding.md`.

### Guard Conditions
- `actualNetArea` guard: `selectedArea !== null`
- `framePerimeterCalc` guard: ALL of `coreD`, `coreL`, `coreA`, `coreST` non-null
- `coreMass` guard: `framePerimeterCalc !== null && actualNetArea !== null && rhoSteel !== null`

---

## Phase 6 — Completeness Review

### All Calculations Documented

| Step  | Calculation                                                                           | Documented |
|-------|---------------------------------------------------------------------------------------|------------|
| 18A   | actualNetArea = Math.round(selectedArea * finalCoreSf)                                | YES        |
| 18B   | auto("coreD", tongueWidth) / auto("coreST", stackHeight) [auto-population only]      | YES        |
| 18C   | framePerimeterCalc = (2*coreD) + (2*coreL) + (2*coreA) + (2*coreST)                 | YES        |
| 18D   | coreMass = framePerimeterCalc * actualNetArea * rhoSteel * 1e-6                      | YES        |

### Summary Modal Population (lines 583–637 of app.js)
The code after Step 18 in `calculate()` populates the summary modal display fields
(`#sumMaterial`, `#sumPriVolts`, `#sumSecVolts`, `#sumVA`, `#sumCore`, etc.) and
updates the modal SVG blueprint labels. These are purely UI formatting/display actions
that read values from previously-computed DOM fields. No new engineering calculations
are performed. They are documented separately in the UI/Report documentation (not in
the engineering extraction phases).

### Cross-Phase Contamination Check
- `selectedArea` is a Phase 2 JS variable used here WITHOUT re-computation. ✓
- `tongueWidth` and `stackHeight` are Phase 2 inputs used for auto-population defaults. ✓
- `coreMassOutput` carries data-cost attributes consumed by Phase 7. ✓
- Summary modal population is explicitly excluded from Phase 6 engineering scope. ✓

### Execution Order Verified
18A → 18B (auto-population) → 18C (perimeter) → 18D (mass) matches exact sequential
execution in `js/app.js` lines 542–581.
