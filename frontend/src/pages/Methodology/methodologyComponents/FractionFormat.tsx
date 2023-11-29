import React from 'react'

export interface FractionProps {
  numerator?: any
  denominator?: any
}

export const FractionFormat: React.FC<FractionProps> = ({
  numerator,
  denominator,
}) => (
  <div className='flex w-max flex-row items-center justify-center lg:inline-flex '>
    {numerator ? (
      <div className='mx-auto my-0 flex flex-col items-center justify-center self-center leading-lhTight'>
        <div className='border-b-1 inline-block w-max break-words border-0 border-solid border-black text-center text-smallest'>
          {numerator}
        </div>
        <div className='inline-block w-max text-center text-smallest'>
          {denominator}
        </div>
      </div>
    ) : (
      <div className='mx-auto my-0 flex flex-col items-center justify-center self-center leading-lhTight'>
        <div className='inline-block w-max text-center text-smallest'>
          {denominator}
        </div>
      </div>
    )}
  </div>
)
