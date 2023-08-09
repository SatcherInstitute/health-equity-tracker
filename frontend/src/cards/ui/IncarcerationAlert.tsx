import { Alert, type AlertColor } from '@mui/material'
import {
  type DemographicType,
  DEMOGRAPHIC_TYPE_DISPLAY_NAMES_LOWER_CASE,
} from '../../data/query/Breakdowns'
import { type Fips, USA_DISPLAY_NAME } from '../../data/utils/Fips'
import { type DataTypeId } from '../../data/config/MetricConfig'
import { AGE, RACE } from '../../data/utils/Constants'
import {
  COMBINED_INCARCERATION_STATES_LIST,
  CombinedIncarcerationStateMessage,
  ALASKA_PRIVATE_JAIL_CAVEAT,
} from '../../data/providers/IncarcerationProvider'
import { DEMOGRAPHIC_PARAM } from '../../utils/urlutils'
import { useParamState } from '../../utils/hooks/useParamState'

const combinedAlertFipsList = [
  USA_DISPLAY_NAME,
  ...COMBINED_INCARCERATION_STATES_LIST,
]

interface IncarcerationAlertProps {
  dataType: DataTypeId
  fips: Fips
}

function IncarcerationAlert(props: IncarcerationAlertProps) {
  const [demographicType] = useParamState<DemographicType>(
    /* paramKey */ DEMOGRAPHIC_PARAM,
    /* paramDefaultValue */ RACE
  )
  const showAlaskaJailCaveat = [USA_DISPLAY_NAME, 'Alaska'].includes(
    props.fips.getDisplayName()
  )

  const source = props.fips.isCounty()
    ? 'Vera Institute of Justice'
    : 'Bureau of Justice Statistics'

  const severity: AlertColor =
    demographicType === 'age' && props.dataType === 'prison'
      ? 'warning'
      : 'info'
  const lowercaseDemographicType =
    DEMOGRAPHIC_TYPE_DISPLAY_NAMES_LOWER_CASE[demographicType]

  return (
    <Alert severity={severity} role="note">
      The disaggregated <b>{lowercaseDemographicType}</b> dataset available from
      the {source}{' '}
      <IncarcerationDetailsText
        dataType={props.dataType}
        demographicType={demographicType}
      />{' '}
      individuals (including children) under the jurisdiction of an adult{' '}
      {props.dataType} facility.{' '}
      {combinedAlertFipsList.includes(props.fips.getDisplayName()) &&
        CombinedIncarcerationStateMessage()}{' '}
      {showAlaskaJailCaveat && ALASKA_PRIVATE_JAIL_CAVEAT}
    </Alert>
  )
}

export default IncarcerationAlert

interface IncarcerationDetailsTextProps {
  dataType: DataTypeId
  demographicType: DemographicType
}

function IncarcerationDetailsText(props: IncarcerationDetailsTextProps) {
  if (props.demographicType === AGE && props.dataType === 'prison') {
    return (
      <>
        reports only <b>sentenced</b>
      </>
    )
  } else if (props.dataType === 'prison') {
    return (
      <>
        reports <b>sentenced</b> and <b>unsentenced</b>
      </>
    )
  }

  // JAIL
  return (
    <>
      reports <b>confined</b>
    </>
  )
}
