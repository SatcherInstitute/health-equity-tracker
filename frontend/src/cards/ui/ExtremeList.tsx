import { Grid } from '@mui/material'
import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import type { Row } from '../../data/utils/DatasetTypes'
import HetUnitLabel from '../../styles/HetComponents/HetUnitLabel'
import { formatFieldValue } from '../../data/config/MetricConfigUtils'

interface ExtremeListProps {
  whichExtreme: 'Highest' | 'Lowest'
  values: Row[]
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
    <Grid item xs={12} sm={6}>
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
    </Grid>
  )
}
