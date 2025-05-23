// TODO: eventually should make a HetDialog to handle modals
import { Dialog, DialogContent } from '@mui/material'
import RateMapLegend from '../../charts/choroplethMap/RateMapLegend'
import ChoroplethMap from '../../charts/choroplethMap/index'
import type { CountColsMap } from '../../charts/mapGlobals'
import type {
  DataTypeConfig,
  MetricConfig,
} from '../../data/config/MetricConfigTypes'
import {
  CAWP_METRICS,
  getWomenRaceLabel,
} from '../../data/providers/CawpProvider'
import {
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
  type DemographicType,
} from '../../data/query/Breakdowns'
import type {
  MetricQuery,
  MetricQueryResponse,
} from '../../data/query/MetricQuery'
import type { DemographicGroup } from '../../data/utils/Constants'
import type {
  FieldRange,
  HetRow,
  MapOfDatasetMetadata,
} from '../../data/utils/DatasetTypes'
import { Fips } from '../../data/utils/Fips'
import DataTypeDefinitionsList from '../../pages/ui/DataTypeDefinitionsList'
import HetBreadcrumbs from '../../styles/HetComponents/HetBreadcrumbs'
import HetLinkButton from '../../styles/HetComponents/HetLinkButton'
import HetNotice from '../../styles/HetComponents/HetNotice'
import HetTerm from '../../styles/HetComponents/HetTerm'
import type { ScrollableHashId } from '../../utils/hooks/useStepObserver'
import CardOptionsMenu from './CardOptionsMenu'
import { Sources } from './Sources'

export const MULTIMAP_MODAL_CONTENT_ID = 'multimap-modal-content'

interface MultiMapDialogProps {
  dataTypeConfig: DataTypeConfig
  // Metric the small maps will evaluate
  metricConfig: MetricConfig
  // Whether or not the data was collected via survey
  useSmallSampleMessage: boolean
  // Demographic upon which we're dividing the data, i.e. "age"
  demographicType: DemographicType
  // Unique values for demographicType, each one will have it's own map
  demographicGroups: DemographicGroup[]
  // Geographic region of maps
  fips: Fips
  // Data that populates maps
  data: HetRow[]
  // Range of metric's values, used for creating a common legend across maps
  fieldRange: FieldRange | undefined
  // Whether or not dialog is currently open
  open: boolean
  // Closes the dialog in the parent component
  handleClose: () => void
  queries: MetricQuery[]
  // Dataset IDs required the source  footer
  queryResponses: MetricQueryResponse[]
  // Metadata required for the source footer
  metadata: MapOfDatasetMetadata
  demographicGroupsNoData: DemographicGroup[]
  countColsMap: CountColsMap
  // Geography data, in topojson format. Must include both states and counties.
  // If not provided, defaults to directly loading /tmp/geographies.json
  geoData?: Record<string, any>
  // optional to show state data when county not available
  hasSelfButNotChildGeoData?: boolean
  updateFipsCallback: (fips: Fips) => void
  totalPopulationPhrase: string
  subPopulationPhrase: string
  handleMapGroupClick: (_: any, newGroup: DemographicGroup) => void
  pageIsSmall: boolean
  reportTitle: string
  subtitle?: string
  scrollToHash: ScrollableHashId
  isPhrmaAdherence: boolean
  isAtlantaMode?: boolean
  setIsAtlantaMode: (isAtlantaMode: boolean) => void
  colorScale: d3.ScaleSequential<string, never>
}

