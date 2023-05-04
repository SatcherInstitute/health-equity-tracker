import { Box } from '@mui/material'
import styles from './Card.module.scss'

interface ChartTitleProps {
  title: string | string[]
  mt?: number
  mb?: number
}

export default function ChartTitle(props: ChartTitleProps) {
  const title = Array.isArray(props.title) ? props.title.join(' ') : props.title
  return (
    <Box mt={props.mt ?? 2} mb={props.mb ?? 2} mx={3}>
      <h3 className={styles.ChartTitle}>{title}</h3>
    </Box>
  )
}
