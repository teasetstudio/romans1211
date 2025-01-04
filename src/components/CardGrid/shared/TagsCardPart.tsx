import { ITag } from '@/types/Tag';

interface IProps {
  tags?: ITag[];
}

const TagsCardPart = ({ tags }: IProps) => {
  return (
    <>
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
    </>
  )
}

export default TagsCardPart