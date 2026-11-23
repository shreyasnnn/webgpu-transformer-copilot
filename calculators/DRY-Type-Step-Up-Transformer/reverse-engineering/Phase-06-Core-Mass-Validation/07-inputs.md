# Phase 06 — Core Mass Validation
## File: 07-inputs.md

> **Scope:** Every user-facing input that directly participates in Phase 6 calculations.
> Inputs shared with earlier phases are cross-referenced.

---

## Inputs Inherited from Earlier Phases

### From Phase 2

| Field ID       | Variable       | Used in Phase 6 Steps               | Cross-Reference                               |
|----------------|----------------|--------------------------------------|-----------------------------------------------|
| `#tongueWidth` | `tongueWidth`  | Step 18B (auto-populates `#coreD`)   | Phase-02-Core-Area-Dimensions/07-inputs.md    |
| `#stackHeight` | `stackHeight`  | Step 18B (auto-populates `#coreST`)  | Phase-02-Core-Area-Dimensions/07-inputs.md    |

`selectedArea` is a Phase 2 JS variable (not a DOM field re-read in Phase 6).
See `Phase-02-Core-Area-Dimensions/03-variables.md`.

---

## Configurable Design Constants — Phase 6 Specific (Have Defaults)

### Input 1 — Final Stacking Factor

| Property             | Value                                                               |
|----------------------|---------------------------------------------------------------------|
| UI Label             | Final Stacking Factor                                               |
| Field ID             | `#finalCoreSf`                                                      |
| Variable Name        | `finalCoreSf`                                                       |
| Data Type            | Number (float, 0–1)                                                 |
| Unit                 | dimensionless (ratio)                                               |
| Default Value        | `0.98` (set via `|| 0.98` fallback in app.js)                       |
| Required             | Yes — fallback to `0.98` if null                                    |
| User Editable        | Yes                                                                 |
| HTML Attributes      | `type="number"`, `step="any"`, `inputmode="decimal"`                |
| Validation Rules     | No explicit JS validation.                                          |
| Part of baseConstants| YES                                                                 |
| Used In Steps        | Step 18A (`actualNetArea = Math.round(selectedArea * finalCoreSf)`) |

---

### Input 2 — Core Segment D (Mean Path — auto-populated)

| Property             | Value                                                               |
|----------------------|---------------------------------------------------------------------|
| UI Label             | Core D (mm)                                                         |
| Field ID             | `#coreD`                                                            |
| Variable Name        | `coreD`                                                             |
| Data Type            | Number (float)                                                      |
| Unit                 | mm                                                                  |
| Default Value        | Auto-populated with `tongueWidth` via `auto("coreD", tongueWidth)`  |
| Required             | Yes — if null, `framePerimeterCalc` = null                          |
| User Editable        | Yes — user can override the auto-populated value                    |
| HTML Attributes      | `type="number"`, `step="any"`, `inputmode="decimal"`                |
| Validation Rules     | No explicit JS validation.                                          |
| Part of baseConstants| YES                                                                 |
| Used In Steps        | Step 18C (`(2 * coreD)` in perimeter formula)                       |

**Note:** Auto-population uses the `auto()` helper. If the user has previously
set `data-edited` on this field, the auto-population is skipped.

---

### Input 3 — Core Segment L (Mean Path — no auto-population)

| Property             | Value                                                               |
|----------------------|---------------------------------------------------------------------|
| UI Label             | Core L (mm)                                                         |
| Field ID             | `#coreL`                                                            |
| Variable Name        | `coreL`                                                             |
| Data Type            | Number (float)                                                      |
| Unit                 | mm                                                                  |
| Default Value        | NONE — field starts empty, no auto-population                       |
| Required             | Yes — if null, `framePerimeterCalc` = null                          |
| User Editable        | Yes — must be entered manually                                      |
| HTML Attributes      | `type="number"`, `step="any"`, `inputmode="decimal"`                |
| Validation Rules     | No explicit JS validation.                                          |
| Part of baseConstants| YES                                                                 |
| Used In Steps        | Step 18C (`(2 * coreL)` in perimeter formula)                       |

---

### Input 4 — Core Segment A (Mean Path — no auto-population)

