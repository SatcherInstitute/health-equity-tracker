import { Dialog, DialogContent } from '@mui/material'
import { useAtomValue } from 'jotai'
import { HashLink } from 'react-router-hash-link'
import HetCloseButton from '../../styles/HetComponents/HetCloseButton'
import { useParamState } from '../../utils/hooks/useParamState'
import {
  DATA_CATALOG_PAGE_LINK,
  METHODOLOGY_PAGE_LINK,
} from '../../utils/internalRoutes'
import type { CategoryTypeId } from '../../utils/MadLibs'
import { selectedDataTypeConfig1Atom } from '../../utils/sharedSettingsState'
import { TOPIC_INFO_PARAM_KEY } from '../../utils/urlutils'
import DataTypeDefinitionsList from '../ui/DataTypeDefinitionsList'

export default function TopicInfoModal() {
  const [topicInfoModalIsOpen, setTopicInfoModalIsOpen] =
    useParamState(TOPIC_INFO_PARAM_KEY)

  const selectedDataTypeConfig = useAtomValue(selectedDataTypeConfig1Atom)

  const category: CategoryTypeId | undefined =
    selectedDataTypeConfig?.categoryId
  let methodologyLink = `${METHODOLOGY_PAGE_LINK}/topic-categories/`
  // TODO: refactor to sync CategoryTypeId and Methodology Category Link Routes (they're close but not identical)
  if (category === 'medicare') methodologyLink += 'medication-utilization'
  else methodologyLink += category ?? ''

  return (
    <Dialog
      open={Boolean(topicInfoModalIsOpen)}
      onClose={() => {
        setTopicInfoModalIsOpen(false)
      }}
      maxWidth={'lg'}
      scroll='paper'
    >
      <DialogContent dividers={true}>
        <HetCloseButton
          onClick={() => setTopicInfoModalIsOpen(false)}
          ariaLabel='close topic info modal'
        />
        <DataTypeDefinitionsList />
      </DialogContent>
      <DialogContent dividers={true} className='text-smallest'>
        For specific calculations and more detailed information, visit our{' '}
        <HashLink to={methodologyLink}>methodology</HashLink>, or view the{' '}
        <HashLink to={DATA_CATALOG_PAGE_LINK}>source data</HashLink>.
      </DialogContent>
    </Dialog>
  )
}
