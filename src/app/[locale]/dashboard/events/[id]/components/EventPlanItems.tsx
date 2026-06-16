"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { DragDropContext, DropResult, DragStart, DragUpdate } from "@hello-pangea/dnd";
import { TMaterial, TMaterialType, TMaterialWithType } from "@/types/Materials";
import { Text } from "@/components/typo/Text";
import { toast } from "react-hot-toast";
import CustomItemModal from "./CustomItemModal";
import { Session } from "next-auth";
import { useOrganization } from "@/components/contexts/OrganizationContext";
import { userInOrganizationData } from "@/utils/permissions";
import { EventWithPlanItems } from "@/types/Event";
import HeaderControls from "./HeaderControls";
import MaterialsColumn from "./MaterialsColumn";
import PlanItemsColumn from "./PlanItemsColumn";
import ReadOnlyView from "./ReadOnlyView";
import { IPlanItem } from "@/types/PlanItem";
import ItemModal from "./ItemModal";
import ScheduleCalendar, { IScheduleChange } from "./ScheduleCalendar";
import { getEventDays } from "@/utils/eventDays";

interface Columns {
  planItems: IPlanItem[]
  materials: (TMaterialWithType & {isFromPublicLibrary: boolean})[]
}

type TColumn = (IPlanItem | TMaterialWithType)[]

interface IProps {
  event: EventWithPlanItems;
  session: Session;
}

interface SavedItem {
  id: string;
  order: number;
  preparations: Array<{ id: string; order: number }>;
}

// Create constant for the custom plan item type to avoid mismatches
const CUSTOM_PLAN_ITEM_TYPE = "CUSTOM";

