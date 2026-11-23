// Define independent physical constants. These are NEVER cleared by upstream edits.
const baseConstants = [
    "vSecInput", "iSecInput", "k", "primaryVoltage", "fluxDensity", 
    "frequency", "stackingFactor", "tongueWidth", "stackHeight", "delta", 
    "priInsAddition", "secInsAddition", "limbsCount", "bobbinHeightPri", 
    "bobbinHeightSec", "bobbinFlange", "priSafetyMargin", "secSafetyMargin", 
    "paperThickness", "priPaperLayers", "secPaperLayers", "coilClearance", 
    "rhoCu", "rhoSteel", "finalCoreSf", "coreD", "coreL", "coreA", "coreST",
    "tbobbinClamp", "extraSpaceClamp", "centerGapClamp", "bendingDeduction",
    "msThickness", "rhoMS", "clampQty", "coreGapBobbin", "tapeBufferBobbin",
    "tbobbinMat", "rhoBobbin", "conductorMaterial", "priParallel", "secParallel",
    "priSecGap", "priSecGap_step16", "coreToPriGap", "bobbinGap", "priPriGap",
    "kvaOutput", "kvaInput"
];

let lastCapacitySource = "iSec"; // Source of truth: "iSec" or "kva"

const allInputs = Array.from(document.querySelectorAll("input, select"));

allInputs.forEach(input => {
    input.addEventListener("input", (e) => {
        // Two-way synchronization for Primary-to-Secondary Gap (Step 16 and Step 18)
        if (input.id === "priSecGap_step16") {
            let other = document.getElementById("priSecGap");
            if (other) {
                other.value = input.value;
                if (input.dataset.edited) other.dataset.edited = "1";
                else delete other.dataset.edited;
            }
        } else if (input.id === "priSecGap") {
            let other = document.getElementById("priSecGap_step16");
            if (other) {
                other.value = input.value;
                if (input.dataset.edited) other.dataset.edited = "1";
                else delete other.dataset.edited;
            }
        }

        // Bidirectional Capacity Source Selection (Secondary Current <-> kVA)
        if (input.id === "iSecInput") {
            lastCapacitySource = "iSec";
            let kvaOut = document.getElementById("kvaOutput");
            let kvaIn = document.getElementById("kvaInput");
            if (kvaOut) delete kvaOut.dataset.edited;
            if (kvaIn) delete kvaIn.dataset.edited;
            if (input.value.trim() === "") {
                delete input.dataset.edited;
            } else {
                input.dataset.edited = "1";
            }
        } else if (input.id === "kvaOutput" || input.id === "kvaInput") {
            lastCapacitySource = "kva";
            let otherKva = document.getElementById(input.id === "kvaOutput" ? "kvaInput" : "kvaOutput");
            if (otherKva) {
                otherKva.value = input.value;
                if (input.dataset.edited || input.value.trim() !== "") otherKva.dataset.edited = "1";
                else delete otherKva.dataset.edited;
            }
            let iSecIn = document.getElementById("iSecInput");
            if (iSecIn) delete iSecIn.dataset.edited;
            if (input.value.trim() === "") {
                delete input.dataset.edited;
            } else {
                input.dataset.edited = "1";
            }
        } else if (input.id === "vaOutput") {
            lastCapacitySource = "kva";
            let vaVal = parseFloat(input.value);
            let kvaOut = document.getElementById("kvaOutput");
            let kvaIn = document.getElementById("kvaInput");
            if (!isNaN(vaVal)) {
                let kvaFormatted = (vaVal / 1000).toFixed(3);
                if (kvaOut) { kvaOut.value = kvaFormatted; kvaOut.dataset.edited = "1"; }
                if (kvaIn) { kvaIn.value = kvaFormatted; kvaIn.dataset.edited = "1"; }
            }
            let iSecIn = document.getElementById("iSecInput");
            if (iSecIn) delete iSecIn.dataset.edited;
        }

        if (e.isTrusted) {
            if (input.value.trim() === "") {
                delete input.dataset.edited;
            } else {
                input.dataset.edited = "1";
            }
            
            // THE CASCADE RESET: Flush override locks for all dependent downstream fields
            let currentIndex = allInputs.indexOf(input);
            for (let i = currentIndex + 1; i < allInputs.length; i++) {
                let downstreamInput = allInputs[i];
                if (!baseConstants.includes(downstreamInput.id)) {
                    delete downstreamInput.dataset.edited; 
                }
            }
        }
        calculate();
        save();
    });
});

let conductorMaterialEl = document.getElementById("conductorMaterial");
if (conductorMaterialEl) {
    conductorMaterialEl.addEventListener("change", (e) => {
        let rhoInput = document.getElementById("rhoCu");
        if (rhoInput) {
            rhoInput.value = e.target.value === "Aluminium" ? "2.703" : "8.89";
            delete rhoInput.dataset.edited;
            let event = new Event("input");
            rhoInput.dispatchEvent(event);
        }
    });
}

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

function g(id) { 
    let el = document.getElementById(id);
    if (!el || el.value === "") return null;
    return parseFloat(el.value); 
}

function auto(id, val) {
    let e = document.getElementById(id);
    if (e && !e.dataset.edited && document.activeElement !== e) {
        e.value = (val !== null && val !== undefined && !isNaN(val)) ? val : "";
    }
}

function truncateToOneDecimal(num) {
    if (num === null || isNaN(num)) return null;
    return Math.floor(num * 10) / 10;
}

function formatCurrent(val) {
    if (val === null || val === undefined || isNaN(val)) return "";
    let rounded = parseFloat(val.toFixed(4));
    return rounded.toString();
}

function formatKVA(val) {
    if (val === null || val === undefined || isNaN(val)) return "";
    let str = val.toFixed(3);
    if (parseFloat(str) === 0 && val > 0) {
        str = parseFloat(val.toFixed(6)).toString();
    }
    return str;
}

function formatVA(val) {
    if (val === null || val === undefined || isNaN(val)) return "";
    let rounded = parseFloat(val.toFixed(2));
    return rounded.toString();
}

