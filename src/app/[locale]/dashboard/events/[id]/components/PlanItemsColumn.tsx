import { useState } from "react";
import { Droppable } from "@hello-pangea/dnd";
import PlanItem from "./PlanItem";
import MaterialModal from "./MaterialModal";
import { IPlanItem } from "@/types/PlanItem";
import { TMaterialType } from "@/types/Materials";
import DeleteConfirmationPopup from "@/components/popups/DeleteConfirmationPopup";


interface PlanItemsColumnProps {
  planItems: IPlanItem[];
  expandedDescriptions: Set<string>;
  onToggleDescription: (itemId: string, e: React.MouseEvent) => void;
  onEditCustomItem: (item: IPlanItem) => void;
  onDeleteCustomItem?: (itemId: string) => void;
}

const PlanItemsColumn = ({
  planItems,
  expandedDescriptions,
  onToggleDescription,
  onEditCustomItem,
  onDeleteCustomItem
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

  // Delete confirmation state for custom items
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [pendingDeleteItemId, setPendingDeleteItemId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const requestDeleteCustomItem = (itemId: string) => {
    setPendingDeleteItemId(itemId);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteItemId || !onDeleteCustomItem) {
      setIsDeleteOpen(false);
      setPendingDeleteItemId(null);
      return;
    }
    try {
      setIsDeleting(true);
      // Current deletion is synchronous/local, but keep async structure for future API calls
      await Promise.resolve(onDeleteCustomItem(pendingDeleteItemId));
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
      setPendingDeleteItemId(null);
    }
  };

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
                onDeleteCustomItem={requestDeleteCustomItem}
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

      <DeleteConfirmationPopup
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setPendingDeleteItemId(null);
        }}
        onConfirm={handleConfirmDelete}
        confirmText="Delete this custom item? This action cannot be undone."
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default PlanItemsColumn;
