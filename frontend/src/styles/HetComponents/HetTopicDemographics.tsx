import { BlockRounded, CheckRounded } from '@mui/icons-material'
import type { DropdownVarId } from '../../data/config/DropDownIds'
import type { DataTypeId } from '../../data/config/MetricConfigTypes'
import {
  formatSubPopString,
  getMetricConfigsForIds,
} from '../../data/config/MetricConfigUtils'
import {
  DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE,
  type DemographicType,
  type GeographicBreakdown,
} from '../../data/query/Breakdowns'
import type { DataSourceMetadata } from '../../data/utils/DatasetTypes'
import { Fips } from '../../data/utils/Fips'
import { getAllDemographicOptions } from '../../reports/reportUtils'
import { getConfigFromDataTypeId } from '../../utils/MadLibs'
import HetTerm from './HetTerm'

interface DemographicItem {
  demographicLabel: string
  included: boolean
}

interface TopicDemographicDetails {
  topic: string
  topicDetails?: string
  items: DemographicItem[]
}

interface HetTopicDemographicsProps {
  topicIds: DropdownVarId[] // clone readonly array when calling this if needed
  datasourceMetadata: DataSourceMetadata
}
export default function HetTopicDemographics(props: HetTopicDemographicsProps) {
  const metricConfigsWithIds = getMetricConfigsForIds(props.topicIds)
  const topicDemographicDetailsItems: TopicDemographicDetails[] =
    metricConfigsWithIds.flatMap(({ configs }) => {
      return configs.map((config) => ({
        topic: config.fullDisplayName,
        topicDetails: formatSubPopString(config),
        items: getItems(config.dataTypeId, props.datasourceMetadata),
      }))
    })
  return (
    <div className='grid grid-cols-2 md:grid-cols-3'>
      {topicDemographicDetailsItems.map((item) => (
        <div key={`${item.topic}_${item.topicDetails}`} className='m-1'>
          <div className='justify-left my-2 flex flex-col'>
            <p className='my-0 text-text'>
              <HetTerm>{item.topic}</HetTerm>
            </p>
            {item.topicDetails && (
              <p className='my-0 text-smallest'>
                <HetTerm>{item.topicDetails}</HetTerm>
              </p>
            )}
          </div>

          <ul className='ml-2 list-none p-0 text-smallest'>
            {item.items.map((item) => (
              <li
                key={item.demographicLabel}
                className='flex flex-row align-center'
              >
                {item.included ? (
                  <CheckRounded className='text-alt-green text-text' />
                ) : (
                  <BlockRounded className='text-red-orange text-text' />
                )}

                <span className='my-0 ml-2'>{item.demographicLabel}</span>
                <span className='sr-only'>
                  {item.included ? ' Available' : ' Not available'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

const sampleFipsMap: Record<GeographicBreakdown, Fips> = {
  national: new Fips('00'),
  state: new Fips('01'),
  county: new Fips('01001'),
  territory: new Fips('78'),
  'state/territory': new Fips('78'),
}

function getItems(
  id: DataTypeId,
  datasourceMetadata: DataSourceMetadata,
): DemographicItem[] {
  const sampleFips = sampleFipsMap[datasourceMetadata.geographic_breakdowns[0]]

  const config = getConfigFromDataTypeId(id)
  const configDemographicOptions = Object.values(
    getAllDemographicOptions(config, sampleFips).enabledDemographicOptionsMap,
  )

  const items: DemographicItem[] =
    datasourceMetadata.demographic_breakdowns.map((demo: DemographicType) => {
      return {
        demographicLabel: `Breakdowns by ${DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE[demo]}`,
        included: configDemographicOptions.includes(demo),
      }
    })

  return items
}
