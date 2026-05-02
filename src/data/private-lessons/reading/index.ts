import type { Unit } from '../types'
import { read01 } from './read01'
import { read02 } from './read02'
import { read03 } from './read03'
import { read04 } from './read04'
import { read05 } from './read05'
import { read06 } from './read06'
import { read07 } from './read07'
import { read08 } from './read08'
import { read09 } from './read09'
import { read10 } from './read10'
import { read11 } from './read11'
import { read12 } from './read12'

export const readingUnits: Unit[] = [
  read01, read02, read03, read04,
  read05, read06, read07, read08,
  read09, read10, read11, read12,
]

export function getReadingUnit(slug: string): Unit | undefined {
  return readingUnits.find((u) => u.slug === slug)
}
