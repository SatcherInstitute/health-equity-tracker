import type React from 'react'

interface CardLeftIconProps {
  title: string
  description: React.ReactNode
  icon?: any
}

const CardLeftIcon: React.FC<CardLeftIconProps> = ({ title, description, icon }) => {
  return (
    <li className='fade-in-up-blur flex flex-row gap-2'>
      <div className='flex flex-col w-full items-center w-1 gap-4'>
        {icon}
        <div className='border border-solid border-r-0 border-t-0 border-b-0 border-l-1.2 w-1.2 border-methodologyGreen flex flex-grow py-4'></div>
      </div>
      <div className='flex flex-col gap-2 ml-2'>
        <h3 className='my-0 text-title font-medium text-altBlack '>{title}</h3>
        <p className='text-small w-fit py-0 my-0'>{description}</p>
      </div>
    </li>
  )
}

export default CardLeftIcon