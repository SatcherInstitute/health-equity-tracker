import { Button } from '@mui/material'
import { type DataTypeConfig } from '../../data/config/MetricConfig'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { useAtomValue, useSetAtom } from 'jotai'
import {
  selectedDataTypeConfig1Atom,
  selectedDataTypeConfig2Atom,
  topicInfoModalIsOpenAtom,
} from '../../utils/sharedSettingsState'
export default function TopicInfoModalButton() {
  const selectedDataTypeConfig1 = useAtomValue(selectedDataTypeConfig1Atom)
  const selectedDataTypeConfig2 = useAtomValue(selectedDataTypeConfig2Atom)

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

  const setTopicInfoModalIsOpen = useSetAtom(topicInfoModalIsOpenAtom)

  if (!configArray) return <></>

  return (
    <Button
      sx={{
        color: 'black',
        fontWeight: '400',
        fontSize: '13px',
        textAlign: 'left',
        lineHeight: '1.3',
      }}
      onClick={() => {
        setTopicInfoModalIsOpen(true)
      }}
    >
      <InfoOutlinedIcon sx={{ m: '12px' }} fontSize="small" color="primary" />
      Learn more about selected topics
      {/* {configArray
                .map((config) => config.dataTypeShortLabel)
                .join(' & ')}{' '}
              info */}
    </Button>
  )
}
