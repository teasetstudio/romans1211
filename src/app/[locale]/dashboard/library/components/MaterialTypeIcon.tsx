import { IconMusic, IconText, IconGame } from '@/res/icons';
import clsx from 'clsx';

type MaterialType = 'text' | 'song' | 'game';

export default function MaterialTypeIcon({ type }: { type: MaterialType }) {
  return (
    <div className={clsx(
      'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium',
      type === 'text' ? 'bg-blue-100 text-blue-700' :
        type === 'song' ? 'bg-purple-100 text-purple-700' :
          'bg-green-100 text-green-700'
    )}>
      {type === 'text' ? (
        <>
          <IconText className="h-4 w-4" />
          <span>Text Material</span>
        </>
      ) : type === 'song' ? (
        <>
          <IconMusic className="h-4 w-4" />
          <span>Song</span>
        </>
      ) : (
        <>
          <IconGame className="h-4 w-4" />
          <span>Game</span>
        </>
      )}
    </div>
  );
}
