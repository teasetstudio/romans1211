"use client"

import { TMaterialType } from "@/types/Materials";
import { IconSearch, IconAdjustments, IconTag, IconCheck, IconX, IconLoader2 } from '@tabler/icons-react';
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";

interface IProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedType: TMaterialType | "all";
  setSelectedType: (type: TMaterialType | "all") => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  originalOnly: boolean;
  setOriginalOnly: (original: boolean) => void;
  allTags: string[];
  organizationId: string;
}

const EventPlanItemsFilter = ({
  searchQuery,
  setSearchQuery,
  selectedType,
  setSelectedType,
  selectedTags,
  setSelectedTags,
  originalOnly,
  setOriginalOnly,
  allTags,
  organizationId
}: IProps) => {
  const [tagSearchQuery, setTagSearchQuery] = useState("");
  const [isTagMenuOpen, setIsTagMenuOpen] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<string[]>(allTags);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  
  // Debounced tag search function
  const searchTags = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestedTags(allTags);
      return;
    }
    
    setIsLoadingTags(true);
    try {
      const params = new URLSearchParams({
        query,
        organizationId
      });
      
      const response = await fetch(`/api/tags/search?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }
      
      const data = await response.json();
      setSuggestedTags(data.tags);
    } catch (error) {
      console.error('Error fetching tags:', error);
      toast.error('Failed to fetch tags');
      setSuggestedTags(allTags);
    } finally {
      setIsLoadingTags(false);
    }
  }, [allTags, organizationId]);
  
  // Use effect to search tags when tagSearchQuery changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isTagMenuOpen) {
        searchTags(tagSearchQuery);
      }
    }, 300); // 300ms debounce
    
    return () => clearTimeout(timeoutId);
  }, [tagSearchQuery, isTagMenuOpen, searchTags]);
  
  // Filter tags based on search query for local filtering
  const filteredTags = tagSearchQuery.trim() === "" 
    ? allTags 
    : suggestedTags.filter(tag => 
        tag.toLowerCase().includes(tagSearchQuery.toLowerCase())
      );
      
  // Handle tag input submission
  const handleTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = tagSearchQuery.trim();
    
    if (trimmedQuery && !selectedTags.includes(trimmedQuery)) {
      setSelectedTags([...selectedTags, trimmedQuery]);
      setTagSearchQuery("");
    }
  };
  
  // Remove a selected tag
  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  // Material type options for select input
  const typeOptions = [
    { value: "all", label: "All Types" },
    { value: "song", label: "Songs" },
    { value: "text", label: "Texts" },
    { value: "game", label: "Games" }
  ];

  return (
    <div className="mb-6 bg-white rounded-xl shadow-md overflow-hidden p-5 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Search Input */}
        <div className="md:col-span-4 space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <IconSearch size={16} className="text-indigo-500" />
            <label className="text-sm font-medium text-gray-700">Search</label>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
              className="block w-full pl-3 pr-3 py-2 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
        </div>

        {/* Material Type Selection - Now as a Select */}
        <div className="md:col-span-3 space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <IconAdjustments size={16} className="text-indigo-500" />
            <label htmlFor="materialType" className="text-sm font-medium text-gray-700">Material Type</label>
          </div>
          <select
            id="materialType"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as TMaterialType | "all")}
            className="block w-full pl-3 pr-10 py-2 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          >
            {typeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Tags Selection with Search Input */}
        <div className="md:col-span-3 space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <IconTag size={16} className="text-indigo-500" />
            <label className="text-sm font-medium text-gray-700">Tags</label>
            {selectedTags.length > 0 && (
              <span className="text-xs bg-indigo-100 text-indigo-800 rounded-full px-2 py-0.5">
                {selectedTags.length} selected
              </span>
            )}
          </div>
          
          {/* Selected tags display */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedTags.map(tag => (
                <span 
                  key={tag} 
                  className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium"
                >
                  {tag}
                  <button 
                    onClick={() => removeTag(tag)}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    <IconX size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
          
          {/* Tag search form */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search or add new tag..."
              value={tagSearchQuery}
              onChange={(e) => setTagSearchQuery(e.target.value)}
              onFocus={() => setIsTagMenuOpen(true)}
              onBlur={() => setTimeout(() => setIsTagMenuOpen(false), 200)}
              className="block w-full pl-3 pr-10 py-2 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
            <button 
              onClick={handleTagSubmit}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-indigo-600 hover:text-indigo-800"
            >
              {isLoadingTags ? (
                <IconLoader2 size={16} className="animate-spin" />
              ) : (
                <IconCheck size={16} />
              )}
            </button>
          </div>
          
          {/* Tag suggestions */}
          {isTagMenuOpen && suggestedTags.length > 0 && (
            <div className="absolute z-10 max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg">
              <div className="max-h-40 overflow-y-auto p-2">
                {isLoadingTags && suggestedTags.length === 0 ? (
                  <div className="flex justify-center items-center py-3">
                    <IconLoader2 size={16} className="animate-spin text-indigo-500 mr-2" />
                    <span className="text-sm text-gray-500">Loading tags...</span>
                  </div>
                ) : suggestedTags.length === 0 ? (
                  <div className="text-center py-3 text-sm text-gray-500">
                    No matching tags found
                  </div>
                ) : (
                  suggestedTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        if (selectedTags.includes(tag)) {
                          setSelectedTags(selectedTags.filter(t => t !== tag));
                        } else {
                          setSelectedTags([...selectedTags, tag]);
                          setTagSearchQuery("");
                        }
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md mb-1 transition-colors ${
                        selectedTags.includes(tag)
                          ? "bg-indigo-100 text-indigo-800" 
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {tag}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Original Content Filter */}
        <div className="md:col-span-2 flex items-end pb-1">
          <div className="flex items-center gap-2">
            <label htmlFor="originalOnly" className="text-sm font-medium text-gray-700 cursor-pointer whitespace-nowrap">
              Original only
            </label>
            <div className="relative inline-block w-10 align-middle select-none">
              <input
                type="checkbox"
                name="originalOnly"
                id="originalOnly"
                checked={originalOnly}
                onChange={(e) => setOriginalOnly(e.target.checked)}
                className="opacity-0 absolute w-full h-full cursor-pointer peer"
              />
              <div className="w-10 h-5 bg-gray-300 rounded-full shadow-inner peer-checked:bg-indigo-500 transition-colors"></div>
              <div className="absolute inset-y-0 left-0 w-5 h-5 bg-white rounded-full shadow transform transition-transform peer-checked:translate-x-5"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventPlanItemsFilter;
