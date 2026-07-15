import {
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
  type DemographicType,
} from '../../data/query/Breakdowns'
import HetNotice from '../../styles/HetComponents/HetNotice'
import HetTerm from '../../styles/HetComponents/HetTerm'

interface AllsFallbackAlertProps {
  dataName: string
  demographicType: DemographicType
}

export default function AllsFallbackAlert(props: AllsFallbackAlertProps) {
  return (
    <HetNotice kind='helpful-info'>
      Our data sources do not report <HetTerm>{props.dataName}</HetTerm> by{' '}
      <HetTerm>
        {DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[props.demographicType]}
      </HetTerm>
      , so this card shows combined rates for all people.
    </HetNotice>
  )
}
