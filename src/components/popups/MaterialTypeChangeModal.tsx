"use client";

import { IconMusic, IconText, IconGame, IconClose } from '@/res/icons';
import clsx from 'clsx';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useState, useEffect } from 'react';

type MaterialType = 'text' | 'song' | 'game';

interface MaterialTypeChangeModalProps {
  isOpen: boolean;
  currentType: MaterialType;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
  onTypeSelect: (newType: MaterialType) => void;
}

export default function MaterialTypeChangeModal({
  isOpen,
  currentType,
  isLoading,
  error,
  onClose,
  onTypeSelect
}: MaterialTypeChangeModalProps) {
  const [changingToType, setChangingToType] = useState<MaterialType | null>(null);

  // Reset the changing state when modal closes or loading finishes
  useEffect(() => {
    if (!isOpen || !isLoading) {
      setChangingToType(null);
    }
  }, [isOpen, isLoading]);

  const handleTypeSelect = (newType: MaterialType) => {
    setChangingToType(newType);
    onTypeSelect(newType);
  };

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

  const allTypes: MaterialType[] = ['text', 'song', 'game'];

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center">
        <DialogPanel className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <div className="flex items-center justify-between mb-4">
            <DialogTitle className="text-lg font-semibold">Change Material Type</DialogTitle>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <IconClose className="h-4 w-4" />
            </button>
          </div>
        
        <p className="text-gray-600 mb-4">
          Select a new type for this material. All translations will be migrated automatically.
        </p>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        
        <div className="space-y-2">
          {allTypes.map((materialType) => {
            const typeConfig = getTypeConfig(materialType);
            const TypeIcon = typeConfig.icon;
            const isCurrentType = materialType === currentType;
            const isChangingToThisType = changingToType === materialType && isLoading;
            
            return (
              <button
                key={materialType}
                onClick={() => handleTypeSelect(materialType)}
                disabled={isCurrentType || isLoading}
                className={clsx(
                  'w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left',
                  isCurrentType || isLoading
                    ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-50'
                    : 'hover:bg-gray-50 border-gray-200 cursor-pointer'
                )}
              >
                <div className={clsx(
                  'flex items-center justify-center w-8 h-8 rounded-full',
                  typeConfig.colors
                )}>
                  <TypeIcon className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium">{typeConfig.label}</div>
                  {isCurrentType && (
                    <div className="text-sm text-gray-500">Current type</div>
                  )}
                  {isChangingToThisType && (
                    <div className="flex items-center gap-1.5 text-sm text-blue-600">
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="font-medium">Changing...</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            disabled={isLoading}
            className={clsx(
              "px-4 py-2 rounded-lg transition-colors",
              isLoading
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            Cancel
          </button>
        </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
