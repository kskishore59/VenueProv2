import { test, expect } from '@playwright/test';

test.describe('Super Admin Panel Routing and Access Control', () => {
  test('should deny access to standard owners/managers and redirect to dashboard', async ({ page }) => {
    await page.goto('/login');
    // Clear localStorage to start clean
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Log in as standard venue owner
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible()) {
      await page.fill('input[type="email"]', 'demo@venuepro.com');
      await page.fill('input[type="password"]', 'demo1234');
      await page.click('button:has-text("Sign In")');
    }

    // Verify dashboard loads
    await expect(page.locator('h1')).toContainText(/Dashboard/i);

    // Attempt direct navigation to /super-admin
    await page.goto('/super-admin');

    // Should immediately redirect back to dashboard due to role mismatch
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should allow access to super admins and display all console tabs', async ({ page }) => {
    // Clear localStorage to force login screen
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Click quick "Super Admin Panel" demo button in Mock Mode Alert Banner
    const superAdminBtn = page.locator('button:has-text("Super Admin Panel")');
    await expect(superAdminBtn).toBeVisible();
    await superAdminBtn.click();

    // Wait for redirect to dashboard
    await expect(page.locator('h1')).toContainText(/Dashboard/i);

    // Check that Super Admin Panel link is visible in the sidebar and navigate
    const sidebarLink = page.locator('a:has-text("Super Admin Panel")');
    await expect(sidebarLink).toBeVisible();
    await sidebarLink.click();

    // Verify we reached the console
    await expect(page.locator('h1')).toContainText(/Governance Console/i);

    // Verify Tab selectors are present
    const analyticsTab = page.locator('button:has-text("Metrics & KPI Dashboard")');
    const orgsTab = page.locator('button:has-text("Organizations")');
    const usersTab = page.locator('button:has-text("User Directory")');
    const paymentsTab = page.locator('button:has-text("Payment Audit Ledger")');

    await expect(analyticsTab).toBeVisible();
    await expect(orgsTab).toBeVisible();
    await expect(usersTab).toBeVisible();
    await expect(paymentsTab).toBeVisible();

    // Verify custom SVG charts are visible in the default tab
    await expect(page.locator('svg').first()).toBeVisible();

    // Switch to Organizations Tab and verify table columns
    await orgsTab.click();
    await expect(page.locator('th:has-text("Venue Name")')).toBeVisible();
    await expect(page.locator('th:has-text("Subscription Plan")')).toBeVisible();

    // Switch to User Directory Tab and verify user accounts list
    await usersTab.click();
    await expect(page.locator('th:has-text("User Account")')).toBeVisible();
    await expect(page.locator('th:has-text("Security Role")')).toBeVisible();

    // Switch to Payment Audit Ledger Tab and verify ledger list
    await paymentsTab.click();
    await expect(page.locator('th:has-text("Transaction ID")')).toBeVisible();
    await expect(page.locator('th:has-text("Inflow Amount")')).toBeVisible();
  });
});
