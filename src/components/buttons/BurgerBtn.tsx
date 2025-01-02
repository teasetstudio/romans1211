interface IProps {
  isOpen: boolean
  onClick(): void
  className?: string
}

const BurgerBtn = ({ isOpen, onClick, className }: IProps) => {
  const classes = 'absolute left-0 w-full h-[2px] bg-white transition transform'

  return (
    <button
      onClick={onClick}
      className={`${className} relative w-4 h-3 bg-transparent border-0 outline-none`}
    >
      <span
        className={`${classes} top-0 ${
          isOpen ? 'rotate-45 translate-y-[5px]' : 'rotate-0 translate-y-0'
        }`}
      />
      <span
        className={`${classes} top-1/2 -translate-y-1/2 ${
          isOpen ? 'opacity-0' : 'opacity-100'
        }`}
      />
      <span
        className={`${classes} bottom-0 ${
          isOpen ? '-rotate-45 translate-y-[-5px]' : 'rotate-0 translate-y-0'
        }`}
      />
    </button>
  )
}

export default BurgerBtn