/*
   MultiMapDialog is a dialog opened via the MapCard that shows one small map for each unique
    value in a given demographicType for a particular metric.
*/
export default function MultiMapDialog(props: MultiMapDialogProps) {
  const title = `${
    props.metricConfig.chartTitle
  } in ${props.isAtlantaMode ? 'metro Atlanta counties' : props.fips.getSentenceDisplayName()} across all ${
    DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[props.demographicType]
  } groups`

  /* handle clicks on sub-geos in multimap view */
  const multimapSignalListeners: any = {
    click: (...args: any) => {
      const clickedData = args[1]
      if (clickedData?.id) {
        if (props.isAtlantaMode) props.setIsAtlantaMode(false)
        props.updateFipsCallback(new Fips(clickedData.id))
      }
    },
  }

  const mapConfig = props.dataTypeConfig.mapConfig

  return (
    <Dialog
      className='z-multiMapModal'
      id='multimap-modal'
      open={props.open}
      onClose={props.handleClose}
      maxWidth={false}
      scroll='paper'
      aria-labelledby='modalTitle'
    >
      <DialogContent
        dividers={true}
        className='p-2 '
        id={MULTIMAP_MODAL_CONTENT_ID}
      >
        {/* card options button */}
        <div className='mb-2 flex justify-end'>
          <CardOptionsMenu
            reportTitle={props.reportTitle}
            scrollToHash={'multimap-modal'}
          />
        </div>

        {/* card heading row */}
        <div className='mb-4 flex justify-between'>
          {/* Modal Title */}
          <h3 className='m-2 w-full md:m-2' id='modalTitle'>
            {title}
          </h3>
        </div>

        {/* Maps container */}
        <div className='mb-6'>
          <ul className='grid list-none grid-cols-1 justify-between gap-2 p-0 sm:grid-cols-2 smMd:grid-cols-3 md:grid-cols-4 md:gap-3 md:p-2 lg:grid-cols-5'>
            {/* Multiples Maps */}
            {props.demographicGroups.map((demographicGroup) => {
              const mapLabel = CAWP_METRICS.includes(
                props.metricConfig.metricId,
              )
                ? getWomenRaceLabel(demographicGroup)
                : demographicGroup
              const dataForValue = props.data.filter(
                (row: HetRow) =>
                  row[props.demographicType] === demographicGroup,
              )

              return (
                <li
                  key={`${demographicGroup}-grid-item`}
                  className='min-h-multimapMobile w-full sm:p-1 md:min-h-multimapDesktop md:p-2'
                >
                  <h3 className='m-0 font-medium text-smallest leading-lhTight sm:text-small sm:leading-lhNormal md:text-text'>
                    {mapLabel}
                  </h3>
                  <div>
                    {props.metricConfig && dataForValue?.length > 0 && (
                      <ChoroplethMap
                        colorScale={props.colorScale}
                        demographicType={props.demographicType}
                        activeDemographicGroup={demographicGroup}
                        countColsMap={props.countColsMap}
                        data={dataForValue}
                        fieldRange={props.fieldRange}
                        filename={title}
                        fips={props.fips}
                        geoData={props.geoData}
                        hideLegend={true}
                        key={demographicGroup}
                        legendData={props.data}
                        metricConfig={props.metricConfig}
                        showCounties={
                          !props.fips.isUsa() &&
                          !props.hasSelfButNotChildGeoData
                        }
                        signalListeners={multimapSignalListeners}
                        mapConfig={mapConfig}
                        isMulti={true}
                        isExtremesMode={false}
                        isPhrmaAdherence={props.isPhrmaAdherence}
                        isAtlantaMode={props.isAtlantaMode}
                        updateFipsCallback={props.updateFipsCallback}
                      />
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        {/* LEGEND */}
        <div className='mb-6'>
          <RateMapLegend
            dataTypeConfig={props.dataTypeConfig}
            metricConfig={props.metricConfig}
            legendTitle={props.metricConfig.shortLabel}
            data={props.data}
            description={'Legend for rate map'}
            mapConfig={mapConfig}
            isSummaryLegend={false}
            fieldRange={props.fieldRange}
            isMulti={true}
            isPhrmaAdherence={props.isPhrmaAdherence}
            fips={props.fips}
            colorScale={props.colorScale}
          />
        </div>

        {/* Breadcrumbs - desktop only */}
        <div className='mt-4 mb-4 hidden md:block'>
          <HetBreadcrumbs
            fips={props.fips}
            updateFipsCallback={props.updateFipsCallback}
            scrollToHashId={'rate-map'}
            totalPopulationPhrase={props.totalPopulationPhrase}
            subPopulationPhrase={props.subPopulationPhrase}
            isAtlantaMode={props.isAtlantaMode}
          />
        </div>

        {/* Breadcrumbs - mobile only */}
        <div className='mt-3 mb-4 md:hidden'>
          <HetBreadcrumbs
            fips={props.fips}
            updateFipsCallback={props.updateFipsCallback}
            scrollToHashId={'rate-map'}
            totalPopulationPhrase={props.totalPopulationPhrase}
            subPopulationPhrase={props.subPopulationPhrase}
            isAtlantaMode={props.isAtlantaMode}
          />
        </div>

        {/* Missing Groups */}
        {props.demographicGroupsNoData.length > 0 && (
          <div className='hide-on-screenshot mb-4 w-full lg:w-2/3 xl:w-7/12'>
            <div className='my-3'>
              <HetNotice kind='data-integrity'>
                <p className='m-0'>
                  Insufficient {props.metricConfig.shortLabel} data reported at
                  the {props.fips.getChildFipsTypeDisplayName()} level for the
                  following groups:{' '}
                  {props.demographicGroupsNoData.map((group, i) => (
                    <span key={group}>
                      <HetTerm>{group}</HetTerm>
                      {i < props.demographicGroupsNoData.length - 1 && '; '}
                    </span>
                  ))}
                </p>
              </HetNotice>
            </div>
          </div>
        )}

        <div className='hide-on-screenshot mb-2'>
          <HetNotice kind='text-only'>
            <DataTypeDefinitionsList />
          </HetNotice>
        </div>
      </DialogContent>

      {/* MODAL FOOTER */}
      <section className='hide-on-screenshot'>
        <div className='flex items-center justify-between pl-2 text-left text-small'>
          {/* Desktop only Sources and Card Options */}
          <div className='hidden sm:block'>
            <Sources
              queryResponses={props.queryResponses}
              metadata={props.metadata}
              isMulti={true}
            />
          </div>
          {/*  CLOSE button */}
          <div>
            <HetLinkButton
              className='hide-on-screenshot justify-center'
              aria-label='close this multiple maps modal'
              onClick={props.handleClose}
            >
              Close
            </HetLinkButton>
          </div>
        </div>
      </section>
    </Dialog>
  )
}
