import { test as base, expect } from '@playwright/test';
import {
  createEventType,
  createBooking,
  getSlots,
  type EventTypeData,
  type EventType,
  type Booking,
} from './api';

let counter = 0;

function uid(): string {
  counter++;
  return `${Date.now()}-${counter}-${Math.random().toString(36).slice(2, 6)}`;
}

type TestFixtures = {
  createTestEvent: (overrides?: Partial<EventTypeData>) => Promise<EventType>;
  createTestBooking: (eventTypeId: number, startsAt: string) => Promise<Booking>;
  getAvailableSlot: (eventTypeId: number) => Promise<string>;
};

export const test = base.extend<TestFixtures>({
  createTestEvent: async ({}, use) => {
    const fn = async (overrides?: Partial<EventTypeData>) => {
      const id = uid();
      return createEventType({
        name: `Evt ${id}`,
        description: `Desc ${id}`,
        durationMinutes: 30,
        ...overrides,
      });
    };
    await use(fn);
  },

  createTestBooking: async ({}, use) => {
    await use(async (eventTypeId, startsAt) => {
      return createBooking({
        eventTypeId,
        startsAt,
        guestName: 'Test Guest',
        email: 'test@example.com',
      });
    });
  },

  getAvailableSlot: async ({}, use) => {
    await use(async (eventTypeId) => {
      const from = new Date().toISOString();
      const to = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const slots = await getSlots(eventTypeId, from, to);
      const available = slots.find((s) => s.available);
      if (!available) throw new Error('No available slots');
      return available.start;
    });
  },
});

export { expect };
