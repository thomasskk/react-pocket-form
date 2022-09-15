import { useRef, useState } from 'react'
import type {
  Element,
  GetValue,
  HandleSubmit,
  RefValue,
  SetDefaultValue,
  SetValue,
  UseFormProps,
  UseFormRegister,
  UseFormReturn,
} from './types/index'
import type { Path } from './types/utils'
import { clone } from './utils/clone'
import { createErrorStore } from './utils/errorStore'
import { get } from './utils/get'
import { set } from './utils/set'
import { unset } from './utils/unset'
import { useForceUpdate } from './utils/useForceUpdate'
import { useWatchErrors } from './utils/useWatchErrors'
import { useWatchValue } from './utils/useWatchValue'

export function useForm<T extends object = any>({
  isValidation = true,
  autoUnregister = false,
  resetOnSubmit = true,
  focusOnError = true,
  validation,
  defaultValue,
}: UseFormProps<T> = {}): UseFormReturn<T> {
  const forceUpdate = useForceUpdate()
  const [defaultFormValue, setDefaultFormValue] = useState(clone(defaultValue))

  const watchStore = useRef(new Map<string, () => void>()).current

  const resetRef = useRef({ c: 0 }).current

  const formValue = useRef({ c: defaultFormValue ?? {} }).current

  const formErrorsStore = useRef(createErrorStore()).current

  const refStore = useRef(new Map<Path<T>, RefValue<T, Path<T>>>()).current

  const dirtyRefStore = useRef(new Set<string>()).current

  const reset = () => {
    formValue.c = defaultFormValue ?? {}
    formErrorsStore.g.clear()
    formErrorsStore.i.clear()
    formErrorsStore.m.clear()
    refStore.clear()
    dirtyRefStore.clear()
    resetRef.c += 1
    forceUpdate()
  }

  const setDefaultValue: SetDefaultValue<T> = (value) => {
    const clonedValue = clone(value)
    formValue.c = clonedValue
    setDefaultFormValue(clonedValue)
  }

  const getAllValue = () => {
    return clone(formValue.c) as T
  }

  const getValue: GetValue<T> = (path) => {
    return clone(get(formValue.c, path))
  }

  const setValue: SetValue<T> = (name, value) => {
    dirtyRefStore.add(name)
    return set(formValue.c, name, clone(value))
  }

  const validate = async (
    path: Path<T>,
    ref: RefValue<T, Path<T>>,
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
      formErrorsStore.m.delete(path)
    } else {
      formErrorsStore.m.set(path, mssg)
    }

    formErrorsStore.i.get(path)?.()

    return isValid
  }

  const validateAll = async () => {
    let isValid = true

    formErrorsStore.m.clear()

    await Promise.all(
      [...refStore.entries()].map(async (entry) => {
        if (!(await validate(entry[0], entry[1], getAllValue()))) {
          isValid = false
        }
      })
    )

    if (!isValid) {
      formErrorsStore.updateGlobal()
    }

    return isValid
  }

  const setFormValue = <N extends Path<T>>(
    { elements, type, transform }: RefValue<T, N>,
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
      if (focusOnError) {
        refStore
          .get(formErrorsStore.m.keys().next().value)
          ?.elements?.values()
          .next()
          .value?.focus()
      }

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

    const isDirty = dirtyRefStore.has(name)
    let defaultValue = options.defaultValue ?? get(defaultFormValue, name)

    if (!autoUnregister) {
      defaultValue = isDirty ? getValue(name) ?? defaultValue : defaultValue
    }

    const onEventValidate = async (ref: any, eventType: string) => {
      const isPrevError = formErrorsStore.m.has(name)

      const isRevalidate = isPrevError && revalidateOn === eventType
      const isValidate = validateOn === eventType && !isPrevError

      if (isValidation && (isRevalidate || isValidate)) {
        await validate(name, ref, getAllValue())
        formErrorsStore.updateGlobal()
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
        const ref = refStore.get(name)

        if (!ref) {
          return
        }

        onEventValidate(ref, 'blur')

        await onBlur?.(event.currentTarget, getValue(name))
      },
      onChange: async (event) => {
        const ref = refStore.get(name)

        if (!ref) {
          return
        }

        setFormValue(ref, name)
        dirtyRefStore.delete(name)

        onEventValidate(ref, 'change')

        watchStore.get(name)?.()

        await onChange?.(event.currentTarget, getValue(name))
      },
      ref: async (element: Element, overrideValue?: any) => {
        const refValue = refStore.get(name)
        // overrideValue is useful when you register only once for a radio group and want to track the input using ref returned from register otherwise the elementId would be the same for all the input
        const refElementId = name + overrideValue ?? value

        if (!element) {
          if (autoUnregister && refValue?.elements.get(refElementId)) {
            dirtyRefStore.delete(name)
          }

          refValue?.elements.delete(refElementId)

          if (autoUnregister && refValue?.elements.size === 0) {
            refStore.delete(name)
            unset(formValue.c, name)
          }

          return onUnmount?.(element)
        }

        if (!refValue) {
          const newRef = {
            elements: new Map([[refElementId, element]]),
            defaultValue,
            type,
            validation,
            required,
            transform,
            message,
          }
          // @ts-expect-error type
          refStore.set(name, newRef)
          !isDirty && setFormValue(newRef, name)
        } else {
          refValue.elements.set(refElementId, element)
          !isDirty && setFormValue(refValue, name)
        }

        await onMount?.(element, getValue(name))
      },
    }
  }

  return {
    register,
    reset,
    watch: (path, opts) => {
      return useWatchValue(path, watchStore, formValue, opts?.defaultValue)
    },
    errors: () => {
      return useWatchErrors(formErrorsStore, resetRef.c)
    },
    error: (path) => {
      return useWatchErrors(formErrorsStore, resetRef.c, path)
    },
    handleSubmit,
    setValue,
    getValue,
    getAllValue,
    setDefaultValue,
  }
}
