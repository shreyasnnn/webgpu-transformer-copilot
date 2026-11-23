# Comprehensive Codebase Re-Audit: DRY-Type Step-Up Transformer

**Date of Audit:** 2026-11-22  
**Auditor Roles:** Senior Software Architect, Senior JavaScript/TypeScript Engineer, Electrical Transformer Design Software Engineer  
**Audit Target:** `DRY-Type-Step-Up-Transformer`  
**Platform Root:** `COMBINED_TRIAL_03` (`c:\Users\nshre\Desktop\projects\srinivas_uncle\COMBINED_TRIAL_03`)  
**Reference Legacy Base:** `calculators/DRY-Type-Step-Up-Transformer/OLD_PROJECT_CODE/` and `c:\Users\nshre\Desktop\projects\srinivas_uncle\VA-Calculator\DRY-Type-Step-Up-Transformer/`  
**Status:** AUDIT ONLY (Read-Only Investigation Complete — Implementation Halted Awaiting Approval)

---

## 1. Executive Summary

This comprehensive audit was executed to evaluate the architectural, software engineering, and electrical design state of the **Dry-Type Step-Up Transformer (Split-Bobbin)** calculator within the commercial Transformer Engineering Platform (`COMBINED_TRIAL_03`).

### High-Level Findings:
1. **Backend Calculation Engine (`supabase/functions/calculate-dry-type`):**
   - **Architectural Separation:** The backend has successfully isolated engineering calculations from UI markup into a stateless Supabase Edge Function running on Deno / TypeScript.
   - **Phased Calculation Coverage:** Phases 1 through 6 (Steps 1 through 18) are fully implemented across isolated phase modules (`phase1.ts` to `phase6.ts`).
   - **Unit Testing Health:** 18 automated Deno unit tests exist across all six phases and the summary generator; all 18 pass cleanly (`0 failed`).
   - **Interactive Milestone Status:**
     - *Milestone 1 (Backend Contracts & Core Phases):* Implemented, but contains decimal precision/rounding inconsistencies and one missing override handler (`priWeightOutput_override`).
     - *Milestone 2 (Conductor Material & SWG Override):* Implemented. Material density switching works; SWG override reverse-lookup correctly overrides diameter, though diameter derivation assumes fixed $2.5\text{ A/mm}^2$ current density.
     - *Milestone 3 (Conductor Geometry — Flat/Round):* Implemented with conditional validation and strip suggestions. However, legacy engineering physical flaws (using round insulated wire area to calculate flat strip mass) were preserved for bug-for-bug backward compatibility.
     - *Milestone 4 (Engineering Summary):* Partially implemented. The summary generator maps key electrical and core values, but **omits bobbin weight and clamp weight**, and computes total weight strictly from core mass + winding weight.

2. **Frontend Implementation (`frontend/`):**
   - **Status: NOT IMPLEMENTED (0 files).** The `frontend/` directory in `COMBINED_TRIAL_03` is completely empty. The modern UI, event-driven batch "Calculate" trigger, dynamic override state management, SVG blueprint rendering, and live material cost module have not yet been developed for the new platform.
   - The only working frontend that currently exists is the legacy monolithic vanilla HTML/JS application located in `OLD_PROJECT_CODE/`.

3. **SVG Blueprint Architecture:**
   - **Status: NOT IMPLEMENTED IN BACKEND / MISSING IN MODERN FRONTEND.**
   - In the legacy application, the SVG is a pair of static HTML drawings with 5 dynamic `<text>` labels for bobbin dimensions ($a, b, c, d, h$).
   - The backend Edge Function does not generate SVG markup or strings; it returns raw numerical bobbin dimensions. No modern frontend component exists to render or update these SVGs.

4. **Security & Deployment:**
   - Supabase configuration is set to `verify_jwt = false` for local development.
   - A plain-text credential file (`passwords.txt`) was discovered at the project root (`COMBINED_TRIAL_03`), representing a severe security risk if committed to remote repositories.

---

## 2. Complete Project Structure

```text
COMBINED_TRIAL_03/
├── .vscode/
│   ├── extensions.json                          # Recommended VS Code extensions (Deno, Supabase)
│   └── settings.json                            # Deno linting and formatting settings
├── calculators/
│   └── DRY-Type-Step-Up-Transformer/            # Permanent engineering reference archive
│       ├── OLD_PROJECT_CODE/                    # Legacy monolithic baseline codebase
│       │   ├── css/
│       │   │   └── style.css                    # Legacy stylesheet + print styles (478 lines)
│       │   ├── js/
│       │   │   ├── app.js                       # Monolithic JS engine + DOM event cascade (714 lines)
│       │   │   ├── costModule.js                # Client-side Material Cost estimation (201 lines)
│       │   │   └── swgData.js                   # Legacy SWG table and lookup helper (73 lines)
│       │   └── index.html                       # Monolithic HTML UI + SVG blueprints (741 lines)
│       └── reverse-engineering/                 # PRIMARY engineering specification
│           ├── Architecture/                    # 4 architectural reverse-engineering specifications
│           │   ├── 01-application-flow.md
│           │   ├── 02-ui-structure.md
│           │   ├── 03-project-structure.md
│           │   └── 04-components-and-events.md
│           ├── Interactive-Systems/             # 4 interactive feature specifications
│           │   ├── 01-conductor-material.md
│           │   ├── 02-swg-override.md
│           │   ├── 03-conductor-geometry.md
│           │   └── 04-summary.md
│           ├── Phase-01-Capacity-and-Electrical-Turns/         (7 spec files: 01-formulas to 07-inputs)
│           ├── Phase-02-Core-Area-Dimensions/                  (7 spec files: 01-formulas to 07-inputs)
│           ├── Phase-03-Primary-Winding-Design/                (7 spec files: 01-formulas to 07-inputs)
│           ├── Phase-04-Mechanical-Hardware-Clamps-and-Bobbins/ (7 spec files: 01-formulas to 07-inputs)
│           ├── Phase-05-Secondary-Winding-Design/              (7 spec files: 01-formulas to 07-inputs)
│           └── Phase-06-Core-Mass-Validation/                  (7 spec files: 01-formulas to 07-inputs)
├── frontend/                                    # Target directory for modern frontend (EMPTY: 0 files)
├── project_knowledge/                           # Implementation governance and architecture rules
│   ├── 01-project-overview.md
│   ├── 02-architecture-principles.md
│   ├── 03-implementation-rules.md
│   ├── 04-engineering-rules.md
│   └── 05-progress.md                           # Progress tracker (outdated status)
├── supabase/
│   ├── config.toml                              # Local Supabase configuration and function routing
│   └── functions/
│       ├── calculate-dry-type/                  # Bounded context for Dry-Type Transformer
│       │   ├── constants/
│       │   │   └── dryTypeDefaults.ts           # Centralized fallback defaults (60 lines)
│       │   ├── models/
│       │   │   └── index.ts                     # TypeScript contracts and payload types (331 lines)
│       │   ├── phases/                          # Pure calculation engine modules
│       │   │   ├── phase1.ts                    # Steps 1–4: VA, kVA, VT, Turns (118 lines)
│       │   │   ├── phase2.ts                    # Steps 5–6: Core Area Dimensions (73 lines)
│       │   │   ├── phase3.ts                    # Steps 7–10: Primary Winding (239 lines)
│       │   │   ├── phase4.ts                    # Steps 11–14: Mechanical Clamps & Bobbin (154 lines)
│       │   │   ├── phase5.ts                    # Steps 15–17: Secondary Winding (235 lines)
│       │   │   └── phase6.ts                    # Step 18: Core Mass Validation (56 lines)
│       │   ├── summary/
│       │   │   └── generateSummary.ts           # Milestone 4 summary mapper (59 lines)
│       │   ├── tests/
│       │   │   ├── phases/
│       │   │   │   ├── phase1.test.ts           # Phase 1 unit tests (65 lines, 2 tests)
│       │   │   │   ├── phase2.test.ts           # Phase 2 unit tests (105 lines, 3 tests)
│       │   │   │   ├── phase3.test.ts           # Phase 3 unit tests (191 lines, 4 tests)
│       │   │   │   ├── phase4.test.ts           # Phase 4 unit tests (87 lines, 2 tests)
│       │   │   │   ├── phase5.test.ts           # Phase 5 unit tests (175 lines, 4 tests)
│       │   │   │   └── phase6.test.ts           # Phase 6 unit tests (83 lines, 2 tests)
│       │   │   └── summary/
│       │   │       └── summary.test.ts          # Summary unit tests (81 lines, 1 test)
│       │   ├── utils/
│       │   │   ├── geometryUtils.ts             # Strip suggestion factor generator (20 lines)
│       │   │   └── index.ts                     # Decimal truncation helper (18 lines)
│       │   ├── deno.json                        # Deno import map
│       │   ├── deno.lock                        # Deno lockfile
│       │   ├── index.ts                         # Edge Function HTTP entry point & validator (130 lines)
│       │   └── V2-ENGINEERING-IMPROVEMENTS.md   # Architectural documentation of legacy physics flaws
│       ├── shared/
│       │   └── lookups/                         # Universal immutable hardware lookup catalogs
│       │       ├── bobbinData.ts                # Standard workshop bobbin dimensions (166 lines)
│       │       ├── laminationData.ts            # Workshop EI lamination table (45 lines)
│       │       └── swgData.ts                   # Standard Wire Gauge table SWG 8–50 (92 lines)
│       └── IMPLEMENTATION-CONVENTIONS.md        # Master architectural and design conventions (306 lines)
├── commands.txt                                 # Developer terminal cheat sheet for local running
├── passwords.txt                                # Plain-text credentials file (CRITICAL RISK)
├── prompts.txt                                  # Prompt sequence log for previous milestones (598 lines)
├── temp.ts                                      # Standalone Deno calculation runner (123 lines)
├── test-api.ts                                  # Standalone HTTP endpoint integration test (65 lines)
├── package.json                                 # Node package stub (CommonJS, 13 lines)
└── deno.lock                                    # Platform Deno lockfile
```

