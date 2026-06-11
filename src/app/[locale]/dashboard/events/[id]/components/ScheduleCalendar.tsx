"use client"

import { useCallback, useMemo } from "react";
import { Calendar, dateFnsLocalizer, SlotInfo, Views } from "react-big-calendar";
import withDragAndDrop, { EventInteractionArgs } from "react-big-calendar/lib/addons/dragAndDrop";
import { format, parse, startOfWeek, getDay, differenceInCalendarDays, differenceInMinutes, startOfDay } from "date-fns";
import { enUS, ru } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
import { NAMESPACE_DASHBOARD_EVENTS } from "@/res/namespaces";
import { IPlanItem } from "@/types/PlanItem";
import { IEventDateRange, getDayCount, getItemEnd, getItemStart, clampDayIndex } from "@/utils/eventDays";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

export interface IScheduleChange {
  dayIndex: number;
  startHour: number | null;
  startMinute: number | null;
  duration: number | null;
}

interface ICalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  item: IPlanItem;
}

interface IProps {
  eventRange: IEventDateRange;
  planItems: IPlanItem[];
  hasDraggedMaterial: boolean;
  draggedMaterialTitle?: string | null;
  onScheduleChange: (itemId: string, change: IScheduleChange) => void;
  onDropMaterial: (change: IScheduleChange) => void;
  onSelectSlot: (change: IScheduleChange) => void;
  onSelectItem: (item: IPlanItem) => void;
}

const locales = { en: enUS, ru };

const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const DnDCalendar = withDragAndDrop<ICalendarEvent, object>(Calendar);

const DEFAULT_DURATION = 60;
const MIN_DURATION = 15;

