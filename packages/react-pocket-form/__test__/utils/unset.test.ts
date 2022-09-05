import { test, describe, expect } from 'vitest'
import { unset } from '../../src/utils/unset'

describe('unset', () => {
  test('unset the correct value', () => {
    const t1 = {
      a: { b: 1 },
    }
    unset(t1, 'a.b')
    expect(t1).toStrictEqual({})

    const t2 = {
      a: [1, 2],
    }
    unset(t2, 'a.[1]')
    expect(t2).toStrictEqual({
      a: [1],
    })

    const t3 = {
      a: [{ b: 1 }, { c: 2 }],
    }
    unset(t3, 'a.[1].c')
    expect(t3).toEqual({
      a: [{ b: 1 }, undefined],
    })

    const t6 = [{ a: 1 }]
    unset(t6, '[0].a')
    expect(t6).toEqual([undefined])

    const t7 = {
      a: { b: 1 },
    }
    unset(t7, 'a')
    expect(t7).toStrictEqual({})
  })
})
