import type { StopMore } from './types.ts'
import { MORE_1 } from './more-1.ts'
import { MORE_2 } from './more-2.ts'
import { MORE_3 } from './more-3.ts'
import { MORE_4 } from './more-4.ts'
import { MORE_5 } from './more-5.ts'
import { MORE_6 } from './more-6.ts'

/** Every stop's vocabulary page, exchanges and check, by stop number. */
export const MORE: Record<number, StopMore> = { ...MORE_1, ...MORE_2, ...MORE_3, ...MORE_4, ...MORE_5, ...MORE_6 }
