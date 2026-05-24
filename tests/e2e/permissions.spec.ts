import { test, expect } from '@playwright/test';

test.describe('Role-Based Access Control Boundaries', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Clear state and log in as staff
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    
    await page.fill('input[type="email"]', 'staff@venuepro.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Sign In")');
  });

  test('should hide financial pages from sidebar for staff', async ({ page }) => {
    // Payments navigation item should NOT exist in the DOM
    const paymentsLink = page.locator('nav >> a:has-text("Payments")');
    await expect(paymentsLink).not.toBeVisible();
    
    // Expenses navigation item should NOT exist in the DOM
    const expensesLink = page.locator('nav >> a:has-text("Expenses")');
    await expect(paymentsLink).not.toBeVisible();
  });

  test('should hide action trigger buttons for staff', async ({ page }) => {
    // Bookings page: New Booking button should be absent
    await page.goto('/bookings');
    const newBookingBtn = page.locator('button:has-text("New Booking")');
    await expect(newBookingBtn).not.toBeVisible();

    // Leads page: Add Lead button should be absent
    await page.goto('/leads');
    const addLeadBtn = page.locator('button:has-text("Add Lead")');
    await expect(addLeadBtn).not.toBeVisible();

    // Venues page: Add Space button should be absent
    await page.goto('/venues');
    const addSpaceBtn = page.locator('button:has-text("Add Space")');
    await expect(addSpaceBtn).not.toBeVisible();
  });
});
