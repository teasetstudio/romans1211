import React from 'react'

import useErrorMessage from '@/hooks/useErrorMessage'

type UnboxPromise<T extends Promise<any>> = T extends Promise<infer U>
  ? U
  : never

type ExpectedType = (args: any) => Promise<any>

export interface ApiCall<T extends ExpectedType> {
  isLoading: boolean
  data: UnboxPromise<ReturnType<T>> | null
  error: string
  call: (...args: Parameters<T>) => void
}

type State<T extends ExpectedType> = {
  isLoading: boolean
  data: UnboxPromise<ReturnType<T>> | null
  error: string
}

interface ApiCallOptions<T extends ExpectedType> {
  initial?: Partial<State<T>>
  onSuccess: (data: UnboxPromise<ReturnType<T>>) => void
  onError?: (error: any) => void
}

export const useApiCall = <T extends ExpectedType>(
  callback: T,
  options?: ApiCallOptions<T>
): ApiCall<T> => {
  const { initial, onSuccess, onError } = options || {}
  const [data, setData] = React.useState<State<T>>({
    isLoading: initial?.isLoading || false,
    data: initial?.data || null,
    error: initial?.error || '',
  })
  const { getErrorMessage } = useErrorMessage()

  const call = React.useCallback(
    (params: UnboxPromise<ReturnType<T>>) => {
      if (data.isLoading) {
        return
      }

      setData({
        isLoading: true,
        data: null,
        error: '',
      })

      callback(params)
        .then((data: any) => {
          setData({
            isLoading: false,
            data,
            error: '',
          })
          if (onSuccess) {
            onSuccess(data)
          }
        })
        .catch((e: any) => {
          setData({
            isLoading: false,
            data: null,
            error: getErrorMessage(e),
          })

          if (onError) {
            onError(e)
          }
        })
    },
    [callback, data.isLoading, onSuccess, onError, getErrorMessage]
  )

  return {
    ...data,
    call,
  }
}
