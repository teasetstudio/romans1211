import axios from 'axios'

import { IApiError } from '@/types/ApiError'

// TODO: Implement custom types
export const errorHandler = (error: any): IApiError => {
  if (axios.isAxiosError(error)) {
    return {
      code: error.response?.status,
      message: error.response?.statusText,
    }
  }
  return {
    code: 0,
    message: 'Undefined error',
  }
}
