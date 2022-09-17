import { useEffect } from 'react'
import { clone } from './clone'
import { get } from './get'
import { useForceUpdate } from './useForceUpdate'

export const useWatchValue = (
  path: string,
  watchStore: Map<string, () => void>,
  formValue: { c: any },
  defaultValue: any,
  resetRef: number
) => {
  const forceUpdate = useForceUpdate()

  useEffect(() => {
    watchStore.set(path, forceUpdate)
    return () => {
      watchStore.delete(path)
    }
  }, [resetRef])

  return clone(get(formValue.c, path)) ?? defaultValue
}