const EventPlanItems = ({ event, session }: IProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<TMaterialType | "all">("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [originalOnly, setOriginalOnly] = useState(true);
  const [searchInPublicLibrary, setSearchInPublicLibrary] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showCustomItemModal, setShowCustomItemModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(20); // Fixed page size

  const { selectedOrganization } = useOrganization();

  const { hasEditPermission } = useMemo(() =>
    userInOrganizationData(session?.user?.id ?? '', selectedOrganization),
    [session?.user?.id, selectedOrganization]
  );

  const isSchedule = event.type === "SCHEDULE";
  const scheduleDays = useMemo(
    () => (isSchedule ? getEventDays(event) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isSchedule, event.startTime, event.endTime]
  );

  // Material currently dragged via native HTML5 drag (schedule calendar mode)
  const [draggedMaterial, setDraggedMaterial] = useState<(TMaterialWithType & {isFromPublicLibrary: boolean}) | null>(null);
  // Day/time of the calendar slot clicked to create a new custom item
  const [pendingSlot, setPendingSlot] = useState<IScheduleChange | null>(null);

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

        if (searchInPublicLibrary) {
          params.append("includePublicLibrary", "true");
        }

        // Add pagination parameters
        params.append("page", currentPage.toString());
        params.append("limit", pageSize.toString());

        const response = await fetch(`/api/materials?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch materials');
        }

        const data = await response.json();

        // Update pagination state
        setTotalCount(data.totalCount || 0);
        setTotalPages(data.totalPages || 0);

        // Update columns with the new materials
        setColumns(prev => ({
          ...prev,
          materials: data.materials as (TMaterialWithType  & {isFromPublicLibrary: boolean})[]
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
  }, [selectedType, searchQuery, selectedTags, originalOnly, event.organizationId, searchInPublicLibrary, currentPage, pageSize]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedType, searchQuery, selectedTags, originalOnly, searchInPublicLibrary]);

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
          preparations: item.preparations || [],
          description: item.description,
          dayIndex: item.dayIndex ?? 0,
          startHour: item.startHour,
          startMinute: item.startMinute,
          duration: item.duration
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
        material,
        title: material?.title || "Unknown",
        preparations: item.preparations || [],
        description: item.description,
        isReserve: item.isReserve,
        dayIndex: item.dayIndex ?? 0,
        startHour: item.startHour,
        startMinute: item.startMinute,
        duration: item.duration
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
  // Ref-based guard prevents concurrent auto-saves from racing
  const isSavingRef = useRef(false);

  const onDragStart = (start: DragStart) => {
    // Check if dragging from planItems
    if (start.source.droppableId === "planItems") {
      setIsDraggingRightToLeft(true);
    } else {
      setIsDraggingRightToLeft(false);
    }
  };

  // Add a new onDragUpdate handler to track hover state
  const onDragUpdate = (update: DragUpdate) => {
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
      const sourceMaterials = Array.from(columns.materials);
      const planItems = Array.from(columns.planItems);
      const movedMaterial = sourceMaterials[source.index];
      const tempItemId = `${Date.now()}-${destination.index}`;
      // Add the item to the destination
      planItems.splice(destination.index, 0, {
        materialId: movedMaterial.id,
        material: movedMaterial,
        title: movedMaterial.title,
        type: movedMaterial.type,
        preparations: movedMaterial.preparations ? movedMaterial.preparations.map(p => ({
          id: p.id,
          order: p.order,
          title: p.title,
          isCompleted: false,
          completedAt: null,
          completedBy: null,
          eventPlanItemId: tempItemId,
          createdAt: new Date(),
          updatedAt: new Date(),
        })) : [],
        id: tempItemId,
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
    const sourceItems = Array.from(columns[sourceCol] as TColumn);
    const destItems = sourceCol === destCol ? sourceItems : Array.from(columns[destCol] as TColumn);

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
      description: cleanDescription(item.description) || null,
      preparations: item.preparations || [],
      dayIndex: item.dayIndex ?? 0,
      startHour: item.startHour ?? null,
      startMinute: item.startMinute ?? null,
      duration: item.duration ?? null
    };

    setColumns(prev => ({
      ...prev,
      planItems: [...prev.planItems, newItem]
    }));

    // Close modal
    setShowCustomItemModal(false);
    setPendingSlot(null);
  };

  // Update a plan item's day/time after a calendar drag, resize, or modal edit
  const handleScheduleChange = useCallback((itemId: string, change: IScheduleChange) => {
    setColumns(prev => ({
      ...prev,
      planItems: prev.planItems.map(item =>
        item.id === itemId ? { ...item, ...change } : item
      )
    }));
  }, []);

  // Material dragged from the materials column and dropped on the calendar
  const handleDropMaterial = (change: IScheduleChange) => {
    if (!draggedMaterial) return;
    const movedMaterial = draggedMaterial;
    setDraggedMaterial(null);
    if (usedMaterials.has(movedMaterial.id)) return;

    const tempItemId = `${Date.now()}-schedule`;
    const newItem: IPlanItem = {
      id: tempItemId,
      materialId: movedMaterial.id,
      material: movedMaterial,
      title: movedMaterial.title,
      type: movedMaterial.type,
      preparations: movedMaterial.preparations ? movedMaterial.preparations.map(p => ({
        id: p.id,
        order: p.order,
        title: p.title,
        isCompleted: false,
        completedAt: null,
        completedBy: null,
        eventPlanItemId: tempItemId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })) : [],
      ...change,
    };

    const newUsedMaterials = new Set(usedMaterials);
    newUsedMaterials.add(movedMaterial.id);
    setUsedMaterials(newUsedMaterials);

    setColumns(prev => ({
      ...prev,
      planItems: [...prev.planItems, newItem]
    }));
  };

  // Calendar event clicked: open the matching edit modal
  const handleSelectItem = (item: IPlanItem) => {
    if (item.type === CUSTOM_PLAN_ITEM_TYPE) {
      startEditingCustomItem(item);
    } else {
      startEditingItem(item);
    }
  };

  // Start editing a custom item
  const startEditingCustomItem = (item: IPlanItem) => {
    setEditingItemId(item.id);
    setShowCustomItemModal(true);
  };

  // Start editing a material item
  const startEditingItem = (item: IPlanItem) => {
    setEditingItemId(item.id);
    setShowItemModal(true);
  };

  // Save the edited item
  const saveItem = (updatedItemData: Partial<IPlanItem>) => {
    if (!editingItemId) {
      return;
    }

    // Update existing item
    setColumns(prev => ({
      ...prev,
      planItems: prev.planItems.map(item =>
        item.id === editingItemId
          ? {
              ...item,
              description: cleanDescription(updatedItemData.description),
              isReserve: updatedItemData.isReserve,
              preparations: updatedItemData.preparations || item.preparations,
              ...(updatedItemData.dayIndex !== undefined && {
                dayIndex: updatedItemData.dayIndex,
                startHour: updatedItemData.startHour ?? null,
                startMinute: updatedItemData.startMinute ?? null,
                duration: updatedItemData.duration ?? null,
              }),
            }
          : item
      )
    }));

    // Reset state
    setEditingItemId(null);
    setShowItemModal(false);
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
              description: cleanDescription(updatedItemData.description),
              preparations: updatedItemData.preparations || item.preparations,
              ...(updatedItemData.dayIndex !== undefined && {
                dayIndex: updatedItemData.dayIndex,
                startHour: updatedItemData.startHour ?? null,
                startMinute: updatedItemData.startMinute ?? null,
                duration: updatedItemData.duration ?? null,
              }),
            }
          : item
      )
    }));

    // Reset state
    setEditingItemId(null);
    setShowCustomItemModal(false);
  };

  const updatePreparationCheckbox = (eventId: string, preparationId: string, checked: boolean) => {
    // Update existing item
    setColumns(prev => ({
      ...prev,
      planItems: prev.planItems.map(item => 
        item.id === eventId && item.preparations
          ? { 
              ...item, 
              preparations: item.preparations.map(preparation => 
                preparation.id === preparationId
                  ? { 
                      ...preparation, 
                      isCompleted: checked,
                      completedAt: checked ? new Date() : null,
                      completedBy: checked ? session.user?.email || null : null
                    }
                  : preparation
              )
            }
          : item
      )
    }));
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

  // Helper function to get the correct ID field name
  const getItemIdField = useCallback((materialType: TMaterialType): string => {
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
  }, []);

  // Helper function to clean description from empty HTML tags
  const cleanDescription = useCallback((description: string | null | undefined): string => {
    if (!description) return "";
    
    // Create a temporary DOM element to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = description;
    
    // Get the text content, which removes all HTML tags
    const textContent = tempDiv.textContent || tempDiv.innerText || '';

    if (textContent.trim() === '') {
      return "";
    }
    
    return description;
  }, []);

  const handleSave = useCallback(async () => {
    // Prevent concurrent saves from racing
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    setIsSaving(true);
    setSaveStatus(null);

    try {
      // For schedule events, persist items in day-major, then time order so the
      // global `order` stays meaningful; LIST events keep manual drag order.
      const itemsToSave = isSchedule
        ? [...columns.planItems].sort((a, b) => {
            const dayA = a.dayIndex ?? 0;
            const dayB = b.dayIndex ?? 0;
            if (dayA !== dayB) return dayA - dayB;
            const timeA = a.startHour == null ? -1 : a.startHour * 60 + (a.startMinute ?? 0);
            const timeB = b.startHour == null ? -1 : b.startHour * 60 + (b.startMinute ?? 0);
            return timeA - timeB;
          })
        : columns.planItems;

      // Map plan items to the format expected by the API
      const planItemsData = itemsToSave.map((item, index) => {
        const scheduleFields = {
          dayIndex: item.dayIndex ?? 0,
          startHour: item.startHour ?? null,
          startMinute: item.startMinute ?? null,
          duration: item.duration ?? null,
        };

        // If it's a custom item
        if (item.type === CUSTOM_PLAN_ITEM_TYPE) {
          return {
            id: item.id,
            type: CUSTOM_PLAN_ITEM_TYPE,
            order: index,
            title: item.title,
            description: item.description || "",
            preparations: item.preparations || [],
            eventId: event.id,
            ...scheduleFields,
          };
        }

        // Otherwise it's a material item
        const materialId = item.materialId === null ? "" : item.materialId;
        return {
          id: item.id,
          type: item.type.toUpperCase(),
          order: index,
          title: item.title,
          description: item.description || "",
          isReserve: item.isReserve || false,
          preparations: item.preparations || [],
          [getItemIdField(item.type as TMaterialType)]: materialId,
          eventId: event.id,
          ...scheduleFields,
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

      const savedItems: SavedItem[] = await response.json();

      if (!response.ok) {
        throw new Error('Failed to save plan items');
      }

      // Promote server-assigned IDs back into local state.
      // itemsToSave[i] was sent as order=i; savedItems is returned sorted by order,
      // so savedItems[i] corresponds to itemsToSave[i].
      const localIdToServerId = new Map(
        itemsToSave.map((item, i) => [item.id, savedItems[i]?.id])
      );
      setColumns(prev => ({
        ...prev,
        planItems: prev.planItems.map(item => ({
          ...item,
          id: localIdToServerId.get(item.id) ?? item.id,
        })),
      }));

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
      isSavingRef.current = false;
      setIsSaving(false);
    }
  }, [columns.planItems, event.id, getItemIdField, isSchedule]);

  // Auto-save when planItems change (debounced)
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    // Only auto-save for users with edit permissions
    if (!hasEditPermission) return;

    // Skip auto-saving on the initial render
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    // Clear any pending save
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Debounce save to reduce requests during rapid changes
    autoSaveTimeoutRef.current = setTimeout(() => {
      void handleSave();
    }, 800);

    // Cleanup on dependency change/unmount
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [columns.planItems, hasEditPermission, handleSave]);

  

  if (!selectedOrganization) {
    return (
      <div className="flex h-full items-center justify-center">
        <Text className="text-muted-foreground">Select Organization</Text>
      </div>
    );
  }

  if (!hasEditPermission) {
    return (
      <ReadOnlyView
        planItems={columns.planItems}
        expandedDescriptions={expandedDescriptions}
        onToggleDescription={toggleDescriptionExpansion}
        event={event}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 mt-2">
      <HeaderControls
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        originalOnly={originalOnly}
        setOriginalOnly={setOriginalOnly}
        organizationId={event.organizationId}
        onAddCustomItem={() => setShowCustomItemModal(true)}
        searchInPublicLibrary={searchInPublicLibrary}
        setSearchInPublicLibrary={setSearchInPublicLibrary}
        isSaving={isSaving}
        saveStatus={saveStatus}
      />

      {/* Main Content */}
      {isSchedule ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <MaterialsColumn
            materials={columns.materials}
            usedMaterials={usedMaterials}
            isLoading={isLoading}
            hoveredMaterialId={null}
            isDraggingRightToLeft={false}
            isDraggingFromRight={false}
            currentPage={currentPage}
            totalCount={totalCount}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            nativeDragMode
            onNativeDragStart={setDraggedMaterial}
            onNativeDragEnd={() => setDraggedMaterial(null)}
          />

          <div className="lg:col-span-2">
            <ScheduleCalendar
              eventRange={event}
              planItems={columns.planItems}
              hasDraggedMaterial={!!draggedMaterial}
              draggedMaterialTitle={draggedMaterial?.title}
              onScheduleChange={handleScheduleChange}
              onDropMaterial={handleDropMaterial}
              onSelectSlot={(change) => {
                setPendingSlot(change);
                setShowCustomItemModal(true);
              }}
              onSelectItem={handleSelectItem}
            />
          </div>
        </div>
      ) : (
        <DragDropContext
          onDragStart={onDragStart}
          onDragUpdate={onDragUpdate}
          onDragEnd={onDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MaterialsColumn
              materials={columns.materials}
              usedMaterials={usedMaterials}
              isLoading={isLoading}
              hoveredMaterialId={hoveredMaterialId}
              isDraggingRightToLeft={isDraggingRightToLeft}
              isDraggingFromRight={isDraggingFromRight}
              currentPage={currentPage}
              totalCount={totalCount}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />

            <PlanItemsColumn
              planItems={columns.planItems}
              expandedDescriptions={expandedDescriptions}
              onToggleDescription={toggleDescriptionExpansion}
              onEditCustomItem={startEditingCustomItem}
              onEditItem={startEditingItem}
              onDeleteCustomItem={deleteCustomItem}
              updatePreparationCheckbox={updatePreparationCheckbox}
            />
          </div>
        </DragDropContext>
      )}

      {/* Custom Item Modal */}
      <CustomItemModal
        isOpen={showCustomItemModal}
        onClose={() => {
          setShowCustomItemModal(false);
          setEditingItemId(null);
          setPendingSlot(null);
        }}
        onSave={saveCustomItem}
        onDelete={deleteCustomItem}
        editingItem={editingItemId ? columns.planItems.find(item => item.id === editingItemId) || null : null}
        isEditing={!!editingItemId}
        scheduleDays={scheduleDays}
        defaultSchedule={pendingSlot}
      />

      {/* Item Modal */}
      <ItemModal
        isOpen={showItemModal}
        onClose={() => {
          setShowItemModal(false);
          setEditingItemId(null);
        }}
        onSave={saveItem}
        editingItem={editingItemId ? columns.planItems.find(item => item.id === editingItemId) || null : null}
        scheduleDays={scheduleDays}
      />
    </div>
  );
};

export default EventPlanItems;
