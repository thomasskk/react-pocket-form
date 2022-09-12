import { useReducer } from 'react'

export const useForceUpdate = () => useReducer((c) => c + 1, 0)[1]
