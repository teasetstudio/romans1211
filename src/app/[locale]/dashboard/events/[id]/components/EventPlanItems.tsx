"use client"

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { TMaterial, TMaterialType } from "@/types/Materials";
import { Event, EventPlanItem } from "@prisma/client";
import { IconSearch, IconFilter } from '@tabler/icons-react';
import { toast } from "react-hot-toast";

// Extend the Event type to include eventPlanItems
interface EventWithPlanItems extends Event {
  eventPlanItems: EventPlanItem[];
}

interface IMaterialItem {
  id: string
  title: string
  type: TMaterialType
  tags?: { name: string }[]
  originalId: string | null
}

interface IPlanItem {
  id: string
  title: string
  type: TMaterialType
  materialId: string
}

interface Columns {
  planItems: IPlanItem[]
  materials: IMaterialItem[]
}

interface IProps {
  event: EventWithPlanItems;
}

interface SaveResponse {
  success: boolean;
  message: string;
}

const EventPlanItems = ({ event }: IProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<TMaterialType | "all">("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [originalOnly, setOriginalOnly] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [materials, setMaterials] = useState<IMaterialItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allTags, setAllTags] = useState<string[]>([]);

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const params = new URLSearchParams();
        params.append("organizationId", event.organizationId);
        params.append("originalOnly", "true");

        const response = await fetch(`/api/materials?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch materials');
        }

        const data = await response.json();
        setMaterials(data.materials);
        
        // Extract unique tags from all materials
        const uniqueTags = Array.from(new Set(
          data.materials.flatMap((material: IMaterialItem) => 
            material.tags?.map((tag: { name: string }) => tag.name) || []
          )
        )).sort() as string[];
        setAllTags(uniqueTags);

        // Update columns with the materials
        setColumns(prev => ({
          ...prev,
          materials: data.materials as IMaterialItem[]
        }));
      } catch (error) {
        console.error('Error fetching initial materials:', error);
        toast.error('Failed to fetch materials');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [event.organizationId]);

  // Fetch materials when filters change
  useEffect(() => {
    const fetchMaterials = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        
        // Add type filter if not "all"
        if (selectedType !== "all") {
          params.append("type", selectedType);
        }
        
        // Add search term if exists
        if (searchQuery) {
          params.append("searchTerm", searchQuery);
        }
        
        // Add tags if selected
        selectedTags.forEach(tag => {
          params.append("tags", tag);
        });
        
        // Add original only filter
        if (originalOnly) {
          params.append("originalOnly", "true");
        }

        // Add organization ID
        params.append("organizationId", event.organizationId);

        const response = await fetch(`/api/materials?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch materials');
        }

        const data = await response.json();
        setMaterials(data.materials);
        
        // Update columns with the new materials
        setColumns(prev => ({
          ...prev,
          materials: data.materials as IMaterialItem[]
        }));
      } catch (error) {
        console.error('Error fetching materials:', error);
        toast.error('Failed to fetch materials');
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the fetch to avoid too many requests
    const timeoutId = setTimeout(fetchMaterials, 300);
    return () => clearTimeout(timeoutId);
  }, [selectedType, searchQuery, selectedTags, originalOnly, event.organizationId]);

  // Update columns with materials from API
  const [columns, setColumns] = useState<Columns>({
    planItems: event.eventPlanItems.map(item => {
      const type = item.type.toLowerCase() as TMaterialType
      // @ts-ignore
      const material = item[type] as unknown as TMaterial
      const materialId = material.id
      return {
        id: item.id,
        type,
        materialId,
        title: material.title,
      }
    }),
    materials: [],
  });

  // Track which materials have been used
  const [usedMaterials, setUsedMaterials] = useState<Set<string>>(new Set(
    event.eventPlanItems.map(item => {
      const type = item.type.toLowerCase() as TMaterialType
      // @ts-ignore
      const material = item[type] as unknown as TMaterial
      return material.id
    })
  ));

  // Track if we're currently dragging from right to left (for visual feedback)
  const [isDraggingRightToLeft, setIsDraggingRightToLeft] = useState(false);
  const [isDraggingFromRight, setIsDraggingFromRight] = useState(false);

  // Track which material item is being hovered over
  const [hoveredMaterialId, setHoveredMaterialId] = useState<string | null>(null);

  // Add new state for save status
  const [saveStatus, setSaveStatus] = useState<{
    message: string;
    isError: boolean;
  } | null>(null);

  // Add new state for loading
  const [isSaving, setIsSaving] = useState(false);

  const onDragStart = (start: any) => {
    // Check if dragging from planItems
    if (start.source.droppableId === "planItems") {
      setIsDraggingRightToLeft(true);
    } else {
      setIsDraggingRightToLeft(false);
    }
  };

  // Add a new onDragUpdate handler to track hover state
  const onDragUpdate = (update: any) => {
    if (update.destination && update.destination.droppableId !== "materials" && update.source.droppableId === "materials") {
      setIsDraggingFromRight(true);
    } else {
      setIsDraggingFromRight(false);
    }


    // Handle From Right to Left
    if (!isDraggingRightToLeft || !update.destination) {
      setHoveredMaterialId(null);
    } else {
      if (update.destination.droppableId === "materials" && update.source.droppableId === "planItems") {
        // Get the item at the destination index
        const itemAtIndex = columns.materials[update.destination.index];
        setHoveredMaterialId(itemAtIndex ? itemAtIndex.id : 'NO_ITEM');
      } else {
        setHoveredMaterialId(null);
      }
    }
  };

  const onDragEnd = (result: DropResult) => {
    // Reset states
    setIsDraggingRightToLeft(false);
    setHoveredMaterialId(null);
    
    const { source, destination } = result;
    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    type ColumnsKeys = keyof Columns

    const sourceCol = source.droppableId as ColumnsKeys;
    const destCol = destination.droppableId as ColumnsKeys;

    // If dragging from materials to planItems, create a copy instead of moving
    if (sourceCol === "materials" && destCol === "planItems") {
      console.log('from right')
      const sourceMaterials = Array.from(columns.materials);
      const planItems = Array.from(columns.planItems);
      const movedMaterial = sourceMaterials[source.index];
      
      // Add the item to the destination
      planItems.splice(destination.index, 0, {
        materialId: movedMaterial.id,
        title: movedMaterial.title,
        type: movedMaterial.type,
        id: `${movedMaterial}-${destination.index}`
      });
      
      // Mark the item as used
      const newUsedMaterials = new Set(usedMaterials);
      newUsedMaterials.add(movedMaterial.id);
      setUsedMaterials(newUsedMaterials);
      
      setColumns({
        ...columns,
        planItems,
      });
      return;
    }
    
    // If dragging from planItems to materials, remove it from planItems and mark as unused
    if (sourceCol === "planItems" && destCol === "materials") {
      const planItems = Array.from(columns.planItems);
      const removedItem = planItems[source.index];
      
      // Remove the item from the source column
      planItems.splice(source.index, 1);
      
      // Remove the item from usedMaterials
      const newUsedMaterials = new Set(usedMaterials);
      newUsedMaterials.delete(removedItem.materialId);
      setUsedMaterials(newUsedMaterials);
      
      setColumns({
        ...columns,
        planItems,
      });
      return;
    }

    // For other cases (within the same column), use the original logic
    const sourceItems = Array.from(columns[sourceCol] as any);
    const destItems = sourceCol === destCol ? sourceItems : Array.from(columns[destCol] as any);

    const [movedItem] = sourceItems.splice(source.index, 1);
    destItems.splice(destination.index, 0, movedItem);

    setColumns({
      ...columns,
      [sourceCol]: sourceItems,
      [destCol]: destItems,
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    try {
      // Map plan items to the format expected by the API
      const planItemsData = columns.planItems.map((item, index) => ({
        type: item.type,
        order: index,
        title: item.title,
        [getItemIdField(item.type)]: item.materialId,
        eventId: event.id,
      }));

      const response = await fetch('/api/event-plan-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planItems: planItemsData,
          eventId: event.id,
        }),
      });

      const data: SaveResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save plan items');
      }

      setSaveStatus({
        message: 'Plan items saved successfully!',
        isError: false,
      });
    } catch (error) {
      setSaveStatus({
        message: error instanceof Error ? error.message : 'An error occurred while saving',
        isError: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to get the correct ID field name
  const getItemIdField = (materialType: TMaterialType): string => {
    switch (materialType.toLowerCase()) {
      case 'text':
        return 'textId';
      case 'song':
        return 'songId';
      case 'game':
        return 'gameId';
      default:
        return 'textId';
    }
  };

  return (
    <div>
      {/* Add filter UI */}
      <div className="mb-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <IconSearch size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                  if (input) {
                    input.blur();
                  }
                }
              }}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              onClick={() => {
                const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                if (input) {
                  input.blur();
                }
              }}
              className="px-3 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Enter
            </button>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <IconFilter size={20} className="text-gray-400" />
            <span>Filters</span>
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Material Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as TMaterialType | "all")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Types</option>
                <option value="song">Songs</option>
                <option value="text">Texts</option>
                <option value="game">Games</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                {allTags.map((tag) => (
                  <label key={tag} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTags([...selectedTags, tag]);
                        } else {
                          setSelectedTags(selectedTags.filter(t => t !== tag));
                        }
                      }}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{tag}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Original Only
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={originalOnly}
                  onChange={(e) => setOriginalOnly(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Show only original materials</span>
              </label>
            </div>
          </div>
        )}
      </div>

      <DragDropContext 
        onDragStart={onDragStart} 
        onDragUpdate={onDragUpdate}
        onDragEnd={onDragEnd}
      >
        <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
          {/* MATERIALS */}
          <Droppable 
            droppableId="materials"
            isDropDisabled={false}
          >
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    width: "200px",
                    minHeight: "300px",
                    padding: "10px",
                    background: "#f0f0f0",
                    borderRadius: "8px",
                    border: isDraggingRightToLeft && snapshot.isDraggingOver ?
                      "2px dashed #ff6b6b" : "2px solid transparent",
                  }}
                >
                  <h3>Available Materials:</h3>
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : (
                    columns.materials.map((item, index) => (
                      <Draggable
                        key={item.id}
                        draggableId={item.id}
                        index={index}
                        isDragDisabled={usedMaterials.has(item.id)}
                      >
                        {(provided, snapshot) => (
                          <div style={{ position: "relative" }}>
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...(!usedMaterials.has(item.id) && provided.dragHandleProps)}
                              style={{
                                padding: "10px",
                                margin: "5px 0",
                                background: hoveredMaterialId === item.id && isDraggingRightToLeft
                                  ? "#ffebeb" // Light red highlight when hovered
                                  : "white",
                                borderRadius: "4px",
                                boxShadow: hoveredMaterialId === item.id && isDraggingRightToLeft
                                  ? "0 0 0 2px #ff6b6b" // Red border when hovered
                                  : "0 2px 5px rgba(0,0,0,0.2)",
                                opacity: usedMaterials.has(item.id) ? 0.5 : 1,
                                ...(isDraggingRightToLeft ? {} : provided.draggableProps.style),
                              }}
                            >
                              {item.title}
                              {usedMaterials.has(item.id) && (
                                <span style={{
                                  marginLeft: "8px",
                                  color: "green",
                                  fontSize: "12px"
                                }}>
                                  ✓ Used
                                </span>
                              )}
                            </div>
                            {snapshot.isDragging && isDraggingFromRight &&  (
                              <div
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  background: "white",
                                  borderRadius: "4px",
                                  boxShadow: "0 0 10px rgba(0,0,0,0.2)",
                                  opacity: 1,
                                  pointerEvents: "none",
                                }}
                              >
                                {item.title}
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {/* PLAN ITEMS */}
            <Droppable droppableId="planItems">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    width: "200px",
                    minHeight: "300px",
                    padding: "10px",
                    background: "#f0f0f0",
                    borderRadius: "8px",
                  }}
                >
                  <h3>Event Plan:</h3>
                  {columns.planItems.map((item, index) => (
                    <Draggable
                      key={`${item.id}-${index}`}
                      draggableId={`${item.id}-${index}`}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            padding: "10px",
                            margin: "5px 0",
                            background: "white",
                            borderRadius: "4px",
                            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                            ...provided.draggableProps.style,
                          }}
                        >
                          {item.title}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
        </div>
      </DragDropContext>

      {/* Add save button and status message */}
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: isSaving ? "not-allowed" : "pointer",
            opacity: isSaving ? 0.7 : 1,
          }}
        >
          {isSaving ? "Saving..." : "Save Plan"}
        </button>

        {saveStatus && (
          <div
            style={{
              marginTop: "10px",
              padding: "10px",
              borderRadius: "4px",
              backgroundColor: saveStatus.isError ? "#ffebee" : "#e8f5e9",
              color: saveStatus.isError ? "#c62828" : "#2e7d32",
            }}
          >
            {saveStatus.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventPlanItems;
