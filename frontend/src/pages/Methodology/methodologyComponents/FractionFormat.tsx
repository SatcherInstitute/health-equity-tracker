export interface FractionFormatProps {
  numerator?: any
  denominator?: any
}

export default function FractionFormat(props: FractionFormatProps) {
  return (
    <div className='flex flex-row items-center justify-center  lg:inline-flex '>
      {props.numerator ? (
        <div className='flex'>
          <span className='text-bigHeader font-light text-altBlack'>(</span>
          <div className='mx-auto my-0 flex flex-col items-center justify-center self-center leading-lhTight'>
            <div className='inline-block flex-wrap border-0 border-b border-solid border-altBlack p-2 text-center'>
              {props.numerator}
            </div>
            <div className='inline-block w-max p-2 text-center'>
              {props.denominator}
            </div>
          </div>
          <span className='text-bigHeader font-light text-altBlack'>)</span>
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
