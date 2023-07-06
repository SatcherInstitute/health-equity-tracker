import { useState, useEffect } from 'react'
import { CardContent, Alert } from '@mui/material'
import FlagIcon from '@mui/icons-material/Flag'
import { urlMap } from '../../utils/externalUrls'
import { type DataTypeId } from '../../data/config/MetricConfig'
import { type Fips } from '../../data/utils/Fips'
import { type MetricQueryResponse } from '../../data/query/MetricQuery'
import { type Row } from '../../data/utils/DatasetTypes'
import { ALL } from '../../data/utils/Constants'
import { type BreakdownVar } from '../../data/query/Breakdowns'

interface GenderDataShortAlertProps {
  queryResponse: MetricQueryResponse
  fips: Fips
  breakdownVar: BreakdownVar
  dataTypeId?: DataTypeId
}

function GenderDataShortAlert(props: GenderDataShortAlertProps) {
  let hivPhrase
  const [totalAddlGender, setTotalAddlGender] = useState<number | null>(null)
  const [totalTransMen, setTotalTransMen] = useState<number | null>(null)
  const [totalTransWomen, setTotalTransWomen] = useState<number | null>(null)

  if (props.dataTypeId === 'hiv_deaths') {
    hivPhrase = 'who died from HIV or AIDS'
  } else if (props.dataTypeId === 'hiv_prevalence') {
    hivPhrase = 'living with HIV'
  } else if (props.dataTypeId === 'hiv_care') {
    hivPhrase = 'with linkage to HIV care'
  } else if (props.dataTypeId === 'hiv_diagnoses') {
    hivPhrase = 'diagnosed with HIV'
  }

  useEffect(() => {
    const genderCount = props.queryResponse.data.find(
      (row: Row) => row[props.breakdownVar] === ALL
    )

    if (genderCount) {
      setTotalAddlGender(
        parseInt(
          genderCount[`${props.dataTypeId ?? ''}_total_additional_gender`]
        )
      )
      setTotalTransMen(
        parseInt(genderCount[`${props.dataTypeId ?? ''}_total_trans_men`])
      )
      setTotalTransWomen(
        parseInt(genderCount[`${props.dataTypeId ?? ''}_total_trans_women`])
      )
    }
  }, [props.queryResponse, props.breakdownVar, props.dataTypeId, hivPhrase])

  if (
    totalAddlGender === null ||
    totalTransMen === null ||
    totalTransWomen === null
  ) {
    return null
  }

  return (
    <CardContent>
      <Alert
        severity={'warning'}
        role="note"
        icon={totalAddlGender !== 0 ? <FlagIcon /> : null}
      >
        The groups above refer to <b>sex assigned at birth</b>, as opposed to{' '}
        <b>gender identity</b>. Due to lack of reliable population data for
        gender-expansive people, it is impossible to calculate rates{' '}
        <b>per 100k</b>, however our data sources do provide the following case
        counts:{' '}
        <b>
          {totalTransMen.toLocaleString()} individuals identified as transgender
          men,
        </b>{' '}
        <b>
          {totalTransWomen.toLocaleString()} individuals identified as
          transgender women,
        </b>{' '}
        and{' '}
        <b>
          {totalAddlGender.toLocaleString()} individuals with additional gender
          identities (AGI)
        </b>{' '}
        {hivPhrase} in <b>{props.fips.getSentenceDisplayName()}</b>.{' '}
        <a href={urlMap.cdcTrans}>Learn more.</a>
      </Alert>
    </CardContent>
  )
}

export default GenderDataShortAlert
