import { MetricId } from "../../data/config/MetricConfig"
import { DemographicType } from "../../data/query/Breakdowns"
import { MetricQueryResponse } from "../../data/query/MetricQuery"
import { ALL, BLACK_NH } from "../../data/utils/Constants"
import { Row } from "../../data/utils/DatasetTypes"
import { Fips } from "../../data/utils/Fips"
import HetNotice from "../../styles/HetComponents/HetNotice"

interface LawEnforcementAlertProps {
    queryResponse: MetricQueryResponse
    fips: Fips
    demographicType: DemographicType
}

function LawEnforcementAlert(props: LawEnforcementAlertProps) {
    const dataAlls: Row[] = props.queryResponse.data.filter(
        (row) => row[props.demographicType] === ALL || row[props.demographicType] === 'All'
    )

    const dataBlack: Row[] = props.queryResponse.data.filter(
        (row) => row[props.demographicType] === BLACK_NH
    )

    const totalCountId: MetricId = 'gun_violence_legal_intervention_estimated_total'

    const totalCount: number | undefined = dataAlls[0]?.[totalCountId]
    const blackCount: number | undefined = dataBlack[0]?.[totalCountId]

    const locationName = props.fips.getSentenceDisplayName()

    if (totalCount === undefined) {
        return null
    }

    return (
        <div>
            <HetNotice title="Law Enforcement Impact" kind="health-crisis" className="m-2 border border-reportAlert">
                <p>
                    In addition to the gun death rates visualized for {locationName} above, law enforcement actions resulted in {totalCount} fatalities last year.
                    {blackCount !== undefined && (
                        <> Black individuals, who are disproportionately affected nationally, accounted for <strong>{blackCount}</strong> of these legal intervention gun fatalities.</>
                    )}
                    {" "}This issue highlights the need for comprehensive reforms and accountability to ensure a justice system that equitably protects every community.
                </p>
            </HetNotice>
        </div>
    );

}

export default LawEnforcementAlert

