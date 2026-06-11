import { useLocale, useTranslations } from "next-intl";
import PlanItem from "./PlanItem";
import { IPlanItem } from "@/types/PlanItem";
import { EventWithPlanItems } from "@/types/Event";
import { NAMESPACE_DASHBOARD_EVENTS } from "@/res/namespaces";
import { formatItemTime, getEventDays } from "@/utils/eventDays";

interface ReadOnlyViewProps {
  planItems: IPlanItem[];
  expandedDescriptions: Set<string>;
  onToggleDescription: (itemId: string, e: React.MouseEvent) => void;
  event?: EventWithPlanItems;
}

const ReadOnlyView = ({
  planItems,
  expandedDescriptions,
  onToggleDescription,
  event
}: ReadOnlyViewProps) => {
  const t = useTranslations(NAMESPACE_DASHBOARD_EVENTS);
  const locale = useLocale();

  const isSchedule = event?.type === "SCHEDULE";

  if (planItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 mt-2">
        <div className="bg-white rounded-lg shadow-sm p-3">
          <h3 className="text-lg font-medium mb-3">Event Plan</h3>
          <div className="space-y-2">
            <p>No plan items</p>
          </div>
        </div>
      </div>
    );
  }

  if (isSchedule && event) {
    const days = getEventDays(event);
    return (
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 mt-2">
        <div className="bg-white rounded-lg shadow-sm p-3">
          <h3 className="text-lg font-medium mb-3">Event Plan</h3>
          <div className="space-y-4">
            {days.map((day, dayIndex) => {
              const dayItems = planItems.filter(item => (item.dayIndex ?? 0) === dayIndex);
              return (
                <div key={dayIndex}>
                  <h4 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-1 mb-2">
                    {t("schedule.day_label_with_date", {
                      number: dayIndex + 1,
                      date: day.toLocaleDateString(locale),
                    })}
                  </h4>
                  {dayItems.length === 0 ? (
                    <p className="text-sm text-gray-400">{t("schedule.empty_day")}</p>
                  ) : (
                    <div className="space-y-2">
                      {dayItems.map((item, index) => (
                        <PlanItem
                          key={`${item.id}-${index}`}
                          item={item}
                          index={index}
                          expandedDescriptions={expandedDescriptions}
                          onToggleDescription={onToggleDescription}
                          isReadOnly={true}
                          timeLabel={formatItemTime(item.startHour, item.startMinute)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 mt-2">
      <div className="bg-white rounded-lg shadow-sm p-3">
        <h3 className="text-lg font-medium mb-3">Event Plan</h3>
        <div className="space-y-2">
          {planItems.map((item, index) => (
            <PlanItem
              key={`${item.id}-${index}`}
              item={item}
              index={index}
              expandedDescriptions={expandedDescriptions}
              onToggleDescription={onToggleDescription}
              isReadOnly={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReadOnlyView;
