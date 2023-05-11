import { Box } from '@mui/material'
import styles from './Card.module.scss'

interface ChartTitleProps {
  title: string
  subtitle?: string
  // optional overrides for margin-top and margin-bottom in MUI units
  mt?: number
  mb?: number
}

export default function ChartTitle(props: ChartTitleProps) {
  return (
    <Box mt={props.mt ?? 2} mb={props.mb ?? 2} mx={3}>
      <h3 className={styles.ChartTitle}>{props.title}</h3>
      {props.subtitle && (
        <h4 className={styles.ChartSubtitle}>{props.subtitle}</h4>
      )}
    </Box>
  )
}
