import type { Mark, RectMark, TextMark } from 'vega'
import { oneLineLabel } from '../utils'
import {
  ALT_LIGHT_MEASURE_COLOR,
  ALT_LIGHT_MEASURE_OPACITY,
  ALT_TEXT_LABELS,
  BAR_HEIGHT,
  DARK_MEASURE_BARS,
  DARK_MEASURE_COLOR,
  DARK_MEASURE_TEXT_LABELS,
  DATASET,
  LEGEND_COLORS,
  LIGHT_MEASURE_BARS,
  LIGHT_MEASURE_COLOR,
  MIDDLE_OF_BAND,
  SIDE_BY_SIDE_OFFSET,
  SIDE_BY_SIDE_ONE_BAR_RATIO,
} from './constants'
import type { MarkProps } from './types'

export function Marks({
  barLabelBreakpoint,
  demographicType,
  data,
  hasAltPop,
  altLightMeasure,
  altLightMeasureDisplayName,
  altLightMetricDisplayColumnName,
  darkMeasure,
  darkMeasureDisplayName,
  darkMetricDisplayColumnName,
  lightMeasure,
  lightMeasureDisplayName,
  lightMetricDisplayColumnName,
  LEGEND_DOMAINS,
  darkMeasureText,
}: MarkProps) {
  const altTextLabels: TextMark = {
    name: ALT_TEXT_LABELS,
    type: 'text',
    style: ['text'],
    from: { data: DATASET },
    description: `${data.length} items`,
    encode: {
      update: {
        y: { scale: 'y', field: demographicType, band: 0.5 },
        opacity: { signal: '0' },
        fontSize: { value: 0 },
        text: {
          signal: !hasAltPop
            ? `${oneLineLabel(demographicType)}
              +
                ': '
                +
                datum.${lightMetricDisplayColumnName}
                +
                '${lightMeasureDisplayName}'
                +
                ' vs. '
                +
                datum.${darkMetricDisplayColumnName}
                +
                '${darkMeasureDisplayName}'
              `
            : `
                ${oneLineLabel(demographicType)}
                +
                ': '
                +
                if(datum.${altLightMeasure} == null, datum.${lightMetricDisplayColumnName}, datum.${altLightMetricDisplayColumnName})
                +
                '${lightMeasureDisplayName}'
                +
                ' vs. '
                +
                datum.${darkMetricDisplayColumnName}
                +
                '${darkMeasureDisplayName}'
                `,
        },
      },
    },
  }

  const lightMeasureBars: RectMark = {
    name: LIGHT_MEASURE_BARS,
    aria: false,
    type: 'rect',
    style: ['bar'],
    from: { data: DATASET },
    encode: {
      enter: {
        tooltip: {
          signal: `${oneLineLabel(
            demographicType,
          )} + ', ${lightMeasureDisplayName}: ' + datum.${lightMetricDisplayColumnName}`,
        },
      },
      update: {
        fill: { value: LIGHT_MEASURE_COLOR },
        ariaRoleDescription: { value: 'bar' },
        x: { scale: 'x', field: lightMeasure },
        x2: { scale: 'x', value: 0 },
        y: { scale: 'y', field: demographicType },
        yc: {
          scale: 'y',
          field: demographicType,
          offset: MIDDLE_OF_BAND - SIDE_BY_SIDE_OFFSET,
        },
        height: {
          scale: 'y',
          band: SIDE_BY_SIDE_ONE_BAR_RATIO,
        },
      },
    },
  }

  const darkMeasureBars: RectMark = {
    name: DARK_MEASURE_BARS,
    type: 'rect',
    style: ['bar'],
    aria: false,
    from: { data: DATASET },
    encode: {
      enter: {
        tooltip: {
          signal: `${oneLineLabel(
            demographicType,
          )} + ', ${darkMeasureDisplayName}: ' + datum.${darkMetricDisplayColumnName}`,
        },
      },
      update: {
        fill: { value: DARK_MEASURE_COLOR },
        ariaRoleDescription: { value: 'bar' },
        x: { scale: 'x', field: darkMeasure },
        x2: { scale: 'x', value: 0 },
        yc: {
          scale: 'y',
          field: demographicType,
          offset: MIDDLE_OF_BAND + SIDE_BY_SIDE_OFFSET,
        },
        height: {
          scale: 'y',
          band: SIDE_BY_SIDE_ONE_BAR_RATIO,
        },
      },
    },
  }

  const darkMeasureTextLabels: TextMark = {
    name: DARK_MEASURE_TEXT_LABELS,
    aria: false, // this data accessible in alt_text_labels
    type: 'text',
    style: ['text'],
    from: { data: DATASET },
    encode: {
      enter: {
        tooltip: {
          signal: `${oneLineLabel(
            demographicType,
          )} + ', ${darkMeasureDisplayName}: ' + datum.${darkMetricDisplayColumnName}`,
        },
      },
      update: {
        align: {
          signal: `if(datum.${darkMeasure} > ${barLabelBreakpoint}, "right", "left")`,
        },
        baseline: { value: 'middle' },
        dx: {
          signal: `if(datum.${darkMeasure} > ${barLabelBreakpoint}, -3, 3)`,
        },
        fill: {
          signal: `if(datum.${darkMeasure} > ${barLabelBreakpoint}, "white", "black")`,
        },
        x: { scale: 'x', field: darkMeasure },
        y: { scale: 'y', field: demographicType, band: 0.5 },
        yc: {
          scale: 'y',
          field: demographicType,
          offset: MIDDLE_OF_BAND + BAR_HEIGHT,
        },
        text: {
          signal: `datum.${darkMetricDisplayColumnName} + '${darkMeasureText}'`,
        },
      },
    },
  }

  const marks: Mark[] = [
    altTextLabels,
    lightMeasureBars,
    darkMeasureBars,
    darkMeasureTextLabels,
  ]

  if (hasAltPop) {
    // Add "alt light measure" bars and legend entries
    LEGEND_DOMAINS[0] = `${lightMeasureDisplayName} (KFF)`
    LEGEND_DOMAINS[2] = altLightMeasureDisplayName
    LEGEND_COLORS[2] = ALT_LIGHT_MEASURE_COLOR

    marks.push({
      name: 'altLightMeasure_bars',
      aria: false, // this data accessible in alt_text_labels
      type: 'rect',
      style: ['bar'],
      from: { data: 'DATASET' },
      encode: {
        enter: {
          tooltip: {
            signal: `${oneLineLabel(
              demographicType,
            )} + ', ${altLightMeasureDisplayName}: ' + datum.${altLightMetricDisplayColumnName}`,
          },
        },
        update: {
          fill: { value: ALT_LIGHT_MEASURE_COLOR },
          fillOpacity: { value: ALT_LIGHT_MEASURE_OPACITY },
          ariaRoleDescription: { value: 'bar' },
          x: { scale: 'x', field: altLightMeasure },
          x2: { scale: 'x', value: 0 },
          y: { scale: 'y', field: demographicType },
          yc: {
            scale: 'y',
            field: demographicType,
            offset: MIDDLE_OF_BAND - SIDE_BY_SIDE_OFFSET,
          },
          height: {
            scale: 'y',
            band: SIDE_BY_SIDE_ONE_BAR_RATIO,
          },
        },
      },
    })
  }

  return marks
}
