import type React from 'react'

interface CardRoundedBGProps {
  title: string
  description: React.ReactNode
  liRaised?: boolean
}

const CardRoundedBG: React.FC<CardRoundedBGProps> = ({ title, description, liRaised }) => {
  return (
    <li
      className={`flex flex-col bg-exploreBgColor px-4 py-8 hover:scale-105 ease-in-out duration-300 text-center ${liRaised ? 'rounded-md shadow-raised-tighter bg-white' : ''}`}
    >
      <div className='flex flex-col gap-4'>
        <h3 className='my-0 text-title font-medium text-altBlack leading-lhSomeMoreSpace'>{title}</h3>
        <p className='text-small w-fit py-0 my-0 leading-lhSomeMoreSpace'>{description}</p>
      </div>
    </li>
  )
}

export default CardRoundedBG