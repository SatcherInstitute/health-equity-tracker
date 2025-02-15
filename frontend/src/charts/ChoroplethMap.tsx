import { useEffect, useMemo, useState } from 'react'
import { Vega } from 'react-vega'
import type { Legend } from 'vega'
import { GEOGRAPHIES_DATASET_ID } from '../data/config/MetadataMap'
import type { MapConfig, MetricConfig } from '../data/config/MetricConfigTypes'
import { isPctType } from '../data/config/MetricConfigUtils'
import { CAWP_METRICS, getWomenRaceLabel } from '../data/providers/CawpProvider'
import { PHRMA_METRICS } from '../data/providers/PhrmaProvider'
import type { DemographicType } from '../data/query/Breakdowns'
import type { DemographicGroup } from '../data/utils/Constants'
import type { FieldRange, HetRow } from '../data/utils/DatasetTypes'
import type { Fips } from '../data/utils/Fips'
import { het } from '../styles/DesignTokens'
import { useIsBreakpointAndUp } from '../utils/hooks/useIsBreakpointAndUp'
import { useResponsiveWidth } from '../utils/hooks/useResponsiveWidth'
import { setupUnknownsLegend } from './legendHelperFunctions'
import {
  COLOR_SCALE,
  type CountColsMap,
  DATA_SUPPRESSED,
  GEO_DATASET,
  GREY_DOT_SCALE_SPEC,
  type HighestLowest,
  INVISIBLE_PRELOAD_WIDTH,
  LEGEND_DATASET,
  MISSING_DATASET,
  MISSING_PLACEHOLDER_VALUES,
  NO_DATA_MESSAGE,
  PHRMA_COLOR_SCALE_SPEC,
  RATE_MAP_SCALE,
  UNKNOWNS_MAP_SCALE,
  UNKNOWN_SCALE_SPEC,
  VALID_DATASET,
  VAR_DATASET,
  ZERO_DARK_SCALE,
  ZERO_DATASET,
  ZERO_DOT_SCALE_SPEC,
  ZERO_LIGHT_SCALE,
  ZERO_VAR_DATASET,
} from './mapGlobals'
import {
  addCountsTooltipInfo,
  buildTooltipTemplate,
  createInvisibleAltMarks,
  createShapeMarks,
  embedHighestLowestGroups,
  formatPreventZero100k,
  getCountyAddOn,
  getHelperLegend,
  getMapGroupLabel,
  getProjection,
  makeAltText,
  setupColorScale,
} from './mapHelperFunctions'
import { HEIGHT_WIDTH_RATIO } from './utils'

const {
  howToColor: UNKNOWN_GREY,
  redOrange: RED_ORANGE,
  darkBlue: DARK_BLUE,
} = het

const GEO_ID = 'id'

// TODO: consider moving standardized column names, like fips, to variables shared between here and VariableProvider
const VAR_FIPS = 'fips'

interface ChoroplethMapProps {
  demographicType: DemographicType
  // Data used to create the map
  data: Array<Record<string, any>>
  // Geography data, in topojson format. Must include both states and counties.
  // If not provided, defaults to directly loading /tmp/geographies.json
  geoData?: Record<string, any>
  // Metric within the data that we are visualizing
  metric: MetricConfig
  // The geography that this map is showing
  fips: Fips
  // Use different labels for legend and tooltip if it's the unknowns map
  isUnknownsMap?: boolean
  // If true, maps will render counties, otherwise it will render states/territories
  showCounties: boolean
  // full dataset used to get proper colors across maps/map circles
  legendData?: Array<Record<string, any>>
  // Whether or not the legend is present
  hideLegend?: boolean
  // If legend is present, what is the title
  legendTitle?: string | string[]
  // Max/min of the data range- if present it will set the color scale at these boundaries
  fieldRange?: FieldRange
  // Do not show a tooltip when there is no data.
  hideMissingDataTooltip?: boolean
  // Callbacks set up so map interactions can update the React UI
  signalListeners: any
  // use the constructed string from the Card Wrapper Title in the export as PNG filename
  filename?: string
  titles?: {
    subtitle?: string
  }
  extremesMode: boolean
  countColsMap: CountColsMap
  mapConfig: MapConfig
  isSummaryLegend?: boolean
  isMulti?: boolean
  scaleConfig?: { domain: number[]; range: string[] }
  highestLowestGroupsByFips?: Record<string, HighestLowest>
  activeDemographicGroup: DemographicGroup
  isPhrmaAdherence?: boolean
}

