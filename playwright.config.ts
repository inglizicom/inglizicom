import { defineConfig, devices } from '@playwright/test'

/**
 * End-to-end smoke tests — `npm run test:e2e`.
 *
 * The app runs against a Supabase that does not exist (e2e-fake.supabase.co);
 * every request the browser makes to it is answered by e2e/mock.ts. So the
 * suite never reads or writes real data, needs no secrets, and is the same on
 * every machine. It uses the Chrome already installed (channel: 'chrome') —
 * no browser download.
 *
 * Its own port and build folder (.next-e2e) mean it can run while
 * `npm run dev` is up. First run compiles each page once; expect a few minutes.
 */
const PORT = 3123

export default defineConfig({
  testDir: './e2e',
  timeout: 120_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel: 'chrome',
    locale: 'ar-MA',
    timezoneId: 'Africa/Casablanca',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'phone', use: { ...devices['Pixel 7'], channel: 'chrome' } },
  ],
  webServer: {
    command: `npx next dev -p ${PORT}`,
    url: `http://localhost:${PORT}/offline`,
    timeout: 240_000,
    reuseExistingServer: !process.env.CI,
    env: {
      NEXT_DIST_DIR: '.next-e2e',
      // Process env wins over .env.local in Next, so the real project is never reached.
      NEXT_PUBLIC_SUPABASE_URL: 'https://e2e-fake.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'e2e-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'e2e-service-key',
      NEXT_TELEMETRY_DISABLED: '1',
    },
  },
})
