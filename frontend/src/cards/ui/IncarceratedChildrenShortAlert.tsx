import { type Fips } from '../../data/utils/Fips'
import { urlMap } from '../../utils/externalUrls'
import { type MetricQueryResponse } from '../../data/query/MetricQuery'
import { type Row } from '../../data/utils/DatasetTypes'
import { ALL } from '../../data/utils/Constants'
import { type DemographicType } from '../../data/query/Breakdowns'
import { CardContent } from '@mui/material'
import HetAlert from '../../styles/HetComponents/HetAlert'

interface IncarceratedChildrenShortAlertProps {
  queryResponse: MetricQueryResponse
  fips: Fips
  demographicType: DemographicType
}

function IncarceratedChildrenShortAlert(
  props: IncarceratedChildrenShortAlertProps
) {
  let count = props.queryResponse.data.find(
    (row: Row) => row[props.demographicType] === ALL
  )?.total_confined_children
  if (count) count = parseInt(count)
  if (count == null) return <></>

  const children = count === 1 ? 'child' : 'children'
  const adultFacilities = count === 1 ? 'an adult facility' : 'adult facilities'

  return (
    <CardContent>
      <HetAlert kind={count > 0 ? 'health-crisis' : 'helpful-info'}>
        <b>
          {count.toLocaleString()} {children}
        </b>{' '}
        confined in {adultFacilities} in{' '}
        <b>{props.fips.getSentenceDisplayName()}</b>.{' '}
        <a href={urlMap.childrenInPrison}>Learn more.</a>
      </HetAlert>
    </CardContent>
  )
}

export default IncarceratedChildrenShortAlert
