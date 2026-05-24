import { test, expect } from '@playwright/test';

test.describe('WhatsApp Templated Communications', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible()) {
      await page.fill('input[type="email"]', 'owner@venuepro.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button:has-text("Sign In")');
    }
  });

  test('should open template modal and parse variables dynamically', async ({ page }) => {
    await page.goto('/bookings');
    
    // Click on the first booking card/row to open details drawer
    const firstBooking = page.locator('.booking-card >> nth=0');
    if (await firstBooking.isVisible()) {
      await firstBooking.click();
      
      // Verify details drawer is open
      await expect(page.locator('h3:has-text("Booking Details")')).toBeVisible();
      
      // Locate the WhatsApp trigger icon
      const whatsappBtn = page.locator('button:has-text("WhatsApp")');
      if (await whatsappBtn.isVisible()) {
        await whatsappBtn.click();
        
        // Verify WhatsappTemplateModal is visible
        await expect(page.locator('h3:has-text("WhatsApp Message Templates")')).toBeVisible();
        
        // Toggle template option
        const templateOption = page.locator('button:has-text("Payment Balance Reminder")');
        await templateOption.click();
        
        // Verify text editor does not contain unresolved double braces {{...}}
        const textEditor = page.locator('textarea');
        const content = await textEditor.inputValue();
        
        expect(content).not.toContain('{{');
        expect(content).not.toContain('}}');
        
        // Check dynamic replacement worked
        expect(content).toContain('Hello');
      }
    }
  });
});
