import { defineConfig, devices } from '@playwright/test';

const PORT = 5173;

export default defineConfig({
  testDir: 'tests/e2e',
  use: { baseURL: `http://localhost:${PORT}` },
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env['CI'],
  },
  projects: [
    {
      name: 'chromium-mobile',
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } },
    },
  ],
});
