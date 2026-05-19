import type { Unit } from '../types'
import { b01 } from './b01'
import { b02 } from './b02'
import { b03 } from './b03'
import { b04 } from './b04'
import { b05 } from './b05'
import { b06 } from './b06'

export const businessUnits: Unit[] = [b01, b02, b03, b04, b05, b06]

export function getBusinessUnit(slug: string): Unit | undefined {
  return businessUnits.find((u) => u.slug === slug)
}
