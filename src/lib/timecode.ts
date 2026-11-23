/** `MM:SS.d`, rounded down. Minutes are not capped at 59. */
export function formatTimecode(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return '00:00.0';
  const tenths = Math.floor(ms / 100);
  const minutes = Math.floor(tenths / 600);
  const seconds = Math.floor(tenths / 10) % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(minutes)}:${pad(seconds)}.${tenths % 10}`;
}
