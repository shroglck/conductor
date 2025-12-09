import { test, expect } from '@playwright/test';
import { navigationConfig } from '../../src/public/js/config/navigationConfig.js';

const targetUrl = 'http://monkeyschool.indresh.me';
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
          value: authToken || '', // Fallback empty string to avoid crash before check
          domain: 'monkeyschool.indresh.me',
          path: '/',
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
    test(`Measure load time for: ${name}`, async ({ page }) => {
      console.log(`Navigating to ${name} (${path})...`);

      const startTime = Date.now();
      const response = await page.goto(`${targetUrl}${path}`);
      const endTime = Date.now();

      const loadTime = endTime - startTime;
      console.log(`[RAIL] ${name}: ${loadTime}ms`);

      expect(response.status()).toBe(200);

      // Verify page content is loaded (check for basic body presence)
      await expect(page.locator('body')).toBeVisible();

      // Additional RAIL metric: Time to first paint (approximate using evaluate)
      const performanceTiming = await page.evaluate(() => JSON.stringify(window.performance.timing));
      console.log(`[TIMING] ${name}: ${performanceTiming}`);
    });
  }
});