const ScheduleCalendar = ({
  eventRange,
  planItems,
  hasDraggedMaterial,
  draggedMaterialTitle,
  onScheduleChange,
  onDropMaterial,
  onSelectSlot,
  onSelectItem,
}: IProps) => {
  const t = useTranslations(NAMESPACE_DASHBOARD_EVENTS);
  const locale = useLocale();

  const dayCount = getDayCount(eventRange);

  const toDayIndex = useCallback(
    (start: Date) =>
      clampDayIndex(
        differenceInCalendarDays(start, startOfDay(new Date(eventRange.startTime))),
        getDayCount(eventRange),
      ),
    [eventRange],
  );

  const calendarEvents: ICalendarEvent[] = useMemo(
    () =>
      planItems.map((item) => {
        const allDay = item.startHour === null || item.startHour === undefined;
        const start = getItemStart(eventRange, item.dayIndex ?? 0, item.startHour, item.startMinute);
        return {
          id: item.id,
          title: item.title,
          start,
          end: getItemEnd(eventRange, item.dayIndex ?? 0, item.startHour, item.startMinute, item.duration),
          allDay,
          item,
        };
      }),
    [planItems, eventRange],
  );

  const messages = useMemo(
    () => ({
      today: t("schedule.calendar_today"),
      previous: t("schedule.calendar_previous"),
      next: t("schedule.calendar_next"),
      week: t("schedule.calendar_week"),
      day: t("schedule.calendar_day"),
      agenda: t("schedule.calendar_agenda"),
      noEventsInRange: t("schedule.calendar_no_events"),
      allDay: t("schedule.no_time"),
    }),
    [t],
  );

  const handleEventDrop = useCallback(
    ({ event: calEvent, start, end, isAllDay }: EventInteractionArgs<ICalendarEvent>) => {
      const startDate = new Date(start);
      const dayIndex = toDayIndex(startDate);

      if (isAllDay) {
        onScheduleChange(calEvent.id, {
          dayIndex,
          startHour: null,
          startMinute: null,
          duration: calEvent.item.duration ?? null,
        });
        return;
      }

      // Untimed items dropped into a time slot get their stored duration or a default
      const minutes = calEvent.allDay
        ? calEvent.item.duration || DEFAULT_DURATION
        : Math.max(differenceInMinutes(new Date(end), startDate), MIN_DURATION);

      onScheduleChange(calEvent.id, {
        dayIndex,
        startHour: startDate.getHours(),
        startMinute: startDate.getMinutes(),
        duration: minutes,
      });
    },
    [onScheduleChange, toDayIndex],
  );

  const handleEventResize = useCallback(
    ({ event: calEvent, start, end }: EventInteractionArgs<ICalendarEvent>) => {
      const startDate = new Date(start);
      onScheduleChange(calEvent.id, {
        dayIndex: toDayIndex(startDate),
        startHour: startDate.getHours(),
        startMinute: startDate.getMinutes(),
        duration: Math.max(differenceInMinutes(new Date(end), startDate), MIN_DURATION),
      });
    },
    [onScheduleChange, toDayIndex],
  );

  const handleDropFromOutside = useCallback(
    ({ start, allDay }: { start: Date | string; end: Date | string; allDay: boolean }) => {
      const startDate = new Date(start);
      onDropMaterial(
        allDay
          ? { dayIndex: toDayIndex(startDate), startHour: null, startMinute: null, duration: null }
          : {
              dayIndex: toDayIndex(startDate),
              startHour: startDate.getHours(),
              startMinute: startDate.getMinutes(),
              duration: DEFAULT_DURATION,
            },
      );
    },
    [onDropMaterial, toDayIndex],
  );

  const dragFromOutsideItem = useCallback(
    (): ICalendarEvent => ({
      id: "__outside__",
      title: draggedMaterialTitle || "",
      start: new Date(),
      end: new Date(),
      allDay: false,
      item: undefined as unknown as IPlanItem,
    }),
    [draggedMaterialTitle],
  );

  const handleSelectSlot = useCallback(
    (slotInfo: SlotInfo) => {
      const start = new Date(slotInfo.start);
      const end = new Date(slotInfo.end);
      const allDay = differenceInMinutes(end, start) >= 24 * 60;
      onSelectSlot(
        allDay
          ? { dayIndex: toDayIndex(start), startHour: null, startMinute: null, duration: null }
          : {
              dayIndex: toDayIndex(start),
              startHour: start.getHours(),
              startMinute: start.getMinutes(),
              duration: Math.max(differenceInMinutes(end, start), MIN_DURATION),
            },
      );
    },
    [onSelectSlot, toDayIndex],
  );

  const eventPropGetter = useCallback((calEvent: ICalendarEvent) => {
    const type = calEvent.item?.type;
    const base =
      type === "song"
        ? "!bg-purple-600 !border-purple-700"
        : type === "text"
        ? "!bg-blue-600 !border-blue-700"
        : type === "game"
        ? "!bg-green-600 !border-green-700"
        : "!bg-amber-500 !border-amber-600";
    return { className: calEvent.item?.isReserve ? `${base} opacity-60` : base };
  }, []);

  const scrollToTime = useMemo(() => {
    const d = new Date();
    d.setHours(8, 0, 0, 0);
    return d;
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm p-3 h-[75vh] min-h-[600px]">
      <DnDCalendar
        localizer={localizer}
        culture={locale}
        events={calendarEvents}
        defaultDate={new Date(eventRange.startTime)}
        defaultView={dayCount > 1 ? Views.WEEK : Views.DAY}
        views={[Views.WEEK, Views.DAY, Views.AGENDA]}
        messages={messages}
        scrollToTime={scrollToTime}
        selectable
        resizable
        popup
        onEventDrop={handleEventDrop}
        onEventResize={handleEventResize}
        onDropFromOutside={handleDropFromOutside}
        dragFromOutsideItem={hasDraggedMaterial ? dragFromOutsideItem : undefined}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={(calEvent) => calEvent.item && onSelectItem(calEvent.item)}
        eventPropGetter={eventPropGetter}
        style={{ height: "100%" }}
      />
    </div>
  );
};

export default ScheduleCalendar;
