# Hero reference QA

Source: supplied 13.845-second Arcade recording, 1756 × 1010; representative frame at 2 seconds.
Implementation: http://localhost:3002/; components/ReferenceHero.tsx and components/ReferenceHero.module.css.
Comparison: /tmp/devsync-reference/comparison.png (source left, implementation right).

## Verified
- Centered two-line heading, compact navigation, ivory/cyan/blue field, segmented category controls, and rounded primary action.
- Projects/Teams switching updates the destination correctly.
- Pause/resume control works. Reduced-motion preferences stop the flow. Rendering pauses offscreen and while the document is hidden.
- Mobile layout and navigation open/close checked at 390 CSS pixels; no clipped hero controls.
- No browser console errors observed. ESLint passes for the changed page and hero component; diff whitespace check passes.
- Repository TypeScript check still reports existing errors outside the changed files; no diagnostics for app/page.tsx or ReferenceHero.

## Remaining fidelity issue
P2: The procedural background recreates the supplied colors and direction of flow, but the wave contour, grain, and animation timing differ from the recording. The recording does not include the original animation source. The current live Arcade homepage has a different hero, so it did not provide the original asset. Exact frame-for-frame animation fidelity is not verified and requires the original background video/shader or further reconstruction.

The supplied brand and video-generation copy were deliberately adapted to DevSync and working project/team links. Remaining landing sections were preserved.

final result: blocked
Reason: exact animation fidelity requested by the user remains unmet; the functional recreation is available for review, not certified as an exact match.
