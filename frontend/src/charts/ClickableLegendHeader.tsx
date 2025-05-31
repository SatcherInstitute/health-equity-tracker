import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { Button, Tooltip } from '@mui/material'
import type { DataTypeConfig } from '../data/config/MetricConfigTypes'
import { useParamState } from '../utils/hooks/useParamState'
import { TOPIC_INFO_PARAM_KEY } from '../utils/urlutils'

interface ClickableLegendHeaderProps {
  legendTitle: string
  dataTypeConfig: DataTypeConfig
}

export default function ClickableLegendHeader(
  props: ClickableLegendHeaderProps,
) {
  const [, setTopicInfoModalIsOpen] = useParamState<boolean>(
    TOPIC_INFO_PARAM_KEY,
    false,
  )

  const topicName =
    props.dataTypeConfig.fullDisplayNameInline ??
    props.dataTypeConfig.fullDisplayName

  return (
    <Tooltip
      arrow={true}
      placement='top'
      title={`Click for more info on ${topicName}`}
    >
      <Button
        onClick={() => {
          setTopicInfoModalIsOpen(true)
        }}
        className='grid h-full place-content-center'
      >
        <span className='inline-flex items-center break-words text-start text-black text-smallest leading-some-more-space'>
          <InfoOutlinedIcon className='-mb-px mr-1 p-[3px]' />
          {props.legendTitle}
        </span>
      </Button>
    </Tooltip>
  )
}
