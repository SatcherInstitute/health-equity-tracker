import type React from 'react'

export default function createHighlightedPreview(
  answer: string | React.ReactNode,
  searchTerm: string,
) {
  if (!searchTerm || typeof answer !== 'string') return answer // Return answer as-is if there's no search term or answer isn't a string

  const lowerAnswer = answer.toLowerCase()
  const lowerSearchTerm = searchTerm.toLowerCase()
  const startIndex = lowerAnswer.indexOf(lowerSearchTerm)

  if (startIndex === -1) return answer // No match found, return original answer

  const endIndex = startIndex + searchTerm.length

  return (
    <span>
      {answer.slice(0, startIndex)}
      <span className='font-semibold underline'>
        {answer.slice(startIndex, endIndex)}
      </span>
      {answer.slice(endIndex)}
    </span>
  )
}
