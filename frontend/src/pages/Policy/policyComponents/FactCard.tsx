import type React from 'react'

interface FactCardProps {
  content: React.ReactNode
  className?: string
}

const FactCard: React.FC<FactCardProps> = ({ content, className = '' }) => {
  return (
    <li className='rounded-md shadow-raised-tighter p-4'>
      <p className='text-center content-center'>{content}</p>
    </li>
  )
}

export default FactCard
