import { dotPathReader } from './dotPathReader'

export const get = (object: Record<string, any> | undefined, path: string) => {
  return dotPathReader(path ?? '').reduce((acc, cv) => acc?.[cv], object) as any
}
