import FractionFormat, { type FractionFormatProps } from './FractionFormat'

type RightSideItem = string | FractionFormatProps

interface FormulaFormatProps {
  leftSide?: string
  rightSide: RightSideItem[]
}

export default function FormulaFormat(props: FormulaFormatProps) {
  return (
    <div className='flex w-full flex-row items-center justify-center rounded-md bg-standardInfo'>
      <code className='mx-auto my-0 flex max-w-md flex-col items-center justify-center gap-1 self-start border-none bg-opacity-0  text-smallest smMd:flex-row smMd:text-title lg:text-bigHeader'>
        <b>{props.leftSide}</b>
        <div className='p-2'>{' = '}</div>

        {props.rightSide.map((item, index) => (
          <div className='p-2' key={index}>
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
}
