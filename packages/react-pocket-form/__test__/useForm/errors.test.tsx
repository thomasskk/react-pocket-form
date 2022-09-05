import React from 'react'
import { act, render, screen } from '@testing-library/react'
import { useForm } from '../../src/useForm'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'
import { UseFormReturn } from '../../src/index'

describe('useForm', () => {
  describe('errors', () => {
    test('error messages should disappear when typing the right value', async () => {
      let methods: UseFormReturn

      const cb = vi.fn()

      const Component = () => {
        methods = useForm()

        const errs = methods.errors()
        return (
          <>
            <input
              {...methods.register('a', {
                validation: (value) => value === 'bar',
                message: 'error a',
              })}
            />
            {errs.a && <div>{errs.a[0]}</div>}
            <input
              {...methods.register('b', {
                validation: [
                  {
                    fn: (value) => value === 'bar',
                    message: 'error b',
                  },
                ],
              })}
            />
            {errs.b && <div>{errs.b[0]}</div>}
          </>
        )
      }
      render(<Component />)

      expect(screen.queryByText('error a')).toBeNull()
      expect(screen.queryByText('error b')).toBeNull()

      await act(async () => methods.handleSubmit()())

      expect(screen.queryByText('error a')).toBeTruthy()
      expect(screen.queryByText('error b')).toBeTruthy()

      const inputA = screen.getAllByRole('textbox')[0]
      const inputB = screen.getAllByRole('textbox')[1]

      await userEvent.type(inputA, 'bar')

      expect(screen.queryByText('error a')).toBeNull()

      await userEvent.type(inputB, 'bar')

      expect(screen.queryByText('error a')).toBeNull()

      await act(async () => methods.handleSubmit(cb())())

      expect(cb).toHaveBeenCalledTimes(1)

      expect(screen.queryByText('error a')).toBeNull()
      expect(screen.queryByText('error b')).toBeNull()
    })

    test('error messages should disappear when typing the right value with global validation', async () => {
      let methods: UseFormReturn

      const cb = vi.fn()

      const Component = () => {
        methods = useForm({
          validation: (path, value) => {
            const map = new Map()
            if (value[path] !== 'bar') {
              map.set(path, `error ${path}`)
            }
            return { errors: map }
          },
        })

        const errs = methods.errors()
        return (
          <>
            <input {...methods.register('a')} />
            {errs.a?.[0] && <div>{errs.a[0]}</div>}
            <input {...methods.register('b')} />
            {errs.b?.[0] && <div>{errs.b[0]}</div>}
          </>
        )
      }
      render(<Component />)

      expect(screen.queryByText('error a')).toBeNull()
      expect(screen.queryByText('error b')).toBeNull()

      await act(async () => methods.handleSubmit()())

      expect(screen.queryByText('error a')).toBeTruthy()
      expect(screen.queryByText('error b')).toBeTruthy()

      const inputA = screen.getAllByRole('textbox')[0]
      const inputB = screen.getAllByRole('textbox')[1]

      await userEvent.type(inputA, 'bar')

      expect(screen.queryByText('error a')).toBeNull()

      await userEvent.type(inputB, 'bar')

      expect(screen.queryByText('error a')).toBeNull()

      await act(async () => methods.handleSubmit(cb())())

      expect(cb).toHaveBeenCalledTimes(1)

      expect(screen.queryByText('error a')).toBeNull()
      expect(screen.queryByText('error b')).toBeNull()
    })

    test('validation depending on other field', async () => {
      let methods!: UseFormReturn

      const Component = () => {
        methods = useForm()

        const errs = methods.errors()

        return (
          <>
            <input {...methods.register('a')} />
            <input
              {...methods.register('b', {
                validation: [
                  {
                    fn: (v, { a }) => v === a,
                    message: 'b must be equal to a',
                  },
                ],
              })}
            />
            {errs.b && <div>{errs.b[0]}</div>}
          </>
        )
      }

      const { unmount } = render(<Component />)

      methods.setValue('b', 'bar')

      await act(async () => methods.handleSubmit()())

      expect(screen.queryByText('b must be equal to a')).not.toBeNull()

      methods.setValue('a', 'bar')

      await act(async () => methods.handleSubmit()())

      expect(screen.queryByText('b must be equal to a')).toBeNull()
    })
  })
})
