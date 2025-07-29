import { useAtomValue } from 'jotai'
import { HashLink } from 'react-router-hash-link'
import {
  type DatasetId,
  type DatasetIdWithStateFIPSCode,
  DatasetMetadataMap,
} from '../../data/config/DatasetMetadata'
import type { DataTypeConfig } from '../../data/config/MetricConfigTypes'
import { PHRMA_DATATYPES } from '../../data/providers/PhrmaProvider'
import type { MetricQueryResponse } from '../../data/query/MetricQuery'
import type { MapOfDatasetMetadata } from '../../data/utils/DatasetTypes'
import { METHODOLOGY_PAGE_LINK } from '../../utils/internalRoutes'
import {
  type CategoryTypeId,
  getConfigFromDataTypeId,
} from '../../utils/MadLibs'
import {
  selectedDataTypeConfig1Atom,
  selectedDataTypeConfig2Atom,
} from '../../utils/sharedSettingsState'
import {
  getDataSourceMapFromDatasetIds,
  getDatasetIdsFromResponses,
  stripCountyFips,
} from './SourcesHelpers'
import SourcesInfo from './SourcesInfo'

interface SourcesProps {
  queryResponses: MetricQueryResponse[]
  metadata: MapOfDatasetMetadata
  isCensusNotAcs?: boolean
  hideNH?: boolean
  isMulti?: boolean
  showDefinition?: boolean
  isCompareCard?: boolean
  hasIntersectionalAllCompareBar?: boolean
}

export function Sources(props: SourcesProps) {
  // If all data is missing, no need to show sources.
  if (props.queryResponses.every((resp) => resp.dataIsMissing())) {
    return <></>
  }

  const unstrippedDatasetIds: Array<DatasetId | DatasetIdWithStateFIPSCode> =
    getDatasetIdsFromResponses(props.queryResponses)
  let datasetIds: DatasetId[] = stripCountyFips(unstrippedDatasetIds)

  // for Age Adj only, swap ACS source(s) for Census Pop Estimate
  if (props.isCensusNotAcs) {
    datasetIds = datasetIds.filter((datasetId) => !datasetId.includes('acs'))
    datasetIds.push('census_pop_estimates-race_and_ethnicity')
  }

  const dataSourceMap = getDataSourceMapFromDatasetIds(
    datasetIds,
    props.metadata,
  )

  const selectedDataTypeConfigAtom = props.isCompareCard
    ? selectedDataTypeConfig2Atom
    : selectedDataTypeConfig1Atom

  const selectedDataTypeConfig = useAtomValue(selectedDataTypeConfigAtom)

  const selectedDataTypeId = selectedDataTypeConfig?.dataTypeId

  const category: CategoryTypeId | undefined =
    selectedDataTypeConfig?.categoryId
  let methodologyLink = `${METHODOLOGY_PAGE_LINK}/topic-categories/`
  // TODO: refactor to sync CategoryTypeId and Methodology Category Link Routes (they're close but not identical)
  if (category === 'medicare') methodologyLink += 'medication-utilization'
  else methodologyLink += category ?? ''

  let optionalDefinition = ''

  if (
    props.showDefinition &&
    selectedDataTypeId &&
    PHRMA_DATATYPES.includes(selectedDataTypeId)
  ) {
    const selectedDataTypeConfig: DataTypeConfig | null = selectedDataTypeId
      ? getConfigFromDataTypeId(selectedDataTypeId)
      : null

    const dtName = selectedDataTypeConfig?.fullDisplayName
    const dtDefinition = selectedDataTypeConfig?.definition?.text

    if (dtName && dtDefinition)
      optionalDefinition = `${dtName}: ${dtDefinition} `
  }

  const showNhFootnote =
    !props.hideNH &&
    datasetIds.some((id) => DatasetMetadataMap[id]?.contains_nh)

  return (
    <footer className='px-1 py-0 text-left text-smallest'>
      {props.hasIntersectionalAllCompareBar && (
        <p className='w-full'>
          Note. "All People" represents the reference rate for the general
          population in this area, including individuals of every race,
          ethnicity, and sex grouping.
        </p>
      )}
      <p className='w-full'>
        {optionalDefinition}
        {showNhFootnote ? 'Note. (NH) indicates ‘Non-Hispanic’. ' : ''}
        View <HashLink to={methodologyLink}>methodology</HashLink>.
      </p>

      <div
        className={`${
          props.isMulti ? 'xs:w-8/12 sm:w-9/12 md:w-10/12' : 'w-full'
        }`}
      >
        <SourcesInfo dataSourceMap={dataSourceMap} />
      </div>
    </footer>
  )
}
