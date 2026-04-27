import type { Unit } from './types'
import { unit01 } from './unit01'
import { unit02 } from './unit02'
import { unit03 } from './unit03'
import { unit04 } from './unit04'
import { unit05 } from './unit05'
import { unit06 } from './unit06'
import { unit07 } from './unit07'
import { unit08 } from './unit08'
import { unit09 } from './unit09'
import { unit10 } from './unit10'
import { unit11 } from './unit11'
import { unit12 } from './unit12'
import { unit13 } from './unit13'
import { unit14 } from './unit14'
import { unit15 } from './unit15'
import { unit16 } from './unit16'
import { unit17 } from './unit17'
import { unit18 } from './unit18'
import { unit19 } from './unit19'
import { unit20 } from './unit20'

export const units: Unit[] = [
  unit01,
  unit02,
  unit03,
  unit04,
  unit05,
  unit06,
  unit07,
  unit08,
  unit09,
  unit10,
  unit11,
  unit12,
  unit13,
  unit14,
  unit15,
  unit16,
  unit17,
  unit18,
  unit19,
  unit20,
]

export function getUnit(slug: string): Unit | undefined {
  return units.find((u) => u.slug === slug)
}
