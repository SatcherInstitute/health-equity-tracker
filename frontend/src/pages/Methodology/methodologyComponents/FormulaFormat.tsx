import FractionFormat, { type FractionFormatProps } from './FractionFormat'

type RightSideItem = string | FractionFormatProps

interface FormulaFormatProps {
  leftSide?: string
  rightSide: RightSideItem[]
}

export default function FormulaFormat(props: FormulaFormatProps) {
  return (
    <div className='flex w-full flex-row items-center justify-center rounded-md bg-standardInfo'>
      <code className='flex flex-col flex-wrap items-center justify-center self-start border-none bg-opacity-0 text-smallest smMd:text-title md:flex-row md:gap-1 lg:text-smallestHeader'>
        <b className='p-2'>{props.leftSide}</b>
        <div className='px-2 py-1'>{' = '}</div>

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
