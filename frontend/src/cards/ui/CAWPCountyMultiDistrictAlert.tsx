import HetNotice from '../../styles/HetComponents/HetNotice'
import { PDOH_LINK } from '../../utils/internalRoutes'

export default function CAWPCountyMultiDistrictAlert() {
  return (
    <HetNotice
      kind='helpful-info'
      title="Counties and voting districts don't always align"
    >
      A county may span multiple districts, and one district may cover multiple
      counties.{' '}
      <a href={`${PDOH_LINK}#county-level-congress-data`}>
        See methodology for details.
      </a>
    </HetNotice>
  )
}
