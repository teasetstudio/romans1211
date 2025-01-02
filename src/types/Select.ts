import React from "react"

export type OptionValue = string | number

export type Option<T extends OptionValue> = {
  value: T
  label: string
}

export type SelectProps<T extends OptionValue> = {
  children: React.ReactNode
  value: Option<T>
  onChange: (value: Option<T>) => void
  placeholder: string
}

export interface TSelectItem {
  value: string
  label: string
}
