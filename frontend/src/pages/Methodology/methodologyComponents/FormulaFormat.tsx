import React from 'react'
import styles from '../methodologyComponents/MethodologyPage.module.scss'

type RightSideItem = string | FractionProps

interface FractionProps {
  numerator?: any
  denominator?: any
}

const FractionFormat: React.FC<FractionProps> = ({
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

interface FormulaProps {
  leftSide?: string
  rightSide: RightSideItem[]
}

const FormulaFormat: React.FC<FormulaProps> = ({ leftSide, rightSide }) => (
  <div className={styles.FormulaFormat}>
    <code className={styles.FormulaFormatCode}>
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