function calculate() {
    // --- STEP 1: CAPACITY (Bidirectional: Secondary Current <-> kVA) ---
    let vSecInput = g("vSecInput"); 
    let iSecEl = document.getElementById("iSecInput");
    let kvaEl = document.getElementById("kvaOutput");
    let kvaInEl = document.getElementById("kvaInput");
    let vaEl = document.getElementById("vaOutput");
    
    let va = null;
    let kva = null;
    let iSec = null;

    if (lastCapacitySource === "kva") {
        let kvaInVal = g("kvaInput");
        let kvaOutVal = g("kvaOutput");
        if (document.activeElement === kvaInEl) {
            kva = kvaInVal !== null ? kvaInVal : kvaOutVal;
        } else if (document.activeElement === kvaEl) {
            kva = kvaOutVal !== null ? kvaOutVal : kvaInVal;
        } else {
            kva = kvaInVal !== null ? kvaInVal : kvaOutVal;
        }

        if (kva !== null) {
            va = kva * 1000;
            if (vSecInput !== null && vSecInput > 0) {
                iSec = va / vSecInput;
                if (iSecEl && document.activeElement !== iSecEl) {
                    iSecEl.value = formatCurrent(iSec);
                }
            } else {
                iSec = null;
                if (iSecEl && document.activeElement !== iSecEl) {
                    iSecEl.value = "";
                }
            }
            if (vaEl && document.activeElement !== vaEl) {
                vaEl.value = formatVA(va);
            }
            if (kvaEl && document.activeElement !== kvaEl) {
                kvaEl.value = (document.activeElement === kvaInEl && kvaInEl.value !== "") ? kvaInEl.value : formatKVA(kva);
            }
            if (kvaInEl && document.activeElement !== kvaInEl) {
                kvaInEl.value = (document.activeElement === kvaEl && kvaEl.value !== "") ? kvaEl.value : formatKVA(kva);
            }
        } else {
            if (iSecEl && document.activeElement !== iSecEl) iSecEl.value = "";
            if (vaEl && document.activeElement !== vaEl) vaEl.value = "";
            if (kvaEl && document.activeElement !== kvaEl) kvaEl.value = "";
            if (kvaInEl && document.activeElement !== kvaInEl) kvaInEl.value = "";
        }
    } else {
        // Default: lastCapacitySource === "iSec"
        iSec = g("iSecInput");
        if (iSec !== null) {
            if (vSecInput !== null) {
                va = vSecInput * iSec;
                kva = va / 1000;
                let formattedKVA = formatKVA(kva);
                if (kvaEl && document.activeElement !== kvaEl) {
                    kvaEl.value = formattedKVA;
                }
                if (kvaInEl && document.activeElement !== kvaInEl) {
                    kvaInEl.value = formattedKVA;
                }
                if (vaEl && document.activeElement !== vaEl) {
                    vaEl.value = formatVA(va);
                }
            } else {
                if (kvaEl && document.activeElement !== kvaEl) kvaEl.value = "";
                if (kvaInEl && document.activeElement !== kvaInEl) kvaInEl.value = "";
                if (vaEl && document.activeElement !== vaEl) vaEl.value = "";
            }
        } else {
            if (kvaEl && document.activeElement !== kvaEl) kvaEl.value = "";
            if (kvaInEl && document.activeElement !== kvaInEl) kvaInEl.value = "";
            if (vaEl && document.activeElement !== vaEl) vaEl.value = "";
        }
    }

    let calc1 = document.getElementById("calc1");
    if (calc1) {
        if (lastCapacitySource === "kva") {
            if (kva !== null) {
                if (vSecInput !== null && vSecInput > 0 && iSec !== null) {
                    calc1.innerHTML = `${kva} kVA × 1000 = ${va.toFixed(2)} VA<br>${va.toFixed(2)} VA ÷ ${vSecInput}V = ${formatCurrent(iSec)} A`;
                } else if (vSecInput !== null && vSecInput <= 0) {
                    calc1.innerHTML = `<span style="color:#d32f2f; font-weight:bold;">Secondary Voltage must be > 0</span>`;
                } else {
                    calc1.innerHTML = `${kva} kVA × 1000 = ${va.toFixed(2)} VA`;
                }
            } else {
                calc1.innerHTML = "";
            }
        } else {
            if (va !== null && iSec !== null && vSecInput !== null) {
                calc1.innerHTML = `${vSecInput}V × ${formatCurrent(iSec)}A = ${va.toFixed(2)} VA<br>${va.toFixed(2)} ÷ 1000 = ${formatKVA(kva)} kVA`;
            } else {
                calc1.innerHTML = "";
            }
        }
    }

    let kvaInput = (kva !== null) ? kva : g("kvaInput");

    // --- STEP 2: VOLTS PER TURN ---
    let k = g("k");
    let rawVt = (k !== null && kvaInput !== null && kvaInput >= 0) ? (k * Math.sqrt(kvaInput)) : null;
    let vt = (rawVt !== null) ? truncateToOneDecimal(rawVt) : null;
    
    auto("vt", vt);
    let calc2 = document.getElementById("calc2");
    if (calc2) calc2.innerHTML = (rawVt !== null) ? `${k} × √${kvaInput} = ${rawVt.toFixed(4)} V/T<br>Truncated Baseline: ${vt} V/Turn` : "";
    
    auto("vtInput", vt);
    let vtUsed = g("vtInput");

    // --- STEP 3: PRIMARY TURNS ---
    let primaryVoltage = g("primaryVoltage");
    let primaryTurns = (primaryVoltage !== null && vtUsed) ? (primaryVoltage / vtUsed) : null;
    let roundedPriTurns = (primaryTurns !== null) ? Math.ceil(primaryTurns) : null; 
    let rawActualVT = (primaryVoltage !== null && roundedPriTurns) ? (primaryVoltage / roundedPriTurns) : null;
    let actualVT = (rawActualVT !== null) ? truncateToOneDecimal(rawActualVT) : null;

    auto("primaryTurns", roundedPriTurns);
    auto("actualVT", actualVT);
    let calc3 = document.getElementById("calc3");
    if (calc3) calc3.innerHTML = (primaryTurns !== null) ? `CEIL(${primaryVoltage} ÷ ${vtUsed}) = ${roundedPriTurns} Turns<br>Act V/T: ${primaryVoltage} ÷ ${roundedPriTurns} = ${rawActualVT.toFixed(4)} → ${actualVT} V/T` : "";
    
    let priTurnsUsed = g("primaryTurns");
    let actVTUsed = g("actualVT");

    auto("secondaryVoltage", vSecInput); 
    auto("actualVTInput", actVTUsed);
    let secVoltsUsed = g("secondaryVoltage");
    let secActVTUsed = g("actualVTInput");

    // --- STEP 4: SECONDARY TURNS ---
    let secondaryTurns = (secVoltsUsed !== null && secActVTUsed) ? (secVoltsUsed / secActVTUsed) : null;
    let roundedSecTurns = (secondaryTurns !== null) ? Math.ceil(secondaryTurns) : null; 
    
    auto("secondaryTurns", roundedSecTurns);
    let calc4 = document.getElementById("calc4");
    if (calc4) calc4.innerHTML = (secondaryTurns !== null) ? `CEIL(${secVoltsUsed} ÷ ${secActVTUsed}) = ${roundedSecTurns} Turns` : "";
    let secTurnsUsed = g("secondaryTurns");
    
    auto("netAreaVTInput", vtUsed);
    let netAreaVTInput = g("netAreaVTInput");

    // --- STEP 5: NET CORE AREA ---
    let fluxDensity = g("fluxDensity");
    let frequency = g("frequency");
    let netArea = (netAreaVTInput !== null && fluxDensity && frequency) ? (netAreaVTInput * 1e6) / (4.44 * fluxDensity * frequency) : null;
    
    auto("netAreaOutput", netArea !== null ? Math.round(netArea) : null);
    let calc5 = document.getElementById("calc5");
    if (calc5) calc5.innerHTML = (netArea !== null) ? `(${netAreaVTInput} × 10⁶) ÷ (4.44 × ${fluxDensity} × ${frequency}) = ${Math.round(netArea)} mm²` : "";
    
    auto("netAreaInput", netArea !== null ? Math.round(netArea) : null);
    let netAreaUsed = g("netAreaInput");
    
    // --- STEP 6: GROSS CORE AREA & SELECTION ---
    let stackingFactor = g("stackingFactor");
    let grossArea = (netAreaUsed !== null && stackingFactor) ? (netAreaUsed / stackingFactor) : null;
    auto("grossArea", grossArea !== null ? Math.round(grossArea) : null);

    let tongueWidth = g("tongueWidth");
    let stackHeight = g("stackHeight");
    let selectedArea = (tongueWidth !== null && stackHeight !== null) ? (tongueWidth * stackHeight) : null;
    auto("selectedArea", selectedArea);

    let calc6 = document.getElementById("calc6");
    if (calc6) calc6.innerHTML = (grossArea !== null && selectedArea !== null) ? `Gross Req: ${netAreaUsed} ÷ ${stackingFactor} = ${Math.round(grossArea)} mm²<br>Selected Core: ${tongueWidth}mm × ${stackHeight}mm = ${selectedArea} mm²` : "";

    // --- STEP 7: PRIMARY CONDUCTOR SIZE ---
    auto("vaConductorInput", va);
    auto("vPriConductorInput", primaryVoltage);
    let vaOutput = g("vaConductorInput");
    let vPriUsed = g("vPriConductorInput");
    let delta = g("delta");

    let iPri = (vaOutput !== null && vPriUsed) ? (vaOutput / vPriUsed) : null;
    let priArea = (iPri !== null && delta) ? (iPri / delta) : null;
    
    auto("iPriOutput", iPri !== null ? parseFloat(iPri.toFixed(2)) : null);
    
    let bareDiaPri = (priArea !== null && priArea >= 0) ? Math.sqrt((priArea * 4) / Math.PI) : null;
    auto("priCalcBareDiaOutput", bareDiaPri !== null ? parseFloat(bareDiaPri.toFixed(3)) : null);

    let suggestedPriSwg = (priArea !== null && typeof getSWGForArea === 'function') ? getSWGForArea(priArea) : null;
    if (suggestedPriSwg !== null && typeof getSWGData === 'function') {
        let suggestBadge = document.getElementById("priSwgSuggest");
        let sugData = getSWGData(suggestedPriSwg);
        let maxCap = (sugData.area * delta).toFixed(2);
        if (suggestBadge) suggestBadge.innerText = `${suggestedPriSwg} SWG (Max Cap: ${maxCap} A)`;

        let swgSelectEl = document.getElementById("priSwgSelect");
        if (swgSelectEl && !swgSelectEl.dataset.edited) {
            swgSelectEl.value = suggestedPriSwg.toString();
        }
    } else {
        let suggestBadge = document.getElementById("priSwgSuggest");
        if (suggestBadge) suggestBadge.innerText = "Waiting...";
    }

    let priSwgSelectElForRead = document.getElementById("priSwgSelect");
    let selectedPriSwg = (priSwgSelectElForRead && priSwgSelectElForRead.value !== "custom" && priSwgSelectElForRead.value !== "") ? priSwgSelectElForRead.value : null;
    let priSwgData = (selectedPriSwg !== null && typeof getSWGData === 'function') ? getSWGData(selectedPriSwg) : null;

    let priSelectedBareDiaEl = document.getElementById("priSelectedBareDia");
    if (priSwgData && priSelectedBareDiaEl && !priSelectedBareDiaEl.dataset.edited) {
        priSelectedBareDiaEl.value = priSwgData.bareDia;
    }

    let swgNumPri = parseInt(selectedPriSwg);
    let priFlatSec = document.getElementById("priFlatWireSection");
    if (priFlatSec) {
        if (!isNaN(swgNumPri) && swgNumPri <= 13) {
            priFlatSec.style.display = "block";
            if(document.getElementById("priStripSuggestions")) {
                document.getElementById("priStripSuggestions").innerText = generateStripSuggestions(priArea);
            }
        } else {
            priFlatSec.style.display = "none";
            if(document.getElementById("priWireTypeRound")) document.getElementById("priWireTypeRound").checked = true;
        }
    }

    let isPriFlat = document.getElementById("priWireTypeFlat") && document.getElementById("priWireTypeFlat").checked;
    let priFlatInputs = document.getElementById("priFlatInputs");
    if(priFlatInputs) priFlatInputs.style.display = isPriFlat ? "block" : "none";

    let priFlatBreadth = g("priFlatBreadth");
    let priFlatHeight = g("priFlatHeight");
    let priParallel = g("priParallel") || 1;
    let priEffectiveHeight = null;

    if (isPriFlat && priFlatBreadth !== null && priFlatHeight !== null) {
        let enteredArea = priFlatBreadth * priFlatHeight;
        priEffectiveHeight = priFlatHeight * priParallel;
        let priEffectiveArea = priFlatBreadth * priEffectiveHeight;

        if (document.getElementById("priEnteredAreaOutput")) document.getElementById("priEnteredAreaOutput").value = parseFloat(enteredArea.toFixed(2));
        if (document.getElementById("priEffectiveHeightOutput")) document.getElementById("priEffectiveHeightOutput").value = parseFloat(priEffectiveHeight.toFixed(2));
        document.getElementById("priFlatAreaOutput").value = parseFloat(priEffectiveArea.toFixed(2));
        
        let warning = document.getElementById("priFlatWarning");
        // Warn if effective area is completely off (arbitrary 10% diff)
        if(warning) warning.style.display = (Math.abs(priEffectiveArea - priArea) / priArea > 0.1) ? "block" : "none"; 
    } else {
        if (document.getElementById("priEnteredAreaOutput")) document.getElementById("priEnteredAreaOutput").value = "";
        if (document.getElementById("priEffectiveHeightOutput")) document.getElementById("priEffectiveHeightOutput").value = "";
        document.getElementById("priFlatAreaOutput").value = "";
        if(document.getElementById("priFlatWarning")) document.getElementById("priFlatWarning").style.display = "none";
    }

    let priInsAdd = g("priInsAddition") || 0.1;
    let priBareDiaUsed = g("priSelectedBareDia");
    let priBareStd = (priBareDiaUsed !== null) ? (Math.floor(priBareDiaUsed * 10) / 10) : null; 
    let insDiaPri = (priBareStd !== null) ? (priBareStd + priInsAdd) : null;
    
    auto("priInsDiaInput", insDiaPri !== null ? parseFloat(insDiaPri.toFixed(2)) : null);
    let insDiaPriUsed = g("priInsDiaInput");

    let calc7 = document.getElementById("calc7");
    if (calc7) calc7.innerHTML = (bareDiaPri !== null) ? `I_pri: ${vaOutput} ÷ ${vPriUsed} = ${iPri.toFixed(2)} A<br>Target Area: ${iPri.toFixed(2)} ÷ ${delta} = ${priArea.toFixed(2)} mm²<br>Bare d: √(${priArea.toFixed(2)} × 4 / π) = ${bareDiaPri.toFixed(2)} mm` : "";

    // --- STEP 8: PRIMARY TURNS & LAYERS ---
    let limbsCount = g("limbsCount") || 2;
    let priTurnsLimb = (priTurnsUsed !== null && limbsCount) ? Math.ceil(priTurnsUsed / limbsCount) : null;
    auto("priTurnsLimbOutput", priTurnsLimb);
    let priTurnsLimbUsed = g("priTurnsLimbOutput");

    let bobbinHeightPri = g("bobbinHeightPri");
    let bobbinFlange = g("bobbinFlange") || 7;
    let priSafetyMargin = g("priSafetyMargin") || 0;
    
    let priWindingLen = (bobbinHeightPri !== null && bobbinFlange !== null) ? (bobbinHeightPri - bobbinFlange) : null;
    let priTPL = null;
    
    if (isPriFlat) {
        if (priWindingLen !== null && priFlatBreadth) {
            priTPL = Math.floor(priWindingLen / priFlatBreadth) - priSafetyMargin;
        }
    } else {
        if (priWindingLen !== null && insDiaPriUsed) {
            priTPL = Math.floor(priWindingLen / insDiaPriUsed) - priSafetyMargin;
        }
    }
    
    auto("priTplOutput", priTPL);
    let priTPLUsed = g("priTplOutput");

    let priLayers = (priTurnsLimbUsed !== null && priTPLUsed) ? Math.ceil(priTurnsLimbUsed / priTPLUsed) : null;
    auto("priLayersOutput", priLayers);
    let priLayersUsed = g("priLayersOutput");

    let calc8 = document.getElementById("calc8");
    if (calc8) {
        let tplDivisor = isPriFlat ? priFlatBreadth : insDiaPriUsed;
        calc8.innerHTML = (priLayers !== null) ? `Turns/Limb: CEIL(${priTurnsUsed} ÷ ${limbsCount}) = ${priTurnsLimbUsed}<br>TPL: FLOOR((${bobbinHeightPri} - ${bobbinFlange}) ÷ ${tplDivisor}) - ${priSafetyMargin} = ${priTPLUsed}<br>Layers: CEIL(${priTurnsLimbUsed} ÷ ${priTPLUsed}) = ${priLayers}` : "";
    }

    // --- STEP 9: PRIMARY RADIAL THICKNESS ---
    let paperThickness = g("paperThickness") || 0.127;
    let priPaperLayers = g("priPaperLayers") || 4;
    let priRadBuild = null;
    
    if (isPriFlat) {
        if (priEffectiveHeight !== null && priLayersUsed !== null) {
            priRadBuild = (priEffectiveHeight * priLayersUsed) + (paperThickness * priPaperLayers);
        }
    } else {
        if (insDiaPriUsed !== null && priLayersUsed !== null) {
            priRadBuild = (insDiaPriUsed * priLayersUsed) + (paperThickness * priPaperLayers);
        }
    }
    
    auto("priRadialOutput", priRadBuild !== null ? Math.ceil(priRadBuild) : null);
    let priRadUsed = g("priRadialOutput");

    let calc9 = document.getElementById("calc9");
    if (calc9) {
        let radMult = isPriFlat ? priFlatHeight : insDiaPriUsed;
        calc9.innerHTML = (priRadBuild !== null) ? `Rad Thick: (${radMult} × ${priLayersUsed}) + (${paperThickness} × ${priPaperLayers}) = ${priRadBuild.toFixed(2)} mm → CEIL: ${priRadUsed} mm` : "";
    }

    // --- STEP 10: PRIMARY LMT & WEIGHT ---
    let coilClearance = g("coilClearance") || 3.5;
    let rhoCu = g("rhoCu") || 8.89;
    
    let innerW = (tongueWidth !== null) ? (tongueWidth + (2 * coilClearance)) : null;
    let innerL = (stackHeight !== null) ? (stackHeight + (2 * coilClearance)) : null;
    let priOuterW = (innerW !== null && priRadUsed !== null) ? (innerW + (2 * priRadUsed)) : null;
    let priOuterL = (innerL !== null && priRadUsed !== null) ? (innerL + (2 * priRadUsed)) : null;
    
    let priLMT = (innerW !== null && innerL !== null && priOuterW !== null && priOuterL !== null) ? ((innerW + priOuterW + innerL + priOuterL) / 1000) : null;
    auto("priLmtOutput", priLMT !== null ? parseFloat(priLMT.toFixed(3)) : null);
    let priLMTUsed = g("priLmtOutput");

    let priActualArea = (insDiaPriUsed !== null) ? ((Math.PI * Math.pow(insDiaPriUsed, 2)) / 4) : null;
    let priWeight = (priLMTUsed !== null && priTurnsLimbUsed !== null && priActualArea !== null && rhoCu !== null) ? (priLMTUsed * priTurnsLimbUsed * limbsCount * priActualArea * rhoCu * 1e-3) : null;
    auto("priWeightOutput", priWeight !== null ? parseFloat(priWeight.toFixed(2)) : null);

    let calc10 = document.getElementById("calc10");
    if (calc10) calc10.innerHTML = (priWeight !== null) ? `In Width: ${innerW}mm | In Length: ${innerL}mm<br>Out Width: ${priOuterW}mm | Out Length: ${priOuterL}mm<br>Wt: ${priLMTUsed}m × ${priTurnsLimbUsed} × ${limbsCount} × ${priActualArea.toFixed(2)}mm² × ${rhoCu} × 10⁻³ = ${priWeight.toFixed(2)} kg` : "";

    // --- PHASE 4: MECHANICAL HARDWARE DIMENSIONING ---
    // STEP 11
    let tbobbinClamp = g("tbobbinClamp") || 3.5;
    let extraSpaceClamp = g("extraSpaceClamp") || 9;
    let centerGapClamp = g("centerGapClamp") || 10;
    
    let aClamp = (priRadUsed !== null) ? ((2 * tbobbinClamp) + (2 * priRadUsed) + (2 * extraSpaceClamp) + centerGapClamp) : null;
    auto("aClampOutput", aClamp);
    let aClampUsed = g("aClampOutput");
    
    let clampLen = (tongueWidth !== null && aClampUsed !== null) ? (tongueWidth + aClampUsed + tongueWidth) : null;
    auto("clampLenOutput", clampLen);
    
    let calc11 = document.getElementById("calc11");
    if (calc11) calc11.innerHTML = (aClamp !== null) ? `A_clamp = (2×${tbobbinClamp}) + (2×${priRadUsed}) + (2×${extraSpaceClamp}) + ${centerGapClamp} = ${aClamp} mm<br>Length = ${tongueWidth} + ${aClampUsed} + ${tongueWidth} = ${clampLen} mm` : "";

    // STEP 12
    let bendingDed = g("bendingDeduction") || 10;
    let msThick = g("msThickness") || 3;
    let rhoMS = g("rhoMS") || 7.85;
    let clampQty = g("clampQty") || 4;
    
    let clampWidth = (tongueWidth !== null) ? (tongueWidth + (tongueWidth - bendingDed)) : null;
    auto("clampWidthOutput", clampWidth);
    
    let clampLenUsed = g("clampLenOutput");
    let clampWidthUsed = g("clampWidthOutput");
    
    let wClampPer = (clampLenUsed !== null && clampWidthUsed !== null) ? (clampLenUsed * clampWidthUsed * msThick * rhoMS * 1e-6) : null;
    let totalClampWt = (wClampPer !== null) ? (wClampPer * clampQty) : null;
    
    auto("totalClampWtOutput", totalClampWt !== null ? parseFloat(totalClampWt.toFixed(2)) : null);
    
    let calc12 = document.getElementById("calc12");
    if (calc12) calc12.innerHTML = (wClampPer !== null) ? `W_per: ${clampLenUsed} × ${clampWidthUsed} × ${msThick} × ${rhoMS} × 10⁻⁶ = ${wClampPer.toFixed(2)} kg<br>Total Wt = ${wClampPer.toFixed(2)} × ${clampQty} = ${totalClampWt.toFixed(2)} kg` : "";

    // STEP 13
    let coreGapBobbin = g("coreGapBobbin") || 2;
    let tapeBufferBobbin = g("tapeBufferBobbin") || 10;
    
    let bobbinInnerW = (tongueWidth !== null) ? (tongueWidth + coreGapBobbin) : null;
    let bobbinInnerL = stackHeight; 
    let bobbinOuterClear = (priRadUsed !== null) ? (priRadUsed + tapeBufferBobbin) : null;
    
    auto("bobbinOuterClearOutput", bobbinOuterClear);
    let bobbinOuterClearUsed = g("bobbinOuterClearOutput");
    
    let bobbinOuterW = (bobbinInnerW !== null && bobbinOuterClearUsed !== null) ? (bobbinInnerW + (2 * bobbinOuterClearUsed)) : null;
    let bobbinOuterL = (bobbinInnerL !== null && bobbinOuterClearUsed !== null) ? (bobbinInnerL + (2 * bobbinOuterClearUsed)) : null;
    
    // UPDATE LIVE SVG LABELS FOR BLUEPRINT
    if(document.getElementById("svg_a")) document.getElementById("svg_a").textContent = bobbinInnerW !== null ? `a = ${bobbinInnerW}` : "a = --";
    if(document.getElementById("svg_b")) document.getElementById("svg_b").textContent = bobbinOuterW !== null ? `b = ${bobbinOuterW}` : "b = --";
    if(document.getElementById("svg_c")) document.getElementById("svg_c").textContent = bobbinInnerL !== null ? `c = ${bobbinInnerL}` : "c = --";
    if(document.getElementById("svg_d")) document.getElementById("svg_d").textContent = bobbinOuterL !== null ? `d = ${bobbinOuterL}` : "d = --";
    if(document.getElementById("svg_h")) document.getElementById("svg_h").textContent = bobbinHeightPri !== null ? `h = ${bobbinHeightPri}` : "h = --";

    let calc13 = document.getElementById("calc13");
    if (calc13) calc13.innerHTML = (bobbinInnerW !== null) ? `Inner W: ${tongueWidth} + ${coreGapBobbin} = ${bobbinInnerW} mm<br>Outer Clear: ${priRadUsed} + ${tapeBufferBobbin} = ${bobbinOuterClear} mm` : "";

    // STEP 14
    let tbobbinMat = g("tbobbinMat") || 3;
    let rhoBobbin = g("rhoBobbin") || 2.20;
    
    let aFlange = (bobbinOuterW !== null && bobbinOuterL !== null && bobbinInnerW !== null && bobbinInnerL !== null) ? ((bobbinOuterW * bobbinOuterL) - (bobbinInnerW * bobbinInnerL)) : null;
    let wFlange = (aFlange !== null) ? (aFlange * tbobbinMat * rhoBobbin * 1e-6) : null;
    
    let wWallLong = (bobbinInnerL !== null && bobbinHeightPri !== null) ? (bobbinInnerL * bobbinHeightPri * tbobbinMat * rhoBobbin * 1e-6) : null;
    let wWallShort = (bobbinInnerW !== null && bobbinHeightPri !== null) ? (bobbinInnerW * bobbinHeightPri * tbobbinMat * rhoBobbin * 1e-6) : null;
    
    let wSingleBobbin = (wFlange !== null && wWallLong !== null && wWallShort !== null) ? ((2 * wFlange) + (2 * wWallLong) + (2 * wWallShort)) : null;
    let totalBobbinWt = (wSingleBobbin !== null && limbsCount !== null) ? (wSingleBobbin * limbsCount) : null;
    
    if (document.getElementById("flangeWtOutput")) document.getElementById("flangeWtOutput").value = wFlange !== null ? parseFloat(wFlange.toFixed(3)) : "";
    if (document.getElementById("wallWtOutput")) document.getElementById("wallWtOutput").value = (wWallLong !== null && wWallShort !== null) ? `${wWallLong.toFixed(3)} / ${wWallShort.toFixed(3)}` : "";
    auto("totalBobbinWtOutput", totalBobbinWt !== null ? parseFloat(totalBobbinWt.toFixed(2)) : null);
    
    let calc14 = document.getElementById("calc14");
    if (calc14) calc14.innerHTML = (aFlange !== null) ? `A_flange = (${bobbinOuterW}×${bobbinOuterL}) - (${bobbinInnerW}×${bobbinInnerL}) = ${aFlange} mm²<br>1x Bobbin Wt = ${wSingleBobbin.toFixed(2)} kg<br>Total All Limbs = ${wSingleBobbin.toFixed(2)} × ${limbsCount} = ${totalBobbinWt.toFixed(2)} kg` : "";


    // --- PHASE 5: SECONDARY WINDING (SPLIT-BOBBIN CONFIG) ---
    // STEP 15
    let iSecInputCalc = g("iSecInput");
    let aSec = (iSecInputCalc !== null && delta) ? (iSecInputCalc / delta) : null;
    let bareDiaSec = (aSec !== null && aSec >= 0) ? Math.sqrt((aSec * 4) / Math.PI) : null;
    auto("secCalcBareDiaOutput", bareDiaSec !== null ? parseFloat(bareDiaSec.toFixed(3)) : null);

    let suggestedSecSwg = (aSec !== null && typeof getSWGForArea === 'function') ? getSWGForArea(aSec) : null;
    if (suggestedSecSwg !== null && typeof getSWGData === 'function') {
        let suggestBadge = document.getElementById("secSwgSuggest");
        let sugData = getSWGData(suggestedSecSwg);
        let maxCap = (sugData.area * delta).toFixed(2);
        if (suggestBadge) suggestBadge.innerText = `${suggestedSecSwg} SWG (Max Cap: ${maxCap} A)`;

        let swgSelectEl = document.getElementById("secSwgSelect");
        if (swgSelectEl && !swgSelectEl.dataset.edited) {
            swgSelectEl.value = suggestedSecSwg.toString();
        }
    } else {
        let suggestBadge = document.getElementById("secSwgSuggest");
        if (suggestBadge) suggestBadge.innerText = "Waiting...";
    }

    let secSwgSelectElForRead = document.getElementById("secSwgSelect");
    let selectedSecSwg = (secSwgSelectElForRead && secSwgSelectElForRead.value !== "custom" && secSwgSelectElForRead.value !== "") ? secSwgSelectElForRead.value : null;
    let secSwgData = (selectedSecSwg !== null && typeof getSWGData === 'function') ? getSWGData(selectedSecSwg) : null;

    let secSelectedBareDiaEl = document.getElementById("secSelectedBareDia");
    if (secSwgData && secSelectedBareDiaEl && !secSelectedBareDiaEl.dataset.edited) {
        secSelectedBareDiaEl.value = secSwgData.bareDia;
    }

    let swgNumSec = parseInt(selectedSecSwg);
    let secFlatSec = document.getElementById("secFlatWireSection");
    if (secFlatSec) {
        if (!isNaN(swgNumSec) && swgNumSec <= 13) {
            secFlatSec.style.display = "block";
            if(document.getElementById("secStripSuggestions")) {
                document.getElementById("secStripSuggestions").innerText = generateStripSuggestions(aSec);
            }
        } else {
            secFlatSec.style.display = "none";
            if(document.getElementById("secWireTypeRound")) document.getElementById("secWireTypeRound").checked = true;
        }
    }

    let isSecFlat = document.getElementById("secWireTypeFlat") && document.getElementById("secWireTypeFlat").checked;
    let secFlatInputs = document.getElementById("secFlatInputs");
    if(secFlatInputs) secFlatInputs.style.display = isSecFlat ? "block" : "none";

    let secFlatBreadth = g("secFlatBreadth");
    let secFlatHeight = g("secFlatHeight");
    let secParallel = g("secParallel") || 1;
    let secEffectiveHeight = null;

    if (isSecFlat && secFlatBreadth !== null && secFlatHeight !== null) {
        let enteredArea = secFlatBreadth * secFlatHeight;
        secEffectiveHeight = secFlatHeight * secParallel;
        let secEffectiveArea = secFlatBreadth * secEffectiveHeight;

        if (document.getElementById("secEnteredAreaOutput")) document.getElementById("secEnteredAreaOutput").value = parseFloat(enteredArea.toFixed(2));
        if (document.getElementById("secEffectiveHeightOutput")) document.getElementById("secEffectiveHeightOutput").value = parseFloat(secEffectiveHeight.toFixed(2));
        document.getElementById("secFlatAreaOutput").value = parseFloat(secEffectiveArea.toFixed(2));
        
        let warning = document.getElementById("secFlatWarning");
        if(warning) warning.style.display = (Math.abs(secEffectiveArea - aSec) / aSec > 0.1) ? "block" : "none"; 
    } else {
        if (document.getElementById("secEnteredAreaOutput")) document.getElementById("secEnteredAreaOutput").value = "";
        if (document.getElementById("secEffectiveHeightOutput")) document.getElementById("secEffectiveHeightOutput").value = "";
        document.getElementById("secFlatAreaOutput").value = "";
        if(document.getElementById("secFlatWarning")) document.getElementById("secFlatWarning").style.display = "none";
    }

    let secInsAdd = g("secInsAddition") || 0.01;
    let secBareDiaUsed = g("secSelectedBareDia");
    let secInsDia = (secBareDiaUsed !== null) ? (secBareDiaUsed + secInsAdd) : null;
    
    auto("secInsDiaInput", secInsDia !== null ? parseFloat(secInsDia.toFixed(2)) : null);
    let insDiaSecUsed = g("secInsDiaInput");

    let calc15 = document.getElementById("calc15");
    if (calc15) calc15.innerHTML = (bareDiaSec !== null) ? `Target Area: ${iSecInputCalc} ÷ ${delta} = ${aSec.toFixed(2)} mm²<br>Bare d: √(${aSec.toFixed(2)} × 4 / π) = ${bareDiaSec.toFixed(2)} mm` : "";

    // STEP 16
    let secTurnsLimb = (secTurnsUsed !== null && limbsCount) ? Math.ceil(secTurnsUsed / limbsCount) : null;
    auto("secTurnsLimbOutput", secTurnsLimb);
    let secTurnsLimbUsed = g("secTurnsLimbOutput");

    let bobbinHeightSec = g("bobbinHeightSec");
    let secSafetyMargin = g("secSafetyMargin") || 0;
    
    let secWindingLen = (bobbinHeightSec !== null && bobbinFlange !== null) ? (bobbinHeightSec - bobbinFlange) : null;
    let secTPL = null;
    
    if (isSecFlat) {
        if (secWindingLen !== null && secFlatBreadth) {
            secTPL = Math.floor(secWindingLen / secFlatBreadth) - secSafetyMargin;
        }
    } else {
        if (secWindingLen !== null && insDiaSecUsed) {
            secTPL = Math.floor(secWindingLen / insDiaSecUsed) - secSafetyMargin;
        }
    }
    
    auto("secTplOutput", secTPL);
    let secTPLUsed = g("secTplOutput");

    let secLayers = (secTurnsLimbUsed !== null && secTPLUsed) ? Math.ceil(secTurnsLimbUsed / secTPLUsed) : null;
    auto("secLayersOutput", secLayers);
    let secLayersUsed = g("secLayersOutput");

    let secPaperLayers = g("secPaperLayers") || 4;
    let secRadBuild = null;
    
    if (isSecFlat) {
        if (secEffectiveHeight !== null && secLayersUsed !== null) {
            secRadBuild = (secEffectiveHeight * secLayersUsed) + (paperThickness * secPaperLayers);
        }
    } else {
        if (insDiaSecUsed !== null && secLayersUsed !== null) {
            secRadBuild = (insDiaSecUsed * secLayersUsed) + (paperThickness * secPaperLayers);
        }
    }
    
    auto("secRadialOutput", secRadBuild !== null ? Math.ceil(secRadBuild) : null);
    let secRadUsed = g("secRadialOutput");

    let calc16 = document.getElementById("calc16");
    if (calc16) {
        let tplDivisor = isSecFlat ? secFlatBreadth : insDiaSecUsed;
        let radMult = isSecFlat ? secFlatHeight : insDiaSecUsed;
        calc16.innerHTML = (secLayers !== null) ? `TPL: FLOOR((${bobbinHeightSec} - ${bobbinFlange}) ÷ ${tplDivisor}) - ${secSafetyMargin} = ${secTPLUsed}<br>Layers = CEIL(${secTurnsLimbUsed} ÷ ${secTPLUsed}) = ${secLayers}<br>Rad = (${radMult} × ${secLayersUsed}) + (${paperThickness} × ${secPaperLayers}) = ${secRadBuild.toFixed(2)} mm` : "";
    }

    // STEP 17
    let secOuterW = (innerW !== null && secRadUsed !== null) ? (innerW + (2 * secRadUsed)) : null;
    let secOuterL = (innerL !== null && secRadUsed !== null) ? (innerL + (2 * secRadUsed)) : null;
    let secLMT = (innerW !== null && innerL !== null && secOuterW !== null && secOuterL !== null) ? ((innerW + secOuterW + innerL + secOuterL) / 1000) : null;
    
    auto("secLmtOutput", secLMT !== null ? parseFloat(secLMT.toFixed(3)) : null);
    let secLMTUsed = g("secLmtOutput");

    let secActualArea = (insDiaSecUsed !== null) ? ((Math.PI * Math.pow(insDiaSecUsed, 2)) / 4) : null;
    let secWeight = (secLMTUsed !== null && secTurnsLimbUsed !== null && limbsCount !== null && secActualArea !== null && rhoCu !== null) ? (secLMTUsed * secTurnsLimbUsed * limbsCount * secActualArea * rhoCu * 1e-3) : null;
    
    auto("secWeightOutput", secWeight !== null ? parseFloat(secWeight.toFixed(2)) : null);

    let calc17 = document.getElementById("calc17");
    if (calc17) calc17.innerHTML = (secWeight !== null) ? `In: ${innerW}×${innerL} | Out: ${secOuterW}×${secOuterL}<br>LMT: ${secLMT.toFixed(3)} m<br>Wt: ${secLMTUsed} × ${secTurnsLimbUsed} × ${limbsCount} × ${secActualArea.toFixed(2)} × ${rhoCu} × 10⁻³ = ${secWeight.toFixed(2)} kg` : "";


    // --- PHASE 6: CORE MASS VALIDATION ---
    // STEP 18
    let finalCoreSf = g("finalCoreSf") || 0.98;
    
    // 1. Calculate actual net area purely in memory
    let actualNetArea = (selectedArea !== null) ? Math.round(selectedArea * finalCoreSf) : null;
    
    // (We still attempt to push it to the UI if the box exists, but we don't rely on reading it back)
    auto("actualNetAreaOutput", actualNetArea);
    
    // 2. Auto-populate dimensions based on upstream entries
    auto("coreD", tongueWidth);
    auto("coreST", stackHeight);
    
    let coreD = g("coreD");
    let coreST = g("coreST");

    // Primary-to-Secondary Gap (synchronized between Step 16 and Step 18)
    let priSecGap16El = document.getElementById("priSecGap_step16");
    let priSecGap18El = document.getElementById("priSecGap");
    if (priSecGap16El && priSecGap18El && priSecGap16El.value !== priSecGap18El.value) {
        if (document.activeElement === priSecGap16El) {
            priSecGap18El.value = priSecGap16El.value;
            if (priSecGap16El.dataset.edited) priSecGap18El.dataset.edited = "1";
            else delete priSecGap18El.dataset.edited;
        } else if (document.activeElement === priSecGap18El) {
            priSecGap16El.value = priSecGap18El.value;
            if (priSecGap18El.dataset.edited) priSecGap16El.dataset.edited = "1";
            else delete priSecGap16El.dataset.edited;
        }
    }

    let priSecGapVal = g("priSecGap");
    if (priSecGapVal === null) priSecGapVal = g("priSecGap_step16");
    let priSecGap = (priSecGapVal !== null) ? priSecGapVal : 0;

    // Window Length (L): Primary Bobbin Height + Secondary Bobbin Height + Primary-to-Secondary Gap
    let calculatedL = (bobbinHeightPri !== null && bobbinHeightSec !== null) 
                      ? (bobbinHeightPri + bobbinHeightSec + priSecGap) 
                      : null;
    auto("coreL", calculatedL);
    let coreL = g("coreL");

    // Window Width (A): (Core-to-Primary Gap + Bobbin Gap + Radial Thickness + Primary-to-Primary Gap) × 2 + Tongue Dimension
    let coreToPriGap = (g("coreToPriGap") !== null) ? g("coreToPriGap") : 1;
    let bobbinGap = (g("bobbinGap") !== null) ? g("bobbinGap") : 3.5;
    let priPriGap = (g("priPriGap") !== null) ? g("priPriGap") : 0;
    let radialThickness = priRadUsed;

    let calculatedA = (radialThickness !== null && coreD !== null)
                      ? (((coreToPriGap + bobbinGap + radialThickness + priPriGap) * 2) + coreD)
                      : null;
    auto("coreA", calculatedA);
    let coreA = g("coreA");
    
    // 3. Calculate perimeter purely in memory (P = 2D + 2L + 2A, excluding 2ST)
    let framePerimeterCalc = (coreD !== null && coreL !== null && coreA !== null) 
                             ? ((2 * coreD) + (2 * coreL) + (2 * coreA)) 
                             : null;
                             
    auto("framePerimeterOutput", framePerimeterCalc);

    let rhoSteel = g("rhoSteel") || 7.65;
    
    // 4. CRITICAL FIX: Calculate mass using the memory variables (framePerimeterCalc & actualNetArea)
    // We no longer rely on g() to fetch these intermediate steps from the HTML.
    let coreMass = (framePerimeterCalc !== null && actualNetArea !== null && rhoSteel !== null) 
                   ? (framePerimeterCalc * actualNetArea * rhoSteel * 1e-6) 
                   : null;
    
    auto("coreMassOutput", coreMass !== null ? parseFloat(coreMass.toFixed(2)) : null);

    let calc18 = document.getElementById("calc18");
    if (calc18) {
        if (coreMass !== null) {
            let trace = "";
            if (bobbinHeightPri !== null && bobbinHeightSec !== null) {
                trace += `L = ${bobbinHeightPri} + ${bobbinHeightSec} + ${priSecGap} = ${coreL} mm<br>`;
            }
            if (radialThickness !== null && coreD !== null) {
                trace += `A = (${coreToPriGap} + ${bobbinGap} + ${radialThickness} + ${priPriGap}) × 2 + ${coreD} = ${coreA} mm<br>`;
            }
            trace += `Perimeter = 2(${coreD}) + 2(${coreL}) + 2(${coreA}) = ${framePerimeterCalc} mm<br>Mass: ${framePerimeterCalc} × ${actualNetArea} × ${rhoSteel} × 10⁻⁶ = ${coreMass.toFixed(2)} kg`;
            calc18.innerHTML = trace;
        } else {
            calc18.innerHTML = "";
        }
    }

    // --- SUMMARY MODAL POPULATION ---
    let conductorMaterial = document.getElementById("conductorMaterial") ? document.getElementById("conductorMaterial").value : "Copper";
    
    if(document.getElementById("sumMaterial")) document.getElementById("sumMaterial").innerText = conductorMaterial;
    if(document.getElementById("sumPriVolts")) document.getElementById("sumPriVolts").innerText = primaryVoltage !== null ? `${primaryVoltage} V` : "--";
    if(document.getElementById("sumSecVolts")) document.getElementById("sumSecVolts").innerText = vSecInput !== null ? `${vSecInput} V` : "--";
    if(document.getElementById("sumVA")) document.getElementById("sumVA").innerText = va !== null ? `${va.toFixed(2)} VA (${(va/1000).toFixed(3)} kVA)` : "--";
    
    let tongue = tongueWidth;
    let stack = stackHeight;
    if(document.getElementById("sumCore")) document.getElementById("sumCore").innerText = (netAreaUsed !== null && tongue !== null && stack !== null) ? `${netAreaUsed} mm² / ${tongue}×${stack} mm` : "--";
    
    let priSwgSel = document.getElementById("priSwgSelect");
    let priSwgStr = (priSwgSel && priSwgSel.value !== "custom" && priSwgSel.value !== "") ? priSwgSel.value + " SWG" : "Custom";
    let priWtStr = document.getElementById("priWeightOutput") ? document.getElementById("priWeightOutput").value : "--";
    if(document.getElementById("sumPriDetails")) {
        if(isPriFlat) {
            let priParallelSum = g("priParallel") || 1;
            let priEnteredAreaSum = (priFlatBreadth !== null && priFlatHeight !== null) ? parseFloat((priFlatBreadth * priFlatHeight).toFixed(2)) : "--";
            let priEffAreaSum = (priFlatBreadth !== null && priFlatHeight !== null) ? parseFloat((priFlatBreadth * priFlatHeight * priParallelSum).toFixed(2)) : "--";
            let priEffHeightSum = (priFlatHeight !== null) ? parseFloat((priFlatHeight * priParallelSum).toFixed(2)) : "--";
            document.getElementById("sumPriDetails").innerHTML = (priTurnsUsed !== null) ? `<strong>Flat Wire:</strong> ${priFlatBreadth}×${priFlatHeight} mm × ${priParallelSum} (Parallel)<br>Effective H: ${priEffHeightSum} mm | Ent. Area: ${priEnteredAreaSum} mm² | Eff. Area: ${priEffAreaSum} mm²<br>${priTurnsUsed} Turns, ${priWtStr || "--"} kg<br><small style="color:#777;">(Equivalent Round: ${priSwgStr})</small>` : "--";
        } else {
            document.getElementById("sumPriDetails").innerHTML = (priTurnsUsed !== null) ? `<strong>Round Wire:</strong> ${priTurnsUsed} Turns, ${priSwgStr}, ${priWtStr || "--"} kg` : "--";
        }
    }
    
    let secSwgSel = document.getElementById("secSwgSelect");
    let secSwgStr = (secSwgSel && secSwgSel.value !== "custom" && secSwgSel.value !== "") ? secSwgSel.value + " SWG" : "Custom";
    let secWtStr = document.getElementById("secWeightOutput") ? document.getElementById("secWeightOutput").value : "--";
    if(document.getElementById("sumSecDetails")) {
        if(isSecFlat) {
            let secParallelSum = g("secParallel") || 1;
            let secEnteredAreaSum = (secFlatBreadth !== null && secFlatHeight !== null) ? parseFloat((secFlatBreadth * secFlatHeight).toFixed(2)) : "--";
            let secEffAreaSum = (secFlatBreadth !== null && secFlatHeight !== null) ? parseFloat((secFlatBreadth * secFlatHeight * secParallelSum).toFixed(2)) : "--";
            let secEffHeightSum = (secFlatHeight !== null) ? parseFloat((secFlatHeight * secParallelSum).toFixed(2)) : "--";
            document.getElementById("sumSecDetails").innerHTML = (secTurnsUsed !== null) ? `<strong>Flat Wire:</strong> ${secFlatBreadth}×${secFlatHeight} mm × ${secParallelSum} (Parallel)<br>Effective H: ${secEffHeightSum} mm | Ent. Area: ${secEnteredAreaSum} mm² | Eff. Area: ${secEffAreaSum} mm²<br>${secTurnsUsed} Turns, ${secWtStr || "--"} kg<br><small style="color:#777;">(Equivalent Round: ${secSwgStr})</small>` : "--";
        } else {
            document.getElementById("sumSecDetails").innerHTML = (secTurnsUsed !== null) ? `<strong>Round Wire:</strong> ${secTurnsUsed} Turns, ${secSwgStr}, ${secWtStr || "--"} kg` : "--";
        }
    }
    
    let coreMassStr = document.getElementById("coreMassOutput") ? document.getElementById("coreMassOutput").value : "--";
    if(document.getElementById("sumCoreWt")) document.getElementById("sumCoreWt").innerText = (coreMassStr && coreMassStr !== "--") ? `${coreMassStr} kg` : "--";

    let bobbinWtStr = document.getElementById("totalBobbinWtOutput") ? document.getElementById("totalBobbinWtOutput").value : "--";
    if(document.getElementById("sumBobbinWt")) document.getElementById("sumBobbinWt").innerText = (bobbinWtStr && bobbinWtStr !== "--") ? `${bobbinWtStr} kg` : "--";
    
    let clampWtStr = document.getElementById("totalClampWtOutput") ? document.getElementById("totalClampWtOutput").value : "--";
    if(document.getElementById("sumClampWt")) document.getElementById("sumClampWt").innerText = (clampWtStr && clampWtStr !== "--") ? `${clampWtStr} kg` : "--";

    // Update Modal SVG Blueprint
    if(document.getElementById("modal_svg_a")) document.getElementById("modal_svg_a").textContent = bobbinInnerW !== null ? `a = ${bobbinInnerW}` : "a = --";
    if(document.getElementById("modal_svg_b")) document.getElementById("modal_svg_b").textContent = bobbinOuterW !== null ? `b = ${bobbinOuterW}` : "b = --";
    if(document.getElementById("modal_svg_c")) document.getElementById("modal_svg_c").textContent = bobbinInnerL !== null ? `c = ${bobbinInnerL}` : "c = --";
    if(document.getElementById("modal_svg_d")) document.getElementById("modal_svg_d").textContent = bobbinOuterL !== null ? `d = ${bobbinOuterL}` : "d = --";
    if(document.getElementById("modal_svg_h")) document.getElementById("modal_svg_h").textContent = bobbinHeightPri !== null ? `h = ${bobbinHeightPri}` : "h = --";
}

