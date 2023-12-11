import React from 'react'
import { FractionFormat, type FractionProps } from './FractionFormat'

type RightSideItem = string | FractionProps

interface FormulaProps {
  leftSide?: string
  rightSide: RightSideItem[]
}

const FormulaFormat: React.FC<FormulaProps> = ({ leftSide, rightSide }) => (
  <div className='flex flex-row items-center justify-between overflow-x-scroll rounded-md bg-standard-info'>
    <code className='mx-auto my-0 flex w-max max-w-lg flex-col items-center justify-center self-start border-none bg-opacity-0 text-smallest lg:flex-row'>
      <b>{leftSide}</b>
      <div>{' = '}</div>

      {rightSide.map((item, index) => (
        <div key={index}>
          {typeof item === 'string' ? (
            item
          ) : (
            <FractionFormat
              numerator={item.numerator}
              denominator={item.denominator}
            />
          )}
        </div>
      ))}
    </code>
  </div>
)

export default FormulaFormat
