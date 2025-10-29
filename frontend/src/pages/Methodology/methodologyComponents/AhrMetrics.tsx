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
            For topics sourced from America's Health Rankings (AHR) via their
            GraphQL API, depression, frequent mental distress, and non-medical
            drug use (opioid and other substance misuse) are provided as
            percentages, while suicide is provided as a rate per 100,000 people.
            excessive drinking is displayed as a percentage rate with no
            conversion applied.
          </>
        )
      case 'chronic-diseases':
        return (
          <>
            For topics sourced from America's Health Rankings (AHR) via their
            GraphQL API, asthma, cardiovascular diseases, chronic kidney
            disease, chronic obstructive pulmonary disease (COPD), and diabetes
            are provided as percentages.
          </>
        )
      case 'social-determinants':
        return (
          <>
            For topics sourced from America's Health Rankings (AHR) via their
            GraphQL API, care avoidance due to cost and uninsured individuals
            are displayed as percentage rates with no conversion applied.
            Preventable Hospitalization is provided as a rate per 100,000
            people.
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
