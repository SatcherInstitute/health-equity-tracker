import { useNavigate } from 'react-router-dom'
import { METRIC_CONFIG } from '../../data/config/MetricConfig'
import type { DataTypeId } from '../../data/config/MetricConfigTypes'
import { EXPLORE_DATA_PAGE_LINK } from '../internalRoutes'
import {
  EXTREMES_1_PARAM_KEY,
  MADLIB_SELECTIONS_PARAM,
  useSearchParams,
} from '../urlutils'

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
  const navigate = useNavigate()
  const params = useSearchParams()
  const mlsParam = params[MADLIB_SELECTIONS_PARAM]
  const extremesParam = params[EXTREMES_1_PARAM_KEY]

  if (mlsParam) {
    // isolate the id from the param string
    const dropdownVarId1 = mlsParam.replace('1.', '').split('-')[0]

    // first check for specific deprecated ids and redirect
    if (dropdownIdSwaps[dropdownVarId1]) {
      const newMlsParam = mlsParam.replace(
        dropdownVarId1,
        dropdownIdSwaps[dropdownVarId1],
      )
      navigate(
        `${EXPLORE_DATA_PAGE_LINK}?${MADLIB_SELECTIONS_PARAM}=${newMlsParam}${extremesParam ? `&${extremesParam}` : ''}`,
      )
    } else if (
      // otherwise handle other malformed ids in param and redirect to helper box
      !Object.keys(METRIC_CONFIG).includes(dropdownVarId1)
    ) {
      navigate(`${EXPLORE_DATA_PAGE_LINK}`)
    }
  }

  // if there is no MLS param or the id is valid, continue as normal
  return params
}
