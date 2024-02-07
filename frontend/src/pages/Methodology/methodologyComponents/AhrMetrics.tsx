import HetTerm from '../../../styles/HetComponents/HetTerm'
import FormulaFormat from './FormulaFormat'

export default function AhrMetrics() {
  return (
    <>
      <p>
        For all topics sourced from America's Health Rankings (AHR), we obtain{' '}
        <HetTerm>percent share</HetTerm> metrics directly from the organization
        via custom created files. It is our goal to switch to their recently
        released GraphQL API in the near future for more data visibility and
        flexibility.
      </p>

      <p>
        AHR provides rates mainly as percentages, but occasionally as the number
        of cases for every 100,000 people. If we need to change a{' '}
        <HetTerm>percentage rate</HetTerm> into a{' '}
        <HetTerm>cases per 100k</HetTerm> rate, we simply multiply the
        percentage by 1,000. For example, a 5% rate would become 5,000 per
        100,000 people.
      </p>
      <FormulaFormat
        leftSide='5% rate'
        rightSide={['5 out of 100', ' = ', '5,000 per 100,000 people']}
      />
    </>
  )
}
