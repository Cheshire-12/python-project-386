import { test, expect } from './fixtures/test';

test.describe('Guest event types', () => {
  test('creates an event type and sees it in the list', async ({ page, createTestEvent }) => {
    const et = await createTestEvent({
      name: 'My Meeting',
      description: 'A short meeting',
      durationMinutes: 30,
    });

    await page.goto('/event-types');
    await expect(page.getByText('My Meeting', { exact: true })).toBeVisible();
    await expect(page.getByText('A short meeting')).toBeVisible();
  });

  test('creates an event type via modal', async ({ page }) => {
    await page.goto('/event-types');

    await page.getByRole('button', { name: 'Создать' }).click();

    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();

    await modal.getByLabel('Название').fill('Новое событие');
    await modal.getByLabel('Описание').fill('Описание нового события');
    await modal.getByLabel('Длительность (мин)').fill('30');
    await modal.getByRole('button', { name: 'Создать', exact: true }).click();

    await expect(modal).toBeHidden({ timeout: 10_000 });
    await expect(page.getByText('Новое событие', { exact: true })).toBeVisible();
  });

  test('search filters events', async ({ page, createTestEvent }) => {
    await createTestEvent({ name: 'Alpha Unique', description: 'First event' });
    await createTestEvent({ name: 'Beta Unique', description: 'Second event' });

    await page.goto('/event-types');
    await expect(page.getByText('Alpha Unique', { exact: true })).toBeVisible();
    await expect(page.getByText('Beta Unique', { exact: true })).toBeVisible();

    await page.getByPlaceholder('Искать').fill('Alpha');
    await expect(page.getByText('Alpha Unique', { exact: true })).toBeVisible();
    await expect(page.getByText('Beta Unique', { exact: true })).toBeHidden();
  });

  test('has book button linking to event page', async ({ page, createTestEvent }) => {
    const et = await createTestEvent({ name: 'Bookable Unique', description: 'Test' });

    await page.goto('/event-types');
    await page.locator(`a[href="/event-types/${et.id}"]`).click();
    await expect(page).toHaveURL(`/event-types/${et.id}`);
  });
});
