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
  const demographicName =
    DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[props.demographicType]
  // cSpell:ignore aeiou
  const article = /^[aeiou]/i.test(demographicName) ? 'An' : 'A'

  return (
    <HetNotice kind='helpful-info'>
      {article} <HetTerm>{demographicName}</HetTerm> breakdown isn't available
      for <HetTerm>{props.dataName}</HetTerm>, so this card shows the overall
      rate.
    </HetNotice>
  )
}
