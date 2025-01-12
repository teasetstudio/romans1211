interface IProps {
  className: string
}

// className must contain width, height and position (etc top, left) classes
const Gradient = ({ className = '' }: IProps) => {
  return (
    <div
      className={`absolute ${className} bg-gradient-radial from-gray-600 via-transparent to-transparent`}
    />
  )
}

export default Gradient
