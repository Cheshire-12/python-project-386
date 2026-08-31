import { api } from './client';
import type { EventType, EventTypeCreate, UpcomingMeetings } from '@/types';

export const adminApi = {
  eventTypes: {
    list: () => api.get<EventType[]>('/admin/event-types'),
    create: (data: EventTypeCreate) =>
      api.post<EventType>('/admin/event-types', data),
  },
  bookings: {
    upcoming: (from?: string) => {
      const params = from ? `?from=${encodeURIComponent(from)}` : '';
      return api.get<UpcomingMeetings>(`/admin/bookings/upcoming${params}`);
    },
  },
};
