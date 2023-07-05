import { CardContent, Alert } from '@mui/material'
import { HashLink } from 'react-router-hash-link'
import { type DataTypeId } from '../../data/config/MetricConfig'
import { METHODOLOGY_TAB_LINK } from '../../utils/internalRoutes'

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
    <CardContent>
      <Alert severity="info" role="note">
        All values presented for <b>{variable}</b> are calculated on the
        population of individuals {ageGroup}. Read more on our{' '}
        <HashLink to={METHODOLOGY_TAB_LINK}>methodology.</HashLink>
      </Alert>
    </CardContent>
  )
}
