import { defineConfig, devices } from '@playwright/test';

const API_PORT = 8000;
const UI_PORT = 3000;

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  workers: 1,
  retries: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${UI_PORT}`,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'cd .. && FLASK_APP=backend.app flask run --port 8000',
      port: API_PORT,
      reuseExistingServer: true,
      timeout: 15_000,
    },
    {
      command: 'npm run dev',
      port: UI_PORT,
      reuseExistingServer: true,
      timeout: 15_000,
    },
  ],
});
