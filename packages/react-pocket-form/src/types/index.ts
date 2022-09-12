import type { ChangeEvent, HTMLInputTypeAttribute } from 'react'
import type { DeepPartial, Path, PropertyType } from './utils'

export type Primitive =
  | boolean
  | string
  | number
  | symbol
  | null
  | bigint
  | undefined

export type eventEl =
  | ChangeEvent<HTMLInputElement>
  | ChangeEvent<HTMLTextAreaElement>
  | ChangeEvent<HTMLSelectElement>
  | ChangeEvent<null>

export type SchemaValidation<T = any> = <P extends Path<T>>(
  path: P,
  value: T
) =>
  | Promise<{
      errors: Map<string, string>
      type?: T
    }>
  | {
      errors: Map<string, string>
      type?: T
    }

export type UseFormProps<T extends object = any> = {
  defaultValue?: DeepPartial<T>
  autoUnregister?: boolean
  resetOnSubmit?: boolean
  focusOnError?: boolean
  isValidation?: boolean
  validation?: SchemaValidation<T>
}

export type SetValue<T> = <P extends Path<T>>(
  path: P,
  value: PropertyType<T, P>
) => void
export type GetValue<T> = <P extends Path<T>>(path: P) => PropertyType<T, P>
export type SetDefaultValue<T> = (value: DeepPartial<T>) => void

export type Error<T> = (path: Path<T>) => string[] | undefined
export type Errors<T> = () => Record<Path<T>, string[] | undefined>

export type Watch<T extends object> = <P extends Path<T>>(
  path: P,
  opts?: { defaultValue: PropertyType<T, P> }
) => PropertyType<T, P>

export type UseFormReturn<T extends object = any> = {
  register: UseFormRegister<T>
  reset: () => void
  error: Error<T>
  errors: Errors<T>
  handleSubmit: HandleSubmit<T>
  getValue: GetValue<T>
  setValue: SetValue<T>
  getAllValue: () => T
  setDefaultValue: SetDefaultValue<T>
  watch: Watch<T>
}

export type DefaultValue = string | number | undefined

export type ValueAs =
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | ((value: unknown) => unknown)
  | (() => void)

type ValidationArray<T, P extends Path<T>> = {
  fn: (v: PropertyType<T, P>, values: T) => boolean | Promise<boolean>
  message?: string
}[]

type ValidationFn<T, P extends Path<T>> = (
  v: PropertyType<T, P>,
  values: T
) => boolean | Promise<boolean>

export type UseFormRegisterOptions<T = any, P extends Path<T> = any> = {
  type?: InputType
  defaultValue?: PropertyType<T, P>
  validateOn?: 'change' | 'blur' | 'submit'
  revalidateOn?: 'change' | 'submit' | 'blur'
  onChange?: (
    element: Element,
    value?: PropertyType<T, P>
  ) => void | Promise<void>
  onBlur?: (
    element: Element,
    value?: PropertyType<T, P>
  ) => void | Promise<void>
  onMount?: (
    element: Element,
    value?: PropertyType<T, P>
  ) => void | Promise<void>
  onUnmount?: (element: Element) => void | Promise<void>
  defaultChecked?: boolean
  transform?: (value: PropertyType<T, P>, el?: Element) => unknown
  value?: PropertyType<T, P>
  validation?: ValidationFn<T, P> | ValidationArray<T, P>
  message?: string
  required?: string | boolean
}

export type UseFormRegister<T = any> = <P extends Path<T>>(
  name: P,
  options?: UseFormRegisterOptions<T, P>
) => UseFormRegisterReturn<T, P>

export type UseFormRegisterReturn<T = any, P extends Path<T> = any> = {
  onChange: (event: eventEl, value?: PropertyType<T, P>) => Promise<void> | void
  onBlur: (event: eventEl, value?: PropertyType<T, P>) => Promise<void> | void
  ref: (el: Element) => void
  name: string
  defaultValue?: string | number | readonly string[] | undefined
  type: InputType
  defaultChecked?: boolean
  value: string | number | readonly string[] | undefined
  required?: boolean
}

export type SubmitHandler<T> = (data: T) => void

export type HandleSubmit<T = any> = (
  cb?: (data: T, e?: React.BaseSyntheticEvent) => Promise<void> | void
) => (event?: React.BaseSyntheticEvent) => Promise<void>

export type InputType = HTMLInputTypeAttribute | 'textarea' | 'select'

export type Element =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement
  | null

export type RefValue<T, P extends Path<T>> = {
  defaultValue: object
  elements: Map<string, Element>
  type: InputType
  validation: ValidationArray<T, P> | ValidationFn<T, P>
  message?: string
  required?: string | boolean
  transform: (value: any, el?: Element) => any
}
