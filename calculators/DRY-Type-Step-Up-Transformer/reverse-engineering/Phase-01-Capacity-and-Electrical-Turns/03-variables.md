# Phase 01 — Capacity & Electrical Turns
## File: 03-variables.md

> **Scope:** Every engineering variable involved in Phase 1 calculations.
> Variables are listed in order of first introduction in the execution flow.
> For exact formulas, see `01-formulas.md`. For rounding rules, see `05-rounding.md`.

---

## Variable Reference Table

| # | Variable Name     | Purpose                                           | Type     | Unit | Default | User Editable |
|---|-------------------|---------------------------------------------------|----------|------|---------|---------------|
| 1 | `vSecInput`       | Secondary winding voltage                         | Input    | V    | None    | Yes           |
| 2 | `iSecInput`       | Secondary winding current                         | Input    | A    | None    | Yes           |
| 3 | `va`              | Total apparent power                              | Derived  | VA   | —       | Yes (override)|
| 4 | `kva`             | Total apparent power in kilovolt-amperes          | Derived  | kVA  | —       | Yes (override)|
| 5 | `kvaInput`        | kVA value fed into the V/T calculation            | Derived  | kVA  | —       | Yes (override)|
| 6 | `k`               | K Factor — empirical design constant              | Input    | —    | 0.8     | Yes           |
| 7 | `rawVt`           | Untruncated Volts Per Turn                        | Derived  | V/T  | —       | No            |
| 8 | `vt`              | Baseline Volts Per Turn (truncated)               | Derived  | V/T  | —       | Yes (override)|
| 9 | `vtUsed`          | V/T value actually used in Step 3 calculation     | Derived  | V/T  | —       | Yes (override)|
|10 | `primaryVoltage`  | Primary (input) side nominal voltage              | Input    | V    | None    | Yes           |
|11 | `primaryTurns`    | Number of primary winding turns (ceiled integer)  | Derived  | turns| —       | Yes (override)|
|12 | `rawActualVT`     | Untruncated actual V/T from ceiled turns          | Derived  | V/T  | —       | No            |
|13 | `actualVT`        | Actual V/T after truncation (from ceiled turns)   | Derived  | V/T  | —       | Yes (override)|
|14 | `actVTUsed`       | actualVT read back from the field for forwarding  | Derived  | V/T  | —       | No (internal) |
|15 | `secVoltsUsed`    | Secondary voltage read into Step 4                | Derived  | V    | —       | Yes (override)|
|16 | `secActVTUsed`    | Actual V/T read into Step 4                       | Derived  | V/T  | —       | Yes (override)|
|17 | `secondaryTurns`  | Number of secondary winding turns (ceiled integer)| Derived  | turns| —       | Yes (override)|

---

## Detailed Variable Descriptions

### 1. `vSecInput`
- **UI Label:** Secondary Voltage (V)
- **Field ID:** `#vSecInput`
- **Type:** Input
- **Unit:** Volts (V)
- **Default:** None — required user entry
- **User Editable:** Yes
- **First Introduced:** Step 1
- **Used In:** Step 1 (VA calculation), Step 3 (forwarded to `#secondaryVoltage`)
- **Produced By:** User
- **Part of baseConstants:** YES — never cleared by cascade reset

---

### 2. `iSecInput`
- **UI Label:** Secondary Current (A)
- **Field ID:** `#iSecInput`
- **Type:** Input
- **Unit:** Amperes (A)
- **Default:** None — required user entry
- **User Editable:** Yes
- **First Introduced:** Step 1
- **Used In:** Step 1 (VA calculation); also re-read in Phase 5 Step 15 for secondary conductor sizing
- **Produced By:** User
- **Part of baseConstants:** YES — never cleared by cascade reset
- **Cross-Phase Note:** `iSecInput` is read again directly from `#iSecInput` in Phase 5.
  Phase 1 does not process it beyond VA.

---

