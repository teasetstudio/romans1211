import { useFormContext } from 'react-hook-form'

import Button from '@/components/buttons/Button'
import InputError from '@/components/inputs/InputError'
import H10 from '@/components/typo/H10'

import H9 from '../typo/H9'

interface IBasicProps {
  name: string
  placeholder?: string
  maxLength?: number
  btnLabel?: string
  onClick?(): void
  type?: 'text' | 'password'
}

interface IPropsWithoutBtn extends IBasicProps {
  btnLabel?: never
  onClick?: never
}

interface IPropsWithBtn extends IBasicProps {
  btnLabel: string
  onClick(): void
}

type IProps = IPropsWithBtn | IPropsWithoutBtn

const Input = ({
  name,
  maxLength,
  placeholder = '',
  btnLabel,
  onClick,
  type = 'text',
}: IProps) => {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext()

  const isError = errors[name]
  const value = watch(name)

  return (
    <div className="w-full">
      {isError && <InputError message={isError.message as string} />}

      <div className="relative">
        <input
          {...register(name)}
          maxLength={maxLength}
          type={type}
          className={`${
            onClick && btnLabel && 'pr-32'
          } p-4 w-full font-sans font-medium text-sm bg-gray5 border border-gray3 text-secondary rounded-lg`}
          placeholder={placeholder}
        />

        {onClick && btnLabel && (
          <Button
            rounded="rounded-lg"
            className="w-28 absolute right-2 top-1/2 transform -translate-y-2/4"
            paddingClass="p-3"
            bgColor="bg-primary"
            onClick={onClick}
          >
            <H9 color="text-white">{btnLabel}</H9>
          </Button>
        )}

        {maxLength && (
          <H10 className="absolute z-10 bottom-[10px] right-2">
            <span>{maxLength - (value ? value.length : 0)}</span>
          </H10>
        )}
      </div>
    </div>
  )
}

export default Input
