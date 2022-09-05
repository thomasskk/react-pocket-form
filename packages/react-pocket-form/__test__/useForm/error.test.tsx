import React from 'react'
import { act, render, screen } from '@testing-library/react'
import { useForm } from '../../src/useForm'
import userEvent from '@testing-library/user-event'
import { describe, expect, test } from 'vitest'
import { UseFormReturn } from '../../src/index'

describe('useForm', () => {
  describe('error', () => {
    test('error message should disappear when typing the right value', async () => {
      let methods: UseFormReturn

      const Component = () => {
        methods = useForm()

        const err = methods.error('a')

        return (
          <>
            <input
              {...methods.register('a', {
                defaultValue: 'foo',
                validation: [
                  {
                    fn: (value) => value === 'bar',
                    message: 'error message',
                  },
                ],
              })}
            />
            {<div>{err?.[0]}</div>}
          </>
        )
      }

      render(<Component />)

      await act(async () => methods.handleSubmit()())

      expect(screen.queryByText('error message')).not.toBeNull()

      await userEvent.clear(screen.getByRole('textbox'))

      expect(screen.queryByText('error message')).not.toBeNull()

      await userEvent.type(screen.getByRole('textbox'), 'bar')

      expect(screen.queryByText('error message')).toBeNull()
    })

    test('error message should disappear when typing the right value', async () => {
      let methods: UseFormReturn

      const Component = () => {
        methods = useForm()

        const err = methods.error('a')

        return (
          <>
            <input
              {...methods.register('a', {
                defaultValue: 'foo',
                validation: (value) => value === 'bar',
                message: 'error message',
              })}
            />
            {<div>{err?.[0]}</div>}
          </>
        )
      }

      render(<Component />)

      await act(async () => methods.handleSubmit()())

      expect(screen.queryByText('error message')).not.toBeNull()

      await userEvent.clear(screen.getByRole('textbox'))

      expect(screen.queryByText('error message')).not.toBeNull()

      await userEvent.type(screen.getByRole('textbox'), 'bar')

      expect(screen.queryByText('error message')).toBeNull()
    })

    test('implicit required should display error', async () => {
      let methods: UseFormReturn

      const Component = () => {
        methods = useForm()

        const err = methods.error('a')

        return (
          <>
            <input {...methods.register('a')} required={true} />
            <div>{err?.[0]}</div>
          </>
        )
      }

      render(<Component />)

      await act(async () => methods.handleSubmit()())

      expect(screen.queryByText('Field required')).not.toBeNull()

      await userEvent.type(screen.getByRole('textbox'), 'bar')

      expect(screen.queryByText('Field required')).toBeNull()
    })
  })
})
