import { Button, Dialog, DialogContent } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { type DataTypeConfig } from '../../data/config/MetricConfig'
import { useAtom, useAtomValue } from 'jotai'
import {
  selectedDataTypeConfig1Atom,
  selectedDataTypeConfig2Atom,
  topicInfoModalIsOpenAtom,
} from '../../utils/sharedSettingsState'
import { HashLink } from 'react-router-hash-link'
import { DATA_TAB_LINK, METHODOLOGY_TAB_LINK } from '../../utils/internalRoutes'
import sass from '../../styles/variables.module.scss'

export default function TopicInfoModal() {
  const selectedDataTypeConfig1 = useAtomValue(selectedDataTypeConfig1Atom)
  const selectedDataTypeConfig2 = useAtomValue(selectedDataTypeConfig2Atom)
  const [topicInfoModalIsOpen, setTopicInfoModalIsOpen] = useAtom(
    topicInfoModalIsOpenAtom
  )

  const configArray: DataTypeConfig[] = []
  if (selectedDataTypeConfig1) {
    configArray.push(selectedDataTypeConfig1)
  }
  if (
    selectedDataTypeConfig2 &&
    selectedDataTypeConfig2 !== selectedDataTypeConfig1
  ) {
    configArray.push(selectedDataTypeConfig2)
  }

  return (
    <Dialog
      open={topicInfoModalIsOpen}
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
