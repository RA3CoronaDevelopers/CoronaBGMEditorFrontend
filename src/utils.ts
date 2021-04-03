import { ComponentOptions } from 'vue'

export const has = <K extends string>(
  object: unknown,
  key: K
): object is Record<K, unknown> => {
  return typeof object === 'object' && object !== null && object.hasOwnProperty(key)
}

export const isString = (object: unknown): object is string => typeof object === 'string'

export const isArray = <T>(
  object: unknown,
  checker: (x: unknown) => x is T
): object is T[] => {
  return Array.isArray(object) && object.every(x => checker(x))
}

export type ExtractProp<Type> = Type extends ComponentOptions<infer Props> ? Props : never
