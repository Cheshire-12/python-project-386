import { api } from './client';
import type { Booking, BookingCreate } from '@/types';

export const bookingsApi = {
  create: (data: BookingCreate) => api.post<Booking>('/bookings', data),

  get: (id: number) => api.get<Booking>(`/bookings/${id}`),
};
