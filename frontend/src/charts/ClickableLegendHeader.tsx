import { Button, Grid, Tooltip } from '@mui/material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import styles from './Legend.module.scss'
import { useParamState } from '../utils/hooks/useParamState'
import { TOPIC_INFO_PARAM_KEY } from '../utils/urlutils'
import { type DataTypeConfig } from '../data/config/MetricConfig'

interface ClickableLegendHeaderProps {
  legendTitle: string
  dataTypeConfig: DataTypeConfig
}

export default function ClickableLegendHeader(
  props: ClickableLegendHeaderProps
) {
  const [, setTopicInfoModalIsOpen] = useParamState<boolean>(
    TOPIC_INFO_PARAM_KEY,
    false
  )

  const topicName =
    props.dataTypeConfig.fullDisplayNameInline ??
    props.dataTypeConfig.fullDisplayName

  return (
    <Tooltip
      arrow={true}
      placement="top"
      title={`Click for more info on ${topicName}`}
    >
      <Button
        onClick={() => {
          setTopicInfoModalIsOpen(true)
        }}
      >
        <Grid container alignItems={'center'}>
          <span className={styles.LegendHeader}>
            <InfoOutlinedIcon
              sx={{ mr: '4px', mb: '-1px', p: '3px 3px 3px 3px' }}
            />
            {props.legendTitle}
          </span>
        </Grid>
      </Button>
    </Tooltip>
  )
}
