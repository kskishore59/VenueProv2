# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication and Session Flows >> should display login page components correctly
- Location: tests\e2e\auth.spec.ts:9:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h1')
Expected pattern: /Welcome/i
Received string:  "Run Your Venue Like a Modern Enterprise"
Timeout: 5000ms

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('h1')
    12 × locator resolved to <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.1] font-display">…</h1>
       - unexpected value "Run Your Venue Like a Modern Enterprise"

```

```yaml
- heading "Run Your Venue Like a Modern Enterprise" [level=1]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Authentication and Session Flows', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // Navigate to the dashboard or login page
  6  |     await page.goto('/');
  7  |   });
  8  | 
  9  |   test('should display login page components correctly', async ({ page }) => {
  10 |     // Verify title/header elements
  11 |     await expect(page).toHaveTitle(/VenuePro/i);
  12 |     
  13 |     // If the user isn't logged in, they should see login inputs
  14 |     const emailInput = page.locator('input[type="email"]');
  15 |     const passwordInput = page.locator('input[type="password"]');
  16 |     
  17 |     if (await emailInput.isVisible()) {
  18 |       await expect(emailInput).toBeVisible();
  19 |       await expect(passwordInput).toBeVisible();
  20 |       await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
  21 |     } else {
  22 |       // If already logged in (due to persistent state), verify dashboard banner
> 23 |       await expect(page.locator('h1')).toContainText(/Welcome/i);
     |                                        ^ Error: expect(locator).toContainText(expected) failed
  24 |     }
  25 |   });
  26 | 
  27 |   test('should display validation messages for invalid logins', async ({ page }) => {
  28 |     const emailInput = page.locator('input[type="email"]');
  29 |     if (!(await emailInput.isVisible())) {
  30 |       // Clear localStorage/session to force login screen
  31 |       await page.evaluate(() => localStorage.clear());
  32 |       await page.reload();
  33 |     }
  34 | 
  35 |     await page.fill('input[type="email"]', 'invalid@venuepro.com');
  36 |     await page.fill('input[type="password"]', 'wrongpassword');
  37 |     await page.click('button:has-text("Sign In")');
  38 | 
  39 |     // Verify error toast triggers
  40 |     const errorToast = page.locator('.sonner-toast:has-text("Invalid")');
  41 |     await expect(errorToast).toBeVisible();
  42 |   });
  43 | });
  44 | 
```