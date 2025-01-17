import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests', // Update the path to the correct test folder inside src
  timeout: 30000, // 30 seconds timeout per test
  expect: {
    timeout: 5000, // Timeout for assertions
  },
  reporter: 'html', // Generates a nice HTML report
  use: {
    baseURL: 'http://localhost:3000', // Default base URL for your app
    headless: true, // Run tests in headless mode
    screenshot: 'only-on-failure', // Take screenshots on failure
    video: 'retain-on-failure', // Record video on failure
  },
});
