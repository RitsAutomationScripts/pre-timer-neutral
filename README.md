<<<<<<< HEAD
# pre-timer-neutral1

=======
# pre-timer-neutral

Playwright (Chromium) setup :automate one pre-release check for the fictional Cedar ecommerce store. The chosen risk is **Mobile** (sticky Add to cart control). All builds and data are synthetic; no live site, account or order is involved.

See [SCENARIO.md](SCENARIO.md) for the scenario, accepted behaviour, rules, and assertion mapping.

## Layout

| Path | Purpose |
|---|---|
| `builds/reference.html` | Baseline build |
| `builds/release.html` | Proposed change under test |
| `server.cjs` | Static server: `/reference/` and `/release/` on `127.0.0.1:${PORT:-4173}` |
| `runner.cjs` | Runs `submission/Artifact/check.cjs` against both builds; writes logs, traces and failure screenshots |
| `preflight.cjs` | Neutral browser sanity check (no Cedar build involved) |
| `SHA256SUMS` | Checksums of builds, runner, server, check and decision document |
| `submission/Artifact/` | `check.cjs` - the automated check |
| `submission/Execution/<run-id>/` | Evidence per run: `*.log`, `*-trace.zip`, `*-failure.png`, `summary.log` |
| `submission/AI evidence/` | AI usage evidence |
| `submission/Decision/` | Release recommendation (`Response.docx`) |

## Prerequisites

- Node.js
- Playwright `1.62.1` (pinned in `package.json`)

## Run

```bash
npm install
npx playwright install chromium
npm run preflight                # verify browser setup

npm start                        # terminal 1 - keep running
npm run check -- mobile          # terminal 2
```

Set `PORT` for both `npm start` and `npm run check` to use a port other than `4173`.

`npm run check` takes exactly one argument, `mobile` or `promotion`. The submitted check covers `mobile`.

## What the check does

Runs the same assertions on `reference` and `release` at 402x600 and 440x600 (Chromium, default zoom):

- Add to cart is fully inside the initial viewport, with no horizontal overflow
- Tap target is at least 44px tall, hit-testable at its centre, and no scroll is needed
- Button does not overlap the size selector (`#size`) or offer text (`[data-testid=offer]`)
- Purchase path: King x2 -> cart item/quantity/gift/total -> checkout total `AED 1800.00`

Exit code is `1` if any build/viewport fails. Each run writes to a new timestamped folder under `submission/Execution/`.

## Verify integrity

```bash
shasum -a 256 -c SHA256SUMS
```

## Limitations

- Passing one check is not full release assurance; the recommendation does not replace QA approval.
- Chromium emulation only; not real-device evidence.
- Promotion maths (REST10) is out of scope.
- Reloading a page resets the cart.
- Do not modify `builds/` or the accepted behaviour rules.
>>>>>>> 3ecc588 (code added)
