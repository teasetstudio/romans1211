'use client';

import Button from "@/components/buttons/Button";
import H9 from "@/components/typo/H9";
import { NAMESPACE_BANNERS } from "@/res/namespaces";
import { ROUTE_DASHBOARD_MATERIAL_CREATE, ROUTE_LOGIN } from "@/res/routes";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

const ClientFooterBtn = () => {
  const t = useTranslations(NAMESPACE_BANNERS)
  const { data: session } = useSession()

  const label = session ? t('top_banner.create') : t('top_banner.log_in')
  const route = session ? ROUTE_DASHBOARD_MATERIAL_CREATE : ROUTE_LOGIN

  return (
    <Button className="w-44" bgColor="bg-primary" href={route}>
      <H9 color="text-white" weight="semibold">
        {label}
      </H9>
    </Button>
  );
};

export default ClientFooterBtn;