function save() {
    let data = [...document.querySelectorAll("input, select")].map(i => {
        if (i.type === "radio") {
            return [i.id, i.checked ? "true" : "false", i.dataset.edited || ""];
        }
        return [i.id, i.value, i.dataset.edited || ""];
    });
    localStorage.setItem("split_tx", JSON.stringify(data));
    localStorage.setItem("split_tx_cap_source", lastCapacitySource);
}

function load() {
    let d = localStorage.getItem("split_tx");
    if (!d) return;
    JSON.parse(d).forEach(r => {
        let e = document.getElementById(r[0]);
        if (e && r[1] !== "") { 
            if (e.type === "radio") {
                e.checked = (r[1] === "true");
            } else {
                e.value = r[1]; 
            }
            if (r[2]) e.dataset.edited = r[2];
        }
    });
    let savedSource = localStorage.getItem("split_tx_cap_source");
    if (savedSource === "iSec" || savedSource === "kva") {
        lastCapacitySource = savedSource;
    } else {
        let kvaEl = document.getElementById("kvaOutput");
        let kvaInEl = document.getElementById("kvaInput");
        let iSecEl = document.getElementById("iSecInput");
        if (((kvaEl && kvaEl.dataset.edited) || (kvaInEl && kvaInEl.dataset.edited)) && (!iSecEl || !iSecEl.dataset.edited)) {
            lastCapacitySource = "kva";
        } else {
            lastCapacitySource = "iSec";
        }
    }
}

