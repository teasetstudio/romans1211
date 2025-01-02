import H9 from '@/components/typo/H9'

interface IProps {
  text: string
  className?: string
}

const TagBadge = ({ text, className }: IProps) => {
  return (
    <H9
      color="text-gray1"
      className={`${className} inline-block p-1 small:p-2 border border-gray3 rounded small:rounded-lg`}
    >
      {text}
    </H9>
  )
}

export default TagBadge
