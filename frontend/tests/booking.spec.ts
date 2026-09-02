import { test, expect } from './fixtures/test';

test.describe('Booking flow', () => {
  test('full booking journey', async ({ page, createTestEvent }) => {
    const eventType = await createTestEvent({
      name: 'Звонок Тест',
      description: 'Короткий звонок',
      durationMinutes: 30,
    });

    await page.goto(`/event-types/${eventType.id}`);

    await expect(page.getByText('Звонок Тест', { exact: true })).toBeVisible();
    await expect(page.getByText('Короткий звонок')).toBeVisible();
    await expect(page.getByText('30m')).toBeVisible();

    const availableSlot = page.getByRole('button', { name: /^\d{2}:\d{2}$/ }).first();
    await expect(availableSlot).toBeVisible({ timeout: 10_000 });
    await availableSlot.click();

    await expect(page.getByText(/Запись на/)).toBeVisible();
    await expect(page.getByText('Свободно')).toBeVisible();

    await page.getByLabel('Ваше имя').fill('Иван Иванов');
    await page.getByLabel('Email').fill('ivan@example.com');
    await page.getByLabel('Телефон').fill('+7 999 123 45 67');
    await page.getByRole('button', { name: 'Подтвердить запись' }).click();

    await expect(page).toHaveURL(/\/bookings\/\d+/);
    await expect(page.getByText('Вы записаны!')).toBeVisible();
    await expect(page.getByText('Иван Иванов')).toBeVisible();
    await expect(page.getByText('ivan@example.com')).toBeVisible();
  });

  test('shows error for invalid event type id', async ({ page }) => {
    await page.goto('/event-types/99999');
    await expect(page.getByText('не найден')).toBeVisible();
  });
});
