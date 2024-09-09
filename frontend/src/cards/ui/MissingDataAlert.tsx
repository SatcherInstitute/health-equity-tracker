import { WHAT_IS_HEALTH_EQUITY_PAGE_LINK } from '../../utils/internalRoutes'
import type { DemographicTypeDisplayName } from '../../data/query/Breakdowns'
import type { Fips } from '../../data/utils/Fips'
import type { DataTypeConfig } from '../../data/config/MetricConfigTypes'
import { LinkWithStickyParams } from '../../utils/urlutils'
import { lazy } from 'react'
import HetNotice from '../../styles/HetComponents/HetNotice'
import HetTerm from '../../styles/HetComponents/HetTerm'

const AltDataTypesMessage = lazy(
  async () => await import('./AltDataTypesMessage'),
)

interface MissingDataAlertProps {
  dataName: string
  demographicTypeString: DemographicTypeDisplayName
  noDemographicInfo?: boolean
  isMapCard?: boolean
  fips: Fips
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
      broken down by <HetTerm>{props.demographicTypeString}</HetTerm>{' '}
    </>
  )

  // supply name of lower level geo needed to create map
  const geoPhrase =
    props.isMapCard && !props.fips.isCounty()
      ? `at the ${props.fips.getChildFipsTypeDisplayName()} level `
      : ''

  return (
    <HetNotice kind='data-integrity'>
      Our data sources do not have
      {demographicPhrase}
      <HetTerm>{props.dataName}</HetTerm>
      {demographicTypePhrase}
      {geoPhrase}
      for <span>{props.fips.getSentenceDisplayName()}</span>. Learn more about
      how this lack of data impacts{' '}
      <LinkWithStickyParams to={WHAT_IS_HEALTH_EQUITY_PAGE_LINK}>
        health equity
      </LinkWithStickyParams>
      {'. '}
      {props.ageAdjustedDataTypes && props.ageAdjustedDataTypes.length > 0 && (
        <AltDataTypesMessage
          ageAdjustedDataTypes={props.ageAdjustedDataTypes}
        />
      )}
    </HetNotice>
  )
}

export default MissingDataAlert
