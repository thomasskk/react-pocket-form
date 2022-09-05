import * as z from 'zod'

export const dotPathReader = (path: string) =>
  path
    .split('.')
    .map((v) =>
      v.charAt(0) === '[' && v.charAt(v.length - 1) === ']'
        ? +v.slice(1, -1)
        : v
    )

export const resolver =
  <T extends z.Schema>(schema: T) =>
  (path: string, value: any) => {
    const errors = new Map()

    const parsedRes = schema.safeParse(value)

    if (!parsedRes.success) {
      const parsedPath = dotPathReader(path)
      for (const err of parsedRes.error.errors) {
        if (err.path === parsedPath) {
          errors.set(path, err.message)
          break
        }
      }
    }

    return { errors } as {
      errors: Map<string, string>
      type: z.TypeOf<T>
    }
  }
