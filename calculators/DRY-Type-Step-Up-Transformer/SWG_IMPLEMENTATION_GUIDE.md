# Standard Wire Gauge (SWG) Interactive Selection Guide

This guide provides step-by-step instructions and code templates to implement the interactive SWG selection feature in any other transformer calculation project (e.g., EI Core, Dry-Type). 

This implementation provides the following features:
1. Calculates the ideal SWG automatically.
2. Allows the user to view the suggested SWG and its current capacity.
3. Provides a dropdown to manually override the suggested SWG.
4. Auto-fills corresponding fields (like Bare Diameter) based on the dropdown.
5. Unlocks "Flat Wire / Strips" options automatically for thick wires (SWG <= 13).

---

## 1. Prerequisites: Include Data Source

Ensure that `swgData.js` is included in your project. This file contains the `swgTable` array and helper functions (`getSWGForArea`, `getSWGData`, `isThickWire`, etc.).

```html
<!-- Include this before your main app.js -->
<script src="js/swgData.js"></script>
```

---

## 2. HTML Structure Template

Wherever a conductor is calculated in your UI, use this HTML structure. Replace the prefixes (`{prefix}`) with `pri` for Primary, `sec` for Secondary, `ter` for Tertiary, etc.

```html
<!-- Main Output Row -->
<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 10px;">
    <!-- 1. Calculated Bare Diameter -->
    <div class="calc-wrapper">
        <label>Calculated Bare Dia (mm)</label>
        <input type="number" step="any" id="{prefix}CalcBareDiaOutput" readonly placeholder="Waiting...">
    </div>
    
    <!-- 2. Suggested SWG Display -->
    <div class="calc-wrapper">
        <label>Suggested SWG (For Round):</label>
        <div id="{prefix}SwgSuggest" class="suggest-badge" style="margin-top: 5px; color: blue;">Waiting...</div>
    </div>
    
    <!-- 3. User Selectable Dropdown -->
    <div class="calc-wrapper">
        <label>Select Winding SWG</label>
        <select id="{prefix}SwgSelect" style="width:100%; padding: 5px; margin-top: 2px;"></select>
    </div>
</div>

<!-- Bare Diameter Input field populated from the Dropdown -->
<div class="calc-wrapper">
    <label>Selected Bare Diameter (mm)</label>
    <input type="number" step="any" id="{prefix}SelectedBareDia" required>
</div>

<!-- Optional: Thick Wire / Flat Strip Options -->
<div id="{prefix}WireTypeContainer" style="display: none; margin-top: 15px; border-top: 1px dashed #ccc; padding-top: 15px;">
    <div style="margin-bottom: 10px;">
        <label style="font-weight: bold;">Wire Type</label>
        <div style="display: flex; gap: 20px; margin-top: 5px;">
            <label style="display: flex; align-items: center; gap: 5px;">
                <input type="radio" name="{prefix}WireType" id="{prefix}WireTypeRound" value="round" checked> Round Wire
            </label>
            <label style="display: flex; align-items: center; gap: 5px;">
                <input type="radio" name="{prefix}WireType" id="{prefix}WireTypeFlat" value="flat"> Flat Wire / Strips
            </label>
        </div>
    </div>
    
    <div id="{prefix}FlatWireInputs" style="display: none;">
        <!-- Add your flat wire inputs here (Breadth, Height, Parallel Strips) -->
    </div>
</div>
```

---

## 3. JavaScript: Initialization & Overrides

Place this in your main initialization logic (run when the page loads).

```javascript
// 1. Populate Dropdowns on Page Load
function populateSwgDropdowns() {
    let selects = ["priSwgSelect", "secSwgSelect"]; // Add your prefixes here
    
    if (typeof swgTable !== "undefined") {
        selects.forEach(selectId => {
            let selectEl = document.getElementById(selectId);
            if (!selectEl) return;
            
            // Clear existing
            selectEl.innerHTML = '';
            
            // Add custom option
            let optCustom = document.createElement("option");
            optCustom.value = "custom";
            optCustom.textContent = "Custom / Non-Standard";
            selectEl.appendChild(optCustom);
            
            // Populate from table
            swgTable.forEach(item => {
                let opt = document.createElement("option");
                opt.value = item.swg;
                opt.textContent = `${item.swg} SWG`;
                selectEl.appendChild(opt);
            });
        });
    }
}

// 2. Track Manual Overrides (Attach to any interactive inputs/selects)
function attachOverrideListeners() {
    const fieldsToTrack = [
        "priSwgSelect", "priSelectedBareDia",
        "secSwgSelect", "secSelectedBareDia"
    ];
    
    fieldsToTrack.forEach(id => {
        let el = document.getElementById(id);
        if (el) {
            el.addEventListener("change", function() {
                this.dataset.edited = "true";
                calculateAll(); // Re-trigger calculations
            });
        }
    });
}

// Run on window load
window.addEventListener('DOMContentLoaded', () => {
    populateSwgDropdowns();
    attachOverrideListeners();
});
```

