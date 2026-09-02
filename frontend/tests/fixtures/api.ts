const API_BASE = 'http://localhost:8000/api';

export interface EventTypeData {
  name: string;
  description: string;
  durationMinutes: number;
}

export interface EventType extends EventTypeData {
  id: number;
}

export interface BookingData {
  eventTypeId: number;
  startsAt: string;
  guestName: string;
  email?: string;
  phone?: string;
}

export interface Booking extends BookingData {
  id: number;
  createdAt: string;
}

export async function createEventType(data: EventTypeData): Promise<EventType> {
  const res = await fetch(`${API_BASE}/admin/event-types`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`createEventType ${res.status}: ${JSON.stringify(body)}`);
  }
  return res.json();
}

export async function createBooking(data: BookingData): Promise<Booking> {
  const res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`createBooking ${res.status}: ${JSON.stringify(body)}`);
  }
  return res.json();
}

export async function listEventTypes(): Promise<EventType[]> {
  const res = await fetch(`${API_BASE}/event-types`);
  return res.json();
}

export async function getSlots(
  eventTypeId: number,
  from?: string,
  to?: string,
): Promise<{ start: string; end: string; available: boolean }[]> {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const query = params.toString();
  const res = await fetch(
    `${API_BASE}/event-types/${eventTypeId}/slots${query ? `?${query}` : ''}`,
  );
  return res.json();
}
