import PlanItem from "./PlanItem";
import { IPlanItem } from "@/types/PlanItem";

interface ReadOnlyViewProps {
  planItems: IPlanItem[];
  expandedDescriptions: Set<string>;
  onToggleDescription: (itemId: string, e: React.MouseEvent) => void;
}

const ReadOnlyView = ({ 
  planItems, 
  expandedDescriptions, 
  onToggleDescription 
}: ReadOnlyViewProps) => {
  if (planItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 mt-2">
        <div className="bg-white rounded-lg shadow-sm p-3">
          <h3 className="text-lg font-medium mb-3">Event Plan</h3>
          <div className="space-y-2">
            <p>No plan items</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 mt-2">
      <div className="bg-white rounded-lg shadow-sm p-3">
        <h3 className="text-lg font-medium mb-3">Event Plan</h3>
        <div className="space-y-2">
          {planItems.map((item, index) => (
            <PlanItem
              key={`${item.id}-${index}`}
              item={item}
              index={index}
              expandedDescriptions={expandedDescriptions}
              onToggleDescription={onToggleDescription}
              isReadOnly={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReadOnlyView;
