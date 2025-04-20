'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IUser } from '@/types/User';

export interface Organization {
  id: string;
  name: string;
  description?: string | null;
  isDefault: boolean;
  ownerId: string;
  members?: OrganizationMember[];
}

export interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  permissions: string[];
  isAccepted: boolean;
  invitedAt: Date;
  acceptedAt?: Date | null;

  user: IUser;
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
  updateOrganization: (id: string, data: OrganizationCreateAttr) => Promise<Organization>;
  refreshOrganizations: () => Promise<void>;
  getPendingInvitationsCount: () => number;
  removeOrganization: (id: string) => void;
  // isLoading: boolean;
  // error: string | null;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

interface IProps {
  children: React.ReactNode;
  organizations: Organization[];
  // Cookies received gtom the server side
  cookieSelectedOrganizationId?: string
}

export function OrganizationProvider({ children, organizations: orgs, cookieSelectedOrganizationId }: IProps) {
  const [organizations, setOrganizations] = useState<Organization[]>(orgs);
  
  const router = useRouter()

  const getCookieOrg = (): Organization | null => {
    if (cookieSelectedOrganizationId) {
      const org = orgs.find((org: Organization) => org.id === cookieSelectedOrganizationId);
      return org || null;
    } else {
      if (typeof document === 'undefined') return null;
      const value = `; ${document.cookie}`;
      const parts = value.split(`; selectedOrganizationId=`);
      if (parts.length === 2) {
        const orgId = parts.pop()?.split(';').shift();
        const org = orgs.find((org: Organization) => org.id === orgId);
        return org || null;
      }
      return null;
    }
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
    // without SameSite=Lax it doesn't set the cookie in incognito mode in browsers
    document.cookie = `selectedOrganizationId=${org.id}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
    
    if (refresh) router.refresh();
  };

  const updateOrganization = async (id: string, data: { name: string }): Promise<Organization> => {
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
      return updatedOrg;
    } catch (error) {
      console.error('Error updating organization:', error);
      throw error;
    }
  };

  const refreshOrganizations = async () => {
    try {
      const response = await fetch('/api/organizations');
      if (!response.ok) throw new Error('Failed to fetch organizations');
      const updatedOrgs = await response.json();
      // if updatedOrgs doesn't include selectedOrganization, set selectedOrganization to defaultOrg
      if (!updatedOrgs.find((org: Organization) => org.id === selectedOrganization?.id)) {
        const defaultOrg = getDefaultOrg();
        if (defaultOrg) {
          setSelectedOrganization(defaultOrg);
        }
      }

      setOrganizations(updatedOrgs);
      router.refresh();
    } catch (error) {
      console.error('Error refreshing organizations:', error);
    }
  };

  const removeOrganization = (id: string) => {
    const updatedOrgs = organizations.filter(org => org.id !== id);
    if (id === selectedOrganization?.id) {
      const defaultOrg = getDefaultOrg();
      if (defaultOrg) {
        handleSetSelectedOrganization(defaultOrg);
      } else {
        setSelectedOrganization(null);
      }
    }
    setOrganizations(updatedOrgs);
  };

  const getPendingInvitationsCount = () => {
    return organizations.reduce((count, org) => {
      const pendingInvitation = org.members?.find(m => !m.isAccepted);
      return count + (pendingInvitation ? 1 : 0);
    }, 0);
  };

  useEffect(() => {
    if (!getCookieOrg() && selectedOrganization) {
      handleSetSelectedOrganization(selectedOrganization, { refresh: true })
    }
  }, [selectedOrganization])

  return (
    <OrganizationContext.Provider
      value={{
        organizations,
        setOrganizations,
        selectedOrganization,
        setSelectedOrganization: handleSetSelectedOrganization,
        updateOrganization,
        refreshOrganizations,
        getPendingInvitationsCount,
        removeOrganization,
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
