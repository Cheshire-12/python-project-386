import { test, expect } from './fixtures/test';

test.describe('Slot conflict', () => {
  test('busy slot can not be booked twice across event types, user sees a clear message', async ({
    page,
    createTestEvent,
    createTestBooking,
    getAvailableSlot,
  }) => {
    const eventType = await createTestEvent({ description: 'Звонок с конфликтом' });
    const otherType = await createTestEvent({ description: 'Другой тип события' });

    await page.goto(`/event-types/${eventType.id}`);

    const firstSlot = page.getByRole('button', { name: /^\d{2}:\d{2}$/ }).first();
    await expect(firstSlot).toBeVisible({ timeout: 10_000 });
    await firstSlot.click();

    await expect(page.getByText(/Запись на/)).toBeVisible();

    const slotStart = await getAvailableSlot(otherType.id);
    await createTestBooking(otherType.id, slotStart);

    await page.getByLabel('Ваше имя').fill('Иван Конфликтов');
    await page.getByLabel('Email').fill('conflict@example.com');
    await page.getByRole('button', { name: 'Подтвердить запись' }).click();

    await expect(page.getByText('На это время уже есть бронирование')).toBeVisible();

    const upcoming = await page.request.get('/api/admin/bookings/upcoming');
    expect(upcoming.ok()).toBeTruthy();
    const data = await upcoming.json();
    const matches = data.bookings.filter(
      (b: { startsAt: string }) =>
        new Date(b.startsAt).getTime() === new Date(slotStart).getTime(),
    );
    expect(matches).toHaveLength(1);
  });
});