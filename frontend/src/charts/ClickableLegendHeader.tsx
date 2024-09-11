import { Button, Tooltip } from '@mui/material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { useParamState } from '../utils/hooks/useParamState'
import { TOPIC_INFO_PARAM_KEY } from '../utils/urlutils'
import type { DataTypeConfig } from '../data/config/MetricConfigTypes'

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
    <div className='w-full'>
      <Tooltip
        arrow={true}
        placement='top'
        title={`Click for more info on ${topicName}`}
      >
        <Button
          onClick={() => {
            setTopicInfoModalIsOpen(true)
          }}
          className='grid h-full w-full place-content-center'
        >
          <span className='inline-flex items-center break-words text-start text-smallest leading-lhSomeMoreSpace text-black'>
            <InfoOutlinedIcon className='mb-[-1px] mr-1 p-[3px]' />
            {props.legendTitle}
          </span>
        </Button>
      </Tooltip>
    </div>
  )
}
