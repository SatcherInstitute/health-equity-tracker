import { useState, useEffect, useRef } from 'react'
import { Vega, type VisualizationSpec } from 'react-vega'
import {
  type DataTypeConfig,
  isPctType,
  type MetricConfig,
} from '../data/config/MetricConfig'
import { type FieldRange } from '../data/utils/DatasetTypes'
import sass from '../styles/variables.module.scss'
import styles from './Legend.module.scss'
import { type View, type Legend as LegendType } from 'vega'
import { type GeographicBreakdown } from '../data/query/Breakdowns'
import { CAWP_DETERMINANTS } from '../data/providers/CawpProvider'
import { LESS_THAN_1 } from '../data/utils/Constants'
import { PHRMA_METRICS } from '../data/providers/PhrmaProvider'
import {
  COLOR_SCALE,
  DATASET_VALUES,
  DEFAULT_LEGEND_COLOR_COUNT,
  DOT_SIZE_SCALE,
  EQUAL_DOT_SIZE,
  GREY_DOT_SCALE,
  LEGEND_SYMBOL_TYPE,
  MISSING_PLACEHOLDER_VALUES,
  NON_ZERO_DATASET_VALUES,
  NO_DATA_MESSAGE,
  RAW_VALUES,
  SUMMARY_SCALE,
  SUMMARY_VALUE,
  type ScaleType,
  UNKNOWN_SCALE,
  ZERO_BUCKET_LABEL,
  ZERO_DOT_SCALE,
  ZERO_SCALE,
  ZERO_VALUES,
  ORDINAL,
  PHRMA_COLOR_SCALE_SPEC,
} from './mapGlobals'
import ClickableLegendHeader from './ClickableLegendHeader'

/*
   Legend renders a vega chart that just contains a legend.
*/
interface LegendProps {
  dataTypeConfig: DataTypeConfig
  // Data for which to create a legend.
  data?: Array<Record<string, any>> // Dataset for which to calculate legend.
  // Metric in the data for which to create a legend.
  metric: MetricConfig
  legendTitle: string
  // May be used if standardizing legends across charts
  fieldRange?: FieldRange
  // Quantile or quantize scale.
  scaleType: ScaleType
  // Whether the dots all be the same size or increase in size.
  // Size does not correlate to the range size.
  sameDotSize?: boolean
  // Alt text
  description: string
  isSummaryLegend?: boolean
  fipsTypeDisplayName?: GeographicBreakdown
  mapConfig: { mapScheme: string; mapMin: string }
  columns: number
  stackingDirection: 'horizontal' | 'vertical'
  handleScaleChange?: (domain: number[], range: number[]) => void
  isMulti?: boolean
}

