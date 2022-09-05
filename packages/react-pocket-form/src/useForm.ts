import { useReducer, useRef, useState } from 'react'
import type {
  Element,
  GetValue,
  HandleSubmit,
  RefElValue,
  SetDefaultValue,
  SetValue,
  UseFormProps,
  UseFormRegister,
  UseFormReturn,
  Watch,
} from './types/index'
import type { Path } from './types/utils'
import { clone } from './utils/clone'
import { createErrorStore } from './utils/errorStore'
import { errorsWatcher } from './utils/errorsWatcher'
import { get } from './utils/get'
import { set } from './utils/set'
import { unset } from './utils/unset'
import { watcher } from './utils/watcher'

export function useForm<T extends object = any>({
  isValidation = true,
  autoUnregister = false,
  resetOnSubmit = true,
  validation,
  defaultValue,
}: UseFormProps<T> = {}): UseFormReturn<T> {
  const forceUpdate = useReducer((c) => c + 1, 0)[1]
  const [defaultFormValue, setdefaultFormValue] = useState(clone(defaultValue))

  const watchStore = useRef(new Map<string, () => void>()).current

  const resetRef = useRef({ c: 0 }).current

  const formValue = useRef({ c: defaultFormValue ?? {} }).current

  const formErrors = useRef(createErrorStore()).current

  const isDefaultSet = useRef({ c: false }).current

  const refEl = useRef(new Map<Path<T>, RefElValue<T, Path<T>>>()).current

  const isDirty = useRef(new Set<string>()).current

  const reset = () => {
    formValue.c = defaultFormValue ?? {}
    isDefaultSet.c = false
    formErrors.g.clear()
    formErrors.i.clear()
    formErrors.m.clear()
    refEl.clear()
    isDirty.clear()
    resetRef.c += 1
    forceUpdate()
  }

  const setDefaultValue: SetDefaultValue<T> = (value) => {
    if (!isDefaultSet.c) {
      isDefaultSet.c = true
      const clonedValue = clone(value)
      formValue.c = clonedValue
      setdefaultFormValue(clonedValue)
    }
  }

  const getAllValue = () => {
    return clone(formValue.c as T)
  }

  const getValue: GetValue<T> = (path) => {
    return clone(get(formValue.c, path))
  }

  const setValue: SetValue<T> = (name, value) => {
    isDirty.add(name)
    return set(formValue.c, name, clone(value))
  }

  const validate = async (
    path: Path<T>,
    ref: RefElValue<T, Path<T>>,
    values: T
  ) => {
    const mssg: string[] = []
    const value = getValue(path)
    const isRequired =
      ref.required || [...ref.elements.values()].some((el) => el?.required)

    if (typeof ref.validation === 'function') {
      ref.validation = [{ fn: ref.validation, message: ref.message }]
    }

    await Promise.all(
      ref.validation.map(async ({ fn, message }) => {
        !(await fn(value, values)) && mssg.push(message || 'Validation failed')
      })
    )

    if (validation) {
      const errMssg = (await validation(path, getAllValue())).errors.get(path)
      errMssg && mssg.push(errMssg)
    }

    if (isRequired && (value === '' || value === undefined || value === null)) {
      mssg.push(typeof isRequired === 'string' ? isRequired : 'Field required')
    }

    const isValid = mssg.length === 0

    if (isValid) {
      formErrors.m.delete(path)
    } else {
      formErrors.m.set(path, mssg)
    }

    formErrors.i.get(path)?.()

    return isValid
  }

  const validateAll = async () => {
    let isValid = true

    formErrors.m.clear()

    await Promise.all(
      [...refEl.entries()].map(async (entry) => {
        if (!(await validate(entry[0], entry[1], getAllValue()))) {
          isValid = false
        }
      })
    )

    if (!isValid) {
      formErrors.updateGlobal()
    }

    return isValid
  }

  const watch: Watch<T> = (path, opts) => {
    return watcher(path, watchStore, formValue, opts?.defaultValue)
  }

  const setFormValue = <N extends Path<T>>(
    { elements, type, transform }: RefElValue<T, N>,
    name: N
  ) => {
    const value: Map<string, unknown> = new Map()
    const isRadio = type === 'radio'

    for (const [key, element] of elements as Map<string, HTMLInputElement>) {
      const v = element.value ?? element.defaultValue

      if (type === 'checkbox') {
        if (element?.checked) {
          value.set(key, transform(v, element))
        } else {
          value.delete(key)
        }
        continue
      }

      if (isRadio) {
        if (element?.checked) {
          return set(formValue.c, name, transform(v, element))
        }
        continue
      }

      return set(formValue.c, name, transform(v, element))
    }

    if (isRadio) {
      return
    }

    set(formValue.c, name, [...value.values()])
  }

  const handleSubmit: HandleSubmit<T> = (callback) => async (e) => {
    e?.preventDefault?.()

    if (isValidation && !(await validateAll())) {
      return
    }

    await callback?.(getAllValue(), e)

    resetOnSubmit && reset()
  }

  const register: UseFormRegister<T> = (name, options = {}) => {
    const {
      type = 'text',
      onChange,
      onBlur,
      transform = (v) => v,
      defaultChecked,
      value,
      revalidateOn = 'change',
      validateOn = 'submit',
      validation = [],
      required,
      message,
      onUnmount,
      onMount,
    } = options

    const isDirtyBool = isDirty.has(name)
    let defaultValue = options.defaultValue ?? get(defaultFormValue, name)

    if (!autoUnregister) {
      defaultValue = isDirtyBool ? getValue(name) ?? defaultValue : defaultValue
    }

    const onEventValidate = async (ref: any, on: string) => {
      const isPrevError = formErrors.m.has(name)

      const isRevalidate = isPrevError && revalidateOn === on
      const isValidate = validateOn === on && !isPrevError

      if (isValidation && (isRevalidate || isValidate)) {
        await validate(name, ref, getAllValue())
        formErrors.updateGlobal()
      }
    }

    return {
      ...{
        type,
        name,
        defaultChecked,
        required: !!required,
        value: value as any,
        defaultValue:
          type === 'checkbox' || type === 'radio' ? undefined : defaultValue,
      },
      onBlur: async (event) => {
        const ref = refEl.get(name)

        if (!ref) {
          return
        }
        onEventValidate(ref, 'blur')

        await onBlur?.(event.currentTarget, getValue(name))
      },
      onChange: async (event) => {
        const ref = refEl.get(name)

        if (!ref) {
          return
        }

        setFormValue(ref, name)
        isDirty.delete(name)

        onEventValidate(ref, 'change')

        watchStore.get(name)?.()

        await onChange?.(event.currentTarget, getValue(name))
      },
      ref: async (element: Element) => {
        const refElValue = refEl.get(name)
        const id = name + value

        if (!element) {
          autoUnregister && refElValue?.elements.get(id) && isDirty.delete(name)

          refElValue?.elements.delete(id)

          if (autoUnregister && refElValue?.elements.size === 0) {
            refEl.delete(name)
            unset(formValue.c, name)
          }

          return onUnmount?.(element)
        }

        if (!refElValue) {
          const newRef = {
            elements: new Map([[id, element]]),
            defaultValue,
            type,
            validation,
            required,
            transform,
            message,
          }
          // @ts-expect-error type
          refEl.set(name, newRef)
          !isDirtyBool && setFormValue(newRef, name)
        } else {
          refElValue.elements.set(id, element)
          !isDirtyBool && setFormValue(refElValue, name)
        }

        await onMount?.(element, getValue(name))
      },
    }
  }

  return {
    register,
    reset,
    watch,
    errors: () => errorsWatcher(formErrors, resetRef.c),
    error: (path) => errorsWatcher(formErrors, resetRef.c, path),
    handleSubmit,
    setValue,
    getValue,
    getAllValue,
    setDefaultValue,
  }
}
