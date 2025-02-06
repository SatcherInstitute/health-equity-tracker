import type React from 'react'
import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import { het } from '../../styles/DesignTokens'

import { formatMetricValue } from './mapHelpers'
import type { TooltipFeature } from './types'

const { borderColor } = het

interface TooltipContentProps {
  feature: TooltipFeature
  dataMap: Map<string, any>
  metricConfig: MetricConfig
  geographyType?: string
}

const TooltipContent: React.FC<TooltipContentProps> = ({
  feature,
  dataMap,
  metricConfig,
  geographyType = '',
}) => {
  const name = feature.properties?.name || String(feature.id)
  const data = dataMap.get(feature.id as string)

  if (!data) {
    return (
      <div>
        <strong>
          {name} {geographyType}
        </strong>
        <br />
        No data available
      </div>
    )
  }

  const entries = Object.entries(data).filter(([key]) => key !== 'value')
  const [firstLabel, firstValue] = entries[0] ?? ['', 0]
  const remainingEntries = entries.slice(1)

  return (
    <div>
      <strong>
        {name} {geographyType}
      </strong>
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: 4 }}>
          <span style={{ color: borderColor }}>{firstLabel}:</span>{' '}
          {formatMetricValue(firstValue as number, metricConfig)}
        </div>
        {remainingEntries.map(([label, value]) => (
          <div key={label} style={{ marginBottom: 4 }}>
            <span style={{ color: borderColor }}>{label}:</span> {String(value)}
          </div>
        ))}
      </div>
    </div>
  )
}

export default TooltipContent
