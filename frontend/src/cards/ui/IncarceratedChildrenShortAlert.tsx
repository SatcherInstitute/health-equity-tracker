import type { Fips } from '../../data/utils/Fips'
import { urlMap } from '../../utils/externalUrls'
import type { MetricQueryResponse } from '../../data/query/MetricQuery'
import type { Row } from '../../data/utils/DatasetTypes'
import { ALL } from '../../data/utils/Constants'
import type { DemographicType } from '../../data/query/Breakdowns'
import HetNotice from '../../styles/HetComponents/HetNotice'

interface IncarceratedChildrenShortAlertProps {
  queryResponse: MetricQueryResponse
  fips: Fips
  demographicType: DemographicType
}

function IncarceratedChildrenShortAlert(
  props: IncarceratedChildrenShortAlertProps,
) {
  let count = props.queryResponse.data.find(
    (row: Row) => row[props.demographicType] === ALL,
  )?.total_confined_children
  if (count) count = Number.parseInt(count)
  if (count == null) return <></>

  const children = count === 1 ? 'child' : 'children'
  const adultFacilities = count === 1 ? 'an adult facility' : 'adult facilities'

  return (
    <HetNotice kind={count > 0 ? 'health-crisis' : 'helpful-info'}>
      <strong>
        {count.toLocaleString()} {children}
      </strong>{' '}
      confined in {adultFacilities} in{' '}
      <span>{props.fips.getSentenceDisplayName()}</span>.{' '}
      <a href={urlMap.childrenInPrison}>Learn more.</a>
    </HetNotice>
  )
}

export default IncarceratedChildrenShortAlert
