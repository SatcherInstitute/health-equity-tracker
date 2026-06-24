import type { DemographicType } from '../../data/query/Breakdowns'
import type { MetricQueryResponse } from '../../data/query/MetricQuery'
import { ALL } from '../../data/utils/Constants'
import HetNotice from '../../styles/HetComponents/HetNotice'
import { PDOH_LINK } from '../../utils/internalRoutes'

interface CAWPCountyMultiDistrictAlertProps {
  queryResponse?: MetricQueryResponse
  demographicType?: DemographicType
}

function formatDistricts(raw: string): string {
  const parts = raw.split(',').map((d) => d.trim())
  const label = parts.length === 1 ? 'District' : 'Districts'
  return `${label} ${parts.join(', ')}`
}

export default function CAWPCountyMultiDistrictAlert({
  queryResponse,
  demographicType,
}: CAWPCountyMultiDistrictAlertProps) {
  const allRow =
    queryResponse && demographicType
      ? queryResponse.data.find((row) => row[demographicType] === ALL)
      : null
  const rawDistricts: string | undefined = allRow?.congressional_districts
  const districtLabel = rawDistricts ? formatDistricts(rawDistricts) : null

  return (
    <HetNotice
      kind='helpful-info'
      title="Counties and voting districts don't always align"
    >
      A county may span multiple districts, and one district may cover multiple
      counties.
      {districtLabel && (
        <> This county includes representatives from {districtLabel}.</>
      )}{' '}
      <a href={`${PDOH_LINK}#county-level-congress-data`}>
        See methodology for details.
      </a>
    </HetNotice>
  )
}
