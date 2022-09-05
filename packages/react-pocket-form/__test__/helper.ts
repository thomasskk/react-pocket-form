import { renderHook } from '@testing-library/react'

export const renderHookWithCount = (hook: any) => {
  let count = 0
  const renderCount = () => count
  const result = renderHook(() => {
    count++
    return hook()
  })
  return { renderCount, ...result }
}
