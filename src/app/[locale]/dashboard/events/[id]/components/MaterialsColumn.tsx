import { useState } from "react";
import { Droppable } from "@hello-pangea/dnd";
import { TMaterialWithType, TMaterialType } from "@/types/Materials";
import MaterialItem from "./MaterialItem";
import MaterialModal from "./MaterialModal";
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

interface MaterialsColumnProps {
  materials: (TMaterialWithType & {isFromPublicLibrary: boolean})[];
  usedMaterials: Set<string>;
  isLoading: boolean;
  hoveredMaterialId: string | null;
  isDraggingRightToLeft: boolean;
  isDraggingFromRight: boolean;
  currentPage: number;
  totalCount: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  // Native HTML5 drag mode (used by the schedule calendar; no DragDropContext required)
  nativeDragMode?: boolean;
  onNativeDragStart?: (item: TMaterialWithType & {isFromPublicLibrary: boolean}) => void;
  onNativeDragEnd?: () => void;
}

const MaterialsColumn = ({
  materials,
  usedMaterials,
  isLoading,
  hoveredMaterialId,
  isDraggingRightToLeft,
  isDraggingFromRight,
  currentPage,
  totalCount,
  totalPages,
  pageSize,
  onPageChange,
  nativeDragMode = false,
  onNativeDragStart,
  onNativeDragEnd
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
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium">Available Materials</h3>
        <div className="text-sm text-gray-600">
          {isLoading ? (
            <div className="animate-pulse bg-gray-200 h-4 w-12 rounded"></div>
          ) : (
            `${totalCount} total`
          )}
        </div>
      </div>
      
      {/* Materials Count and Pagination Info */}
      <div className="flex justify-between items-center mb-3 text-sm">
        <div className="text-gray-600">
          {isLoading ? (
            <div className="animate-pulse bg-gray-200 h-4 w-32 rounded"></div>
          ) : (
            `Showing ${((currentPage - 1) * pageSize) + 1}-${Math.min(currentPage * pageSize, totalCount)} of ${totalCount}`
          )}
        </div>
        
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="animate-pulse bg-gray-200 h-4 w-8 rounded"></div>
          </div>
        ) : (
          totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <IconChevronLeft size={14} />
              </button>
              
              <span className="text-gray-600">
                {currentPage}/{totalPages}
              </span>
              
              <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <IconChevronRight size={14} />
              </button>
            </div>
          )
        )}
      </div>
      {(() => {
        const listContent = isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="p-1 border border-gray-200 rounded-lg animate-pulse bg-white">
                {/* Header with title and type badge */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-4/5 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-10"></div>
                  </div>
                  <div className="h-4 w-14 bg-gray-200 rounded-full ml-3"></div>
                </div>
              </div>
            ))}
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
              nativeDragMode={nativeDragMode}
              onNativeDragStart={onNativeDragStart}
              onNativeDragEnd={onNativeDragEnd}
            />
          ))
        );

        if (nativeDragMode) {
          return <div className="min-h-[400px]">{listContent}</div>;
        }

        return (
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
                {listContent}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        );
      })()}
      
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
