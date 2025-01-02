import Button from '@/components/buttons/Button'

interface IProps {
  icon: React.FC<React.SVGProps<SVGSVGElement>>
  onClick(): void
}

const IconButton = ({ icon: Icon, onClick }: IProps) => {
  return (
    <Button
      bgColor="bg-primary"
      className="w-[36px]"
      paddingClass="py-[11px]"
      rounded="rounded-lg"
      onClick={onClick}
    >
      <Icon className="mx-auto" />
    </Button>
  )
}

export default IconButton
