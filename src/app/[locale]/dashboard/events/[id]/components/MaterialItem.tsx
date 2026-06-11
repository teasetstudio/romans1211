import { Draggable } from "@hello-pangea/dnd";
import { TMaterialWithType } from "@/types/Materials";

interface MaterialItemProps {
  item: TMaterialWithType & {isFromPublicLibrary: boolean};
  index: number;
  isUsed: boolean;
  isHovered: boolean;
  isDraggingRightToLeft: boolean;
  isDraggingFromRight: boolean;
  onItemClick?: (item: TMaterialWithType & {isFromPublicLibrary: boolean}) => void;
  // Native HTML5 drag mode (used by the schedule calendar, which can't consume
  // @hello-pangea/dnd pointer drags)
  nativeDragMode?: boolean;
  onNativeDragStart?: (item: TMaterialWithType & {isFromPublicLibrary: boolean}) => void;
  onNativeDragEnd?: () => void;
}

const MaterialItem = ({
  item,
  index,
  isUsed,
  isHovered,
  isDraggingRightToLeft,
  isDraggingFromRight,
  onItemClick,
  nativeDragMode = false,
  onNativeDragStart,
  onNativeDragEnd,
}: MaterialItemProps) => {

  const handleClick = (e: React.MouseEvent) => {
    // Don't trigger click if dragging or if item is used
    if (e.defaultPrevented || isUsed) return;
    onItemClick?.(item);
  };

  const containerClassName = `p-2 mb-2 rounded-lg border ${
    item.type === 'song'
      ? 'bg-purple-50 border-purple-100 hover:border-purple-200'
      : item.type === 'text'
      ? 'bg-blue-50 border-blue-100 hover:border-blue-200'
      : 'bg-green-50 border-green-100 hover:border-green-200'
  } ${
    isUsed ? 'opacity-50' : 'cursor-pointer'
  }`;

  const innerContent = (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${
            item.type === 'song'
              ? 'text-purple-900'
              : item.type === 'text'
              ? 'text-blue-900'
              : 'text-green-900'
          }`}>{item.title}</span>
          {item.isFromPublicLibrary && (
            <span className="text-xs font-medium text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">
              Public
            </span>
          )}
        </div>
        <div className={`text-xs mt-0.5 ${
          item.type === 'song'
            ? 'text-purple-600'
            : item.type === 'text'
            ? 'text-blue-600'
            : 'text-green-600'
        }`}>
          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
        </div>
      </div>
      {isUsed && (
        <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded">
          Used
        </span>
      )}
    </div>
  );

  if (nativeDragMode) {
    return (
      <div
        draggable={!isUsed}
        onDragStart={(e) => {
          e.dataTransfer.setData("text/plain", item.id);
          e.dataTransfer.effectAllowed = "copy";
          onNativeDragStart?.(item);
        }}
        onDragEnd={() => onNativeDragEnd?.()}
        onClick={handleClick}
        className={`${containerClassName} ${!isUsed ? 'cursor-grab active:cursor-grabbing' : ''}`}
      >
        {innerContent}
      </div>
    );
  }

  return (
    <Draggable
      key={item.id}
      draggableId={item.id}
      index={index}
      isDragDisabled={isUsed}
    >
      {(provided, snapshot) => (
        <div style={{ position: "relative" }}>
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...(!isUsed && provided.dragHandleProps)}
            className={containerClassName}
            onClick={handleClick}
            style={{
              background: isHovered && isDraggingRightToLeft
                ? "#ffebeb"
                : undefined,
              ...(isDraggingRightToLeft ? {} : provided.draggableProps.style),
            }}
          >
            {innerContent}
          </div>
          {snapshot.isDragging && isDraggingFromRight && (
            <div
              className="bg-gray-100 rounded-lg pointer-events-none p-2 mb-2"
            >
              {item.title}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default MaterialItem;
