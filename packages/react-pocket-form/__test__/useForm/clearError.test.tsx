import { act, render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, test } from 'vitest'
import { UseFormReturn } from '../../src'
import { useForm } from '../../src/useForm'

describe('clearError', () => {
  test('error should disappear', async () => {
    let methods: UseFormReturn

    const Component = () => {
      methods = useForm()

      const err = methods.error('a')

      return (
        <>
          <input
            {...methods.register('a', {
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

    await act(async () => methods.clearError('a'))

    expect(screen.queryByText('error message')).toBeNull()
  })
})
