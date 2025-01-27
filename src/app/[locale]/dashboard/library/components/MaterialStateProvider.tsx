'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { TMaterial } from '@/types/Materials';
import { toast } from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { NAMESPACE_DASHBOARD } from '@/res/namespaces';

interface MaterialContextType {
  material: TMaterial;
  isLoading: boolean;
  updateMaterialVisibility: (isPublic: boolean) => Promise<boolean>;
}

const MaterialContext = createContext<MaterialContextType | undefined>(undefined);

export function useMaterial() {
  const context = useContext(MaterialContext);
  if (!context) {
    throw new Error('useMaterial must be used within a MaterialStateProvider');
  }
  return context;
}

interface MaterialStateProviderProps {
  material: TMaterial;
  children: ReactNode;
}

export default function MaterialStateProvider({ material: initialMaterial, children }: MaterialStateProviderProps) {
  const [material, setMaterial] = useState(initialMaterial);
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations(NAMESPACE_DASHBOARD);

  const updateMaterialVisibility = async (isPublic: boolean): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/materials/${material.id}/change-group-visibility`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPublic }),
      });

      if (!response.ok) {
        throw new Error('Failed to update visibility');
      }

      setMaterial(prev => ({
        ...prev,
        isPublic
      }));

      toast.success(isPublic ? t('made_all_public') : t('made_all_private'));
      return true;
    } catch (error) {
      console.error('Error updating visibility:', error);
      toast.error(t('error_updating_visibility'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MaterialContext.Provider value={{ material, isLoading, updateMaterialVisibility }}>
      {children}
    </MaterialContext.Provider>
  );
}
