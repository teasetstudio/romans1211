import { ProgressLink as Link } from '@/components/buttons/ProgressLink';
import { IconText, IconMusic, IconGame } from "@/res/icons";
import { NAMESPACE_DASHBOARD } from "@/res/namespaces";
import { ROUTE_DASHBOARD_LIBRARY, ROUTE_DASHBOARD_MATERIAL_CREATE } from "@/res/routes";
import { useTranslations } from "next-intl";

interface IProps {
  gamesCount: number;
  textsCount: number;
  songsCount: number;
}

export const MaterialStats = ({ gamesCount, textsCount, songsCount }: IProps) => {
  const t = useTranslations(NAMESPACE_DASHBOARD);

  const materials = [
    {
      type: 'game',
      label: 'games',
      count: gamesCount,
      icon: IconGame,
      color: 'from-purple-500 to-purple-600',
    },
    {
      type: 'text',
      label: 'texts',
      count: textsCount,
      icon: IconText,
      color: 'from-blue-500 to-blue-600',
    },
    {
      type: 'song',
      label: 'songs',
      count: songsCount,
      icon: IconMusic,
      color: 'from-green-500 to-green-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {materials.map((material) => (
        <div
          key={material.type}
          className="bg-white rounded-3xl p-6 relative overflow-hidden border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-shadow"
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${material.color} p-2.5 flex items-center justify-center shadow-md`}>
                <material.icon className="w-6 h-6 text-white" />
              </div>
              <span className={`text-2xl font-bold bg-gradient-to-r ${material.color} bg-clip-text text-transparent`}>
                {material.count}
              </span>
            </div>
            <h3 className="text-xl font-semibold text-dark mb-4">{t(material.label)}</h3>
            {material.count > 0 ? (
              <div className="flex items-center justify-between">
                <Link
                  href={`${ROUTE_DASHBOARD_LIBRARY}?type=${material.type}`}
                  className="text-sm text-gray2 hover:text-primary transition-colors hover:underline"
                >
                  {t('view_all')} →
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray2 mb-4">
                  {t('no_materials', { type: t(material.label) })}
                </p>
                <Link
                  href={`${ROUTE_DASHBOARD_MATERIAL_CREATE}?type=${material.type}`}
                  className="inline-flex items-center px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-dark rounded-xl transition-colors shadow-sm"
                >
                  {t('create_one')}
                </Link>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
