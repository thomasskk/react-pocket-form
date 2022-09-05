import React, { createContext, useContext } from 'react'
import type { UseFormReturn } from './types/index'

const HookFormContext = createContext<UseFormReturn | null>(null)

export const useFormContext = <T extends object = any>() =>
  useContext(HookFormContext) as unknown as UseFormReturn<T>

type Props<T extends object> = {
  children: React.ReactNode
} & UseFormReturn<T>

export const FormProvider = <T extends object = any>(props: Props<T>) => {
  const { children, ...rest } = props
  return (
    <HookFormContext.Provider value={rest}>{children}</HookFormContext.Provider>
  )
}
