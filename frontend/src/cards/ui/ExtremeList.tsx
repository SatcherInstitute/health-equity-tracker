import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import { formatFieldValue } from '../../data/config/MetricConfigUtils'
import type { HetRow } from '../../data/utils/DatasetTypes'
import HetUnitLabel from '../../styles/HetComponents/HetUnitLabel'

interface ExtremeListProps {
  whichExtreme: 'Highest' | 'Lowest'
  values: HetRow[]
  metricConfig: MetricConfig
  qualifierItems?: string[]
  qualifierMessage?: string
}

export default function ExtremeList(props: ExtremeListProps) {
  const { type: metricType, metricId } = props.metricConfig

  const extremeVal = props.values?.[0]?.[props.metricConfig.metricId]

  const isTie = extremeVal === props.values?.[1]?.[props.metricConfig.metricId]

  const tieDisplayValue = isTie
    ? formatFieldValue(metricType, extremeVal)
    : null

  return (
    <div className='w-full px-0 sm:w-1/2 sm:px-2'>
      <h4 className='m-0'>
        {tieDisplayValue
          ? `${props.whichExtreme} (${tieDisplayValue}):`
          : `${props.values.length} ${props.whichExtreme}:`}
      </h4>

      <ul className='pr-8'>
        {isTie ? (
          <li>
            <>
              {props.values.map((row, i) => {
                let placeName = row.fips_name
                if (props.qualifierItems?.includes(placeName)) {
                  placeName += ` ${props.qualifierMessage ?? ''}`
                }

                return (
                  <span key={row.fips_name}>
                    {placeName}
                    {i < props.values.length - 1 ? ', ' : ''}
                  </span>
                )
              })}
            </>
          </li>
        ) : (
          <>
            {!isTie &&
              props.values.map((row) => {
                let placeName = row.fips_name
                if (props.qualifierItems?.includes(placeName)) {
                  placeName += ` ${props.qualifierMessage ?? ''}`
                }

                return (
                  <li key={row.fips_name}>
                    {placeName}: {formatFieldValue(metricType, row[metricId])}
                    {metricType === 'per100k' && (
                      <HetUnitLabel> per 100k</HetUnitLabel>
                    )}
                  </li>
                )
              })}
          </>
        )}
      </ul>
    </div>
  )
}
