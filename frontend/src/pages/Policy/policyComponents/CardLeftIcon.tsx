import type React from 'react'
import { HetOverline } from '../../../styles/HetComponents/HetOverline'

interface CardLeftIconProps {
  title: string
  description: React.ReactNode
  advice: string
  icon?: any
}

const CardLeftIcon: React.FC<CardLeftIconProps> = ({
  title,
  description,
  advice,
  icon,
}) => {
  return (
    <div className='fade-in-up-blur flex flex-row gap-2'>
      <div className='flex w-1 max-w-1 flex-col items-center justify-center gap-4'>
        <div className='flex w-1.2 flex-grow border border-methodologyGreen border-t-0 border-r-0 border-b-0 border-l-1.2 border-solid py-4'></div>
        <span className='my-1 text-title'>{icon}</span>
        <div className='flex w-1.2 flex-grow border border-methodologyGreen border-t-0 border-r-0 border-b-0 border-l-1.2 border-solid py-4'></div>
      </div>
      <div className='ml-2 flex flex-col gap-2'>
        <div className='flex flex-col '>
          <h3 className='my-0 font-medium text-title '>{title}</h3>
          <p className='my-0 w-fit py-0 text-altBlack text-small'>
            {description}
          </p>
        </div>
        <div className='flex flex-col'>
          <HetOverline text='Advocacy Experts Say' className='mt-4 mb-0' />
          <p className='my-0 w-fit py-0 text-small'>{advice}</p>
        </div>
      </div>
    </div>
  )
}

export default CardLeftIcon
