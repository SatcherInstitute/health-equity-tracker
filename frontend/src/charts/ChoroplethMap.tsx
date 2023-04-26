import { useState, useEffect } from 'react'
import { Vega } from 'react-vega'
import { useResponsiveWidth } from '../utils/hooks/useResponsiveWidth'
import { type Fips } from '../data/utils/Fips'
import { type MetricConfig, type MetricId } from '../data/config/MetricConfig'
import { type FieldRange } from '../data/utils/DatasetTypes'
import { GEOGRAPHIES_DATASET_ID } from '../data/config/MetadataMap'
import { useFontSize } from '../utils/hooks/useFontSize'
import sass from '../styles/variables.module.scss'
import {
  LEGEND_TEXT_FONT,
  MISSING_PLACEHOLDER_VALUES,
  NO_DATA_MESSAGE,
} from './Legend'
import { useMediaQuery } from '@mui/material'
import {
  addCAWPTooltipInfo,
  buildTooltipTemplate,
  CIRCLE_PROJECTION,
  COLOR_SCALE,
  createCircleTextMark,
  createInvisibleAltMarks,
  createShapeMarks,
  formatPreventZero100k,
  GEO_DATASET,
  getCountyAddOn,
  getProjection,
  LEGEND_DATASET,
  makeAltText,
  MISSING_DATASET,
  type ScaleType,
  setupColorScale,
  VAR_DATASET,
  GREY_DOT_SCALE_SPEC,
  UNKNOWN_SCALE_SPEC,
  ZERO_VAR_DATASET,
  ZERO_DOT_SCALE_SPEC,
  getHelperLegend,
  ZERO_YELLOW_SCALE,
} from './mapHelpers'
import { CAWP_DETERMINANTS } from '../data/variables/CawpProvider'
import { HIV_DETERMINANTS } from '../data/variables/HivProvider'

const {
  unknownGrey: UNKNOWN_GREY,
  redOrange: RED_ORANGE,
  darkBlue: DARK_BLUE,
} = sass

const VALID_DATASET = 'VALID_DATASET'
const ZERO_DATASET = 'ZERO_DATASET'
const GEO_ID = 'id'

// TODO - consider moving standardized column names, like fips, to variables shared between here and VariableProvider
const VAR_FIPS = 'fips'

export interface ChoroplethMapProps {
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
  // legendData is the dataset for which to calculate legend. Used to have a common legend between two maps.
  legendData?: Array<Record<string, any>>
  // Whether or not the legend is present
  hideLegend?: boolean
  // If legend is present, what is the title
  legendTitle?: string | string[]
  // Max/min of the data range- if present it will set the color scale at these boundaries
  fieldRange?: FieldRange
  // Hide the action bar in the corner of a vega chart
  hideActions?: boolean
  // How the color scale is computed mathematically
  scaleType: ScaleType
  // Colors to use for the color scale. Default is yellowgreen
  scaleColorScheme?: string
  // If true, the geography will be rendered as a circle. Used to display territories at national level.
  overrideShapeWithCircle?: boolean
  // Do not show a tooltip when there is no data.
  hideMissingDataTooltip?: boolean
  // Callbacks set up so map interactions can update the React UI
  signalListeners: any
  // use the constructed string from the Card Wrapper Title in the export as PNG filename
  filename?: string
  titles?: {
    chartTitle: string | string[]
    subtitle?: string
  }
  listExpanded?: boolean
  countColsToAdd: MetricId[]
}

