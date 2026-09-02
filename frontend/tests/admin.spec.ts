import { test, expect } from './fixtures/test';

test.describe('Admin', () => {
  test('sidebar navigation', async ({ page }) => {
    await page.goto('/admin/event-types');
    await expect(page.getByRole('link', { name: 'Типы событий' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Предстоящие встречи' })).toBeVisible();
  });

  test('create, edit, and delete event type', async ({ page }) => {
    await page.goto('/admin/event-types');

    await page.getByRole('button', { name: 'Создать', exact: true }).click();
    const createModal = page.getByRole('dialog');
    await createModal.getByLabel('Название').fill('Вебинар Тест');
    await createModal.getByLabel('Описание').fill('Онлайн вебинар');
    await createModal.getByLabel('Длительность (мин)').fill('45');
    await createModal.getByRole('button', { name: 'Создать', exact: true }).click();

    await expect(page.getByText('45 мин')).toBeVisible();
    await expect(page.getByText('Вебинар Тест', { exact: true })).toBeVisible();

    const firstRow = page.locator('table tbody tr').first();
    await firstRow.locator('button').first().click();

    const editModal = page.getByRole('dialog');
    await editModal.getByLabel('Название').clear();
    await editModal.getByLabel('Название').fill('Семинар Тест');
    await editModal.getByRole('button', { name: 'Сохранить' }).click();

    await expect(page.getByText('Семинар Тест', { exact: true })).toBeVisible();

    const updatedRow = page.locator('table tbody tr').first();
    await updatedRow.locator('button').nth(1).click();

    const deleteModal = page.getByRole('dialog');
    await expect(deleteModal.getByText('Удалить тип события?')).toBeVisible();
    await deleteModal.getByRole('button', { name: 'Удалить', exact: true }).click();

    await expect(page.getByText('Типов событий пока нет')).toBeVisible();
  });

  test('shows upcoming meetings page', async ({ page }) => {
    await page.goto('/admin/upcoming');
    await expect(page.getByRole('heading', { level: 2 })).toContainText('Предстоящие встречи');

    const noMeetings = page.getByText('Предстоящих встреч нет');
    const table = page.locator('table');
    await expect(noMeetings.or(table)).toBeVisible();
  });

  test('upcoming shows bookings with event name', async ({
    page,
    createTestEvent,
    createTestBooking,
    getAvailableSlot,
  }) => {
    const eventType = await createTestEvent({ name: 'Стендап Уникальный' });
    const slotStart = await getAvailableSlot(eventType.id);
    await createTestBooking(eventType.id, slotStart);

    await page.goto('/admin/upcoming');
    await expect(page.getByText('Стендап Уникальный')).toBeVisible();
    await expect(page.getByText('Test Guest')).toBeVisible();
  });
});
