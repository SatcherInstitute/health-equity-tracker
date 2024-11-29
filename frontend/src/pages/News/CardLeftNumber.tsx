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
    <li className='fade-in-up-blur flex flex-row gap-4 my-10'>
      <div className='hidden sm:flex flex-col items-center justify-center w-1 max-w-1 gap-4 sm:relative z-bottom'>
        <span
          className={`text-[15rem] my-0 font-extrabold absolute md:top-[-2] left-0 m-0 p-0 text-hoverAltGreen ${spanColor}`}
        >
          {number}
        </span>
      </div>
      <div className='flex flex-col gap-2 ml-0 md:ml-4 h-full'>
        <div className='flex flex-col '>
          <h3 className='mt-0 mb-4 text-title font-medium '>{title}</h3>
          <p className='text-small w-fit py-0 my-0 text-altBlack h-full z-10'>
            {description}
          </p>
        </div>
      </div>
    </li>
  )
}

export default CardLeftNumber
