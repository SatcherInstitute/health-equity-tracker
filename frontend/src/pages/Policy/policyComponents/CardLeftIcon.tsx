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
        <div className='w-1.2 border-methodology-green border-l-1.2 flex grow border border-t-0 border-r-0 border-b-0 border-solid py-4'></div>
        <span className='text-title my-1'>{icon}</span>
        <div className='w-1.2 border-methodology-green border-l-1.2 flex grow border border-t-0 border-r-0 border-b-0 border-solid py-4'></div>
      </div>
      <div className='ml-2 flex flex-col gap-2'>
        <div className='flex flex-col'>
          <h3 className='text-title my-0 font-medium'>{title}</h3>
          <p className='text-alt-black text-small my-0 w-fit py-0'>
            {description}
          </p>
        </div>
        <div className='flex flex-col'>
          <HetOverline text='Advocacy Experts Say' className='mt-4 mb-0' />
          <p className='text-small my-0 w-fit py-0'>{advice}</p>
        </div>
      </div>
    </div>
  )
}

export default CardLeftIcon
