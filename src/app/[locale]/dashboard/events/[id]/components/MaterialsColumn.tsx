import { useState } from "react";
import { Droppable } from "@hello-pangea/dnd";
import { TMaterialWithType, TMaterialType } from "@/types/Materials";
import MaterialItem from "./MaterialItem";
import MaterialModal from "./MaterialModal";

interface MaterialsColumnProps {
  materials: (TMaterialWithType & {isFromPublicLibrary: boolean})[];
  usedMaterials: Set<string>;
  isLoading: boolean;
  hoveredMaterialId: string | null;
  isDraggingRightToLeft: boolean;
  isDraggingFromRight: boolean;
}

const MaterialsColumn = ({
  materials,
  usedMaterials,
  isLoading,
  hoveredMaterialId,
  isDraggingRightToLeft,
  isDraggingFromRight
}: MaterialsColumnProps) => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    materialId: string | null;
    materialType: TMaterialType | null;
  }>({
    isOpen: false,
    materialId: null,
    materialType: null
  });

  const handleItemClick = (item: TMaterialWithType) => {
    setModalState({
      isOpen: true,
      materialId: item.id,
      materialType: item.type
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
      <h3 className="text-lg font-medium mb-3">Available Materials</h3>
      <Droppable 
        droppableId="materials"
        isDropDisabled={false}
      >
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="min-h-[400px]"
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              materials.map((item, index) => (
                <MaterialItem
                  key={item.id}
                  item={item}
                  index={index}
                  isUsed={usedMaterials.has(item.id)}
                  isHovered={hoveredMaterialId === item.id}
                  isDraggingRightToLeft={isDraggingRightToLeft}
                  isDraggingFromRight={isDraggingFromRight}
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
    </div>
  );
};

export default MaterialsColumn;
