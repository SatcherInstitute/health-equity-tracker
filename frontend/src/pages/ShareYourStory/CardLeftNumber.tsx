import type React from 'react'

interface CardLeftNumberProps {
  title: string
  description: React.ReactNode
  number?: string
  spanColor?: string
}

const CardLeftNumber: React.FC<CardLeftNumberProps> = ({
  title,
  description,
  number,
  spanColor,
}) => {
  return (
    <li className='fade-in-up-blur my-10 flex flex-row gap-4'>
      <div className='z-bottom hidden w-1 max-w-1 flex-col items-center justify-center gap-4 sm:relative sm:flex'>
        <span
          className={`text-hover-alt-green absolute left-0 m-0 my-0 p-0 text-[15rem] font-extrabold md:top-[-2] ${spanColor}`}
        >
          {number}
        </span>
      </div>
      <div className='ml-0 flex h-full flex-col gap-2 md:ml-4'>
        <div className='flex flex-col'>
          <h3 className='text-title mt-0 mb-4 font-medium'>{title}</h3>
          <p className='text-alt-black text-small z-10 my-0 h-full w-fit py-0'>
            {description}
          </p>
        </div>
      </div>
    </li>
  )
}

export default CardLeftNumber
