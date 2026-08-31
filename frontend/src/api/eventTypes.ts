import { api } from './client';
import type { EventType, Slot } from '@/types';

export const eventTypesApi = {
  list: () => api.get<EventType[]>('/event-types'),

  get: (id: number) => api.get<EventType>(`/event-types/${id}`),

  listSlots: (id: number, from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const query = params.toString();
    return api.get<Slot[]>(`/event-types/${id}/slots${query ? `?${query}` : ''}`);
  },
};
