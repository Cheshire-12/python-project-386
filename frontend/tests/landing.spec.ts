import { test, expect } from './fixtures/test';

test.describe('Landing page', () => {
  test('shows title and main heading', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Календарь звонков');
  });

  test('has timezone info', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Europe/Moscow')).toBeVisible();
  });

  test('navigates to event types via button', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Выбрать событие' }).click();
    await expect(page).toHaveURL('/event-types');
  });
});
