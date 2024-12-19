import type { DataTypeId } from '../../data/config/MetricConfigTypes'
import MadLibAbstractSelector from './MadLibAbstractSelector'

interface DataTypeSelectorProps {
  newValue: DataTypeId
  options: Array<[DataTypeId, string]>
  onOptionUpdate: (option: string) => void
}

export default function DataTypeSelector({
  newValue,
  options,
  onOptionUpdate,
}: DataTypeSelectorProps) {
  return (
    <MadLibAbstractSelector
      options={options}
      selectedValue={newValue}
      onSelect={onOptionUpdate}
      buttonClassName='ml-0'
    />
  )
}
