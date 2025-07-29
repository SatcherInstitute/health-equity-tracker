import type {
  DatasetId,
  DatasetIdWithStateFIPSCode,
} from '../../data/config/DatasetMetadata'
import { getDataManager } from '../../utils/globals'

function download(filename: string, content: string) {
  const element = document.createElement('a')
  element.setAttribute(
    'href',
    `data:text/csv;charset=utf-8,${encodeURIComponent(content)}`,
  )
  element.setAttribute('download', filename)

  element.style.display = 'none'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}

// Returns true if the dataset downloads successfully and otherwise false
async function downloadDataset(
  datasetId: DatasetId | DatasetIdWithStateFIPSCode,
) {
  try {
    const dataset = await getDataManager().loadDataset(datasetId)
    download(`HET - ${dataset.metadata.name}.csv`, dataset.toCsvString())
    return true
  } catch (_e) {
    return false
  }
}

export default downloadDataset
