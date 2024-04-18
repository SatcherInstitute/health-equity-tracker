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
        (row) => row[props.demographicType] === ALL
    )

    const dataBlack: Row[] = props.queryResponse.data.filter(
        (row) => row[props.demographicType] === BLACK_NH
    )

    const totalCountId: MetricId = 'gun_violence_legal_intervention_estimated_total'

    const totalCount: number | undefined = dataAlls.length > 0 ? dataAlls[0][totalCountId] : undefined
    const blackCount: number | undefined = dataBlack.length > 0 ? dataBlack[0][totalCountId] : undefined

    const locationName = props.fips.getSentenceDisplayName()

    if (totalCount === undefined) {
        return null
    }
    return (
        <div>
            <HetNotice title="Law Enforcement Impact" kind="health-crisis" className="m-2 border border-reportAlert">
                <p>
                    In {locationName}, law enforcement actions resulted in <strong>{totalCount}</strong> fatalities last year.
                    {blackCount !== undefined && (
                        <span> With Black individuals disproportionately affected, accounting for <strong>{blackCount}</strong> of these lives.</span>
                    )}
                    This issue highlights the need for comprehensive reforms and accountability to ensure a justice system that equitably protects every community.
                </p>
            </HetNotice>
        </div>
    )
}

export default LawEnforcementAlert

