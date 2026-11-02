# AI evidence

Tool: Claude-based Wibey coding assistant (JetBrains), plus its advisor/reviewer model.

## Excerpt 1 - prompt (user, verbatim)
"Run npm start, then open http://127.0.0.1:4173/reference/ or http://127.0.0.1:4173/release/.
Write your check in submission/Artifact/check.cjs. Choose one command in a second terminal:
Promotion `npm run check -- promotion` / Mobile `npm run check -- mobile` ...
You supply the actions and meaningful assertions; the starter contains no completed check."

## Excerpt 2 - advisor output that shaped the choice (verbatim)
"Promotion blocker: 402x600 also triggers release's `bottom:-22px`. Confirm release fails on the
checkout total, not the Add-to-cart click."
"Mobile option: assert the button sits fully inside `viewport.height`, then click it and confirm
the cart shows."
-> Decision: mobile. A promotion check at 402x600 would hit the clipped button first and not
   cleanly isolate the checkout-total defect.

## Excerpt 3 - correction after first run (error text, verbatim)
"locator.textContent: Error: strict mode violation: getByTestId('total') resolved to 2 elements:
 1) #cart-lines  2) #checkout-lines"
-> Fix: scoped locators to `#cart-lines` / `#checkout-lines`. Re-run: reference PASS (402x600,
   440x600), release FAIL (402x600, 440x600) with
   "Add to cart clipped by viewport (top=578, bottom=622, viewport height=600)".

## Independent verification
- Supplied files verified with `shasum -a 256 -c SHA256SUMS` (all OK) before use.
- Failure screenshot inspected manually: Add to cart is visibly cut off at the bottom edge.
- Root cause found by reading both build files side by side (no build was modified): release adds
  `@media (max-width: 600px) { .purchase { bottom: -22px; } }`.

## Test/environment errors (honest note)
- First `npm run check -- mobile` run: reference failed because of a bug in my own check (the strict-mode
  locator error above), not a product defect. I fixed check.cjs and removed that run folder.
- Two further runs were `ERR_CONNECTION_REFUSED` (server not started): environment errors, not product
  results. Those folders, and earlier valid runs of the previous check version, were removed so Execution
  holds only the final run cited in Response.docx: 2026-10-28T05-55-57-815Z-26681 (check includes the
  selector/offer-text overlap assertions).
- The check contains no build-specific branches; builds, runner, server and acceptance rules are unmodified
  (SHA256SUMS verified).
- Only the local server on 127.0.0.1:4173 was used; nothing touched production.