export function Legend(props: LegendProps) {
  const isCawp = CAWP_DETERMINANTS.includes(props.metric.metricId)
  const isPhrma = PHRMA_METRICS.includes(props.metric.metricId)
  const zeroData = props.data?.filter((row) => row[props.metric.metricId] === 0)
  const nonZeroData = props.data?.filter(
    (row) => row[props.metric.metricId] > 1
  )
  const uniqueNonZeroValueCount = new Set(
    nonZeroData?.map((row) => row[props.metric.metricId])
  ).size
  const missingData = props.data?.filter(
    (row) => row[props.metric.metricId] == null
  )

  // Initial spec state is set in useEffect
  // TODO: Why??
  const [spec, setSpec] = useState<VisualizationSpec | null>(null)

  const vegaViewRef = useRef<View | null>(null)

  function handleNewView(view: View) {
    vegaViewRef.current = view

    if (props.handleScaleChange) {
      // TODO: causes warning Unrecognized scale or projection: color_scale
      const scale = view.scale(COLOR_SCALE)
      const domain = scale.domain()
      const range = scale.range()
      props.handleScaleChange(domain, range)
    }
  }

  const legendColorCount = isPhrma
    ? 7
    : Math.min(DEFAULT_LEGEND_COLOR_COUNT, uniqueNonZeroValueCount)

  useEffect(() => {
    // TODO: this should use the util in mapHelpers; been having issues with app breaking on this stuff, perhaps because Legend.tsx and mapHelpers.ts were each reading from one another? We should really have all utils centralized and then exported out to the consuming components

    const dotRange = props.sameDotSize
      ? Array(legendColorCount).fill(EQUAL_DOT_SIZE)
      : [70, 120, 170, 220, 270, 320, 370]

    // prevent bugs when a single data point prevents Vega from calculating range for buckets
    if (uniqueNonZeroValueCount === 1) dotRange.unshift(0)

    const isPct = isPctType(props.metric.type)
    const overallPhrase = props.isSummaryLegend
      ? ` (${props.fipsTypeDisplayName ?? 'area'} overall)`
      : ''
    const legendBucketLabel = `datum.label + '${
      isPct ? '%' : ''
    }' + '${overallPhrase}'`
    const legendList: LegendType[] = []

    // MAKE AND ADD UNKNOWN LEGEND ITEM IF NEEDED
    if (missingData && missingData.length > 0) {
      legendList.push({
        fill: UNKNOWN_SCALE,
        symbolType: LEGEND_SYMBOL_TYPE,
        size: GREY_DOT_SCALE,
        orient: 'left',
      })
    }

    // MAKE NON-ZERO LEGEND ITEMS IF NEEDED
    if (uniqueNonZeroValueCount > 0) {
      const nonZeroLegend: LegendType = {
        fill: COLOR_SCALE,
        // symbolType: LEGEND_SYMBOL_TYPE,
        // size: DOT_SIZE_SCALE,
        format: isPct ? 'd' : ',.2r', // simplify large 100k legend breakpoints: e.g. 81,234 -> 81,0000
        direction: props.stackingDirection,
        orient: 'left',
        // gradientThickness: 30,
        // columns: props.columns,
        // columnPadding: 20,
        encode: {
          labels: {
            update: {
              text: {
                signal: `if (datum.label != null, ${legendBucketLabel}, '')`,
              },
            },
          },
        },
      }
      legendList.push(nonZeroLegend)
    }

    // INCLUDE ZERO LEGEND ITEM IF NEEDED
    if (zeroData && zeroData.length > 0) {
      // MAKE LEGEND
      const zeroLegend: LegendType = {
        fill: props.isSummaryLegend ? COLOR_SCALE : ZERO_SCALE,
        symbolType: LEGEND_SYMBOL_TYPE,
        size: props.isSummaryLegend ? SUMMARY_SCALE : ZERO_DOT_SCALE,
        orient: 'left',
        encode: {
          labels: {
            update: {
              text: {
                signal: legendBucketLabel,
              },
            },
          },
        },
      }
      legendList.push(zeroLegend)
    }

    const standardColorScaleSpec = {
      name: COLOR_SCALE,
      type: props.scaleType,
      domain: {
        data: props.isSummaryLegend ? DATASET_VALUES : NON_ZERO_DATASET_VALUES,
        field: props.metric.metricId,
      },
      range: {
        scheme: props.mapConfig.mapScheme,
        count: props.isSummaryLegend ? 1 : legendColorCount,
      },
    }

    const colorScaleSpec = isPhrma
      ? PHRMA_COLOR_SCALE_SPEC
      : standardColorScaleSpec

    setSpec({
      $schema: 'https://vega.github.io/schema/vega/v5.json',
      description: props.description,
      background: sass.white,
      padding: 10,
      data: [
        {
          name: RAW_VALUES,
          values: props.data,
        },
        {
          name: ZERO_VALUES,
          values: [
            { zero: isCawp || isPhrma ? ZERO_BUCKET_LABEL : LESS_THAN_1 },
          ],
        },
        {
          name: DATASET_VALUES,
          source: RAW_VALUES,
          transform: [
            {
              type: 'filter',
              expr: `isValid(datum["${props.metric.metricId}"]) && isFinite(+datum["${props.metric.metricId}"])`,
            },
          ],
        },
        {
          name: NON_ZERO_DATASET_VALUES,
          source: RAW_VALUES,
          transform: [
            {
              type: 'filter',
              expr: `isValid(datum["${props.metric.metricId}"]) && isFinite(+datum["${props.metric.metricId}"]) && datum["${props.metric.metricId}"] !== 0`,
            },
          ],
        },
        {
          name: MISSING_PLACEHOLDER_VALUES,
          values: [{ missing: NO_DATA_MESSAGE }],
        },
        {
          name: SUMMARY_VALUE,
          values: [
            {
              summary: `${props.data?.[0][props.metric.metricId] as string}`,
            },
          ],
        },
      ],
      layout: {
        padding: 20,
        bounds: 'full',
        align: 'each',
      },
      marks: [
        {
          type: 'group',
          name: 'mark_group',
          legends: legendList,
        },
      ],
      scales: [
        colorScaleSpec,
        {
          name: ZERO_SCALE,
          type: ORDINAL,
          domain: { data: ZERO_VALUES, field: 'zero' },
          range: [props.mapConfig.mapMin],
        },
        {
          name: ZERO_DOT_SCALE,
          type: ORDINAL,
          domain: { data: ZERO_VALUES, field: 'zero' },
          range: [EQUAL_DOT_SIZE],
        },
        {
          name: SUMMARY_SCALE,
          type: ORDINAL,
          domain: { data: SUMMARY_VALUE, field: 'summary' },
          range: [EQUAL_DOT_SIZE],
        },
        {
          name: DOT_SIZE_SCALE,
          type: 'threshold',
          domain: [60, 70, 75, 80, 85, 90],
          range: dotRange,
        },
        {
          name: UNKNOWN_SCALE,
          type: ORDINAL,
          domain: { data: MISSING_PLACEHOLDER_VALUES, field: 'missing' },
          range: [sass.unknownGrey],
        },
        {
          name: GREY_DOT_SCALE,
          type: ORDINAL,
          domain: { data: MISSING_PLACEHOLDER_VALUES, field: 'missing' },
          range: [EQUAL_DOT_SIZE],
        },
      ],
    })
  }, [
    props.columns,
    props.data,
    props.fieldRange,
    props.fipsTypeDisplayName,
    props.isSummaryLegend,
    props.legendTitle,
    props.mapConfig.mapMin,
    props.mapConfig.mapScheme,
    props.metric,
    props.sameDotSize,
    props.scaleType,
    props.stackingDirection,
  ])

  return (
    <section className={styles.Legend}>
      {props.isMulti ? (
        <span className={styles.LegendHeader}>{props.legendTitle}</span>
      ) : (
        <ClickableLegendHeader
          legendTitle={props.legendTitle}
          dataTypeConfig={props.dataTypeConfig}
        />
      )}

      {spec && (
        <div>
          <Vega
            renderer="svg"
            spec={spec}
            actions={false}
            onNewView={(view) => {
              handleNewView(view)
            }}
          />
        </div>
      )}
    </section>
  )
}