---

## 3. File Inventory and Responsibilities

| File Path | Lines | Primary Responsibility | Architectural Layer |
| :--- | :--- | :--- | :--- |
| `supabase/functions/calculate-dry-type/index.ts` | 130 | HTTP entry point: CORS handling, JSON payload parsing, flat wire conditional validation, material density injection, sequential execution of phases 1–6, summary generation. | Backend / Controller |
| `supabase/functions/calculate-dry-type/models/index.ts` | 331 | Centralized TypeScript interfaces: `TransformerApiRequest`, `TransformerApiResponse`, `TransformerInput`, `Phase1Output` through `Phase6Output`, and `SummaryOutput`. | Backend / Domain Contract |
| `supabase/functions/calculate-dry-type/constants/dryTypeDefaults.ts` | 60 | Default physical, electrical, and hardware design constants for Dry-Type transformers. | Backend / Configuration |
| `supabase/functions/calculate-dry-type/phases/phase1.ts` | 118 | Phase 1: VA capacity, kVA, baseline $V/T$, primary turns, actual $V/T$, secondary turns. | Backend / Engineering Engine |
| `supabase/functions/calculate-dry-type/phases/phase2.ts` | 73 | Phase 2: Net magnetic core area, gross core area required, selected core physical area. | Backend / Engineering Engine |
| `supabase/functions/calculate-dry-type/phases/phase3.ts` | 239 | Phase 3: Primary conductor sizing (round/flat), SWG lookup/override, turns/limb, TPL, layers, radial build, primary LMT, and copper mass. | Backend / Engineering Engine |
| `supabase/functions/calculate-dry-type/phases/phase4.ts` | 154 | Phase 4: L-clamp span and length, L-clamp weight, bobbin cavity/shell dimensions, and bobbin weight. | Backend / Engineering Engine |
| `supabase/functions/calculate-dry-type/phases/phase5.ts` | 235 | Phase 5: Secondary conductor sizing (round/flat), SWG lookup/override, turns/limb, TPL, layers, radial build, secondary LMT, and copper mass. | Backend / Engineering Engine |
| `supabase/functions/calculate-dry-type/phases/phase6.ts` | 56 | Phase 6: Actual net core area, lamination frame perimeter, core steel mass calculation. | Backend / Engineering Engine |
| `supabase/functions/calculate-dry-type/summary/generateSummary.ts` | 59 | Aggregates phase outputs into structured manufacturing summary groups (electrical, core, primary, secondary, hardware, totals). | Backend / Presentation Adapter |
| `supabase/functions/calculate-dry-type/utils/geometryUtils.ts` | 20 | Generates integer factor pair dimension suggestions for rectangular flat conductor strips. | Backend / Utility |
| `supabase/functions/calculate-dry-type/utils/index.ts` | 18 | `truncateToOneDecimal`: Mathematical floor-based truncation to 1 decimal place (`Math.floor(x * 10) / 10`). | Backend / Utility |
| `supabase/functions/shared/lookups/swgData.ts` | 92 | Standard Wire Gauge lookup table (SWG 8 to 50), closest current capacity finder, reverse bare diameter calculator. | Shared / Hardware Catalog |
| `supabase/functions/shared/lookups/bobbinData.ts` | 166 | Universal bobbin size catalog for workshop EI laminations. (Currently unreferenced by Dry-Type). | Shared / Hardware Catalog |
| `supabase/functions/shared/lookups/laminationData.ts` | 45 | Universal EI lamination dimensions and stacking coefficients. (Currently unreferenced by Dry-Type). | Shared / Hardware Catalog |
| `supabase/functions/calculate-dry-type/tests/phases/phase1.test.ts` | 65 | Automated regression unit tests for Phase 1 calculations and override behaviors. | Test Suite |
| `supabase/functions/calculate-dry-type/tests/phases/phase2.test.ts` | 105 | Automated regression unit tests for Phase 2 core area calculations, overrides, and null handling. | Test Suite |
| `supabase/functions/calculate-dry-type/tests/phases/phase3.test.ts` | 191 | Automated regression unit tests for Phase 3 round wire, aluminium override, flat wire, and SWG override. | Test Suite |
| `supabase/functions/calculate-dry-type/tests/phases/phase4.test.ts` | 87 | Automated regression unit tests for Phase 4 clamp and bobbin dimensions, weights, and overrides. | Test Suite |
| `supabase/functions/calculate-dry-type/tests/phases/phase5.test.ts` | 175 | Automated regression unit tests for Phase 5 secondary sizing, flat wire, aluminium override, and SWG override. | Test Suite |
| `supabase/functions/calculate-dry-type/tests/phases/phase6.test.ts` | 83 | Automated regression unit tests for Phase 6 frame perimeter, actual net area, and core mass. | Test Suite |
| `supabase/functions/calculate-dry-type/tests/summary/summary.test.ts` | 81 | Automated unit tests for summary object structure and metric mappings. | Test Suite |
| `temp.ts` | 123 | Developer testing script executing in-memory phase chains and verifying override outputs. | Integration / Utility |
| `test-api.ts` | 65 | Developer testing script verifying HTTP POST behavior against Edge Function. | Integration / Utility |
| `frontend/` | 0 | Directory intended for the modern user interface. Currently completely empty. | Frontend Layer |
| `calculators/DRY-Type-Step-Up-Transformer/OLD_PROJECT_CODE/index.html` | 741 | Legacy single-page UI with inline cards, summary modal, and embedded SVGs. Reference only. | Legacy Verification Reference |
| `calculators/DRY-Type-Step-Up-Transformer/OLD_PROJECT_CODE/js/app.js` | 714 | Legacy monolithic calculation script with DOM scraping and dataset override tracking. | Legacy Verification Reference |
| `calculators/DRY-Type-Step-Up-Transformer/OLD_PROJECT_CODE/js/costModule.js` | 201 | Standalone client-side cost calculation module listening to weight DOM attributes. | Legacy Verification Reference |

---

## 4. Architecture Overview

### Architectural Philosophy
The platform follows a strict **Client-Server Decoupling** with a **Stateless Event-Driven Calculation Engine**:

