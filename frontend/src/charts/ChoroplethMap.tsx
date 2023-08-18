import { useState, useEffect } from 'react'
import { Vega } from 'react-vega'
import { useResponsiveWidth } from '../utils/hooks/useResponsiveWidth'
import { type Fips } from '../data/utils/Fips'
import { isPctType, type MetricConfig } from '../data/config/MetricConfig'
import { type Row, type FieldRange } from '../data/utils/DatasetTypes'
import { GEOGRAPHIES_DATASET_ID } from '../data/config/MetadataMap'
import sass from '../styles/variables.module.scss'
import {
  LEGEND_TEXT_FONT,
  MISSING_PLACEHOLDER_VALUES,
  NO_DATA_MESSAGE,
} from './Legend'
import { Grid, useMediaQuery } from '@mui/material'
import {
  buildTooltipTemplate,
  CIRCLE_PROJECTION,
  COLOR_SCALE,
  createInvisibleAltMarks,
  createShapeMarks,
  formatPreventZero100k,
  GEO_DATASET,
  getCountyAddOn,
  getProjection,
  LEGEND_DATASET,
  makeAltText,
  MISSING_DATASET,
  setupColorScale,
  VAR_DATASET,
  GREY_DOT_SCALE_SPEC,
  UNKNOWN_SCALE_SPEC,
  ZERO_VAR_DATASET,
  ZERO_DOT_SCALE_SPEC,
  ZERO_YELLOW_SCALE,
  UNKNOWNS_MAP_SCALE,
  RATE_MAP_SCALE,
  ZERO_DATASET,
  VALID_DATASET,
  getHelperLegend,
  type HighestLowest,
  embedHighestLowestGroups,
  getMapGroupLabel,
  addCountsTooltipInfo,
  DATA_SUPPRESSED,
} from './mapHelpers'
import {
  CAWP_DETERMINANTS,
  getWomenRaceLabel,
} from '../data/providers/CawpProvider'
import { type Legend } from 'vega'
import { type DemographicGroup } from '../data/utils/Constants'
import { PHRMA_METRICS } from '../data/providers/PhrmaProvider'
import { type CountColsMap } from '../cards/MapCard'
import { type DemographicType } from '../data/query/Breakdowns'

const {
  unknownGrey: UNKNOWN_GREY,
  redOrange: RED_ORANGE,
  darkBlue: DARK_BLUE,
} = sass

const GEO_ID = 'id'

// TODO: consider moving standardized column names, like fips, to variables shared between here and VariableProvider
const VAR_FIPS = 'fips'

export interface ChoroplethMapProps {
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
  // If true, the geography will be rendered as a circle. Used to display territories at national level.
  overrideShapeWithCircle?: boolean
  // Do not show a tooltip when there is no data.
  hideMissingDataTooltip?: boolean
  // Callbacks set up so map interactions can update the React UI
  signalListeners: any
  // use the constructed string from the Card Wrapper Title in the export as PNG filename
  filename?: string
  titles?: {
    subtitle?: string
  }
  highestLowestGeosMode?: boolean
  countColsMap: CountColsMap
  mapConfig: { mapScheme: string; mapMin: string }
  isSummaryLegend?: boolean
  isMulti?: boolean
  scaleConfig?: { domain: number[]; range: number[] }
  highestLowestGroupsByFips?: Record<string, HighestLowest>
  activeDemographicGroup: DemographicGroup
}

