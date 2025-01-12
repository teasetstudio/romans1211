import Sidebar from "@/components/widgets/ui/Sidebar";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { OrganizationProvider } from "@/components/contexts/OrganizationContext";
import { getSession } from "@/lib/auth";
import { organizationService } from "@/lib/OrganizationServiceForSSR";

interface IProps {
  children: ReactNode
}

export default async function Layout({ children }: IProps) {
  const session = await getSession();
  if (!session) redirect('/');

  const organizations = await organizationService.getUserOrganizations(session.user)

  return (
    <OrganizationProvider organizations={organizations}>
      <Sidebar>{children}</Sidebar>
    </OrganizationProvider>
  );
}
