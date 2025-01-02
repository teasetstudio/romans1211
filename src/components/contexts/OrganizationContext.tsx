'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface Organization {
  id: string;
  name: string;
  isDefault: boolean;
  userId: string;
}

interface OrganizationContextType {
  organizations: Organization[];
  setOrganizations: (orgs: Organization[]) => void;
  selectedOrganization: Organization | null;
  setSelectedOrganization: (org: Organization) => void;
  // isLoading: boolean;
  // error: string | null;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

interface IProps {
  children: ReactNode;
  organizations: Organization[];
}

export function OrganizationProvider({ children, organizations: orgData }: IProps) {
  const [organizations, setOrganizations] = useState<Organization[]>(orgData);

  const defaultOrg = orgData.find((org: Organization) => org.isDefault);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization>(defaultOrg || orgData[0]);
  // const [isLoading, setIsLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   const fetchOrganizations = async () => {
  //     try {
  //       const response = await fetch('/api/organizations');
  //       if (!response.ok) {
  //         throw new Error('Failed to fetch organizations');
  //       }
  //       const data = await response.json();
  //       setOrganizations(data);

  //       // Set default organization
  //       const defaultOrg = data.find((org: Organization) => org.isDefault);
  //       if (defaultOrg) {
  //         setSelectedOrganization(defaultOrg);
  //       } else if (data.length > 0) {
  //         setSelectedOrganization(data[0]);
  //       }
  //     } catch (err) {
  //       setError(err instanceof Error ? err.message : 'Failed to fetch organizations');
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchOrganizations();
  // }, []);

  return (
    <OrganizationContext.Provider
      value={{
        organizations,
        setOrganizations,
        selectedOrganization,
        setSelectedOrganization,
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
