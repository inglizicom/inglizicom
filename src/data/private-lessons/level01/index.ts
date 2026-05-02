import type { Unit } from '../types'
import { lesson01 } from './lesson01'
import { lesson02 } from './lesson02'
import { lesson03 } from './lesson03'
import { lesson04 } from './lesson04'
import { lesson05 } from './lesson05'
import { lesson06 } from './lesson06'
import { lesson07 } from './lesson07'
import { lesson08 } from './lesson08'
import { lesson09 } from './lesson09'
import { lesson10 } from './lesson10'
import { lesson11 } from './lesson11'
import { lesson12 } from './lesson12'
import { lesson13 } from './lesson13'
import { lesson14 } from './lesson14'
import { lesson15 } from './lesson15'
import { lesson16 } from './lesson16'
import { lesson17 } from './lesson17'
import { lesson18 } from './lesson18'
import { lesson19 } from './lesson19'

export const level01Units: Unit[] = [
  lesson01, lesson02, lesson03, lesson04, lesson05,
  lesson06, lesson07, lesson08, lesson09, lesson10,
  lesson11, lesson12, lesson13, lesson14, lesson15,
  lesson16, lesson17, lesson18, lesson19,
]

export function getLevel01Unit(slug: string): Unit | undefined {
  return level01Units.find((u) => u.slug === slug)
}
