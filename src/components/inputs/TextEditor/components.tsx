"use client";

import React, { JSX } from 'react'

interface MenuButtonProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClick: (e: any) => void
  isActive?: boolean
  children: React.ReactNode
  title?: string
}

export const MenuButton = ({ onClick, isActive, children, title }: MenuButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
      isActive ? 'bg-gray-100 text-primary' : 'text-gray-700'
    }`}
  >
    {children}
  </button>
)

export const Divider = () => <div className="w-px h-6 bg-gray-200 mx-1" />

// For mobilt menu bay
export const IconDropdown = ({ 
  value, 
  options, 
  onChange, 
  className,
}: { 
  value: string | string[];
  options: { value: string; icon: JSX.Element }[];
  onChange: (value: string) => void;
  className?: string;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-lg border border-gray-200 bg-white text-gray-700 flex items-center justify-center hover:bg-gray-50"
      >
        {options.find(opt => opt.value === value)?.icon || options[0].icon}
      </button>
      {isOpen && (
        <div className="absolute left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[120px]">
          <div className="p-1 grid grid-cols-2 gap-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-10 h-10 rounded flex items-center justify-center ${
                  value === option.value || (Array.isArray(value) && value.includes(option.value))
                    ? 'bg-gray-100 text-primary'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                {option.icon}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
