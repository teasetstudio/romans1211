"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Event, EventPlanItem, Song, Text as TextMat, Game, PreparationItem } from "@prisma/client";
import { NAMESPACE_DASHBOARD_EVENTS } from "@/res/namespaces";
import { getEventDays, formatItemTime, clampDayIndex } from "@/utils/eventDays";
import MaterialModal from "@/app/[locale]/dashboard/events/[id]/components/MaterialModal";
import CustomItemDialog from "./CustomItemDialog";
import Tooltip from "@/components/ui/Tooltip";
import type { TMaterialType } from "@/types/Materials";
import { IconChevronDown, IconChevronUp, IconCheck, IconClipboardList } from "@tabler/icons-react";

import '@/styles/tiptap-components.css';

// Component for expandable description
function ExpandableDescription({ description }: { description: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkIfClamped = () => {
      if (contentRef.current) {
        const element = contentRef.current;
        setIsClamped(element.scrollHeight > element.clientHeight);
      }
    };

    checkIfClamped();
    // Check again after a short delay to ensure content is fully rendered
    const timer = setTimeout(checkIfClamped, 100);
    
    return () => clearTimeout(timer);
  }, [description]);

  return (
    <div className="mt-1 text-sm text-gray-600">
      <div
        ref={contentRef}
        className={`tiptap-wrapper ${isExpanded ? "" : "line-clamp-2"}`}
        dangerouslySetInnerHTML={{ __html: description }}
      />
      {isClamped && (
        <div
          className="mt-1 text-xs text-blue-600 hover:text-blue-800 focus:outline-none hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          {isExpanded ? "Show less" : "Show more"}
        </div>
      )}
    </div>
  );
}

// Shape of event passed from the server page include
type PlanItemWithRelations = EventPlanItem & {
  song: Song | null;
  text: TextMat | null;
  game: Game | null;
  preparations: PreparationItem[];
};

type PublicEvent = Event & {
  eventPlanItems: PlanItemWithRelations[];
};

