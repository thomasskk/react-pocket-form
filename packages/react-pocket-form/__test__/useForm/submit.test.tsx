import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { act, render } from '@testing-library/react'
import { useForm } from '../../src/useForm'
import { UseFormReturn } from '../../src/index'

describe('useForm', () => {
  describe('submit', () => {
    test('data should reset after submit', async () => {
      let methods!: UseFormReturn

      const Component = () => {
        methods = useForm()

        return <input {...methods.register('a.b')} />
      }

      render(<Component />)

      methods.setValue('a.b', true)

      await act(async () => {
        await methods.handleSubmit((data) => {
          expect(data).toEqual({ a: { b: true } })
        })()
        expect(methods.getAllValue()).toEqual({})
      })
    })

    test('data should not reset resetOnSubmit=false', async () => {
      let methods!: UseFormReturn

      const Component = () => {
        methods = useForm({
          resetOnSubmit: false,
        })

        return <input {...methods.register('a.b')} />
      }

      render(<Component />)

      methods.setValue('a.b', false)

      await methods.handleSubmit((data) => {
        expect(data).toEqual({ a: { b: false } })
      })()

      expect(methods.getAllValue()).toEqual({ a: { b: false } })
    })

    test('bypass errors when isValidation=false', async () => {
      let methods!: UseFormReturn

      const Component = () => {
        methods = useForm({
          isValidation: false,
        })

        return (
          <input
            {...methods.register('a.b', {
              validation: [
                {
                  fn: (v) => v === true,
                  message: 'a.b must be true',
                },
              ],
            })}
          />
        )
      }

      render(<Component />)

      methods.setValue('a.b', false)

      const cb = vi.fn()

      await act(async () => methods.handleSubmit(cb)())

      expect(cb).toHaveBeenCalledTimes(1)
    })

    test('lock submit on errors by defaut', async () => {
      let methods!: UseFormReturn

      const cb = vi.fn()

      const Component = () => {
        methods = useForm()

        return (
          <input
            {...methods.register('a.b', {
              validation: [
                {
                  fn: (v) => v === true,
                  message: 'a.b must be true',
                },
              ],
            })}
          />
        )
      }

      render(<Component />)

      methods.setValue('a.b', false)

      await methods.handleSubmit(cb)()

      expect(cb).toHaveBeenCalledTimes(0)
    })

    test('async validation', async () => {
      let methods: UseFormReturn

      const cb = vi.fn()

      const Component = () => {
        methods = useForm()

        return (
          <input
            {...methods.register('a.b', {
              validation: [
                {
                  fn: async () => {
                    await new Promise((resolve) => setTimeout(resolve, 1))
                    return false
                  },
                  message: 'validated',
                },
              ],
            })}
          />
        )
      }

      render(<Component />)

      await act(async () => methods.handleSubmit(cb)())

      expect(cb).toHaveBeenCalledTimes(0)
    })
  })
})
