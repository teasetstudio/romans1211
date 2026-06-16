"use client"

import { useLocale, useTranslations } from "next-intl";
import { NAMESPACE_DASHBOARD_EVENTS } from "@/res/namespaces";

export const parseTimeValue = (value: string): { startHour: number | null; startMinute: number | null } => {
  if (!value) return { startHour: null, startMinute: null };
  const [h, m] = value.split(":").map(Number);
  if (Number.isNaN(h)) return { startHour: null, startMinute: null };
  return { startHour: h, startMinute: Number.isNaN(m) ? 0 : m };
};

export const formatTimeValue = (startHour?: number | null, startMinute?: number | null): string => {
  if (startHour === null || startHour === undefined) return "";
  return `${String(startHour).padStart(2, "0")}:${String(startMinute ?? 0).padStart(2, "0")}`;
};

interface IProps {
  days: Date[];
  dayIndex: number;
  timeValue: string;
  durationValue: string;
  onDayIndexChange: (value: number) => void;
  onTimeChange: (value: string) => void;
  onDurationChange: (value: string) => void;
}

const inputClassName = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm";

const ScheduleFields = ({
  days,
  dayIndex,
  timeValue,
  durationValue,
  onDayIndexChange,
  onTimeChange,
  onDurationChange,
}: IProps) => {
  const t = useTranslations(NAMESPACE_DASHBOARD_EVENTS);
  const locale = useLocale();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="space-y-2">
        <label htmlFor="scheduleDay" className="block text-sm font-medium text-gray-700">
          {t("schedule.day")}
        </label>
        <select
          id="scheduleDay"
          value={dayIndex}
          onChange={(e) => onDayIndexChange(Number(e.target.value))}
          className={inputClassName}
        >
          {days.map((day, i) => (
            <option key={i} value={i}>
              {t("schedule.day_label_with_date", {
                number: i + 1,
                date: day.toLocaleDateString(locale),
              })}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="scheduleTime" className="block text-sm font-medium text-gray-700">
          {t("schedule.start_time")}
        </label>
        <input
          id="scheduleTime"
          type="time"
          value={timeValue}
          onChange={(e) => onTimeChange(e.target.value)}
          className={inputClassName}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="scheduleDuration" className="block text-sm font-medium text-gray-700">
          {t("schedule.duration_minutes")}
        </label>
        <input
          id="scheduleDuration"
          type="number"
          min={0}
          step={5}
          value={durationValue}
          onChange={(e) => onDurationChange(e.target.value)}
          className={inputClassName}
        />
      </div>
    </div>
  );
};

export default ScheduleFields;
