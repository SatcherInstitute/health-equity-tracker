import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { Button } from '@mui/material'
import { useAtomValue } from 'jotai'
import type { DataTypeConfig } from '../../data/config/MetricConfigTypes'
import { useParamState } from '../../utils/hooks/useParamState'
import {
  selectedDataTypeConfig1Atom,
  selectedDataTypeConfig2Atom,
} from '../../utils/sharedSettingsState'
import { TOPIC_INFO_PARAM_KEY } from '../../utils/urlutils'

export default function TopicInfoModalButton() {
  const selectedDataTypeConfig1 = useAtomValue(selectedDataTypeConfig1Atom)
  const selectedDataTypeConfig2 = useAtomValue(selectedDataTypeConfig2Atom)

  const configArray: DataTypeConfig[] = []
  if (selectedDataTypeConfig1) {
    configArray.push(selectedDataTypeConfig1)
  }
  if (
    selectedDataTypeConfig2 &&
    selectedDataTypeConfig2 !== selectedDataTypeConfig1
  ) {
    configArray.push(selectedDataTypeConfig2)
  }

  const [, setTopicInfoModalIsOpen] = useParamState<boolean>(
    TOPIC_INFO_PARAM_KEY,
    false,
  )

  if (!configArray) return <></>

  return (
    <Button
      onClick={() => {
        setTopicInfoModalIsOpen(true)
      }}
      className='text-altBlack text-smallest'
      aria-label='open the topic info modal'
    >
      <InfoOutlinedIcon sx={{ mr: '4px', mb: '0px' }} fontSize='small' />
      Topic info
    </Button>
  )
}
