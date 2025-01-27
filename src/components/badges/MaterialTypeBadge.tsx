import { IconMusic, IconText, IconGame } from '@/res/icons';
import clsx from 'clsx';

type MaterialType = 'text' | 'song' | 'game';

interface MaterialTypeBadgeProps {
  type: MaterialType;
  className?: string;
}

export default function MaterialTypeBadge({ type, className }: MaterialTypeBadgeProps) {
  const getTypeConfig = (type: MaterialType) => {
    switch (type) {
      case 'text':
        return {
          icon: IconText,
          label: 'Text Material',
          colors: 'bg-blue-100 text-blue-700'
        };
      case 'song':
        return {
          icon: IconMusic,
          label: 'Song',
          colors: 'bg-purple-100 text-purple-700'
        };
      case 'game':
        return {
          icon: IconGame,
          label: 'Game',
          colors: 'bg-green-100 text-green-700'
        };
    }
  };

  const config = getTypeConfig(type);
  const Icon = config.icon;

  return (
    <div className={clsx(
      'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium',
      config.colors,
      className
    )}>
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </div>
  );
}