### 3. `va`
- **UI Label:** Calculated VA
- **Field ID:** `#vaOutput`
- **Type:** Derived
- **Unit:** VA
- **Default:** None
- **User Editable:** YES — editable override
- **First Introduced:** Step 1
- **Produced By:** Step 1 (`vSecInput x iSecInput`)
- **Used In:** Phase 3 Step 7 (primary conductor current calculation)
- **Precision Written:** `parseFloat(va.toFixed(2))`
- **Part of baseConstants:** NO — subject to cascade reset if upstream changes

---

### 4. `kva`
- **UI Label:** Calculated kVA
- **Field ID:** `#kvaOutput`
- **Type:** Derived
- **Unit:** kVA
- **Default:** None
- **User Editable:** YES — editable override
- **First Introduced:** Step 1
- **Produced By:** Step 1 (`va / 1000`)
- **Used In:** Display only within Phase 1. `#kvaOutput` is not read back in calculations.
- **Precision Written:** `parseFloat(kva.toFixed(3))`
- **Part of baseConstants:** NO

---

### 5. `kvaInput`
- **UI Label:** kVA value used
- **Field ID:** `#kvaInput`
- **Type:** Derived (auto-populated, user-overridable)
- **Unit:** kVA
- **Default:** None
- **User Editable:** YES — editable override
- **First Introduced:** Step 1 (auto-populated)
- **Produced By:** Step 1 (`parseFloat((va/1000).toFixed(3))`)
- **Used In:** Step 2 (as the kVA value entering the V/T formula)
- **Precision Written:** `parseFloat((va/1000).toFixed(3))`
- **Part of baseConstants:** NO
- **Note:** This is a separate field from `#kvaOutput`. It exists specifically to
  allow the user to override the kVA entering Step 2 independently of the display value.

---

### 6. `k`
- **UI Label:** K Factor constant
- **Field ID:** `#k`
- **Type:** Input (user-configurable design constant)
- **Unit:** Dimensionless
- **Default:** `0.8`
- **User Editable:** Yes
- **First Introduced:** Step 2
- **Used In:** Step 2 only
- **Produced By:** User (or default)
- **Part of baseConstants:** YES — never cleared by cascade reset

---

### 7. `rawVt`
- **UI Label:** (none — internal computation only)
- **Field ID:** Not written to any field
- **Type:** Derived (intermediate, ephemeral)
- **Unit:** V/T
- **Default:** None
- **User Editable:** No — never written to DOM
- **First Introduced:** Step 2
- **Produced By:** Step 2 (`k x SQRT(kvaInput)`)
- **Used In:** Step 2 (to compute `vt` by truncation); display trace only (`#calc2`)

---

### 8. `vt`
- **UI Label:** Volts / Turn
- **Field ID:** `#vt`
- **Type:** Derived
- **Unit:** V/T
- **Default:** None
- **User Editable:** YES — editable override
- **First Introduced:** Step 2
- **Produced By:** Step 2 (truncated from `rawVt`)
- **Used In:** Step 2 auto-populates `#vtInput` from this value
- **Part of baseConstants:** NO

---

### 9. `vtUsed`
- **UI Label:** V/T value used
- **Field ID:** `#vtInput`
- **Type:** Derived (auto-populated from `vt`, independently overridable)
- **Unit:** V/T
- **Default:** None
- **User Editable:** YES — editable override
- **First Introduced:** Step 2 (auto-populated) / Step 3 (read)
- **Produced By:** Auto-populated from `vt` by Step 2
- **Used In:** Step 3 (as the V/T divisor for primary turns); Phase 2 Step 5 receives
  `vtUsed` via `auto("netAreaVTInput", vtUsed)` — that forwarding is a Phase 2 responsibility.
- **Part of baseConstants:** NO

---

### 10. `primaryVoltage`
- **UI Label:** Primary Voltage (V)
- **Field ID:** `#primaryVoltage`
- **Type:** Input
- **Unit:** Volts (V)
- **Default:** None — required user entry
- **User Editable:** Yes
- **First Introduced:** Step 3
- **Used In:** Step 3 (primary turns numerator and actualVT numerator)
- **Produced By:** User
- **Part of baseConstants:** YES — never cleared by cascade reset

---

