# Phase 04 — Mechanical Hardware (Clamps & Bobbins)
## File: 05-rounding.md

> **Scope:** Every rounding rule applied to Phase 4 variables.
> Rules documented in execution order. No inferred reasons included.

---

## Rounding Rules

### Rule 1 — Clamp Span (NO ROUNDING)

| Property             | Value                                              |
|----------------------|----------------------------------------------------|
| Variable             | `aClamp` (written to `#aClampOutput`)              |
| Step                 | Step 11A                                           |
| Rounding Method      | NONE                                               |
| Exact Implementation | `auto("aClampOutput", aClamp)` — raw float value   |
| Decimal Places       | As produced by JS float arithmetic                 |
| Applied To           | Clamp internal span width                          |

---

### Rule 2 — Clamp Plate Length (NO ROUNDING)

| Property             | Value                                              |
|----------------------|----------------------------------------------------|
| Variable             | `clampLen` (written to `#clampLenOutput`)          |
| Step                 | Step 11B                                           |
| Rounding Method      | NONE                                               |
| Exact Implementation | `auto("clampLenOutput", clampLen)` — raw value     |
| Decimal Places       | As produced by JS float arithmetic                 |
| Applied To           | Total clamp plate length                           |

---

### Rule 3 — Clamp Plate Width (NO ROUNDING)

| Property             | Value                                               |
|----------------------|-----------------------------------------------------|
| Variable             | `clampWidth` (written to `#clampWidthOutput`)       |
| Step                 | Step 12A                                            |
| Rounding Method      | NONE                                                |
| Exact Implementation | `auto("clampWidthOutput", clampWidth)` — raw value  |
| Decimal Places       | As produced by JS float arithmetic                  |
| Applied To           | L-clamp plate width before bending                  |

---

### Rule 4 — Total Clamp Weight

| Property             | Value                                                             |
|----------------------|-------------------------------------------------------------------|
| Variable             | `totalClampWt` (written to `#totalClampWtOutput`)                 |
| Step                 | Step 12C                                                          |
| Rounding Method      | Fixed decimal places                                              |
| Exact Implementation | `parseFloat(totalClampWt.toFixed(2))`                            |
| Decimal Places       | 2                                                                 |
| Direction            | Standard JS toFixed (half-up)                                     |
| Applied To           | Final total clamp plate weight in kg                              |

---

### Rule 5 — Bobbin Outer Clearance (NO ROUNDING)

| Property             | Value                                                      |
|----------------------|------------------------------------------------------------|
| Variable             | `bobbinOuterClear` (written to `#bobbinOuterClearOutput`)  |
| Step                 | Step 13C                                                   |
| Rounding Method      | NONE                                                       |
| Exact Implementation | `auto("bobbinOuterClearOutput", bobbinOuterClear)` — raw   |
| Decimal Places       | As produced by JS float arithmetic                         |
| Applied To           | Outer clearance from winding edge to bobbin wall           |

**Note:** `bobbinInnerW`, `bobbinInnerL`, `bobbinOuterW`, `bobbinOuterL` are also
computed with NO rounding. They are never written to editable DOM fields.

---

### Rule 6 — Bobbin Flange Weight (Display, Readonly)

| Property             | Value                                                     |
|----------------------|-----------------------------------------------------------|
| Variable             | `wFlange` (written to `#flangeWtOutput`)                  |
| Step                 | Step 14B                                                  |
| Rounding Method      | Fixed decimal places                                      |
| Exact Implementation | `parseFloat(wFlange.toFixed(3))`                         |
| Decimal Places       | 3                                                         |
| Direction            | Standard JS toFixed                                       |
| Applied To           | Readonly display field only — not used in further calcs   |

---

### Rule 7 — Bobbin Wall Weights (Display String, Readonly)

| Property             | Value                                                                |
|----------------------|----------------------------------------------------------------------|
| Variables            | `wWallLong` and `wWallShort` (written together to `#wallWtOutput`)   |
| Step                 | Step 14C / 14D                                                       |
| Rounding Method      | Fixed decimal places (within string template)                        |
| Exact Implementation | `` `${wWallLong.toFixed(3)} / ${wWallShort.toFixed(3)}` ``          |
| Decimal Places       | 3 for each value                                                     |
| Direction            | Standard JS toFixed                                                  |
| Applied To           | Readonly combined display field only — not used in further calcs     |

**Note:** The raw `wWallLong` and `wWallShort` float values (without `.toFixed`) are
used to compute `wSingleBobbin` in Step 14E, NOT the rounded display strings.

---

### Rule 8 — Total Bobbin Weight

| Property             | Value                                                             |
|----------------------|-------------------------------------------------------------------|
| Variable             | `totalBobbinWt` (written to `#totalBobbinWtOutput`)               |
| Step                 | Step 14F                                                          |
| Rounding Method      | Fixed decimal places                                              |
| Exact Implementation | `parseFloat(totalBobbinWt.toFixed(2))`                           |
| Decimal Places       | 2                                                                 |
| Direction            | Standard JS toFixed (half-up)                                     |
| Applied To           | Final total bobbin weight in kg (also read by Phase 7 cost module)|

---

## Summary Table

| Rule | Variable / Field             | Step    | Method       | Implementation                                    |
|------|------------------------------|---------|--------------|---------------------------------------------------|
| 1    | `#aClampOutput`              | 11A     | NONE         | raw float                                         |
| 2    | `#clampLenOutput`            | 11B     | NONE         | raw float                                         |
| 3    | `#clampWidthOutput`          | 12A     | NONE         | raw float                                         |
| 4    | `#totalClampWtOutput`        | 12C     | toFixed(2)   | `parseFloat(totalClampWt.toFixed(2))`            |
| 5    | `#bobbinOuterClearOutput`    | 13C     | NONE         | raw float                                         |
| 6    | `#flangeWtOutput` (readonly) | 14B     | toFixed(3)   | `parseFloat(wFlange.toFixed(3))`                 |
| 7    | `#wallWtOutput` (readonly)   | 14C/14D | toFixed(3) x2| `` `${wWallLong.toFixed(3)} / ${wWallShort.toFixed(3)}` `` |
| 8    | `#totalBobbinWtOutput`       | 14F     | toFixed(2)   | `parseFloat(totalBobbinWt.toFixed(2))`           |

---

## Note on SVG Label Values
The SVG `textContent` strings for `a`, `b`, `c`, `d`, `h` use raw JS variable values
with no rounding applied. They show whatever float values `bobbinInnerW`, `bobbinOuterW`,
etc. produce.
