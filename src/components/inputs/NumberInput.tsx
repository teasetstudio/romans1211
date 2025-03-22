import { useFormContext } from 'react-hook-form'
import InputError from '@/components/inputs/InputError'

interface NumberInputProps {
  name: string
  placeholder?: string
  maxLength?: number
  min?: number
  max?: number
}

const NumberInput = ({
  name,
  maxLength,
  placeholder = '',
  min,
  max,
}: NumberInputProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  const isError = errors[name]

  return (
    <div className="w-full">
      {isError && <InputError message={isError.message as string} />}

      <div className="relative">
        <input
          type="number"
          {...register(name, { valueAsNumber: true })}
          placeholder={placeholder}
          maxLength={maxLength}
          min={min}
          max={max}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </div>
  )
}

export default NumberInput
