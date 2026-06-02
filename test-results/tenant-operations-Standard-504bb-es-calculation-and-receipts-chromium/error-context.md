# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tenant-operations.spec.ts >> Standard Tenant Workspace Operations >> should handle Payments workflow: record-keeping, due dates calculation, and receipts
- Location: tests\e2e\tenant-operations.spec.ts:126:3

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
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Standard Tenant Workspace Operations', () => {
  4   |   test.beforeEach(async ({ page }) => {
  5   |     await page.goto('/');
  6   |     
  7   |     // Clear localStorage to start clean and force login
  8   |     await page.evaluate(() => localStorage.clear());
  9   |     await page.reload();
  10  | 
  11  |     const emailInput = page.locator('input[type="email"]');
  12  |     if (await emailInput.isVisible()) {
  13  |       await page.fill('input[type="email"]', 'demo@venuepro.com');
  14  |       await page.fill('input[type="password"]', 'demo1234');
  15  |       await page.click('button:has-text("Sign In")');
  16  |     }
  17  |     
  18  |     // Verify dashboard loads with welcome message
> 19  |     await expect(page.locator('h1')).toContainText(/Welcome/i);
      |                                      ^ Error: expect(locator).toContainText(expected) failed
  20  |   });
  21  | 
  22  |   test('should handle Leads workflow: creation, updating status, and converting to booking', async ({ page }) => {
  23  |     // 1. Navigate to Leads page
  24  |     await page.goto('/leads');
  25  |     await expect(page.locator('h1')).toContainText(/Leads & Inquiries/i);
  26  | 
  27  |     // 2. Open Add Lead Drawer
  28  |     const addLeadBtn = page.locator('button:has-text("Add Lead")');
  29  |     await expect(addLeadBtn).toBeVisible();
  30  |     await addLeadBtn.click();
  31  | 
  32  |     // 3. Fill in Lead Form
  33  |     await page.fill('input[placeholder="Customer name"]', 'E2E Lead User');
  34  |     await page.fill('input[placeholder="98765 43210"]', '9988776655');
  35  |     await page.fill('input[placeholder="email@example.com"]', 'e2e-lead@venuepro.com');
  36  |     await page.selectOption('select >> nth=0', { label: 'Marriage' }); // Event type select
  37  |     await page.fill('input[placeholder="200"]', '300'); // Guest count
  38  |     await page.fill('input[placeholder="2,00,000"]', '400000'); // Budget min
  39  |     await page.fill('textarea[placeholder="Any details about this inquiry..."]', 'Formed via automated E2E testing.');
  40  | 
  41  |     // 4. Submit Lead
  42  |     await page.click('button:has-text("Add Lead") >> nth=1'); // Submit button inside drawer
  43  | 
  44  |     // 5. Verify Lead was created and is visible in list
  45  |     const leadCard = page.locator('div:has-text("E2E Lead User")').first();
  46  |     await expect(leadCard).toBeVisible();
  47  | 
  48  |     // 6. Click Lead to open Lead Drawer
  49  |     await leadCard.click();
  50  |     await expect(page.locator('h2:has-text("E2E Lead User")')).toBeVisible();
  51  | 
  52  |     // 7. Update status to "Visit" (visit_scheduled)
  53  |     const visitStatusBtn = page.locator('button:has-text("🗓 Visit")');
  54  |     await expect(visitStatusBtn).toBeVisible();
  55  |     await visitStatusBtn.click();
  56  | 
  57  |     // Verify status badge in drawer updates
  58  |     await expect(page.locator('.drawer-content').locator('span:has-text("Visit")').first()).toBeVisible();
  59  | 
  60  |     // 8. Convert Lead to Booking
  61  |     const convertBtn = page.locator('button:has-text("Convert to Booking")');
  62  |     if (await convertBtn.isVisible()) {
  63  |       await convertBtn.click();
  64  |       
  65  |       // Select Hall
  66  |       await page.selectOption('select:has-text("Select")', { index: 1 });
  67  |       
  68  |       // Date Picker (since it uses a custom date component, let's type or fill the date input)
  69  |       const dateInput = page.locator('input[type="date"]');
  70  |       await dateInput.fill('2026-07-20');
  71  | 
  72  |       // Click Convert Lead button
  73  |       const submitConvertBtn = page.locator('button:has-text("Convert Lead")');
  74  |       await expect(submitConvertBtn).toBeVisible();
  75  |       await submitConvertBtn.click();
  76  | 
  77  |       // Verify drawer closes
  78  |       await expect(page.locator('h2:has-text("E2E Lead User")')).not.toBeVisible();
  79  |     }
  80  |   });
  81  | 
  82  |   test('should handle Customers workflow: listing, searching, details editing', async ({ page }) => {
  83  |     // 1. Navigate to Customers page
  84  |     await page.goto('/customers');
  85  |     await expect(page.locator('h1')).toContainText(/Customers/i);
  86  | 
  87  |     // 2. Open Add Customer Drawer
  88  |     const addCustBtn = page.locator('button:has-text("Add Customer")');
  89  |     await expect(addCustBtn).toBeVisible();
  90  |     await addCustBtn.click();
  91  | 
  92  |     // 3. Fill in Customer details (using explicit IDs)
  93  |     await page.fill('#input-ac-name', 'E2E Customer User');
  94  |     await page.fill('#input-ac-phone', '8877665544');
  95  |     await page.fill('#input-ac-email', 'e2e-cust@venuepro.com');
  96  |     await page.selectOption('#select-ac-source', { value: 'whatsapp' });
  97  |     await page.fill('#textarea-ac-address', '456 Automation Lane');
  98  |     await page.fill('#textarea-ac-notes', 'E2E Customer details notes.');
  99  | 
  100 |     // 4. Click Submit
  101 |     await page.click('#btn-ac-submit');
  102 | 
  103 |     // 5. Search for the added customer
  104 |     const searchInput = page.locator('input[placeholder="Search by phone number or name..."]');
  105 |     await expect(searchInput).toBeVisible();
  106 |     await searchInput.fill('E2E Customer User');
  107 | 
  108 |     // 6. Verify Customer card is visible and matches
  109 |     const customerCard = page.locator('div:has-text("E2E Customer User")').first();
  110 |     await expect(customerCard).toBeVisible();
  111 | 
  112 |     // 7. Click Edit Customer button
  113 |     const editBtn = customerCard.locator('button[title="Edit Customer"]');
  114 |     await expect(editBtn).toBeVisible();
  115 |     await editBtn.click();
  116 | 
  117 |     // 8. Modify notes
  118 |     await expect(page.locator('#input-ec-name')).toHaveValue('E2E Customer User');
  119 |     await page.fill('#textarea-ec-notes', 'Updated via E2E test runner.');
```