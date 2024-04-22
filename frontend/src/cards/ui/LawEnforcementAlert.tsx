import { DatasetId, DatasetIdWithStateFIPSCode } from "../../data/config/DatasetMetadata"
import { MetricId } from "../../data/config/MetricConfig"
import { DemographicType } from "../../data/query/Breakdowns"
import { MetricQueryResponse } from "../../data/query/MetricQuery"
import { ALL, BLACK_NH } from "../../data/utils/Constants"
import { MapOfDatasetMetadata, Row } from "../../data/utils/DatasetTypes"
import { Fips } from "../../data/utils/Fips"
import HetNotice from "../../styles/HetComponents/HetNotice"
import { getDataSourceMapFromDatasetIds, getDatasetIdsFromResponses, stripCountyFips } from "./SourcesHelpers"

interface LawEnforcementAlertProps {
    queryResponse: MetricQueryResponse
    fips: Fips
    metadata: MapOfDatasetMetadata
    demographicType: DemographicType
}

function LawEnforcementAlert(props: LawEnforcementAlertProps) {
    const dataAlls: Row[] = props.queryResponse.data.filter(
        (row) => row[props.demographicType] === ALL || row[props.demographicType] === 'All'
    )

    const dataBlack: Row[] = props.queryResponse.data.filter(
        (row) => row[props.demographicType] === BLACK_NH
    )

    const unstrippedDatasetIds: Array<DatasetId | DatasetIdWithStateFIPSCode> =
    getDatasetIdsFromResponses([props.queryResponse])

    let datasetIds: DatasetId[] = stripCountyFips(unstrippedDatasetIds)

    const dataSourceMap = getDataSourceMapFromDatasetIds(
        datasetIds,
        props.metadata
      )

    const dataSourceId = Object.keys(dataSourceMap)[0]

    const totalCountId: MetricId = 'gun_violence_legal_intervention_estimated_total'

    const totalCount: number | undefined = dataAlls[0]?.[totalCountId]
    const blackCount: number | undefined = dataBlack[0]?.[totalCountId]

    const location = props.fips.getSentenceDisplayName()

    const mostRecentYear = dataSourceMap[dataSourceId].updateTimes

    if (totalCount === undefined) {
        return null
    }

    return (
        <div>
            <HetNotice title="Law Enforcement Impact" kind="health-crisis" className="m-2 border border-reportAlert">
                <p>
                    Law enforcement actions results in an additional <strong>{totalCount}</strong> fatalities in {location} in {mostRecentYear},
                    beyond the deaths visualized above.
                    {blackCount !== undefined && (
                        <> Black individuals, who are disproportionately affected nationally, accounted for <strong>{blackCount}</strong> of
                            these legal intervention gun fatalities.</>
                    )}
                    <> This issue highlights the need for comprehensive reforms and accountability to ensure a justice system that equitably
                        protects every community.</>
                </p>
            </HetNotice>
        </div>
    );

}

export default LawEnforcementAlert

