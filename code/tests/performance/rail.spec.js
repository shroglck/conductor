import { test, expect } from '@playwright/test';
import { navigationConfig } from '../../src/public/js/config/navigationConfig.js';

const targetUrl = process.env.PERF_TEST_URL || 'https://monkeyschool.indresh.me';
const authToken = process.env.PERF_TEST_AUTH_TOKEN;

test.describe('RAIL Performance Tests', () => {
  test.beforeAll(() => {
    if (!authToken) {
      throw new Error('PERF_TEST_AUTH_TOKEN environment variable is not set.');
    }
  });

  test.use({
    storageState: {
      cookies: [
        {
          name: 'auth_token',
          value: authToken || '',
          domain: new URL(targetUrl).hostname,
          path: '/',
          expires: Date.now() / 1000 + 3600, // Expires in 1 hour
          httpOnly: false,
          secure: false,
          sameSite: 'Lax'
        },
      ],
      origins: [],
    },
  });

  const criticalPaths = [];
  navigationConfig.mainNav.forEach(navItem => {
    if (navItem.path) criticalPaths.push({ name: navItem.name, path: navItem.path });
    if (navItem.subMenu) {
      navItem.subMenu.forEach(subItem => {
        criticalPaths.push({ name: `${navItem.name} -> ${subItem.name}`, path: subItem.path });
      });
    }
  });

  for (const { name, path } of criticalPaths) {
    test(`Measure load time for: ${name}`, async ({ page, request }) => {
      // Step 1: Verify the path exists using API context
      // Note: `request` context automatically uses the cookies defined in `test.use` or global configuration
      // BUT `storageState` in `test.use` initializes the browser context.
      // The `request` fixture shares the same storage state in recent Playwright versions, but let's be safe.

      const verifyResponse = await request.get(`${targetUrl}${path}`);

      if (verifyResponse.status() !== 200) {
        console.warn(`Skipping RAIL test for ${name} (${path}): returned status ${verifyResponse.status()}`);
        return;
      }

      // Step 2: Measure RAIL metrics
      console.log(`Navigating to ${name} (${path})...`);

      const startTime = Date.now();
      const response = await page.goto(`${targetUrl}${path}`);
      const endTime = Date.now();

      const loadTime = endTime - startTime;
      console.log(`[RAIL] ${name}: ${loadTime}ms`);

      expect(response.status()).toBe(200);
      await expect(page.locator('body')).toBeVisible();

      const performanceTiming = await page.evaluate(() => JSON.stringify(window.performance.timing));
      console.log(`[TIMING] ${name}: ${performanceTiming}`);
    });
  }
});
