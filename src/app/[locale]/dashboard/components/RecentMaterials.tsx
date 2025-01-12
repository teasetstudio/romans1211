import { IconText, IconMusic, IconGame, IconArrowLeft } from "@/res/icons";
import { getDashboardMaterialUrl } from "@/utils/urls";
import { TMaterialWithType } from "@/types/Materials";
import { Link } from '@/i18n/routing';
import { useTranslations } from "next-intl";
import { NAMESPACE_DASHBOARD } from "@/res/namespaces";

interface RecentMaterialsProps {
  recentMaterials: TMaterialWithType[];
}

export const RecentMaterials = ({ recentMaterials }: RecentMaterialsProps) => {
  const t = useTranslations(NAMESPACE_DASHBOARD);

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <h2 className="text-xl font-semibold text-dark">{t('recent_materials')}</h2>
      </div>
      <div className="p-6">
        <div className="divide-y divide-gray-200">
          {recentMaterials.length > 0 ? recentMaterials.map((material, index: number) => (
            <Link 
              key={`${material.title}-${index}`}
              href={getDashboardMaterialUrl({ type: material.type, id: material.id })}
              className="flex items-center justify-between py-3 first:pt-0 last:pb-0 hover:bg-gray-50 rounded-lg px-3 -mx-3 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shadow-sm">
                  {material.type === 'game' && <IconGame className="w-5 h-5 text-purple-500" />}
                  {material.type === 'text' && <IconText className="w-5 h-5 text-blue-500" />}
                  {material.type === 'song' && <IconMusic className="w-5 h-5 text-green-500" />}
                </div>
                <div>
                  <h3 className="font-medium text-dark">{material.title}</h3>
                  <p className="text-sm text-gray2">
                    Created {new Date(material.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <IconArrowLeft className="w-5 h-5 rotate-180 text-gray2" />
            </Link>
          )) : (
            <div className="text-sm text-gray2">{t('no_recent_materials')}</div>
          )}
        </div>
      </div>
    </div>
  );
};