function clearAll() {
    localStorage.clear();
    lastCapacitySource = "iSec";
    document.querySelectorAll("input, select").forEach(input => {
        if (baseConstants.includes(input.id)) {
            const defaults = {
                "k": "0.8", "fluxDensity": "1", "frequency": "50", "stackingFactor": "0.9",
                "delta": "2.5", "limbsCount": "2", "bobbinFlange": "7", "priInsAddition": "0.1", 
                "secInsAddition": "0.01", "paperThickness": "0.127", "coilClearance": "3.5",
                "rhoCu": "8.89", "rhoSteel": "7.65", "priSafetyMargin": "1", "secSafetyMargin": "1",
                "priPaperLayers": "4", "secPaperLayers": "4", "finalCoreSf": "0.98",
                "tbobbinClamp": "3.5", "extraSpaceClamp": "9", "centerGapClamp": "10",
                "bendingDeduction": "10", "msThickness": "3", "rhoMS": "7.85", "clampQty": "4",
                "coreGapBobbin": "2", "tapeBufferBobbin": "10", "tbobbinMat": "3", "rhoBobbin": "2.20",
                "conductorMaterial": "Copper",
                "priSecGap": "0", "priSecGap_step16": "0", "coreToPriGap": "1", "bobbinGap": "3.5", "priPriGap": "0",
                "kvaOutput": "", "kvaInput": "", "iSecInput": "", "vSecInput": ""
            };
            input.value = defaults[input.id] || "";
        } else {
            if (input.type === "radio") {
                if (input.value === "round") input.checked = true;
                if (input.value === "flat") input.checked = false;
            } else {
                input.value = ""; 
            }
        }
        delete input.dataset.edited;
    });
    calculate();
}

load();
calculate();

// --- MODAL CONTROLS ---
function openSummary() {
    let modal = document.getElementById("summaryModal");
    if(modal) modal.style.display = "block";
}

function closeSummary() {
    let modal = document.getElementById("summaryModal");
    if(modal) modal.style.display = "none";
}

window.onclick = function(event) {
    let modal = document.getElementById("summaryModal");
    if (event.target === modal) {
        modal.style.display = "none";
    }
}

// 1. Populate Dropdowns on Page Load
function populateSwgDropdowns() {
    let selects = ["priSwgSelect", "secSwgSelect"]; 
    
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

// 2. Track Manual Overrides
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
                calculate(); // Trigger calculation when user manually overrides SWG
            });
        }
    });
}

// Ensure execution on load
document.addEventListener("DOMContentLoaded", () => {
    populateSwgDropdowns();
    attachOverrideListeners();
});