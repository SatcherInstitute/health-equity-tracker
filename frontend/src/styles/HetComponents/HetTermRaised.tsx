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
    <article
      className={`rounded-md border border-solid border-methodologyGreen shadow-raised-tighter bg-white p-4 group my-0 fade-in-up-blur ${className}`}
      aria-labelledby='term-definition'
    >
      {source && (
        <span
          id='term-source'
          className='text-tinyTag uppercase text-black font-sansTitle font-bold bg-tinyTagGray rounded-sm py-1 px-2 mr-2 mt-1'
        >
          {source}
        </span>
      )}
      <p id='term-definition'>
        <HetTerm>{term}</HetTerm> <em>({termType})</em>:{' '}
        {getFormattedDescription()}
      </p>
    </article>
  )
}
