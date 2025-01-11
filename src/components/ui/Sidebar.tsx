"use client"

import React, { useEffect, useState } from 'react'
import { Link } from '@/i18n/routing';

import { IconClose, IconDashboard, IconHome, IconLibrary, IconProfile, IconBurger } from '@/res/icons'
import LogoutBtn from '../client/LogoutBtn'
import { ROUTE_DASHBOARD, ROUTE_DASHBOARD_LIBRARY, ROUTE_SETTINGS } from '@/res/routes'

interface IProps {
  children: React.ReactNode
}

const Sidebar = ({ children }: IProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    
  }, [isExpanded])

  return (
    <div className="flex h-screen w-screen bg-gray-100">
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`md:hidden fixed z-50 top-2 right-2 p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors`}
      >
        {isExpanded ? <IconClose size={24} /> : <IconBurger size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed md:static flex flex-col bg-gray-800 h-full transition-[width,transform] duration-300 ease-in-out z-40
          ${isExpanded ? 'w-64 translate-x-0' : 'w-0 md:w-20 -translate-x-full md:translate-x-0'}
        `}
      >
        {/* Desktop Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="hidden md:flex absolute -right-3 top-8 p-1.5 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
        >
          {isExpanded ? <IconClose size={16} /> : <IconBurger size={16} />}
        </button>

        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex flex-col flex-1 overflow-y-auto bg-gradient-to-b from-dark to-primary p-2 gap-2 rounded-2xl">
            <div className='flex-auto'>
              <LinkItem href='/' text='Home' icon={IconHome} isExpanded={isExpanded} />
              <div className={`text-gray-300 my-5 ${!isExpanded && 'md:hidden'}`}>Organization</div>
              <nav className="flex flex-col flex-1 gap-2">
                <LinkItem href={ROUTE_DASHBOARD} text='Dashboard' icon={IconDashboard} isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
                <LinkItem href={ROUTE_DASHBOARD_LIBRARY} text='Library' icon={IconLibrary} isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
                <LinkItem href={ROUTE_SETTINGS} text='Profile' icon={IconProfile} isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
              </nav>
            </div>

            <div className='text-gray-100'>
              <LogoutBtn showOnlyIcon={!isExpanded} />
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Main Content */}
      <div className='overflow-y-auto flex flex-col flex-1'>
        {children}
      </div>
    </div>
  )
}

export default Sidebar

interface ILinkProps {
  href: string
  text: string
  icon: React.FC<{ className?: string }>
  isExpanded?: boolean
  setIsExpanded?: (arg: boolean) => void
}

const LinkItem = ({ href, text, icon: Icon, isExpanded = true, setIsExpanded }: ILinkProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 840);
    };
    
    // Initial check
    checkMobile();

    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const onClick = () => {
    // Only close sidebar on mobile screens
    if (isMobile && isExpanded && setIsExpanded) {
      setIsExpanded(false);
    }
  };

  return (
    <Link
      href={href}
      className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg p-2 transition-colors"
      onClick={onClick}
    >
      <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
        <Icon className="w-full h-full" />
      </div>
      <span className={`whitespace-nowrap transition-opacity duration-300 ${!isExpanded && 'md:opacity-0 md:w-0 md:hidden'}`}>
        {text}
      </span>
    </Link>
  )
}
