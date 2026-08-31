export type EntityId = number;

export interface EventType {
  id: EntityId;
  name: string;
  description: string;
  durationMinutes: number;
}

export interface EventTypeCreate {
  name: string;
  description: string;
  durationMinutes: number;
}

export interface Slot {
  start: string;
  end: string;
  available: boolean;
}

export interface Booking {
  id: EntityId;
  eventTypeId: EntityId;
  guestName: string;
  phone?: string;
  email?: string;
  startsAt: string;
  createdAt: string;
}

export interface BookingCreate {
  eventTypeId: EntityId;
  startsAt: string;
  guestName: string;
  phone?: string;
  email?: string;
}

export interface UpcomingMeetings {
  bookings: Booking[];
}

export interface ApiError {
  code: string;
  message: string;
  details?: string[];
}
