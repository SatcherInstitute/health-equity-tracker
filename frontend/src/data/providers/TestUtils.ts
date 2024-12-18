import type FakeDataFetcher from '../../testing/FakeDataFetcher'
import type {
  DatasetId,
  DatasetIdWithStateFIPSCode,
} from '../config/DatasetMetadata'
import type { MetricId } from '../config/MetricConfigTypes'
import { excludeAll } from '../query/BreakdownFilter'
import type { Breakdowns, DemographicType } from '../query/Breakdowns'
import { MetricQuery, MetricQueryResponse } from '../query/MetricQuery'
import { USA_DISPLAY_NAME, USA_FIPS } from '../utils/ConstantsGeography'
import type VariableProvider from './VariableProvider'

export interface FipsSpec {
  code: string
  name: string
}
export const CHATAM: FipsSpec = {
  code: '37037',
  name: 'Chatam County',
}
export const DURHAM: FipsSpec = {
  code: '37063',
  name: 'Durham County',
}
export const NC: FipsSpec = {
  code: '37',
  name: 'North Carolina',
}
export const AL: FipsSpec = {
  code: '01',
  name: 'Alabama',
}
export const CA: FipsSpec = {
  code: '06',
  name: 'California',
}
export const MARIN: FipsSpec = {
  code: '06041',
  name: 'Marin County',
}
export const WA: FipsSpec = {
  code: '53',
  name: 'Washington',
}
export const VI: FipsSpec = {
  code: '78',
  name: 'U.S. Virgin Islands',
}
export const USA: FipsSpec = {
  code: USA_FIPS,
  name: USA_DISPLAY_NAME,
}

export function createWithAndWithoutAllEvaluator(
  metricIds: MetricId | MetricId[],
  dataFetcher: FakeDataFetcher,
  variableProvider: VariableProvider,
) {
  return async (
    datasetId: DatasetId | DatasetIdWithStateFIPSCode,
    rawData: any[],
    baseBreakdown: Breakdowns,
    demographicType: DemographicType,
    rowsExcludingAll: any[],
    rowsIncludingAll: any[],
  ) => {
    dataFetcher.setFakeDatasetLoaded(datasetId, rawData)

    // Evaluate the response with requesting "All" field
    const responseWithAll = await variableProvider.getData(
      new MetricQuery(metricIds, baseBreakdown.addBreakdown(demographicType)),
    )
    expect(responseWithAll).toEqual(
      new MetricQueryResponse(rowsIncludingAll, [datasetId]),
    )

    // Evaluate the response without requesting "All" field
    const responseWithoutAll = await variableProvider.getData(
      new MetricQuery(
        metricIds,
        baseBreakdown.addBreakdown(demographicType, excludeAll()),
      ),
    )
    expect(responseWithoutAll).toEqual(
      new MetricQueryResponse(rowsExcludingAll, [datasetId]),
    )
  }
}