| Property             | Value                                                               |
|----------------------|---------------------------------------------------------------------|
| UI Label             | Core A (mm)                                                         |
| Field ID             | `#coreA`                                                            |
| Variable Name        | `coreA`                                                             |
| Data Type            | Number (float)                                                      |
| Unit                 | mm                                                                  |
| Default Value        | NONE — field starts empty, no auto-population                       |
| Required             | Yes — if null, `framePerimeterCalc` = null                          |
| User Editable        | Yes — must be entered manually                                      |
| HTML Attributes      | `type="number"`, `step="any"`, `inputmode="decimal"`                |
| Validation Rules     | No explicit JS validation.                                          |
| Part of baseConstants| YES                                                                 |
| Used In Steps        | Step 18C (`(2 * coreA)` in perimeter formula)                       |

---

### Input 5 — Core Segment ST (Mean Path — auto-populated)

| Property             | Value                                                               |
|----------------------|---------------------------------------------------------------------|
| UI Label             | Core ST (mm)                                                        |
| Field ID             | `#coreST`                                                           |
| Variable Name        | `coreST`                                                            |
| Data Type            | Number (float)                                                      |
| Unit                 | mm                                                                  |
| Default Value        | Auto-populated with `stackHeight` via `auto("coreST", stackHeight)` |
| Required             | Yes — if null, `framePerimeterCalc` = null                          |
| User Editable        | Yes — user can override the auto-populated value                    |
| HTML Attributes      | `type="number"`, `step="any"`, `inputmode="decimal"`                |
| Validation Rules     | No explicit JS validation.                                          |
| Part of baseConstants| YES                                                                 |
| Used In Steps        | Step 18C (`(2 * coreST)` in perimeter formula)                      |

---

### Input 6 — Steel Density

| Property             | Value                                                               |
|----------------------|---------------------------------------------------------------------|
| UI Label             | Steel Density rho (g/cc)                                            |
| Field ID             | `#rhoSteel`                                                         |
| Variable Name        | `rhoSteel`                                                          |
| Data Type            | Number (float)                                                      |
| Unit                 | g/cc                                                                |
| Default Value        | `7.65` (set via `|| 7.65` fallback in app.js)                       |
| Required             | Yes — fallback to `7.65` if null                                    |
| User Editable        | Yes                                                                 |
| HTML Attributes      | `type="number"`, `step="any"`, `inputmode="decimal"`                |
| Validation Rules     | No explicit JS validation.                                          |
| Part of baseConstants| YES                                                                 |
| Used In Steps        | Step 18D (`coreMass = ... * rhoSteel * 1e-6`)                       |

---

## Display-Only (Computed — NOT User-Editable for Mass Formula)

| Field ID                 | Content                        | Override Effect                          |
|--------------------------|--------------------------------|------------------------------------------|
| `#actualNetAreaOutput`   | Net core area (mm², integer)   | Written to DOM for display ONLY. Overriding has NO effect on coreMass. |
| `#framePerimeterOutput`  | Frame perimeter (mm)           | Written to DOM for display ONLY. Overriding has NO effect on coreMass. |

## Editable Override (Affects Phase 7 Cost Module)

| Field ID          | UI Label          | Produced By | Override Effect                        |
|-------------------|-------------------|-------------|----------------------------------------|
| `#coreMassOutput` | Core Mass (kg)    | Step 18D    | Overridable — read by Phase 7 cost module |

---

## Input Helper Functions

Phase 6 uses the same `g(id)` and `auto(id, val)` helper functions as Phase 1.
See `Phase-01-Capacity-and-Electrical-Turns/07-inputs.md` for full definitions.

### The `auto()` Suppression Behavior (Critical for coreD and coreST)

```javascript
function auto(id, val) {
    let el = document.getElementById(id);
    if (!el) return;
    if (el.dataset.edited) return;   // <-- suppresses auto-populate if user edited
    if (val === null || val === undefined) { el.value = ""; return; }
    el.value = val;
}
```

When the user manually types into `#coreD` or `#coreST`, the field gets
`data-edited="true"` set by the input event listener. After that, subsequent
`calculate()` calls will NOT overwrite their values from `tongueWidth`/`stackHeight`.