export default function PublicEventView({ event }: { event: PublicEvent }) {
  const t = useTranslations(NAMESPACE_DASHBOARD_EVENTS);
  const locale = useLocale();
  const isSchedule = event.type === "SCHEDULE";
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMaterialId, setModalMaterialId] = useState<string | null>(null);
  const [modalMaterialType, setModalMaterialType] = useState<TMaterialType>("text");
  const [customOpen, setCustomOpen] = useState(false);
  const [customItem, setCustomItem] = useState<PlanItemWithRelations | null>(null);
  const [expandedPreparations, setExpandedPreparations] = useState<Set<string>>(new Set());

  const togglePreparations = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedPreparations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const openMaterial = (item: PlanItemWithRelations) => {
    // Determine type and id from linked content
    if (item.song) {
      setModalMaterialType("song");
      setModalMaterialId(item.song.id);
      setModalOpen(true);
    } else if (item.text) {
      setModalMaterialType("text");
      setModalMaterialId(item.text.id);
      setModalOpen(true);
    } else if (item.game) {
      setModalMaterialType("game");
      setModalMaterialId(item.game.id);
      setModalOpen(true);
    } else if (item.type === "CUSTOM") {
      setCustomItem(item);
      setCustomOpen(true);
    } else {
      // For comments or custom with no linked material, do nothing
      return;
    }
  };

  const renderItemTitle = (item: PlanItemWithRelations) => {
    if (item.title) return item.title;
    if (item.song) return item.song.title;
    if (item.text) return item.text.title;
    if (item.game) return item.game.title;
    return "";
  };

  const renderItemTypeBadge = (item: PlanItemWithRelations) => {
    const base = "px-2 py-0.5 rounded-full text-xs font-medium";
    switch (item.type) {
      case "SONG":
        return <span className={`${base} bg-purple-100 text-purple-700`}>Song</span>;
      case "TEXT":
        return <span className={`${base} bg-blue-100 text-blue-700`}>Text</span>;
      case "GAME":
        return <span className={`${base} bg-green-100 text-green-700`}>Game</span>;
      case "COMMENT":
        return <span className={`${base} bg-gray-100 text-gray-700`}>Comment</span>;
      case "CUSTOM":
        return <span className={`${base} bg-amber-100 text-amber-700`}>Custom</span>;
      default:
        return <span className={`${base} bg-gray-100 text-gray-700`}>Item</span>;
    }
  };

  const renderItem = (item: PlanItemWithRelations) => {
    const time = isSchedule ? formatItemTime(item.startHour, item.startMinute) : null;
    return (
          <button
            key={item.id}
            type="button"
            className="w-full text-left p-4 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
            onClick={() => openMaterial(item)}
            disabled={item.type === "COMMENT"}
            title={item.type === "COMMENT" ? "No material to open" : undefined}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {time && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 tabular-nums">
                    {time}
                  </span>
                )}
                {renderItemTypeBadge(item)}
                <span className="font-medium text-gray-900">{renderItemTitle(item)}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.isReserve && (
                  <Tooltip tooltipText="Material in Reserve">
                    <div className="flex items-center justify-center w-4 h-4 bg-gray-600 text-gray-100 font-bold text-xs rounded-full">
                      R
                    </div>
                  </Tooltip>
                )}
                <div className="text-xs text-gray-500">
                  {typeof item.duration === "number" && item.duration > 0 ? `${item.duration} min` : null}
                </div>
              </div>
            </div>
            {item.description && (
              <ExpandableDescription description={item.description} />
            )}
            
            {/* Preparations Section */}
            {item.preparations && item.preparations.length > 0 && (
              <div className="mt-2">
                <div 
                  className="flex items-center text-xs text-gray-600 cursor-pointer hover:text-gray-800"
                  onClick={(e) => togglePreparations(item.id, e)}
                >
                  <IconClipboardList size={14} className="mr-1" />
                  {expandedPreparations.has(item.id) ? (
                    <>
                      <IconChevronUp size={14} className="mr-1" />
                      To Do ({item.preparations.filter(p => p.isCompleted).length}/{item.preparations.length})
                    </>
                  ) : (
                    <>
                      <IconChevronDown size={14} className="mr-1" />
                      To Do ({item.preparations.filter(p => p.isCompleted).length}/{item.preparations.length})
                    </>
                  )}
                </div>
                
                {expandedPreparations.has(item.id) && (
                  <div className="mt-2 p-3 bg-gray-50 rounded border">
                    <div className="space-y-2">
                      {item.preparations.map((prep) => (
                        <div key={prep.id} className="flex items-center gap-2">
                          <div
                            className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center ${
                              prep.isCompleted 
                                ? 'bg-green-500 border-green-500 text-white' 
                                : 'border-gray-300'
                            }`}
                          >
                            {prep.isCompleted && <IconCheck size={10} />}
                          </div>
                          <span className={`text-xs text-gray-700 ${prep.isCompleted ? 'line-through opacity-60' : ''}`}>
                            {prep.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </button>
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Event Plan</h2>
      {isSchedule ? (
        (() => {
          const days = getEventDays(event);
          const itemsByDay = new Map<number, PlanItemWithRelations[]>();
          for (const item of event.eventPlanItems) {
            const idx = clampDayIndex(item.dayIndex, days.length);
            const bucket = itemsByDay.get(idx);
            if (bucket) {
              bucket.push(item);
            } else {
              itemsByDay.set(idx, [item]);
            }
          }
          return (
            <div className="space-y-6">
              {days.map((dayDate, dayIdx) => {
                const dayItems = itemsByDay.get(dayIdx) ?? [];
                return (
                  <div key={dayIdx} className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-700">
                      {t("schedule.day_label_with_date", {
                        number: dayIdx + 1,
                        date: dayDate.toLocaleDateString(locale),
                      })}
                    </h3>
                    <div className="bg-white border rounded-md divide-y">
                      {dayItems.length === 0 ? (
                        <div className="p-4 text-sm text-gray-500">{t("schedule.empty_day")}</div>
                      ) : (
                        dayItems.map(renderItem)
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()
      ) : (
        <div className="bg-white border rounded-md divide-y">
          {event.eventPlanItems.length === 0 && (
            <div className="p-4 text-sm text-gray-500">No items in the event plan yet</div>
          )}
          {event.eventPlanItems.map(renderItem)}
        </div>
      )}

      <MaterialModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        materialId={modalMaterialId}
        materialType={modalMaterialType}
        eventSlug={event.linkSlug}
      />

      <CustomItemDialog
        open={customOpen && !!customItem}
        onClose={() => setCustomOpen(false)}
        title={customItem ? renderItemTitle(customItem) : ""}
        badge="Custom"
        contentHtml={customItem?.description ?? null}
        preparations={customItem?.preparations ?? []}
      />
    </div>
  );
}