export function ChoroplethMap(props: ChoroplethMapProps) {
  const nonZeroData = props.data.filter((row) => row[props.metric.metricId] > 0)

  const numUniqueNonZeroValues = new Set(
    nonZeroData.map((row) => row[props.metric.metricId])
  ).size

  const isCawp = CAWP_DETERMINANTS.includes(props.metric.metricId)
  const isHiv = HIV_DETERMINANTS.includes(props.metric.metricId)
  const containsDistinctZeros = isCawp || isHiv

  // render Vega map async as it can be slow
  const [shouldRenderMap, setShouldRenderMap] = useState(false)

  const [ref, width] = useResponsiveWidth(
    /* default width during initialization */ 90
  )

  // calculate page size to determine if tiny mobile or not
  const pageIsTiny = useMediaQuery('(max-width:400px)')
  const fontSize = useFontSize()

  const yOffsetNoDataLegend = pageIsTiny ? -15 : -43
  const xOffsetNoDataLegend = pageIsTiny ? 15 : 230
  const heightWidthRatio = props.overrideShapeWithCircle ? 1.2 : 0.5

  // Initial spec state is set in useEffect
  const [spec, setSpec] = useState({})

  const LEGEND_WIDTH = props.hideLegend ? 0 : 100

  // Dataset to use for computing the legend
  const legendData = props.legendData ?? props.data

  useEffect(() => {
    const geoData = props.geoData
      ? { values: props.geoData }
      : { url: `/tmp/${GEOGRAPHIES_DATASET_ID}.json` }

    /* SET UP GEO DATASET */
    // Transform geo dataset by adding varField from VAR_DATASET
    const geoTransformers: any[] = [
      {
        type: 'lookup',
        from: VAR_DATASET,
        key: VAR_FIPS,
        fields: [GEO_ID],
        values: [props.metric.metricId, ...props.countColsToAdd],
      },
    ]
    // Null SVI was showing
    if (!containsDistinctZeros && !props.listExpanded) {
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

    // TODO: would be nice to use addMetricDisplayColumn for the tooltips here so that data formatting is consistent.
    const tooltipLabel =
      props.isUnknownsMap && props.metric.unknownsVegaLabel
        ? props.metric.unknownsVegaLabel
        : props.metric.shortLabel

    const tooltipPairs = { [tooltipLabel]: tooltipDatum }

    const geographyType = getCountyAddOn(
      /* fips */ props.fips,
      /* showCounties */ props.showCounties
    )

    // Hover tooltip for states with expected 0 values, like CAWP Congress
    const zeroTooltipValue = buildTooltipTemplate(
      /* tooltipPairs */ tooltipPairs,
      /* title */ `datum.properties.name + " ${geographyType}"`,
      /* includeSvi */ false
    )

    // Hover tooltip for unexpected missing data
    const missingDataTooltipValue = buildTooltipTemplate(
      /* tooltipPairs */ { [tooltipLabel]: `"${NO_DATA_MESSAGE}"` },
      /* title */ `datum.properties.name + " ${geographyType}"`,
      /* includeSvi */ false
    )

    if (isCawp) {
      addCAWPTooltipInfo(
        /* tooltipPairs */ tooltipPairs,
        /* subTitle */ props.titles?.subtitle ?? '',
        /* colsToAdd */ props.countColsToAdd
      )
    }

    // Hover tooltip for non-zero data
    const tooltipValue = buildTooltipTemplate(
      /* tooltipPairs */ tooltipPairs,
      /* title */ `datum.properties.name + " ${geographyType}"`,
      /* includeSvi */ props.showCounties
    )

    /* SET UP LEGEND */
    const legendList = []

    const legend: any = {
      fill: COLOR_SCALE,
      direction: 'horizontal',
      title: props.legendTitle,
      titleFontSize: pageIsTiny ? 9 : 11,
      titleLimit: 0,
      font: LEGEND_TEXT_FONT,
      labelFont: LEGEND_TEXT_FONT,
      labelOverlap: 'greedy',
      labelSeparation: 10,
      orient: 'bottom-left',
      offset: 15,
      format: 'd',
    }
    if (props.metric.type === 'pct_share') {
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
      /* yOffset */ yOffsetNoDataLegend,
      /* xOffset */ xOffsetNoDataLegend,
      /* overrideGrayMissingWithZeroYellow */ containsDistinctZeros &&
        !props.listExpanded
    )
    if (!props.hideLegend) {
      legendList.push(legend, helperLegend)
    }

    const colorScale = setupColorScale(
      /* legendData */ legendData,
      /* metricId */ props.metric.metricId,
      /* scaleType */ props.scaleType,
      /* fieldRange? */ props.fieldRange,
      /* scaleColorScheme? */ props.scaleColorScheme
    )

    const projection = getProjection(
      /* fips */ props.fips,
      /* width */ width,
      /* heightWidthRatio */ heightWidthRatio,
      /* overrideShapeWithCirce */ props.overrideShapeWithCircle
    )

    const marks = [
      containsDistinctZeros && !props.listExpanded
        ? createShapeMarks(
            /* datasetName= */ ZERO_DATASET,
            /* fillColor= */ { value: sass.mapMin },
            /* hoverColor= */ RED_ORANGE,
            /* tooltipExpression= */ zeroTooltipValue,
            /* overrideShapeWithCircle */ props.overrideShapeWithCircle,
            /* hideMissingDataTooltip */ props.hideMissingDataTooltip
          )
        : createShapeMarks(
            /* datasetName= */ MISSING_DATASET,
            /* fillColor= */ { value: UNKNOWN_GREY },
            /* hoverColor= */ RED_ORANGE,
            /* tooltipExpression= */ missingDataTooltipValue,
            /* overrideShapeWithCircle */ props.overrideShapeWithCircle,
            /* hideMissingDataTooltip */ props.hideMissingDataTooltip
          ),
      createShapeMarks(
        /* datasetName= */ VALID_DATASET,
        /* fillColor= */ [{ scale: COLOR_SCALE, field: props.metric.metricId }],
        /* hoverColor= */ DARK_BLUE,
        /* tooltipExpression= */ tooltipValue,
        /* overrideShapeWithCircle */ props.overrideShapeWithCircle,
        /* hideMissingDataTooltip */ props.hideMissingDataTooltip
      ),
    ]

    if (props.overrideShapeWithCircle) {
      // Visible Territory Abbreviations
      marks.push(createCircleTextMark(VALID_DATASET))
      containsDistinctZeros && !props.listExpanded
        ? marks.push(createCircleTextMark(ZERO_DATASET))
        : marks.push(createCircleTextMark(MISSING_DATASET))
    } else {
      marks.push(
        createInvisibleAltMarks(
          /* tooltipDatum */ tooltipDatum,
          /*  tooltipLabel */ tooltipLabel
        )
      )
    }

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
          values:
            // only use the nonZero subset if viewing high low lists, viewing CAWP,
            // or viewing multimap with some groups having only one non-zero value
            props.listExpanded ??
            !containsDistinctZeros ??
            (numUniqueNonZeroValues <= 1 && !props.hideLegend)
              ? props.data
              : nonZeroData,
        },
        {
          name: ZERO_VAR_DATASET,
          values: props.data.filter((row) => row[props.metric.metricId] === 0),
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
              expr: `isValid(datum.${props.metric.metricId})`,
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
              expr: `!isValid(datum.${props.metric.metricId})`,
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
      title: !props.overrideShapeWithCircle && {
        text: props.titles?.chartTitle,
        subtitle: props.titles?.subtitle,
        encode: {
          title: {
            enter: {
              fontSize: {
                value: fontSize,
              },
              font: { value: 'Inter, sans-serif' },
            },
          },
          subtitle: {
            enter: {
              fontStyle: { value: 'italic' },
              fontSize: {
                value: fontSize - 2,
              },
            },
          },
        },
      },
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
    isHiv,
    width,
    props.metric,
    props.legendTitle,
    props.data,
    props.fips,
    props.hideLegend,
    props.showCounties,
    props.fieldRange,
    props.scaleType,
    props.scaleColorScheme,
    props.hideMissingDataTooltip,
    props.overrideShapeWithCircle,
    props.geoData,
    LEGEND_WIDTH,
    legendData,
    props.isUnknownsMap,
    yOffsetNoDataLegend,
    xOffsetNoDataLegend,
    props,
    heightWidthRatio,
    pageIsTiny,
    fontSize,
  ])

  return (
    <div ref={props.overrideShapeWithCircle ? undefined : ref}>
      {shouldRenderMap && (
        <Vega
          renderer="svg"
          spec={spec}
          width={props.overrideShapeWithCircle ? undefined : width}
          // custom 3-dot options for states, hidden
          actions={
            !props.hideActions && {
              export: { png: true, svg: true },
              source: false,
              compiled: false,
              editor: false,
            }
          }
          downloadFileName={`${props.filename ?? ''} - Health Equity Tracker`}
          signalListeners={props.signalListeners}
        />
      )}
    </div>
  )
}
