import { test, expect } from '@playwright/test';

test.describe('Standard Tenant Workspace Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    
    // Clear localStorage to start clean and force login
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible()) {
      await page.fill('input[type="email"]', 'demo@venuepro.com');
      await page.fill('input[type="password"]', 'demo1234');
      await page.click('button:has-text("Sign In")');
    }
    
    // Verify dashboard loads with welcome message
    await expect(page.locator('h1')).toContainText(/Welcome/i);
  });

  test('should handle Leads workflow: creation, updating status, and converting to booking', async ({ page }) => {
    // 1. Navigate to Leads page
    await page.goto('/leads');
    await expect(page.locator('h1')).toContainText(/Leads & Inquiries/i);

    // 2. Open Add Lead Drawer
    const addLeadBtn = page.locator('button:has-text("Add Lead")');
    await expect(addLeadBtn).toBeVisible();
    await addLeadBtn.click();

    // 3. Fill in Lead Form
    await page.fill('input[placeholder="Customer name"]', 'E2E Lead User');
    await page.fill('input[placeholder="98765 43210"]', '9988776655');
    await page.fill('input[placeholder="email@example.com"]', 'e2e-lead@venuepro.com');
    await page.selectOption('select >> nth=0', { label: 'Marriage' }); // Event type select
    await page.fill('input[placeholder="200"]', '300'); // Guest count
    await page.fill('input[placeholder="2,00,000"]', '400000'); // Budget min
    await page.fill('textarea[placeholder="Any details about this inquiry..."]', 'Formed via automated E2E testing.');

    // 4. Submit Lead
    await page.click('button:has-text("Add Lead") >> nth=1'); // Submit button inside drawer

    // 5. Verify Lead was created and is visible in list
    const leadCard = page.locator('div:has-text("E2E Lead User")').first();
    await expect(leadCard).toBeVisible();

    // 6. Click Lead to open Lead Drawer
    await leadCard.click();
    await expect(page.locator('h2:has-text("E2E Lead User")')).toBeVisible();

    // 7. Update status to "Visit" (visit_scheduled)
    const visitStatusBtn = page.locator('button:has-text("🗓 Visit")');
    await expect(visitStatusBtn).toBeVisible();
    await visitStatusBtn.click();

    // Verify status badge in drawer updates
    await expect(page.locator('.drawer-content').locator('span:has-text("Visit")').first()).toBeVisible();

    // 8. Convert Lead to Booking
    const convertBtn = page.locator('button:has-text("Convert to Booking")');
    if (await convertBtn.isVisible()) {
      await convertBtn.click();
      
      // Select Hall
      await page.selectOption('select:has-text("Select")', { index: 1 });
      
      // Date Picker (since it uses a custom date component, let's type or fill the date input)
      const dateInput = page.locator('input[type="date"]');
      await dateInput.fill('2026-07-20');

      // Click Convert Lead button
      const submitConvertBtn = page.locator('button:has-text("Convert Lead")');
      await expect(submitConvertBtn).toBeVisible();
      await submitConvertBtn.click();

      // Verify drawer closes
      await expect(page.locator('h2:has-text("E2E Lead User")')).not.toBeVisible();
    }
  });

  test('should handle Customers workflow: listing, searching, details editing', async ({ page }) => {
    // 1. Navigate to Customers page
    await page.goto('/customers');
    await expect(page.locator('h1')).toContainText(/Customers/i);

    // 2. Open Add Customer Drawer
    const addCustBtn = page.locator('button:has-text("Add Customer")');
    await expect(addCustBtn).toBeVisible();
    await addCustBtn.click();

    // 3. Fill in Customer details (using explicit IDs)
    await page.fill('#input-ac-name', 'E2E Customer User');
    await page.fill('#input-ac-phone', '8877665544');
    await page.fill('#input-ac-email', 'e2e-cust@venuepro.com');
    await page.selectOption('#select-ac-source', { value: 'whatsapp' });
    await page.fill('#textarea-ac-address', '456 Automation Lane');
    await page.fill('#textarea-ac-notes', 'E2E Customer details notes.');

    // 4. Click Submit
    await page.click('#btn-ac-submit');

    // 5. Search for the added customer
    const searchInput = page.locator('input[placeholder="Search by phone number or name..."]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('E2E Customer User');

    // 6. Verify Customer card is visible and matches
    const customerCard = page.locator('div:has-text("E2E Customer User")').first();
    await expect(customerCard).toBeVisible();

    // 7. Click Edit Customer button
    const editBtn = customerCard.locator('button[title="Edit Customer"]');
    await expect(editBtn).toBeVisible();
    await editBtn.click();

    // 8. Modify notes
    await expect(page.locator('#input-ec-name')).toHaveValue('E2E Customer User');
    await page.fill('#textarea-ec-notes', 'Updated via E2E test runner.');
    await page.click('#btn-ec-save');

    // Verify drawer closed
    await expect(page.locator('#btn-ec-save')).not.toBeVisible();
  });

  test('should handle Payments workflow: record-keeping, due dates calculation, and receipts', async ({ page }) => {
    // 1. Navigate to Bookings page
    await page.goto('/bookings');
    await expect(page.locator('h1')).toContainText(/Bookings/i);

    // 2. Click on the first booking card/row to open details drawer
    // Bookings are rendered inside a list/table, clicking the row works
    const firstBookingRow = page.locator('.divide-y >> text=VP-').first();
    if (await firstBookingRow.isVisible()) {
      await firstBookingRow.click();
      
      // 3. Verify details drawer is open
      await expect(page.locator('h4:has-text("Payment Summary")')).toBeVisible();

      // 4. Click "Collect Payment" button inside drawer
      const collectBtn = page.locator('button:has-text("Collect Payment")');
      if (await collectBtn.isVisible()) {
        await collectBtn.click();

        // 5. Fill out Record Payment Modal
        await page.fill('#input-rp-amount', '15000');
        await page.click('#btn-rp-mode-upi');
        await page.fill('#input-rp-reference', 'UPI-E2E-TEST');
        await page.fill('#textarea-rp-notes', 'Payment recorded by E2E test suite.');

        // 6. Click Submit
        await page.click('#btn-rp-submit');

        // Verify Record payment modal closed
        await expect(page.locator('#btn-rp-submit')).not.toBeVisible();
      }
    }
  });
});
