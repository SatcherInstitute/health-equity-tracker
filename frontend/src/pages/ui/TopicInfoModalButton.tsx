import { Button } from '@mui/material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import styles from './Sidebar.module.scss'
import { useParamState } from '../../utils/hooks/useParamState'
import { TOPIC_INFO_PARAM_KEY } from '../../utils/urlutils'

export default function TopicInfoModalButton() {
  const [, setTopicInfoModalIsOpen] = useParamState<boolean>(
    /* paramKey */ TOPIC_INFO_PARAM_KEY,
    /* paramDefaultValue */ false
  )

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
