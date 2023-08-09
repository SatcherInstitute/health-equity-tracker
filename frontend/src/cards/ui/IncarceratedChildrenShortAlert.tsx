import { type Fips } from '../../data/utils/Fips'
import { urlMap } from '../../utils/externalUrls'
import { type MetricQueryResponse } from '../../data/query/MetricQuery'
import { type Row } from '../../data/utils/DatasetTypes'
import { ALL, RACE } from '../../data/utils/Constants'
import FlagIcon from '@mui/icons-material/Flag'
import { CardContent, Alert } from '@mui/material'
import { useParamState } from '../../utils/hooks/useParamState'
import { DEMOGRAPHIC_PARAM } from '../../utils/urlutils'
import { type DemographicType } from '../../data/query/Breakdowns'

interface IncarceratedChildrenShortAlertProps {
  queryResponse: MetricQueryResponse
  fips: Fips
}

function IncarceratedChildrenShortAlert(
  props: IncarceratedChildrenShortAlertProps
) {
  const [demographicType] = useParamState<DemographicType>(
    /* paramKey */ DEMOGRAPHIC_PARAM,
    /* paramDefaultValue */ RACE
  )
  let count = props.queryResponse.data.find(
    (row: Row) => row[demographicType] === ALL
  )?.total_confined_children
  if (count) count = parseInt(count)
  if (count == null) return <></>

  const children = count === 1 ? 'child' : 'children'
  const adultFacilities = count === 1 ? 'an adult facility' : 'adult facilities'

  return (
    <CardContent>
      <Alert
        severity={count === 0 ? 'info' : 'error'}
        role="note"
        icon={count !== 0 ? <FlagIcon /> : null}
      >
        <b>
          {count.toLocaleString()} {children}
        </b>{' '}
        confined in {adultFacilities} in{' '}
        <b>{props.fips.getSentenceDisplayName()}</b>.{' '}
        <a href={urlMap.childrenInPrison}>Learn more.</a>
      </Alert>
    </CardContent>
  )
}

export default IncarceratedChildrenShortAlert
