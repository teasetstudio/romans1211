import { useState, useRef } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { IconChevronDown, IconChevronUp, IconCheck, IconClipboardList } from "@tabler/icons-react";
import { IPlanItem, IPreparation } from "@/types/PlanItem";
import Tooltip from "@/components/ui/Tooltip";

import '@/styles/tiptap-components.css';

interface PlanItemProps {
  item: IPlanItem;
  index: number;
  expandedDescriptions: Set<string>;
  onToggleDescription: (itemId: string, e: React.MouseEvent) => void;
  onEditCustomItem?: (item: IPlanItem) => void;
  onEditItem?: (item: IPlanItem) => void;
  onDeleteCustomItem?: (itemId: string) => void;
  onItemClick?: (item: IPlanItem) => void;
  isReadOnly?: boolean;
  updatePreparationCheckbox?: (eventId: string, preparationId: string, checked: boolean) => void;
  timeLabel?: string | null;
}

const PlanItem = ({ 
  item, 
  index, 
  expandedDescriptions, 
  onToggleDescription, 
  onEditCustomItem,
  onEditItem,
  onDeleteCustomItem,
  onItemClick,
  isReadOnly = false,
  updatePreparationCheckbox,
  timeLabel,
}: PlanItemProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [expandedPreparations, setExpandedPreparations] = useState(false);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    setIsDragging(false);
  };

  const handleMouseMove = () => {
    setIsDragging(true);
  };

  const handleClick = (e: React.MouseEvent) => {
    // Only trigger click if we haven't dragged and it's not a CUSTOM item
    // and we have a click handler and materialId
    if (!isDragging && item.type !== "CUSTOM" && item.material && onItemClick) {
      e.preventDefault();
      e.stopPropagation();
      onItemClick(item);
    }
  };

  const handlePreparationCheckboxChange = (preparationId: string, isCompleted: boolean) => {
    if (updatePreparationCheckbox) {
      updatePreparationCheckbox(item.id, preparationId, isCompleted);
    }
  };

  const getItemStyles = (type: string) => {
    if (type === "CUSTOM") {
      return {
        container: 'bg-amber-50 border-amber-100 hover:border-amber-200',
        title: 'text-amber-900',
        type: 'text-amber-600'
      };
    } else if (type === 'song') {
      return {
        container: 'bg-purple-50 border-purple-100 hover:border-purple-200',
        title: 'text-purple-900',
        type: 'text-purple-600'
      };
    } else if (type === 'text') {
      return {
        container: 'bg-blue-50 border-blue-100 hover:border-blue-200',
        title: 'text-blue-900',
        type: 'text-blue-600'
      };
    } else {
      return {
        container: 'bg-green-50 border-green-100 hover:border-green-200',
        title: 'text-green-900',
        type: 'text-green-600'
      };
    }
  };

  const styles = getItemStyles(item.type);

  const content = (
    <div 
      className={`p-2 mb-2 rounded-lg border transition-all duration-200 ${styles.container} ${
        item.type !== "CUSTOM" && item.material && onItemClick ? 'cursor-pointer' : ''
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className={`text-sm font-medium ${styles.title}`}>
            {timeLabel && (
              <span className="inline-block text-xs font-semibold text-gray-700 bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 mr-2 align-middle">
                {timeLabel}
              </span>
            )}
            {item.title}
          </div>
          {item.type !== "CUSTOM" && (
            <div className={`text-xs mt-0.5 ${styles.type}`}>
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </div>
          )}
          {item.description && (
            <div className="mt-1">
              <div 
                className={`flex items-center text-xs ${styles.type} cursor-pointer hover:opacity-80`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleDescription(item.id, e)
                }}
              >
                {expandedDescriptions.has(item.id) ? (
                  <>
                    <IconChevronUp size={14} className="mr-1" />
                    {item.type === "CUSTOM" ? "Hide Description" : "Hide Comment"}
                  </>
                ) : (
                  <>
                    <IconChevronDown size={14} className="mr-1" />
                    {item.type === "CUSTOM" ? "Show Description" : "Show Comment"}
                  </>
                )}
              </div>
              
              {expandedDescriptions.has(item.id) && (
                <div 
                  className={`tiptap-wrapper mt-1.5 text-sm ${styles.title} max-h-40 overflow-y-auto p-2 ${styles.container} rounded`}
                  dangerouslySetInnerHTML={{ __html: item.description || "" }}
                />
              )}
            </div>
          )}
          
          {/* Preparations Section */}
          {item.preparations && item.preparations.length > 0 && (
            <div className="mt-1">
              <div 
                className={`flex items-center text-xs ${styles.type} cursor-pointer hover:opacity-80`}
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedPreparations(!expandedPreparations);
                }}
              >
                <IconClipboardList size={14} className="mr-1" />
                {expandedPreparations ? (
                  <>
                    <IconChevronUp size={14} className="mr-1" />
                    Preparations ({item.preparations.filter(p => p.isCompleted).length}/{item.preparations.length})
                  </>
                ) : (
                  <>
                    <IconChevronDown size={14} className="mr-1" />
                    Preparations ({item.preparations.filter(p => p.isCompleted).length}/{item.preparations.length})
                  </>
                )}
              </div>
              
              {expandedPreparations && (
                <div className={`mt-1.5 p-2 ${styles.container} rounded border`}>
                  <div className="space-y-2">
                    {item.preparations.map((prep: IPreparation) => (
                      <div key={prep.id} className="flex items-center gap-2">
                        <button
                          type="button"
                          className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                            prep.isCompleted 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreparationCheckboxChange(prep.id, !prep.isCompleted);
                          }}
                        >
                          {prep.isCompleted && <IconCheck size={10} />}
                        </button>
                        <span className={`text-xs ${styles.title} ${prep.isCompleted ? 'line-through opacity-60' : ''}`}>
                          {prep.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        {item.type === "CUSTOM" && !isReadOnly && (onEditCustomItem || onDeleteCustomItem) && (
          <div className="flex flex-col items-end space-y-1">
            {onEditCustomItem && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditCustomItem(item);
                }}
                className="text-xs font-medium text-amber-600 hover:text-amber-800 bg-amber-100 px-2 py-0.5 rounded"
              >
                Edit
              </button>
            )}
            {onDeleteCustomItem && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteCustomItem(item.id);
                }}
                className="text-xs font-medium text-red-600 hover:text-red-800 bg-red-100 px-2 py-0.5 rounded"
              >
                Delete
              </button>
            )}
          </div>
        )}
        {item.isReserve && (
          <div className="flex flex-col items-end space-y-1">
            <Tooltip tooltipText="Material in Reserve">
              <div className="flex items-center justify-center w-4 h-4 bg-gray-600 text-gray-100 font-bold text-xs rounded-full">
                R
              </div>
            </Tooltip>
          </div>
        )}
        {item.type !== "CUSTOM" && !isReadOnly && onEditItem && (
          <div className="flex flex-col items-end space-y-1">
            {onEditItem && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditItem(item);
                }}
                className="text-xs font-medium text-amber-600 hover:text-amber-800 bg-amber-100 px-2 py-0.5 rounded"
              >
                Edit
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (isReadOnly) {
    return (
      <div key={`${item.id}-${index}`}>
        {content}
      </div>
    );
  }

  return (
    <Draggable
      key={`${item.id}-${index}`}
      draggableId={`${item.id}-${index}`}
      index={index}
    >
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={provided.draggableProps.style}
        >
          {content}
        </div>
      )}
    </Draggable>
  );
};

export default PlanItem;
