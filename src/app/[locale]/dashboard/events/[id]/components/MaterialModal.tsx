'use client';

import { useEffect, useState } from 'react';
import { IconX, IconTag, IconLanguage, IconLoader } from '@tabler/icons-react';
import { TMaterialType } from '@/types/Materials';
import { getMaterial } from '@/api/requests/materials';


interface MaterialWithTags {
  id: string;
  title: string;
  content: string;
  language: string;
  organizationId: string;
  isPublic: boolean;
  originalId?: string | null;
  createdAt: string;
  updatedAt: string;
  type: TMaterialType;
  tags: { id: string; name: string }[];
  translations?: MaterialWithTags[];
  original?: MaterialWithTags & { translations?: MaterialWithTags[] };
}

interface MaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  materialId: string | null;
  materialType: TMaterialType;
}

const MaterialModal = ({ isOpen, onClose, materialId, materialType }: MaterialModalProps) => {
  const [material, setMaterial] = useState<MaterialWithTags | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch material data
  const fetchMaterial = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMaterial(id);
      setMaterial(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch material');
    } finally {
      setLoading(false);
    }
  };

  // Fetch material when modal opens or materialId changes
  useEffect(() => {
    if (isOpen && materialId) {
      fetchMaterial(materialId);
    } else {
      setMaterial(null);
      setError(null);
    }
  }, [isOpen, materialId]);

  // Handle translation selection
  const handleTranslationSelect = async (translationId: string) => {
    if (translationId === material?.id) {
      return;
    }
    
    await fetchMaterial(translationId);
  };

  // Get all available translations including the current material
  const getAllTranslations = () => {
    if (!material) return [];
    
    const translations = [];
    
    // If this is a translation, get the original and its translations
    if (material.original) {
      translations.push(material.original);
      if (material.original.translations) {
        translations.push(...material.original.translations);
      }
    } else {
      // If this is an original, include it and its translations
      translations.push(material);
      if (material.translations) {
        translations.push(...material.translations);
      }
    }
    
    // Remove duplicates and sort by language
    const uniqueTranslations = translations.filter((t, index, arr) => 
      arr.findIndex(item => item.id === t.id) === index
    );
    
    return uniqueTranslations.sort((a, b) => a.language.localeCompare(b.language));
  };

  const allTranslations = getAllTranslations();
  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getTypeStyles = (type: TMaterialType) => {
    switch (type) {
      case 'song':
        return {
          header: 'bg-purple-50 border-purple-200',
          title: 'text-purple-900',
          type: 'text-purple-600 bg-purple-100',
          tag: 'bg-purple-100 text-purple-800 border-purple-200'
        };
      case 'text':
        return {
          header: 'bg-blue-50 border-blue-200',
          title: 'text-blue-900',
          type: 'text-blue-600 bg-blue-100',
          tag: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'game':
        return {
          header: 'bg-green-50 border-green-200',
          title: 'text-green-900',
          type: 'text-green-600 bg-green-100',
          tag: 'bg-green-100 text-green-800 border-green-200'
        };
      default:
        return {
          header: 'bg-gray-50 border-gray-200',
          title: 'text-gray-900',
          type: 'text-gray-600 bg-gray-100',
          tag: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const styles = getTypeStyles(material?.type || materialType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center p-8">
            <IconLoader className="animate-spin mr-2" size={20} />
            <span>Loading material...</span>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
              <button
                onClick={() => materialId && fetchMaterial(materialId)}
                className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Retry
              </button>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
        
        {/* Content */}
        {material && !loading && !error && (
          <>
          {/* Header */}
          <div className={`px-6 py-4 border-b ${styles.header}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h2 className={`text-xl font-semibold ${styles.title}`}>
                  {material.title}
                </h2>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles.type}`}>
                  {material.type.charAt(0).toUpperCase() + material.type.slice(1)}
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                  {material.language.toUpperCase()}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-black hover:bg-opacity-10 rounded-full transition-colors"
              >
                <IconX size={20} className="text-gray-500" />
              </button>
            </div>
            
            {/* Translation Selector */}
            {allTranslations.length > 1 && (
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <IconLanguage size={16} className="mr-1" />
                  Available Languages:
                </div>
                <div className="flex flex-wrap gap-2">
                  {allTranslations.map((translation) => (
                    <button
                      key={translation.id}
                      onClick={() => handleTranslationSelect(translation.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        translation.id === material.id
                          ? `${styles.type} border-current`
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {translation.language.toUpperCase()}
                      {translation.originalId ? '' : ' (Original)'}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Tags */}
            {material.tags && material.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                <div className="flex items-center text-sm text-gray-600 mr-2">
                  <IconTag size={16} className="mr-1" />
                  Tags:
                </div>
                {material.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${styles.tag}`}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-300px)]">
            <div 
              className="prose prose-sm max-w-none text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: material.content }}
            />
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MaterialModal;
