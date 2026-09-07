import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
  globalTeardown: './tests/global-teardown.ts',
  webServer: [
    {
      command: 'cd .. && FLASK_APP=backend.app:create_app uv run flask run --port 8000',
      port: API_PORT,
      reuseExistingServer: true,
      timeout: 15_000,
      env: {
        DATABASE_URL: path.resolve(__dirname, '..', 'data', 'test-calendar.db'),
      },
    },
    {
      command: 'npm run dev',
      port: UI_PORT,
      reuseExistingServer: true,
      timeout: 15_000,
    },
  ],
});
