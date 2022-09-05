export const clone = <T>(v: T): T =>
  typeof structuredClone === 'function' ? structuredClone(v) : v
