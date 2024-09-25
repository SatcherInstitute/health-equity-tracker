import FractionFormat, { type FractionFormatProps } from './FractionFormat'

interface FormulaFormatProps {
  leftSide?: string | FractionFormatProps
  rightSide: Array<string | FractionFormatProps>
}

export default function FormulaFormat(props: FormulaFormatProps) {
  return (
    <div className='flex w-full flex-row items-center justify-center rounded-md bg-standardInfo '>
      <code className='flex flex-col flex-wrap items-center justify-center self-start border-none bg-opacity-0 font-robotoCondensed text-smallest  smMd:text-text md:flex-row md:gap-1 lg:text-title'>
        <div className='p-2'>
          {typeof props.leftSide === 'string' ? (
            props.leftSide
          ) : (
            <FractionFormat
              numerator={props.leftSide?.numerator}
              denominator={props.leftSide?.denominator}
            />
          )}
        </div>
        <div className='px-2 py-1'>{' = '}</div>

        {props.rightSide.map((item) => (
          <div
            className='p-2'
            key={
              typeof item === 'string'
                ? item
                : `${item.numerator}-${item.denominator}`
            }
          >
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
