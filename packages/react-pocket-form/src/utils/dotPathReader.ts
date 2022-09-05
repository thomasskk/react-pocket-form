export const dotPathReader = (path: string) =>
  path
    .split('.')
    .map((v) =>
      v.charAt(0) === '[' && v.charAt(v.length - 1) === ']'
        ? +v.slice(1, -1)
        : v
    )
