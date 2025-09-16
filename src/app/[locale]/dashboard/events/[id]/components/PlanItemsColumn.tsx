import { useState } from "react";
import { Droppable } from "@hello-pangea/dnd";
import PlanItem from "./PlanItem";
import MaterialModal from "./MaterialModal";
import { IPlanItem } from "@/types/PlanItem";
import { TMaterialType } from "@/types/Materials";


interface PlanItemsColumnProps {
  planItems: IPlanItem[];
  expandedDescriptions: Set<string>;
  onToggleDescription: (itemId: string, e: React.MouseEvent) => void;
  onEditCustomItem: (item: IPlanItem) => void;
}

const PlanItemsColumn = ({
  planItems,
  expandedDescriptions,
  onToggleDescription,
  onEditCustomItem
}: PlanItemsColumnProps) => {


  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    materialId: string | null;
    materialType: TMaterialType | null;
  }>({
    isOpen: false,
    materialId: null,
    materialType: null
  });

  const handleItemClick = async (item: IPlanItem) => {
    // Only open modal for material items (not custom items)
    if (item.type === 'CUSTOM' || !item.materialId) {
      return;
    }
    
    setModalState({
      isOpen: true,
      materialId: item.materialId,
      materialType: item.type as TMaterialType
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      materialId: null,
      materialType: null
    });
  };
  return (
    <div className="bg-white rounded-lg shadow-sm p-3">
      <h3 className="text-lg font-medium mb-3">Event Plan</h3>
      <Droppable droppableId="planItems">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="min-h-[400px]"
          >
            {planItems.map((item, index) => (
              <PlanItem
                key={`${item.id}-${index}`}
                item={item}
                index={index}
                expandedDescriptions={expandedDescriptions}
                onToggleDescription={onToggleDescription}
                onEditCustomItem={onEditCustomItem}
                onItemClick={handleItemClick}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      
      <MaterialModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        materialId={modalState.materialId}
        materialType={modalState.materialType!}
      />
    </div>
  );
};

export default PlanItemsColumn;
