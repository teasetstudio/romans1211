interface SaveStatus {
  message: string;
  isError: boolean;
}

interface SaveControlsProps {
  onSave: () => void;
  isSaving: boolean;
  saveStatus: SaveStatus | null;
}

const SaveControls = ({ onSave, isSaving, saveStatus }: SaveControlsProps) => {
  return (
    <>
      {/* Save status message */}
      {saveStatus && (
        <div
          className={`mt-3 p-2 rounded text-sm border text-center ${
            saveStatus.isError 
              ? "bg-red-50 text-red-700 border-red-200" 
              : "bg-indigo-50 text-indigo-700 border-indigo-200"
          }`}
        >
          {saveStatus.message}
        </div>
      )}

      {/* Save button */}
      <div className="mt-4 text-center">
        <button
          onClick={onSave}
          disabled={isSaving}
          className="inline-flex items-center justify-center px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 active:bg-indigo-800 shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600 min-w-[120px]"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white/100 mr-2"></div>
              Saving...
            </>
          ) : (
            "Save Plan"
          )}
        </button>
      </div>
    </>
  );
};

export default SaveControls;
