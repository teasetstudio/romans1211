import { IconText, IconMusic, IconGame, IconLibrary, IconClock, IconArrowLeft } from "@/res/icons";
import { ROUTE_DASHBOARD_LIBRARY, ROUTE_DASHBOARD_MATERIAL_CREATE } from "@/res/routes";
import { ProgressLink as Link } from '@/components/buttons/ProgressLink';
import { NAMESPACE_DASHBOARD } from '@/res/namespaces';
import { useTranslations } from 'next-intl';

export const QuickActions = () => {
  const t = useTranslations(NAMESPACE_DASHBOARD);

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      <div className="flex items-center gap-2 mb-6">
        <IconClock className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold text-dark">Quick Actions</h2>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <Link
            href={`${ROUTE_DASHBOARD_MATERIAL_CREATE}?type=game`}
            className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 text-dark rounded-xl transition-all group border border-gray-200 shadow-sm hover:shadow-md"
          >
            <div className="flex items-center gap-2">
              <IconGame className="w-5 h-5 text-purple-500" />
              <span className="font-medium">{t('create_game')}</span>
            </div>
            <IconArrowLeft className="w-4 h-4 rotate-180 text-gray2 group-hover:text-primary transition-colors" />
          </Link>
          <Link
            href={`${ROUTE_DASHBOARD_MATERIAL_CREATE}?type=text`}
            className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 text-dark rounded-xl transition-all group border border-gray-200 shadow-sm hover:shadow-md"
          >
            <div className="flex items-center gap-2">
              <IconText className="w-5 h-5 text-blue-500" />
              <span className="font-medium">{t('create_text')}</span>
            </div>
            <IconArrowLeft className="w-4 h-4 rotate-180 text-gray2 group-hover:text-primary transition-colors" />
          </Link>
          <Link
            href={`${ROUTE_DASHBOARD_MATERIAL_CREATE}?type=song`}
            className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 text-dark rounded-xl transition-all group border border-gray-200 shadow-sm hover:shadow-md"
          >
            <div className="flex items-center gap-2">
              <IconMusic className="w-5 h-5 text-green-500" />
              <span className="font-medium">{t('create_song')}</span>
            </div>
            <IconArrowLeft className="w-4 h-4 rotate-180 text-gray2 group-hover:text-primary transition-colors" />
          </Link>
        </div>

        <div className="h-px bg-gray-200" />

        <Link
          href={ROUTE_DASHBOARD_LIBRARY}
          className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 text-dark rounded-xl transition-all group border border-gray-200 shadow-sm hover:shadow-md"
        >
          <div className="flex items-center gap-2">
            <IconLibrary className="w-5 h-5 text-primary" />
            <span className="font-medium">{t('browse_library')}</span>
          </div>
          <IconArrowLeft className="w-4 h-4 rotate-180 text-gray2 group-hover:text-primary transition-colors" />
        </Link>
      </div>
    </div>
  );
};
