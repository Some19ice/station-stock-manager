import { test, expect } from '@playwright/test';

test.describe('Theme Management', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.route('**/api/auth/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id: 'test-user', role: 'manager' } })
      });
    });

    // Mock theme API endpoints
    await page.route('**/api/theme', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ mode: 'light', primaryColor: '#3B82F6' })
        });
      } else if (route.request().method() === 'POST') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ mode: 'dark', primaryColor: '#60A5FA' })
        });
      }
    });

    // Navigate to dashboard
    await page.goto('/dashboard');
  });

  test('should display theme settings section', async ({ page }) => {
    // Wait for the theme settings section to be visible
    await expect(page.getByText('Theme Settings')).toBeVisible();
    await expect(page.getByText('Customize the appearance of your station interface')).toBeVisible();
  });

  test('should allow switching between light and dark mode', async ({ page }) => {
    // Find the theme switcher
    const themeSwitch = page.getByRole('switch', { name: /toggle theme/i });
    await expect(themeSwitch).toBeVisible();

    // Initially should be light mode (unchecked)
    await expect(themeSwitch).not.toBeChecked();
    await expect(page.getByText('Light Mode')).toBeVisible();

    // Switch to dark mode
    await themeSwitch.click();
    await expect(themeSwitch).toBeChecked();
    await expect(page.getByText('Dark Mode')).toBeVisible();
  });

  test('should allow selecting primary color', async ({ page }) => {
    // Find the color picker
    const colorInput = page.locator('input[type="color"]');
    await expect(colorInput).toBeVisible();

    // Should show default color
    await expect(page.getByText('#3B82F6')).toBeVisible();

    // Click on a preset color button
    const presetColorButton = page.getByRole('button', { name: /select color #10B981/i });
    await presetColorButton.click();

    // Color should update
    await expect(page.getByText('#10B981')).toBeVisible();
  });

  test('should save theme settings', async ({ page }) => {
    // Change theme mode
    const themeSwitch = page.getByRole('switch', { name: /toggle theme/i });
    await themeSwitch.click();

    // Change color
    const presetColorButton = page.getByRole('button', { name: /select color #60A5FA/i });
    await presetColorButton.click();

    // Save changes
    const saveButton = page.getByRole('button', { name: /save changes/i });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    // Should show success message
    await expect(page.getByText('Theme settings saved successfully')).toBeVisible();
  });

  test('should reset theme settings', async ({ page }) => {
    // Change some settings first
    const themeSwitch = page.getByRole('switch', { name: /toggle theme/i });
    await themeSwitch.click();

    // Reset button should be enabled
    const resetButton = page.getByRole('button', { name: /reset/i });
    await expect(resetButton).toBeEnabled();
    await resetButton.click();

    // Should reset to original settings
    await expect(themeSwitch).not.toBeChecked();
    await expect(page.getByText('Light Mode')).toBeVisible();
  });
});
