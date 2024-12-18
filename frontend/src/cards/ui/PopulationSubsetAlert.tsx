import { HashLink } from 'react-router-hash-link'
import type { DataTypeId } from '../../data/config/MetricConfigTypes'
import HetNotice from '../../styles/HetComponents/HetNotice'
import HetTerm from '../../styles/HetComponents/HetTerm'
import { METHODOLOGY_PAGE_LINK } from '../../utils/internalRoutes'

interface PopulationSubsetAlertProps {
  dataTypeId: DataTypeId
}

export default function PopulationSubsetAlert({
  dataTypeId,
}: PopulationSubsetAlertProps) {
  let variable
  let ageGroup = 'ages 13 and older'

  if (dataTypeId === 'hiv_deaths') {
    variable = 'HIV deaths'
  }
  if (dataTypeId === 'hiv_diagnoses') {
    variable = 'new HIV diagnoses'
  }
  if (dataTypeId === 'hiv_care') {
    variable = 'Linkage to HIV care'
  }
  if (dataTypeId === 'hiv_prevalence') {
    variable = 'HIV prevalence'
  }
  if (dataTypeId === 'hiv_prep') {
    variable = 'PrEP coverage'
    ageGroup = 'eligible for PrEP, ages 16 and older'
  }

  return (
    <HetNotice>
      All values presented for <HetTerm>{variable}</HetTerm> are calculated on
      the population of individuals {ageGroup}. Read more on our{' '}
      <HashLink to={METHODOLOGY_PAGE_LINK}>methodology.</HashLink>
    </HetNotice>
  )
}
