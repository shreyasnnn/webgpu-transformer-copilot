# Phase 03 — Primary Winding Design
## File: 04-lookups.md

> **Scope:** Lookup tables and helper data functions first introduced and used in Phase 3.
> The SWG table is documented in full here as its first phase of use.
> Phase 5 also uses these same tables — Phase 5 documentation references this file.

---

## Lookup Table 1 — swgTable (SWG Current Rating Table)

### Table Name
`swgTable`

### Source File
`js/swgData.js` — loaded before `js/app.js` via script tag order in `index.html`

### Purpose
Maps each Standard Wire Gauge (SWG) number to its maximum current capacity in
Amperes at 2.5 A/mm² current density. Used to automatically suggest the most
appropriate wire gauge for a given computed current.

### Lookup Key
`targetCurrent` — the computed current in Amperes (iPri for Phase 3, iSec for Phase 5)

### Table Data (Complete)

| SWG | Current Capacity (A) |
|-----|----------------------|
|  8  | 32.425               |
|  9  | 26.275               |
| 10  | 20.755               |
| 11  | 17.045               |
| 12  | 13.7                 |
| 13  | 10.722               |
| 14  | 8.1075               |
| 15  | 6.5675               |
| 16  | 5.19                 |
| 17  | 3.9725               |
| 18  | 2.92                 |
| 19  | 2.0267               |
| 20  | 1.6417               |
| 21  | 1.2972               |
| 22  | 0.9932               |
| 23  | 0.7297               |
| 24  | 0.613                |
| 25  | 0.50625              |
| 26  | 0.410425             |
| 27  | 0.3407               |
| 28  | 0.2771               |
| 29  | 0.2343               |
| 30  | 0.22033              |
| 31  | 0.17045              |
| 32  | 0.14775              |
| 33  | 0.126675             |
| 34  | 0.107225             |
| 35  | 0.089375             |
| 36  | 0.073195             |
| 37  | 0.06897              |
| 38  | 0.0456               |
| 39  | 0.03425              |
| 40  | 0.0292               |
| 41  | 0.02452              |
| 42  | 0.02020              |
| 43  | 0.01641              |
| 44  | 0.01255              |
| 45  | 0.00993              |
| 46  | 0.007297             |
| 47  | 0.005067             |
| 48  | 0.0032425            |
| 49  | 0.0018240            |
| 50  | 0.0012662            |

*Source comment in swgData.js: "Data extracted from SHREE ELECTRICALS CURRENT RATING Table"*

### Returned Values
- The SWG number (integer) of the best-matching wire gauge

### Steps Where Used
- **Phase 3 Step 7:** `getSWGForCurrent(iPri)` — for primary conductor SWG suggestion
- **Phase 5 Step 15:** `getSWGForCurrent(iSecInputCalc)` — for secondary conductor SWG suggestion

---

## Lookup Function 1 — getSWGForCurrent(targetCurrent)

### Source File
`js/swgData.js`

### Purpose
Finds the SWG entry in `swgTable` whose current rating is closest to the target current.

### Complete Implementation
```javascript
function getSWGForCurrent(targetCurrent) {
    if (!targetCurrent || targetCurrent <= 0) return null;

    // If the current exceeds the largest wire in the table, return the max available (8 SWG)
    if (targetCurrent >= swgTable[0].current) return swgTable[0].swg;

    let bestMatch = swgTable[0];
    let minDiff = Math.abs(targetCurrent - bestMatch.current);

    for (let i = 1; i < swgTable.length; i++) {
        let diff = Math.abs(targetCurrent - swgTable[i].current);

        if (diff < minDiff) {
            minDiff = diff;
            bestMatch = swgTable[i];
        } else if (diff === minDiff) {
            // If equidistant to two wires, pick the one with greater current capacity
            if (swgTable[i].current > bestMatch.current) {
                bestMatch = swgTable[i];
            }
        }
    }
    return bestMatch.swg;
}
```

### Lookup Logic
1. Guard: if `targetCurrent` is falsy or <= 0, return `null`.
2. Ceiling clamp: if `targetCurrent` >= 32.425 (SWG 8 capacity), return `8` immediately.
3. Linear search: iterate all entries, tracking the entry with the minimum absolute
   difference between `targetCurrent` and `entry.current`.
4. Tie-breaking: if two entries have equal absolute difference, prefer the one with
   the **higher** current capacity (i.e., the lower SWG number / thicker wire).
5. Return the `swg` property of the best-match entry.

### Fallback Behavior
- If `targetCurrent <= 0` or null: returns `null`. The calling code in `app.js` then
  writes empty string to the SWG field and hides the flat wire section.
- If `targetCurrent` exceeds maximum table entry (SWG 8 = 32.425 A): returns `8`
  (the heaviest wire in the table). No error is thrown.

---

## Helper Function 2 — generateStripSuggestions(requiredArea)

### Source File
`js/app.js` (defined at the top of the file, before `calculate()`)

### Purpose
Given a required cross-sectional area, generates factor-pair strings showing possible
rectangular flat strip dimensions (breadth x height) whose product equals the rounded
area. Used to guide the user in selecting flat wire dimensions.

### Complete Implementation
```javascript
function generateStripSuggestions(requiredArea) {
    if (!requiredArea || requiredArea <= 0) return "--";
    let target = Math.round(requiredArea);
    if (target === 0) target = 1;
    let suggestions = [];
    for (let h = 1; h <= Math.sqrt(target); h++) {
        if (target % h === 0) {
            let b = target / h;
            suggestions.push(`${b} x ${h} mm`);
        }
    }
    return suggestions.length > 0 ? suggestions.join(" | ") : "--";
}
```

### Logic
1. Guard: returns "--" if `requiredArea` is falsy or <= 0.
2. Rounds `requiredArea` to nearest integer (`Math.round`).
3. Clamps to minimum of 1 if round produces 0.
4. Iterates `h` from 1 to `SQRT(target)` (integer factor limit).
5. For each `h` that exactly divides `target`: records the pair `(target/h) x h mm`.
6. Returns all factor pairs joined by " | ", or "--" if none found.

### Returned Values
- A string of factor-pair suggestions, e.g. `"24 x 1 mm | 12 x 2 mm | 8 x 3 mm | 6 x 4 mm"`
- OR `"--"` if no valid area provided or no integer factors found.

### Steps Where Used
- **Phase 3 Step 7:** Written to `#priStripSuggestions` (display only, when SWG <= 13)
- **Phase 5 Step 15:** Written to `#secStripSuggestions` (display only, when SWG <= 13)

### Important
- The output of `generateStripSuggestions` is DISPLAY ONLY.
- It does NOT participate in any downstream calculation.
- It is purely an informational guide for the user.

---

## Flat Wire Section Visibility Rule (Not a Lookup — Documented Here for Completeness)

The SWG result controls whether the flat wire UI section is visible:

```
IF getSWGForCurrent(current) <= 13:
    SHOW flat wire section (#priFlatWireSection or #secFlatWireSection)
    Generate strip suggestions
ELSE:
    HIDE flat wire section
    Force round wire radio button = checked
```

This rule is applied identically for both Phase 3 (primary) and Phase 5 (secondary).
