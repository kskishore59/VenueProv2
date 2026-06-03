# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: whatsapp.spec.ts >> WhatsApp Templated Communications >> should open template modal and parse variables dynamically
- Location: tests\e2e\whatsapp.spec.ts:19:3

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Sign In")')
    - locator resolved to <button type="submit" class="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 hover:scale-103 active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed text-white font-bold text-sm transition-all shadow-md shadow-brand-200 mt-6">…</button>
  - attempting click action
    - waiting for element to be visible, enabled and stable

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e6]:
    - generic [ref=e7]:
      - img "VenuePro Logo" [ref=e8]
      - paragraph [ref=e9]: Premium Indian Venue Management System
    - generic [ref=e10]:
      - heading "Sign In" [level=2] [ref=e11]
      - generic [ref=e12]:
        - generic [ref=e13]:
          - generic [ref=e14]: Email Address
          - generic [ref=e15]:
            - img [ref=e16]
            - textbox "name@venue.com" [ref=e19]: owner@venuepro.com
        - generic [ref=e20]:
          - generic [ref=e21]: Password
          - generic [ref=e22]:
            - img [ref=e23]
            - textbox "••••••••" [active] [ref=e26]
            - button [ref=e27] [cursor=pointer]:
              - img [ref=e28]
        - button "Sign In" [ref=e31] [cursor=pointer]:
          - generic [ref=e32]: Sign In
      - generic [ref=e33]:
        - text: Don't have an account?
        - link "Create one now" [ref=e34]:
          - /url: /signup
    - generic [ref=e35]:
      - img [ref=e36]
      - generic [ref=e39]: Secured with Supabase SSL/TLS • Row-Level Access Policies
  - button "Feedback" [ref=e41] [cursor=pointer]:
    - img [ref=e42]
    - generic: Feedback
  - region "Notifications alt+T"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('WhatsApp Templated Communications', () => {
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
> 15 |       await page.click('button:has-text("Sign In")');
     |                  ^ Error: page.click: Test timeout of 30000ms exceeded.
  16 |     }
  17 |   });
  18 | 
  19 |   test('should open template modal and parse variables dynamically', async ({ page }) => {
  20 |     await page.goto('/bookings');
  21 |     
  22 |     // Click on the first booking card/row to open details drawer
  23 |     const firstBooking = page.locator('.booking-card >> nth=0');
  24 |     if (await firstBooking.isVisible()) {
  25 |       await firstBooking.click();
  26 |       
  27 |       // Verify details drawer is open
  28 |       await expect(page.locator('h3:has-text("Booking Details")')).toBeVisible();
  29 |       
  30 |       // Locate the WhatsApp trigger icon
  31 |       const whatsappBtn = page.locator('button:has-text("WhatsApp")');
  32 |       if (await whatsappBtn.isVisible()) {
  33 |         await whatsappBtn.click();
  34 |         
  35 |         // Verify WhatsappTemplateModal is visible
  36 |         await expect(page.locator('h3:has-text("WhatsApp Message Templates")')).toBeVisible();
  37 |         
  38 |         // Toggle template option
  39 |         const templateOption = page.locator('button:has-text("Payment Balance Reminder")');
  40 |         await templateOption.click();
  41 |         
  42 |         // Verify text editor does not contain unresolved double braces {{...}}
  43 |         const textEditor = page.locator('textarea');
  44 |         const content = await textEditor.inputValue();
  45 |         
  46 |         expect(content).not.toContain('{{');
  47 |         expect(content).not.toContain('}}');
  48 |         
  49 |         // Check dynamic replacement worked
  50 |         expect(content).toContain('Hello');
  51 |       }
  52 |     }
  53 |   });
  54 | });
  55 | 
```