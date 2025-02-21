'use client';

import { createContext, useContext, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface Organization {
  id: string;
  name: string;
  description?: string | null;
  isDefault: boolean;
  ownerId: string;
}

export interface OrganizationCreateAttr {
  name: string;
  description?: string | null;
}

interface OrganizationContextType {
  organizations: Organization[];
  setOrganizations: (orgs: Organization[]) => void;
  selectedOrganization: Organization | null;
  setSelectedOrganization: (org: Organization, options?: { refresh?: boolean }) => void;
  updateOrganization: (id: string, data: OrganizationCreateAttr) => Promise<void>;
  // isLoading: boolean;
  // error: string | null;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

interface IProps {
  children: React.ReactNode;
  organizations: Organization[];
}

export function OrganizationProvider({ children, organizations: orgs }: IProps) {
  const [organizations, setOrganizations] = useState<Organization[]>(orgs);
  
  const router = useRouter()

  const getCookieOrg = (): Organization | null => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; selectedOrganizationId=`);
    if (parts.length === 2) {
      const orgId = parts.pop()?.split(';').shift();
      const org = orgs.find((org: Organization) => org.id === orgId);
      return org || null;
    }
    return null;
  };

  const getDefaultOrg = (): Organization | null => {
    const defaultOrg = orgs.find((org: Organization) => org.isDefault);
    return defaultOrg || null;
  };

  const selectedOrg = getCookieOrg() || getDefaultOrg();
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(selectedOrg);

  const handleSetSelectedOrganization = (org: Organization, { refresh }: { refresh?: boolean } = { refresh: true }) => {
    setSelectedOrganization(org);
    // Set cookie with 30 days expiry
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    document.cookie = `selectedOrganizationId=${org.id}; expires=${expiryDate.toUTCString()}; path=/`;
    
    if (refresh) router.refresh();
  };

  const updateOrganization = async (id: string, data: { name: string }) => {
    try {
      const response = await fetch(`/api/organizations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update organization');
      
      const updatedOrg = await response.json();
      
      // Update organizations list
      const updatedOrgs = organizations.map(org => org.id === id ? updatedOrg : org);
      setOrganizations(updatedOrgs);

      // Update selected organization if it's the one being updated
      if (selectedOrganization?.id === id) {
        setSelectedOrganization(updatedOrg);
      }
    } catch (error) {
      console.error('Error updating organization:', error);
      throw error;
    }
  };

  return (
    <OrganizationContext.Provider
      value={{
        organizations,
        setOrganizations,
        selectedOrganization,
        setSelectedOrganization: handleSetSelectedOrganization,
        updateOrganization,
        // isLoading,
        // error,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}
