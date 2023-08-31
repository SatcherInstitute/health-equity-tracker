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
            {/* <Grid item> */}
            <InfoOutlinedIcon sx={{ p: '3px 3px 4px 3px' }} />
            {/* </Grid> */}
            {/* <Grid item> */}
            {props.legendTitle}
            {/* </Grid> */}
          </Grid>
        </span>
      </Button>
    </Tooltip>

    // <>
    //   <h4 className={styles.LegendTitle}>
    //     {props.legendTitle}

    //   </h4>
    //   <Tooltip title="Click for more topic info">

    //     <Button
    //       style={{ color: 'black' }}
    //       onClick={() => {
    //         setTopicInfoModalIsOpen(true)
    //       }}
    //     ><InfoOutlinedIcon sx={{ p: '3px 3px 4px 3px' }} />
    //       <span style={{ fontSize: "smaller" }}>
    //         Topic Info
    //       </span>
    //     </Button>
    //   </Tooltip>
    // </>
  )
}
