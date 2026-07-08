import ChartTitle from '../cards/ChartTitle'
import type { MetricConfig } from '../data/config/MetricConfigTypes'
import { formatFieldValue } from '../data/config/MetricConfigUtils'
import { DEMOGRAPHIC_DISPLAY_TYPES } from '../data/query/Breakdowns'
import { RACE } from '../data/utils/Constants'
import HetTable, { type HetTableColumn } from '../styles/HetComponents/HetTable'

interface AgeAdjustedTableChartProps {
  data: Array<Readonly<Record<string, any>>>
  metricConfigs: MetricConfig[]
  title: string
  chartTitleId?: string
}

export function AgeAdjustedTableChart(props: AgeAdjustedTableChartProps) {
  const { data, metricConfigs } = props

  if (data.length <= 0 || metricConfigs.length <= 0) {
    return <h1>No Data provided</h1>
  }

  const columns: HetTableColumn[] = [
    { key: RACE, header: DEMOGRAPHIC_DISPLAY_TYPES[RACE] },
    ...metricConfigs.map((mc) => ({ key: mc.metricId, header: mc.shortLabel })),
  ]

  const rows = data.map((row) =>
    Object.fromEntries(
      columns.map((col) => {
        const value = row[col.key]
        if (value == null) return [col.key, null]
        const mc = metricConfigs.find((m) => m.metricId === col.key)
        return [
          col.key,
          mc ? formatFieldValue(mc.type, value, true) : String(value),
        ]
      }),
    ),
  )

  return (
    <figure className='m-3'>
      <figcaption>
        <ChartTitle id={props.chartTitleId} title={props.title} />
      </figcaption>
      <HetTable rows={rows} columns={columns} variant='info' />
    </figure>
  )
}
