import { api } from './client';
import type { EventType, EventTypeCreate, UpcomingMeetings } from '@/types';

export interface DeleteEventTypeResult {
  deletedBookings: number;
}

export const adminApi = {
  eventTypes: {
    list: () => api.get<EventType[]>('/admin/event-types'),
    create: (data: EventTypeCreate) =>
      api.post<EventType>('/admin/event-types', data),
    update: (id: number, data: EventTypeCreate) =>
      api.put<EventType>(`/admin/event-types/${id}`, data),
    delete: (id: number) =>
      api.delete<DeleteEventTypeResult>(`/admin/event-types/${id}`),
  },
  bookings: {
    upcoming: (from?: string) => {
      const params = from ? `?from=${encodeURIComponent(from)}` : '';
      return api.get<UpcomingMeetings>(`/admin/bookings/upcoming${params}`);
    },
  },
};
