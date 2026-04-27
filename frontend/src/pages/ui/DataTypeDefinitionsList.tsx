import { useAtomValue } from 'jotai'
import type { DataTypeConfig } from '../../data/config/MetricConfigTypes'
import { applyGeoOverrides } from '../../data/config/MetricConfigUtils'
import InfoCitations from '../../reports/ui/InfoCitations'
import {
  selectedDataTypeConfig1Atom,
  selectedDataTypeConfig2Atom,
  selectedFipsAtom,
} from '../../utils/sharedSettingsState'

export default function DataTypeDefinitionsList() {
  let selectedDataTypeConfig1 = useAtomValue(selectedDataTypeConfig1Atom)
  const selectedDataTypeConfig2 = useAtomValue(selectedDataTypeConfig2Atom)
  const selectedFips = useAtomValue(selectedFipsAtom)
  const geographyBreakdown =
    selectedFips?.getGeographicBreakdown() ?? 'national'

  const configArray: DataTypeConfig[] = []
  if (selectedDataTypeConfig1) {
    selectedDataTypeConfig1 = applyGeoOverrides(
      selectedDataTypeConfig1,
      geographyBreakdown,
    )
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
