interface IProps {
  sizeClass?: string
  color?: 'border-gray-100' | 'border-gray-900'
}

const Spinner = ({ sizeClass = 'h-10 w-10', color = 'border-gray-900' }: IProps) => (
  <div
    className={`${sizeClass} animate-spin rounded-full border-2 border-r-[transparent] ${color}`}
  />
)
export default Spinner
