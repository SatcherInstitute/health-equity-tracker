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
    <li className='fade-in-up-blur flex flex-row gap-2'>
      <div className='flex flex-col items-center justify-center w-1 max-w-1 gap-4'>
        <div className='border border-solid border-r-0 border-t-0 border-b-0 border-l-1.2 w-1.2 border-methodologyGreen flex flex-grow py-4'></div>
        <span className='text-title my-1'>{icon}</span>
        <div className='border border-solid border-r-0 border-t-0 border-b-0 border-l-1.2 w-1.2 border-methodologyGreen flex flex-grow py-4'></div>
      </div>
      <div className='flex flex-col gap-2 ml-2'>
        <div className='flex flex-col '>
          <h3 className='my-0 text-title font-medium '>{title}</h3>
          <p className='text-small w-fit py-0 my-0 text-altBlack'>
            {description}
          </p>
        </div>
        <div className='flex flex-col'>
            <HetOverline text='Advocacy Experts Say' className='mb-0 mt-4'/>
          <p className='text-small w-fit py-0 my-0'>{advice}</p>
        </div>
      </div>
    </li>
  )
}

export default CardLeftIcon
