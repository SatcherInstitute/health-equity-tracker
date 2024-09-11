import { useAtomValue } from 'jotai'
import {
  selectedDataTypeConfig1Atom,
  selectedDataTypeConfig2Atom,
} from '../../utils/sharedSettingsState'
import type { DataTypeConfig } from '../../data/config/MetricConfigTypes'
import InfoCitations from '../../reports/ui/InfoCitations'

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
            <span>Measurement Definition:</span> {config.definition?.text}
            <InfoCitations citations={config.definition?.citations} />
            {config?.description && (
              <p>
                <span>Clinical Importance:</span> {config.description.text}
                <InfoCitations citations={config.description?.citations} />
              </p>
            )}
          </div>
        )
      })}
    </>
  )
}
