import { type Breakdowns } from '../query/Breakdowns'
import { type Row } from '../utils/DatasetTypes'
import { AbstractSortStrategy } from './AbstractDataSorter'

export class AlphabeticalSorterStrategy extends AbstractSortStrategy {
  reorderCol: string
  frontValues: string[]
  backValues: string[]

  constructor(
    reorderCol: string,
    frontValues: string[] = [],
    backValues: string[] = []
  ) {
    super()
    this.reorderCol = reorderCol
    // We Reverse these because we want the human readable version of sorting.
    // eg. [A, B, C] to work with the index calculation. so that A is first and B is
    // second ... ect
    this.frontValues = frontValues.reverse()
    this.backValues = backValues
  }

  appliesToBreakdowns = (b: Breakdowns) => {
    return !b.hasOnlyAge() && b.hasOneRegionOfGeographicGranularity()
  }

  compareFn = (l: Row | string, r: Row | string) => {
    const lVal = typeof l === 'string' ? l : l[this.reorderCol]
    const rVal = typeof r === 'string' ? r : r[this.reorderCol]

    const frontLeft = this.frontValues.indexOf(lVal)
    const frontRight = this.frontValues.indexOf(rVal)

    let diff = frontRight - frontLeft

    if (diff !== 0) {
      return diff
    }

    const backLeft = this.backValues.indexOf(lVal)
    const backRight = this.backValues.indexOf(rVal)

    diff = backLeft - backRight

    if (diff !== 0) {
      return diff
    }

    return lVal?.localeCompare(rVal)
  }
}
