export function formatDuration(minutes: number | undefined): string {
  return minutes == null ? '—' : `${minutes} мин`;
}