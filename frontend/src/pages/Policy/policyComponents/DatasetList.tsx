import React from 'react'
import { CheckRounded, BlockRounded } from '@mui/icons-material'
import HetTerm from '../../../styles/HetComponents/HetTerm'

interface DatasetListProps {
  datasets: Array<{
    datasetName: string
    items: Array<{
      label: string
      included: boolean
    }>
  }>
}

const DatasetList: React.FC<DatasetListProps> = ({
  datasets,
}) => {
  return (
      <div className='grid grid-cols-2 md:grid-cols-3'>
        {datasets.map((dataset, index) => (
          <div key={index} className='m-1'>
            <p className='text-smallest mb-0'>
            <HetTerm>{dataset.datasetName}</HetTerm>:
            </p>
            <ul className='ml-2 list-none p-0 text-smallest'>
              {dataset.items.map((item, itemIndex) => (
                <li key={itemIndex} className='flex flex-row align-center'>
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