```
+--------------------------------------------------------------------------------------------------+
|                                          FRONTEND LAYER                                          |
|                               (Currently 0 files in frontend/)                                   |
|                                                                                                  |
|  [ User Inputs ] ---> [ Override Tracker ] ---> [ "Calculate" Click ] ---> [ Material Cost UI ] |
|         ^                                                 |                         ^            |
|         |                                                 v                         |            |
|  [ Render Form Fields ] <-------------------- [ HTTP POST Payload ]        [ (Weight x Price) ]  |
|  [ Update SVG Labels ]                                    |                         ^            |
+-----------------------------------------------------------|-------------------------|------------+
                                                            | JSON                    |
                                                            v                         |
+-------------------------------------------------------------------------------------|------------+
|                                      BACKEND / SUPABASE EDGE                                     |
|                                                                                     |            |
|   index.ts (CORS, Request Parsing, Conditional Flat Validation, Density Resolution) |            |
|          |                                                                          |            |
|          +--> calculatePhase1 (Steps 1-4: Capacity, V/T, Turns)                     |            |
|          |         |                                                                |            |
|          +--> calculatePhase2 (Steps 5-6: Net & Gross Core Area)                    |            |
|          |         |                                                                |            |
|          +--> calculatePhase3 (Steps 7-10: Primary Winding, SWG / Flat, Weight) ----+            |
|          |         |                                                                |            |
|          +--> calculatePhase4 (Steps 11-14: L-Clamps, Bobbin, Clearances) ----------+            |
|          |         |                                                                |            |
|          +--> calculatePhase5 (Steps 15-17: Secondary Winding, SWG / Flat, Weight) -+            |
|          |         |                                                                |            |
|          +--> calculatePhase6 (Step 18: Frame Perimeter, Core Steel Mass) ----------+            |
|          |         |                                                                             |
|          +--> generateSummary (Milestone 4: Aggregated Report Output)                            |
|                    |                                                                             |
|                    v                                                                             |
|          [ HTTP JSON Response: { success: true, engineering: { ... }, summary: { ... } } ]        |
+--------------------------------------------------------------------------------------------------+
```

### Architectural Tenets:
1. **Zero Engineering Formulas in Frontend:** The frontend is strictly a presentation and input collection layer. It does not compute electrical turns, magnetic flux, wire dimensions, or weights. *(Exception: Weight $\times$ User-Entered Unit Price is permitted on the client for live cost estimation).*
2. **Stateless Backend:** The Edge Function stores no session state in memory or database. Every invocation is pure: the client sends all base inputs and active overrides; the backend returns the entire recalculated tree.
3. **Bounded Context per Calculator:** Each transformer calculator owns its own models, constants, phases, utilities, and tests in `supabase/functions/calculate-[type]/`. Calculators cannot import from other calculators.
4. **Universal Shared Data:** Only universally immutable physical catalogs (`swgData.ts`, `laminationData.ts`, `bobbinData.ts`) reside in `supabase/functions/shared/`.

---

## 5. Frontend Workflow

### Current Implementation State: **NOT IMPLEMENTED**
The `frontend/` directory in `COMBINED_TRIAL_03` is currently empty. The workflow described below reflects the intended design documented in `PROJECT_KNOWLEDGE/` and `reverse-engineering/` versus the legacy behavior in `OLD_PROJECT_CODE/`.

### Intended Modern Workflow:
1. **Input Collection:** User enters nominal specifications:
   - Primary: Secondary Voltage ($V_{\text{sec}}$), Secondary Current ($I_{\text{sec}}$), Primary Voltage ($V_{\text{pri}}$).
   - Core: Tongue Width, Stack Height, Window Dimensions ($coreL$, $coreA$).
   - Bobbin: Primary Bobbin Height ($bobbinHeightPri$), Secondary Bobbin Height ($bobbinHeightSec$).
   - Conductor: Conductor Material (Copper vs. Aluminium), Wire Type (Round vs. Flat), Flat Dimensions ($Breadth, Height, Parallel$) if applicable.
2. **Override Management:** When an engineer modifies an intermediate field (such as $V/T$, primary turns, bare diameter, or radial thickness), the frontend records that value in an `overrides` dictionary.
3. **Calculation Trigger:** The user clicks a global **"Calculate"** button. The frontend dispatches a single batch JSON POST request containing `{ inputs: { ... }, overrides: { ... } }` to `/functions/v1/calculate-dry-type`.
4. **Response Rendering:** Upon receiving the HTTP 200 payload:
   - Numerical outputs are mapped to their respective display spans/inputs.
   - If `priSWG` or `secSWG` is $\le 13$, the flat wire section is unhidden.
   - If `priGeometry.showAreaWarning` is true, a $>10\%$ mismatch warning banner is displayed with `priGeometry.suggestions`.
   - Bobbin blueprint dimensions ($a, b, c, d, h$) are bound to the SVG text labels.
   - Winding weights are forwarded to the client-side cost module.

### Legacy Workflow (`OLD_PROJECT_CODE/`):
- Relied on real-time DOM scraping via `g(id)` and `auto(id, val)` on every input keystroke.
- State was stored directly in HTML input elements and `dataset.edited` attributes.
- Monolithic `calculate()` in `app.js` executed all 18 steps synchronously in DOM order.

---

## 6. Backend Workflow

### Actual Execution Sequence (`supabase/functions/calculate-dry-type/index.ts`):

```text
HTTP POST /functions/v1/calculate-dry-type
  │
  ├─ 1. CORS Preflight Check (OPTIONS -> 200 OK)
  │
  ├─ 2. JSON Request Body Deserialization
  │     Extracts `rawReq.inputs` and `rawReq.overrides`
  │
  ├─ 3. Default Flag Population
  │     Sets default booleans if undefined:
  │     isPriFlat = false, isSecFlat = false, priParallel = 1, secParallel = 1
  │
  ├─ 4. Conditional Validation Check (Flat Wire Dimensions)
  │     If isPriFlat == true:
  │       Verifies priFlatBreadth != null AND priFlatHeight != null
  │     If isSecFlat == true:
  │       Verifies secFlatBreadth != null AND secFlatHeight != null
  │     [Failure] -> Returns HTTP 400 { success: false, message: "...", errors: [...] }
  │
  ├─ 5. Dynamic Parameter Resolution (Conductor Material -> Density)
  │     Resolves `rhoCu` from overrides or inputs:
  │     - If conductorMaterial == "Aluminium" -> rhoCu = aluminiumDensity (2.703 g/cm³)
  │     - Else -> rhoCu = copperDensity (8.89 g/cm³)
  │
  ├─ 6. Input Hydration
  │     Merges: DRY_TYPE_DEFAULTS + userInputs + userOverrides + rhoCu -> flat `TransformerInput`
  │
  ├─ 7. Sequential Engineering Pipeline Execution
  │     ├─ calculatePhase1(input)
  │     ├─ calculatePhase2(input, phase1Result)
  │     ├─ calculatePhase3(input, phase1Result, phase2Result)
  │     ├─ calculatePhase4(input, phase3Result)
  │     ├─ calculatePhase5(input, phase1Result, phase3Result)
  │     └─ calculatePhase6(input, phase2Result)
  │
  ├─ 8. Summary Generation
  │     generateSummary(input, p1, p2, p3, p4, p5, p6)
  │
  └─ 9. HTTP 200 JSON Response
        {
          success: true,
          engineering: { phase1, phase2, phase3, phase4, phase5, phase6 },
          summary
        }
```

---

## 7. Engineering Calculation Inventory

This inventory documents all 18 engineering steps currently implemented across `supabase/functions/calculate-dry-type/phases/`.

### Phase 01: Capacity and Electrical Turns (`phase1.ts`)

#### Step 1: Total VA & kVA Capacity
- **Engineering Variable:** $VA, kVA$
- **Input Dependencies:** $vSecInput, iSecInput$
- **Formulas:**
  $$\text{VA} = vSecInput \times iSecInput$$
  $$\text{kVA} = \frac{\text{VA}}{1000}$$
