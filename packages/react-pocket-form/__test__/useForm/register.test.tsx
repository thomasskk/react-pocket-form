import { render, renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, test } from 'vitest'
import { useForm } from '../../src/useForm'

describe('useForm', () => {
  describe('register', () => {
    test('input should get defaultvalue as value', () => {
      const { result } = renderHook(() =>
        useForm({
          defaultValue: { a: { b: 1 } },
        })
      )

      expect(result.current.register('a.b').defaultValue).toEqual(1)
    })

    test('register defaultValue should override global defaultValue', () => {
      const { result } = renderHook(() =>
        useForm({
          defaultValue: { a: { b: 1 } },
        })
      )

      expect(
        result.current.register('a.b', {
          defaultValue: 2,
        }).defaultValue
      ).toEqual(2)
    })

    test('should set an array of value when type is checkbox', async () => {
      let methods: any

      const Component = () => {
        methods = useForm()

        return (
          <>
            <input
              {...methods.register('a.b', {
                type: 'checkbox',
                value: 1,
                defaultChecked: true,
                transform: Number,
              })}
            />
            <input
              {...methods.register('a.b', {
                type: 'checkbox',
                value: 2,
                defaultChecked: true,
                transform: Number,
              })}
            />
          </>
        )
      }

      render(<Component />)

      expect(methods.getAllValue()).toEqual({ a: { b: [1, 2] } })

      await userEvent.click(screen.getAllByRole('checkbox')[0])

      expect(methods.getAllValue()).toEqual({ a: { b: [2] } })

      await userEvent.click(screen.getAllByRole('checkbox')[1])

      expect(methods.getAllValue()).toEqual({ a: { b: [] } })

      await userEvent.click(screen.getAllByRole('checkbox')[0])

      expect(methods.getAllValue()).toEqual({ a: { b: [1] } })
    })

    test('should set default value on remount when autoUnregister=false', () => {
      const { result, unmount } = renderHook(() =>
        useForm({
          autoUnregister: false,
          defaultValue: { a: 1 },
        })
      )

      result.current.register('a')

      result.current.setValue('a', 2)

      unmount()

      result.current.register('a')

      expect(result.current.getAllValue()).toEqual({ a: 2 })
    })

    test('should set default value on remount when autoUnregister=false', () => {
      const { result, unmount } = renderHook(() =>
        useForm({
          autoUnregister: false,
          defaultValue: { a: 1 },
        })
      )

      result.current.register('a')

      result.current.setValue('a', 2)

      unmount()

      result.current.register('a')

      expect(result.current.getAllValue()).toEqual({ a: 2 })
    })
  })
})
