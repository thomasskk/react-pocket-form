import { useEffect, useReducer } from 'react'
import { clone } from './clone'
import { get } from './get'

export const watcher = (
  path: string,
  watchStore: Map<string, () => void>,
  formValue: { c: any },
  defaultValue: any
) => {
  const forceUpdate = useReducer((c) => c + 1, 0)[1]

  useEffect(() => {
    watchStore.set(path, forceUpdate)
    return () => {
      watchStore.delete(path)
    }
  }, [])

  return clone(get(formValue.c, path)) ?? defaultValue
}
