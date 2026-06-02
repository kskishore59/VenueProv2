# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: super-admin.spec.ts >> Super Admin Panel Routing and Access Control >> should deny access to standard owners/managers and redirect to dashboard
- Location: tests\e2e\super-admin.spec.ts:4:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h1')
Expected pattern: /Dashboard/i
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('h1')

```

```yaml
- img "VenuePro Logo"
- paragraph: Premium Indian Venue Management System
- heading "Sign In" [level=2]
- text: Invalid login credentials Email Address
- textbox "name@venue.com": demo@venuepro.com
- text: Password
- textbox "••••••••": demo1234
- button
- button "Sign In"
- text: Don't have an account?
- link "Create one now":
  - /url: /signup
- text: Secured with Supabase SSL/TLS • Row-Level Access Policies
- button "Feedback"
- region "Notifications alt+T"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Super Admin Panel Routing and Access Control', () => {
  4  |   test('should deny access to standard owners/managers and redirect to dashboard', async ({ page }) => {
  5  |     await page.goto('/login');
  6  |     // Clear localStorage to start clean
  7  |     await page.evaluate(() => localStorage.clear());
  8  |     await page.reload();
  9  | 
  10 |     // Log in as standard venue owner
  11 |     const emailInput = page.locator('input[type="email"]');
  12 |     if (await emailInput.isVisible()) {
  13 |       await page.fill('input[type="email"]', 'demo@venuepro.com');
  14 |       await page.fill('input[type="password"]', 'demo1234');
  15 |       await page.click('button:has-text("Sign In")');
  16 |     }
  17 | 
  18 |     // Verify dashboard loads
> 19 |     await expect(page.locator('h1')).toContainText(/Dashboard/i);
     |                                      ^ Error: expect(locator).toContainText(expected) failed
  20 | 
  21 |     // Attempt direct navigation to /super-admin
  22 |     await page.goto('/super-admin');
  23 | 
  24 |     // Should immediately redirect back to dashboard due to role mismatch
  25 |     await expect(page).toHaveURL(/.*dashboard/);
  26 |   });
  27 | 
  28 |   test('should allow access to super admins and display all console tabs', async ({ page }) => {
  29 |     // Clear localStorage to force login screen
  30 |     await page.goto('/login');
  31 |     await page.evaluate(() => localStorage.clear());
  32 |     await page.reload();
  33 | 
  34 |     // Click quick "Super Admin Panel" demo button in Mock Mode Alert Banner
  35 |     const superAdminBtn = page.locator('button:has-text("Super Admin Panel")');
  36 |     await expect(superAdminBtn).toBeVisible();
  37 |     await superAdminBtn.click();
  38 | 
  39 |     // Wait for redirect to dashboard
  40 |     await expect(page.locator('h1')).toContainText(/Dashboard/i);
  41 | 
  42 |     // Check that Super Admin Panel link is visible in the sidebar and navigate
  43 |     const sidebarLink = page.locator('a:has-text("Super Admin Panel")');
  44 |     await expect(sidebarLink).toBeVisible();
  45 |     await sidebarLink.click();
  46 | 
  47 |     // Verify we reached the console
  48 |     await expect(page.locator('h1')).toContainText(/Governance Console/i);
  49 | 
  50 |     // Verify Tab selectors are present
  51 |     const analyticsTab = page.locator('button:has-text("Metrics & KPI Dashboard")');
  52 |     const orgsTab = page.locator('button:has-text("Organizations")');
  53 |     const usersTab = page.locator('button:has-text("User Directory")');
  54 |     const paymentsTab = page.locator('button:has-text("Payment Audit Ledger")');
  55 | 
  56 |     await expect(analyticsTab).toBeVisible();
  57 |     await expect(orgsTab).toBeVisible();
  58 |     await expect(usersTab).toBeVisible();
  59 |     await expect(paymentsTab).toBeVisible();
  60 | 
  61 |     // Verify custom SVG charts are visible in the default tab
  62 |     await expect(page.locator('svg').first()).toBeVisible();
  63 | 
  64 |     // Switch to Organizations Tab and verify table columns
  65 |     await orgsTab.click();
  66 |     await expect(page.locator('th:has-text("Venue Name")')).toBeVisible();
  67 |     await expect(page.locator('th:has-text("Subscription Plan")')).toBeVisible();
  68 | 
  69 |     // Switch to User Directory Tab and verify user accounts list
  70 |     await usersTab.click();
  71 |     await expect(page.locator('th:has-text("User Account")')).toBeVisible();
  72 |     await expect(page.locator('th:has-text("Security Role")')).toBeVisible();
  73 | 
  74 |     // Switch to Payment Audit Ledger Tab and verify ledger list
  75 |     await paymentsTab.click();
  76 |     await expect(page.locator('th:has-text("Transaction ID")')).toBeVisible();
  77 |     await expect(page.locator('th:has-text("Inflow Amount")')).toBeVisible();
  78 |   });
  79 | });
  80 | 
```