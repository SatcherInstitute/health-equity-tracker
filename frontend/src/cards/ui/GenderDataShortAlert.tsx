import { type Fips } from '../../data/utils/Fips'
import { urlMap } from '../../utils/externalUrls'
import { type MetricQueryResponse } from '../../data/query/MetricQuery'
import { type Row } from '../../data/utils/DatasetTypes'
import { ALL } from '../../data/utils/Constants'
import FlagIcon from '@mui/icons-material/Flag'
import { type BreakdownVar } from '../../data/query/Breakdowns'
import { CardContent, Alert } from '@mui/material'
import { DataTypeId } from '../../data/config/MetricConfig'

interface GenderDataShortAlertProps {
    queryResponse: MetricQueryResponse
    fips: Fips
    breakdownVar: BreakdownVar
    dataTypeId?: DataTypeId
}

function GenderDataShortAlert(
    props: GenderDataShortAlertProps
) {
    let totalAddlGender
    let totalTransMen
    let totalTransWomen

    const genderCount = props.queryResponse.data.find(
        (row: Row) => row[props.breakdownVar] === ALL
    )

    if (genderCount) {
        totalAddlGender = genderCount[`${props.dataTypeId}_total_additional_gender`]
        totalTransMen = genderCount[`${props.dataTypeId}_total_transgendered_men`]
        totalTransWomen = genderCount[`${props.dataTypeId}_total_transgendered_women`]
    }

    if (genderCount) totalAddlGender = parseInt(totalAddlGender)
    if (genderCount) totalTransMen = parseInt(totalTransMen)
    if (genderCount) totalTransWomen = parseInt(totalTransWomen)
    if (genderCount == null) return <></>

    return (
        <CardContent>
            <Alert
                severity={totalAddlGender === 0 ? 'info' : 'error'}
                role="note"
                icon={totalAddlGender !== 0 ? <FlagIcon /> : null}
            >
                <b>
                    {totalTransMen.toLocaleString()} trans men
                </b>{' '}
                in{' '}
                <b>
                    {totalTransWomen.toLocaleString()} trans women
                </b>{' '}
                in{' '}
                <b>
                    {totalAddlGender.toLocaleString()} people
                </b>{' '}
                (AGI) in{' '}
                <b>{props.fips.getSentenceDisplayName()}</b>.{' '}
                <a href={urlMap.childrenInPrison}>Learn more.</a>
            </Alert>
        </CardContent>
    )
}

export default GenderDataShortAlert
