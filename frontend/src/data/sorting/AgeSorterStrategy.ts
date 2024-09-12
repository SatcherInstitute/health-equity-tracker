import type { Breakdowns } from '../query/Breakdowns'
import type { HetRow } from '../utils/DatasetTypes'
import { AbstractSortStrategy } from './AbstractDataSorter'

export class AgeSorterStrategy extends AbstractSortStrategy {
  frontValues: string[]
  backValues: string[]

  appliesToBreakdowns = (b: Breakdowns) => {
    return b.hasOnlyAge()
  }

  constructor(frontValues: string[] = [], backValues: string[] = []) {
    super()
    // We Reverse these because we want the human readable version of sorting.
    // eg. [A, B, C] to work with the index calculation. so that A is first and B is
    // second ... ect
    this.frontValues = frontValues.reverse()
    this.backValues = backValues
  }

  readonly compareFn = (l: HetRow | string, r: HetRow | string) => {
    const lAge = typeof l === 'string' ? l : l.age
    const rAge = typeof r === 'string' ? r : r.age // Rage hehe

    const frontLeft = this.frontValues.indexOf(lAge)
    const frontRight = this.frontValues.indexOf(rAge)

    let diff = frontRight - frontLeft

    if (diff !== 0) {
      return diff
    }

    const backLeft = this.backValues.indexOf(lAge)
    const backRight = this.backValues.indexOf(rAge)

    diff = backLeft - backRight
    if (diff !== 0) {
      return diff
    }

    const leftUnbounded = lAge?.includes('+')
    const rightUnbounded = rAge?.includes('+')

    if (leftUnbounded && rightUnbounded) {
      return 0
    } else if (leftUnbounded) {
      return 1
    } else if (rightUnbounded) {
      return -1
    }

    const lMin = lAge?.split('-')?.[0]
    const rMin = rAge?.split('-')?.[0]
    return Number(lMin) - Number(rMin)
  }
}
