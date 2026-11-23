# Phase 03 — Primary Winding Design
## File: 06-svg.md

> **Scope:** SVG diagrams, graphical calculations, or engineering drawings
> belonging to Phase 3.

---

## Result

**Phase 3 contains NO SVG generation, graphical calculations, or engineering diagrams.**

All four calculation steps in Phase 3 (Steps 7–10) are arithmetic. No SVG elements
are created or modified by this phase.

---

## Note on SVG in This Project

The project contains two SVG diagrams — both are populated by Phase 4 (Step 13):

| SVG Location                                       | Phase    | Purpose                         |
|----------------------------------------------------|----------|---------------------------------|
| Inline SVG in Step 13 card (`#svg_a/b/c/d/h`)     | Phase 4  | Live Bobbin Dimension Blueprint |
| Inline SVG in Summary Modal (`#modal_svg_a/b/c/d/h`)| Phase 4 | Summary Modal Blueprint copy    |

Phase 3 computes `priRadUsed` (Step 9), which is later used by Phase 4 Step 13 to
derive bobbin outer clearance — which then feeds the SVG label values. This is a
downstream data dependency, not a Phase 3 SVG action.

Full SVG documentation is in:
`Phase-04-Mechanical-Hardware-Clamps-and-Bobbins/06-svg.md`
