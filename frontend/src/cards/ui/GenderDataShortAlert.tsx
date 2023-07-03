import { useState, useEffect } from 'react';
import { CardContent, Alert } from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import { urlMap } from '../../utils/externalUrls';
import { DataTypeId } from '../../data/config/MetricConfig';
import { type Fips } from '../../data/utils/Fips';
import { type MetricQueryResponse } from '../../data/query/MetricQuery';
import { type Row } from '../../data/utils/DatasetTypes';
import { ALL } from '../../data/utils/Constants';
import { type BreakdownVar } from '../../data/query/Breakdowns';

interface GenderDataShortAlertProps {
    queryResponse: MetricQueryResponse;
    fips: Fips;
    breakdownVar: BreakdownVar;
    dataTypeId?: DataTypeId;
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
            setTotalAddlGender(parseInt(genderCount[`${props.dataTypeId ?? ""}_total_additional_gender`]))
            setTotalTransMen(parseInt(genderCount[`${props.dataTypeId ?? ""}_total_trans_men`]))
            setTotalTransWomen(parseInt(genderCount[`${props.dataTypeId ?? ""}_total_trans_women`]))
        }

    }, [props.queryResponse, props.breakdownVar, props.dataTypeId, hivPhrase])

    if (totalAddlGender === null || totalTransMen === null || totalTransWomen === null) {
        return null
    }

    return (
        <CardContent>
            <Alert
                severity={totalAddlGender === 0 ? 'info' : 'error'}
                role="note"
                icon={totalAddlGender !== 0 ? <FlagIcon /> : null}
            >
                There are{' '}
                <b>{totalTransMen.toLocaleString()} individuals identified as trans men,</b>{' '}
                <b>{totalTransWomen.toLocaleString()} individuals identified as trans women,</b>{' '}
                and{' '}
                <b>{totalAddlGender.toLocaleString()} individuals with additional gender identities (AGI)</b>{' '}
                {hivPhrase} in <b>{props.fips.getSentenceDisplayName()}</b>.{' '}
                <a href={urlMap.childrenInPrison}>Learn more.</a>
            </Alert>
        </CardContent>
    )
}

export default GenderDataShortAlert
