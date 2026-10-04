import { expect, test, type Page } from '@playwright/test';

/** Coleta erros de console e exceções não tratadas da página. */
function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}

test('starts a run from the menu without errors', async ({ page }) => {
  const errors = collectErrors(page);

  await page.goto('/?seed=1');
  await expect(page.locator('body[data-scene="Start"]')).toBeAttached();
  await page.locator('canvas').click();
  await expect(page.locator('body[data-scene="Run"]')).toBeAttached();
  await page.waitForTimeout(5000);

  expect(errors).toEqual([]);
  await page.screenshot({ path: 'test-results/smoke.png' });
});
