import type { Breakdowns } from '../query/Breakdowns'
import type { HetRow } from '../utils/DatasetTypes'

export abstract class AbstractSortStrategy {
  abstract appliesToBreakdowns: (b: Breakdowns) => boolean
  abstract compareFn: (l: HetRow | string, d: HetRow | string) => number
}
