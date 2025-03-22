"use client"

import { useState, useEffect, useRef } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { TMaterial, TMaterialType } from "@/types/Materials";
import { Event, EventPlanItem } from "@prisma/client";
import { toast } from "react-hot-toast";
import EventPlanItemsFilter from "./EventPlanItemsFilter";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import CustomItemModal from "./CustomItemModal";

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
  type: TMaterialType | "CUSTOM"
  materialId: string | null
  description?: string | null
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

// Create constant for the custom plan item type to avoid mismatches
const CUSTOM_PLAN_ITEM_TYPE = "CUSTOM";

const EventPlanItems = ({ event }: IProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<TMaterialType | "all">("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [originalOnly, setOriginalOnly] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [showCustomItemModal, setShowCustomItemModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());

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
        console.log('fetched data', data)

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
      // Use a type assertion here
      if ((item.type as string) === CUSTOM_PLAN_ITEM_TYPE) {
        return {
          id: item.id,
          type: CUSTOM_PLAN_ITEM_TYPE,
          materialId: null,
          title: item.title || "Custom Item",
          description: item.description
        }
      }

      const type = item.type.toLowerCase() as TMaterialType
      // @ts-ignore
      const material = item[type] as unknown as TMaterial
      const materialId = material?.id || ""
      return {
        id: item.id,
        type,
        materialId,
        title: material?.title || "Unknown",
      }
    }),
    materials: [],
  });

  // Track which materials have been used
  const [usedMaterials, setUsedMaterials] = useState<Set<string>>(new Set(
    event.eventPlanItems
      .filter(item => {
        // Skip CUSTOM items or items without a proper type
        if ((item.type as string) === CUSTOM_PLAN_ITEM_TYPE) return false;

        const type = item.type.toLowerCase() as TMaterialType;
        // @ts-ignore
        const material = item[type] as unknown as TMaterial;
        return material != null; // Only include items with valid materials
      })
      .map(item => {
        const type = item.type.toLowerCase() as TMaterialType;
        // @ts-ignore
        const material = item[type] as unknown as TMaterial;
        return material.id;
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
      newUsedMaterials.delete(removedItem.materialId || "");
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

  // Add a new custom plan item
  const addCustomPlanItem = (item: Partial<IPlanItem>) => {
    const newItem: IPlanItem = {
      id: `custom-${Date.now()}`,
      title: item.title || "",
      type: CUSTOM_PLAN_ITEM_TYPE,
      materialId: null,
      description: item.description || null
    };
    
    setColumns(prev => ({
      ...prev,
      planItems: [...prev.planItems, newItem]
    }));
    
    // Close modal
    setShowCustomItemModal(false);
  };

  // Start editing a custom item
  const startEditingCustomItem = (item: IPlanItem) => {
    setEditingItemId(item.id);
    setShowCustomItemModal(true);
  };

  // Save the edited custom item
  const saveCustomItem = (updatedItemData: Partial<IPlanItem>) => {
    if (!editingItemId) {
      // Add new item
      addCustomPlanItem(updatedItemData);
      return;
    }
    
    // Update existing item
    setColumns(prev => ({
      ...prev,
      planItems: prev.planItems.map(item => 
        item.id === editingItemId
          ? { 
              ...item, 
              title: updatedItemData.title || item.title,
              description: updatedItemData.description 
            }
          : item
      )
    }));
    
    // Reset state
    setEditingItemId(null);
    setShowCustomItemModal(false);
  };

  // Delete a custom plan item
  const deleteCustomItem = (itemId: string) => {
    // Remove the item from the columns.planItems
    setColumns(prev => ({
      ...prev,
      planItems: prev.planItems.filter(item => item.id !== itemId)
    }));
    
    // Reset state and close modal
    setEditingItemId(null);
    setShowCustomItemModal(false);
    
    // Show success notification
    toast.success("Custom item deleted");
  };

  // Toggle description expansion
  const toggleDescriptionExpansion = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedDescriptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    try {
      // Map plan items to the format expected by the API
      const planItemsData = columns.planItems.map((item, index) => {
        // If it's a custom item
        if (item.type === CUSTOM_PLAN_ITEM_TYPE) {
          return {
            // Use a type assertion here
            type: CUSTOM_PLAN_ITEM_TYPE as any,
            order: index,
            title: item.title,
            description: item.description || "",
            eventId: event.id,
          };
        }
        
        // Otherwise it's a material item
        const materialId = item.materialId === null ? "" : item.materialId;
        return {
          // Use a type assertion here
          type: item.type.toUpperCase() as any,
          order: index,
          title: item.title,
          // Use the string materialId
          [getItemIdField(item.type as TMaterialType)]: materialId,
          eventId: event.id,
        };
      });

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
      {/* Filter UI Component */}
      <EventPlanItemsFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        originalOnly={originalOnly}
        setOriginalOnly={setOriginalOnly}
        allTags={allTags}
        organizationId={event.organizationId}
      />

      {/* Add Custom Item Button */}
      <div className="mb-6 flex justify-center">
        <button
          onClick={() => setShowCustomItemModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          + Add Custom Item
        </button>
      </div>

      {/* Custom Item Modal */}
      <CustomItemModal
        isOpen={showCustomItemModal}
        onClose={() => {
          setShowCustomItemModal(false);
          setEditingItemId(null);
        }}
        onSave={saveCustomItem}
        onDelete={deleteCustomItem}
        editingItem={editingItemId ? columns.planItems.find(item => item.id === editingItemId) || null : null}
        isEditing={!!editingItemId}
      />

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
                    width: "300px", // Wider to accommodate HTML content
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
                            background: item.type === "CUSTOM" ? "#e6f7ff" : "white",
                            borderRadius: "4px",
                            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                            ...provided.draggableProps.style,
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium">{item.title}</div>
                              {item.type === "CUSTOM" && item.description && (
                                <div className="mt-1">
                                  <div 
                                    className="flex items-center text-xs text-indigo-600 cursor-pointer mb-1 hover:text-indigo-800"
                                    onClick={(e) => toggleDescriptionExpansion(item.id, e)}
                                  >
                                    {expandedDescriptions.has(item.id) ? (
                                      <>
                                        <IconChevronUp size={14} className="mr-1" />
                                        <span>Hide description</span>
                                      </>
                                    ) : (
                                      <>
                                        <IconChevronDown size={14} className="mr-1" />
                                        <span>Show description</span>
                                      </>
                                    )}
                                  </div>
                                  
                                  {expandedDescriptions.has(item.id) && (
                                    <div 
                                      className="text-xs text-gray-600 max-h-40 overflow-y-auto p-2 bg-white rounded border border-gray-100"
                                      dangerouslySetInnerHTML={{ __html: item.description || "" }}
                                    />
                                  )}
                                </div>
                              )}
                              {item.type !== "CUSTOM" && (
                                <div className="text-xs mt-1 text-gray-500">
                                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                                </div>
                              )}
                            </div>
                            {item.type === "CUSTOM" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEditingCustomItem(item);
                                }}
                                className="ml-2 p-1 text-indigo-600 hover:text-indigo-800 text-xs"
                              >
                                Edit
                              </button>
                            )}
                          </div>
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
