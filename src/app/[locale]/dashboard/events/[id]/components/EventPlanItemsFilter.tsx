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
    <div className="flex flex-col space-y-4">
      <div className="flex items-center gap-4">
        {/* Search Input */}
        <div className="flex-1">
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
              className="block w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
            <IconSearch size={16} className="text-gray-400 absolute left-2.5 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>

        {/* Material Type Selection */}
        <div className="w-40">
          <select
            id="materialType"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as TMaterialType | "all")}
            className="block w-full pl-3 pr-8 py-1.5 border border-gray-200 rounded-lg bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          >
            {typeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Original Content Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="originalOnly" className="text-sm text-gray-600 cursor-pointer whitespace-nowrap">
            Original only
          </label>
          <div className="relative inline-block w-8 align-middle select-none">
            <input
              type="checkbox"
              name="originalOnly"
              id="originalOnly"
              checked={originalOnly}
              onChange={(e) => setOriginalOnly(e.target.checked)}
              className="opacity-0 absolute w-full h-full cursor-pointer peer"
            />
            <div className="w-8 h-4 bg-gray-300 rounded-full shadow-inner peer-checked:bg-indigo-500 transition-colors"></div>
            <div className="absolute inset-y-0 left-0 w-4 h-4 bg-white rounded-full shadow transform transition-transform peer-checked:translate-x-4"></div>
          </div>
        </div>
      </div>
      
      {/* Tags Selection */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search or add tags..."
            value={tagSearchQuery}
            onChange={(e) => setTagSearchQuery(e.target.value)}
            onFocus={() => setIsTagMenuOpen(true)}
            onBlur={() => setTimeout(() => setIsTagMenuOpen(false), 200)}
            className="block w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          />
          <IconTag size={16} className="text-gray-400 absolute left-2.5 top-1/2 transform -translate-y-1/2" />
          {isLoadingTags && (
            <IconLoader2 size={16} className="absolute right-2.5 top-1/2 transform -translate-y-1/2 animate-spin text-indigo-500" />
          )}
          
          {/* Tag suggestions */}
          {isTagMenuOpen && suggestedTags.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
              <div className="max-h-32 overflow-y-auto p-1">
                {suggestedTags.map((tag) => (
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
                    className={`w-full text-left px-2 py-1 text-sm rounded ${
                      selectedTags.includes(tag)
                        ? "bg-indigo-50 text-indigo-700" 
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected tags display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedTags.map(tag => (
            <span 
              key={tag} 
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs"
            >
              {tag}
              <button 
                onClick={() => removeTag(tag)}
                className="text-indigo-400 hover:text-indigo-600"
              >
                <IconX size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventPlanItemsFilter;
