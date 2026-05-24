import { test, expect } from '@playwright/test';

test.describe('Authentication and Session Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard or login page
    await page.goto('/');
  });

  test('should display login page components correctly', async ({ page }) => {
    // Verify title/header elements
    await expect(page).toHaveTitle(/VenuePro/i);
    
    // If the user isn't logged in, they should see login inputs
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    if (await emailInput.isVisible()) {
      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();
      await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
    } else {
      // If already logged in (due to persistent state), verify dashboard banner
      await expect(page.locator('h1')).toContainText(/Welcome/i);
    }
  });

  test('should display validation messages for invalid logins', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    if (!(await emailInput.isVisible())) {
      // Clear localStorage/session to force login screen
      await page.evaluate(() => localStorage.clear());
      await page.reload();
    }

    await page.fill('input[type="email"]', 'invalid@venuepro.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button:has-text("Sign In")');

    // Verify error toast triggers
    const errorToast = page.locator('.sonner-toast:has-text("Invalid")');
    await expect(errorToast).toBeVisible();
  });
});
