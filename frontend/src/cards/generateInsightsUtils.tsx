import type { MetricId } from '../data/config/MetricConfigTypes'
import type { ResultData, Dataset, Disparity } from './generateInsights'

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
  const disparities = data.map((item) => {
    const { fips_name, subgroup, ...rest } = item
    const [pctShareKey, measure] = getKeyBySubstring(rest, 'pct_share')
    const [populationPctKey] = getKeyBySubstring(rest, 'population_pct')
    const outcomeShare = rest[pctShareKey]
    const populationShare = rest[populationPctKey]

    const disparity: Disparity = {
      location: fips_name,
      subgroup,
      disparity: 0,
      measure,
      outcomeShare,
      populationShare,
      ratio: 0,
    }

    if (populationShare && outcomeShare) {
      const ratio = outcomeShare / populationShare
      disparity.ratio = ratio
      disparity.disparity = ratio - 1
    }

    return disparity
  })

  // Return the object with the highest disparity
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
