import { useState, useEffect, useRef } from 'react'
import { Vega } from 'react-vega'
import {
  isPctType,
  type MetricConfig,
  type MetricId,
} from '../data/config/MetricConfig'
import { type FieldRange } from '../data/utils/DatasetTypes'
import sass from '../styles/variables.module.scss'
import { ORDINAL } from './utils'
import { type ScaleType } from './mapHelpers'
import styles from './Legend.module.scss'
import { View, type Legend as LegendType } from 'vega'
import { Grid } from '@mui/material'
import { type GeographicBreakdown } from '../data/query/Breakdowns'
import { CAWP_DETERMINANTS } from '../data/variables/CawpProvider'
import { LESS_THAN_1 } from '../data/utils/Constants'
import { BLACK_WOMEN_METRICS } from '../data/variables/HivProvider'

const COLOR_SCALE = 'color_scale'
const ZERO_SCALE = 'zero_scale'
const DOT_SIZE_SCALE = 'dot_size_scale'
const SUMMARY_SCALE = 'summary_scale'
export const GREY_DOT_SCALE = 'grey_dot_scale'
export const UNKNOWN_SCALE = 'unknown_scale'
export const ZERO_DOT_SCALE = 'zero_dot_scale'

const RAW_VALUES = 'raw_values'
const DATASET_VALUES = 'dataset_values'
const NON_ZERO_DATASET_VALUES = 'non_zero_dataset_values'
const SUMMARY_VALUE = 'summary_value'
const ZERO_VALUES = 'zero_values'
export const MISSING_PLACEHOLDER_VALUES = 'missing_data'

export const LEGEND_SYMBOL_TYPE = 'square'
export const LEGEND_TEXT_FONT = 'inter'
export const NO_DATA_MESSAGE = 'no data'
export const EQUAL_DOT_SIZE = 200
export const DEFAULT_LEGEND_COLOR_COUNT = 6

const ZERO_BUCKET_LABEL = '0'

/*
   Legend renders a vega chart that just contains a legend.
*/
export interface LegendProps {
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
  orient?: 'bottom-right'
  handleScaleChange?: (domain: number[], range: number[]) => void
}

export function getMapScheme(metricId: MetricId) {
  const mapScheme = BLACK_WOMEN_METRICS.includes(metricId)
    ? 'plasma'
    : 'darkgreen'
  const mapMin = BLACK_WOMEN_METRICS.includes(metricId)
    ? sass.mapBwMin
    : sass.mapMin

  return [mapScheme, mapMin]
}

export function Legend(props: LegendProps) {
  const isCawp = CAWP_DETERMINANTS.includes(props.metric.metricId)
  const defaultOrient =
    props.stackingDirection === 'vertical' ? 'left' : 'right'
  const orient = props.orient ?? defaultOrient
  const zeroData = props.data?.filter((row) => row[props.metric.metricId] === 0)
  const nonZeroData = props.data?.filter(
    (row) => row[props.metric.metricId] > 0
  )
  const uniqueNonZeroValueCount = new Set(
    nonZeroData?.map((row) => row[props.metric.metricId])
  ).size
  const missingData = props.data?.filter(
    (row) => row[props.metric.metricId] == null
  )


  // Initial spec state is set in useEffect
  // TODO: Why??
  const [spec, setSpec] = useState({})

  const vegaViewRef = useRef<View | null>(null);

  function handleNewView(view: View) {
    vegaViewRef.current = view

    if (props.handleScaleChange) {
      const scale = view.scale(COLOR_SCALE)
      const domain = scale.domain()
      const range = scale.range()
      props.handleScaleChange(domain, range);
    }
  }

  useEffect(() => {
    // TODO: this should use the util in mapHelpers; been having issues with app breaking on this stuff, perhaps because Legend.tsx and mapHelpers.ts were each reading from one another? We should really have all utils centralized and then exported out to the consuming components
    const legendColorCount = Math.min(
      DEFAULT_LEGEND_COLOR_COUNT,
      uniqueNonZeroValueCount
    )

    const colorScale: any = {
      name: COLOR_SCALE,
      type: props.scaleType,
      domain: { data: DATASET_VALUES, field: props.metric.metricId },
      range: { scheme: props.mapConfig.mapScheme, count: legendColorCount },
    }

    if (props.fieldRange) {
      colorScale.domainMax = props.fieldRange.max
      colorScale.domainMin = props.fieldRange.min
    }

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

    // INCLUDE ZERO LEGEND ITEM IF NEEDED
    if (zeroData && zeroData.length > 0) {
      // MAKE LEGEND
      const zeroLegend: LegendType = {
        fill: props.isSummaryLegend ? COLOR_SCALE : ZERO_SCALE,
        symbolType: LEGEND_SYMBOL_TYPE,
        size: props.isSummaryLegend ? SUMMARY_SCALE : ZERO_DOT_SCALE,
        labelFontStyle: LEGEND_TEXT_FONT,
        labelFont: LEGEND_TEXT_FONT,
        orient,
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

    // MAKE NON-ZERO LEGEND ITEMS IF NEEDED
    if (uniqueNonZeroValueCount > 0) {
      const nonZeroLegend: LegendType = {
        fill: COLOR_SCALE,
        symbolType: LEGEND_SYMBOL_TYPE,
        size: DOT_SIZE_SCALE,
        format: isPct ? 'd' : ',.2r', // simplify large 100k legend breakpoints: e.g. 81,234 -> 81,0000
        labelFontStyle: LEGEND_TEXT_FONT,
        labelFont: LEGEND_TEXT_FONT,
        direction: props.stackingDirection,
        orient: 'left',
        columns: props.columns,
        columnPadding: 20,
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
      legendList.push(nonZeroLegend)
    }

    // MAKE AND ADD UNKNOWN LEGEND ITEM IF NEEDED
    if (missingData && missingData.length > 0) {
      legendList.push({
        fill: UNKNOWN_SCALE,
        symbolType: LEGEND_SYMBOL_TYPE,
        size: GREY_DOT_SCALE,
        labelFontStyle: LEGEND_TEXT_FONT,
        labelFont: LEGEND_TEXT_FONT,
        orient,
      })
    }

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
          values: [{ zero: isCawp ? ZERO_BUCKET_LABEL : LESS_THAN_1 }],
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
        {
          name: COLOR_SCALE,
          type: props.scaleType,
          domain: {
            data: props.isSummaryLegend
              ? DATASET_VALUES
              : NON_ZERO_DATASET_VALUES,
            field: props.metric.metricId,
          },
          range: {
            scheme: props.mapConfig.mapScheme,
            count: props.isSummaryLegend ? 1 : legendColorCount,
          },
        },
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
          type: props.scaleType,
          domain: {
            data: props.isSummaryLegend
              ? DATASET_VALUES
              : NON_ZERO_DATASET_VALUES,
            field: props.metric.metricId,
          },
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
    props.orient,
    props.sameDotSize,
    props.scaleType,
    props.stackingDirection,
  ])

  return (
    <Grid component={'section'} className={styles.Legend}>
      <h4 className={styles.LegendTitle}>{props.legendTitle}</h4>
      <Grid>
        <Vega renderer="svg" spec={spec} actions={false}
          onNewView={(view) => handleNewView(view)} />
      </Grid>
    </Grid>
  )
}
