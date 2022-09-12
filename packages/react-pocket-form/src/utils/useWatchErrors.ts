import { useEffect } from 'react'
import { ErrorStore } from './errorStore'
import { useForceUpdate } from './useForceUpdate'

export const useWatchErrors = (
  store: ErrorStore,
  resetRef: number,
  name = ''
) => {
  const forceUpdate = useForceUpdate()

  useEffect(() => {
    if (name) {
      store.set(name, forceUpdate)
    } else {
      store.setGlobal(name, forceUpdate)
    }
    return () => {
      if (name) {
        store.delete(name)
      }
    }
  }, [resetRef])

  return name ? store.m.get(name) : (Object.fromEntries(store.m) as any)
}
