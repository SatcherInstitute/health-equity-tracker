import { urlMap } from '../../../utils/externalUrls'
import FormulaFormat from './FormulaFormat'

interface AhrMetricsProps {
  category?: 'behavioral-health' | 'chronic-diseases' | 'social-determinants'
}

export default function AhrMetrics({ category }: AhrMetricsProps) {
  const getCategoryText = () => {
    switch (category) {
      case 'behavioral-health':
        return (
          <>
            AHR provides data for several behavioral health topics via their{' '}
            <a href={urlMap.ahrGraphQl}>GraphQL API</a>. Depression, frequent
            mental distress, and non-medical drug use (opioid and other
            substance misuse) are provided as percentages, while suicide is
            provided as a rate per 100,000 people. Excessive drinking is
            displayed as a percentage rate with no conversion applied.
          </>
        )
      case 'chronic-diseases':
        return (
          <>
            America's Health Rankings (AHR) provides data for several chronic
            disease topics via their <a href={urlMap.ahrGraphQl}>GraphQL API</a>
            . Asthma, cardiovascular diseases, chronic kidney disease, chronic
            obstructive pulmonary disease (COPD), and diabetes are provided as
            percentages.
          </>
        )
      case 'social-determinants':
        return (
          <>
            America's Health Rankings (AHR) provides data for several social
            determinants of health topics via their{' '}
            <a href={urlMap.ahrGraphQl}>GraphQL API</a>. Care avoidance due to
            cost and uninsured individuals are displayed as percentage rates
            with no conversion applied. Preventable hospitalization is provided
            as a rate per 100,000 people.
          </>
        )
      default:
        return null
    }
  }

  const showFormula =
    category === 'behavioral-health' || category === 'chronic-diseases'

  return (
    <>
      <p>{getCategoryText()}</p>
      {showFormula && (
        <FormulaFormat
          leftSide='5% rate'
          rightSide={['5 out of 100', ' = ', '5,000 per 100,000 people']}
        />
      )}
    </>
  )
}
