import { test, describe, expect } from 'vitest'
import { get } from '../../src/utils/get'

describe('get', () => {
  test('get the correct value', () => {
    const t1 = {
      a: [0, 1],
      b: { a: 1 },
      c: { a: { b: [{ c: 1 }] } },
    }
    expect(get(t1, 'a')).toEqual([0, 1])
    expect(get(t1, 'a.[1]')).toEqual(1)
    expect(get(t1, 'b.a')).toEqual(1)
    expect(get(t1, 'c.a.b.[0].c')).toEqual(1)
    expect(get(t1, '')).toEqual(undefined)
    expect(get(t1, null)).toEqual(undefined)
    expect(get(t1, undefined)).toEqual(undefined)

    const t2 = [{ a: 1 }, 2]
    expect(get(t2, '[1]')).toEqual(2)
    expect(get(t2, '[0].a')).toEqual(1)
  })
})