---

## 4. JavaScript: Integration in Core Calculation Loop

Inside your main calculation function (where you calculate required current/area), integrate this logic.

```javascript
// Example prefix: "sec" (Secondary)
// Pre-requisite variable: `grossReqAreaOut` must be calculated in mm²

let currentDensity = 2.5; // Example standard density

// --- A. AUTO-SUGGESTION LOGIC ---
let suggestedSwg = (grossReqAreaOut !== null && typeof getSWGForArea === 'function') 
                   ? getSWGForArea(grossReqAreaOut) : null;

if (suggestedSwg !== null && typeof getSWGData === 'function') {
    let suggestBadge = document.getElementById("secSwgSuggest");
    let sugData = getSWGData(suggestedSwg);
    let maxCap = (sugData.area * currentDensity).toFixed(2);
    
    if (suggestBadge) {
        suggestBadge.innerText = `${suggestedSwg} SWG (Max Capacity: ${maxCap} A)`;
    }

    // Auto-select dropdown IF user hasn't touched it manually
    let swgSelectEl = document.getElementById("secSwgSelect");
    if (swgSelectEl && !swgSelectEl.dataset.edited) {
        swgSelectEl.value = suggestedSwg.toString();
    }
}

// --- B. READ SELECTED DROPDOWN & POPULATE FIELDS ---
let swgSelectElForRead = document.getElementById("secSwgSelect");
let selectedSwg = (swgSelectElForRead && swgSelectElForRead.value !== "custom" && swgSelectElForRead.value !== "") 
                  ? swgSelectElForRead.value : null;

let swgData = (selectedSwg !== null && typeof getSWGData === 'function') ? getSWGData(selectedSwg) : null;

// Populate the Bare Dia input IF user hasn't touched it manually
let selectedBareDiaEl = document.getElementById("secSelectedBareDia");
if (swgData && selectedBareDiaEl && !selectedBareDiaEl.dataset.edited) {
    selectedBareDiaEl.value = swgData.bareDia;
}

// --- C. THICK WIRE / FLAT STRIP LOGIC ---
let wireTypeContainer = document.getElementById("secWireTypeContainer");
let wireTypeFlatRadio = document.getElementById("secWireTypeFlat");
let wireTypeRoundRadio = document.getElementById("secWireTypeRound");
let flatWireInputs = document.getElementById("secFlatWireInputs");

if (wireTypeContainer) {
    let swgNum = parseInt(selectedSwg);
    
    // Check if SWG <= 13 (Standard Thick Wire Threshold)
    if (!isNaN(swgNum) && swgNum <= 13) {
        wireTypeContainer.style.display = "block"; // Unhide options
        
        let isFlatWire = wireTypeFlatRadio && wireTypeFlatRadio.checked;
        if (isFlatWire && flatWireInputs) {
            flatWireInputs.style.display = "block";
            // Add strip generation logic here if needed
        } else if (flatWireInputs) {
            flatWireInputs.style.display = "none";
        }
    } else {
        // Not a thick wire, hide flat options and force round
        wireTypeContainer.style.display = "none";
        if (wireTypeRoundRadio) wireTypeRoundRadio.checked = true;
        if (flatWireInputs) flatWireInputs.style.display = "none";
    }
}
```

## 5. Key Concept: The `dataset.edited` Flag
The crucial feature making this interactive is the `dataset.edited` flag.
* The script recalculates the required area **constantly**.
* Without this flag, the script would **overwrite** the dropdown back to the "Suggested" value on every recalculation.
* By adding an `addEventListener('change')` to the dropdown, the script marks `dataset.edited = true`. 
* The auto-select logic checks `!swgSelectEl.dataset.edited` before forcing the value, thereby respecting the user's manual choice.