- **Source File & Function:** `phases/phase1.ts` -> `calculatePhase1()`
- **Output Variables:** `vaOutput` (rounded 2dp), `kvaOutput` (rounded 3dp), `kvaInput` (rounded 3dp)
- **Rounding Behavior:** `parseFloat(va.toFixed(2))`, `parseFloat(kva.toFixed(3))`
- **Units:** Volt-Amperes ($\text{VA}$), Kilovolt-Amperes ($\text{kVA}$)

#### Step 2: Volts Per Turn (Baseline V/T)
- **Engineering Variable:** $V/T_{\text{baseline}}$
- **Input Dependencies:** $k$ (default 0.8), `kvaInput` (Step 1)
- **Formula:**
  $$\text{rawVt} = k \times \sqrt{kvaInput}$$
  $$vt = \frac{\lfloor\text{rawVt} \times 10\rfloor}{10}$$
- **Source File & Function:** `phases/phase1.ts` -> `calculatePhase1()`
- **Output Variables:** `vt`, `vtInput`
- **Rounding Behavior:** Truncation to 1 decimal place using `truncateToOneDecimal` ($\text{Math.floor}(x \times 10)/10$).
- **Units:** Volts per turn ($\text{V/turn}$)

#### Step 3: Primary Turns & Actual Volts Per Turn
- **Engineering Variable:** $N_{\text{pri}}, V/T_{\text{actual}}$
- **Input Dependencies:** $primaryVoltage$, `vtInput` (Step 2)
- **Formulas:**
  $$primaryTurns = \left\lceil \frac{primaryVoltage}{vtInput} \right\rceil$$
  $$\text{rawActualVT} = \frac{primaryVoltage}{primaryTurns}$$
  $$actualVT = \frac{\lfloor\text{rawActualVT} \times 10\rfloor}{10}$$
- **Source File & Function:** `phases/phase1.ts` -> `calculatePhase1()`
- **Output Variables:** `primaryTurns`, `actualVT`, `actualVTInput`, `secondaryVoltage`
- **Rounding Behavior:** `primaryTurns` is $\text{Math.ceil}()$; `actualVT` is truncated to 1 decimal place.
- **Units:** Integer turns, $\text{V/turn}$, Volts ($\text{V}$)

#### Step 4: Secondary Turns
- **Engineering Variable:** $N_{\text{sec}}$
- **Input Dependencies:** `secondaryVoltage` (Step 3), `actualVTInput` (Step 3)
- **Formula:**
  $$secondaryTurns = \left\lceil \frac{secondaryVoltage}{actualVTInput} \right\rceil$$
- **Source File & Function:** `phases/phase1.ts` -> `calculatePhase1()`
- **Output Variables:** `secondaryTurns`
- **Rounding Behavior:** $\text{Math.ceil}()$ (integer turns).
- **Units:** Integer turns

---

### Phase 02: Core Area Dimensions (`phase2.ts`)

#### Step 5: Net Core Area
- **Engineering Variable:** $A_{\text{net}}$
- **Input Dependencies:** `netAreaVTInput` (from Step 2 $vtInput$), $fluxDensity$ (Tesla, default 1.0), $frequency$ (Hz, default 50)
- **Formula:**
  $$netArea = \frac{netAreaVTInput \times 10^6}{4.44 \times fluxDensity \times frequency}$$
- **Source File & Function:** `phases/phase2.ts` -> `calculatePhase2()`
- **Output Variables:** `netAreaOutput`, `netAreaInput`
- **Rounding Behavior:** $\text{Math.round}(netArea)$ to nearest integer $\text{mm}^2$.
- **Units:** Square millimeters ($\text{mm}^2$)

#### Step 6: Gross Core Area & Selected Physical Area
- **Engineering Variable:** $A_{\text{gross}}, A_{\text{selected}}$
- **Input Dependencies:** `netAreaInput` (Step 5), $stackingFactor$ (default 0.9), $tongueWidth$, $stackHeight$
- **Formulas:**
  $$grossArea = \text{Math.round}\left(\frac{netAreaInput}{stackingFactor}\right)$$
  $$selectedArea = tongueWidth \times stackHeight$$
- **Source File & Function:** `phases/phase2.ts` -> `calculatePhase2()`
- **Output Variables:** `grossArea`, `selectedArea`
- **Rounding Behavior:** `grossArea` is $\text{Math.round}()$; `selectedArea` has **NO rounding** (raw float product).
- **Units:** Square millimeters ($\text{mm}^2$)

---

### Phase 03: Primary Winding Design (`phase3.ts`)

#### Step 7: Primary Conductor Sizing
- **Engineering Variable:** $I_{\text{pri}}, A_{\text{pri}}, d_{\text{bare}}, d_{\text{std}}, d_{\text{ins}}, \text{SWG}$
- **Input Dependencies:** $vaOutput$ (Phase 1), $primaryVoltage$, $delta$ (current density $\text{A/mm}^2$, default 2.5), $priInsAdd$ (default 0.1), $isPriFlat$, $priFlatBreadth$, $priFlatHeight$, $priParallel$, `priSwgOverride`
- **Formulas:**
  $$iPri = \frac{vaOutput}{primaryVoltage}$$
  $$priArea = \frac{iPri}{delta}$$
  $$bareDiaPri = \sqrt{\frac{priArea \times 4}{\pi}} \quad \text{(or from reverse lookup if SWG overridden)}$$
  $$priBareStd = \frac{\lfloor\text{parseFloat}(bareDiaPri\text{.toFixed}(2)) \times 10\rfloor}{10}$$
  $$insDiaPri = priBareStd + priInsAdd$$
  $$\text{Flat Effective Height} = priFlatHeight \times priParallel$$
  $$\text{Flat Effective Area} = priFlatBreadth \times \text{Flat Effective Height}$$
- **Source File & Function:** `phases/phase3.ts` -> `calculatePhase3()`
- **Output Variables:** `iPri`, `priArea`, `bareDiaPri`, `priBareStd`, `insDiaPri`, `insDiaPriUsed`, `priSWG`, `priShowFlatSection`, `priGeometry`
- **Rounding Behavior:**
  - `iPriUsed` read-back formatted to 2dp.
  - `bareDiaPri`: **CONFIRMED INCONSISTENCY:** Unrounded raw float stored in `out.bareDiaPri`.
  - `priBareStd`: Truncated to 1dp via `Math.floor(x * 10) / 10`.
  - `insDiaPriUsed`: Formatted to 2dp.
- **Units:** Amperes ($\text{A}$), $\text{mm}^2$, millimeters ($\text{mm}$), string gauge

#### Step 8: Primary Turns Per Limb, Winding Length, TPL, Layers
- **Engineering Variable:** $N_{\text{limb}}, L_{\text{wind}}, \text{TPL}, \text{Layers}$
- **Input Dependencies:** $primaryTurns$ (Phase 1), $limbsCount$ (default 2), $bobbinHeightPri$, $bobbinFlange$ (default 7), $priSafetyMargin$ (default 1), `insDiaPriUsed` (or $priFlatBreadth$ if flat)
- **Formulas:**
  $$priTurnsLimb = \left\lceil \frac{primaryTurns}{limbsCount} \right\rceil$$
  $$priWindingLen = bobbinHeightPri - bobbinFlange$$
  $$priTPL = \left\lfloor \frac{priWindingLen}{\text{wireDimension}} \right\rfloor - priSafetyMargin$$
  $$priLayers = \left\lceil \frac{priTurnsLimb}{priTPL} \right\rceil$$
- **Source File & Function:** `phases/phase3.ts` -> `calculatePhase3()`
- **Output Variables:** `priTurnsLimb`, `priWindingLen`, `priTPL`, `priLayers`
- **Rounding Behavior:** Turns/limb and layers use $\text{Math.ceil}()$; TPL uses $\text{Math.floor}() - \text{margin}$.
- **Units:** Integer counts, millimeters ($\text{mm}$)

