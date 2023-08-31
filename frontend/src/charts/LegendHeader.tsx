import { Button, Grid, Tooltip } from '@mui/material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import styles from './Legend.module.scss'
import { useParamState } from '../utils/hooks/useParamState'
import { TOPIC_INFO_PARAM_KEY } from '../utils/urlutils'

interface LegendHeaderProps {
  legendTitle: string
}

export default function LegendHeader(props: LegendHeaderProps) {
  const [, setTopicInfoModalIsOpen] = useParamState<boolean>(
    TOPIC_INFO_PARAM_KEY,
    false
  )

  return (
    <Tooltip title="Click for more topic info">
      <Button
        style={{ color: 'black' }}
        onClick={() => {
          setTopicInfoModalIsOpen(true)
        }}
      >
        <span className={styles.LegendTitle}>
          <Grid container alignItems={'center'}>
            <Grid item>{props.legendTitle}</Grid>
            <Grid item>
              <InfoOutlinedIcon sx={{ p: '2px' }} />
            </Grid>
          </Grid>
        </span>
      </Button>
    </Tooltip>
  )
}
