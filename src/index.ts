import _ from 'lodash'
import { createSimport } from 'simport'
import { createRequire } from 'module'

const simport = createSimport(import.meta.url)
const req = createRequire(import.meta.url)

export type TRequireOpts = {
  modulesPaths: string[]
  flat?: boolean
}
export type TRequireError = {
  modulePath: string
  error: any
}
export type TReTryOpts = {
  fn: () => any
  title?: string
  defaultValue?: any
}

export type TReTryResult = {
  result: any
  error?: string
}

export async function requiresTrySimport<T>(opts: TRequireOpts): Promise<T[]> {
  const { modulesPaths = [], flat = false } = opts

  if (!modulesPaths?.length) {
    return []
  }

  const requireResults: T[] = []
  const errors: TRequireError[] = []

  for (const modulePath of modulesPaths) {
    try {
      if (typeof modulePath !== 'string') {
        continue
      }

      if (modulePath.endsWith('.json')) {
        requireResults.push(req(modulePath))
        continue
      }

      const module = await simport(modulePath)
      requireResults.push(module.default)
    } catch (error: any) {
      errors.push({ modulePath, error })
    }
  }

  if (flat) {
    return _.flattenDeep(requireResults)
  }
  return requireResults
}

export async function reTryCatch({ fn, title, defaultValue }: TReTryOpts): Promise<TReTryResult> {
  try {
    return { result: await fn() }
  } catch (e: any) {
    return { result: defaultValue, error: `'${title}':\nERR: ${e}` }
  }
}
