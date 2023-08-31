import { useAtomValue } from 'jotai'
import {
  selectedDataTypeConfig1Atom,
  selectedDataTypeConfig2Atom,
} from '../../utils/sharedSettingsState'
import { type DataTypeConfig } from '../../data/config/MetricConfig'

export default function DataTypeDefinitionsList() {
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
  return (
    <>
      {configArray.map((config) => {
        return (
          <div key={config.dataTypeId}>
            <h3>{config.fullDisplayName}</h3>
            {config.dataTypeDefinition}
          </div>
        )
      })}
    </>
  )
}
