import { expect, test, type Page } from '@playwright/test';

/** Ganchos expostos pela RunScene quando a URL tem `?debug`. */
interface DebugHooks {
  setTroop(count: number, weaponLevel: number): void;
  endRun(): void;
}

/** Coleta erros de console e exceções não tratadas da página. */
function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}

async function startRun(page: Page, query: string): Promise<void> {
  await page.goto(`/${query}`);
  await expect(page.locator('body[data-scene="Start"]')).toBeAttached();
  await page.locator('canvas').click();
  await expect(page.locator('body[data-scene="Run"]')).toBeAttached();
}

async function callHook(page: Page, run: (hooks: DebugHooks) => void): Promise<void> {
  await page.evaluate((source) => {
    const hooks = (window as unknown as { __horde: DebugHooks }).__horde;
    new Function('hooks', `(${source})(hooks)`)(hooks);
  }, run.toString());
}

test('plays 10 seconds of a seeded run without errors', async ({ page }) => {
  const errors = collectErrors(page);

  await startRun(page, '?seed=1');
  await page.waitForTimeout(10_000);

  expect(errors).toEqual([]);
  await page.screenshot({ path: 'test-results/smoke.png' });
});

test('survives a giant troop that exhausts the projectile pool', async ({ page }) => {
  const errors = collectErrors(page);

  await startRun(page, '?seed=1&debug');
  // 99.999 heróis = 100 unidades desenhadas (o teto) × 2 tiros/s × ~4 s de voo ≈ 800 projéteis no ar.
  await callHook(page, (hooks) => hooks.setTroop(99_999, 6));
  await page.waitForTimeout(15_000);

  expect(errors).toEqual([]);
});

test('game over ignores taps for 500 ms, then starts at most one new run', async ({ page }) => {
  const errors = collectErrors(page);
  await startRun(page, '?seed=1&debug');
  await callHook(page, (hooks) => hooks.endRun());
  await expect(page.locator('body[data-scene="GameOver"]')).toBeAttached();
  await page.evaluate(() => {
    const seen: string[] = [];
    Object.assign(window, { __scenes: seen });
    new MutationObserver(() => seen.push(document.body.dataset['scene'] ?? '')).observe(
      document.body,
      { attributes: true, attributeFilter: ['data-scene'] },
    );
  });

  await page.locator('canvas').click();
  await page.waitForTimeout(100);
  await expect(page.locator('body[data-scene="GameOver"]')).toBeAttached();

  await page.waitForTimeout(500);
  for (let tap = 0; tap < 5; tap++) {
    await page.locator('canvas').click({ delay: 0 });
    await page.waitForTimeout(20);
  }
  await page.waitForTimeout(1000);

  const scenes = await page.evaluate(() => (window as unknown as { __scenes: string[] }).__scenes);
  expect(scenes.filter((scene) => scene === 'Start')).toHaveLength(1);
  expect(scenes.filter((scene) => scene === 'Run').length).toBeLessThanOrEqual(1);
  expect(errors).toEqual([]);
});
