import EventPlanItemsFilter from "./EventPlanItemsFilter";
import { TMaterialType } from "@/types/Materials";

interface HeaderControlsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedType: TMaterialType | "all";
  setSelectedType: (type: TMaterialType | "all") => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  originalOnly: boolean;
  setOriginalOnly: (originalOnly: boolean) => void;
  organizationId: string;
  onAddCustomItem: () => void;
  searchInPublicLibrary: boolean;
  setSearchInPublicLibrary: (searchInPublicLibrary: boolean) => void;
}

const HeaderControls = ({
  searchQuery,
  setSearchQuery,
  selectedType,
  setSelectedType,
  selectedTags,
  setSelectedTags,
  originalOnly,
  setOriginalOnly,
  organizationId,
  onAddCustomItem,
  searchInPublicLibrary,
  setSearchInPublicLibrary
}: HeaderControlsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      {/* Filter Column */}
      <div className="bg-white rounded-lg shadow-sm p-3">
        <EventPlanItemsFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          originalOnly={originalOnly}
          setOriginalOnly={setOriginalOnly}
          organizationId={organizationId}
          searchInPublicLibrary={searchInPublicLibrary}
          setSearchInPublicLibrary={setSearchInPublicLibrary}
        />
      </div>

      {/* Add Custom Item Column */}
      <div className="bg-white rounded-lg shadow-sm p-3 flex items-center">
        <button
          onClick={onAddCustomItem}
          className="w-full px-4 py-2 text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 hover:border-indigo-200 transition-all duration-200 text-sm font-medium"
        >
          + Add Custom Item
        </button>
      </div>
    </div>
  );
};

export default HeaderControls;
