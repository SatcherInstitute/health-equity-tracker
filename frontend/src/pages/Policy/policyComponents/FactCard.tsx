import type React from 'react'

interface FactCardProps {
  content: React.ReactNode
  className?: string
}

const FactCard: React.FC<FactCardProps> = ({ content }) => {
  return (
    <div className='h-full rounded-md p-4'>
      <p className='content-center text-center'>{content}</p>
    </div>
  )
}

export default FactCard
