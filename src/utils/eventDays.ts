import { addDays, addMinutes, differenceInCalendarDays, eachDayOfInterval, setHours, setMinutes, startOfDay } from "date-fns";

export interface IEventDateRange {
  startTime: Date | string;
  endTime: Date | string;
}

// All schedule positions are relative to the event: dayIndex is a 0-based calendar-day
// offset from date(event.startTime), so shifting the event dates moves the whole schedule.

export const getEventDays = (event: IEventDateRange): Date[] => {
  const start = startOfDay(new Date(event.startTime));
  const end = startOfDay(new Date(event.endTime));
  if (end < start) return [start];
  return eachDayOfInterval({ start, end });
};

export const getDayCount = (event: IEventDateRange): number => {
  const diff = differenceInCalendarDays(
    startOfDay(new Date(event.endTime)),
    startOfDay(new Date(event.startTime)),
  );
  return Math.max(0, diff) + 1;
};

export const getDayDate = (event: IEventDateRange, dayIndex: number): Date =>
  addDays(startOfDay(new Date(event.startTime)), dayIndex);

export const getItemStart = (
  event: IEventDateRange,
  dayIndex: number,
  startHour?: number | null,
  startMinute?: number | null,
): Date => setMinutes(setHours(getDayDate(event, dayIndex), startHour ?? 0), startMinute ?? 0);

export const getItemEnd = (
  event: IEventDateRange,
  dayIndex: number,
  startHour?: number | null,
  startMinute?: number | null,
  duration?: number | null,
): Date => addMinutes(getItemStart(event, dayIndex, startHour, startMinute), duration || 60);

export const formatItemTime = (startHour?: number | null, startMinute?: number | null): string | null => {
  if (startHour === null || startHour === undefined) return null;
  const h = String(startHour).padStart(2, "0");
  const m = String(startMinute ?? 0).padStart(2, "0");
  return `${h}:${m}`;
};

export const clampDayIndex = (dayIndex: number | undefined | null, dayCount: number): number =>
  Math.min(Math.max(dayIndex ?? 0, 0), Math.max(dayCount - 1, 0));
