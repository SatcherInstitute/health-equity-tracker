import type React from 'react'

interface FactCardProps {
  content: React.ReactNode
  className?: string
}

const FactCard: React.FC<FactCardProps> = ({ content }) => {
  return (
    <div className='rounded-md p-4 h-full'>
      <p className='text-center content-center'>{content}</p>
    </div>
  )
}

export default FactCard