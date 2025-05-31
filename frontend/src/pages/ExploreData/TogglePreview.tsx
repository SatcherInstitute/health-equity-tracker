import { ArrowDropDown, ArrowDropUp } from '@mui/icons-material'
import React, { useState } from 'react'

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
    <div className='m-8 flex flex-col rounded-md bg-methodologyGreen p-0'>
      <button
        type='button'
        onClick={(e) => {
          e.preventDefault()
          togglePreview(index)
        }}
        className='w-auto cursor-pointer rounded-md border-none bg-methodologyGreen py-4 font-medium text-black text-text no-underline'
        aria-expanded={showPreview[index] ? 'true' : 'false'}
        aria-controls={`preview-${index}`}
      >
        <span className='mx-1'>
          {showPreview[index] ? 'Hide' : 'Preview the data'}
          {showPreview[index] ? (
            <ArrowDropUp className='mb-1' />
          ) : (
            <ArrowDropDown className='mb-1' />
          )}
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
