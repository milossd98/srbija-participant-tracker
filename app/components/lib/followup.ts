const MONTHS_STALE = 6;

export function isFollowUpOverdue(lastContactAt: string | null): boolean {
  if (!lastContactAt) return true;
  const last = new Date(lastContactAt);
  if (Number.isNaN(last.getTime())) return true;
  const threshold = new Date();
  threshold.setMonth(threshold.getMonth() - MONTHS_STALE);
  return last < threshold;
}
