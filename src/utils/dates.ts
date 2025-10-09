import { addDays, addMinutes } from "date-fns";

export const dateToDDMMYYY = (date: string | Date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// Predict next event start/end times based on previous events cadence and duration
export const predictNextEventTimes = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  events: Array<{ startTime: Date | string; endTime: Date | string }> | undefined,
  // courseStartDate?: Date
): { startTime: Date; endTime: Date } | null => {
  if (!events || events.length === 0) return null;

  // Ensure events are treated in descending order by startTime (as UI uses events[0] as last)
  const normalized = events
    .map((e) => ({
      start: new Date(e.startTime),
      end: new Date(e.endTime),
    }))
    .sort((a, b) => b.start.getTime() - a.start.getTime());

  const last = normalized[0];
  const durationMs = Math.max(0, last.end.getTime() - last.start.getTime());

  let cadenceMs: number | null = null;
  if (normalized.length >= 2) {
    const prev = normalized[1];
    cadenceMs = last.start.getTime() - prev.start.getTime();
  }
  // else if (courseStartDate) {
  //   cadenceMs = last.start.getTime() - courseStartDate.getTime();
  // }

  // Fallbacks and sanity checks
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const SEVEN_DAYS = 7 * ONE_DAY;
  if (!cadenceMs || cadenceMs <= 0 || cadenceMs > 120 * ONE_DAY) {
    cadenceMs = SEVEN_DAYS; // default weekly cadence
  }

  // If cadence looks like an integer number of days, add calendar days to preserve wall-clock time across DST
  const cadenceDaysFloat = cadenceMs / ONE_DAY;
  const cadenceDaysRounded = Math.round(cadenceDaysFloat);
  const NEAR_WHOLE_DAY_TOLERANCE = 0.25; // within 6 hours treated as whole-day cadence
  const useCalendarDays = Math.abs(cadenceDaysFloat - cadenceDaysRounded) <= NEAR_WHOLE_DAY_TOLERANCE;

  const nextStart = useCalendarDays
    ? addDays(last.start, cadenceDaysRounded)
    : new Date(last.start.getTime() + cadenceMs);

  // Preserve duration by minutes to avoid +/-1h around DST shifts
  const durationMinutes = Math.max(1, Math.round((durationMs || 60 * 60 * 1000) / 60000));
  const nextEnd = addMinutes(nextStart, durationMinutes);

  return { startTime: nextStart, endTime: nextEnd };
};
