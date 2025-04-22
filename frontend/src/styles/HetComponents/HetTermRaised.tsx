import HetTerm from './HetTerm'
import HetTermUnderline from './HetTermUnderline'

interface HetTermRaisedProps {
  className?: string
  term: string
  termType?: string
  emphasizedText?: string
  description: string
  emphasizedTextPosition?: 'start' | 'middle' | 'end'
  source?: string
}

export const HetTermRaised: React.FC<HetTermRaisedProps> = ({
  className = '',
  term,
  termType,
  emphasizedText,
  description,
  emphasizedTextPosition = 'start',
  source,
}) => {
  const getFormattedDescription = () => {
    if (!emphasizedText) return description

    switch (emphasizedTextPosition) {
      case 'start':
        return (
          <>
            <HetTermUnderline className='text-black' tabIndex={0}>
              {emphasizedText}
            </HetTermUnderline>{' '}
            {description.replace(emphasizedText, '').trim()}
          </>
        )
      case 'middle': {
        const middleIndex = description.indexOf(emphasizedText)
        if (middleIndex !== -1) {
          const beforeText = description.substring(0, middleIndex).trim()
          const afterText = description
            .substring(middleIndex + emphasizedText.length)
            .trim()
          return (
            <>
              {beforeText}{' '}
              <HetTermUnderline className='text-black' tabIndex={0}>
                {emphasizedText}
              </HetTermUnderline>{' '}
              {afterText}
            </>
          )
        }
        return description
      }
      case 'end':
        return (
          <>
            {description.replace(emphasizedText, '').trim()}{' '}
            <HetTermUnderline className='text-black' tabIndex={0}>
              {emphasizedText}
            </HetTermUnderline>
          </>
        )
      default:
        return description
    }
  }

  return (
    <div
      className={`group fade-in-up-blur my-0 rounded-md border border-methodologyGreen border-solid bg-white p-4 shadow-raised-tighter ${className}`}
      aria-labelledby='term-definition'
    >
      {source && (
        <span
          id='term-source'
          className='mt-1 mr-2 rounded-sm bg-tinyTagGray px-2 py-1 font-bold font-sansTitle text-black text-tinyTag uppercase'
        >
          {source}
        </span>
      )}
      <p id='term-definition'>
        <HetTerm>{term}</HetTerm> <em>({termType})</em>:{' '}
        {getFormattedDescription()}
      </p>
    </div>
  )
}
