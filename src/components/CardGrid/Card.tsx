import { Lang } from '@/types/Lang';
import { TMaterialType } from '@/types/Materials';
import { ITag } from '@/types/Tag';
import { dateToDDMMYYY } from '@/utils/dates';
import { ProgressLink as Link } from '@/components/buttons/ProgressLink';;
import parse, { HTMLReactParserOptions, Element } from 'html-react-parser';
import LangBadge from '../badges/LangBadge';
import ImageCardPart from './shared/ImageCardPart';
import TagsCardPart from './shared/TagsCardPart';

export interface ICard {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  organizationName: string;
  createdAt: Date;
  language: Lang;
  type: TMaterialType;
  link: string;
  tags?: ITag[];
}

interface IProps {
  card: ICard;
}

export default function Card({ card }: IProps) {
  const { title, content, imageUrl, organizationName, createdAt, tags, link, language } = card;

  // Parser options to remove anchor tags to prevent nested <a> elements
  const parserOptions: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (domNode instanceof Element && domNode.name === 'a') {
        // Replace <a> tags with <span> to preserve content but remove link functionality
        const textContent = domNode.children
          .map(child => (child as any).data || (child as any).textContent || '')
          .join('');
        return <span className="text-blue-600 underline">{textContent}</span>;
      }
    },
  };

  return (
    <Link href={link} className="group h-full block">
      <div className="bg-gradient-to-b from-white to-gray-50/80 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.15)] transition-all duration-300 ease-in-out overflow-hidden h-full flex flex-col border border-gray-200/80 hover:border-blue-200/60 transform-gpu hover:-translate-y-1 hover:bg-gradient-to-b hover:from-white hover:to-blue-50/30 relative will-change-transform">
        <ImageCardPart title={title} imageUrl={imageUrl} organizationName={organizationName} />
        <LangBadge className="absolute top-0 right-0 z-10" lang={language} />

        <div className="p-1.5 md:p-3 flex flex-col flex-grow">
          <TagsCardPart tags={tags} />

          <div className="text-sm text-gray-700 prose prose-sm max-w-none line-clamp-5 mt-3 flex-grow">
            {parse(content, parserOptions)}
          </div>
          <div className="mt-4 flex justify-end text-sm flex-shrink-0">
            <span className="text-gray-600 font-medium">
              {dateToDDMMYYY(createdAt)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
