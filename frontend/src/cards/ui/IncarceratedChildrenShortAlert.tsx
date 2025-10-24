import type { DemographicType } from '../../data/query/Breakdowns'
import type { MetricQueryResponse } from '../../data/query/MetricQuery'
import { ALL } from '../../data/utils/Constants'
import type { HetRow } from '../../data/utils/DatasetTypes'
import type { Fips } from '../../data/utils/Fips'
import HetNotice from '../../styles/HetComponents/HetNotice'
import { urlMap } from '../../utils/externalUrls'

interface IncarceratedChildrenShortAlertProps {
  queryResponse: MetricQueryResponse
  fips: Fips
  demographicType: DemographicType
}

function IncarceratedChildrenShortAlert(
  props: IncarceratedChildrenShortAlertProps,
) {
  let count = props.queryResponse.data.find(
    (row: HetRow) => row[props.demographicType] === ALL,
  )?.confined_children_estimated_total
  if (count) count = Number.parseInt(count, 10)
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
