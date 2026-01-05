'use client';

import { useCallback, useEffect, useState } from 'react';
import { IconX, IconLanguage, IconLoader } from '@tabler/icons-react';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { TMaterialType } from '@/types/Materials';
import { getMaterial } from '@/api/requests/materials';

import '@/styles/tiptap-components.css';

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
  preparations?: Array<{
    id: string;
    title: string;
    isOptional: boolean;
    order: number;
  }>;
}

interface MaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  materialId: string | null;
  materialType: TMaterialType;
  // Optional: when provided, modal will fetch via public endpoint using this event slug
  eventSlug?: string | null;
}

const MaterialModal = ({ isOpen, onClose, materialId, materialType, eventSlug }: MaterialModalProps) => {
  const [material, setMaterial] = useState<MaterialWithTags | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch material data
  const fetchMaterial = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      let data: MaterialWithTags;
      if (eventSlug) {
        const res = await fetch(`/api/public/events/${eventSlug}/materials/${id}`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to fetch material');
        }
        data = (await res.json()) as MaterialWithTags;
      } else {
        data = (await getMaterial(id)) as MaterialWithTags;
      }
      setMaterial(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch material');
    } finally {
      setLoading(false);
    }
  }, [eventSlug]);

  // Fetch material when modal opens or materialId changes
  useEffect(() => {
    if (isOpen && materialId) {
      fetchMaterial(materialId);
    } else {
      setMaterial(null);
      setError(null);
    }
  }, [isOpen, materialId, fetchMaterial]);

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
  // Headless UI Dialog handles escape key and focus management

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
  console.log('material', material)

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-[10001]">
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogBackdrop className="fixed inset-0 bg-black/50" />

        <DialogPanel className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
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
              <div className="relative overflow-hidden">
                {/* Background gradient */}
                <div className={`absolute inset-0 ${styles.header}`}></div>
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10"></div>

                <div className="relative px-6 py-5">
                  {/* Top row: Title and close button */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${styles.type} shadow-sm`}>
                          {material.type.charAt(0).toUpperCase() + material.type.slice(1)}
                        </span>
                        {material.tags && material.tags.length > 0 && (
                          <div className="flex items-center gap-1.5">
                            {material.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag.id}
                                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
                              >
                                {tag.name}
                              </span>
                            ))}
                            {material.tags.length > 3 && (
                              <span className="text-xs text-gray-500 font-medium">
                                +{material.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <h1 className={`text-2xl font-bold tracking-tight ${styles.title} truncate`}>
                        {material.title}
                      </h1>
                    </div>
                    <button
                      onClick={onClose}
                      className="ml-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200 group"
                    >
                      <IconX size={20} className="text-gray-600 group-hover:text-gray-800" />
                    </button>
                  </div>

                  {/* Bottom row: Language selector */}
                  {allTranslations.length > 1 && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center text-sm font-medium text-gray-600">
                        <IconLanguage size={16} className="mr-2" />
                        <span className="hidden sm:inline">Languages:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {allTranslations.map((translation) => (
                          <button
                            key={translation.id}
                            onClick={() => handleTranslationSelect(translation.id)}
                            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                              translation.id === material.id
                                ? `${styles.type} shadow-sm ring-1 ring-black ring-opacity-5`
                                : 'bg-white bg-opacity-80 text-gray-700 hover:bg-opacity-100 hover:shadow-sm border border-gray-200'
                            }`}
                          >
                            <span className="font-semibold">{translation.language.toUpperCase()}</span>
                            {!translation.originalId && (
                              <span className="ml-1.5 text-xs opacity-75">Original</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-300px)] space-y-6">
                <div
                  className="tiptap-wrapper whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: material.content }}
                />

                {/* Preparations Section - Only show for game materials */}
                {material.preparations && material.preparations.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-2">
                      Preparations:
                    </h3>

                    <ol className="list-decimal list-inside space-y-1 text-sm text-gray-800">
                      {material.preparations
                        .sort((a, b) => a.order - b.order)
                        .map((prep) => (
                          <li key={prep.id}>
                            {prep.title}
                            {prep.isOptional && (
                              <span className="ml-2 text-gray-500 italic">
                                (optional)
                              </span>
                            )}
                          </li>
                        ))}
                    </ol>
                  </div>
                )}
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
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default MaterialModal;
