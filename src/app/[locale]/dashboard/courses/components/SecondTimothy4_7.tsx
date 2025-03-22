import { NAMESPACE_DASHBOARD_COURSES } from "@/res/namespaces";
import { useTranslations } from "next-intl";

interface IProps {
  className?: string;
}

const SecondTimothy4_7 = ({ className = "" }: IProps) => {
  const t = useTranslations(NAMESPACE_DASHBOARD_COURSES);

  return (
    <div className={`${className} flex items-center justify-center`}>
      <div className="relative w-full px-6 py-3 bg-gradient-to-r from-transparent via-blue-100 to-transparent text-center">
        <div className="text-lg text-gray-800 hover:text-gray-900 transition-colors font-medium">
          &quot;{t("2Timothy4_7")}&quot;
        </div>
        <div className="text-xs text-center text-gray-500 mt-1">
          — {t("2Timothy4_7_ref")}
        </div>
      </div>
    </div>
  )
}

export default SecondTimothy4_7;
