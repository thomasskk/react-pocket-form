import { useEffect } from 'react'
import { ErrorStore } from '../types'
import { useForceUpdate } from './useForceUpdate'

export const useWatchErrors = (
  store: ErrorStore,
  resetRef: number,
  name = ''
) => {
  const forceUpdate = useForceUpdate()

  useEffect(() => {
    store[name ? 'i' : 'g'].set(name, forceUpdate)
    return () => {
      if (name) {
        store.m.delete(name)
        store.i.delete(name)
      }
    }
  }, [resetRef])

  return name ? store.m.get(name) : (Object.fromEntries(store.m) as any)
}
