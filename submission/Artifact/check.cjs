const assert = require('node:assert/strict');

// Risk chosen: MOBILE. A shopper on a small screen must be able to see and tap
// the primary "Add to cart" button, then reach the cart with the right content.
// Same assertions run against every build and viewport; no build-specific branches.
module.exports = async function check(page, baseURL, viewport) {
  const { width, height } = viewport;
  const purchase = page.getByTestId('purchase');

  // 1. Product page loaded with the expected offer.
  await purchase.waitFor({ state: 'visible' });
  assert.equal(await page.getByRole('heading', { level: 1 }).textContent(), 'Cedar mattress');
  assert.match(await page.getByTestId('offer').textContent(), /AED 900\.00/);

  // 2. No horizontal overflow at this width.
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert.ok(overflow <= 0, `${width}x${height}: page overflows horizontally by ${overflow}px`);

  // 3. Add-to-cart button must sit fully inside the visible viewport.
  const box = await purchase.boundingBox();
  assert.ok(box, 'Add to cart has no bounding box');
  assert.ok(box.x >= 0 && box.x + box.width <= width,
    `${width}x${height}: Add to cart horizontally outside viewport (x=${box.x}, w=${box.width})`);
  assert.ok(box.y >= 0 && box.y + box.height <= height,
    `${width}x${height}: Add to cart clipped by viewport (top=${box.y}, bottom=${box.y + box.height}, viewport height=${height})`);

  // 4. Tap target is usable: at least 44px tall and the button itself is hit at its centre.
  assert.ok(box.height >= 44, `Add to cart tap target too small: ${box.height}px`);
  const hitsButton = await page.evaluate(({ x, y }) => {
    const el = document.elementFromPoint(x, y);
    return !!el && el.id === 'add';
  }, { x: box.x + box.width / 2, y: box.y + box.height / 2 });
  assert.ok(hitsButton, 'Centre of Add to cart is not hittable (covered or off-screen)');

  // 4b. Usable without scrolling, and does not cover the size selector or offer text.
  assert.equal(await page.evaluate(() => window.scrollY), 0, 'Page was scrolled before tapping Add to cart');
  const overlaps = (a, b) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
  for (const [name, locator] of [['size selector', page.locator('#size')], ['offer text', page.getByTestId('offer')]]) {
    const other = await locator.boundingBox();
    assert.ok(other, `${name} has no bounding box`);
    assert.ok(!overlaps(box, other),
      `${width}x${height}: Add to cart covers the ${name} (button y=${box.y}-${box.y + box.height}, ${name} y=${other.y}-${other.y + other.height})`);
  }

  // 5. Real purchase path on mobile: choose King x2, add to cart, verify cart content.
  await page.getByLabel('Size').selectOption('King');
  await page.getByLabel('Quantity').fill('2');
  await purchase.click();
  await page.getByRole('heading', { name: 'Your cart' }).waitFor();
  const cart = page.locator('#cart-lines');
  assert.equal(await cart.getByTestId('item').textContent(), 'Cedar mattress - King');
  assert.equal(await cart.getByTestId('quantity').textContent(), '2');
  assert.equal(await cart.getByTestId('gift').textContent(), 'AED 0.00');
  assert.equal(await cart.getByTestId('total').textContent(), 'AED 1800.00');

  // 6. Cart controls reachable on mobile and checkout reached with matching total.
  await page.getByRole('button', { name: 'Continue to checkout' }).click();
  await page.getByRole('heading', { name: 'Simulated checkout' }).waitFor();
  assert.equal(await page.locator('#checkout-lines').getByTestId('total').textContent(), 'AED 1800.00');
};
