import { defineConfig, devices } from '@playwright/test'
import { existsSync } from 'node:fs'

// Use a preinstalled Chromium when one is present (e.g. in CI images).
const preinstalled = '/opt/pw-browsers/chromium'
const launchOptions = existsSync(preinstalled) ? { executablePath: preinstalled } : {}

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  use: { baseURL: 'http://localhost:4173', launchOptions },
  projects: [
    { name: 'mobile', use: { ...devices['Pixel 7'], browserName: 'chromium', launchOptions } },
    { name: 'desktop', use: { viewport: { width: 1280, height: 900 }, launchOptions } },
  ],
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
