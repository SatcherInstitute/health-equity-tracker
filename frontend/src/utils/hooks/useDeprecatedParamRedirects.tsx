import { useSetAtom } from 'jotai'
import { useLayoutEffect } from 'react'
import { METRIC_CONFIG } from '../../data/config/MetricConfig'
import type { DataTypeId } from '../../data/config/MetricConfigTypes'
import { EXPLORE_DATA_PAGE_LINK } from '../internalRoutes'
import { locationAtom } from '../sharedSettingsState'
import { MADLIB_SELECTIONS_PARAM, useSearchParams } from '../urlutils'

// Ensures backwards compatibility for external links to old DataTypeIds
// NOTE: these redirects will lose any incoming demographic, data type, and card hash settings

const dropdownIdSwaps: Record<string, DataTypeId> = {
  hiv_prevalence: 'hiv',
  hiv_deaths: 'hiv',
  hiv_diagnoses: 'hiv',
  hiv_prevalence_black_women: 'hiv_black_women',
  hiv_deaths_black_women: 'hiv_black_women',
  hiv_diagnoses_black_women: 'hiv_black_women',
  jail: 'incarceration',
  prison: 'incarceration',
  vaccinations: 'covid_vaccinations',
  women_in_legislative_office: 'women_in_gov',
  women_in_state_legislature: 'women_in_gov',
  women_in_us_congress: 'women_in_gov',
}

export default function useDeprecatedParamRedirects() {
  const setLocation = useSetAtom(locationAtom)
  const params = useSearchParams()
  const mlsParam = params[MADLIB_SELECTIONS_PARAM]

  // Compute corrected params synchronously so callers render with valid state
  // from the first frame, before the URL update fires in useLayoutEffect.
  let correctedMlsParam = ''
  let isMalformed = false

  if (mlsParam) {
    const dropdownVarId1 = mlsParam.replace('1.', '').split('-')[0]
    if (dropdownIdSwaps[dropdownVarId1]) {
      correctedMlsParam = mlsParam.replace(
        dropdownVarId1,
        dropdownIdSwaps[dropdownVarId1],
      )
    } else if (!Object.keys(METRIC_CONFIG).includes(dropdownVarId1)) {
      isMalformed = true
    }
  }

  useLayoutEffect(() => {
    if (correctedMlsParam) {
      setLocation((prev) => {
        const next = new URLSearchParams(prev.searchParams)
        next.set(MADLIB_SELECTIONS_PARAM, correctedMlsParam)
        return { ...prev, searchParams: next }
      })
    } else if (isMalformed) {
      setLocation({
        pathname: EXPLORE_DATA_PAGE_LINK,
        searchParams: new URLSearchParams(),
      })
    }
  }, [mlsParam, setLocation])

  if (!correctedMlsParam) return params
  return { ...params, [MADLIB_SELECTIONS_PARAM]: correctedMlsParam }
}
