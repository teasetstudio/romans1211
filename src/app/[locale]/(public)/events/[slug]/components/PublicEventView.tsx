"use client";

import { useState } from "react";
import type { Event, EventPlanItem, Song, Text as TextMat, Game } from "@prisma/client";
import MaterialModal from "@/app/[locale]/dashboard/events/[id]/components/MaterialModal";
import CustomItemDialog from "./CustomItemDialog";
import type { TMaterialType } from "@/types/Materials";

// Shape of event passed from the server page include
type PlanItemWithRelations = EventPlanItem & {
  song: Song | null;
  text: TextMat | null;
  game: Game | null;
};

type PublicEvent = Event & {
  eventPlanItems: PlanItemWithRelations[];
};

export default function PublicEventView({ event }: { event: PublicEvent }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMaterialId, setModalMaterialId] = useState<string | null>(null);
  const [modalMaterialType, setModalMaterialType] = useState<TMaterialType>("text");
  const [customOpen, setCustomOpen] = useState(false);
  const [customItem, setCustomItem] = useState<PlanItemWithRelations | null>(null);

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

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Event Plan</h2>
      <div className="bg-white border rounded-md divide-y">
        {event.eventPlanItems.length === 0 && (
          <div className="p-4 text-sm text-gray-500">No items in the event plan yet</div>
        )}
        {event.eventPlanItems.map((item) => (
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
                {renderItemTypeBadge(item)}
                <span className="font-medium text-gray-900">{renderItemTitle(item)}</span>
              </div>
              <div className="text-xs text-gray-500">
                {typeof item.duration === "number" && item.duration > 0 ? `${item.duration} min` : null}
              </div>
            </div>
            {item.description && (
              <div
                className="mt-1 text-sm text-gray-600 line-clamp-2"
                dangerouslySetInnerHTML={{ __html: item.description }}
              />
            )}
          </button>
        ))}
      </div>

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
      />
    </div>
  );
}

