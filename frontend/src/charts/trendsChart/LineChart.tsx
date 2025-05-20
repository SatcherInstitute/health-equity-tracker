import { groupIsAll } from '../../data/utils/datasetutils'
import GroupLine from './GroupLine'
import type { GroupData, TrendsData, XScale, YScale } from './types'

interface LineChartProps {
  data: TrendsData
  xScale: XScale
  yScale: YScale
  valuesArePct: boolean
  keepOnlyElectionYears?: boolean
}

export function LineChart({
  data,
  xScale,
  yScale,
  valuesArePct,
  keepOnlyElectionYears,
}: LineChartProps) {
  // Sort the data so that "All" group is rendered last (appears on top)
  // For non-"All" groups, the comparator returns 0 to ensure a stable sort order.
  const sortedData = [...data].sort(([groupA], [groupB]) => {
    if (groupIsAll(groupA)) return 1
    if (groupIsAll(groupB)) return -1
    return 0
  })

  return (
    <g tabIndex={0} aria-label='Demographic group trendlines'>
      {sortedData.map(([group, groupData]: GroupData) => {
        return (
          <GroupLine
            key={`group-${group}`}
            group={group}
            data={groupData}
            xScale={xScale}
            yScale={yScale}
            valuesArePct={valuesArePct}
            keepOnlyElectionYears={keepOnlyElectionYears}
          />
        )
      })}
    </g>
  )
}
