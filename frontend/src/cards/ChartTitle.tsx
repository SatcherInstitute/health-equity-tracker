import styles from './Card.module.scss'

interface ChartTitleProps {
  title: string | string[]
}

export default function ChartTitle(props: ChartTitleProps) {
  const title = Array.isArray(props.title) ? props.title.join(' ') : props.title
  return <h3 className={styles.ChartTitle}>{title}</h3>
}
