import type { MetricId } from '../data/config/MetricConfigTypes'
import type { Dataset, Disparity, ResultData } from './generateInsights'

export function getKeyBySubstring(
  obj: any,
  substring: string,
): [string, string] {
  const key = Object.keys(obj).find((key) => key.includes(substring)) || ''
  let measure = ''
  if (key) {
    measure = key.replace(/_pct_share$|_population_pct$/, '')
  }
  return [key, measure]
}

export function getHighestDisparity(data: ResultData[]): Disparity {
  // Filter out items with subgroup equal to "White (NH)"
  const filteredData = data.filter((item) => item.subgroup !== 'White (NH)')

  const disparities = filteredData.map((item) => {
    const { fips_name, subgroup, ...rest } = item
    const [pctShareKey, measure] = getKeyBySubstring(rest, 'pct_share')
    const [populationPctKey] = getKeyBySubstring(rest, 'population_pct')
    const outcomeShare = Math.round(rest[pctShareKey])
    const populationShare = Math.round(rest[populationPctKey])
    const ratio = Math.round(outcomeShare / populationShare)

    const disparity: Disparity = {
      location: fips_name,
      subgroup,
      disparity: ratio - 1,
      measure,
      outcomeShare,
      populationShare,
      ratio,
    }

    return disparity
  })

  // Return the object with the highest disparity among the valid disparities
  return disparities.reduce((max, curr) =>
    curr.disparity > max.disparity ? curr : max,
  )
}

export function extractRelevantData(
  dataset: Dataset,
  metricIds: MetricId[],
): ResultData {
  const { fips_name, race_and_ethnicity, age, sex, ...rest } = dataset
  const result: ResultData = { fips_name }

  result.subgroup = race_and_ethnicity || age || sex

  metricIds.forEach((metricId) => {
    result[metricId] = rest[metricId]
  })

  return result
}
