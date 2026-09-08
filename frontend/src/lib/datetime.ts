import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import utc from 'dayjs/plugin/utc';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(utc);
dayjs.extend(localizedFormat);
dayjs.locale('ru');

export const MSK_TIMEZONE = 'Europe/Moscow';

export function toMsk(iso: string): dayjs.Dayjs {
  return dayjs.utc(iso).add(3, 'hour');
}

export function nowMsk(): dayjs.Dayjs {
  return dayjs.utc().add(3, 'hour');
}

export function formatDateTime(iso: string): string {
  return toMsk(iso).format('D MMMM YYYY, HH:mm');
}

export function formatDateShort(iso: string): string {
  return toMsk(iso).format('D MMM, HH:mm');
}

export function formatTime(iso: string): string {
  return toMsk(iso).format('HH:mm');
}