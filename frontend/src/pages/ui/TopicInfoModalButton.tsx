import { Button } from '@mui/material'
import { type DataTypeConfig } from '../../data/config/MetricConfig'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { useAtomValue } from 'jotai'
import {
  selectedDataTypeConfig1Atom,
  selectedDataTypeConfig2Atom,
} from '../../utils/sharedSettingsState'
import styles from './Sidebar.module.scss'
import { useParamState } from '../../utils/hooks/useParamState'
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
    false
  )

  if (!configArray) return <></>

  return (
    <Button
      onClick={() => {
        setTopicInfoModalIsOpen(true)
      }}
      className={styles.TopicInfoModalButton}
      aria-label="open the topic info modal"
    >
      <InfoOutlinedIcon sx={{ mr: '4px', mb: '0px' }} fontSize="small" />
      Topic info
    </Button>
  )
}
