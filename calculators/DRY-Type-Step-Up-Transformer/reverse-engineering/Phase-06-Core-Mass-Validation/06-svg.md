# Phase 06 — Core Mass Validation
## File: 06-svg.md

> **Scope:** SVG diagrams, graphical calculations, or engineering drawings
> belonging to Phase 6.

---

## Result

**Phase 6 contains NO SVG generation, graphical calculations, or engineering diagrams.**

Step 18 consists entirely of arithmetic calculations (actual net area, frame perimeter,
core mass). No SVG elements are created or modified by this phase.

---

## Note on SVG in This Project

The project contains two SVG bobbin blueprint instances — both are populated by Phase 4 (Step 13)
and updated (modal copy) at the end of `calculate()`.

| SVG Location                                         | Phase    | Purpose                          |
|------------------------------------------------------|----------|----------------------------------|
| Inline SVG in Step 13 card (`#svg_a/b/c/d/h`)       | Phase 4  | Live Bobbin Dimension Blueprint  |
| Inline SVG in Summary Modal (`#modal_svg_a/b/c/d/h`) | Phase 4  | Summary Modal Blueprint copy     |

The modal SVG label updates that appear at lines 632–637 of `app.js` (end of `calculate()`)
are executed after Phase 6. These are display-layer operations, not Phase 6 engineering
calculations. Full SVG documentation is in:
`Phase-04-Mechanical-Hardware-Clamps-and-Bobbins/06-svg.md`
