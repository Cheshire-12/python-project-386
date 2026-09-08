import type { components } from './generated/schema';

type Schemas = components['schemas'];

export type EntityId = Schemas['EntityId'];
export type EventType = Schemas['EventType'];
export type EventTypeCreate = Schemas['EventTypeCreate'];
export type Slot = Schemas['Slot'];
export type Booking = Schemas['Booking'];
export type BookingCreate = Schemas['BookingCreate'];
export type UpcomingMeetings = Schemas['UpcomingMeetings'];
export type EventTypeDeleteResult = Schemas['EventTypeDeleteResult'];

export interface ApiError {
  code: string;
  message: string;
  details?: string[];
}