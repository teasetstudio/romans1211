import React from 'react'

interface TooltipProps {
  tooltipText: string
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

const Tooltip = ({ 
  tooltipText, 
  children, 
  position = 'top',
  className = ''
}: TooltipProps) => {
  const getTooltipPosition = () => {
    switch (position) {
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2'
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2'
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2'
      default: // top
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2'
    }
  }

  const getArrowPosition = () => {
    switch (position) {
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-800'
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-800'
      case 'right':
        return 'right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-800'
      default: // top
        return 'top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800'
    }
  }

  return (
    <div className={`relative group inline-block ${className}`}>
      {children}
      <div 
        className={`absolute ${getTooltipPosition()} px-2 py-1 text-xs font-medium text-white bg-gray-800 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none`}
      >
        {tooltipText}
        <div className={`absolute ${getArrowPosition()}`}></div>
      </div>
    </div>
  )
}

export default Tooltip
