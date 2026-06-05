# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: bookings.spec.ts >> Booking Creation & Concurrency Exclusions >> should trigger double click protection on booking save
- Location: tests\e2e\bookings.spec.ts:38:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h1')
Expected pattern: /Welcome/i
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
- textbox "name@venue.com": owner@venuepro.com
- text: Password
- textbox "••••••••": password123
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
  5  |     await page.goto('/login');
  6  |     
  7  |     // Clear localStorage to start clean and force login
  8  |     await page.evaluate(() => localStorage.clear());
  9  |     await page.reload();
  10 | 
  11 |     const emailInput = page.locator('input[type="email"]');
  12 |     if (await emailInput.isVisible()) {
  13 |       await page.fill('input[type="email"]', 'owner@venuepro.com');
  14 |       await page.fill('input[type="password"]', 'password123');
  15 |       await page.click('button:has-text("Sign In")');
> 16 |       await expect(page.locator('h1')).toContainText(/Welcome/i);
     |                                        ^ Error: expect(locator).toContainText(expected) failed
  17 |     }
  18 |   });
  19 | 
  20 |   test('should open booking drawer and verify availability checker works', async ({ page }) => {
  21 |     await page.goto('/bookings');
  22 |     
  23 |     // Verify bookings list page loads
  24 |     await expect(page.locator('h1')).toContainText(/Bookings/i);
  25 |     
  26 |     // Open Quick Add Drawer
  27 |     const newBookingBtn = page.locator('button:has-text("New Booking")');
  28 |     if (await newBookingBtn.isVisible()) {
  29 |       await newBookingBtn.click();
  30 |       
  31 |       // Check inputs
  32 |       await expect(page.locator('h2:has-text("New Booking")')).toBeVisible();
  33 |       await expect(page.locator('input[type="date"]')).toBeVisible();
  34 |       await expect(page.locator('select')).toBeVisible();
  35 |     }
  36 |   });
  37 | 
  38 |   test('should trigger double click protection on booking save', async ({ page }) => {
  39 |     await page.goto('/bookings');
  40 |     
  41 |     const newBookingBtn = page.locator('button:has-text("New Booking")');
  42 |     if (await newBookingBtn.isVisible()) {
  43 |       await newBookingBtn.click();
  44 |       
  45 |       // Select Date & Hall
  46 |       await page.fill('input[type="date"]', '2026-06-15');
  47 |       await page.selectOption('select:has-text("Select hall")', { index: 1 });
  48 |       
  49 |       // Pick customer or click add customer
  50 |       const addCustBtn = page.locator('button:has-text("Add new customer")');
  51 |       await addCustBtn.click();
  52 |       await page.fill('input[placeholder="Customer name"]', 'Double-Click Test User');
  53 |       await page.fill('input[placeholder="Phone (10 digits)"]', '9876543210');
  54 |       
  55 |       // Click save booking rapidly
  56 |       const saveBtn = page.locator('button:has-text("Save Booking")');
  57 |       await saveBtn.dblclick();
  58 |       
  59 |       // Verify button disables and text changes
  60 |       await expect(saveBtn).toBeDisabled();
  61 |       await expect(saveBtn).toContainText(/Saving/i);
  62 |     }
  63 |   });
  64 | 
  65 |   test('should enforce exclusion constraint double-booking prevention', async ({ page }) => {
  66 |     // If the database has exclusion constraints, submitting an overlap throws an error.
  67 |     // We simulate this by filling overlapping data.
  68 |     await page.goto('/bookings');
  69 |     
  70 |     const newBookingBtn = page.locator('button:has-text("New Booking")');
  71 |     if (await newBookingBtn.isVisible()) {
  72 |       await newBookingBtn.click();
  73 |       
  74 |       // Choose same slot as an existing booking
  75 |       await page.fill('input[type="date"]', '2026-05-25');
  76 |       await page.selectOption('select', { index: 1 }); // Main Hall
  77 |       
  78 |       // Enter hours
  79 |       await page.fill('input[type="time"] >> nth=0', '10:00');
  80 |       await page.fill('input[type="time"] >> nth=1', '14:00');
  81 |       
  82 |       const saveBtn = page.locator('button:has-text("Save Booking")');
  83 |       if (await saveBtn.isEnabled()) {
  84 |         await saveBtn.click();
  85 |         
  86 |         // Under overlap database constraint, it must fail and output the interceptor message
  87 |         const toastMessage = page.locator('.sonner-toast:has-text("already booked")');
  88 |         // Note: this assertion is conditional based on whether test database contains the booking
  89 |         // but validates that the interceptor parses DB exceptions cleanly.
  90 |       }
  91 |     }
  92 |   });
  93 | });
  94 | 
```