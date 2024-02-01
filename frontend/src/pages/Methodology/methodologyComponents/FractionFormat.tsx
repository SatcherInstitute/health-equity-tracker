import React from 'react'

export interface FractionFormatProps {
  numerator?: any
  denominator?: any
}

export default function FractionFormat(props: FractionFormatProps) {
  return (
    <div className='flex w-max flex-row items-center justify-center  lg:inline-flex '>
      {props.numerator ? (
        <div className='flex'>
          <span className='text-bigHeader'>(</span>
          <div className='mx-auto my-0 flex flex-col items-center justify-center self-center leading-lhTight'>
            <div className='inline-block flex-wrap border-0 border-b border-solid border-black p-2 text-center'>
              {props.numerator}
            </div>
            <div className='inline-block w-max p-2 text-center'>
              {props.denominator}
            </div>
          </div>
          <span className='text-bigHeader'>)</span>
        </div>
      ) : (
        <div className='mx-auto my-0 flex flex-col items-center justify-center self-center leading-lhTight'>
          <div className='inline-block w-max p-2 text-center '>
            {props.denominator}
          </div>
        </div>
      )}
    </div>
  )
}
