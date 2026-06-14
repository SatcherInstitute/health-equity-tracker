import HetNotice from '../../styles/HetComponents/HetNotice'
import { PDOH_LINK } from '../../utils/internalRoutes'

export default function CAWPCountyMultiDistrictAlert() {
  return (
    <HetNotice kind='helpful-info' title='County-level data note'>
      Counties and congressional districts don't always align — a county may
      span multiple districts, and one district may cover multiple counties.{' '}
      <a href={`${PDOH_LINK}#county-level-congress-data`}>
        See methodology for details.
      </a>
    </HetNotice>
  )
}
