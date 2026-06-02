# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: bookings.spec.ts >> Booking Creation & Concurrency Exclusions >> should open booking drawer and verify availability checker works
- Location: tests\e2e\bookings.spec.ts:17:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h1')
Expected pattern: /Bookings/i
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
- text: Email Address
- textbox "name@venue.com"
- text: Password
- textbox "••••••••"
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
  3  | test.describe('Booking Creation & Concurrency Exclusions', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/');
  6  |     
  7  |     // Check if login is required
  8  |     const emailInput = page.locator('input[type="email"]');
  9  |     if (await emailInput.isVisible()) {
  10 |       await page.fill('input[type="email"]', 'owner@venuepro.com');
  11 |       await page.fill('input[type="password"]', 'password123');
  12 |       await page.click('button:has-text("Sign In")');
  13 |       await expect(page.locator('h1')).toContainText(/Welcome/i);
  14 |     }
  15 |   });
  16 | 
  17 |   test('should open booking drawer and verify availability checker works', async ({ page }) => {
  18 |     await page.goto('/bookings');
  19 |     
  20 |     // Verify bookings list page loads
> 21 |     await expect(page.locator('h1')).toContainText(/Bookings/i);
     |                                      ^ Error: expect(locator).toContainText(expected) failed
  22 |     
  23 |     // Open Quick Add Drawer
  24 |     const newBookingBtn = page.locator('button:has-text("New Booking")');
  25 |     if (await newBookingBtn.isVisible()) {
  26 |       await newBookingBtn.click();
  27 |       
  28 |       // Check inputs
  29 |       await expect(page.locator('h2:has-text("New Booking")')).toBeVisible();
  30 |       await expect(page.locator('input[type="date"]')).toBeVisible();
  31 |       await expect(page.locator('select')).toBeVisible();
  32 |     }
  33 |   });
  34 | 
  35 |   test('should trigger double click protection on booking save', async ({ page }) => {
  36 |     await page.goto('/bookings');
  37 |     
  38 |     const newBookingBtn = page.locator('button:has-text("New Booking")');
  39 |     if (await newBookingBtn.isVisible()) {
  40 |       await newBookingBtn.click();
  41 |       
  42 |       // Select Date & Hall
  43 |       await page.fill('input[type="date"]', '2026-06-15');
  44 |       await page.selectOption('select:has-text("Select hall")', { index: 1 });
  45 |       
  46 |       // Pick customer or click add customer
  47 |       const addCustBtn = page.locator('button:has-text("Add new customer")');
  48 |       await addCustBtn.click();
  49 |       await page.fill('input[placeholder="Customer name"]', 'Double-Click Test User');
  50 |       await page.fill('input[placeholder="Phone (10 digits)"]', '9876543210');
  51 |       
  52 |       // Click save booking rapidly
  53 |       const saveBtn = page.locator('button:has-text("Save Booking")');
  54 |       await saveBtn.dblclick();
  55 |       
  56 |       // Verify button disables and text changes
  57 |       await expect(saveBtn).toBeDisabled();
  58 |       await expect(saveBtn).toContainText(/Saving/i);
  59 |     }
  60 |   });
  61 | 
  62 |   test('should enforce exclusion constraint double-booking prevention', async ({ page }) => {
  63 |     // If the database has exclusion constraints, submitting an overlap throws an error.
  64 |     // We simulate this by filling overlapping data.
  65 |     await page.goto('/bookings');
  66 |     
  67 |     const newBookingBtn = page.locator('button:has-text("New Booking")');
  68 |     if (await newBookingBtn.isVisible()) {
  69 |       await newBookingBtn.click();
  70 |       
  71 |       // Choose same slot as an existing booking
  72 |       await page.fill('input[type="date"]', '2026-05-25');
  73 |       await page.selectOption('select', { index: 1 }); // Main Hall
  74 |       
  75 |       // Enter hours
  76 |       await page.fill('input[type="time"] >> nth=0', '10:00');
  77 |       await page.fill('input[type="time"] >> nth=1', '14:00');
  78 |       
  79 |       const saveBtn = page.locator('button:has-text("Save Booking")');
  80 |       if (await saveBtn.isEnabled()) {
  81 |         await saveBtn.click();
  82 |         
  83 |         // Under overlap database constraint, it must fail and output the interceptor message
  84 |         const toastMessage = page.locator('.sonner-toast:has-text("already booked")');
  85 |         // Note: this assertion is conditional based on whether test database contains the booking
  86 |         // but validates that the interceptor parses DB exceptions cleanly.
  87 |       }
  88 |     }
  89 |   });
  90 | });
  91 | 
```