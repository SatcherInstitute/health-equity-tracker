import styles from './Sources.module.scss'
import { type MapOfDatasetMetadata } from '../../data/utils/DatasetTypes'
import { METHODOLOGY_TAB_LINK } from '../../utils/internalRoutes'
import { type MetricQueryResponse } from '../../data/query/MetricQuery'
import {
  type DatasetId,
  DatasetMetadataMap,
  type DatasetIdWithStateFIPSCode,
} from '../../data/config/DatasetMetadata'
import { Grid } from '@mui/material'
import {
  type DropdownVarId,
  type DataTypeConfig,
} from '../../data/config/MetricConfig'
import { useAtomValue } from 'jotai'
import { getParentDropdownFromDataTypeId } from '../../pages/ExploreData/MadLibUI'
import { selectedDataTypeConfig1Atom } from '../../utils/sharedSettingsState'
import { HashLink } from 'react-router-hash-link'
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
  downloadTargetScreenshot?: () => Promise<boolean>
  isMulti?: boolean
  dataTypeConfig?: DataTypeConfig
}

export function Sources(props: SourcesProps) {
  // If all data is missing, no need to show sources.
  if (props.queryResponses.every((resp) => resp.dataIsMissing())) {
    return <></>
  }

  const selectedDataTypeId = useAtomValue(
    selectedDataTypeConfig1Atom
  )?.dataTypeId

  const dropdownVarId: DropdownVarId | '' = selectedDataTypeId
    ? getParentDropdownFromDataTypeId(selectedDataTypeId)
    : ''

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
    props.metadata
  )

  const showNhFootnote =
    !props.hideNH &&
    datasetIds.some((id) => DatasetMetadataMap[id]?.contains_nh)

  return (
    <Grid container className={styles.Footnote}>
      <Grid item xs={12} alignItems={'center'}>
        {props.dataTypeConfig?.fullDisplayName}:{' '}
        {props.dataTypeConfig?.definition?.text}. View{' '}
        <HashLink to={`${METHODOLOGY_TAB_LINK}#${dropdownVarId}`}>
          methodology
        </HashLink>
      </Grid>

      {/* NH note (if needed) listed first, full-width */}
      <Grid item xs={12} alignItems={'center'}>
        {showNhFootnote && (
          <>
            <p className={styles.FootnoteTextNH}>
              Note. NH: Non-Hispanic. To promote inclusion, we replace the
              source data labels <>‘Multiracial’</> with{' '}
              <>‘Two or more races’</>, and <>‘Some other’</> with{' '}
              <>‘Unrepresented’</>.{' '}
            </p>
          </>
        )}
      </Grid>

      <>
        <Grid
          item
          xs={props.isMulti ? 8 : 12}
          sm={props.isMulti ? 9 : 12}
          md={props.isMulti ? 10 : 12}
          container
          alignItems={'center'}
        >
          <SourcesInfo dataSourceMap={dataSourceMap} />
        </Grid>
      </>
    </Grid>
  )
}
