import { test, describe, expect } from 'vitest'
import { set } from '../../src/utils/set'

describe('set', () => {
  test('set the correct value', () => {
    const t1 = {
      a: { b: 1 },
    }
    set(t1, 'a.b', 2)
    expect(t1).toStrictEqual({
      a: { b: 2 },
    })

    const t2 = {
      a: [1, 2],
    }
    set(t2, 'a.[1]', 3)
    expect(t2).toStrictEqual({
      a: [1, 3],
    })

    const t3 = {
      a: [{ b: 1 }, { c: 2 }],
    }
    set(t3, 'a.[1].c', 3)
    expect(t3).toStrictEqual({
      a: [{ b: 1 }, { c: 3 }],
    })

    const t4 = {
      a: { b: 1 },
    }
    set(t4, 'a.c.[0]', 1)
    expect(t4).toStrictEqual({ a: { b: 1, c: [1] } })

    const t5 = {
      a: { b: 1 },
    }
    set(t5, 'a.b.c', 1)
    expect(t5).toStrictEqual({ a: { b: { c: 1 } } })

    const t6 = [{ a: 1 }]
    set(t6, '[0].a', 2)
    expect(t6).toStrictEqual([{ a: 2 }])

    const t7 = {
      a: { b: 1 },
    }
    set(t7, 'a', undefined)
    expect(t7).toStrictEqual({})
  })
})