#### Step 9: Primary Radial Thickness (Radial Build)
- **Engineering Variable:** $t_{\text{rad,pri}}$
- **Input Dependencies:** `insDiaPriUsed` (or `priEffectiveHeight` if flat), `priLayers`, $paperThickness$ (default 0.127), $priPaperLayers$ (default 4)
- **Formula:**
  $$priRadBuild = (d_{\text{wire}} \times priLayers) + (paperThickness \times priPaperLayers)$$
  $$priRadUsed = \lceil priRadBuild \rceil$$
- **Source File & Function:** `phases/phase3.ts` -> `calculatePhase3()`
- **Output Variables:** `priRadBuild` (unrounded), `priRadUsed` (ceiling integer)
- **Rounding Behavior:** $\text{Math.ceil}(priRadBuild)$ to integer mm.
- **Units:** Millimeters ($\text{mm}$)

#### Step 10: Primary LMT and Conductor Weight
- **Engineering Variable:** $\text{LMT}_{\text{pri}}, W_{\text{pri}}$
- **Input Dependencies:** $tongueWidth, stackHeight, coilClearance$ (default 3.5), `priRadUsed`, `priTurnsLimb`, `priActualArea`, $rhoCu$
- **Formulas:**
  $$innerW = tongueWidth + (2 \times coilClearance)$$
  $$innerL = stackHeight + (2 \times coilClearance)$$
  $$priOuterW = innerW + (2 \times priRadUsed)$$
  $$priOuterL = innerL + (2 \times priRadUsed)$$
  $$priLMT = \frac{innerW + priOuterW + innerL + priOuterL}{1000}$$
  $$priActualArea = \frac{\pi \times (insDiaPriUsed)^2}{4} \quad \text{[Legacy physics flaw preserved]}$$
  $$priWeight = priLMT \times priTurnsLimb \times limbsCount \times priActualArea \times rhoCu \times 10^{-3}$$
- **Source File & Function:** `phases/phase3.ts` -> `calculatePhase3()`
- **Output Variables:** `innerW`, `innerL`, `priOuterW`, `priOuterL`, `priLMT`, `priActualArea`, `priWeight`
- **Rounding Behavior:**
  - `priLMT`: `parseFloat(priLMT.toFixed(3))`.
  - `priWeight`: **CONFIRMED BUG:** Left completely unrounded as raw float in `out.priWeight` (unlike Phase 5 which applies `.toFixed(2)`).
  - `priWeightOutput_override`: **CONFIRMED DEFECT:** Ignored entirely in `phase3.ts`.
- **Units:** Millimeters ($\text{mm}$), meters ($\text{m}$), square millimeters ($\text{mm}^2$), kilograms ($\text{kg}$)

---

### Phase 04: Mechanical Hardware Clamps and Bobbins (`phase4.ts`)

#### Step 11: L-Clamp Span and Length
- **Engineering Variable:** $A_{\text{clamp}}, L_{\text{clamp}}$
- **Input Dependencies:** `priRadUsed` (Phase 3), $tbobbinClamp$ (default 3.5), $extraSpaceClamp$ (default 9), $centerGapClamp$ (default 10), $tongueWidth$
- **Formulas:**
  $$aClamp = (2 \times tbobbinClamp) + (2 \times priRadUsed) + (2 \times extraSpaceClamp) + centerGapClamp$$
  $$clampLen = (2 \times tongueWidth) + aClamp$$
- **Source File & Function:** `phases/phase4.ts` -> `calculatePhase4()`
- **Output Variables:** `aClamp`, `aClampUsed`, `clampLen`, `clampLenUsed`
- **Rounding Behavior:** **NO rounding** (raw float arithmetic).
- **Units:** Millimeters ($\text{mm}$)

#### Step 12: L-Clamp Weight
- **Engineering Variable:** $W_{\text{clamp,total}}$
- **Input Dependencies:** $tongueWidth, bendingDeduction$ (default 10), `clampLenUsed`, $msThickness$ (default 3), $rhoMS$ (default 7.85), $clampQty$ (default 4)
- **Formulas:**
  $$clampWidth = (2 \times tongueWidth) - bendingDeduction$$
  $$wClampPer = clampLenUsed \times clampWidthUsed \times msThickness \times rhoMS \times 10^{-6}$$
  $$totalClampWt = wClampPer \times clampQty$$
- **Source File & Function:** `phases/phase4.ts` -> `calculatePhase4()`
- **Output Variables:** `clampWidth`, `clampWidthUsed`, `wClampPer`, `totalClampWt`
- **Rounding Behavior:** `totalClampWt` is `parseFloat(rawTotal.toFixed(2))`.
- **Units:** Millimeters ($\text{mm}$), kilograms ($\text{kg}$)

#### Step 13: Bobbin Dimensions & Clearances (Feeds SVG Labels)
- **Engineering Variable:** $a, b, c, d, h$ (Bobbin internal/external dimensions)
- **Input Dependencies:** $tongueWidth, coreGapBobbin$ (default 2), $stackHeight$, `priRadUsed`, $tapeBufferBobbin$ (default 10), $bobbinHeightPri$
- **Formulas:**
  $$a = bobbinInnerW = tongueWidth + coreGapBobbin$$
  $$c = bobbinInnerL = stackHeight$$
  $$bobbinOuterClear = priRadUsed + tapeBufferBobbin$$
  $$b = bobbinOuterW = bobbinInnerW + (2 \times bobbinOuterClear)$$
  $$d = bobbinOuterL = bobbinInnerL + (2 \times bobbinOuterClear)$$
  $$h = bobbinHeightPri$$
- **Source File & Function:** `phases/phase4.ts` -> `calculatePhase4()`
- **Output Variables:** `bobbinInnerW`, `bobbinInnerL`, `bobbinOuterClear`, `bobbinOuterW`, `bobbinOuterL`
- **Rounding Behavior:** **NO rounding** (raw float values).
- **Units:** Millimeters ($\text{mm}$)

#### Step 14: Bobbin Weight
- **Engineering Variable:** $W_{\text{bobbin,total}}$
- **Input Dependencies:** Bobbin dimensions (Step 13), $bobbinHeightPri, tbobbinMat$ (default 3), $rhoBobbin$ (default 2.20), $limbsCount$ (default 2)
- **Formulas:**
  $$aFlange = (bobbinOuterW \times bobbinOuterL) - (bobbinInnerW \times bobbinInnerL)$$
  $$wFlange = aFlange \times tbobbinMat \times rhoBobbin \times 10^{-6}$$
  $$wWallLong = bobbinInnerL \times bobbinHeightPri \times tbobbinMat \times rhoBobbin \times 10^{-6}$$
  $$wWallShort = bobbinInnerW \times bobbinHeightPri \times tbobbinMat \times rhoBobbin \times 10^{-6}$$
  $$wSingleBobbin = (2 \times wFlange) + (2 \times wWallLong) + (2 \times wWallShort)$$
  $$totalBobbinWt = wSingleBobbin \times limbsCount$$
- **Source File & Function:** `phases/phase4.ts` -> `calculatePhase4()`
- **Output Variables:** `aFlange`, `wFlange` (rounded 3dp), `wWallLong`, `wWallShort`, `wSingleBobbin`, `totalBobbinWt` (rounded 2dp)
- **Rounding Behavior:** `wFlange` is 3dp; `totalBobbinWt` is `parseFloat(raw.toFixed(2))`.
- **Units:** Square millimeters ($\text{mm}^2$), kilograms ($\text{kg}$)

---

### Phase 05: Secondary Winding Design (`phase5.ts`)

#### Step 15: Secondary Conductor Sizing
- **Engineering Variable:** $A_{\text{sec}}, d_{\text{bare,sec}}, d_{\text{ins,sec}}, \text{SWG}_{\text{sec}}$
- **Input Dependencies:** $iSecInput, delta$ (default 2.5), $secInsAddition$ (default 0.01), $isSecFlat$, $secFlatBreadth$, $secFlatHeight$, $secParallel$, `secSwgOverride`
- **Formulas:**
  $$aSec = \frac{iSecInput}{delta}$$
  $$bareDiaSec = \sqrt{\frac{aSec \times 4}{\pi}} \quad \text{(or from reverse lookup if SWG overridden)}$$
  $$secBareStd = \frac{\lfloor\text{parseFloat}(bareDiaSec\text{.toFixed}(2)) \times 10\rfloor}{10} \quad \text{[Computed but unused]}$$
  $$secInsDia = bareDiaSec + secInsAddition \quad \text{[Uses bareDiaSec directly, NOT secBareStd]}$$
