import { useState } from "react";
import { Droppable } from "@hello-pangea/dnd";
import PlanItem from "./PlanItem";
import MaterialModal from "./MaterialModal";
import { IPlanItem } from "@/types/PlanItem";
import { TMaterialType } from "@/types/Materials";
import DeleteConfirmationPopup from "@/components/popups/DeleteConfirmationPopup";

const EmptyPlanState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-6">
        <svg 
          className="w-16 h-16 text-gray-300 mx-auto mb-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" 
          />
        </svg>
        <h4 className="text-lg font-medium text-gray-600 mb-2">
          Your event plan is empty
        </h4>
        <p className="text-sm text-gray-500 max-w-xs">
          Drag and drop materials from the library to build your event plan
        </p>
      </div>
    </div>
  );
};


interface PlanItemsColumnProps {
  planItems: IPlanItem[];
  expandedDescriptions: Set<string>;
  onToggleDescription: (itemId: string, e: React.MouseEvent) => void;
  onEditCustomItem: (item: IPlanItem) => void;
  onEditItem?: (item: IPlanItem) => void;
  onDeleteCustomItem?: (itemId: string) => void;
}

const PlanItemsColumn = ({
  planItems,
  expandedDescriptions,
  onToggleDescription,
  onEditCustomItem,
  onEditItem,
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
            {planItems.length === 0 ? (
              <EmptyPlanState />
            ) : (
              planItems.map((item, index) => (
                <PlanItem
                  key={`${item.id}-${index}`}
                  item={item}
                  index={index}
                  expandedDescriptions={expandedDescriptions}
                  onToggleDescription={onToggleDescription}
                  onEditCustomItem={onEditCustomItem}
                  onEditItem={onEditItem}
                  onDeleteCustomItem={requestDeleteCustomItem}
                  onItemClick={handleItemClick}
                />
              ))
            )}
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
