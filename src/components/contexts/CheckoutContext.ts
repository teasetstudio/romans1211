import { createContext, Dispatch, SetStateAction } from 'react'

interface ICheckoutContext {
  steps: {
    confirm: string
    payment: string
  }
  isSecondStep: boolean
  isPaymentStep: boolean
  isConfirmStep: boolean
  step: string
  activeStep: number
  setActiveStep: Dispatch<SetStateAction<number>>
}

export const checkoutSteps = {
  payment: 'payment-info',
  confirm: 'confirm',
}

export const CheckoutContext = createContext<ICheckoutContext>({
  steps: checkoutSteps,
  isSecondStep: false,
  isPaymentStep: false,
  isConfirmStep: false,
  step: '',
  activeStep: 1,
  setActiveStep: () => null,
})
