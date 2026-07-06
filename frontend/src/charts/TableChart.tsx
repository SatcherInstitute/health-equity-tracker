import ChartTitle from '../cards/ChartTitle'
import type { DataTypeId, MetricConfig } from '../data/config/MetricConfigTypes'
import { formatFieldValue } from '../data/config/MetricConfigUtils'
import {
  DEMOGRAPHIC_DISPLAY_TYPES,
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
  type DemographicType,
} from '../data/query/Breakdowns'
import type { Fips } from '../data/utils/Fips'
import HetTable, { type HetTableColumn } from '../styles/HetComponents/HetTable'
import HetUnitLabel from '../styles/HetComponents/HetUnitLabel'
import type { CountColsMap } from './mapGlobals'
import Units from './Units'
import { removeLastS } from './utils'

interface TableChartProps {
  countColsMap: CountColsMap
  data: Array<Readonly<Record<string, any>>>
  demographicType: DemographicType
  metricConfigs: MetricConfig[]
  dataTypeId: DataTypeId
  fips: Fips
  dataTableTitle: string
  subtitle?: string
}

export function TableChart(props: TableChartProps) {
  const { data, metricConfigs, demographicType } = props

  if (data.length <= 0 || metricConfigs.length <= 0) {
    return <h1>Insufficient Data</h1>
  }

  const columns: HetTableColumn[] = [
    {
      key: demographicType,
      header: DEMOGRAPHIC_DISPLAY_TYPES[demographicType],
    },
    ...metricConfigs.map((mc) => ({
      key: mc.metricId,
      header: mc.columnTitleHeader ?? mc.shortLabel,
    })),
  ]

  const rows = data.map((row) =>
    Object.fromEntries(
      columns.map((col, colIndex) => {
        const value = row[col.key]
        if (value == null) return [col.key, null]

        if (colIndex === 0) {
          return [col.key, value]
        }

        const mc = metricConfigs[colIndex - 1]

        const rawNumerator = props.countColsMap.numeratorConfig?.metricId
          ? row[props.countColsMap.numeratorConfig.metricId]
          : undefined
        const numeratorCount =
          rawNumerator != null ? rawNumerator.toLocaleString() : ''
        const denominatorCount = props.countColsMap.denominatorConfig?.metricId
          ? row[props.countColsMap.denominatorConfig.metricId]?.toLocaleString()
          : ''
        let numeratorLabel =
          props.countColsMap.numeratorConfig?.shortLabel ?? ''
        if (rawNumerator === 1) numeratorLabel = removeLastS(numeratorLabel)
        const denominatorLabel =
          props.countColsMap.denominatorConfig?.shortLabel ?? ''

        return [
          col.key,
          <>
            {formatFieldValue(mc.type, value, true)}
            <Units column={colIndex} metric={metricConfigs} />
            {colIndex === 1 && numeratorCount && denominatorCount ? (
              <HetUnitLabel>
                {' '}
                ( {numeratorCount} {numeratorLabel} / {denominatorCount}{' '}
                {denominatorLabel} )
              </HetUnitLabel>
            ) : null}
          </>,
        ]
      }),
    ),
  )

  return (
    <figure className='m-3'>
      <figcaption>
        <ChartTitle
          title={`${props.dataTableTitle} in ${props.fips.getSentenceDisplayName()} by ${DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[props.demographicType]}`}
          subtitle={props.subtitle}
        />
      </figcaption>
      <HetTable rows={rows} columns={columns} variant='info' />
    </figure>
  )
}
