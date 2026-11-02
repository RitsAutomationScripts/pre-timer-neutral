# Scenario and inputs (as supplied)

Cedar is a fictional ecommerce store whose QA team manually checks promotional prices and mobile
purchase controls. Automate one of those checks. All data and builds are synthetic assessment material
dated 16 October 2026; no live site, account, address, payment or order is involved.

This release changes promotional calculations and the sticky Add to cart control. The previous two releases
included one escaped pricing issue and one short-screen obstruction. No comparative traffic or loss data is
supplied; justify your priority without inventing figures.

| Risk | Accepted behaviour |
|---|---|
| Promotion | Use one Queen or King Cedar mattress, AED 900 for either size. REST10 discounts the mattress by 10%; one pillow gift stays AED 0. Selected size, quantity and accepted cart total must persist into simulated checkout. No tax or shipping. |
| Mobile | At 402 x 600 and 440 x 600 CSS pixels, Add to cart must be fully inside the initial viewport, usable without scrolling and not cover the size selector or offer text. Use Chromium at default zoom; this is not real-device evidence. |

The supplied reference and release builds have the same interface. Reloading resets the cart. The reference is
the comparison baseline; the release is the proposed change.

Rules: test only your chosen risk. Do not modify builds or acceptance rules, force outcomes by build,
fabricate evidence or touch production. Explain any test/environment error honestly. Passing one check is
not full release assurance; the recommendation does not replace QA approval.

## Chosen risk: Mobile

Mapping of accepted behaviour to assertions in `submission/Artifact/check.cjs`:

| Accepted behaviour | Assertion |
|---|---|
| Fully inside the initial viewport (402x600, 440x600) | Add to cart bounding box within `[0,width] x [0,height]`; no horizontal overflow |
| Usable without scrolling | `scrollY === 0`, tap target >= 44px, centre of button is hit-testable, click succeeds and cart opens |
| Does not cover size selector or offer text | Button box does not intersect `#size` or `[data-testid=offer]` boxes |
| (supporting) purchase path works on mobile | King x2 -> cart item/quantity/gift/total -> checkout total unchanged |

Out of scope (not tested here): promotion maths (REST10), real devices, other zoom levels/browsers.

## Run

```bash
npm install && npx playwright install chromium && npm run preflight
npm start                      # terminal 1 (keep running)
npm run check -- mobile        # terminal 2
```
