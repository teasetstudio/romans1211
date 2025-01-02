import { ROUTE_LIBRARY } from '@/res/routes';
import Image from 'next/image';
import Link from 'next/link';

interface GameCardProps {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  organizationName: string;
  createdAt: string;
  tags?: { name: string }[];
}

export default function GameCard({
  id,
  title,
  content,
  imageUrl,
  organizationName,
  createdAt,
  tags,
}: GameCardProps) {
  const dateToDDMMYYY = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
  return (
    <Link href={`${ROUTE_LIBRARY}/game/${id}`} className="group h-full">
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden h-full flex flex-col">
        <div className="relative h-32 flex-shrink-0">
          <Image
            src={imageUrl || '/images/game_placeholder.png'}
            alt={title}
            fill
            sizes="(max-width: 585px) 100vw, (max-width: 1075px) 45vw, 22vw"
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
          <div className="absolute inset-0 p-4 flex flex-col justify-between">
            <h3 className="font-semibold text-lg text-white line-clamp-2">
              {title}
            </h3>
            <div className="text-sm text-white/90">
              {organizationName}
            </div>
          </div>
        </div>

        <div className="p-4 flex flex-col flex-grow">
          {tags && tags.length > 0 && (
            <div className="flex overflow-hidden mb-3">
              <div className="flex gap-2 flex-nowrap">
                {tags.map((tag) => (
                  <span
                    key={tag.name}
                    className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs whitespace-nowrap"
                    title={tag.name}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div
            className="text-sm text-gray-600 prose prose-sm max-w-none line-clamp-5 truncate flex-grow"
            dangerouslySetInnerHTML={{ __html: content }}
          />
          <div className="mt-4 flex justify-end text-sm flex-shrink-0">
            <span className="text-gray-400">
              {dateToDDMMYYY(createdAt)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
