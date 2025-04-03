'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Organization, useOrganization } from '@/components/contexts/OrganizationContext';
import { IconCheck, IconClose } from '@/res/icons';
import { Link } from '@/i18n/routing';
import { ROUTE_DASHBOARD_ORGANIZATIONS, ROUTE_DASHBOARD_ORGANIZATIONS_NEW } from '@/res/routes';
import OrganizationIcon from './OrganizationIcon';
import { useSession } from 'next-auth/react';

const OrganizationSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showIcon, setShowIcon] = useState(false);
  const { organizations, selectedOrganization, setSelectedOrganization, refreshOrganizations } = useOrganization();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIcon(true);
    }, 350);

    return () => clearTimeout(timer);
  }, []);

  const handleOrganizationSelect = async (org: Organization) => {
    if (selectedOrganization?.id === org.id) return;
    try {
      await setSelectedOrganization(org);
      await refreshOrganizations();
    } catch (error) {
      console.error('Error switching organization:', error);
    }
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  // Filter organizations to only show those where the user has accepted their invitation
  const acceptedOrganizations = organizations.filter(org => {
    const userMember = org.members?.find(member => member.userId === session?.user?.id);
    return !(userMember?.isAccepted === false);
  });

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 text-sm font-medium text-gray-300 hover:text-gray-700 hover:bg-gray-50 rounded-md"
      >
        <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
          <OrganizationIcon name={selectedOrganization?.name || ''} className="w-full h-full" />
        </div>
        <span className={`${showIcon ? 'block' : 'hidden'}`}>{selectedOrganization?.name}</span>
        <svg className={`w-4 h-4 ${showIcon ? 'block' : 'hidden'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 left-1.5 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-sm font-medium">Switch dashboard context</h3>
            <button
              onClick={closeDropdown}
              className="text-gray-400 hover:text-gray-500"
            >
              <IconClose className="w-4 h-4" />
            </button>
          </div>

          <div className="py-2 max-h-64 overflow-y-auto">
            {acceptedOrganizations.map((org) => (
              <button
                key={org.id}
                onClick={() => handleOrganizationSelect(org)}
                className={`w-full px-4 py-2 text-sm text-left flex items-center gap-2 hover:bg-gray-50 ${
                  selectedOrganization?.id === org.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="w-5 h-5 bg-gray-200 rounded flex items-center justify-center text-sm">
                  {org.name.charAt(0)}
                </div>
                <span>{org.name}</span>
                {selectedOrganization?.id === org.id && <IconCheck className="w-4 h-4 ml-auto" />}
              </button>
            ))}
          </div>

          <div className="p-2 border-t space-y-2">
            <Link
              href={ROUTE_DASHBOARD_ORGANIZATIONS}
              onClick={closeDropdown}
              className="block w-full px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded border border-gray-300 transition-colors"
            >
              📋 Manage organizations
            </Link>
            <Link
              href={ROUTE_DASHBOARD_ORGANIZATIONS_NEW}
              onClick={closeDropdown}
              className="block w-full px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded border border-gray-300 transition-colors"
            >
              ➕ Create organization
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationSwitcher;