- **Source File & Function:** `phases/phase5.ts` -> `calculatePhase5()`
- **Output Variables:** `aSec`, `bareDiaSec`, `secBareStd`, `secInsDia`, `insDiaSecUsed`, `secSWG`, `secShowFlatSection`, `secGeometry`
- **Rounding Behavior:**
  - `bareDiaSec`: `parseFloat(val.toFixed(2))`.
  - `secInsDia`: `parseFloat(val.toFixed(2))`.
- **Units:** Amperes ($\text{A}$), $\text{mm}^2$, millimeters ($\text{mm}$)

#### Step 16: Secondary Turns Per Limb, TPL, Layers, Radial Build
- **Engineering Variable:** $N_{\text{limb,sec}}, \text{TPL}_{\text{sec}}, \text{Layers}_{\text{sec}}, t_{\text{rad,sec}}$
- **Input Dependencies:** $secondaryTurns$ (Phase 1), $limbsCount$ (default 2), $bobbinHeightSec$, $bobbinFlange$ (default 7), $secSafetyMargin$ (default 0), `insDiaSecUsed` (or $secFlatBreadth$), $paperThickness$, $secPaperLayers$ (default 4)
- **Formulas:**
  $$secTurnsLimb = \left\lceil \frac{secondaryTurns}{limbsCount} \right\rceil$$
  $$secWindingLen = bobbinHeightSec - bobbinFlange$$
  $$secTPL = \left\lfloor \frac{secWindingLen}{d_{\text{wire}}} \right\rfloor - secSafetyMargin$$
  $$secLayers = \left\lceil \frac{secTurnsLimb}{secTPL} \right\rceil$$
  $$secRadBuild = (d_{\text{wire}} \times secLayers) + (paperThickness \times secPaperLayers)$$
  $$secRadUsed = \lceil secRadBuild \rceil$$
- **Source File & Function:** `phases/phase5.ts` -> `calculatePhase5()`
- **Output Variables:** `secTurnsLimb`, `secWindingLen`, `secTPL`, `secLayers`, `secRadBuild`, `secRadUsed`
- **Rounding Behavior:** Turns/limb, layers, and radial used all use $\text{Math.ceil}()$; TPL uses $\text{Math.floor}() - \text{margin}$.
- **Units:** Integer counts, millimeters ($\text{mm}$)

#### Step 17: Secondary LMT & Conductor Weight
- **Engineering Variable:** $\text{LMT}_{\text{sec}}, W_{\text{sec}}$
- **Input Dependencies:** `innerW`, `innerL` (from Phase 3), `secRadUsed`, `secTurnsLimb`, `secActualArea`, $rhoCu$
- **Formulas:**
  $$secOuterW = innerW + (2 \times secRadUsed)$$
  $$secOuterL = innerL + (2 \times secRadUsed)$$
  $$secLMT = \frac{innerW + secOuterW + innerL + secOuterL}{1000}$$
  $$secActualArea = \frac{\pi \times (insDiaSecUsed)^2}{4} \quad \text{[Legacy physics flaw preserved]}$$
  $$secWeight = secLMT \times secTurnsLimb \times limbsCount \times secActualArea \times rhoCu \times 10^{-3}$$
- **Source File & Function:** `phases/phase5.ts` -> `calculatePhase5()`
- **Output Variables:** `secOuterW`, `secOuterL`, `secLMT`, `secActualArea`, `secWeight`
- **Rounding Behavior:** `secLMT` is 3dp; `secWeight` is `parseFloat(val.toFixed(2))`.
- **Units:** Millimeters ($\text{mm}$), meters ($\text{m}$), square millimeters ($\text{mm}^2$), kilograms ($\text{kg}$)

---

### Phase 06: Core Mass Validation (`phase6.ts`)

#### Step 18: Actual Net Core Area, Frame Perimeter & Core Mass
- **Engineering Variable:** $A_{\text{net,actual}}, P_{\text{frame}}, M_{\text{core}}$
- **Input Dependencies:** `selectedArea` (Phase 2), $finalCoreSf$ (default 0.98), $tongueWidth$ ($coreD$), $stackHeight$ ($coreST$), $coreL, coreA, rhoSteel$ (default 7.65)
- **Formulas:**
  $$actualNetArea = \text{Math.round}(selectedArea \times finalCoreSf)$$
  $$framePerimeterCalc = (2 \times coreD) + (2 \times coreL) + (2 \times coreA) + (2 \times coreST)$$
  $$coreMass = framePerimeterCalc \times actualNetArea \times rhoSteel \times 10^{-6}$$
- **Source File & Function:** `phases/phase6.ts` -> `calculatePhase6()`
- **Output Variables:** `actualNetArea`, `coreD_used`, `coreST_used`, `coreL`, `coreA`, `framePerimeterCalc`, `coreMass`
- **Rounding Behavior:** `actualNetArea` is $\text{Math.round}()$; `framePerimeterCalc` has **NO rounding**; `coreMass` is `parseFloat(val.toFixed(2))`.
- **Units:** Square millimeters ($\text{mm}^2$), millimeters ($\text{mm}$), kilograms ($\text{kg}$)

---

## 8. Lookup Table Inventory

| Lookup Table | Location | Description | Consumed By | Implementation Status | Parity with Legacy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `swgTable` | `supabase/functions/shared/lookups/swgData.ts` | 43 entries (SWG 8 to 50) mapping gauge integer to maximum current capacity at $2.5\text{ A/mm}^2$ and bare diameter. | `phase3.ts` and `phase5.ts` for wire gauge recommendations and override reverse-lookups. | **ACTIVE** | **CONFIRMED 100% PARITY** with `calculators/DRY-Type-Step-Up-Transformer/OLD_PROJECT_CODE/js/swgData.js`. |
| `laminationTable` | `supabase/functions/shared/lookups/laminationData.ts` | 14 entries for standard workshop EI laminations (types 17, 12A, 74, 23, 30, 15, 3, 16, 6, 43, 8, 8B, SE 100, SE 140) with physical dimensions in cm. | None in Dry-Type. Available for future EI-Core calculators. | **INACTIVE (Shared Catalog)** | Verified. Exists in shared repository. |
| `bobbinTable` | `supabase/functions/shared/lookups/bobbinData.ts` | 50+ entries mapping lamination types to standard commercial bobbin stack sizes in inches. | None in Dry-Type. Available for future EI-Core calculators. | **INACTIVE (Shared Catalog)** | Verified. Exists in shared repository. |

### Lookup Function Integrity:
- `getSWGForCurrent(targetCurrent)`:
  - If current exceeds SWG 8 ($>32.425\text{ A}$), returns SWG 8 (clamps to maximum wire).
  - Finds closest match based on absolute difference.
  - **Tie-breaker:** If equidistant between two gauges, picks the one with greater current capacity (conservative engineering choice).
- `getBareDiaForSWG(swg)`:
  - Reverses $A = I / 2.5$ and $d = \sqrt{4A/\pi}$ to supply bare diameter on manual override.
  - **Known limitation:** Assumes fixed $2.5\text{ A/mm}^2$ density. If an engineer uses a different current density (`delta`), this reverse lookup diameter remains fixed to the $2.5\text{ A/mm}^2$ baseline.

---

## 9. SVG Implementation Status

### Current Architecture Assessment:
1. **Backend Edge Function:**
   - **Status: NO SVG CODE.** The backend does not render, generate, or transmit SVG markup.
   - It only transmits the 5 numerical dimensions in `Phase4Output`:
     - `bobbinInnerW` $\rightarrow$ Dimension $a$ (inner core slot width)
     - `bobbinOuterW` $\rightarrow$ Dimension $b$ (outer shell width)
     - `bobbinInnerL` $\rightarrow$ Dimension $c$ (inner core slot length)
     - `bobbinOuterL` $\rightarrow$ Dimension $d$ (outer shell length)
     - `bobbinHeightPri` $\rightarrow$ Dimension $h$ (winding window height)
