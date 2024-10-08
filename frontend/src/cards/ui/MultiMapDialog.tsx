import { useState } from 'react'
// TODO: eventually should make a HetSnackbar to handle modals
import { Dialog, DialogContent } from '@mui/material'
import ChoroplethMap from '../../charts/ChoroplethMap'
import { Legend } from '../../charts/Legend'
import { type CountColsMap, RATE_MAP_SCALE } from '../../charts/mapGlobals'
import type {
  DataTypeConfig,
  MetricConfig,
} from '../../data/config/MetricConfigTypes'
import {
  CAWP_METRICS,
  getWomenRaceLabel,
} from '../../data/providers/CawpProvider'
import {
  type DemographicType,
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
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
import TerritoryCircles from './TerritoryCircles'

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
  isPhrmaAdherence?: boolean
}

/*
   MultiMapDialog is a dialog opened via the MapCard that shows one small map for each unique
    value in a given demographicType for a particular metric.
*/
export default function MultiMapDialog(props: MultiMapDialogProps) {
  const title = `${
    props.metricConfig.chartTitle
  } in ${props.fips.getSentenceDisplayName()} across all ${
    DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[props.demographicType]
  } groups`

  /* handle clicks on sub-geos in multimap view */
  const multimapSignalListeners: any = {
    click: (...args: any) => {
      const clickedData = args[1]
      if (clickedData?.id) {
        props.updateFipsCallback(new Fips(clickedData.id))
      }
    },
  }

  const mapConfig = props.dataTypeConfig.mapConfig

  const [scale, setScale] = useState<{ domain: number[]; range: number[] }>({
    domain: [],
    range: [],
  })

  function handleScaleChange(domain: number[], range: number[]) {
    // Update the scale state when the domain or range changes
    setScale({ domain, range })
  }

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
      <DialogContent dividers={true} className='p-2'>
        <div>
          {/* card options button */}
          <div className='flex w-full justify-end '>
            <CardOptionsMenu
              reportTitle={props.reportTitle}
              scrollToHash={props.scrollToHash}
            />
          </div>

          {/* card heading row */}
          <div className='col-span-full flex w-full justify-between'>
            {/* Modal Title */}
            <h2
              className='m-2 w-full text-small font-light leading-lhNormal sm:text-text sm:leading-lhModalHeading md:m-2 md:text-exploreButton'
              id='modalTitle'
            >
              {title}
            </h2>
          </div>

          <ul className='grid list-none grid-cols-2 justify-between gap-2 p-0 sm:grid-cols-3 md:grid-cols-4 md:gap-3 md:p-2 lg:grid-cols-5'>
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
                  <h3 className='m-0 text-smallest font-medium leading-lhTight sm:text-small sm:leading-lhNormal md:text-text'>
                    {mapLabel}
                  </h3>
                  <div>
                    {props.metricConfig && dataForValue?.length > 0 && (
                      <ChoroplethMap
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
                        metric={props.metricConfig}
                        showCounties={
                          !props.fips.isUsa() &&
                          !props.hasSelfButNotChildGeoData
                        }
                        signalListeners={multimapSignalListeners}
                        mapConfig={mapConfig}
                        isMulti={true}
                        scaleConfig={scale}
                        extremesMode={false}
                      />
                    )}
                  </div>

                  {/* TERRITORIES (IF NATIONAL VIEW) */}
                  {props.metricConfig &&
                    props.fips.isUsa() &&
                    dataForValue.length && (
                      <TerritoryCircles
                        demographicType={props.demographicType}
                        countColsMap={props.countColsMap}
                        data={dataForValue}
                        geoData={props.geoData}
                        mapIsWide={false}
                        metricConfig={props.metricConfig}
                        dataTypeConfig={props.dataTypeConfig}
                        signalListeners={multimapSignalListeners}
                        scaleConfig={scale}
                        isMulti={true}
                        activeDemographicGroup={demographicGroup}
                        extremesMode={false}
                      />
                    )}
                </li>
              )
            })}
          </ul>

          {/* LEGEND */}
          <div className='col-span-full flex w-full justify-start md:col-span-1'>
            <Legend
              dataTypeConfig={props.dataTypeConfig}
              metric={props.metricConfig}
              legendTitle={props.metricConfig.shortLabel}
              data={props.data}
              scaleType={RATE_MAP_SCALE}
              sameDotSize={true}
              description={'Consistent legend for all displayed maps'}
              mapConfig={mapConfig}
              stackingDirection={'horizontal'}
              columns={6}
              handleScaleChange={handleScaleChange}
              isMulti={true}
              isPhrmaAdherence={props.isPhrmaAdherence}
            />
          </div>

          {/* Population Breadcrumbs + Legend */}
          <div className='col-span-full flex w-full items-end justify-between'>
            {/* DESKTOP BREADCRUMBS */}
            <div className='hidden w-full justify-start md:flex'>
              <HetBreadcrumbs
                fips={props.fips}
                updateFipsCallback={props.updateFipsCallback}
                scrollToHashId={'rate-map'}
                totalPopulationPhrase={props.totalPopulationPhrase}
                subPopulationPhrase={props.subPopulationPhrase}
              />
            </div>

            {/* MOBILE BREADCRUMBS */}
            <div className='col-span-full mt-3 flex w-full justify-center md:hidden'>
              <HetBreadcrumbs
                fips={props.fips}
                updateFipsCallback={props.updateFipsCallback}
                scrollToHashId={'rate-map'}
                totalPopulationPhrase={props.totalPopulationPhrase}
                subPopulationPhrase={props.subPopulationPhrase}
              />
            </div>
          </div>

          {/* Missing Groups */}
          {props.demographicGroupsNoData.length > 0 && (
            <div className='col-span-full w-full justify-center xl:w-7/12'>
              <div className='my-3'>
                <HetNotice kind='data-integrity'>
                  <p className='m-0'>
                    Insufficient {props.metricConfig.shortLabel} data reported
                    at the {props.fips.getChildFipsTypeDisplayName()} level for
                    the following groups:{' '}
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

          <HetNotice kind='text-only' className='col-span-full'>
            <DataTypeDefinitionsList />
          </HetNotice>
        </div>
      </DialogContent>

      {/* MODAL FOOTER */}
      <section>
        <div className='flex justify-between pl-2 text-left text-small'>
          {/* Desktop only Sources and Card Options */}
          <div className='hidden w-full sm:block'>
            <Sources
              queryResponses={props.queryResponses}
              metadata={props.metadata}
              isMulti={true}
            />
          </div>
          {/*  CLOSE button */}
          <HetLinkButton
            className='w-full justify-center hide-on-screenshot'
            aria-label='close this multiple maps modal'
            onClick={props.handleClose}
          >
            Close
          </HetLinkButton>
        </div>
      </section>
    </Dialog>
  )
}
