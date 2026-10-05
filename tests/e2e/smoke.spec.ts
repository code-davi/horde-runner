import { expect, test, type Page } from '@playwright/test';
import { GAME_WIDTH } from '../../src/game/dimensions';

/** Centro do botão de pausa, em coordenadas lógicas (spec §3, item 4). */
const PAUSE_BUTTON = { x: GAME_WIDTH - 64, y: 130 };

/** Ganchos expostos pela RunScene quando a URL tem `?debug`. */
interface DebugHooks {
  setTroop(count: number, weaponLevel: number): void;
  endRun(): void;
  fillBeam(): void;
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

type TapInput = 'mouse' | 'touch';

/** Toca num ponto dado em coordenadas lógicas do jogo (720 × 1280), seja qual for a escala do canvas. */
async function tapGame(
  page: Page,
  point: { x: number; y: number },
  input: TapInput,
): Promise<void> {
  const box = await page.locator('canvas').boundingBox();
  if (!box) throw new Error('canvas sem tamanho');
  const scale = box.width / GAME_WIDTH;
  const [x, y] = [box.x + point.x * scale, box.y + point.y * scale];
  await (input === 'touch' ? page.touchscreen.tap(x, y) : page.mouse.click(x, y));
}

/** Pausa pelo botão ⏸ e retoma tocando no próprio botão, que não pode pausar de novo. */
async function pauseAndResumeWithButton(page: Page, input: TapInput): Promise<void> {
  await tapGame(page, PAUSE_BUTTON, input);
  await expect(page.locator('body[data-paused="true"]')).toBeAttached();
  await page.waitForTimeout(300);
  await tapGame(page, PAUSE_BUTTON, input);
  await expect(page.locator('body[data-paused="false"]')).toBeAttached();
  await page.waitForTimeout(500);
  await expect(page.locator('body[data-paused="false"]')).toBeAttached();
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

test('the pause button pauses the run and a tap resumes it', async ({ page }) => {
  const errors = collectErrors(page);
  await startRun(page, '?seed=1');

  await pauseAndResumeWithButton(page, 'mouse');

  expect(errors).toEqual([]);
});

test.describe('on a touch screen', () => {
  test.use({ hasTouch: true });

  test('the pause button also pauses and resumes with taps', async ({ page }) => {
    const errors = collectErrors(page);
    await startRun(page, '?seed=1');

    await pauseAndResumeWithButton(page, 'touch');

    expect(errors).toEqual([]);
  });
});

test('survives a giant troop that exhausts the projectile pool', async ({ page }) => {
  const errors = collectErrors(page);

  await startRun(page, '?seed=1&debug');
  // 99.999 heróis = 100 unidades desenhadas (o teto) × 2 tiros/s × ~4 s de voo ≈ 800 projéteis no ar.
  await callHook(page, (hooks) => hooks.setTroop(99_999, 6));
  await page.waitForTimeout(15_000);

  expect(errors).toEqual([]);
});

test('fires the beam without errors, even when the run ends mid-beam', async ({ page }) => {
  const errors = collectErrors(page);

  await startRun(page, '?seed=1&debug');
  await callHook(page, (hooks) => hooks.setTroop(30, 2));
  await page.waitForTimeout(4000);
  await callHook(page, (hooks) => hooks.fillBeam());
  await page.waitForTimeout(2000);
  await callHook(page, (hooks) => hooks.fillBeam());
  await callHook(page, (hooks) => hooks.endRun());

  await expect(page.locator('body[data-scene="GameOver"]')).toBeAttached();
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