2. **Frontend Presentation:**
   - **Status: NOT IMPLEMENTED IN MODERN PLATFORM.**
   - In `OLD_PROJECT_CODE/index.html`, two identical static SVG drawings exist:
     - **Instance 1 (Step 13 card):** `<svg viewBox="0 0 350 200" style="max-width: 350px;">` with text labels `#svg_a`, `#svg_b`, `#svg_c`, `#svg_d`, `#svg_h`.
     - **Instance 2 (Summary Modal):** `<svg viewBox="0 0 350 200" style="max-width: 600px;">` with text labels `#modal_svg_a`, `#modal_svg_b`, `#modal_svg_c`, `#modal_svg_d`, `#modal_svg_h`.
   - In `OLD_PROJECT_CODE/js/app.js`: Labels were updated via direct DOM assignments:
     ```javascript
     document.getElementById("svg_a").textContent = bobbinInnerW !== null ? `a = ${bobbinInnerW}` : "a = --";
     ```
3. **Required Future Development:**
   - A dedicated modern UI component (e.g., `BobbinBlueprint.tsx` or `.vue`) must be constructed in `frontend/` containing the static SVG paths from `OLD_PROJECT_CODE/index.html` (lines 361–396) and binding the dynamic text nodes directly to `response.engineering.phase4`.

---

## 10. Milestone Completion Matrix

| Milestone | Expected Functionality | Currently Implemented Functionality | Missing / Incomplete Functionality | Verification Status |
| :--- | :--- | :--- | :--- | :--- |
| **Milestone 1: Backend Foundation, Contracts & Phases** | Stateless Edge Function, typed request/response contracts, isolated calculation modules for Phases 1–6 reproducing legacy engineering formulas. | Full backend folder structure; `index.ts`; typed interfaces in `models/index.ts`; `phase1.ts` to `phase6.ts` implemented; all 18 unit tests pass. | - `priWeightOutput_override` is ignored in `phase3.ts`.<br>- Decimal rounding discrepancies between Phase 3 and Phase 5 (`bareDiaPri` and `priWeight` unrounded in P3, rounded in P5).<br>- Edge function lacks input boundary guards (e.g. division by zero). | **CONFIRMED FUNCTIONAL (With Inconsistencies)** |
| **Milestone 2: Interactive Engineering (Material & SWG Override)** | Conductor material selector (Copper/Aluminium) updating density (`rhoCu`); manual SWG override forcing reverse lookup of bare diameter and cascading downstream. | Conductor material density injection implemented in `index.ts` lines 68–76. SWG override implemented in `phase3.ts` and `phase5.ts` via `getBareDiaForSWG`. | - Reverse SWG diameter lookup assumes hardcoded current density ($2.5\text{ A/mm}^2$).<br>- SWG override does not update flat wire copper mass calculation. | **CONFIRMED IMPLEMENTED (With Known Limitations)** |
| **Milestone 3: Conductor Geometry (Round/Flat)** | Dynamic UI reveal when SWG $\le 13$; manual selection of flat wire; strip suggestions factor generator; area tolerance warning ($>10\%$); conditional validation. | `generateStripSuggestions` in `geometryUtils.ts`; area tolerance warning boolean; `priGeometry` & `secGeometry` output objects; 400 validation on missing flat dimensions. | - Flat wire copper mass is computed using circular round wire area formula $( \pi d^2 / 4 )$ instead of rectangular area (preserved legacy bug).<br>- Direct calls to `calculatePhase5` can exhibit inconsistent default state if not called via `index.ts`. | **CONFIRMED IMPLEMENTED (With Documented V2 Flaws)** |
| **Milestone 4: Engineering Output / Summary** | Aggregated manufacturing report combining electrical, core, primary, secondary, hardware, and total weight metrics. | `generateSummary.ts` aggregates electrical, core, primary, secondary, hardware, and totals. | - **CONFIRMED DEFECT:** Bobbin weight and clamp weight are completely omitted from summary payload.<br>- **CONFIRMED DEFECT:** Total weight only sums core mass + primary weight + secondary weight, excluding hardware weights.<br>- Conductor material omitted from summary payload.<br>- Formatted summary strings (`sumPriDetails`, etc.) not produced. | **INCOMPLETE / DEFECTS CONFIRMED** |

---

## 11. Pending Development Tasks

Prioritized by technical dependency order:

### Priority 1: Backend Defect Corrections (Immediate Prerequisites)
1. **Fix Phase 3 Override Handling (`phase3.ts`):**
   - Implement `input.priWeightOutput_override` handling so manual overrides on primary weight are respected.
2. **Standardize Decimal Precision & Rounding (`phase3.ts`):**
   - Align `out.bareDiaPri` and `out.priWeight` rounding to match Phase 5 and the specification (`parseFloat(val.toFixed(2))`).
3. **Correct Summary Generator Payload (`summary/generateSummary.ts`):**
   - Add `totalBobbinWt: p4.totalBobbinWt` and `totalClampWt: p4.totalClampWt` to `summary.hardware`.
   - Update `summary.totals.totalWeight` to sum:
     $$\text{Total Weight} = M_{\text{core}} + W_{\text{pri}} + W_{\text{sec}} + W_{\text{bobbin,total}} + W_{\text{clamp,total}}$$
   - Inject `conductorMaterial` into `summary.electrical`.
4. **Harden Edge Function Input Validation (`index.ts`):**
   - Add validation rules rejecting negative or zero values for critical engineering inputs ($V_{\text{pri}}, V_{\text{sec}}, I_{\text{sec}}, TW, SH$).
   - Standardize error response schema between validation failure (`message` + `errors`) and general catch (`error`).

### Priority 2: Modern Frontend Implementation (`frontend/`)
5. **Initialize Modern Frontend Application:**
   - Establish frontend structure (e.g., React + Vite / TypeScript or lightweight Vanilla component architecture matching platform conventions).
6. **Build Transformer Input Form & Override State Store:**
   - Implement input collection, unit displays, and override tracking (storing edited fields in an `overrides` dictionary).
7. **Implement "Calculate" Trigger & API Client:**
   - Build client calling `POST /functions/v1/calculate-dry-type` and binding response data.
8. **Build SVG Bobbin Blueprint Component:**
   - Port static SVG geometry from `OLD_PROJECT_CODE/index.html` lines 361–396 into a responsive component bound to `phase4` dimensions ($a, b, c, d, h$).
9. **Implement Client-Side Material Cost Estimation Module:**
   - Port `costModule.js` into modern frontend reactive state (multiplying backend weights by user-entered unit prices).
10. **Build Manufacturing Summary Modal & Print View:**
    - Render summary dashboard with printable `@media print` styling.

### Priority 3: Version 2 Engineering Accuracy Improvements (Pending User Approval)
11. **Correct Copper Mass Calculation using Bare Diameter (`V2-ENGINEERING-IMPROVEMENTS.md`):**
    - Transition $A_{\text{actual}}$ from insulated diameter to bare diameter ($d_{\text{bare}}$).
12. **Correct Flat Wire Copper Mass Calculation:**
    - Compute flat conductor mass from rectangular volume ($Breadth \times Height \times Parallel \times LMT \times \rho$).

---

## 12. Identified Bugs and Potential Risks

### Category: CONFIRMED
1. **Omission of Hardware Weights from Summary:**
   - *File:* `supabase/functions/calculate-dry-type/summary/generateSummary.ts` (lines 47–58)
   - *Issue:* `p4.totalBobbinWt` and `p4.totalClampWt` are omitted from the returned summary object, and `totals.totalWeight` only sums core mass + primary weight + secondary weight.
   - *Impact:* Reported total transformer assembly weight is physically incomplete.
2. **Missing `priWeightOutput_override` in Phase 3:**
   - *File:* `supabase/functions/calculate-dry-type/phases/phase3.ts` (lines 229–237)
   - *Issue:* Comments note `priWeightOutput_override` can exist, but the code never checks `input.priWeightOutput_override` and leaves `out.priWeight` untouched.
   - *Impact:* User override on primary winding weight fails to take effect.
