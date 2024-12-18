import { BlockRounded, CheckRounded } from '@mui/icons-material'
import React from 'react'
import HetTerm from '../../../styles/HetComponents/HetTerm'

interface DatasetItem {
  label: string
  included: boolean
}

interface Dataset {
  datasetName: string
  datasetNameDetails?: string
  items: DatasetItem[]
}

interface DatasetListProps {
  datasets: Dataset[]
}

export default function DatasetList({ datasets }: DatasetListProps) {
  return (
    <div className='grid grid-cols-2 md:grid-cols-3'>
      {datasets.map((dataset) => (
        <div key={dataset.datasetName} className='m-1'>
          <div className='justify-left my-2 flex flex-col'>
            <p className='my-0 text-text'>
              <HetTerm>{dataset.datasetName}</HetTerm>
            </p>
            {dataset.datasetNameDetails && (
              <p className='my-0 text-smallest'>
                <HetTerm>{dataset.datasetNameDetails}</HetTerm>
              </p>
            )}
          </div>

          <ul className='ml-2 list-none p-0 text-smallest'>
            {dataset.items.map((item) => (
              <li key={item.label} className='flex flex-row align-center'>
                {item.included ? (
                  <CheckRounded className='text-altGreen text-text' />
                ) : (
                  <BlockRounded className='text-redOrange text-text' />
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
