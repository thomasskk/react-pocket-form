export type ErrorStore = ReturnType<typeof createErrorStore>

export const createErrorStore = () => {
  const i = new Map<string, () => void>() // atomic error
  const m = new Map<string, string[]>() // messages store
  const g = new Map<string, () => void>() // global error
  return {
    i,
    m,
    g,
    setGlobal: (key: string, cb: () => void) => g.set(key, cb),
    set: (key: string, cb: () => void) => i.set(key, cb),
    updateGlobal: () => g.forEach((v) => v()),
    delete: (key: string) => {
      m.delete(key)
      i.delete(key)
    },
    resetAndUpdate: () => {
      m.clear()
      i.forEach((v) => v())
    },
  }
}
