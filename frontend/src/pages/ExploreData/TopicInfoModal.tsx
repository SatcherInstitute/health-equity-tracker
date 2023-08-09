import { Button, Dialog, DialogContent } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { type DataTypeId, type DataTypeConfig } from '../../data/config/MetricConfig'
import { HashLink } from 'react-router-hash-link'
import { DATA_TAB_LINK, METHODOLOGY_TAB_LINK } from '../../utils/internalRoutes'
import sass from '../../styles/variables.module.scss'
import { useParamState } from '../../utils/hooks/useParamState'
import { DATA_TYPE_1_PARAM, DATA_TYPE_2_PARAM, TOPIC_INFO_PARAM_KEY } from '../../utils/urlutils'
import { getConfigFromDataTypeId } from './MadLibUI'

export default function TopicInfoModal() {
  const [dataTypeId1,] = useParamState<DataTypeId>(
    /* paramKey */ DATA_TYPE_1_PARAM,
  )
  const [dataTypeId2,] = useParamState<DataTypeId>(
    /* paramKey */ DATA_TYPE_2_PARAM,
  )
  const [topicInfoModalIsOpen, setTopicInfoModalIsOpen] =
    useParamState<boolean>(
      /* paramKey */ TOPIC_INFO_PARAM_KEY,
      /* paramDefaultValue */ false
    )

  const configArray: DataTypeConfig[] = []
  if (dataTypeId1) {
    configArray.push(getConfigFromDataTypeId(dataTypeId1))
  }
  if (dataTypeId2) {
    configArray.push(getConfigFromDataTypeId(dataTypeId2))
  }

  return (
    <Dialog
      open={Boolean(topicInfoModalIsOpen)}
      onClose={() => {
        setTopicInfoModalIsOpen(false)
      }}
      maxWidth={'lg'}
      scroll="paper"
    >
      <DialogContent dividers={true}>
        <Button
          sx={{ float: 'right' }}
          onClick={() => {
            setTopicInfoModalIsOpen(false)
          }}
          color="primary"
          aria-label="close topic info modal"
        >
          <CloseIcon />
        </Button>
        {configArray.map((config) => {
          return (
            <div key={config.dataTypeId}>
              <h3>{config.fullDisplayName}</h3>
              {config.dataTypeDefinition}
            </div>
          )
        })}
      </DialogContent>
      <DialogContent dividers={true} sx={{ fontSize: sass.smallest }}>
        For specific calculations and more detailed information, visit our{' '}
        <HashLink to={METHODOLOGY_TAB_LINK}>methodology</HashLink>, or view the{' '}
        <HashLink to={DATA_TAB_LINK}>source data</HashLink>.
      </DialogContent>
    </Dialog>
  )
}
