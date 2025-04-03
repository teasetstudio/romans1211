import Sidebar from "@/components/widgets/ui/Sidebar";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { OrganizationProvider } from "@/components/contexts/OrganizationContext";
import { getSession } from "@/lib/auth";
import { organizationService } from "@/lib/OrganizationServiceForSSR";
import { Toaster } from 'react-hot-toast';
import { cookies } from "next/headers";

interface IProps {
  children: ReactNode
}

export default async function Layout({ children }: IProps) {
  const session = await getSession();
  if (!session) redirect('/');

  const cookieStore = cookies();
  const cookieSelectedOrganizationId = (await cookieStore).get('selectedOrganizationId')?.value

  const organizations = await organizationService.getUserAccessibleOrganizations(session.user)

  return (
    <OrganizationProvider organizations={organizations} cookieSelectedOrganizationId={cookieSelectedOrganizationId}>
      <Sidebar>{children}</Sidebar>
      <Toaster/>
    </OrganizationProvider>
  );
}
