import type { DemographicType } from '../query/Breakdowns'
import type { Row } from '../utils/DatasetTypes'
import { AgeSorterStrategy } from './AgeSorterStrategy'
import { IncomeSorterStrategy } from './IncomeSorterStrategy'

export type OptionalSortArgs = [
  compareFn?: ((a: string, b: string) => number) | undefined,
]

export function getSortArgs(
  demographicType: DemographicType,
): OptionalSortArgs {
  switch (demographicType) {
    case 'age':
      return [new AgeSorterStrategy(['All']).compareFn]
    case 'income':
      return [new IncomeSorterStrategy(['All', 'Under $15k']).compareFn]
    default:
      return []
  }
}

export const regexStripIncomeString = /^[^\d-]*(\d+)/

export function compareIncome(a: Row, b: Row): number {
  const aValue = a?.['income']?.match(regexStripIncomeString)?.[1] || 0
  const bValue = b?.['income']?.match(regexStripIncomeString)?.[1] || 0
  return aValue - bValue
}

export function sortByIncome(data: Row[]): Row[] {
  const dataWithUnder = data.filter((row: Row) => {
    return row['income'].includes('Under') || row['income'].includes('All')
  })
  const dataWithoutUnder = data.filter((row: Row) => {
    return !row['income'].includes('Under') && !row['income'].includes('All')
  })

  dataWithUnder.sort(compareIncome)
  dataWithoutUnder.sort(compareIncome)

  return [...dataWithUnder, ...dataWithoutUnder]
}
