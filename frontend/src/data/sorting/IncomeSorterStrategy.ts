import type { Breakdowns } from '../query/Breakdowns'
import type { HetRow } from '../utils/DatasetTypes'
import { AbstractSortStrategy } from './AbstractDataSorter'

const regexStripIncomeString = /^[^\d-]*(\d+)/

function compareIncome(a: HetRow, b: HetRow): number {
  const aValue = a?.['income']?.match(regexStripIncomeString)?.[1] || 0
  const bValue = b?.['income']?.match(regexStripIncomeString)?.[1] || 0
  return aValue - bValue
}

export function sortByIncome(data: HetRow[]): HetRow[] {
  const dataWithUnder = data.filter((row: HetRow) => {
    return row['income'].includes('Under') || row['income'].includes('All')
  })
  const dataWithoutUnder = data.filter((row: HetRow) => {
    return !row['income'].includes('Under') && !row['income'].includes('All')
  })

  dataWithUnder.sort(compareIncome)
  dataWithoutUnder.sort(compareIncome)

  return [...dataWithUnder, ...dataWithoutUnder]
}

export class IncomeSorterStrategy extends AbstractSortStrategy {
  frontValues: string[]
  backValues: string[]

  appliesToBreakdowns = (b: Breakdowns) => {
    return b.hasOnlyIncome()
  }

  constructor(frontValues: string[] = [], backValues: string[] = []) {
    super()
    // We Reverse these because we want the human readable version of sorting.
    // eg. [A, B, C] to work with the index calculation. so that A is first and B is
    // second ... etc
    this.frontValues = frontValues.reverse()
    this.backValues = backValues
  }

  readonly compareFn = (l: HetRow | string, r: HetRow | string) => {
    const extractBounds = (income: string) => {
      // Remove the dollar sign and commas, then split on the hyphen
      const [min, max] = income.replace(/[$,k]/g, '').split('-')
      return {
        min: Number(min),
        max: max ? Number(max) : Number.POSITIVE_INFINITY,
      }
    }

    const lIncome = typeof l === 'string' ? l : l.income
    const rIncome = typeof r === 'string' ? r : r.income

    const frontLeft = this.frontValues.indexOf(lIncome)
    const frontRight = this.frontValues.indexOf(rIncome)

    let diff = frontRight - frontLeft
    if (diff !== 0) {
      return diff
    }

    const backLeft = this.backValues.indexOf(lIncome)
    const backRight = this.backValues.indexOf(rIncome)

    diff = backLeft - backRight
    if (diff !== 0) {
      return diff
    }

    // Check if they are unbounded (i.e., containing '+')
    const leftUnbounded = lIncome?.includes('+')
    const rightUnbounded = rIncome?.includes('+')

    if (leftUnbounded && rightUnbounded) {
      return 0
    } else if (leftUnbounded) {
      return 1
    } else if (rightUnbounded) {
      return -1
    }

    // Extract the numerical bounds and compare the lower bounds first
    const { min: lMin, max: lMax } = extractBounds(lIncome)
    const { min: rMin, max: rMax } = extractBounds(rIncome)

    // Compare the minimum values first
    diff = lMin - rMin
    if (diff !== 0) {
      return diff
    }

    // If the minimum values are the same, compare the maximum values
    return lMax - rMax
  }
}
