import { useEffect, useState } from 'react'
import { Vega } from 'react-vega'
import type {
  DataTypeConfig,
  MapConfig,
  MetricConfig,
} from '../data/config/MetricConfigTypes'
import { isPctType } from '../data/config/MetricConfigUtils'
import { CAWP_METRICS } from '../data/providers/CawpProvider'
import type { GeographicBreakdown } from '../data/query/Breakdowns'
import type { FieldRange } from '../data/utils/DatasetTypes'
import { het } from '../styles/DesignTokens'
import ClickableLegendHeader from './ClickableLegendHeader'
import {
  type LegendNumberFormat,
  setupLegendScaleSpec,
  setupNonZeroContinuousPctLegend,
  setupNonZeroDiscreteLegend,
  setupPhrmaAdherenceLegendScaleSpec,
  setupStandardColorScaleSpec,
  setupZeroLegend,
} from './legendHelperFunctions'
import {
  DATASET_VALUES,
  DEFAULT_LEGEND_COLOR_COUNT,
  EQUAL_DOT_SIZE,
  GREY_DOT_SCALE,
  MISSING_PLACEHOLDER_VALUES,
  NON_ZERO_DATASET_VALUES,
  NO_DATA_MESSAGE,
  ORDINAL,
  PHRMA_COLOR_SCALE_SPEC,
  RAW_VALUES,
  SUMMARY_SCALE,
  SUMMARY_VALUE,
  type ScaleType,
  type StackingDirection,
  UNKNOWN_LEGEND_SPEC,
  UNKNOWN_SCALE,
  ZERO_BUCKET_LABEL,
  ZERO_DOT_SCALE,
  ZERO_SCALE,
  ZERO_VALUES,
} from './mapGlobals'

/*
   Legend renders a vega chart that just contains a legend.
*/
interface LegendProps {
  dataTypeConfig: DataTypeConfig
  // Data for which to create a legend.
  data?: Array<Record<string, any>> // Dataset for which to calculate legend.
  // Metric in the data for which to create a legend.
  metricConfig: MetricConfig
  legendTitle: string
  // May be used if standardizing legends across charts
  fieldRange?: FieldRange
  // Quantile or threshold scale.
  scaleType: ScaleType
  // Whether the dots all be the same size or increase in size.
  // Size does not correlate to the range size.
  sameDotSize?: boolean
  // Alt text
  description: string
  isSummaryLegend?: boolean
  fipsTypeDisplayName?: GeographicBreakdown
  mapConfig: MapConfig
  columns: number
  stackingDirection: StackingDirection
  isMulti?: boolean
  isPhrmaAdherence?: boolean
}

