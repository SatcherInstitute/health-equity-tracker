import { Button, Dialog, DialogContent } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { HashLink } from 'react-router-hash-link'
import { DATA_TAB_LINK, METHODOLOGY_TAB_LINK } from '../../utils/internalRoutes'
import sass from '../../styles/variables.module.scss'
import { useParamState } from '../../utils/hooks/useParamState'
import { TOPIC_INFO_PARAM_KEY } from '../../utils/urlutils'
import DataTypeDefinitionsList from '../ui/DataTypeDefinitionsList'
import { useAtomValue } from 'jotai'
import { selectedDataTypeConfig1Atom } from '../../utils/sharedSettingsState'
import { type DropdownVarId } from '../../data/config/MetricConfig'
import { getParentDropdownFromDataTypeId } from './MadLibUI'

export default function TopicInfoModal() {
  const [topicInfoModalIsOpen, setTopicInfoModalIsOpen] =
    useParamState(TOPIC_INFO_PARAM_KEY)

  const selectedDataTypeId = useAtomValue(
    selectedDataTypeConfig1Atom
  )?.dataTypeId
  console.log({ selectedDataTypeId })

  const dropdownVarId: DropdownVarId | '' = selectedDataTypeId
    ? getParentDropdownFromDataTypeId(selectedDataTypeId)
    : ''

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
        <DataTypeDefinitionsList />
      </DialogContent>
      <DialogContent dividers={true} sx={{ fontSize: sass.smallest }}>
        For specific calculations and more detailed information, visit our{' '}
        <HashLink to={`${METHODOLOGY_TAB_LINK}#${dropdownVarId}`}>
          methodology
        </HashLink>
        , or view the <HashLink to={DATA_TAB_LINK}>source data</HashLink>.
      </DialogContent>
    </Dialog>
  )
}