3. **Unrounded Primary Output Precision in Phase 3:**
   - *File:* `supabase/functions/calculate-dry-type/phases/phase3.ts` (lines 108, 226)
   - *Issue:* `out.bareDiaPri` and `out.priWeight` are stored as unrounded raw floating-point numbers, whereas Phase 5 (`phase5.ts` lines 103, 227) formats `out.bareDiaSec` and `out.secWeight` to 2 decimal places using `toFixed(2)`.
   - *Impact:* API contract inconsistency and precision leakage into consumer layers.
4. **Hardcoded Credentials Security Risk:**
   - *File:* `passwords.txt` in root directory.
   - *Issue:* Contains plain-text credentials.
   - *Impact:* High security risk of accidental credential leakage.

### Category: POTENTIAL ISSUE
5. **Reverse SWG Bare Diameter Ignores User Current Density:**
   - *File:* `supabase/functions/shared/lookups/swgData.ts` -> `getBareDiaForSWG()`
   - *Issue:* Computes area using hardcoded `entry.current / 2.5`. If the engineer overrides current density (`delta`) to any value other than 2.5, manual SWG overrides force dimensions calculated at 2.5.
   - *Impact:* Dimensional inaccuracies when designing high-current or high-temperature transformers with non-standard current density.
6. **Error Response Schema Inconsistency:**
   - *File:* `supabase/functions/calculate-dry-type/index.ts` (lines 58–64 vs 125–129)
   - *Issue:* Flat wire validation returns `{ success: false, message: string, errors: string[] }`, while the general catch block returns `{ error: string }`.
   - *Impact:* Frontend error handlers must accommodate two different error payload structures.
7. **Outdated Implementation Progress Documentation:**
   - *File:* `project_knowledge/05-progress.md`
   - *Issue:* Claims "Ready to begin backend (Supabase Edge Function) implementation", failing to reflect that Milestones 1–4 are already implemented.

### Category: NOT IMPLEMENTED
8. **Modern Frontend Application:**
   - *Directory:* `frontend/` (0 files).
   - *Impact:* Users cannot interact with the modern Edge Function without writing manual HTTP POST scripts or running CLI tests.
9. **Modern SVG Blueprint Rendering:**
   - *Impact:* Dynamic bobbin blueprints cannot be visualized in the modern platform.

### Category: NOT VERIFIED
10. **Full Multi-Tap and Extreme-Current Reference Sets:**
    - Reference test runs have only been compared against standard nominal values ($415\text{ V}, 100\text{ A}, 11\text{ kV}$). Deep boundary cases (very low VA $<100\text{ VA}$, extreme voltages $>33\text{ kV}$, fractional currents $<0.1\text{ A}$) have not been validated against physical shop-floor test benches.

---

## 13. Regression Testing Status

### Test Execution Summary:
- **Test Command:** `deno test --allow-net --allow-read supabase/functions/calculate-dry-type/`
- **Result:** `ok | 18 passed | 0 failed (1s)`

### Test Coverage Breakdown:
1. `tests/phases/phase1.test.ts`:
   - Nominal capacity and electrical turns ($415\text{ V}, 100\text{ A}, 11\text{ kV}$).
   - Override cascade behavior ($kvaInput$, $primaryTurns$).
2. `tests/phases/phase2.test.ts`:
   - Net core area ($19,144\text{ mm}^2$), gross area ($20,152\text{ mm}^2$), selected area ($30,000\text{ mm}^2$).
   - Overrides ($netAreaVTInput$, $netAreaInput$, $grossArea$, $selectedArea$).
   - Null guard propagation.
3. `tests/phases/phase3.test.ts`:
   - Primary round wire sizing ($1.386\text{ mm}$ bare dia, 17 SWG recommendation).
   - Aluminium density override ($2.703\text{ g/cm}^3$).
   - Flat wire override path and area warning ($8 \times 2\text{ mm}$, $16\text{ mm}^2$).
   - Primary SWG override to 12 SWG.
4. `tests/phases/phase4.test.ts`:
   - L-clamp span ($53\text{ mm}$), length ($353\text{ mm}$), total weight ($9.64\text{ kg}$).
   - Bobbin dimensions ($152 \times 200\text{ mm}$ inner, $190 \times 238\text{ mm}$ outer, $3.18\text{ kg}$ weight).
   - Clamp override behavior.
5. `tests/phases/phase5.test.ts`:
   - Secondary conductor sizing ($40\text{ mm}^2$, 8 SWG recommendation, $7.14\text{ mm}$ bare dia).
   - Secondary flat wire ($10 \times 4\text{ mm}$) and overrides.
   - Secondary aluminium override.
   - Secondary SWG override to 15 SWG.
6. `tests/phases/phase6.test.ts`:
   - Core frame perimeter ($1400\text{ mm}$), actual net area ($29,400\text{ mm}^2$), core mass ($314.87\text{ kg}$).
   - Core dimension overrides ($coreD, coreL, coreA, coreST, coreMass$).
7. `tests/summary/summary.test.ts`:
   - Mapping verification of electrical, core, primary, secondary, hardware, and totals.

### Regression Test Gaps:
- No automated tests verify HTTP 400 error responses from `index.ts`.
- No tests assert that `priWeightOutput_override` functions correctly (which currently fails silently).
- No tests assert the inclusion of bobbin weight and clamp weight in total assembly weight.

---

## 14. Technical Debt

1. **Frontend Disconnection:**
   - The repository contains an operational backend and rich reverse-engineering documentation, but zero frontend code in `frontend/`.
2. **Legacy Engineering Physics Flaws (Preserved in V1):**
   - Conductor mass is calculated using insulated diameter instead of bare diameter (10–20% artificial weight inflation).
   - Flat wire copper mass is calculated using round wire area formulas instead of rectangular area.
3. **Shared Catalog Bloat:**
   - `laminationData.ts` and `bobbinData.ts` reside in `supabase/functions/shared/` but are completely unreferenced by the Dry-Type calculator.
4. **Documentation Sync:**
   - `project_knowledge/05-progress.md` has not been updated since the repository was initialized.

---

## 15. Recommended Implementation Sequence

To transition from this completed audit to active development, the following execution sequence is strictly recommended:

```text
Phase A: Backend Cleanup & Summary Hardening (Milestones 1 & 4 Fixes)
  1. Fix `phase3.ts`: Implement `priWeightOutput_override` and apply 2dp rounding to `bareDiaPri` and `priWeight`.
  2. Fix `generateSummary.ts`: Add bobbin and clamp weights to `hardware`; add them to `totals.totalWeight`.
  3. Standardize HTTP error schemas in `index.ts`.
  4. Run `deno test` to verify all updated unit tests pass.

Phase B: Frontend Architecture Initialization
  5. Select and initialize the frontend stack in `frontend/` (Vite + React / TypeScript recommended).
  6. Create input and override state management modules mirroring `models/index.ts`.
  7. Implement the API client connecting to `calculate-dry-type`.

Phase C: UI Components & SVG Blueprint Integration
  8. Build calculation input cards matching the 6-phase engineering layout.
  9. Port the static SVG bobbin blueprint into an interactive component bound to Phase 4 outputs.
  10. Port `costModule.js` into a client-side reactive cost estimation panel.
  11. Implement the Manufacturing Summary Modal with printable CSS.

Phase D: End-to-End Integration & Verification
  12. Execute automated end-to-end integration tests between frontend and Edge Function.
  13. Verify numerical parity between legacy `OLD_PROJECT_CODE` and the new platform.
```

---

## 16. Exact Next Development Step

**STOP AND WAIT FOR USER APPROVAL.**

Do not write implementation code, modify existing backend files, or create frontend components until the user reviews this report and approves:
1. Fixing the confirmed backend defects in `phase3.ts` and `generateSummary.ts`.
2. The choice of frontend framework for `frontend/`.
3. Whether to maintain legacy physics behavior (V1 bug-for-bug) or apply the V2 physical accuracy corrections.

---
*End of Audit Report.*