export function Legend(props: LegendProps) {
  const isCawp = CAWP_METRICS.includes(props.metricConfig.metricId)
  const zeroData = props.data?.filter(
    (row) => row[props.metricConfig.metricId] === 0,
  )
  const nonZeroData = props.data?.filter(
    (row) => row[props.metricConfig.metricId] > 0,
  )
  const uniqueNonZeroValueCount = new Set(
    nonZeroData?.map((row) => row[props.metricConfig.metricId]),
  ).size
  const missingData = props.data?.filter(
    (row) => row[props.metricConfig.metricId] == null,
  )
  const hasMissingData = Boolean(missingData && missingData.length > 0)
  const hasZeroData = Boolean(zeroData && zeroData.length > 0)

  // Initial spec state is set in useEffect
  // TODO: Why??
  const [spec, setSpec] = useState<any | null>(null)

  const legendColorCount = props.isPhrmaAdherence
    ? 7
    : Math.min(DEFAULT_LEGEND_COLOR_COUNT, uniqueNonZeroValueCount)

  const dotRange = Array(legendColorCount).fill(EQUAL_DOT_SIZE)

  useEffect(() => {
    // TODO: this should use the util in mapHelpers; been having issues with app breaking on this stuff, perhaps because Legend.tsx and mapHelpers.ts were each reading from one another? We should really have all utils centralized and then exported out to the consuming components

    // prevent bugs when a single data point prevents Vega from calculating range for buckets
    if (uniqueNonZeroValueCount === 1) dotRange.unshift(0)

    const isPct = isPctType(props.metricConfig.type)
    const overallPhrase = props.isSummaryLegend
      ? ` (${props.fipsTypeDisplayName ?? 'area'} overall)`
      : ''
    const legendBucketLabel = `datum.label + '${
      isPct ? '%' : ''
    }' + '${overallPhrase}'`

    const legendFormatterType: LegendNumberFormat = isPct
      ? 'pct'
      : 'truncateWithK'
    const legendList: any[] = []

    // MAKE NON-ZERO LEGEND ITEMS ALWAYS FOR PHRMA ADHERENCE, OR IF NEEDED FOR OTHER REPORTS
    if (props.isPhrmaAdherence) {
      const nonZeroContinuousPctLegend = setupNonZeroContinuousPctLegend(
        legendBucketLabel,
        hasMissingData,
        props.stackingDirection,
      )
      legendList.push(nonZeroContinuousPctLegend)
    } else if (uniqueNonZeroValueCount > 0) {
      const nonZeroLegend = setupNonZeroDiscreteLegend(
        legendBucketLabel,
        legendFormatterType,
        props.stackingDirection,
        props.columns,
      )
      legendList.push(nonZeroLegend)
    }

    // INCLUDE ZERO LEGEND ITEM IF NEEDED
    if (hasZeroData) {
      const zeroLegend = setupZeroLegend(
        legendBucketLabel,
        props.isSummaryLegend,
      )
      legendList.push(zeroLegend)
    }
    // MAKE AND ADD UNKNOWN LEGEND ITEM IF NEEDED
    if (hasMissingData) legendList.push(UNKNOWN_LEGEND_SPEC)

    const mapScheme =
      typeof props.mapConfig.scheme === 'string'
        ? props.mapConfig.scheme
        : 'darkgreen'

    const legendColorScaleSpec = props.isPhrmaAdherence
      ? PHRMA_COLOR_SCALE_SPEC
      : setupStandardColorScaleSpec(
          props.scaleType,
          props.metricConfig.metricId,
          mapScheme,
          legendColorCount,
          props.isSummaryLegend,
          /* reverse?: boolean */ !props.mapConfig.higherIsBetter,
        )

    const dotSizeScale = props.isPhrmaAdherence
      ? setupPhrmaAdherenceLegendScaleSpec(dotRange)
      : setupLegendScaleSpec(
          dotRange,
          props.metricConfig.metricId,
          props.scaleType,
          props.isSummaryLegend,
        )

    setSpec({
      $schema: 'https://vega.github.io/schema/vega/v5.json',
      description: props.description,
      background: het.white,
      padding: 10,
      data: [
        {
          name: RAW_VALUES,
          values: props.data,
        },
        {
          name: ZERO_VALUES,
          values: [
            {
              zero: ZERO_BUCKET_LABEL,
            },
          ],
        },
        {
          name: DATASET_VALUES,
          source: RAW_VALUES,
          transform: [
            {
              type: 'filter',
              expr: `isValid(datum["${props.metricConfig.metricId}"]) && isFinite(+datum["${props.metricConfig.metricId}"])`,
            },
          ],
        },
        {
          name: NON_ZERO_DATASET_VALUES,
          source: RAW_VALUES,
          transform: [
            {
              type: 'filter',
              expr: `isValid(datum["${props.metricConfig.metricId}"]) && isFinite(+datum["${props.metricConfig.metricId}"]) && datum["${props.metricConfig.metricId}"] !== 0`,
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
              summary: `${props.data?.[0][props.metricConfig.metricId] as string}`,
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
        dotSizeScale as any,
        legendColorScaleSpec as any,
        {
          name: ZERO_SCALE,
          type: ORDINAL,

          domain: { data: ZERO_VALUES, field: 'zero' },
          range: [props.mapConfig.zero],
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
          name: UNKNOWN_SCALE,
          type: ORDINAL,

          domain: { data: MISSING_PLACEHOLDER_VALUES, field: 'missing' },
          range: [het.howToColor],
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
    props.mapConfig.zero,
    props.mapConfig.scheme,
    props.metricConfig,
    props.sameDotSize,
    props.scaleType,
    props.stackingDirection,
  ])

  return (
    <section className='mx-4 flex flex-col items-center text-left'>
      {props.isMulti ? (
        <span className='inline-flex items-center break-words text-start text-black text-smallest leading-lhSomeMoreSpace'>
          {props.legendTitle}
        </span>
      ) : (
        <ClickableLegendHeader
          legendTitle={props.legendTitle}
          dataTypeConfig={props.dataTypeConfig}
        />
      )}

      {spec && (
        <div className=''>
          <Vega renderer='svg' spec={spec} actions={false} />
        </div>
      )}
    </section>
  )
}
