export type Join<T extends unknown[]> = T extends [string]
  ? `${T[0]}`
  : T extends [number] | []
  ? `[${T[0]}]`
  : T extends [string, ...infer R]
  ? `${T[0]}${'.'}${Join<R>}` | T[0]
  : T extends [number, ...infer R]
  ? `[${T[0]}]${'.'}${Join<R>}` | `[${T[0]}]`
  : string

export type NestedPaths<T> = T extends undefined
  ? any
  : T extends string | number | boolean | Date
  ? []
  : T extends Array<infer ArrayT>
  ? [number, ...NestedPaths<ArrayT>]
  : T extends ReadonlyArray<infer ArrayT>
  ? [number, ...NestedPaths<ArrayT>]
  : T extends object
  ? {
      [Key in Extract<keyof T, string>]: [Key, ...NestedPaths<T[Key]>]
    }[Extract<keyof T, string>]
  : []

export type Path<T> = Join<NestedPaths<T>>

export type PropertyType<
  Type,
  Property extends string
> = Property extends keyof Type
  ? Type[Property]
  : Property extends `${infer Key}.${infer Rest}`
  ? Key extends `[${infer Prefix}]`
    ? // @ts-expect-error is a number
      PropertyType<Type[Prefix], Rest>
    : Key extends keyof Type
    ? PropertyType<Type[Key], Rest>
    : unknown
  : Property extends `[${infer Prefix}]`
  ? // @ts-expect-error is a number
    Type[Prefix]
  : unknown

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : T
