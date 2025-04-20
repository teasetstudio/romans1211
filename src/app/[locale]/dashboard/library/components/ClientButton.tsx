"use client"

import { useMemo } from "react";
import { useOrganization } from "@/components/contexts/OrganizationContext";
import { userInOrganizationData } from "@/utils/permissions";
import TextButton from '@/components/buttons/TextButton'
import { useSession } from "next-auth/react";

interface IProps {
  href: string;
  label?: string;
  className?: string;
  children?: any;
  permission: 'hasReadPermission' | 'hasCreatePermission' | 'hasEditPermission' | 'hasDeletePermission'
}

const LibraryClientButton = ({ href, label, children, permission, className }: IProps) => {
  const { selectedOrganization } = useOrganization();
  const { data: session } = useSession();

  if (!selectedOrganization) {
    return null;
  }

  const permissions = useMemo(() => 
    userInOrganizationData(session?.user?.id ?? '', selectedOrganization), 
    [session?.user?.id, selectedOrganization]
  );

  if (!permissions[permission]) {
    return null;
  }
  
  const styles = "px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"

  return (
    <TextButton 
      href={href} 
      className={className || styles}
    >
      {label || children}
    </TextButton>
  );
};

export default LibraryClientButton; 