export default function ChoroplethMap(props: ChoroplethMapProps) {
  const isMobile = !useIsBreakpointAndUp('md')

  const zeroData = props.data.filter((row) => row[props.metric.metricId] === 0)
  const isCawp = CAWP_METRICS.includes(props.metric.metricId)
  const isPhrma = PHRMA_METRICS.includes(props.metric.metricId)

  let suppressedData = props.data

  if (isPhrma) {
    suppressedData = props.data.map((row: HetRow) => {
      const newRow = { ...row }

      const numeratorId = props.countColsMap?.numeratorConfig?.metricId
      const numerator = numeratorId !== undefined ? row[numeratorId] : undefined
      if (numeratorId && numerator === null)
        newRow[numeratorId] = DATA_SUPPRESSED
      else if (numeratorId && numerator >= 0)
        newRow[numeratorId] = numerator.toLocaleString()

      const denominatorId = props.countColsMap?.denominatorConfig?.metricId
      const denominator =
        denominatorId !== undefined ? row[denominatorId] : undefined
      if (denominatorId && denominator === null)
        newRow[denominatorId] = DATA_SUPPRESSED
      else if (denominatorId && denominator >= 0)
        newRow[denominatorId] = denominator.toLocaleString()

      return newRow
    })
  }

  const dataWithHighestLowest =
    !props.isUnknownsMap && !props.isMulti
      ? useMemo(
          () =>
            embedHighestLowestGroups(
              suppressedData,
              props.highestLowestGroupsByFips,
            ),
          [suppressedData, props.highestLowestGroupsByFips],
        )
      : suppressedData

  const [ref, width] = useResponsiveWidth()

  const heightWidthRatio = HEIGHT_WIDTH_RATIO

  // Initial spec state is set in useEffect
  const [spec, setSpec] = useState({})

  // Dataset to use for computing the legend
  const legendData = props.legendData ?? props.data

  const geoData = props.geoData
    ? { values: props.geoData }
    : { url: `/tmp/${GEOGRAPHIES_DATASET_ID}.json` }

  const neededCols: string[] = [
    props.metric.metricId,
    'highestGroup',
    'lowestGroup',
    'fips_name',
  ]

  // if count col metricIds are available, add those columns to the transformed dataset for VEGA
  props.countColsMap?.numeratorConfig?.metricId &&
    neededCols.push(props.countColsMap.numeratorConfig.metricId)
  props.countColsMap?.denominatorConfig?.metricId &&
    neededCols.push(props.countColsMap.denominatorConfig.metricId)

  /* SET UP GEO DATASET */
  // Transform geo dataset by adding varField from VAR_DATASET
  const geoTransformers: any[] = [
    {
      type: 'lookup',
      from: VAR_DATASET,
      key: VAR_FIPS,
      fields: [GEO_ID],
      values: neededCols,
    },
  ]
  // Null SVI was showing
  if (!props.extremesMode) {
    geoTransformers[0].values.push('rating')
  }

  if (props.fips.isStateOrTerritory()) {
    // The first two characters of a county FIPS are the state FIPS
    const stateFipsVar = `slice(datum.id,0,2) == '${props.fips.code}'`
    geoTransformers.push({
      type: 'filter',
      expr: stateFipsVar,
    })
  }
  if (props.fips.isCounty()) {
    geoTransformers.push({
      type: 'filter',
      expr: `datum.id === "${props.fips.code}"`,
    })
  }

  /* SET UP TOOLTIP */
  const tooltipDatum = formatPreventZero100k(
    /* type */ props.metric.type,
    /* metricId */ props.metric.metricId,
  )

  const mapGroupLabel = isCawp
    ? `Rate — ${getWomenRaceLabel(props.activeDemographicGroup)}`
    : getMapGroupLabel(
        props.demographicType,
        props.activeDemographicGroup,
        props.metric.type === 'index' ? 'Score' : 'Rate',
      )
  const unknownMapLabel = props.metric.unknownsVegaLabel ?? '% unknown'

  // TODO: would be nice to use addMetricDisplayColumn for the tooltips here so that data formatting is consistent.
  const tooltipLabel = props.isUnknownsMap ? unknownMapLabel : mapGroupLabel

  const tooltipPairs = {
    [tooltipLabel]: tooltipDatum,
  }

  const geographyType = getCountyAddOn(
    /* fips */ props.fips,
    /* showCounties */ props.showCounties,
  )

  // Hover tooltip for null/undefined/missing data, using the location name found in geographies.json
  const missingDataTooltipValue = buildTooltipTemplate(
    /* tooltipPairs */ { [tooltipLabel]: `"${NO_DATA_MESSAGE}"` },
    /* title */ `datum.properties.name + " ${geographyType}"`,
    /* includeSvi */ false,
  )

  if (props.countColsMap) {
    addCountsTooltipInfo(
      /* demographicType */ props.demographicType,
      /* tooltipPairs */ tooltipPairs,
      /* countColsMap */ props.countColsMap,
      /* activeDemographicGroup */ props.activeDemographicGroup,
      /* isCawp */ isCawp,
    )
  }

  tooltipPairs['Highest rate group'] = `datum.highestGroup`
  tooltipPairs['Lowest rate group'] = `datum.lowestGroup`

  // Hover tooltip for states with expected 0 values, like CAWP Congress and some HIV/COVID metrics
  const zeroTooltipValue = buildTooltipTemplate(
    /* tooltipPairs */ tooltipPairs,
    /* title */ `datum.properties.name + " ${geographyType}"`,
    /* includeSvi */ true,
  )

  // Hover tooltip for non-zero data, using source data's location name
  const tooltipValue = buildTooltipTemplate(
    /* tooltipPairs */ tooltipPairs,
    /* title */ `datum.fips_name`,
    /* includeSvi */ props.showCounties,
  )

  const legendList: Legend[] = []

  /* SET UP MAP EMBEDDED LEGEND (ONLY FOR UNKNOWNS MAP GRADIENT)  */
  const unknownsLegend = setupUnknownsLegend(
    /* width */ width,
    /* isPct */ isPctType(props.metric.type),
  )

  const helperLegend = getHelperLegend(
    /* yOffset */ -35,
    /* xOffset */ width * 0.35 + 75,
  )
  if (!props.hideLegend) {
    legendList.push(unknownsLegend, helperLegend)
  }

  const colorScale = props.isPhrmaAdherence
    ? PHRMA_COLOR_SCALE_SPEC
    : setupColorScale(
        /* legendData */ props.data,
        /* metricId */ props.metric.metricId,
        /* scaleType */ props.isUnknownsMap
          ? UNKNOWNS_MAP_SCALE
          : RATE_MAP_SCALE,
        /* fieldRange? */ props.fieldRange,
        /* scaleColorScheme? */ props.mapConfig.scheme as string,
        /* isTerritoryCircle? */ props.fips.isTerritory(),
        /* reverse? */ !props.mapConfig.higherIsBetter && !props.isUnknownsMap,
      )

  if (props.extremesMode) {
    colorScale.domain = props.scaleConfig?.domain
    colorScale.range = props.scaleConfig?.range
    colorScale.reverse = false
  }

  if (props.isMulti) {
    colorScale.domain = props.scaleConfig?.domain
  }

  const projection = getProjection(
    /* fips */ props.fips,
    /* width */ width,
    /* heightWidthRatio */ heightWidthRatio,
  )

  const marks = [
    // ZEROS
    createShapeMarks(
      /* datasetName= */ ZERO_DATASET,
      /* fillColor= */ {
        value: props.mapConfig.min,
      },
      /* hoverColor= */ DARK_BLUE,
      /* tooltipExpression= */ zeroTooltipValue,
      /* hideMissingDataTooltip */ props.hideMissingDataTooltip,
      /* outlineGeos */ props.extremesMode,
      /* is multimap */ props.isMulti,
      /* is mobile device */ isMobile,
    ),
    // MISSING
    createShapeMarks(
      /* datasetName= */ MISSING_DATASET,
      /* fillColor= */ {
        value: props.extremesMode ? het.white : UNKNOWN_GREY,
      },
      /* hoverColor= */ props.extremesMode ? het.white : RED_ORANGE,
      /* tooltipExpression= */ missingDataTooltipValue,
      /* hideMissingDataTooltip */ props.hideMissingDataTooltip,
      /* outlineGeos */ props.extremesMode,
      props.isMulti,
      /* is mobile device */ isMobile,
    ),
    // NON-ZERO
    createShapeMarks(
      /* datasetName= */ VALID_DATASET,
      /* fillColor= */ [{ scale: COLOR_SCALE, field: props.metric.metricId }],
      /* hoverColor= */ DARK_BLUE,
      /* tooltipExpression= */ tooltipValue,
      /* hideMissingDataTooltip */ props.hideMissingDataTooltip,
      /* outlineGeos */ props.extremesMode,
      props.isMulti,
      /* is mobile device */ isMobile,
    ),
  ]

  marks.push(
    createInvisibleAltMarks(
      /* tooltipDatum */ tooltipDatum,
      /*  tooltipLabel */ tooltipLabel,
    ),
  )

  const altText = makeAltText(
    /* data */ props.data,
    /* filename */ props.filename ?? '',
    /* fips */ props.fips,
  )

  useEffect(() => {
    const newSpec = {
      $schema: 'https://vega.github.io/schema/vega/v5.json',
      background: het.white,
      description: altText,
      data: [
        {
          name: MISSING_PLACEHOLDER_VALUES,
          values: [{ missing: NO_DATA_MESSAGE }],
        },
        {
          name: VAR_DATASET,
          values: dataWithHighestLowest,
        },
        {
          name: ZERO_VAR_DATASET,
          values: zeroData,
        },
        {
          name: LEGEND_DATASET,
          values: legendData,
        },
        {
          name: GEO_DATASET,
          transform: geoTransformers,
          ...geoData,
          format: {
            type: 'topojson',
            feature: props.showCounties ? 'counties' : 'states',
          },
        },
        {
          name: VALID_DATASET,
          transform: [
            {
              type: 'filter',
              expr: `isValid(datum.${props.metric.metricId}) && datum.${props.metric.metricId} > 0`,
            },
          ],
          source: GEO_DATASET,
          format: {
            type: 'topojson',
            feature: props.showCounties ? 'counties' : 'states',
          },
        },
        {
          name: ZERO_DATASET,
          transform: [
            {
              type: 'filter',
              expr: `datum.${props.metric.metricId} === 0`,
            },
          ],
          source: GEO_DATASET,
          format: {
            type: 'topojson',
            feature: props.showCounties ? 'counties' : 'states',
          },
        },
        {
          name: MISSING_DATASET,
          transform: [
            {
              type: 'filter',
              expr: `!isValid(datum.${props.metric.metricId})`,
            },
          ],
          source: GEO_DATASET,
          format: {
            type: 'topojson',
            feature: props.showCounties ? 'counties' : 'states',
          },
        },
      ],
      projections: [projection],
      scales: [
        colorScale,
        GREY_DOT_SCALE_SPEC,
        UNKNOWN_SCALE_SPEC,
        ZERO_DOT_SCALE_SPEC,
        props.mapConfig.higherIsBetter ? ZERO_DARK_SCALE : ZERO_LIGHT_SCALE,
      ],
      legends: legendList,
      marks,
      signals: [
        {
          name: 'click',
          value: 0,
          on: [{ events: 'click', update: 'datum' }],
        },
      ],
    }

    setSpec(newSpec)

    // Render the Vega map asynchronously, putting the expensive render at the back of the queued work
    setTimeout(() => {
      setShouldRenderMap(true)
    }, 0)
  }, [
    isCawp,
    width,
    props.data,
    props.fieldRange,
    legendData,
    props.mapConfig.scheme,
    props.mapConfig.min,
  ])

  const [shouldRenderMap, setShouldRenderMap] = useState(false)

  const mapIsReady = Boolean(
    shouldRenderMap && spec && ref.current && props.signalListeners,
  )

  return (
    <div
      className={`justify-center ${props.isUnknownsMap ? 'mt-1' : 'mt-0'}
      ${width === INVISIBLE_PRELOAD_WIDTH ? 'hidden' : 'block'}
      `}
      ref={ref}
    >
      {mapIsReady && (
        <Vega
          renderer='svg'
          spec={spec}
          width={width}
          actions={false}
          downloadFileName={`${props.filename ?? ''} - Health Equity Tracker`}
          signalListeners={props.signalListeners}
        />
      )}
    </div>
  )
}
