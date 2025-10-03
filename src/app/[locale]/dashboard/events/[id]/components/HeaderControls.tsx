import EventPlanItemsFilter from "./EventPlanItemsFilter";
import { TMaterialType } from "@/types/Materials";

interface SaveStatus {
  message: string;
  isError: boolean;
}

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
  isSaving: boolean;
  saveStatus: SaveStatus | null;
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
  setSearchInPublicLibrary,
  isSaving,
  saveStatus
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

      {/* Add Custom Item & Save Controls Column */}
      <div className="bg-white rounded-lg shadow-sm p-3 flex flex-col gap-3">
        
        {/* Save status display */}
        {(isSaving || saveStatus) && (
          <div className="flex items-center gap-2 text-xs">
            {isSaving ? (
              <>
                <div className="w-3 h-3 border border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                <span className="text-gray-600">Saving</span>
              </>
            ) : (
              <>
                <div className={`w-2 h-2 rounded-full ${
                  saveStatus?.isError ? "bg-red-400" : "bg-green-400"
                }`}></div>
                <span className={`${
                  saveStatus?.isError ? "text-red-600" : "text-green-600"
                }`}>
                  {saveStatus?.isError ? saveStatus?.message : "Saved"}
                </span>
              </>
            )}
          </div>
        )}

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
