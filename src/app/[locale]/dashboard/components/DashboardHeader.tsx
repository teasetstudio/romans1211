import { Link } from '@/i18n/routing'
import { ROUTE_DASHBOARD_MATERIAL_CREATE } from '@/res/routes'
import { IconPlus } from "@/res/icons";
import { NAMESPACE_DASHBOARD } from '@/res/namespaces';
import { useTranslations } from 'next-intl';

interface IProps {
  totalMaterials: number
}

const DashboardHeader = ({ totalMaterials }: IProps) => {
  const t = useTranslations(NAMESPACE_DASHBOARD);

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold text-dark">{t('dashboard')}</h1>
        <div className="flex items-center gap-4">
          <Link
            href={ROUTE_DASHBOARD_MATERIAL_CREATE}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-secondary text-white rounded-xl transition-colors shadow-md hover:shadow-lg"
          >
            <IconPlus className="w-5 h-5 text-white" />
            {t('create_new_material')}
          </Link>
          <div className="bg-dark text-white px-4 py-2 rounded-xl shadow-md">
            <span className="font-semibold">{t('total')}: {totalMaterials}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardHeader