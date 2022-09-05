export const isObject = <T extends object>(value: unknown): value is T =>
  typeof value === 'object' && !Array.isArray(value) && value !== null
