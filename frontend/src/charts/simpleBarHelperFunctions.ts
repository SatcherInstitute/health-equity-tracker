import type { MetricConfig, MetricId } from '../data/config/MetricConfigTypes'
import type {
  DemographicType,
  DemographicTypeDisplayName,
} from '../data/query/Breakdowns'
import type { MetricQueryResponse } from '../data/query/MetricQuery'
import type { HetRow } from '../data/utils/DatasetTypes'
import type { Fips } from '../data/utils/Fips'
import { het, ThemeZIndexValues } from '../styles/DesignTokens'
import { createBarLabel } from './mapHelperFunctions'
import {
  PADDING_FOR_ACTIONS_MENU,
  oneLineLabel,
  CORNER_RADIUS,
  MULTILINE_LABEL,
  AXIS_LABEL_Y_DELTA,
  LABEL_HEIGHT,
} from './utils'

const MEASURE_GROUP_COLOR = het.altGreen
const MEASURE_ALL_COLOR = het.timeYellow
const BAR_HEIGHT = 60
const BAR_PADDING = 0.2
export const specialAllGroup = 'All'
export const DATASET = 'DATASET'

export function getSpec(
  altText: string,
  data: HetRow[],
  width: number,
  demographicType: DemographicType,
  demographicTypeDisplayName: DemographicTypeDisplayName,
  measure: MetricId,
  measureDisplayName: string,
  tooltipMetricDisplayColumnName: string,
  showLegend: boolean,
  barLabelBreakpoint: number,
  usePercentSuffix: boolean,
  fips: Fips,
  useIntersectionalComparisonAlls?: boolean,
  comparisonAllSubGroup?: string,
): any {
  function getMultilineAllOverride(fips: Fips): string {
    // only swap the intersectional ALL for the ALL AVERAGE label if it's an intersectional topic
    if (useIntersectionalComparisonAlls) {
      return `['${fips.getUppercaseFipsTypeDisplayName()} Average', 'All People', '${comparisonAllSubGroup || ''}']`
    }
    return MULTILINE_LABEL
  }
  const chartIsSmall = width < 400

  const createAxisTitle = () => {
    if (chartIsSmall) {
      return measureDisplayName.split(' ')
    } else return measureDisplayName
  }

  // create bar label as array or string
  const barLabel = createBarLabel(
    chartIsSmall,
    measure,
    tooltipMetricDisplayColumnName,
    usePercentSuffix,
  )

  const legends = showLegend
    ? [
        {
          fill: 'variables',
          orient: 'top',
          padding: 4,
        },
      ]
    : []

  const onlyZeros = data.every((row: HetRow) => {
    return !row[measure as keyof HetRow]
  })

  return {
    $schema: 'https://vega.github.io/schema/vega/v5.json',
    description: altText,
    background: het.white,
    autosize: { resize: true, type: 'fit-x' },
    width: width - PADDING_FOR_ACTIONS_MENU,
    style: 'cell',
    data: [
      {
        name: DATASET,
        values: data,
      },
    ],
    signals: [
      {
        name: 'y_step',
        value: BAR_HEIGHT,
      },
      {
        name: 'height',
        update: "bandspace(domain('y').length, 0.1, 0.05) * y_step + 10",
      },
    ],
    marks: [
      {
        // chart bars
        name: 'measure_bars',
        type: 'rect',
        style: ['bar'],
        description: data.length + ' items',
        from: { data: DATASET },
        encode: {
          enter: {
            tooltip: {
              signal: `${oneLineLabel(
                demographicType,
              )} + ', ${measureDisplayName}: ' + datum.${tooltipMetricDisplayColumnName}`,
            },
          },
          update: {
            cornerRadiusTopRight: {
              value: CORNER_RADIUS,
            },
            cornerRadiusBottomRight: {
              value: CORNER_RADIUS,
            },
            fill: {
              signal: `datum.${demographicType} === '${specialAllGroup}' ? '${MEASURE_ALL_COLOR}' : '${MEASURE_GROUP_COLOR}'`,
            },
            x: { scale: 'x', field: measure },
            x2: { scale: 'x', value: 0 },
            y: {
              scale: 'y',
              field: demographicType,
              // band: 1,
              offset: {
                signal: `datum.${demographicType} === '${specialAllGroup}' ? 0 : 10`,
              },
            },
            height: { scale: 'y', band: 1 },
          },
        },
      },
      {
        // ALT TEXT: invisible, verbose labels
        name: 'measure_a11y_text_labels',
        type: 'text',
        from: { data: DATASET },
        encode: {
          update: {
            y: { scale: 'y', field: demographicType, band: 0.8 },
            opacity: {
              signal: '0',
            },
            fontSize: { value: 0 },
            text: {
              signal: `${oneLineLabel(
                demographicType,
              )} + ': ' + datum.${tooltipMetricDisplayColumnName} + ' ${measureDisplayName}'`,
            },
          },
        },
      },
      // Labels on Bars
      {
        name: 'measure_text_labels',
        type: 'text',
        style: ['text'],
        from: { data: DATASET },
        aria: false, // this data already accessible in alt_text_labels above
        encode: {
          enter: {
            tooltip: {
              signal: `${oneLineLabel(
                demographicType,
              )} + ', ${measureDisplayName}: ' + datum.${tooltipMetricDisplayColumnName}`,
            },
          },
          update: {
            fontSize: { value: width > 250 ? 11 : 7.5 },
            align: {
              signal: `if(datum.${measure} > ${barLabelBreakpoint}, "right", "left")`,
            },
            baseline: { value: 'middle' },
            dx: {
              signal: `if(datum.${measure} > ${barLabelBreakpoint}, -5,${
                width > 250 ? '5' : '1'
              })`,
            },
            dy: {
              signal: chartIsSmall ? -15 : 0,
            },
            fill: {
              signal: `if(datum.${measure} > ${barLabelBreakpoint}  && datum.${demographicType} !== '${specialAllGroup}', '${het.white}', '${het.black}')`,
            },
            x: { scale: 'x', field: measure },
            y: {
              scale: 'y',
              field: demographicType,
              band: 0.8,
              offset: {
                signal: `datum.${demographicType} === '${specialAllGroup}' ? 0 : 10`,
              },
            },
            limit: { signal: 'width / 3' },
            text: {
              signal: barLabel,
            },
          },
        },
      },
    ],
    scales: [
      {
        name: 'x',
        type: 'linear',
        // if all rows contain 0 or null, set full x range to 100%
        domainMax: onlyZeros ? 100 : undefined,
        domain: {
          data: DATASET,
          field: measure,
        },
        range: [0, { signal: 'width' }],
        nice: true,
        zero: true,
      },
      {
        name: 'y',
        type: 'band',
        domain: {
          data: DATASET,
          field: demographicType,
        },
        range: { step: { signal: 'y_step' } },
        paddingOuter: 0.1,
        paddingInner: BAR_PADDING,
      },

      {
        name: 'variables',
        type: 'ordinal',
        domain: [measureDisplayName],
        range: [MEASURE_GROUP_COLOR, MEASURE_ALL_COLOR],
      },
    ],
    axes: [
      {
        scale: 'x',
        orient: 'bottom',
        gridScale: 'y',
        grid: true,
        tickCount: { signal: 'ceil(width/40)' },
        domain: false,
        labels: false,
        aria: false,
        maxExtent: 0,
        minExtent: 0,
        ticks: false,
        zindex: ThemeZIndexValues.middle,
      },
      {
        scale: 'x',
        orient: 'bottom',
        grid: false,
        title: createAxisTitle(),
        titleX: chartIsSmall ? 0 : undefined,
        titleAnchor: chartIsSmall ? 'end' : 'null',
        titleAlign: chartIsSmall ? 'left' : 'center',
        labelFlush: true,
        labelOverlap: true,
        tickCount: { signal: 'ceil(width/40)' },
        zindex: ThemeZIndexValues.middle,
        titleLimit: { signal: 'width - 10 ' },
      },
      {
        scale: 'y',
        orient: 'left',
        grid: false,
        title: demographicTypeDisplayName,
        zindex: ThemeZIndexValues.middle,
        encode: {
          labels: {
            update: {
              // text: { signal: MULTILINE_LABEL },
              text: {
                signal: `datum.value === '${specialAllGroup}' ? ${getMultilineAllOverride(fips)} : ${MULTILINE_LABEL}`,
              },
              baseline: { value: 'bottom' },
              // Limit at which line is truncated with an ellipsis
              limit: { value: 100 },
              dy: {
                signal: `datum.demographicType !== '${specialAllGroup}' ? 5 : ${AXIS_LABEL_Y_DELTA}`, // Adjust based on AXIS_LABEL_Y_DELTA
              },
              lineHeight: { signal: LABEL_HEIGHT },
            },
          },
        },
      },
    ],
    legends,
  }
}

export function addComparisonAllsRowToIntersectionalData(
  data: HetRow[],
  demographicType: DemographicType,
  rateConfig: MetricConfig,
  rateComparisonConfig: MetricConfig,
  rateQueryResponseRateAlls: MetricQueryResponse,
) {
  // rename intersectional 'All' group
  const dataWithAllsRow = data.map((row) => {
    const renameRow = { ...row }
    if (row[demographicType] === specialAllGroup) {
      renameRow[demographicType] = rateComparisonConfig?.shortLabel
    }
    return renameRow
  })

  // add the comparison ALLs row to the intersectional data
  const originalAllsRow = rateQueryResponseRateAlls?.data?.[0]

  if (!originalAllsRow) {
    return dataWithAllsRow
  }

  const { fips, fips_name } = originalAllsRow

  const allsRow = {
    fips,
    fips_name,
    [demographicType]: specialAllGroup,
    [rateConfig.metricId]:
      originalAllsRow[rateConfig?.rateComparisonMetricForAlls?.metricId ?? ''],
  }
  dataWithAllsRow.unshift(allsRow)

  return dataWithAllsRow
}
