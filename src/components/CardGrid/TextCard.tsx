import { Link } from '@/i18n/routing';;
import { ICard } from './Card';
import { dateToDDMMYYY } from '@/utils/dates';
import LangBadge from '../badges/LangBadge';
import ImageCardPart from './shared/ImageCardPart';
import TagsCardPart from './shared/TagsCardPart';

export interface ITextCard extends ICard {}

interface IProps {
  text: ITextCard
}

export default function TextCard({ text }: IProps) {
  const { title, content, imageUrl, organizationName, createdAt, tags, link, language } = text;

  return (
    <Link href={link} className="group h-full relative block">
      <div className="bg-gradient-to-b from-white to-gray-50/80 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.15)] transition-all duration-300 ease-in-out overflow-hidden h-full flex flex-col border border-gray-200/80 hover:border-blue-200/60 hover:-translate-y-1 hover:bg-gradient-to-b hover:from-white hover:to-blue-50/30">
        <ImageCardPart title={title} imageUrl={imageUrl} organizationName={organizationName} />

        <div className="p-1.5 md:p-3 flex flex-col flex-grow">
          <TagsCardPart tags={tags} />

          <div
            className="text-sm text-gray-700 prose prose-sm max-w-none line-clamp-5 mt-3 flex-grow"
            dangerouslySetInnerHTML={{ __html: content }}
          />
          <div className="mt-4 flex justify-end text-sm flex-shrink-0">
            <span className="text-gray-600 font-medium">
              {dateToDDMMYYY(createdAt)}
            </span>
          </div>
        </div>
      </div>

      <LangBadge className="absolute top-0 right-0 z-10" lang={language} />
    </Link>
  );
}
