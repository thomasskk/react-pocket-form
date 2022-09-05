import { dotPathReader } from './dotPathReader'
import { isObject } from './isHelper'

export const set = (
  object: Record<string | symbol, any>,
  path: string,
  value?: unknown,
  offset = 1
) => {
  const arrPath = dotPathReader(path)
  const length = arrPath.length

  arrPath.reduce((acc, cv, index) => {
    switch (true) {
      case index === length - offset:
        if (value !== undefined) {
          acc[cv] = value
        } else {
          delete acc[cv]
        }
        break
      case isObject(acc[cv]) || Array.isArray(acc[cv]):
        break
      case typeof arrPath[index + 1] === 'number':
        acc[cv] = []
        break
      default:
        acc[cv] = {}
    }

    return acc[cv]
  }, object)
}
