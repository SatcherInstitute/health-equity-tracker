import type React from 'react'
import { CheckRounded, BlockRounded } from '@mui/icons-material'
import HetTerm from '../../../styles/HetComponents/HetTerm'

interface DatasetListProps {
  datasets: Array<{
    datasetName: string
    datasetNameDetails?: string
    items: Array<{
      label: string
      included: boolean
    }>
  }>
}

const DatasetList: React.FC<DatasetListProps> = ({ datasets }) => {
  return (
    <div className='grid grid-cols-2 md:grid-cols-3'>
      {datasets.map((dataset) => (
        <div key={dataset.datasetName} className='m-1'>
          <div className='flex flex-col justify-left my-2'>
            <p className='text-text my-0'>
              <HetTerm>{dataset.datasetName}</HetTerm>
            </p>
            {dataset.datasetNameDetails && (
              <p className='text-smallest my-0'>
                <HetTerm>{dataset.datasetNameDetails}</HetTerm>
              </p>
            )}
          </div>

          <ul className='ml-2 list-none p-0 text-smallest'>
            {dataset.items.map((item) => (
              <li key={item.label} className='flex flex-row align-center'>
                {item.included ? (
                  <CheckRounded className='text-text text-altGreen' />
                ) : (
                  <BlockRounded className='text-text text-redOrange' />
                )}
                <p className='my-0 ml-2'>{item.label}</p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export default DatasetList
