import { WHAT_IS_HEALTH_EQUITY_PAGE_LINK } from '../../utils/internalRoutes'
import { type DemographicTypeDisplayName } from '../../data/query/Breakdowns'
import { type Fips } from '../../data/utils/Fips'
import {
  type DropdownVarId,
  type DataTypeConfig,
} from '../../data/config/MetricConfig'
import { LinkWithStickyParams } from '../../utils/urlutils'
import { Alert } from '@mui/material'
import { lazy } from 'react'

const AltDataTypesMessage = lazy(
  async () => await import('./AltDataTypesMessage')
)

interface MissingDataAlertProps {
  dataName: string
  demographicTypeString: DemographicTypeDisplayName
  noDemographicInfo?: boolean
  isMapCard?: boolean
  fips: Fips
  dropdownVarId?: DropdownVarId
  ageAdjustedDataTypes?: DataTypeConfig[]
}

function MissingDataAlert(props: MissingDataAlertProps) {
  // conditionally render the statement based on props
  const demographicPhrase = props.noDemographicInfo
    ? ' demographic information for '
    : ' '
  const demographicTypePhrase = props.noDemographicInfo ? (
    ' '
  ) : (
    <>
      {' '}
      broken down by <b>{props.demographicTypeString}</b>{' '}
    </>
  )

  // supply name of lower level geo needed to create map
  const geoPhrase =
    props.isMapCard && !props.fips.isCounty()
      ? `at the ${props.fips.getChildFipsTypeDisplayName()} level `
      : ''

  return (
    <Alert sx={{ mt: 4 }} severity="warning" role="note">
      Our data sources do not have
      {demographicPhrase}
      <b>{props.dataName}</b>
      {demographicTypePhrase}
      {geoPhrase}
      for <b>{props.fips.getSentenceDisplayName()}</b>. Learn more about how
      this lack of data impacts{' '}
      <LinkWithStickyParams to={WHAT_IS_HEALTH_EQUITY_PAGE_LINK}>
        health equity
      </LinkWithStickyParams>
      {'. '}
      {props.ageAdjustedDataTypes && props.ageAdjustedDataTypes.length > 0 && (
        <AltDataTypesMessage
          ageAdjustedDataTypes={props.ageAdjustedDataTypes}
        />
      )}
    </Alert>
  )
}

export default MissingDataAlert
