import { useEffect, useReducer } from 'react'
import { ErrorStore } from './errorStore'

export const errorsWatcher = (
  store: ErrorStore,
  resetRef: number,
  name = ''
) => {
  const forceUpdate = useReducer((c) => c + 1, 0)[1]

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
