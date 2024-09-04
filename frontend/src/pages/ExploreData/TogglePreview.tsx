import React, { useState } from 'react'
import { ArrowDropUp, ArrowDropDown } from '@mui/icons-material'

const TogglePreview: React.FC<{ index: number; report: any }> = ({
  index,
  report,
}) => {
  const [showPreview, setShowPreview] = useState<{ [key: number]: boolean }>({})

  const togglePreview = (index: number) => {
    setShowPreview((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  return (
    <div className='flex flex-col bg-methodologyGreen rounded-md m-8 p-0'>
      <button
        type='button'
        onClick={(e) => {
          e.preventDefault()
          togglePreview(index)
        }}
        className='text-text text-black font-medium no-underline border-none w-auto cursor-pointer bg-methodologyGreen rounded-md py-4'
        aria-expanded={showPreview[index] ? 'true' : 'false'}
        aria-controls={`preview-${index}`}
      >
        <span className='mx-1'>
          {showPreview[index] ? 'Hide' : 'Preview the data'}
          {showPreview[index] ? <ArrowDropUp /> : <ArrowDropDown />}
        </span>
      </button>
      {showPreview[index] && (
        <div id={`preview-${index}`} className='p-4'>
          {React.cloneElement(report.customCard, {
            openMultiMap: report.setting === 'medicare-hiv',
          })}
        </div>
      )}
    </div>
  )
}

export default TogglePreview