export function ChoroplethMap(props: ChoroplethMapProps) {
  const zeroData = props.data.filter((row) => row[props.metric.metricId] === 0)
  const isCawp = CAWP_DETERMINANTS.includes(props.metric.metricId)
  const isPhrma = PHRMA_METRICS.includes(props.metric.metricId)

  let suppressedData = props.data

  if (isPhrma) {
    suppressedData = props.data.map((row: Row) => {
      const newRow = { ...row }

      const numeratorId = props.countColsMap?.numeratorConfig?.metricId
      const numerator = numeratorId !== undefined ? row[numeratorId] : undefined
      if (numeratorId && numerator === null)
        newRow[numeratorId] = DATA_SUPPRESSED
      else if (numeratorId && numerator)
        newRow[numeratorId] = numerator.toLocaleString()

      const denominatorId = props.countColsMap?.denominatorConfig?.metricId
      const denominator =
        denominatorId !== undefined ? row[denominatorId] : undefined
      if (denominatorId && denominator === null)
        newRow[denominatorId] = DATA_SUPPRESSED
      else if (denominatorId && denominator)
        newRow[denominatorId] = denominator.toLocaleString()

      return newRow
    })
  }

  const dataWithHighestLowest = embedHighestLowestGroups(
    suppressedData,
    props.highestLowestGroupsByFips
  )

  // render Vega map async as it can be slow
  const [shouldRenderMap, setShouldRenderMap] = useState(false)

  const [ref, width] = useResponsiveWidth(
    /* default width during initialization */ 90
  )

  // calculate page size to determine if tiny mobile or not
  const pageIsTiny = useMediaQuery('(max-width:400px)')

  const heightWidthRatio = props.overrideShapeWithCircle ? 1.2 : 0.5

  // Initial spec state is set in useEffect
  const [spec, setSpec] = useState({})

  // Dataset to use for computing the legend
  const legendData = props.legendData ?? props.data

  useEffect(() => {
    const geoData = props.geoData
      ? { values: props.geoData }
      : { url: `/tmp/${GEOGRAPHIES_DATASET_ID}.json` }

    const neededCols: string[] = [
      props.metric.metricId,
      'highestGroup',
      'lowestGroup',
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
    if (!props.highestLowestGeosMode) {
      geoTransformers[0].values.push('rating')
    }

    if (props.overrideShapeWithCircle) {
      geoTransformers.push({
        type: 'formula',
        as: 'centroid',
        expr: `geoCentroid('${CIRCLE_PROJECTION}', datum.fips)`,
      })
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
      /* metricId */ props.metric.metricId
    )

    const mapGroupLabel = isCawp
      ? `Rate — ${getWomenRaceLabel(props.activeDemographicGroup)}`
      : getMapGroupLabel(
          props.demographicType,
          props.activeDemographicGroup,
          props.metric.type === 'index' ? 'Score' : 'Rate'
        )
    const unknownMapLabel = props.metric.unknownsVegaLabel ?? '% unknown'

    // TODO: would be nice to use addMetricDisplayColumn for the tooltips here so that data formatting is consistent.
    const tooltipLabel = props.isUnknownsMap ? unknownMapLabel : mapGroupLabel

    const tooltipPairs = {
      [tooltipLabel]: tooltipDatum,
    }

    const geographyType = getCountyAddOn(
      /* fips */ props.fips,
      /* showCounties */ props.showCounties
    )

    // Hover tooltip for states with expected 0 values, like CAWP Congress and some HIV/COVID metrics
    const zeroTooltipValue = buildTooltipTemplate(
      /* tooltipPairs */ tooltipPairs,
      /* title */ `datum.properties.name + " ${geographyType}"`,
      /* includeSvi */ true
    )

    // Hover tooltip for null/undefined/missing data
    const missingDataTooltipValue = buildTooltipTemplate(
      /* tooltipPairs */ { [tooltipLabel]: `"${NO_DATA_MESSAGE}"` },
      /* title */ `datum.properties.name + " ${geographyType}"`,
      /* includeSvi */ false
    )

    if (isCawp) {
      addCountsTooltipInfo(
        /* demographicType */ props.demographicType,
        /* tooltipPairs */ tooltipPairs,
        /* countColsMap */ props.countColsMap,
        /* activeDemographicGroup */ props.activeDemographicGroup,
        /* isCawp */ true
      )
    } else if (isPhrma) {
      addCountsTooltipInfo(
        /* demographicType */ props.demographicType,
        /* tooltipPairs */ tooltipPairs,
        /* countColsMap */ props.countColsMap,
        /* activeDemographicGroup */ props.activeDemographicGroup
      )
    }

    tooltipPairs['Highest rate group'] = `datum.highestGroup`
    tooltipPairs['Lowest rate group'] = `datum.lowestGroup`

    // Hover tooltip for non-zero data
    const tooltipValue = buildTooltipTemplate(
      /* tooltipPairs */ tooltipPairs,
      /* title */ `datum.properties.name + " ${geographyType}"`,
      /* includeSvi */ props.showCounties
    )

    /* SET UP MAP EMBEDDED LEGEND (ONLY FOR UNKNOWNS MAP GRADIENT)  */
    const legendList: Legend[] = []

    const legend: Legend = {
      fill: COLOR_SCALE,
      direction: 'horizontal',
      title: '% unknown',
      titleFontSize: pageIsTiny ? 9 : 11,
      titleLimit: 0,
      labelFont: LEGEND_TEXT_FONT,
      titleFont: LEGEND_TEXT_FONT,
      labelOverlap: 'greedy',
      labelSeparation: 10,
      orient: 'none',
      legendY: -50,
      legendX: 50,
      gradientLength: width * 0.35,
      format: 'd',
    }
    if (isPctType(props.metric.type)) {
      legend.encode = {
        labels: {
          update: {
            text: {
              signal: `format(datum.label, '0.1r') + '%'`,
            },
          },
        },
      }
    }

    const helperLegend = getHelperLegend(
      /* yOffset */ -35,
      /* xOffset */ width * 0.35 + 75,
      /* overrideGrayMissingWithZeroYellow */ false
    )
    if (!props.hideLegend) {
      legendList.push(legend, helperLegend)
    }
    const colorScale = setupColorScale(
      /* legendData */ props.data,
      /* metricId */ props.metric.metricId,
      /* scaleType */ props.isUnknownsMap ? UNKNOWNS_MAP_SCALE : RATE_MAP_SCALE,
      /* fieldRange? */ props.fieldRange,
      /* scaleColorScheme? */ props.mapConfig.mapScheme,
      /* isTerritoryCircle? */ props.fips.isTerritory()
    )

    if (props.isMulti ?? props.highestLowestGeosMode) {
      colorScale.domain = props.scaleConfig?.domain
      colorScale.range = props.scaleConfig?.range
    }

    const projection = getProjection(
      /* fips */ props.fips,
      /* width */ width,
      /* heightWidthRatio */ heightWidthRatio,
      /* overrideShapeWithCirce */ props.overrideShapeWithCircle
    )

    const marks = [
      // ZEROS
      createShapeMarks(
        /* datasetName= */ ZERO_DATASET,
        /* fillColor= */ { value: props.mapConfig.mapMin },
        /* hoverColor= */ DARK_BLUE,
        /* tooltipExpression= */ zeroTooltipValue,
        /* overrideShapeWithCircle */ props.overrideShapeWithCircle,
        /* hideMissingDataTooltip */ props.hideMissingDataTooltip
      ),
      // MISSING
      createShapeMarks(
        /* datasetName= */ MISSING_DATASET,
        /* fillColor= */ { value: UNKNOWN_GREY },
        /* hoverColor= */ RED_ORANGE,
        /* tooltipExpression= */ missingDataTooltipValue,
        /* overrideShapeWithCircle */ props.overrideShapeWithCircle,
        /* hideMissingDataTooltip */ props.hideMissingDataTooltip
      ),
      // NON-ZERO
      createShapeMarks(
        /* datasetName= */ VALID_DATASET,
        /* fillColor= */ [{ scale: COLOR_SCALE, field: props.metric.metricId }],
        /* hoverColor= */ DARK_BLUE,
        /* tooltipExpression= */ tooltipValue,
        /* overrideShapeWithCircle */ props.overrideShapeWithCircle,
        /* hideMissingDataTooltip */ props.hideMissingDataTooltip
      ),
    ]

    marks.push(
      createInvisibleAltMarks(
        /* tooltipDatum */ tooltipDatum,
        /*  tooltipLabel */ tooltipLabel
      )
    )

    const altText = makeAltText(
      /* data */ props.data,
      /* filename */ props.filename ?? '',
      /* fips */ props.fips,
      /* overrideShapeWithCircle */ props.overrideShapeWithCircle
    )

    setSpec({
      $schema: 'https://vega.github.io/schema/vega/v5.json',
      background: sass.white,
      description: props.overrideShapeWithCircle
        ? `Territory: ${props.fips.getDisplayName()}`
        : altText,
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
        ZERO_YELLOW_SCALE,
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
    })

    // Render the Vega map asynchronously, allowing the UI to respond to user interaction before Vega maps render.
    // TODO! I'm not sure this is really working... the UI is definitely not responsive while state covid data is loading
    setTimeout(() => {
      setShouldRenderMap(true)
    }, 0)
  }, [
    isCawp,
    width,
    props.metric,
    props.legendTitle,
    props.data,
    props.fips,
    props.hideLegend,
    props.showCounties,
    props.fieldRange,
    props.hideMissingDataTooltip,
    props.overrideShapeWithCircle,
    props.geoData,
    legendData,
    props.isUnknownsMap,
    props.mapConfig.mapScheme,
    props.mapConfig.mapMin,
    props,
    heightWidthRatio,
    pageIsTiny,
  ])

  return (
    <Grid
      container
      justifyContent={'center'}
      ref={props.overrideShapeWithCircle ? undefined : ref}
      sx={{ mt: props.isUnknownsMap ? 5 : 0 }}
    >
      {shouldRenderMap && (
        <Vega
          renderer="svg"
          spec={spec}
          width={props.overrideShapeWithCircle ? undefined : width}
          actions={false}
          downloadFileName={`${props.filename ?? ''} - Health Equity Tracker`}
          signalListeners={props.signalListeners}
        />
      )}
    </Grid>
  )
}
