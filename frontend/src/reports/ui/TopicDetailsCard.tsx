import { Card, CardContent } from '@mui/material'
import { type VariableConfig } from '../../data/config/MetricConfig'
import styles from './TopicDetailsCard.module.scss'
import DefinitionsList from './DefinitionsList'

interface TopicDetailsCardProps {
  variablesToDefine: Array<[string, VariableConfig[]]>
}

export default function TopicDetailsCard(props: TopicDetailsCardProps) {
  return (
    <Card raised={true} className={styles.TopicDetailsCard}>
      <CardContent>
        <DefinitionsList variablesToDefine={props.variablesToDefine} />
      </CardContent>
    </Card>
  )
}
