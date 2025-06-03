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
          className={`absolute left-0 m-0 my-0 p-0 font-extrabold text-[15rem] text-hover-alt-green md:top-[-2] ${spanColor}`}
        >
          {number}
        </span>
      </div>
      <div className='ml-0 flex h-full flex-col gap-2 md:ml-4'>
        <div className='flex flex-col '>
          <h3 className='mt-0 mb-4 font-medium text-title '>{title}</h3>
          <p className='z-10 my-0 h-full w-fit py-0 text-alt-black text-small'>
            {description}
          </p>
        </div>
      </div>
    </li>
  )
}

export default CardLeftNumber