### 11. `primaryTurns`
- **UI Label:** Primary Turns
- **Field ID:** `#primaryTurns`
- **Type:** Derived
- **Unit:** turns (dimensionless integer)
- **Default:** None
- **User Editable:** YES — editable override
- **First Introduced:** Step 3
- **Produced By:** Step 3 (`Math.ceil(primaryVoltage / vtUsed)`)
- **Used In:** Step 3 (as denominator for `rawActualVT`); Phase 3 Step 8 (`priTurnsUsed`)
- **Part of baseConstants:** NO

---

### 12. `rawActualVT`
- **UI Label:** (none — internal computation only)
- **Field ID:** Not written to any field
- **Type:** Derived (intermediate, ephemeral)
- **Unit:** V/T
- **Default:** None
- **User Editable:** No
- **First Introduced:** Step 3
- **Produced By:** Step 3 (`primaryVoltage / primaryTurns`)
- **Used In:** Step 3 (to compute `actualVT` by truncation); display trace only (`#calc3`)

---

### 13. `actualVT`
- **UI Label:** Actual Volts / Turn
- **Field ID:** `#actualVT`
- **Type:** Derived
- **Unit:** V/T
- **Default:** None
- **User Editable:** YES — editable override
- **First Introduced:** Step 3
- **Produced By:** Step 3 (truncated from `rawActualVT`)
- **Used In:** Step 3 auto-populates `#actualVTInput` from this value
- **Part of baseConstants:** NO

---

### 14. `actVTUsed`
- **UI Label:** (internal read-back variable)
- **Field ID:** Read from `#actualVT`
- **Type:** Derived (internal)
- **Unit:** V/T
- **Default:** None
- **User Editable:** No (it is a read of `#actualVT` after the auto() call)
- **First Introduced:** Step 3 (read-back after writing `#actualVT`)
- **Produced By:** `g("actualVT")` read-back
- **Used In:** Auto-populates `#actualVTInput` (`auto("actualVTInput", actVTUsed)`)
- **Note:** This is an intermediate JS variable (`actVTUsed`) that bridges `#actualVT`
  to `#actualVTInput`. It is the value stored in `let actVTUsed = g("actualVT")`.

---

### 15. `secVoltsUsed`
- **UI Label:** Secondary Voltage used
- **Field ID:** `#secondaryVoltage`
- **Type:** Derived (auto-populated from `vSecInput`, user-overridable)
- **Unit:** Volts (V)
- **Default:** None
- **User Editable:** YES — editable override
- **First Introduced:** Step 3 (auto-populated) / Step 4 (read)
- **Produced By:** Step 3 forwards `vSecInput` via `auto("secondaryVoltage", vSecInput)`
- **Used In:** Step 4 (as numerator for secondary turns)
- **Part of baseConstants:** NO

---

### 16. `secActVTUsed`
- **UI Label:** Actual V/T used
- **Field ID:** `#actualVTInput`
- **Type:** Derived (auto-populated from `actualVT`, independently overridable)
- **Unit:** V/T
- **Default:** None
- **User Editable:** YES — editable override
- **First Introduced:** Step 3 (auto-populated) / Step 4 (read)
- **Produced By:** Step 3 forwards `actualVT` via `auto("actualVTInput", actVTUsed)`
- **Used In:** Step 4 (as divisor for secondary turns)
- **Part of baseConstants:** NO

---

### 17. `secondaryTurns`
- **UI Label:** Secondary Turns
- **Field ID:** `#secondaryTurns`
- **Type:** Derived
- **Unit:** turns (dimensionless integer)
- **Default:** None
- **User Editable:** YES — editable override
- **First Introduced:** Step 4
- **Produced By:** Step 4 (`Math.ceil(secVoltsUsed / secActVTUsed)`)
- **Used In:** Phase 5 Step 16 (`secTurnsUsed`)
- **Part of baseConstants:** NO

---

## baseConstants Membership (Phase 1 Fields)

Fields listed in `baseConstants` array in `app.js` are NEVER cleared by cascade reset.

| Field ID          | In baseConstants? |
|-------------------|-------------------|
| `vSecInput`       | YES               |
| `iSecInput`       | YES               |
| `k`               | YES               |
| `primaryVoltage`  | YES               |
| All others above  | NO                |
