import { useState, useEffect } from 'react'
import { Vega } from 'react-vega'
import { type MetricConfig } from '../data/config/MetricConfig'
import { type FieldRange } from '../data/utils/DatasetTypes'
import sass from '../styles/variables.module.scss'
import { ORDINAL } from './utils'
import { type ScaleType } from './mapHelpers'
import { CAWP_DETERMINANTS } from '../data/variables/CawpProvider'
import styles from './Legend.module.scss'
import { type Legend as LegendType } from 'vega'
import { Grid } from '@mui/material'
import { type GeographicBreakdown } from '../data/query/Breakdowns'

const COLOR_SCALE = 'color_scale'
const ZERO_SCALE = 'zero_scale'
const DOT_SIZE_SCALE = 'dot_size_scale'
const SUMMARY_SCALE = 'summary_scale'
export const GREY_DOT_SCALE = 'grey_dot_scale'
export const UNKNOWN_SCALE = 'unknown_scale'
export const ZERO_DOT_SCALE = 'zero_dot_scale'

const RAW_VALUES = 'raw_values'
const DATASET_VALUES = 'dataset_values'
const SUMMARY_VALUE = 'summary_value'
const ZERO_VALUES = 'zero_values'
export const MISSING_PLACEHOLDER_VALUES = 'missing_data'

export const LEGEND_SYMBOL_TYPE = 'square'
export const LEGEND_TEXT_FONT = 'inter'
export const NO_DATA_MESSAGE = 'no data'
export const EQUAL_DOT_SIZE = 200
export const LEGEND_COLOR_COUNT = 6

/*
   Legend renders a vega chart that just contains a legend.
*/
export interface LegendProps {
  // Data for which to create a legend.
  legendData?: Array<Record<string, any>> // Dataset for which to calculate legend.
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
  // Whether legend entries stack vertical or horizontal (allows responsive design)
  direction: 'horizontal' | 'vertical'
  hasSelfButNotChildGeoData?: boolean
  fipsTypeDisplayName?: GeographicBreakdown
}

export function Legend(props: LegendProps) {
  const { direction } = props
  const orient = direction === 'vertical' ? 'left' : 'right'

  const containsDistinctZeros = CAWP_DETERMINANTS.includes(
    props.metric.metricId
  )

  const nonZeroData = props.legendData?.filter(
    (row) => row[props.metric.metricId] > 0
  )
  const uniqueNonZeroValueCount = new Set(
    nonZeroData?.map((row) => row[props.metric.metricId])
  ).size

  console.log({ uniqueNonZeroValueCount })

  // Initial spec state is set in useEffect
  // TODO: Why??
  const [spec, setSpec] = useState({})

  useEffect(() => {
    const legendColorCount =
      uniqueNonZeroValueCount < 5 ? uniqueNonZeroValueCount : 5

    const dotRange = props.sameDotSize
      ? Array(legendColorCount).fill(EQUAL_DOT_SIZE)
      : [70, 120, 170, 220, 270, 320, 370]

    const legendList: LegendType[] = []

    legendList.push({
      fill: props.hasSelfButNotChildGeoData ? COLOR_SCALE : ZERO_SCALE,
      symbolType: LEGEND_SYMBOL_TYPE,
      size: props.hasSelfButNotChildGeoData ? SUMMARY_SCALE : ZERO_DOT_SCALE,
      labelFontStyle: LEGEND_TEXT_FONT,
      labelFont: LEGEND_TEXT_FONT,
      orient,
    })

    if (props.hasSelfButNotChildGeoData) {
      legendList[0].encode = {
        labels: {
          update: {
            text: {
              signal: `datum.label + '${
                props.metric.type === 'pct_share'
                  ? `% (${props.fipsTypeDisplayName ?? ''} overall)`
                  : ` (${props.fipsTypeDisplayName ?? ''} overall)`
              }'`,
            },
          },
        },
      }
    } else {
      legendList.push(
        {
          fill: COLOR_SCALE,
          labelOverlap: 'greedy',
          symbolType: LEGEND_SYMBOL_TYPE,
          size: DOT_SIZE_SCALE,
          format: 'd',
          labelFontStyle: LEGEND_TEXT_FONT,
          labelFont: LEGEND_TEXT_FONT,
          direction: props.direction,
          orient: 'left',
          columns: props.direction === 'horizontal' ? 3 : 1,
        },
        {
          fill: UNKNOWN_SCALE,
          symbolType: LEGEND_SYMBOL_TYPE,
          size: GREY_DOT_SCALE,
          labelFontStyle: LEGEND_TEXT_FONT,
          labelFont: LEGEND_TEXT_FONT,
          orient,
        }
      )
      legendList[0].encode = {
        labels: {
          update: {
            text: {
              signal: `datum.label + '${
                props.metric.type === 'pct_share' ? '%' : ''
              }'`,
            },
          },
        },
      }
    }

    setSpec({
      $schema: 'https://vega.github.io/schema/vega/v5.json',
      description: props.description,
      background: sass.white,
      padding: 8,
      data: [
        {
          name: RAW_VALUES,
          values: props.legendData,
        },
        {
          name: ZERO_VALUES,
          values: [{ zero: 'zero' }],
        },
        {
          name: DATASET_VALUES,
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
              summary: `${
                props.legendData?.[0][props.metric.metricId] as string
              }`,
            },
          ],
        },
      ],
      layout: { padding: 20, bounds: 'full', align: 'each' },
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
          domain: { data: DATASET_VALUES, field: props.metric.metricId },
          range: {
            scheme: 'yellowgreen',
            count: props.hasSelfButNotChildGeoData ? 1 : legendColorCount,
          },
        },
        {
          name: ZERO_SCALE,
          type: ORDINAL,
          domain: { data: ZERO_VALUES, field: 'zero' },
          range: [sass.mapMin],
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
          domain: { data: DATASET_VALUES, field: props.metric.metricId },
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
    props.metric,
    props.legendTitle,
    props.scaleType,
    props.fieldRange,
    props.legendData,
    props.sameDotSize,
    props,
    containsDistinctZeros,
  ])

  return (
    <Grid component={'section'} className={styles.Legend}>
      <h4 className={styles.LegendTitle}>{props.legendTitle}</h4>
      <Grid>
        <Vega renderer="svg" spec={spec} actions={false} />
      </Grid>
    </Grid>
  )
}
