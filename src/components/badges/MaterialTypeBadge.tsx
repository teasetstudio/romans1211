import { IconMusic, IconText, IconGame, IconEdit } from '@/res/icons';
import clsx from 'clsx';
import { useState } from 'react';
import MaterialTypeChangeModal from '@/components/popups/MaterialTypeChangeModal';

type MaterialType = 'text' | 'song' | 'game';

interface MaterialTypeBadgeProps {
  type: MaterialType;
  className?: string;
  isEditable?: boolean;
  materialId?: string;
  onTypeChange?: (newMaterialId: string, newType: MaterialType) => void;
}

export default function MaterialTypeBadge({ type, className, isEditable = false, materialId, onTypeChange }: MaterialTypeBadgeProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const getTypeConfig = (type: MaterialType) => {
    switch (type) {
      case 'text':
        return {
          icon: IconText,
          label: 'Text Material',
          colors: 'bg-blue-100 text-blue-700'
        };
      case 'song':
        return {
          icon: IconMusic,
          label: 'Song',
          colors: 'bg-purple-100 text-purple-700'
        };
      case 'game':
        return {
          icon: IconGame,
          label: 'Game',
          colors: 'bg-green-100 text-green-700'
        };
    }
  };

  const config = getTypeConfig(type);
  const Icon = config.icon;

  const handleTypeSelect = async (newType: MaterialType) => {
    if (newType === type) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (materialId) {
        // Make API request to change material type
        const response = await fetch(`/api/materials/${materialId}/change-type/${newType}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to change material type');
        }

        const result = await response.json();
        console.log('Material type changed successfully:', result);
        
        // Call the callback if provided
        if (onTypeChange) {
          onTypeChange(result.newMaterialId, result.newType);
        }
        
        setIsModalOpen(false);
      } else if (onTypeChange) {
        // If no materialId, just call the callback (for external handling)
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error('Error changing material type:', err);
      setError(err instanceof Error ? err.message : 'Failed to change material type');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
      <div className={clsx(
        'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium',
        config.colors,
        className
      )}>
        <Icon className="h-3 w-3" />
        <span>{config.label}</span>
        {isEditable && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="ml-1 opacity-60 hover:opacity-100 transition-opacity"
            title="Change material type"
          >
            <IconEdit className="h-3 w-3" />
          </button>
        )}
      </div>

      <MaterialTypeChangeModal
        isOpen={isModalOpen}
        currentType={type}
        isLoading={isLoading}
        error={error}
        onClose={() => setIsModalOpen(false)}
        onTypeSelect={handleTypeSelect}
      />
    </>
  );
}